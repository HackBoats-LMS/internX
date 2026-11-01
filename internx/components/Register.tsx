'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  BookOpen, 
  Target, 
  Loader2, 
  CheckCircle2, 
  ArrowLeft,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { signIn } from 'next-auth/react';

interface CollegeOption {
  id: string;
  name: string;
}

interface DepartmentOption {
  id: string;
  name: string;
  collegeId: string | null;
  collegeName?: string | null;
}

const DEFAULT_DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'MCA / BCA',
  'Other'
];

export default function Register() {
  const router = useRouter();

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsappNumber: '',
    collegeName: '',
    customCollege: '',
    department: '',
    customDepartment: '',
    goalType: '',
    customGoal: '',
    goals: '',
  });

  // Dropdown options
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [goalOptions, setGoalOptions] = useState<string[]>(['Startup', 'Upper Gradation', 'Job']);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch colleges and departments
  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch('/api/register');
        if (res.ok) {
          const data = await res.json();
          if (data.colleges && Array.isArray(data.colleges)) {
            setColleges(data.colleges);
          }
          if (data.departments && Array.isArray(data.departments)) {
            setDepartments(data.departments);
          }
          if (data.goals && Array.isArray(data.goals) && data.goals.length > 0) {
            setGoalOptions(data.goals);
          }
        }
      } catch (err) {
        console.error('Failed to load college options:', err);
      } finally {
        setIsLoadingOptions(false);
      }
    }
    fetchOptions();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Resolve final college and department
    const finalCollege =
      formData.collegeName === 'OTHER'
        ? formData.customCollege.trim()
        : formData.collegeName.trim();

    const finalDepartment =
      formData.department === 'OTHER'
        ? formData.customDepartment.trim()
        : formData.department.trim();

    const finalGoal =
      formData.goalType === 'OTHER'
        ? formData.customGoal.trim()
        : formData.goalType.trim() || formData.goals.trim();

    // Client-side validations
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      toast.error('Please enter your full name');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setErrorMessage('Please provide a valid email address.');
      toast.error('Invalid email address');
      return;
    }

    if (!formData.whatsappNumber.trim() || formData.whatsappNumber.trim().length < 7) {
      setErrorMessage('Please enter a valid WhatsApp contact number.');
      toast.error('Invalid WhatsApp number');
      return;
    }

    if (!finalCollege) {
      setErrorMessage('Please specify your college name.');
      toast.error('Please select or specify your college');
      return;
    }

    if (!finalDepartment) {
      setErrorMessage('Please specify your department or branch.');
      toast.error('Please select or specify your department');
      return;
    }

    if (!finalGoal) {
      setErrorMessage('Please select or specify your career goals.');
      toast.error('Please select your career goals');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          whatsappNumber: formData.whatsappNumber.trim(),
          collegeName: finalCollege,
          department: finalDepartment,
          goals: finalGoal,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      setIsSuccess(true);
      toast.success('Registration submitted successfully!');
    } catch (err: any) {
      const msg = err.message || 'An error occurred. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-x-clip selection:bg-[#ff1a1a]/30">
      <Toaster richColors position="top-right" theme="dark" />

      {/* Background glow effects */}
      <div className="absolute top-[10%] left-[-10%] w-[550px] h-[550px] bg-[#ff1a1a]/15 blur-[160px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[60%] right-[-10%] w-[500px] h-[500px] bg-[#ff1a1a]/12 blur-[170px] rounded-full pointer-events-none z-0" />

      {/* Navigation Header */}
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
            className="text-xs sm:text-sm font-semibold text-white/80 hover:text-white transition-colors py-1.5 px-3.5 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.03]"
          >
            Already registered? <span className="text-[#ff4d4d] underline ml-1">Login</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/70 hover:text-white transition-colors py-1.5 px-3.5 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.02]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-12 lg:py-16">
        <div className="w-full max-w-2xl">
          {isSuccess ? (
            /* Success State */
            <div className="bg-[#0e0e11]/90 border border-white/10 rounded-2xl p-8 sm:p-12 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#ff1a1a]/20 rounded-full blur-3xl pointer-events-none" />

              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">
                Registration Confirmed!
              </h2>
              <p className="text-white/70 text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-6">
                Thank you, <span className="text-white font-medium">{formData.name}</span>! Your application for the internX real-world engineering simulation has been recorded.
              </p>

              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 max-w-md mx-auto text-left text-xs sm:text-sm text-white/80 space-y-2 mb-8">
                <div className="flex justify-between">
                  <span className="text-white/40">Email:</span>
                  <span className="font-mono text-white/90">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">College:</span>
                  <span className="text-white/90 truncate max-w-[220px]">
                    {formData.collegeName === 'OTHER' ? formData.customCollege : formData.collegeName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Department:</span>
                  <span className="text-white/90 truncate max-w-[220px]">
                    {formData.department === 'OTHER' ? formData.customDepartment : formData.department}
                  </span>
                </div>
              </div>

              <p className="text-xs text-white/50 mb-8 max-w-sm mx-auto">
                Our admissions and mentorship team will reach out via WhatsApp and Email with program schedules and next steps.
              </p>

              {/* Continue with Google Option */}
              <div className="max-w-md mx-auto mb-6 p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-center shadow-lg">
                <p className="text-xs text-white/70 mb-3.5 font-medium">Ready to access your simulation dashboard?</p>
                <button
                  type="button"
                  onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                  className="w-full py-3 px-4 rounded-xl bg-white text-black hover:bg-white/90 active:bg-white/80 transition-all font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg cursor-pointer"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s0.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
              

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/"
                  className="px-6 py-3 rounded-full bg-[#ff1a1a] hover:bg-[#ff3333] transition-colors text-white font-medium text-sm text-center shadow-lg shadow-[#ff1a1a]/25"
                >
                  Return to Home
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    setFormData({
                      name: '',
                      email: '',
                      whatsappNumber: '',
                      collegeName: '',
                      customCollege: '',
                      department: '',
                      customDepartment: '',
                      goalType: '',
                      customGoal: '',
                      goals: '',
                    });
                  }}
                  className="px-6 py-3 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-white/80 hover:text-white text-sm"
                >
                  Register Another Student
                </button>
              </div>
            </div>
          ) : (
            /* Form Container */
            <div className="bg-[#0e0e11]/90 border border-white/10 rounded-2xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl relative">
              {/* Header inside card */}
              <div className="mb-8 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#ff1a1a]/30 bg-[#ff1a1a]/10 text-[#ff4d4d] text-xs font-semibold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Student Registration</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                  Accelerate Your Tech Career
                </h1>
                <p className="text-sm text-white/60 leading-relaxed">
                  Join real tech simulations, work on live projects, and gain verified industry experience with internX.
                </p>
              </div>

              {/* Error banner */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">
                    Full Name <span className="text-[#ff1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all"
                    />
                  </div>
                </div>

                {/* Email & WhatsApp in 2-column grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-2">
                      Email Address <span className="text-[#ff1a1a]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-2">
                      WhatsApp Number <span className="text-[#ff1a1a]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="tel"
                        name="whatsappNumber"
                        required
                        placeholder="+91 9876543210"
                        value={formData.whatsappNumber}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* College Selection */}
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">
                    College / Institution <span className="text-[#ff1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                    <select
                      name="collegeName"
                      required
                      value={formData.collegeName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121216] border border-white/10 text-white text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-white/40">
                        {isLoadingOptions ? 'Loading colleges...' : 'Select your college'}
                      </option>
                      {colleges.map((c) => (
                        <option key={c.id} value={c.name} className="bg-[#121216] text-white">
                          {c.name}
                        </option>
                      ))}
                      <option value="OTHER" className="bg-[#121216] text-[#ff4d4d] font-medium">
                        + Other (Enter College Name)
                      </option>
                    </select>
                  </div>

                  {formData.collegeName === 'OTHER' && (
                    <input
                      type="text"
                      name="customCollege"
                      required
                      placeholder="Type your college / university name"
                      value={formData.customCollege}
                      onChange={handleChange}
                      className="mt-2.5 w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all"
                    />
                  )}
                </div>

                {/* Department Selection */}
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">
                    Department / Branch <span className="text-[#ff1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                    <select
                      name="department"
                      required
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121216] border border-white/10 text-white text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-white/40">
                        Select your department
                      </option>
                      {/* Unique departments list */}
                      {departments.length > 0
                        ? Array.from(new Set(departments.map((d) => d.name))).map((name) => (
                            <option key={name} value={name} className="bg-[#121216] text-white">
                              {name}
                            </option>
                          ))
                        : DEFAULT_DEPARTMENTS.filter((d) => d !== 'Other').map((d) => (
                            <option key={d} value={d} className="bg-[#121216] text-white">
                              {d}
                            </option>
                          ))}
                      <option value="OTHER" className="bg-[#121216] text-[#ff4d4d] font-medium">
                        + Other (Enter Department)
                      </option>
                    </select>
                  </div>

                  {formData.department === 'OTHER' && (
                    <input
                      type="text"
                      name="customDepartment"
                      required
                      placeholder="Type your department (e.g. AI & Robotics)"
                      value={formData.customDepartment}
                      onChange={handleChange}
                      className="mt-2.5 w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all"
                    />
                  )}
                </div>

                {/* Goals / Interests Dropdown + Others */}
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">
                    What is your primary goal? <span className="text-[#ff1a1a]">*</span>
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
                        Select your primary goal...
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

                  {/* Custom goal field if OTHER is selected */}
                  {formData.goalType === 'OTHER' && (
                    <input
                      type="text"
                      name="customGoal"
                      required
                      placeholder="Type your primary goal (e.g. Higher Studies, Freelancing)..."
                      value={formData.customGoal}
                      onChange={handleChange}
                      className="mt-2.5 w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff1a1a] focus:ring-1 focus:ring-[#ff1a1a] transition-all"
                    />
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#ff1a1a] hover:bg-[#ff3333] active:bg-[#e60000] disabled:opacity-60 disabled:cursor-not-allowed transition-all text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff1a1a]/30 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Registration</span>
                        <Sparkles className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="mt-4 pt-4 border-t border-white/[0.08] text-center">
                    <p className="text-xs text-white/60">
                      Already registered?{' '}
                      <Link
                        href="/login"
                        className="text-white hover:text-[#ff4d4d] font-semibold underline underline-offset-4 transition-colors"
                      >
                        Login to Portal
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}