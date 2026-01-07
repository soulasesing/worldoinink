// Types for Writing Style Analysis System

export interface WritingStyleProfile {
  id: string;
  userId: string;
  
  // Basic Analysis
  narrativeVoice: 'first-person' | 'second-person' | 'third-person-limited' | 'third-person-omniscient';
  preferredTense: 'past' | 'present' | 'future' | 'mixed';
  
  // Style Metrics
  avgSentenceLength: number;
  avgParagraphLength: number;
  vocabularyLevel: 'basic' | 'intermediate' | 'advanced' | 'literary';
  
  // Tone and Voice
  dominantTones: string[];
  writingPace: 'fast' | 'moderate' | 'slow' | 'variable';
  descriptiveDensity: 'sparse' | 'moderate' | 'rich' | 'very-rich';
  
  // Unique Patterns
  signaturePhrases: Record<string, number>;
  favoriteWords: Record<string, number>;
  avoidedWords: string[];
  
  // Dialogue Style
  dialogueStyle: 'natural' | 'formal' | 'dialectal' | 'minimalist' | 'expressive';
  dialogueFrequency: number; // 0-100
  
  // Comparisons
  similarAuthors: Array<{
    name: string;
    similarity: number;
    reason?: string;
  }>;
  literaryMovement?: string;
  
  // Metadata
  analyzedStories: number;
  totalWordsAnalyzed: number;
  confidence: number; // 0-1
  lastAnalyzed: Date;
  isActive: boolean;
  
  // Relations
  styleExamples?: StyleExampleData[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface StyleExampleData {
  id: string;
  styleId: string;
  text: string;
  context?: string;
  storyTitle?: string;
  exampleType: ExampleType;
  wordCount: number;
  relevanceScore: number;
  createdAt: Date;
}

export type ExampleType = 
  | 'NARRATIVE_VOICE'
  | 'DESCRIPTIVE'
  | 'DIALOGUE'
  | 'EMOTIONAL'
  | 'SIGNATURE_STYLE'
  | 'OPENING'
  | 'TRANSITION';

// Analysis Request/Response Types

export interface StyleAnalysisRequest {
  userId: string;
  forceReanalyze?: boolean;
  minStories?: number;
}

export interface StyleAnalysisResponse {
  success: boolean;
  profile?: WritingStyleProfile;
  error?: string;
  message?: string;
  needsMoreData?: {
    currentStories: number;
    currentWords: number;
    minStoriesNeeded: number;
    minWordsNeeded: number;
  };
}

export interface StyleGenerationRequest {
  userId: string;
  context: string;
  prompt: string;
  maxLength?: number;
  temperature?: number;
}

export interface StyleGenerationResponse {
  success: boolean;
  generatedText?: string;
  error?: string;
  usedStyle: boolean;
  styleConfidence?: number;
}

// Internal Analysis Types

export interface TextAnalysisMetrics {
  totalWords: number;
  totalSentences: number;
  totalParagraphs: number;
  avgWordsPerSentence: number;
  avgSentencesPerParagraph: number;
  uniqueWords: number;
  vocabularyRichness: number; // uniqueWords / totalWords
}

export interface NarrativeVoiceAnalysis {
  voice: WritingStyleProfile['narrativeVoice'];
  confidence: number;
  examples: string[];
  indicators: {
    firstPersonCount: number;
    secondPersonCount: number;
    thirdPersonCount: number;
  };
}

export interface TenseAnalysis {
  tense: WritingStyleProfile['preferredTense'];
  confidence: number;
  distribution: {
    past: number;
    present: number;
    future: number;
  };
}

export interface PatternAnalysis {
  phrases: Array<{
    text: string;
    count: number;
    positions: number[];
  }>;
  words: Array<{
    word: string;
    count: number;
    frequency: number;
  }>;
}

export interface ToneAnalysis {
  tones: string[];
  confidence: number;
  emotionalArc: Array<{
    position: number;
    tone: string;
    intensity: number;
  }>;
}

export interface DialogueAnalysis {
  style: WritingStyleProfile['dialogueStyle'];
  frequency: number;
  avgDialogueLength: number;
  patterns: {
    usesDialogueTags: boolean;
    prefersActionBeats: boolean;
    dialectVariations: boolean;
  };
}

export interface AuthorComparison {
  name: string;
  similarity: number;
  matchingFeatures: string[];
  differingFeatures: string[];
}

// Complete Analysis Result

export interface CompleteStyleAnalysis {
  textMetrics: TextAnalysisMetrics;
  narrativeVoice: NarrativeVoiceAnalysis;
  tenseAnalysis: TenseAnalysis;
  patterns: PatternAnalysis;
  tones: ToneAnalysis;
  dialogue: DialogueAnalysis;
  comparisons: AuthorComparison[];
  examples: Array<{
    text: string;
    type: ExampleType;
    score: number;
  }>;
  overallConfidence: number;
}

// UI Component Types

export interface StyleMetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export interface StyleDashboardProps {
  userId: string;
  profile?: WritingStyleProfile;
  isLoading?: boolean;
  onAnalyze?: () => void;
  onRefresh?: () => void;
}

export interface StyleAwareAssistantProps {
  onGenerate: (prompt: string, context: string) => Promise<string>;
  isGenerating: boolean;
  styleEnabled: boolean;
  onToggleStyle: () => void;
}

// Settings Types

export interface StylePreferences {
  autoAnalyze: boolean; // Auto-analizar cuando hay nuevas historias
  notifyOnComplete: boolean; // Notificar cuando el análisis termina
  includeInGeneration: boolean; // Usar estilo en generación de IA
  privacyMode: 'private' | 'anonymous' | 'public'; // Compartir análisis
  compareWithAuthors: boolean; // Comparar con autores conocidos
}

// Error Types

export type StyleAnalysisError = 
  | 'INSUFFICIENT_DATA'
  | 'ANALYSIS_FAILED'
  | 'OPENAI_ERROR'
  | 'DATABASE_ERROR'
  | 'UNAUTHORIZED'
  | 'RATE_LIMIT_EXCEEDED';

export interface StyleError {
  type: StyleAnalysisError;
  message: string;
  details?: Record<string, unknown>;
}

