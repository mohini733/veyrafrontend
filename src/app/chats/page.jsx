'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { getSocket } from '../../lib/socket';
import { playMessageSound } from '../../lib/sound';
import api from '../../lib/api';
import AppSidebar from '../../components/AppSidebar';
import ChatList from '../../components/ChatList';
import UserSearch from '../../components/UserSearch';
import LoadingState from '../../components/LoadingState';
import { MessageSquare, Sparkles, Plus, Radio, Users } from 'lucide-react';

export default function ChatsDashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const conversationsRef = useRef([]);
  const router = useRouter();

  // Keep ref synchronized with state for comparisons in background loops
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Route protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch conversations with silent background option
  const fetchConversations = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const { data } = await api.get('/messages/conversations');
        if (data.success && Array.isArray(data.conversations)) {
          const freshList = data.conversations;

          // Check if any new incoming message arrived from another user
          if (silent && conversationsRef.current.length > 0) {
            const hasNewIncoming = freshList.some((freshConv) => {
              const oldConv = conversationsRef.current.find(
                (c) => c._id === freshConv._id
              );
              // New conversation appeared or last message timestamp changed
              const isNewConv = !oldConv;
              const isUpdated =
                oldConv &&
                freshConv.lastMessageAt &&
                new Date(freshConv.lastMessageAt).getTime() >
                  new Date(oldConv.lastMessageAt || 0).getTime();

              if (isNewConv || isUpdated) {
                const lastMsg = freshConv.lastMessage;
                const isMine =
                  lastMsg?.sender === user?._id ||
                  lastMsg?.sender?._id === user?._id ||
                  lastMsg?.sender?.toString() === user?._id?.toString();
                return !isMine && Boolean(lastMsg);
              }
              return false;
            });

            if (hasNewIncoming) {
              playMessageSound();
            }
          }

          setConversations(freshList);
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [user?._id]
  );

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations(false);
    }
  }, [isAuthenticated, fetchConversations]);

  // Periodic polling fallback (every 3 seconds) for 100% reliable real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      // Pause poll when browser tab is inactive to save battery
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchConversations(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchConversations]);

  // Socket updates for real-time conversation list sorting and online status updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleConversationUpdated = () => {
      fetchConversations(true);
    };

    const handleNewMessage = (newMsg) => {
      fetchConversations(true);
      if (
        newMsg?.sender?._id?.toString() !== user?._id?.toString() &&
        newMsg?.sender?.toString() !== user?._id?.toString()
      ) {
        playMessageSound();
      }
    };

    const handleUserOnline = (data) => {
      setConversations((prev) =>
        prev.map((c) => {
          const updatedParticipants = c.participants?.map((p) =>
            p._id === data.userId ? { ...p, online: true } : p
          );
          return { ...c, participants: updatedParticipants };
        })
      );
    };

    const handleUserOffline = (data) => {
      setConversations((prev) =>
        prev.map((c) => {
          const updatedParticipants = c.participants?.map((p) =>
            p._id === data.userId
              ? { ...p, online: false, lastSeen: data.lastSeen }
              : p
          );
          return { ...c, participants: updatedParticipants };
        })
      );
    };

    socket.on('conversation_updated', handleConversationUpdated);
    socket.on('new_message', handleNewMessage);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    return () => {
      socket.off('conversation_updated', handleConversationUpdated);
      socket.off('new_message', handleNewMessage);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
    };
  }, [user?._id, fetchConversations]);

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return <LoadingState message="Authenticating session..." />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-white">
      {/* App Sidebar */}
      <AppSidebar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Conversations List Sidebar */}
      <ChatList
        conversations={conversations}
        loading={loading}
        onOpenSearch={() => setIsSearchOpen(true)}
        onRefresh={() => fetchConversations(true)}
      />

      {/* Empty Detail Window / Welcome Panel */}
      <main className="hidden md:flex flex-1 flex-col items-center justify-center p-8 bg-[#090d16] text-center relative overflow-hidden select-none">
        {/* Subtle background glow */}
        <div className="absolute w-96 h-96 bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-md mx-auto flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-600/20 to-indigo-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-6 shadow-xl shadow-violet-950/50">
            <MessageSquare className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">
            Welcome to Veyra Chat, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Select a contact or conversation from the left, or click Registered Contacts to start chatting instantly without having to type any phone number.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Browse Registered Contacts</span>
            </button>

            <button
              onClick={() => router.push('/sms')}
              className="px-5 py-3 rounded-xl bg-[#111827] border border-slate-700 hover:border-violet-500/40 text-slate-200 font-medium text-sm hover:bg-[#162038] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Radio className="w-4 h-4 text-violet-400" />
              <span>External SMS Gateway</span>
            </button>
          </div>
        </div>
      </main>

      {/* User Search Modal */}
      <UserSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onConversationStarted={(newConv) => {
          setConversations((prev) => [
            newConv,
            ...prev.filter((c) => c._id !== newConv._id),
          ]);
          router.push(`/chat/${newConv._id}`);
        }}
      />
    </div>
  );
}
