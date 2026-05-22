
"use client"

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import * as LucideIcons from 'lucide-react';
import { 
  Cross, 
  Instagram, 
  Facebook, 
  Youtube, 
  Clock, 
  User, 
  Music, 
  Radio, 
  ChevronRight, 
  Moon, 
  Sun,
  Monitor,
  Hammer,
  Sparkles,
  Megaphone,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAudioStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import NowPlaying from '@/components/NowPlaying';

/**
 * Componente para renderizar dinamicamente um ícone da Lucide
 */
const DynamicIcon = ({ name, className }: { name?: string, className?: string }) => {
  if (!name) return null;
  const IconComponent = (LucideIcons as any)[name];
  return IconComponent ? <IconComponent className={className} /> : null;
};

export default function Home() {
  const db = useFirestore();
  const { 
    theme, 
    setTheme, 
    isPlaying, 
    setIsPlaying,
    volume,
    setVolume,
    isMuted,
    setIsMuted
  } = useAudioStore();
  const [mounted, setMounted] = useState(false);
  const [activeNotices, setActiveNotices] = useState<any[]>([]);
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  const [selectedVerse, setSelectedVerse] = useState('');
  const [prevVersesListStr, setPrevVersesListStr] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Config data
  const configRef = useMemoFirebase(() => doc(db, 'config', 'main'), [db]);
  const { data: config, isLoading: isConfigLoading } = useDoc(configRef);

  // Programs data
  const programsRef = useMemoFirebase(() => collection(db, 'programs'), [db]);
  const { data: programs, isLoading: isProgramsLoading } = useCollection(programsRef);

  const siteConfig = useMemo(() => {
    return {
      appName: config?.appName || 'Rádio Vida',
      slogan: config?.slogan || 'A voz da esperança 24h',
      logoImageUrl: config?.logoImageUrl || '',
      logoSize: config?.logoSize !== undefined ? config.logoSize : 320,
      showRadioName: config?.showRadioName !== false,
      showRadioSlogan: config?.showRadioSlogan !== false,
      showHeroIcon: config?.showHeroIcon !== false,
      showRadioLogo: config?.showRadioLogo !== false,
      showHeroBadge1: config?.showHeroBadge1 !== false,
      showHeroBadge2: config?.showHeroBadge2 !== false,
      maintenanceMode: config?.maintenanceMode === true,
      showAboutImage: config?.showAboutImage !== false,
      showNoticeBar: config?.showNoticeBar === true,
      noticeBarFixed: config?.noticeBarFixed === true,
      noticeBarText: config?.noticeBarText || '',
      noticeBarIcon: config?.noticeBarIcon || 'Megaphone',
      noticeBarExpiresAt: config?.noticeBarExpiresAt || '',
      noticeBarLinkText: config?.noticeBarLinkText || '',
      noticeBarLinkUrl: config?.noticeBarLinkUrl || '',
      heroBackgroundImageUrl: config?.heroBackgroundImageUrl || '',
      showHeroBackground: config?.showHeroBackground !== false,
      heroBgOpacity: config?.heroBgOpacity !== undefined ? config.heroBgOpacity : 0.2,
      heroOverlayOpacity: config?.heroOverlayOpacity !== undefined ? config.heroOverlayOpacity : 0.6,
      heroLayout: config?.heroLayout || 'classic',
      noticesList: config?.noticesList || [],
      aboutImageUrl: config?.aboutImageUrl || '',
      heroBadge1Text: config?.heroBadge1Text || 'AO VIVO 24H',
      heroBadge1Icon: config?.heroBadge1Icon || 'Clock',
      heroBadge2Text: config?.heroBadge2Text || 'LOUVOR & ADORAÇÃO',
      heroBadge2Icon: config?.heroBadge2Icon || 'Music',
      aboutBadge: config?.aboutBadge || 'Nossa Identidade',
      aboutTitle: config?.aboutTitle || 'Levando Esperança através das Ondas',
      aboutText: config?.aboutText || 'Levando a palavra de Deus a todos os lares através do louvor e da edificação espiritual.',
      verseText: config?.verseText || '"Lâmpada para os meus pés é tua palavra, e luz para o meu caminho." - Salmos 119:105',
      versesList: config?.versesList || [
        '"Lâmpada para os meus pés é tua palavra, e luz para o meu caminho." - Salmos 119:105',
        '"Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna." - João 3:16',
        '"O Senhor é o meu pastor, nada me faltará." - Salmos 23:1',
        '"Tudo posso naquele que me fortalece." - Filipenses 4:13',
        '"Não fui eu que ordenei a você? Seja forte e corajoso! Não se apavore nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar." - Josué 1:9'
      ],
      showAbout: config?.showAbout !== false,
      showProgramacao: config?.showProgramacao !== false,
      showVersiculo: config?.showVersiculo !== false,
      showNowPlaying: config?.showNowPlaying !== false,
      showFooter: config?.showFooter !== false,
      showFooterDescription: config?.showFooterDescription !== false,
      footerDescription: config?.footerDescription || 'Levando o evangelho através das ondas sonoras. Uma rádio comprometida com a verdade bíblica e o amor de Cristo para todos os lares.',
      footerStatusText: config?.footerStatusText || 'Transmitindo Esperança 24h',
      footerStatusIcon: config?.footerStatusIcon || 'Radio',
      showSocial: config?.showSocial !== false,
      showInstagram: config?.showInstagram !== false,
      showFacebook: config?.showFacebook !== false,
      showYoutube: config?.showYoutube !== false,
      showUsefulLinks: config?.showUsefulLinks !== false,
      showContact: config?.showContact !== false,
      copyrightText: config?.copyrightText || 'Rádio Vida - Todos os direitos reservados.',
      socialMediaLinks: config?.socialMediaLinks || [],
      usefulLinks: config?.usefulLinks || [],
      useDynamicMetadata: config?.useDynamicMetadata === true,
      metadataUrl: config?.metadataUrl || '',
      nowPlayingText: config?.nowPlayingText || 'Sintonizando Rádio Vida...'
    };
  }, [config]);

  const noticesListStr = JSON.stringify(siteConfig.noticesList);
  const versesListStr = JSON.stringify(siteConfig.versesList);

  // Seleciona um versículo aleatório durante a renderização para evitar flashes/layout shift
  if (mounted && versesListStr !== prevVersesListStr) {
    const list = siteConfig.versesList || [];
    let chosen = '';
    if (list.length > 0) {
      const randomIndex = Math.floor(Math.random() * list.length);
      chosen = list[randomIndex];
    } else if (siteConfig.verseText) {
      chosen = siteConfig.verseText;
    } else {
      chosen = '"Lâmpada para os meus pés é tua palavra, e luz para o meu caminho." - Salmos 119:105';
    }
    setPrevVersesListStr(versesListStr);
    setSelectedVerse(chosen);
  }

  // Efeito para validar e filtrar avisos ativos apenas no cliente
  useEffect(() => {
    if (mounted && siteConfig.showNoticeBar) {
      const now = new Date();
      let list: any[] = [];
      
      if (siteConfig.noticesList && siteConfig.noticesList.length > 0) {
        list = siteConfig.noticesList.filter((notice: any) => {
          if (!notice.text) return false;
          if (!notice.expiresAt) return true;
          return new Date(notice.expiresAt) > now;
        });
      } else if (siteConfig.noticeBarText) {
        const isNoticeExpired = siteConfig.noticeBarExpiresAt && new Date(siteConfig.noticeBarExpiresAt) < now;
        if (!isNoticeExpired) {
          list = [{
            id: 'legacy',
            text: siteConfig.noticeBarText,
            icon: siteConfig.noticeBarIcon || 'Megaphone',
            linkText: siteConfig.noticeBarLinkText,
            linkUrl: siteConfig.noticeBarLinkUrl
          }];
        }
      }
      
      setActiveNotices(list);
      setCurrentNoticeIndex(0);
    } else {
      setActiveNotices([]);
    }
  }, [mounted, siteConfig.showNoticeBar, noticesListStr, siteConfig.noticeBarText, siteConfig.noticeBarExpiresAt, siteConfig.noticeBarIcon, siteConfig.noticeBarLinkText, siteConfig.noticeBarLinkUrl]);

  // Efeito para rodar o carrossel de avisos a cada 5 segundos
  useEffect(() => {
    if (activeNotices.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentNoticeIndex((prevIndex) => (prevIndex + 1) % activeNotices.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeNotices]);


  const worshipImg = PlaceHolderImages.find(img => img.id === 'gospel-worship');
  const studioImg = PlaceHolderImages.find(img => img.id === 'radio-studio');

  if (isConfigLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Radio className="h-12 w-12 text-secondary animate-pulse" />
      </div>
    );
  }

  // Modo de Manutenção
  if (siteConfig.maintenanceMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/10 via-background to-background p-6 text-center">
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-700">
           <div className="relative inline-block p-6 rounded-3xl bg-secondary/10 ring-1 ring-secondary/30">
              <Hammer className="h-16 w-16 text-secondary animate-bounce" />
              <div className="absolute -top-2 -right-2">
                 <Sparkles className="h-6 w-6 text-secondary animate-pulse" />
              </div>
           </div>
           <div className="space-y-4">
              <h1 className="text-5xl font-black font-headline tracking-tighter">
                Voltamos <span className="text-secondary">Logo</span>
              </h1>
              <p className="text-muted-foreground text-lg font-light leading-relaxed">
                Estamos preparando novidades incríveis para edificar sua vida. Sintonize a sua paciência, voltaremos em breve!
              </p>
           </div>
           <div className="pt-8 border-t border-white/5">
              <p className="text-xs uppercase tracking-[0.3em] text-secondary font-bold">
                {siteConfig.appName} — {siteConfig.slogan}
              </p>
           </div>
        </div>
      </div>
    );
  }

  const [instagramUrl, facebookUrl, youtubeUrl] = siteConfig.socialMediaLinks || [];
  const showInsta = siteConfig.showInstagram !== false && instagramUrl;
  const showFb = siteConfig.showFacebook !== false && facebookUrl;
  const showYt = siteConfig.showYoutube !== false && youtubeUrl;
  const hasSocialLinks = siteConfig.showSocial && (showInsta || showFb || showYt);
  const usefulLinks = siteConfig.usefulLinks || [];

  const rawAppName = siteConfig.appName || 'Rádio Vida';
  const nameParts = rawAppName.split(' ');
  const firstNamePart = nameParts[0];
  const restNameParts = nameParts.slice(1).join(' ');

  const heroImage = siteConfig.heroBackgroundImageUrl || worshipImg?.imageUrl || "https://picsum.photos/seed/gospel1/1200/800";
  const aboutImage = siteConfig.aboutImageUrl || studioImg?.imageUrl || "https://picsum.photos/seed/radio1/600/400";
  const showAboutImageVisibility = siteConfig.showAboutImage !== false;

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Barra de Avisos Importantes */}
      {activeNotices.length > 0 && (
        <div className={cn(
          "bg-secondary text-secondary-foreground py-2.5 px-4 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest z-[60]",
          siteConfig.noticeBarFixed && "sticky top-0 shadow-lg"
        )}>
          <div 
            key={activeNotices[currentNoticeIndex]?.id || currentNoticeIndex}
            className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 animate-in fade-in duration-500"
          >
            <div className="flex items-center gap-2">
              <DynamicIcon name={activeNotices[currentNoticeIndex]?.icon || 'Megaphone'} className="h-3 w-3 md:h-4 md:w-4" />
              <span>{activeNotices[currentNoticeIndex]?.text}</span>
            </div>
            {activeNotices[currentNoticeIndex]?.linkText && activeNotices[currentNoticeIndex]?.linkUrl && (
              <a 
                href={activeNotices[currentNoticeIndex]?.linkUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-foreground/10 hover:bg-secondary-foreground/20 transition-colors border border-secondary-foreground/20 text-[9px] md:text-[11px]"
              >
                {activeNotices[currentNoticeIndex]?.linkText}
                <ArrowRight className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Container Principal */}
      <div className="relative flex flex-col flex-1 w-full">
        {/* Seletor de Tema Dropdown */}
        {mounted && (
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
        )}

        {/* Hero Section */}
        <section className="relative h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          {siteConfig.showHeroBackground !== false && (
            <div className="absolute inset-0 z-0">
              <Image 
                src={heroImage}
                alt="Hero Background"
                fill
                style={{ opacity: siteConfig.heroBgOpacity }}
                className="object-cover scale-105"
                priority
                data-ai-hint={worshipImg?.imageHint || "worship gospel"}
              />
              <div 
                style={{ opacity: siteConfig.heroOverlayOpacity }}
                className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" 
              />
            </div>
          )}

          {siteConfig.heroLayout === 'split' ? (
            <div className="relative z-10 max-w-6xl w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 grid grid-cols-1 md:grid-cols-2 items-center gap-12 text-center md:text-left">
              {/* Coluna da Esquerda: Logo / Ícone + Nome, Slogan e Badges */}
              <div className="flex flex-col items-center md:items-start space-y-6">
                {siteConfig.logoImageUrl && siteConfig.showRadioLogo !== false ? (
                  <div 
                    className="relative transition-all duration-300"
                    style={{ 
                      width: `${Math.min(siteConfig.logoSize || 320, 400)}px`, 
                      height: `${Math.min(siteConfig.logoSize || 320, 400)}px`,
                      maxWidth: '100%' 
                    }}
                  >
                    <Image 
                      src={siteConfig.logoImageUrl}
                      alt="Logo da Rádio"
                      fill
                      className="object-contain drop-shadow-2xl"
                      priority
                    />
                  </div>
                ) : (
                  siteConfig.showHeroIcon !== false && (
                    <div className="relative p-1 rounded-full bg-secondary/20 ring-1 ring-secondary/50">
                      <Cross className="h-28 w-28 text-secondary" />
                      <div className="absolute inset-0 blur-2xl bg-secondary/30 rounded-full -z-10" />
                    </div>
                  )
                )}

                {siteConfig.showRadioName !== false && (
                  <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-foreground">
                    {firstNamePart} <span className="text-secondary">{restNameParts}</span>
                  </h1>
                )}

                {siteConfig.showRadioSlogan !== false && (
                  <p className="text-lg md:text-xl font-body text-muted-foreground uppercase tracking-[0.2em] max-w-lg">
                    {siteConfig.slogan}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-4 pt-4">
                  {siteConfig.heroBadge1Text && siteConfig.showHeroBadge1 !== false && (
                    <Badge variant="outline" className="text-secondary border-secondary/50 px-5 py-2 text-xs backdrop-blur-md bg-secondary/5">
                      <DynamicIcon name={siteConfig.heroBadge1Icon} className="h-3.5 w-3.5 mr-2" />
                      {siteConfig.heroBadge1Text}
                    </Badge>
                  )}
                  {siteConfig.heroBadge2Text && siteConfig.showHeroBadge2 !== false && (
                    <Badge variant="outline" className="text-secondary border-secondary/50 px-5 py-2 text-xs backdrop-blur-md bg-secondary/5">
                      <DynamicIcon name={siteConfig.heroBadge2Icon} className="h-3.5 w-3.5 mr-2" />
                      {siteConfig.heroBadge2Text}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Coluna da Direita: Glassmorphic Player Card com Controle de Volume */}
              <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
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
                        "h-24 w-24 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-2xl transition-all duration-500 flex items-center justify-center",
                        isPlaying ? "scale-105 shadow-[0_0_40px_rgba(0,199,169,0.4)]" : "hover:scale-105 animate-bounce scale-110 shadow-secondary/20"
                      )}
                    >
                      {isPlaying ? (
                        <LucideIcons.Pause className="h-10 w-10 fill-current text-secondary-foreground" />
                      ) : (
                        <LucideIcons.Play className="h-10 w-10 fill-current text-secondary-foreground ml-1" />
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

                  {/* Volume control */}
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

                  {/* Large visualizer bars */}
                  <div className="relative flex items-end justify-center gap-1.5 h-10 w-full px-4">
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
              </div>
            </div>
          ) : siteConfig.heroLayout === 'clean' ? (
            <div className="relative z-10 max-w-md w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 flex flex-col items-center">
              {/* Glassmorphic Player Card */}
              <div className="w-full p-8 rounded-[2.5rem] border border-secondary/20 bg-background/40 backdrop-blur-xl shadow-2xl flex flex-col items-center space-y-8 relative overflow-hidden group">
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
                      "h-28 w-28 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-2xl transition-all duration-500 flex items-center justify-center",
                      isPlaying ? "scale-105 shadow-[0_0_40px_rgba(0,199,169,0.4)]" : "hover:scale-105 animate-bounce scale-110 shadow-secondary/20"
                    )}
                  >
                    {isPlaying ? (
                      <LucideIcons.Pause className="h-12 w-12 fill-current text-secondary-foreground" />
                    ) : (
                      <LucideIcons.Play className="h-12 w-12 fill-current text-secondary-foreground ml-2" />
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

                {/* Large visualizer bars */}
                <div className="relative flex items-end justify-center gap-1.5 h-12 w-full px-4">
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
            </div>
          ) : (
            <div className="relative z-10 max-w-4xl animate-in fade-in slide-in-from-bottom-12 duration-1000 flex flex-col items-center">
              {siteConfig.logoImageUrl && siteConfig.showRadioLogo !== false && (
                <div className="flex justify-center mb-12">
                  <div 
                    className="relative transition-all duration-300"
                    style={{ 
                      width: `${siteConfig.logoSize || 320}px`, 
                      height: `${siteConfig.logoSize || 320}px`,
                      maxWidth: '100%' 
                    }}
                  >
                    <Image 
                      src={siteConfig.logoImageUrl}
                      alt="Logo da Rádio"
                      fill
                      className="object-contain drop-shadow-2xl"
                      priority
                    />
                  </div>
                </div>
              )}

              {siteConfig.showHeroIcon !== false && (
                <div className="flex justify-center mb-8">
                  <div className="relative p-1 rounded-full bg-secondary/20 ring-1 ring-secondary/50">
                    <Cross className="h-20 w-20 text-secondary" />
                    <div className="absolute inset-0 blur-2xl bg-secondary/30 rounded-full -z-10" />
                  </div>
                </div>
              )}

              {siteConfig.showRadioName !== false && (
                <h1 className="text-6xl md:text-9xl font-black font-headline mb-6 tracking-tighter text-foreground text-center">
                  {firstNamePart} <span className="text-secondary">{restNameParts}</span>
                </h1>
              )}

              {siteConfig.showRadioSlogan !== false && (
                <p className="text-xl md:text-2xl font-body text-muted-foreground uppercase tracking-[0.3em] mb-12 text-center">
                  {siteConfig.slogan}
                </p>
              )}
              
              <div className="flex flex-wrap justify-center gap-6">
                {siteConfig.heroBadge1Text && siteConfig.showHeroBadge1 !== false && (
                  <Badge variant="outline" className="text-secondary border-secondary/50 px-6 py-2 text-sm backdrop-blur-md bg-secondary/5">
                    <DynamicIcon name={siteConfig.heroBadge1Icon} className="h-4 w-4 mr-2" />
                    {siteConfig.heroBadge1Text}
                  </Badge>
                )}
                {siteConfig.heroBadge2Text && siteConfig.showHeroBadge2 !== false && (
                  <Badge variant="outline" className="text-secondary border-secondary/50 px-6 py-2 text-sm backdrop-blur-md bg-secondary/5">
                    <DynamicIcon name={siteConfig.heroBadge2Icon} className="h-4 w-4 mr-2" />
                    {siteConfig.heroBadge2Text}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </section>

        {(siteConfig.showAbout || (siteConfig.showProgramacao && programs && programs.length > 0) || siteConfig.showVersiculo) && (
          <div className="max-w-7xl mx-auto w-full px-6 space-y-40 mb-32">
            {/* About Section */}
            {siteConfig.showAbout && (
              <section id="sobre" className={cn(
                "grid gap-20 items-center",
                showAboutImageVisibility ? "md:grid-cols-2" : "grid-cols-1 max-w-4xl mx-auto text-center"
              )}>
                <div className="space-y-8 animate-in slide-in-from-left duration-700">
                  <div className="space-y-2">
                    <span className="text-secondary font-bold tracking-widest uppercase text-sm">
                      {siteConfig.aboutBadge || 'Nossa Identidade'}
                    </span>
                    <h2 className="text-5xl font-headline font-bold leading-tight">
                      {siteConfig.aboutTitle || 'Levando Esperança através das Ondas'}
                    </h2>
                  </div>
                  <p className="text-xl leading-relaxed text-muted-foreground/90 font-light">
                    {siteConfig.aboutText}
                  </p>
                </div>
                
                {showAboutImageVisibility && (
                  <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl group animate-in slide-in-from-right duration-700">
                    <Image 
                      src={aboutImage}
                      alt="Estúdio"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      data-ai-hint={studioImg?.imageHint || "radio studio"}
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl" />
                  </div>
                )}
              </section>
            )}

            {/* Schedule Section */}
            {siteConfig.showProgramacao && programs && programs.length > 0 && (
              <section id="programacao" className="space-y-16">
                <div className="text-center space-y-4">
                  <h2 className="text-5xl font-headline font-bold text-secondary">Programação Diária</h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Momentos de edificação, louvor e palavra reservados para você sintonizar a sua fé.</p>
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {programs.map((prog, idx) => (
                    <Card key={prog.id} className="border-border teal-glass hover:border-secondary/50 transition-all duration-500 group animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                      <CardContent className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                          <span className="text-3xl font-black text-secondary/30 group-hover:text-secondary transition-colors duration-500">{prog.horario}</span>
                          <div className="p-2 rounded-lg bg-secondary/10 text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                            <Clock className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-2xl font-headline font-bold">{prog.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-secondary/80 font-bold uppercase tracking-wider">
                            <User className="h-4 w-4" />
                            <span>{prog.presenter}</span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                            {prog.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Verse of the day */}
            {siteConfig.showVersiculo && (
              <section className="relative py-24 px-8 text-center bg-secondary/5 rounded-[3rem] border border-secondary/20 overflow-hidden group shadow-[inset_0_0_100px_rgba(38,70,83,0.05)]">
                 <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                   <div className="inline-block p-4 rounded-full bg-secondary/10 animate-bounce">
                      <Music className="h-8 w-8 text-secondary" />
                   </div>
                   <h3 className="text-3xl md:text-4xl font-headline italic leading-relaxed drop-shadow-lg">
                    {selectedVerse ? (
                      selectedVerse
                    ) : (
                      <span className="inline-block h-8 bg-secondary/20 animate-pulse rounded w-3/4 mx-auto" />
                    )}
                   </h3>
                   <div className="h-1 w-24 bg-secondary mx-auto rounded-full" />
                 </div>
              </section>
            )}
          </div>
        )}

        {/* Footer */}
        {siteConfig.showFooter !== false && (
          <footer className="border-t border-border bg-card/30 pt-24 pb-40 px-6 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
              {siteConfig.showFooterDescription !== false && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 text-3xl font-headline font-bold text-secondary">
                    <div className="p-2 rounded-lg bg-secondary/20">
                      <Cross className="h-8 w-8" />
                    </div>
                    <span>{rawAppName}</span>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed font-light">
                    {siteConfig.footerDescription || 'Levando o evangelho através das ondas sonoras. Uma rádio comprometida com a verdade bíblica e o amor de Cristo para todos os lares.'}
                  </p>
                </div>
              )}
              
              {siteConfig.showUsefulLinks && (
                <div className="space-y-8">
                  <h4 className="text-xl font-headline font-bold flex items-center gap-2">
                    <div className="w-8 h-[2px] bg-secondary" />
                    Links Úteis
                  </h4>
                  <ul className="grid grid-cols-1 gap-4 text-muted-foreground text-base">
                    {usefulLinks.map((link: { url: string; label: string }, i: number) => (
                      <li key={i}>
                        <a href={link.url} className="hover:text-secondary hover:translate-x-2 transition-all inline-flex items-center gap-2 group">
                          <ChevronRight className="h-4 w-4 text-secondary/50 group-hover:text-secondary" />
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {siteConfig.showContact && (
                <div className="space-y-8">
                   <h4 className="text-xl font-headline font-bold flex items-center gap-2">
                     <div className="w-8 h-[2px] bg-secondary" />
                     Social
                   </h4>
                   <ul className="space-y-5 text-muted-foreground">
                    {hasSocialLinks && (
                      <li className="flex items-center gap-6 pt-2">
                        {showInsta && (
                          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary hover:text-background transition-all transform hover:-translate-y-2">
                            <Instagram className="h-6 w-6" />
                          </a>
                        )}
                        {showFb && (
                          <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary hover:text-background transition-all transform hover:-translate-y-2">
                            <Facebook className="h-6 w-6" />
                          </a>
                        )}
                        {showYt && (
                          <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary hover:text-background transition-all transform hover:-translate-y-2">
                            <Youtube className="h-6 w-6" />
                          </a>
                        )}
                      </li>
                    )}
                   </ul>
                </div>
              )}
            </div>
            
            <div className="max-w-7xl mx-auto border-t border-border mt-24 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} {rawAppName} - {siteConfig.copyrightText}</p>
              <p className="flex items-center gap-2">
                <DynamicIcon name={siteConfig.footerStatusIcon || 'Radio'} className="h-4 w-4 text-secondary" /> 
                {siteConfig.footerStatusText || 'Transmitindo Esperança 24h'}
              </p>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
