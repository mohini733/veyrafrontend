'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  MessageSquare,
  MessageCircle,
  Users,
  Check,
  CheckCheck,
  ShieldCheck,
  Sparkles,
  Loader2,
  UserCheck,
  Edit3,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import { getCustomContactName } from '../lib/contacts';
import EditContactModal from './EditContactModal';
import DeleteChatModal from './DeleteChatModal';

export const ChatList = ({
  conversations = [],
  loading = false,
  onOpenSearch,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'contacts'
  const [filter, setFilter] = useState('');
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [startingChatId, setStartingChatId] = useState(null);
  const [customNamesTick, setCustomNamesTick] = useState(0);
  const [editingContact, setEditingContact] = useState(null);
  const [deletingConv, setDeletingConv] = useState(null);
  const { user: currentUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Listen for custom contact name changes across the app
  useEffect(() => {
    const handleUpdate = () => setCustomNamesTick((t) => t + 1);
    window.addEventListener('veyra_contact_updated', handleUpdate);
    return () => window.removeEventListener('veyra_contact_updated', handleUpdate);
  }, []);

  // Load registered contacts
  useEffect(() => {
    let isMounted = true;
    const fetchContacts = async () => {
      try {
        setLoadingContacts(true);
        const { data } = await api.get('/users');
        if (isMounted && data.success && Array.isArray(data.users)) {
          setContacts(data.users);
        }
      } catch (err) {
        console.error('Failed to load registered contacts:', err);
      } finally {
        if (isMounted) setLoadingContacts(false);
      }
    };

    fetchContacts();

    // Auto-refresh contacts every 8 seconds in background
    const interval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const { data } = await api.get('/users');
        if (isMounted && data.success && Array.isArray(data.users)) {
          setContacts(data.users);
        }
      } catch (e) {}
    }, 8000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Helper to extract conversation partner
  const getPartner = (conversation) => {
    if (!conversation?.participants) return null;
    return (
      conversation.participants.find(
        (p) => p?._id?.toString() !== currentUser?._id?.toString()
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

  // Total unread messages count across all conversations
  const totalUnreadCount = conversations.reduce(
    (acc, curr) => acc + (curr.unreadCount || 0),
    0
  );

  const filteredConversations = conversations.filter((c) => {
    const partner = getPartner(c);
    if (!partner) return false;
    const displayName = getCustomContactName(partner._id, partner.name);
    const matchName =
      displayName?.toLowerCase().includes(filter.toLowerCase()) ||
      partner.name?.toLowerCase().includes(filter.toLowerCase());
    const matchPhone = partner.phone?.includes(filter);
    return matchName || matchPhone;
  });

  const filteredContacts = contacts.filter((u) => {
    const displayName = getCustomContactName(u._id, u.name);
    const matchName =
      displayName?.toLowerCase().includes(filter.toLowerCase()) ||
      u.name?.toLowerCase().includes(filter.toLowerCase());
    const matchPhone = u.phone?.includes(filter);
    return matchName || matchPhone;
  });

  const handleStartChatWithContact = async (recipientId) => {
    try {
      setStartingChatId(recipientId);
      const { data } = await api.post('/messages/conversations', { recipientId });
      if (data.success && data.conversation) {
        if (onRefresh) onRefresh();
        router.push(`/chat/${data.conversation._id}`);
      }
    } catch (err) {
      console.error('Failed to start chat with contact:', err);
    } finally {
      setStartingChatId(null);
    }
  };

  return (
    <div className="w-full md:w-80 lg:w-96 bg-[#0c1220] border-r border-slate-800/80 flex flex-col h-full shrink-0 select-none">
      {/* Header bar */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Messages
            {conversations.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-400 font-semibold border border-violet-500/20">
                {conversations.length}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400">Direct encrypted conversations</p>
        </div>
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="p-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 transition-all shadow-sm cursor-pointer"
            title="Start new conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs: Chats vs Registered Contacts */}
      <div className="flex border-b border-slate-800/80 bg-[#090d16]/80 px-2 pt-2 gap-1">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-t-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'chats'
              ? 'bg-[#0c1220] text-violet-400 border-t-2 border-violet-500 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Chats</span>
          {totalUnreadCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-violet-600 text-[10px] text-white font-bold animate-pulse">
              {totalUnreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-t-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'contacts'
              ? 'bg-[#0c1220] text-violet-400 border-t-2 border-violet-500 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Contacts</span>
          {contacts.length > 0 && (
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {contacts.length}
            </span>
          )}
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3 border-b border-slate-800/60">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={
              activeTab === 'chats'
                ? 'Filter chats by name or phone...'
                : 'Filter contacts by name or phone...'
            }
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#090d16] border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-mono"
          />
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 pb-24 md:pb-4">
        {/* ================= TAB 1: CHATS ================= */}
        {activeTab === 'chats' && (
          <>
            {loading && conversations.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400 animate-pulse">
                Loading conversations...
              </div>
            )}

            {!loading && filteredConversations.length === 0 && (
              <div className="p-6 text-center flex flex-col items-center justify-center text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-300">No active chats</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                  {filter
                    ? 'No conversations match your filter'
                    : 'Choose a registered member below to start chatting directly!'}
                </p>

                {/* Quick Start List from Registered Contacts */}
                {contacts.length > 0 && !filter && (
                  <div className="w-full mt-6 text-left">
                    <p className="text-[11px] font-bold text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Registered Members ({contacts.length})
                    </p>
                    <div className="space-y-1.5">
                      {contacts.slice(0, 5).map((contact) => (
                        <div
                          key={contact._id}
                          onClick={() => handleStartChatWithContact(contact._id)}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#131c31]/60 hover:bg-[#16223d] border border-slate-800 hover:border-violet-500/40 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative shrink-0">
                              <img
                                src={
                                  contact.avatar ||
                                  `https://api.dicebear.com/7.x/identicon/svg?seed=${contact.phone}`
                                }
                                alt={contact.name}
                                className="w-8 h-8 rounded-full object-cover border border-violet-500/20"
                              />
                              {contact.online && (
                                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-[#0c1220]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-200 truncate">
                                {getCustomContactName(contact._id, contact.name)}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {contact.phone}
                              </p>
                            </div>
                          </div>
                          <button
                            disabled={startingChatId === contact._id}
                            className="px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white text-[11px] font-semibold transition-all shrink-0 ml-2"
                          >
                            {startingChatId === contact._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Chat'
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {filteredConversations.map((conv) => {
              const partner = getPartner(conv);
              const displayName = getCustomContactName(partner?._id, partner?.name);
              const isActive = pathname === `/chat/${conv._id}`;
              const lastMsg = conv.lastMessage;
              const isLastMsgMine =
                lastMsg?.sender?.toString() === currentUser?._id?.toString() ||
                lastMsg?.sender?._id?.toString() === currentUser?._id?.toString();
              const unread = conv.unreadCount || 0;

              return (
                <Link
                  key={conv._id}
                  href={`/chat/${conv._id}`}
                  className={`group flex items-center gap-3.5 p-3.5 transition-all duration-150 cursor-pointer ${
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
                      alt={displayName || 'User'}
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
                            isActive
                              ? 'text-violet-200'
                              : unread > 0
                              ? 'text-white font-bold'
                              : 'text-slate-100'
                          }`}
                        >
                          {displayName || 'Veyra Member'}
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
                      <p
                        className={`text-xs truncate max-w-[190px] flex items-center gap-1 ${
                          unread > 0 ? 'text-slate-200 font-medium' : 'text-slate-400'
                        }`}
                      >
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

                      {/* Unread badge */}
                      {unread > 0 && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-violet-600 text-[10px] font-bold text-white shadow-sm shrink-0">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </>
        )}

        {/* ================= TAB 2: CONTACTS (REGISTERED MEMBERS) ================= */}
        {activeTab === 'contacts' && (
          <div className="p-3 space-y-2">
            <div className="px-1 py-1 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                All Members ({filteredContacts.length})
              </span>
              <span className="text-[10px] text-violet-400">Click to chat</span>
            </div>

            {loadingContacts && contacts.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Loading contacts...
              </div>
            )}

            {!loadingContacts && filteredContacts.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                {filter ? 'No contacts match filter' : 'No registered members found yet'}
              </div>
            )}

            {filteredContacts.map((contact) => (
              <div
                key={contact._id}
                onClick={() => handleStartChatWithContact(contact._id)}
                className="flex items-center justify-between p-3 rounded-xl bg-[#131c31]/50 hover:bg-[#16223d] border border-slate-800/80 hover:border-violet-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={
                        contact.avatar ||
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${contact.phone}`
                      }
                      alt={contact.name}
                      className="w-10 h-10 rounded-full object-cover border border-violet-500/20 group-hover:border-violet-400 transition-colors"
                    />
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0c1220]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-100 truncate group-hover:text-violet-300 transition-colors">
                        {getCustomContactName(contact._id, contact.name)}
                      </span>
                      {contact.isPhoneVerified && (
                        <ShieldCheck
                          className="w-3.5 h-3.5 text-violet-400 shrink-0"
                          title="Verified Phone"
                        />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono">{contact.phone}</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                      {contact.about || 'Available'}
                    </p>
                  </div>
                </div>

                <button
                  disabled={startingChatId === contact._id}
                  className="px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 text-xs font-semibold transition-all shrink-0 ml-2 shadow-sm"
                >
                  {startingChatId === contact._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Chat'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Contact Modal */}
      <EditContactModal
        isOpen={Boolean(editingContact)}
        onClose={() => setEditingContact(null)}
        contact={editingContact}
        contactId={editingContact?.id || editingContact?._id}
        currentName={editingContact?.name}
        phone={editingContact?.phone}
        onSaved={() => {
          setCustomNamesTick((t) => t + 1);
          if (onRefresh) onRefresh();
        }}
        onUpdated={() => {
          setCustomNamesTick((t) => t + 1);
          if (onRefresh) onRefresh();
        }}
      />

      {/* Delete Chat Modal */}
      <DeleteChatModal
        isOpen={Boolean(deletingConv)}
        onClose={() => setDeletingConv(null)}
        conversationId={deletingConv?.id}
        partnerName={deletingConv?.partnerName}
        onDeleted={() => {
          if (pathname === `/chat/${deletingConv?.id}`) {
            router.push('/chats');
          }
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
};

export default ChatList;
