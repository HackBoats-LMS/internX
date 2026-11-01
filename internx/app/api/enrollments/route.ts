import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/jwt';
import { getUserEnrollments, enrollOrRenewCourse } from '@/lib/coursesService';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const enrollments = await getUserEnrollments(session.id);
    return NextResponse.json({ success: true, enrollments });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to fetch enrollments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Please log in to purchase or renew a course.' }, { status: 401 });
    }

    const { courseId, isRenewal } = await request.json();
    if (!courseId) {
      return NextResponse.json({ success: false, message: 'Course ID is required.' }, { status: 400 });
    }

    const enrollment = await enrollOrRenewCourse(
      session.id,
      session.email,
      session.name,
      courseId,
      Boolean(isRenewal)
    );

    return NextResponse.json({
      success: true,
      message: isRenewal ? 'Course renewed successfully!' : 'Course purchased successfully! Welcome to the internship.',
      enrollment,
    });
  } catch (error: any) {
    console.error('Enrollment error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Transaction failed.' }, { status: 500 });
  }
}
