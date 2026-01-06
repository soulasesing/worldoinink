'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Eye,
  Heart,
  FileText,
  Sparkles,
  ArrowRight,
  Settings,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { StoryCard } from '@/components/dashboard/story-card';
import { StoryCardSkeleton } from '@/components/dashboard/story-card-skeleton';
import { Story, UserStats, StoryFilter } from '@/types/story';
import { cn } from '@/lib/utils';

// User type from session
interface User {
  name: string | null | undefined;
  email: string | null | undefined;
  avatar?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    storiesWritten: 0,
    totalViews: 0,
    totalLikes: 0,
    publishedCount: 0,
    draftCount: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<StoryFilter>('all');

  const { data: session, status } = useSession();
  const router = useRouter();

  // Authentication and user setup
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
    } else if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user) {
      setUser({
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.name ? session.user.name[0]?.toUpperCase() : '👤',
      });
      loadStories();
    }
  }, [status, router, session]);

  // Load stories from API
  const loadStories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/stories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }
      
      const data: Story[] = await response.json();
      setStories(data);
      calculateUserStats(data);
      
    } catch (error) {
      console.error('Error loading stories:', error);
      setError('Failed to load stories. Please try again.');
      toast.error('Failed to load stories');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate user statistics
  const calculateUserStats = (stories: Story[]) => {
    const stats: UserStats = {
      storiesWritten: stories.length,
      totalViews: stories.reduce((sum, s) => sum + s.views, 0),
      totalLikes: stories.reduce((sum, s) => sum + s.likes, 0),
      publishedCount: stories.filter(s => s.published).length,
      draftCount: stories.filter(s => !s.published).length,
    };
    
    setUserStats(stats);
  };

  // Delete story
  const handleDeleteStory = async (storyId: string) => {
    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete story');
      }

      toast.success('Story deleted successfully');
      loadStories(); // Reload stories
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('Failed to delete story');
    }
  };

  // Filter stories
  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' ? true :
      filterType === 'published' ? story.published :
      filterType === 'draft' ? !story.published :
      true;
    
    return matchesSearch && matchesFilter;
  });

  // Loading state
  if (isLoading && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Loading your stories...</h2>
          <p className="text-gray-400">Please wait while we prepare your dashboard</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => {
            setError(null);
            loadStories();
          }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // User check
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-500/8 to-orange-500/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <div className="h-24 pt-24">
        <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                  {user.avatar}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
                  <p className="text-gray-400">Ready to continue your writing journey?</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Link href="/editor?id=new">
                  <Button size="lg" className="shadow-lg">
                    <Plus className="w-5 h-5 mr-2" />
                    New Story
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content */}
      <div className="pt-32">
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { 
                icon: FileText, 
                label: 'Stories Written', 
                value: userStats.storiesWritten, 
                color: 'from-blue-500 to-cyan-500' 
              },
              { 
                icon: Eye, 
                label: 'Total Views', 
                value: userStats.totalViews, 
                color: 'from-green-500 to-emerald-500' 
              },
              { 
                icon: Heart, 
                label: 'Total Likes', 
                value: userStats.totalLikes, 
                color: 'from-purple-500 to-pink-500' 
              },
              { 
                icon: BookOpen, 
                label: 'Published', 
                value: userStats.publishedCount, 
                color: 'from-orange-500 to-red-500' 
              }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-lg bg-gradient-to-r p-3 group-hover:scale-110 transition-transform duration-300",
                      stat.color
                    )}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stories Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Your Stories</h2>
                <p className="text-gray-400">
                  {stories.length} {stories.length === 1 ? 'story' : 'stories'} total
                </p>
              </div>

              {/* Search, Filter and Refresh */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search stories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as StoryFilter)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Stories</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadStories}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={cn(
                    "w-4 h-4",
                    isLoading && "animate-spin"
                  )} />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>

            {/* Stories Grid */}
            {filteredStories.length === 0 && !isLoading ? (
              <div className="text-center py-16">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">
                  {searchTerm ? 'No stories found' : 'Start Your Writing Journey'}
                </h3>
                
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  {searchTerm 
                    ? 'Try adjusting your search terms or filters' 
                    : 'Create your first story and let your imagination flow with AI-powered assistance'}
                </p>
                
                <Link href="/editor?id=new">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Story
                  </Button>
                </Link>
              </div>
            ) : isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1,2,3,4,5,6].map(i => <StoryCardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredStories.map((story, index) => (
                  <div
                    key={story.id}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animation: 'fadeInUp 0.5s ease-out backwards'
                    }}
                  >
                    <StoryCard 
                      story={story}
                      onDelete={handleDeleteStory}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/editor?id=new">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/20 rounded-xl p-6 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">Start Writing</h3>
                    <p className="text-gray-400 text-sm">Begin a new story with AI assistance</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>

            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-white/20 rounded-xl p-6 hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">View Analytics</h3>
                  <p className="text-gray-400 text-sm">Track your story performance and engagement</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
