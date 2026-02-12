'use client';

import { useState } from 'react';
import { Settings, Sparkles, Volume2, VolumeX } from 'lucide-react';
import type { InterventionSettings, InterventionType } from '@/types/intervention';

interface InterventionSettingsPanelProps {
  settings: InterventionSettings;
  onUpdateSettings: (settings: Partial<InterventionSettings>) => void;
  characterNames: string[];
}

export default function InterventionSettingsPanel({
  settings,
  onUpdateSettings,
  characterNames,
}: InterventionSettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const interventionTypeLabels: Record<InterventionType, string> = {
    reaction: '💬 Reacciones',
    suggestion: '💡 Sugerencias',
    question: '❓ Preguntas',
    complaint: '😤 Quejas',
    encouragement: '💪 Ánimos',
    warning: '⚠️ Advertencias',
    memory: '📖 Recuerdos',
    dialogue_help: '🎭 Ayuda con diálogos',
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-all duration-200 ${
          settings.enabled
            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300'
            : 'bg-white/5 border border-white/10 text-gray-400'
        } hover:scale-105`}
        title="Configuración de Personajes Vivos"
      >
        <Sparkles className={`w-5 h-5 ${settings.enabled ? 'animate-pulse' : ''}`} />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-semibold">Personajes Vivos</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              Tus personajes cobran vida e interactúan contigo
            </p>
          </div>

          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Activar intervenciones</span>
              <button
                onClick={() => onUpdateSettings({ enabled: !settings.enabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enabled
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                    : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.enabled && (
              <>
                {/* Frequency */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    Frecuencia de intervenciones
                  </label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((freq) => (
                      <button
                        key={freq}
                        onClick={() => onUpdateSettings({ frequency: freq })}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          settings.frequency === freq
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {freq === 'low' && 'Baja'}
                        {freq === 'medium' && 'Media'}
                        {freq === 'high' && 'Alta'}
                      </button>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    {settings.frequency === 'low' && 'Cada ~2 minutos'}
                    {settings.frequency === 'medium' && 'Cada ~1 minuto'}
                    {settings.frequency === 'high' && 'Cada ~30 segundos'}
                  </p>
                </div>

                {/* Intervention Types */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    Tipos de intervención
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(interventionTypeLabels) as InterventionType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          const types = settings.interventionTypes.includes(type)
                            ? settings.interventionTypes.filter(t => t !== type)
                            : [...settings.interventionTypes, type];
                          onUpdateSettings({ interventionTypes: types });
                        }}
                        className={`p-2 rounded-lg text-xs font-medium transition-all text-left ${
                          settings.interventionTypes.includes(type)
                            ? 'bg-purple-600/30 border border-purple-500/50 text-purple-200'
                            : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {interventionTypeLabels[type]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Show Emotions */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Mostrar emociones</span>
                  <button
                    onClick={() => onUpdateSettings({ showEmotions: !settings.showEmotions })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      settings.showEmotions ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        settings.showEmotions ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Sound */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {settings.soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-gray-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-gray-300 text-sm">Sonido</span>
                  </div>
                  <button
                    onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      settings.soundEnabled ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        settings.soundEnabled ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-white/5 border-t border-white/10">
            <p className="text-gray-500 text-xs text-center">
              💡 Los personajes intervendrán mientras escribes
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

