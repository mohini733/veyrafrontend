'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Phone,
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  MessageCircle,
  ArrowLeft,
  Clock,
  Sparkles,
  RefreshCw,
  CheckCheck,
  Radio,
  Copy,
  Check,
  Zap,
  Signal,
  ShieldCheck,
  RotateCcw,
  Search,
  ExternalLink,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import AppSidebar from '../../components/AppSidebar';
import LoadingState from '../../components/LoadingState';

const TEMPLATES = [
  {
    icon: '🚀',
    title: 'Veyra Invite',
    text: 'Hey! Join me on Veyra Chat for ultra-fast direct communication: https://veyrafrontend-ah9g-sand.vercel.app',
  },
  {
    icon: '💬',
    title: 'Chat Ping',
    text: 'Connect with me on Veyra Chat! Add my phone number to start chatting.',
  },
  {
    icon: '⚡',
    title: 'Join Now',
    text: 'join now',
  },
  {
    icon: '👋',
    title: 'Urgent Ping',
    text: 'Hey, please check your Veyra Chat messages when you have a moment!',
  },
];

function SMSComposeForm() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [toPhone, setToPhone] = useState(searchParams.get('to') || '');
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [providerStatus, setProviderStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'delivered' | 'queued'

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadStatus = async () => {
    try {
      const { data } = await api.get('/sms/status');
      setProviderStatus(data);
    } catch (e) {
      console.warn('Could not fetch SMS gateway status:', e);
    }
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const { data } = await api.get('/sms/history');
      if (data.success) {
        setHistory(data.logs || []);
      }
    } catch (e) {
      console.warn('Could not fetch SMS history:', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadStatus();
      loadHistory();
    }
  }, [isAuthenticated]);

  // Clean phone input and detect Indian 10-digit number
  const cleanPhone = toPhone.trim().replace(/[\s\-]/g, '');
  const isTenDigitIndian = /^[6-9]\d{9}$/.test(cleanPhone);
  const isValidE164 = /^\+[1-9]\d{9,14}$/.test(cleanPhone);
  const isPhoneValid = isTenDigitIndian || isValidE164;

  const handlePhoneBlur = () => {
    if (isTenDigitIndian) {
      setToPhone(`+91${cleanPhone}`);
    }
  };

  // Extract unique past recipients for quick contact chips
  const quickRecipients = useMemo(() => {
    const map = new Map();
    history.forEach((h) => {
      if (!map.has(h.toPhone)) {
        map.set(h.toPhone, {
          phone: h.toPhone,
          name: h.isRegisteredOnVeyra ? 'Registered Contact' : null,
        });
      }
    });
    return Array.from(map.values()).slice(0, 5);
  }, [history]);

  // Filtered history list
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch =
        searchFilter === '' ||
        item.toPhone.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.messageText.toLowerCase().includes(searchFilter.toLowerCase());

      if (!matchesSearch) return false;
      if (activeTab === 'delivered') return item.status === 'delivered';
      if (activeTab === 'queued') return item.status === 'queued' || item.status === 'dispatched';
      return true;
    });
  }, [history, searchFilter, activeTab]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!toPhone.trim() || !messageText.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const normalizedInput = isTenDigitIndian ? `+91${cleanPhone}` : toPhone.trim();
      const { data } = await api.post('/sms/send', {
        toPhone: normalizedInput,
        messageText: messageText.trim(),
      });

      setResult(data);
      setToPhone('');
      setMessageText('');
      loadHistory();
    } catch (err) {
      setError({
        message: err.response?.data?.message || 'Failed to dispatch SMS',
        advice: err.response?.data?.advice,
        configured: err.response?.data?.configured,
        isRegisteredOnVeyra: err.response?.data?.isRegisteredOnVeyra,
        registeredUser: err.response?.data?.registeredUser,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyRequestId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSend();
    }
  };

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return <LoadingState message="Connecting to SMS Telecom Gateway..." />;
  }

  const activeProviderName = providerStatus?.provider || 'Fast2SMS';
  const charCount = messageText.length;
  const segments = Math.ceil(charCount / 160) || 1;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070a12] text-white selection:bg-violet-600 selection:text-white">
      {/* Ambient background glowing accents */}
      <div className="pointer-events-none fixed top-0 left-1/4 -z-10 h-[450px] w-[550px] rounded-full bg-violet-600/10 blur-[140px]" />
      <div className="pointer-events-none fixed top-1/3 right-10 -z-10 h-[400px] w-[500px] rounded-full bg-indigo-600/10 blur-[130px]" />
      <div className="pointer-events-none fixed bottom-10 left-10 -z-10 h-[350px] w-[450px] rounded-full bg-cyan-600/5 blur-[120px]" />

      <AppSidebar />

      <main className="flex-1 overflow-y-auto pb-24 md:pb-10 p-3.5 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/chats')}
              className="p-2 sm:p-2.5 text-slate-400 hover:text-white rounded-2xl bg-[#0f1629]/80 border border-slate-800/80 hover:bg-slate-800 transition-all hover:scale-105 cursor-pointer shrink-0"
              title="Return to chats"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  External SMS Dispatch
                </h1>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 font-mono text-[11px] font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                  </span>
                  <span>{activeProviderName.toUpperCase()} GATEWAY</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Send direct cellular SMS messages via Indian & International telecom routes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                loadStatus();
                loadHistory();
              }}
              disabled={historyLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1322] border border-slate-800 hover:border-violet-500/40 text-slate-300 text-xs font-medium transition-all hover:bg-[#131c31] cursor-pointer"
              title="Refresh telecom status & logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-violet-400 ${historyLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Telemetry Stat Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mb-6">
          <div className="p-3.5 rounded-2xl bg-[#0d1322]/80 border border-slate-800/80 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Gateway</span>
              <Signal className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-white truncate">{activeProviderName}</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              99.9% Route Active
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0d1322]/80 border border-slate-800/80 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Latency</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-sm font-bold text-white">&lt; 3.2s Average</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              Telecom Carrier Transit
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0d1322]/80 border border-slate-800/80 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Dispatched</span>
              <Flame className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="text-sm font-bold text-white">{history.length} Messages</div>
            <div className="text-[10px] text-violet-400 font-medium mt-0.5">
              Sent via Veyra Outbox
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0d1322]/80 border border-slate-800/80 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Encryption</span>
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-sm font-bold text-white">E.164 GSM</div>
            <div className="text-[10px] text-cyan-400 font-medium mt-0.5">
              Telco Tower Transit
            </div>
          </div>
        </div>

        {/* Send Result Notification */}
        {result && (
          <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-emerald-950/30 border border-emerald-500/40 backdrop-blur-md text-emerald-300 text-xs space-y-2.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 font-bold text-sm text-emerald-200">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>SMS Dispatched & Accepted by Carrier Gateway</span>
              </div>

              {result.details?.requestId && (
                <button
                  type="button"
                  onClick={() => copyRequestId(result.details.requestId)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-[11px] font-mono transition-colors cursor-pointer"
                  title="Copy Request ID"
                >
                  {copiedId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId ? 'Copied' : result.details.requestId}</span>
                </button>
              )}
            </div>

            <p className="text-slate-300 leading-relaxed pl-9">
              {result.details?.note || 'SMS successfully dispatched to cellular carrier queue.'}
            </p>

            {/* If recipient is registered */}
            {result.isRegisteredOnVeyra && (
              <div className="mt-3 pt-3 border-t border-emerald-500/20 pl-9 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-slate-200 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {result.registeredUser?.name} is registered on Veyra Chat!
                </span>
                <button
                  type="button"
                  onClick={() => router.push('/chats')}
                  className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Chat for Free on App
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error / Warning Notification */}
        {error && (
          <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-rose-950/30 border border-rose-500/40 backdrop-blur-md text-rose-300 text-xs space-y-2.5 shadow-xl animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 font-bold text-sm text-rose-200">
              <div className="w-7 h-7 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <span>{error.message}</span>
            </div>
            {error.advice && <p className="text-slate-300 pl-9">{error.advice}</p>}

            {/* If the recipient is registered on Veyra Chat */}
            {error.isRegisteredOnVeyra && (
              <div className="mt-3 pt-3 border-t border-rose-500/20 pl-9 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-slate-200 font-medium">
                  {error.registeredUser?.name} is registered on Veyra!
                </span>
                <button
                  type="button"
                  onClick={() => router.push(`/chats`)}
                  className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Chat for Free
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Compose Form Card */}
        <div className="relative rounded-3xl bg-[#0d1322]/85 border border-slate-800/90 backdrop-blur-xl shadow-2xl p-5 sm:p-7 mb-8 overflow-hidden">
          {/* Top subtle radiant bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500" />

          <form onSubmit={handleSend} className="space-y-6">
            {/* Recipient Phone Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span>Recipient Phone Number</span>
                  <span className="text-violet-400">*</span>
                </label>
                {isPhoneValid && (
                  <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 animate-in fade-in">
                    <CheckCheck className="w-3.5 h-3.5" />
                    Valid Mobile Format
                  </span>
                )}
              </div>

              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-2 text-slate-400 pointer-events-none">
                  <span className="text-sm">🇮🇳</span>
                  <Phone className="w-4 h-4 text-violet-400" />
                </div>
                <input
                  type="tel"
                  value={toPhone}
                  onChange={(e) => setToPhone(e.target.value)}
                  onBlur={handlePhoneBlur}
                  placeholder="8198682929 or +919876543210"
                  required
                  className="w-full pl-16 pr-10 py-3.5 rounded-2xl bg-[#080d19] border border-slate-700/80 text-white placeholder-slate-500 font-mono text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                />
                {toPhone && (
                  <button
                    type="button"
                    onClick={() => setToPhone('')}
                    className="absolute right-3 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Clear phone"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
                <span>Enter 10-digit Indian mobile (e.g. 8198682929) or international with + code</span>
                {cleanPhone && !isPhoneValid && (
                  <span className="text-amber-400 font-medium">10 digits required</span>
                )}
              </p>

              {/* Quick Contacts Chips from History */}
              {quickRecipients.length > 0 && (
                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500 font-medium mr-1">Recent:</span>
                  {quickRecipients.map((rec) => (
                    <button
                      key={rec.phone}
                      type="button"
                      onClick={() => setToPhone(rec.phone)}
                      className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all cursor-pointer font-mono flex items-center gap-1 ${
                        toPhone === rec.phone
                          ? 'border-violet-500 bg-violet-600/20 text-white font-bold'
                          : 'border-slate-800 bg-[#090e1b] hover:border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Phone className="w-2.5 h-2.5 text-violet-400" />
                      <span>{rec.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Message Body Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span>SMS Message Body</span>
                  <span className="text-violet-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">
                    {charCount} / 160 chars ({segments} segment{segments > 1 ? 's' : ''})
                  </span>
                  {messageText && (
                    <button
                      type="button"
                      onClick={() => setMessageText('')}
                      className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type the cellular SMS text to dispatch to the mobile recipient..."
                  required
                  rows={4}
                  maxLength={320}
                  className="w-full p-4 rounded-2xl bg-[#080d19] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none resize-none transition-all leading-relaxed"
                />

                {/* Progress bar under textarea */}
                <div className="absolute bottom-2 left-3 right-3 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      charCount > 160 ? 'bg-amber-400' : 'bg-gradient-to-r from-violet-500 to-indigo-500'
                    }`}
                    style={{ width: `${Math.min((charCount / 160) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Quick Template Chips */}
              <div className="mt-3">
                <div className="flex items-center gap-1.5 mb-2 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>Quick Templates:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMessageText(tmpl.text)}
                      className="p-2.5 rounded-xl bg-[#080d19] border border-slate-800/80 hover:border-violet-500/50 hover:bg-[#10182c] text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-violet-300 transition-colors flex items-center gap-1.5">
                          <span>{tmpl.icon}</span>
                          <span>{tmpl.title}</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{tmpl.text}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Dispatch Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !toPhone.trim() || !messageText.trim()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform active:scale-[0.99] cursor-pointer group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting to Cellular Gateway...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                    <span>Dispatch SMS via {activeProviderName}</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
                <span>Delivers directly over telecom cellular tower</span>
                <span className="hidden sm:inline font-mono">Press Ctrl + Enter to dispatch</span>
              </div>
            </div>
          </form>
        </div>

        {/* Sent SMS History / Outbox Section */}
        <div className="rounded-3xl bg-[#0d1322]/85 border border-slate-800/90 backdrop-blur-xl shadow-xl p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Dispatched SMS Outbox
                </h2>
                <p className="text-xs text-slate-400">
                  Realtime history of cellular messages dispatched from your account
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#080d19] p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({history.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('delivered')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'delivered'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Delivered
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('queued')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'queued'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Relay / Queued
              </button>
            </div>
          </div>

          {/* Search Box in Outbox */}
          {history.length > 3 && (
            <div className="relative mb-4">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search outbox by phone or message text..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#080d19] border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
              />
            </div>
          )}

          {/* Outbox List */}
          {filteredHistory.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <Radio className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">
                {searchFilter ? 'No matching SMS logs found' : 'No dispatched SMS messages yet'}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchFilter
                  ? 'Try clearing the search term to view all outbox messages.'
                  : 'Compose and dispatch your first external cellular SMS using the form above.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item) => (
                <div
                  key={item._id}
                  className="p-4 rounded-2xl bg-[#080d19] border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 group"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-white text-sm">
                        {item.toPhone}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/20 font-medium">
                        {item.provider || 'Fast2SMS'}
                      </span>
                      {item.isRegisteredOnVeyra && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          On Veyra
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 break-words leading-relaxed font-sans">
                      {item.messageText}
                    </p>
                    {item.carrierNotice && (
                      <p className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
                        <Info className="w-3 h-3 shrink-0" />
                        <span>{item.carrierNotice}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <CheckCheck className="w-4 h-4" />
                      <span>{item.status === 'delivered' ? 'Delivered' : 'Dispatched'}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setToPhone(item.toPhone);
                        setMessageText(item.messageText);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold transition-colors cursor-pointer sm:mt-1"
                    >
                      Resend &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SMSComposePage() {
  return (
    <Suspense fallback={<LoadingState message="Loading SMS gateway..." />}>
      <SMSComposeForm />
    </Suspense>
  );
}
