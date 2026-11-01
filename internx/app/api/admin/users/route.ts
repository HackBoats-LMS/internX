import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/jwt';
import { getAllStudentsForAdmin, registerUser } from '@/lib/usersService';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const students = await getAllStudentsForAdmin();
    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, phone, college, department, goals } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, message: 'Name and email are required.' }, { status: 400 });
    }

    const created = await registerUser({
      name,
      email,
      password: password || 'ExamStudent@2026',
      phone: phone || '',
      college: college || 'Campus Partner',
      department: department || 'Engineering',
      goals: goals || 'Exam Assessment Candidate',
    });

    return NextResponse.json({
      success: true,
      message: 'Student candidate added and verified for examination successfully!',
      student: created,
    });
  } catch (error: any) {
    console.error('Admin add student error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Failed to add student candidate' }, { status: 500 });
  }
}
