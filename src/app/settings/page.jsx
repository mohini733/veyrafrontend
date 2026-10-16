'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Bell,
  Shield,
  Radio,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import AppSidebar from '../../components/AppSidebar';
import LoadingState from '../../components/LoadingState';

export default function SettingsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // Settings states
  const [readReceipts, setReadReceipts] = useState(true);
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [presenceVisibility, setPresenceVisibility] = useState(true);

  // Status diagnostics
  const [healthData, setHealthData] = useState(null);
  const [smsStatus, setSmsStatus] = useState(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);

  // SMS Provider Key config form
  const [selectedProvider, setSelectedProvider] = useState('fast2sms');
  const [fast2smsKey, setFast2smsKey] = useState('');
  const [msg91Key, setMsg91Key] = useState('');
  const [msg91Flow, setMsg91Flow] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadDiagnostics = async () => {
    try {
      setDiagnosticsLoading(true);
      const [healthRes, smsRes] = await Promise.allSettled([
        api.get('/health'),
        api.get('/sms/status'),
      ]);

      if (healthRes.status === 'fulfilled') {
        setHealthData(healthRes.value.data);
      }
      if (smsRes.status === 'fulfilled') {
        setSmsStatus(smsRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load system diagnostics:', err);
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  const handleSaveSmsKey = async (e) => {
    e.preventDefault();
    try {
      setSavingKey(true);
      setKeyFeedback(null);

      const payload = {
        provider: selectedProvider,
        fast2smsApiKey: fast2smsKey,
        msg91AuthKey: msg91Key,
        msg91FlowId: msg91Flow,
      };

      const { data } = await api.post('/sms/config', payload);
      setKeyFeedback({
        type: 'success',
        text: data.message || 'SMS provider credentials updated successfully!',
      });
      loadDiagnostics();
    } catch (err) {
      setKeyFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save SMS provider credentials',
      });
    } finally {
      setSavingKey(false);
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

          {/* External SMS Gateway Provider Status */}
          <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Radio className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-bold text-white">Carrier SMS Gateway (MSG91)</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Used for delivering out-of-band text messages to phone numbers that do not have an active Veyra Chat account.
            </p>

            {smsStatus ? (
              <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Provider:</span>
                  <span className="font-semibold text-white">{smsStatus.provider}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Configuration:</span>
                  {smsStatus.configured ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Live Dispatch
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Missing Credentials
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Sender ID:</span>
                  <span className="font-mono text-slate-300">
                    {smsStatus.details?.senderId || 'Not configured'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                  {smsStatus.message}
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-500">Checking provider status...</div>
            )}

            {/* Live API Key Form */}
            <div className="mt-5 pt-5 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Configure Active SMS Gateway Key
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Select your preferred provider and save your API key to enable real cellular SMS & OTP delivery to physical mobile phones.
              </p>

              {keyFeedback && (
                <div
                  className={`p-3 rounded-xl mb-4 text-xs ${
                    keyFeedback.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {keyFeedback.text}
                </div>
              )}

              <form onSubmit={handleSaveSmsKey} className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProvider('fast2sms')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      selectedProvider === 'fast2sms'
                        ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                        : 'bg-[#090d16] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Fast2SMS (Recommended for India)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProvider('msg91')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      selectedProvider === 'msg91'
                        ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                        : 'bg-[#090d16] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    MSG91 (Enterprise DLT)
                  </button>
                </div>

                {selectedProvider === 'fast2sms' ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Fast2SMS Dev API Authorization Key:
                    </label>
                    <input
                      type="password"
                      value={fast2smsKey}
                      onChange={(e) => setFast2smsKey(e.target.value)}
                      placeholder="Paste your Fast2SMS API Key..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-slate-700 text-white font-mono text-xs focus:border-violet-500 outline-none"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Get a free key instantly from{' '}
                      <a
                        href="https://www.fast2sms.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-400 underline"
                      >
                        fast2sms.com &rarr; Dev API
                      </a>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        MSG91 Auth Key:
                      </label>
                      <input
                        type="password"
                        value={msg91Key}
                        onChange={(e) => setMsg91Key(e.target.value)}
                        placeholder="Enter MSG91 Auth Key..."
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-slate-700 text-white font-mono text-xs focus:border-violet-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        MSG91 Flow ID / Template ID:
                      </label>
                      <input
                        type="text"
                        value={msg91Flow}
                        onChange={(e) => setMsg91Flow(e.target.value)}
                        placeholder="Enter approved Flow ID..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-slate-700 text-white font-mono text-xs focus:border-violet-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingKey || (selectedProvider === 'fast2sms' ? !fast2smsKey.trim() : !msg91Key.trim())}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-900/30 disabled:opacity-50 transition-all"
                >
                  {savingKey ? 'Activating Gateway...' : 'Save & Activate Gateway'}
                </button>
              </form>
            </div>
          </div>

          {/* Backend & Socket Server Diagnostics */}
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
