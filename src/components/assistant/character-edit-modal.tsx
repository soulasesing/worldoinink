'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { X, Save, Loader2, Sparkles, Volume2, Zap, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  stories: Array<{ id: string; title: string }>;
  createdAt: string;
  updatedAt: string;
}

interface CharacterEditModalProps {
  character: Character;
  onClose: () => void;
  onSave: (character: Character) => void;
}

// Options
const temperaments = [
  { value: 'calm', label: 'Tranquilo', emoji: '😌' },
  { value: 'passionate', label: 'Apasionado', emoji: '🔥' },
  { value: 'melancholic', label: 'Melancólico', emoji: '😢' },
  { value: 'cheerful', label: 'Alegre', emoji: '😊' },
  { value: 'mysterious', label: 'Misterioso', emoji: '🌙' },
  { value: 'balanced', label: 'Equilibrado', emoji: '⚖️' },
];

const speakingStyles = [
  { value: 'formal', label: 'Formal', emoji: '🎩' },
  { value: 'casual', label: 'Casual', emoji: '👋' },
  { value: 'poetic', label: 'Poético', emoji: '🌹' },
  { value: 'direct', label: 'Directo', emoji: '➡️' },
  { value: 'playful', label: 'Juguetón', emoji: '😜' },
  { value: 'natural', label: 'Natural', emoji: '🍃' },
];

const humorTypes = [
  { value: 'none', label: 'Sin humor', emoji: '😐' },
  { value: 'subtle', label: 'Sutil', emoji: '🙂' },
  { value: 'sarcastic', label: 'Sarcástico', emoji: '😏' },
  { value: 'witty', label: 'Ingenioso', emoji: '🤓' },
  { value: 'dark', label: 'Negro', emoji: '🖤' },
];

const confidenceLevels = [
  { value: 'shy', label: 'Tímido', emoji: '😳' },
  { value: 'modest', label: 'Modesto', emoji: '🙂' },
  { value: 'confident', label: 'Seguro', emoji: '😎' },
  { value: 'arrogant', label: 'Arrogante', emoji: '👑' },
];

const voiceTones = [
  { value: 'friendly', label: 'Amigable' },
  { value: 'serious', label: 'Serio' },
  { value: 'playful', label: 'Juguetón' },
  { value: 'dramatic', label: 'Dramático' },
  { value: 'mysterious', label: 'Misterioso' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'warm', label: 'Cálido' },
  { value: 'inspiring', label: 'Inspirador' },
];

const interventionStyles = [
  { value: 'suggestion', label: 'Sugerencias', desc: 'Ofrece ideas y direcciones para la historia' },
  { value: 'complaint', label: 'Quejas', desc: 'Se queja de forma divertida sobre lo que pasa' },
  { value: 'question', label: 'Preguntas', desc: 'Hace preguntas intrigantes sobre la trama' },
  { value: 'encouragement', label: 'Apoyo', desc: 'Anima y apoya la dirección creativa' },
];

const frequencies = [
  { value: 'low', label: 'Baja', desc: 'Interviene raramente (cada 5+ min)' },
  { value: 'medium', label: 'Media', desc: 'Interviene moderadamente (cada 2 min)' },
  { value: 'high', label: 'Alta', desc: 'Interviene frecuentemente (cada 30 seg)' },
];

