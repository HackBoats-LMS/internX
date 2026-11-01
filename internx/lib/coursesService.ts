import prisma from '@/lib/prisma';

export interface CourseData {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  cost: number;
  renewalCost: number;
  renewalPeriod: string; // e.g. "30 Days", "60 Days", "90 Days", "1 Year"
  renewalPeriodDays: number;
  features: string[];
  isLive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EnrollmentData {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  status: 'active' | 'expired';
  startDate: string;
  expiresAt: string;
  costPaid: number;
  renewalCount: number;
}

// 3 Default Core Courses requested by user
export const INITIAL_COURSES: CourseData[] = [
  {
    id: 'course-ai-01',
    slug: 'ai',
    title: 'AI Internship',
    description: 'Master practical artificial intelligence: LLM integration, agentic workflows, prompt engineering, and production AI application deployment.',
    icon: 'ai',
    cost: 3999,
    renewalCost: 1199,
    renewalPeriod: '30 Days',
    renewalPeriodDays: 30,
    features: [
      'LLM Architectures & Tool Use',
      'Autonomous Agent Development',
      'Production Vector DB & RAG',
      'Real AI Simulation Loops',
      'Verified Industry Credential'
    ],
    isLive: true,
  },
  {
    id: 'course-python-01',
    slug: 'python',
    title: 'Python Internship',
    description: 'From foundational Python to advanced asynchronous microservices, FastAPI, Django, database architecture, and production engineering practices.',
    icon: 'python',
    cost: 2999,
    renewalCost: 999,
    renewalPeriod: '30 Days',
    renewalPeriodDays: 30,
    features: [
      'Core & Advanced Python Mastery',
      'FastAPI & Django REST APIs',
      'PostgreSQL & Async Paradigms',
      'Git Workflows & Agile Sprints',
      'Production Deployment Simulation'
    ],
    isLive: true,
  },
  {
    id: 'course-robotics-01',
    slug: 'robotics',
    title: 'Robotics Internship',
    description: 'Hands-on embedded robotics, microcontrollers, ROS2, sensor telemetry, and simulation-to-hardware pipeline development.',
    icon: 'robotics',
    cost: 4499,
    renewalCost: 1499,
    renewalPeriod: '30 Days',
    renewalPeriodDays: 30,
    features: [
      'ROS2 Node Communication',
      'Embedded C++ & Microcontrollers',
      'IoT Sensor Telemetry Pipelines',
      'Hardware-in-the-Loop Simulation',
      'Hardware Engineering Certification'
    ],
    isLive: true,
  },
];

// Fallback in-memory store in case PostgreSQL is pending DATABASE_URL password
let memoryCourses: CourseData[] = [...INITIAL_COURSES];
let memoryEnrollments: EnrollmentData[] = [];

// High-performance Server-side Cache for Courses & Costs (Traffic Control)
// Skips repeated database hits under high user traffic; auto-purged on admin edits.
let cachedCourses: CourseData[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour safety TTL

export function invalidateCoursesCache() {
  cachedCourses = null;
  cacheTimestamp = 0;
}

export async function getCourses(): Promise<CourseData[]> {
  const now = Date.now();
  if (cachedCourses && (now - cacheTimestamp < CACHE_TTL_MS)) {
    return cachedCourses;
  }

  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
      const dbCourses = await prisma.course.findMany({
        where: { isLive: true },
        orderBy: { createdAt: 'asc' },
      });

      if (dbCourses.length > 0) {
        cachedCourses = dbCourses.map((c: any) => ({
          id: c.id,
          slug: c.slug,
          title: c.title,
          description: c.description,
          icon: c.icon,
          cost: Number(c.cost),
          renewalCost: Number(c.renewalCost),
          renewalPeriod: c.renewalPeriod,
          renewalPeriodDays: Number(c.renewalPeriodDays),
          features: c.features,
          isLive: c.isLive,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        }));
        cacheTimestamp = Date.now();
        return cachedCourses;
      }

      // If database table is empty, seed with initial courses
      for (const c of INITIAL_COURSES) {
        await prisma.course.upsert({
          where: { slug: c.slug },
          update: {},
          create: {
            slug: c.slug,
            title: c.title,
            description: c.description,
            icon: c.icon,
            cost: c.cost,
            renewalCost: c.renewalCost,
            renewalPeriod: c.renewalPeriod,
            renewalPeriodDays: c.renewalPeriodDays,
            features: c.features,
            isLive: c.isLive,
          },
        });
      }

      const refreshed = await prisma.course.findMany({ orderBy: { createdAt: 'asc' } });
      cachedCourses = refreshed.map((c: any) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        icon: c.icon,
        cost: Number(c.cost),
        renewalCost: Number(c.renewalCost),
        renewalPeriod: c.renewalPeriod,
        renewalPeriodDays: Number(c.renewalPeriodDays),
        features: c.features,
        isLive: c.isLive,
      }));
      cacheTimestamp = Date.now();
      return cachedCourses;
    }
  } catch (err) {
    console.warn('Prisma DB connection deferred, using in-memory courses:', (err as any)?.message);
  }

  cachedCourses = memoryCourses;
  cacheTimestamp = Date.now();
  return memoryCourses;
}

