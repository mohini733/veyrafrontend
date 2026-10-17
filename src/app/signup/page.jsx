'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageSquare, User, Phone, Lock, FileText, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

function SignupForm() {
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get('phone') || '';

  const [formData, setFormData] = useState({
    name: '',
    phone: initialPhone,
    password: '',
    about: 'Hey there! I am using Veyra Chat.',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialPhone && !formData.phone) {
      setFormData((prev) => ({ ...prev, phone: initialPhone }));
    }
  }, [initialPhone]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim() || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await signup(formData);
      router.push('/chats');
    } catch (err) {
      const rawMsg = err.response?.data?.message || err.message || '';
      if (!err.response && (err.message === 'Network Error' || err.code === 'ERR_NETWORK')) {
        setError('Cannot reach server. Please ensure the backend is running on port 5000 and MongoDB is active.');
      } else if (rawMsg.includes('ECONNREFUSED') || rawMsg.includes('127.0.0.1:27017')) {
        setError('Cannot connect to database. Please make sure MongoDB service is running on your machine (port 27017).');
      } else {
        setError(
          rawMsg ||
          'Failed to register. Please check your phone format (e.g. +919876543210).'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-center items-center p-4 selection:bg-violet-600 selection:text-white">
      {/* Background ambient light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/30 group-hover:scale-105 transition-all">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Veyra<span className="text-violet-400">Chat</span>
            </span>
          </Link>
          <h2 className="mt-4 text-xl font-bold text-white">Create your Veyra account</h2>
          <p className="text-xs text-slate-400 mt-1">
            Join the secure real-time messaging network
          </p>
        </div>

        {/* Card Form */}
        <div className="p-8 rounded-3xl bg-[#0c1220]/90 border border-slate-800 shadow-2xl shadow-violet-950/40 backdrop-blur-md">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col gap-2.5 text-rose-300 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed">{error}</span>
              </div>
              {error.toLowerCase().includes('already registered') && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-500/20">
                  <Link
                    href={`/login?phone=${encodeURIComponent(formData.phone)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all shadow-sm shadow-violet-600/30"
                  >
                    <span>Sign in with this number</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/forgot-password?phone=${encodeURIComponent(formData.phone)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Full Name *
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090d16] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                International Phone Number *
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+919876543210"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090d16] border border-slate-700/80 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Must include country code (e.g. +91 for India, +1 for US).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password *
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090d16] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Status / About
              </label>
              <div className="relative flex items-center">
                <FileText className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  placeholder="Hey there! I am using Veyra Chat."
                  maxLength={140}
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
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to login */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-violet-400 hover:underline font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400">
          Loading registration...
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
