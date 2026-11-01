import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/jwt';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });

  const cookieOptions = {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  };

  // Clear custom JWT cookie
  response.cookies.set(COOKIE_NAME, '', cookieOptions);

  // Clear NextAuth standard session cookies (both secure & non-secure variants)
  const nextAuthCookies = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.csrf-token',
    '__Host-next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url',
    'next-auth.pkce.code_verifier',
  ];

  for (const name of nextAuthCookies) {
    response.cookies.set(name, '', cookieOptions);
    response.cookies.delete(name);
  }

  response.cookies.delete(COOKIE_NAME);

  return response;
}