export async function getAllCoursesAdmin(): Promise<CourseData[]> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
      const dbCourses = await prisma.course.findMany({
        orderBy: { createdAt: 'asc' },
      });
      if (dbCourses.length > 0) {
        return dbCourses.map((c: any) => ({
          id: c.id,
          slug: c.slug,
          title: c.title,
          description: c.description,
          icon: c.icon,
          cost: Number(c.cost),
          renewalCost: Number(c.renewalCost),
          renewalPeriod: c.renewalPeriod,
          renewalPeriodDays: Number(c.renewalPeriodDays),
          features: c.features,
          isLive: c.isLive,
        }));
      }
    }
  } catch (err) {
    console.warn('Database fallback in getAllCoursesAdmin:', (err as any)?.message);
  }
  return memoryCourses;
}

export async function updateCourse(id: string, data: Partial<CourseData>): Promise<CourseData> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
      const updated = await prisma.course.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          cost: data.cost !== undefined ? Number(data.cost) : undefined,
          renewalCost: data.renewalCost !== undefined ? Number(data.renewalCost) : undefined,
          renewalPeriod: data.renewalPeriod,
          renewalPeriodDays: data.renewalPeriodDays !== undefined ? Number(data.renewalPeriodDays) : undefined,
          features: data.features,
          isLive: data.isLive,
        },
      });

      // Invalidate server cache immediately on admin modification
      invalidateCoursesCache();

      return {
        id: updated.id,
        slug: updated.slug,
        title: updated.title,
        description: updated.description,
        icon: updated.icon,
        cost: Number(updated.cost),
        renewalCost: Number(updated.renewalCost),
        renewalPeriod: updated.renewalPeriod,
        renewalPeriodDays: Number(updated.renewalPeriodDays),
        features: updated.features,
        isLive: updated.isLive,
      };
    }
  } catch (err) {
    console.warn('Prisma update fallback to memory:', (err as any)?.message);
  }

  // Update in memory fallback
  const idx = memoryCourses.findIndex((c) => c.id === id || c.slug === id);
  if (idx !== -1) {
    memoryCourses[idx] = {
      ...memoryCourses[idx],
      ...data,
      cost: data.cost !== undefined ? Number(data.cost) : memoryCourses[idx].cost,
      renewalCost: data.renewalCost !== undefined ? Number(data.renewalCost) : memoryCourses[idx].renewalCost,
      renewalPeriodDays: data.renewalPeriodDays !== undefined ? Number(data.renewalPeriodDays) : memoryCourses[idx].renewalPeriodDays,
    };
    invalidateCoursesCache();
    return memoryCourses[idx];
  }

  throw new Error('Course not found');
}

export async function createCourse(data: Omit<CourseData, 'id'>): Promise<CourseData> {
  const newId = `course-${Date.now()}`;
  const newCourse: CourseData = {
    ...data,
    id: newId,
    cost: Number(data.cost),
    renewalCost: Number(data.renewalCost),
    renewalPeriodDays: Number(data.renewalPeriodDays || 30),
  };

  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
      const created = await prisma.course.create({
        data: {
          slug: data.slug,
          title: data.title,
          description: data.description,
          icon: data.icon || 'ai',
          cost: Number(data.cost),
          renewalCost: Number(data.renewalCost),
          renewalPeriod: data.renewalPeriod,
          renewalPeriodDays: Number(data.renewalPeriodDays || 30),
          features: data.features || [],
          isLive: data.isLive ?? true,
        },
      });

      invalidateCoursesCache();

      return {
        id: created.id,
        slug: created.slug,
        title: created.title,
        description: created.description,
        icon: created.icon,
        cost: Number(created.cost),
        renewalCost: Number(created.renewalCost),
        renewalPeriod: created.renewalPeriod,
        renewalPeriodDays: Number(created.renewalPeriodDays),
        features: created.features,
        isLive: created.isLive,
      };
    }
  } catch (err) {
    console.warn('Prisma create fallback to memory:', (err as any)?.message);
  }

  memoryCourses.push(newCourse);
  return newCourse;
}

