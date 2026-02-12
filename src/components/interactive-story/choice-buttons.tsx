'use client';

import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Choice } from '@/types/interactive';

interface ChoiceButtonsProps {
  choices: Choice[];
  onChoose: (choice: Choice) => void;
  disabled?: boolean;
}

// Premium gradient presets
const gradients = [
  'from-emerald-500 to-teal-500',
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-orange-500 to-amber-500',
  'from-rose-500 to-pink-500',
  'from-indigo-500 to-violet-500',
];

const shadowColors = [
  'shadow-emerald-500/20',
  'shadow-purple-500/20',
  'shadow-blue-500/20',
  'shadow-orange-500/20',
  'shadow-rose-500/20',
  'shadow-indigo-500/20',
];

export function ChoiceButtons({ choices, onChoose, disabled }: ChoiceButtonsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleChoose = async (choice: Choice) => {
    if (disabled || isTransitioning) return;
    
    setSelectedId(choice.id);
    setIsTransitioning(true);

    // Record the choice (fire and forget)
    fetch(`/api/stories/temp/choices/${choice.id}`, {
      method: 'POST',
    }).catch(() => {});

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 600));
    
    onChoose(choice);
    
    // Reset after transition
    setTimeout(() => {
      setSelectedId(null);
      setIsTransitioning(false);
    }, 100);
  };

  if (choices.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Choice buttons */}
      <div className="grid gap-4">
        {choices.map((choice, index) => {
          const isSelected = selectedId === choice.id;
          const gradient = gradients[index % gradients.length];
          const shadowColor = shadowColors[index % shadowColors.length];
          
          return (
            <button
              key={choice.id}
              onClick={() => handleChoose(choice)}
              disabled={disabled || isTransitioning}
              className={`
                group relative w-full text-left
                transition-all duration-500 ease-out
                ${isSelected 
                  ? 'scale-[1.02]' 
                  : 'hover:scale-[1.01]'
                }
                ${disabled || isTransitioning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Card Container */}
              <div className={`
                relative overflow-hidden rounded-2xl
                bg-white/5 backdrop-blur-sm
                border border-white/10
                transition-all duration-300
                ${isSelected 
                  ? `border-transparent shadow-xl ${shadowColor}` 
                  : 'hover:bg-white/10 hover:border-white/20'
                }
              `}>
                {/* Gradient overlay on select */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r ${gradient}
                  transition-opacity duration-500
                  ${isSelected ? 'opacity-20' : 'opacity-0'}
                `} />
                
                {/* Content */}
                <div className="relative p-6 flex items-center gap-5">
                  {/* Emoji or Number */}
                  <div className={`
                    w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                    transition-all duration-300
                    ${isSelected 
                      ? `bg-gradient-to-br ${gradient} shadow-lg ${shadowColor}` 
                      : 'bg-white/10 group-hover:bg-white/20'
                    }
                  `}>
                    {choice.emoji ? (
                      <span className={`
                        text-2xl transition-transform duration-300
                        ${isSelected ? 'scale-110' : 'group-hover:scale-110'}
                      `}>
                        {choice.emoji}
                      </span>
                    ) : (
                      <span className={`
                        text-xl font-bold transition-colors duration-300
                        ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                      `}>
                        {index + 1}
                      </span>
                    )}
                  </div>
                  
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`
                      text-lg sm:text-xl font-medium leading-relaxed
                      transition-colors duration-300
                      ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}
                    `}>
                      {choice.text}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className={`
                    flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${isSelected 
                      ? `bg-gradient-to-r ${gradient} translate-x-1` 
                      : 'bg-white/5 group-hover:bg-white/10 group-hover:translate-x-1'
                    }
                  `}>
                    <ArrowRight className={`
                      w-5 h-5 transition-colors duration-300
                      ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                    `} />
                  </div>
                </div>

                {/* Selection sparkle effect */}
                {isSelected && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-4 left-8 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    <div className="absolute top-6 right-16 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '150ms' }} />
                    <div className="absolute bottom-5 left-20 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '300ms' }} />
                    <div className="absolute bottom-4 right-24 w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDelay: '100ms' }} />
                  </div>
                )}

                {/* Gradient border on hover/select */}
                <div className={`
                  absolute inset-0 rounded-2xl pointer-events-none
                  transition-opacity duration-300
                  ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
                `}>
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradient} opacity-30`} 
                    style={{ 
                      WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude',
                      padding: '2px'
                    }} 
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Hint text */}
      <p className="text-center text-sm text-gray-500 mt-6">
        <Sparkles className="w-4 h-4 inline-block mr-1 text-emerald-500" />
        Tu elección determinará el destino de la historia
      </p>
    </div>
  );
}

export default ChoiceButtons;
