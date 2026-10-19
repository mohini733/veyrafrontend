'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, X, Check, RotateCcw } from 'lucide-react';
import { getCustomContactName, setCustomContactName } from '../lib/contacts';

export const EditContactModal = ({
  isOpen,
  onClose,
  contact,
  contactId,
  currentName,
  name,
  phone: propPhone,
  avatar: propAvatar,
  onSaved,
  onUpdated,
}) => {
  const targetId =
    contact?._id?.toString() ||
    contact?.id?.toString() ||
    contactId?.toString();

  const phone = contact?.phone || propPhone || '';
  const originalName = contact?.name || currentName || name || 'Veyra Member';
  const avatar =
    contact?.avatar ||
    propAvatar ||
    `https://api.dicebear.com/7.x/identicon/svg?seed=${phone || originalName}`;

  const [customName, setCustomName] = useState('');

  useEffect(() => {
    if (isOpen) {
      const existing = getCustomContactName(targetId, originalName, phone);
      setCustomName(existing || originalName);
    }
  }, [isOpen, targetId, originalName, phone]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const finalName = customName && customName.trim() ? customName.trim() : originalName;
    setCustomContactName(targetId, finalName, phone);
    if (onSaved) onSaved(finalName);
    if (onUpdated) onUpdated(finalName);
    onClose();
  };

  const handleReset = () => {
    setCustomContactName(targetId, null, phone);
    setCustomName(originalName);
    if (onSaved) onSaved(originalName);
    if (onUpdated) onUpdated(originalName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-violet-500/30 rounded-3xl shadow-2xl shadow-violet-950/80 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131c31]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Edit Contact Name</h3>
              <p className="text-xs text-slate-400">Set a custom name or nickname</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Contact Preview */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#090d16] border border-slate-800">
            <img
              src={avatar}
              alt={originalName}
              className="w-12 h-12 rounded-full object-cover border border-violet-500/20 shrink-0 bg-slate-800"
            />
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Registered Name:</p>
              <p className="text-sm font-semibold text-white truncate">{originalName}</p>
              {phone && <p className="text-xs text-violet-400 font-mono">{phone}</p>}
            </div>
          </div>

          {/* Custom Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Custom Display Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter custom nickname or name..."
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-[#090d16] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              This custom name will be visible to you across all your chats and contacts list.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reset to original registered name"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-[#131c31] hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Name</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContactModal;
