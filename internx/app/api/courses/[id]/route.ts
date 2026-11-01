import { NextResponse } from 'next/server';
import { updateCourse } from '@/lib/coursesService';
import { getServerSession } from '@/lib/jwt';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updated = await updateCourse(id, {
      title: body.title,
      description: body.description,
      cost: body.cost !== undefined ? Number(body.cost) : undefined,
      renewalCost: body.renewalCost !== undefined ? Number(body.renewalCost) : undefined,
      renewalPeriod: body.renewalPeriod,
      renewalPeriodDays: body.renewalPeriodDays !== undefined ? Number(body.renewalPeriodDays) : undefined,
      features: body.features,
      isLive: body.isLive,
    });

    return NextResponse.json({ success: true, course: updated });
  } catch (error: any) {
    console.error('Update course error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update course' },
      { status: 500 }
    );
  }
}
