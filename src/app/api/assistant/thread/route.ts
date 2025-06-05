import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // We might want to associate threads with users later
    // For now, we just create a new thread
    const thread = await openai.beta.threads.create();

    return NextResponse.json({ threadId: thread.id });
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { message: 'Failed to create thread' },
      { status: 500 }
    );
  }
} 