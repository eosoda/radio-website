
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
import { hexToRgb } from '@/lib/theme-utils';
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
  const [versesToConfirm, setVersesToConfirm] = useState<string[]>([]);
  const [showVerseConfirmation, setShowVerseConfirmation] = useState(false);

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

  const [draggedModuleIndex, setDraggedModuleIndex] = useState<number | null>(null);
  const [draggedLinkIndex, setDraggedLinkIndex] = useState<number | null>(null);
  const [draggedNoticeIndex, setDraggedNoticeIndex] = useState<number | null>(null);

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
        homeModulesOrder: ['about', 'schedule', 'verses'],
        sectionSpacing: 'normal',
        noticeBarExpiresAt: '',
        noticeBarLinkText: '',
        noticeBarLinkUrl: '',
        heroBackgroundImageUrl: '',
        showHeroBackground: true,
        heroBgOpacity: 0.2,
        heroOverlayOpacity: 0.6,
        heroLayout: 'classic',
        heroAnimation: 'none',
        heroOverlayStyle: 'classic',
        heroBadge1Text: 'AO VIVO 24H',
        heroBadge1Icon: 'Clock',
        heroBadge2Text: 'LOUVOR & ADORAÇÃO',
        heroBadge2Icon: 'Music',
        streamUrl: 'https://URL:PORT/stream/',
        autoplay: true,
        playerLayout: 'hidden-to-pill',
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
        aboutLayout: 'right-image',
        aboutBgStyle: 'transparent',
        verseText: '"Lâmpada para os meus pés é tua palavra, e luz para o meu caminho." - Salmos 119:105',
        versesList: [
          '"Lâmpada para os meus pés é tua palavra, e luz para o meu caminho." - Salmos 119:105',
          '"Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna." - João 3:16',
          '"O Senhor é o meu pastor, nada me faltará." - Salmos 23:1',
          '"Tudo posso naquele que me fortalece." - Filipenses 4:13',
          '"Não fui eu que ordenei a você? Seja forte e corajoso! Não se apavore nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar." - Josué 1:9'
        ],
        verseInterval: 10,
        verseFontSize: 'text-3xl md:text-4xl',
        verseFontFamily: 'font-headline',
        verseAlign: 'text-center',
        verseTextColor: '',
        verseBgOpacity: 5,
        verseBoxWidth: 'max-w-4xl',
        verseBoxPadding: 'py-24 px-8',
        verseBoxRadius: 'rounded-[3rem]',
        verseBgColor: '',
        verseIcon: 'Music',
        verseBorderWidth: 'border',
        verseBorderColor: '',
        showAbout: true,
        showProgramacao: true,
        showVersiculo: true,
        showNowPlaying: true,
        showFooter: true,
        showFooterDescription: true,
        footerDescription: 'Levando o evangelho através das ondas sonoras. Uma rádio comprometida com a verdade bíblica e o amor de Cristo para todos os lares.',
        footerStatusText: 'Estamos online 24h levando a palavra de Deus.',
        footerStatusIcon: 'Radio',
        footerStyle: 'glass',
        footerAlign: 'left',
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
        textColorDark: '#f1f5f9',
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
      aboutMarginTopMobile: localConfig.aboutMarginTopMobile || '',
      aboutMarginBottomMobile: localConfig.aboutMarginBottomMobile || '',
      aboutMarginTopDesktop: localConfig.aboutMarginTopDesktop || '',
      aboutMarginBottomDesktop: localConfig.aboutMarginBottomDesktop || '',
      scheduleMarginTopMobile: localConfig.scheduleMarginTopMobile || '',
      scheduleMarginBottomMobile: localConfig.scheduleMarginBottomMobile || '',
      scheduleMarginTopDesktop: localConfig.scheduleMarginTopDesktop || '',
      scheduleMarginBottomDesktop: localConfig.scheduleMarginBottomDesktop || '',
      versesMarginTopMobile: localConfig.versesMarginTopMobile || '',
      versesMarginBottomMobile: localConfig.versesMarginBottomMobile || '',
      versesMarginTopDesktop: localConfig.versesMarginTopDesktop || '',
      versesMarginBottomDesktop: localConfig.versesMarginBottomDesktop || '',
      heroBgOpacity: localConfig.heroBgOpacity !== undefined ? localConfig.heroBgOpacity : 0.2,
      heroOverlayOpacity: localConfig.heroOverlayOpacity !== undefined ? localConfig.heroOverlayOpacity : 0.6,
      heroLayout: localConfig.heroLayout || 'classic',
      verseInterval: localConfig.verseInterval !== undefined ? localConfig.verseInterval : 10,
      verseFontSize: localConfig.verseFontSize || 'text-3xl md:text-4xl',
      verseFontFamily: localConfig.verseFontFamily || 'font-headline',
      verseAlign: localConfig.verseAlign || 'text-center',
      verseTextColor: localConfig.verseTextColor || '',
      verseBgOpacity: localConfig.verseBgOpacity !== undefined ? localConfig.verseBgOpacity : 5,
      verseBoxWidth: localConfig.verseBoxWidth || 'max-w-4xl',
      verseBoxPadding: localConfig.verseBoxPadding || 'py-24 px-8',
      verseBoxRadius: localConfig.verseBoxRadius || 'rounded-[3rem]',
      verseBgColor: localConfig.verseBgColor || '',
      verseIcon: localConfig.verseIcon || 'Music',
      verseBorderWidth: localConfig.verseBorderWidth || 'border',
      verseBorderColor: localConfig.verseBorderColor || ''
    };
    
    setDocumentNonBlocking(configRef, updatedConfig, { merge: true });
    toast({ title: "Configuração Salva", description: "As alterações foram aplicadas imediatamente." });
  };

  const handleResetDesign = () => {
    if (!localConfig) return;
    setLocalConfig({
      ...localConfig,
      primaryColorLight: '#264653',
      secondaryColorLight: '#008f7a',
      backgroundColorLight: '#f1f5f9',
      textColorLight: '#0f1e24',
      primaryColorDark: '#264653',
      secondaryColorDark: '#00c7a9',
      backgroundColorDark: '#0b1317',
      textColorDark: '#f1f5f9',
      fontTheme: 'classic',
      themeEnforcement: 'free',
      sectionSpacing: 'normal',
      aboutMarginTopMobile: '',
      aboutMarginBottomMobile: '',
      aboutMarginTopDesktop: '',
      aboutMarginBottomDesktop: '',
      scheduleMarginTopMobile: '',
      scheduleMarginBottomMobile: '',
      scheduleMarginTopDesktop: '',
      scheduleMarginBottomDesktop: '',
      versesMarginTopMobile: '',
      versesMarginBottomMobile: '',
      versesMarginTopDesktop: '',
      versesMarginBottomDesktop: '',
    });
    toast({ title: "Design Restaurado", description: "As cores, fontes e espaçamentos voltaram ao padrão. Clique em 'Salvar' para confirmar." });
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

  const handleMoveModule = (index: number, direction: 'up' | 'down') => {
    const arr = [...(localConfig.homeModulesOrder || ['about', 'schedule', 'verses'])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < arr.length) {
      [arr[index], arr[targetIndex]] = [arr[targetIndex], arr[index]];
      setLocalConfig({...localConfig, homeModulesOrder: arr});
    }
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
      setNewVerse('');
      toast({ title: "Versículo Atualizado" });
      return;
    }
    
    const lines = newVerse.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    
    if (lines.length > 1) {
      setVersesToConfirm(lines);
      setShowVerseConfirmation(true);
    } else if (lines.length === 1) {
      setVersesList([...versesList, lines[0]]);
      setNewVerse('');
      toast({ title: "Versículo Adicionado" });
    } else {
      toast({ variant: "destructive", title: "Nenhum versículo válido encontrado" });
    }
  };

  const confirmAddMultipleVerses = () => {
    setVersesList([...versesList, ...versesToConfirm]);
    setVersesToConfirm([]);
    setShowVerseConfirmation(false);
    setNewVerse('');
    toast({ title: `${versesToConfirm.length} Versículos Adicionados` });
  };
  
  const cancelAddMultipleVerses = () => {
    setVersesToConfirm([]);
    setShowVerseConfirmation(false);
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

  const renderSpacingControls = (modulePrefix: 'about' | 'schedule' | 'verses', moduleName: string) => {
    return (
      <Card className="border-white/5 bg-card/30 mt-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
          <div>
            <CardTitle className="text-secondary text-lg">Respiro e Espaçamento</CardTitle>
            <CardDescription>Ajuste as margens do módulo "{moduleName}".</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-white/10 text-xs h-8"
            onClick={() => {
              setLocalConfig({
                ...localConfig,
                [`${modulePrefix}MarginTopMobile`]: '',
                [`${modulePrefix}MarginBottomMobile`]: '',
                [`${modulePrefix}MarginTopDesktop`]: '',
                [`${modulePrefix}MarginBottomDesktop`]: ''
              });
            }}
          >
            Resetar Módulo
          </Button>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-secondary flex items-center gap-2"><LucideIcons.Smartphone className="h-4 w-4" /> No Celular</h4>
            <div className="space-y-2">
              <Label className="text-xs">Distância Acima (Margin Top)</Label>
              <Select value={localConfig?.[`${modulePrefix}MarginTopMobile`] || ''} onValueChange={v => setLocalConfig({...localConfig, [`${modulePrefix}MarginTopMobile`]: v})}>
                <SelectTrigger className="bg-background/50"><SelectValue placeholder="Padrão" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mt-0">Sem distância (0px)</SelectItem>
                  <SelectItem value="mt-8">Pequena (32px)</SelectItem>
                  <SelectItem value="mt-16">Média (64px)</SelectItem>
                  <SelectItem value="mt-24">Grande (96px)</SelectItem>
                  <SelectItem value="mt-32">Extra Grande (128px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Distância Abaixo (Margin Bottom)</Label>
              <Select value={localConfig?.[`${modulePrefix}MarginBottomMobile`] || ''} onValueChange={v => setLocalConfig({...localConfig, [`${modulePrefix}MarginBottomMobile`]: v})}>
                <SelectTrigger className="bg-background/50"><SelectValue placeholder="Padrão" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mb-0">Sem distância (0px)</SelectItem>
                  <SelectItem value="mb-8">Pequena (32px)</SelectItem>
                  <SelectItem value="mb-16">Média (64px)</SelectItem>
                  <SelectItem value="mb-24">Grande (96px)</SelectItem>
                  <SelectItem value="mb-32">Extra Grande (128px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-secondary flex items-center gap-2"><LucideIcons.Monitor className="h-4 w-4" /> No Computador</h4>
            <div className="space-y-2">
              <Label className="text-xs">Distância Acima (Margin Top)</Label>
              <Select value={localConfig?.[`${modulePrefix}MarginTopDesktop`] || ''} onValueChange={v => setLocalConfig({...localConfig, [`${modulePrefix}MarginTopDesktop`]: v})}>
                <SelectTrigger className="bg-background/50"><SelectValue placeholder="Padrão" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="md:mt-0">Sem distância (0px)</SelectItem>
                  <SelectItem value="md:mt-16">Pequena (64px)</SelectItem>
                  <SelectItem value="md:mt-32">Média (128px)</SelectItem>
                  <SelectItem value="md:mt-48">Grande (192px)</SelectItem>
                  <SelectItem value="md:mt-64">Extra Grande (256px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Distância Abaixo (Margin Bottom)</Label>
              <Select value={localConfig?.[`${modulePrefix}MarginBottomDesktop`] || ''} onValueChange={v => setLocalConfig({...localConfig, [`${modulePrefix}MarginBottomDesktop`]: v})}>
                <SelectTrigger className="bg-background/50"><SelectValue placeholder="Padrão" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="md:mb-0">Sem distância (0px)</SelectItem>
                  <SelectItem value="md:mb-16">Pequena (64px)</SelectItem>
                  <SelectItem value="md:mb-32">Média (128px)</SelectItem>
                  <SelectItem value="md:mb-48">Grande (192px)</SelectItem>
                  <SelectItem value="md:mb-64">Extra Grande (256px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 bg-background flex flex-col md:flex-row overflow-hidden w-full">
      <aside className="w-64 border-r border-white/5 bg-card/50 hidden md:flex flex-col">
        <SidebarContentNav />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-full">
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

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-12">
          <Tabs defaultValue="geral" className="space-y-6">
            <TabsList className="bg-card/50 border border-white/5 p-1 h-auto flex flex-wrap justify-start gap-1">
              <TabsTrigger value="geral" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                 <Info className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Geral</span>
              </TabsTrigger>
              <TabsTrigger value="visibility" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                 <Settings className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Módulos</span>
              </TabsTrigger>
              <TabsTrigger value="design" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                 <Palette className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Design</span>
              </TabsTrigger>
              <TabsTrigger value="player" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                 <RadioIcon className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Player</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                 <BookOpen className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Sobre</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                 <ListMusic className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Grade</span>
              </TabsTrigger>
              <TabsTrigger value="programacao" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                 <Palette className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Estilo Grade</span>
              </TabsTrigger>
              <TabsTrigger value="versiculos" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                 <BookOpen className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Versículos</span>
              </TabsTrigger>
              <TabsTrigger value="avisos" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                 <Megaphone className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Avisos</span>
              </TabsTrigger>
              <TabsTrigger value="footer" className="flex-1 md:flex-none gap-2 px-4 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                 <LayoutDashboard className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Rodapé</span>
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
            </TabsContent>

            <TabsContent value="versiculos" className="space-y-6 animate-in fade-in duration-300">
              {showVerseConfirmation ? (
                <Card className="border-secondary/50 bg-secondary/10 shadow-[0_0_30px_rgba(0,199,169,0.1)]">
                  <CardHeader>
                    <CardTitle className="text-secondary text-lg flex items-center gap-2"><Sparkles className="h-5 w-5" /> Confirmar Adição em Massa</CardTitle>
                    <CardDescription>Foram detectados {versesToConfirm.length} versículos válidos. Deseja adicionar todos à lista?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="max-h-60 overflow-y-auto space-y-2 border border-white/10 rounded-md p-4 bg-background/50">
                      {versesToConfirm.map((v, i) => (
                        <div key={i} className="text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                          <span className="text-secondary font-bold mr-2">{i + 1}.</span>{v}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 pt-2">
                      <Button onClick={confirmAddMultipleVerses} className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                        Confirmar e Adicionar
                      </Button>
                      <Button variant="outline" onClick={cancelAddMultipleVerses} className="flex-1 border-white/10 hover:bg-white/5">
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Coluna Esquerda: Cadastro de Versículos */}
                  <Card className="border-white/5 bg-card/30 flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-secondary text-lg flex items-center gap-2"><BookOpen className="h-5 w-5" /> Cadastrar Versículos</CardTitle>
                      <CardDescription>Cole múltiplos versículos de uma vez (um por linha) ou adicione individualmente.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col space-y-6">
                      <div className="space-y-2">
                        <Label className="text-xs">{editingVerseIndex !== null ? 'Editar Versículo' : 'Novo(s) Versículo(s)'}</Label>
                        <Textarea 
                          placeholder='Cole aqui...&#10;"O Senhor é o meu pastor..." - Salmos 23:1&#10;"Tudo posso..." - Filipenses 4:13'
                          value={newVerse} 
                          onChange={e => setNewVerse(e.target.value)} 
                          rows={6}
                          className="bg-background/50 border-white/10 text-sm animate-in fade-in resize-none"
                        />
                        <div className="flex gap-2 pt-2">
                          <Button variant="secondary" onClick={handleAddVerse} className="w-full gap-2">
                            {editingVerseIndex !== null ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {editingVerseIndex !== null ? "Atualizar Versículo" : "Adicionar Versículos"}
                          </Button>
                          {editingVerseIndex !== null && (
                            <Button variant="outline" onClick={() => { setEditingVerseIndex(null); setNewVerse(''); }} className="border-white/10 hover:bg-white/5">
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </div>

                      {versesList.length > 0 && (
                        <div className="mt-4 border rounded-lg overflow-hidden border-white/5 flex-1">
                          <Table>
                            <TableBody>
                              {versesList.map((verse, idx) => (
                                <TableRow key={idx} className="hover:bg-white/5">
                                  <TableCell className="font-medium text-xs py-3 max-w-[200px] md:max-w-md break-words">{verse}</TableCell>
                                  <TableCell className="text-right py-3 pr-4">
                                    <div className="flex justify-end gap-1">
                                      <Button variant="ghost" size="icon" onClick={() => handleMoveVerse(idx, 'up')} disabled={idx === 0} className="h-8 w-8 text-secondary disabled:opacity-30">
                                        <ArrowUp className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" onClick={() => handleMoveVerse(idx, 'down')} disabled={idx === versesList.length - 1} className="h-8 w-8 text-secondary disabled:opacity-30">
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

                  {/* Coluna Direita: Estilização e Preview */}
                  <div className="space-y-6">
                    <Card className="border-white/5 bg-card/30">
                      <CardHeader>
                        <CardTitle className="text-secondary text-lg flex items-center gap-2"><Palette className="h-5 w-5" /> Personalização e Estilo</CardTitle>
                        <CardDescription>Configure como a caixa de versículos aparece no site.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs">Tempo de Alternância (s)</Label>
                            <Input 
                              type="number" 
                              min="0"
                              value={localConfig?.verseInterval !== undefined ? localConfig?.verseInterval : 10} 
                              onChange={e => setLocalConfig({...localConfig, verseInterval: parseInt(e.target.value) || 0})}
                              className="bg-background/50 border-white/10"
                            />
                            <p className="text-[10px] text-muted-foreground">0 para não alternar</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Tamanho da Fonte</Label>
                            <Select value={localConfig?.verseFontSize || 'text-3xl md:text-4xl'} onValueChange={v => setLocalConfig({...localConfig, verseFontSize: v})}>
                              <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text-xl md:text-2xl">Pequeno</SelectItem>
                                <SelectItem value="text-2xl md:text-3xl">Médio</SelectItem>
                                <SelectItem value="text-3xl md:text-4xl">Grande</SelectItem>
                                <SelectItem value="text-4xl md:text-5xl">Extra Grande</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Tipo de Fonte</Label>
                            <Select value={localConfig?.verseFontFamily || 'font-headline'} onValueChange={v => setLocalConfig({...localConfig, verseFontFamily: v})}>
                              <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="font-headline">Headline (Títulos)</SelectItem>
                                <SelectItem value="font-body">Body (Textos Normais)</SelectItem>
                                <SelectItem value="font-serif italic">Serif (Itálico)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Alinhamento</Label>
                            <Select value={localConfig?.verseAlign || 'text-center'} onValueChange={v => setLocalConfig({...localConfig, verseAlign: v})}>
                              <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text-left">Esquerda</SelectItem>
                                <SelectItem value="text-center">Centro</SelectItem>
                                <SelectItem value="text-right">Direita</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Cor do Texto (Opcional)</Label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="color" 
                                value={localConfig?.verseTextColor || '#ffffff'} 
                                onChange={e => setLocalConfig({...localConfig, verseTextColor: e.target.value})}
                                className="h-10 w-10 cursor-pointer rounded-md border border-white/10"
                              />
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setLocalConfig({...localConfig, verseTextColor: ''})}
                                className="h-10 border-white/10 text-xs"
                              >
                                Limpar
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Opacidade do Fundo ({localConfig?.verseBgOpacity !== undefined ? localConfig?.verseBgOpacity : 5}%)</Label>
                            <Slider 
                              value={[localConfig?.verseBgOpacity !== undefined ? localConfig?.verseBgOpacity : 5]} 
                              max={100} 
                              step={1}
                              onValueChange={v => setLocalConfig({...localConfig, verseBgOpacity: v[0]})}
                              className="pt-2"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                          <div className="space-y-2">
                            <Label className="text-xs">Largura da Caixa</Label>
                            <Select value={localConfig?.verseBoxWidth || 'max-w-4xl'} onValueChange={v => setLocalConfig({...localConfig, verseBoxWidth: v})}>
                              <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="max-w-2xl">Estreita</SelectItem>
                                <SelectItem value="max-w-4xl">Padrão</SelectItem>
                                <SelectItem value="max-w-6xl">Larga</SelectItem>
                                <SelectItem value="max-w-full">Máxima</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Espaçamento Interno (Padding)</Label>
                            <Select value={localConfig?.verseBoxPadding || 'py-24 px-8'} onValueChange={v => setLocalConfig({...localConfig, verseBoxPadding: v})}>
                              <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="py-8 px-4">Pequeno</SelectItem>
                                <SelectItem value="py-16 px-6">Médio</SelectItem>
                                <SelectItem value="py-24 px-8">Grande (Padrão)</SelectItem>
                                <SelectItem value="py-32 px-12">Extra Grande</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Arredondamento</Label>
                            <Select value={localConfig?.verseBoxRadius || 'rounded-[3rem]'} onValueChange={v => setLocalConfig({...localConfig, verseBoxRadius: v})}>
                              <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rounded-none">Reto</SelectItem>
                                <SelectItem value="rounded-xl">Arredondado</SelectItem>
                                <SelectItem value="rounded-[3rem]">Pílula (Padrão)</SelectItem>
                                <SelectItem value="rounded-full">Circular (Extremo)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Espessura da Borda</Label>
                            <Select value={localConfig?.verseBorderWidth || 'border'} onValueChange={v => setLocalConfig({...localConfig, verseBorderWidth: v})}>
                              <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="border-0">Sem borda</SelectItem>
                                <SelectItem value="border">Fina (Padrão)</SelectItem>
                                <SelectItem value="border-2">Média</SelectItem>
                                <SelectItem value="border-4">Grossa</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Cor da Borda (Opcional)</Label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="color" 
                                value={localConfig?.verseBorderColor || '#ffffff'} 
                                onChange={e => setLocalConfig({...localConfig, verseBorderColor: e.target.value})}
                                className="h-10 w-10 cursor-pointer rounded-md border border-white/10"
                              />
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setLocalConfig({...localConfig, verseBorderColor: ''})}
                                className="h-10 border-white/10 text-xs"
                              >
                                Padrão
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Cor de Fundo Base (Opcional)</Label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="color" 
                                value={localConfig?.verseBgColor || '#00c7a9'} 
                                onChange={e => setLocalConfig({...localConfig, verseBgColor: e.target.value})}
                                className="h-10 w-10 cursor-pointer rounded-md border border-white/10"
                              />
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setLocalConfig({...localConfig, verseBgColor: ''})}
                                className="h-10 border-white/10 text-xs"
                              >
                                Padrão (Tema)
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Ícone Decorativo</Label>
                            <Select value={localConfig?.verseIcon || 'Music'} onValueChange={v => setLocalConfig({...localConfig, verseIcon: v})}>
                              <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {ICON_OPTIONS.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    <div className="flex items-center gap-2">
                                      <opt.icon className="h-4 w-4" />
                                      {opt.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Preview do Versículo */}
                    <Card className="border-white/5 bg-card/30 overflow-hidden">
                      <CardHeader className="bg-secondary/10 border-b border-white/5">
                        <CardTitle className="text-secondary text-sm flex items-center gap-2"><Eye className="h-4 w-4" /> Pré-visualização</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div 
                          className={cn(
                            "relative flex items-center justify-center transition-all duration-300 shadow-[inset_0_0_100px_rgba(38,70,83,0.05)] mx-auto",
                            localConfig?.verseBoxPadding || 'py-24 px-8',
                            localConfig?.verseBoxRadius || 'rounded-[3rem]',
                            localConfig?.verseBoxWidth || 'max-w-4xl',
                            localConfig?.verseBorderWidth || 'border',
                            !localConfig?.verseBorderColor && "border-secondary/20"
                          )}
                          style={{
                            backgroundColor: localConfig?.verseBgColor 
                              ? `rgba(${hexToRgb(localConfig.verseBgColor).r}, ${hexToRgb(localConfig.verseBgColor).g}, ${hexToRgb(localConfig.verseBgColor).b}, ${(localConfig?.verseBgOpacity !== undefined ? localConfig?.verseBgOpacity : 5) / 100})`
                              : `rgba(0, 199, 169, ${(localConfig?.verseBgOpacity !== undefined ? localConfig?.verseBgOpacity : 5) / 100})`,
                            borderColor: localConfig?.verseBorderColor || undefined
                          }}
                        >
                          <div className={cn("relative z-10 w-full space-y-6", localConfig?.verseAlign || "text-center")}>
                             <div className={cn("inline-block p-4 rounded-full bg-secondary/10", (localConfig?.verseAlign || "text-center") === "text-center" ? "mx-auto" : "")}>
                                <DynamicIcon name={localConfig?.verseIcon || 'Music'} className="h-6 w-6 text-secondary" />
                             </div>
                             <h3 
                               className={cn(
                                 localConfig?.verseFontSize || "text-3xl md:text-4xl", 
                                 localConfig?.verseFontFamily || "font-headline",
                                 "leading-relaxed drop-shadow-lg transition-all duration-300"
                               )}
                               style={{ color: localConfig?.verseTextColor || 'inherit' }}
                             >
                              {versesList[0] || '"Lâmpada para os meus pés é tua palavra..." - Salmos 119:105'}
                             </h3>
                             <div className={cn("h-1 w-24 bg-secondary rounded-full", (localConfig?.verseAlign || "text-center") === "text-center" ? "mx-auto" : "")} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              {renderSpacingControls('verses', 'Versículos')}
            </TabsContent>

            <TabsContent value="programacao" className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="border-white/5 bg-card/30">
                  <CardHeader>
                    <CardTitle className="text-secondary text-lg flex items-center gap-2"><ListMusic className="h-5 w-5" /> Estilo da Grade</CardTitle>
                    <CardDescription>Customize o visual dos cartões de programação.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs">Estrutura do Layout</Label>
                      <Select value={localConfig?.programLayout || 'grid'} onValueChange={v => setLocalConfig({...localConfig, programLayout: v})}>
                        <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">Grade Vertical (Empilhado)</SelectItem>
                          <SelectItem value="carousel">Carrossel Horizontal (Deslizar)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Estilo do Cartão</Label>
                      <Select value={localConfig?.programStyle || 'glass'} onValueChange={v => setLocalConfig({...localConfig, programStyle: v})}>
                        <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="glass">Vidro (Glassmorphism)</SelectItem>
                          <SelectItem value="solid">Cor Sólida</SelectItem>
                          <SelectItem value="neon">Neon</SelectItem>
                          <SelectItem value="minimal">Minimalista (Sem fundo)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Cor do Fundo (Hex)</Label>
                      <div className="flex gap-2">
                        <Input type="color" value={localConfig?.programBgColor || '#264653'} onChange={e => setLocalConfig({...localConfig, programBgColor: e.target.value})} className="w-12 h-10 p-1 bg-background/50 border-white/10" />
                        <Input value={localConfig?.programBgColor || ''} onChange={e => setLocalConfig({...localConfig, programBgColor: e.target.value})} placeholder="#264653" className="flex-1 bg-background/50 border-white/10" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Cor da Borda (Hex)</Label>
                      <div className="flex gap-2">
                        <Input type="color" value={localConfig?.programBorderColor || '#00C7A9'} onChange={e => setLocalConfig({...localConfig, programBorderColor: e.target.value})} className="w-12 h-10 p-1 bg-background/50 border-white/10" />
                        <Input value={localConfig?.programBorderColor || ''} onChange={e => setLocalConfig({...localConfig, programBorderColor: e.target.value})} placeholder="#00C7A9" className="flex-1 bg-background/50 border-white/10" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Arredondamento</Label>
                      <Select value={localConfig?.programRadius || 'rounded-2xl'} onValueChange={v => setLocalConfig({...localConfig, programRadius: v})}>
                        <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rounded-none">Quadrado</SelectItem>
                          <SelectItem value="rounded-md">Pequeno</SelectItem>
                          <SelectItem value="rounded-2xl">Arredondado</SelectItem>
                          <SelectItem value="rounded-[3rem]">Pílula</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Alinhamento do Texto</Label>
                      <Select value={localConfig?.programTextAlign || 'text-left'} onValueChange={v => setLocalConfig({...localConfig, programTextAlign: v})}>
                        <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text-left">Esquerda</SelectItem>
                          <SelectItem value="text-center">Centro</SelectItem>
                          <SelectItem value="text-right">Direita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Ícone</Label>
                      <Select value={localConfig?.programIcon || 'Clock'} onValueChange={v => setLocalConfig({...localConfig, programIcon: v})}>
                        <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ICON_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2"><opt.icon className="h-4 w-4" />{opt.label}</div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Preview Card */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-secondary flex items-center gap-2"><Eye className="h-4 w-4" /> Pré-Visualização</h3>
                  <div className={cn(
                    "p-8 bg-black/20 rounded-xl border border-white/5 flex relative overflow-hidden",
                    localConfig?.programLayout === 'carousel' ? "overflow-x-auto snap-x snap-mandatory hide-scrollbar justify-start" : "items-center justify-center"
                  )}>
                    <div 
                      className={cn(
                        "space-y-6 transition-all duration-500 relative",
                        localConfig?.programLayout === 'carousel' ? "w-[85vw] sm:w-[350px] shrink-0 snap-center p-8" : "w-full max-w-sm p-8",
                        localConfig?.programRadius || 'rounded-2xl',
                        localConfig?.programTextAlign || 'text-left',
                        localConfig?.programStyle === 'glass' ? `teal-glass ${localConfig?.programBorderWidth || 'border'}` : 
                        localConfig?.programStyle === 'solid' ? `bg-card/90 ${localConfig?.programBorderWidth || 'border'}` : 
                        localConfig?.programStyle === 'neon' ? `bg-background/80 ${localConfig?.programBorderWidth || 'border'} shadow-[0_0_20px_rgba(var(--secondary),0.4)]` : 
                        `bg-transparent border-b ${localConfig?.programBorderWidth === 'border-0' ? 'border-b-0' : ''}`
                      )}
                      style={{
                        backgroundColor: localConfig?.programStyle === 'solid' ? (localConfig?.programBgColor || undefined) : undefined,
                        borderColor: localConfig?.programBorderColor || (localConfig?.programStyle === 'neon' ? 'var(--secondary)' : undefined),
                      }}
                    >
                      <div className={cn("flex items-center", localConfig?.programTextAlign === 'text-center' ? 'justify-center flex-col gap-4' : localConfig?.programTextAlign === 'text-right' ? 'justify-end flex-row-reverse' : 'justify-between')}>
                        <span className="text-3xl font-black text-secondary/30">12:00</span>
                        <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                          <DynamicIcon name={localConfig?.programIcon || 'Clock'} className="h-5 w-5" />
                        </div>
                      </div>
                      <div className={cn("space-y-3", localConfig?.programTextAlign === 'text-center' ? 'items-center flex flex-col' : localConfig?.programTextAlign === 'text-right' ? 'items-end flex flex-col' : '')}>
                        <h3 className="text-2xl font-headline font-bold text-foreground">Exemplo de Programa</h3>
                        <div className={cn("flex items-center gap-2 text-sm text-secondary/80 font-bold uppercase tracking-wider", localConfig?.programTextAlign === 'text-center' ? 'justify-center' : localConfig?.programTextAlign === 'text-right' ? 'justify-end flex-row-reverse' : '')}>
                          <LucideIcons.User className="h-4 w-4" />
                          <span>Locutor Exemplo</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">Descrição curta para testar o visual do cartão.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {renderSpacingControls('schedule', 'Programação')}
            </TabsContent>

            <TabsContent value="design" className="space-y-6 animate-in fade-in duration-300">
              <Card className="border-white/5 bg-card/30">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-secondary text-lg flex items-center gap-2">
                      <Palette className="h-5 w-5" /> Cores da Marca (Brand Colors)
                    </CardTitle>
                    <CardDescription>Configure as cores de identidade visual do seu site para o modo claro e escuro.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleResetDesign} className="border-destructive/30 text-destructive hover:bg-destructive/10">
                    Restaurar Padrões de Design
                  </Button>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="pt-2 pb-6 border-b border-white/5">
                    <Label className="text-sm font-bold block mb-2">Espaçamento Global entre Seções (Respiro)</Label>
                    <Select 
                      value={localConfig.sectionSpacing || 'normal'} 
                      onValueChange={v => setLocalConfig({...localConfig, sectionSpacing: v})}
                    >
                      <SelectTrigger className="bg-background/50 max-w-sm">
                        <SelectValue placeholder="Selecione o espaçamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compacto (Mais conteúdo na tela)</SelectItem>
                        <SelectItem value="normal">Normal (Padrão e Equilibrado)</SelectItem>
                        <SelectItem value="relaxed">Relaxado (Elegante e Espaçoso)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b border-white/5">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold block mb-2">Motor de Tipografia (Fontes)</Label>
                      <Select 
                        value={localConfig.fontTheme || 'classic'} 
                        onValueChange={v => setLocalConfig({...localConfig, fontTheme: v})}
                      >
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Selecione o estilo da fonte" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classic">Clássica / Gospel (Playfair + PT Sans)</SelectItem>
                          <SelectItem value="modern">Moderna / Pop (Outfit + Inter)</SelectItem>
                          <SelectItem value="impact">Jovem / Rock (Montserrat)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold block mb-2">Controle Absoluto de Cores</Label>
                      <Select 
                        value={localConfig.themeEnforcement || 'free'} 
                        onValueChange={v => setLocalConfig({...localConfig, themeEnforcement: v})}
                      >
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Forçar Tema" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Livre (Ouvinte escolhe com o botão)</SelectItem>
                          <SelectItem value="dark">Sempre Escuro (Esconde o botão)</SelectItem>
                          <SelectItem value="light">Sempre Claro (Esconde o botão)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

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

                  {/* Estilos Avançados do Hero */}
                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <Label className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                      Estilos Avançados do Topo (Hero)
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs">Estilo de Layout Base</Label>
                        <Select 
                          value={localConfig?.heroLayout || 'classic'} 
                          onValueChange={(val) => setLocalConfig({...localConfig, heroLayout: val})}
                        >
                          <SelectTrigger className="bg-background/50 border-white/10">
                            <SelectValue placeholder="Selecione o Layout" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="classic">Layout Clássico (Centralizado)</SelectItem>
                            <SelectItem value="split">Split Layout (Texto Lateral)</SelectItem>
                            <SelectItem value="clean">Layout Limpo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs">Animação de Fundo</Label>
                        <Select 
                          value={localConfig?.heroAnimation || 'none'} 
                          onValueChange={(val) => setLocalConfig({...localConfig, heroAnimation: val})}
                        >
                          <SelectTrigger className="bg-background/50 border-white/10">
                            <SelectValue placeholder="Sem Animação" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Estático (Padrão)</SelectItem>
                            <SelectItem value="ken-burns">Efeito Ken Burns (Zoom Cinematográfico)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Filtro de Overlay (Camada de Cor)</Label>
                        <Select 
                          value={localConfig?.heroOverlayStyle || 'classic'} 
                          onValueChange={(val) => setLocalConfig({...localConfig, heroOverlayStyle: val})}
                        >
                          <SelectTrigger className="bg-background/50 border-white/10">
                            <SelectValue placeholder="Gradiente Clássico Escuro" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="classic">Gradiente Clássico Escuro</SelectItem>
                            <SelectItem value="primary-tint">Tonalidade Cor Primária</SelectItem>
                            <SelectItem value="solid-dark">Escurecimento Sólido Uniforme</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
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
                                  const isDragging = draggedNoticeIndex === idx;
                                  return (
                                    <TableRow 
                                      key={item.id} 
                                      draggable
                                      onDragStart={() => setDraggedNoticeIndex(idx)}
                                      onDragOver={(e) => {
                                        e.preventDefault();
                                        if (draggedNoticeIndex === null || draggedNoticeIndex === idx) return;
                                        
                                        const newList = [...noticesList];
                                        const draggedItem = newList[draggedNoticeIndex];
                                        newList.splice(draggedNoticeIndex, 1);
                                        newList.splice(idx, 0, draggedItem);
                                        
                                        setNoticesList(newList);
                                        setDraggedNoticeIndex(idx);
                                      }}
                                      onDragEnd={() => {
                                        setDraggedNoticeIndex(null);
                                      }}
                                      className={cn(
                                        "hover:bg-white/5 cursor-grab active:cursor-grabbing transition-colors", 
                                        expired && "opacity-50",
                                        isDragging && "opacity-50 bg-secondary/10"
                                      )}
                                    >
                                      <TableCell className="py-3 pl-4">
                                        <div className="flex items-center gap-2">
                                          <div className="text-muted-foreground mr-1">
                                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><path d="M5.5 3C5.5 3.27614 5.27614 3.5 5 3.5C4.72386 3.5 4.5 3.27614 4.5 3C4.5 2.72386 4.72386 2.5 5 2.5C5.27614 2.5 5.5 2.72386 5.5 3ZM9.5 3C9.5 3.27614 9.27614 3.5 9 3.5C8.72386 3.5 8.5 3.27614 8.5 3C8.5 2.72386 8.72386 2.5 9 2.5C9.27614 2.5 9.5 2.72386 9.5 3ZM5.5 7.5C5.5 7.77614 5.27614 8 5 8C4.72386 8 4.5 7.77614 4.5 7.5C4.5 7.22386 4.72386 7 5 7C5.27614 7 5.5 7.22386 5.5 7.5ZM9.5 7.5C9.5 7.77614 9.27614 8 9 8C8.72386 8 8.5 7.77614 8.5 7.5C8.5 7.22386 8.72386 7 9 7C9.27614 7 9.5 7.22386 9.5 7.5ZM5.5 12C5.5 12.2761 5.27614 12.5 5 12.5C4.72386 12.5 4.5 12.2761 4.5 12C4.5 11.7239 4.72386 11.5 5 11.5C5.27614 11.5 5.5 11.7239 5.5 12ZM9.5 12C9.5 12.2761 9.27614 12.5 9 12.5C8.72386 12.5 8.5 12.2761 8.5 12C8.5 11.7239 8.72386 11.5 9 11.5C9.27614 11.5 9.5 11.7239 9.5 12Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                          </div>
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

                  <div className="pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase">Disposição (Layout)</Label>
                      <Select 
                        value={localConfig.aboutLayout || 'right-image'} 
                        onValueChange={v => setLocalConfig({...localConfig, aboutLayout: v})}
                      >
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Selecione o estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="right-image">Imagem à Direita (Padrão)</SelectItem>
                          <SelectItem value="left-image">Imagem à Esquerda</SelectItem>
                          <SelectItem value="center-no-image">Texto Centralizado (Sem Imagem)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase">Estilo de Fundo</Label>
                      <Select 
                        value={localConfig.aboutBgStyle || 'transparent'} 
                        onValueChange={v => setLocalConfig({...localConfig, aboutBgStyle: v})}
                      >
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Selecione o fundo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transparent">Transparente (Padrão)</SelectItem>
                          <SelectItem value="glass">Glassmorphism (Vidro)</SelectItem>
                          <SelectItem value="secondary-light">Destaque Suave (Secundária)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {renderSpacingControls('about', 'Sobre Nós')}
            </TabsContent>

            <TabsContent value="player" className="space-y-6 animate-in fade-in duration-300">
              <Card className="border-white/5 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-secondary text-lg">Configurações do Player</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs">URL do Áudio (Stream)</Label>
                    <input value={localConfig.streamUrl || ''} onChange={e => setLocalConfig({...localConfig, streamUrl: e.target.value})} className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm" />
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <Label className="text-sm font-bold">Layout Visual do Player</Label>
                    <Select 
                      value={localConfig.playerLayout || 'hidden-to-pill'} 
                      onValueChange={v => setLocalConfig({...localConfig, playerLayout: v})}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Selecione o estilo do player" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hidden-to-pill">Oculto → Ilha Dinâmica (Atual)</SelectItem>
                        <SelectItem value="bar-to-pill">Barra Completa → Ilha Dinâmica</SelectItem>
                        <SelectItem value="always-pill">Sempre Ilha Dinâmica Flutuante</SelectItem>
                        <SelectItem value="always-bar">Sempre Barra Clássica (Fixa)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground mt-1">Define o comportamento do player na base da tela quando o usuário rola a página.</p>
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
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <Label className="text-xs font-bold text-muted-foreground uppercase">Estilo de Fundo do Rodapé</Label>
                       <Select 
                         value={localConfig.footerStyle || 'glass'} 
                         onValueChange={v => setLocalConfig({...localConfig, footerStyle: v})}
                       >
                         <SelectTrigger className="bg-background/50">
                           <SelectValue placeholder="Selecione o estilo" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="glass">Glassmorphism (Translúcido)</SelectItem>
                           <SelectItem value="solid">Sólido Escuro (Clássico)</SelectItem>
                           <SelectItem value="minimal">Minimalista (Sem Fundo)</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                     <div className="space-y-2">
                       <Label className="text-xs font-bold text-muted-foreground uppercase">Alinhamento do Rodapé</Label>
                       <Select 
                         value={localConfig.footerAlign || 'left'} 
                         onValueChange={v => setLocalConfig({...localConfig, footerAlign: v})}
                       >
                         <SelectTrigger className="bg-background/50">
                           <SelectValue placeholder="Selecione o alinhamento" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="left">Alinhado à Esquerda</SelectItem>
                           <SelectItem value="center">Centralizado</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                   </div>

                   <div className="pt-6 border-t border-white/5 space-y-4">
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
                     <div className="flex items-center justify-between">
                       <Label className="text-sm font-bold">Links Úteis</Label>
                       <Switch 
                         checked={localConfig.showUsefulLinks !== false} 
                         onCheckedChange={v => setLocalConfig({...localConfig, showUsefulLinks: v})} 
                       />
                     </div>
                     {localConfig.showUsefulLinks !== false && (
                       <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
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
                                {usefulLinks.map((link, idx) => {
                                  const isDragging = draggedLinkIndex === idx;
                                  return (
                                    <TableRow 
                                      key={idx}
                                      draggable
                                      onDragStart={() => setDraggedLinkIndex(idx)}
                                      onDragOver={(e) => {
                                        e.preventDefault();
                                        if (draggedLinkIndex === null || draggedLinkIndex === idx) return;
                                        
                                        const newList = [...usefulLinks];
                                        const draggedItem = newList[draggedLinkIndex];
                                        newList.splice(draggedLinkIndex, 1);
                                        newList.splice(idx, 0, draggedItem);
                                        
                                        setUsefulLinks(newList);
                                        setDraggedLinkIndex(idx);
                                      }}
                                      onDragEnd={() => {
                                        setDraggedLinkIndex(null);
                                      }}
                                      className={cn(
                                        "cursor-grab active:cursor-grabbing transition-colors",
                                        isDragging && "opacity-50 bg-secondary/10"
                                      )}
                                    >
                                      <TableCell className="font-medium text-xs truncate max-w-[150px]">
                                        <div className="flex items-center gap-2">
                                          <div className="text-muted-foreground">
                                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><path d="M5.5 3C5.5 3.27614 5.27614 3.5 5 3.5C4.72386 3.5 4.5 3.27614 4.5 3C4.5 2.72386 4.72386 2.5 5 2.5C5.27614 2.5 5.5 2.72386 5.5 3ZM9.5 3C9.5 3.27614 9.27614 3.5 9 3.5C8.72386 3.5 8.5 3.27614 8.5 3C8.5 2.72386 8.72386 2.5 9 2.5C9.27614 2.5 9.5 2.72386 9.5 3ZM5.5 7.5C5.5 7.77614 5.27614 8 5 8C4.72386 8 4.5 7.77614 4.5 7.5C4.5 7.22386 4.72386 7 5 7C5.27614 7 5.5 7.22386 5.5 7.5ZM9.5 7.5C9.5 7.77614 9.27614 8 9 8C8.72386 8 8.5 7.77614 8.5 7.5C8.5 7.22386 8.72386 7 9 7C9.27614 7 9.5 7.22386 9.5 7.5ZM5.5 12C5.5 12.2761 5.27614 12.5 5 12.5C4.72386 12.5 4.5 12.2761 4.5 12C4.5 11.7239 4.72386 11.5 5 11.5C5.27614 11.5 5.5 11.7239 5.5 12ZM9.5 12C9.5 12.2761 9.27614 12.5 9 12.5C8.72386 12.5 8.5 12.2761 8.5 12C8.5 11.7239 8.72386 11.5 9 11.5C9.27614 11.5 9.5 11.7239 9.5 12Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                          </div>
                                          {link.label}
                                        </div>
                                      </TableCell>
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
                                )})}
                              </TableBody>
                            </Table>
                         </div>
                       </div>
                     )}
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

               <Card className="border-white/5 bg-card/30 mt-6">
                 <CardHeader>
                   <CardTitle className="text-secondary text-lg">Ordem da Página Inicial</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-2">
                     {(localConfig.homeModulesOrder || ['about', 'schedule', 'verses']).map((modId: string, idx: number) => {
                       const moduleLabels: Record<string, string> = { 'about': 'Sobre Nós', 'schedule': 'Programação', 'verses': 'Versículos' };
                       const isDragging = draggedModuleIndex === idx;
                        
                       return (
                         <div 
                           key={modId} 
                           draggable
                           onDragStart={() => setDraggedModuleIndex(idx)}
                           onDragOver={(e) => {
                             e.preventDefault();
                             if (draggedModuleIndex === null || draggedModuleIndex === idx) return;
                             
                             const newOrder = [...(localConfig.homeModulesOrder || ['about', 'schedule', 'verses'])];
                             const draggedItem = newOrder[draggedModuleIndex];
                             newOrder.splice(draggedModuleIndex, 1);
                             newOrder.splice(idx, 0, draggedItem);
                             
                             setLocalConfig({...localConfig, homeModulesOrder: newOrder});
                             setDraggedModuleIndex(idx);
                           }}
                           onDragEnd={() => setDraggedModuleIndex(null)}
                           className={cn(
                             "flex items-center justify-between p-3 bg-background/40 border border-white/5 rounded-xl cursor-grab active:cursor-grabbing transition-colors",
                             isDragging ? "opacity-50 bg-secondary/10 border-secondary/50" : "hover:border-white/10"
                           )}
                         >
                           <div className="flex items-center gap-3">
                             <div className="text-muted-foreground">
                               <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><path d="M5.5 3C5.5 3.27614 5.27614 3.5 5 3.5C4.72386 3.5 4.5 3.27614 4.5 3C4.5 2.72386 4.72386 2.5 5 2.5C5.27614 2.5 5.5 2.72386 5.5 3ZM9.5 3C9.5 3.27614 9.27614 3.5 9 3.5C8.72386 3.5 8.5 3.27614 8.5 3C8.5 2.72386 8.72386 2.5 9 2.5C9.27614 2.5 9.5 2.72386 9.5 3ZM5.5 7.5C5.5 7.77614 5.27614 8 5 8C4.72386 8 4.5 7.77614 4.5 7.5C4.5 7.22386 4.72386 7 5 7C5.27614 7 5.5 7.22386 5.5 7.5ZM9.5 7.5C9.5 7.77614 9.27614 8 9 8C8.72386 8 8.5 7.77614 8.5 7.5C8.5 7.22386 8.72386 7 9 7C9.27614 7 9.5 7.22386 9.5 7.5ZM5.5 12C5.5 12.2761 5.27614 12.5 5 12.5C4.72386 12.5 4.5 12.2761 4.5 12C4.5 11.7239 4.72386 11.5 5 11.5C5.27614 11.5 5.5 11.7239 5.5 12ZM9.5 12C9.5 12.2761 9.27614 12.5 9 12.5C8.72386 12.5 8.5 12.2761 8.5 12C8.5 11.7239 8.72386 11.5 9 11.5C9.27614 11.5 9.5 11.7239 9.5 12Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                             </div>
                             <Label className="text-xs font-medium cursor-grab">{moduleLabels[modId] || modId}</Label>
                           </div>
                           <div className="flex gap-1 pointer-events-none">
                             <Button variant="ghost" size="icon" disabled={idx === 0} className="h-8 w-8 text-secondary/50"><ArrowUp className="h-4 w-4" /></Button>
                             <Button variant="ghost" size="icon" disabled={idx === (localConfig.homeModulesOrder || ['about', 'schedule', 'verses']).length - 1} className="h-8 w-8 text-secondary/50"><ArrowDown className="h-4 w-4" /></Button>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                   <p className="text-[10px] text-muted-foreground mt-4">A ordem acima define como os blocos serão organizados visualmente na página principal.</p>
                 </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
