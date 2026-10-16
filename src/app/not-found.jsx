'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-2xl shadow-violet-950/60">
          <MessageSquare className="w-12 h-12" />
        </div>
        <div className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold">
          404
        </div>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
        Conversation or Page Not Found
      </h1>
      <p className="text-sm text-slate-400 max-w-sm mb-8 leading-relaxed">
        The link you followed might be broken, or the conversation may have been archived or deleted.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/chats"
          className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Back to Messages</span>
        </Link>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-[#111827] border border-slate-700 hover:bg-[#162038] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <Home className="w-4 h-4 text-slate-400" />
          <span>Veyra Home</span>
        </Link>
      </div>
    </div>
  );
}
