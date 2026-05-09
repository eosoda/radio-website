
"use client"

import React, { useEffect, useState } from 'react';
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
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAudioStore } from '@/lib/store';
import { cn } from '@/lib/utils';

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
  const { theme, setTheme } = useAudioStore();
  const [mounted, setMounted] = useState(false);
  const [showNoticeBar, setShowNoticeBar] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Config data
  const configRef = useMemoFirebase(() => doc(db, 'config', 'main'), [db]);
  const { data: config, isLoading: isConfigLoading } = useDoc(configRef);

  // Programs data
  const programsRef = useMemoFirebase(() => collection(db, 'programs'), [db]);
  const { data: programs, isLoading: isProgramsLoading } = useCollection(programsRef);

  const siteConfig = config || {
    appName: 'Rádio Vida',
    slogan: 'A voz da esperança 24h',
    logoImageUrl: '',
    logoSize: 320,
    showRadioName: true,
    showRadioSlogan: true,
    showHeroIcon: true,
    showRadioLogo: true,
    maintenanceMode: false,
    showAboutImage: true,
    showNoticeBar: false,
    noticeBarFixed: false,
    noticeBarText: '',
    noticeBarIcon: 'Megaphone',
    noticeBarExpiresAt: '',
    noticeBarLinkText: '',
    noticeBarLinkUrl: '',
    heroBackgroundImageUrl: '',
    showHeroBackground: true,
    aboutImageUrl: '',
    heroBadge1Text: 'AO VIVO 24H',
    heroBadge1Icon: 'Clock',
    heroBadge2Text: 'LOUVOR & ADORAÇÃO',
    heroBadge2Icon: 'Music',
    aboutBadge: 'Nossa Identidade',
    aboutTitle: 'Levando Esperança através das Ondas',
    aboutText: 'Levando a palavra de Deus a todos os lares através do louvor e da edificação espiritual.',
    verseText: '"Lâmpada para os meus pés é tua palavra, e luz para o meu caminho." - Salmos 119:105',
    showAbout: true,
    showProgramacao: true,
    showVersiculo: true,
    showNowPlaying: true,
    showFooter: true,
    showFooterDescription: true,
    footerDescription: 'Levando o evangelho através das ondas sonoras. Uma rádio comprometida com a verdade bíblica e o amor de Cristo para todos os lares.',
    footerStatusText: 'Transmitindo Esperança 24h',
    footerStatusIcon: 'Radio',
    showSocial: true,
    showInstagram: true,
    showFacebook: true,
    showYoutube: true,
    showUsefulLinks: true,
    showContact: true,
    copyrightText: 'Rádio Vida - Todos os direitos reservados.',
    socialMediaLinks: [],
    usefulLinks: []
  };

  // Efeito para validar expiração da barra de avisos apenas no cliente
  useEffect(() => {
    if (mounted && siteConfig.showNoticeBar && siteConfig.noticeBarText) {
      const now = new Date();
      const isNoticeExpired = siteConfig.noticeBarExpiresAt && new Date(siteConfig.noticeBarExpiresAt) < now;
      setShowNoticeBar(!isNoticeExpired);
    } else {
      setShowNoticeBar(false);
    }
  }, [mounted, siteConfig.showNoticeBar, siteConfig.noticeBarText, siteConfig.noticeBarExpiresAt]);

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
      {showNoticeBar && (
        <div className={cn(
          "bg-secondary text-secondary-foreground py-2.5 px-4 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top duration-500 z-[60]",
          siteConfig.noticeBarFixed && "sticky top-0 shadow-lg"
        )}>
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <div className="flex items-center gap-2">
              <DynamicIcon name={siteConfig.noticeBarIcon || 'Megaphone'} className="h-3 w-3 md:h-4 md:w-4" />
              <span>{siteConfig.noticeBarText}</span>
            </div>
            {siteConfig.noticeBarLinkText && siteConfig.noticeBarLinkUrl && (
              <a 
                href={siteConfig.noticeBarLinkUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-foreground/10 hover:bg-secondary-foreground/20 transition-colors border border-secondary-foreground/20 text-[9px] md:text-[11px]"
              >
                {siteConfig.noticeBarLinkText}
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
                className="object-cover opacity-20 scale-105"
                priority
                data-ai-hint={worshipImg?.imageHint || "worship gospel"}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
            </div>
          )}

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
              {siteConfig.heroBadge1Text && (
                <Badge variant="outline" className="text-secondary border-secondary/50 px-6 py-2 text-sm backdrop-blur-md bg-secondary/5">
                  <DynamicIcon name={siteConfig.heroBadge1Icon} className="h-4 w-4 mr-2" />
                  {siteConfig.heroBadge1Text}
                </Badge>
              )}
              {siteConfig.heroBadge2Text && (
                <Badge variant="outline" className="text-secondary border-secondary/50 px-6 py-2 text-sm backdrop-blur-md bg-secondary/5">
                  <DynamicIcon name={siteConfig.heroBadge2Icon} className="h-4 w-4 mr-2" />
                  {siteConfig.heroBadge2Text}
                </Badge>
              )}
            </div>
          </div>
        </section>

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
                  {siteConfig.verseText}
                 </h3>
                 <div className="h-1 w-24 bg-secondary mx-auto rounded-full" />
               </div>
            </section>
          )}
        </div>

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
