// API Route: Get Interactive Story Structure
// GET /api/stories/[id]/structure

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id;

    // Get story with all nodes and choices
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        storyNodes: {
          include: {
            outgoingChoices: {
              orderBy: { position: 'asc' },
            },
            incomingChoices: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    // Check if story is published or user is the author
    const session = await getServerSession(authOptions);
    const isAuthor = session?.user?.id === story.authorId;
    
    if (!story.published && !isAuthor) {
      return NextResponse.json(
        { success: false, error: 'Story not accessible' },
        { status: 403 }
      );
    }

    // Extract all choices from nodes
    const allChoices = story.storyNodes.flatMap(node => node.outgoingChoices);

    // Calculate stats
    const stats = {
      totalNodes: story.storyNodes.length,
      totalEndings: story.storyNodes.filter(n => n.isEnding).length,
      totalChoices: allChoices.length,
      totalWords: story.storyNodes.reduce((sum, n) => sum + n.wordCount, 0),
    };

    return NextResponse.json({
      success: true,
      story: {
        id: story.id,
        title: story.title,
        isInteractive: story.isInteractive,
        published: story.published,
        coverImageUrl: story.coverImageUrl,
        author: story.author,
      },
      nodes: story.storyNodes,
      choices: allChoices,
      stats,
    });
  } catch (error) {
    console.error('[Story Structure] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get story structure' },
      { status: 500 }
    );
  }
}
