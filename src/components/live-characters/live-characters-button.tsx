'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Users, ChevronRight } from 'lucide-react';

interface LiveCharactersButtonProps {
  wordCount: number;
  hasCharacters: boolean;
  charactersCount: number;
  onActivate: () => void;
  onManage: () => void;
}

const MIN_WORDS_FOR_DISCOVERY = 300; // Reducido para testing, normalmente 500

export function LiveCharactersButton({
  wordCount,
  hasCharacters,
  charactersCount,
  onActivate,
  onManage,
}: LiveCharactersButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  // Show button when word count threshold is reached
  useEffect(() => {
    if (wordCount >= MIN_WORDS_FOR_DISCOVERY) {
      setIsVisible(true);
    }
  }, [wordCount]);

  // Stop pulse after first interaction
  useEffect(() => {
    if (hasCharacters) {
      setShowPulse(false);
    }
  }, [hasCharacters]);

  if (!isVisible) return null;

  // If characters already discovered, show manage button
  if (hasCharacters) {
    return (
      <button
        onClick={onManage}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed bottom-24 right-8 z-40 flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-500 ease-out transform ${
          isHovered ? 'scale-105' : 'scale-100'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(236, 72, 153, 0.9) 100%)',
          boxShadow: isHovered 
            ? '0 20px 40px -10px rgba(139, 92, 246, 0.5), 0 0 60px -15px rgba(236, 72, 153, 0.4)'
            : '0 10px 30px -10px rgba(139, 92, 246, 0.3)',
        }}
      >
        {/* Character Avatars Stack */}
        <div className="flex -space-x-2">
          {[...Array(Math.min(charactersCount, 3))].map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-sm"
              style={{ zIndex: 3 - i }}
            >
              {['🎭', '✨', '👤'][i]}
            </div>
          ))}
        </div>
        
        <div className="text-white">
          <div className="text-sm font-bold">{charactersCount} Personajes Vivos</div>
          <div className="text-xs text-white/70">Activos en tu historia</div>
        </div>
        
        <ChevronRight className={`w-5 h-5 text-white/70 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
      </button>
    );
  }

  // First time - show activation button
  return (
    <button
      onClick={onActivate}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-24 right-8 z-40 flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 ease-out transform ${
        isHovered ? 'scale-105' : 'scale-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(147, 51, 234, 0.95) 50%, rgba(236, 72, 153, 0.95) 100%)',
        boxShadow: isHovered 
          ? '0 25px 50px -12px rgba(147, 51, 234, 0.5), 0 0 80px -20px rgba(59, 130, 246, 0.4)'
          : '0 15px 40px -10px rgba(147, 51, 234, 0.35)',
      }}
    >
      {/* Pulse Animation */}
      {showPulse && (
        <div className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-white" />
      )}
      
      {/* Sparkle Icon */}
      <div className="relative">
        <div className="absolute inset-0 bg-white/30 rounded-xl blur-lg animate-pulse" />
        <div className="relative w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </div>
      </div>
      
      {/* Text */}
      <div className="text-left">
        <div className="text-white font-bold text-base">
          ✨ Dar Vida a mis Personajes
        </div>
        <div className="text-white/70 text-sm">
          Tu historia tiene {wordCount} palabras
        </div>
      </div>
      
      {/* Arrow */}
      <ChevronRight className={`w-6 h-6 text-white/70 transition-all duration-300 ${isHovered ? 'translate-x-2 text-white' : ''}`} />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute top-2 left-4 w-2 h-2 bg-white/30 rounded-full animate-float" />
        <div className="absolute bottom-3 right-10 w-1.5 h-1.5 bg-white/40 rounded-full animate-float-delayed" />
        <div className="absolute top-4 right-20 w-1 h-1 bg-white/50 rounded-full animate-float" />
      </div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-10px) scale(1.2); opacity: 0.6; }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
          50% { transform: translateY(-8px) scale(1.1); opacity: 0.7; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite 1s;
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </button>
  );
}

