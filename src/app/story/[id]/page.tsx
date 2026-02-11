import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Eye, Heart, BookOpen, Clock, User, TreeDeciduous, Share2, Bookmark } from 'lucide-react';
import { StoryContent } from '@/components/story-reader';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  const story = await prisma.story.findUnique({
    where: { id },
    select: { title: true, content: true },
  });

  if (!story) {
    return { title: 'Historia no encontrada' };
  }

  const preview = story.content
    .replace(/<[^>]*>/g, '')
    .substring(0, 160);

  return {
    title: `${story.title} | World in Ink`,
    description: preview,
  };
}

export default async function ReadStoryPage({ params }: PageProps) {
  const { id } = await params;

  const story = await prisma.story.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!story) {
    notFound();
  }

  // If story is interactive, show redirect
  if (story.isInteractive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <TreeDeciduous className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Historia Interactiva</h1>
          <p className="text-gray-400 mb-6">
            Esta es una historia interactiva donde tú decides el camino.
          </p>
          <Link
            href={`/read/${id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-emerald-500/25"
          >
            <TreeDeciduous className="w-5 h-5" />
            Comenzar aventura
          </Link>
        </div>
      </div>
    );
  }

  // Increment views
  prisma.story.update({
    where: { id },
    data: { views: { increment: 1 } },
  }).catch(console.error);

  const formattedDate = new Date(story.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const readingTime = Math.max(1, Math.ceil(story.wordCount / 200));

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Subtle ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]" />
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
              <span className="text-sm font-medium">Biblioteca</span>
            </Link>

            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {readingTime} min
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {story.views}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all" title="Guardar">
                  <Bookmark className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all" title="Compartir">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          
          {/* Cover Image */}
          {story.coverImageUrl && (
            <div className="mb-12 -mx-6 sm:mx-0 sm:rounded-2xl overflow-hidden">
              <img
                src={story.coverImageUrl}
                alt={story.title}
                className="w-full h-[300px] sm:h-[400px] object-cover"
              />
            </div>
          )}

          {/* Title Section */}
          <header className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
              {story.title}
            </h1>
            
            {/* Author Card */}
            <div className="inline-flex items-center gap-4 px-6 py-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden ring-2 ring-white/20">
                {story.author.image ? (
                  <img src={story.author.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-white" />
                )}
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-lg">
                  {story.author.name || 'Autor anónimo'}
                </p>
                <p className="text-gray-400 text-sm">
                  {formattedDate} · {story.wordCount.toLocaleString()} palabras
                </p>
              </div>
            </div>
          </header>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/20" />
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/20" />
          </div>

          {/* Story Content - Client Component */}
          <StoryContent content={story.content} />

          {/* End Marker */}
          <div className="flex items-center justify-center gap-4 mt-16 mb-12">
            <div className="h-px w-12 bg-white/20" />
            <div className="text-2xl">✦</div>
            <div className="h-px w-12 bg-white/20" />
          </div>

          {/* Footer Actions */}
          <footer className="mt-16">
            {/* Engagement Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 rounded-2xl text-white font-medium transition-all hover:scale-105 group">
                <Heart className="w-6 h-6 text-pink-400 group-hover:scale-110 transition-transform" />
                <span>Me encanta esta historia</span>
                <span className="text-pink-400 font-bold">{story.likes}</span>
              </button>
            </div>

            {/* Author Card Extended */}
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 mb-12">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden ring-4 ring-white/10">
                  {story.author.image ? (
                    <img src={story.author.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="text-center sm:text-left flex-1">
                  <p className="text-sm text-purple-400 font-medium mb-1">Escrito por</p>
                  <p className="text-2xl font-bold text-white mb-2">
                    {story.author.name || 'Autor anónimo'}
                  </p>
                  <p className="text-gray-400">
                    Gracias por leer esta historia. Tu apoyo significa mucho.
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center">
              <Link
                href="/library"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-white font-medium transition-all hover:scale-105"
              >
                <BookOpen className="w-5 h-5 text-purple-400" />
                Descubrir más historias
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
