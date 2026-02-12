// API Route: Single Node Operations
// GET /api/stories/[id]/nodes/[nodeId] - Get node
// PUT /api/stories/[id]/nodes/[nodeId] - Update node
// DELETE /api/stories/[id]/nodes/[nodeId] - Delete node

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateNodeSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  nodeType: z.enum(['CONTENT', 'DECISION', 'ENDING']).optional(),
  isStart: z.boolean().optional(),
  isEnding: z.boolean().optional(),
  position: z.number().optional(),
});

// Helper to verify ownership
async function verifyOwnership(storyId: string, nodeId: string, userId: string) {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { authorId: true },
  });

  if (!story || story.authorId !== userId) {
    return { authorized: false, story: null };
  }

  const node = await prisma.storyNode.findUnique({
    where: { id: nodeId },
    include: { outgoingChoices: true, incomingChoices: true },
  });

  if (!node || node.storyId !== storyId) {
    return { authorized: false, story, node: null };
  }

  return { authorized: true, story, node };
}

// GET: Get single node
export async function GET(
  req: Request,
  { params }: { params: { id: string; nodeId: string } }
) {
  try {
    const { id: storyId, nodeId } = params;

    const node = await prisma.storyNode.findUnique({
      where: { id: nodeId },
      include: {
        outgoingChoices: {
          include: {
            toNode: {
              select: { id: true, title: true, isEnding: true },
            },
          },
          orderBy: { position: 'asc' },
        },
        incomingChoices: {
          include: {
            fromNode: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    if (!node || node.storyId !== storyId) {
      return NextResponse.json(
        { success: false, error: 'Node not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      node,
    });
  } catch (error) {
    console.error('[Node GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get node' },
      { status: 500 }
    );
  }
}

// PUT: Update node
export async function PUT(
  req: Request,
  { params }: { params: { id: string; nodeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: storyId, nodeId } = params;
    const { authorized, node } = await verifyOwnership(storyId, nodeId, session.user.id);

    if (!authorized || !node) {
      return NextResponse.json(
        { success: false, error: 'Node not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validated = updateNodeSchema.parse(body);

    // Calculate word count if content is being updated
    let wordCount = node.wordCount;
    if (validated.content !== undefined) {
      wordCount = validated.content
        .replace(/<[^>]*>/g, '')
        .trim()
        .split(/\s+/)
        .filter(w => w.length > 0).length;
    }

    // If marking as start, unmark other start nodes
    if (validated.isStart === true) {
      await prisma.storyNode.updateMany({
        where: { storyId, isStart: true, id: { not: nodeId } },
        data: { isStart: false },
      });
    }

    const updatedNode = await prisma.storyNode.update({
      where: { id: nodeId },
      data: {
        ...validated,
        wordCount,
        isEnding: validated.isEnding ?? (validated.nodeType === 'ENDING' ? true : undefined),
      },
      include: {
        outgoingChoices: {
          orderBy: { position: 'asc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      node: updatedNode,
    });
  } catch (error) {
    console.error('[Node PUT] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update node' },
      { status: 500 }
    );
  }
}

// DELETE: Delete node (and its choices)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; nodeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: storyId, nodeId } = params;
    const { authorized, node } = await verifyOwnership(storyId, nodeId, session.user.id);

    if (!authorized || !node) {
      return NextResponse.json(
        { success: false, error: 'Node not found' },
        { status: 404 }
      );
    }

    // Delete the node (choices will be cascade deleted)
    await prisma.storyNode.delete({
      where: { id: nodeId },
    });

    // Check if there are any nodes left, if not mark story as not interactive
    const remainingNodes = await prisma.storyNode.count({
      where: { storyId },
    });

    if (remainingNodes === 0) {
      await prisma.story.update({
        where: { id: storyId },
        data: { isInteractive: false },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Node deleted',
    });
  } catch (error) {
    console.error('[Node DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete node' },
      { status: 500 }
    );
  }
}
