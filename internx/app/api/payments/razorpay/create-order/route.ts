import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/jwt';
import { getCourses } from '@/lib/coursesService';
import { razorpay } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to initiate payment' },
        { status: 401 }
      );
    }

    const { courseId, isRenewal } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: 'Course ID is required' },
        { status: 400 }
      );
    }

    // 1. Fetch course details from server-side cache (CRITICAL SECURITY: never trust client-sent amounts)
    const courses = await getCourses();
    const course = courses.find((c) => c.id === courseId || c.slug === courseId);

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // 2. Compute exact price on the server
    const payableAmount = isRenewal ? course.renewalCost : course.cost;
    const amountInPaise = Math.round(payableAmount * 100); // Razorpay requires amount in paise (INR)

    if (amountInPaise <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    // 3. Unique server-side receipt ID
    const receipt = `rcpt_${session.id.slice(0, 8)}_${Date.now()}`;

    // 4. Create Order with Razorpay Server API
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        notes: {
          userId: session.id,
          userEmail: session.email,
          courseId: course.id,
          courseSlug: course.slug,
          courseTitle: course.title,
          isRenewal: String(Boolean(isRenewal)),
        },
      });
    } catch (rzpErr: any) {
      // Sandbox/demo mock mode is opt-in only (local/dev). In production a failed
      // order creation must surface as an error, not fabricate a fake order id
      // (which would otherwise be trusted by the verify endpoint).
      if (process.env.ALLOW_DEMO_PAYMENTS !== 'true') {
        console.error('Razorpay order creation failed:', rzpErr?.message);
        return NextResponse.json(
          { success: false, message: 'Unable to create payment order. Please try again later.' },
          { status: 502 }
        );
      }
      console.warn('Razorpay order creation fallback (demo mode):', rzpErr?.message);
      // Seamless demo fallback if live gateway credentials are in sandbox
      razorpayOrder = {
        id: `order_demo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        status: 'created',
      };
    }

    return NextResponse.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
      },
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_internx_demo_key',
      course: {
        id: course.id,
        title: course.title,
        cost: payableAmount,
        isRenewal: Boolean(isRenewal),
      },
      prefill: {
        name: session.name || '',
        email: session.email || '',
        contact: session.phone || '',
      },
    });
  } catch (error: any) {
    console.error('Create Razorpay order error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
