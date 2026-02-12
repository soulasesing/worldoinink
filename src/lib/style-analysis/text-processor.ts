// Core Text Processing Utilities for Style Analysis

/**
 * Remove HTML tags from content
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Split text into sentences
 */
export function splitIntoSentences(text: string): string[] {
  // Split on period, exclamation, question mark followed by space or end
  const sentences = text
    .split(/([.!?]+[\s\n]+|[.!?]+$)/)
    .filter(s => s.trim().length > 0)
    .reduce((acc: string[], curr, idx, arr) => {
      if (idx % 2 === 0 && arr[idx + 1]) {
        acc.push((curr + arr[idx + 1]).trim());
      } else if (idx % 2 === 0) {
        acc.push(curr.trim());
      }
      return acc;
    }, []);
  
  return sentences.filter(s => s.length > 2);
}

/**
 * Split text into paragraphs
 */
export function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

/**
 * Split text into words
 */
export function splitIntoWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return splitIntoWords(text).length;
}

/**
 * Calculate basic text metrics
 */
export interface BasicMetrics {
  totalWords: number;
  totalSentences: number;
  totalParagraphs: number;
  avgWordsPerSentence: number;
  avgSentencesPerParagraph: number;
  uniqueWords: number;
  vocabularyRichness: number;
}

export function calculateBasicMetrics(text: string): BasicMetrics {
  const cleanText = stripHtml(text);
  const words = splitIntoWords(cleanText);
  const sentences = splitIntoSentences(cleanText);
  const paragraphs = splitIntoParagraphs(cleanText);
  
  const uniqueWords = new Set(words).size;
  const totalWords = words.length;
  const totalSentences = sentences.length;
  const totalParagraphs = paragraphs.length;
  
  return {
    totalWords,
    totalSentences,
    totalParagraphs,
    avgWordsPerSentence: totalSentences > 0 ? totalWords / totalSentences : 0,
    avgSentencesPerParagraph: totalParagraphs > 0 ? totalSentences / totalParagraphs : 0,
    uniqueWords,
    vocabularyRichness: totalWords > 0 ? uniqueWords / totalWords : 0,
  };
}

/**
 * Detect narrative voice (1st, 2nd, 3rd person)
 */
export interface VoiceIndicators {
  firstPersonCount: number;
  secondPersonCount: number;
  thirdPersonCount: number;
}

export function detectNarrativeVoice(text: string): {
  voice: 'first-person' | 'second-person' | 'third-person-limited' | 'third-person-omniscient';
  indicators: VoiceIndicators;
  confidence: number;
} {
  const cleanText = stripHtml(text).toLowerCase();
  
  // Count pronouns
  const firstPersonPronouns = (cleanText.match(/\b(yo|me|mi|mis|nosotros|nuestra|nuestro|i|me|my|we|our)\b/gi) || []).length;
  const secondPersonPronouns = (cleanText.match(/\b(tú|tu|tus|usted|ustedes|you|your)\b/gi) || []).length;
  const thirdPersonPronouns = (cleanText.match(/\b(él|ella|ellos|ellas|su|sus|he|she|they|his|her|their)\b/gi) || []).length;
  
  const total = firstPersonPronouns + secondPersonPronouns + thirdPersonPronouns;
  
  if (total === 0) {
    return {
      voice: 'third-person-limited',
      indicators: { firstPersonCount: 0, secondPersonCount: 0, thirdPersonCount: 0 },
      confidence: 0.5,
    };
  }
  
  const firstPersonRatio = firstPersonPronouns / total;
  const secondPersonRatio = secondPersonPronouns / total;
  const thirdPersonRatio = thirdPersonPronouns / total;
  
  let voice: 'first-person' | 'second-person' | 'third-person-limited' | 'third-person-omniscient';
  let confidence: number;
  
  if (firstPersonRatio > 0.5) {
    voice = 'first-person';
    confidence = firstPersonRatio;
  } else if (secondPersonRatio > 0.4) {
    voice = 'second-person';
    confidence = secondPersonRatio;
  } else if (thirdPersonRatio > 0.5) {
    // Could be limited or omniscient - for now default to limited
    voice = 'third-person-limited';
    confidence = thirdPersonRatio;
  } else {
    voice = 'third-person-limited';
    confidence = 0.6;
  }
  
  return {
    voice,
    indicators: {
      firstPersonCount: firstPersonPronouns,
      secondPersonCount: secondPersonPronouns,
      thirdPersonCount: thirdPersonPronouns,
    },
    confidence,
  };
}

/**
 * Detect preferred tense
 */
export function detectPreferredTense(text: string): {
  tense: 'past' | 'present' | 'mixed';
  distribution: { past: number; present: number; future: number };
  confidence: number;
} {
  const cleanText = stripHtml(text).toLowerCase();
  
  // Spanish and English past tense indicators
  const pastIndicators = (cleanText.match(/\b(era|fue|había|hizo|dijo|estaba|tenía|was|were|had|did|said)\b/gi) || []).length;
  
  // Present tense indicators
  const presentIndicators = (cleanText.match(/\b(es|está|tiene|hace|dice|soy|estoy|is|are|has|have|does|says)\b/gi) || []).length;
  
  // Future tense indicators
  const futureIndicators = (cleanText.match(/\b(será|estará|tendrá|hará|dirá|will|shall|going to)\b/gi) || []).length;
  
  const total = pastIndicators + presentIndicators + futureIndicators;
  
  if (total === 0) {
    return {
      tense: 'past',
      distribution: { past: 0, present: 0, future: 0 },
      confidence: 0.5,
    };
  }
  
  const pastRatio = pastIndicators / total;
  const presentRatio = presentIndicators / total;
  
  let tense: 'past' | 'present' | 'mixed';
  let confidence: number;
  
  if (pastRatio > 0.6) {
    tense = 'past';
    confidence = pastRatio;
  } else if (presentRatio > 0.6) {
    tense = 'present';
    confidence = presentRatio;
  } else {
    tense = 'mixed';
    confidence = 0.7;
  }
  
  return {
    tense,
    distribution: {
      past: pastRatio,
      present: presentRatio,
      future: futureIndicators / total,
    },
    confidence,
  };
}