export async function getUserEnrollments(userId: string): Promise<EnrollmentData[]> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: { course: true, user: true },
        orderBy: { updatedAt: 'desc' },
      });

      return enrollments.map((e: any) => {
        const isExpired = new Date(e.expiresAt).getTime() < Date.now();
        return {
          id: e.id,
          userId: e.userId,
          userEmail: e.user.email,
          userName: e.user.name,
          courseId: e.courseId,
          courseTitle: e.course.title,
          status: isExpired ? 'expired' : 'active',
          startDate: e.startDate.toISOString(),
          expiresAt: e.expiresAt.toISOString(),
          costPaid: Number(e.costPaid),
          renewalCount: e.renewalCount,
        };
      });
    }
  } catch (err) {
    console.warn('Enrollments fallback to memory:', (err as any)?.message);
  }

  return memoryEnrollments.filter((e) => e.userId === userId).map((e) => {
    const isExpired = new Date(e.expiresAt).getTime() < Date.now();
    return { ...e, status: isExpired ? 'expired' : 'active' };
  });
}

export async function enrollOrRenewCourse(
  userId: string,
  userEmail: string,
  userName: string,
  courseId: string,
  isRenewal: boolean = false
): Promise<EnrollmentData> {
  const courses = await getCourses();
  const course = courses.find((c) => c.id === courseId || c.slug === courseId);
  if (!course) throw new Error('Course not found');

  const renewalDays = course.renewalPeriodDays || 30;
  const now = new Date();
  const cost = isRenewal ? course.renewalCost : course.cost;

  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
      const existing = await prisma.enrollment.findFirst({
        where: { userId, courseId: course.id },
      });

      if (existing) {
        // Renewal
        const baseDate = new Date(existing.expiresAt).getTime() > now.getTime()
          ? new Date(existing.expiresAt)
          : now;
        const newExpiry = new Date(baseDate.getTime() + renewalDays * 24 * 60 * 60 * 1000);

        const updated = await prisma.enrollment.update({
          where: { id: existing.id },
          data: {
            status: 'active',
            expiresAt: newExpiry,
            costPaid: { increment: cost },
            renewalCount: { increment: 1 },
          },
          include: { course: true, user: true },
        });

        return {
          id: updated.id,
          userId: updated.userId,
          userEmail: updated.user.email,
          userName: updated.user.name,
          courseId: updated.courseId,
          courseTitle: updated.course.title,
          status: 'active',
          startDate: updated.startDate.toISOString(),
          expiresAt: updated.expiresAt.toISOString(),
          costPaid: Number(updated.costPaid),
          renewalCount: updated.renewalCount,
        };
      }

      // New enrollment
      const newExpiry = new Date(now.getTime() + renewalDays * 24 * 60 * 60 * 1000);
      const created = await prisma.enrollment.create({
        data: {
          userId,
          courseId: course.id,
          status: 'active',
          startDate: now,
          expiresAt: newExpiry,
          costPaid: cost,
          renewalCount: 0,
        },
        include: { course: true, user: true },
      });

      return {
        id: created.id,
        userId: created.userId,
        userEmail: created.user.email,
        userName: created.user.name,
        courseId: created.courseId,
        courseTitle: created.course.title,
        status: 'active',
        startDate: created.startDate.toISOString(),
        expiresAt: created.expiresAt.toISOString(),
        costPaid: Number(created.costPaid),
        renewalCount: created.renewalCount,
      };
    }
  } catch (err) {
    console.warn('Prisma enrollment fallback to memory:', (err as any)?.message);
  }

  // Memory fallback
  const existingIdx = memoryEnrollments.findIndex((e) => e.userId === userId && e.courseId === course.id);
  if (existingIdx !== -1) {
    const existing = memoryEnrollments[existingIdx];
    const baseDate = new Date(existing.expiresAt).getTime() > now.getTime()
      ? new Date(existing.expiresAt)
      : now;
    const newExpiry = new Date(baseDate.getTime() + renewalDays * 24 * 60 * 60 * 1000);

    memoryEnrollments[existingIdx] = {
      ...existing,
      status: 'active',
      expiresAt: newExpiry.toISOString(),
      costPaid: existing.costPaid + cost,
      renewalCount: existing.renewalCount + 1,
    };
    return memoryEnrollments[existingIdx];
  }

  const newExpiry = new Date(now.getTime() + renewalDays * 24 * 60 * 60 * 1000);
  const newEnrollment: EnrollmentData = {
    id: `enr-${Date.now()}`,
    userId,
    userEmail,
    userName,
    courseId: course.id,
    courseTitle: course.title,
    status: 'active',
    startDate: now.toISOString(),
    expiresAt: newExpiry.toISOString(),
    costPaid: cost,
    renewalCount: 0,
  };
  memoryEnrollments.push(newEnrollment);
  return newEnrollment;
}

