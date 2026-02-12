// Main Style Analysis Service

import { prisma } from '@/lib/prisma';
import type { WritingStyleProfile, StyleExampleData, ExampleType } from '@/types/style';
import {
  calculateBasicMetrics,
  detectNarrativeVoice,
  detectPreferredTense,
  analyzeDialogue,
  findCommonPhrases,
  findFavoriteWords,
  assessVocabularyLevel,
  extractRepresentativeExamples,
  stripHtml,
} from './text-processor';
import { analyzeStyleWithAI } from './ai-analyzer';

// Minimum requirements for style analysis
const MIN_STORIES = 2;
const MIN_TOTAL_WORDS = 3000;

/**
 * Check if user has enough data for analysis
 */
export async function checkAnalysisEligibility(userId: string): Promise<{
  eligible: boolean;
  currentStories: number;
  currentWords: number;
  message: string;
}> {
  const stories = await prisma.story.findMany({
    where: {
      authorId: userId,
      // Analyze all stories (published + drafts) for better style detection
    },
    select: {
      wordCount: true,
    },
  });

  const currentStories = stories.length;
  const currentWords = stories.reduce((sum, s) => sum + s.wordCount, 0);

  const eligible = currentStories >= MIN_STORIES && currentWords >= MIN_TOTAL_WORDS;

  let message = '';
  if (!eligible) {
    if (currentStories < MIN_STORIES) {
      message = `Necesitas al menos ${MIN_STORIES} historias publicadas. Actualmente tienes ${currentStories}.`;
    } else {
      message = `Necesitas al menos ${MIN_TOTAL_WORDS} palabras en total. Actualmente tienes ${currentWords}.`;
    }
  } else {
    message = 'Tienes suficientes datos para analizar tu estilo.';
  }

  return {
    eligible,
    currentStories,
    currentWords,
    message,
  };
}

/**
 * Perform complete style analysis for a user
 */
