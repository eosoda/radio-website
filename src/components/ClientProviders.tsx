"use client";

import React, { useEffect, useState } from 'react';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import AudioPlayer from '@/components/AudioPlayer';
import DynamicBackground from '@/components/DynamicBackground';
import { useAudioStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function ClientProviders({ 
  children,
  showBottomPlayer,
  initialThemeColor
}: { 
  children: React.ReactNode;
  showBottomPlayer: boolean;
  initialThemeColor: string;
}) {
  const [mounted, setMounted] = useState(false);
  const { theme, _hasHydrated } = useAudioStore();

  useEffect(() => {
    setMounted(true);
    
    // Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
          console.error('Falha ao registrar Service Worker:', err);
        });
      });
    }
  }, []);

  // Update theme color meta tag based on user preference
  useEffect(() => {
    if (mounted && _hasHydrated) {
      const isDark = document.documentElement.classList.contains('dark');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDark ? initialThemeColor : initialThemeColor); // Simplify this later if you want different light/dark theme-color
      }
    }
  }, [theme, mounted, _hasHydrated, initialThemeColor]);

  // Handle theme class
  useEffect(() => {
    if (!mounted || !_hasHydrated) return;

    const html = document.documentElement;
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (mediaQuery.matches) {
          html.classList.add('dark');
          html.classList.remove('light');
        } else {
          html.classList.add('light');
          html.classList.remove('dark');
        }
      };
      
      handleChange();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      if (theme === 'dark') {
        html.classList.add('dark');
        html.classList.remove('light');
      } else {
        html.classList.add('light');
        html.classList.remove('dark');
      }
    }
  }, [theme, mounted, _hasHydrated]);

  return (
    <FirebaseClientProvider>
      <div className={cn("flex-1 flex flex-col w-full animate-in fade-in duration-500", showBottomPlayer && "pb-24")}>
        <DynamicBackground />
        {children}
      </div>
      {showBottomPlayer && <AudioPlayer />}
      <Toaster />
    </FirebaseClientProvider>
  );
}
