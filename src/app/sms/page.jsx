'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
  Key,
  Clock,
  Sparkles,
  RefreshCw,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import AppSidebar from '../../components/AppSidebar';
import LoadingState from '../../components/LoadingState';

const TEMPLATES = [
  'Hey! Join me on Veyra Chat for ultra-fast direct communication: https://veyrafrontend-ah9g-sand.vercel.app',
  'Connect with me on Veyra Chat! Add my phone number to start chatting.',
  'join now',
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

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return <LoadingState message="Loading SMS gateway..." />;
  }

  const handlePhoneBlur = () => {
    const raw = toPhone.trim().replace(/[\s\-]/g, '');
    if (/^[6-9]\d{9}$/.test(raw)) {
      setToPhone(`+91${raw}`);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!toPhone.trim() || !messageText.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const normalizedInput = toPhone.trim();
      const { data } = await api.post('/sms/send', {
        toPhone: normalizedInput,
        messageText: messageText.trim(),
      });

      setResult(data);
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

  const activeProviderName = providerStatus?.provider || 'Fast2SMS';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-white">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-3xl mx-auto">
        {/* Navigation header */}
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
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                External SMS Dispatch
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/20">
                  {activeProviderName.toUpperCase()} GATEWAY
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Reach non-app contacts directly through cellular telecom networks
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              loadStatus();
              loadHistory();
            }}
            disabled={historyLoading}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="Refresh status & history"
          >
            <RefreshCw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Informational Guidance Alert */}
        <div className="mb-6 p-4 rounded-2xl bg-[#0c1220] border border-slate-800 flex items-start gap-3.5 text-xs text-slate-300">
          <Info className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-100">
              Veyra Realtime Messaging vs. External Carrier SMS:
            </p>
            <p className="text-slate-400 leading-relaxed">
              Veyra-to-Veyra messaging is completely free and instant over WebSockets. This dispatch console connects to telecom carrier gateways ({activeProviderName}) to deliver SMS messages to recipients who are not active in the app.
            </p>
          </div>
        </div>

        {/* Send Result Notification */}
        {result && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>SMS Accepted by Carrier Gateway</span>
            </div>
            <p className="text-slate-300">{result.details?.note}</p>
            <p className="font-mono text-[11px] text-emerald-400/80">
              Request ID: {result.details?.requestId || 'SMS_ACCEPTED'}
            </p>

            {/* If recipient is registered */}
            {result.isRegisteredOnVeyra && (
              <div className="mt-3 pt-3 border-t border-emerald-500/20 flex items-center justify-between">
                <span className="text-slate-200 font-medium">
                  {result.registeredUser?.name} is registered on Veyra!
                </span>
                <button
                  type="button"
                  onClick={() => router.push('/chats')}
                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Chat for Free
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error / Warning Notification */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{error.message}</span>
            </div>
            {error.advice && <p className="text-slate-300">{error.advice}</p>}

            {/* If the recipient is registered on Veyra Chat */}
            {error.isRegisteredOnVeyra && (
              <div className="mt-3 pt-3 border-t border-rose-500/20 flex items-center justify-between">
                <span className="text-slate-200 font-medium">
                  {error.registeredUser?.name} is registered on Veyra!
                </span>
                <button
                  type="button"
                  onClick={() => router.push(`/chats`)}
                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Chat for Free
                </button>
              </div>
            )}
          </div>
        )}

        {/* Compose Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-xl mb-8">
          <form onSubmit={handleSend} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Recipient Phone Number (E.164 International Format) *
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={toPhone}
                  onChange={(e) => setToPhone(e.target.value)}
                  onBlur={handlePhoneBlur}
                  placeholder="8198682929 or +918198682929"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090d16] border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:border-violet-500 outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter 10-digit Indian mobile number (e.g. 8198682929) or full international format (+91...)
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  SMS Message Body *
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {messageText.length} / 160 characters
                </span>
              </div>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type the cellular SMS text to dispatch..."
                required
                rows={3}
                maxLength={320}
                className="w-full p-4 rounded-xl bg-[#090d16] border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-violet-500 outline-none resize-none"
              />

              {/* Quick Template Chips */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1">
                  <Sparkles className="w-3 h-3 text-violet-400" /> Quick:
                </span>
                {TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessageText(tmpl)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors truncate max-w-[200px]"
                    title={tmpl}
                  >
                    {tmpl}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !toPhone.trim() || !messageText.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Dispatch SMS via {activeProviderName}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sent SMS History / Outbox */}
        <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Dispatched SMS Outbox
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {history.length} {history.length === 1 ? 'Message' : 'Messages'}
            </span>
          </div>

          {history.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No recent external SMS messages dispatched yet. Send your first SMS above!
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="p-3.5 rounded-2xl bg-[#090d16] border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-200">
                        {item.toPhone}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/20">
                        {item.provider || 'Fast2SMS'}
                      </span>
                      {item.isRegisteredOnVeyra && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/20">
                          On Veyra
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 break-words">{item.messageText}</p>
                    {item.carrierNotice && (
                      <p className="text-[10px] text-amber-400/80 italic">
                        {item.carrierNotice}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <CheckCheck className="w-3.5 h-3.5" />
                      {item.status === 'delivered' ? 'Delivered' : 'Dispatched'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
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
