'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import api from '../lib/api';

export const UserSearch = ({ isOpen, onClose, onConversationStarted }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [startingChatId, setStartingChatId] = useState(null);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query || query.trim().length < 3) {
      setError('Please enter at least 3 digits of the phone number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSearched(true);
      const { data } = await api.get(`/users/search?phone=${encodeURIComponent(query.trim())}`);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-violet-500/30 rounded-2xl shadow-2xl shadow-violet-950/50 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131c31]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Find Registered Users</h3>
              <p className="text-xs text-slate-400">
                Search by international phone number (e.g., +919876543210)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="p-6 pb-4">
          <div className="relative flex items-center">
            <Phone className="absolute left-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter phone number (+91...)"
              autoFocus
              className="w-full pl-11 pr-24 py-3 rounded-xl bg-[#090d16] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-mono text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-all"
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

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Found {results.length} Member{results.length > 1 ? 's' : ''}
              </p>
              {results.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#131c31]/70 border border-slate-800/80 hover:border-violet-500/40 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={
                          user.avatar ||
                          `https://api.dicebear.com/7.x/identicon/svg?seed=${user.phone}`
                        }
                        alt={user.name}
                        className="w-11 h-11 rounded-full bg-slate-800 object-cover border border-violet-500/20"
                      />
                      {user.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#131c31]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-100 text-sm truncate">
                          {user.name}
                        </span>
                        {user.isPhoneVerified && (
                          <ShieldCheck
                            className="w-4 h-4 text-violet-400 shrink-0"
                            title="Verified Phone"
                          />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{user.phone}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">
                        {user.about}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartChat(user._id)}
                    disabled={startingChatId === user._id}
                    className="flex items-center gap-1.5 px-3 py-2 bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 rounded-xl text-xs font-semibold transition-all shrink-0 ml-3"
                  >
                    {startingChatId === user._id ? (
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-medium transition-all"
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
