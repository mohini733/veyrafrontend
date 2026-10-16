'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomizationContext = createContext(null);

export const THEMES = [
  {
    id: 'midnight',
    name: 'Midnight Navy',
    description: 'Classic Veyra dark navy with electric violet accents',
    primary: '#8b5cf6',
    background: '#090d16',
    card: '#0c1220',
    border: '#1e293b',
    gradient: 'from-violet-600 to-indigo-600',
    swatch: 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-600',
  },
  {
    id: 'cyber',
    name: 'Cyber Violet',
    description: 'Neon cyberpunk magenta and purple hues',
    primary: '#d946ef',
    background: '#0d0716',
    card: '#160d24',
    border: '#2e1847',
    gradient: 'from-fuchsia-600 to-purple-600',
    swatch: 'bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-violet-700',
  },
  {
    id: 'obsidian',
    name: 'Obsidian OLED',
    description: 'Pure pitch black optimized for OLED displays',
    primary: '#a1a1aa',
    background: '#000000',
    card: '#0a0a0a',
    border: '#27272a',
    gradient: 'from-zinc-700 to-zinc-900',
    swatch: 'bg-gradient-to-tr from-zinc-900 via-neutral-900 to-black border border-zinc-700',
  },
  {
    id: 'ocean',
    name: 'Deep Oceanic',
    description: 'Aquatic depths with vibrant cyan accents',
    primary: '#06b6d4',
    background: '#05101a',
    card: '#0a1a2b',
    border: '#163554',
    gradient: 'from-cyan-500 to-blue-600',
    swatch: 'bg-gradient-to-tr from-cyan-500 via-teal-600 to-blue-700',
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    description: 'Dark botanical forest with radiant emerald glow',
    primary: '#10b981',
    background: '#05140d',
    card: '#0a2217',
    border: '#14402b',
    gradient: 'from-emerald-500 to-teal-700',
    swatch: 'bg-gradient-to-tr from-emerald-500 via-green-600 to-teal-800',
  },
  {
    id: 'sunset',
    name: 'Sunset Rose',
    description: 'Warm dusk with luxury rose and amber gradients',
    primary: '#f43f5e',
    background: '#140a10',
    card: '#22111b',
    border: '#451e33',
    gradient: 'from-rose-500 to-amber-600',
    swatch: 'bg-gradient-to-tr from-rose-500 via-pink-600 to-amber-600',
  },
];

