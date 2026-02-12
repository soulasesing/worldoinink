// Advanced Style Analysis using OpenAI GPT-4

import OpenAI from 'openai';
import type {
  WritingStyleProfile,
  ToneAnalysis,
  DialogueAnalysis,
  AuthorComparison,
} from '@/types/style';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze writing style using GPT-4
 */
export async function analyzeStyleWithAI(
  textSamples: string[],
  basicMetrics: {
    avgSentenceLength: number;
    avgParagraphLength: number;
    vocabularyLevel: string;
    narrativeVoice: string;
    preferredTense: string;
  }
): Promise<{
  tones: string[];
  writingPace: string;
  descriptiveDensity: string;
  dialogueStyle: string;
  literaryMovement?: string;
  similarAuthors: Array<{ name: string; similarity: number; reason?: string }>;
}> {
  // Prepare text sample (max 3000 words to stay within token limits)
  const combinedText = textSamples.join('\n\n').substring(0, 15000);
  
  const prompt = `Eres un crítico literario experto. Analiza el siguiente texto y proporciona un análisis detallado del estilo literario.

MÉTRICAS BÁSICAS DETECTADAS:
- Longitud promedio de oración: ${basicMetrics.avgSentenceLength.toFixed(1)} palabras
- Longitud promedio de párrafo: ${basicMetrics.avgParagraphLength.toFixed(1)} oraciones
- Nivel de vocabulario: ${basicMetrics.vocabularyLevel}
- Voz narrativa: ${basicMetrics.narrativeVoice}
- Tiempo verbal preferido: ${basicMetrics.preferredTense}

TEXTO A ANALIZAR:
${combinedText}

Por favor proporciona tu análisis en el siguiente formato JSON (NO incluyas markdown, solo JSON válido):

{
  "tones": ["array de 2-4 tonos dominantes, ej: melancholic, poetic, hopeful, dark, humorous, philosophical, nostalgic"],
  "writingPace": "fast | moderate | slow | variable",
  "descriptiveDensity": "sparse | moderate | rich | very-rich",
  "dialogueStyle": "natural | formal | dialectal | minimalist | expressive",
  "literaryMovement": "movimiento literario si es identificable (ej: realismo mágico, modernismo, etc.) o null",
  "similarAuthors": [
    {
      "name": "Nombre del autor",
      "similarity": 0.75,
      "reason": "breve explicación de por qué se parece"
    }
  ],
  "overallImpression": "Una frase que capture la esencia única de este estilo"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Eres un crítico literario experto que analiza estilos de escritura. Respondes SOLO con JSON válido, sin markdown ni explicaciones adicionales.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(content);
    
    return {
      tones: analysis.tones || [],
      writingPace: analysis.writingPace || 'moderate',
      descriptiveDensity: analysis.descriptiveDensity || 'moderate',
      dialogueStyle: analysis.dialogueStyle || 'natural',
      literaryMovement: analysis.literaryMovement || undefined,
      similarAuthors: analysis.similarAuthors || [],
    };
  } catch (error) {
    console.error('Error in AI style analysis:', error);
    
    // Fallback to defaults if AI fails
    return {
      tones: ['narrative'],
      writingPace: 'moderate',
      descriptiveDensity: 'moderate',
      dialogueStyle: 'natural',
      similarAuthors: [],
    };
  }
}

/**
 * Generate text in the user's style
 */
export async function generateInUserStyle(
  styleProfile: Partial<WritingStyleProfile>,
  prompt: string,
  context: string,
  maxLength: number = 500
): Promise<string> {
  // Build style description for GPT
  const styleDescription = buildStylePrompt(styleProfile);
  
  const systemPrompt = `Eres un asistente de escritura que debe escribir EXACTAMENTE en el estilo del usuario.

ESTILO DEL USUARIO:
${styleDescription}

INSTRUCCIONES CRÍTICAS:
1. IMITA el estilo del usuario lo más fielmente posible
2. Usa su mismo tipo de vocabulario (${styleProfile.vocabularyLevel || 'intermedio'})
3. Mantén su longitud de oración promedio (${styleProfile.avgSentenceLength?.toFixed(0) || '15'} palabras)
4. Usa su voz narrativa (${styleProfile.narrativeVoice || 'tercera persona'})
5. Respeta su tiempo verbal preferido (${styleProfile.preferredTense || 'pasado'})
6. Incorpora sus frases características si es posible
7. Mantén su tono dominante: ${styleProfile.dominantTones?.join(', ') || 'narrativo'}
8. Respeta su ritmo de escritura: ${styleProfile.writingPace || 'moderado'}

NO inventes un estilo diferente. NO uses un estilo genérico. DEBE sonar como si lo hubiera escrito el usuario.`;

  const userPrompt = `CONTEXTO DE LA HISTORIA:
${context}

CONTINUACIÓN SOLICITADA:
${prompt}

Escribe la continuación manteniendo FIELMENTE el estilo del autor. Máximo ${maxLength} palabras.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: Math.min(maxLength * 2, 2000),
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating in user style:', error);
    throw new Error('Failed to generate text in your style');
  }
}

