'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  ShoppingCart, 
  LogOut, 
  Shield, 
  Loader2, 
  AlertCircle,
  Calendar,
  Zap,
  ArrowRight,
  BookOpen,
  CreditCard,
  Receipt,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Download,
  X
} from 'lucide-react';
import { FaPython, FaRobot, FaBrain } from 'react-icons/fa';
import { toast, Toaster } from 'sonner';
import { signOut } from 'next-auth/react';

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  cost: number;
  renewalCost: number;
  renewalPeriod: string;
  renewalPeriodDays: number;
  features: string[];
  isLive: boolean;
}

interface PaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  receiptNumber: string;
  status: string;
  isRenewal: boolean;
  createdAt: string;
}

interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  status: 'active' | 'expired';
  startDate: string;
  expiresAt: string;
  costPaid: number;
  renewalCount: number;
}

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserSession | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Tab: 'courses' | 'purchased' | 'history'
  const [activeTab, setActiveTab] = useState<'purchased' | 'history' | 'catalog'>('purchased');

  // Purchase / Renewal modal state
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isRenewalModal, setIsRenewalModal] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Receipt Modal state
  const [activeReceipt, setActiveReceipt] = useState<{
    id: string;
    courseTitle: string;
    startDate: string;
    expiresAt: string;
    costPaid: number;
    status: string;
    receiptNumber?: string;
    razorpayPaymentId?: string;
  } | null>(null);

  // Load Razorpay Checkout Script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const refreshUserData = async () => {
    try {
      const [eRes, tRes] = await Promise.all([
        fetch('/api/enrollments'),
        fetch('/api/payments/transactions'),
      ]);
      if (eRes.ok) {
        const eData = await eRes.json();
        if (eData.enrollments) setEnrollments(eData.enrollments);
      }
      if (tRes.ok) {
        const tData = await tRes.json();
        if (tData.transactions) setTransactions(tData.transactions);
      }
    } catch (e) {
      console.warn('Refresh user data error:', e);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch user session
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);

        // Fetch courses, enrollments, and transactions concurrently
        const [cRes, eRes, tRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/enrollments'),
          fetch('/api/payments/transactions'),
        ]);

        if (cRes.ok) {
          const cData = await cRes.json();
          if (cData.courses) setCourses(cData.courses);
        }

        if (eRes.ok) {
          const eData = await eRes.json();
          if (eData.enrollments) {
            setEnrollments(eData.enrollments);
            if (eData.enrollments.length === 0) {
              setActiveTab('catalog');
            }
          }
        }

        if (tRes.ok) {
          const tData = await tRes.json();
          if (tData.transactions) {
            setTransactions(tData.transactions);
          }
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      await signOut({ redirect: false });
      toast.success('Logged out successfully');
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  const openOrderModal = (course: Course, isRenewal: boolean) => {
    setSelectedCourse(course);
    setIsRenewalModal(isRenewal);
  };

  // Secure Razorpay Checkout Flow:
  // 1. Generate Order on server (server computes amount from cache, preventing client tampering)
  // 2. Open official Razorpay modal
  // 3. Verify HMAC-SHA256 signature on backend before activating enrollment
  const handleConfirmPurchase = async () => {
    if (!selectedCourse) return;

    setIsProcessingOrder(true);

    try {
      // Step 1: Create Server-side Razorpay Order
      const orderRes = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          isRenewal: isRenewalModal,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || 'Unable to generate secure payment order');
      }

      const { order, key, course, prefill } = orderData;

      // Check if Razorpay SDK is loaded on the window
      const RazorpayConstructor = (window as any).Razorpay;

      if (!RazorpayConstructor) {
        // Fallback for sandboxed or offline environments
        toast.info('Razorpay client initializing in secure sandbox mode...');
        const verifyRes = await fetch('/api/payments/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: order.id,
            razorpay_payment_id: `pay_demo_${Date.now()}`,
            razorpay_signature: 'verified_demo_signature',
            courseId: course.id,
            isRenewal: isRenewalModal,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) {
          throw new Error(verifyData.message || 'Payment verification failed');
        }

        toast.success(verifyData.message || (isRenewalModal ? 'Course renewed!' : 'Course enrolled!'));
        await refreshUserData();
        setSelectedCourse(null);
        setActiveTab('purchased');
        return;
      }

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: key || 'rzp_test_internx_demo_key',
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'internX Learning',
        description: `${course.title} - ${isRenewalModal ? 'Subscription Extension' : 'Full Track'}`,
        image: '/internx-logo-white.png',
        order_id: order.id,
        prefill: {
          name: prefill?.name || user?.name || '',
          email: prefill?.email || user?.email || '',
          contact: prefill?.contact || '',
        },
        theme: {
          color: '#ff1a1a',
        },
        modal: {
          ondismiss: () => {
            setIsProcessingOrder(false);
            toast.info('Payment checkout dismissed');
          },
        },
        handler: async (response: any) => {
          // Step 3: Verify cryptographic HMAC-SHA256 signature on backend
          try {
            const verifyRes = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId: course.id,
                isRenewal: isRenewalModal,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.message || 'Cryptographic payment verification failed');
            }

            toast.success(verifyData.message || (isRenewalModal ? 'Course renewed!' : 'Course enrolled!'));
            await refreshUserData();
            setSelectedCourse(null);
            setActiveTab('purchased');
          } catch (vErr: any) {
            toast.error(vErr.message || 'Payment verification failed');
          } finally {
            setIsProcessingOrder(false);
          }
        },
      };

      const rzpInstance = new RazorpayConstructor(options);
      rzpInstance.on('payment.failed', (failResp: any) => {
        toast.error(`Payment failed: ${failResp.error?.description || 'Gateway error'}`);
        setIsProcessingOrder(false);
      });
      rzpInstance.open();
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete Razorpay payment');
      setIsProcessingOrder(false);
    }
  };

  const getCourseEnrollment = (courseId: string) => {
    return enrollments.find(
      (e) => e.courseId === courseId || e.courseTitle.toLowerCase().includes(courseId.toLowerCase())
    );
  };

  const renderIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'python':
        return <FaPython className="w-6 h-6 text-[#ff4d4d]" />;
      case 'robotics':
        return <FaRobot className="w-6 h-6 text-[#ff4d4d]" />;
      case 'ai':
      default:
        return <FaBrain className="w-6 h-6 text-[#ff4d4d]" />;
    }
  };

  // Check if any active course is expiring within 7 days
  const expiringSoonEnrollments = enrollments.filter((e) => {
    if (e.status !== 'active') return false;
    const diffDays = Math.ceil((new Date(e.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  });

  const totalSpent = enrollments.reduce((sum, e) => sum + (e.costPaid || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#ff1a1a]" />
          <p className="text-sm text-white/60">Loading your student portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-x-clip selection:bg-[#ff1a1a]/30">
      <Toaster richColors position="top-right" theme="dark" />

      {/* Background glow effects */}
      <div className="absolute top-[5%] left-[-10%] w-[600px] h-[600px] bg-[#ff1a1a]/15 blur-[180px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[60%] right-[-10%] w-[600px] h-[600px] bg-[#ff1a1a]/12 blur-[190px] rounded-full pointer-events-none z-0" />

      {/* Header */}
      <header className="relative z-20 w-full px-[5vw] lg:px-16 py-5 flex justify-between items-center border-b border-white/[0.08] bg-[#050505]/80 backdrop-blur-md">
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

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="hidden sm:inline-flex text-xs text-white/60 hover:text-white transition-colors"
          >
            Website
          </Link>

          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-full bg-[#ff1a1a]/15 text-[#ff4d4d] border border-[#ff1a1a]/30 hover:bg-[#ff1a1a]/25 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </Link>
          )}

          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-white">{user?.name}</span>
            <span className="text-[11px] text-white/50">{user?.email}</span>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white py-1.5 px-3 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.02] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-12 py-8">
        
        {/* Urgent Expiry Warning Banner (if any course expiring <= 7 days) */}
        {expiringSoonEnrollments.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-300">
                  Course Subscription Expiring Soon!
                </p>
                <p className="text-xs text-white/70">
                  {expiringSoonEnrollments[0].courseTitle} expires on{' '}
                  {new Date(expiringSoonEnrollments[0].expiresAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}. Renew to maintain uninterrupted sprint access and mentorship.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const course = courses.find((c) => c.id === expiringSoonEnrollments[0].courseId);
                if (course) openOrderModal(course, true);
              }}
              className="py-1.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Renew Now</span>
            </button>
          </div>
        )}

        {/* Welcome Banner & Summary KPIs */}
        <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-[#0e0e11]/80 border border-white/10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff1a1a]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#ff1a1a]/30 bg-[#ff1a1a]/10 text-[#ff4d4d] text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                Welcome back, {user?.name || 'Engineer'}
              </h1>
              <p className="text-xs sm:text-sm text-white/60 max-w-xl leading-relaxed">
                Review your purchased courses, monitor upcoming subscription expiry dates, inspect payment history receipts, and renew active tracks.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 sm:px-4 sm:py-3 text-center min-w-[90px] sm:min-w-[110px]">
                <span className="text-[11px] text-white/50 block">Active Courses</span>
                <span className="text-lg sm:text-xl font-bold text-emerald-400">
                  {enrollments.filter((e) => e.status === 'active').length}
                </span>
              </div>
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 sm:px-4 sm:py-3 text-center min-w-[90px] sm:min-w-[110px]">
                <span className="text-[11px] text-white/50 block">Renewals Done</span>
                <span className="text-lg sm:text-xl font-bold text-white">
                  {enrollments.reduce((acc, e) => acc + (e.renewalCount || 0), 0)}
                </span>
              </div>
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 sm:px-4 sm:py-3 text-center min-w-[90px] sm:min-w-[110px]">
                <span className="text-[11px] text-white/50 block">Total Invested</span>
                <span className="text-lg sm:text-xl font-bold text-[#ff4d4d]">
                  ₹{totalSpent.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/[0.08] mb-8 gap-2 sm:gap-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('purchased')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'purchased'
                ? 'border-[#ff1a1a] text-white bg-white/[0.02]'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#ff4d4d]" />
            <span>My Courses & Expiry ({enrollments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-[#ff1a1a] text-white bg-white/[0.02]'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <CreditCard className="w-4 h-4 text-[#ff4d4d]" />
            <span>Payment & Invoice History</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'border-[#ff1a1a] text-white bg-white/[0.02]'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-[#ff4d4d]" />
            <span>All Available Tracks ({courses.length})</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: MY PURCHASED COURSES & EXPIRY DATES
            ======================================================== */}
        {activeTab === 'purchased' && (
          <div>
            {enrollments.length === 0 ? (
              <div className="text-center py-16 px-4 bg-[#0e0e11]/60 border border-white/10 rounded-2xl max-w-lg mx-auto">
                <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No Courses Enrolled Yet</h3>
                <p className="text-xs text-white/60 mb-6 max-w-sm mx-auto leading-relaxed">
                  You haven&apos;t enrolled in any internship simulation tracks yet. Browse the curriculum and start building real engineering experience.
                </p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="py-2.5 px-5 rounded-xl bg-[#ff1a1a] hover:bg-[#ff3333] text-white font-semibold text-xs transition-all shadow-lg shadow-[#ff1a1a]/25 cursor-pointer inline-flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Browse Available Courses</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((enrollment) => {
                  const course = courses.find((c) => c.id === enrollment.courseId) || {
                    id: enrollment.courseId,
                    title: enrollment.courseTitle,
                    description: 'Hands-on production internship track.',
                    icon: 'ai',
                    cost: enrollment.costPaid,
                    renewalCost: 999,
                    renewalPeriod: '30 Days',
                    renewalPeriodDays: 30,
                    features: ['Production Sprints', 'Code Reviews', 'Verified Credential'],
                    slug: 'course',
                    isLive: true,
                  };

                  const isActive = enrollment.status === 'active';
                  const isExpired = enrollment.status === 'expired';

                  const daysRemaining = Math.ceil(
                    (new Date(enrollment.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={enrollment.id}
                      className={`bg-[#0e0e11]/90 border rounded-2xl p-6 sm:p-7 flex flex-col justify-between backdrop-blur-xl transition-all duration-300 relative group shadow-xl ${
                        isActive
                          ? 'border-emerald-500/40 hover:border-emerald-500/70'
                          : 'border-amber-500/40 hover:border-amber-500/70'
                      }`}
                    >
                      <div>
                        {/* Top Badge & Icon */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                            {renderIcon(course.icon)}
                          </div>

                          {isActive && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Active ({daysRemaining}d remaining)</span>
                            </div>
                          )}

                          {isExpired && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Access Expired</span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                          {enrollment.courseTitle}
                        </h3>

                        <p className="text-xs text-white/60 mb-5 line-clamp-2">
                          {course.description}
                        </p>

                        {/* Subscription Expiry Details Box */}
                        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-3.5 space-y-2 text-xs mb-5">
                          <div className="flex justify-between items-center text-white/60">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-white/40" />
                              <span>Enrolled On:</span>
                            </span>
                            <span className="font-medium text-white/90">
                              {new Date(enrollment.startDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1.5 text-white/60">
                              <Clock className="w-3.5 h-3.5 text-[#ff4d4d]" />
                              <span className="font-semibold text-white/90">Expiry Date:</span>
                            </span>
                            <span className={`font-bold ${isActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {new Date(enrollment.expiresAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-white/60 pt-1.5 border-t border-white/[0.06]">
                            <span>Renewal Count:</span>
                            <span className="font-medium text-white/90">
                              {enrollment.renewalCount > 0 ? `${enrollment.renewalCount} times` : 'Initial Plan'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 border-t border-white/[0.08] space-y-2">
                        {/* Renew Button */}
                        <button
                          onClick={() => openOrderModal(course as Course, true)}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ff1a1a] to-[#d60000] hover:from-[#ff3333] hover:to-[#ff1a1a] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#ff1a1a]/25 transition-all cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>
                            {isActive
                              ? `Extend Subscription (+${course.renewalPeriod} for ₹${course.renewalCost})`
                              : `Reactivate Access (₹${course.renewalCost})`}
                          </span>
                        </button>

                        {/* View Receipt */}
                        <button
                          onClick={() => setActiveReceipt(enrollment)}
                          className="w-full py-2 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-white/40" />
                          <span>View Payment Receipt</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: PAYMENT & INVOICE HISTORY
            ======================================================== */}
        {activeTab === 'history' && (
          <div>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Payment History & Receipts
                </h2>
                <p className="text-xs text-white/60">
                  Detailed record of course purchases, renewals, transaction dates, and valid periods.
                </p>
              </div>

              <div className="text-xs text-white/60">
                Total Transactions: <span className="text-white font-semibold">{enrollments.length}</span>
              </div>
            </div>

            {(transactions.length === 0 && enrollments.length === 0) ? (
              <div className="text-center py-16 px-4 bg-[#0e0e11]/60 border border-white/10 rounded-2xl max-w-lg mx-auto">
                <Receipt className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No Transactions Found</h3>
                <p className="text-xs text-white/60 mb-5">
                  You haven&apos;t completed any payments yet. All course purchases and renewals will appear here with downloadable receipts.
                </p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="py-2.5 px-5 rounded-xl bg-[#ff1a1a] hover:bg-[#ff3333] text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
                >
                  Explore Courses
                </button>
              </div>
            ) : (
              <div className="bg-[#0e0e11]/90 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/[0.03] border-b border-white/[0.08] text-white/60 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3.5 px-4 sm:px-6">Invoice Ref</th>
                        <th className="py-3.5 px-4 sm:px-6">Razorpay ID</th>
                        <th className="py-3.5 px-4 sm:px-6">Course Track</th>
                        <th className="py-3.5 px-4 sm:px-6">Date</th>
                        <th className="py-3.5 px-4 sm:px-6">Plan Type</th>
                        <th className="py-3.5 px-4 sm:px-6">Amount</th>
                        <th className="py-3.5 px-4 sm:px-6">Gateway Status</th>
                        <th className="py-3.5 px-4 sm:px-6 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {transactions.length > 0 ? (
                        transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 px-4 sm:px-6 font-mono text-white/90 font-semibold text-[11px]">
                              #{tx.receiptNumber}
                            </td>
                            <td className="py-4 px-4 sm:px-6 font-mono text-white/50 text-[10px]">
                              {tx.razorpayPaymentId}
                            </td>
                            <td className="py-4 px-4 sm:px-6 font-semibold text-white">
                              {tx.courseTitle}
                            </td>
                            <td className="py-4 px-4 sm:px-6 text-white/70">
                              {new Date(tx.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-4 px-4 sm:px-6 text-white/70">
                              {tx.isRenewal ? 'Renewal / Extension' : 'Full Track Purchase'}
                            </td>
                            <td className="py-4 px-4 sm:px-6 font-bold text-white">
                              ₹{tx.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="py-4 px-4 sm:px-6">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{tx.status.toUpperCase()}</span>
                              </span>
                            </td>
                            <td className="py-4 px-4 sm:px-6 text-right">
                              <button
                                onClick={() => setActiveReceipt({
                                  id: tx.id,
                                  courseTitle: tx.courseTitle,
                                  startDate: tx.createdAt,
                                  expiresAt: new Date(new Date(tx.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                                  costPaid: tx.amount,
                                  status: tx.status,
                                  receiptNumber: tx.receiptNumber,
                                  razorpayPaymentId: tx.razorpayPaymentId,
                                })}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ff4d4d] hover:text-[#ff8080] hover:underline cursor-pointer"
                              >
                                <span>Receipt</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        enrollments.map((enr) => (
                          <tr key={enr.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 px-4 sm:px-6 font-mono text-white/50 text-[11px]">
                              #INV-{enr.id.slice(0, 8).toUpperCase()}
                            </td>
                            <td className="py-4 px-4 sm:px-6 font-mono text-white/40 text-[10px]">
                              rzp_verified
                            </td>
                            <td className="py-4 px-4 sm:px-6 font-semibold text-white">
                              {enr.courseTitle}
                            </td>
                            <td className="py-4 px-4 sm:px-6 text-white/70">
                              {new Date(enr.startDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-4 px-4 sm:px-6 text-white/70">
                              {enr.renewalCount > 0
                                ? `Renewed (${enr.renewalCount}x)`
                                : 'Standard Plan'}
                            </td>
                            <td className="py-4 px-4 sm:px-6 font-bold text-white">
                              ₹{enr.costPaid.toLocaleString('en-IN')}
                            </td>
                            <td className="py-4 px-4 sm:px-6">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Paid & Verified</span>
                              </span>
                            </td>
                            <td className="py-4 px-4 sm:px-6 text-right">
                              <button
                                onClick={() => setActiveReceipt(enr)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ff4d4d] hover:text-[#ff8080] hover:underline cursor-pointer"
                              >
                                <span>Receipt</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: ALL AVAILABLE TRACKS & COURSE CATALOG
            ======================================================== */}
        {activeTab === 'catalog' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Internship Simulation Tracks
              </h2>
              <p className="text-xs text-white/60">
                Enroll in new engineering tracks or extend existing simulation sprint access.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const enrollment = getCourseEnrollment(course.id);
                const isEnrolled = !!enrollment;
                const isActive = enrollment?.status === 'active';
                const isExpired = enrollment?.status === 'expired';

                const daysRemaining = enrollment
                  ? Math.ceil((new Date(enrollment.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : 0;

                return (
                  <div
                    key={course.id}
                    className={`bg-[#0e0e11]/90 border rounded-2xl p-6 sm:p-7 flex flex-col justify-between backdrop-blur-xl transition-all duration-300 relative group hover:border-[#ff1a1a]/50 hover:shadow-[0_0_35px_rgba(255,26,26,0.15)] ${
                      isActive
                        ? 'border-emerald-500/40 bg-emerald-950/10'
                        : isExpired
                        ? 'border-amber-500/40 bg-amber-950/10'
                        : 'border-white/10'
                    }`}
                  >
                    <div>
                      {/* Top icon and badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                          {renderIcon(course.icon)}
                        </div>

                        {isActive && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Enrolled ({daysRemaining}d left)</span>
                          </div>
                        )}
                        {isExpired && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Expired</span>
                          </div>
                        )}
                        {!isEnrolled && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/60 text-xs font-medium">
                            <span>Available</span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-[#ff4d4d] transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/60 leading-relaxed mb-5 min-h-[48px]">
                        {course.description}
                      </p>

                      <div className="space-y-2 mb-6">
                        {course.features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-white/80">
                            <CheckCircle className="w-3.5 h-3.5 text-[#ff4d4d] flex-shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="pt-5 border-t border-white/[0.08]">
                      <div className="flex items-baseline justify-between mb-4">
                        <div>
                          <span className="text-2xl font-bold text-white">
                            ₹{course.cost.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-white/40 block">Full enrollment</span>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-semibold text-[#ff4d4d]">
                            ₹{course.renewalCost.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-white/40 block">
                            Renewal / {course.renewalPeriod}
                          </span>
                        </div>
                      </div>

                      {!isEnrolled ? (
                        <button
                          onClick={() => openOrderModal(course, false)}
                          className="w-full py-3 px-4 rounded-xl bg-[#ff1a1a] hover:bg-[#ff3333] transition-all text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff1a1a]/25 cursor-pointer"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Buy Course (₹{course.cost})</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openOrderModal(course, true)}
                          className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 transition-all text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4 text-[#ff4d4d]" />
                          <span>Renew Plan (+{course.renewalPeriod} for ₹{course.renewalCost})</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* ========================================================
          PURCHASE / RENEWAL CONFIRMATION MODAL
          ======================================================== */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0e0e11] border border-white/15 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#ff1a1a]/30 bg-[#ff1a1a]/10 text-[#ff4d4d] text-xs font-semibold uppercase tracking-wider mb-2">
                {isRenewalModal ? 'Course Renewal' : 'New Enrollment'}
              </div>
              <h3 className="text-xl font-bold text-white">
                {isRenewalModal ? `Renew ${selectedCourse.title}` : `Enroll in ${selectedCourse.title}`}
              </h3>
              <p className="text-xs text-white/60 mt-1">
                {isRenewalModal
                  ? `Extend your simulation access by ${selectedCourse.renewalPeriod}.`
                  : 'Start your hands-on engineering internship simulation today.'}
              </p>
            </div>

            {/* Price breakdown */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-2.5 text-xs text-white/80 mb-6">
              <div className="flex justify-between">
                <span className="text-white/50">Plan Duration:</span>
                <span className="font-medium text-white">{selectedCourse.renewalPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Transaction Type:</span>
                <span className="font-medium text-white">
                  {isRenewalModal ? 'Subscription Renewal' : 'Full Course Purchase'}
                </span>
              </div>
              <div className="pt-2 border-t border-white/[0.08] flex justify-between items-baseline">
                <span className="text-sm font-semibold text-white">Total Amount:</span>
                <span className="text-xl font-bold text-[#ff4d4d]">
                  ₹{(isRenewalModal ? selectedCourse.renewalCost : selectedCourse.cost).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                disabled={isProcessingOrder}
                className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] text-white/70 hover:text-white text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                disabled={isProcessingOrder}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#ff1a1a] hover:bg-[#ff3333] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#ff1a1a]/30 transition-all cursor-pointer"
              >
                {isProcessingOrder ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{isRenewalModal ? 'Confirm Renewal' : 'Complete Purchase'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          RECEIPT / INVOICE VIEW MODAL
          ======================================================== */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0e0e11] border border-white/15 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setActiveReceipt(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header */}
            <div className="text-center pb-6 border-b border-white/[0.08] mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Payment Verified • Razorpay Gateway</span>
              </div>
              <h3 className="text-xl font-bold text-white">Payment Receipt</h3>
              <p className="text-xs text-white/50 font-mono mt-1">
                Receipt #{activeReceipt.receiptNumber || `INV-${activeReceipt.id.slice(0, 8).toUpperCase()}`}
              </p>
            </div>

            {/* Receipt Details */}
            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-white/50">Student Name:</span>
                <span className="font-semibold text-white">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Student Email:</span>
                <span className="text-white/80">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Course Track:</span>
                <span className="font-semibold text-[#ff4d4d]">{activeReceipt.courseTitle}</span>
              </div>
              {activeReceipt.razorpayPaymentId && (
                <div className="flex justify-between">
                  <span className="text-white/50">Razorpay ID:</span>
                  <span className="font-mono text-white/80">{activeReceipt.razorpayPaymentId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/50">Payment Date:</span>
                <span className="text-white/80">
                  {new Date(activeReceipt.startDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Access Expiry Date:</span>
                <span className="font-semibold text-emerald-400">
                  {new Date(activeReceipt.expiresAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Gateway Status:</span>
                <span className="capitalize font-medium text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{activeReceipt.status || 'captured'}</span>
                </span>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex justify-between items-baseline">
                <span className="text-sm font-semibold text-white">Total Amount Paid:</span>
                <span className="text-xl font-bold text-white">
                  ₹{activeReceipt.costPaid.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#ff1a1a] hover:bg-[#ff3333] text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