export default function CharacterEditModal({
  character,
  onClose,
  onSave,
}: CharacterEditModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'personality' | 'voice' | 'triggers' | 'intervention'>('personality');

  // Form state
  const [name, setName] = useState(character.name);
  const [backstory, setBackstory] = useState(character.backstory);
  const [traits, setTraits] = useState<string[]>(character.traits);
  const [newTrait, setNewTrait] = useState('');

  // Personality
  const [temperament, setTemperament] = useState(character.personality?.temperament || 'balanced');
  const [speakingStyle, setSpeakingStyle] = useState(character.personality?.speakingStyle || 'natural');
  const [humor, setHumor] = useState(character.personality?.humor || 'subtle');
  const [confidence, setConfidence] = useState(character.personality?.confidence || 'confident');

  // Voice
  const [voiceTone, setVoiceTone] = useState(character.voiceTone);

  // Triggers
  const [triggerWords, setTriggerWords] = useState<string[]>(character.triggerWords);
  const [triggerTopics, setTriggerTopics] = useState<string[]>(character.triggerTopics);
  const [newTriggerWord, setNewTriggerWord] = useState('');
  const [newTriggerTopic, setNewTriggerTopic] = useState('');

  // Intervention
  const [interventionStyle, setInterventionStyle] = useState(character.interventionStyle);
  const [interventionFrequency, setInterventionFrequency] = useState(character.interventionFrequency);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/characters/${character.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          backstory,
          traits,
          personality: {
            temperament,
            speakingStyle,
            humor,
            confidence,
          },
          voiceTone,
          triggerWords,
          triggerTopics,
          interventionStyle,
          interventionFrequency,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('¡Personaje actualizado!');
        onSave(data.character);
      } else {
        toast.error(data.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving character:', error);
      toast.error('Error al guardar personaje');
    } finally {
      setIsSaving(false);
    }
  };

  const addTrait = () => {
    if (newTrait.trim() && !traits.includes(newTrait.trim())) {
      setTraits([...traits, newTrait.trim()]);
      setNewTrait('');
    }
  };

  const removeTrait = (trait: string) => {
    setTraits(traits.filter((t) => t !== trait));
  };

  const addTriggerWord = () => {
    if (newTriggerWord.trim() && !triggerWords.includes(newTriggerWord.trim())) {
      setTriggerWords([...triggerWords, newTriggerWord.trim()]);
      setNewTriggerWord('');
    }
  };

  const addTriggerTopic = () => {
    if (newTriggerTopic.trim() && !triggerTopics.includes(newTriggerTopic.trim())) {
      setTriggerTopics([...triggerTopics, newTriggerTopic.trim()]);
      setNewTriggerTopic('');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 z-[101] flex items-center justify-center">
        <div
          className="w-full max-w-2xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xl font-bold text-white bg-transparent border-none outline-none focus:ring-0"
                  placeholder="Nombre del personaje"
                />
                <p className="text-sm text-gray-400">Configuración de personaje</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {[
              { id: 'personality', label: 'Personalidad', icon: Sparkles },
              { id: 'voice', label: 'Voz', icon: Volume2 },
              { id: 'triggers', label: 'Triggers', icon: Zap },
              { id: 'intervention', label: 'Intervención', icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-500/5'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Personality Tab */}
            {activeTab === 'personality' && (
              <div className="space-y-6">
                {/* Backstory */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción / Backstory
                  </label>
                  <textarea
                    value={backstory}
                    onChange={(e) => setBackstory(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 resize-none"
                    placeholder="Describe quién es este personaje..."
                  />
                </div>

                {/* Traits */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rasgos de personalidad
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {traits.map((trait) => (
                      <span
                        key={trait}
                        className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300"
                      >
                        {trait}
                        <button
                          onClick={() => removeTrait(trait)}
                          className="ml-1 text-gray-500 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTrait}
                      onChange={(e) => setNewTrait(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTrait()}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 text-sm"
                      placeholder="Agregar rasgo..."
                    />
                    <Button onClick={addTrait} size="sm" className="bg-indigo-500/20">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Temperament */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Temperamento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {temperaments.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTemperament(t.value)}
                        className={`p-3 rounded-xl border text-sm transition-all ${
                          temperament === t.value
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-lg mb-1 block">{t.emoji}</span>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speaking Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estilo de hablar
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {speakingStyles.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setSpeakingStyle(s.value)}
                        className={`p-3 rounded-xl border text-sm transition-all ${
                          speakingStyle === s.value
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-lg mb-1 block">{s.emoji}</span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Humor */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de humor
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {humorTypes.map((h) => (
                      <button
                        key={h.value}
                        onClick={() => setHumor(h.value)}
                        className={`p-2 rounded-xl border text-xs transition-all ${
                          humor === h.value
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-base mb-1 block">{h.emoji}</span>
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confidence */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nivel de confianza
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {confidenceLevels.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setConfidence(c.value)}
                        className={`p-2 rounded-xl border text-xs transition-all ${
                          confidence === c.value
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-base mb-1 block">{c.emoji}</span>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Voice Tab */}
            {activeTab === 'voice' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tono de voz
                  </label>
                  <p className="text-xs text-gray-500 mb-4">
                    Define cómo suena este personaje cuando interviene
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {voiceTones.map((v) => (
                      <button
                        key={v.value}
                        onClick={() => setVoiceTone(v.value)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          voiceTone === v.value
                            ? 'bg-indigo-500/20 border-indigo-500/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <span className={voiceTone === v.value ? 'text-indigo-300' : 'text-white'}>
                          {v.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Triggers Tab */}
            {activeTab === 'triggers' && (
              <div className="space-y-6">
                <p className="text-sm text-gray-400">
                  Define qué palabras y temas activan a este personaje para intervenir.
                </p>

                {/* Trigger Words */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Palabras clave
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {triggerWords.map((word) => (
                      <span
                        key={word}
                        className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300"
                      >
                        "{word}"
                        <button
                          onClick={() => setTriggerWords(triggerWords.filter((w) => w !== word))}
                          className="ml-1 text-purple-400 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTriggerWord}
                      onChange={(e) => setNewTriggerWord(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTriggerWord()}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-sm"
                      placeholder="muerte, amor, secreto..."
                    />
                    <Button onClick={addTriggerWord} size="sm" className="bg-purple-500/20">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Trigger Topics */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Temas
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {triggerTopics.map((topic) => (
                      <span
                        key={topic}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300"
                      >
                        #{topic}
                        <button
                          onClick={() => setTriggerTopics(triggerTopics.filter((t) => t !== topic))}
                          className="ml-1 text-blue-400 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTriggerTopic}
                      onChange={(e) => setNewTriggerTopic(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTriggerTopic()}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 text-sm"
                      placeholder="love, danger, betrayal..."
                    />
                    <Button onClick={addTriggerTopic} size="sm" className="bg-blue-500/20">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Intervention Tab */}
            {activeTab === 'intervention' && (
              <div className="space-y-6">
                {/* Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estilo de intervención
                  </label>
                  <div className="space-y-2">
                    {interventionStyles.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setInterventionStyle(s.value)}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${
                          interventionStyle === s.value
                            ? 'bg-indigo-500/20 border-indigo-500/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className={interventionStyle === s.value ? 'text-indigo-300 font-medium' : 'text-white'}>
                          {s.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frecuencia de intervención
                  </label>
                  <div className="space-y-2">
                    {frequencies.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setInterventionFrequency(f.value)}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${
                          interventionFrequency === f.value
                            ? 'bg-indigo-500/20 border-indigo-500/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className={interventionFrequency === f.value ? 'text-indigo-300 font-medium' : 'text-white'}>
                          {f.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
            <Button onClick={onClose} variant="ghost" className="text-gray-400">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
