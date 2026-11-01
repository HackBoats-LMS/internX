import { NextResponse } from 'next/server';
import { signToken, COOKIE_NAME } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  // SECURITY: This endpoint previously minted a valid session for ANY submitted
  // email with no authentication — a full account-takeover vector. It is now
  // disabled unless ALLOW_DEMO_LOGIN=true (local/dev demo convenience only).
  if (process.env.ALLOW_DEMO_LOGIN !== 'true') {
    return NextResponse.json(
      { success: false, message: 'Google sign-in fallback is disabled. Configure Google OAuth or use email login.' },
      { status: 403 }
    );
  }

  try {
    // In demo mode we IGNORE any client-supplied identity and always mint the
    // fixed demo student, so this cannot be used to impersonate arbitrary users.
    const email = 'student.google@internx.com';
    const name = 'Demo Student';

    let user;
    try {
      user = await prisma.user.upsert({
        where: { email: email.toLowerCase().trim() },
        update: { name },
        create: {
          email: email.toLowerCase().trim(),
          name,
          password: '',
          role: 'student',
        },
      });
    } catch {
      user = {
        id: 'usr-google-student',
        email,
        name,
        role: 'student',
      };
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'student',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'student',
      },
      redirectTo: '/dashboard',
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Login failed' }, { status: 500 });
  }
}
