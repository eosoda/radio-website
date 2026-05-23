export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return {
    r: isNaN(r) ? 0 : r,
    g: isNaN(g) ? 0 : g,
    b: isNaN(b) ? 0 : b,
  };
}

export function hslToStr({ h, s, l }: { h: number; s: number; l: number }): string {
  return `${h} ${s}% ${l}%`;
}

export function getContrastForeground(hex: string): string {
  const hsl = hexToHsl(hex);
  return hsl.l > 60 ? '197 45% 10%' : '210 20% 98%';
}

export function getCustomStyleTag(config: any) {
  if (!config) return '';

  const colors = {
    primaryLight: config.primaryColorLight || '#264653',
    secondaryLight: config.secondaryColorLight || '#008f7a',
    bgLight: config.backgroundColorLight || '#f1f5f9',
    textLight: config.textColorLight || '#0f1e24',

    primaryDark: config.primaryColorDark || '#264653',
    secondaryDark: config.secondaryColorDark || '#00c7a9',
    bgDark: config.backgroundColorDark || '#0b1317',
    textDark: config.textColorDark || '#f1f5f9',
  };

  const pL = hexToHsl(colors.primaryLight);
  const sL = hexToHsl(colors.secondaryLight);
  const bgL = hexToHsl(colors.bgLight);
  const tL = hexToHsl(colors.textLight);

  const pD = hexToHsl(colors.primaryDark);
  const sD = hexToHsl(colors.secondaryDark);
  const bgD = hexToHsl(colors.bgDark);
  const tD = hexToHsl(colors.textDark);

  const rgbPL = hexToRgb(colors.primaryLight);
  const rgbPD = hexToRgb(colors.primaryDark);

  const primaryLightStr = hslToStr(pL);
  const primaryFgLightStr = getContrastForeground(colors.primaryLight);
  const secondaryLightStr = hslToStr(sL);
  const secondaryFgLightStr = getContrastForeground(colors.secondaryLight);
  const bgLightStr = hslToStr(bgL);
  const fgLightStr = hslToStr(tL);

  const cardLightStr = hslToStr({ h: bgL.h, s: bgL.s, l: bgL.l > 80 ? Math.max(0, bgL.l - 2) : Math.min(100, bgL.l + 2) });
  const popoverLightStr = hslToStr({ h: bgL.h, s: bgL.s, l: bgL.l > 80 ? 100 : Math.max(0, bgL.l - 2) });
  const borderLightStr = hslToStr({ h: bgL.h, s: bgL.s, l: Math.max(0, bgL.l - 8) });
  const inputLightStr = borderLightStr;
  const ringLightStr = secondaryLightStr;
  const mutedLightStr = hslToStr({ h: bgL.h, s: Math.max(0, bgL.s - 10), l: Math.max(0, bgL.l - 5) });
  const mutedFgLightStr = hslToStr({ h: tL.h, s: Math.max(0, tL.s - 20), l: Math.max(0, Math.min(100, tL.l > 50 ? tL.l - 20 : tL.l + 30)) });

  const primaryDarkStr = hslToStr(pD);
  const primaryFgDarkStr = getContrastForeground(colors.primaryDark);
  const secondaryDarkStr = hslToStr(sD);
  const secondaryFgDarkStr = getContrastForeground(colors.secondaryDark);
  const bgDarkStr = hslToStr(bgD);
  const fgDarkStr = hslToStr(tD);

  const cardDarkStr = hslToStr({ h: bgD.h, s: bgD.s, l: Math.min(100, bgD.l + 4) });
  const popoverDarkStr = hslToStr({ h: bgD.h, s: bgD.s, l: Math.min(100, bgD.l + 2) });
  const borderDarkStr = hslToStr({ h: bgD.h, s: bgD.s, l: Math.min(100, bgD.l + 12) });
  const inputDarkStr = borderDarkStr;
  const ringDarkStr = secondaryDarkStr;
  const mutedDarkStr = hslToStr({ h: bgD.h, s: Math.max(0, bgD.s - 15), l: Math.min(100, bgD.l + 12) });
  const mutedFgDarkStr = hslToStr({ h: tD.h, s: Math.max(0, tD.s - 10), l: Math.max(0, tD.l - 28) });

  return `
    :root {
      --background: ${bgLightStr};
      --foreground: ${fgLightStr};
      --card: ${cardLightStr};
      --card-foreground: ${fgLightStr};
      --popover: ${popoverLightStr};
      --popover-foreground: ${fgLightStr};
      --primary: ${primaryLightStr};
      --primary-foreground: ${primaryFgLightStr};
      --secondary: ${secondaryLightStr};
      --secondary-foreground: ${secondaryFgLightStr};
      --muted: ${mutedLightStr};
      --muted-foreground: ${mutedFgLightStr};
      --accent: ${secondaryLightStr};
      --accent-foreground: ${secondaryFgLightStr};
      --border: ${borderLightStr};
      --input: ${inputLightStr};
      --ring: ${ringLightStr};
    }

    .light .teal-glass {
      background: rgba(255, 255, 255, 0.85) !important;
      border: 1px solid rgba(${rgbPL.r}, ${rgbPL.g}, ${rgbPL.b}, 0.08) !important;
    }

    .dark {
      --background: ${bgDarkStr};
      --foreground: ${fgDarkStr};
      --card: ${cardDarkStr};
      --card-foreground: ${fgDarkStr};
      --popover: ${popoverDarkStr};
      --popover-foreground: ${fgDarkStr};
      --primary: ${primaryDarkStr};
      --primary-foreground: ${primaryFgDarkStr};
      --secondary: ${secondaryDarkStr};
      --secondary-foreground: ${secondaryFgDarkStr};
      --muted: ${mutedDarkStr};
      --muted-foreground: ${mutedFgDarkStr};
      --accent: ${secondaryDarkStr};
      --accent-foreground: ${secondaryFgDarkStr};
      --border: ${borderDarkStr};
      --input: ${inputDarkStr};
      --ring: ${ringDarkStr};
    }
    
    .dark .teal-glass {
      background: rgba(11, 19, 23, 0.6) !important;
      border: 1px solid rgba(${rgbPD.r}, ${rgbPD.g}, ${rgbPD.b}, 0.1) !important;
    }
  `;
}
