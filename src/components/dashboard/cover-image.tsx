'use client';

import { BookOpen } from 'lucide-react';
import { generateGradientFromTitle } from '@/lib/utils/gradient-generator';
import { cn } from '@/lib/utils';

interface CoverImageProps {
  coverImageUrl: string | null;
  title: string;
  published: boolean;
  className?: string;
}

/**
 * Componente que muestra la portada de una historia
 * Si no hay coverImageUrl, muestra un fallback con gradient único
 */
export function CoverImage({ 
  coverImageUrl, 
  title, 
  published,
  className 
}: CoverImageProps) {
  // Badge de status
  const StatusBadge = () => (
    <div className="absolute top-2 right-2">
      <span className={cn(
        "px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
        published
          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
          : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
      )}>
        {published ? 'Published' : 'Draft'}
      </span>
    </div>
  );

  // Si hay imagen de portada, mostrarla
  if (coverImageUrl) {
    return (
      <div className={cn("relative overflow-hidden rounded-lg", className)}>
        <img 
          src={coverImageUrl} 
          alt={`Cover for ${title}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <StatusBadge />
      </div>
    );
  }
  
  // Fallback: gradient único basado en el título
  const gradient = generateGradientFromTitle(title);
  
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg bg-gradient-to-r",
      gradient,
      className
    )}>
      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
        <BookOpen className="w-12 h-12 text-white/70" />
      </div>
      <StatusBadge />
    </div>
  );
}

