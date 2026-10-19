'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Phone,
  ShieldCheck,
  Edit3,
  Trash2,
  Radio,
  Copy,
  Check,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const ContactProfileModal = ({
  isOpen,
  onClose,
  partner,
  displayName,
  onEditName,
  onDeleteChat,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !partner) return null;

  const handleCopyPhone = () => {
    if (!partner?.phone) return;
    navigator.clipboard?.writeText(partner.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const avatar =
    partner.avatar ||
    `https://api.dicebear.com/7.x/identicon/svg?seed=${partner.phone || partner.name}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-sm bg-[#0f172a] border border-violet-500/30 rounded-3xl shadow-2xl shadow-violet-950/80 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header with Close */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#131c31]/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
              Contact Profile
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="p-6 text-center overflow-y-auto max-h-[80vh]">
          {/* Avatar */}
          <div className="relative inline-block mx-auto mb-3">
            <img
              src={avatar}
              alt={displayName || partner.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-violet-500/30 shadow-xl bg-slate-800 mx-auto"
            />
            {partner.online && (
              <span
                className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0f172a]"
                title="Online"
              />
            )}
          </div>

          {/* Name & Verification */}
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <h3 className="text-lg font-bold text-white truncate max-w-[220px]">
              {displayName || partner.name}
            </h3>
            {partner.isPhoneVerified && (
              <ShieldCheck
                className="w-4 h-4 text-violet-400 shrink-0"
                title="Phone Verified"
              />
            )}
          </div>

          {/* Registered name if customized */}
          {displayName && displayName !== partner.name && (
            <p className="text-[11px] text-slate-400 mb-1">
              Registered name: <span className="text-slate-300 font-medium">{partner.name}</span>
            </p>
          )}

          {/* Status */}
          <p className="text-xs text-slate-400 font-mono mb-5">
            {partner.online ? (
              <span className="text-emerald-400 font-semibold">● Active Online</span>
            ) : (
              partner.phone || 'Offline'
            )}
          </p>

          {/* Action pills */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              onClick={() => {
                onClose();
                if (onEditName) onEditName();
              }}
              className="p-2.5 rounded-xl bg-[#131c31] hover:bg-violet-600/20 text-slate-200 hover:text-white border border-slate-700/80 hover:border-violet-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-violet-400" />
              <span>Edit Name</span>
            </button>

            <button
              onClick={() => {
                onClose();
                if (onDeleteChat) onDeleteChat();
              }}
              className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete Chat</span>
            </button>
          </div>

          {/* Details list */}
          <div className="space-y-2 text-left bg-[#090d16] p-3.5 rounded-2xl border border-slate-800 text-xs">
            {/* Phone */}
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Phone</span>
                <span className="font-mono text-slate-200 truncate block">
                  {partner.phone || 'Not available'}
                </span>
              </div>
              <button
                onClick={handleCopyPhone}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Copy phone"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* About / Bio */}
            <div className="py-1 border-b border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">About</span>
              <span className="text-slate-300 block text-xs mt-0.5">
                {partner.about || 'Available on Veyra Chat'}
              </span>
            </div>

            {/* Full profile link */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Open full profile page</span>
              <Link
                href={`/profile/${partner._id}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 text-xs font-semibold"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactProfileModal;
