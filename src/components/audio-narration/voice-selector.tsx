'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Loader2, Check, Volume2 } from 'lucide-react';
import { TTSVoice, VOICE_OPTIONS, PREVIEW_TEXT } from '@/types/audio';

interface VoiceSelectorProps {
  readonly selectedVoice: TTSVoice;
  readonly onSelectVoice: (voice: TTSVoice) => void;
  readonly disabled?: boolean;
}

export default function VoiceSelector({
  selectedVoice,
  onSelectVoice,
  disabled = false,
}: VoiceSelectorProps) {
  const [previewingVoice, setPreviewingVoice] = useState<TTSVoice | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePreviewVoice = async (voice: TTSVoice) => {
    // If already previewing this voice, stop it
    if (previewingVoice === voice) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPreviewingVoice(null);
      return;
    }

    // Stop any existing preview
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsLoadingPreview(true);
    setPreviewingVoice(voice);

    try {
      const response = await fetch('/api/assistant/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: PREVIEW_TEXT,
          voice: voice,
          speed: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setPreviewingVoice(null);
          URL.revokeObjectURL(audioUrl);
        };
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error previewing voice:', error);
      setPreviewingVoice(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden audio element for previews */}
      <audio ref={audioRef} className="hidden" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Volume2 className="w-5 h-5 text-purple-400" />
        <h3 className="text-white font-medium">Selecciona una voz</h3>
      </div>

      {/* Voice grid */}
      <div className="grid grid-cols-2 gap-3">
        {VOICE_OPTIONS.map((voice) => {
          const isSelected = selectedVoice === voice.id;
          const isPreviewing = previewingVoice === voice.id;
          const isLoading = isLoadingPreview && isPreviewing;

          return (
            <button
              key={voice.id}
              onClick={() => onSelectVoice(voice.id)}
              disabled={disabled}
              className={`
                relative p-4 rounded-xl border transition-all duration-300
                ${
                  isSelected
                    ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Voice info */}
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{voice.emoji}</span>
                  <span className="text-white font-medium">{voice.name}</span>
                </div>
                <p className="text-gray-400 text-xs mb-2">{voice.description}</p>
                <span
                  className={`
                    inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide
                    ${
                      voice.gender === 'female'
                        ? 'bg-pink-500/20 text-pink-300'
                        : voice.gender === 'male'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }
                  `}
                >
                  {voice.style}
                </span>
              </div>

              {/* Preview button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewVoice(voice.id);
                }}
                disabled={disabled || (isLoadingPreview && !isPreviewing)}
                className={`
                  absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all
                  ${
                    isPreviewing
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                  }
                `}
                title={isPreviewing ? 'Detener preview' : 'Escuchar preview'}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPreviewing ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>
            </button>
          );
        })}
      </div>

      {/* Preview text info */}
      <p className="text-gray-500 text-xs text-center mt-4">
        Haz clic en ▶ para escuchar una muestra de cada voz
      </p>
    </div>
  );
}
