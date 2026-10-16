'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { getSocket } from '../../lib/socket';
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
  const router = useRouter();

  // Route protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/messages/conversations');
      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  // Socket updates for real-time conversation list sorting and online status updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleConversationUpdated = (data) => {
      fetchConversations();
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
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    return () => {
      socket.off('conversation_updated', handleConversationUpdated);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
    };
  }, []);

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
            Select a contact from the conversation list on the left, or search a registered
            phone number to launch real-time messaging.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Search Contacts</span>
            </button>

            <button
              onClick={() => router.push('/sms')}
              className="px-5 py-3 rounded-xl bg-[#111827] border border-slate-700 hover:border-violet-500/40 text-slate-200 font-medium text-sm hover:bg-[#162038] flex items-center justify-center gap-2 transition-all"
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
          setConversations((prev) => [newConv, ...prev.filter((c) => c._id !== newConv._id)]);
          router.push(`/chat/${newConv._id}`);
        }}
      />
    </div>
  );
}
