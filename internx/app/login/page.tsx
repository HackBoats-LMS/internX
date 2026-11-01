'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { toast, Toaster } from 'sonner';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [isLoading, setIsLoading] = useState(false);

  // Handle Continue with Google
  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      // 1. Check if real Google OAuth credentials are configured in .env
      const statusRes = await fetch('/api/auth/google-status');
      const statusData = await statusRes.json().catch(() => ({ configured: false }));

      if (statusData.configured) {
        // Real Google OAuth is configured, proceed with standard Google flow
        await signIn('google', {
          callbackUrl: redirectPath,
        });
        return;
      }

      // 2. Google OAuth is not configured in .env. There is no longer an
      //    insecure silent-login fallback — inform the user instead.
      toast.error('Google sign-in is not configured yet. Please contact support or use your registered email to log in.');
      setIsLoading(false);
    } catch (err: any) {
      console.warn('Google login error:', err);
      toast.error('Unable to sign in with Google. Please try again later.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-x-hidden selection:bg-[#ff1a1a]/30">
      <Toaster richColors position="top-right" theme="dark" />

      {/* Glowing background ambiance */}
      <div className="absolute top-[15%] left-[-10%] w-[550px] h-[550px] bg-[#ff1a1a]/15 blur-[170px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[50%] right-[-10%] w-[550px] h-[550px] bg-[#ff1a1a]/12 blur-[170px] rounded-full pointer-events-none z-0" />

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
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/70 hover:text-white transition-colors py-1.5 px-3.5 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.02]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Login Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
        <div className="w-full max-w-md">
          <div className="bg-[#0e0e11]/90 border border-white/10 rounded-2xl p-7 sm:p-9 backdrop-blur-xl shadow-2xl relative text-center">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#ff1a1a]/30 bg-[#ff1a1a]/10 text-[#ff4d4d] text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Sign In to internX
            </h1>

            <p className="text-xs sm:text-sm text-white/60 mb-8 leading-relaxed max-w-sm mx-auto">
              Access your enrolled internship tracks, review subscription validity, and check your payment receipts.
            </p>

            {/* Continue with Google Button (ONLY option for students) */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-4 px-5 rounded-xl bg-white hover:bg-neutral-100 active:bg-neutral-200 text-neutral-900 font-semibold text-sm flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-neutral-600" />
                    <span>Signing in with Google...</span>
                  </>
                ) : (
                  <>
                    {/* Google G Logo */}
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Footer link to courses */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] text-center text-xs text-white/50">
              Need help? View our{' '}
              <Link href="/#courses" className="text-white hover:underline font-medium">
                Internship Domains
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
