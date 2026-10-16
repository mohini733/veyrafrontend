'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MessageSquare,
  Phone,
  Lock,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import api from '../../lib/api';
import { connectSocket } from '../../lib/socket';
import { useAuth } from '../../hooks/useAuth';

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get('phone') || '';

  const [phone, setPhone] = useState(initialPhone);
  const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Verify & Set New Password
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [devCode, setDevCode] = useState(null);

  const { updateUser } = useAuth();
  const router = useRouter();

  // Step 1: Send OTP to Phone
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter your registered phone number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const { data } = await api.post('/auth/forgot-password/send-otp', {
        phone: phone.trim(),
      });

      if (data.success) {
        setStep(2);
        if (data.devOtp) {
          setDevCode(data.devOtp);
          setOtp(data.devOtp);
        } else {
          setOtp('');
        }
        setSuccessMsg(data.message || `Verification code sent via SMS to ${phone}. Please check your phone messages.`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to send reset code. Please check your phone number.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password & Auto Sign In
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP code received on your phone');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data } = await api.post('/auth/forgot-password/reset', {
        phone: phone.trim(),
        otp: otp.trim(),
        newPassword,
      });

      if (data.success && data.token) {
        // Save session
        localStorage.setItem('veyra_token', data.token);
        localStorage.setItem('veyra_user', JSON.stringify(data.user));
        connectSocket(data.token);
        updateUser(data.user);

        setSuccessMsg('Password reset successfully! Redirecting to chats...');
        setTimeout(() => {
          router.push('/chats');
        }, 1200);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to reset password. Please verify the code and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-center items-center p-4 selection:bg-violet-600 selection:text-white">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/30 group-hover:scale-105 transition-all">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Veyra<span className="text-violet-400">Chat</span>
            </span>
          </Link>
          <h2 className="mt-4 text-xl font-bold text-white">Reset Your Password</h2>
          <p className="text-xs text-slate-400 mt-1">
            {step === 1
              ? 'Enter your phone number to receive an SMS verification code'
              : 'Enter the verification code and set your new password'}
          </p>
        </div>

        {/* Card Form */}
        <div className="p-8 rounded-3xl bg-[#0c1220]/90 border border-slate-800 shadow-2xl shadow-violet-950/40 backdrop-blur-md">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-300 text-xs shadow-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span className="leading-relaxed font-medium">{successMsg}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Phone Input */
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Registered Phone Number
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="e.g. 7015889571 or +91..."
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090d16] border border-slate-700/80 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  We will send a 6-digit SMS verification code to this mobile number.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !phone.trim()}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Send SMS Reset Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: OTP + New Password */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    6-Digit SMS Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[11px] text-violet-400 hover:underline"
                  >
                    Change Phone
                  </button>
                </div>
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter 6-digit code"
                    maxLength={8}
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090d16] border border-slate-700/80 text-white placeholder-slate-500 font-mono text-base tracking-widest focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  />
                </div>
                {devCode && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-300 text-xs flex items-center justify-between">
                    <span>
                      Code: <strong className="font-mono text-white text-sm tracking-wider">{devCode}</strong>
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                      Auto-filled
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090d16] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Re-enter new password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090d16] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !otp.trim() || !newPassword}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Reset Password & Sign In</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Links back to Login */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-violet-400 hover:underline font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
            <Link href="/signup" className="text-slate-400 hover:text-white">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400">
          Loading password recovery...
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
