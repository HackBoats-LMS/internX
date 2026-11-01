import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/usersService';
import { signToken, COOKIE_NAME } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // Brute-force & spam registration protection: max 10 signups per 5 mins per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'ip-client';
    const rateCheck = checkRateLimit(`signup_${ip}`, 10, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many signup attempts. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, password, phone, college, department, goals } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const user = await registerUser({
      name,
      email,
      password,
      phone,
      college,
      department,
      goals,
    });

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      college: user.college,
      department: user.department,
      phone: user.phone,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully! Welcome to internX.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirectTo: '/dashboard',
    }, { status: 201 });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Registration failed.' },
      { status: 400 }
    );
  }
}
