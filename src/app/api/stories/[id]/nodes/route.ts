// API Route: Story Nodes CRUD
// GET /api/stories/[id]/nodes - List all nodes
// POST /api/stories/[id]/nodes - Create new node

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createNodeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string(),
  nodeType: z.enum(['CONTENT', 'DECISION', 'ENDING']).optional().default('CONTENT'),
  isStart: z.boolean().optional().default(false),
  isEnding: z.boolean().optional().default(false),
  position: z.number().optional().default(0),
});

// GET: List all nodes of a story
export async function GET(
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

    const nodes = await prisma.storyNode.findMany({
      where: { storyId },
      include: {
        outgoingChoices: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json({
      success: true,
      nodes,
    });
  } catch (error) {
    console.error('[Nodes GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get nodes' },
      { status: 500 }
    );
  }
}

// POST: Create new node
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
      select: { authorId: true, isInteractive: true },
    });

    if (!story || story.authorId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validated = createNodeSchema.parse(body);

    // Calculate word count from content (strip HTML)
    const wordCount = validated.content
      .replace(/<[^>]*>/g, '')
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0).length;

    // If this is marked as start, unmark any existing start nodes
    if (validated.isStart) {
      await prisma.storyNode.updateMany({
        where: { storyId, isStart: true },
        data: { isStart: false },
      });
    }

    // Create the node
    const node = await prisma.storyNode.create({
      data: {
        storyId,
        title: validated.title,
        content: validated.content,
        nodeType: validated.nodeType,
        isStart: validated.isStart,
        isEnding: validated.isEnding || validated.nodeType === 'ENDING',
        position: validated.position,
        wordCount,
      },
      include: {
        outgoingChoices: true,
      },
    });

    // Mark story as interactive if not already
    if (!story.isInteractive) {
      await prisma.story.update({
        where: { id: storyId },
        data: { isInteractive: true },
      });
    }

    return NextResponse.json({
      success: true,
      node,
    }, { status: 201 });
  } catch (error) {
    console.error('[Nodes POST] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create node' },
      { status: 500 }
    );
  }
}
