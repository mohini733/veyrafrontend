'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, X, Sparkles, Camera } from 'lucide-react';
import CameraModal from './CameraModal';

const EMOJI_CATEGORIES = [
  {
    id: 'popular',
    name: 'Top',
    icon: '🔥',
    emojis: ['❤️', '😂', '🔥', '👍', '😍', '🙏', '✨', '🥰', '🤣', '🎉', '💯', '🚀', '🥺', '👏', '😎', '💪'],
  },
  {
    id: 'smileys',
    name: 'Faces',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '☺️', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
      '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒',
      '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭',
      '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥',
    ],
  },
  {
    id: 'gestures',
    name: 'Hands',
    icon: '👋',
    emojis: [
      '👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤞', '🤟', '🤘',
      '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '✍️',
      '💪', '👊', '✊', '🤛', '🤜', '🫡', '🫶', '👀',
    ],
  },
  {
    id: 'hearts',
    name: 'Hearts',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕',
      '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '💋', '💎', '✨', '⭐',
      '🌟', '💫', '🌹', '🌸', '💐', '🌺',
    ],
  },
  {
    id: 'vibes',
    name: 'Vibes',
    icon: '🎉',
    emojis: [
      '🎉', '🎊', '🎈', '🎂', '🎁', '🏆', '🥇', '👑', '🔥', '💥', '⚡', '💯',
      '🚀', '🎯', '🪄', '🎵', '🎶', '☕', '🍕', '🍻', '🌟', '🌈', '🍀', '💡',
    ],
  },
];

export const MessageInput = ({ onSendMessage, onTypingStart, onTypingStop, disabled = false }) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeCategory, setActiveCategory] = useState('popular');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const pickerRef = useRef(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        !e.target.closest('.emoji-toggle-btn')
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleInputChange = (e) => {
    setText(e.target.value);

    // Trigger typing start indicator
    if (onTypingStart) {
      onTypingStart();
    }

    // Debounce typing stop indicator after 1.5s of no keypress
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (onTypingStop) {
        onTypingStop();
      }
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiInsert = (emoji) => {
    if (!inputRef.current) {
      setText((prev) => prev + emoji);
      return;
    }
    const input = inputRef.current;
    const start = input.selectionStart ?? text.length;
    const end = input.selectionEnd ?? text.length;
    const newText = text.substring(0, start) + emoji + text.substring(end);
    setText(newText);

    // Move cursor right after the newly inserted emoji
    setTimeout(() => {
      input.focus();
      const newPos = start + emoji.length;
      input.setSelectionRange(newPos, newPos);
    }, 10);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || disabled) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (onTypingStop) {
      onTypingStop();
    }

    onSendMessage(text.trim());
    setText('');
    setShowEmojiPicker(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle camera photo capture and dispatch
  const handleCameraCapture = ({ image, caption }) => {
    if (!image) return;
    onSendMessage({
      text: caption || '📷 Photo',
      image,
    });
  };

  const currentCategoryObj =
    EMOJI_CATEGORIES.find((c) => c.id === activeCategory) || EMOJI_CATEGORIES[0];

  return (
    <>
      <div className="relative p-2.5 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[#0c1220]/95 border-t border-slate-800/80 backdrop-blur-md shrink-0 z-30 w-full select-none">
        {/* Floating Emoji Picker Popover */}
        {showEmojiPicker && (
          <div
            ref={pickerRef}
            className="absolute bottom-full mb-3 left-2 right-2 sm:left-4 sm:right-auto sm:w-[340px] max-h-[310px] bg-[#0c1220]/98 backdrop-blur-2xl border border-slate-700/80 rounded-3xl p-3 shadow-2xl shadow-black/80 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            {/* Header & Category Switcher */}
            <div className="flex items-center justify-between gap-1 pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {EMOJI_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-[#090d16] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="text-[11px]">{cat.name}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowEmojiPicker(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer ml-1"
                title="Close picker"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Emoji Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-7 sm:grid-cols-8 gap-1.5 p-1 text-center">
              {currentCategoryObj.emojis.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleEmojiInsert(emoji)}
                  className="w-9 h-9 flex items-center justify-center text-xl rounded-xl hover:bg-violet-600/20 active:scale-90 transition-all cursor-pointer select-none"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Quick bar at bottom of picker */}
            <div className="pt-2 mt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Tap any emoji to insert</span>
              <span className="text-violet-400 font-medium">Veyra Chat</span>
            </div>
          </div>
        )}

        {/* Main Input Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-5xl mx-auto w-full">
          <div className="relative flex-1 flex items-center">
            {/* Emoji toggle button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`emoji-toggle-btn absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all cursor-pointer z-10 flex items-center justify-center ${
                showEmojiPicker
                  ? 'text-violet-400 bg-violet-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
              title="Choose emoji"
            >
              <Smile className="w-5 h-5 shrink-0" />
            </button>

            {/* Input field */}
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              autoComplete="off"
              placeholder="Type your message..."
              className="w-full pl-11 pr-12 py-3 rounded-2xl bg-[#090d16] border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm leading-relaxed"
            />

            {/* Camera button inside input on the right */}
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-slate-400 hover:text-violet-300 hover:bg-violet-600/20 transition-all cursor-pointer z-10 flex items-center justify-center group"
              title="Open Camera with Filters"
            >
              <Camera className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Send message button */}
          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 disabled:opacity-30 disabled:hover:scale-100 hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
            title="Send message"
          >
            <Send className="w-5 h-5 -ml-0.5" />
          </button>
        </form>
      </div>

      {/* Camera Modal with Live Filters */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Veyra Camera & Filters"
      />
    </>
  );
};

export default MessageInput;
