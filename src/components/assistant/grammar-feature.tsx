'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Suggestion {
  type: 'grammar' | 'style' | 'clarity';
  original: string;
  suggestion: string;
  explanation: string;
  tone: 'formal' | 'casual' | 'creative' | 'technical';
  confidence: number;
}

interface GrammarAnalysis {
  original: string;
  suggestions: Suggestion[];
  overall_analysis: string;
}

interface GrammarFeatureProps {
  onClose: () => void;
  selectedText?: string;
  onApplySuggestion?: (suggestion: Suggestion) => void;
}

export default function GrammarFeature({ onClose, selectedText, onApplySuggestion }: GrammarFeatureProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<GrammarAnalysis | null>(null);
  const [text, setText] = useState(selectedText || '');
  const [debouncedText, setDebouncedText] = useState(text);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['grammar', 'style', 'clarity']));
  const [writingStyle, setWritingStyle] = useState<'formal' | 'casual' | 'creative' | 'technical'>('creative');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);

  // Debounce text changes for real-time analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(text);
    }, 1000);

    return () => clearTimeout(timer);
  }, [text]);

  // Trigger analysis when debounced text changes
  useEffect(() => {
    if (debouncedText.trim()) {
      analyzeText();
    }
  }, [debouncedText]);

  const analyzeText = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/assistant/grammar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          context: 'creative writing',
          writingStyle,
          filters: Array.from(activeFilters),
          confidenceThreshold
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      toast.error('Failed to analyze text');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'bg-blue-500/20 text-blue-400';
      case 'style': return 'bg-purple-500/20 text-purple-400';
      case 'clarity': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Grammar Check</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          Close
        </Button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2">
        {/* Writing Style Selector */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">Writing Style</label>
          <select
            value={writingStyle}
            onChange={(e) => setWritingStyle(e.target.value as any)}
            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
            <option value="creative">Creative</option>
            <option value="technical">Technical</option>
          </select>
        </div>

        {/* Filter Toggles */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">Check for:</label>
          <div className="flex flex-wrap gap-2">
            {['grammar', 'style', 'clarity'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  const newFilters = new Set(activeFilters);
                  if (activeFilters.has(type)) {
                    newFilters.delete(type);
                  } else {
                    newFilters.add(type);
                  }
                  setActiveFilters(newFilters);
                }}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilters.has(type)
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Confidence Threshold */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">
            Confidence Threshold: {Math.round(confidenceThreshold * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Input Area */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter or paste text to analyze..."
            className="w-full h-32 px-4 py-3 bg-white/5 border-2 rounded-xl text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:outline-none border-white/20 hover:border-white/30 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/25 resize-none"
          />
          {isAnalyzing && (
            <div className="absolute top-2 right-2">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-4">
            {/* Overall Analysis */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Overall Analysis</h4>
              <p className="text-sm text-gray-400">{analysis.overall_analysis}</p>
            </div>

            {/* Suggestions */}
            <div className="space-y-3">
              {analysis.suggestions
                .filter(s => activeFilters.has(s.type))
                .filter(s => s.confidence >= confidenceThreshold)
                .map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(suggestion.type)}`}>
                        {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                      </span>
                      <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-300">{suggestion.original}</p>
                      </div>

                      <div className="flex items-start space-x-2">
                        <ArrowRight className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-300">{suggestion.suggestion}</p>
                      </div>

                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-400">{suggestion.explanation}</p>
                      </div>

                      {onApplySuggestion && (
                        <Button
                          onClick={() => onApplySuggestion(suggestion)}
                          size="sm"
                          className="mt-2 bg-purple-500 hover:bg-purple-600 text-white"
                        >
                          Apply Suggestion
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 