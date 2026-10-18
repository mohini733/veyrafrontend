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
  phone,
  avatar,
  onSaved,
  onUpdated,
}) => {
  // Normalize contact id, name, phone, and avatar whether passed as object or individual props
  const targetId = (contact?._id || contact?.id || contactId)?.toString();
  const originalName = contact?.name || currentName || 'Veyra Member';
  const targetPhone = contact?.phone || phone || '';
  const targetAvatar =
    contact?.avatar ||
    avatar ||
    `https://api.dicebear.com/7.x/identicon/svg?seed=${targetPhone || targetId || 'user'}`;

  const [customName, setCustomName] = useState('');

  useEffect(() => {
    if (isOpen && targetId) {
      const current = getCustomContactName(targetId, originalName);
      setCustomName(current);
    }
  }, [isOpen, targetId, originalName]);

  if (!isOpen || !targetId) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!targetId) return;
    const trimmed = customName?.trim() || originalName;
    setCustomContactName(targetId, trimmed);
    if (onSaved) onSaved(trimmed);
    if (onUpdated) onUpdated(trimmed);
    onClose();
  };

  const handleReset = () => {
    if (!targetId) return;
    setCustomContactName(targetId, null);
    setCustomName(originalName);
    if (onSaved) onSaved(originalName);
    if (onUpdated) onUpdated(originalName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#0f172a] border border-violet-500/30 rounded-3xl shadow-2xl shadow-violet-950/60 overflow-hidden flex flex-col z-10">
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
            type="button"
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
              src={targetAvatar}
              alt={originalName}
              className="w-12 h-12 rounded-full object-cover border border-violet-500/20 shrink-0 bg-slate-800"
            />
            <div className="min-w-0">
              <p className="text-[11px] text-slate-400">Registered Name:</p>
              <p className="text-sm font-semibold text-white truncate">{originalName}</p>
              {targetPhone && (
                <p className="text-xs text-violet-400 font-mono">{targetPhone}</p>
              )}
            </div>
          </div>

          {/* Custom Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Custom Display Name
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter custom nickname or name..."
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-[#090d16] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              This custom name will be visible to you across your chats and contacts list.
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
