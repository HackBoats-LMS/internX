import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import MongoUser from '@/models/User';

export interface StudentRecord {
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

// In-memory fallback
let memoryUsers: any[] = [
  {
    id: 'admin-01',
    name: 'internX Administrator',
    email: 'admin@internx.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'student-demo-01',
    name: 'Demo Student',
    email: 'student@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'student',
    phone: '+91 9876543210',
    college: 'Engineering Institute of Tech',
    department: 'Computer Science',
    goals: 'Learn AI and robotics simulation loops.',
    createdAt: new Date().toISOString(),
  }
];

export async function authenticateUser(email: string, password: string): Promise<any | null> {
  const normEmail = email.trim().toLowerCase();

  // Master demo admin shortcut for immediate access
  if (normEmail === 'admin@internx.com' && password === 'admin123') {
    return {
      id: 'admin-root',
      name: 'System Admin',
      email: 'admin@internx.com',
      role: 'admin',
    };
  }

  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
      const dbUser = await prisma.user.findUnique({
        where: { email: normEmail },
      });

      if (dbUser) {
        const matches = await bcrypt.compare(password, dbUser.password);
        if (matches) {
          return {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role as 'student' | 'admin',
            phone: dbUser.phone,
            college: dbUser.college,
            department: dbUser.department,
          };
        }
      }
    }
  } catch (err) {
    console.warn('Prisma auth fallback to memory:', (err as any)?.message);
  }

  const memUser = memoryUsers.find((u) => u.email.toLowerCase() === normEmail);
  if (memUser) {
    const matches = await bcrypt.compare(password, memUser.password);
    if (matches) {
      return {
        id: memUser.id,
        name: memUser.name,
        email: memUser.email,
        role: memUser.role,
        phone: memUser.phone,
        college: memUser.college,
        department: memUser.department,
      };
    }
  }

  return null;
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  college?: string;
  department?: string;
  goals?: string;
}): Promise<any> {
  const normEmail = data.email.trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(data.password, 10);

  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
      // Check existing
      const existing = await prisma.user.findUnique({ where: { email: normEmail } });
      if (existing) {
        throw new Error('An account with this email already exists.');
      }

      const created = await prisma.user.create({
        data: {
          name: data.name.trim(),
          email: normEmail,
          password: hashedPassword,
          phone: data.phone?.trim() || null,
          college: data.college?.trim() || null,
          department: data.department?.trim() || null,
          role: 'student',
        },
      });

      // Also create StudentRegistration record for comprehensive tracking
      if (data.phone && data.college && data.department) {
        await prisma.studentRegistration.upsert({
          where: { email: normEmail },
          update: {},
          create: {
            name: data.name.trim(),
            email: normEmail,
            whatsappNumber: data.phone.trim(),
            collegeName: data.college.trim(),
            department: data.department.trim(),
            goals: data.goals?.trim() || 'Internship preparation and real-world tech experience.',
          },
        }).catch(() => null);
      }

      // Sync candidate to MongoDB for immediate exam eligibility
      try {
        await dbConnect();
        await MongoUser.findOneAndUpdate(
          { email: normEmail },
          {
            email: normEmail,
            fullName: data.name.trim(),
            mobile: data.phone?.trim() || '',
            whatsapp: data.phone?.trim() || '',
            college: data.college?.trim() || 'Campus Partner',
            department: data.department?.trim() || 'Engineering',
            password: hashedPassword,
            role: 'student',
          },
          { upsert: true, new: true }
        );
      } catch (mErr) {
        console.warn('MongoDB candidate sync deferred:', mErr);
      }

      return {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        phone: created.phone,
        college: created.college,
        department: created.department,
      };
    }
  } catch (err: any) {
    if (err.message?.includes('already exists')) throw err;
    console.warn('Prisma register fallback to memory:', err?.message);
  }

  // Memory fallback
  if (memoryUsers.some((u) => u.email.toLowerCase() === normEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const newMemUser = {
    id: `usr-${Date.now()}`,
    name: data.name.trim(),
    email: normEmail,
    password: hashedPassword,
    role: 'student' as const,
    phone: data.phone?.trim(),
    college: data.college?.trim(),
    department: data.department?.trim(),
    goals: data.goals?.trim(),
    createdAt: new Date().toISOString(),
  };

  memoryUsers.push(newMemUser);
  return {
    id: newMemUser.id,
    name: newMemUser.name,
    email: newMemUser.email,
    role: newMemUser.role,
    phone: newMemUser.phone,
    college: newMemUser.college,
    department: newMemUser.department,
  };
}

export async function getAllStudentsForAdmin(): Promise<StudentRecord[]> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
      const [users, registrations] = await Promise.all([
        prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.studentRegistration.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
      ]);

      const map = new Map<string, StudentRecord>();

      registrations.forEach((r: any) => {
        map.set(r.email.toLowerCase(), {
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.whatsappNumber,
          college: r.collegeName,
          department: r.department,
          goals: r.goals,
          role: 'student',
          createdAt: r.createdAt.toISOString(),
        });
      });

      users.forEach((u: any) => {
        const key = u.email.toLowerCase();
        const existing = map.get(key);
        map.set(key, {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || existing?.phone || '',
          college: u.college || existing?.college || '',
          department: u.department || existing?.department || '',
          goals: existing?.goals || 'Account Login',
          role: u.role as 'student' | 'admin',
          createdAt: u.createdAt.toISOString(),
        });
      });

      return Array.from(map.values());
    }
  } catch (err) {
    console.warn('Prisma student fetch fallback to memory:', (err as any)?.message);
  }

  return memoryUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    college: u.college || '',
    department: u.department || '',
    goals: u.goals || 'Account Registration',
    role: u.role,
    createdAt: u.createdAt || new Date().toISOString(),
  }));
}
