'use client';

import { useState, useRef } from 'react';
import { Play, Loader2, AudioLines, Sparkles } from 'lucide-react';
import { TTSVoice, VOICE_OPTIONS, PREVIEW_TEXT } from '@/types/audio';
import toast from 'react-hot-toast';

export default function AudioFeature() {
  const [selectedVoice, setSelectedVoice] = useState<TTSVoice>('nova');
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState<TTSVoice | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePreviewVoice = async (voice: TTSVoice) => {
    // If already previewing this voice, stop it
    if (previewingVoice === voice && isPreviewPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPreviewPlaying(false);
      setPreviewingVoice(null);
      return;
    }

    // Stop any existing preview
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsLoading(true);
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
      audioRef.current ??= new Audio();
      
      audioRef.current.src = audioUrl;
      audioRef.current.onended = () => {
        setIsPreviewPlaying(false);
        setPreviewingVoice(null);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onplay = () => setIsPreviewPlaying(true);
      audioRef.current.onpause = () => setIsPreviewPlaying(false);
      
      await audioRef.current.play();
      setSelectedVoice(voice);
    } catch (error) {
      console.error('Error previewing voice:', error);
      toast.error('Error al reproducir preview');
      setPreviewingVoice(null);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedVoiceInfo = VOICE_OPTIONS.find(v => v.id === selectedVoice);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <AudioLines className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">Narración de Audio</h3>
          <p className="text-gray-400 text-xs">Convierte tu texto en voz</p>
        </div>
      </div>

      {/* Selected Voice Display */}
      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
        <p className="text-gray-400 text-xs mb-2">Voz seleccionada</p>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{selectedVoiceInfo?.emoji}</span>
          <div>
            <p className="text-white font-medium">{selectedVoiceInfo?.name}</p>
            <p className="text-gray-400 text-xs">{selectedVoiceInfo?.description}</p>
          </div>
        </div>
      </div>

      {/* Voice Grid */}
      <div className="space-y-2">
        <p className="text-gray-400 text-xs font-medium">Voces disponibles</p>
        <div className="grid grid-cols-2 gap-2">
          {VOICE_OPTIONS.map((voice) => {
            const isSelected = selectedVoice === voice.id;
            const isPreviewing = previewingVoice === voice.id;
            const isCurrentLoading = isLoading && isPreviewing;

            return (
              <button
                key={voice.id}
                onClick={() => handlePreviewVoice(voice.id)}
                className={`
                  group relative p-3 rounded-xl text-left transition-all duration-300
                  ${isSelected
                    ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }
                  border
                `}
              >
                {/* Play indicator */}
                <div className="absolute top-2 right-2">
                  {isCurrentLoading && (
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  )}
                  {!isCurrentLoading && isPreviewing && isPreviewPlaying && (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map(n => (
                        <div
                          key={n}
                          className="w-0.5 bg-purple-400 rounded-full animate-pulse"
                          style={{
                            height: `${8 + n * 2}px`,
                            animationDelay: `${n * 0.1}s`
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {!isCurrentLoading && !(isPreviewing && isPreviewPlaying) && (
                    <Play className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>

                <span className="text-lg">{voice.emoji}</span>
                <p className="text-white text-xs font-medium mt-1">{voice.name}</p>
                <p className="text-gray-500 text-[10px]">{voice.style}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-white text-sm font-medium">¿Cómo usar?</p>
            <ul className="text-gray-300 text-xs space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center text-[10px] text-purple-300">1</span>
                <span>Escribe o selecciona texto en tu historia</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center text-[10px] text-purple-300">2</span>
                <span>Haz clic en el botón 🎧 flotante</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center text-[10px] text-purple-300">3</span>
                <span>Elige una voz y genera el audio</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tip */}
      <p className="text-gray-500 text-[10px] text-center">
        💡 Tip: Selecciona texto específico para narrar solo esa parte
      </p>
    </div>
  );
}
