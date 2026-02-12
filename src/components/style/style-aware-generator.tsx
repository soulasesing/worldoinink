'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface StyleAwareGeneratorProps {
  onGenerate: (text: string) => void;
  currentContext: string;
}

export default function StyleAwareGenerator({
  onGenerate,
  currentContext,
}: StyleAwareGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [maxLength, setMaxLength] = useState(500);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useStyle, setUseStyle] = useState(true);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor escribe qué quieres generar');
      return;
    }

    try {
      setIsGenerating(true);

      const res = await fetch('/api/style/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          context: currentContext.substring(0, 3000), // Last 3000 chars
          maxLength,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onGenerate(data.generatedText);
        setPrompt('');
        toast.success(
          `✨ Texto generado en tu estilo (${(data.styleConfidence * 100).toFixed(0)}% confianza)`
        );
      } else {
        if (data.error === 'NO_STYLE_PROFILE') {
          toast.error('Necesitas analizar tu estilo primero. Ve a la sección de Estilo.', {
            duration: 5000,
          });
        } else if (data.error === 'LOW_CONFIDENCE') {
          toast.error('Tu perfil de estilo necesita más datos. Escribe más historias.', {
            duration: 5000,
          });
        } else {
          toast.error(data.message || 'Error al generar texto');
        }
      }
    } catch (error) {
      console.error('Error generating text:', error);
      toast.error('Error al generar texto');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
          <span className="text-xl">✨</span>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Generación con Tu Estilo</h3>
          <p className="text-gray-400 text-sm">La IA escribirá imitando tu forma única de escribir</p>
        </div>
      </div>

      {/* Toggle Style */}
      <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 mb-4">
        <div>
          <div className="text-white font-medium text-sm">Usar mi estilo personal</div>
          <div className="text-gray-400 text-xs">
            {useStyle ? 'La IA imitará tu forma de escribir' : 'Generación estándar'}
          </div>
        </div>
        <button
          onClick={() => setUseStyle(!useStyle)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            useStyle ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              useStyle ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Prompt Input */}
      <div className="mb-4">
        <label className="text-gray-300 text-sm font-medium mb-2 block">
          ¿Qué quieres escribir?
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ej: Continúa la historia con una escena romántica en el parque..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
          rows={3}
        />
        <div className="text-gray-500 text-xs mt-1">
          {prompt.length} caracteres
        </div>
      </div>

      {/* Length Slider */}
      <div className="mb-4">
        <label className="text-gray-300 text-sm font-medium mb-2 block">
          Longitud: {maxLength} palabras
        </label>
        <input
          type="range"
          min="100"
          max="1000"
          step="50"
          value={maxLength}
          onChange={(e) => setMaxLength(Number(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Corto</span>
          <span>Medio</span>
          <span>Largo</span>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim() || !useStyle}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <span className="inline-block animate-spin">⚙️</span>
            Generando en tu estilo...
          </>
        ) : (
          <>
            <span>✨</span>
            Generar con Mi Estilo
          </>
        )}
      </button>

      {!useStyle && (
        <div className="mt-3 text-center text-gray-500 text-xs">
          Activa "Usar mi estilo personal" para usar esta función
        </div>
      )}

      {/* Info */}
      <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-blue-200 text-xs">
          💡 <strong>Tip:</strong> La IA usará tu voz narrativa, vocabulario, ritmo y patrones únicos
          basándose en tu perfil de estilo.
        </p>
      </div>
    </div>
  );
}

