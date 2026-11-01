import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/jwt';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  // Clear custom JWT cookie
  response.cookies.delete(COOKIE_NAME);
  // Clear NextAuth session cookies
  response.cookies.delete('next-auth.session-token');
  response.cookies.delete('__Secure-next-auth.session-token');
  response.cookies.delete('next-auth.csrf-token');
  response.cookies.delete('next-auth.callback-url');
  return response;
}

