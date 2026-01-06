import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { authOptions } from '../../../../lib/auth';
import { put } from '@vercel/blob'; // Import put function
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const storySchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
  content: z.string(), // Content can be empty initially
  coverImageUrl: z.string().optional(), // Add coverImageUrl to the schema
});

/**
 * Truncate and optimize a description for DALL-E prompt
 * Maximum length: 1000 characters (OpenAI limit)
 */
function optimizePromptForDallE(description: string): string {
  // Remove extra whitespace and newlines
  const cleaned = description.trim().replace(/\s+/g, ' ');
  
  // DALL-E prompt template with fixed parts
  const prefix = 'A visually appealing book cover design for: ';
  const suffix = '. Professional book cover composition with typography.';
  
  // Calculate max length for user description
  const maxDescriptionLength = 1000 - prefix.length - suffix.length;
  
  // If description fits, use it as-is
  if (cleaned.length <= maxDescriptionLength) {
    return prefix + cleaned + suffix;
  }
  
  // Otherwise, intelligently truncate
  // Try to keep the first part (usually the most important)
  const truncated = cleaned.substring(0, maxDescriptionLength - 3) + '...';
  
  const finalPrompt = prefix + truncated + suffix;
  
  // Final safety check
  if (finalPrompt.length > 1000) {
    return finalPrompt.substring(0, 997) + '...';
  }
  
  return finalPrompt;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { description } = await req.json();
    if (!description) {
      return new NextResponse('Description is required', { status: 400 });
    }

    // Optimize the prompt to fit DALL-E's 1000 character limit
    const optimizedPrompt = optimizePromptForDallE(description);
    
    console.log('Original description length:', description.length);
    console.log('Optimized prompt length:', optimizedPrompt.length);
    console.log('Sending prompt to OpenAI:', optimizedPrompt);

    try {
      const response = await openai.images.generate({
        model: "dall-e-2", // Use dall-e-2 to allow generating multiple images
        prompt: optimizedPrompt,
        n: 4, // Request 4 images
        size: "1024x1024",
      });

      // Check if response.data exists and is an array
      if (!response.data || !Array.isArray(response.data)) {
         console.error('Invalid OpenAI response format:', response);
         return new NextResponse('Invalid response from image generation service', { status: 500 });
      }

      // Filter out any undefined URLs to ensure fetch receives a string
      const imageUrls = response.data.map(item => item.url).filter((url): url is string => typeof url === 'string');

      console.log(`Received ${imageUrls.length} image URLs from OpenAI`);

      const permanentImageUrls: string[] = [];
      const failedDownloads: string[] = [];

      // Download and upload images with retry logic
      for (let i = 0; i < imageUrls.length; i++) {
        const tempUrl = imageUrls[i];
        let retries = 3;
        let success = false;

        while (retries > 0 && !success) {
          try {
            console.log(`Downloading image ${i + 1}/${imageUrls.length} (attempt ${4 - retries}/3)...`);
            
            // Download image from OpenAI's temporary URL with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const imageResponse = await fetch(tempUrl, {
              signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!imageResponse.ok) {
              throw new Error(`HTTP ${imageResponse.status}: ${imageResponse.statusText}`);
            }

            const blob = await imageResponse.blob();
            console.log(`Downloaded image ${i + 1}, size: ${blob.size} bytes`);

            // Check if Vercel Blob is configured
            if (!process.env.BLOB_READ_WRITE_TOKEN) {
              console.warn('BLOB_READ_WRITE_TOKEN not configured, returning temporary URL');
              permanentImageUrls.push(tempUrl);
              success = true;
              break;
            }

            // Create a unique filename for Vercel Blob Storage
            const filename = `cover-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.png`;

            // Upload to Vercel Blob Storage
            const { url: permanentUrl } = await put(filename, blob, {
              access: 'public',
            });
            
            console.log(`Uploaded to Vercel Blob: ${permanentUrl}`);
            permanentImageUrls.push(permanentUrl);
            success = true;

          } catch (error: any) {
            retries--;
            console.error(`Error downloading image ${i + 1} (${retries} retries left):`, error.message);
            
            if (retries === 0) {
              failedDownloads.push(tempUrl);
              
              // If this is a network error and we have the temp URL, use it as fallback
              if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || error.name === 'AbortError') {
                console.warn(`Using temporary URL as fallback for image ${i + 1}`);
                permanentImageUrls.push(tempUrl);
              }
            } else {
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
      }

      console.log(`Successfully processed ${permanentImageUrls.length}/${imageUrls.length} images`);
      
      if (permanentImageUrls.length === 0) {
        return NextResponse.json(
          { message: 'Failed to download any generated images. Please try again.' },
          { status: 500 }
        );
      }

      // Return the URLs (permanent or temporary fallback)
      return NextResponse.json({ 
        images: permanentImageUrls,
        warning: failedDownloads.length > 0 ? 'Some images are using temporary URLs' : undefined
      });

    } catch (openaiError: any) {
        console.error('OpenAI Image Generation Error:', openaiError);
        
        // Handle specific OpenAI errors
        if (openaiError.status === 400) {
          const errorMessage = openaiError.error?.message || 'Invalid request to image generation service';
          return NextResponse.json(
            { message: errorMessage, details: 'Please try a shorter or simpler description' },
            { status: 400 }
          );
        }
        
        if (openaiError.status === 401) {
          return NextResponse.json(
            { message: 'OpenAI API authentication failed. Please check your API key.' },
            { status: 500 }
          );
        }
        
        if (openaiError.status === 429) {
          return NextResponse.json(
            { message: 'Rate limit exceeded. Please try again in a few moments.' },
            { status: 429 }
          );
        }
        
        if (openaiError.response) {
          return NextResponse.json(
            { message: openaiError.response.data },
            { status: openaiError.response.status }
          );
        }
        
        // Network errors
        if (openaiError.code === 'ENOTFOUND' || openaiError.code === 'ETIMEDOUT') {
          return NextResponse.json(
            { message: 'Network error: Unable to connect to OpenAI. Please check your internet connection.' },
            { status: 503 }
          );
        }
        
        return NextResponse.json(
          { message: 'Failed to generate cover image. Please try again.' },
          { status: 500 }
        );
    }

  } catch (error: any) {
    console.error('Cover generation API error:', error);
    
    // Provide more specific error messages
    if (error.code === 'ENOTFOUND') {
      return NextResponse.json(
        { message: 'Network error: Unable to reach image service. Please check your connection.' },
        { status: 503 }
      );
    }
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { message: 'Request timeout: Image generation took too long. Please try again.' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POSTStory(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, coverImageUrl } = storySchema.parse(body); // Destructure coverImageUrl

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found in database' }, { status: 404 });
    }

    const newStory = await prisma.story.create({
      data: {
        title,
        content,
        coverImageUrl,
        authorId: user.id,
      } as any,
    });

    return NextResponse.json(newStory, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error saving story:', error);
    return NextResponse.json(
      { message: 'Failed to save story' },
      { status: 500 }
    );
  }
} 