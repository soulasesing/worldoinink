// API Route: Character Intervention (Assistant)
// POST /api/assistant/intervention

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { checkAllCharactersForIntervention } from '@/lib/intervention/intervention-service';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const schema = z.object({
  storyId: z.string().min(1, 'Story ID is required'),
  currentText: z.string().min(10, 'Current text must be at least 10 characters'),
  recentText: z.string().min(5, 'Recent text must be at least 5 characters'),
  characterIds: z.array(z.string()).optional(),
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
      validated.recentText
    );

    if (response.shouldIntervene && response.intervention) {
      console.log(`[Intervention] ${response.intervention.characterName} intervened: ${response.intervention.type}`);
      
      // Add ID and timestamp to intervention
      const interventionWithMeta = {
        ...response.intervention,
        id: uuidv4(),
        timestamp: new Date(),
      };

      return NextResponse.json({
        success: true,
        shouldIntervene: true,
        intervention: interventionWithMeta,
      });
    }

    return NextResponse.json({
      success: true,
      shouldIntervene: false,
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
