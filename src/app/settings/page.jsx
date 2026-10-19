'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Bell,
  BellRing,
  Volume2,
  Vibrate,
  Eye,
  Shield,
  Server,
  RefreshCw,
  ArrowLeft,
  Palette,
  Image as ImageIcon,
  Upload,
  Trash2,
  CheckCheck,
  Radio,
  Sparkles,
  Music,
  Play,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
  useCustomization,
  THEMES,
  WALLPAPER_PRESETS,
  getWallpaperStyle,
} from '../../context/CustomizationContext';
import api from '../../lib/api';
import AppSidebar from '../../components/AppSidebar';
import LoadingState from '../../components/LoadingState';
import {
  playMessageSound,
  NOTIFICATION_TUNES,
  getSelectedToneId,
  setSelectedToneId,
} from '../../lib/sound';

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
  } = useCustomization();

  const wallpaperInputRef = useRef(null);
  const [wallpaperFeedback, setWallpaperFeedback] = useState('');

  // Privacy states
  const [readReceipts, setReadReceipts] = useState(true);
  const [presenceVisibility, setPresenceVisibility] = useState(true);

  // Notification states
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [selectedTone, setSelectedTone] = useState('crystal');
  const [pushNotifications, setPushNotifications] = useState(false);
  const [messagePreview, setMessagePreview] = useState(true);
  const [vibrationAlerts, setVibrationAlerts] = useState(true);
  const [browserPermission, setBrowserPermission] = useState('default');
  const [notificationFeedback, setNotificationFeedback] = useState('');

  // Diagnostics states
  const [healthData, setHealthData] = useState(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);

  // Load saved preferences on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedSound = localStorage.getItem('veyra_sound_alerts');
      if (savedSound !== null) setSoundAlerts(savedSound === 'true');

      setSelectedTone(getSelectedToneId());

      const savedPreview = localStorage.getItem('veyra_message_preview');
      if (savedPreview !== null) setMessagePreview(savedPreview === 'true');

      const savedVibrate = localStorage.getItem('veyra_vibration_alerts');
      if (savedVibrate !== null) setVibrationAlerts(savedVibrate === 'true');

      const savedReceipts = localStorage.getItem('veyra_read_receipts');
      if (savedReceipts !== null) setReadReceipts(savedReceipts === 'true');

      const savedPresence = localStorage.getItem('veyra_presence_visibility');
      if (savedPresence !== null) setPresenceVisibility(savedPresence === 'true');

      if ('Notification' in window) {
        setBrowserPermission(Notification.permission);
        if (Notification.permission === 'granted') {
          setPushNotifications(true);
        }
      }
    } catch (e) {
      console.warn('Could not read settings from storage:', e);
    }
  }, []);

  // Route protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load diagnostics
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

  // Notification handlers
  const handleToggleSound = () => {
    const next = !soundAlerts;
    setSoundAlerts(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('veyra_sound_alerts', next.toString());
    }
  };

  const handleTestSound = () => {
    playMessageSound(selectedTone, true);
    const currentTune = NOTIFICATION_TUNES.find((t) => t.id === selectedTone);
    setNotificationFeedback(`Played "${currentTune?.name || 'Veyra Crystal'}" chime! 🔔`);
    setTimeout(() => setNotificationFeedback(''), 2500);
  };

  const handleSelectTone = (toneId) => {
    setSelectedTone(toneId);
    setSelectedToneId(toneId);
    playMessageSound(toneId, true);
    const tuneObj = NOTIFICATION_TUNES.find((t) => t.id === toneId);
    setNotificationFeedback(`Notification tune set to "${tuneObj?.name || toneId}"! 🎵`);
    setTimeout(() => setNotificationFeedback(''), 2500);
  };

  const handleToggleMessagePreview = () => {
    const next = !messagePreview;
    setMessagePreview(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('veyra_message_preview', next.toString());
    }
  };

  const handleToggleVibration = () => {
    const next = !vibrationAlerts;
    setVibrationAlerts(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('veyra_vibration_alerts', next.toString());
      if (next && navigator.vibrate) {
        navigator.vibrate([120, 60, 120]);
      }
    }
  };

  const handleTestVibration = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([150, 80, 150]);
      setNotificationFeedback('Haptic vibration triggered! 📳');
    } else {
      setNotificationFeedback('Vibration API not supported on this browser/device');
    }
    setTimeout(() => setNotificationFeedback(''), 3000);
  };

  const handleRequestPushPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationFeedback('Browser notifications not supported on this browser');
      setTimeout(() => setNotificationFeedback(''), 3000);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      if (permission === 'granted') {
        setPushNotifications(true);
        new Notification('Veyra Chat', {
          body: 'Notifications enabled! You will receive instant message alerts.',
          icon: '/images/iconlogo.jpeg',
        });
        setNotificationFeedback('Notifications enabled successfully! 🎉');
      } else {
        setPushNotifications(false);
        setNotificationFeedback('Notification permission was ' + permission);
      }
    } catch (err) {
      console.error('Failed to request notification permission:', err);
      setNotificationFeedback('Failed to request permission');
    }
    setTimeout(() => setNotificationFeedback(''), 3500);
  };

  const handleToggleReadReceipts = () => {
    const next = !readReceipts;
    setReadReceipts(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('veyra_read_receipts', next.toString());
    }
  };

  const handleTogglePresence = () => {
    const next = !presenceVisibility;
    setPresenceVisibility(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('veyra_presence_visibility', next.toString());
    }
  };

  if (authLoading) {
    return <LoadingState message="Loading settings..." />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-white">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto pb-24 md:pb-8">
        {/* Header navigation */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/chats')}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Return to chats"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Settings
              </h1>
              <p className="text-xs text-slate-400">
                Configure notifications, privacy, wallpaper, and theme
              </p>
            </div>
          </div>

          <button
            onClick={loadDiagnostics}
            disabled={diagnosticsLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111827] border border-slate-800 hover:border-violet-500/40 text-slate-300 text-xs font-medium transition-all cursor-pointer"
            title="Refresh system diagnostics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${diagnosticsLoading ? 'animate-spin' : ''}`} />
            <span>Diagnostics</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* ================= 1. NOTIFICATIONS SETTINGS ================= */}
          <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Notification Preferences</h2>
                  <p className="text-xs text-slate-400">
                    Control sound chimes, alerts, and browser push notifications
                  </p>
                </div>
              </div>
            </div>

            {notificationFeedback && (
              <div className="mb-4 p-3 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
                <span>{notificationFeedback}</span>
              </div>
            )}

            <div className="divide-y divide-slate-800/80">
              {/* Audible Sound Alerts */}
              <div className="py-3.5 flex items-center justify-between">
                <div className="flex items-start gap-3 min-w-0 pr-4">
                  <Volume2 className="w-4 h-4 text-violet-400 mt-1 shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-slate-200 block">
                      Audible Message Chime
                    </span>
                    <span className="text-xs text-slate-400 block">
                      Play instant harmonic tone when a new message arrives.
                    </span>
                    <button
                      type="button"
                      onClick={handleTestSound}
                      className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-600/15 hover:bg-violet-600/30 text-violet-300 text-[11px] font-semibold border border-violet-500/30 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Test Sound</span>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer ${
                    soundAlerts ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      soundAlerts ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Notification Tune Selector */}
              {soundAlerts && (
                <div className="py-4 bg-[#090d16]/70 p-4 rounded-2xl border border-slate-800/80 my-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-violet-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Notification Tune
                      </span>
                    </div>
                    <span className="text-[11px] text-violet-400 font-mono font-semibold">
                      {NOTIFICATION_TUNES.find((t) => t.id === selectedTone)?.name || 'Veyra Crystal'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Click any tune to listen to a preview and set it as your incoming message sound.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {NOTIFICATION_TUNES.map((tune) => {
                      const isSelected = selectedTone === tune.id;
                      return (
                        <button
                          key={tune.id}
                          type="button"
                          onClick={() => handleSelectTone(tune.id)}
                          className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer group flex flex-col justify-between ${
                            isSelected
                              ? 'border-violet-500 bg-violet-600/20 shadow-md shadow-violet-950/40 ring-1 ring-violet-500'
                              : 'border-slate-800 bg-[#0c1220] hover:border-slate-700 hover:bg-[#131c31]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                isSelected
                                  ? 'bg-violet-600 text-white'
                                  : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                              }`}
                            >
                              {tune.tag}
                            </span>

                            <div className="flex items-center gap-1">
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playMessageSound(tune.id, true);
                                }}
                                className="p-1 rounded-md hover:bg-violet-600/30 text-violet-400 transition-colors"
                                title="Play preview"
                              >
                                <Play className="w-3 h-3 fill-current" />
                              </div>
                              {isSelected && (
                                <span className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <span className="text-xs font-semibold text-white block truncate">
                              {tune.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block line-clamp-1 mt-0.5">
                              {tune.description}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Browser / Push Notifications */}
              <div className="py-3.5 flex items-center justify-between">
                <div className="flex items-start gap-3 min-w-0 pr-4">
                  <BellRing className="w-4 h-4 text-violet-400 mt-1 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-200 block">
                        Browser Push Notifications
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          browserPermission === 'granted'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : browserPermission === 'denied'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {browserPermission}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Receive alerts even when Veyra Chat is minimized or in the background.
                    </span>
                    {browserPermission !== 'granted' && (
                      <button
                        type="button"
                        onClick={handleRequestPushPermission}
                        className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold transition-all shadow-sm cursor-pointer"
                      >
                        <Bell className="w-3 h-3" />
                        <span>Enable Notifications</span>
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (browserPermission !== 'granted') {
                      handleRequestPushPermission();
                    } else {
                      setPushNotifications(!pushNotifications);
                    }
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer ${
                    pushNotifications && browserPermission === 'granted'
                      ? 'bg-violet-600'
                      : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      pushNotifications && browserPermission === 'granted'
                        ? 'translate-x-6'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Message Preview in Alerts */}
              <div className="py-3.5 flex items-center justify-between">
                <div className="flex items-start gap-3 min-w-0 pr-4">
                  <Eye className="w-4 h-4 text-violet-400 mt-1 shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-slate-200 block">
                      Message Content Preview
                    </span>
                    <span className="text-xs text-slate-400">
                      Show sender name and message text snippet inside incoming notifications.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleMessagePreview}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer ${
                    messagePreview ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      messagePreview ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Mobile Vibration Alert */}
              <div className="py-3.5 flex items-center justify-between">
                <div className="flex items-start gap-3 min-w-0 pr-4">
                  <Vibrate className="w-4 h-4 text-violet-400 mt-1 shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-slate-200 block">
                      Vibration Alerts
                    </span>
                    <span className="text-xs text-slate-400 block">
                      Vibrate smartphone haptics when new messages are delivered.
                    </span>
                    <button
                      type="button"
                      onClick={handleTestVibration}
                      className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-600/15 hover:bg-violet-600/30 text-violet-300 text-[11px] font-semibold border border-violet-500/30 transition-colors cursor-pointer"
                    >
                      <Vibrate className="w-3 h-3" />
                      <span>Test Vibrate</span>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleVibration}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer ${
                    vibrationAlerts ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      vibrationAlerts ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ================= 2. PRIVACY & READ RECEIPTS ================= */}
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
                  onClick={handleToggleReadReceipts}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer ${
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
                    Broadcast active online status when using Veyra Chat.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePresence}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer ${
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

          {/* ================= 3. APPLICATION THEME ================= */}
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

          {/* ================= 4. CHAT WALLPAPER ================= */}
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
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 h-40 bg-[#090d16] flex flex-col justify-end p-3 shadow-inner">
                {wallpaper ? (
                  <>
                    <div
                      className="absolute inset-0 transition-all duration-300 pointer-events-none"
                      style={getWallpaperStyle(wallpaper, wallpaperDim).style}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none transition-all duration-300"
                      style={getWallpaperStyle(wallpaper, wallpaperDim).dimStyle}
                    />
                  </>
                ) : null}
                <div className="relative z-10 space-y-1.5 pointer-events-none">
                  <div className="p-2 rounded-xl bg-slate-800/85 backdrop-blur-sm text-[10px] text-slate-200 w-fit max-w-[80%] border border-slate-700/50 shadow-md">
                    Hey! How does the new wallpaper look?
                  </div>
                  <div className="p-2 rounded-xl bg-violet-600 text-[10px] text-white w-fit max-w-[80%] ml-auto shadow-md shadow-violet-900/30">
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
                  min="10"
                  max="80"
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
                      onClick={() => {
                        setWallpaper(p.value);
                        setWallpaperFeedback(`Applied "${p.name}" wallpaper!`);
                        setTimeout(() => setWallpaperFeedback(''), 3000);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'border-violet-500 bg-violet-600/20 text-white font-bold ring-2 ring-violet-500 shadow-lg shadow-violet-950/40'
                          : 'border-slate-800 bg-[#090d16] text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-full h-9 rounded-lg mb-1.5 border border-slate-700/60 overflow-hidden relative ${p.preview}`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 bg-violet-600/20 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] block truncate">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ================= 5. BACKEND HEALTH DIAGNOSTICS ================= */}
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
                  <span className="text-slate-500 block mb-1">Service</span>
                  <span className="font-mono text-slate-200 truncate block">
                    {healthData.service || 'Veyra API'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
                  <span className="text-slate-500 block mb-1">Database</span>
                  <span className="font-mono text-emerald-400 uppercase">
                    {healthData.database || 'Connected'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
                  <span className="text-slate-500 block mb-1">Server Time</span>
                  <span className="font-mono text-slate-200 truncate block">
                    {healthData.timestamp
                      ? new Date(healthData.timestamp).toLocaleTimeString()
                      : 'Live'}
                  </span>
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
