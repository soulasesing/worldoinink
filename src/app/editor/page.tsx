'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';
// import ReactQuill from 'react-quill'; // Removed direct import
import 'react-quill/dist/quill.snow.css';
import AiAssistantSidebar from '@/components/assistant/ai-assistant-sidebar';
import { 
  Save, 
  FileText, 
  Plus, 
  FolderOpen, 
  Clock, 
  Trash2, 
  Copy, 
  Share2, 
  Settings,
  Eye,
  Edit3,
  Download,
  Upload,
  Star,
  BookOpen,
  Image,
  RefreshCw
} from 'lucide-react';

// Dynamically import ReactQuill to ensure it only renders on the client side
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    return function comp({ forwardedRef, ...props }: any) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  { ssr: false }
);

// Types for better type safety
interface Story {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  status: 'draft' | 'published' | 'archived';
  isFavorite: boolean;
  coverImageUrl?: string;
}

interface EditorState {
  mode: 'create' | 'edit' | 'view';
  currentStory: Story | null;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
}

export default function EditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyId = searchParams.get('id');
  
  // Editor state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(undefined);
  const [editorState, setEditorState] = useState<EditorState>({
    mode: 'create',
    currentStory: null,
    hasUnsavedChanges: false,
    lastSaved: null
  });
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);
  const [showStoryManager, setShowStoryManager] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  
  // Auto-save functionality
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [saveInterval, setSaveInterval] = useState<NodeJS.Timeout | null>(null);

  // Word count calculation
  const getWordCount = useCallback((text: string) => {
    return text.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0).length;
  }, []);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = editorState.currentStory ? 
      (title !== editorState.currentStory.title || content !== editorState.currentStory.content) :
      (title.trim() !== '' || content.trim() !== '');
    
    setEditorState(prev => ({ ...prev, hasUnsavedChanges: hasChanges }));
  }, [title, content, editorState.currentStory]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && editorState.hasUnsavedChanges && editorState.currentStory) {
      const interval = setTimeout(() => {
        handleSave(true); // Silent auto-save
      }, 30000); // Auto-save every 30 seconds
      
      setSaveInterval(interval);
      return () => clearTimeout(interval);
    }
  }, [editorState.hasUnsavedChanges, autoSaveEnabled, editorState.currentStory]);

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load story if editing
  useEffect(() => {
    if (storyId && storyId !== 'new') {
      loadStory(storyId);
    } else if (storyId === 'new') {
      handleNewStory();
    }
  }, [storyId]);

  // Load all user stories
  const loadStories = async () => {
    setIsLoadingStories(true);
    try {
      const response = await fetch('/api/stories');
      if (response.ok) {
        const userStories = await response.json();
        setStories(userStories);
      }
    } catch (error) {
      toast.error('Failed to load stories');
    } finally {
      setIsLoadingStories(false);
    }
  };

  // Load specific story
  const loadStory = async (storyId: string) => {
    try {
      setIsLoadingStories(true);
      const response = await fetch(`/api/stories/${storyId}`);
      const data = await response.json();

      if (response.ok && data) {
        setTitle(data.title);
        setContent(data.content);
        setCoverImageUrl(data.coverImageUrl || undefined);
        setEditorState({
          mode: 'edit',
          currentStory: data,
          hasUnsavedChanges: false,
          lastSaved: new Date(data.updatedAt)
        });
      } else {
        toast.error('Story not found');
        router.push('/editor?id=new');
      }
    } catch (error) {
      toast.error('Failed to load story');
    } finally {
      setIsLoadingStories(false);
    }
  };

  // Handle save (create or update)
  const handleSave = async (isAutoSave = false) => {
    if (!title.trim()) {
      if (!isAutoSave) toast.error('Please enter a title');
      return;
    }

    setIsSaving(true);
    try {
      const method = editorState.mode === 'edit' ? 'PUT' : 'POST';
      const url = editorState.mode === 'edit' 
        ? `/api/stories/${editorState.currentStory?.id}` 
        : '/api/stories';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          wordCount: getWordCount(content),
          published: false,
          coverImageUrl
        }),
      });

      if (!response.ok) throw new Error('Failed to save story');

      const savedStory = await response.json();
      
      setEditorState({
        mode: 'edit',
        currentStory: savedStory,
        hasUnsavedChanges: false,
        lastSaved: new Date()
      });
      setCoverImageUrl(savedStory.coverImageUrl || undefined);

      // Update URL if creating new story
      if (editorState.mode === 'create') {
        router.replace(`/editor?id=${savedStory.id}`);
      }

      if (!isAutoSave) {
        toast.success('Story saved successfully');
      }
    } catch (error) {
      if (!isAutoSave) {
        toast.error('Failed to save story');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle new story
  const handleNewStory = () => {
    if (editorState.hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to create a new story?')) {
        return;
      }
    }
    
    setTitle('');
    setContent('');
    setCoverImageUrl(undefined);
    setEditorState({
      mode: 'create',
      currentStory: null,
      hasUnsavedChanges: false,
      lastSaved: null
    });
    router.push('/editor?id=new');
  };

  // Handle duplicate story
  const handleDuplicate = () => {
    if (editorState.currentStory) {
      setTitle(`${title} (Copy)`);
      setEditorState({
        mode: 'create',
        currentStory: null,
        hasUnsavedChanges: true,
        lastSaved: null
      });
      router.push('/editor?id=new');
    }
  };

  // Handle delete story
  const handleDelete = async () => {
    if (!editorState.currentStory) return;
    
    if (!confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/stories/${editorState.currentStory.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Story deleted successfully');
        router.push('/editor?id=new');
      } else {
        toast.error('Failed to delete story');
      }
    } catch (error) {
      toast.error('Failed to delete story');
    }
  };

  const handleSelectCover = (imageUrl: string) => {
    setCoverImageUrl(imageUrl);
    toast.success('Cover image selected!');
  };

  // Quill configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'align',
    'blockquote', 'code-block', 'link', 'image'
  ];

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-white">Loading Editor...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-16">
      {/* AI Assistant Sidebar */}
      <AiAssistantSidebar 
        isOpen={isAiSidebarOpen} 
        onToggle={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
        onSelectCover={handleSelectCover}
      />

      {/* Main Editor Area */}
      <div className={`flex-1 transition-all duration-300 ${isAiSidebarOpen ? 'ml-80' : 'ml-16'}`}>
        
        {/* Header Bar */}
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-6 py-4 sticky top-16 z-40">
          <div className="flex items-center justify-between">
            
            {/* Left Section - Story Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${editorState.hasUnsavedChanges ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`}></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {editorState.mode === 'create' ? 'New Story' : 'Editing'}
                </span>
              </div>
              
              {editorState.lastSaved && (
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>Saved {editorState.lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
              
              <div className="text-xs text-slate-500">
                {getWordCount(content)} words
              </div>

              {coverImageUrl && (
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <Image className="w-4 h-4" />
                  <span>Cover Attached</span>
                </div>
              )}

            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStoryManager(!showStoryManager)}
                className="flex items-center space-x-1 text-blue-300"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Stories</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNewStory}
                className="flex items-center space-x-1 text-blue-300"
              >
                <Plus className="w-4 h-4" />
                <span>New</span>
              </Button>

              {editorState.currentStory && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDuplicate}
                    className="flex items-center space-x-1"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}

              <Button
                onClick={() => handleSave()}
                disabled={isSaving || !editorState.hasUnsavedChanges}
                className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Story Manager Panel */}
        {showStoryManager && (
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 p-4 sticky top-[88px] z-30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Your Stories</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={loadStories}
                disabled={isLoadingStories}
                className="flex items-center space-x-1 text-blue-300"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{isLoadingStories ? 'Loading...' : 'Refresh'}</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  onClick={() => {
                    router.push(`/editor?id=${story.id}`);
                    setShowStoryManager(false);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800 dark:text-white truncate">{story.title}</h4>
                      <p className="text-sm text-slate-500 mt-1">{getWordCount(story.content)} words</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(story.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {story.isFavorite && <Star className="w-4 h-4 text-yellow-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor Content */}
        <div className="flex-1 p-6">
          {coverImageUrl && (
            <div className="mb-6 w-full max-w-sm mx-auto rounded-lg overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700">
              <img src={coverImageUrl} alt="Story Cover" className="w-full h-auto object-cover" />
              <div className="p-2 text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setCoverImageUrl(undefined)} 
                  className="text-red-500 hover:text-red-600"
                >
                  Remove Cover
                </Button>
              </div>
            </div>
          )}

          {/* Title Input */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Enter your story title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-0 focus:text-slate-800 dark:focus:text-white transition-colors"
            />
          </div>

          {/* Rich Text Editor */}
          <div className="prose prose-lg max-w-none">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Start writing your story..."
              className="h-[calc(100vh-350px)] bg-white/90 dark:bg-white/85 rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-300/50 backdrop-blur-sm"
            />
          </div>

          {/* Custom styles for Quill editor */}
          <style jsx global>{`
            .ql-editor {
              color: #475569 !important;
              font-size: 16px !important;
              line-height: 1.7 !important;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            }
            
            .dark .ql-editor {
              color: #1e293b !important;
            }
            
            .ql-editor.ql-blank::before {
              color: #64748b !important;
              font-style: italic;
            }
            
            .ql-toolbar.ql-snow {
              border-top: 1px solid #e2e8f0;
              border-left: 1px solid #e2e8f0;
              border-right: 1px solid #e2e8f0;
              background: rgba(255, 255, 255, 0.8);
              backdrop-filter: blur(10px);
            }
            
            .dark .ql-toolbar.ql-snow {
              border-color: #d1d5db;
              background: rgba(249, 250, 251, 0.9);
            }
            
            .ql-container.ql-snow {
              border-bottom: 1px solid #e2e8f0;
              border-left: 1px solid #e2e8f0;
              border-right: 1px solid #e2e8f0;
            }
            
            .dark .ql-container.ql-snow {
              border-color: #d1d5db;
            }
            
            .ql-editor h1, .ql-editor h2, .ql-editor h3 {
              color: #334155 !important;
            }
            
            .dark .ql-editor h1, .dark .ql-editor h2, .dark .ql-editor h3 {
              color: #0f172a !important;
            }
            
            .ql-editor strong {
              color: #1e293b !important;
            }
            
            .dark .ql-editor strong {
              color: #0f172a !important;
            }
            
            .ql-editor a {
              color: #3b82f6 !important;
            }
            
            .dark .ql-editor a {
              color: #60a5fa !important;
            }
            
            .ql-editor blockquote {
              border-left: 4px solid #e2e8f0;
              color: #64748b !important;
              background: rgba(241, 245, 249, 0.5);
            }
            
            .dark .ql-editor blockquote {
              border-left-color: #475569;
              color: #475569 !important;
              background: rgba(241, 245, 249, 0.3);
            }
            
            .ql-snow .ql-tooltip {
              background: white;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }
            
            .dark .ql-snow .ql-tooltip {
              background: #334155;
              border-color: #475569;
              color: #e2e8f0;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}