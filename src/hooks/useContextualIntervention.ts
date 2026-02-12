'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface LiveCharacter {
  id: string;
  name: string;
  role: string;
  personality: string;
  avatar: string;
  isActive: boolean;
}

interface Intervention {
  characterId: string;
  characterName: string;
  message: string;
  emotion: string;
  type: 'observation' | 'suggestion' | 'question' | 'reaction';
}

interface UseContextualInterventionProps {
  storyContent: string;
  characters: LiveCharacter[];
  storyId: string | null;
  isEnabled: boolean;
}

interface UseContextualInterventionReturn {
  currentIntervention: Intervention | null;
  dismissIntervention: () => void;
  triggerManualIntervention: (characterId?: string) => Promise<void>;
  isChecking: boolean;
  lastCheck: Date | null;
}

// Configuration
const MIN_WORDS_BETWEEN_CHECKS = 50;
const MIN_TIME_BETWEEN_CHECKS = 60000; // 1 minute
const INTERVENTION_CHANCE = 0.4; // 40% chance of intervention when conditions are met

export function useContextualIntervention({
  storyContent,
  characters,
  storyId,
  isEnabled,
}: UseContextualInterventionProps): UseContextualInterventionReturn {
  const [currentIntervention, setCurrentIntervention] = useState<Intervention | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Refs for tracking changes
  const lastWordCount = useRef(0);
  const lastCheckTime = useRef(0);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousContent = useRef('');

  // Get active characters
  const activeCharacters = characters.filter(c => c.isActive);

  // Calculate word count
  const getWordCount = useCallback((text: string): number => {
    return text.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length;
  }, []);

  // Check if enough has changed to warrant an intervention check
  const shouldCheckForIntervention = useCallback((): boolean => {
    if (!isEnabled || activeCharacters.length === 0 || !storyId) {
      return false;
    }

    const currentWordCount = getWordCount(storyContent);
    const wordDiff = currentWordCount - lastWordCount.current;
    const timeDiff = Date.now() - lastCheckTime.current;

    // Need at least MIN_WORDS_BETWEEN_CHECKS new words and MIN_TIME_BETWEEN_CHECKS passed
    return wordDiff >= MIN_WORDS_BETWEEN_CHECKS && timeDiff >= MIN_TIME_BETWEEN_CHECKS;
  }, [isEnabled, activeCharacters.length, storyId, storyContent, getWordCount]);

  // Extract recent addition to the story
  const getRecentAddition = useCallback((): string => {
    const currentClean = storyContent.replace(/<[^>]*>/g, '').trim();
    const previousClean = previousContent.current.replace(/<[^>]*>/g, '').trim();
    
    if (currentClean.length <= previousClean.length) {
      return '';
    }

    // Try to find what was added
    const additionStart = currentClean.indexOf(previousClean);
    if (additionStart === 0) {
      return currentClean.substring(previousClean.length).trim();
    }

    // If structure changed, return last portion
    const words = currentClean.split(/\s+/);
    const recentWords = words.slice(-100).join(' ');
    return recentWords;
  }, [storyContent]);

  // Call API to check for contextual intervention
  const checkForIntervention = useCallback(async () => {
    if (!shouldCheckForIntervention() || currentIntervention) {
      return;
    }

    // Random chance check to avoid constant interventions
    if (Math.random() > INTERVENTION_CHANCE) {
      // Update tracking but don't check
      lastWordCount.current = getWordCount(storyContent);
      lastCheckTime.current = Date.now();
      previousContent.current = storyContent;
      return;
    }

    setIsChecking(true);
    
    try {
      const recentAddition = getRecentAddition();
      
      // Pick a random active character
      const character = activeCharacters[Math.floor(Math.random() * activeCharacters.length)];
      
      console.log('[Contextual Intervention] Checking for intervention by:', character.name);

      const response = await fetch('/api/assistant/contextual-intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          characterId: character.id,
          characterName: character.name,
          characterPersonality: character.personality,
          storyContent: storyContent.substring(Math.max(0, storyContent.length - 5000)), // Last 5000 chars
          recentAddition: recentAddition.substring(0, 1000), // Last 1000 chars of addition
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.shouldIntervene && data.intervention) {
          console.log('[Contextual Intervention] Intervention triggered:', data.intervention.type);
          setCurrentIntervention({
            characterId: character.id,
            characterName: character.name,
            message: data.intervention.message,
            emotion: data.intervention.emotion,
            type: data.intervention.type,
          });
        } else {
          console.log('[Contextual Intervention] No intervention needed');
        }
      }

      // Update tracking
      lastWordCount.current = getWordCount(storyContent);
      lastCheckTime.current = Date.now();
      previousContent.current = storyContent;
      setLastCheck(new Date());
    } catch (error) {
      console.error('[Contextual Intervention] Error:', error);
    } finally {
      setIsChecking(false);
    }
  }, [
    shouldCheckForIntervention,
    currentIntervention,
    getWordCount,
    storyContent,
    getRecentAddition,
    activeCharacters,
    storyId,
  ]);

  // Debounced check for intervention
  useEffect(() => {
    if (!isEnabled || activeCharacters.length === 0) return;

    // Clear existing timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    // Set new timeout to check after user stops typing
    checkTimeoutRef.current = setTimeout(() => {
      checkForIntervention();
    }, 3000); // Wait 3 seconds after last change

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [storyContent, isEnabled, activeCharacters.length, checkForIntervention]);

  // Initialize tracking on mount
  useEffect(() => {
    if (storyContent) {
      lastWordCount.current = getWordCount(storyContent);
      previousContent.current = storyContent;
      lastCheckTime.current = Date.now();
    }
  }, []); // Only on mount

  // Dismiss intervention
  const dismissIntervention = useCallback(() => {
    setCurrentIntervention(null);
  }, []);

  // Manual intervention trigger
  const triggerManualIntervention = useCallback(async (characterId?: string) => {
    if (!storyId || activeCharacters.length === 0) return;

    setIsChecking(true);

    try {
      const character = characterId
        ? activeCharacters.find(c => c.id === characterId)
        : activeCharacters[Math.floor(Math.random() * activeCharacters.length)];

      if (!character) return;

      const response = await fetch('/api/assistant/contextual-intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          characterId: character.id,
          characterName: character.name,
          characterPersonality: character.personality,
          storyContent: storyContent.substring(Math.max(0, storyContent.length - 5000)),
          forceIntervention: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.intervention) {
          setCurrentIntervention({
            characterId: character.id,
            characterName: character.name,
            message: data.intervention.message,
            emotion: data.intervention.emotion,
            type: data.intervention.type,
          });
        }
      }
    } catch (error) {
      console.error('[Contextual Intervention] Manual trigger error:', error);
    } finally {
      setIsChecking(false);
    }
  }, [storyId, activeCharacters, storyContent]);

  return {
    currentIntervention,
    dismissIntervention,
    triggerManualIntervention,
    isChecking,
    lastCheck,
  };
}

