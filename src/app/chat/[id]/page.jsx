'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { getSocket } from '../../../lib/socket';
import { playMessageSound } from '../../../lib/sound';
import api from '../../../lib/api';
import AppSidebar from '../../../components/AppSidebar';
import ChatList from '../../../components/ChatList';
import ChatWindow from '../../../components/ChatWindow';
import UserSearch from '../../../components/UserSearch';
import LoadingState from '../../../components/LoadingState';

function ChatConversationContent() {
  const { id } = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [error, setError] = useState('');
  const conversationsRef = useRef([]);
  const router = useRouter();

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Route protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch all user conversations
  const fetchConversations = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const { data } = await api.get('/messages/conversations');
        if (data.success && Array.isArray(data.conversations)) {
          const list = data.conversations;

          // Check if any incoming message arrived for a DIFFERENT conversation
          if (silent && conversationsRef.current.length > 0) {
            const hasOtherIncoming = list.some((freshConv) => {
              if (freshConv._id === id) return false; // Handled by ChatWindow
              const oldConv = conversationsRef.current.find(
                (c) => c._id === freshConv._id
              );
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

            if (hasOtherIncoming) {
              playMessageSound();
            }
          }

          setConversations(list);

          const found = list.find((c) => c._id === id);
          if (found) {
            setActiveConversation(found);
          } else if (!activeConversation) {
            // If not found in loaded list, attempt direct fetch
            try {
              const res = await api.get(`/messages/${id}`);
              if (res.data.success) {
                setActiveConversation(
                  res.data.conversation || { _id: id, participants: [] }
                );
              }
            } catch (err) {
              setError(err.response?.data?.message || 'Conversation not accessible');
            }
          }
        }
      } catch (err) {
        if (!silent) setError('Failed to load conversations');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id, user?._id, activeConversation]
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations(false);
    }
  }, [id, isAuthenticated]);

  // Polling fallback to keep sidebar up to date with new conversations and messages
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchConversations(true);
    }, 3500);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchConversations]);

  // Socket updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleConversationUpdated = () => {
      fetchConversations(true);
    };

    const handleNewMessage = (newMsg) => {
      fetchConversations(true);
      if (
        newMsg.conversationId !== id &&
        newMsg?.sender?._id?.toString() !== user?._id?.toString()
      ) {
        playMessageSound();
      }
    };

    socket.on('conversation_updated', handleConversationUpdated);
    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('conversation_updated', handleConversationUpdated);
      socket.off('new_message', handleNewMessage);
    };
  }, [id, user?._id, fetchConversations]);

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return <LoadingState message="Connecting to secure chat session..." />;
  }

  return (
    <div className="fixed inset-0 w-full h-[100dvh] flex overflow-hidden bg-[#090d16] text-white">
      {/* App Sidebar - always accessible */}
      <AppSidebar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Conversations List - Hidden on small mobile screens when active chat is shown */}
      <div className="hidden md:flex h-full">
        <ChatList
          conversations={conversations}
          loading={loading}
          onOpenSearch={() => setIsSearchOpen(true)}
          onRefresh={() => fetchConversations(true)}
        />
      </div>

      {/* Active Chat Window */}
      <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#090d16]">
            <p className="text-base text-rose-400 font-semibold mb-2">{error}</p>
            <button
              onClick={() => router.push('/chats')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium cursor-pointer"
            >
              Return to Chats Dashboard
            </button>
          </div>
        ) : (
          <ChatWindow
            conversation={activeConversation}
            onBack={() => router.push('/chats')}
          />
        )}
      </main>

      {/* Search Modal */}
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

export default function ChatConversationPage() {
  return (
    <Suspense fallback={<LoadingState message="Connecting to secure chat..." />}>
      <ChatConversationContent />
    </Suspense>
  );
}
