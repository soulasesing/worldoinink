// API Route: Get User Style Profile
// GET /api/style/profile

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserStyleProfile, deleteUserStyleProfile } from '@/lib/style-analysis/style-service';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profile = await getUserStyleProfile(session.user.id);

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'No se encontró un perfil de estilo. Analiza tus historias primero.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('[Style Profile] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch style profile',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await deleteUserStyleProfile(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Perfil de estilo eliminado exitosamente',
    });
  } catch (error) {
    console.error('[Style Profile Delete] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete style profile',
      },
      { status: 500 }
    );
  }
}

