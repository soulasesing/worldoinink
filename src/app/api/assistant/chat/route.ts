import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Replace with your actual Assistant ID
// You'll need to create this Assistant in the OpenAI dashboard or via the API
const assistantId = process.env.ASSISTANT_ID; // Make sure you add this to your .env

export async function POST(req: Request) {
  try {
    const { threadId, message } = await req.json();

    if (!threadId || !message) {
      return NextResponse.json(
        { message: 'Missing threadId or message' },
        { status: 400 }
      );
    }

    if (!assistantId) {
         return NextResponse.json(
          { message: 'ASSISTANT_ID is not configured' },
          { status: 500 }
         );
    }

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(
      threadId,
      {
        role: "user",
        content: message,
      }
    );

    // Run the assistant on the thread
    let run = await openai.beta.threads.runs.create(
      threadId,
      {
        assistant_id: assistantId,
      }
    );

    // Poll for the run to complete (simplified polling loop)
    while (run.status !== "completed") {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
      run = await openai.beta.threads.runs.retrieve(threadId, run.id);
       if (run.status === "failed") {
         console.error('Run failed:', run);
         return NextResponse.json(
            { message: 'Assistant run failed' },
            { status: 500 }
          );
       }
    }

    // Get the latest messages from the thread
    const messages = await openai.beta.threads.messages.list(
      threadId,
      { order: 'desc' }
    );

    // Find the assistant's last message
    const assistantMessage = messages.data.find(
      (msg: any) => msg.run_id === run.id && msg.role === 'assistant'
    );

    if (!assistantMessage) {
         return NextResponse.json(
            { message: 'No assistant message found for this run' },
            { status: 500 }
          );
    }

     // Extract text content from the assistant's message
    const textContent = assistantMessage.content.filter((content: any) => content.type === 'text');

    return NextResponse.json({ response: textContent.map((content: any) => content.text.value).join('\n') });

  } catch (error) {
    console.error('Error processing assistant run:', error);
    return NextResponse.json(
      { message: 'Failed to process assistant response' },
      { status: 500 }
    );
  }
} 