/**
 * Provide style-aware suggestions
 */
export async function suggestStyleImprovements(
  text: string,
  styleProfile: Partial<WritingStyleProfile>
): Promise<Array<{
  type: 'consistency' | 'enhancement' | 'alternative';
  original: string;
  suggestion: string;
  explanation: string;
}>> {
  const styleDescription = buildStylePrompt(styleProfile);
  
  const prompt = `Eres un editor que ayuda a escritores a mantener consistencia en su estilo único.

ESTILO DEL ESCRITOR:
${styleDescription}

TEXTO A REVISAR:
${text.substring(0, 5000)}

Analiza el texto y proporciona sugerencias para que sea MÁS CONSISTENTE con el estilo del autor.

Responde en JSON (sin markdown):
{
  "suggestions": [
    {
      "type": "consistency | enhancement | alternative",
      "original": "fragmento original",
      "suggestion": "fragmento sugerido",
      "explanation": "por qué esta sugerencia se ajusta mejor a su estilo"
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Eres un editor experto que ayuda a mantener consistencia de estilo. Respondes SOLO con JSON válido.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    const result = JSON.parse(content);
    return result.suggestions || [];
  } catch (error) {
    console.error('Error getting style suggestions:', error);
    return [];
  }
}

/**
 * Build a comprehensive style description for prompts
 */
function buildStylePrompt(styleProfile: Partial<WritingStyleProfile>): string {
  const parts: string[] = [];
  
  parts.push(`- Voz narrativa: ${styleProfile.narrativeVoice || 'no definida'}`);
  parts.push(`- Tiempo verbal: ${styleProfile.preferredTense || 'no definido'}`);
  parts.push(`- Longitud promedio de oración: ${styleProfile.avgSentenceLength?.toFixed(1) || 'no definida'} palabras`);
  parts.push(`- Nivel de vocabulario: ${styleProfile.vocabularyLevel || 'intermedio'}`);
  
  if (styleProfile.dominantTones && styleProfile.dominantTones.length > 0) {
    parts.push(`- Tonos dominantes: ${styleProfile.dominantTones.join(', ')}`);
  }
  
  parts.push(`- Ritmo de escritura: ${styleProfile.writingPace || 'moderado'}`);
  parts.push(`- Densidad descriptiva: ${styleProfile.descriptiveDensity || 'moderada'}`);
  
  if (styleProfile.dialogueStyle) {
    parts.push(`- Estilo de diálogo: ${styleProfile.dialogueStyle}`);
  }
  
  if (styleProfile.signaturePhrases && typeof styleProfile.signaturePhrases === 'object') {
    const topPhrases = Object.entries(styleProfile.signaturePhrases)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([phrase]) => `"${phrase}"`)
      .join(', ');
    
    if (topPhrases) {
      parts.push(`- Frases características: ${topPhrases}`);
    }
  }
  
  if (styleProfile.favoriteWords && typeof styleProfile.favoriteWords === 'object') {
    const topWords = Object.entries(styleProfile.favoriteWords)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 8)
      .map(([word]) => word)
      .join(', ');
    
    if (topWords) {
      parts.push(`- Palabras favoritas: ${topWords}`);
    }
  }
  
  if (styleProfile.similarAuthors && styleProfile.similarAuthors.length > 0) {
    const authors = styleProfile.similarAuthors
      .slice(0, 3)
      .map(a => a.name)
      .join(', ');
    parts.push(`- Autores similares: ${authors}`);
  }
  
  if (styleProfile.literaryMovement) {
    parts.push(`- Movimiento literario: ${styleProfile.literaryMovement}`);
  }
  
  return parts.join('\n');
}

/**
 * Analyze a single story and extract style indicators
 */
export async function quickStyleAnalysis(text: string): Promise<{
  confidence: number;
  keyFeatures: string[];
  shouldAnalyze: boolean;
}> {
  const wordCount = text.split(/\s+/).length;
  
  if (wordCount < 500) {
    return {
      confidence: 0,
      keyFeatures: [],
      shouldAnalyze: false,
    };
  }
  
  // Quick AI check for distinctive style
  const sample = text.substring(0, 2000);
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Identifica rápidamente 3-5 características distintivas del estilo de escritura. Responde solo con un array JSON de strings.',
        },
        {
          role: 'user',
          content: `Texto: ${sample}\n\nCaracterísticas distintivas (JSON array):`,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content || '[]';
    const keyFeatures = JSON.parse(content);
    
    return {
      confidence: wordCount > 1000 ? 0.8 : 0.6,
      keyFeatures,
      shouldAnalyze: true,
    };
  } catch (error) {
    console.error('Quick style analysis error:', error);
    return {
      confidence: 0.5,
      keyFeatures: [],
      shouldAnalyze: wordCount > 1000,
    };
  }
}

