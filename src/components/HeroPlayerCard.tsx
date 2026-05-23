"use client";

import React, { useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAudioStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import NowPlaying from '@/components/NowPlaying';

export default function HeroPlayerCard({ siteConfig, isCleanLayout = false }: any) {
  const { 
    isPlaying, 
    setIsPlaying,
    volume,
    setVolume,
    isMuted,
    setIsMuted
  } = useAudioStore();

  return (
    <div className="w-full p-8 rounded-[2.5rem] border border-secondary/20 bg-background/40 backdrop-blur-xl shadow-2xl flex flex-col items-center space-y-6 relative overflow-hidden group">
      {/* Glow effect */}
      <div className={cn(
        "absolute -inset-10 bg-secondary/10 rounded-full blur-3xl transition-opacity duration-1000",
        isPlaying ? "opacity-100 animate-pulse" : "opacity-0"
      )} />
      
      {/* Header info */}
      <div className="relative text-center space-y-1">
        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-full">
          NO AR
        </span>
        <h2 className="text-2xl font-headline font-bold text-foreground pt-3">{siteConfig.appName}</h2>
        <p className="text-xs text-muted-foreground font-light">{siteConfig.slogan}</p>
      </div>

      {/* Big Play/Pause Button */}
      <div className="relative">
        <Button
          onClick={() => setIsPlaying(!isPlaying)}
          className={cn(
            isCleanLayout ? "h-28 w-28" : "h-24 w-24",
            "rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-2xl transition-all duration-500 flex items-center justify-center",
            isPlaying ? "scale-105 shadow-[0_0_40px_rgba(0,199,169,0.4)]" : "hover:scale-105 animate-bounce scale-110 shadow-secondary/20"
          )}
        >
          {isPlaying ? (
            <LucideIcons.Pause className={cn(isCleanLayout ? "h-12 w-12" : "h-10 w-10", "fill-current text-secondary-foreground")} />
          ) : (
            <LucideIcons.Play className={cn(isCleanLayout ? "h-12 w-12 ml-2" : "h-10 w-10 ml-1", "fill-current text-secondary-foreground")} />
          )}
        </Button>
      </div>

      {/* Track Info (NowPlaying) */}
      <div className="relative w-full flex flex-col items-center space-y-2">
        <NowPlaying 
          useDynamic={siteConfig.useDynamicMetadata}
          metadataUrl={siteConfig.metadataUrl}
          staticText={siteConfig.nowPlayingText}
          className="text-center font-bold text-sm text-foreground not-italic max-w-[280px]"
        />
      </div>

      {/* Volume control - Only in Split layout usually, but we check isCleanLayout */}
      {!isCleanLayout && (
        <div className="relative w-full flex items-center gap-3 px-2 pt-2 border-t border-white/5">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMuted(!isMuted)} 
            className="text-muted-foreground hover:bg-secondary hover:text-secondary-foreground group h-8 w-8 rounded-full"
          >
            {isMuted || volume === 0 ? (
              <LucideIcons.VolumeX className="h-4 w-4 group-hover:text-secondary-foreground" />
            ) : (
              <LucideIcons.Volume2 className="h-4 w-4 group-hover:text-secondary-foreground" />
            )}
          </Button>
          <Slider 
            value={[volume * 100]} 
            max={100} 
            step={1} 
            onValueChange={(v) => {
              setVolume(v[0] / 100);
              if (v[0] > 0) setIsMuted(false);
            }}
            className="flex-1 cursor-pointer"
          />
          <span className="text-[10px] font-bold text-secondary w-8 text-right tabular-nums">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}

      {/* Large visualizer bars */}
      <div className={cn("relative flex items-end justify-center gap-1.5 w-full px-4", isCleanLayout ? "h-12" : "h-10")}>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 bg-secondary rounded-full transition-all duration-300",
              isPlaying ? "hero-visualizer-bar" : "h-1"
            )}
            style={{
              animationDelay: isPlaying ? `${(i % 5) * 0.1}s` : '0s',
              animationDuration: `${0.5 + (i % 3) * 0.15}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
