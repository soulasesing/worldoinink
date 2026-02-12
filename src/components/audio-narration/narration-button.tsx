'use client';

import { useState, useEffect } from 'react';
import { AudioLines, X, Mic, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NarrationButtonProps {
  readonly onNarrateAll: () => void;
  readonly onNarrateSelection: () => void;
  readonly hasSelection: boolean;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}

export default function NarrationButton({
  onNarrateAll,
  onNarrateSelection,
  hasSelection,
  isOpen,
  onToggle,
}: NarrationButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showSelectionHint, setShowSelectionHint] = useState(false);

  // Show hint when user selects text
  useEffect(() => {
    if (hasSelection && !isOpen) {
      setShowSelectionHint(true);
      const timer = setTimeout(() => setShowSelectionHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [hasSelection, isOpen]);

  return (
    <div className="fixed bottom-44 right-6 z-50 flex flex-col items-end gap-3">
      {/* Selection hint bubble */}
      {showSelectionHint && !isOpen && (
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/90 backdrop-blur-sm rounded-full text-white text-sm font-medium animate-bounce shadow-lg shadow-purple-500/30">
          <Sparkles className="w-4 h-4" />
          <span>¡Puedes narrar la selección!</span>
        </div>
      )}

      {/* Expanded menu */}
      <div
        className={cn(
          'flex flex-col gap-2 transition-all duration-300 origin-bottom-right',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-75 translate-y-4 pointer-events-none'
        )}
      >
        {/* Narrate selection button */}
        <button
          onClick={onNarrateSelection}
          disabled={!hasSelection}
          className={cn(
            'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
            'bg-slate-800/95 backdrop-blur-xl border shadow-xl',
            hasSelection
              ? 'border-purple-500/50 hover:bg-slate-700/95 hover:border-purple-400 hover:scale-[1.02] cursor-pointer'
              : 'border-slate-600/50 opacity-60 cursor-not-allowed'
          )}
        >
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300',
            hasSelection
              ? 'bg-gradient-to-br from-pink-500 to-purple-500'
              : 'bg-slate-700'
          )}>
            <Mic className={cn(
              'w-5 h-5 transition-colors duration-300',
              hasSelection ? 'text-white' : 'text-gray-400'
            )} />
          </div>
          <div className="text-left">
            <p className="text-white text-sm font-medium">Narrar selección</p>
            <p className={cn(
              'text-xs transition-colors duration-300',
              hasSelection ? 'text-purple-300' : 'text-gray-400'
            )}>
              {hasSelection ? '✨ Texto listo para narrar' : 'Selecciona texto primero'}
            </p>
          </div>
        </button>

        {/* Narrate all button */}
        <button
          onClick={onNarrateAll}
          className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
            bg-slate-800/95 backdrop-blur-xl border border-blue-500/50 shadow-xl
            hover:bg-slate-700/95 hover:border-blue-400 hover:scale-[1.02]"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center transition-all duration-300 group-hover:from-blue-400 group-hover:to-purple-400">
            <BookOpen className="w-5 h-5 text-white transition-colors duration-300" />
          </div>
          <div className="text-left">
            <p className="text-white text-sm font-medium">Narrar historia completa</p>
            <p className="text-blue-300 text-xs">Convierte toda tu historia en audio</p>
          </div>
        </button>
      </div>

      {/* Main floating button */}
      <button
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'relative w-14 h-14 rounded-full transition-all duration-300',
          'flex items-center justify-center shadow-xl',
          isOpen
            ? 'bg-white/20 backdrop-blur-xl border border-white/20 rotate-0'
            : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105'
        )}
      >
        {/* Pulse animation when not open */}
        {!isOpen && (
          <>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-ping opacity-20" />
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-md opacity-50" />
          </>
        )}

        {isOpen ? (
          <X className="w-6 h-6 text-white transition-transform duration-300 relative z-10" />
        ) : (
          <AudioLines className="w-6 h-6 text-white transition-transform duration-300 relative z-10" />
        )}

        {/* Tooltip */}
        {!isOpen && isHovered && (
          <div className="absolute right-full mr-3 px-3 py-2 bg-slate-800/95 backdrop-blur-sm rounded-xl whitespace-nowrap border border-white/10 shadow-xl">
            <p className="text-white text-sm font-medium">🎧 Narración de audio</p>
            <p className="text-gray-400 text-xs mt-0.5">Escucha tu historia</p>
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1 w-2 h-2 bg-slate-800 rotate-45 border-r border-t border-white/10" />
          </div>
        )}

        {/* Selection indicator dot */}
        {hasSelection && !isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full border-2 border-slate-900 flex items-center justify-center animate-pulse">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        )}
      </button>

      {/* Keyframe styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
