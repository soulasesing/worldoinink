'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface CharacterInterventionPopupProps {
  intervention: InterventionData | null;
  onDismiss: () => void;
  onRespond?: (characterId: string, response: string) => void;
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
  default: '💭',
};

const typeGradients: Record<string, string> = {
  suggestion: 'from-blue-600 via-cyan-500 to-teal-400',
  complaint: 'from-orange-600 via-red-500 to-pink-500',
  question: 'from-purple-600 via-violet-500 to-fuchsia-400',
  encouragement: 'from-green-600 via-emerald-500 to-teal-400',
  reaction: 'from-yellow-500 via-amber-400 to-orange-400',
};

const typeBgColors: Record<string, string> = {
  suggestion: 'bg-blue-500/10 border-blue-500/30',
  complaint: 'bg-orange-500/10 border-orange-500/30',
  question: 'bg-purple-500/10 border-purple-500/30',
  encouragement: 'bg-green-500/10 border-green-500/30',
  reaction: 'bg-amber-500/10 border-amber-500/30',
};

const typeLabels: Record<string, string> = {
  suggestion: '💡 Sugerencia',
  complaint: '😤 Queja',
  question: '❓ Pregunta',
  encouragement: '💪 Apoyo',
  reaction: '✨ Reacción',
};

export default function CharacterInterventionPopup({
  intervention,
  onDismiss,
  onRespond,
  onAcceptSuggestion,
}: CharacterInterventionPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (intervention) {
      setIsClosing(false);
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
      setIsExpanded(false);
      setResponseText('');
    }
  }, [intervention]);

  if (!intervention) return null;

  const handleDismiss = () => {
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(onDismiss, 400);
  };

  const handleRespond = () => {
    if (responseText.trim() && onRespond) {
      onRespond(intervention.characterId, responseText);
      setResponseText('');
      handleDismiss();
    }
  };

  const emoji = emotionEmojis[intervention.emotion] || emotionEmojis.default;
  const gradient = typeGradients[intervention.type] || typeGradients.reaction;
  const bgColor = typeBgColors[intervention.type] || typeBgColors.reaction;
  const label = typeLabels[intervention.type] || '✨ Mensaje';

  return (
    <>
      {/* Backdrop blur effect */}
      <div 
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible && !isClosing ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleDismiss}
      />

      {/* Main Popup */}
      <div
        className={`fixed bottom-8 right-8 z-50 w-[420px] transition-all duration-500 ease-out transform ${
          isVisible && !isClosing
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-8 opacity-0 scale-95'
        }`}
      >
        {/* Glow Effect Behind Card */}
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-3xl blur-2xl opacity-30 animate-pulse`} />
        
        {/* Card Container */}
        <div className="relative backdrop-blur-2xl bg-slate-900/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Animated Top Border */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
          </div>

          {/* Header */}
          <div className="relative p-5 pb-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-transparent rounded-full blur-2xl" />
            </div>

            <div className="relative flex items-start justify-between">
              {/* Character Info */}
              <div className="flex items-center gap-4">
                {/* Avatar with Glow */}
                <div className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity`} />
                  <div className={`relative w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform`}>
                    <span className="text-3xl">{emoji}</span>
                  </div>
                  {/* Status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* Name & Type */}
                <div>
                  <h3 className={`text-xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                    {intervention.characterName}
                  </h3>
                  <div className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} border`}>
                    {label}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Message Content */}
          <div className="px-5 pb-4">
            <div className="relative">
              {/* Quote decoration */}
              <div className="absolute -left-1 top-0 text-4xl text-white/10 font-serif">"</div>
              <p className="text-gray-200 text-base leading-relaxed pl-4 italic">
                {intervention.message}
              </p>
              <div className="absolute -right-1 bottom-0 text-4xl text-white/10 font-serif rotate-180">"</div>
            </div>
          </div>

          {/* Suggested Actions */}
          {intervention.suggestedActions && intervention.suggestedActions.length > 0 && (
            <div className="px-5 pb-4">
              <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider font-medium">
                Sugerencias
              </p>
              <div className="flex flex-wrap gap-2">
                {intervention.suggestedActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAcceptSuggestion?.(action)}
                    className={`px-3 py-1.5 text-sm bg-gradient-to-r ${gradient} bg-opacity-10 hover:bg-opacity-20 rounded-lg text-white/80 hover:text-white border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Action Area */}
          <div className="p-5 pt-4">
            {!isExpanded ? (
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsExpanded(true)}
                  className={`flex-1 bg-gradient-to-r ${gradient} hover:opacity-90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]`}
                >
                  <span className="mr-2">💬</span>
                  Responder
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200"
                >
                  Ignorar
                </Button>
              </div>
            ) : (
              <div className="space-y-3 animate-fadeIn">
                <div className="relative">
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder={`Responde a ${intervention.characterName}...`}
                    className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/10 resize-none text-sm transition-all duration-200"
                    rows={2}
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleRespond}
                    disabled={!responseText.trim()}
                    className={`flex-1 bg-gradient-to-r ${gradient} hover:opacity-90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar
                  </Button>
                  <Button
                    onClick={() => setIsExpanded(false)}
                    variant="ghost"
                    className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 rounded-xl"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Trigger Info */}
          <div className="px-5 pb-4">
            <p className="text-gray-600 text-xs text-center">
              <span className="opacity-50">🎭</span> {intervention.triggerReason}
            </p>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
