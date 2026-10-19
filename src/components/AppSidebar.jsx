'use client';

import React, { useState } from 'react';
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
  Camera,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCustomization, APP_ICON_PRESETS } from '../context/CustomizationContext';
import CameraModal from './CameraModal';

export const AppSidebar = ({ onOpenSearch }) => {
  const pathname = usePathname();
  const { user, logout, updateUser } = useAuth();
  const { appIcon, customAppIcon } = useCustomization();
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const activeIconPreset =
    APP_ICON_PRESETS.find((p) => p.id === appIcon) || APP_ICON_PRESETS[0];

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

  const isInsideChat = pathname.startsWith('/chat/');

  const handleSidebarCameraCapture = ({ image, caption }) => {
    // When photo is taken from sidebar, download it directly with timestamp
    if (!image) return;
    try {
      const link = document.createElement('a');
      link.href = image;
      link.download = `veyra_filtered_photo_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn('Failed to auto-download image:', e);
    }
  };

  return (
    <>
      {/* Desktop / Tablet Left Sidebar */}
      <aside className="hidden md:flex md:w-20 lg:w-64 bg-[#0b0f19] border-r border-slate-800 flex-col justify-between py-5 px-2 md:px-3 lg:px-4 select-none shrink-0 z-30">
        {/* Top Branding */}
        <div className="flex flex-col gap-5">
          <Link
            href="/chats"
            className="flex items-center gap-3 px-1 md:px-2 group"
            title="Veyra Chat"
          >
            {customAppIcon ? (
              <img
                src={customAppIcon}
                alt="Veyra Logo"
                className="w-11 h-11 rounded-2xl object-cover shadow-md shadow-violet-600/30 group-hover:scale-105 transition-all border border-violet-500/30"
              />
            ) : (
              <div
                className={`flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr ${activeIconPreset.gradient} shadow-md shadow-violet-600/30 group-hover:scale-105 transition-all`}
              >
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="hidden lg:flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-violet-300 bg-clip-text text-transparent">
                Veyra<span className="text-violet-400">Chat</span>
              </span>
              <span className="text-[10px] text-violet-400/80 font-mono tracking-wider -mt-1">
                v1.0 REALTIME
              </span>
            </div>
          </Link>

          {/* Quick Actions (Search + Live Camera) */}
          <div className="flex flex-col gap-2">
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-3 w-full py-2.5 px-3 rounded-xl bg-[#131c31] border border-violet-500/20 text-slate-300 hover:text-white hover:border-violet-500/50 hover:bg-[#19243f] transition-all group cursor-pointer"
                title="Search registered users by phone"
              >
                <Search className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
                <span className="hidden lg:inline text-xs font-medium text-slate-300">
                  Find by Phone...
                </span>
              </button>
            )}

            <button
              onClick={() => setIsCameraOpen(true)}
              className="flex items-center gap-3 w-full py-2.5 px-3 rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-300 hover:text-white hover:bg-violet-600/30 transition-all group cursor-pointer"
              title="Open Camera with Live Filters"
            >
              <Camera className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
              <span className="hidden lg:inline text-xs font-semibold text-violet-200">
                Camera & Filters
              </span>
            </button>
          </div>

          {/* Navigation list */}
          <nav className="flex flex-col gap-1.5 mt-1">
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
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#111827] transition-colors group cursor-pointer"
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
            className="flex items-center gap-3 p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors w-full cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="hidden lg:inline text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Smartphones) - Only on top-level pages, hidden inside active chat */}
      {!isInsideChat && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0b0f19]/95 backdrop-blur-xl border-t border-slate-800/80 z-50 flex items-center justify-around px-2 select-none shadow-2xl pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                  item.active
                    ? 'text-violet-400 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 ${
                      item.active ? 'text-violet-400 stroke-[2.5]' : 'text-slate-400'
                    }`}
                  />
                  {item.active && (
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                  {item.label === 'External SMS' ? 'SMS' : item.label}
                </span>
              </Link>
            );
          })}

          {/* Quick Camera button on Mobile bottom bar */}
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-slate-400 hover:text-violet-300 transition-all cursor-pointer"
          >
            <Camera className="w-5 h-5 text-violet-400" />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Camera</span>
          </button>
        </nav>
      )}

      {/* Camera Modal with Live Filters */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleSidebarCameraCapture}
        title="Live Camera & Filters"
      />
    </>
  );
};

export default AppSidebar;