export async function analyzeUserStyle(
  userId: string,
  forceReanalyze: boolean = false
): Promise<WritingStyleProfile> {
  // Check if analysis exists and is recent
  if (!forceReanalyze) {
    const existing = await prisma.writingStyle.findUnique({
      where: { userId },
      include: { styleExamples: true },
    });

    if (existing && existing.confidence > 0.7) {
      const daysSinceAnalysis = Math.floor(
        (Date.now() - existing.lastAnalyzed.getTime()) / (1000 * 60 * 60 * 24)
      );

      // If analyzed in last 7 days, return existing
      if (daysSinceAnalysis < 7) {
        return existing as unknown as WritingStyleProfile;
      }
    }
  }

  // Check eligibility
  const eligibility = await checkAnalysisEligibility(userId);
  if (!eligibility.eligible) {
    throw new Error(eligibility.message);
  }

  // Fetch all user's stories (published + drafts)
  const stories = await prisma.story.findMany({
    where: {
      authorId: userId,
      // Include all stories for comprehensive style analysis
    },
    select: {
      id: true,
      title: true,
      content: true,
      wordCount: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  // Combine all story content
  const allTexts = stories.map(s => stripHtml(s.content));
  const combinedText = allTexts.join('\n\n');

  console.log(`Analyzing style for user ${userId} with ${stories.length} stories, ${eligibility.currentWords} words`);

  // Step 1: Basic text analysis
  const basicMetrics = calculateBasicMetrics(combinedText);
  const voiceAnalysis = detectNarrativeVoice(combinedText);
  const tenseAnalysis = detectPreferredTense(combinedText);
  const dialogueAnalysis = analyzeDialogue(combinedText);
  const vocabularyAnalysis = assessVocabularyLevel(combinedText);

  // Step 2: Pattern extraction
  const commonPhrases = findCommonPhrases(combinedText);
  const favoriteWords = findFavoriteWords(combinedText);

  // Convert to JSON-compatible format
  const signaturePhrases: Record<string, number> = {};
  commonPhrases.forEach(p => {
    signaturePhrases[p.phrase] = p.count;
  });

  const favoriteWordsMap: Record<string, number> = {};
  favoriteWords.slice(0, 20).forEach(w => {
    favoriteWordsMap[w.word] = w.count;
  });

  // Step 3: AI-powered deep analysis
  console.log('Running AI analysis...');
  const aiAnalysis = await analyzeStyleWithAI(
    allTexts.slice(0, 5), // Analyze up to 5 most recent stories
    {
      avgSentenceLength: basicMetrics.avgWordsPerSentence,
      avgParagraphLength: basicMetrics.avgSentencesPerParagraph,
      vocabularyLevel: vocabularyAnalysis.level,
      narrativeVoice: voiceAnalysis.voice,
      preferredTense: tenseAnalysis.tense,
    }
  );

  // Step 4: Extract representative examples
  const examples = extractStyleExamples(stories, combinedText);

  // Calculate overall confidence
  const confidence = calculateConfidence({
    storiesCount: stories.length,
    totalWords: eligibility.currentWords,
    voiceConfidence: voiceAnalysis.confidence,
    tenseConfidence: tenseAnalysis.confidence,
    hasDialogue: dialogueAnalysis.hasDialogue,
  });

  console.log(`Analysis complete. Confidence: ${confidence.toFixed(2)}`);

  // Step 5: Save to database
  const styleProfile = await prisma.writingStyle.upsert({
    where: { userId },
    create: {
      userId,
      narrativeVoice: voiceAnalysis.voice,
      preferredTense: tenseAnalysis.tense,
      avgSentenceLength: basicMetrics.avgWordsPerSentence,
      avgParagraphLength: basicMetrics.avgSentencesPerParagraph,
      vocabularyLevel: vocabularyAnalysis.level,
      dominantTones: aiAnalysis.tones,
      writingPace: aiAnalysis.writingPace,
      descriptiveDensity: aiAnalysis.descriptiveDensity,
      signaturePhrases: signaturePhrases,
      favoriteWords: favoriteWordsMap,
      avoidedWords: [],
      dialogueStyle: aiAnalysis.dialogueStyle,
      dialogueFrequency: dialogueAnalysis.dialoguePercentage,
      similarAuthors: aiAnalysis.similarAuthors,
      literaryMovement: aiAnalysis.literaryMovement || null,
      analyzedStories: stories.length,
      totalWordsAnalyzed: eligibility.currentWords,
      confidence,
      isActive: true,
    },
    update: {
      narrativeVoice: voiceAnalysis.voice,
      preferredTense: tenseAnalysis.tense,
      avgSentenceLength: basicMetrics.avgWordsPerSentence,
      avgParagraphLength: basicMetrics.avgSentencesPerParagraph,
      vocabularyLevel: vocabularyAnalysis.level,
      dominantTones: aiAnalysis.tones,
      writingPace: aiAnalysis.writingPace,
      descriptiveDensity: aiAnalysis.descriptiveDensity,
      signaturePhrases: signaturePhrases,
      favoriteWords: favoriteWordsMap,
      dialogueStyle: aiAnalysis.dialogueStyle,
      dialogueFrequency: dialogueAnalysis.dialoguePercentage,
      similarAuthors: aiAnalysis.similarAuthors,
      literaryMovement: aiAnalysis.literaryMovement || null,
      analyzedStories: stories.length,
      totalWordsAnalyzed: eligibility.currentWords,
      confidence,
      lastAnalyzed: new Date(),
    },
    include: {
      styleExamples: true,
    },
  });

  // Save examples
  await saveStyleExamples(styleProfile.id, examples);

  return styleProfile as unknown as WritingStyleProfile;
}

/**
 * Extract representative style examples
 */
function extractStyleExamples(
  stories: Array<{ id: string; title: string; content: string }>,
  combinedText: string
): Array<{ text: string; type: ExampleType; storyTitle: string; score: number }> {
  const examples: Array<{ text: string; type: ExampleType; storyTitle: string; score: number }> = [];

  // Opening examples (from first story)
  if (stories.length > 0) {
    const openingParagraphs = extractRepresentativeExamples(stories[0].content, 'opening', 2);
    openingParagraphs.forEach(text => {
      examples.push({
        text,
        type: 'OPENING',
        storyTitle: stories[0].title,
        score: 0.9,
      });
    });
  }

  // Descriptive examples
  const descriptiveExamples = extractRepresentativeExamples(combinedText, 'descriptive', 2);
  descriptiveExamples.forEach(text => {
    const story = stories.find(s => s.content.includes(text));
    examples.push({
      text,
      type: 'DESCRIPTIVE',
      storyTitle: story?.title || 'Unknown',
      score: 0.8,
    });
  });

  // Dialogue examples
  const dialogueExamples = extractRepresentativeExamples(combinedText, 'dialogue', 2);
  dialogueExamples.forEach(text => {
    const story = stories.find(s => s.content.includes(text));
    examples.push({
      text,
      type: 'DIALOGUE',
      storyTitle: story?.title || 'Unknown',
      score: 0.8,
    });
  });

  // Emotional examples
  const emotionalExamples = extractRepresentativeExamples(combinedText, 'emotional', 2);
  emotionalExamples.forEach(text => {
    const story = stories.find(s => s.content.includes(text));
    examples.push({
      text,
      type: 'EMOTIONAL',
      storyTitle: story?.title || 'Unknown',
      score: 0.7,
    });
  });

  return examples;
}

/**
 * Save style examples to database
 */
async function saveStyleExamples(
  styleId: string,
  examples: Array<{ text: string; type: ExampleType; storyTitle: string; score: number }>
): Promise<void> {
  // Delete old examples
  await prisma.styleExample.deleteMany({
    where: { styleId },
  });

  // Create new examples
  await prisma.styleExample.createMany({
    data: examples.map(ex => ({
      styleId,
      text: ex.text.substring(0, 1000), // Limit length
      exampleType: ex.type,
      storyTitle: ex.storyTitle,
      context: `From story: ${ex.storyTitle}`,
      wordCount: ex.text.split(/\s+/).length,
      relevanceScore: ex.score,
    })),
  });
}

/**
 * Calculate analysis confidence score
 */
function calculateConfidence(params: {
  storiesCount: number;
  totalWords: number;
  voiceConfidence: number;
  tenseConfidence: number;
  hasDialogue: boolean;
}): number {
  let confidence = 0;

  // Base confidence from data volume
  const storyScore = Math.min(params.storiesCount / 10, 1) * 0.3; // 30% weight
  const wordScore = Math.min(params.totalWords / 20000, 1) * 0.3; // 30% weight

  // Detection confidence
  const detectionScore = (params.voiceConfidence + params.tenseConfidence) / 2 * 0.3; // 30% weight

  // Bonus for variety
  const varietyScore = params.hasDialogue ? 0.1 : 0; // 10% weight

  confidence = storyScore + wordScore + detectionScore + varietyScore;

  return Math.min(confidence, 1);
}

/**
 * Get user's style profile
 */
export async function getUserStyleProfile(userId: string): Promise<WritingStyleProfile | null> {
  const profile = await prisma.writingStyle.findUnique({
    where: { userId },
    include: {
      styleExamples: {
        orderBy: { relevanceScore: 'desc' },
        take: 10,
      },
    },
  });

  return profile as unknown as WritingStyleProfile | null;
}

/**
 * Delete user's style profile
 */
export async function deleteUserStyleProfile(userId: string): Promise<void> {
  await prisma.writingStyle.delete({
    where: { userId },
  });
}

