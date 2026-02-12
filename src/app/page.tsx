'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

import { 
  Sparkles, 
  Zap, 
  BarChart3, 
  Users, 
  BookOpen, 
  PenTool, 
  Brain, 
  Globe, 
  ArrowRight,
  Star,
  CheckCircle,
  Feather,
  Palette,
  Target,
  Lightbulb
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI Character Creation",
      description: "Generate unique characters with detailed backstories and personality traits using advanced AI.",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/10 to-pink-500/10"
    },
    {
      icon: Zap,
      title: "Smart Grammar Checker", 
      description: "Polish your writing with advanced grammar and style suggestions powered by AI.",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10"
    },
    {
      icon: BarChart3,
      title: "Story Analytics",
      description: "Track your story's performance with detailed analytics and reader engagement metrics.",
      gradient: "from-green-500 to-emerald-500", 
      bgGradient: "from-green-500/10 to-emerald-500/10"
    }
  ];

  const exploreFeatures = [
    {
      icon: Palette,
      title: "Creative Inspiration",
      description: "Unlock your creativity with AI-powered prompts, story starters, and creative exercises designed to spark your imagination.",
      link: "/features/inspiration",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Target,
      title: "Publishing Tools",
      description: "Format, publish, and distribute your stories across multiple platforms with our comprehensive publishing suite.",
      link: "/features/publishing", 
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Users,
      title: "Writer Community",
      description: "Connect with fellow writers, share feedback, collaborate on projects, and grow together in our vibrant community.",
      link: "/community",
      gradient: "from-teal-500 to-cyan-500"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Writers" },
    { number: "1M+", label: "Stories Created" },
    { number: "4.9", label: "Average Rating" },
    { number: "99%", label: "Uptime" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-pink-500/15 to-orange-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-green-500/15 to-cyan-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Animated Grid */}
        <div 
          className="absolute inset-0 opacity-30 animate-pulse"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        ></div>
        
        {/* Mouse Follower */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192
          }}
        ></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          
          {/* Animated Badge */}
          <div className={`inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-8 transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="text-sm font-medium">AI-Powered Writing Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className={`text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-8 transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{transitionDelay: '200ms'}}>
            Bring Your Stories to Life with{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
              World in Ink
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{transitionDelay: '400ms'}}>
            A revolutionary digital writing platform that helps creators craft compelling stories with 
            <span className="text-blue-400 font-semibold"> AI-assisted tools</span>, 
            <span className="text-purple-400 font-semibold"> character development</span>, and 
            <span className="text-pink-400 font-semibold"> seamless collaboration</span>.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row justify-center gap-6 mb-16 transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{transitionDelay: '600ms'}}>
            <Link href="/register">
              <Button size="lg" className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none px-12 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300">
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-12 py-4 text-lg font-semibold rounded-full border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 transform hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{transitionDelay: '800ms'}}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/10 rounded-full px-6 py-2 mb-6">
              <Feather className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Core Features</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold mb-6">
              Features for <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Writers</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to create your next masterpiece, powered by cutting-edge AI technology
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                  
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} p-4 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">
                      {feature.description}
                    </p>
                    
                    {/* Hover Arrow */}
                    <div className="mt-6 flex items-center text-transparent group-hover:text-blue-400 transition-all duration-300">
                      <span className="font-medium">Learn More</span>
                      <ArrowRight className="w-4 h-4 ml-2 transform translate-x-0 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Explore Features Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-white/10 rounded-full px-6 py-2 mb-6">
              <Lightbulb className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-sm font-medium text-purple-300">Discover More</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold mb-6">
              Explore <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover what World in Ink can do for your creative journey
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {exploreFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg border border-white/20 p-8 hover:border-white/40 transition-all duration-700 hover:scale-105 hover:shadow-2xl">
                  
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-700`}></div>
                  
                  {/* Floating Icon */}
                  <div className="relative z-10 mb-6">
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${feature.gradient} p-5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-2xl`}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 space-y-4">
                    <h3 className="text-2xl font-bold text-white group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">
                      {feature.description}
                    </p>
                    
                    {/* CTA Link */}
                    <div className="pt-4">
                      <Link href={feature.link} className={`inline-flex items-center space-x-2 text-transparent bg-gradient-to-r ${feature.gradient} bg-clip-text group-hover:text-white transition-all duration-300 font-semibold`}>
                        <span>Explore Now</span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
                      </Link>
                    </div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-white/20 rounded-full group-hover:bg-white/40 transition-colors"></div>
                  <div className="absolute top-8 right-8 w-1 h-1 bg-white/20 rounded-full group-hover:bg-white/40 transition-colors"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>
          
          {/* Content */}
          <div className="relative z-10 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-12 lg:p-16">
            
            {/* Icon */}
            <div className="inline-flex w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 items-center justify-center mb-8">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            
            {/* Heading */}
            <h2 className="text-4xl sm:text-6xl font-bold mb-6">
              Ready to Start <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Writing?</span>
            </h2>
            
            {/* Description */}
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of writers who are already creating amazing stories with our AI-powered platform. Start your creative journey today!
            </p>
            
            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {['Free to Start', 'No Credit Card', 'AI-Powered', '24/7 Support'].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>
            
            {/* CTA Button */}
            <Link href="/register">
              <Button size="lg" className="group relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-none px-16 py-6 text-xl font-bold rounded-full shadow-2xl hover:shadow-purple-500/25 transform hover:scale-110 transition-all duration-300">
                <span className="relative z-10 flex items-center space-x-3">
                  <span>Create Your Account</span>
                  <Star className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}