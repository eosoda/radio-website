
"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, collection } from 'firebase/firestore';
import { 
  useAuth, 
  useFirestore, 
  useUser, 
  useDoc, 
  useCollection, 
  useMemoFirebase,
  setDocumentNonBlocking,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking
} from '@/firebase';
import { useAudioStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  LayoutDashboard, 
  Radio as RadioIcon, 
  ListMusic, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Save, 
  Music, 
  Share2, 
  Pencil, 
  Link as LinkIcon,
  Info,
  Waves,
  Sun,
  Moon,
  Monitor,
  Clock,
  Heart,
  Star,
  Play,
  Mic,
  Cross,
  BookOpen,
  Eye,
  AlertTriangle,
  Megaphone,
  Sparkles,
  ImageIcon,
  CalendarDays,
  ExternalLink,
  Calendar as CalendarIcon,
  Menu,
  Pin,
  ArrowUp,
  ArrowDown,
  Instagram,
  Facebook,
  Youtube
} from 'lucide-react';

const ICON_OPTIONS = [
  { value: 'Clock', label: 'Relógio', icon: Clock },
  { value: 'Music', label: 'Música', icon: Music },
  { value: 'Radio', label: 'Rádio', icon: RadioIcon },
  { value: 'Heart', label: 'Coração', icon: Heart },
  { value: 'Star', label: 'Estrela', icon: Star },
  { value: 'Play', label: 'Play', icon: Play },
  { value: 'Mic', label: 'Microfone', icon: Mic },
  { value: 'Cross', label: 'Cruz', icon: Cross },
  { value: 'Megaphone', label: 'Megafone', icon: Megaphone },
  { value: 'Sparkles', label: 'Destaque', icon: Sparkles },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { theme, setTheme } = useAudioStore();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router]);

  const configRef = useMemoFirebase(() => doc(db, 'config', 'main'), [db]);
  const { data: config, isLoading: isConfigLoading } = useDoc(configRef);

  const programsRef = useMemoFirebase(() => collection(db, 'programs'), [db]);
  const { data: programs } = useCollection(programsRef);

  const [localConfig, setLocalConfig] = useState<any>(null);
  const [editingProgId, setEditingProgId] = useState<string | null>(null);
  const [newProg, setNewProg] = useState({
    horario: '',
    name: '',
    presenter: '',
    description: ''
  });

  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    facebook: '',
    youtube: ''
  });

  const [usefulLinks, setUsefulLinks] = useState<{ label: string; url: string }[]>([]);
  const [newLink, setNewLink] = useState({ label: '', url: '' });
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
      const sLinks = config.socialMediaLinks || ['', '', ''];
      setSocialLinks({
        instagram: sLinks[0] || '',
        facebook: sLinks[1] || '',
        youtube: sLinks[2] || ''
      });
      setUsefulLinks(config.usefulLinks || []);
    } else if (!isConfigLoading) {
      setLocalConfig({
        appName: 'Rádio Vida',
        slogan: 'A Voz da Esperança 24h',
        maintenanceMode: false,
        showNoticeBar: false,
        noticeBarFixed: false,
        noticeBarText: '',
        noticeBarIcon: 'Megaphone',
        noticeBarExpiresAt: '',
        noticeBarLinkText: '',
        noticeBarLinkUrl: '',
        heroBackgroundImageUrl: '',
        showHeroBackground: true,
        heroBadge1Text: 'AO VIVO 24H',
        heroBadge1Icon: 'Clock',
        heroBadge2Text: 'LOUVOR & ADORAÇÃO',
        heroBadge2Icon: 'Music',
        streamUrl: 'https://URL:PORT/stream/',
        autoplay: true,
        metadataUrl: 'https://URL:PORT/currentsong',
        useDynamicMetadata: true,
        defaultVolume: 0.6,
        defaultTheme: 'dark',
        nowPlayingText: 'Sintonizando Rádio Vida...',
        aboutBadge: 'Nossa Identidade',
        aboutTitle: 'Levando Esperança através das Ondas',
        aboutText: 'Levando a palavra de Deus a todos os lares através do louvor e da edificação espiritual.',
        aboutImageUrl: '',
        showAboutImage: true,
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
        socialMediaLinks: ['', '', ''],
        usefulLinks: []
      });
    }
  }, [config, isConfigLoading]);

  const handleSaveConfig = () => {
    if (!localConfig) return;
    
    const updatedConfig = {
      ...localConfig,
      socialMediaLinks: [socialLinks.instagram, socialLinks.facebook, socialLinks.youtube],
      usefulLinks: usefulLinks
    };
    
    setDocumentNonBlocking(configRef, updatedConfig, { merge: true });
    toast({ title: "Configuração Salva", description: "As alterações foram aplicadas imediatamente." });
  };

  const handleAddProgram = () => {
    if (!newProg.horario || !newProg.name || !newProg.presenter) {
      toast({ variant: "destructive", title: "Preencha os campos obrigatórios" });
      return;
    }
    
    if (editingProgId) {
      const progRef = doc(db, 'programs', editingProgId);
      updateDocumentNonBlocking(progRef, newProg);
      setEditingProgId(null);
      toast({ title: "Programa Atualizado" });
    } else {
      addDocumentNonBlocking(programsRef, newProg);
      toast({ title: "Programa Adicionado" });
    }
    
    setNewProg({ horario: '', name: '', presenter: '', description: '' });
  };

  const handleEditProgram = (item: any) => {
    setNewProg({
      horario: item.horario,
      name: item.name,
      presenter: item.presenter,
      description: item.description || ''
    });
    setEditingProgId(item.id);
  };

  const handleDeleteProgram = (id: string) => {
    const progRef = doc(db, 'programs', id);
    deleteDocumentNonBlocking(progRef);
    toast({ title: "Programa Removido" });
  };

  const handleAddUsefulLink = () => {
    if (!newLink.label || !newLink.url) {
      toast({ variant: "destructive", title: "Preencha o nome e a URL do link" });
      return;
    }
    
    if (editingLinkIndex !== null) {
      const updatedLinks = [...usefulLinks];
      updatedLinks[editingLinkIndex] = newLink;
      setUsefulLinks(updatedLinks);
      setEditingLinkIndex(null);
      toast({ title: "Link Atualizado" });
    } else {
      setUsefulLinks([...usefulLinks, newLink]);
      toast({ title: "Link Adicionado" });
    }
    
    setNewLink({ label: '', url: '' });
  };

  const handleEditUsefulLink = (index: number) => {
    const linkToEdit = usefulLinks[index];
    setNewLink({ label: linkToEdit.label, url: linkToEdit.url });
    setEditingLinkIndex(index);
  };

  const handleRemoveUsefulLink = (index: number) => {
    setUsefulLinks(usefulLinks.filter((_, i) => i !== index));
    if (editingLinkIndex === index) {
      setEditingLinkIndex(null);
      setNewLink({ label: '', url: '' });
    }
  };

  const handleMoveLink = (index: number, direction: 'up' | 'down') => {
    const newLinks = [...usefulLinks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newLinks.length) return;
    
    [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
    setUsefulLinks(newLinks);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const expiresAtDate = localConfig?.noticeBarExpiresAt ? parseISO(localConfig.noticeBarExpiresAt) : undefined;

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RadioIcon className="h-12 w-12 text-secondary animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isConfigLoading || !localConfig) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <RadioIcon className="h-12 w-12 text-secondary animate-pulse" />
    </div>
  );

  const SidebarContentNav = () => (
    <div className="flex flex-col h-full py-4 px-2 space-y-6">
      <div className="flex items-center gap-2 px-4 text-xl font-headline text-secondary">
        <RadioIcon className="h-6 w-6" />
        <span>Admin Vida</span>
      </div>
      <nav className="flex-1 space-y-1">
        <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-secondary/10 hover:text-secondary bg-secondary/5 text-secondary">
          <LayoutDashboard className="h-4 w-4" /> Painel Geral
        </Button>
      </nav>
      <Button variant="destructive" onClick={handleLogout} className="w-full justify-start gap-3 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20">
        <LogOut className="h-4 w-4" /> Sair
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      <aside className="w-64 border-r border-white/5 bg-card/50 hidden md:flex flex-col">
        <SidebarContentNav />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-white/5 p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9 border-white/10">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] p-0 bg-card border-r-white/10">
                    <SheetHeader className="p-4 sr-only">
                      <SheetTitle>Menu de Navegação</SheetTitle>
                    </SheetHeader>
                    <SidebarContentNav />
                  </SheetContent>
                </Sheet>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-headline font-bold truncate">Gerenciar Rádio</h1>
                <p className="text-muted-foreground text-[10px] md:text-xs">Ajustes em tempo real</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
               <Button asChild variant="outline" size="sm" className="rounded-full border-secondary/30 text-secondary hover:bg-secondary hover:text-background transition-all h-9 px-3">
                 <a href="/" target="_blank" rel="noopener noreferrer">
                   <Eye className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Ver Site</span>
                 </a>
               </Button>
               <Button onClick={handleSaveConfig} className="bg-secondary text-primary-foreground hover:bg-secondary/90 font-bold shadow-lg shadow-secondary/20 h-9 px-3">
                 <Save className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Salvar</span>
               </Button>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full border-secondary/30 text-secondary hover:bg-secondary hover:text-background transition-all h-9 w-9"
                    >
                      {theme === 'dark' ? <Moon className="h-4 w-4" /> : theme === 'light' ? <Sun className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2 cursor-pointer">
                      <Sun className="h-4 w-4" /> Claro
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2 cursor-pointer">
                      <Moon className="h-4 w-4" /> Escuro
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2 cursor-pointer">
                      <Monitor className="h-4 w-4" /> Sistema
                    </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-32">
          <Tabs defaultValue="geral" className="space-y-6">
            <TabsList className="bg-card/50 border border-white/5 p-1 h-auto flex flex-wrap justify-start gap-1">
              <TabsTrigger value="geral" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-primary-foreground">
                 <Info className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Geral</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-primary-foreground">
                 <BookOpen className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Sobre</span>
              </TabsTrigger>
              <TabsTrigger value="stream" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-primary-foreground">
                 <Waves className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Stream</span>
              </TabsTrigger>
              <TabsTrigger value="footer" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-primary-foreground">
                 <LayoutDashboard className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Rodapé</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-primary-foreground">
                 <ListMusic className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Grade</span>
              </TabsTrigger>
              <TabsTrigger value="visibility" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-primary-foreground">
                 <Settings className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Módulos</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-6 animate-in fade-in duration-300">
              <Card className="border-white/5 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-secondary text-lg">Identidade da Rádio</CardTitle>
                  <CardDescription>Nome, slogan e estilo principal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs">Nome da Rádio</Label>
                      <input 
                        value={localConfig.appName || ''} 
                        onChange={e => setLocalConfig({...localConfig, appName: e.target.value})} 
                        className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Slogan</Label>
                      <input 
                        value={localConfig.slogan || ''} 
                        onChange={e => setLocalConfig({...localConfig, slogan: e.target.value})} 
                        className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                        <ImageIcon className="h-4 w-4 text-secondary" /> Imagem de Fundo (Hero) - Recom.: 1920x1080px
                      </Label>
                      <Switch 
                        checked={localConfig.showHeroBackground !== false} 
                        onCheckedChange={v => setLocalConfig({...localConfig, showHeroBackground: v})}
                      />
                    </div>
                    
                    {localConfig.showHeroBackground !== false && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                        <input 
                          value={localConfig.heroBackgroundImageUrl || ''} 
                          onChange={e => setLocalConfig({...localConfig, heroBackgroundImageUrl: e.target.value})} 
                          className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm"
                          placeholder="https://exemplo.com/imagem.jpg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-white/5">
                     <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <div className="flex items-center gap-3">
                           <AlertTriangle className="h-5 w-5 text-red-500" />
                           <div>
                              <Label className="text-sm font-bold text-red-500">Modo de Manutenção</Label>
                              <p className="text-[10px] text-muted-foreground">Oculta o site para visitantes.</p>
                           </div>
                        </div>
                        <Switch 
                          checked={localConfig.maintenanceMode || false} 
                          onCheckedChange={v => setLocalConfig({...localConfig, maintenanceMode: v})}
                          className="data-[state=checked]:bg-red-500"
                        />
                     </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Megaphone className="h-5 w-5 text-secondary" />
                        <Label className="text-sm font-bold">Barra de Avisos</Label>
                      </div>
                      <Switch 
                        checked={localConfig.showNoticeBar || false} 
                        onCheckedChange={v => setLocalConfig({...localConfig, showNoticeBar: v})}
                      />
                    </div>
                    
                    {localConfig.showNoticeBar && (
                      <div className="space-y-6 p-4 bg-white/5 rounded-xl border border-white/5 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex items-center justify-between p-3 bg-background/40 border border-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Pin className="h-4 w-4 text-secondary" />
                              <div>
                                <Label className="text-xs font-bold">Barra Fixa (Sticky)</Label>
                                <p className="text-[10px] text-muted-foreground">Segue a tela durante a rolagem.</p>
                              </div>
                            </div>
                            <Switch 
                              checked={localConfig.noticeBarFixed || false} 
                              onCheckedChange={v => setLocalConfig({...localConfig, noticeBarFixed: v})}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Texto do Aviso</Label>
                            <input 
                              value={localConfig.noticeBarText || ''} 
                              onChange={e => setLocalConfig({...localConfig, noticeBarText: e.target.value})}
                              placeholder="Ex: Participe da nossa campanha!"
                              className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Ícone</Label>
                            <Select 
                              value={localConfig.noticeBarIcon || 'Megaphone'} 
                              onValueChange={(val) => setLocalConfig({...localConfig, noticeBarIcon: val})}
                            >
                              <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Ícone" />
                              </SelectTrigger>
                              <SelectContent>
                                {ICON_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    <div className="flex items-center gap-2">
                                      <opt.icon className="h-4 w-4" />
                                      <span>{opt.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-6 pt-4 border-t border-white/5">
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-xs text-secondary"><ExternalLink className="h-4 w-4" /> Botão de Ação</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input 
                                placeholder="Nome do Botão" 
                                value={localConfig.noticeBarLinkText || ''}
                                onChange={e => setLocalConfig({...localConfig, noticeBarLinkText: e.target.value})}
                                className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm"
                              />
                              <input 
                                placeholder="URL do Link" 
                                value={localConfig.noticeBarLinkUrl || ''}
                                onChange={e => setLocalConfig({...localConfig, noticeBarLinkUrl: e.target.value})}
                                className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm"
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                               <Label className="flex items-center gap-2 text-xs text-secondary"><CalendarDays className="h-4 w-4" /> Expiração Automática</Label>
                               <Switch 
                                 checked={!!localConfig.noticeBarExpiresAt} 
                                 onCheckedChange={(v) => {
                                   if (!v) setLocalConfig({...localConfig, noticeBarExpiresAt: ''});
                                   else setLocalConfig({...localConfig, noticeBarExpiresAt: format(new Date(), "yyyy-MM-dd'T'HH:mm")});
                                 }}
                               />
                            </div>
                            
                            {localConfig.noticeBarExpiresAt && (
                              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full justify-start text-left font-normal bg-background/50 border-white/10",
                                          !expiresAtDate && "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {expiresAtDate && isValid(expiresAtDate) ? format(expiresAtDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={expiresAtDate && isValid(expiresAtDate) ? expiresAtDate : undefined}
                                        onSelect={(date) => {
                                          if (!date) return;
                                          const currentTime = localConfig.noticeBarExpiresAt?.split('T')[1] || '00:00';
                                          const newIso = `${format(date, 'yyyy-MM-dd')}T${currentTime}`;
                                          setLocalConfig({...localConfig, noticeBarExpiresAt: newIso});
                                        }}
                                        initialFocus
                                        locale={ptBR}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <input 
                                    type="time" 
                                    value={localConfig.noticeBarExpiresAt?.split('T')[1] || '00:00'}
                                    onChange={(e) => {
                                      const currentDate = localConfig.noticeBarExpiresAt?.split('T')[0] || format(new Date(), 'yyyy-MM-dd');
                                      const newIso = `${currentDate}T${e.target.value}`;
                                      setLocalConfig({...localConfig, noticeBarExpiresAt: newIso});
                                    }}
                                    className="flex h-10 w-full sm:w-[120px] rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm dark:[color-scheme:dark]"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                    <div className="space-y-4">
                      <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2"><Star className="h-4 w-4 text-secondary" /> Destaque 1</Label>
                      <div className="grid grid-cols-1 gap-2">
                        <input value={localConfig.heroBadge1Text || ''} onChange={e => setLocalConfig({...localConfig, heroBadge1Text: e.target.value})} className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm" />
                        <Select value={localConfig.heroBadge1Icon || 'Clock'} onValueChange={(val) => setLocalConfig({...localConfig, heroBadge1Icon: val})}>
                          <SelectTrigger className="bg-background/50"><SelectValue placeholder="Ícone" /></SelectTrigger>
                          <SelectContent>{ICON_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}><div className="flex items-center gap-2"><opt.icon className="h-4 w-4" /><span>{opt.label}</span></div></SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2"><Star className="h-4 w-4 text-secondary" /> Destaque 2</Label>
                      <div className="grid grid-cols-1 gap-2">
                        <input value={localConfig.heroBadge2Text || ''} onChange={e => setLocalConfig({...localConfig, heroBadge2Text: e.target.value})} className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm" />
                        <Select value={localConfig.heroBadge2Icon || 'Music'} onValueChange={(val) => setLocalConfig({...localConfig, heroBadge2Icon: val})}>
                          <SelectTrigger className="bg-background/50"><SelectValue placeholder="Ícone" /></SelectTrigger>
                          <SelectContent>{ICON_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}><div className="flex items-center gap-2"><opt.icon className="h-4 w-4" /><span>{opt.label}</span></div></SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-secondary text-lg flex items-center gap-2"><Cross className="h-5 w-5" /> Versículo de Destaque</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    value={localConfig.verseText || ''} 
                    onChange={e => setLocalConfig({...localConfig, verseText: e.target.value})} 
                    rows={3}
                    className="bg-background/50 border-white/10"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about" className="space-y-6 animate-in fade-in duration-300">
              <Card className="border-white/5 bg-card/30">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="text-secondary text-lg truncate">Sobre Nós</CardTitle>
                  </div>
                  <Switch checked={localConfig.showAbout || false} onCheckedChange={(val) => setLocalConfig({...localConfig, showAbout: val})} />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs">Etiqueta (Badge)</Label>
                    <input value={localConfig.aboutBadge || ''} onChange={e => setLocalConfig({...localConfig, aboutBadge: e.target.value})} className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm" />
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                        <ImageIcon className="h-4 w-4 text-secondary" /> Imagem (Sobre Nós)
                      </Label>
                      <Switch 
                        checked={localConfig.showAboutImage !== false} 
                        onCheckedChange={v => setLocalConfig({...localConfig, showAboutImage: v})}
                      />
                    </div>
                    
                    {localConfig.showAboutImage !== false && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                        <input 
                          value={localConfig.aboutImageUrl || ''} 
                          onChange={e => setLocalConfig({...localConfig, aboutImageUrl: e.target.value})} 
                          className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm"
                          placeholder="https://exemplo.com/sobre.jpg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Título Principal</Label>
                    <input value={localConfig.aboutTitle || ''} onChange={e => setLocalConfig({...localConfig, aboutTitle: e.target.value})} className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Texto de Descrição</Label>
                    <Textarea value={localConfig.aboutText || ''} onChange={e => setLocalConfig({...localConfig, aboutText: e.target.value})} rows={6} className="bg-background/50 border-white/10" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stream" className="space-y-6 animate-in fade-in duration-300">
              <Card className="border-white/5 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-secondary text-lg">Transmissão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs">URL do Áudio (Stream)</Label>
                    <input value={localConfig.streamUrl || ''} onChange={e => setLocalConfig({...localConfig, streamUrl: e.target.value})} className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm" />
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <Label className="text-sm font-bold flex items-center gap-2"><Play className="h-4 w-4 text-secondary" /> Autoplay</Label>
                        <p className="text-[10px] text-muted-foreground">Início automático ao abrir site.</p>
                      </div>
                      <Switch checked={localConfig.autoplay !== false} onCheckedChange={(val) => setLocalConfig({...localConfig, autoplay: val})} />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex flex-col gap-4">
                      <Label className="text-sm font-bold">Volume Padrão: {Math.round((localConfig.defaultVolume || 0.6) * 100)}%</Label>
                      <Slider 
                        value={[(localConfig.defaultVolume || 0.6) * 100]} 
                        max={100} 
                        onValueChange={(v) => setLocalConfig({...localConfig, defaultVolume: v[0] / 100})}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <Label className="text-sm font-bold">Metadados (Tocando Agora)</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-secondary">Dinâmico?</span>
                        <Switch checked={localConfig.useDynamicMetadata || false} onCheckedChange={(val) => setLocalConfig({...localConfig, useDynamicMetadata: val})} />
                      </div>
                    </div>

                    {localConfig.useDynamicMetadata ? (
                      <div className="space-y-2">
                        <Label className="text-xs">URL dos Metadados</Label>
                        <input value={localConfig.metadataUrl || ''} onChange={e => setLocalConfig({...localConfig, metadataUrl: e.target.value})} className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-xs">Texto Fixo (Fallback)</Label>
                        <input value={localConfig.nowPlayingText || ''} onChange={e => setLocalConfig({...localConfig, nowPlayingText: e.target.value})} className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="footer" className="space-y-6 animate-in fade-in duration-300">
              <Card className="border-white/5 bg-card/30">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <CardTitle className="text-secondary text-lg">Rodapé</CardTitle>
                  <Switch checked={localConfig.showFooter !== false} onCheckedChange={(val) => setLocalConfig({...localConfig, showFooter: val})} />
                </CardHeader>
                <CardContent className="space-y-8">
                   <div className="space-y-4">
                     <div className="flex items-center justify-between gap-4">
                       <Label className="text-sm font-bold">Descrição da Marca</Label>
                       <Switch checked={localConfig.showFooterDescription !== false} onCheckedChange={(val) => setLocalConfig({...localConfig, showFooterDescription: val})} />
                     </div>
                     <Textarea value={localConfig.footerDescription || ''} onChange={e => setLocalConfig({...localConfig, footerDescription: e.target.value})} rows={3} className="bg-background/50 border-white/10" />
                   </div>

                   <div className="pt-6 border-t border-white/5 space-y-4">
                     <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                          <RadioIcon className="h-4 w-4 text-secondary" /> Texto de Status do Rodapé
                        </Label>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] text-muted-foreground uppercase">Texto Principal</Label>
                          <input 
                            value={localConfig.footerStatusText || ''} 
                            onChange={e => setLocalConfig({...localConfig, footerStatusText: e.target.value})} 
                            placeholder="Ex: Transmitindo Esperança 24h"
                            className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] text-muted-foreground uppercase">Ícone</Label>
                          <Select 
                            value={localConfig.footerStatusIcon || 'Radio'} 
                            onValueChange={(val) => setLocalConfig({...localConfig, footerStatusIcon: val})}
                          >
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder="Escolha um ícone" />
                            </SelectTrigger>
                            <SelectContent>
                              {ICON_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  <div className="flex items-center gap-2">
                                    <opt.icon className="h-4 w-4" />
                                    <span>{opt.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                     </div>
                   </div>

                   <div className="pt-6 border-t border-white/5 space-y-6">
                     <div className="flex items-center justify-between">
                       <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                         <Share2 className="h-4 w-4 text-secondary" /> Redes Sociais
                       </Label>
                       <Switch 
                         checked={localConfig.showSocial !== false} 
                         onCheckedChange={v => setLocalConfig({...localConfig, showSocial: v})} 
                       />
                     </div>
                     
                     {localConfig.showSocial !== false && (
                       <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                         <div className="space-y-4">
                           <div className="flex items-center gap-3">
                             <div className="flex items-center gap-2 min-w-[120px]">
                               <Switch 
                                 checked={localConfig.showInstagram !== false} 
                                 onCheckedChange={v => setLocalConfig({...localConfig, showInstagram: v})} 
                               />
                               <Label className="text-xs flex items-center gap-1"><Instagram className="h-3 w-3" /> Instagram</Label>
                             </div>
                             <input 
                               value={socialLinks.instagram} 
                               onChange={e => setSocialLinks({...socialLinks, instagram: e.target.value})} 
                               placeholder="Instagram URL" 
                               disabled={localConfig.showInstagram === false}
                               className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm"
                             />
                           </div>

                           <div className="flex items-center gap-3">
                             <div className="flex items-center gap-2 min-w-[120px]">
                               <Switch 
                                 checked={localConfig.showFacebook !== false} 
                                 onCheckedChange={v => setLocalConfig({...localConfig, showFacebook: v})} 
                               />
                               <Label className="text-xs flex items-center gap-1"><Facebook className="h-3 w-3" /> Facebook</Label>
                             </div>
                             <input 
                               value={socialLinks.facebook} 
                               onChange={e => setSocialLinks({...socialLinks, facebook: e.target.value})} 
                               placeholder="Facebook URL" 
                               disabled={localConfig.showFacebook === false}
                               className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm"
                             />
                           </div>

                           <div className="flex items-center gap-3">
                             <div className="flex items-center gap-2 min-w-[120px]">
                               <Switch 
                                 checked={localConfig.showYoutube !== false} 
                                 onCheckedChange={v => setLocalConfig({...localConfig, showYoutube: v})} 
                               />
                               <Label className="text-xs flex items-center gap-1"><Youtube className="h-3 w-3" /> YouTube</Label>
                             </div>
                             <input 
                               value={socialLinks.youtube} 
                               onChange={e => setSocialLinks({...socialLinks, youtube: e.target.value})} 
                               placeholder="YouTube URL" 
                               disabled={localConfig.showYoutube === false}
                               className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm"
                             />
                           </div>
                         </div>
                       </div>
                     )}
                   </div>

                   <div className="pt-6 border-t border-white/5 space-y-4">
                     <Label className="text-sm font-bold">Links Úteis</Label>
                     <div className="flex flex-col gap-2">
                       <input placeholder="Nome" value={newLink.label} onChange={e => setNewLink({...newLink, label: e.target.value})} className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm" />
                       <input placeholder="URL" value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})} className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm" />
                       <Button variant="secondary" onClick={handleAddUsefulLink} className="w-full gap-2">
                         {editingLinkIndex !== null ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                         {editingLinkIndex !== null ? "Atualizar Link" : "Adicionar Link"}
                       </Button>
                     </div>
                     <div className="mt-4 border rounded-lg overflow-hidden border-white/5">
                        <Table>
                          <TableBody>
                            {usefulLinks.map((link, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium text-xs truncate max-w-[150px]">{link.label}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => handleMoveLink(idx, 'up')} 
                                      disabled={idx === 0}
                                      className="h-8 w-8 text-secondary"
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => handleMoveLink(idx, 'down')} 
                                      disabled={idx === usefulLinks.length - 1}
                                      className="h-8 w-8 text-secondary"
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleEditUsefulLink(idx)} className="h-8 w-8 text-secondary">
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveUsefulLink(idx)} className="text-red-500 h-8 w-8">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                     </div>
                   </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6 animate-in fade-in duration-300">
              <Card className="border-white/5 bg-card/30">
                 <CardHeader className="flex flex-row items-center justify-between gap-4">
                   <CardTitle className="text-secondary text-lg">Grade de Programação</CardTitle>
                   <Switch checked={localConfig.showProgramacao || false} onCheckedChange={(val) => setLocalConfig({...localConfig, showProgramacao: val})} />
                 </CardHeader>
                 <CardContent className="space-y-6">
                   <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       <div className="space-y-1"><Label className="text-[10px] text-muted-foreground uppercase">Horário</Label><input placeholder="08:00 - 10:00" value={newProg.horario} onChange={e => setNewProg({...newProg, horario: e.target.value})} className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm" /></div>
                       <div className="space-y-1"><Label className="text-[10px] text-muted-foreground uppercase">Programa</Label><input placeholder="Nome" value={newProg.name} onChange={e => setNewProg({...newProg, name: e.target.value})} className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm" /></div>
                       <div className="space-y-1 sm:col-span-2"><Label className="text-[10px] text-muted-foreground uppercase">Apresentador</Label><input placeholder="Nome" value={newProg.presenter} onChange={e => setNewProg({...newProg, presenter: e.target.value})} className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm" /></div>
                     </div>
                     <Button onClick={handleAddProgram} className="w-full bg-secondary text-primary-foreground">{editingProgId ? "Atualizar" : "Adicionar à Grade"}</Button>
                   </div>

                   <div className="border rounded-xl overflow-hidden border-white/5">
                     <Table>
                       <TableHeader className="bg-white/5">
                         <TableRow>
                           <TableHead className="text-xs">Programa</TableHead>
                           <TableHead className="text-right text-xs">Ações</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {programs?.map(p => (
                           <TableRow key={p.id}>
                             <TableCell>
                               <div className="flex flex-col">
                                 <span className="text-xs font-bold text-secondary">{p.horario}</span>
                                 <span className="text-sm font-medium">{p.name}</span>
                               </div>
                             </TableCell>
                             <TableCell className="text-right">
                               <div className="flex justify-end gap-1">
                                 <Button variant="ghost" size="icon" onClick={() => handleEditProgram(p)} className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                                 <Button variant="ghost" size="icon" onClick={() => handleDeleteProgram(p.id)} className="h-8 w-8 text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                               </div>
                             </TableCell>
                           </TableRow>
                         ))}
                       </TableBody>
                     </Table>
                   </div>
                 </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visibility" className="space-y-6 animate-in fade-in duration-300">
               <Card className="border-white/5 bg-card/30">
                 <CardHeader>
                   <CardTitle className="text-secondary text-lg">Visibilidade dos Módulos</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: 'showNoticeBar', label: 'Barra de Avisos', icon: Megaphone },
                        { key: 'showAbout', label: 'Sobre Nós', icon: BookOpen },
                        { key: 'showAboutImage', label: 'Imagem Sobre Nós', icon: ImageIcon },
                        { key: 'showProgramacao', label: 'Programação', icon: ListMusic },
                        { key: 'showVersiculo', label: 'Versículo', icon: Cross },
                        { key: 'showNowPlaying', label: 'Tocando Agora', icon: Play },
                        { key: 'showFooter', label: 'Rodapé', icon: LayoutDashboard },
                        { key: 'showHeroBackground', label: 'Imagem Hero', icon: ImageIcon },
                        { key: 'showSocial', label: 'Redes Sociais (Master)', icon: Share2 },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-3 bg-background/40 border border-white/5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4 text-secondary" />
                            <Label className="text-xs">{item.label}</Label>
                          </div>
                          <Switch 
                            checked={localConfig[item.key] !== false} 
                            onCheckedChange={v => setLocalConfig({...localConfig, [item.key]: v})} 
                          />
                        </div>
                      ))}
                   </div>
                 </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
