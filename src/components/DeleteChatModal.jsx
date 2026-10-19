'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import api from '../lib/api';

export const DeleteChatModal = ({
  isOpen,
  onClose,
  conversationId,
  partnerName = 'this user',
  onDeleted,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !conversationId) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.delete(`/messages/${conversationId}`);
      if (data.success) {
        if (onDeleted) onDeleted(conversationId);
        onClose();
      } else {
        setError(data.message || 'Failed to delete conversation');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to delete conversation'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm bg-[#0f172a] border border-rose-500/30 rounded-3xl shadow-2xl shadow-rose-950/40 overflow-hidden flex flex-col p-6 text-center">
        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-white mb-1.5">Delete Chat?</h3>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Are you sure you want to delete this chat with{' '}
          <span className="font-semibold text-slate-200">{partnerName}</span>? All
          messages in this conversation will be permanently removed.
        </p>

        {error && <p className="mb-4 text-xs text-rose-400 font-medium">{error}</p>}

        <div className="flex items-center justify-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteChatModal;
