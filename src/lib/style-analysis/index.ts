// Style Analysis Module Exports

export {
  stripHtml,
  splitIntoSentences,
  splitIntoParagraphs,
  splitIntoWords,
  countWords,
  calculateBasicMetrics,
  detectNarrativeVoice,
  detectPreferredTense,
  analyzeDialogue,
  findCommonPhrases,
  findFavoriteWords,
  assessVocabularyLevel,
  extractRepresentativeExamples,
} from './text-processor';

export type { BasicMetrics, VoiceIndicators } from './text-processor';

export {
  analyzeStyleWithAI,
  generateInUserStyle,
  suggestStyleImprovements,
  quickStyleAnalysis,
} from './ai-analyzer';

export {
  checkAnalysisEligibility,
  analyzeUserStyle,
  getUserStyleProfile,
  deleteUserStyleProfile,
} from './style-service';

