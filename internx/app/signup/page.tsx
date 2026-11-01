'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  GraduationCap, 
  BookOpen, 
  Target, 
  Loader2, 
  ArrowLeft, 
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import { toast, Toaster } from 'sonner';

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    college: '',
    department: '',
    goalType: '',
    customGoal: '',
    goals: '',
  });

  const [goalOptions, setGoalOptions] = useState<string[]>(['Startup', 'Upper Gradation', 'Job']);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  React.useEffect(() => {
    async function loadGoals() {
      try {
        const res = await fetch('/api/admin/goals');
        if (res.ok) {
          const data = await res.json();
          if (data.goals && Array.isArray(data.goals) && data.goals.length > 0) {
            setGoalOptions(data.goals);
          }
        }
      } catch (e) {
        // Fallback to default
      }
    }
    loadGoals();
  }, []);

  const handleGoogleSignup = () => {
    setIsGoogleLoading(true);
    signIn('google', { callbackUrl: '/dashboard' });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const finalGoal =
      formData.goalType === 'OTHER'
        ? formData.customGoal.trim()
        : formData.goalType.trim() || formData.goals.trim();

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          goals: finalGoal || 'Job',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Signup failed.');
      }

      toast.success('Account created! Welcome to internX.');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Registration error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-x-hidden selection:bg-[#ff1a1a]/30">
      <Toaster richColors position="top-right" theme="dark" />

      {/* Background glow effects */}
      <div className="absolute top-[10%] left-[-10%] w-[550px] h-[550px] bg-[#ff1a1a]/15 blur-[160px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[60%] right-[-10%] w-[500px] h-[500px] bg-[#ff1a1a]/12 blur-[170px] rounded-full pointer-events-none z-0" />

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
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors py-1.5 px-3.5 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.02]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Already have an account? Log In</span>
        </Link>
      </header>

      {/* Signup Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-xl">
          <div className="bg-[#0e0e11]/90 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
            <div className="mb-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#ff1a1a]/30 bg-[#ff1a1a]/10 text-[#ff4d4d] text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Onboarding</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5">
                Join the internX Engineering Sprints
              </h1>
              <p className="text-xs sm:text-sm text-white/60">
                Continue with Google for instant access to course subscriptions and renewals.
              </p>
            </div>

            {/* Google OAuth One-Click Signup */}
            <div className="mb-6">
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-100 active:bg-neutral-200 text-neutral-900 font-semibold text-sm flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl cursor-pointer"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-neutral-600" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                    <span>Sign Up with Google</span>
                  </>
                )}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0e0e11] px-2 text-white/40">or enter details manually</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Full Name <span className="text-[#ff1a1a]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Alex Johnson"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Email Address <span className="text-[#ff1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="alex@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Password <span className="text-[#ff1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    WhatsApp / Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    College / University
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      name="college"
                      placeholder="e.g. Oxford Tech"
                      value={formData.college}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Department / Degree
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    name="department"
                    placeholder="e.g. Computer Science, AI, Robotics"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Primary Goal <span className="text-[#ff1a1a]">*</span>
                </label>
                <div className="relative">
                  <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                  <select
                    name="goalType"
                    required
                    value={formData.goalType}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all cursor-pointer appearance-none"
                  >
                    <option value="" disabled className="bg-[#0e0e11] text-white/40">
                      Select your goal (Startup, Upper Gradation, Job)...
                    </option>
                    {goalOptions.map((goal) => (
                      <option key={goal} value={goal} className="bg-[#0e0e11] text-white">
                        {goal}
                      </option>
                    ))}
                    <option value="OTHER" className="bg-[#0e0e11] text-[#ff4d4d] font-medium">
                      Other (Specify your goal)
                    </option>
                  </select>
                </div>

                {formData.goalType === 'OTHER' && (
                  <input
                    type="text"
                    name="customGoal"
                    required
                    placeholder="Type your primary goal..."
                    value={formData.customGoal}
                    onChange={handleChange}
                    className="mt-2.5 w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#ff1a1a] hover:bg-[#ff3333] active:bg-[#e60000] disabled:opacity-60 transition-all text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff1a1a]/30 cursor-pointer mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/[0.08] text-center text-xs text-white/60">
              Already have an account?{' '}
              <Link href="/login" className="text-[#ff4d4d] hover:underline font-medium">
                Sign In with Google
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
