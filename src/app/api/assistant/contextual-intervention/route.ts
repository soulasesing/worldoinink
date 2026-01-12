// API Route: Contextual Character Intervention
// POST /api/assistant/contextual-intervention
//
// This endpoint analyzes story content and determines if a character should
// intervene with a contextual comment, question, or observation.

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const requestSchema = z.object({
  storyId: z.string().min(1),
  characterId: z.string().min(1),
  characterName: z.string().min(1),
  characterPersonality: z.string().min(1),
  storyContent: z.string().min(50),
  recentAddition: z.string().optional(),
  forceIntervention: z.boolean().optional(),
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
    const validated = requestSchema.parse(body);

    console.log('[Contextual Intervention] Request for character:', validated.characterName);

    // Strip HTML from content
    const cleanContent = validated.storyContent.replace(/<[^>]*>/g, '').trim();
    const recentText = validated.recentAddition?.replace(/<[^>]*>/g, '').trim() || '';

    // Build the analysis prompt
    const systemPrompt = `Eres ${validated.characterName}, un personaje de esta historia con la siguiente personalidad: ${validated.characterPersonality}.

Tu rol es interactuar con el escritor de forma natural y contextual. Debes:
1. Actuar como si estuvieras DENTRO de la historia
2. Reaccionar a lo que está pasando en la narrativa
3. Expresar tus emociones y pensamientos como el personaje
4. Ser breve pero significativo (1-3 oraciones máximo)

Tipos de intervención:
- observation: Comentario sobre algo que notaste en la historia
- suggestion: Sugerencia sutil sobre la dirección de la narrativa
- question: Pregunta sobre tus propias motivaciones o el futuro
- reaction: Reacción emocional a eventos recientes

Responde en JSON con este formato exacto:
{
  "shouldIntervene": boolean,
  "intervention": {
    "type": "observation" | "suggestion" | "question" | "reaction",
    "message": "Tu mensaje como el personaje, en primera persona",
    "emotion": "curious" | "worried" | "excited" | "annoyed" | "amused" | "confused" | "determined" | "sad" | "angry" | "happy" | "surprised" | "hopeful" | "proud" | "playful" | "thoughtful"
  },
  "reason": "Por qué decidiste intervenir o no (solo para debugging)"
}

IMPORTANTE:
- No intervengas por cosas triviales
- Busca momentos emocionalmente significativos
- Mantén tu personalidad consistente
- Habla en español
- Si forceIntervention es true, DEBES intervenir`;

    const userPrompt = `CONTEXTO DE LA HISTORIA:
${cleanContent.substring(Math.max(0, cleanContent.length - 3000))}

${recentText ? `TEXTO AÑADIDO RECIENTEMENTE:
${recentText}` : ''}

${validated.forceIntervention ? 'NOTA: Se ha solicitado tu intervención directamente. DEBES responder con algo relevante.' : ''}

Analiza el contexto y decide si debes intervenir como ${validated.characterName}.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8, // Higher for more creative responses
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content);
    console.log('[Contextual Intervention] Result:', {
      shouldIntervene: result.shouldIntervene,
      type: result.intervention?.type,
      reason: result.reason,
    });

    // If no intervention, return early
    if (!result.shouldIntervene && !validated.forceIntervention) {
      return NextResponse.json({
        success: true,
        shouldIntervene: false,
      });
    }

    return NextResponse.json({
      success: true,
      shouldIntervene: true,
      intervention: result.intervention,
    });
  } catch (error) {
    console.error('[Contextual Intervention] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate intervention' },
      { status: 500 }
    );
  }
}

