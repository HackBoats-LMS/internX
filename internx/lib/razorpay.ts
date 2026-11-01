import Razorpay from 'razorpay';
import crypto from 'crypto';

// Razorpay secrets must come from the environment. We do NOT fall back to
// guessable demo strings. If they are missing the client is still constructed
// (so the module imports cleanly) but every signature check fails closed.
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

// Initialize Razorpay client with server-side keys
export const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID || 'rzp_key_not_configured',
  key_secret: RAZORPAY_KEY_SECRET || 'secret_not_configured',
});

/**
 * Verify Razorpay HMAC-SHA256 Payment Signature
 *
 * Security critical:
 * generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret)
 * Must match razorpay_signature using timing-safe comparison to prevent timing attacks.
 */
export function verifyRazorpayPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!orderId || !paymentId || !signature) return false;

  // Fail closed if the secret is not configured — never verify against a default.
  const keySecret = RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  try {
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const signatureBuf = Buffer.from(signature, 'utf8');
    if (expectedBuf.length !== signatureBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  } catch {
    return false;
  }
}

/**
 * Verify Razorpay Webhook Signature
 * Must use the RAW unparsed payload buffer/string
 */
export function verifyRazorpayWebhookSignature({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string;
}): boolean {
  if (!rawBody || !signature) return false;

  // Fail closed if the webhook secret is not configured — never verify against a default fallback.
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  try {
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const signatureBuf = Buffer.from(signature, 'utf8');
    if (expectedBuf.length !== signatureBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  } catch {
    return false;
  }
}
