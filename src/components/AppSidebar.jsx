'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  MessageCircle,
  Radio,
  Settings,
  User,
  LogOut,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const AppSidebar = ({ onOpenSearch }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    {
      label: 'Chats',
      href: '/chats',
      icon: MessageCircle,
      active: pathname === '/chats' || pathname.startsWith('/chat/'),
    },
    {
      label: 'External SMS',
      href: '/sms',
      icon: Radio,
      active: pathname === '/sms',
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: User,
      active: pathname === '/profile',
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      active: pathname === '/settings',
    },
  ];

  return (
    <aside className="w-16 md:w-20 lg:w-64 bg-[#0b0f19] border-r border-slate-800 flex flex-col justify-between py-5 px-2 md:px-3 lg:px-4 select-none shrink-0 z-30">
      {/* Top Branding */}
      <div className="flex flex-col gap-6">
        <Link
          href="/chats"
          className="flex items-center gap-3 px-1 md:px-2 group"
          title="Veyra Chat"
        >
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-md shadow-violet-600/30 group-hover:scale-105 transition-all">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-violet-300 bg-clip-text text-transparent">
              Veyra<span className="text-violet-400">Chat</span>
            </span>
            <span className="text-[10px] text-violet-400/80 font-mono tracking-wider -mt-1">
              v1.0 REALTIME
            </span>
          </div>
        </Link>

        {/* Quick Search Action */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-3 w-full py-2.5 px-3 rounded-xl bg-[#131c31] border border-violet-500/20 text-slate-300 hover:text-white hover:border-violet-500/50 hover:bg-[#19243f] transition-all group"
            title="Search registered users by phone"
          >
            <Search className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
            <span className="hidden lg:inline text-xs font-medium text-slate-300">
              Find by Phone...
            </span>
          </button>
        )}

        {/* Navigation list */}
        <nav className="flex flex-col gap-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  item.active
                    ? 'bg-violet-600/15 text-violet-300 border border-violet-500/30 shadow-inner shadow-violet-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111827]'
                }`}
                title={item.label}
              >
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    item.active ? 'text-violet-400' : 'text-slate-400'
                  }`}
                />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile and Signout */}
      <div className="flex flex-col gap-3 pt-4 border-t border-slate-800">
        <Link
          href="/profile"
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#111827] transition-colors group"
          title="Account Profile"
        >
          <div className="relative">
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.phone}`
              }
              alt={user?.name || 'User'}
              className="w-10 h-10 rounded-full bg-slate-800 object-cover border border-violet-500/30 group-hover:border-violet-400 transition-colors"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0b0f19]" />
          </div>
          <div className="hidden lg:flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-slate-200 truncate max-w-[110px]">
                {user?.name || 'Veyra Member'}
              </span>
              {user?.isPhoneVerified && (
                <ShieldCheck
                  className="w-3.5 h-3.5 text-violet-400 shrink-0"
                  title="Phone verified"
                />
              )}
            </div>
            <span className="text-xs text-slate-400 font-mono truncate max-w-[120px]">
              {user?.phone || ''}
            </span>
          </div>
        </Link>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors w-full"
          title="Logout"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="hidden lg:inline text-sm font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
