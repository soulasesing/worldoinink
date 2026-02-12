// API Route: Individual Character Operations
// GET /api/characters/[id] - Get a specific character
// PUT /api/characters/[id] - Update character configuration
// DELETE /api/characters/[id] - Delete a character

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET: Fetch a specific character
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

    const character = await prisma.character.findUnique({
      where: { id: params.id },
      include: {
        stories: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!character || character.authorId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Character not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      character,
    });
  } catch (error) {
    console.error('[Character API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch character' },
      { status: 500 }
    );
  }
}

// PUT: Update character configuration
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  backstory: z.string().optional(),
  traits: z.array(z.string()).optional(),
  
  // Personality configuration
  personality: z.object({
    temperament: z.enum(['calm', 'passionate', 'melancholic', 'cheerful', 'mysterious', 'balanced']).optional(),
    speakingStyle: z.enum(['formal', 'casual', 'poetic', 'direct', 'playful', 'natural']).optional(),
    humor: z.enum(['none', 'subtle', 'sarcastic', 'witty', 'dark']).optional(),
    confidence: z.enum(['shy', 'modest', 'confident', 'arrogant']).optional(),
    emotionalTendencies: z.array(z.string()).optional(),
  }).optional(),
  
  // Voice and tone
  voiceTone: z.enum(['friendly', 'serious', 'playful', 'dramatic', 'mysterious', 'neutral', 'warm', 'inspiring', 'cheerful', 'natural']).optional(),
  emotionalRange: z.array(z.string()).optional(),
  
  // Intervention triggers
  triggerTopics: z.array(z.string()).optional(),
  triggerWords: z.array(z.string()).optional(),
  
  // Intervention settings
  interventionEnabled: z.boolean().optional(),
  interventionStyle: z.enum(['suggestion', 'complaint', 'question', 'encouragement']).optional(),
  interventionFrequency: z.enum(['low', 'medium', 'high']).optional(),
});

export async function PUT(
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

    // Verify ownership
    const existing = await prisma.character.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.authorId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Character not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validated = updateSchema.parse(body);

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.backstory !== undefined) updateData.backstory = validated.backstory;
    if (validated.traits !== undefined) updateData.traits = validated.traits;
    if (validated.voiceTone !== undefined) updateData.voiceTone = validated.voiceTone;
    if (validated.emotionalRange !== undefined) updateData.emotionalRange = validated.emotionalRange;
    if (validated.triggerTopics !== undefined) updateData.triggerTopics = validated.triggerTopics;
    if (validated.triggerWords !== undefined) updateData.triggerWords = validated.triggerWords;
    if (validated.interventionEnabled !== undefined) updateData.interventionEnabled = validated.interventionEnabled;
    if (validated.interventionStyle !== undefined) updateData.interventionStyle = validated.interventionStyle;
    if (validated.interventionFrequency !== undefined) updateData.interventionFrequency = validated.interventionFrequency;

    // Handle personality object merge
    if (validated.personality !== undefined) {
      const currentPersonality = (existing.personality as Record<string, unknown>) || {};
      updateData.personality = {
        ...currentPersonality,
        ...validated.personality,
      };
    }

    const character = await prisma.character.update({
      where: { id: params.id },
      data: updateData,
      include: {
        stories: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    console.log('[Character API] Updated character:', character.name);

    return NextResponse.json({
      success: true,
      character,
      message: 'Personaje actualizado correctamente',
    });
  } catch (error) {
    console.error('[Character API] Error updating:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update character' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a character
export async function DELETE(
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

    // Verify ownership
    const existing = await prisma.character.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.authorId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Character not found' },
        { status: 404 }
      );
    }

    await prisma.character.delete({
      where: { id: params.id },
    });

    console.log('[Character API] Deleted character:', existing.name);

    return NextResponse.json({
      success: true,
      message: 'Personaje eliminado correctamente',
    });
  } catch (error) {
    console.error('[Character API] Error deleting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete character' },
      { status: 500 }
    );
  }
}
