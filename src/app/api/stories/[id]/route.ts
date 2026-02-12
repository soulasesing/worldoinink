import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const storyId = params.id;

    const story = await prisma.story.findUnique({
      where: {
        id: storyId,
        authorId: session.user.id, // Ensure the story belongs to the logged-in user
      },
    });

    if (!story) {
      return NextResponse.json({ message: 'Story not found' }, { status: 404 });
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { message: 'Failed to fetch story' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const storyId = params.id;
    const body = await req.json();

    // Basic validation (can use Zod here as well if preferred)
    if (!body.title) {
        return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    // Find the story to update and ensure it belongs to the user
    const existingStory = await prisma.story.findUnique({
      where: {
        id: storyId,
        authorId: session.user.id,
      },
    });

    if (!existingStory) {
      return NextResponse.json({ message: 'Story not found or you do not have permission' }, { status: 404 });
    }

    const updatedStory = await prisma.story.update({
      where: { id: storyId },
      data: {
        title: body.title,
        content: body.content,
        published: body.published ?? existingStory.published,
        wordCount: body.wordCount ?? 0,
        coverImageUrl: body.coverImageUrl,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedStory);
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json(
      { message: 'Failed to update story' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const storyId = params.id;

    // Find the story and ensure it belongs to the user
    const existingStory = await prisma.story.findUnique({
      where: {
        id: storyId,
        authorId: session.user.id,
      },
    });

    if (!existingStory) {
      return NextResponse.json({ message: 'Story not found or you do not have permission' }, { status: 404 });
    }

    // Delete the story
    await prisma.story.delete({
      where: { id: storyId },
    });

    return NextResponse.json({ message: 'Story deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { message: 'Failed to delete story' },
      { status: 500 }
    );
  }
} 