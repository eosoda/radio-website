
"use client"

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AudioState {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  streamUrl: string;
  nowPlaying: string;
  theme: 'dark' | 'light' | 'system';
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (muted: boolean) => void;
  setStreamUrl: (url: string) => void;
  setNowPlaying: (track: string) => void;
  togglePlay: () => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      isPlaying: true,
      volume: 0.6, // Alterado de 0.8 para 0.6
      isMuted: false,
      streamUrl: 'https://URL:PORT/stream/',
      nowPlaying: 'Sintonizando Rádio Vida...',
      theme: 'system',
      _hasHydrated: false,
      
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setVolume: (v) => set({ volume: v }),
      setIsMuted: (m) => set({ isMuted: m }),
      setStreamUrl: (url) => set({ streamUrl: url }),
      setNowPlaying: (track) => set({ nowPlaying: track }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setTheme: (t) => set({ theme: t }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'radio-vida-audio-settings',
      partialize: (state) => ({ 
        volume: state.volume, 
        isMuted: state.isMuted,
        theme: state.theme,
        isPlaying: state.isPlaying
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
