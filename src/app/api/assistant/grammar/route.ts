import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { authOptions } from '../../../../lib/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { text, context, writingStyle, filters, confidenceThreshold } = await req.json();
    if (!text) {
      return new NextResponse('Text is required', { status: 400 });
    }

    const prompt = `Analyze the following text for grammar, style, and clarity. Provide suggestions for improvement.
Text: "${text}"
Context: ${context || 'general writing'}
Writing Style: ${writingStyle || 'creative'}
Focus Areas: ${filters?.join(', ') || 'grammar, style, clarity'}
Confidence Threshold: ${confidenceThreshold || 0.7}

Please provide the analysis in the following JSON format:
{
  "original": "the original text",
  "suggestions": [
    {
      "type": "grammar|style|clarity",
      "original": "the original phrase",
      "suggestion": "the suggested improvement",
      "explanation": "brief explanation of the suggestion",
      "tone": "formal|casual|creative|technical",
      "confidence": 0.0-1.0
    }
  ],
  "overall_analysis": "brief overall analysis of the text"
}

Focus on:
1. Grammar and punctuation
2. Style and flow
3. Clarity and readability
4. Tone consistency
5. Word choice and phrasing
6. Writing style appropriateness
7. Sentence structure and variety
8. Paragraph organization
9. Active vs passive voice
10. Redundancy and conciseness

Only include suggestions that would genuinely improve the text and match the specified writing style.
Consider the context and intended audience when making suggestions.
Provide confidence scores based on the certainty of each suggestion.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a professional writing assistant specializing in grammar, style, and clarity. 
          Your expertise includes:
          - Advanced grammar and punctuation rules
          - Style guide compliance
          - Writing style adaptation
          - Clarity and readability optimization
          - Tone and voice consistency
          - Audience-appropriate language
          
          Provide detailed, constructive feedback that helps improve the text while maintaining the author's voice and intent.
          Consider the specified writing style and context when making suggestions.
          Only suggest changes that would genuinely improve the text.
          Provide confidence scores based on the certainty of each suggestion.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    // Filter suggestions based on confidence threshold
    if (analysis.suggestions) {
      analysis.suggestions = analysis.suggestions.filter(
        (s: any) => s.confidence >= (confidenceThreshold || 0.7)
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Grammar check error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 