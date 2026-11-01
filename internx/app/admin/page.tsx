'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  BookOpen, 
  Users, 
  Plus, 
  Edit3, 
  Loader2, 
  Search, 
  LogOut, 
  ArrowLeft,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
  DollarSign,
  Target,
  Trash2
} from 'lucide-react';
import { FaPython, FaRobot, FaBrain } from 'react-icons/fa';
import { toast, Toaster } from 'sonner';

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

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  college?: string;
  department?: string;
  goals?: string;
  role: 'student' | 'admin';
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'courses' | 'users' | 'goals'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [goals, setGoals] = useState<string[]>(['Startup', 'Upper Gradation', 'Job']);
  const [newGoalInput, setNewGoalInput] = useState('');
  const [isSavingGoals, setIsSavingGoals] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Edit Course Modal State
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  // Add Course Modal State
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    slug: '',
    description: '',
    icon: 'ai',
    cost: 2999,
    renewalCost: 999,
    renewalPeriod: '30 Days',
    renewalPeriodDays: 30,
    features: 'Live Projects, Certification, Mentor Reviews',
  });

  // Add Student Candidate Modal State
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    goals: 'Exam Assessment Candidate',
    password: 'ExamStudent@2026',
  });

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email) {
      toast.error('Name and email are required');
      return;
    }

    setIsSavingStudent(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to add student candidate');
      }

      toast.success(data.message || 'Candidate registered and verified!');
      setIsAddingStudent(false);
      setNewStudent({
        name: '',
        email: '',
        phone: '',
        college: '',
        department: '',
        goals: 'Exam Assessment Candidate',
        password: 'ExamStudent@2026',
      });
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || 'Error adding candidate');
    } finally {
      setIsSavingStudent(false);
    }
  };

  const loadAllData = async () => {
    try {
      // Verify session
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        router.push('/admin/login');
        return;
      }
      const meData = await meRes.json();
      if (meData.user?.role !== 'admin') {
        toast.error('Admin privileges required.');
        router.push('/dashboard');
        return;
      }

      // Fetch courses, users, and goal options
      const [cRes, uRes, gRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/admin/users'),
        fetch('/api/admin/goals'),
      ]);

      if (cRes.ok) {
        const cData = await cRes.json();
        if (cData.courses) setCourses(cData.courses);
      }

      if (uRes.ok) {
        const uData = await uRes.json();
        if (uData.students) setStudents(uData.students);
      }

      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData.goals && Array.isArray(gData.goals)) setGoals(gData.goals);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Admin session ended');
    router.push('/login');
    router.refresh();
  };

  // Goal options handlers
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newGoalInput.trim();
    if (!trimmed) {
      toast.error('Please enter a goal title');
      return;
    }
    if (goals.some((g) => g.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('This goal option already exists');
      return;
    }

    const updated = [...goals, trimmed];
    setIsSavingGoals(true);
    try {
      const res = await fetch('/api/admin/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals: updated }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to add goal option');
      }
      setGoals(data.goals);
      setNewGoalInput('');
      toast.success(`Goal option "${trimmed}" added!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update goal options');
    } finally {
      setIsSavingGoals(false);
    }
  };

  const handleRemoveGoal = async (goalToRemove: string) => {
    const updated = goals.filter((g) => g !== goalToRemove);
    if (updated.length === 0) {
      toast.error('At least one goal option must remain');
      return;
    }

    setIsSavingGoals(true);
    try {
      const res = await fetch('/api/admin/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals: updated }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete goal option');
      }
      setGoals(data.goals);
      toast.success(`Removed "${goalToRemove}"`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update goal options');
    } finally {
      setIsSavingGoals(false);
    }
  };

  // Save Edits to Course (Cost, Renewal Period, Title, etc.)
  const handleSaveCourseEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    setIsSavingCourse(true);

    try {
      const res = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCourse),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update course');
      }

      toast.success(`Course "${editingCourse.title}" updated successfully!`);
      setEditingCourse(null);
      await loadAllData();
    } catch (err: any) {
      toast.error(err.message || 'Error updating course');
    } finally {
      setIsSavingCourse(false);
    }
  };

  // Add New Course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.cost) {
      toast.error('Course title and cost are required');
      return;
    }

    setIsSavingCourse(true);

    try {
      const featuresArray = newCourse.features
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCourse,
          features: featuresArray,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create course');
      }

      toast.success('New course added successfully!');
      setIsAddingCourse(false);
      setNewCourse({
        title: '',
        slug: '',
        description: '',
        icon: 'ai',
        cost: 2999,
        renewalCost: 999,
        renewalPeriod: '30 Days',
        renewalPeriodDays: 30,
        features: 'Live Projects, Certification, Mentor Reviews',
      });
      await loadAllData();
    } catch (err: any) {
      toast.error(err.message || 'Error adding course');
    } finally {
      setIsSavingCourse(false);
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'python':
        return <FaPython className="w-5 h-5 text-[#ff4d4d]" />;
      case 'robotics':
        return <FaRobot className="w-5 h-5 text-[#ff4d4d]" />;
      case 'ai':
      default:
        return <FaBrain className="w-5 h-5 text-[#ff4d4d]" />;
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.college && s.college.toLowerCase().includes(q)) ||
      (s.department && s.department.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q))
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#ff1a1a]" />
          <p className="text-sm text-white/60">Loading admin console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-x-hidden selection:bg-[#ff1a1a]/30">
      <Toaster richColors position="top-right" theme="dark" />

      {/* Background glow effects */}
      <div className="absolute top-[5%] left-[-10%] w-[600px] h-[600px] bg-[#ff1a1a]/15 blur-[180px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[60%] right-[-10%] w-[600px] h-[600px] bg-[#ff1a1a]/12 blur-[190px] rounded-full pointer-events-none z-0" />

      {/* Header */}
      <header className="relative z-20 w-full px-[5vw] lg:px-16 py-5 flex justify-between items-center border-b border-white/[0.08] bg-[#050505]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
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
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ff1a1a]/15 border border-[#ff1a1a]/30 text-[#ff4d4d] text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white py-1.5 px-3.5 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.02] transition-colors"
          >
            <span>Student Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white py-1.5 px-3 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.02] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-12 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-white/[0.08]">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'courses'
                  ? 'bg-[#ff1a1a] text-white shadow-lg shadow-[#ff1a1a]/25'
                  : 'bg-white/[0.03] text-white/70 hover:text-white border border-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Manage Courses & Pricing</span>
              <span className="ml-1 text-xs py-0.5 px-1.5 rounded-full bg-white/20">
                {courses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#ff1a1a] text-white shadow-lg shadow-[#ff1a1a]/25'
                  : 'bg-white/[0.03] text-white/70 hover:text-white border border-white/10'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Student Logins & Registrations</span>
              <span className="ml-1 text-xs py-0.5 px-1.5 rounded-full bg-white/20">
                {students.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'goals'
                  ? 'bg-[#ff1a1a] text-white shadow-lg shadow-[#ff1a1a]/25'
                  : 'bg-white/[0.03] text-white/70 hover:text-white border border-white/10'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Signup Goal Options</span>
              <span className="ml-1 text-xs py-0.5 px-1.5 rounded-full bg-white/20">
                {goals.length}
              </span>
            </button>
          </div>

          {activeTab === 'courses' && (
            <button
              onClick={() => setIsAddingCourse(true)}
              className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/15 text-white text-xs sm:text-sm font-medium transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#ff4d4d]" />
              <span>Add New Course</span>
            </button>
          )}
        </div>

        {/* TAB 1: COURSES MANAGEMENT */}
        {activeTab === 'courses' && (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Active Internship Courses
                </h2>
                <p className="text-xs text-white/60">
                  Update course prices, renewal rates, and renewal periods (e.g. 30 Days, 60 Days, 1 Year). Changes update instantly in the student portal.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-[#0e0e11]/90 border border-white/10 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-xl hover:border-white/20 transition-all relative group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                        {renderIcon(course.icon)}
                      </div>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        Live / Active
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1.5">
                      {course.title}
                    </h3>
                    <p className="text-xs text-white/60 mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Pricing grid */}
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-4">
                      <div>
                        <span className="text-[10px] text-white/40 block uppercase">One-Time Cost</span>
                        <span className="text-lg font-bold text-white">
                          ₹{course.cost.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/40 block uppercase">Renewal Cost</span>
                        <span className="text-lg font-bold text-[#ff4d4d]">
                          ₹{course.renewalCost.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-white/[0.04] flex items-center justify-between">
                        <span className="text-[11px] text-white/50">Renewal Period:</span>
                        <span className="text-xs font-semibold text-white/90">
                          {course.renewalPeriod} ({course.renewalPeriodDays} days)
                        </span>
                      </div>
                    </div>

                    {/* Features preview */}
                    <div className="text-[11px] text-white/50 mb-4">
                      <span className="font-medium text-white/70">Features: </span>
                      {course.features.join(', ')}
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingCourse({ ...course })}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-[#ff1a1a]/15 hover:border-[#ff1a1a]/40 border border-white/10 text-white hover:text-[#ff4d4d] text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Pricing & Renewal Period</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: USER LOGINS & REGISTRATIONS DETAILS */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Student Logins & Registrations
                </h2>
                <p className="text-xs text-white/60">
                  Comprehensive log of all registered students, institution details, contact info, and learning goals.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search students, college..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#ff1a1a]"
                />
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-[#0e0e11]/90 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-white/80">
                  <thead className="bg-white/[0.03] border-b border-white/[0.08] text-[11px] uppercase tracking-wider text-white/50">
                    <tr>
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">WhatsApp / Phone</th>
                      <th className="py-3.5 px-4">College</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Career Goals</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((st) => (
                        <tr key={st.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4 font-medium text-white">
                            {st.name}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-white/70">
                            {st.email}
                          </td>
                          <td className="py-3.5 px-4 text-white/70">
                            {st.phone || '—'}
                          </td>
                          <td className="py-3.5 px-4 max-w-[160px] truncate" title={st.college}>
                            {st.college || '—'}
                          </td>
                          <td className="py-3.5 px-4 max-w-[140px] truncate" title={st.department}>
                            {st.department || '—'}
                          </td>
                          <td className="py-3.5 px-4 max-w-[200px] truncate text-white/60" title={st.goals}>
                            {st.goals || '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                st.role === 'admin'
                                  ? 'bg-[#ff1a1a]/20 text-[#ff4d4d] border border-[#ff1a1a]/30'
                                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }`}
                            >
                              {st.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-white/40 text-[11px] whitespace-nowrap">
                            {new Date(st.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-white/40">
                          No student records matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SIGNUP GOALS CONFIGURATION */}
        {activeTab === 'goals' && (
          <div className="max-w-3xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Manage Registration Goal Options
              </h2>
              <p className="text-xs text-white/60">
                Configure the options available in the "Primary Goal" dropdown during registration and signup. Students can pick from these options or select &quot;Other&quot; to specify their custom goal.
              </p>
            </div>

            {/* Add new goal form */}
            <form
              onSubmit={handleAddGoal}
              className="p-5 rounded-2xl bg-[#0e0e11]/90 border border-white/10 backdrop-blur-xl mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
            >
              <div className="relative flex-1">
                <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Enter new goal option (e.g. Higher Studies, Freelancing)..."
                  value={newGoalInput}
                  onChange={(e) => setNewGoalInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#ff1a1a]"
                />
              </div>
              <button
                type="submit"
                disabled={isSavingGoals || !newGoalInput.trim()}
                className="py-2.5 px-5 rounded-xl bg-[#ff1a1a] hover:bg-[#ff3333] active:bg-[#e60000] disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#ff1a1a]/25 transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Option</span>
              </button>
            </form>

            {/* Existing Goal Options List */}
            <div className="bg-[#0e0e11]/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">
                Active Goal Choices ({goals.length})
              </h3>
              <div className="space-y-2.5">
                {goals.map((g, index) => (
                  <div
                    key={g}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-[11px] font-mono text-white/50">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-white">{g}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(g)}
                      disabled={isSavingGoals || goals.length <= 1}
                      className="text-white/40 hover:text-[#ff4d4d] p-1.5 rounded-lg hover:bg-[#ff1a1a]/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title={goals.length <= 1 ? "At least one option required" : "Delete option"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Built-in Other option reminder */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#ff1a1a]/[0.03] border border-[#ff1a1a]/20">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#ff1a1a]/20 text-[#ff4d4d] flex items-center justify-center text-[11px] font-bold">
                      ★
                    </span>
                    <div>
                      <span className="text-sm font-medium text-white/90">Other (Custom input field)</span>
                      <p className="text-[11px] text-white/40">Always available so students can type their own goal if needed</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-white/40 px-2 py-0.5 rounded bg-white/[0.05]">
                    System
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* EDIT COURSE MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0e0e11] border border-white/15 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-1">
              Edit Course: {editingCourse.title}
            </h3>
            <p className="text-xs text-white/60 mb-5">
              Change the pricing, renewal period, and features for this internship track.
            </p>

            <form onSubmit={handleSaveCourseEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff1a1a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff1a1a] resize-none"
                />
              </div>

              {/* Pricing & Renewal inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    One-Time Cost (₹) <span className="text-[#ff1a1a]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingCourse.cost}
                    onChange={(e) => setEditingCourse({ ...editingCourse, cost: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff1a1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Renewal Cost (₹) <span className="text-[#ff1a1a]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingCourse.renewalCost}
                    onChange={(e) => setEditingCourse({ ...editingCourse, renewalCost: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff1a1a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Renewal Period Label
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 30 Days, 3 Months"
                    value={editingCourse.renewalPeriod}
                    onChange={(e) => setEditingCourse({ ...editingCourse, renewalPeriod: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff1a1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Renewal Days (Count)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingCourse.renewalPeriodDays}
                    onChange={(e) => setEditingCourse({ ...editingCourse, renewalPeriodDays: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff1a1a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Features (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingCourse.features.join(', ')}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      features: e.target.value.split(',').map((f) => f.trim()),
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff1a1a]"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  disabled={isSavingCourse}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] text-white/70 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCourse}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#ff1a1a] hover:bg-[#ff3333] text-white text-xs font-medium flex items-center justify-center gap-2 shadow-lg shadow-[#ff1a1a]/30 cursor-pointer"
                >
                  {isSavingCourse ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD COURSE MODAL */}
      {isAddingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0e0e11] border border-white/15 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-1">
              Add New Internship Track
            </h3>
            <p className="text-xs text-white/60 mb-5">
              Create a new course offering with custom cost and renewal duration.
            </p>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Course Title <span className="text-[#ff1a1a]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack Web Development"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff1a1a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Course Slug
                  </label>
                  <input
                    type="text"
                    placeholder="web-dev"
                    value={newCourse.slug}
                    onChange={(e) => setNewCourse({ ...newCourse, slug: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff1a1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Icon Theme
                  </label>
                  <select
                    value={newCourse.icon}
                    onChange={(e) => setNewCourse({ ...newCourse, icon: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#121216] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff1a1a]"
                  >
                    <option value="ai">AI / Brain</option>
                    <option value="python">Python</option>
                    <option value="robotics">Robotics</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief curriculum description..."
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff1a1a] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    One-Time Cost (₹) <span className="text-[#ff1a1a]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newCourse.cost}
                    onChange={(e) => setNewCourse({ ...newCourse, cost: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff1a1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Renewal Cost (₹) <span className="text-[#ff1a1a]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newCourse.renewalCost}
                    onChange={(e) => setNewCourse({ ...newCourse, renewalCost: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff1a1a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Renewal Period Label
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="30 Days"
                    value={newCourse.renewalPeriod}
                    onChange={(e) => setNewCourse({ ...newCourse, renewalPeriod: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff1a1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Renewal Days Count
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newCourse.renewalPeriodDays}
                    onChange={(e) => setNewCourse({ ...newCourse, renewalPeriodDays: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff1a1a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Features (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Live Projects, Mentorship, Certification"
                  value={newCourse.features}
                  onChange={(e) => setNewCourse({ ...newCourse, features: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff1a1a]"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingCourse(false)}
                  disabled={isSavingCourse}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] text-white/70 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCourse}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#ff1a1a] hover:bg-[#ff3333] text-white text-xs font-medium flex items-center justify-center gap-2 shadow-lg shadow-[#ff1a1a]/30 cursor-pointer"
                >
                  {isSavingCourse ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Course</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
