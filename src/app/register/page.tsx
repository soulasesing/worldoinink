'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface FormData {
  name: string;
  email: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  submit?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export default function Register() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [focusedField, setFocusedField] = useState('');
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Initialize particles
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 5 + 2,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2
    })));

    // Animate particles
    const animate = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: particle.y + particle.speed,
        x: particle.x + Math.sin(particle.y * 0.01) * 2
      })));
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const validateField = (name: keyof FormData, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (value.length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors.email = 'Invalid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name as keyof FormData, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      validateField(key as keyof FormData, formData[key as keyof FormData]);
    });

    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', password: '' });
      } else {
        setErrors({ submit: data.message });
      }
    } catch (error) {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    if (password.length < 8) return 2;
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) return 4;
    return 3;
  };

  const getStrengthColor = (strength: number) => {
    switch (strength) {
      case 1: return 'from-red-500 to-red-600';
      case 2: return 'from-yellow-500 to-orange-500';
      case 3: return 'from-blue-500 to-indigo-500';
      case 4: return 'from-green-500 to-emerald-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getStrengthText = (strength: number) => {
    switch (strength) {
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white flex items-center justify-center px-4 relative overflow-hidden">
        {/* Celebration Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-emerald-400/30 to-green-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-bounce" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Floating Success Elements */}
        <div className="absolute top-20 left-10 animate-bounce text-4xl" style={{ animationDelay: '0s' }}>✨</div>
        <div className="absolute top-32 right-20 animate-bounce text-3xl" style={{ animationDelay: '0.5s' }}>🎉</div>
        <div className="absolute bottom-40 left-16 animate-bounce text-4xl" style={{ animationDelay: '1s' }}>📚</div>
        <div className="absolute bottom-20 right-32 animate-bounce text-3xl" style={{ animationDelay: '1.5s' }}>✍️</div>

        <div className="relative z-10 text-center max-w-lg mx-auto">
          <div className="mb-12 relative">
            <div className="relative mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full blur-2xl opacity-50 animate-pulse" />
              <img 
                src="/worldinink_logo.png" 
                alt="World in Ink" 
                className="relative h-32 w-32 mx-auto object-contain drop-shadow-2xl animate-bounce"
              />
            </div>
          </div>
          
          <h2 className="text-6xl font-black mb-6 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
            Welcome to<br />World in Ink!
          </h2>
          
          <p className="text-2xl text-gray-300 mb-10 leading-relaxed">
            Your literary journey begins now.<br />
            <span className="text-emerald-400 font-semibold">Time to create magic with words!</span>
          </p>
          
          <Button 
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white px-12 py-4 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-emerald-500/40 transform hover:scale-110 transition-all duration-500 relative overflow-hidden group"
            onClick={() => window.location.href = '/dashboard'}
          >
            <span className="relative z-10 flex items-center">
              Start Writing ✨
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-[600px] h-[600px] bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)`,
            transition: 'transform 0.6s ease-out'
          }}
        />
        <div 
          className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-indigo-500/15 rounded-full blur-3xl animate-bounce"
          style={{
            animationDelay: '1s',
            transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * 0.02}px)`,
            transition: 'transform 0.4s ease-out'
          }}
        />
        <div 
          className="absolute bottom-1/4 left-0 w-80 h-80 bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-indigo-500/15 rounded-full blur-3xl animate-pulse"
          style={{
            animationDelay: '2s',
            transform: `translate(${mousePosition.x * 0.04}px, ${mousePosition.y * -0.02}px)`,
            transition: 'transform 0.5s ease-out'
          }}
        />
      </div>

      {/* Floating Ink Drops */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            transform: 'translate(-50%, -50%)',
            opacity: particle.opacity
          }}
        >
          <div 
            className="bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full blur-sm animate-pulse"
            style={{
              width: particle.size,
              height: particle.size
            }}
          />
        </div>
      ))}

      {/* Decorative Ink Splashes */}
      <div className="absolute top-16 left-12 animate-bounce text-6xl opacity-20" style={{ animationDelay: '0s' }}>🖋️</div>
      <div className="absolute top-32 right-16 animate-bounce text-4xl opacity-30" style={{ animationDelay: '1s' }}>📖</div>
      <div className="absolute bottom-32 left-20 animate-bounce text-5xl opacity-25" style={{ animationDelay: '2s' }}>✒️</div>
      <div className="absolute bottom-16 right-24 animate-bounce text-4xl opacity-20" style={{ animationDelay: '1.5s' }}>📝</div>

      {/* Main Form Container */}
      <div className="relative z-10 w-full max-w-lg mx-auto">
        <div className="relative">
          {/* Multiple Glowing Borders */}
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Form Container */}
          <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-10 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="mb-6">
                {/* Logo */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-40" />
                    <img 
                      src="/worldinink_logo.png" 
                      alt="World in Ink" 
                      className="relative h-24 w-24 object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>
                <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent leading-tight">
                  World in Ink
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
              </div>
              <p className="text-xl text-gray-300 leading-relaxed">
                Join our creative community and<br />
                <span className="text-purple-400 font-semibold">unleash your storytelling potential</span>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name Field */}
              <div className="relative group">
                <label className="block text-lg font-bold text-gray-200 mb-3 flex items-center">
                  <span className="mr-2">👤</span>
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full px-4 py-3 bg-white/5 border-2 rounded-xl text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:outline-none ${
                      focusedField === 'name' 
                        ? 'border-purple-400 shadow-lg shadow-purple-500/25' 
                        : errors.name 
                        ? 'border-red-400' 
                        : 'border-white/20 hover:border-white/30'
                    }`}
                    placeholder="Enter your full name"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {formData.name && !errors.name && (
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold animate-bounce">✓</div>
                    )}
                  </div>
                </div>
                {errors.name && (
                  <p className="text-red-400 text-sm mt-2 flex items-center animate-shake">
                    <span className="mr-2 text-lg">⚠️</span> {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="relative group">
                <label className="block text-lg font-bold text-gray-200 mb-3 flex items-center">
                  <span className="mr-2">📧</span>
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full px-4 py-3 bg-white/5 border-2 rounded-xl text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:outline-none ${
                      focusedField === 'email' 
                        ? 'border-purple-400 shadow-lg shadow-purple-500/25' 
                        : errors.email 
                        ? 'border-red-400' 
                        : 'border-white/20 hover:border-white/30'
                    }`}
                    placeholder="Enter your email address"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {formData.email && !errors.email && (
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold animate-bounce">✓</div>
                    )}
                  </div>
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm mt-2 flex items-center animate-shake">
                    <span className="mr-2 text-lg">⚠️</span> {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="relative group">
                <label className="block text-lg font-bold text-gray-200 mb-3 flex items-center">
                  <span className="mr-2">🔐</span>
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full px-4 py-3 bg-white/5 border-2 rounded-xl text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:outline-none ${
                      focusedField === 'password' 
                        ? 'border-purple-400 shadow-lg shadow-purple-500/25' 
                        : errors.password 
                        ? 'border-red-400' 
                        : 'border-white/20 hover:border-white/30'
                    }`}
                    placeholder="Create a strong password"
                  />
                </div>
                
                {/* Enhanced Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-300">Password Strength</span>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                        getPasswordStrength(formData.password) >= 3 ? 'bg-green-500/20 text-green-400' : 
                        getPasswordStrength(formData.password) >= 2 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {getStrengthText(getPasswordStrength(formData.password))}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-700 bg-gradient-to-r ${getStrengthColor(getPasswordStrength(formData.password))} shadow-lg`}
                        style={{ width: `${(getPasswordStrength(formData.password) / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-red-400 text-sm mt-2 flex items-center animate-shake">
                    <span className="mr-2 text-lg">⚠️</span> {errors.password}
                  </p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-4 bg-gradient-to-r from-red-500/20 to-red-600/20 border-2 border-red-500/30 rounded-xl backdrop-blur-sm">
                  <p className="text-red-400 text-lg flex items-center font-semibold">
                    <span className="mr-3 text-2xl">❌</span> {errors.submit}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || Object.keys(errors).length > 0}
                className={`w-full py-6 text-xl font-black rounded-2xl shadow-2xl transform transition-all duration-500 relative overflow-hidden group ${
                  isLoading || Object.keys(errors).length > 0
                    ? 'bg-gray-600 cursor-not-allowed scale-95 opacity-50'
                    : 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 hover:scale-110 hover:shadow-purple-500/40 active:scale-105'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span className="text-xl">Creating Your Account...</span>
                  </div>
                ) : (
                  <>
                    <span className="relative z-10 flex items-center justify-center">
                      <span className="mr-3 text-2xl">✨</span>
                      Begin Your Writing Journey
                      <span className="ml-3 text-2xl">✨</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900 text-gray-400">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => window.location.href = '/api/auth/signin/google'}
                className="w-full py-4 text-lg font-bold rounded-xl shadow-2xl transform transition-all duration-300 relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 hover:shadow-purple-500/25"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="relative z-10">Continue with Google</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </div>
              </Button>

              <p className="mt-6 text-gray-400">
                Already have an account?{' '}
                <a href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-300">
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}