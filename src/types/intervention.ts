// Types for Character Intervention System

// ============================================
// CONSTANTS
// ============================================

export const MIN_TEXT_CHANGE = 50; // Minimum characters changed to trigger analysis
export const CONTEXT_WINDOW = 500; // Characters to analyze for context

export const interventionCooldowns = {
  low: 5 * 60 * 1000,      // 5 minutes
  medium: 2 * 60 * 1000,   // 2 minutes
  high: 30 * 1000,         // 30 seconds
};

export const defaultInterventionSettings: InterventionSettings = {
  enabled: true,
  frequency: 'medium',
  allowedTypes: ['suggestion', 'question', 'encouragement', 'complaint'],
  notificationStyle: 'popup',
};

// ============================================
// SETTINGS TYPES
// ============================================

export interface InterventionSettings {
  enabled: boolean;
  frequency: 'low' | 'medium' | 'high';
  allowedTypes: Array<'suggestion' | 'complaint' | 'question' | 'encouragement' | 'reaction'>;
  notificationStyle: 'popup' | 'toast' | 'inline';
}

// ============================================
// INTERVENTION DATA TYPES
// ============================================

export interface CharacterIntervention {
  id: string;
  characterId: string;
  characterName: string;
  message: string;
  emotion: string;
  type: 'suggestion' | 'complaint' | 'question' | 'encouragement' | 'reaction';
  intensity: 'subtle' | 'moderate' | 'strong';
  triggerReason: string;
  suggestedActions?: string[];
  timestamp: Date;
  dismissed?: boolean;
}

// ============================================
// CHARACTER TYPES
// ============================================

export interface CharacterPersonality {
  temperament: 'calm' | 'passionate' | 'melancholic' | 'cheerful' | 'mysterious';
  speakingStyle: 'formal' | 'casual' | 'poetic' | 'direct' | 'playful';
  humor: 'none' | 'subtle' | 'sarcastic' | 'witty' | 'dark';
  confidence: 'shy' | 'modest' | 'confident' | 'arrogant';
}

export interface CharacterForIntervention {
  id: string;
  name: string;
  backstory: string;
  traits: string[];
  personality: CharacterPersonality | null;
  voiceTone: string;
  emotionalRange: string[];
  triggerTopics: string[];
  triggerWords: string[];
  interventionEnabled: boolean;
  interventionStyle: 'suggestion' | 'complaint' | 'question' | 'encouragement';
  interventionFrequency: 'low' | 'medium' | 'high';
}

export interface InterventionRequest {
  storyId: string;
  characterId: string;
  currentText: string;      // Last ~500 words of the story
  recentAddition: string;   // What the user just wrote
  storyContext?: string;    // Optional: summary of the story so far
}

export interface InterventionResponse {
  shouldIntervene: boolean;
  intervention?: {
    characterId: string;
    characterName: string;
    message: string;
    emotion: string;           // "curious", "worried", "excited", "annoyed", etc.
    type: 'suggestion' | 'complaint' | 'question' | 'encouragement' | 'reaction';
    intensity: 'subtle' | 'moderate' | 'strong';
    triggerReason: string;     // Why the character intervened
    suggestedActions?: string[]; // Optional actions the author can take
  };
  cooldownUntil?: Date;        // When the character can intervene again
}

export interface InterventionTrigger {
  type: 'topic' | 'word' | 'emotion' | 'action' | 'character_mention';
  match: string;
  confidence: number;
}

// Analysis result for determining if intervention should happen
export interface InterventionAnalysis {
  triggers: InterventionTrigger[];
  relevanceScore: number;      // 0-1, how relevant this is to the character
  emotionalImpact: number;     // 0-1, how emotionally significant
  shouldIntervene: boolean;
  reason: string;
}

// UI Component Props
export interface CharacterInterventionPopupProps {
  intervention: InterventionResponse['intervention'];
  onDismiss: () => void;
  onRespond: (response: string) => void;
  onAcceptSuggestion?: (suggestion: string) => void;
  isVisible: boolean;
}

export interface InterventionSettingsProps {
  character: CharacterForIntervention;
  onUpdate: (settings: Partial<CharacterForIntervention>) => void;
  onToggle: (enabled: boolean) => void;
}

// Monitoring state
export interface InterventionMonitorState {
  isMonitoring: boolean;
  activeCharacters: CharacterForIntervention[];
  lastCheck: Date | null;
  pendingIntervention: InterventionResponse['intervention'] | null;
  cooldowns: Record<string, Date>; // characterId -> cooldown end time
}

// Character voice templates for GPT
export interface CharacterVoiceTemplate {
  systemPrompt: string;
  exampleResponses: string[];
  forbiddenPhrases: string[];
  preferredExpressions: string[];
}

// Intervention history for learning
export interface InterventionHistoryEntry {
  id: string;
  characterId: string;
  storyId: string;
  timestamp: Date;
  triggerText: string;
  intervention: string;
  userResponse: 'accepted' | 'dismissed' | 'responded';
  userFeedback?: 'helpful' | 'annoying' | 'neutral';
}
