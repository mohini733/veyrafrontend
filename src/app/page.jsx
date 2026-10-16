'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Zap,
  Shield,
  Smartphone,
  Radio,
  Users,
  CheckCheck,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Zap,
      title: 'Real-Time Socket.IO Engine',
      description:
        'Instant message delivery with sub-second synchronization, persistent MongoDB storage, and live typing indicators.',
    },
    {
      icon: Shield,
      title: 'Authenticated Verification',
      description:
        'E.164 international phone number support with real carrier OTP verification before conferring verified status.',
    },
    {
      icon: Radio,
      title: 'Carrier SMS Dispatch',
      description:
        'Direct integration with SMS gateway providers (MSG91) allowing seamless SMS outreach to non-Veyra users.',
    },
    {
      icon: Lock,
      title: 'Strict Participant Authorization',
      description:
        'Server-side validation ensures only verified conversation members can view, emit, or receive messages.',
    },
    {
      icon: Smartphone,
      title: 'Capacitor Mobile Ready',
      description:
        'Engineered for native iOS and Android deployment via Capacitor packaging with a shared responsive core.',
    },
    {
      icon: Users,
      title: 'Global Phone Directory',
      description:
        'Fast index-driven search to discover registered contacts instantly and initiate one-to-one chats without duplicates.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col selection:bg-violet-600 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        {/* Ambient violet background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-6 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Next-Gen Real-Time Messaging Platform</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12]"
          >
            Instant Conversations.{' '}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Zero Compromise.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Veyra Chat delivers ultra-fast one-to-one messaging powered by Socket.IO,
            backed by MongoDB persistence, and extended with carrier-grade SMS dispatch.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href={isAuthenticated ? '/chats' : '/signup'}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-600 text-white font-semibold text-base shadow-xl shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/sms"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#111827] border border-slate-700 hover:border-violet-500/50 text-slate-200 font-semibold text-base hover:bg-[#162038] transition-all flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4 text-violet-400" />
              <span>SMS Dispatch Gateway</span>
            </Link>
          </motion.div>
        </div>

        {/* Interactive App Preview Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 max-w-4xl mx-auto w-full"
        >
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-violet-500/30 via-slate-800/40 to-slate-900/10 shadow-2xl shadow-violet-950/60">
            <div className="rounded-[22px] bg-[#0c1220] border border-slate-800/80 overflow-hidden">
              {/* Fake Window Header */}
              <div className="px-4 py-3 bg-[#090d16] border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-violet-400" />
                  <span>veyra-chat.secure-socket</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                  ONLINE
                </span>
              </div>

              {/* Chat Simulation Area */}
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet-900/60 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300">
                    AD
                  </div>
                  <div className="bg-[#151e33] border border-slate-700/60 rounded-2xl rounded-tl-xs p-3.5 text-sm text-slate-200 max-w-md shadow-sm">
                    <p className="font-semibold text-xs text-violet-300 mb-1">Aarav Sharma</p>
                    <p>Hey! Did you see the new Veyra Chat deployment? The real-time Socket.IO latencies are under 15ms!</p>
                    <span className="block text-[10px] text-slate-400 mt-1 text-right">10:42 PM</span>
                  </div>
                </div>

                <div className="flex items-end justify-end gap-3">
                  <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl rounded-tr-xs p-3.5 text-sm text-white max-w-md shadow-md shadow-violet-900/20 border border-violet-400/20">
                    <p>Yes, and fallback carrier SMS allows outreach to non-app users seamlessly via MSG91.</p>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-violet-200 mt-1">
                      <span>10:43 PM</span>
                      <CheckCheck className="w-3.5 h-3.5 text-violet-200" />
                    </div>
                  </div>
                </div>

                {/* Simulated typing indicator */}
                <div className="flex items-center gap-2 text-xs text-slate-400 italic bg-[#131c31]/50 px-3.5 py-1.5 rounded-full w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.4s]" />
                  <span>Aarav is typing...</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-t border-slate-800/80 bg-[#070b13]/60 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Engineered for Real-World Demands
          </h2>
          <p className="mt-4 text-base text-slate-400">
            A production-ready architecture designed with rigorous authorization, persistent
            state, and full mobile compatibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#0c1220] border border-slate-800 hover:border-violet-500/40 hover:bg-[#101728] transition-all group shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#06090f] py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-violet-400" />
            <span className="font-bold text-slate-300">Veyra Chat</span>
            <span>&copy; 2026 All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/chats" className="hover:text-violet-400 transition-colors">
              App
            </Link>
            <Link href="/sms" className="hover:text-violet-400 transition-colors">
              SMS Gateway
            </Link>
            <Link href="/settings" className="hover:text-violet-400 transition-colors">
              Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
