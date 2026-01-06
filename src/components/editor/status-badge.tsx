'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  isPublished: boolean;
  className?: string;
}

/**
 * Badge visual del estado de publicación
 */
export function StatusBadge({ isPublished, className }: StatusBadgeProps) {
  return (
    <div className={cn(
      "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm",
      isPublished 
        ? "bg-green-500/20 text-green-400 border border-green-500/30"
        : "bg-orange-500/20 text-orange-400 border border-orange-500/30",
      className
    )}>
      <div className={cn(
        "w-2 h-2 rounded-full animate-pulse",
        isPublished ? "bg-green-400" : "bg-orange-400"
      )} />
      <span>{isPublished ? 'Published' : 'Draft'}</span>
    </div>
  );
}

