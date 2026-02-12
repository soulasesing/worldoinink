import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const storySchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
  content: z.string(), // Content can be empty initially
  published: z.boolean().optional().default(false),
  wordCount: z.number().optional().default(0),
  coverImageUrl: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const stories = await prisma.story.findMany({
      where: {
        authorId: user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { message: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions); // Corrected call

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, published, wordCount, coverImageUrl } = storySchema.parse(body);

    // Assuming session.user contains the user's ID or email
    // We need to find the user in the database to get their ID
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
        published,
        wordCount,
        coverImageUrl,
        authorId: user.id,
      },
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