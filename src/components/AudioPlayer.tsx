
"use client"

import React, { useEffect, useRef, useState } from 'react';
import { useAudioStore } from '@/lib/store';
import { Play, Pause, Volume2, VolumeX, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import NowPlaying from './NowPlaying';

/**
 * AudioVisualizer - Componente de barras animadas
 */
const Visualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  return (
    <div className="flex items-end gap-1 h-8 px-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 bg-secondary rounded-full transition-all duration-300",
            isPlaying ? "visualizer-bar" : "h-1"
          )}
          style={{
            animationDelay: isPlaying ? `${i * 0.15}s` : '0s',
            animationDuration: `${0.6 + (i * 0.1)}s`
          }}
        />
      ))}
    </div>
  );
};

export default function AudioPlayer() {
  const [isMounted, setIsMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const configApplied = useRef(false);
  
  const { 
    isPlaying, 
    volume, 
    isMuted, 
    setIsPlaying, 
    setVolume, 
    setIsMuted,
    _hasHydrated
  } = useAudioStore();

  const db = useFirestore();
  const configRef = useMemoFirebase(() => doc(db, 'config', 'main'), [db]);
  const { data: config } = useDoc(configRef);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const streamUrl = config?.streamUrl || 'https://URL:PORT/stream/';
  const showNowPlaying = config?.showNowPlaying !== false;
  const appName = config?.appName || 'Rádio Vida';
  const defaultVolume = config?.defaultVolume !== undefined ? config.defaultVolume : 0.6;
  const autoplayEnabled = config?.autoplay !== false;

  // Sincronização inicial com configurações do Admin
  useEffect(() => {
    if (isMounted && _hasHydrated && config && !configApplied.current) {
      const savedSettings = localStorage.getItem('radio-vida-audio-settings');
      
      // Se não houver configurações salvas, aplica as do admin
      if (!savedSettings) {
        setVolume(defaultVolume);
        setIsPlaying(autoplayEnabled);
      }
      
      configApplied.current = true;
    }
  }, [isMounted, _hasHydrated, config, defaultVolume, autoplayEnabled, setVolume, setIsPlaying]);

  // Lógica principal de reprodução
  useEffect(() => {
    if (audioRef.current && isMounted && _hasHydrated) {
      audioRef.current.volume = isMuted ? 0 : volume;
      
      if (isPlaying) {
        if (audioRef.current.src !== streamUrl) {
          audioRef.current.src = streamUrl;
          audioRef.current.load();
        }
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            console.log("Autoplay bloqueado pelo navegador. Aguardando interação...");
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, volume, isMuted, streamUrl, isMounted, _hasHydrated]);

  // Lógica de Desbloqueio de Áudio em Mobile (User Gesture Unlock)
  useEffect(() => {
    if (!isMounted || !isPlaying) return;

    const handleUserInteraction = () => {
      if (audioRef.current && audioRef.current.paused && isPlaying) {
        audioRef.current.play()
          .then(() => {
            console.log("Áudio desbloqueado com sucesso via interação.");
            cleanup();
          })
          .catch(() => {
            // Se ainda falhar, tentaremos na próxima interação
          });
      }
    };

    const cleanup = () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    return cleanup;
  }, [isPlaying, isMounted]);

  if (!isMounted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-24 border-t border-white/10 teal-glass px-4 flex items-center shadow-2xl">
      <audio 
        ref={audioRef} 
        src={streamUrl} 
        preload="auto" 
        onError={() => setIsPlaying(false)}
      />
      
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
        {/* Lado Esquerdo: Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center bg-primary shrink-0 transition-all duration-500",
            isPlaying && "animate-pulse shadow-[0_0_20px_rgba(42,157,143,0.6)]"
          )}>
            <Radio className="text-secondary h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h4 className="font-headline text-secondary text-sm md:text-base truncate">
              {appName} - Ao Vivo
            </h4>
            {showNowPlaying && (
              <NowPlaying 
                useDynamic={config?.useDynamicMetadata}
                metadataUrl={config?.metadataUrl}
                staticText={config?.nowPlayingText}
              />
            )}
          </div>
          <div className="hidden sm:block">
            <Visualizer isPlaying={isPlaying} />
          </div>
        </div>

        {/* Centro: Play e Volume Mobile */}
        <div className="flex items-center gap-2 md:gap-6">
          {/* Volume Mobile (Popover) */}
          <div className="md:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-secondary hover:bg-secondary/10"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-6 w-6" />
                  ) : (
                    <Volume2 className="h-6 w-6" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="center" className="w-64 p-4 bg-background/95 backdrop-blur-xl border-white/10 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Volume</span>
                    <span className="text-[10px] font-bold text-secondary tabular-nums">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsMuted(!isMuted)} 
                      className="h-8 w-8 text-muted-foreground hover:text-secondary"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Slider 
                      value={[volume * 100]} 
                      max={100} 
                      step={1} 
                      onValueChange={(v) => {
                        setVolume(v[0] / 100);
                        if (v[0] > 0) setIsMuted(false);
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-secondary hover:bg-secondary/90 text-primary-foreground shadow-xl hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="h-8 w-8 md:h-10 md:w-10 fill-current" /> : <Play className="h-8 w-8 md:h-10 md:w-10 fill-current ml-1" />}
          </Button>
        </div>

        {/* Lado Direito: Volume Desktop */}
        <div className="hidden md:flex items-center gap-3 flex-1 justify-end max-w-[240px]">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMuted(!isMuted)} 
            className="text-muted-foreground hover:bg-secondary hover:text-secondary-foreground group"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-5 w-5 group-hover:text-secondary-foreground" />
            ) : (
              <Volume2 className="h-5 w-5 group-hover:text-secondary-foreground" />
            )}
          </Button>
          <div className="flex items-center gap-3 w-full">
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
        </div>
      </div>
    </div>
  );
}
