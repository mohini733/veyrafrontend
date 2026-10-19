'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MessageSquare, Home } from 'lucide-react';

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path && path.endsWith('.html')) {
        const clean = path.replace(/\.html$/, '');
        router.replace(clean || '/chats');
      }
    }
  }, [router]);

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
        The link you followed might be broken, or the page may have moved.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/chats"
          className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Back to Messages</span>
        </Link>
        <Link
          href="/settings"
          className="px-6 py-3 rounded-xl bg-[#111827] border border-slate-700 hover:bg-[#162038] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Open Settings</span>
        </Link>
      </div>
    </div>
  );
}
