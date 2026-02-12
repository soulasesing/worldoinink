'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LiveCharacterInterventionProps {
  intervention: {
    characterId: string;
    characterName: string;
    message: string;
    emotion: string;
    type: string;
  };
  onDismiss: () => void;
  onAcceptSuggestion?: (suggestion: string) => void;
}

const emotionEmojis: Record<string, string> = {
  curious: '🤔',
  worried: '😟',
  excited: '✨',
  annoyed: '😤',
  amused: '😏',
  confused: '🤷',
  determined: '💪',
  sad: '😢',
  angry: '🔥',
  happy: '😊',
  surprised: '😲',
  hopeful: '🌟',
  proud: '👑',
  playful: '😜',
  thoughtful: '🧐',
  default: '💭',
};

export function LiveCharacterIntervention({
  intervention,
  onDismiss,
  onAcceptSuggestion,
}: LiveCharacterInterventionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (intervention) {
      setIsClosing(false);
      setTimeout(() => setIsVisible(true), 50);
    }
  }, [intervention]);

  const handleDismiss = () => {
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(onDismiss, 400);
  };

  if (!intervention) return null;

  const emoji = emotionEmojis[intervention.emotion] || emotionEmojis.default;

  return (
    <>
      {/* Subtle backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px] transition-opacity duration-300 ${
          isVisible && !isClosing ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleDismiss}
      />

      {/* Intervention Popup */}
      <div
        className={`fixed bottom-8 right-8 z-50 w-[400px] transition-all duration-500 ease-out transform ${
          isVisible && !isClosing
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-8 opacity-0 scale-95'
        }`}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl blur-2xl opacity-30 animate-pulse" />
        
        {/* Card */}
        <div className="relative backdrop-blur-2xl bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Animated Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>

          {/* Header */}
          <div className="relative p-5 pb-3">
            <div className="flex items-start justify-between">
              {/* Character Info */}
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-60" />
                  <div className="relative w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-3xl">{emoji}</span>
                  </div>
                  {/* Live indicator */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    {intervention.characterName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span>Personaje Vivo</span>
                  </div>
                </div>
              </div>

              {/* Close */}
              <button
                onClick={handleDismiss}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all hover:rotate-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Message */}
          <div className="px-5 pb-5">
            <div className="relative bg-white/5 rounded-2xl p-4 border border-white/5">
              {/* Quote marks */}
              <div className="absolute -top-2 left-3 text-3xl text-purple-500/30 font-serif">"</div>
              <p className="text-gray-200 text-base leading-relaxed pl-2 italic">
                {intervention.message}
              </p>
              <div className="absolute -bottom-2 right-3 text-3xl text-purple-500/30 font-serif rotate-180">"</div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 pb-5">
            <div className="flex gap-3">
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 rounded-xl"
              >
                Continuar escribiendo
              </Button>
              {onAcceptSuggestion && (
                <Button
                  onClick={() => {
                    // Extract any suggestion from the message
                    onAcceptSuggestion(intervention.message);
                    handleDismiss();
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold rounded-xl"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Tomar nota
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

