'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../lib/api';
import AppSidebar from '../../../components/AppSidebar';
import ChatList from '../../../components/ChatList';
import ChatWindow from '../../../components/ChatWindow';
import UserSearch from '../../../components/UserSearch';
import LoadingState from '../../../components/LoadingState';

function ChatConversationContent() {
  const { id } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Route protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch all user conversations
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/messages/conversations');
        if (data.success) {
          const list = data.conversations || [];
          setConversations(list);

          const found = list.find((c) => c._id === id);
          if (found) {
            setActiveConversation(found);
          } else {
            // If not found in loaded list, attempt direct fetch
            try {
              const res = await api.get(`/messages/${id}`);
              if (res.data.success) {
                // Synthesize basic conversation or redirect if forbidden
                setActiveConversation({ _id: id, participants: [] });
              }
            } catch (err) {
              setError(err.response?.data?.message || 'Conversation not accessible');
            }
          }
        }
      } catch (err) {
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isAuthenticated]);

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return <LoadingState message="Connecting to secure chat session..." />;
  }

  return (
    <div className="flex h-[100dvh] h-screen w-screen overflow-hidden bg-[#090d16] text-white">
      {/* App Sidebar - always accessible */}
      <AppSidebar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Conversations List - Hidden on small mobile screens when active chat is shown */}
      <div className="hidden md:flex h-full">
        <ChatList
          conversations={conversations}
          loading={loading}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      </div>

      {/* Active Chat Window */}
      <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#090d16]">
            <p className="text-base text-rose-400 font-semibold mb-2">{error}</p>
            <button
              onClick={() => router.push('/chats')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium"
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
          setConversations((prev) => [newConv, ...prev.filter((c) => c._id !== newConv._id)]);
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
