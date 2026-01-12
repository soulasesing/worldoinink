// API Route: Get Live Characters for Story
// GET /api/story/[id]/live-characters

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

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

    // Get story with its characters
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        characters: {
          where: {
            authorId: session.user.id,
            interventionEnabled: true,
          },
          select: {
            id: true,
            name: true,
            backstory: true,
            traits: true,
            personality: true,
            voiceTone: true,
            interventionEnabled: true,
          },
        },
      },
    });

    if (!story || story.authorId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    // Map characters to frontend format
    const characters = story.characters.map((char, index) => ({
      id: char.id,
      name: char.name,
      role: 'character',
      personality: char.backstory?.substring(0, 100) || 'Personaje de la historia',
      avatar: ['🎭', '✨', '👤', '🌟', '💫'][index % 5],
      isActive: char.interventionEnabled,
    }));

    return NextResponse.json({
      success: true,
      characters,
    });
  } catch (error) {
    console.error('[Live Characters] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get characters' },
      { status: 500 }
    );
  }
}

