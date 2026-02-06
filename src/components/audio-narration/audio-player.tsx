'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TTSVoice, VOICE_OPTIONS } from '@/types/audio';

interface AudioPlayerProps {
  readonly audioUrl: string | null;
  readonly isLoading: boolean;
  readonly voice: TTSVoice;
  readonly onClose?: () => void;
  readonly onChangeVoice?: () => void;
  readonly onRegenerate?: () => void;
}

export default function AudioPlayer({
  audioUrl,
  isLoading,
  voice,
  onClose,
  onChangeVoice,
  onRegenerate,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const voiceInfo = VOICE_OPTIONS.find((v) => v.id === voice);

  // Update audio element when URL changes
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number.parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (time: number) => {
    if (Number.isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-full max-w-md">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Header with voice info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{voiceInfo?.emoji}</span>
          <div>
            <p className="text-white font-medium text-sm">{voiceInfo?.name}</p>
            <p className="text-gray-400 text-xs">{voiceInfo?.style}</p>
          </div>
        </div>
        {onChangeVoice && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onChangeVoice}
            className="text-gray-400 hover:text-white text-xs"
          >
            Cambiar voz
          </Button>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 flex items-center justify-center animate-pulse">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
            </div>
            {/* Audio wave animation */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={`wave-${n}`}
                  className="w-1 bg-gradient-to-t from-purple-500 to-blue-400 rounded-full"
                  style={{
                    animation: 'audioWave 1s ease-in-out infinite',
                    animationDelay: `${n * 0.1}s`,
                    height: '12px',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="text-center">
            <p className="text-white text-sm font-medium">Generando audio...</p>
            <p className="text-gray-500 text-xs mt-1">Esto puede tomar unos segundos</p>
          </div>
        </div>
      )}

      {/* Keyframe animation for audio waves */}
      <style>{`
        @keyframes audioWave {
          0%, 100% { height: 8px; }
          50% { height: 20px; }
        }
      `}</style>

      {/* Player controls */}
      {!isLoading && audioUrl && (
        <>
          {/* Progress bar */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:bg-purple-500
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:hover:bg-purple-400
                [&::-webkit-slider-thumb]:transition-colors"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Stop */}
              <button
                onClick={handleStop}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <Square className="w-4 h-4 text-white" />
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 flex items-center justify-center transition-all shadow-lg shadow-purple-500/25"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" />
                )}
              </button>

              {/* Regenerate */}
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  title="Regenerar audio"
                >
                  <RotateCcw className="w-4 h-4 text-white" />
                </button>
              )}
            </div>

            {/* Volume control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/10 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-2.5
                  [&::-webkit-slider-thumb]:h-2.5
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
          </div>
        </>
      )}

      {/* No audio state */}
      {!isLoading && !audioUrl && (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            <Volume2 className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400 text-sm">Selecciona texto para escuchar</p>
        </div>
      )}

      {/* Close button */}
      {onClose && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-full text-gray-400 hover:text-white"
          >
            Cerrar reproductor
          </Button>
        </div>
      )}
    </div>
  );
}
