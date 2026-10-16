'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Radio,
  Phone,
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  MessageCircle,
  ArrowLeft,
  Key,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import AppSidebar from '../../components/AppSidebar';
import LoadingState from '../../components/LoadingState';

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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    // Check provider status
    api
      .get('/sms/status')
      .then(({ data }) => setProviderStatus(data))
      .catch(() => {});
  }, []);

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return <LoadingState message="Loading SMS gateway..." />;
  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!toPhone.trim() || !messageText.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const { data } = await api.post('/sms/send', {
        toPhone: toPhone.trim(),
        messageText: messageText.trim(),
      });

      setResult(data);
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
                  {providerStatus?.configured ? `${providerStatus.provider} GATEWAY` : 'GATEWAY STATUS'}
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Reach non-app users directly through telecom cellular networks
              </p>
            </div>
          </div>
        </div>

        {/* Informational Guidance Alert */}
        <div className="mb-6 p-4 rounded-2xl bg-[#0c1220] border border-slate-800 flex items-start gap-3.5 text-xs text-slate-300">
          <Info className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-100">
              Veyra Realtime Chat vs. External Carrier SMS:
            </p>
            <p className="text-slate-400 leading-relaxed">
              Veyra-to-Veyra messaging is completely free and handled instantly over Socket.IO and
              MongoDB. This page is dedicated for dispatching real cellular SMS messages to phone numbers that do not have the app installed.
            </p>
          </div>
        </div>

        {/* Configuration Notice if provider is unconfigured */}
        {providerStatus && !providerStatus.configured && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3.5 text-xs text-amber-300">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-200">
                  SMS Provider Credentials Not Configured:
                </p>
                <p className="text-amber-300/90 leading-relaxed">
                  To dispatch real cellular SMS, add your Fast2SMS API Key (recommended for India) or MSG91 credentials.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/settings')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-200 hover:text-black font-semibold text-xs transition-all shrink-0 self-center"
            >
              Configure in Settings &rarr;
            </button>
          </div>
        )}

        {/* Send Result Notification */}
        {result && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>SMS Accepted by Carrier Gateway</span>
            </div>
            <p className="text-slate-300">{result.details?.note}</p>
            <p className="font-mono text-[11px] text-emerald-400/80">
              Request ID: {result.details?.requestId}
            </p>
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
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-xl">
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
                  placeholder="+919876543210"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090d16] border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:border-violet-500 outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Must include country prefix (+91 for India, +1 for US/Canada, etc.).
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
                rows={4}
                maxLength={320}
                className="w-full p-4 rounded-xl bg-[#090d16] border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-violet-500 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !toPhone.trim() || !messageText.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Dispatch SMS via MSG91</span>
                </>
              )}
            </button>
          </form>
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
