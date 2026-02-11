'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  RotateCcw, 
  TreeDeciduous, 
  Sparkles,
  ChevronLeft,
  Trophy,
  Map,
  ArrowLeft,
  Clock,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChoiceButtons } from './choice-buttons';
import type { StoryNode, Choice, StoryStructureResponse } from '@/types/interactive';
import Link from 'next/link';

interface InteractiveReaderProps {
  storyId: string;
}

type ReaderStatus = 'loading' | 'reading' | 'ending' | 'error';

export function InteractiveReader({ storyId }: InteractiveReaderProps) {
  const [status, setStatus] = useState<ReaderStatus>('loading');
  const [storyData, setStoryData] = useState<StoryStructureResponse | null>(null);
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch story structure
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setStatus('loading');
        const response = await fetch(`/api/stories/${storyId}/structure`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load story');
        }

        setStoryData(data);
        
        // Find start node
        const startNode = data.nodes.find((n: StoryNode) => n.isStart);
        if (startNode) {
          setCurrentNode(startNode);
          setVisitedNodes([startNode.id]);
          setPathHistory([startNode.id]);
          setStatus('reading');
        } else if (data.nodes.length > 0) {
          setCurrentNode(data.nodes[0]);
          setVisitedNodes([data.nodes[0].id]);
          setPathHistory([data.nodes[0].id]);
          setStatus('reading');
        } else {
          setError('This story has no content yet');
          setStatus('error');
        }
      } catch (err) {
        console.error('[InteractiveReader] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load story');
        setStatus('error');
      }
    };

    fetchStory();
  }, [storyId]);

  // Get choices for current node
  const getCurrentChoices = useCallback((): Choice[] => {
    if (!currentNode || !storyData) return [];
    return storyData.choices.filter(c => c.fromNodeId === currentNode.id);
  }, [currentNode, storyData]);

  // Handle choice selection
  const handleChoose = useCallback((choice: Choice) => {
    if (!storyData) return;

    const nextNode = storyData.nodes.find(n => n.id === choice.toNodeId);
    if (!nextNode) return;

    setCurrentNode(nextNode);
    setVisitedNodes(prev => [...prev, nextNode.id]);
    setPathHistory(prev => [...prev, nextNode.id]);

    if (nextNode.isEnding || nextNode.nodeType === 'ENDING') {
      setStatus('ending');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [storyData]);

  // Restart story
  const handleRestart = useCallback(() => {
    if (!storyData) return;
    
    const startNode = storyData.nodes.find(n => n.isStart) || storyData.nodes[0];
    if (startNode) {
      setCurrentNode(startNode);
      setVisitedNodes([startNode.id]);
      setPathHistory([startNode.id]);
      setStatus('reading');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [storyData]);

  // Go back one step
  const handleGoBack = useCallback(() => {
    if (pathHistory.length <= 1 || !storyData) return;
    
    const newHistory = pathHistory.slice(0, -1);
    const previousNodeId = newHistory[newHistory.length - 1];
    const previousNode = storyData.nodes.find(n => n.id === previousNodeId);
    
    if (previousNode) {
      setCurrentNode(previousNode);
      setPathHistory(newHistory);
      setStatus('reading');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathHistory, storyData]);

  // Calculate progress
  const progress = storyData 
    ? Math.round((visitedNodes.length / storyData.stats.totalNodes) * 100)
    : 0;

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px]" />
        </div>
        <div className="text-center relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse shadow-lg shadow-emerald-500/25">
            <TreeDeciduous className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Cargando historia...</h2>
          <p className="text-gray-400 text-lg">Preparando tu aventura interactiva</p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <span className="text-5xl">😕</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">No se pudo cargar</h2>
          <p className="text-gray-400 text-lg mb-8">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const choices = getCurrentChoices();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Subtle ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/library"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Biblioteca</span>
            </Link>

            {/* Story Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <TreeDeciduous className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-semibold text-white text-sm truncate max-w-[200px]">
                  {storyData?.story.title}
                </h1>
                <p className="text-xs text-emerald-400">Historia Interactiva</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {pathHistory.length > 1 && (
                <button
                  onClick={handleGoBack}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Atrás</span>
                </button>
              )}
              <button
                onClick={handleRestart}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reiniciar</span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative pt-28 pb-32">
        <div className="max-w-3xl mx-auto px-6">
          
          {/* Node Title */}
          {currentNode?.title && (
            <header className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
                <TreeDeciduous className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-medium">Escena {pathHistory.length}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {currentNode.title}
              </h2>
            </header>
          )}

          {/* Divider */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/20" />
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/20" />
          </div>

          {/* Story Content */}
          <article 
            className="interactive-story-content text-gray-200 text-xl leading-relaxed"
            dangerouslySetInnerHTML={{ __html: currentNode?.content || '' }}
          />

          {/* Ending State */}
          {status === 'ending' && (
            <div className="mt-16">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px w-12 bg-white/20" />
                <div className="text-2xl">🏆</div>
                <div className="h-px w-12 bg-white/20" />
              </div>
              
              <div className="p-8 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-3xl border border-emerald-500/20 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/25">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">
                  ¡Has llegado a un final!
                </h3>
                <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
                  Exploraste <span className="text-emerald-400 font-semibold">{visitedNodes.length}</span> de <span className="text-white font-semibold">{storyData?.stats.totalNodes}</span> escenas.
                  {visitedNodes.length < (storyData?.stats.totalNodes || 0) && (
                    <span className="block mt-2 text-gray-400">¿Quieres descubrir otros caminos?</span>
                  )}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={handleRestart}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-2xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/25"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Explorar otro camino
                  </button>
                  {pathHistory.length > 1 && (
                    <button
                      onClick={handleGoBack}
                      className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-2xl transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Volver atrás
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Choice Buttons */}
          {status === 'reading' && choices.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px w-12 bg-white/20" />
                <div className="text-lg text-gray-400">¿Qué decides?</div>
                <div className="h-px w-12 bg-white/20" />
              </div>
              <ChoiceButtons
                choices={choices}
                onChoose={handleChoose}
                disabled={false}
              />
            </div>
          )}

          {/* Dead End */}
          {status === 'reading' && choices.length === 0 && !currentNode?.isEnding && (
            <div className="mt-16 p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
              <p className="text-gray-400 text-lg mb-6">
                Este camino aún no tiene continuación...
              </p>
              <button
                onClick={handleGoBack}
                disabled={pathHistory.length <= 1}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all mx-auto disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
                Volver atrás
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer Stats */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/80 backdrop-blur-xl border-t border-white/5 py-4">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Map className="w-4 h-4 text-emerald-400" />
              <span><span className="text-white font-medium">{visitedNodes.length}</span> escenas visitadas</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span><span className="text-white font-medium">{storyData?.stats.totalEndings || 0}</span> finales posibles</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-gray-400">
              <TreeDeciduous className="w-4 h-4 text-teal-400" />
              <span><span className="text-white font-medium">{progress}%</span> explorado</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Premium Reading Styles */}
      <style jsx global>{`
        .interactive-story-content {
          font-family: 'Georgia', 'Times New Roman', serif;
          letter-spacing: 0.01em;
        }
        
        .interactive-story-content p {
          margin-bottom: 1.75rem;
          line-height: 1.9;
        }
        
        .interactive-story-content p:first-of-type::first-letter {
          font-size: 4rem;
          font-weight: bold;
          float: left;
          line-height: 1;
          margin-right: 0.75rem;
          margin-top: 0.25rem;
          color: #10b981;
        }
        
        .interactive-story-content h1, 
        .interactive-story-content h2, 
        .interactive-story-content h3 {
          font-family: system-ui, -apple-system, sans-serif;
          color: white;
          font-weight: 700;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
        }
        
        .interactive-story-content h1 { font-size: 2.5rem; }
        .interactive-story-content h2 { font-size: 2rem; }
        .interactive-story-content h3 { font-size: 1.5rem; }
        
        .interactive-story-content strong {
          color: white;
          font-weight: 600;
        }
        
        .interactive-story-content em {
          color: #e2e8f0;
          font-style: italic;
        }
        
        .interactive-story-content a {
          color: #10b981;
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        
        .interactive-story-content a:hover {
          color: #34d399;
        }
        
        .interactive-story-content blockquote {
          border-left: 4px solid #10b981;
          padding: 1.5rem 2rem;
          margin: 2rem 0;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 0 1rem 1rem 0;
          font-style: italic;
          color: #d1d5db;
        }
        
        .interactive-story-content ul,
        .interactive-story-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
          color: #d1d5db;
        }
        
        .interactive-story-content li {
          margin-bottom: 0.75rem;
          line-height: 1.8;
        }
        
        .interactive-story-content li::marker {
          color: #10b981;
        }
        
        .interactive-story-content img {
          border-radius: 1rem;
          margin: 2.5rem auto;
          max-width: 100%;
          height: auto;
        }
        
        .interactive-story-content hr {
          border: none;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
          margin: 3rem 0;
        }
        
        .interactive-story-content code {
          background: rgba(255,255,255,0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.9em;
          color: #34d399;
        }
        
        .interactive-story-content pre {
          background: rgba(255,255,255,0.05);
          padding: 1.5rem;
          border-radius: 1rem;
          overflow-x: auto;
          margin: 2rem 0;
          border: 1px solid rgba(255,255,255,0.1);
        }
        
        .interactive-story-content pre code {
          background: none;
          padding: 0;
        }

        .interactive-story-content ::selection {
          background: rgba(16, 185, 129, 0.4);
          color: white;
        }
      `}</style>
    </div>
  );
}

export default InteractiveReader;
