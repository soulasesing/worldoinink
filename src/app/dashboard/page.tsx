'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit3, 
  Clock, 
  TrendingUp, 
  Users, 
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  FileText,
  Sparkles,
  ArrowRight,
  Settings,
  Search,
  Filter,
  MoreVertical,
  Star
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

// Define the Story type (matching the structure of your data)
interface Story {
  id: number; // Based on your provided data
  title: string;
  description: string;
  genre: string;
  status: 'Published' | 'Draft'; // Based on your provided data
  wordCount: number;
  views: number;
  likes: number;
  comments: number;
  lastModified: string; // Or Date if parsed
  coverColor: string;
  isFavorite?: boolean; // Added based on editor page
}

// Define a User type based on your simulated data, including properties from NextAuth session
interface User {
  name: string | null | undefined;
  email: string | null | undefined;
  avatar?: string; // Added avatar property
  joinDate?: string; // Added joinDate property
  storiesWritten?: number; // Added storiesWritten property
  totalViews?: number; // Added totalViews property
  followers?: number; // Added followers property
}

export default function DashboardPage() {
  // Explicitly type the user state, allowing null initially
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Explicitly type the stories state
  const [stories, setStories] = useState<Story[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { data: session, status } = useSession();
  const router = useRouter();

  // Authentication and data loading
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
    } else if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // Use session user data if available
      if (session?.user) {
           setUser({
              name: session.user.name,
              email: session.user.email,
              // You might fetch additional user details from your backend here
              avatar: session.user.name ? session.user.name[0]?.toUpperCase() : '👤',
              joinDate: 'N/A', // Placeholder
              storiesWritten: 0, // Placeholder
              totalViews: 0, // Placeholder
              followers: 0 // Placeholder
           });
      } else {
          // Handle case where session user is null after authentication
           setUser(null);
      }

      // Simulate loading stories data (replace with actual API call later)
       const timer = setTimeout(() => {
          setStories([
            {
              id: 1,
              title: 'The Enchanted Forest',
              description: 'A magical adventure through mystical woods where ancient secrets await discovery.',
              genre: 'Fantasy',
              status: 'Published',
              wordCount: 2500,
              views: 1200,
              likes: 45,
              comments: 12,
              lastModified: '2024-06-03',
              coverColor: 'from-emerald-400 to-teal-600'
            },
            {
              id: 2,
              title: 'Digital Dreams',
              description: 'A cyberpunk thriller exploring the boundaries between reality and virtual worlds.',
              genre: 'Sci-Fi',
              status: 'Draft',
              wordCount: 1800,
              views: 0,
              likes: 0,
              comments: 0,
              lastModified: '2024-06-05',
              coverColor: 'from-purple-400 to-pink-600'
            },
            {
              id: 3,
              title: 'Ocean\'s Whisper',
              description: 'A maritime mystery following a lighthouse keeper\'s dark secrets.',
              genre: 'Mystery',
              status: 'Published',
              wordCount: 3200,
              views: 890,
              likes: 28,
              comments: 7,
              lastModified: '2024-05-28',
              coverColor: 'from-blue-400 to-cyan-600'
            }
          ]);

          setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }
  }, [status, router, session]); // Depend on status, router, and session

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || story.status.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-white mb-2">Loading your stories...</h2>
          <p className="text-gray-400">Please wait while we prepare your dashboard</p>
        </div>
      </div>
    );
  }

  // Add a check for null user after loading
  if (!user) {
       // Redirect to login if user is null after loading (should be caught by unauthenticated status, but as a fallback)
       router.push('/login');
       return null; // Or a minimal loading/error state
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
      <div className="h-24  pt-24" >
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
              {/* Add onClick handlers or wrap in Link if needed */}
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

      {/* Container for main content to clear fixed navbar */}
      <div className="pt-32"> {/* Increased top padding significantly to clear the fixed header */}

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> {/* Removed any conflicting pt/mt classes */}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { icon: FileText, label: 'Stories Written', value: user.storiesWritten || 0, color: 'from-blue-500 to-cyan-500' },
              { icon: Eye, label: 'Total Views', value: user.totalViews || 0, color: 'from-green-500 to-emerald-500' },
              { icon: Users, label: 'Followers', value: user.followers || 0, color: 'from-purple-500 to-pink-500' },
              { icon: Star, label: 'Avg Rating', value: '4.8', color: 'from-orange-500 to-red-500' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} p-3 group-hover:scale-110 transition-transform duration-300`}>
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
                <p className="text-gray-400">Manage and continue your creative works</p>
              </div>

              {/* Search and Filter */}
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
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Stories</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>
              </div>
            </div>

            {/* Stories Grid */}
            {filteredStories.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No stories found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start your writing journey by creating your first story'}
                </p>
                <Link href="/editor?id=new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Story
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredStories.map((story) => (
                  <div key={story.id} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-6 hover:from-white/15 hover:to-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl">

                    {/* Story Cover */}
                    <div className={`w-full h-32 rounded-lg bg-gradient-to-r ${story.coverColor} mb-4 relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          story.status === 'Published'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        }`}>
                          {story.status}
                        </span>
                      </div>
                    </div>

                    {/* Story Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                          {story.title}
                        </h3>
                        <p className="text-sm text-gray-400">{story.genre}</p>
                      </div>

                      <p className="text-gray-300 text-sm line-clamp-2">
                        {story.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>{story.wordCount.toLocaleString()} words</span>
                        <span>{story.lastModified}</span>
                      </div>

                      {story.status === 'Published' && (
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {story.views}
                          </span>
                          <span className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            {story.likes}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {story.comments}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <Link href={`/editor?id=${story.id}`}>
                          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </Link>

                        {story.status === 'Published' && (
                          <Link href={`/story/${story.id}`}>
                            <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </Link>
                        )}

                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-300">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/20 rounded-xl p-6 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">AI Writing Assistant</h3>
                  <p className="text-gray-400 text-sm">Get help with character development and plot ideas</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-white/20 rounded-xl p-6 hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Analytics Dashboard</h3>
                  <p className="text-gray-400 text-sm">Track your story performance and reader engagement</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}