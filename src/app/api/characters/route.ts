// API Route: Get All User Characters
// GET /api/characters - Get all characters for the logged-in user
// POST /api/characters - Create a new character

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET: Fetch all characters for the current user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all characters belonging to this user
    const characters = await prisma.character.findMany({
      where: {
        authorId: session.user.id,
      },
      include: {
        stories: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Map to a clean format
    const formattedCharacters = characters.map((char) => ({
      id: char.id,
      name: char.name,
      backstory: char.backstory,
      traits: char.traits,
      personality: char.personality as {
        temperament?: string;
        speakingStyle?: string;
        humor?: string;
        confidence?: string;
        emotionalTendencies?: string[];
      } | null,
      voiceTone: char.voiceTone,
      emotionalRange: char.emotionalRange,
      triggerTopics: char.triggerTopics,
      triggerWords: char.triggerWords,
      interventionEnabled: char.interventionEnabled,
      interventionStyle: char.interventionStyle,
      interventionFrequency: char.interventionFrequency,
      totalInterventions: char.totalInterventions,
      lastIntervention: char.lastIntervention,
      stories: char.stories,
      createdAt: char.createdAt,
      updatedAt: char.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      characters: formattedCharacters,
      total: formattedCharacters.length,
    });
  } catch (error) {
    console.error('[Characters API] Error fetching characters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch characters' },
      { status: 500 }
    );
  }
}

// POST: Create a new character
const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  backstory: z.string().optional().default(''),
  traits: z.array(z.string()).optional().default([]),
  voiceTone: z.string().optional().default('neutral'),
  interventionEnabled: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = createSchema.parse(body);

    const character = await prisma.character.create({
      data: {
        name: validated.name,
        backstory: validated.backstory,
        traits: validated.traits,
        voiceTone: validated.voiceTone,
        interventionEnabled: validated.interventionEnabled,
        authorId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      character,
    }, { status: 201 });
  } catch (error) {
    console.error('[Characters API] Error creating character:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create character' },
      { status: 500 }
    );
  }
}