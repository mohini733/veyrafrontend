'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Shield, Send, User, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#090d16]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-md shadow-violet-600/30 group-hover:scale-105 transition-transform duration-200">
              <MessageSquare className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#090d16]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-violet-300 bg-clip-text text-transparent">
                Veyra<span className="text-violet-400">Chat</span>
              </span>
              <span className="text-[10px] text-violet-400/80 font-mono tracking-wider -mt-1">
                SECURE REALTIME
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {!isAuthPage && (
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/chats"
                className={`text-sm font-medium transition-colors hover:text-violet-400 ${
                  pathname?.startsWith('/chat') ? 'text-violet-400' : 'text-slate-300'
                }`}
              >
                Chats
              </Link>
              <Link
                href="/sms"
                className={`text-sm font-medium transition-colors hover:text-violet-400 ${
                  pathname === '/sms' ? 'text-violet-400' : 'text-slate-300'
                }`}
              >
                External SMS
              </Link>
              <Link
                href="/settings"
                className={`text-sm font-medium transition-colors hover:text-violet-400 ${
                  pathname === '/settings' ? 'text-violet-400' : 'text-slate-300'
                }`}
              >
                Settings
              </Link>
            </div>
          )}

          {/* User actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-slate-800 hover:border-violet-500/50 transition-colors"
                >
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.phone}`}
                    alt={user?.name || 'User'}
                    className="w-7 h-7 rounded-full bg-slate-800"
                  />
                  <span className="text-sm font-medium text-slate-200">
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl shadow-md shadow-violet-600/25 transition-all duration-200 hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#090d16] px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/chats"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Chats Dashboard
          </Link>
          <Link
            href="/sms"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            External SMS Dispatch
          </Link>
          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            My Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Settings
          </Link>
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-400 font-medium hover:bg-rose-500/20"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-700 text-slate-200 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-violet-600 text-white font-medium shadow-md shadow-violet-600/30"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
