"use client"

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface NowPlayingProps {
  metadataUrl?: string;
  staticText?: string;
  useDynamic?: boolean;
  className?: string;
}

export default function NowPlaying({ 
  metadataUrl, 
  staticText, 
  useDynamic = false,
  className 
}: NowPlayingProps) {
  const [song, setSong] = useState<string>("Carregando...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!useDynamic) {
      setSong(staticText || "Sintonizando Rádio Maranata...");
      setIsError(false);
      return;
    }

    const fetchSong = async () => {
      try {
        const queryUrl = metadataUrl ? `?url=${encodeURIComponent(metadataUrl)}` : '';
        const res = await fetch(`/api/now-playing${queryUrl}`);
        const data = await res.json();
        
        setSong(data.song);
        setIsError(!!data.error);
      } catch (err) {
        setSong("Erro ao sincronizar rádio");
        setIsError(true);
      }
    };

    fetchSong();
    
    // Atualiza os metadados a cada 50 segundos (50000ms)
    const interval = setInterval(fetchSong, 50000);
    return () => clearInterval(interval);
  }, [useDynamic, metadataUrl, staticText]);

  const shouldAnimate = !isError && song.length > 25;

  return (
    <div className={cn(
      "text-xs transition-all duration-500 max-w-[180px] md:max-w-[250px] overflow-hidden",
      isError ? "text-destructive font-bold" : "text-muted-foreground italic",
      className
    )}>
      <div className="flex items-center overflow-hidden">
        {useDynamic && !isError && (
          <div className="flex items-center gap-1.5 mr-1.5 shrink-0 bg-background/10 backdrop-blur-sm z-10 pr-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            <span className="font-bold not-italic text-[10px] uppercase tracking-tighter">No Ar:</span>
          </div>
        )}
        
        <div className="relative flex-1 overflow-hidden whitespace-nowrap">
          <div className={cn(
            "inline-block whitespace-nowrap",
            shouldAnimate && "animate-marquee"
          )}>
            <span>{song}</span>
            {shouldAnimate && <span className="ml-12">{song}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
