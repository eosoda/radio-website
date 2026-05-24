import './globals.css';
import { getServerConfig } from '@/firebase/server';
import { getCustomStyleTag } from '@/lib/theme-utils';
import { ClientProviders } from '@/components/ClientProviders';
import { Metadata } from 'next';
import { cn } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getServerConfig();
  
  if (!config) {
    return {
      title: 'Rádio',
      description: 'Ouça a nossa rádio 24h',
    };
  }

  const title = config.appName || 'Rádio Maranata';
  const description = config.slogan || 'A Voz da Esperança 24h';
  const logoUrl = config.logoImageUrl || 'https://picsum.photos/seed/radio-maranata-192/192/192';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: logoUrl }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [logoUrl],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getServerConfig();
  const styles = getCustomStyleTag(config);
  
  const isMaintenance = config?.maintenanceMode;
  const showBottomPlayer = config?.showBottomPlayer !== false && !isMaintenance;
  
  const initialThemeColor = config?.primaryColorDark || '#0b1317';
  
  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RadioStation",
    "name": config?.appName || "Rádio Maranata",
    "description": config?.slogan || "A Voz da Esperança 24h",
    "image": config?.logoImageUrl || "https://picsum.photos/seed/radio-maranata-192/192/192",
    "url": "https://radiomaranata.com", // Adjust as necessary
    "broadcastDisplayName": config?.appName || "Rádio Maranata",
    "broadcastFrequency": "Web Rádio",
  };

  return (
    <html 
      lang="pt-BR" 
      className="scroll-smooth dark" // default to dark initially, client will adjust
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {config?.fontTheme === 'modern' ? (
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Outfit:wght@400;600;800&display=swap" rel="stylesheet" />
        ) : config?.fontTheme === 'impact' ? (
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,700;0,900;1,400&display=swap" rel="stylesheet" />
        ) : (
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=PT+Sans:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
        )}
        
        {/* Favicon via Emoji */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎙️</text></svg>" />
        
        {/* PWA e Meta Tags Mobile */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content={initialThemeColor} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={config?.appName || "Rádio"} />
        <link rel="apple-touch-icon" href={config?.logoImageUrl || "https://picsum.photos/seed/radio-maranata-192/192/192"} />
        
        {/* Injeção Síncrona das Cores do Tema no Servidor (Sem flash ou carregamento!) */}
        {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
        
        {/* Injeção de Structured Data SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Script leve para restaurar tema (dark/light) antes da pintura para evitar flash branco/preto na troca de tema */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var forceTheme = '${config?.themeEnforcement || "free"}';
                if (forceTheme === 'dark') {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                } else if (forceTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  var storedTheme = localStorage.getItem('radio-theme');
                  if (storedTheme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else if (storedTheme === 'system') {
                    if (!window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.classList.add('light');
                    }
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <ClientProviders showBottomPlayer={showBottomPlayer} initialThemeColor={initialThemeColor}>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}