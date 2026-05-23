"use client";

import React, { useEffect, useState } from 'react';
import { useAudioStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function DynamicBackground() {
  const { isPlaying } = useAudioStore();
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate percentage
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Background base */}
      <div className="absolute inset-0 bg-background" />

      {/* Aurora glow 1 (Secondary color) */}
      <div 
        className={cn(
          "absolute w-[80vw] h-[80vh] rounded-full mix-blend-screen opacity-20 dark:opacity-30 blur-[100px] bg-secondary/60 transition-all duration-1000",
          isPlaying ? "animate-aurora-pulse-fast" : "animate-aurora-pulse"
        )}
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Aurora glow 2 (Primary color) */}
      <div 
        className={cn(
          "absolute w-[70vw] h-[70vh] rounded-full mix-blend-screen opacity-20 dark:opacity-30 blur-[100px] bg-primary/60 transition-all",
          isPlaying ? "animate-aurora-pulse-fast delay-75" : "animate-aurora-pulse delay-75"
        )}
        style={{
          transitionDuration: '1500ms',
          left: `${100 - mousePosition.x}%`,
          top: `${100 - mousePosition.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      
      {/* Aurora glow 3 (Accent color or just white/teal mix) */}
      <div 
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[50vh] mix-blend-overlay opacity-10 blur-[120px] bg-gradient-to-r from-secondary via-primary to-secondary transition-all",
          isPlaying ? "scale-110 opacity-30" : "scale-100"
        )}
        style={{ transitionDuration: '2000ms' }}
      />
      
      {/* Noise overlay for texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
