'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, BookOpen, TreeDeciduous, Loader2, Library, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/library';

interface Story {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  views: number;
  likes: number;
  isInteractive: boolean;
  coverImageUrl: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count?: {
    storyNodes: number;
  };
}

type FilterType = 'all' | 'interactive' | 'linear';

export default function LibraryPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch stories
  const fetchStories = useCallback(async (pageNum: number, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        type: filter,
        search: search,
        page: pageNum.toString(),
        limit: '12',
      });

      const res = await fetch(`/api/library?${params}`);
      if (!res.ok) throw new Error('Error fetching stories');
      
      const data = await res.json();

      if (append) {
        setStories(prev => [...prev, ...data.stories]);
      } else {
        setStories(data.stories);
      }
      
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter, search]);

  // Initial load and filter/search changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchStories(1);
    }, search ? 300 : 0); // Debounce search

    return () => clearTimeout(debounce);
  }, [filter, search, fetchStories]);

  // Load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchStories(page + 1, true);
    }
  };

  // Filter buttons config
  const filterButtons: { type: FilterType; label: string; icon: typeof BookOpen }[] = [
    { type: 'all', label: 'Todas', icon: Library },
    { type: 'interactive', label: 'Interactivas', icon: TreeDeciduous },
    { type: 'linear', label: 'Lineales', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Biblioteca de Historias</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Descubre Historias
            </span>
          </h1>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Explora historias increíbles de nuestra comunidad. 
            Elige entre lecturas lineales tradicionales o experiencias interactivas donde tú decides el camino.
          </p>
        </header>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar historias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {filterButtons.map(({ type, label, icon: Icon }) => (
              <Button
                key={type}
                variant="ghost"
                onClick={() => setFilter(type)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                  filter === type
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-6 px-1">
          <p className="text-sm text-gray-400">
            {loading ? (
              'Cargando...'
            ) : (
              <>
                <span className="text-white font-medium">{total}</span> historias encontradas
                {filter !== 'all' && (
                  <span className="ml-2 text-purple-400">
                    ({filter === 'interactive' ? 'interactivas' : 'lineales'})
                  </span>
                )}
              </>
            )}
          </p>
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
            <p className="text-gray-400">Cargando historias...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No hay historias</h3>
            <p className="text-gray-400 text-center max-w-md">
              {search 
                ? `No se encontraron historias que coincidan con "${search}"`
                : 'Aún no hay historias publicadas. ¡Sé el primero en compartir tu historia!'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-10">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      Cargar más historias
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Interactive Stories Promo */}
        {filter !== 'interactive' && stories.some(s => s.isInteractive) && (
          <div className="mt-12 p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <TreeDeciduous className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Prueba las Historias Interactivas
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  En las historias interactivas, tú decides el camino. Cada elección te lleva a un destino diferente.
                </p>
                <Button
                  onClick={() => setFilter('interactive')}
                  className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-sm transition-all"
                >
                  Ver historias interactivas
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
