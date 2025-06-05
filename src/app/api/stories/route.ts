import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; // Corrected path
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const storySchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
  content: z.string(), // Content can be empty initially
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions); // Corrected call

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content } = storySchema.parse(body);

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
        authorId: user.id, // Associate the story with the logged-in user
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