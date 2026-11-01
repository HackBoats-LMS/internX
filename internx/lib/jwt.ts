import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getServerSession as getNextAuthSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const RAW_JWT_SECRET = process.env.JWT_SECRET
if (!RAW_JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET is not set. Refusing to run in production without it.')
}
const JWT_SECRET = new TextEncoder().encode(
  RAW_JWT_SECRET || 'dev-only-insecure-jwt-secret-do-not-use-in-prod'
);

export const COOKIE_NAME = 'auth_token';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  college?: string;
  department?: string;
  phone?: string;
}

export async function signToken(payload: UserPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<UserPayload | null> {
  try {
    // 1. Check NextAuth session (Google OAuth)
    try {
      const nextAuthSession = await getNextAuthSession(authOptions);
      if (nextAuthSession?.user) {
        return {
          id: (nextAuthSession.user as any).id || nextAuthSession.user.email || 'student-user',
          email: nextAuthSession.user.email || '',
          name: nextAuthSession.user.name || 'Student',
          role: ((nextAuthSession.user as any).role as 'student' | 'admin') || 'student',
        };
      }
    } catch {
      // Ignore NextAuth error if not initialized
    }

    // 2. Check auth_token cookie
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}
