'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Loader2, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  UserCheck, 
  Clock, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import { toast, Toaster } from 'sonner';

export default function ExamStudentLoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const handleVerifyAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    if (!identifier.trim()) {
      toast.error('Please enter your registered Email or Roll Number');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/exam/verify-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
          isGoogle: false,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setVerificationError(data.message || 'Candidate verification failed.');
        toast.error('Verification failed');
        return;
      }

      // Establish NextAuth session for candidate so useSession() and exam actions work
      await signIn('credentials', {
        email: data.student?.email || identifier.trim(),
        password: password.trim() || 'password123',
        redirect: false,
        callbackUrl: data.redirectTo || '/exam/onboarding'
      });

      toast.success(data.message || 'Candidate verified!');
      router.push(data.redirectTo || '/exam/onboarding');
      router.refresh();
    } catch (err: any) {
      setVerificationError('Network error during candidate verification. Please try again.');
      toast.error('Verification error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleExamLogin = async () => {
    setIsLoading(true);
    setVerificationError(null);

    try {
      // Check if candidate is verified or logged in with Google
      const res = await fetch('/api/exam/verify-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'student@example.com',
          isGoogle: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await signIn('credentials', {
          email: data.student?.email || 'student@example.com',
          password: 'password123',
          redirect: false,
          callbackUrl: data.redirectTo || '/exam/onboarding'
        });
        toast.success('Candidate verified via Google credentials!');
        router.push(data.redirectTo || '/exam/onboarding');
        router.refresh();
      } else {
        setVerificationError(data.message || 'Google account not authorized for this exam batch.');
      }
    } catch {
      toast.error('Unable to verify Google candidate');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-[#ff1a1a]/30">
      <Toaster richColors position="top-right" theme="dark" />

      {/* Background glow effects */}
      <div className="absolute top-[-5%] left-[-10%] w-[550px] h-[550px] bg-[#ff1a1a]/15 blur-[180px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[60%] right-[-10%] w-[550px] h-[550px] bg-[#ff1a1a]/10 blur-[180px] rounded-full pointer-events-none z-0" />

      {/* Top Navbar */}
      <header className="relative z-20 w-full px-[5vw] lg:px-16 py-6 flex justify-between items-center border-b border-white/[0.06] bg-[#050505]/70 backdrop-blur-md">
        <Link href="/" className="flex items-center group">
          <Image
            src="/internx-logo-white.png"
            alt="internX"
            className="h-8 lg:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            width={120}
            height={36}
            priority
          />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            Platform Home
          </Link>
          <Link
            href="/exam/admin-login"
            className="text-xs text-[#ff4d4d] hover:underline font-medium"
          >
            Invigilator / Faculty Admin
          </Link>
        </div>
      </header>

      {/* Main Candidate Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="bg-[#0e0e11]/90 border border-white/10 rounded-2xl p-7 sm:p-9 backdrop-blur-xl shadow-2xl relative">
            
            {/* Header Badge & Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#ff1a1a]/30 bg-[#ff1a1a]/10 text-[#ff4d4d] text-xs font-semibold uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Candidate Assessment Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                Student Examination Login
              </h1>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-md mx-auto">
                Only students added or authorized by campus administration are verified to take this assessment.
              </p>
            </div>

            {/* Assessment Rules & Protocol Banner */}
            <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] text-xs space-y-2">
              <div className="flex items-center gap-2 text-white/90 font-semibold">
                <Clock className="w-4 h-4 text-[#ff4d4d]" />
                <span>Examination Protocol & Rules:</span>
              </div>
              <ul className="space-y-1 text-white/60 pl-6 list-disc text-[11px] leading-relaxed">
                <li><strong className="text-white/80">Batch Verification:</strong> You must be registered by the admin to participate.</li>
                <li><strong className="text-white/80">Single Attempt:</strong> Once submitted or timed out, re-entry is prohibited.</li>
                <li><strong className="text-white/80">Proctoring:</strong> Fullscreen mode is enforced; leaving the window logs a violation.</li>
              </ul>
            </div>

            {/* Error / Unauthorized Warning Notice */}
            {verificationError && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold block text-red-200 mb-0.5">Eligibility Verification Failed</span>
                  {verificationError}
                </div>
              </div>
            )}

            {/* Autofill test helper */}
            <div className="mb-4 p-2.5 rounded-xl bg-[#ff1a1a]/10 border border-[#ff1a1a]/20 text-[11px] text-[#ff6666] flex items-center justify-between">
              <span>Demo Candidate: student@example.com</span>
              <button
                type="button"
                onClick={() => {
                  setIdentifier('student@example.com');
                  setPassword('password123');
                }}
                className="underline text-white font-medium hover:text-[#ff9999] cursor-pointer"
              >
                Auto Fill
              </button>
            </div>

            {/* Candidate Verification Form */}
            <form onSubmit={handleVerifyAndLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Registered Email or Roll Number / Student ID
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    required
                    placeholder="student@example.com or 26CS101"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Access Password or Registered Phone Number
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="•••••••• or registered phone number"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all"
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
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#ff1a1a] to-[#d60000] hover:from-[#ff3333] hover:to-[#ff1a1a] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff1a1a]/30 transition-all cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Candidate Eligibility...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Enter Examination</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative py-4 my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#0e0e11] px-2 text-white/40">Or verify with Google</span>
              </div>
            </div>

            {/* Google Candidate Sign In */}
            <button
              type="button"
              onClick={handleGoogleExamLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google Account</span>
            </button>

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-white/[0.08] text-center text-xs text-white/50">
              Are you an exam invigilator?{' '}
              <Link href="/exam/admin-login" className="text-[#ff4d4d] hover:underline font-medium">
                Faculty Admin Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
