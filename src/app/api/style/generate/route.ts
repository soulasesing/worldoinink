// API Route: Generate Text in User's Style
// POST /api/style/generate

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserStyleProfile } from '@/lib/style-analysis/style-service';
import { generateInUserStyle } from '@/lib/style-analysis/ai-analyzer';
import { z } from 'zod';

const schema = z.object({
  prompt: z.string().min(10, 'El prompt debe tener al menos 10 caracteres'),
  context: z.string().default(''),
  maxLength: z.number().min(50).max(2000).default(500),
  temperature: z.number().min(0).max(1).default(0.7),
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
    const validated = schema.parse(body);

    // Get user's style profile
    const styleProfile = await getUserStyleProfile(session.user.id);

    if (!styleProfile) {
      return NextResponse.json(
        {
          success: false,
          error: 'NO_STYLE_PROFILE',
          message: 'Debes analizar tu estilo primero antes de generar texto personalizado',
        },
        { status: 400 }
      );
    }

    if (styleProfile.confidence < 0.5) {
      return NextResponse.json(
        {
          success: false,
          error: 'LOW_CONFIDENCE',
          message: 'Tu perfil de estilo aún no tiene suficiente confianza. Escribe más historias y re-analiza.',
        },
        { status: 400 }
      );
    }

    console.log(`[Style Generation] Generating for user ${session.user.id} with confidence ${styleProfile.confidence}`);

    // Generate text in user's style
    const generatedText = await generateInUserStyle(
      styleProfile,
      validated.prompt,
      validated.context,
      validated.maxLength
    );

    return NextResponse.json({
      success: true,
      generatedText,
      usedStyle: true,
      styleConfidence: styleProfile.confidence,
    });
  } catch (error) {
    console.error('[Style Generation] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    return NextResponse.json(
      {
        success: false,
        error: 'GENERATION_FAILED',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

