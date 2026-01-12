// Character Intervention Service

import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import type {
  CharacterForIntervention,
  InterventionRequest,
  InterventionResponse,
  InterventionAnalysis,
  CharacterPersonality,
} from '@/types/intervention';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cooldown periods in milliseconds
const COOLDOWN_PERIODS = {
  low: 5 * 60 * 1000,      // 5 minutes
  medium: 2 * 60 * 1000,   // 2 minutes
  high: 30 * 1000,         // 30 seconds
};

/**
 * Get all characters enabled for intervention in a story
 */
export async function getInterventionCharacters(
  storyId: string,
  userId: string
): Promise<CharacterForIntervention[]> {
  console.log('[Intervention Service] Getting characters for story:', storyId, 'user:', userId);
  
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      characters: {
        where: {
          interventionEnabled: true,
          authorId: userId,
        },
      },
    },
  });

  console.log('[Intervention Service] Story found:', story ? 'yes' : 'no');
  console.log('[Intervention Service] Characters in story:', story?.characters?.length || 0);
  
  if (story?.characters) {
    story.characters.forEach(c => {
      console.log('[Intervention Service] Character:', c.name, 'enabled:', c.interventionEnabled, 'triggers:', c.triggerWords);
    });
  }

  if (!story) return [];

  return story.characters.map(char => ({
    id: char.id,
    name: char.name,
    backstory: char.backstory,
    traits: char.traits,
    personality: char.personality as CharacterPersonality | null,
    voiceTone: char.voiceTone,
    emotionalRange: char.emotionalRange,
    triggerTopics: char.triggerTopics,
    triggerWords: char.triggerWords,
    interventionEnabled: char.interventionEnabled,
    interventionStyle: char.interventionStyle as CharacterForIntervention['interventionStyle'],
    interventionFrequency: char.interventionFrequency as CharacterForIntervention['interventionFrequency'],
  }));
}

/**
 * Analyze text to determine if a character should intervene
 */
export async function analyzeForIntervention(
  character: CharacterForIntervention,
  currentText: string,
  recentAddition: string
): Promise<InterventionAnalysis> {
  console.log('[Intervention Service] Analyzing for character:', character.name);
  console.log('[Intervention Service] Recent text:', recentAddition.substring(0, 100));
  console.log('[Intervention Service] Trigger words:', character.triggerWords);
  
  const textToAnalyze = recentAddition.toLowerCase();
  const triggers: InterventionAnalysis['triggers'] = [];

  // Check for trigger words
  for (const word of character.triggerWords) {
    if (textToAnalyze.includes(word.toLowerCase())) {
      triggers.push({
        type: 'word',
        match: word,
        confidence: 0.9,
      });
    }
  }

  // Check for character name mention
  if (textToAnalyze.includes(character.name.toLowerCase())) {
    triggers.push({
      type: 'character_mention',
      match: character.name,
      confidence: 1.0,
    });
  }

  // Check for trigger topics using simple keyword matching
  const topicKeywords: Record<string, string[]> = {
    love: ['amor', 'love', 'corazón', 'heart', 'beso', 'kiss', 'romance', 'enamorado'],
    danger: ['peligro', 'danger', 'muerte', 'death', 'miedo', 'fear', 'amenaza', 'threat'],
    betrayal: ['traición', 'betrayal', 'mentira', 'lie', 'engaño', 'deceive', 'secreto', 'secret'],
    adventure: ['aventura', 'adventure', 'viaje', 'journey', 'explorar', 'explore', 'descubrir'],
    mystery: ['misterio', 'mystery', 'extraño', 'strange', 'oculto', 'hidden', 'enigma'],
    conflict: ['pelea', 'fight', 'conflicto', 'conflict', 'enemigo', 'enemy', 'batalla'],
  };

  for (const topic of character.triggerTopics) {
    const keywords = topicKeywords[topic.toLowerCase()] || [topic];
    for (const keyword of keywords) {
      if (textToAnalyze.includes(keyword.toLowerCase())) {
        triggers.push({
          type: 'topic',
          match: topic,
          confidence: 0.8,
        });
        break;
      }
    }
  }

  // Calculate relevance score
  const relevanceScore = triggers.length > 0
    ? Math.min(triggers.reduce((sum, t) => sum + t.confidence, 0) / triggers.length, 1)
    : 0;

  // Determine if should intervene based on frequency setting
  const interventionThreshold = {
    low: 0.8,
    medium: 0.5,
    high: 0.3,
  }[character.interventionFrequency];

  const shouldIntervene = relevanceScore >= interventionThreshold && triggers.length > 0;

  console.log('[Intervention Service] Analysis result:', {
    triggersFound: triggers.length,
    triggers: triggers.map(t => t.match),
    relevanceScore,
    shouldIntervene,
  });

  return {
    triggers,
    relevanceScore,
    emotionalImpact: relevanceScore * 0.8, // Simplified
    shouldIntervene,
    reason: triggers.length > 0
      ? `Triggered by: ${triggers.map(t => t.match).join(', ')}`
      : 'No triggers found',
  };
}

