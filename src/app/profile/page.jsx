'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Edit3,
  Check,
  Loader2,
  Calendar,
  Sparkles,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import AppSidebar from '../../components/AppSidebar';
import LoadingState from '../../components/LoadingState';

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, updateUser, refreshUser } = useAuth();
  const router = useRouter();

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [about, setAbout] = useState(user?.about || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // OTP Verification State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpFeedback, setOtpFeedback] = useState(null);

  // Sync profile data when user changes
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAbout(user.about || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return <LoadingState message="Loading profile..." />;
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setMessage('');
      const { data } = await api.put('/users/profile', {
        name,
        about,
        avatar,
      });

      if (data.success) {
        updateUser(data.user);
        setMessage('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      setVerifyingOtp(true);
      setOtpFeedback(null);
      const { data } = await api.post('/sms/send-otp');
      setOtpSent(true);
      setOtpCode('');
      setOtpFeedback({
        type: 'success',
        text: data.message || `Verification code sent via SMS to ${user?.phone}. Please check your phone messages.`,
      });
    } catch (err) {
      setOtpFeedback({
        type: 'error',
        text:
          err.response?.data?.message ||
          'SMS Gateway not connected. Please enter your Fast2SMS or MSG91 API Key in Settings to send real SMS.',
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    try {
      setVerifyingOtp(true);
      const { data } = await api.post('/sms/verify-otp', { otp: otpCode.trim() });
      if (data.success) {
        setOtpFeedback({
          type: 'success',
          text: 'Phone verified successfully with real provider!',
        });
        await refreshUser();
        setOtpSent(false);
        setOtpCode('');
      }
    } catch (err) {
      setOtpFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Invalid or expired OTP code',
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const avatarSeeds = ['Felix', 'Luna', 'VeyraNova', 'Cipher', 'Vortex', 'Echo'];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-white">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto">
        {/* Header navigation */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/chats')}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Return to chats"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">User Profile</h1>
              <p className="text-xs text-slate-400">Manage identity, status, and verification</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 text-xs font-semibold transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar and Quick Overview Card */}
          <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 flex flex-col items-center text-center shadow-lg">
            <div className="relative mb-4">
              <img
                src={
                  avatar ||
                  user?.avatar ||
                  `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.phone}`
                }
                alt={user?.name}
                className="w-28 h-28 rounded-full bg-slate-800 object-cover border-2 border-violet-500/40 shadow-md shadow-violet-900/30"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0c1220]" />
            </div>

            <h2 className="text-lg font-bold text-white">{user?.name}</h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{user?.phone}</p>

            {/* Verification Status Badge */}
            <div className="mt-4 w-full pt-4 border-t border-slate-800/80">
              {user?.isPhoneVerified ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Phone Verified</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Unverified Phone</span>
                </div>
              )}
            </div>

            {/* Quick avatar picker when editing */}
            {isEditing && (
              <div className="mt-4 pt-4 border-t border-slate-800 w-full text-left">
                <p className="text-[11px] font-semibold text-slate-400 mb-2 uppercase">
                  Choose Avatar Style:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {avatarSeeds.map((seed) => {
                    const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                    return (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => setAvatar(url)}
                        className={`p-1 rounded-xl border ${
                          avatar === url ? 'border-violet-500 bg-violet-600/20' : 'border-slate-800'
                        } hover:border-violet-400 transition-colors`}
                      >
                        <img src={url} alt={seed} className="w-10 h-10 mx-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Details & Form Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-lg">
              <h3 className="text-base font-bold text-white mb-4">Account Details</h3>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-[#090d16] border border-slate-700 text-white text-sm focus:border-violet-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                      Status / About
                    </label>
                    <textarea
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      maxLength={140}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#090d16] border border-slate-700 text-white text-sm focus:border-violet-500 outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-violet-600/30"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider block">Full Name</span>
                    <span className="font-semibold text-slate-100">{user?.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider block">Phone Number</span>
                    <span className="font-mono text-slate-200">{user?.phone}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider block">Status Bio</span>
                    <span className="text-slate-300 italic">{user?.about || 'No status bio set.'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Provider-Backed Carrier Phone Verification Card */}
            <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-lg">
              <div className="flex items-center gap-2.5 mb-2">
                <KeyRound className="w-5 h-5 text-violet-400" />
                <h3 className="text-base font-bold text-white">Carrier Phone Verification</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                To combat impersonation and spam, phone verification requires authentic provider-backed SMS OTP delivery.
              </p>

              {user?.isPhoneVerified ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    Your phone number {user?.phone} is verified and trusted on the Veyra network.
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {otpFeedback && (
                    <div
                      className={`p-3.5 rounded-xl text-xs ${
                        otpFeedback.type === 'success'
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                      }`}
                    >
                      {otpFeedback.text}
                    </div>
                  )}

                  {!otpSent ? (
                    <button
                      onClick={handleSendOtp}
                      disabled={verifyingOtp}
                      className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-violet-600/30 transition-all"
                    >
                      {verifyingOtp ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <KeyRound className="w-4 h-4" />
                      )}
                      <span>Request Carrier SMS OTP ({user?.phone})</span>
                    </button>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="Enter 4-6 digit OTP"
                          maxLength={8}
                          className="px-4 py-2.5 rounded-xl bg-[#090d16] border border-slate-700 text-white font-mono text-sm focus:border-violet-500 outline-none"
                        />
                        <button
                          type="submit"
                          disabled={verifyingOtp || !otpCode.trim()}
                          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold disabled:opacity-50"
                        >
                          {verifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Code'}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-xs text-violet-400 hover:underline"
                      >
                        Resend OTP code
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
