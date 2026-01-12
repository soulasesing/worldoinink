'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface InterventionData {
  characterId: string;
  characterName: string;
  message: string;
  emotion: string;
  type: 'suggestion' | 'complaint' | 'question' | 'encouragement' | 'reaction';
  intensity: 'subtle' | 'moderate' | 'strong';
  triggerReason: string;
  suggestedActions?: string[];
}

interface UseInterventionMonitorProps {
  storyId: string | null;
  enabled?: boolean;
  checkInterval?: number;  // How often to check (in ms after typing stops)
  minTextLength?: number;  // Minimum text length to trigger check
}

interface UseInterventionMonitorReturn {
  intervention: InterventionData | null;
  isChecking: boolean;
  dismissIntervention: () => void;
  checkForIntervention: (currentText: string, recentAddition: string) => Promise<void>;
  lastCheckedAt: Date | null;
  isEnabled: boolean;
  toggleEnabled: () => void;
}

export function useInterventionMonitor({
  storyId,
  enabled = true,
  checkInterval = 3000,
  minTextLength = 50,
}: UseInterventionMonitorProps): UseInterventionMonitorReturn {
  const [intervention, setIntervention] = useState<InterventionData | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [isEnabled, setIsEnabled] = useState(enabled);
  
  const lastTextRef = useRef<string>('');
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<Record<string, Date>>({});

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  const checkForIntervention = useCallback(async (
    currentText: string,
    recentAddition: string
  ) => {
    // Guards
    if (!isEnabled || !storyId || currentText.length < minTextLength) {
      return;
    }

    // Don't check if there's already an intervention showing
    if (intervention) {
      return;
    }

    // Don't check if recently checked
    if (lastCheckedAt && Date.now() - lastCheckedAt.getTime() < 5000) {
      return;
    }

    // Calculate what was actually added
    const actualAddition = recentAddition || currentText.slice(-200);
    
    // Skip if addition is too small
    if (actualAddition.length < 20) {
      return;
    }

    try {
      setIsChecking(true);

      const response = await fetch('/api/character/intervene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          currentText: currentText.slice(-2000), // Last 2000 chars for context
          recentAddition: actualAddition,
        }),
      });

      const data = await response.json();

      if (data.success && data.shouldIntervene && data.intervention) {
        // Check character cooldown
        const charId = data.intervention.characterId;
        const cooldownEnd = cooldownRef.current[charId];
        
        if (!cooldownEnd || new Date() > cooldownEnd) {
          setIntervention(data.intervention);
          
          // Set local cooldown (30 seconds)
          cooldownRef.current[charId] = new Date(Date.now() + 30000);
          
          // Play a subtle sound or vibration could go here
          console.log(`[Intervention] ${data.intervention.characterName}: ${data.intervention.message}`);
        }
      }

      setLastCheckedAt(new Date());
    } catch (error) {
      console.error('Error checking for intervention:', error);
    } finally {
      setIsChecking(false);
    }
  }, [isEnabled, storyId, minTextLength, intervention, lastCheckedAt]);

  const dismissIntervention = useCallback(() => {
    setIntervention(null);
  }, []);

  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => {
      const newValue = !prev;
      toast(newValue ? '🎭 Intervenciones activadas' : '🔇 Intervenciones desactivadas', {
        duration: 2000,
      });
      return newValue;
    });
  }, []);

  // Debounced check - call this when user types
  const scheduleCheck = useCallback((currentText: string) => {
    // Clear existing timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    // Calculate what was added since last check
    const recentAddition = currentText.slice(lastTextRef.current.length);
    lastTextRef.current = currentText;

    // Schedule new check
    checkTimeoutRef.current = setTimeout(() => {
      checkForIntervention(currentText, recentAddition);
    }, checkInterval);
  }, [checkInterval, checkForIntervention]);

  return {
    intervention,
    isChecking,
    dismissIntervention,
    checkForIntervention: scheduleCheck,
    lastCheckedAt,
    isEnabled,
    toggleEnabled,
  };
}

export default useInterventionMonitor;

