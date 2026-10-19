'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  Phone,
  MessageCircle,
  Radio,
  Edit3,
  Calendar,
  Copy,
  Check,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../lib/api';
import AppSidebar from '../../../components/AppSidebar';
import LoadingState from '../../../components/LoadingState';
import EditContactModal from '../../../components/EditContactModal';
import { getCustomContactName } from '../../../lib/contacts';

function UserPublicProfileContent() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, isAuthenticated, loading: authLoading } = useAuth();

  const userId = params?.id;
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');

  // Protect route
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch partner profile data
  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get(`/users/${userId}`);
        if (isMounted && data.success && data.user) {
          setProfileUser(data.user);
          setDisplayName(
            getCustomContactName(data.user._id, data.user.name, data.user.phone)
          );
        } else {
          setError('User profile not found');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load user profile');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Live custom contact name sync
  useEffect(() => {
    const handleUpdate = () => {
      if (profileUser) {
        setDisplayName(
          getCustomContactName(profileUser._id, profileUser.name, profileUser.phone)
        );
      }
    };
    window.addEventListener('veyra_contact_updated', handleUpdate);
    return () => window.removeEventListener('veyra_contact_updated', handleUpdate);
  }, [profileUser]);

  const handleCopyPhone = () => {
    if (!profileUser?.phone) return;
    navigator.clipboard?.writeText(profileUser.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartChat = async () => {
    if (!profileUser?._id) return;
    try {
      const { data } = await api.post('/messages/conversations', {
        recipientId: profileUser._id,
      });
      if (data.success && data.conversation) {
        router.push(`/chat/${data.conversation._id}`);
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
      router.push('/chats');
    }
  };

  if (authLoading || loading) {
    return <LoadingState message="Loading member profile..." />;
  }

  if (error || !profileUser) {
    return (
      <div className="flex h-screen w-screen bg-[#090d16] text-white overflow-hidden">
        <AppSidebar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
            <UserIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Profile Not Available</h2>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            {error || 'This user profile could not be loaded or may have been deleted.'}
          </p>
          <button
            onClick={() => router.push('/chats')}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Return to Messages
          </button>
        </main>
      </div>
    );
  }

  const isSelf = profileUser._id?.toString() === currentUser?._id?.toString();

  return (
    <div className="flex h-screen w-screen bg-[#090d16] text-white overflow-hidden">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-3xl mx-auto pb-24 md:pb-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Contact Profile</h1>
              <p className="text-xs text-slate-400">Verified member details & actions</p>
            </div>
          </div>

          {!isSelf && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Edit contact name"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Name</span>
            </button>
          )}
        </div>

        {/* Profile Card Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-xl mb-6 text-center relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Avatar */}
          <div className="relative inline-block mx-auto mb-4">
            <img
              src={
                profileUser.avatar ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${profileUser.phone}`
              }
              alt={displayName || profileUser.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-violet-500/30 shadow-2xl bg-slate-800 mx-auto"
            />
            {profileUser.online && (
              <span
                className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-[#0c1220]"
                title="Online"
              />
            )}
          </div>

          {/* Display Name & Verification */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-white truncate max-w-xs sm:max-w-md">
              {displayName || profileUser.name}
            </h2>
            {profileUser.isPhoneVerified && (
              <ShieldCheck
                className="w-5 h-5 text-violet-400 shrink-0"
                title="Phone Verified"
              />
            )}
          </div>

          {/* Original name note if custom name is different */}
          {displayName && displayName !== profileUser.name && (
            <p className="text-xs text-slate-400 mb-2">
              Registered as <span className="text-slate-300 font-medium">{profileUser.name}</span>
            </p>
          )}

          {/* Online or Phone */}
          <p className="text-xs text-slate-400 font-mono mb-6">
            {profileUser.online ? (
              <span className="text-emerald-400 font-semibold">● Active Online</span>
            ) : (
              profileUser.phone
            )}
          </p>

          {/* Quick Action Buttons */}
          {!isSelf && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleStartChat}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
              </button>

              <button
                onClick={() => router.push(`/sms?phone=${encodeURIComponent(profileUser.phone)}`)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#131c31] hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                <Radio className="w-4 h-4 text-violet-400" />
                <span>Send SMS</span>
              </button>
            </div>
          )}
        </div>

        {/* Contact Info & Details */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-md divide-y divide-slate-800/80">
            {/* Phone Number */}
            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 pr-3">
                <div className="p-2 rounded-xl bg-violet-600/15 text-violet-400 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Phone Number</p>
                  <p className="text-sm font-semibold text-white font-mono truncate">
                    {profileUser.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCopyPhone}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Copy phone"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* About / Bio */}
            <div className="py-3.5 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-violet-600/15 text-violet-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">About / Status</p>
                <p className="text-sm text-slate-200 mt-0.5">
                  {profileUser.about || 'Hey there! I am using Veyra Chat.'}
                </p>
              </div>
            </div>

            {/* Member Since */}
            {profileUser.createdAt && (
              <div className="py-3.5 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-600/15 text-violet-400 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Joined Veyra</p>
                  <p className="text-sm text-slate-200 font-mono">
                    {new Date(profileUser.createdAt).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Contact Modal */}
      <EditContactModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        contact={profileUser}
        contactId={profileUser._id}
        currentName={profileUser.name}
        phone={profileUser.phone}
        avatar={profileUser.avatar}
        onSaved={(newName) => {
          setDisplayName(newName);
        }}
      />
    </div>
  );
}

export default function UserPublicProfilePage() {
  return (
    <Suspense fallback={<LoadingState message="Loading member profile..." />}>
      <UserPublicProfileContent />
    </Suspense>
  );
}
