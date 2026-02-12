'use client';

import { Button } from '@/components/ui/button';
import { Save, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PublishButtonProps {
  isPublished: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}

/**
 * Componente de botones de publicación
 * Cambia según el estado published de la historia
 */
export function PublishButton({ 
  isPublished, 
  isSaving, 
  hasUnsavedChanges,
  onSaveDraft,
  onPublish,
  onUnpublish 
}: PublishButtonProps) {
  
  if (isPublished) {
    // Modo Published: Save Changes + Unpublish
    return (
      <div className="flex items-center space-x-2">
        <Button
          onClick={onSaveDraft}
          disabled={isSaving || !hasUnsavedChanges}
          className={cn(
            "flex items-center space-x-2 transition-all duration-300",
            hasUnsavedChanges 
              ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              : "bg-gray-600 cursor-not-allowed"
          )}
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={onUnpublish}
          disabled={isSaving}
          className="border-slate-500/30 text-slate-400 hover:bg-slate-500/10 hover:text-slate-300"
        >
          <EyeOff className="w-4 h-4 mr-2" />
          Unpublish
        </Button>
      </div>
    );
  }
  
  // Modo Draft: Save Draft + Publish
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        onClick={onSaveDraft}
        disabled={isSaving || !hasUnsavedChanges}
        className={cn(
          "border-orange-500/30 text-orange-400 hover:bg-orange-500/10",
          !hasUnsavedChanges && "opacity-50 cursor-not-allowed"
        )}
      >
        <Save className="w-4 h-4 mr-2" />
        Save Draft
      </Button>
      
      <Button
        onClick={onPublish}
        disabled={isSaving}
        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-500/25 transition-all duration-300"
      >
        <Eye className="w-4 h-4 mr-2" />
        Publish Story
      </Button>
    </div>
  );
}

