'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both admin email and password');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid administrator credentials');
      }

      if (data.user?.role !== 'admin') {
        throw new Error('Access denied. Administrator privileges required.');
      }

      toast.success('Admin verified successfully!');
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Admin authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-x-hidden selection:bg-[#ff1a1a]/30">
      <Toaster richColors position="top-right" theme="dark" />

      {/* Background glow effects */}
      <div className="absolute top-[10%] left-[-10%] w-[550px] h-[550px] bg-[#ff1a1a]/15 blur-[180px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[50%] right-[-10%] w-[550px] h-[550px] bg-[#ff1a1a]/12 blur-[180px] rounded-full pointer-events-none z-0" />

      {/* Header */}
      <header className="relative z-20 w-full px-[5vw] lg:px-16 py-6 flex justify-between items-center border-b border-white/[0.06] bg-[#050505]/70 backdrop-blur-md">
        <Link href="/" className="flex items-center group">
          <Image
            src="/internx-logo-white.png"
            alt="internX Logo"
            className="h-8 lg:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            width={120}
            height={36}
            priority
          />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            Student Portal
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/70 hover:text-white transition-colors py-1.5 px-3.5 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.02]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Admin Form */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
        <div className="w-full max-w-md">
          <div className="bg-[#0e0e11]/90 border border-white/10 rounded-2xl p-7 sm:p-9 backdrop-blur-xl shadow-2xl relative">
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#ff1a1a]/30 bg-[#ff1a1a]/10 text-[#ff4d4d] text-xs font-semibold uppercase tracking-wider mb-4">
                <Shield className="w-3.5 h-3.5" />
                <span>Restricted Access</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                Admin Console Login
              </h1>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-sm mx-auto">
                Sign in with administrative credentials to manage course offerings, student registrations, and platform settings.
              </p>
            </div>

            {/* Quick Demo Autofill Hint */}
            <div className="mb-5 p-3 rounded-xl bg-[#ff1a1a]/10 border border-[#ff1a1a]/20 text-[11px] text-[#ff6666] flex items-center justify-between">
              <span>Demo Admin: admin@internx.com</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@internx.com');
                  setPassword('admin123');
                }}
                className="underline text-white font-semibold hover:text-[#ff9999] cursor-pointer"
              >
                Auto Fill
              </button>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    required
                    placeholder="admin@internx.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#ff1a1a] hover:bg-[#ff3333] active:bg-[#e60000] disabled:opacity-60 transition-all text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff1a1a]/30 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Admin...</span>
                  </>
                ) : (
                  <span>Access Admin Console</span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/[0.08] text-center text-xs text-white/50">
              Not an administrator?{' '}
              <Link href="/login" className="text-[#ff4d4d] hover:underline font-medium">
                Go to Student Portal
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