export interface PaymentTransactionRecord {
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

let memoryTransactions: PaymentTransactionRecord[] = [];

/**
 * Idempotency guard: returns an already-recorded transaction for a Razorpay
 * payment id, if any. Used to prevent replaying a verified payment to repeatedly
 * extend an enrollment.
 */
export async function findTransactionByPaymentId(
  razorpayPaymentId: string
): Promise<PaymentTransactionRecord | null> {
  if (!razorpayPaymentId) return null;
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
      const tx = await prisma.paymentTransaction.findUnique({
        where: { razorpayPaymentId },
      });
      if (!tx) return null;
      return {
        id: tx.id,
        userId: tx.userId,
        userEmail: tx.userEmail,
        courseId: tx.courseId,
        courseTitle: tx.courseTitle,
        amount: Number(tx.amount),
        currency: tx.currency,
        razorpayOrderId: tx.razorpayOrderId,
        razorpayPaymentId: tx.razorpayPaymentId,
        receiptNumber: tx.receiptNumber,
        status: tx.status,
        isRenewal: tx.isRenewal,
        createdAt: tx.createdAt.toISOString(),
      };
    }
  } catch (err) {
    console.warn('Prisma findTransactionByPaymentId fallback to memory:', (err as any)?.message);
  }
  return (
    memoryTransactions.find((t) => t.razorpayPaymentId === razorpayPaymentId) ?? null
  );
}

export async function recordPaymentTransaction(data: {
  userId: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency?: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  receiptNumber: string;
  status?: string;
  isRenewal?: boolean;
}): Promise<PaymentTransactionRecord> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
      const tx = await prisma.paymentTransaction.create({
        data: {
          userId: data.userId,
          userEmail: data.userEmail,
          courseId: data.courseId,
          courseTitle: data.courseTitle,
          amount: Number(data.amount),
          currency: data.currency || 'INR',
          razorpayOrderId: data.razorpayOrderId,
          razorpayPaymentId: data.razorpayPaymentId,
          razorpaySignature: data.razorpaySignature || null,
          receiptNumber: data.receiptNumber,
          status: data.status || 'captured',
          isRenewal: data.isRenewal ?? false,
        },
      });

      return {
        id: tx.id,
        userId: tx.userId,
        userEmail: tx.userEmail,
        courseId: tx.courseId,
        courseTitle: tx.courseTitle,
        amount: Number(tx.amount),
        currency: tx.currency,
        razorpayOrderId: tx.razorpayOrderId,
        razorpayPaymentId: tx.razorpayPaymentId,
        receiptNumber: tx.receiptNumber,
        status: tx.status,
        isRenewal: tx.isRenewal,
        createdAt: tx.createdAt.toISOString(),
      };
    }
  } catch (err) {
    console.warn('Prisma recordPaymentTransaction fallback to memory:', (err as any)?.message);
  }

  const memoryTx: PaymentTransactionRecord = {
    id: `tx-${Date.now()}`,
    userId: data.userId,
    userEmail: data.userEmail,
    courseId: data.courseId,
    courseTitle: data.courseTitle,
    amount: Number(data.amount),
    currency: data.currency || 'INR',
    razorpayOrderId: data.razorpayOrderId,
    razorpayPaymentId: data.razorpayPaymentId,
    receiptNumber: data.receiptNumber,
    status: data.status || 'captured',
    isRenewal: data.isRenewal ?? false,
    createdAt: new Date().toISOString(),
  };

  memoryTransactions.unshift(memoryTx);
  return memoryTx;
}

export async function getUserPaymentTransactions(userId: string): Promise<PaymentTransactionRecord[]> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
      const txs = await prisma.paymentTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return txs.map((tx: any) => ({
        id: tx.id,
        userId: tx.userId,
        userEmail: tx.userEmail,
        courseId: tx.courseId,
        courseTitle: tx.courseTitle,
        amount: Number(tx.amount),
        currency: tx.currency,
        razorpayOrderId: tx.razorpayOrderId,
        razorpayPaymentId: tx.razorpayPaymentId,
        receiptNumber: tx.receiptNumber,
        status: tx.status,
        isRenewal: tx.isRenewal,
        createdAt: tx.createdAt.toISOString(),
      }));
    }
  } catch (err) {
    console.warn('Prisma getUserPaymentTransactions fallback to memory:', (err as any)?.message);
  }

  return memoryTransactions.filter((tx) => tx.userId === userId);
}

