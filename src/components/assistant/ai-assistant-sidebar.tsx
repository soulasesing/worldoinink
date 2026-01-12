'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles, MessageCircle, Zap, Bot, Settings, Send, Loader2, ImageIcon, Palette } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GrammarFeature from './grammar-feature';
import CoverUpFeature from './cover-up-feature';
import UploadCover from './upload-cover';
import StyleAwareGenerator from '@/components/style/style-aware-generator';
import CharacterManager from './character-manager';

/**
 * Safe clipboard copy function that handles focus issues
 * Falls back to legacy execCommand if Clipboard API fails
 */
async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern Clipboard API first
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API failed, trying fallback:', err);
    }
  }

  // Fallback: Create a temporary textarea and use execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Prevent scrolling to bottom
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (err) {
    console.error('All clipboard methods failed:', err);
    return false;
  }
}

interface AiAssistantSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectCover?: (imageUrl: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiAssistantSidebar({ isOpen, onToggle, onSelectCover }: AiAssistantSidebarProps) {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const features = [
    { icon: MessageCircle, label: 'Chat', color: 'from-blue-500 to-cyan-500' },
    { icon: ImageIcon, label: 'CoverUp', color: 'from-yellow-500 to-orange-500' },
    { icon: Zap, label: 'Grammar', color: 'from-green-500 to-emerald-500' },
    { icon: Palette, label: 'Mi Estilo', color: 'from-purple-500 to-pink-500' },
    { icon: Bot, label: 'Characters', color: 'from-indigo-500 to-blue-500' }
  ];

  const chatFeatureIndex = features.findIndex(f => f.label === 'Chat');
  const grammarFeatureIndex = features.findIndex(f => f.label === 'Grammar');
  const coverUpFeatureIndex = features.findIndex(f => f.label === 'CoverUp');
  const styleFeatureIndex = features.findIndex(f => f.label === 'Mi Estilo');
  const charactersFeatureIndex = features.findIndex(f => f.label === 'Characters');

  // Scroll to the latest message
  useEffect(() => {
    // Adding a small delay to ensure DOM updates before scrolling
    const scrollTimer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);

    return () => clearTimeout(scrollTimer);
  }, [messages]);

  // Create a new thread when the component mounts if none exists
  useEffect(() => {
    const storedThreadId = localStorage.getItem('assistantThreadId');
    if (storedThreadId) {
      setThreadId(storedThreadId);
      // TODO: Optionally fetch previous messages for the thread
    } else {
      const createThread = async () => {
        try {
          const response = await fetch('/api/assistant/thread', {
            method: 'POST',
          });
          const data = await response.json();
          if (response.ok) {
            setThreadId(data.threadId);
            localStorage.setItem('assistantThreadId', data.threadId);
          } else {
            toast.error(data.message || 'Failed to create assistant thread');
          }
        } catch (error) {
          console.error('Error creating thread:', error);
          toast.error('Failed to create assistant thread');
        }
      };
      createThread();
    }
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !threadId) return;

    const newUserMessage: Message = { role: 'user', content: inputMessage };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId: threadId,
          message: newUserMessage.content,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantResponse: Message = { role: 'assistant', content: data.response };
        setMessages(prevMessages => [...prevMessages, assistantResponse]);
      } else {
        toast.error(data.message || 'Failed to get assistant response');
        // Optionally revert the user message if sending failed
        setMessages(prevMessages => prevMessages.filter(msg => msg !== newUserMessage));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
       // Optionally revert the user message if sending failed
       setMessages(prevMessages => prevMessages.filter(msg => msg !== newUserMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full z-50 transition-all duration-500 ease-in-out ${isOpen ? 'w-80' : 'w-16'
        }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Main Sidebar Container */}
      <div className={`h-full backdrop-blur-xl bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-r border-white/10 shadow-2xl transition-all duration-500 ${isOpen ? 'translate-x-0' : ''
        }`}>

        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-1/2 -right-10 w-24 h-24 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-lg animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-20 h-20 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-full blur-lg animate-pulse delay-2000"></div>
        </div>

        {/* Sidebar Header */}      
          <div className="flex items-center justify-between p-4">
            {isOpen && (
              <div className="flex items-center space-x-3 animate-fadeIn">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    AI Assistant
                  </h2>
                  <p className="text-xs text-gray-400 animate-pulse">Online & Ready</p>
                </div>
              </div>
            )}

            <Button
              onClick={onToggle}
              size="sm"
              className={`relative overflow-hidden bg-white/10 hover:bg-white/20 border-white/20 text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25 ${isOpen ? '' : 'mx-auto'
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              {isOpen ? <ChevronLeft className="w-4 h-4 relative z-10" /> : <ChevronRight className="w-4 h-4 relative z-10" />}
            </Button>
          </div>

        {/* Expanded Content */}
            {/* {isOpen && (
              <div key={isOpen ? 'expanded-content' : 'collapsed-content'} className="flex-1 flex flex-col p-4 space-y-6 animate-slideIn overflow-y-auto"> */}
        {isOpen && (
              <div
                key={isOpen ? 'expanded-content' : 'collapsed-content'}
                className="flex flex-col p-4 space-y-6 animate-slideIn overflow-y-auto"
                style={{ maxHeight: 'calc(100vh - 64px)' }} // Ajusta según tu header
              >
            {activeFeature === null ? (
              // Main Feature Menu
              <>
                {/* Welcome Message */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 border border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 animate-pulse"></div>
                  <div className="relative z-10">
                    <div className="flex items-center space-x-2 mb-3">
                      <Sparkles className="w-5 h-5 text-blue-400 animate-spin-slow" />
                      <span className="text-sm font-medium text-blue-300">Ready to Assist</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Your AI companion is ready to help you with ideas, grammar, characters, and so much more! ✨
                    </p>
                  </div>
                </div>

                {/* Feature Grid */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {features.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <button
                          key={feature.label}
                          // Set activeFeature to the index of the clicked feature
                          onClick={() => setActiveFeature(index)}
                          className={`group relative overflow-hidden p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg ${activeFeature === index ? 'ring-2 ring-blue-500/50 bg-white/10' : ''
                            }`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                          <div className="relative z-10 flex flex-col items-center space-y-2">
                            <Icon className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors duration-300" />
                            <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors duration-300">
                              {feature.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-300">AI Status</span>
                    </div>
                    <span className="text-xs text-green-400 font-medium">Active</span>
                  </div>
                </div>

                {/* Settings Button */}
                <button className="w-full flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group">
                  <Settings className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-300">Settings</span>
                </button>
              </>
            ) : (
              // Render the active feature component
              <div className="flex flex-col h-full">
                 {/* Back button */}                 <div className="pb-4 border-b border-white/10 mb-4">
                   <Button variant="ghost" size="sm" onClick={() => setActiveFeature(null)} className="text-blue-300 hover:text-primary">
                     <ChevronLeft className="h-4 w-4 mr-2" /> Back to Menu
                   </Button>
                 </div>

                {/* Feature Content Area */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {/* Chat Interface Display Area */}
                  {activeFeature === chatFeatureIndex && (
                    <>
                      {messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user'
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-gray-700 text-gray-200 rounded-bl-none'
                            }`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {/* Loading Indicator */}                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="max-w-[80%] p-3 rounded-lg bg-gray-700 text-gray-200 rounded-bl-none flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Assistant is thinking...</span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} /> {/* Scroll anchor */}
                    </>
                  )}

                  {/* Grammar Feature Interface */}
                  {activeFeature === grammarFeatureIndex && (
                    <GrammarFeature onClose={() => setActiveFeature(null)} />
                  )}

                  {activeFeature === coverUpFeatureIndex && (
                    <div className="flex-1 overflow-y-auto">
                      <CoverUpFeature onSelectCover={onSelectCover} />
                      <div className="border-t border-slate-200 dark:border-slate-700 mt-4">
                        <UploadCover onImageUploaded={onSelectCover} />
                      </div>
                    </div>
                  )}

                  {/* Style Aware Generator Feature */}
                  {activeFeature === styleFeatureIndex && (
                    <StyleAwareGenerator
                      onGenerate={async (text) => {
                        // Copy to clipboard safely (handles focus issues)
                        const success = await copyToClipboard(text);
                        if (success) {
                          toast.success('¡Texto copiado al portapapeles! Pégalo en tu editor.', {
                            duration: 4000,
                            icon: '📋',
                          });
                        } else {
                          toast.error('No se pudo copiar automáticamente. Selecciona y copia el texto manualmente.', {
                            duration: 5000,
                          });
                        }
                      }}
                      currentContext=""
                    />
                  )}

                  {/* Characters Manager Feature */}
                  {activeFeature === charactersFeatureIndex && (
                    <CharacterManager />
                  )}

                   {/* Placeholder for other features */}
                  {activeFeature !== chatFeatureIndex && 
                   activeFeature !== grammarFeatureIndex && 
                   activeFeature !== coverUpFeatureIndex && 
                   activeFeature !== styleFeatureIndex && 
                   activeFeature !== charactersFeatureIndex && (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <p className="text-center">{`'${features[activeFeature]?.label}' feature coming soon!`}</p>
                      </div>
                  )}
                </div>

                {/* Input Area (only for chat feature)*/}
                {activeFeature === chatFeatureIndex && (
                  <div className="flex items-center space-x-2 pt-4 border-t border-white/10">
                    <input
                      type="text"
                      placeholder={threadId ? "Ask the AI..." : "Creating thread..."}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 p-2 rounded-md bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading || !threadId}
                    />
                    <Button
                      onClick={sendMessage}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading || !inputMessage.trim() || !threadId}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* Collapsed State */}
        {!isOpen && (
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="relative group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              {isHovering && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-black/90 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap z-50 animate-fadeIn">
                  AI Assistant
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-black/90"></div>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.label} className="relative group">
                    <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110">
                      <Icon className="w-4 h-4 text-gray-400 hover:text-white transition-colors duration-300" />
                    </button>
                    {isHovering && (
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-black/90 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap z-50 animate-fadeIn">
                        {feature.label}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-black/90"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.6s ease-out;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}