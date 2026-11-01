import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/jwt';
import { verifyRazorpayPaymentSignature } from '@/lib/razorpay';
import { enrollOrRenewCourse, recordPaymentTransaction, getCourses, findTransactionByPaymentId } from '@/lib/coursesService';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please sign in to verify payment.' },
        { status: 401 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      isRenewal,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { success: false, message: 'Missing payment verification tokens' },
        { status: 400 }
      );
    }

    // 1. Strict Cryptographic HMAC-SHA256 Signature Verification.
    //    The former "demo order" bypass (auto-trusting any order_demo_* id) is
    //    now gated behind ALLOW_DEMO_PAYMENTS and disabled by default.
    const isDemoOrder = razorpay_order_id.startsWith('order_demo_');
    const demoAllowed = process.env.ALLOW_DEMO_PAYMENTS === 'true';
    let isValidSignature = false;

    if (isDemoOrder && demoAllowed) {
      // Explicit, opt-in sandbox mode only (local/dev). Never enable in production.
      isValidSignature = true;
    } else {
      isValidSignature = verifyRazorpayPaymentSignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature || '',
      });
    }

    if (!isValidSignature) {
      console.error('[SECURITY ALERT] Razorpay signature mismatch detected for user:', session.id);
      return NextResponse.json(
        {
          success: false,
          message:
            'Cryptographic payment verification failed. Untrusted signature received. Transaction aborted.',
        },
        { status: 400 }
      );
    }

    // 1b. Replay protection: if this payment id was already processed, do not
    //     extend the enrollment again — return the original transaction.
    const existingTx = await findTransactionByPaymentId(razorpay_payment_id);
    if (existingTx) {
      return NextResponse.json({
        success: true,
        message: 'This payment was already verified.',
        alreadyProcessed: true,
        transaction: existingTx,
        receiptNumber: existingTx.receiptNumber,
      });
    }

    // 2. Fetch authoritative course data from cache to avoid price tampering
    const courses = await getCourses();
    const course = courses.find((c) => c.id === courseId || c.slug === courseId);
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
    }

    const amountPaid = isRenewal ? course.renewalCost : course.cost;
    const receiptNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    // 3. Activate Enrollment or Renewal in Database
    const enrollment = await enrollOrRenewCourse(
      session.id,
      session.email,
      session.name || 'Verified Student',
      course.id,
      Boolean(isRenewal)
    );

    // 4. Record Immutable Payment Transaction & Printable Invoice Record
    const transaction = await recordPaymentTransaction({
      userId: session.id,
      userEmail: session.email,
      courseId: course.id,
      courseTitle: course.title,
      amount: amountPaid,
      currency: 'INR',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature || 'verified_demo',
      receiptNumber,
      status: 'captured',
      isRenewal: Boolean(isRenewal),
    });

    return NextResponse.json({
      success: true,
      message: isRenewal ? 'Course subscription renewed successfully!' : 'Enrolled successfully!',
      enrollment,
      transaction,
      receiptNumber,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
