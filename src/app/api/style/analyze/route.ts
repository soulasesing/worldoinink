// API Route: Analyze Writing Style
// POST /api/style/analyze

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  analyzeUserStyle,
  checkAnalysisEligibility,
} from '@/lib/style-analysis/style-service';

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
    const forceReanalyze = body.forceReanalyze || false;

    console.log(`[Style Analysis] Starting for user ${session.user.id}, force: ${forceReanalyze}`);

    // Check eligibility first
    const eligibility = await checkAnalysisEligibility(session.user.id);

    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          success: false,
          error: 'INSUFFICIENT_DATA',
          message: eligibility.message,
          needsMoreData: {
            currentStories: eligibility.currentStories,
            currentWords: eligibility.currentWords,
            minStoriesNeeded: 2,
            minWordsNeeded: 3000,
          },
        },
        { status: 400 }
      );
    }

    // Perform analysis
    const profile = await analyzeUserStyle(session.user.id, forceReanalyze);

    console.log(`[Style Analysis] Completed for user ${session.user.id}, confidence: ${profile.confidence}`);

    return NextResponse.json({
      success: true,
      profile,
      message: 'Análisis de estilo completado exitosamente',
    });
  } catch (error) {
    console.error('[Style Analysis] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    if (errorMessage.includes('Necesitas al menos')) {
      return NextResponse.json(
        {
          success: false,
          error: 'INSUFFICIENT_DATA',
          message: errorMessage,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'ANALYSIS_FAILED',
        message: 'No se pudo completar el análisis de estilo',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const eligibility = await checkAnalysisEligibility(session.user.id);

    return NextResponse.json({
      success: true,
      eligibility,
    });
  } catch (error) {
    console.error('[Style Eligibility] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check eligibility',
      },
      { status: 500 }
    );
  }
}

