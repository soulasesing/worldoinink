'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Image } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CoverUpFeatureProps {
  onClose?: () => void;
  onSelectCover?: (imageUrl: string) => void; // Optional prop to handle selecting an image
}

interface CoverGenerationResult {
  imageUrl: string;
}

export default function CoverUpFeature({ onClose, onSelectCover }: CoverUpFeatureProps) {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<CoverGenerationResult[] | null>(null);

  // Calculate optimal description length (leave room for prompt formatting)
  const MAX_DESCRIPTION_LENGTH = 900; // Safe limit, allowing room for prompt template
  const descriptionLength = description.length;
  const isDescriptionTooLong = descriptionLength > MAX_DESCRIPTION_LENGTH;

  const generateCover = async () => {
    if (!description.trim()) {
      toast.error('Please enter a description for the cover image.');
      return;
    }

    if (isDescriptionTooLong) {
      toast.error(`Description is too long. Please shorten it to ${MAX_DESCRIPTION_LENGTH} characters or less.`);
      return;
    }

    setIsGenerating(true);
    setResults(null); // Clear previous results

    try {
      const response = await fetch('/api/assistant/cover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error types
        if (response.status === 503) {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
        if (response.status === 504) {
          throw new Error('Request timed out. The server is taking too long. Please try again.');
        }
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        throw new Error(data.message || 'Failed to generate cover image');
      }

      setResults(data.images.map((url: string) => ({ imageUrl: url })));
      
      // Show info based on storage type
      if (data.info) {
        if (data.info.includes('Data URLs')) {
          toast.success('Cover images generated! (Using embedded images)', {
            duration: 4000,
            icon: '✅',
          });
        } else {
          toast.success('Cover images generated and stored successfully!', {
            duration: 3000,
          });
        }
      } else {
        toast.success('Cover images generated successfully!');
      }
    } catch (error: any) {
      console.error('Cover generation error:', error);
      toast.error(error.message || 'Failed to generate cover image. Please try again.', {
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Generate Cover</h3>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            Close
          </Button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2">
        {/* Description Input */}
        <div className="relative">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the cover image you want to generate (e.g., 'a fantasy landscape with dragons')..."
            maxLength={MAX_DESCRIPTION_LENGTH}
            className="w-full h-32 px-4 py-3 bg-white/5 border-2 rounded-xl text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:outline-none border-white/20 hover:border-white/30 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/25 resize-none"
          />
          {/* Character Counter */}
          <div className={`absolute bottom-2 right-2 text-xs ${
            isDescriptionTooLong 
              ? 'text-red-400 font-semibold' 
              : descriptionLength > MAX_DESCRIPTION_LENGTH * 0.8
              ? 'text-yellow-400'
              : 'text-gray-500'
          }`}>
            {descriptionLength} / {MAX_DESCRIPTION_LENGTH}
          </div>
        </div>

        {/* Warning for long descriptions */}
        {isDescriptionTooLong && (
          <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            ⚠️ Description is too long. Please shorten it for better results.
          </div>
        )}

        {/* Tip */}
        {!description && (
          <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-sm">
            💡 <strong>Tip:</strong> Be specific but concise. Mention key elements like genre, mood, colors, and main subjects.
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={generateCover}
          disabled={isGenerating || !description.trim() || isDescriptionTooLong}
          className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating (this may take 10-15 seconds)...
            </>
          ) : (
            <>
              <Image className="w-4 h-4 mr-2" />
              Generate Cover (4 variations)
            </>
          )}
        </Button>

        {/* Results Display */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
             <Loader2 className="w-8 h-8 mb-4 animate-spin text-yellow-400" />
             <p>Generating your cover...</p>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-300">Generated Covers:</h4>
            <div className="grid grid-cols-2 gap-4">
              {results.map((result, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border border-white/10">
                  <img 
                    src={result.imageUrl} 
                    alt={`Generated Cover ${index + 1}`} 
                    className="w-full h-auto object-cover" 
                  />
                  {onSelectCover && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        onClick={() => onSelectCover(result.imageUrl)}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Select Cover
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

         {results && results.length === 0 && !isGenerating && (
             <div className="text-center text-gray-400 py-8">
                 <p>No covers generated.</p>
             </div>
         )}

      </div>
    </div>
  );
} 