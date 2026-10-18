'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageSquare, Phone, Lock, ArrowRight, Loader2, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get('phone') || '';

  const [phone, setPhone] = useState(initialPhone);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const isExpired = searchParams.get('expired') === 'true';

  useEffect(() => {
    if (initialPhone && !phone) {
      setPhone(initialPhone);
    }
  }, [initialPhone]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone.trim() || !password) {
      setError('Please provide both your phone number and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(phone.trim(), password);
      router.push('/chats');
    } catch (err) {
      if (!err.response && (err.message === 'Network Error' || err.code === 'ERR_NETWORK')) {
        setError('Cannot reach server. Please ensure the backend is running on port 5000 and MongoDB is active.');
      } else {
        setError(
          err.response?.data?.message ||
          (err.response?.status === 404
            ? 'Endpoint not ready or route compiling. Please try again in a moment.'
            : err.message || 'Invalid credentials. Please verify your phone and password.')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-center items-center p-4 selection:bg-violet-600 selection:text-white">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-violet-600/30 group-hover:scale-105 transition-all border border-violet-500/30 bg-slate-800 shrink-0">
              <img
                src="/images/iconlogo.jpeg"
                alt="Veyra Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Veyra<span className="text-violet-400">Chat</span>
            </span>
          </Link>
          <h2 className="mt-4 text-xl font-bold text-white">Welcome back</h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to access your direct encrypted chats
          </p>
        </div>

        {/* Card Form */}
        <div className="p-8 rounded-3xl bg-[#0c1220]/90 border border-slate-800 shadow-2xl shadow-violet-950/40 backdrop-blur-md">
          {isExpired && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-400 text-xs">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Your session expired. Please sign in again to resume messaging.</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col gap-2.5 text-rose-300 text-xs shadow-sm">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
              {error.toLowerCase().includes('register') && (
                <div className="pt-2 border-t border-rose-500/20 flex justify-end">
                  <Link
                    href={`/signup?phone=${encodeURIComponent(phone || '')}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md shadow-violet-900/30 transition-all hover:scale-[1.02]"
                  >
                    <span>Create Account Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
              {error.toLowerCase().includes('password') && (
                <div className="pt-2 border-t border-rose-500/20 flex justify-end">
                  <Link
                    href={`/forgot-password?phone=${encodeURIComponent(phone || '')}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md shadow-violet-900/30 transition-all hover:scale-[1.02]"
                  >
                    <span>Reset Password via OTP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Phone Number
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
                  placeholder="+919876543210"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090d16] border border-slate-700/80 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href={`/forgot-password?phone=${encodeURIComponent(phone || '')}`}
                  className="text-[11px] text-violet-400 hover:text-violet-300 hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090d16] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Signup */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account yet?{' '}
              <Link href="/signup" className="text-violet-400 hover:underline font-semibold">
                Register free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400">
          Loading sign in...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
