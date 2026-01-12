'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import type { CharacterIntervention, InterventionSettings } from '@/types/intervention';
import {
  defaultInterventionSettings,
  interventionCooldowns,
  MIN_TEXT_CHANGE,
  CONTEXT_WINDOW,
} from '@/types/intervention';

interface UseCharacterInterventionProps {
  storyId: string | null;
  content: string;
  characterIds: string[];
  enabled?: boolean;
}

interface UseCharacterInterventionReturn {
  currentIntervention: CharacterIntervention | null;
  isAnalyzing: boolean;
  settings: InterventionSettings;
  dismissIntervention: () => void;
  triggerIntervention: () => Promise<void>;
  updateSettings: (settings: Partial<InterventionSettings>) => void;
  interventionHistory: CharacterIntervention[];
}

export function useCharacterIntervention({
  storyId,
  content,
  characterIds,
  enabled = true,
}: UseCharacterInterventionProps): UseCharacterInterventionReturn {
  const [currentIntervention, setCurrentIntervention] = useState<CharacterIntervention | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [settings, setSettings] = useState<InterventionSettings>(defaultInterventionSettings);
  const [interventionHistory, setInterventionHistory] = useState<CharacterIntervention[]>([]);
  
  // Refs for tracking changes
  const lastContentLength = useRef(content.length);
  const lastInterventionTime = useRef(0);
  const analysisTimeout = useRef<NodeJS.Timeout | null>(null);

  // Get recent text for analysis
  const getRecentText = useCallback(() => {
    return content.slice(-CONTEXT_WINDOW);
  }, [content]);

  // Check if intervention is allowed (cooldown)
  const canIntervene = useCallback(() => {
    const now = Date.now();
    const cooldown = interventionCooldowns[settings.frequency];
    return now - lastInterventionTime.current >= cooldown;
  }, [settings.frequency]);

  // Trigger intervention analysis
  const triggerIntervention = useCallback(async () => {
    console.log('[Intervention Hook] triggerIntervention called', {
      storyId,
      enabled,
      settingsEnabled: settings.enabled,
      characterIdsCount: characterIds.length,
      canInterveneResult: canIntervene(),
      isAnalyzing,
    });

    if (!storyId) {
      console.log('[Intervention Hook] ❌ No storyId');
      return;
    }
    if (!enabled || !settings.enabled) {
      console.log('[Intervention Hook] ❌ Disabled');
      return;
    }
    if (characterIds.length === 0) {
      console.log('[Intervention Hook] ❌ No characters');
      return;
    }
    if (!canIntervene()) {
      console.log('[Intervention Hook] ❌ Cooldown active');
      return;
    }
    if (isAnalyzing) {
      console.log('[Intervention Hook] ❌ Already analyzing');
      return;
    }

    try {
      setIsAnalyzing(true);
      console.log('[Intervention Hook] 🚀 Calling API...');

      const response = await fetch('/api/assistant/intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          currentText: content.slice(-2000),
          recentText: getRecentText(),
          characterIds,
        }),
      });

      const data = await response.json();
      console.log('[Intervention Hook] API response:', data);

      if (data.success && data.shouldIntervene && data.intervention) {
        console.log('[Intervention Hook] ✅ Intervention received!', data.intervention);
        setCurrentIntervention(data.intervention);
        setInterventionHistory(prev => [...prev, data.intervention]);
        lastInterventionTime.current = Date.now();
      } else {
        console.log('[Intervention Hook] No intervention triggered');
      }
    } catch (error) {
      console.error('[Intervention Hook] Error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [storyId, enabled, settings.enabled, characterIds, content, canIntervene, getRecentText, isAnalyzing]);

  // Monitor content changes
  useEffect(() => {
    if (!enabled || !settings.enabled) {
      console.log('[Intervention Hook] Monitoring disabled');
      return;
    }
    if (characterIds.length === 0) {
      console.log('[Intervention Hook] No characters to monitor');
      return;
    }

    const contentChange = Math.abs(content.length - lastContentLength.current);
    console.log('[Intervention Hook] Content change detected:', contentChange, 'chars');
    
    // Lower threshold for testing (was MIN_TEXT_CHANGE = 50)
    const threshold = 20;
    
    if (contentChange >= threshold) {
      lastContentLength.current = content.length;
      console.log('[Intervention Hook] ⏰ Scheduling intervention check in 2s...');
      
      if (analysisTimeout.current) {
        clearTimeout(analysisTimeout.current);
      }
      
      analysisTimeout.current = setTimeout(() => {
        // Higher chance for testing (100% for high frequency)
        const triggerChance = {
          low: 0.5,
          medium: 0.8,
          high: 1.0,
        }[settings.frequency];
        
        const random = Math.random();
        console.log('[Intervention Hook] Random check:', random, '< triggerChance:', triggerChance);
        
        if (random < triggerChance && canIntervene()) {
          console.log('[Intervention Hook] ✅ Triggering intervention!');
          triggerIntervention();
        } else {
          console.log('[Intervention Hook] ❌ Random check failed or cooldown');
        }
      }, 2000); // Reduced to 2 seconds for testing
    }

    return () => {
      if (analysisTimeout.current) {
        clearTimeout(analysisTimeout.current);
      }
    };
  }, [content, enabled, settings.enabled, settings.frequency, characterIds, canIntervene, triggerIntervention]);

  // Dismiss current intervention
  const dismissIntervention = useCallback(() => {
    if (currentIntervention) {
      setInterventionHistory(prev =>
        prev.map(i =>
          i.id === currentIntervention.id ? { ...i, dismissed: true } : i
        )
      );
    }
    setCurrentIntervention(null);
  }, [currentIntervention]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<InterventionSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return {
    currentIntervention,
    isAnalyzing,
    settings,
    dismissIntervention,
    triggerIntervention,
    updateSettings,
    interventionHistory,
  };
}

