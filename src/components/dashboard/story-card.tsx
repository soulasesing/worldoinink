'use client';

import Link from 'next/link';
import { Edit3, Eye, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CoverImage } from './cover-image';
import { formatRelativeDate } from '@/lib/utils/date-formatter';
import { Story } from '@/types/story';

interface StoryCardProps {
  story: Story;
  onDelete?: (storyId: string) => void;
}

/**
 * Card de historia con portada real o fallback
 */
export function StoryCard({ story, onDelete }: StoryCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(`Are you sure you want to delete "${story.title}"?`)) {
      onDelete?.(story.id);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-6 hover:from-white/15 hover:to-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      
      {/* Story Cover */}
      <CoverImage 
        coverImageUrl={story.coverImageUrl}
        title={story.title}
        published={story.published}
        className="w-full h-32 mb-4 group-hover:scale-105 transition-transform duration-300"
      />

      {/* Story Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2">
            {story.title}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {formatRelativeDate(story.updatedAt)}
          </p>
        </div>

        {/* Content preview - Strip HTML and show first 100 chars */}
        <p className="text-gray-300 text-sm line-clamp-2">
          {story.content.replace(/<[^>]*>/g, '').substring(0, 100)}
          {story.content.length > 100 && '...'}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{story.wordCount.toLocaleString()} words</span>
          {story.published && (
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {story.views}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <Link href={`/editor?id=${story.id}`}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-400 hover:text-blue-300"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>

          <div className="flex items-center space-x-2">
            {story.published && (
              <Link href={`/story/${story.id}`}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-purple-400 hover:text-purple-300"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              </Link>
            )}

            {onDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-400 hover:text-red-300"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

