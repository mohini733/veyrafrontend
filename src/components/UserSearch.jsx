'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Phone,
  MessageCircle,
  Radio,
  ShieldCheck,
  Loader2,
  UserPlus,
  Users,
  Sparkles,
} from 'lucide-react';
import api from '../lib/api';

export const UserSearch = ({ isOpen, onClose, onConversationStarted }) => {
  const [query, setQuery] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [startingChatId, setStartingChatId] = useState(null);
  const router = useRouter();

  // Load all registered users when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchAllMembers = async () => {
      try {
        setLoadingInitial(true);
        const { data } = await api.get('/users');
        if (isMounted && data.success && Array.isArray(data.users)) {
          setAllUsers(data.users);
        }
      } catch (err) {
        console.error('Failed to load registered users:', err);
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    };

    fetchAllMembers();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query || query.trim().length < 2) {
      setError('Please enter at least 2 characters or digits');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSearched(true);
      const encoded = encodeURIComponent(query.trim());
      const { data } = await api.get(`/users/search?phone=${encoded}&q=${encoded}`);
      setResults(data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search users');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (recipientId) => {
    try {
      setStartingChatId(recipientId);
      const { data } = await api.post('/messages/conversations', { recipientId });
      if (data.success && data.conversation) {
        onClose();
        if (onConversationStarted) {
          onConversationStarted(data.conversation);
        } else {
          router.push(`/chat/${data.conversation._id}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start conversation');
    } finally {
      setStartingChatId(null);
    }
  };

  // Dynamically filter all users if user is typing
  const liveFilteredUsers = query.trim()
    ? allUsers.filter((u) => {
        const q = query.toLowerCase();
        return (
          u.name?.toLowerCase().includes(q) ||
          u.phone?.replace(/[^\d]/g, '').includes(query.replace(/[^\d]/g, ''))
        );
      })
    : allUsers;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-violet-500/30 rounded-2xl shadow-2xl shadow-violet-950/60 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131c31]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Registered Contacts</h3>
              <p className="text-xs text-slate-400">
                Click any member to chat or search by name / phone number
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="p-6 pb-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearched(false);
              }}
              placeholder="Search name or phone number (+91...)"
              autoFocus
              className="w-full pl-11 pr-24 py-3 rounded-xl bg-[#090d16] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-mono text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
        </form>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2.5">
          {loading && (
            <div className="py-10 text-center">
              <Loader2 className="w-7 h-7 mx-auto animate-spin text-violet-400 mb-2" />
              <p className="text-xs text-slate-400">Searching Veyra directory...</p>
            </div>
          )}

          {/* Explicit Search Results */}
          {!loading && searched && results.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Found {results.length} Member{results.length > 1 ? 's' : ''}
              </p>
              {results.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#131c31]/70 border border-slate-800/80 hover:border-violet-500/40 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={
                          u.avatar ||
                          `https://api.dicebear.com/7.x/identicon/svg?seed=${u.phone}`
                        }
                        alt={u.name}
                        className="w-11 h-11 rounded-full bg-slate-800 object-cover border border-violet-500/20"
                      />
                      {u.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#131c31]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-100 text-sm truncate">
                          {u.name}
                        </span>
                        {u.isPhoneVerified && (
                          <ShieldCheck
                            className="w-4 h-4 text-violet-400 shrink-0"
                            title="Verified Phone"
                          />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{u.phone}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">
                        {u.about}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartChat(u._id)}
                    disabled={startingChatId === u._id}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition-all shrink-0 ml-3 shadow-md shadow-violet-900/30 cursor-pointer"
                  >
                    {startingChatId === u._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        Chat
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Fallback / All Registered Users view (when not submitting search or query empty) */}
          {!loading && !searched && (
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-violet-400" />
                  {query.trim()
                    ? `Matching Members (${liveFilteredUsers.length})`
                    : `All Registered Members (${allUsers.length})`}
                </span>
                <span className="text-[11px] text-violet-400">1-Click to Chat</span>
              </div>

              {loadingInitial && allUsers.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                  Loading registered members...
                </div>
              )}

              {!loadingInitial && liveFilteredUsers.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500">
                  No members match your input. Press Enter or click Search for deep server lookup.
                </div>
              )}

              {liveFilteredUsers.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#131c31]/60 border border-slate-800/80 hover:border-violet-500/40 transition-all hover:bg-[#16223d]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={
                          u.avatar ||
                          `https://api.dicebear.com/7.x/identicon/svg?seed=${u.phone}`
                        }
                        alt={u.name}
                        className="w-10 h-10 rounded-full bg-slate-800 object-cover border border-violet-500/20"
                      />
                      {u.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#131c31]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-100 text-sm truncate">
                          {u.name}
                        </span>
                        {u.isPhoneVerified && (
                          <ShieldCheck
                            className="w-3.5 h-3.5 text-violet-400 shrink-0"
                            title="Verified Phone"
                          />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{u.phone}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {u.about || 'Available'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartChat(u._id)}
                    disabled={startingChatId === u._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 rounded-xl text-xs font-semibold transition-all shrink-0 ml-3 cursor-pointer shadow-sm"
                  >
                    {startingChatId === u._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <MessageCircle className="w-3.5 h-3.5" />
                        Chat
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* No user found on explicit search */}
          {!loading && searched && results.length === 0 && (
            <div className="py-8 text-center px-4 rounded-xl bg-[#131c31]/30 border border-dashed border-slate-800">
              <Search className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-200">No Veyra user found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                No registered account with phone <span className="font-mono text-violet-300">{query}</span>.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    onClose();
                    router.push(`/sms?to=${encodeURIComponent(query)}`);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-medium transition-all cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-indigo-400" />
                  Send External SMS via MSG91
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