export const WALLPAPER_PRESETS = [
  {
    id: 'none',
    name: 'Default Clean',
    type: 'color',
    value: '',
    preview: 'bg-[#090d16]',
  },
  {
    id: 'doodle',
    name: 'Veyra Chat Doodles',
    type: 'pattern',
    value: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><path d="M14 16h8v6h-8zM50 16h10v6H50zM24 48h10v6H24zM60 52h8v6h-8z" fill="%238b5cf6" fill-opacity="0.06"/><circle cx="36" cy="24" r="4" fill="%23a78bfa" fill-opacity="0.08"/><circle cx="68" cy="38" r="3" fill="%238b5cf6" fill-opacity="0.07"/><path d="M10 60l6-6 6 6-6 6z" fill="%236366f1" fill-opacity="0.07"/></svg>`,
    preview: 'bg-[#090d16] bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px]',
  },
  {
    id: 'geometric',
    name: 'Cyber Grid',
    type: 'pattern',
    value: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M0 40L40 0H20L0 20M40 40V20L20 40" fill="none" stroke="%238b5cf6" stroke-width="0.8" stroke-opacity="0.1"/></svg>`,
    preview: 'bg-[#0b0f19] bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px]',
  },
  {
    id: 'cosmic',
    name: 'Starry Nebula',
    type: 'gradient',
    value: 'radial-gradient(ellipse at top, rgba(139,92,246,0.18), transparent 60%), radial-gradient(ellipse at bottom, rgba(59,130,246,0.12), transparent 70%), #090d16',
    preview: 'bg-gradient-to-b from-violet-950/60 via-slate-950 to-indigo-950/70',
  },
  {
    id: 'minimal_lines',
    name: 'Minimal Wave',
    type: 'pattern',
    value: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="1.5" fill="%2394a3b8" fill-opacity="0.15"/></svg>`,
    preview: 'bg-[#090d16] bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:12px_12px]',
  },
];

export const APP_ICON_PRESETS = [
  {
    id: 'violet',
    name: 'Veyra Violet',
    gradient: 'from-violet-600 to-indigo-600',
    color: '#8b5cf6',
  },
  {
    id: 'emerald',
    name: 'Neon Emerald',
    gradient: 'from-emerald-500 to-teal-600',
    color: '#10b981',
  },
  {
    id: 'gold',
    name: 'Imperial Gold',
    gradient: 'from-amber-400 to-orange-600',
    color: '#f59e0b',
  },
  {
    id: 'cyan',
    name: 'Cyber Cyan',
    gradient: 'from-cyan-400 to-blue-600',
    color: '#06b6d4',
  },
  {
    id: 'ruby',
    name: 'Ruby Blaze',
    gradient: 'from-rose-500 to-pink-600',
    color: '#f43f5e',
  },
];

export const CustomizationProvider = ({ children }) => {
  const [theme, setThemeState] = useState('midnight');
  const [wallpaper, setWallpaperState] = useState('');
  const [wallpaperDim, setWallpaperDim] = useState(60); // 0 - 100 percentage
  const [appIcon, setAppIconState] = useState('violet');
  const [customAppIcon, setCustomAppIconState] = useState('');

  // Load customizations on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedTheme = localStorage.getItem('veyra_theme') || 'midnight';
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      document.body.setAttribute('data-theme', savedTheme);

      const savedWallpaper = localStorage.getItem('veyra_chat_wallpaper');
      if (savedWallpaper) {
        setWallpaperState(savedWallpaper);
      }

      const savedDim = localStorage.getItem('veyra_chat_wallpaper_dim');
      if (savedDim) {
        setWallpaperDim(Number(savedDim));
      }

      const savedIcon = localStorage.getItem('veyra_app_icon');
      if (savedIcon) {
        setAppIconState(savedIcon);
      }

      const savedCustomIcon = localStorage.getItem('veyra_custom_app_icon');
      if (savedCustomIcon) {
        setCustomAppIconState(savedCustomIcon);
        updateFavicon(savedCustomIcon);
      }
    } catch (e) {
      console.warn('Error reading saved customization preferences:', e);
    }
  }, []);

  // Dynamically inject active theme styles into document head
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const active = THEMES.find((t) => t.id === theme) || THEMES[0];

    let styleTag = document.getElementById('veyra-active-theme-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'veyra-active-theme-styles';
      document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `
      body,
      div[class*="bg-[#090d16]"],
      main[class*="bg-[#090d16]"] {
        background-color: ${active.background} !important;
      }
      div[class*="bg-[#0c1220]"],
      div[class*="bg-[#111827]"] {
        background-color: ${active.card} !important;
      }
      aside[class*="bg-[#0b0f19]"],
      div[class*="bg-[#0b0f19]"] {
        background-color: ${active.card} !important;
      }
      [class*="border-slate-800"],
      [class*="border-slate-700"] {
        border-color: ${active.border} !important;
      }
      span[class*="text-violet-400"],
      p[class*="text-violet-400"],
      a[class*="text-violet-400"],
      svg[class*="text-violet-400"],
      [class*="text-violet-300"] {
        color: ${active.primary} !important;
      }
      button[class*="bg-violet-600"],
      div[class*="bg-violet-600"]:not([class*="/"]),
      span[class*="bg-violet-600"]:not([class*="/"]) {
        background-color: ${active.primary} !important;
      }
      div[class*="bg-violet-600/10"],
      div[class*="bg-violet-600/15"],
      div[class*="bg-violet-600/20"],
      button[class*="bg-violet-600/20"] {
        background-color: ${active.primary}25 !important;
      }
      div[class*="border-violet-500"],
      button[class*="border-violet-500"] {
        border-color: ${active.primary} !important;
      }
      div[class*="from-violet-600"][class*="to-indigo-600"],
      button[class*="from-violet-600"][class*="to-indigo-600"] {
        background-image: linear-gradient(135deg, ${active.primary}, ${active.primary}cc) !important;
      }
    `;
  }, [theme]);

  const setTheme = (themeId) => {
    setThemeState(themeId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('veyra_theme', themeId);
      document.documentElement.setAttribute('data-theme', themeId);
      document.body.setAttribute('data-theme', themeId);
    }
  };

  const setWallpaper = (wallpaperValue) => {
    setWallpaperState(wallpaperValue);
    if (typeof window !== 'undefined') {
      if (wallpaperValue) {
        localStorage.setItem('veyra_chat_wallpaper', wallpaperValue);
      } else {
        localStorage.removeItem('veyra_chat_wallpaper');
      }
    }
  };

  const updateWallpaperDim = (val) => {
    setWallpaperDim(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('veyra_chat_wallpaper_dim', val.toString());
    }
  };

  const setAppIcon = (iconPresetId) => {
    setAppIconState(iconPresetId);
    setCustomAppIconState('');
    if (typeof window !== 'undefined') {
      localStorage.setItem('veyra_app_icon', iconPresetId);
      localStorage.removeItem('veyra_custom_app_icon');
    }
  };

  const setCustomAppIcon = (dataUrl) => {
    setCustomAppIconState(dataUrl);
    setAppIconState('custom');
    if (typeof window !== 'undefined') {
      localStorage.setItem('veyra_custom_app_icon', dataUrl);
      localStorage.setItem('veyra_app_icon', 'custom');
      updateFavicon(dataUrl);
    }
  };

  const updateFavicon = (iconSrc) => {
    if (typeof window === 'undefined') return;
    try {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = iconSrc;
    } catch (e) {
      console.warn('Could not update favicon:', e);
    }
  };

  const resetAll = () => {
    setTheme('midnight');
    setWallpaper('');
    updateWallpaperDim(60);
    setAppIcon('violet');
    setCustomAppIconState('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('veyra_theme');
      localStorage.removeItem('veyra_chat_wallpaper');
      localStorage.removeItem('veyra_chat_wallpaper_dim');
      localStorage.removeItem('veyra_app_icon');
      localStorage.removeItem('veyra_custom_app_icon');
      document.documentElement.setAttribute('data-theme', 'midnight');
    }
  };

  // Helper to get active theme object
  const activeTheme = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <CustomizationContext.Provider
      value={{
        theme,
        setTheme,
        activeTheme,
        wallpaper,
        setWallpaper,
        wallpaperDim,
        updateWallpaperDim,
        appIcon,
        setAppIcon,
        customAppIcon,
        setCustomAppIcon,
        resetAll,
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
};

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
};

export default CustomizationContext;
