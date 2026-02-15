"use client"

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import AudioPlayer from '@/components/AudioPlayer';
import { useAudioStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { doc } from 'firebase/firestore';

function DynamicLayout({ children }: { children: React.ReactNode }) {
  const db = useFirestore();
  const configRef = useMemoFirebase(() => doc(db, 'config', 'main'), [db]);
  const { data: config } = useDoc(configRef);

  useEffect(() => {
    if (config?.appName) {
      const slogan = config.slogan ? ` | ${config.slogan}` : '';
      document.title = `${config.appName}${slogan}`;
    }
  }, [config]);

  const isMaintenance = config?.maintenanceMode === true;

  return (
    <>
      {children}
      {!isMaintenance && <AudioPlayer />}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme, _hasHydrated } = useAudioStore();
  const [mounted, setMounted] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    setMounted(true);
    
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
          console.error('Falha ao registrar Service Worker:', err);
        });
      });
    }
  }, []);

  useEffect(() => {
    if (!mounted || !_hasHydrated) return;

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      };
      
      handleChange();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme, mounted, _hasHydrated]);

  const currentThemeClass = mounted && _hasHydrated ? resolvedTheme : 'dark';

  return (
    <html 
      lang="pt-BR" 
      className={cn("scroll-smooth", currentThemeClass)} 
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=PT+Sans:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
        
        {/* Favicon via Emoji */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎙️</text></svg>" />
        
        {/* PWA e Meta Tags Mobile */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00C7A9" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Rádio Vida" />
        <link rel="apple-touch-icon" href="https://picsum.photos/seed/radio-vida-192/192/192" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col pb-24">
        <FirebaseClientProvider>
          <DynamicLayout>
            {children}
          </DynamicLayout>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}