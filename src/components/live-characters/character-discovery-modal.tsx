'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiscoveredCharacter {
  id: string;
  name: string;
  role: string;
  personality: string;
  avatar: string;
  isActive: boolean;
}

interface CharacterDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string | null;
  storyContent: string;
  onCharactersDiscovered: (characters: DiscoveredCharacter[]) => void;
}

type DiscoveryPhase = 'idle' | 'analyzing' | 'extracting' | 'creating' | 'complete';

const phaseMessages: Record<DiscoveryPhase, string> = {
  idle: 'Preparando análisis...',
  analyzing: '📖 Leyendo tu historia...',
  extracting: '🔍 Detectando personajes...',
  creating: '✨ Dando vida a tus personajes...',
  complete: '🎉 ¡Personajes listos!',
};

const avatarEmojis = ['🧙', '👩‍🔬', '🦸', '👸', '🤴', '🧝', '🧚', '🦹', '👨‍🚀', '👩‍🎨', '🧛', '🧜', '🎭', '👤'];

export function CharacterDiscoveryModal({
  isOpen,
  onClose,
  storyId,
  storyContent,
  onCharactersDiscovered,
}: CharacterDiscoveryModalProps) {
  const [phase, setPhase] = useState<DiscoveryPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [discoveredCharacters, setDiscoveredCharacters] = useState<DiscoveredCharacter[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && phase === 'idle') {
      startDiscovery();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setPhase('idle');
      setProgress(0);
      setDiscoveredCharacters([]);
      setError(null);
    }
  }, [isOpen]);

  const startDiscovery = async () => {
    if (!storyId || !storyContent) {
      setError('Necesitas guardar tu historia primero');
      return;
    }

    setError(null);
    
    try {
      // Phase 1: Analyzing
      setPhase('analyzing');
      setProgress(20);
      await delay(800);
      
      // Phase 2: Extracting
      setPhase('extracting');
      setProgress(40);
      
      // Call API to discover characters
      const response = await fetch('/api/story/discover-characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          content: storyContent,
        }),
      });

      setProgress(70);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al descubrir personajes');
      }

      const data = await response.json();
      
      // Phase 3: Creating
      setPhase('creating');
      setProgress(85);
      await delay(600);
      
      // Add avatars to characters
      const charactersWithAvatars = data.characters.map((char: any, index: number) => ({
        ...char,
        avatar: avatarEmojis[index % avatarEmojis.length],
        isActive: true,
      }));
      
      setDiscoveredCharacters(charactersWithAvatars);
      
      // Phase 4: Complete
      setPhase('complete');
      setProgress(100);
      
    } catch (err) {
      console.error('Discovery error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setPhase('idle');
    }
  };

  const handleConfirm = () => {
    onCharactersDiscovered(discoveredCharacters);
  };

  const toggleCharacter = (id: string) => {
    setDiscoveredCharacters(prev => 
      prev.map(char => 
        char.id === id ? { ...char, isActive: !char.isActive } : char
      )
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Content */}
          <div className="relative p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg">
                {phase === 'complete' ? (
                  <Check className="w-8 h-8 text-white" />
                ) : phase !== 'idle' ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Sparkles className="w-8 h-8 text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {phase === 'complete' ? '¡Personajes Descubiertos!' : 'Descubriendo Personajes'}
              </h2>
              <p className="text-gray-400">
                {phaseMessages[phase]}
              </p>
            </div>
            
            {/* Progress Bar */}
            {phase !== 'complete' && !error && (
              <div className="mb-8">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-300 text-center">{error}</p>
                <Button
                  onClick={startDiscovery}
                  className="mt-4 w-full bg-red-500/20 hover:bg-red-500/30 text-red-300"
                >
                  Reintentar
                </Button>
              </div>
            )}
            
            {/* Discovered Characters */}
            {phase === 'complete' && discoveredCharacters.length > 0 && (
              <div className="space-y-3 mb-8 max-h-64 overflow-y-auto">
                {discoveredCharacters.map((char) => (
                  <div
                    key={char.id}
                    onClick={() => toggleCharacter(char.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                      char.isActive
                        ? 'bg-white/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                        : 'bg-white/5 border-white/10 opacity-60'
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      char.isActive 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                        : 'bg-white/10'
                    }`}>
                      {char.avatar}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white truncate">{char.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                          {char.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{char.personality}</p>
                    </div>
                    
                    {/* Toggle */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      char.isActive 
                        ? 'bg-purple-500 border-purple-500' 
                        : 'border-white/30'
                    }`}>
                      {char.isActive && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* No characters found */}
            {phase === 'complete' && discoveredCharacters.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">
                  No se encontraron personajes claros en tu historia.
                  <br />
                  Intenta agregar más contenido con personajes nombrados.
                </p>
              </div>
            )}
            
            {/* Actions */}
            {phase === 'complete' && discoveredCharacters.length > 0 && (
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  ¡Activar {discoveredCharacters.filter(c => c.isActive).length} Personajes!
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

