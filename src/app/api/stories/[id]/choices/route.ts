// API Route: Choices CRUD
// POST /api/stories/[id]/choices - Create new choice (connection between nodes)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createChoiceSchema = z.object({
  fromNodeId: z.string().min(1, 'Source node is required'),
  toNodeId: z.string().min(1, 'Target node is required'),
  text: z.string().min(1, 'Choice text is required'),
  emoji: z.string().optional(),
  position: z.number().optional().default(0),
});

// POST: Create new choice
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const storyId = params.id;

    // Verify story ownership
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { authorId: true },
    });

    if (!story || story.authorId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validated = createChoiceSchema.parse(body);

    // Verify both nodes exist and belong to this story
    const [fromNode, toNode] = await Promise.all([
      prisma.storyNode.findUnique({
        where: { id: validated.fromNodeId },
        select: { id: true, storyId: true },
      }),
      prisma.storyNode.findUnique({
        where: { id: validated.toNodeId },
        select: { id: true, storyId: true },
      }),
    ]);

    if (!fromNode || fromNode.storyId !== storyId) {
      return NextResponse.json(
        { success: false, error: 'Source node not found' },
        { status: 400 }
      );
    }

    if (!toNode || toNode.storyId !== storyId) {
      return NextResponse.json(
        { success: false, error: 'Target node not found' },
        { status: 400 }
      );
    }

    // Check if choice already exists
    const existingChoice = await prisma.choice.findFirst({
      where: {
        fromNodeId: validated.fromNodeId,
        toNodeId: validated.toNodeId,
      },
    });

    if (existingChoice) {
      return NextResponse.json(
        { success: false, error: 'This connection already exists' },
        { status: 400 }
      );
    }

    // Create the choice
    const choice = await prisma.choice.create({
      data: {
        fromNodeId: validated.fromNodeId,
        toNodeId: validated.toNodeId,
        text: validated.text,
        emoji: validated.emoji,
        position: validated.position,
      },
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
      choice,
    }, { status: 201 });
  } catch (error) {
    console.error('[Choices POST] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create choice' },
      { status: 500 }
    );
  }
}
