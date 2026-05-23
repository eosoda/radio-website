import React from 'react';
import Image from 'next/image';
import * as LucideIcons from 'lucide-react';
import { 
  Cross, 
  Clock, 
  User, 
  ChevronRight, 
  Hammer,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { getServerConfig, getServerPrograms } from '@/firebase/server';

// Client Components
import DynamicNoticeBar from '@/components/DynamicNoticeBar';
import DynamicVerse from '@/components/DynamicVerse';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import HeroPlayerCard from '@/components/HeroPlayerCard';

const DynamicIcon = ({ name, className }: { name?: string, className?: string }) => {
  if (!name) return null;
  const IconComponent = (LucideIcons as any)[name];
  return IconComponent ? <IconComponent className={className} /> : null;
};

// Revalidate this page every 60 seconds (ISR)
export const revalidate = 60;

export default async function Home() {
  const config = await getServerConfig();
  const programs = await getServerPrograms();

  const siteConfig = {
    appName: config?.appName || 'Rádio Maranata',
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
    verseInterval: config?.verseInterval !== undefined ? config.verseInterval : 10,
    verseFontSize: config?.verseFontSize || 'text-3xl md:text-4xl',
    verseFontFamily: config?.verseFontFamily || 'font-headline',
    verseAlign: config?.verseAlign || 'text-center',
    verseTextColor: config?.verseTextColor || '',
    verseBgOpacity: config?.verseBgOpacity !== undefined ? config.verseBgOpacity : 5,
    verseBoxWidth: config?.verseBoxWidth || 'max-w-4xl',
    verseBoxPadding: config?.verseBoxPadding || 'py-24 px-8',
    verseBoxRadius: config?.verseBoxRadius || 'rounded-[3rem]',
    verseBgColor: config?.verseBgColor || '',
    verseIcon: config?.verseIcon || 'Music',
    verseBorderWidth: config?.verseBorderWidth || 'border',
    verseBorderColor: config?.verseBorderColor || '',
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
    copyrightText: config?.copyrightText || 'Rádio Maranata - Todos os direitos reservados.',
    socialMediaLinks: config?.socialMediaLinks || [],
    usefulLinks: config?.usefulLinks || [],
    useDynamicMetadata: config?.useDynamicMetadata === true,
    metadataUrl: config?.metadataUrl || '',
    nowPlayingText: config?.nowPlayingText || 'Sintonizando Rádio Maranata...'
  };

  const worshipImg = PlaceHolderImages.find(img => img.id === 'gospel-worship');
  const studioImg = PlaceHolderImages.find(img => img.id === 'radio-studio');

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

  const rawAppName = siteConfig.appName || 'Rádio Maranata';
  const nameParts = rawAppName.split(' ');
  const firstNamePart = nameParts[0];
  const restNameParts = nameParts.slice(1).join(' ');

  const heroImage = siteConfig.heroBackgroundImageUrl || worshipImg?.imageUrl || "https://picsum.photos/seed/gospel1/1200/800";
  const aboutImage = siteConfig.aboutImageUrl || studioImg?.imageUrl || "https://picsum.photos/seed/radio1/600/400";
  const showAboutImageVisibility = siteConfig.showAboutImage !== false;

  // Lógica para destacar programa "No Ar" usando hora do servidor
  const getCurrentServerProgramId = () => {
    if (!programs || programs.length === 0) return null;
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const currentMinutes = brazilTime.getHours() * 60 + brazilTime.getMinutes();

    let currentProgId = null;
    for (let i = 0; i < programs.length; i++) {
      const prog = programs[i];
      const [h, m] = prog.horario.split(':').map(Number);
      const progMinutes = h * 60 + m;
      
      if (currentMinutes >= progMinutes) {
        currentProgId = prog.id;
      }
    }
    if (!currentProgId && programs.length > 0) {
      currentProgId = programs[programs.length - 1].id;
    }
    return currentProgId;
  };
  const activeProgramId = getCurrentServerProgramId();

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Barra de Avisos Importantes (Client Component) */}
      <DynamicNoticeBar 
        showNoticeBar={siteConfig.showNoticeBar}
        noticeBarFixed={siteConfig.noticeBarFixed}
        noticesList={siteConfig.noticesList}
        noticeBarText={siteConfig.noticeBarText}
        noticeBarIcon={siteConfig.noticeBarIcon}
        noticeBarExpiresAt={siteConfig.noticeBarExpiresAt}
        noticeBarLinkText={siteConfig.noticeBarLinkText}
        noticeBarLinkUrl={siteConfig.noticeBarLinkUrl}
      />

      {/* Container Principal */}
      <div className="relative flex flex-col flex-1 w-full">
        {/* Seletor de Tema Dropdown (Client Component) */}
        <ThemeSwitcher />

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

              {/* Coluna da Direita: Glassmorphic Player Card com Controle de Volume (Client Component) */}
              <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
                <HeroPlayerCard siteConfig={siteConfig} isCleanLayout={false} />
              </div>
            </div>
          ) : siteConfig.heroLayout === 'clean' ? (
            <div className="relative z-10 max-w-md w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 flex flex-col items-center">
              {/* Glassmorphic Player Card (Client Component) */}
              <HeroPlayerCard siteConfig={siteConfig} isCleanLayout={true} />
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
                  {programs.map((prog, idx) => {
                    const isLive = prog.id === activeProgramId;
                    return (
                      <Card key={prog.id} className={cn(
                        "transition-all duration-500 group animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden",
                        isLive ? "border-secondary/50 bg-secondary/5 ring-1 ring-secondary/20" : "border-border teal-glass hover:border-secondary/50"
                      )} style={{ animationDelay: `${idx * 100}ms` }}>
                        {isLive && (
                          <div className="absolute top-0 right-0 p-4 z-10 flex items-center gap-1.5">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
                            </span>
                            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">No Ar</span>
                          </div>
                        )}
                        <CardContent className="p-8 space-y-6 relative z-0">
                          <div className="flex justify-between items-center">
                            <span className={cn(
                              "text-3xl font-black transition-colors duration-500",
                              isLive ? "text-secondary" : "text-secondary/30 group-hover:text-secondary"
                            )}>
                              {prog.horario}
                            </span>
                            <div className={cn(
                              "p-2 rounded-lg transition-opacity",
                              isLive ? "bg-secondary/20 text-secondary opacity-100" : "bg-secondary/10 text-secondary opacity-0 group-hover:opacity-100"
                            )}>
                              <Clock className="h-5 w-5" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h3 className={cn("text-2xl font-headline font-bold", isLive && "text-foreground")}>{prog.name}</h3>
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
                    );
                  })}
                </div>
              </section>
            )}

            {/* Verse of the day (Client Component) */}
            <DynamicVerse 
              showVersiculo={siteConfig.showVersiculo}
              verseInterval={siteConfig.verseInterval}
              versesList={siteConfig.versesList}
              verseText={siteConfig.verseText}
              verseBoxPadding={siteConfig.verseBoxPadding}
              verseBoxRadius={siteConfig.verseBoxRadius}
              verseBoxWidth={siteConfig.verseBoxWidth}
              verseBorderWidth={siteConfig.verseBorderWidth}
              verseBorderColor={siteConfig.verseBorderColor}
              verseBgColor={siteConfig.verseBgColor}
              verseBgOpacity={siteConfig.verseBgOpacity}
              verseAlign={siteConfig.verseAlign}
              verseIcon={siteConfig.verseIcon}
              verseFontSize={siteConfig.verseFontSize}
              verseFontFamily={siteConfig.verseFontFamily}
              verseTextColor={siteConfig.verseTextColor}
            />
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

              {hasSocialLinks && (
                <div className="space-y-8">
                  <h4 className="text-xl font-headline font-bold flex items-center gap-2">
                    <div className="w-8 h-[2px] bg-secondary" />
                    Conecte-se
                  </h4>
                  <div className="flex gap-4">
                    {showInsta && (
                      <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-secondary/10 text-secondary hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 hover:scale-110">
                        <LucideIcons.Instagram className="h-6 w-6" />
                      </a>
                    )}
                    {showFb && (
                      <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-secondary/10 text-secondary hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 hover:scale-110">
                        <LucideIcons.Facebook className="h-6 w-6" />
                      </a>
                    )}
                    {showYt && (
                      <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-secondary/10 text-secondary hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 hover:scale-110">
                        <LucideIcons.Youtube className="h-6 w-6" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground font-light">
              <p>{siteConfig.copyrightText}</p>
              <div className="flex items-center gap-2">
                <DynamicIcon name={siteConfig.footerStatusIcon || 'Radio'} className="h-4 w-4 text-secondary" />
                <span>{siteConfig.footerStatusText}</span>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
