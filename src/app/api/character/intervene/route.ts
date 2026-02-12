// API Route: Character Intervention
// POST /api/character/intervene

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkAllCharactersForIntervention } from '@/lib/intervention/intervention-service';
import { z } from 'zod';

const schema = z.object({
  storyId: z.string().min(1, 'Story ID is required'),
  currentText: z.string().min(10, 'Current text must be at least 10 characters'),
  recentAddition: z.string().min(5, 'Recent addition must be at least 5 characters'),
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

    console.log(`[Intervention] Checking for story ${validated.storyId}`);

    // Check for interventions
    const response = await checkAllCharactersForIntervention(
      validated.storyId,
      session.user.id,
      validated.currentText,
      validated.recentAddition
    );

    if (response.shouldIntervene && response.intervention) {
      console.log(`[Intervention] ${response.intervention.characterName} intervened: ${response.intervention.type}`);
    }

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error('[Intervention] Error:', error);

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

    return NextResponse.json(
      {
        success: false,
        error: 'INTERVENTION_FAILED',
        message: 'Failed to check for character interventions',
      },
      { status: 500 }
    );
  }
}

