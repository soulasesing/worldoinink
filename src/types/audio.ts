// Types for Text-to-Speech / Audiobook feature

export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export interface VoiceOption {
  id: TTSVoice;
  name: string;
  description: string;
  gender: 'neutral' | 'male' | 'female';
  style: string;
  emoji: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  { 
    id: 'alloy', 
    name: 'Alloy', 
    description: 'Neutral y balanceada', 
    gender: 'neutral', 
    style: 'Narración general',
    emoji: '🎭'
  },
  { 
    id: 'echo', 
    name: 'Echo', 
    description: 'Profunda y dramática', 
    gender: 'male', 
    style: 'Misterio, drama',
    emoji: '🌑'
  },
  { 
    id: 'fable', 
    name: 'Fable', 
    description: 'Expresiva, acento británico', 
    gender: 'female', 
    style: 'Fantasía, cuentos',
    emoji: '🧚'
  },
  { 
    id: 'onyx', 
    name: 'Onyx', 
    description: 'Autoritaria y potente', 
    gender: 'male', 
    style: 'Épica, acción',
    emoji: '⚔️'
  },
  { 
    id: 'nova', 
    name: 'Nova', 
    description: 'Cálida y emotiva', 
    gender: 'female', 
    style: 'Romance, drama',
    emoji: '💫'
  },
  { 
    id: 'shimmer', 
    name: 'Shimmer', 
    description: 'Suave y poética', 
    gender: 'female', 
    style: 'Poesía, intimidad',
    emoji: '✨'
  },
];

export interface TTSRequest {
  text: string;
  voice: TTSVoice;
  speed?: number; // 0.25 to 4.0, default 1.0
}

export interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  error: string | null;
}

// Preview text for voice samples
export const PREVIEW_TEXT = "Había una vez, en un reino muy lejano, una historia esperando ser contada...";

// Maximum characters per TTS request (OpenAI limit is ~4096)
export const MAX_TTS_CHARS = 4000;

/**
 * Split text into chunks for long narrations
 */
export function splitTextIntoChunks(text: string, maxChars: number = MAX_TTS_CHARS): string[] {
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      chunks.push(remaining);
      break;
    }

    // Find a good breaking point (end of sentence or paragraph)
    let breakPoint = maxChars;
    
    // Try to find end of sentence
    const sentenceEnd = remaining.lastIndexOf('.', maxChars);
    if (sentenceEnd > maxChars * 0.5) {
      breakPoint = sentenceEnd + 1;
    } else {
      // Try to find end of paragraph
      const paragraphEnd = remaining.lastIndexOf('\n', maxChars);
      if (paragraphEnd > maxChars * 0.5) {
        breakPoint = paragraphEnd + 1;
      } else {
        // Try to find space
        const spaceEnd = remaining.lastIndexOf(' ', maxChars);
        if (spaceEnd > maxChars * 0.5) {
          breakPoint = spaceEnd + 1;
        }
      }
    }

    chunks.push(remaining.substring(0, breakPoint).trim());
    remaining = remaining.substring(breakPoint).trim();
  }

  return chunks;
}

/**
 * Strip HTML tags from text for TTS
 */
export function stripHtmlForTTS(html: string): string {
  return html
    .replaceAll(/<[^>]*>/g, '')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll(/\s+/g, ' ')
    .trim();
}
