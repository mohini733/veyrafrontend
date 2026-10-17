'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Plus, MessageSquare, Check, CheckCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const ChatList = ({ conversations = [], loading = false, onOpenSearch }) => {
  const [filter, setFilter] = useState('');
  const { user: currentUser } = useAuth();
  const pathname = usePathname();

  // Helper to extract conversation partner
  const getPartner = (conversation) => {
    if (!conversation.participants) return null;
    return (
      conversation.participants.find(
        (p) => p._id?.toString() !== currentUser?._id?.toString()
      ) || conversation.participants[0]
    );
  };

  // Helper to format timestamps
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter((c) => {
    const partner = getPartner(c);
    if (!partner) return false;
    const matchName = partner.name?.toLowerCase().includes(filter.toLowerCase());
    const matchPhone = partner.phone?.includes(filter);
    return matchName || matchPhone;
  });

  return (
    <div className="w-full md:w-80 lg:w-96 bg-[#0c1220] border-r border-slate-800/80 flex flex-col h-full shrink-0 select-none">
      {/* Header bar */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Messages
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-400 font-semibold border border-violet-500/20">
              {conversations.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400">Direct encrypted conversations</p>
        </div>
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="p-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 transition-all shadow-sm"
            title="Start new conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3 border-b border-slate-800/60">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter chats by name or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#090d16] border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
          />
        </div>
      </div>

      {/* Conversations Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 pb-24 md:pb-4">
        {loading && (
          <div className="p-6 text-center text-xs text-slate-400 animate-pulse">
            Loading conversations...
          </div>
        )}

        {!loading && filteredConversations.length === 0 && (
          <div className="p-8 text-center flex flex-col items-center justify-center h-64 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No chats found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              {filter
                ? 'No conversations match your filter'
                : 'Start a new chat by searching a registered phone number'}
            </p>
            {onOpenSearch && !filter && (
              <button
                onClick={onOpenSearch}
                className="mt-4 px-3.5 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 text-xs font-medium transition-all"
              >
                + New Conversation
              </button>
            )}
          </div>
        )}

        {!loading &&
          filteredConversations.map((conv) => {
            const partner = getPartner(conv);
            const isActive = pathname === `/chat/${conv._id}`;
            const lastMsg = conv.lastMessage;
            const isLastMsgMine =
              lastMsg?.sender?.toString() === currentUser?._id?.toString() ||
              lastMsg?.sender?._id?.toString() === currentUser?._id?.toString();

            return (
              <Link
                key={conv._id}
                href={`/chat/${conv._id}`}
                className={`flex items-center gap-3.5 p-3.5 transition-all duration-150 ${
                  isActive
                    ? 'bg-violet-600/15 border-l-4 border-violet-500 shadow-inner'
                    : 'hover:bg-[#111827]/70'
                }`}
              >
                {/* Avatar with live status indicator */}
                <div className="relative shrink-0">
                  <img
                    src={
                      partner?.avatar ||
                      `https://api.dicebear.com/7.x/identicon/svg?seed=${partner?.phone}`
                    }
                    alt={partner?.name || 'User'}
                    className="w-12 h-12 rounded-full bg-slate-800 object-cover border border-violet-500/20"
                  />
                  {partner?.online && (
                    <span
                      className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0c1220]"
                      title="Online"
                    />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className={`text-sm font-semibold truncate ${
                          isActive ? 'text-violet-200' : 'text-slate-100'
                        }`}
                      >
                        {partner?.name || 'Veyra Member'}
                      </span>
                      {partner?.isPhoneVerified && (
                        <ShieldCheck
                          className="w-3.5 h-3.5 text-violet-400 shrink-0"
                          title="Verified Phone"
                        />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                      {formatTime(conv.lastMessageAt || conv.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 truncate max-w-[190px] flex items-center gap-1">
                      {isLastMsgMine && (
                        <span className="shrink-0 text-violet-400">
                          {lastMsg?.status === 'read' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-violet-400" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </span>
                      )}
                      <span>{lastMsg?.text || partner?.about || 'Conversation started'}</span>
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
};

export default ChatList;
