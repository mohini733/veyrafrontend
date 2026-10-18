'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck, X, Download, Maximize2, Trash2 } from 'lucide-react';

export const MessageBubble = ({ message, isMine, onDelete }) => {
  const [showFullImage, setShowFullImage] = useState(false);

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

  // Determine if this message is an image message
  const imageUrl =
    message.image ||
    message.mediaUrl ||
    (typeof message.text === 'string' && message.text.startsWith('data:image/')
      ? message.text
      : null);

  const captionText =
    imageUrl && message.text && message.text !== imageUrl && message.text !== '📷 Photo'
      ? message.text
      : !imageUrl
      ? message.text
      : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={`flex w-full mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`relative max-w-[85%] sm:max-w-[75%] md:max-w-[62%] rounded-2xl shadow-md overflow-hidden group/bubble ${
            imageUrl ? 'p-1.5' : 'px-4 py-2.5'
          } ${
            isMine
              ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-tr-xs border border-violet-400/20'
              : 'bg-[#151e33] text-slate-100 rounded-tl-xs border border-slate-700/60'
          }`}
        >
          {/* Photo Render */}
          {imageUrl && (
            <div className="relative group cursor-pointer overflow-hidden rounded-xl">
              <img
                src={imageUrl}
                alt="Chat attachment"
                onClick={() => setShowFullImage(true)}
                className="w-full max-h-[320px] object-cover rounded-xl transition-transform duration-200 group-hover:scale-[1.02]"
              />

              {/* Hover overlay hint */}
              <div
                onClick={() => setShowFullImage(true)}
                className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <span className="p-2 rounded-full bg-black/60 backdrop-blur-md">
                  <Maximize2 className="w-4 h-4" />
                </span>
              </div>
            </div>
          )}

          {/* Optional Caption or Text Content */}
          {captionText && (
            <p
              className={`text-sm leading-relaxed whitespace-pre-wrap break-words select-text ${
                imageUrl ? 'px-2 pt-2' : ''
              }`}
            >
              {captionText}
            </p>
          )}

          {/* Timestamp and delivery/read status */}
          <div
            className={`flex items-center justify-end gap-1.5 select-none text-[10px] ${
              imageUrl ? 'px-2 py-1' : 'mt-1'
            } ${isMine ? 'text-violet-200/90' : 'text-slate-400'}`}
          >
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(message._id);
                }}
                className="opacity-0 group-hover/bubble:opacity-100 hover:text-rose-400 p-0.5 rounded transition-opacity cursor-pointer mr-0.5"
                title="Delete message"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            <span>{formatMessageTime(message.createdAt)}</span>
            {renderStatus()}
          </div>
        </div>
      </motion.div>

      {/* Full-Screen Image Lightbox Modal */}
      {showFullImage && imageUrl && (
        <div
          onClick={() => setShowFullImage(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <span className="text-xs text-slate-300 font-mono">
                {formatMessageTime(message.createdAt)}
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={imageUrl}
                  download={`veyra_photo_${Date.now()}.jpg`}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Download photo"
                >
                  <Download className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setShowFullImage(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Expanded Image */}
            <img
              src={imageUrl}
              alt="Enlarged chat photo"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />

            {captionText && (
              <p className="mt-3 px-4 py-2 rounded-xl bg-black/60 text-white text-sm max-w-lg text-center backdrop-blur-md">
                {captionText}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MessageBubble;
