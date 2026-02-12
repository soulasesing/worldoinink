import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { authOptions } from '../../../../lib/auth';
import { TTSVoice } from '@/types/audio';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Valid voices for OpenAI TTS
const VALID_VOICES: TTSVoice[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { text, voice = 'nova', speed = 1 } = body;

    // Validate text
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text cannot be empty' },
        { status: 400 }
      );
    }

    // Validate voice
    if (!VALID_VOICES.includes(voice)) {
      return NextResponse.json(
        { error: `Invalid voice. Must be one of: ${VALID_VOICES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate speed (0.25 to 4.0)
    const validSpeed = Math.max(0.25, Math.min(4, Number(speed) || 1));

    // OpenAI TTS limit is ~4096 characters, but we use 4000 for safety
    const maxChars = 4000;
    const truncatedText = text.length > maxChars 
      ? text.substring(0, maxChars) 
      : text;

    console.log(`[TTS] Generating audio for ${truncatedText.length} chars with voice "${voice}" at speed ${validSpeed}`);

    // Generate audio using OpenAI TTS
    const response = await openai.audio.speech.create({
      model: 'tts-1', // Use 'tts-1-hd' for higher quality (slower, more expensive)
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: truncatedText,
      speed: validSpeed,
    });

    // Get the audio buffer
    const audioBuffer = Buffer.from(await response.arrayBuffer());

    console.log(`[TTS] Audio generated successfully: ${audioBuffer.length} bytes`);

    // Return the audio as a response
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('[TTS] Error:', error);

    // Handle OpenAI-specific errors
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (error?.status === 400) {
      return NextResponse.json(
        { error: 'Invalid request to OpenAI TTS API.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate audio. Please try again.' },
      { status: 500 }
    );
  }
}
