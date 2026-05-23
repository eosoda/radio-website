
"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, collection } from 'firebase/firestore';
import * as LucideIcons from 'lucide-react';
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
  Youtube,
  Palette
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

const DynamicIcon = ({ name, className }: { name?: string, className?: string }) => {
  if (!name) return null;
  const IconComponent = (LucideIcons as any)[name];
  return IconComponent ? <IconComponent className={className} /> : null;
};

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
  const [showLogoPreview, setShowLogoPreview] = useState(false);
  const [versesList, setVersesList] = useState<string[]>([]);
  const [newVerse, setNewVerse] = useState('');
  const [editingVerseIndex, setEditingVerseIndex] = useState<number | null>(null);

  const [noticesList, setNoticesList] = useState<any[]>([]);
  const [newNotice, setNewNotice] = useState({
    id: '',
    text: '',
    icon: 'Megaphone',
    expiresAt: '',
    linkText: '',
    linkUrl: ''
  });
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      setLocalConfig({
        ...config,
        primaryColorLight: config.primaryColorLight || '#264653',
        secondaryColorLight: config.secondaryColorLight || '#008f7a',
        backgroundColorLight: config.backgroundColorLight || '#f1f5f9',
        textColorLight: config.textColorLight || '#0f1e24',
        
        primaryColorDark: config.primaryColorDark || '#264653',
        secondaryColorDark: config.secondaryColorDark || '#00c7a9',
        backgroundColorDark: config.backgroundColorDark || '#0b1317',
        textColorDark: config.textColorDark || '#f1f5f9',
      });
      const sLinks = config.socialMediaLinks || ['', '', ''];
      setSocialLinks({
        instagram: sLinks[0] || '',
        facebook: sLinks[1] || '',
        youtube: sLinks[2] || ''
      });
      setUsefulLinks(config.usefulLinks || []);
      setVersesList(config.versesList || (config.verseText ? [config.verseText] : []));
      setNoticesList(config.noticesList || (config.noticeBarText ? [{
        id: 'legacy',
        text: config.noticeBarText,
        icon: config.noticeBarIcon || 'Megaphone',
        expiresAt: config.noticeBarExpiresAt || '',
        linkText: config.noticeBarLinkText || '',
        linkUrl: config.noticeBarLinkUrl || ''
      }] : []));
    } else if (!isConfigLoading) {
      setLocalConfig({
        appName: 'Rádio Maranata',
        slogan: 'A Voz da Esperança 24h',
        logoImageUrl: '',
        logoSize: 320,
        showRadioName: true,
        showRadioSlogan: true,
        showHeroIcon: true,
        showRadioLogo: true,
        showHeroBadge1: true,
        showHeroBadge2: true,
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
        heroBgOpacity: 0.2,
        heroOverlayOpacity: 0.6,
        heroLayout: 'classic',
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
        nowPlayingText: 'Sintonizando Rádio Maranata...',
        aboutBadge: 'Nossa Identidade',
        aboutTitle: 'Levando Esperança através das Ondas',
        aboutText: 'Levando a palavra de Deus a todos os lares através do louvor e da edificação espiritual.',
        aboutImageUrl: '',
        showAboutImage: true,
        verseText: '"Lâmpada para os meus pés é tua palavra, e luz para o meu caminho." - Salmos 119:105',
        versesList: [
          '"Lâmpada para os meus pés é tua palavra, e luz para o meu caminho." - Salmos 119:105',
          '"Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna." - João 3:16',
          '"O Senhor é o meu pastor, nada me faltará." - Salmos 23:1',
          '"Tudo posso naquele que me fortalece." - Filipenses 4:13',
          '"Não fui eu que ordenei a você? Seja forte e corajoso! Não se apavore nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar." - Josué 1:9'
        ],
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
        copyrightText: 'Rádio Maranata - Todos os direitos reservados.',
        socialMediaLinks: ['', '', ''],
        usefulLinks: [],
        showBottomPlayer: true,
        primaryColorLight: '#264653',
        secondaryColorLight: '#008f7a',
        backgroundColorLight: '#f1f5f9',
        textColorLight: '#0f1e24',
        primaryColorDark: '#264653',
        secondaryColorDark: '#00c7a9',
        backgroundColorDark: '#0b1317',
        textColorDark: '#f1f5f9'
      });
    }
  }, [config, isConfigLoading]);

  const handleSaveConfig = () => {
    if (!localConfig) return;
    
    const firstNotice = noticesList[0];
    
    const updatedConfig = {
      ...localConfig,
      socialMediaLinks: [socialLinks.instagram, socialLinks.facebook, socialLinks.youtube],
      usefulLinks: usefulLinks,
      versesList: versesList,
      verseText: versesList[0] || '',
      noticesList: noticesList,
      noticeBarText: firstNotice ? firstNotice.text : '',
      noticeBarIcon: firstNotice ? firstNotice.icon : 'Megaphone',
      noticeBarExpiresAt: firstNotice ? firstNotice.expiresAt : '',
      noticeBarLinkText: firstNotice ? firstNotice.linkText : '',
      noticeBarLinkUrl: firstNotice ? firstNotice.linkUrl : '',
      heroBgOpacity: localConfig.heroBgOpacity !== undefined ? localConfig.heroBgOpacity : 0.2,
      heroOverlayOpacity: localConfig.heroOverlayOpacity !== undefined ? localConfig.heroOverlayOpacity : 0.6,
      heroLayout: localConfig.heroLayout || 'classic'
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

  const handleAddVerse = () => {
    if (!newVerse.trim()) {
      toast({ variant: "destructive", title: "O versículo não pode ser vazio" });
      return;
    }
    
    if (editingVerseIndex !== null) {
      const updatedVerses = [...versesList];
      updatedVerses[editingVerseIndex] = newVerse.trim();
      setVersesList(updatedVerses);
      setEditingVerseIndex(null);
      toast({ title: "Versículo Atualizado" });
    } else {
      setVersesList([...versesList, newVerse.trim()]);
      toast({ title: "Versículo Adicionado" });
    }
    
    setNewVerse('');
  };

  const handleEditVerse = (index: number) => {
    setNewVerse(versesList[index]);
    setEditingVerseIndex(index);
  };

  const handleRemoveVerse = (index: number) => {
    setVersesList(versesList.filter((_, i) => i !== index));
    if (editingVerseIndex === index) {
      setEditingVerseIndex(null);
      setNewVerse('');
    }
  };

  const handleMoveVerse = (index: number, direction: 'up' | 'down') => {
    const newVerses = [...versesList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newVerses.length) return;
    
    [newVerses[index], newVerses[targetIndex]] = [newVerses[targetIndex], newVerses[index]];
    setVersesList(newVerses);
  };

  const handleAddNotice = () => {
    if (!newNotice.text.trim()) {
      toast({ variant: "destructive", title: "O texto do aviso não pode ser vazio" });
      return;
    }
    
    if (editingNoticeId) {
      const updated = noticesList.map(n => n.id === editingNoticeId ? { ...newNotice } : n);
      setNoticesList(updated);
      setEditingNoticeId(null);
      toast({ title: "Aviso Atualizado" });
    } else {
      const id = Date.now().toString();
      setNoticesList([...noticesList, { ...newNotice, id }]);
      toast({ title: "Aviso Adicionado" });
    }
    
    setNewNotice({
      id: '',
      text: '',
      icon: 'Megaphone',
      expiresAt: '',
      linkText: '',
      linkUrl: ''
    });
  };

  const handleEditNotice = (item: any) => {
    setNewNotice({
      id: item.id,
      text: item.text,
      icon: item.icon || 'Megaphone',
      expiresAt: item.expiresAt || '',
      linkText: item.linkText || '',
      linkUrl: item.linkUrl || ''
    });
    setEditingNoticeId(item.id);
  };

  const handleRemoveNotice = (id: string) => {
    setNoticesList(noticesList.filter(n => n.id !== id));
    if (editingNoticeId === id) {
      setEditingNoticeId(null);
      setNewNotice({
        id: '',
        text: '',
        icon: 'Megaphone',
        expiresAt: '',
        linkText: '',
        linkUrl: ''
      });
    }
    toast({ title: "Aviso Removido" });
  };

  const handleMoveNotice = (index: number, direction: 'up' | 'down') => {
    const newList = [...noticesList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    
    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    setNoticesList(newList);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

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
        <span>Admin Maranata</span>
      </div>
      <nav className="flex-1 space-y-1">
        <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-secondary/10 hover:text-secondary bg-secondary/5 text-secondary">
          <LayoutDashboard className="h-4 w-4" /> Painel Geral
        </Button>
      </nav>
      <Button variant="destructive" onClick={handleLogout} className="w-full justify-start gap-3 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20">
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
               <Button onClick={handleSaveConfig} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold shadow-lg shadow-secondary/20 h-9 px-3">
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
              <TabsTrigger value="geral" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                 <Info className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Geral</span>
              </TabsTrigger>
              <TabsTrigger value="design" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                 <Palette className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Design</span>
              </TabsTrigger>
              <TabsTrigger value="avisos" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                 <Megaphone className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Avisos</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                 <BookOpen className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Sobre</span>
              </TabsTrigger>
              <TabsTrigger value="stream" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                 <Waves className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Stream</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                 <ListMusic className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Grade</span>
              </TabsTrigger>
              <TabsTrigger value="footer" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                 <LayoutDashboard className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Rodapé</span>
              </TabsTrigger>
              <TabsTrigger value="visibility" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                 <Settings className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Módulos</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-6 animate-in fade-in duration-300">
              <Card className="border-white/5 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-secondary text-lg">Identidade da Rádio</CardTitle>
                  <CardDescription>Nome, slogan e modo de manutenção do site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Nome da Rádio</Label>
                        <Switch 
                          checked={localConfig?.showRadioName !== false} 
                          onCheckedChange={v => setLocalConfig({...localConfig, showRadioName: v})}
                        />
                      </div>
                      <input 
                        value={localConfig?.appName || ''} 
                        onChange={e => setLocalConfig({...localConfig, appName: e.target.value})} 
                        className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Slogan</Label>
                        <Switch 
                          checked={localConfig?.showRadioSlogan !== false} 
                          onCheckedChange={v => setLocalConfig({...localConfig, showRadioSlogan: v})}
                        />
                      </div>
                      <input 
                        value={localConfig?.slogan || ''} 
                        onChange={e => setLocalConfig({...localConfig, slogan: e.target.value})} 
                        className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                     <div className="flex items-center justify-between p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                        <div className="flex items-center gap-3">
                           <AlertTriangle className="h-5 w-5 text-destructive" />
                           <div>
                              <Label className="text-sm font-bold text-destructive">Modo de Manutenção</Label>
                              <p className="text-[10px] text-muted-foreground">Oculta o site para visitors.</p>
                           </div>
                        </div>
                        <Switch 
                          checked={localConfig?.maintenanceMode || false} 
                          onCheckedChange={v => setLocalConfig({...localConfig, maintenanceMode: v})}
                          className="data-[state=checked]:bg-destructive"
                        />
                     </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-secondary text-lg flex items-center gap-2"><Cross className="h-5 w-5" /> Versículos Bíblicos Cadastrados</CardTitle>
                  <CardDescription>Cadastre múltiplos versículos. Ao carregar o site, um deles será selecionado aleatoriamente.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs">{editingVerseIndex !== null ? 'Editar Versículo' : 'Novo Versículo'}</Label>
                    <Textarea 
                      placeholder='Ex: "O Senhor é o meu pastor, nada me faltará." - Salmos 23:1'
                      value={newVerse} 
                      onChange={e => setNewVerse(e.target.value)} 
                      rows={3}
                      className="bg-background/50 border-white/10 text-sm animate-in fade-in"
                    />
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={handleAddVerse} className="w-full gap-2">
                        {editingVerseIndex !== null ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {editingVerseIndex !== null ? "Atualizar Versículo" : "Adicionar Versículo"}
                      </Button>
                      {editingVerseIndex !== null && (
                        <Button variant="outline" onClick={() => { setEditingVerseIndex(null); setNewVerse(''); }} className="border-white/10 hover:bg-white/5">
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>

                  {versesList.length > 0 && (
                    <div className="mt-4 border rounded-lg overflow-hidden border-white/5">
                      <Table>
                        <TableBody>
                          {versesList.map((verse, idx) => (
                            <TableRow key={idx} className="hover:bg-white/5">
                              <TableCell className="font-medium text-xs py-3 max-w-[200px] md:max-w-md break-words">{verse}</TableCell>
                              <TableCell className="text-right py-3 pr-4">
                                <div className="flex justify-end gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleMoveVerse(idx, 'up')} 
                                    disabled={idx === 0}
                                    className="h-8 w-8 text-secondary disabled:opacity-30"
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleMoveVerse(idx, 'down')} 
                                    disabled={idx === versesList.length - 1}
                                    className="h-8 w-8 text-secondary disabled:opacity-30"
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleEditVerse(idx)} className="h-8 w-8 text-secondary">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleRemoveVerse(idx)} className="text-destructive h-8 w-8">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="design" className="space-y-6 animate-in fade-in duration-300">
              <Card className="border-white/5 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-secondary text-lg flex items-center gap-2">
                    <Palette className="h-5 w-5" /> Cores da Marca (Brand Colors)
                  </CardTitle>
                  <CardDescription>Configure as cores de identidade visual do seu site para o modo claro e escuro.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Modo Claro */}
                    <div className="space-y-4">
                      <h4 className="font-headline font-bold text-sm text-secondary border-b border-white/5 pb-2 flex items-center gap-2">
                        <Sun className="h-4 w-4" /> Modo Claro
                      </h4>
                      <div className="space-y-4">
                        {[
                          { label: 'Cor Primária', key: 'primaryColorLight', default: '#264653' },
                          { label: 'Cor Secundária', key: 'secondaryColorLight', default: '#008f7a' },
                          { label: 'Cor de Fundo', key: 'backgroundColorLight', default: '#f1f5f9' },
                          { label: 'Cor dos Textos', key: 'textColorLight', default: '#0f1e24' },
                        ].map((c) => (
                          <div key={c.key} className="flex flex-col space-y-1.5">
                            <Label className="text-xs">{c.label}</Label>
                            <div className="flex items-center gap-2">
                              <div className="relative w-10 h-10 rounded-md overflow-hidden border border-white/10 shrink-0">
                                <input 
                                  type="color" 
                                  value={localConfig?.[c.key] || c.default} 
                                  onChange={e => setLocalConfig({...localConfig, [c.key]: e.target.value})}
                                  className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                                />
                              </div>
                              <input 
                                value={localConfig?.[c.key] || ''} 
                                onChange={e => setLocalConfig({...localConfig, [c.key]: e.target.value})}
                                className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm uppercase"
                                placeholder={c.default}
                              />
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-10 px-3 border-white/10 hover:bg-white/5 text-xs text-muted-foreground"
                                onClick={() => setLocalConfig({...localConfig, [c.key]: c.default})}
                              >
                                Padronizar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Modo Escuro */}
                    <div className="space-y-4">
                      <h4 className="font-headline font-bold text-sm text-secondary border-b border-white/5 pb-2 flex items-center gap-2">
                        <Moon className="h-4 w-4" /> Modo Escuro
                      </h4>
                      <div className="space-y-4">
                        {[
                          { label: 'Cor Primária', key: 'primaryColorDark', default: '#264653' },
                          { label: 'Cor Secundária', key: 'secondaryColorDark', default: '#00c7a9' },
                          { label: 'Cor de Fundo', key: 'backgroundColorDark', default: '#0b1317' },
                          { label: 'Cor dos Textos', key: 'textColorDark', default: '#f1f5f9' },
                        ].map((c) => (
                          <div key={c.key} className="flex flex-col space-y-1.5">
                            <Label className="text-xs">{c.label}</Label>
                            <div className="flex items-center gap-2">
                              <div className="relative w-10 h-10 rounded-md overflow-hidden border border-white/10 shrink-0">
                                <input 
                                  type="color" 
                                  value={localConfig?.[c.key] || c.default} 
                                  onChange={e => setLocalConfig({...localConfig, [c.key]: e.target.value})}
                                  className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                                />
                              </div>
                              <input 
                                value={localConfig?.[c.key] || ''} 
                                onChange={e => setLocalConfig({...localConfig, [c.key]: e.target.value})}
                                className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm uppercase"
                                placeholder={c.default}
                              />
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-10 px-3 border-white/10 hover:bg-white/5 text-xs text-muted-foreground"
                                onClick={() => setLocalConfig({...localConfig, [c.key]: c.default})}
                              >
                                Padronizar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-secondary text-lg">Elementos do Layout Hero</CardTitle>
                  <CardDescription>Estilize o cabeçalho principal, logotipo e imagens de fundo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo da Rádio */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                        <ImageIcon className="h-4 w-4 text-secondary" /> Logo da Rádio
                      </Label>
                      <Switch 
                        checked={localConfig?.showRadioLogo !== false} 
                        onCheckedChange={v => setLocalConfig({...localConfig, showRadioLogo: v})}
                      />
                    </div>
                    <div className="space-y-4">
                      <input 
                        value={localConfig?.logoImageUrl || ''} 
                        onChange={e => {
                          setLocalConfig({...localConfig, logoImageUrl: e.target.value});
                          if (e.target.value && e.target.value !== localConfig.logoImageUrl) setShowLogoPreview(true);
                          else if (!e.target.value) setShowLogoPreview(false);
                        }} 
                        className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm"
                        placeholder="https://i.imgur.com/suaimagem.png (Hospede no imgur.com)"
                      />
                      {localConfig?.logoImageUrl && (
                        <div className="space-y-6 pt-4 border-t border-white/5">
                          <div className="space-y-4">
                            <Label className="text-sm font-bold flex items-center justify-between">
                              <span>Tamanho da Logo: {localConfig?.logoSize || 320}px</span>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-6 px-3 text-[10px] border-white/10 hover:bg-white/5" 
                                onClick={() => setShowLogoPreview(!showLogoPreview)}
                              >
                                {showLogoPreview ? 'Ocultar Prévia' : 'Mostrar Prévia'}
                              </Button>
                            </Label>
                            <Slider 
                              value={[localConfig?.logoSize || 320]} 
                              min={100}
                              max={800}
                              step={10}
                              onValueChange={(v) => setLocalConfig({...localConfig, logoSize: v[0]})}
                            />
                          </div>

                          {showLogoPreview && (
                            <div className="p-6 rounded-xl border border-white/10 bg-background/30 flex flex-col items-center justify-center overflow-hidden animate-in fade-in slide-in-from-top-2">
                              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-6 w-full text-center">Pré-visualização do Tamanho</Label>
                              <div 
                                className="relative transition-all duration-300 flex items-center justify-center"
                                style={{ 
                                  width: `${localConfig?.logoSize || 320}px`, 
                                  height: `${localConfig?.logoSize || 320}px`,
                                  maxWidth: '100%',
                                  maxHeight: '400px'
                                }}
                              >
                                <img 
                                  src={localConfig?.logoImageUrl} 
                                  alt="Preview da Logo" 
                                  className="w-full h-full object-contain drop-shadow-xl"
                                  onError={(e) => (e.currentTarget.style.opacity = '0.5')}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ícone Central */}
                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                        <Cross className="h-4 w-4 text-secondary" /> Ícone Central (SVG)
                      </Label>
                      <Switch 
                        checked={localConfig?.showHeroIcon !== false} 
                        onCheckedChange={v => setLocalConfig({...localConfig, showHeroIcon: v})}
                      />
                    </div>
                  </div>

                  {/* Imagem de Fundo Hero */}
                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                        <ImageIcon className="h-4 w-4 text-secondary" /> Imagem de Fundo (Hero) - Recom.: 1920x1080px
                      </Label>
                      <Switch 
                        checked={localConfig?.showHeroBackground !== false} 
                        onCheckedChange={v => setLocalConfig({...localConfig, showHeroBackground: v})}
                      />
                    </div>
                    
                    {localConfig?.showHeroBackground !== false && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                        <input 
                          value={localConfig?.heroBackgroundImageUrl || ''} 
                          onChange={e => setLocalConfig({...localConfig, heroBackgroundImageUrl: e.target.value})} 
                          className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm"
                          placeholder="https://i.imgur.com/suaimagem.jpg (Hospede no imgur.com)"
                        />
                      </div>
                    )}
                  </div>

                  {/* Estilo de Layout Hero */}
                  <div className="pt-6 border-t border-white/5 space-y-2">
                    <Label className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                      Estilo de Layout Hero
                    </Label>
                    <Select 
                      value={localConfig?.heroLayout || 'classic'} 
                      onValueChange={(val) => setLocalConfig({...localConfig, heroLayout: val})}
                    >
                      <SelectTrigger className="bg-background/50 border-white/10">
                        <SelectValue placeholder="Selecione o Layout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classic">Layout Clássico (Logo centralizada)</SelectItem>
                        <SelectItem value="split">Split Layout (Logo à esquerda, slogan à direita)</SelectItem>
                        <SelectItem value="clean">Layout Limpo (Apenas tocador e visualizador em destaque)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ajustes de Opacidade Hero */}
                  <div className="pt-6 border-t border-white/5 space-y-6">
                    <Label className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                      Ajustes de Opacidade Hero
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label className="text-xs flex justify-between">
                          <span>Opacidade da Imagem de Fundo</span>
                          <span className="text-secondary font-bold">{Math.round((localConfig?.heroBgOpacity !== undefined ? localConfig.heroBgOpacity : 0.2) * 100)}%</span>
                        </Label>
                        <Slider 
                          value={[(localConfig?.heroBgOpacity !== undefined ? localConfig.heroBgOpacity : 0.2) * 100]} 
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={(v) => setLocalConfig({...localConfig, heroBgOpacity: v[0] / 100})}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <Label className="text-xs flex justify-between">
                          <span>Opacidade do Overlay Escuro (Gradiente)</span>
                          <span className="text-secondary font-bold">{Math.round((localConfig?.heroOverlayOpacity !== undefined ? localConfig.heroOverlayOpacity : 0.6) * 100)}%</span>
                        </Label>
                        <Slider 
                          value={[(localConfig?.heroOverlayOpacity !== undefined ? localConfig.heroOverlayOpacity : 0.6) * 100]} 
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={(v) => setLocalConfig({...localConfig, heroOverlayOpacity: v[0] / 100})}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Banners de Destaque */}
              <Card className="border-white/5 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-secondary text-lg flex items-center gap-2"><Star className="h-5 w-5" /> Banners de Destaque (Hero Badges)</CardTitle>
                  <CardDescription>Configure os pequenos badges informativos que aparecem no cabeçalho.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2"><Star className="h-4 w-4 text-secondary" /> Destaque 1</Label>
                        <Switch 
                          checked={localConfig?.showHeroBadge1 !== false} 
                          onCheckedChange={v => setLocalConfig({...localConfig, showHeroBadge1: v})}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <input value={localConfig?.heroBadge1Text || ''} onChange={e => setLocalConfig({...localConfig, heroBadge1Text: e.target.value})} className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm" />
                        <Select value={localConfig?.heroBadge1Icon || 'Clock'} onValueChange={(val) => setLocalConfig({...localConfig, heroBadge1Icon: val})}>
                          <SelectTrigger className="bg-background/50"><SelectValue placeholder="Ícone" /></SelectTrigger>
                          <SelectContent>{ICON_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}><div className="flex items-center gap-2"><opt.icon className="h-4 w-4" /><span>{opt.label}</span></div></SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2"><Star className="h-4 w-4 text-secondary" /> Destaque 2</Label>
                        <Switch 
                          checked={localConfig?.showHeroBadge2 !== false} 
                          onCheckedChange={v => setLocalConfig({...localConfig, showHeroBadge2: v})}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <input value={localConfig?.heroBadge2Text || ''} onChange={e => setLocalConfig({...localConfig, heroBadge2Text: e.target.value})} className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm" />
                        <Select value={localConfig?.heroBadge2Icon || 'Music'} onValueChange={(val) => setLocalConfig({...localConfig, heroBadge2Icon: val})}>
                          <SelectTrigger className="bg-background/50"><SelectValue placeholder="Ícone" /></SelectTrigger>
                          <SelectContent>{ICON_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}><div className="flex items-center gap-2"><opt.icon className="h-4 w-4" /><span>{opt.label}</span></div></SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="avisos" className="space-y-6 animate-in fade-in duration-300">
              <Card className="border-white/5 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-secondary text-lg flex items-center gap-2">
                    <Megaphone className="h-5 w-5" /> Barra de Avisos & Banners
                  </CardTitle>
                  <CardDescription>Crie, edite e gerencie múltiplos avisos com data de expiração individual.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <Megaphone className="h-5 w-5 text-secondary" />
                      <div>
                        <Label className="text-sm font-bold">Barra de Avisos Principal</Label>
                        <p className="text-[10px] text-muted-foreground">Exibe a barra de avisos rotativa no topo do site.</p>
                      </div>
                    </div>
                    <Switch 
                      checked={localConfig?.showNoticeBar || false} 
                      onCheckedChange={v => setLocalConfig({...localConfig, showNoticeBar: v})}
                    />
                  </div>
                  
                  {localConfig?.showNoticeBar && (
                    <div className="space-y-6 animate-in slide-in-from-top-2">
                      <div className="flex items-center justify-between p-3 bg-background/40 border border-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Pin className="h-4 w-4 text-secondary" />
                          <div>
                            <Label className="text-xs font-bold">Barra Fixa (Sticky)</Label>
                            <p className="text-[10px] text-muted-foreground">Segue a tela durante a rolagem.</p>
                          </div>
                        </div>
                        <Switch 
                          checked={localConfig?.noticeBarFixed || false} 
                          onCheckedChange={v => setLocalConfig({...localConfig, noticeBarFixed: v})}
                        />
                      </div>

                      <div className="p-4 bg-background/40 rounded-xl border border-white/5 space-y-4">
                        <h4 className="text-sm font-headline font-bold text-secondary flex items-center gap-2">
                          {editingNoticeId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          {editingNoticeId ? "Editar Aviso" : "Novo Aviso"}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs">Texto do Aviso</Label>
                            <input 
                              value={newNotice.text} 
                              onChange={e => setNewNotice({...newNotice, text: e.target.value})}
                              placeholder="Ex: Participe da nossa campanha!"
                              className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm focus:outline-none focus:border-secondary"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Ícone</Label>
                            <Select 
                              value={newNotice.icon || 'Megaphone'} 
                              onValueChange={(val) => setNewNotice({...newNotice, icon: val})}
                            >
                              <SelectTrigger className="bg-background/50 border-white/10">
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

                          <div className="space-y-2">
                            <div className="flex items-center justify-between mb-1">
                              <Label className="text-xs flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5 text-secondary" /> Expiração Automática
                              </Label>
                              <Switch 
                                checked={!!newNotice.expiresAt} 
                                onCheckedChange={(v) => {
                                  if (!v) setNewNotice({...newNotice, expiresAt: ''});
                                  else setNewNotice({...newNotice, expiresAt: format(new Date(), "yyyy-MM-dd'T'HH:mm")});
                                }}
                              />
                            </div>
                            {newNotice.expiresAt ? (
                              <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal bg-background/50 border-white/10 text-xs",
                                        !newNotice.expiresAt && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                      {newNotice.expiresAt ? format(parseISO(newNotice.expiresAt), "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={newNotice.expiresAt ? parseISO(newNotice.expiresAt) : undefined}
                                      onSelect={(date) => {
                                        if (!date) return;
                                        const currentTime = newNotice.expiresAt?.split('T')[1] || '00:00';
                                        const newIso = `${format(date, 'yyyy-MM-dd')}T${currentTime}`;
                                        setNewNotice({...newNotice, expiresAt: newIso});
                                      }}
                                      initialFocus
                                      locale={ptBR}
                                    />
                                  </PopoverContent>
                                </Popover>
                                <input 
                                  type="time" 
                                  value={newNotice.expiresAt?.split('T')[1] || '00:00'}
                                  onChange={(e) => {
                                    const currentDate = newNotice.expiresAt?.split('T')[0] || format(new Date(), 'yyyy-MM-dd');
                                    const newIso = `${currentDate}T${e.target.value}`;
                                    setNewNotice({...newNotice, expiresAt: newIso});
                                  }}
                                  className="flex h-10 w-[100px] rounded-md border border-white/10 bg-background/50 px-2 py-2 text-xs dark:[color-scheme:dark]"
                                />
                              </div>
                            ) : (
                              <div className="text-[10px] text-muted-foreground py-2 pl-1">Aviso permanente (sem expiração)</div>
                            )}
                          </div>

                          <div className="space-y-2 md:col-span-2 pt-2 border-t border-white/5">
                            <Label className="text-xs flex items-center gap-1 text-secondary">
                              <ExternalLink className="h-3.5 w-3.5" /> Botão de Ação (Opcional)
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input 
                                placeholder="Texto do Botão (Ex: Participar)" 
                                value={newNotice.linkText}
                                onChange={e => setNewNotice({...newNotice, linkText: e.target.value})}
                                className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-xs focus:outline-none focus:border-secondary"
                              />
                              <input 
                                placeholder="URL do Botão (Ex: https://...)" 
                                value={newNotice.linkUrl}
                                onChange={e => setNewNotice({...newNotice, linkUrl: e.target.value})}
                                className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-xs focus:outline-none focus:border-secondary"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="secondary" 
                            onClick={handleAddNotice} 
                            className="w-full gap-2 text-xs h-9 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
                          >
                            {editingNoticeId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {editingNoticeId ? "Atualizar Aviso" : "Adicionar Aviso"}
                          </Button>
                          {editingNoticeId && (
                            <Button 
                              variant="outline" 
                              onClick={() => { 
                                setEditingNoticeId(null); 
                                setNewNotice({ id: '', text: '', icon: 'Megaphone', expiresAt: '', linkText: '', linkUrl: '' }); 
                              }} 
                              className="border-white/10 hover:bg-white/5 text-xs h-9"
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </div>

                      {noticesList.length > 0 ? (
                        <div className="border rounded-xl overflow-hidden border-white/5 bg-background/20">
                          <Table>
                            <TableBody>
                              {noticesList.map((item, idx) => {
                                const expired = item.expiresAt ? new Date(item.expiresAt) < new Date() : false;
                                return (
                                  <TableRow key={item.id} className={cn("hover:bg-white/5", expired && "opacity-50")}>
                                    <TableCell className="py-3 pl-4">
                                      <div className="flex items-center gap-2">
                                        <DynamicIcon name={item.icon} className="h-4 w-4 text-secondary shrink-0" />
                                        <div className="min-w-0">
                                          <p className="text-xs font-medium truncate max-w-[200px] md:max-w-md">{item.text}</p>
                                          <div className="flex flex-wrap gap-2 mt-1">
                                            {item.expiresAt && (
                                              <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1 bg-white/5", expired ? "text-destructive bg-destructive/10" : "text-muted-foreground")}>
                                                <Clock className="h-2.5 w-2.5" />
                                                {expired ? "Expirou em: " : "Expira: "} 
                                                {format(parseISO(item.expiresAt), "dd/MM/yyyy HH:mm")}
                                              </span>
                                            )}
                                            {item.linkText && (
                                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary/10 text-secondary flex items-center gap-1">
                                                <LinkIcon className="h-2.5 w-2.5" />
                                                {item.linkText}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right py-3 pr-4">
                                      <div className="flex justify-end gap-1">
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          onClick={() => handleMoveNotice(idx, 'up')} 
                                          disabled={idx === 0}
                                          className="h-8 w-8 text-secondary disabled:opacity-30"
                                        >
                                          <ArrowUp className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          onClick={() => handleMoveNotice(idx, 'down')} 
                                          disabled={idx === noticesList.length - 1}
                                          className="h-8 w-8 text-secondary disabled:opacity-30"
                                        >
                                          <ArrowDown className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleEditNotice(item)} className="h-8 w-8 text-secondary">
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveNotice(item.id)} className="text-destructive h-8 w-8">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-white/10 rounded-xl bg-background/10">
                          Nenhum aviso cadastrado. Crie um aviso acima.
                        </div>
                      )}
                    </div>
                  )}
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
                          placeholder="https://i.imgur.com/suaimagem.jpg (Hospede no imgur.com)"
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
                       <Switch checked={localConfig.showFooterDescription !== false} onCheckedChange={(val) => setLocalConfig({...localConfig, footerDescription: val})} />
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
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveUsefulLink(idx)} className="text-destructive h-8 w-8">
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
                     <Button onClick={handleAddProgram} className="w-full bg-secondary text-secondary-foreground">{editingProgId ? "Atualizar" : "Adicionar à Grade"}</Button>
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
                                 <Button variant="ghost" size="icon" onClick={() => handleDeleteProgram(p.id)} className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
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
                        { key: 'showBottomPlayer', label: 'Player Fixo (Bottom)', icon: RadioIcon },
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