/**
 * Detect dialogue in text
 */
export function analyzeDialogue(text: string): {
  dialoguePercentage: number;
  dialogueSegments: string[];
  hasDialogue: boolean;
} {
  const cleanText = stripHtml(text);
  
  // Detect dialogue (text between quotes)
  const dialogueRegex = /[""]([^""]+)[""]|"([^"]+)"/g;
  const dialogueMatches = [...cleanText.matchAll(dialogueRegex)];
  const dialogueSegments = dialogueMatches.map(match => match[1] || match[2] || '');
  
  const dialogueWords = dialogueSegments.reduce((sum, segment) => sum + countWords(segment), 0);
  const totalWords = countWords(cleanText);
  
  return {
    dialoguePercentage: totalWords > 0 ? (dialogueWords / totalWords) * 100 : 0,
    dialogueSegments,
    hasDialogue: dialogueSegments.length > 0,
  };
}

/**
 * Find most common phrases (n-grams)
 */
export function findCommonPhrases(text: string, minLength: number = 2, maxLength: number = 4): Array<{ phrase: string; count: number }> {
  const cleanText = stripHtml(text).toLowerCase();
  const words = splitIntoWords(cleanText);
  
  const phraseMap = new Map<string, number>();
  
  // Generate n-grams
  for (let n = minLength; n <= maxLength; n++) {
    for (let i = 0; i <= words.length - n; i++) {
      const phrase = words.slice(i, i + n).join(' ');
      phraseMap.set(phrase, (phraseMap.get(phrase) || 0) + 1);
    }
  }
  
  // Filter phrases that appear at least 3 times
  const phrases = Array.from(phraseMap.entries())
    .filter(([_, count]) => count >= 3)
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // Top 20
  
  return phrases;
}

/**
 * Find most common words (excluding common stop words)
 */
export function findFavoriteWords(text: string): Array<{ word: string; count: number }> {
  const cleanText = stripHtml(text).toLowerCase();
  const words = splitIntoWords(cleanText);
  
  // Common stop words to exclude (Spanish and English)
  const stopWords = new Set([
    'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber',
    'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le', 'lo', 'todo',
    'pero', 'más', 'hacer', 'o', 'poder', 'decir', 'este', 'ir', 'otro', 'ese',
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for',
    'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his',
    'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
  ]);
  
  const wordMap = new Map<string, number>();
  
  words.forEach(word => {
    if (!stopWords.has(word) && word.length > 3) {
      wordMap.set(word, (wordMap.get(word) || 0) + 1);
    }
  });
  
  return Array.from(wordMap.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30); // Top 30
}

/**
 * Assess vocabulary level
 */
export function assessVocabularyLevel(text: string): {
  level: 'basic' | 'intermediate' | 'advanced' | 'literary';
  avgWordLength: number;
  longWordPercentage: number;
} {
  const words = splitIntoWords(stripHtml(text));
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  // Count words longer than 7 characters (typically more complex)
  const longWords = words.filter(word => word.length > 7).length;
  const longWordPercentage = (longWords / words.length) * 100;
  
  let level: 'basic' | 'intermediate' | 'advanced' | 'literary';
  
  if (avgWordLength < 4.5 && longWordPercentage < 10) {
    level = 'basic';
  } else if (avgWordLength < 5.5 && longWordPercentage < 20) {
    level = 'intermediate';
  } else if (avgWordLength < 6.5 && longWordPercentage < 30) {
    level = 'advanced';
  } else {
    level = 'literary';
  }
  
  return {
    level,
    avgWordLength,
    longWordPercentage,
  };
}

/**
 * Extract representative examples from text
 */
export function extractRepresentativeExamples(
  text: string,
  type: 'opening' | 'descriptive' | 'dialogue' | 'emotional',
  count: number = 3
): string[] {
  const paragraphs = splitIntoParagraphs(stripHtml(text));
  
  if (type === 'opening') {
    return paragraphs.slice(0, count);
  }
  
  if (type === 'dialogue') {
    const dialogueParagraphs = paragraphs.filter(p => p.includes('"') || p.includes('"'));
    return dialogueParagraphs.slice(0, count);
  }
  
  if (type === 'descriptive') {
    // Paragraphs with many adjectives/descriptive words
    const descriptiveParagraphs = paragraphs
      .filter(p => {
        const words = splitIntoWords(p);
        const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
        return avgWordLength > 5 && words.length > 30;
      });
    return descriptiveParagraphs.slice(0, count);
  }
  
  // For emotional, return varied paragraphs
  const step = Math.floor(paragraphs.length / (count + 1));
  return paragraphs.filter((_, idx) => idx % step === 0).slice(0, count);
}

