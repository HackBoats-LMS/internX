import { NextResponse } from 'next/server';
import { getCourses, createCourse } from '@/lib/coursesService';
import { getServerSession } from '@/lib/jwt';

export async function GET() {
  try {
    const courses = await getCourses();
    const response = NextResponse.json({ success: true, courses });
    // Cache for 1 hour, stale-while-revalidate for 1 day
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { title, slug, description, icon, cost, renewalCost, renewalPeriod, renewalPeriodDays, features } = body;

    if (!title || !cost) {
      return NextResponse.json({ success: false, message: 'Title and cost are required.' }, { status: 400 });
    }

    const courseSlug = slug || title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    const created = await createCourse({
      title,
      slug: courseSlug,
      description: description || '',
      icon: icon || 'ai',
      cost: Number(cost),
      renewalCost: Number(renewalCost || Math.round(Number(cost) * 0.4)),
      renewalPeriod: renewalPeriod || '30 Days',
      renewalPeriodDays: Number(renewalPeriodDays || 30),
      features: Array.isArray(features) ? features : [],
      isLive: true,
    });

    return NextResponse.json({ success: true, course: created }, { status: 201 });
  } catch (error: any) {
    console.error('Create course error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Failed to create course' }, { status: 500 });
  }
}
