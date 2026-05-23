"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useAudioStore } from '@/lib/store';

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useAudioStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute top-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12 bg-background/50 backdrop-blur-md border-secondary/30 text-secondary hover:bg-secondary hover:text-background transition-all shadow-xl"
          >
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : theme === 'light' ? <Sun className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background/90 backdrop-blur-lg border-secondary/20">
          <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2 cursor-pointer focus:bg-secondary focus:text-background">
            <Sun className="h-4 w-4" /> Claro
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2 cursor-pointer focus:bg-secondary focus:text-background">
            <Moon className="h-4 w-4" /> Escuro
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2 cursor-pointer focus:bg-secondary focus:text-background">
            <Monitor className="h-4 w-4" /> Sistema
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
