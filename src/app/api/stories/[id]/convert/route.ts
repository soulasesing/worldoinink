// API Route: Convert Linear Story to Interactive
// POST /api/stories/[id]/convert

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

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

    // Get story and verify ownership
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        storyNodes: true,
      },
    });

    if (!story || story.authorId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    // Check if already interactive
    if (story.isInteractive && story.storyNodes.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Story is already interactive' },
        { status: 400 }
      );
    }

    // Calculate word count
    const wordCount = story.content
      .replace(/<[^>]*>/g, '')
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0).length;

    // Create the start node with the existing content
    const startNode = await prisma.storyNode.create({
      data: {
        storyId: story.id,
        title: story.title || 'Inicio',
        content: story.content,
        nodeType: 'CONTENT',
        isStart: true,
        isEnding: false,
        position: 0,
        wordCount,
      },
    });

    // Mark story as interactive
    await prisma.story.update({
      where: { id: storyId },
      data: { isInteractive: true },
    });

    return NextResponse.json({
      success: true,
      startNode,
      message: 'Story converted to interactive. Add more nodes and choices to create branches.',
    });
  } catch (error) {
    console.error('[Convert] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to convert story' },
      { status: 500 }
    );
  }
}
