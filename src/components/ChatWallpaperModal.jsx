'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  Upload,
  Trash2,
  Check,
  Sparkles,
  Sliders,
  RefreshCw,
  Eye,
} from 'lucide-react';
import {
  PERSONAL_WALLPAPER_PRESETS,
  getPersonalWallpaper,
  setPersonalWallpaper,
  removePersonalWallpaper,
  compressImageFile,
} from '../lib/personalWallpaper';
import { getWallpaperStyle } from '../context/CustomizationContext';

export const ChatWallpaperModal = ({
  isOpen,
  onClose,
  partner,
  conversationId,
  displayName,
}) => {
  const fileInputRef = useRef(null);
  const [selectedWallpaper, setSelectedWallpaper] = useState('');
  const [selectedDim, setSelectedDim] = useState(35);
  const [isCustomUpload, setIsCustomUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [hasExistingPersonal, setHasExistingPersonal] = useState(false);

  const contactName = displayName || partner?.name || 'this contact';

  // Load existing personal wallpaper on open
  useEffect(() => {
    if (!isOpen) return;

    const existing = getPersonalWallpaper(partner?._id, conversationId);
    if (existing && existing.wallpaper !== undefined) {
      setSelectedWallpaper(existing.wallpaper);
      setSelectedDim(existing.dim !== undefined ? existing.dim : 35);
      setHasExistingPersonal(true);
      setIsCustomUpload(
        existing.wallpaper.startsWith('data:') && !existing.wallpaper.includes('image/svg+xml')
      );
    } else {
      setSelectedWallpaper('');
      setSelectedDim(35);
      setHasExistingPersonal(false);
      setIsCustomUpload(false);
    }
    setFeedback('');
  }, [isOpen, partner?._id, conversationId]);

  if (!isOpen) return null;

  // Handle uploading custom wallpaper from user's gallery / device
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setFeedback('Compressing image for optimal performance...');
      const compressedDataUrl = await compressImageFile(file, 1280, 0.82);
      setSelectedWallpaper(compressedDataUrl);
      setIsCustomUpload(true);
      setFeedback('Photo selected from gallery! Preview below.');
    } catch (err) {
      console.error('Failed to process image:', err);
      setFeedback('Could not read image file. Please try another.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Save the custom wallpaper for this specific chat
  const handleApply = () => {
    setPersonalWallpaper(partner?._id, conversationId, selectedWallpaper, selectedDim);
    setFeedback(`Personal wallpaper applied for ${contactName}! 🎉`);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  // Remove custom wallpaper and revert back to default
  const handleResetToDefault = () => {
    removePersonalWallpaper(partner?._id, conversationId);
    setSelectedWallpaper('');
    setHasExistingPersonal(false);
    setIsCustomUpload(false);
    setFeedback(`Reset to default wallpaper for ${contactName}`);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  const previewStyle = getWallpaperStyle(selectedWallpaper, selectedDim);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-lg bg-[#0c1220] border border-violet-500/30 rounded-3xl shadow-2xl shadow-violet-950/90 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#101728]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Personal Chat Wallpaper</span>
              </h3>
              <p className="text-xs text-slate-400">
                Custom background for <span className="text-violet-400 font-semibold">{contactName}</span> (WhatsApp style)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Status info bar */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#090d16] border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
              <span className="text-slate-300">
                {hasExistingPersonal ? (
                  <>
                    Personal wallpaper is <span className="text-emerald-400 font-bold">ACTIVE</span> for {contactName}
                  </>
                ) : (
                  <>Using standard default wallpaper for this chat</>
                )}
              </span>
            </div>
            {hasExistingPersonal && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer font-semibold"
              >
                <Trash2 className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>
            )}
          </div>

          {feedback && (
            <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Live Preview Container */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-violet-400" />
                <span>Live Chat Preview</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {selectedWallpaper ? 'Custom' : 'Default'} • {selectedDim}% Dim
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-800 h-44 bg-[#090d16] flex flex-col justify-end p-3.5 shadow-inner">
              {/* Wallpaper Layer */}
              {selectedWallpaper ? (
                <>
                  <div
                    className="absolute inset-0 transition-all duration-300 pointer-events-none"
                    style={previewStyle.style}
                  />
                  <div
                    className="absolute inset-0 pointer-events-none transition-all duration-300"
                    style={previewStyle.dimStyle}
                  />
                </>
              ) : (
                <div className="absolute inset-0 bg-[#090d16]" />
              )}

              {/* Sample Chat Messages */}
              <div className="relative z-10 space-y-2 pointer-events-none w-full">
                <div className="p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md text-xs text-slate-200 w-fit max-w-[80%] border border-slate-700/60 shadow-lg">
                  <span className="font-semibold text-violet-400 text-[10px] block mb-0.5">
                    {contactName}
                  </span>
                  Hey! Loving this custom wallpaper on our chat! 🔥
                </div>
                <div className="p-2.5 rounded-2xl bg-violet-600 text-xs text-white w-fit max-w-[80%] ml-auto shadow-lg shadow-violet-900/40">
                  Yes, set just for this chat like WhatsApp! ✨
                </div>
              </div>
            </div>
          </div>

          {/* Upload Card from Gallery */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-between group ${
                isCustomUpload
                  ? 'border-violet-500 bg-violet-600/15'
                  : 'border-slate-700 hover:border-violet-500 bg-[#090d16] hover:bg-violet-600/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform shrink-0">
                  {uploading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Choose Photo from Gallery</h4>
                  <p className="text-[11px] text-slate-400">
                    Upload any personal picture or background for {contactName}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-violet-400 group-hover:text-violet-300 px-3 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/30">
                Browse
              </span>
            </div>
          </div>

          {/* Dimming Slider */}
          <div className="p-3.5 rounded-2xl bg-[#090d16] border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-violet-400" />
                <span>Text Readability Dimming</span>
              </span>
              <span className="font-mono text-violet-400 font-bold">{selectedDim}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={selectedDim}
              onChange={(e) => setSelectedDim(Number(e.target.value))}
              className="w-full accent-violet-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Brighter (10%)</span>
              <span>Balanced (35%)</span>
              <span>Darker (80%)</span>
            </div>
          </div>

          {/* Presets Grid */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Or Select A Curated Wallpaper Preset:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Default clean */}
              <button
                type="button"
                onClick={() => {
                  setSelectedWallpaper('');
                  setIsCustomUpload(false);
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative group flex flex-col justify-between ${
                  selectedWallpaper === ''
                    ? 'border-violet-500 bg-violet-600/20 text-white font-bold ring-2 ring-violet-500'
                    : 'border-slate-800 bg-[#090d16] text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className="w-full h-10 rounded-lg mb-1.5 border border-slate-700/60 overflow-hidden relative bg-[#090d16] flex items-center justify-center">
                  <span className="text-[10px] font-mono text-slate-500">Default</span>
                  {selectedWallpaper === '' && (
                    <div className="absolute inset-0 bg-violet-600/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] block truncate">Default Clean</span>
              </button>

              {/* Other presets */}
              {PERSONAL_WALLPAPER_PRESETS.map((p) => {
                const isSelected = selectedWallpaper === p.value && !isCustomUpload;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedWallpaper(p.value);
                      setIsCustomUpload(false);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isSelected
                        ? 'border-violet-500 bg-violet-600/20 text-white font-bold ring-2 ring-violet-500 shadow-md'
                        : 'border-slate-800 bg-[#090d16] text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-full h-10 rounded-lg mb-1.5 border border-slate-700/60 overflow-hidden relative ${p.preview}`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-violet-600/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] block truncate">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-800 bg-[#101728] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-950/60 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply for {contactName}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWallpaperModal;
