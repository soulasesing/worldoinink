'use client';

import { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Settings, 
  Volume2, 
  VolumeX, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
  MessageSquare,
  Eye,
  EyeOff,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LiveCharacter {
  id: string;
  name: string;
  role: string;
  personality: string;
  avatar: string;
  isActive: boolean;
  lastIntervention?: string;
  interventionCount?: number;
}

interface LiveCharactersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  characters: LiveCharacter[];
  onToggleCharacter: (characterId: string) => void;
  onRefreshCharacters: () => void;
  onTriggerIntervention?: (characterId?: string) => Promise<void>;
  isRefreshing?: boolean;
}

const roleLabels: Record<string, { label: string; color: string }> = {
  protagonist: { label: 'Protagonista', color: 'from-amber-500 to-orange-500' },
  antagonist: { label: 'Antagonista', color: 'from-red-500 to-rose-500' },
  supporting: { label: 'Secundario', color: 'from-blue-500 to-cyan-500' },
  mentioned: { label: 'Mencionado', color: 'from-gray-500 to-slate-500' },
  character: { label: 'Personaje', color: 'from-purple-500 to-pink-500' },
};

export function LiveCharactersPanel({
  isOpen,
  onClose,
  characters,
  onToggleCharacter,
  onRefreshCharacters,
  onTriggerIntervention,
  isRefreshing = false,
}: LiveCharactersPanelProps) {
  const [expandedCharacter, setExpandedCharacter] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  
  const activeCount = characters.filter(c => c.isActive).length;
  
  const handleTriggerIntervention = async (characterId?: string) => {
    if (!onTriggerIntervention) return;
    setIsTriggering(true);
    try {
      await onTriggerIntervention(characterId);
    } finally {
      setIsTriggering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[380px] bg-slate-900/98 border-l border-white/10 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 border-b border-white/10">
          {/* Animated gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Personajes Vivos</h2>
                  <p className="text-sm text-gray-400">
                    {activeCount} de {characters.length} activos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onRefreshCharacters}
                  disabled={isRefreshing}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50"
                  title="Redescubrir personajes"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Characters List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {characters.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400 mb-4">No hay personajes descubiertos aún</p>
              <Button
                onClick={onRefreshCharacters}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Descubrir Personajes
              </Button>
            </div>
          ) : (
            characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                isExpanded={expandedCharacter === character.id}
                onToggleExpand={() => 
                  setExpandedCharacter(
                    expandedCharacter === character.id ? null : character.id
                  )
                }
                onToggleActive={() => onToggleCharacter(character.id)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {characters.length > 0 && (
          <div className="border-t border-white/10 p-4 bg-white/5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>Los personajes activos pueden interrumpirte</span>
              </div>
            </div>
            
            {/* Manual intervention trigger */}
            {onTriggerIntervention && activeCount > 0 && (
              <Button
                onClick={() => handleTriggerIntervention()}
                disabled={isTriggering}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold"
              >
                {isTriggering ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Invocando personaje...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Invocar intervención ahora
                  </>
                )}
              </Button>
            )}
          </div>
        )}
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

// Character Card Component
interface CharacterCardProps {
  character: LiveCharacter;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleActive: () => void;
}

function CharacterCard({
  character,
  isExpanded,
  onToggleExpand,
  onToggleActive,
}: CharacterCardProps) {
  const roleInfo = roleLabels[character.role] || roleLabels.character;

  return (
    <div
      className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${
        character.isActive
          ? 'bg-white/10 border-purple-500/30 shadow-lg shadow-purple-500/5'
          : 'bg-white/5 border-white/10 opacity-70'
      }`}
    >
      {/* Main Content */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
              character.isActive
                ? `bg-gradient-to-br ${roleInfo.color}`
                : 'bg-white/10'
            }`}>
              {character.avatar}
            </div>
            {character.isActive && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-bold truncate ${
                character.isActive ? 'text-white' : 'text-gray-400'
              }`}>
                {character.name}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${roleInfo.color} text-white`}>
                {roleInfo.label}
              </span>
            </div>
            <p className="text-sm text-gray-400 truncate">
              {character.personality}
            </p>
          </div>

          {/* Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive();
            }}
            className={`p-2 rounded-lg transition-all ${
              character.isActive
                ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-400'
            }`}
            title={character.isActive ? 'Desactivar' : 'Activar'}
          >
            {character.isActive ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>

          {/* Expand */}
          <button
            onClick={onToggleExpand}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 animate-fadeIn">
          <div className="h-px bg-white/10" />
          
          {/* Full Personality */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Personalidad</p>
            <p className="text-sm text-gray-300">{character.personality}</p>
          </div>

          {/* Stats */}
          {(character.interventionCount !== undefined || character.lastIntervention) && (
            <div className="flex gap-4">
              {character.interventionCount !== undefined && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Intervenciones</p>
                  <p className="text-sm text-white font-semibold">{character.interventionCount}</p>
                </div>
              )}
              {character.lastIntervention && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Última intervención</p>
                  <p className="text-sm text-gray-300">{character.lastIntervention}</p>
                </div>
              )}
            </div>
          )}

          {/* Quick actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onToggleActive();
              }}
              variant="ghost"
              size="sm"
              className={`flex-1 text-xs ${
                character.isActive
                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                  : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
              }`}
            >
              {character.isActive ? (
                <>
                  <VolumeX className="w-3 h-3 mr-1" />
                  Silenciar
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3 mr-1" />
                  Activar voz
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

