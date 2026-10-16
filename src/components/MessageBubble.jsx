'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';

export const MessageBubble = ({ message, isMine }) => {
  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderStatus = () => {
    if (!isMine) return null;

    if (message.status === 'read') {
      return (
        <span title="Read" className="text-violet-300 flex items-center">
          <CheckCheck className="w-3.5 h-3.5" />
        </span>
      );
    }

    if (message.status === 'delivered') {
      return (
        <span title="Delivered" className="text-slate-300 flex items-center">
          <CheckCheck className="w-3.5 h-3.5" />
        </span>
      );
    }

    // Default: 'sent'
    return (
      <span title="Sent to server" className="text-slate-300/80 flex items-center">
        <Check className="w-3.5 h-3.5" />
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`flex w-full mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`relative max-w-[82%] sm:max-w-[70%] md:max-w-[60%] px-4 py-2.5 rounded-2xl shadow-sm ${
          isMine
            ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-tr-xs border border-violet-400/20'
            : 'bg-[#151e33] text-slate-100 rounded-tl-xs border border-slate-700/60'
        }`}
      >
        {/* Message Content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words select-text">
          {message.text}
        </p>

        {/* Timestamp and delivery/read status */}
        <div
          className={`flex items-center justify-end gap-1.5 mt-1 select-none text-[10px] ${
            isMine ? 'text-violet-200/90' : 'text-slate-400'
          }`}
        >
          <span>{formatMessageTime(message.createdAt)}</span>
          {renderStatus()}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
