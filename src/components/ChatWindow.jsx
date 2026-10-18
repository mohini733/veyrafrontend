'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MoreVertical,
  Phone,
  ShieldCheck,
  MessageSquare,
  Lock,
  Sparkles,
  Edit3,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCustomization, getWallpaperStyle } from '../context/CustomizationContext';
import { getSocket } from '../lib/socket';
import api from '../lib/api';
import { playMessageSound } from '../lib/sound';
import { getCustomContactName } from '../lib/contacts';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import EditContactModal from './EditContactModal';
import DeleteChatModal from './DeleteChatModal';

export const ChatWindow = ({ conversation, onBack }) => {
  const { user: currentUser } = useAuth();
  const { wallpaper, wallpaperDim } = useCustomization();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingName, setTypingName] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  const conversationId = conversation?._id;

  // Find other participant
  const partner =
    conversation?.participants?.find(
      (p) => p._id?.toString() !== currentUser?._id?.toString()
    ) || conversation?.participants?.[0];

  const [displayName, setDisplayName] = useState(
    partner ? getCustomContactName(partner._id, partner.name) : 'Veyra User'
  );
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [isDeleteChatOpen, setIsDeleteChatOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (partner) {
      setDisplayName(getCustomContactName(partner._id, partner.name));
    }
    const handleContactUpdate = () => {
      if (partner) {
        setDisplayName(getCustomContactName(partner._id, partner.name));
      }
    };
    window.addEventListener('veyra_contact_updated', handleContactUpdate);
    return () => {
      window.removeEventListener('veyra_contact_updated', handleContactUpdate);
    };
  }, [partner]);

  const handleDeleteMessage = async (messageId) => {
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
    try {
      await api.delete(`/messages?messageId=${messageId}`);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch initial message history
  useEffect(() => {
    if (!conversationId) return;

    let isMounted = true;
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/messages/${conversationId}`);
        if (isMounted && data.success) {
          setMessages(data.messages || []);
          setTimeout(() => scrollToBottom('auto'), 50);
        }
      } catch (err) {
        console.error('Failed to load message history:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  // Socket.IO event listeners for real-time chat
  useEffect(() => {
    if (!conversationId) return;
    const socket = getSocket();
    if (!socket) return;

    // Join conversation room
    socket.emit('join_conversation', { conversationId });

    // Inform server that recipient is viewing messages (mark read)
    socket.emit('mark_messages_read', { conversationId });
    api.put(`/messages/read/${conversationId}`).catch(() => {});

    // New message listener
    const handleNewMessage = (newMsg) => {
      if (newMsg.conversationId?.toString() === conversationId.toString()) {
        setMessages((prev) => {
          // Avoid duplicate messages if already optimistically added
          const exists = prev.some((m) => m._id === newMsg._id);
          if (exists) return prev;
          return [...prev, newMsg];
        });

        // If I am the recipient of this new incoming message, acknowledge read immediately
        if (newMsg.sender?._id?.toString() !== currentUser?._id?.toString()) {
          socket.emit('mark_messages_read', { conversationId });
          playMessageSound();
        }

        setTimeout(() => scrollToBottom('smooth'), 50);
      }
    };

    // Typing start listener
    const handleTypingStart = (data) => {
      if (
        data.conversationId === conversationId &&
        data.userId !== currentUser?._id
      ) {
        setIsTyping(true);
        setTypingName(data.name || 'Partner');

        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    };

    // Typing stop listener
    const handleTypingStop = (data) => {
      if (data.conversationId === conversationId) {
        setIsTyping(false);
      }
    };

    // Read receipts update listener
    const handleMessagesRead = (data) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.sender?._id?.toString() === currentUser?._id?.toString()) {
              return { ...msg, status: 'read', readAt: data.readAt };
            }
            return msg;
          })
        );
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.emit('leave_conversation', { conversationId });
      socket.off('new_message', handleNewMessage);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
      socket.off('messages_read', handleMessagesRead);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [conversationId, currentUser?._id]);

  // Polling fallback to guarantee 100% reliable real-time messages even without WebSocket
  useEffect(() => {
    if (!conversationId) return;

    const interval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return;

      try {
        const { data } = await api.get(`/messages/${conversationId}`);
        if (data.success && Array.isArray(data.messages)) {
          setMessages((prev) => {
            if (data.messages.length > prev.length) {
              const prevIds = new Set(prev.map((m) => m._id));
              const hasNewIncoming = data.messages.some(
                (m) =>
                  !prevIds.has(m._id) &&
                  m.sender?._id?.toString() !== currentUser?._id?.toString()
              );
              if (hasNewIncoming) {
                playMessageSound();
                setTimeout(() => scrollToBottom('smooth'), 50);
              }
              return data.messages;
            }
            return prev;
          });
        }
      } catch (err) {
        // Silent catch for background polling
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [conversationId, currentUser?._id]);

  // Send message handler (supports text and camera photos)
  const handleSendMessage = (content) => {
    const isObj = typeof content === 'object' && content !== null;
    const text = isObj ? content.text || '' : content;
    const image = isObj ? content.image || null : null;

    const socket = getSocket();
    const tempId = 'temp_' + Date.now();

    // Optimistic local message
    const optimisticMsg = {
      _id: tempId,
      conversationId,
      sender: {
        _id: currentUser?._id,
        name: currentUser?.name,
        avatar: currentUser?.avatar,
      },
      recipient: partner,
      text: text || (image ? '📷 Photo' : ''),
      image,
      mediaType: image ? 'image' : 'text',
      status: 'sent',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => scrollToBottom('smooth'), 20);

    if (socket && socket.connected) {
      socket.emit(
        'send_message',
        { conversationId, text, image, tempId },
        (response) => {
          if (response?.success && response.message) {
            setMessages((prev) =>
              prev.map((m) => (m._id === tempId ? response.message : m))
            );
          }
        }
      );
    } else {
      // Fallback to REST API if socket temporarily disconnected
      api
        .post('/messages', { conversationId, text, image })
        .then(({ data }) => {
          if (data.success && data.message) {
            setMessages((prev) =>
              prev.map((m) => (m._id === tempId ? data.message : m))
            );
          }
        })
        .catch((err) => {
          console.error('Failed to send fallback REST message:', err);
        });
    }
  };

  const handleTypingStart = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('typing_start', { conversationId });
    }
  };

  const handleTypingStop = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('typing_stop', { conversationId });
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#090d16] p-8 text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4 shadow-lg shadow-violet-900/20">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Select a Conversation</h3>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Choose a conversation from the sidebar or search a registered phone number to begin real-time messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#090d16] overflow-hidden">
      {/* Top Header */}
      <div className="h-16 px-4 border-b border-slate-800/80 bg-[#0c1220]/90 flex items-center justify-between shrink-0 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="relative">
            <img
              src={
                partner?.avatar ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${partner?.phone}`
              }
              alt={partner?.name || 'Contact'}
              className="w-10 h-10 rounded-full bg-slate-800 object-cover border border-violet-500/30"
            />
            {partner?.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0c1220]" />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white text-sm truncate">
                {displayName}
              </span>
              {partner?.isPhoneVerified && (
                <ShieldCheck
                  className="w-3.5 h-3.5 text-violet-400 shrink-0"
                  title="Phone Verified"
                />
              )}
            </div>

            <span className="text-xs text-slate-400 font-mono">
              {isTyping ? (
                <span className="text-violet-400 font-medium animate-pulse">
                  typing...
                </span>
              ) : partner?.online ? (
                <span className="text-emerald-400 font-medium">Online</span>
              ) : (
                partner?.phone || 'Offline'
              )}
            </span>
          </div>
        </div>

        {/* Action: 3-dots Dropdown Menu */}
        <div className="relative flex items-center">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
            title="Chat Options"
            aria-label="Chat Options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <>
              {/* Click outside backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Dropdown Card */}
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#0c1220]/95 backdrop-blur-xl border border-violet-500/30 rounded-2xl shadow-2xl shadow-black/80 p-1.5 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsEditNameOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-violet-600/20 transition-colors cursor-pointer text-left"
                >
                  <Edit3 className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Edit Contact Name</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsDeleteChatOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors cursor-pointer text-left"
                >
                  <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Delete Chat</span>
                </button>

                <div className="h-px bg-slate-800/80 my-0.5" />

                <Link
                  href={`/profile/${partner?._id || ''}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors text-left"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>View Profile</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages Scroll Area with Wallpaper */}
      <div className="flex-1 relative overflow-hidden flex flex-col min-h-0 bg-[#090d16]">
        {/* Fixed Wallpaper Layer */}
        {wallpaper ? (
          <>
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-300"
              style={getWallpaperStyle(wallpaper, wallpaperDim).style}
            />
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-300"
              style={getWallpaperStyle(wallpaper, wallpaperDim).dimStyle}
            />
          </>
        ) : null}

        {/* Scrollable Messages Content */}
        <div className="relative z-10 flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-2">
        {/* End-to-end indicator notice */}
        <div className="flex items-center justify-center my-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111827]/80 border border-slate-800 text-[11px] text-slate-400">
            <Lock className="w-3 h-3 text-violet-400" />
            <span>Messages are encrypted & validated by Veyra Engine</span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="py-16 text-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mx-auto mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <p className="text-base font-semibold text-white">Start the conversation</p>
            <p className="text-xs text-slate-400 mt-1">
              Say hello to {partner?.name}! Send your first message below.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine =
              msg.sender?._id?.toString() === currentUser?._id?.toString() ||
              msg.sender?.toString() === currentUser?._id?.toString();
            return (
              <MessageBubble
                key={msg._id}
                message={msg}
                isMine={isMine}
                onDelete={handleDeleteMessage}
              />
            );
          })
        )}

        {/* Partner Typing Bubble */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic bg-[#131c31]/60 px-3.5 py-2 rounded-2xl w-fit border border-slate-800">
            <span className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.4s]" />
            </span>
            <span>{typingName} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
      />

      {/* Edit Contact Name Modal */}
      <EditContactModal
        isOpen={isEditNameOpen}
        onClose={() => setIsEditNameOpen(false)}
        contact={partner}
        contactId={partner?._id}
        currentName={partner?.name}
        phone={partner?.phone}
        avatar={partner?.avatar}
        onSaved={(newName) => {
          setDisplayName(newName);
        }}
      />

      {/* Delete Chat Confirmation Modal */}
      <DeleteChatModal
        isOpen={isDeleteChatOpen}
        onClose={() => setIsDeleteChatOpen(false)}
        conversationId={conversationId}
        partnerName={displayName}
        onDeleted={() => {
          setMessages([]);
          if (onBack) {
            onBack();
          } else {
            window.location.href = '/chats';
          }
        }}
      />
    </div>
  );
};

export default ChatWindow;
