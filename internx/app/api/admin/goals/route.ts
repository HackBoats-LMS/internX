import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/jwt';
import { getGoalOptions, setGoalOptions } from '@/lib/goalsService';

// Public GET: returns the current goal choices for signup and registration forms
export async function GET() {
  try {
    const goals = await getGoalOptions();
    return NextResponse.json({
      success: true,
      goals,
    });
  } catch (error: any) {
    console.error('Fetch goal options error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch goal options' },
      { status: 500 }
    );
  }
}

// Admin-only POST: update/add/remove goal options dynamically from Admin Panel
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { goals } = body;

    if (!goals || !Array.isArray(goals)) {
      return NextResponse.json(
        { success: false, message: 'Goals list must be an array of strings' },
        { status: 400 }
      );
    }

    const updated = await setGoalOptions(goals);

    return NextResponse.json({
      success: true,
      message: 'Goal options updated successfully!',
      goals: updated,
    });
  } catch (error: any) {
    console.error('Update goal options error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update goal options' },
      { status: 500 }
    );
  }
}

