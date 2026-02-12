'use client';

import Link from 'next/link';
import { Eye, Heart, BookOpen, TreeDeciduous, Clock, User } from 'lucide-react';

interface StoryCardProps {
  story: {
    id: string;
    title: string;
    content: string; // Already truncated preview
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
  };
}

// Gradient presets for stories without cover images
const gradientPresets = [
  'from-purple-600 via-pink-500 to-orange-400',
  'from-blue-600 via-cyan-500 to-teal-400',
  'from-indigo-600 via-purple-500 to-pink-400',
  'from-emerald-600 via-teal-500 to-cyan-400',
  'from-rose-600 via-pink-500 to-purple-400',
  'from-amber-600 via-orange-500 to-red-400',
];

export function StoryCard({ story }: StoryCardProps) {
  // Determine URL based on story type
  const href = story.isInteractive ? `/read/${story.id}` : `/story/${story.id}`;
  
  // Get a consistent gradient based on story id
  const gradientIndex = story.id.charCodeAt(0) % gradientPresets.length;
  const gradient = gradientPresets[gradientIndex];

  // Format date
  const formattedDate = new Date(story.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Format word count
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <Link href={href} className="group block">
      <article className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10">
        {/* Cover Image or Gradient */}
        <div className="relative h-40 overflow-hidden">
          {story.coverImageUrl ? (
            <img
              src={story.coverImageUrl}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} group-hover:scale-110 transition-transform duration-500`}>
              {/* Decorative pattern */}
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                {story.isInteractive ? (
                  <TreeDeciduous className="w-16 h-16 text-white/30" />
                ) : (
                  <BookOpen className="w-16 h-16 text-white/30" />
                )}
              </div>
            </div>
          )}
          
          {/* Interactive Badge */}
          {story.isInteractive && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-full text-xs font-medium text-white shadow-lg">
              <TreeDeciduous className="w-3.5 h-3.5" />
              Interactiva
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-white text-lg line-clamp-1 group-hover:text-purple-300 transition-colors">
            {story.title}
          </h3>

          {/* Author */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              {story.author.image ? (
                <img src={story.author.image} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-3 h-3 text-white" />
              )}
            </div>
            <span className="truncate">
              {story.author.name || 'Autor anónimo'}
            </span>
          </div>

          {/* Preview */}
          <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px]">
            {story.content || 'Sin contenido disponible...'}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {formatNumber(story.views)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                {formatNumber(story.likes)}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {formatNumber(story.wordCount)}
              </span>
            </div>
            
            {/* Node count for interactive stories */}
            {story.isInteractive && story._count && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <TreeDeciduous className="w-3.5 h-3.5" />
                {story._count.storyNodes} nodos
              </span>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {formattedDate}
          </div>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10" />
        </div>
      </article>
    </Link>
  );
}

export default StoryCard;
