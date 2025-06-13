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

    // Enhance the prompt to guide DALL-E for book cover generation
    const fullPrompt = `A visually appealing book cover design, suitable for a story about: ${description}. Focus on composition, typography, and imagery appropriate for a book cover.`;
    console.log('Sending prompt to OpenAI:', fullPrompt);

    try {
      const response = await openai.images.generate({
        model: "dall-e-2", // Use dall-e-2 to allow generating multiple images
        prompt: fullPrompt,
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

      const permanentImageUrls: string[] = [];

      for (const tempUrl of imageUrls) {
        // Download image from OpenAI's temporary URL
        const imageResponse = await fetch(tempUrl);
        if (!imageResponse.ok) {
          console.error(`Failed to download image from ${tempUrl}`);
          continue; // Skip this image and try others
        }

        const blob = await imageResponse.blob();

        // Create a unique filename for Vercel Blob Storage
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.png`;

        // Upload to Vercel Blob Storage
        const { url: permanentUrl } = await put(filename, blob, {
          access: 'public',
        });
        permanentImageUrls.push(permanentUrl);
      }

      // Return the permanent URLs to the frontend
      return NextResponse.json({ images: permanentImageUrls });

    } catch (openaiError: any) {
        console.error('OpenAI Image Generation Error:', openaiError);
         // More specific error handling for OpenAI errors
         if (openaiError.response) {
            return new NextResponse(JSON.stringify({ message: openaiError.response.data }), { status: openaiError.response.status });
          } else {
            return new NextResponse('Failed to generate image with OpenAI', { status: 500 });
          }
    }

  } catch (error) {
    console.error('Cover generation API error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
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