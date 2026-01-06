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
      // Request images in base64 format to avoid Azure Blob Storage dependency
      // This works with corporate firewalls (Zscaler) that block *.blob.core.windows.net
      const response = await openai.images.generate({
        model: "dall-e-2",
        prompt: optimizedPrompt,
        n: 4,
        size: "1024x1024",
        response_format: "b64_json", // ⭐ Get base64 instead of URLs
      });

      // Check if response.data exists and is an array
      if (!response.data || !Array.isArray(response.data)) {
         console.error('Invalid OpenAI response format:', response);
         return NextResponse.json(
           { message: 'Invalid response from image generation service' }, 
           { status: 500 }
         );
      }

      console.log(`Received ${response.data.length} images in base64 format from OpenAI`);

      const permanentImageUrls: string[] = [];

      // Process all images in parallel for better performance
      const uploadPromises = response.data.map(async (item, index) => {
        try {
          const b64 = item.b64_json;
          
          if (!b64) {
            console.error(`Image ${index + 1} has no b64_json data`);
            return null;
          }

          // Check if Vercel Blob is configured
          if (process.env.BLOB_READ_WRITE_TOKEN) {
            console.log(`Uploading image ${index + 1} to Vercel Blob...`);
            
            // Convert base64 to Buffer
            const buffer = Buffer.from(b64, 'base64');
            
            // Create a unique filename
            const filename = `cover-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}.png`;

            // Upload to Vercel Blob Storage
            const { url: permanentUrl } = await put(filename, buffer, {
              access: 'public',
              contentType: 'image/png',
            });
            
            console.log(`✅ Image ${index + 1} uploaded to Vercel Blob: ${permanentUrl}`);
            return permanentUrl;
          } else {
            // Fallback: return as Data URL (works everywhere, including behind firewalls)
            console.log(`No BLOB_READ_WRITE_TOKEN, using Data URL for image ${index + 1}`);
            return `data:image/png;base64,${b64}`;
          }
        } catch (error: any) {
          console.error(`Error processing image ${index + 1}:`, error.message);
          // Return null, will be filtered out
          return null;
        }
      });

      // Wait for all uploads/conversions to complete
      const results = await Promise.all(uploadPromises);
      
      // Filter out any failed images
      const successfulUrls = results.filter((url): url is string => url !== null);
      
      console.log(`Successfully processed ${successfulUrls.length}/${response.data.length} images`);
      
      if (successfulUrls.length === 0) {
        return NextResponse.json(
          { message: 'Failed to process any generated images. Please try again.' },
          { status: 500 }
        );
      }

      // Return the URLs (permanent Vercel Blob URLs or Data URLs)
      return NextResponse.json({ 
        images: successfulUrls,
        info: process.env.BLOB_READ_WRITE_TOKEN 
          ? 'Images stored permanently' 
          : 'Images embedded as Data URLs'
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