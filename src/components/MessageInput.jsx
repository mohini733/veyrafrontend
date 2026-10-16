'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';

export const MessageInput = ({ onSendMessage, onTypingStart, onTypingStop, disabled = false }) => {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

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
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-[#0c1220]/95 border-t border-slate-800/80 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-5xl mx-auto">
        <div className="relative flex-1 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type your message..."
            className="w-full pl-4 pr-10 py-3 rounded-2xl bg-[#090d16] border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-600/30 disabled:opacity-40 disabled:hover:scale-100 hover:scale-105 active:scale-95 transition-all shrink-0"
          title="Send message"
        >
          <Send className="w-5 h-5 -ml-0.5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
