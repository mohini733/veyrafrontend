'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Bell,
  Shield,
  Server,
  Activity,
  RefreshCw,
  ArrowLeft,
  Palette,
  Image as ImageIcon,
  Smartphone,
  Upload,
  Trash2,
  Check,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
  useCustomization,
  THEMES,
  WALLPAPER_PRESETS,
  APP_ICON_PRESETS,
} from '../../context/CustomizationContext';
import api from '../../lib/api';
import AppSidebar from '../../components/AppSidebar';
import LoadingState from '../../components/LoadingState';

export default function SettingsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // Customization context
  const {
    theme,
    setTheme,
    wallpaper,
    setWallpaper,
    wallpaperDim,
    updateWallpaperDim,
    appIcon,
    setAppIcon,
    customAppIcon,
    setCustomAppIcon,
  } = useCustomization();

  const wallpaperInputRef = useRef(null);
  const appIconInputRef = useRef(null);
  const [wallpaperFeedback, setWallpaperFeedback] = useState('');
  const [appIconFeedback, setAppIconFeedback] = useState('');

  // Settings states
  const [readReceipts, setReadReceipts] = useState(true);
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [presenceVisibility, setPresenceVisibility] = useState(true);

  // Status diagnostics
  const [healthData, setHealthData] = useState(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);

  // Handle uploading custom wallpaper from gallery
  const handleWallpaperUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setWallpaperFeedback('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setWallpaper(compressedDataUrl);
        setWallpaperFeedback('Custom wallpaper uploaded and saved from gallery!');
        setTimeout(() => setWallpaperFeedback(''), 3500);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handle uploading custom app icon from gallery
  const handleAppIconUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAppIconFeedback('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let width = img.width;
        let height = img.height;

        const minSide = Math.min(width, height);
        const startX = (width - minSide) / 2;
        const startY = (height - minSide) / 2;

        canvas.width = maxDim;
        canvas.height = maxDim;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, maxDim, maxDim);

        const compressedDataUrl = canvas.toDataURL('image/png');
        setCustomAppIcon(compressedDataUrl);
        setAppIconFeedback('Custom app icon uploaded and applied from gallery!');
        setTimeout(() => setAppIconFeedback(''), 3500);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadDiagnostics = async () => {
    try {
      setDiagnosticsLoading(true);
      const { data } = await api.get('/health');
      setHealthData(data);
    } catch (err) {
      console.error('Failed to load system diagnostics:', err);
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDiagnostics();
    }
  }, [isAuthenticated]);

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return <LoadingState message="Loading application settings..." />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-white">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto">
        {/* Header navigation */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/chats')}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Return to chats"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
              <p className="text-xs text-slate-400">Configure messaging, privacy, and services</p>
            </div>
          </div>

          <button
            onClick={loadDiagnostics}
            disabled={diagnosticsLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111827] border border-slate-800 hover:border-violet-500/40 text-slate-300 text-xs font-medium transition-all"
            title="Refresh system diagnostics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${diagnosticsLoading ? 'animate-spin' : ''}`} />
            <span>Diagnostics</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Privacy & Messaging Preferences */}
          <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-bold text-white">Privacy & Read Receipts</h2>
            </div>

            <div className="divide-y divide-slate-800/80">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-slate-200 block">Read Receipts</span>
                  <span className="text-xs text-slate-400">
                    Send acknowledgment checkmarks when you open and read messages.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReadReceipts(!readReceipts)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    readReceipts ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      readReceipts ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-slate-200 block">Online Presence</span>
                  <span className="text-xs text-slate-400">
                    Broadcast active socket status when using Veyra Chat.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPresenceVisibility(!presenceVisibility)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    presenceVisibility ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      presenceVisibility ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-bold text-white">Notifications</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-200 block">Audible Alerts</span>
                <span className="text-xs text-slate-400">
                  Play subtle chime when receiving new messages.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSoundNotifications(!soundNotifications)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  soundNotifications ? 'bg-violet-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                    soundNotifications ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Application Theme Customization */}
          <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-bold text-white">Application Theme</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Select your personalized color palette and ambient contrast mode.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEMES.map((t) => {
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative group cursor-pointer ${
                      isActive
                        ? 'border-violet-500 bg-violet-600/10 shadow-lg shadow-violet-900/20 ring-1 ring-violet-500'
                        : 'border-slate-800 bg-[#090d16] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className={`w-7 h-7 rounded-full ${t.swatch} shadow-sm`} />
                      {isActive && (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-600 text-white">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-white block truncate">
                      {t.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block line-clamp-1 mt-0.5">
                      {t.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Wallpaper Customization */}
          <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-violet-400" />
                <h2 className="text-base font-bold text-white">Chat Wallpaper</h2>
              </div>
              {wallpaper && (
                <button
                  type="button"
                  onClick={() => setWallpaper('')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Wallpaper</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Customize the background wallpaper displayed inside direct message conversations.
            </p>

            {/* Hidden file input for wallpaper */}
            <input
              type="file"
              ref={wallpaperInputRef}
              onChange={handleWallpaperUpload}
              accept="image/*"
              className="hidden"
            />

            {wallpaperFeedback && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {wallpaperFeedback}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Upload Card from Gallery */}
              <div
                onClick={() => wallpaperInputRef.current?.click()}
                className="p-5 rounded-2xl border-2 border-dashed border-slate-700 hover:border-violet-500 bg-[#090d16]/70 hover:bg-violet-600/5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-2 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-white">Upload from Gallery</span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Choose any custom image or photo from your device
                </span>
              </div>

              {/* Live Preview Box */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 h-36 bg-[#090d16] flex flex-col justify-end p-3">
                {wallpaper && (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        wallpaper.startsWith('data:') || wallpaper.startsWith('http')
                          ? `url("${wallpaper}")`
                          : wallpaper,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                )}
                {wallpaper && (
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: `rgba(9, 13, 22, ${wallpaperDim / 100})` }}
                  />
                )}
                <div className="relative z-10 space-y-1.5">
                  <div className="p-2 rounded-xl bg-slate-800/80 text-[10px] text-slate-300 w-fit max-w-[80%]">
                    Hey! How does the new wallpaper look?
                  </div>
                  <div className="p-2 rounded-xl bg-violet-600 text-[10px] text-white w-fit max-w-[80%] ml-auto">
                    Looks fantastic and crystal clear! ✨
                  </div>
                </div>
              </div>
            </div>

            {/* Dimming Slider */}
            {wallpaper && (
              <div className="mb-4 p-3.5 rounded-2xl bg-[#090d16] border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300 font-medium">Text Readability Dimming:</span>
                  <span className="font-mono text-violet-400 font-bold">{wallpaperDim}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  value={wallpaperDim}
                  onChange={(e) => updateWallpaperDim(Number(e.target.value))}
                  className="w-full accent-violet-600 cursor-pointer"
                />
              </div>
            )}

            {/* Presets Grid */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
                Or Choose a Preset Wallpaper:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {WALLPAPER_PRESETS.map((p) => {
                  const isSelected = wallpaper === p.value;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setWallpaper(p.value)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-violet-500 bg-violet-600/20 text-white font-bold ring-1 ring-violet-500'
                          : 'border-slate-800 bg-[#090d16] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className={`w-full h-8 rounded-lg mb-1.5 border border-slate-700/60 ${p.preview}`} />
                      <span className="text-[11px] block truncate">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* App Icon & Branding Customization */}
          <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-violet-400" />
                <h2 className="text-base font-bold text-white">App Icon & Branding</h2>
              </div>
              {(customAppIcon || appIcon !== 'violet') && (
                <button
                  type="button"
                  onClick={() => setAppIcon('violet')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] text-slate-400 hover:text-violet-300 hover:bg-violet-600/10 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset to Default</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Select or upload a custom app icon from your gallery to personalize sidebar and browser branding.
            </p>

            {/* Hidden file input for app icon */}
            <input
              type="file"
              ref={appIconInputRef}
              onChange={handleAppIconUpload}
              accept="image/*"
              className="hidden"
            />

            {appIconFeedback && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {appIconFeedback}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Custom gallery upload box */}
              <button
                type="button"
                onClick={() => appIconInputRef.current?.click()}
                className="w-full sm:w-auto flex-1 p-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-violet-500 bg-[#090d16]/70 hover:bg-violet-600/5 flex items-center gap-3 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-white block">Upload Icon from Gallery</span>
                  <span className="text-[11px] text-slate-400 block">
                    Use any logo, PNG, or photo as app icon
                  </span>
                </div>
              </button>

              {/* Current Icon Preview */}
              <div className="p-3.5 rounded-2xl bg-[#090d16] border border-slate-800 flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-400">Current Icon:</span>
                {customAppIcon ? (
                  <img
                    src={customAppIcon}
                    alt="Active Icon"
                    className="w-10 h-10 rounded-2xl object-cover border border-violet-500/40 shadow-md shadow-violet-900/30"
                  />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${
                      APP_ICON_PRESETS.find((p) => p.id === appIcon)?.gradient ||
                      'from-violet-600 to-indigo-600'
                    } flex items-center justify-center text-white shadow-md shadow-violet-900/30`}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>

            {/* Icon Presets */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
                Preset App Icons:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {APP_ICON_PRESETS.map((preset) => {
                  const isSelected = !customAppIcon && appIcon === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAppIcon(preset.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-violet-500 bg-violet-600/20 text-white font-bold ring-1 ring-violet-500'
                          : 'border-slate-800 bg-[#090d16] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${preset.gradient} flex items-center justify-center text-white shadow-sm`}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] truncate w-full text-center">{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-bold text-white">Backend Health Diagnostics</h2>
            </div>

            {healthData ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
                  <span className="text-slate-500 block mb-1">Status</span>
                  <span className="font-bold text-emerald-400 uppercase">{healthData.status}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
                  <span className="text-slate-500 block mb-1">Version</span>
                  <span className="font-mono text-slate-200">{healthData.version}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
                  <span className="text-slate-500 block mb-1">Uptime</span>
                  <span className="font-mono text-slate-200">{healthData.uptime}s</span>
                </div>
                <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
                  <span className="text-slate-500 block mb-1">Environment</span>
                  <span className="font-mono text-slate-200">{healthData.environment}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">Connecting to /api/health...</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
