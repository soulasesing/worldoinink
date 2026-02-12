'use client';

/**
 * Skeleton loader para StoryCard
 * Muestra mientras se cargan las historias
 */
export function StoryCardSkeleton() {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-6 animate-pulse">
      {/* Cover skeleton */}
      <div className="w-full h-32 bg-white/10 rounded-lg mb-4" />
      
      {/* Content skeleton */}
      <div className="space-y-3">
        {/* Title */}
        <div className="h-6 bg-white/10 rounded w-3/4" />
        
        {/* Subtitle */}
        <div className="h-4 bg-white/10 rounded w-1/2" />
        
        {/* Description lines */}
        <div className="h-4 bg-white/10 rounded w-full" />
        <div className="h-4 bg-white/10 rounded w-5/6" />
        
        {/* Stats */}
        <div className="flex justify-between pt-2">
          <div className="h-4 bg-white/10 rounded w-20" />
          <div className="h-4 bg-white/10 rounded w-20" />
        </div>
        
        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-white/10">
          <div className="h-8 bg-white/10 rounded w-16" />
          <div className="h-8 bg-white/10 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

