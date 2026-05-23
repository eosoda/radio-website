"use client"

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import AudioPlayer from '@/components/AudioPlayer';
import { useAudioStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { doc } from 'firebase/firestore';

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return {
    r: isNaN(r) ? 0 : r,
    g: isNaN(g) ? 0 : g,
    b: isNaN(b) ? 0 : b,
  };
}

function hslToStr({ h, s, l }: { h: number; s: number; l: number }): string {
  return `${h} ${s}% ${l}%`;
}

function getContrastForeground(hex: string): string {
  const hsl = hexToHsl(hex);
  return hsl.l > 60 ? '197 45% 10%' : '210 20% 98%';
}

function getCustomStyleTag(config: any) {
  if (!config) return '';

  const colors = {
    primaryLight: config.primaryColorLight || '#264653',
    secondaryLight: config.secondaryColorLight || '#008f7a',
    bgLight: config.backgroundColorLight || '#f1f5f9',
    textLight: config.textColorLight || '#0f1e24',

    primaryDark: config.primaryColorDark || '#264653',
    secondaryDark: config.secondaryColorDark || '#00c7a9',
    bgDark: config.backgroundColorDark || '#0b1317',
    textDark: config.textColorDark || '#f1f5f9',
  };

  const pL = hexToHsl(colors.primaryLight);
  const sL = hexToHsl(colors.secondaryLight);
  const bgL = hexToHsl(colors.bgLight);
  const tL = hexToHsl(colors.textLight);

  const pD = hexToHsl(colors.primaryDark);
  const sD = hexToHsl(colors.secondaryDark);
  const bgD = hexToHsl(colors.bgDark);
  const tD = hexToHsl(colors.textDark);

  const rgbPL = hexToRgb(colors.primaryLight);
  const rgbPD = hexToRgb(colors.primaryDark);

  const primaryLightStr = hslToStr(pL);
  const primaryFgLightStr = getContrastForeground(colors.primaryLight);
  const secondaryLightStr = hslToStr(sL);
  const secondaryFgLightStr = getContrastForeground(colors.secondaryLight);
  const bgLightStr = hslToStr(bgL);
  const fgLightStr = hslToStr(tL);

  const cardLightStr = hslToStr({ h: bgL.h, s: bgL.s, l: bgL.l > 80 ? Math.max(0, bgL.l - 2) : Math.min(100, bgL.l + 2) });
  const popoverLightStr = hslToStr({ h: bgL.h, s: bgL.s, l: bgL.l > 80 ? 100 : Math.max(0, bgL.l - 2) });
  const borderLightStr = hslToStr({ h: bgL.h, s: bgL.s, l: Math.max(0, bgL.l - 8) });
  const inputLightStr = borderLightStr;
  const ringLightStr = secondaryLightStr;
  const mutedLightStr = hslToStr({ h: bgL.h, s: Math.max(0, bgL.s - 10), l: Math.max(0, bgL.l - 5) });
  const mutedFgLightStr = hslToStr({ h: tL.h, s: Math.max(0, tL.s - 20), l: Math.max(0, Math.min(100, tL.l > 50 ? tL.l - 20 : tL.l + 30)) });

  const primaryDarkStr = hslToStr(pD);
  const primaryFgDarkStr = getContrastForeground(colors.primaryDark);
  const secondaryDarkStr = hslToStr(sD);
  const secondaryFgDarkStr = getContrastForeground(colors.secondaryDark);
  const bgDarkStr = hslToStr(bgD);
  const fgDarkStr = hslToStr(tD);

  const cardDarkStr = hslToStr({ h: bgD.h, s: bgD.s, l: Math.min(100, bgD.l + 4) });
  const popoverDarkStr = hslToStr({ h: bgD.h, s: bgD.s, l: Math.min(100, bgD.l + 2) });
  const borderDarkStr = hslToStr({ h: bgD.h, s: bgD.s, l: Math.min(100, bgD.l + 12) });
  const inputDarkStr = borderDarkStr;
  const ringDarkStr = secondaryDarkStr;
  const mutedDarkStr = hslToStr({ h: bgD.h, s: Math.max(0, bgD.s - 15), l: Math.min(100, bgD.l + 12) });
  const mutedFgDarkStr = hslToStr({ h: tD.h, s: Math.max(0, tD.s - 10), l: Math.max(0, tD.l - 28) });

  return `
    :root {
      --background: ${bgLightStr};
      --foreground: ${fgLightStr};
      --card: ${cardLightStr};
      --card-foreground: ${fgLightStr};
      --popover: ${popoverLightStr};
      --popover-foreground: ${fgLightStr};
      --primary: ${primaryLightStr};
      --primary-foreground: ${primaryFgLightStr};
      --secondary: ${secondaryLightStr};
      --secondary-foreground: ${secondaryFgLightStr};
      --muted: ${mutedLightStr};
      --muted-foreground: ${mutedFgLightStr};
      --accent: ${secondaryLightStr};
      --accent-foreground: ${secondaryFgLightStr};
      --border: ${borderLightStr};
      --input: ${inputLightStr};
      --ring: ${ringLightStr};
    }

    .light .teal-glass {
      background: rgba(255, 255, 255, 0.85) !important;
      border: 1px solid rgba(${rgbPL.r}, ${rgbPL.g}, ${rgbPL.b}, 0.08) !important;
    }

    .dark {
      --background: ${bgDarkStr};
      --foreground: ${fgDarkStr};
      --card: ${cardDarkStr};
      --card-foreground: ${fgDarkStr};
      --popover: ${popoverDarkStr};
      --popover-foreground: ${fgDarkStr};
      --primary: ${primaryDarkStr};
      --primary-foreground: ${primaryFgDarkStr};
      --secondary: ${secondaryDarkStr};
      --secondary-foreground: ${secondaryFgDarkStr};
      --muted: ${mutedDarkStr};
      --muted-foreground: ${mutedFgDarkStr};
      --accent: ${secondaryDarkStr};
      --accent-foreground: ${secondaryFgDarkStr};
      --border: ${borderDarkStr};
      --input: ${inputDarkStr};
      --ring: ${ringDarkStr};
    }

    .teal-glass {
      background: rgba(${rgbPD.r}, ${rgbPD.g}, ${rgbPD.b}, 0.75) !important;
    }
  `;
}

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
  const showBottomPlayer = config?.showBottomPlayer !== false;

  const styles = getCustomStyleTag(config);
  const { theme, _hasHydrated } = useAudioStore();

  useEffect(() => {
    if (config) {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor && _hasHydrated) {
        const isDark = document.documentElement.classList.contains('dark');
        const color = isDark 
          ? (config.primaryColorDark || '#0b1317') 
          : (config.primaryColorLight || '#264653');
        metaThemeColor.setAttribute('content', color);
      }
    }
  }, [config, theme, _hasHydrated]);

  return (
    <>
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      <div className={cn("flex-1 flex flex-col w-full", !isMaintenance && showBottomPlayer && "pb-24")}>
        {children}
      </div>
      {!isMaintenance && showBottomPlayer && <AudioPlayer />}
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
        <meta name="apple-mobile-web-app-title" content="Rádio Maranata" />
        <link rel="apple-touch-icon" href="https://picsum.photos/seed/radio-maranata-192/192/192" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
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