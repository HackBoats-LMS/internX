import { NextResponse } from 'next/server';
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay';
import { enrollOrRenewCourse, recordPaymentTransaction, getCourses } from '@/lib/coursesService';

// Disable default body parser to access raw byte string for webhook HMAC-SHA256 signature
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, message: 'Missing webhook signature header' },
        { status: 400 }
      );
    }

    // 1. Strict Webhook Signature Verification against raw payload
    const isValid = verifyRazorpayWebhookSignature({ rawBody, signature });
    if (!isValid) {
      console.warn('[SECURITY] Invalid Razorpay webhook signature attempt.');
      return NextResponse.json(
        { success: false, message: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // 2. Handle Payment Captured
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderNotes = paymentEntity?.notes || payload.payload?.order?.entity?.notes || {};

      const userId = orderNotes.userId;
      const userEmail = orderNotes.userEmail || paymentEntity?.email;
      const courseId = orderNotes.courseId;
      const isRenewal = orderNotes.isRenewal === 'true';

      if (userId && courseId) {
        // Idempotency guard: prevent duplicate fulfillment if Razorpay retries webhook
        const paymentId = paymentEntity?.id;
        if (paymentId) {
          const { findTransactionByPaymentId } = await import('@/lib/coursesService');
          const existing = await findTransactionByPaymentId(paymentId);
          if (existing) {
            console.log(`[Razorpay Webhook] Payment ${paymentId} already processed. Skipping duplicate.`);
            return NextResponse.json({ status: 'ok', alreadyProcessed: true });
          }
        }

        const courses = await getCourses();
        const course = courses.find((c) => c.id === courseId || c.slug === courseId);

        if (course) {
          const amountPaid = isRenewal ? course.renewalCost : course.cost;
          const receiptNumber = `WEBHOOK-INV-${Date.now().toString().slice(-6)}`;

          await enrollOrRenewCourse(
            userId,
            userEmail || 'webhook_student@internx.com',
            'Enrolled Student',
            course.id,
            isRenewal
          );

          await recordPaymentTransaction({
            userId,
            userEmail: userEmail || 'student@internx.com',
            courseId: course.id,
            courseTitle: course.title,
            amount: amountPaid,
            currency: paymentEntity?.currency || 'INR',
            razorpayOrderId: paymentEntity?.order_id || 'webhook_order',
            razorpayPaymentId: paymentEntity?.id || `pay_${Date.now()}`,
            receiptNumber,
            status: 'captured',
            isRenewal,
          });

          console.log(`[Razorpay Webhook] Successfully processed payment for user ${userId}, course ${course.id}`);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Razorpay webhook processing error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
