'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  Plus,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import CharacterEditModal from '@/components/assistant/character-edit-modal';

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
  suggestion: <Lightbulb className="w-4 h-4" />,
  complaint: <MessageSquare className="w-4 h-4" />,
  question: <HelpCircle className="w-4 h-4" />,
  encouragement: <Heart className="w-4 h-4" />,
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

export default function CharactersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load characters on mount
  useEffect(() => {
    if (session?.user) {
      loadCharacters();
    }
  }, [session]);

  const loadCharacters = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/characters');
      
      if (!response.ok) {
        toast.error('Error de conexión');
        return;
      }
      
      const data = await response.json();

      // Handle both formats: { success: true, characters: [...] } OR direct array [...]
      if (data.success && Array.isArray(data.characters)) {
        setCharacters(data.characters);
      } else if (Array.isArray(data)) {
        // Legacy format: direct array
        setCharacters(data);
      } else {
        toast.error(data.error || 'Error al cargar personajes');
      }
    } catch (error) {
      console.error('Error loading characters:', error);
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

  // Filter characters by search query
  const filteredCharacters = characters.filter((char) =>
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.backstory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Cargando personajes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Mis Personajes
            </h1>
            <p className="text-gray-400">
              Gestiona los personajes que cobran vida en tus historias
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={loadCharacters}
              variant="ghost"
              className="text-gray-400 hover:text-white border border-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar personaje..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{characters.length}</p>
                <p className="text-gray-400 text-sm">Personajes</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {characters.filter(c => c.interventionEnabled).length}
                </p>
                <p className="text-gray-400 text-sm">Activos</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {characters.reduce((sum, c) => sum + c.totalInterventions, 0)}
                </p>
                <p className="text-gray-400 text-sm">Intervenciones</p>
              </div>
            </div>
          </div>
        </div>

        {/* Characters Grid */}
        {filteredCharacters.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {searchQuery ? 'No se encontraron personajes' : 'Sin personajes aún'}
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              {searchQuery 
                ? 'Intenta con otro término de búsqueda' 
                : 'Los personajes aparecerán aquí cuando uses "Dar Vida a mis Personajes" en el editor.'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => router.push('/editor')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                Ir al Editor
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCharacters.map((character) => (
              <div
                key={character.id}
                className={`rounded-2xl border transition-all duration-300 ${
                  character.interventionEnabled
                    ? 'bg-white/5 border-white/10 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5'
                    : 'bg-white/[0.02] border-white/5 opacity-60'
                }`}
              >
                {/* Header */}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 ${
                        character.interventionEnabled
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                          : 'bg-white/10 text-gray-500'
                      }`}
                    >
                      {character.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-white truncate">
                          {character.name}
                        </h3>
                        {character.totalInterventions > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                            {character.totalInterventions} 💬
                          </span>
                        )}
                      </div>
                      
                      {/* Stories */}
                      {(character.stories?.length ?? 0) > 0 && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                          <BookOpen className="w-4 h-4" />
                          <span>
                            {character.stories?.map(s => s.title).join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Backstory preview */}
                      {character.backstory && (
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {character.backstory}
                        </p>
                      )}
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => toggleIntervention(character)}
                      className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                      title={character.interventionEnabled ? 'Desactivar' : 'Activar'}
                    >
                      {character.interventionEnabled ? (
                        <ToggleRight className="w-8 h-8 text-green-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Traits */}
                {character.traits.length > 0 && (
                  <div className="px-6 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {character.traits.slice(0, 4).map((trait, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-gray-300"
                        >
                          {trait}
                        </span>
                      ))}
                      {character.traits.length > 4 && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-500">
                          +{character.traits.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Settings Preview */}
                <div className="px-6 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Style */}
                    <div className="flex items-center gap-1.5 text-xs bg-white/5 px-3 py-1.5 rounded-lg text-gray-400">
                      {interventionStyleIcons[character.interventionStyle]}
                      {interventionStyleLabels[character.interventionStyle]}
                    </div>

                    {/* Frequency */}
                    <div
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${
                        frequencyColors[character.interventionFrequency]
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      {frequencyLabels[character.interventionFrequency]}
                    </div>

                    {/* Voice */}
                    <div className="flex items-center gap-1.5 text-xs bg-white/5 px-3 py-1.5 rounded-lg text-gray-400">
                      <Volume2 className="w-3 h-3" />
                      {character.voiceTone}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3">
                  <Button
                    onClick={() => setEditingCharacter(character)}
                    className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30"
                  >
                    <Settings2 className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                  <Button
                    onClick={() => handleDeleteCharacter(character)}
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
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
