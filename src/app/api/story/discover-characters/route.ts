// API Route: Discover Characters from Story
// POST /api/story/discover-characters

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const schema = z.object({
  storyId: z.string().min(1, 'Story ID required'),
  content: z.string().min(100, 'Story content too short'),
});

export async function POST(req: Request) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = schema.parse(body);

    console.log('[Character Discovery] Starting for story:', validated.storyId);

    // Verify story belongs to user
    const story = await prisma.story.findUnique({
      where: { id: validated.storyId },
      select: { authorId: true, title: true },
    });

    if (!story || story.authorId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    // Strip HTML from content
    const cleanContent = validated.content.replace(/<[^>]*>/g, '').trim();

    // Use GPT-4 to extract characters
    const prompt = `Analiza esta historia y extrae los personajes principales. Para cada personaje, identifica su nombre, rol en la historia, y personalidad inferida del texto.

HISTORIA:
"${cleanContent.substring(0, 8000)}"

Responde en JSON con este formato exacto:
{
  "characters": [
    {
      "name": "Nombre del personaje",
      "role": "protagonist/antagonist/supporting/mentioned",
      "personality": "Breve descripción de su personalidad basada en cómo actúa en la historia",
      "traits": ["rasgo1", "rasgo2", "rasgo3"],
      "emotionalTendencies": ["emoción1", "emoción2"],
      "speakingStyle": "Cómo habla este personaje",
      "keyMoments": ["momento importante 1", "momento importante 2"]
    }
  ]
}

REGLAS:
1. Solo incluye personajes que aparezcan con nombre en la historia
2. No inventes personajes que no existan en el texto
3. Si no hay personajes claros, devuelve un array vacío
4. Máximo 5 personajes principales
5. La personalidad debe basarse SOLO en lo que muestra el texto`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en análisis literario. Extraes personajes de historias de forma precisa. Respondes SOLO con JSON válido, sin markdown.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const extracted = JSON.parse(content);
    console.log('[Character Discovery] Found', extracted.characters?.length || 0, 'characters');

    if (!extracted.characters || extracted.characters.length === 0) {
      return NextResponse.json({
        success: true,
        characters: [],
        message: 'No characters found in story',
      });
    }

    // Create characters in database
    const createdCharacters = [];
    
    for (const char of extracted.characters) {
      // Check if character already exists for this user
      const existing = await prisma.character.findFirst({
        where: {
          authorId: session.user.id,
          name: char.name,
        },
      });

      if (existing) {
        // Update existing character with new info
        const updated = await prisma.character.update({
          where: { id: existing.id },
          data: {
            backstory: char.personality,
            traits: char.traits || [],
            personality: {
              temperament: inferTemperament(char.emotionalTendencies),
              speakingStyle: char.speakingStyle || 'natural',
              emotionalTendencies: char.emotionalTendencies || [],
            },
            interventionEnabled: true,
            interventionStyle: 'suggestion',
            interventionFrequency: 'medium',
            voiceTone: inferVoiceTone(char.personality),
            triggerTopics: extractTopics(char.keyMoments),
          },
        });

        // Connect to story if not already
        await prisma.story.update({
          where: { id: validated.storyId },
          data: {
            characters: {
              connect: { id: updated.id },
            },
          },
        });

        createdCharacters.push({
          id: updated.id,
          name: updated.name,
          role: char.role,
          personality: char.personality,
        });
      } else {
        // Create new character
        const created = await prisma.character.create({
          data: {
            name: char.name,
            backstory: char.personality,
            traits: char.traits || [],
            authorId: session.user.id,
            personality: {
              temperament: inferTemperament(char.emotionalTendencies),
              speakingStyle: char.speakingStyle || 'natural',
              emotionalTendencies: char.emotionalTendencies || [],
            },
            interventionEnabled: true,
            interventionStyle: 'suggestion',
            interventionFrequency: 'medium',
            voiceTone: inferVoiceTone(char.personality),
            triggerTopics: extractTopics(char.keyMoments),
            stories: {
              connect: { id: validated.storyId },
            },
          },
        });

        createdCharacters.push({
          id: created.id,
          name: created.name,
          role: char.role,
          personality: char.personality,
        });
      }
    }

    console.log('[Character Discovery] Created/Updated', createdCharacters.length, 'characters');

    return NextResponse.json({
      success: true,
      characters: createdCharacters,
      message: `${createdCharacters.length} personajes descubiertos`,
    });
  } catch (error) {
    console.error('[Character Discovery] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to discover characters' },
      { status: 500 }
    );
  }
}

// Helper functions
function inferTemperament(emotions: string[] = []): string {
  const emotionMap: Record<string, string> = {
    hope: 'optimistic',
    determination: 'passionate',
    curiosity: 'curious',
    fear: 'cautious',
    anger: 'passionate',
    sadness: 'melancholic',
    joy: 'cheerful',
  };

  for (const emotion of emotions) {
    const lower = emotion.toLowerCase();
    for (const [key, value] of Object.entries(emotionMap)) {
      if (lower.includes(key)) return value;
    }
  }
  return 'balanced';
}

function inferVoiceTone(personality: string = ''): string {
  const lower = personality.toLowerCase();
  if (lower.includes('líder') || lower.includes('inspirador')) return 'inspiring';
  if (lower.includes('serio') || lower.includes('formal')) return 'serious';
  if (lower.includes('alegre') || lower.includes('optimista')) return 'cheerful';
  if (lower.includes('misterioso') || lower.includes('enigmático')) return 'mysterious';
  if (lower.includes('empático') || lower.includes('cálido')) return 'warm';
  return 'natural';
}

function extractTopics(keyMoments: string[] = []): string[] {
  const topics: string[] = [];
  
  for (const moment of keyMoments) {
    const lower = moment.toLowerCase();
    if (lower.includes('descubr')) topics.push('discovery');
    if (lower.includes('amor') || lower.includes('romance')) topics.push('love');
    if (lower.includes('peligro') || lower.includes('riesgo')) topics.push('danger');
    if (lower.includes('secreto')) topics.push('secrets');
    if (lower.includes('viaje') || lower.includes('aventura')) topics.push('adventure');
    if (lower.includes('conflicto') || lower.includes('pelea')) topics.push('conflict');
  }
  
  return [...new Set(topics)];
}

