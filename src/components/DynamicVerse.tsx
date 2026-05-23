"use client";

import React, { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Music } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DynamicVerse({
  showVersiculo,
  verseInterval,
  versesList,
  verseText,
  verseBoxPadding,
  verseBoxRadius,
  verseBoxWidth,
  verseBorderWidth,
  verseBorderColor,
  verseBgColor,
  verseBgOpacity,
  verseAlign,
  verseIcon,
  verseFontSize,
  verseFontFamily,
  verseTextColor
}: any) {
  const [mounted, setMounted] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState('');

  useEffect(() => {
    setMounted(true);
    // Initial random selection
    let chosen = '';
    const list = versesList || [];
    if (list.length > 0) {
      const randomIndex = Math.floor(Math.random() * list.length);
      chosen = list[randomIndex];
    } else if (verseText) {
      chosen = verseText;
    } else {
      chosen = '"Lâmpada para os meus pés é tua palavra, e luz para o meu caminho." - Salmos 119:105';
    }
    setSelectedVerse(chosen);
  }, [versesList, verseText]);

  useEffect(() => {
    if (!mounted || !showVersiculo || verseInterval === 0 || !versesList || versesList.length <= 1) return;
    
    const interval = setInterval(() => {
      setSelectedVerse(current => {
        const list = versesList;
        const currentIndex = list.indexOf(current);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % list.length;
        return list[nextIndex];
      });
    }, verseInterval * 1000);
    
    return () => clearInterval(interval);
  }, [mounted, showVersiculo, verseInterval, versesList]);

  if (!showVersiculo) return null;

  // Since we are hydrating, we must output valid styles.
  // We can recreate hexToRgb here since it's client side.
  const hexToRgbLocal = (hex: string) => {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    return {
      r: parseInt(hex.substring(0, 2), 16) || 0,
      g: parseInt(hex.substring(2, 4), 16) || 0,
      b: parseInt(hex.substring(4, 6), 16) || 0,
    };
  };

  const bgColorRgb = verseBgColor ? hexToRgbLocal(verseBgColor) : { r: 0, g: 199, b: 169 };
  const opacity = (verseBgOpacity !== undefined ? verseBgOpacity : 5) / 100;

  return (
    <section 
      className={cn(
        "relative flex items-center justify-center transition-all duration-300 shadow-[inset_0_0_100px_rgba(38,70,83,0.05)] mx-auto overflow-hidden group",
        verseBoxPadding || 'py-24 px-8',
        verseBoxRadius || 'rounded-[3rem]',
        verseBoxWidth || 'max-w-4xl',
        verseBorderWidth || 'border',
        !verseBorderColor && "border-secondary/20"
      )}
      style={{
        backgroundColor: `rgba(${bgColorRgb.r}, ${bgColorRgb.g}, ${bgColorRgb.b}, ${opacity})`,
        borderColor: verseBorderColor || undefined
      }}
    >
        <div className={cn("relative z-10 w-full space-y-8", verseAlign)}>
          <div className={cn("inline-block p-4 rounded-full bg-secondary/10 animate-bounce", verseAlign === "text-center" ? "mx-auto" : "")}>
            {(() => {
              const IconComponent = verseIcon ? (LucideIcons as any)[verseIcon] : null;
              return IconComponent ? <IconComponent className="h-8 w-8 text-secondary" /> : <Music className="h-8 w-8 text-secondary" />;
            })()}
          </div>
          
          <div className="relative min-h-[120px] flex items-center" style={{ justifyContent: verseAlign === "text-center" ? "center" : verseAlign === "text-right" ? "flex-end" : "flex-start" }}>
            <h3 
              key={selectedVerse}
              className={cn(
                verseFontSize, 
                verseFontFamily,
                "italic leading-relaxed drop-shadow-lg transition-all duration-300 animate-in fade-in zoom-in-95"
              )}
              style={{ color: verseTextColor || 'inherit' }}
            >
            {selectedVerse ? (
              selectedVerse
            ) : (
              <span className="inline-block h-8 bg-secondary/20 animate-pulse rounded w-3/4" />
            )}
            </h3>
          </div>
          
          <div className={cn("h-1 w-24 bg-secondary rounded-full", verseAlign === "text-center" ? "mx-auto" : "")} />
        </div>
    </section>
  );
}
