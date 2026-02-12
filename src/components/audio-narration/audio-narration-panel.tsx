'use client';

import { useState, useCallback } from 'react';
import { X, ChevronLeft, Sparkles } from 'lucide-react';
import { TTSVoice, stripHtmlForTTS, splitTextIntoChunks } from '@/types/audio';
import AudioPlayer from './audio-player';
import VoiceSelector from './voice-selector';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type PanelView = 'voice-select' | 'player';

interface AudioNarrationPanelProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly text: string;
  readonly isSelection?: boolean;
}

export default function AudioNarrationPanel({
  isOpen,
  onClose,
  text,
  isSelection = false,
}: AudioNarrationPanelProps) {
  const [view, setView] = useState<PanelView>('voice-select');
  const [selectedVoice, setSelectedVoice] = useState<TTSVoice>('nova');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Clean text for TTS
  const cleanText = stripHtmlForTTS(text);
  const charCount = cleanText.length;
  const chunks = splitTextIntoChunks(cleanText);
  const isLongText = chunks.length > 1;

  const generateAudio = useCallback(async () => {
    if (!cleanText.trim()) {
      toast.error('No hay texto para narrar');
      return;
    }

    setIsLoading(true);
    setAudioUrl(null);
    setView('player');

    try {
      // For long texts, we generate just the first chunk and warn the user
      const textToNarrate = isLongText ? chunks[0] : cleanText;

      const response = await fetch('/api/assistant/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToNarrate,
          voice: selectedVoice,
          speed: speed,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(error.error || 'Error al generar audio');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      if (isLongText) {
        toast.success(`Audio generado (parte 1 de ${chunks.length})`, {
          icon: '🎧',
          duration: 4000,
        });
      } else {
        toast.success('Audio generado correctamente', {
          icon: '🎧',
        });
      }
    } catch (error: any) {
      console.error('Error generating audio:', error);
      toast.error(error.message || 'Error al generar el audio');
      setView('voice-select');
    } finally {
      setIsLoading(false);
    }
  }, [cleanText, selectedVoice, speed, isLongText, chunks]);

  const handleVoiceSelect = (voice: TTSVoice) => {
    setSelectedVoice(voice);
  };

  const handleStartNarration = () => {
    generateAudio();
  };

  const handleChangeVoice = () => {
    // Revoke old audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setView('voice-select');
  };

  const handleRegenerate = () => {
    // Revoke old audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    generateAudio();
  };

  const handleClose = () => {
    // Revoke audio URL on close
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setView('voice-select');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
        onClick={handleClose}
        onKeyDown={(e) => e.key === 'Escape' && handleClose()}
        aria-label="Cerrar panel"
      />

      {/* Panel */}
      <div
        className={cn(
          'relative w-full max-w-md mx-4 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950',
          'rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/10',
          'transform transition-all duration-300'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {view === 'player' && (
              <button
                onClick={handleChangeVoice}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <div>
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                {isSelection ? 'Narrar Selección' : 'Audiolibro'}
              </h2>
              <p className="text-gray-400 text-xs">
                {charCount.toLocaleString()} caracteres
                {isLongText && ` • ${chunks.length} partes`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {view === 'voice-select' && (
            <div className="space-y-4">
              <VoiceSelector
                selectedVoice={selectedVoice}
                onSelectVoice={handleVoiceSelect}
              />

              {/* Speed control */}
              <div className="mt-4 p-4 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Velocidad</span>
                  <span className="text-white text-sm font-medium">{speed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={speed}
                  onChange={(e) => setSpeed(Number.parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:bg-purple-500
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:hover:bg-purple-400
                    [&::-webkit-slider-thumb]:transition-colors"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5x</span>
                  <span>1x</span>
                  <span>2x</span>
                </div>
              </div>

              {/* Long text warning */}
              {isLongText && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-amber-300 text-xs">
                    ⚠️ Tu texto es muy largo y se dividirá en {chunks.length} partes.
                    Se generará la primera parte primero.
                  </p>
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={handleStartNarration}
                disabled={!cleanText.trim()}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 
                  hover:from-purple-400 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-600
                  text-white font-medium rounded-xl transition-all duration-200
                  shadow-lg shadow-purple-500/25 disabled:shadow-none disabled:opacity-50"
              >
                Generar Audio
              </button>
            </div>
          )}

          {view === 'player' && (
            <AudioPlayer
              audioUrl={audioUrl}
              isLoading={isLoading}
              voice={selectedVoice}
              onChangeVoice={handleChangeVoice}
              onRegenerate={handleRegenerate}
            />
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 pb-4">
          <p className="text-gray-500 text-[10px] text-center">
            Powered by OpenAI Text-to-Speech
          </p>
        </div>
      </div>
    </div>
  );
}
