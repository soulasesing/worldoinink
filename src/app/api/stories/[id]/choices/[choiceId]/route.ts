// API Route: Single Choice Operations
// PUT /api/stories/[id]/choices/[choiceId] - Update choice
// DELETE /api/stories/[id]/choices/[choiceId] - Delete choice

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateChoiceSchema = z.object({
  text: z.string().min(1).optional(),
  emoji: z.string().nullable().optional(),
  position: z.number().optional(),
});

// Helper to verify ownership
async function verifyOwnership(storyId: string, choiceId: string, userId: string) {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { authorId: true },
  });

  if (!story || story.authorId !== userId) {
    return { authorized: false };
  }

  const choice = await prisma.choice.findUnique({
    where: { id: choiceId },
    include: {
      fromNode: {
        select: { storyId: true },
      },
    },
  });

  if (!choice || choice.fromNode.storyId !== storyId) {
    return { authorized: false, choice: null };
  }

  return { authorized: true, choice };
}

// PUT: Update choice
export async function PUT(
  req: Request,
  { params }: { params: { id: string; choiceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: storyId, choiceId } = params;
    const { authorized, choice } = await verifyOwnership(storyId, choiceId, session.user.id);

    if (!authorized || !choice) {
      return NextResponse.json(
        { success: false, error: 'Choice not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validated = updateChoiceSchema.parse(body);

    const updatedChoice = await prisma.choice.update({
      where: { id: choiceId },
      data: validated,
      include: {
        fromNode: {
          select: { id: true, title: true },
        },
        toNode: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      choice: updatedChoice,
    });
  } catch (error) {
    console.error('[Choice PUT] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update choice' },
      { status: 500 }
    );
  }
}

// DELETE: Delete choice
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; choiceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: storyId, choiceId } = params;
    const { authorized, choice } = await verifyOwnership(storyId, choiceId, session.user.id);

    if (!authorized || !choice) {
      return NextResponse.json(
        { success: false, error: 'Choice not found' },
        { status: 404 }
      );
    }

    await prisma.choice.delete({
      where: { id: choiceId },
    });

    return NextResponse.json({
      success: true,
      message: 'Choice deleted',
    });
  } catch (error) {
    console.error('[Choice DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete choice' },
      { status: 500 }
    );
  }
}

// POST: Record that a choice was made (increment timesChosen)
export async function POST(
  req: Request,
  { params }: { params: { id: string; choiceId: string } }
) {
  try {
    const { choiceId } = params;

    // Just increment the counter - no auth needed for readers
    await prisma.choice.update({
      where: { id: choiceId },
      data: {
        timesChosen: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('[Choice POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record choice' },
      { status: 500 }
    );
  }
}