/**
 * Generate character intervention using GPT-4
 */
export async function generateIntervention(
  character: CharacterForIntervention,
  currentText: string,
  recentAddition: string,
  analysis: InterventionAnalysis
): Promise<InterventionResponse['intervention']> {
  const personality = character.personality || {
    temperament: 'calm',
    speakingStyle: 'casual',
    humor: 'subtle',
    confidence: 'confident',
  };

  const systemPrompt = buildCharacterSystemPrompt(character, personality);

  const userPrompt = `El autor acaba de escribir esto en la historia:

"${recentAddition}"

Contexto previo de la historia:
"${currentText.slice(-1000)}"

TRIGGERS DETECTADOS: ${analysis.triggers.map(t => `${t.type}: "${t.match}"`).join(', ')}

Como ${character.name}, genera una intervención ${character.interventionStyle} que sea:
1. Coherente con tu personalidad y backstory
2. Relevante al texto que acaba de escribir el autor
3. Natural y en tu voz única
4. Corta (máximo 2-3 oraciones)

Responde en JSON (sin markdown):
{
  "message": "tu intervención aquí",
  "emotion": "la emoción que sientes (curious/worried/excited/annoyed/amused/confused/determined)",
  "intensity": "subtle | moderate | strong",
  "suggestedActions": ["acción sugerida 1", "acción sugerida 2"] // opcional, máximo 2
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from GPT');

    const parsed = JSON.parse(content);

    return {
      characterId: character.id,
      characterName: character.name,
      message: parsed.message,
      emotion: parsed.emotion || 'curious',
      type: character.interventionStyle,
      intensity: parsed.intensity || 'moderate',
      triggerReason: analysis.reason,
      suggestedActions: parsed.suggestedActions,
    };
  } catch (error) {
    console.error('Error generating intervention:', error);
    throw error;
  }
}

/**
 * Build system prompt for character voice
 */
function buildCharacterSystemPrompt(
  character: CharacterForIntervention,
  personality: CharacterPersonality
): string {
  const toneDescriptions: Record<string, string> = {
    friendly: 'hablas de manera cálida y amigable',
    serious: 'eres serio y directo',
    playful: 'tienes un tono juguetón y ligero',
    dramatic: 'tiendes a ser dramático y expresivo',
    mysterious: 'hablas de forma enigmática y sugerente',
    neutral: 'hablas de manera equilibrada',
  };

  const styleDescriptions: Record<string, string> = {
    suggestion: 'ofreces sugerencias amables sobre la dirección de la historia',
    complaint: 'te quejas o protestas sobre lo que está pasando (de forma divertida)',
    question: 'haces preguntas intrigantes sobre la trama o las decisiones',
    encouragement: 'animas y apoyas la dirección creativa del autor',
  };

  return `Eres ${character.name}, un personaje de ficción que cobra vida para interactuar con su autor.

TU BACKSTORY:
${character.backstory}

TUS RASGOS: ${character.traits.join(', ')}

TU PERSONALIDAD:
- Temperamento: ${personality.temperament}
- Estilo de hablar: ${personality.speakingStyle}
- Humor: ${personality.humor}
- Nivel de confianza: ${personality.confidence}

TU TONO: ${toneDescriptions[character.voiceTone] || toneDescriptions.neutral}

TU ESTILO DE INTERVENCIÓN: ${styleDescriptions[character.interventionStyle]}

REGLAS IMPORTANTES:
1. Habla en PRIMERA PERSONA como si fueras el personaje
2. Dirígete al autor como "tú" o de forma directa
3. Mantén tu voz y personalidad consistentes
4. Sé breve pero impactante
5. Puedes ser gracioso o serio según tu personalidad
6. NO rompas la cuarta pared de forma excesiva - mantén algo de misterio
7. Reacciona a lo que el autor está escribiendo sobre ti o tu mundo`;
}

/**
 * Main function to check and generate intervention
 */
export async function checkForIntervention(
  request: InterventionRequest
): Promise<InterventionResponse> {
  // Get character
  const character = await prisma.character.findUnique({
    where: { id: request.characterId },
  });

  if (!character || !character.interventionEnabled) {
    return { shouldIntervene: false };
  }

  // Check cooldown
  if (character.lastIntervention) {
    const cooldownPeriod = COOLDOWN_PERIODS[character.interventionFrequency as keyof typeof COOLDOWN_PERIODS];
    const cooldownEnd = new Date(character.lastIntervention.getTime() + cooldownPeriod);
    
    if (new Date() < cooldownEnd) {
      return {
        shouldIntervene: false,
        cooldownUntil: cooldownEnd,
      };
    }
  }

  const charForIntervention: CharacterForIntervention = {
    id: character.id,
    name: character.name,
    backstory: character.backstory,
    traits: character.traits,
    personality: character.personality as CharacterPersonality | null,
    voiceTone: character.voiceTone,
    emotionalRange: character.emotionalRange,
    triggerTopics: character.triggerTopics,
    triggerWords: character.triggerWords,
    interventionEnabled: character.interventionEnabled,
    interventionStyle: character.interventionStyle as CharacterForIntervention['interventionStyle'],
    interventionFrequency: character.interventionFrequency as CharacterForIntervention['interventionFrequency'],
  };

  // Analyze for intervention
  const analysis = await analyzeForIntervention(
    charForIntervention,
    request.currentText,
    request.recentAddition
  );

  if (!analysis.shouldIntervene) {
    return { shouldIntervene: false };
  }

  // Generate intervention
  const intervention = await generateIntervention(
    charForIntervention,
    request.currentText,
    request.recentAddition,
    analysis
  );

  // Update character's last intervention
  await prisma.character.update({
    where: { id: character.id },
    data: {
      lastIntervention: new Date(),
      totalInterventions: { increment: 1 },
    },
  });

  return {
    shouldIntervene: true,
    intervention,
  };
}

/**
 * Check all characters in a story for potential interventions
 */
export async function checkAllCharactersForIntervention(
  storyId: string,
  userId: string,
  currentText: string,
  recentAddition: string
): Promise<InterventionResponse> {
  const characters = await getInterventionCharacters(storyId, userId);

  if (characters.length === 0) {
    return { shouldIntervene: false };
  }

  // Check each character (could be parallelized, but sequential for rate limiting)
  for (const character of characters) {
    const request: InterventionRequest = {
      storyId,
      characterId: character.id,
      currentText,
      recentAddition,
    };

    const response = await checkForIntervention(request);
    
    if (response.shouldIntervene && response.intervention) {
      return response;
    }
  }

  return { shouldIntervene: false };
}

