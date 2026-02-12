'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Users,
  Settings2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  HelpCircle,
  Heart,
  Lightbulb,
  Trash2,
  BookOpen,
  Volume2,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import CharacterEditModal from './character-edit-modal';

// Types
interface CharacterPersonality {
  temperament?: string;
  speakingStyle?: string;
  humor?: string;
  confidence?: string;
  emotionalTendencies?: string[];
}

interface Character {
  id: string;
  name: string;
  backstory: string;
  traits: string[];
  personality: CharacterPersonality | null;
  voiceTone: string;
  emotionalRange: string[];
  triggerTopics: string[];
  triggerWords: string[];
  interventionEnabled: boolean;
  interventionStyle: string;
  interventionFrequency: string;
  totalInterventions: number;
  lastIntervention: string | null;
  stories?: Array<{ id: string; title: string }>; // Optional - may not be included in API response
  createdAt: string;
  updatedAt: string;
}

const interventionStyleIcons: Record<string, React.ReactNode> = {
  suggestion: <Lightbulb className="w-3 h-3" />,
  complaint: <MessageSquare className="w-3 h-3" />,
  question: <HelpCircle className="w-3 h-3" />,
  encouragement: <Heart className="w-3 h-3" />,
};

const interventionStyleLabels: Record<string, string> = {
  suggestion: 'Sugerencias',
  complaint: 'Quejas',
  question: 'Preguntas',
  encouragement: 'Apoyo',
};

const frequencyLabels: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

const frequencyColors: Record<string, string> = {
  low: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function CharacterManager() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load characters on mount (only once)
  useEffect(() => {
    if (!hasLoaded) {
      loadCharacters();
      setHasLoaded(true);
    }
  }, [hasLoaded]);

  const loadCharacters = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/characters');
      
      if (!response.ok) {
        console.error('[CharacterManager] HTTP error:', response.status);
        toast.error('Error de conexión al cargar personajes');
        return;
      }
      
      const data = await response.json();

      // Handle both formats: { success: true, characters: [...] } OR direct array [...]
      if (data.success && Array.isArray(data.characters)) {
        // New format with wrapper
        setCharacters(data.characters);
      } else if (Array.isArray(data)) {
        // Legacy format: direct array
        setCharacters(data);
      } else {
        console.error('[CharacterManager] Invalid response format:', data);
        toast.error(data.error || 'Error al cargar personajes');
      }
    } catch (error) {
      console.error('[CharacterManager] Error loading characters:', error);
      toast.error('Error al cargar personajes');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIntervention = async (character: Character) => {
    try {
      const response = await fetch(`/api/characters/${character.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interventionEnabled: !character.interventionEnabled,
        }),
      });

      if (response.ok) {
        setCharacters((prev) =>
          prev.map((c) =>
            c.id === character.id
              ? { ...c, interventionEnabled: !c.interventionEnabled }
              : c
          )
        );
        toast.success(
          character.interventionEnabled
            ? `${character.name} ahora está en silencio`
            : `${character.name} puede intervenir`
        );
      }
    } catch (error) {
      console.error('Error toggling intervention:', error);
      toast.error('Error al cambiar estado');
    }
  };

  const handleDeleteCharacter = async (character: Character) => {
    if (!confirm(`¿Eliminar a ${character.name}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/characters/${character.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCharacters((prev) => prev.filter((c) => c.id !== character.id));
        toast.success(`${character.name} eliminado`);
      }
    } catch (error) {
      console.error('Error deleting character:', error);
      toast.error('Error al eliminar personaje');
    }
  };

  const handleCharacterUpdated = (updatedCharacter: Character) => {
    setCharacters((prev) =>
      prev.map((c) => (c.id === updatedCharacter.id ? updatedCharacter : c))
    );
    setEditingCharacter(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Cargando personajes...</p>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Sin personajes aún
        </h3>
        <p className="text-gray-400 text-sm mb-6 max-w-xs">
          Los personajes aparecerán aquí cuando uses "Dar Vida a mis Personajes" en el editor.
        </p>
        <Button
          onClick={loadCharacters}
          variant="ghost"
          className="text-indigo-400 hover:text-indigo-300"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span className="text-sm text-gray-400">
            {characters.length} personaje{characters.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Button
          onClick={loadCharacters}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Character List */}
      <div className="space-y-3">
        {characters.map((character) => (
          <div
            key={character.id}
            className={`rounded-xl border transition-all duration-200 ${
              character.interventionEnabled
                ? 'bg-white/5 border-white/10 hover:border-indigo-500/30'
                : 'bg-white/[0.02] border-white/5 opacity-60'
            }`}
          >
            {/* Main Row */}
            <div className="p-4">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                    character.interventionEnabled
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                      : 'bg-white/10 text-gray-500'
                  }`}
                >
                  {character.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white truncate">
                      {character.name}
                    </h4>
                    {character.totalInterventions > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {character.totalInterventions} 💬
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {(character.stories?.length ?? 0) > 0 && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {character.stories?.length ?? 0} historia{(character.stories?.length ?? 0) !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Toggle & Expand */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleIntervention(character)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    title={character.interventionEnabled ? 'Desactivar' : 'Activar'}
                  >
                    {character.interventionEnabled ? (
                      <ToggleRight className="w-5 h-5 text-green-400" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === character.id ? null : character.id)
                    }
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {expandedId === character.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === character.id && (
              <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                {/* Backstory */}
                {character.backstory && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Personalidad</p>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {character.backstory}
                    </p>
                  </div>
                )}

                {/* Traits */}
                {character.traits.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Rasgos</p>
                    <div className="flex flex-wrap gap-1">
                      {character.traits.map((trait, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Intervention Settings */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Style */}
                  <div className="flex items-center gap-1.5 text-xs bg-white/5 px-2 py-1 rounded-lg">
                    {interventionStyleIcons[character.interventionStyle]}
                    <span className="text-gray-400">
                      {interventionStyleLabels[character.interventionStyle]}
                    </span>
                  </div>

                  {/* Frequency */}
                  <div
                    className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border ${
                      frequencyColors[character.interventionFrequency]
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    {frequencyLabels[character.interventionFrequency]}
                  </div>

                  {/* Voice */}
                  <div className="flex items-center gap-1.5 text-xs bg-white/5 px-2 py-1 rounded-lg text-gray-400">
                    <Volume2 className="w-3 h-3" />
                    {character.voiceTone}
                  </div>
                </div>

                {/* Triggers */}
                {(character.triggerWords.length > 0 || character.triggerTopics.length > 0) && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Triggers</p>
                    <div className="flex flex-wrap gap-1">
                      {character.triggerWords.slice(0, 5).map((word, idx) => (
                        <span
                          key={`w-${idx}`}
                          className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        >
                          "{word}"
                        </span>
                      ))}
                      {character.triggerTopics.slice(0, 3).map((topic, idx) => (
                        <span
                          key={`t-${idx}`}
                          className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stories */}
                {(character.stories?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">En historias</p>
                    <div className="flex flex-wrap gap-1">
                      {character.stories?.map((story) => (
                        <span
                          key={story.id}
                          className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400"
                        >
                          {story.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => setEditingCharacter(character)}
                    size="sm"
                    className="flex-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30"
                  >
                    <Settings2 className="w-3 h-3 mr-1.5" />
                    Configurar
                  </Button>
                  <Button
                    onClick={() => handleDeleteCharacter(character)}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingCharacter && (
        <CharacterEditModal
          character={editingCharacter}
          onClose={() => setEditingCharacter(null)}
          onSave={handleCharacterUpdated}
        />
      )}
    </div>
  );
}
