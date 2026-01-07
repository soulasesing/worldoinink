'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import type { WritingStyleProfile } from '@/types/style';

export default function StyleDashboard() {
  const [profile, setProfile] = useState<WritingStyleProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [eligibility, setEligibility] = useState<{
    eligible: boolean;
    currentStories: number;
    currentWords: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    loadProfile();
    checkEligibility();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/style/profile');
      const data = await res.json();

      if (data.success) {
        setProfile(data.profile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error loading style profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkEligibility = async () => {
    try {
      const res = await fetch('/api/style/analyze');
      const data = await res.json();

      if (data.eligibility) {
        setEligibility(data.eligibility);
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
    }
  };

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      toast.loading('Analizando tu estilo de escritura... Esto puede tomar 30-60 segundos.', {
        id: 'analyzing',
      });

      const res = await fetch('/api/style/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceReanalyze: true }),
      });

      const data = await res.json();

      if (data.success) {
        setProfile(data.profile);
        toast.success('¡Análisis completado! Tu perfil de estilo está listo.', {
          id: 'analyzing',
          duration: 5000,
        });
      } else {
        toast.error(data.message || 'Error al analizar tu estilo', {
          id: 'analyzing',
        });
      }
    } catch (error) {
      console.error('Error analyzing style:', error);
      toast.error('Error al analizar tu estilo', { id: 'analyzing' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 mb-4">
              <svg
                className="w-10 h-10 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Tu Estilo Literario Personalizado
            </h2>
            <p className="text-gray-400 text-lg mb-6">
              Descubre tu voz única como escritor. La IA analizará tus historias para entender tu estilo.
            </p>
          </div>

          {eligibility && !eligibility.eligible && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
              <p className="text-orange-200 font-medium mb-2">
                📝 Necesitas más contenido
              </p>
              <p className="text-orange-300/80 text-sm">
                {eligibility.message}
              </p>
              <div className="mt-3 flex gap-4 justify-center text-sm">
                <div>
                  <span className="text-orange-400 font-bold">
                    {eligibility.currentStories}
                  </span>
                  <span className="text-orange-300/60"> / 2 historias</span>
                </div>
                <div>
                  <span className="text-orange-400 font-bold">
                    {eligibility.currentWords}
                  </span>
                  <span className="text-orange-300/60"> / 3000 palabras</span>
                </div>
              </div>
            </div>
          )}

          {eligibility && eligibility.eligible && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
              <p className="text-green-200 font-medium">
                ✅ Tienes suficientes datos para analizar tu estilo
              </p>
              <p className="text-green-300/80 text-sm mt-1">
                {eligibility.currentStories} historias · {eligibility.currentWords} palabras
              </p>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (eligibility && !eligibility.eligible)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isAnalyzing ? (
              <>
                <span className="inline-block animate-spin mr-2">⚙️</span>
                Analizando...
              </>
            ) : (
              '🎨 Analizar Mi Estilo'
            )}
          </button>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="text-white font-semibold mb-1">Análisis Profundo</h3>
              <p className="text-gray-400 text-sm">
                Voz narrativa, tono, ritmo y patrones únicos
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl mb-2">✍️</div>
              <h3 className="text-white font-semibold mb-1">Generación Personalizada</h3>
              <p className="text-gray-400 text-sm">
                La IA escribirá en TU estilo único
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="text-white font-semibold mb-1">Mejora Continua</h3>
              <p className="text-gray-400 text-sm">
                Sugerencias adaptadas a tu forma de escribir
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile exists - show dashboard
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Tu Estilo Literario</h1>
          <p className="text-gray-400">
            Analizado desde {profile.analyzedStories} historias · {profile.totalWordsAnalyzed.toLocaleString()} palabras
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
        >
          {isAnalyzing ? 'Re-analizando...' : '🔄 Re-analizar'}
        </button>
      </div>

      {/* Confidence Badge */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-full px-4 py-2">
          <span className="text-green-400 font-semibold">
            Confianza: {(profile.confidence * 100).toFixed(0)}%
          </span>
          <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-blue-500"
              style={{ width: `${profile.confidence * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          label="Voz Narrativa"
          value={formatVoice(profile.narrativeVoice)}
          icon="🎭"
          color="blue"
        />
        <MetricCard
          label="Tiempo Verbal"
          value={formatTense(profile.preferredTense)}
          icon="⏰"
          color="purple"
        />
        <MetricCard
          label="Vocabulario"
          value={formatLevel(profile.vocabularyLevel)}
          icon="📚"
          color="green"
        />
        <MetricCard
          label="Ritmo"
          value={formatPace(profile.writingPace)}
          icon="🎵"
          color="orange"
        />
      </div>

      {/* Sentence & Paragraph Length */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>📏</span> Longitud de Oraciones
          </h3>
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {profile.avgSentenceLength.toFixed(1)} palabras
          </div>
          <p className="text-gray-400 text-sm">
            {profile.avgSentenceLength < 15 ? 'Oraciones cortas y directas' :
             profile.avgSentenceLength < 25 ? 'Oraciones balanceadas' :
             'Oraciones largas y complejas'}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>📄</span> Longitud de Párrafos
          </h3>
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {profile.avgParagraphLength.toFixed(1)} oraciones
          </div>
          <p className="text-gray-400 text-sm">
            {profile.avgParagraphLength < 3 ? 'Párrafos concisos' :
             profile.avgParagraphLength < 5 ? 'Párrafos estándar' :
             'Párrafos extensos'}
          </p>
        </div>
      </div>

      {/* Dominant Tones */}
      {profile.dominantTones && profile.dominantTones.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>🎨</span> Tonos Dominantes
          </h3>
          <div className="flex flex-wrap gap-3">
            {profile.dominantTones.map((tone, idx) => (
              <div
                key={idx}
                className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-purple-200 font-medium"
              >
                {tone}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signature Phrases & Favorite Words */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {profile.signaturePhrases && typeof profile.signaturePhrases === 'object' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>✨</span> Frases Características
            </h3>
            <div className="space-y-2">
              {Object.entries(profile.signaturePhrases)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([phrase, count], idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-gray-300">"{phrase}"</span>
                    <span className="text-blue-400 font-semibold">{count as number}×</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {profile.favoriteWords && typeof profile.favoriteWords === 'object' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>💬</span> Palabras Favoritas
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(profile.favoriteWords)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 12)
                .map(([word, count], idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300"
                  >
                    {word} <span className="text-blue-400">({count})</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Similar Authors */}
      {profile.similarAuthors && profile.similarAuthors.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>📖</span> Autores Similares
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.similarAuthors.map((author, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                <div>
                  <div className="text-white font-medium">{author.name}</div>
                  {author.reason && (
                    <div className="text-gray-400 text-sm mt-1">{author.reason}</div>
                  )}
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {(author.similarity * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Style Examples */}
      {profile.styleExamples && profile.styleExamples.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>📝</span> Ejemplos Representativos
          </h3>
          <div className="space-y-4">
            {profile.styleExamples.slice(0, 3).map((example, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-400 text-sm font-medium">
                    {formatExampleType(example.exampleType)}
                  </span>
                  <span className="text-gray-500 text-sm">{example.storyTitle}</span>
                </div>
                <p className="text-gray-300 italic">"{example.text}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components

function MetricCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
    orange: 'from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm rounded-xl p-6`}>
      <div className="text-3xl mb-3">{icon}</div>
      <div className="text-gray-400 text-sm mb-1">{label}</div>
      <div className="text-white text-xl font-bold">{value}</div>
    </div>
  );
}

// Formatters

function formatVoice(voice: string): string {
  const map: Record<string, string> = {
    'first-person': 'Primera Persona',
    'second-person': 'Segunda Persona',
    'third-person-limited': 'Tercera Limitada',
    'third-person-omniscient': 'Tercera Omnisciente',
  };
  return map[voice] || voice;
}

function formatTense(tense: string): string {
  const map: Record<string, string> = {
    past: 'Pasado',
    present: 'Presente',
    future: 'Futuro',
    mixed: 'Mixto',
  };
  return map[tense] || tense;
}

function formatLevel(level: string): string {
  const map: Record<string, string> = {
    basic: 'Básico',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
    literary: 'Literario',
  };
  return map[level] || level;
}

function formatPace(pace: string): string {
  const map: Record<string, string> = {
    fast: 'Rápido',
    moderate: 'Moderado',
    slow: 'Lento',
    variable: 'Variable',
  };
  return map[pace] || pace;
}

function formatExampleType(type: string): string {
  const map: Record<string, string> = {
    NARRATIVE_VOICE: 'Voz Narrativa',
    DESCRIPTIVE: 'Descriptivo',
    DIALOGUE: 'Diálogo',
    EMOTIONAL: 'Emocional',
    SIGNATURE_STYLE: 'Estilo Firma',
    OPENING: 'Apertura',
    TRANSITION: 'Transición',
  };
  return map[type] || type;
}

