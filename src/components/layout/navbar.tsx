'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
// Using CSS icons instead of lucide-react

export function Navbar() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        isScrolled 
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-purple-500/10' 
          : 'bg-transparent backdrop-blur-sm'
      }`}>
        {/* Animated gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 opacity-50 animate-pulse" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link href="/" className="group flex items-center space-x-3 mr-8">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                  <img 
                    src="/worldinink_logo.png" 
                    alt="World in Ink" 
                    className="relative h-10 w-10 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  World in Ink
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {[
                  { href: '/dashboard', label: 'Dashboard' },
                  { href: '/library', label: 'Lector' },
                  { href: '/editor', label: 'Editor' },
                  { href: '/style', label: 'Mi Estilo' },
                  { href: '/characters', label: 'Characters' }
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300"
                  >
                    <span className="relative z-10">{item.label}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 group-hover:w-full group-hover:left-0" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {session ? (
                <div className="hidden md:flex items-center space-x-4">
                  {/* User Avatar */}
                  <div className="flex items-center space-x-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <div className="text-white text-sm">👤</div>
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse" />
                    </div>
                    <span className="text-sm font-medium text-white">
                      {session.user?.email?.split('@')[0]}
                    </span>
                  </div>
                  
                  {/* Sign Out Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    className="group relative overflow-hidden bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white border border-red-500/30 hover:border-red-500/50 transition-all duration-300"
                  >
                    <span className="mr-2 group-hover:rotate-12 transition-transform duration-300">🚪</span>
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-300"
                    >
                      <span className="relative z-10">Sign in</span> 
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="sm"
                      className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
                    >
                      <span className="relative z-10">Sign up</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-cyan-500 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-white hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <div className="h-5 w-5 flex items-center justify-center text-lg">✕</div>
                ) : (
                  <div className="h-5 w-5 flex items-center justify-center text-lg">☰</div>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Animated bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
        isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsMobileMenuOpen(false)} />
        
        {/* Menu Content */}
        <div className={`absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}>
          <div className="px-6 py-8 space-y-6">
            {/* Navigation Links */}
            <div className="space-y-4">
              {[
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/library', label: 'Lector' },
                { href: '/editor', label: 'Editor' },
                { href: '/style', label: 'Mi Estilo' },
                { href: '/characters', label: 'Characters' }
              ].map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                    <span className="text-lg font-medium text-white">{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="pt-6 border-t border-white/10">
              {session ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <div className="text-white text-lg">👤</div>
                    </div>
                    <div>
                      <div className="text-white font-medium">Welcome back!</div>
                      <div className="text-gray-400 text-sm">{session.user?.email}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => signOut()}
                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white border border-red-500/30 hover:border-red-500/50"
                  >
                    <span className="mr-2">🚪</span>
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link href="/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant="ghost" 
                      className="w-full text-gray-300 hover:text-white hover:bg-white/10 border border-white/20"
                    >
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/register" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg"
                    >
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}