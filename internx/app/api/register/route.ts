import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';
import { getGoalOptions } from '@/lib/goalsService';

export async function GET() {
  // Returns static or dynamic options for registration form
  const goals = await getGoalOptions();
  return NextResponse.json({
    success: true,
    colleges: [],
    departments: [],
    goals,
  });
}

export async function POST(request: Request) {
  try {
    // Protection against automated registration spam: max 10 requests per 5 minutes per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'ip-client';
    const rateCheck = checkRateLimit(`register_${ip}`, 10, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many registration attempts. Please try again in a few minutes.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, whatsappNumber, collegeName, department, goals } = body;

    // Field Validations
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid full name (at least 2 characters).' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!whatsappNumber || typeof whatsappNumber !== 'string' || whatsappNumber.trim().length < 7) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid WhatsApp contact number.' },
        { status: 400 }
      );
    }

    if (!collegeName || typeof collegeName !== 'string' || collegeName.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please select or enter your college name.' },
        { status: 400 }
      );
    }

    if (!department || typeof department !== 'string' || department.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please select or enter your department / degree.' },
        { status: 400 }
      );
    }

    if (!goals || typeof goals !== 'string' || goals.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Please select or share your career goals.' },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          message: 'DATABASE_URL is not set in the environment (.env). Please add your PostgreSQL connection string.',
        },
        { status: 503 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered via Prisma
    const existingRegistration = await prisma.studentRegistration.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingRegistration) {
      return NextResponse.json(
        {
          success: false,
          message: 'A registration with this email address already exists. We will contact you soon!',
        },
        { status: 409 }
      );
    }

    // Insert into PostgreSQL
    const registration = await prisma.studentRegistration.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        whatsappNumber: whatsappNumber.trim(),
        collegeName: collegeName.trim(),
        department: department.trim(),
        goals: goals.trim(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! Welcome to the internX simulation platform.',
        data: {
          id: registration.id,
          name: registration.name,
          email: registration.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Prisma Registration submission error:', error);

    // Prisma Unique Constraint Violation (P2002)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'A registration with this email address already exists.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Something went wrong while processing your registration. Please try again.',
      },
      { status: 500 }
    );
  }
}
