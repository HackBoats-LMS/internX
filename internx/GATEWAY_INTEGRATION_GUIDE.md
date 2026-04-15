# Payment Gateway & Google OAuth Integration Guide

This application handles protected authentication natively via Supabase. A custom payment gating mechanism controls user access to the Dashboard route. 

This guide is intended for the developer integrating the external gateway (e.g., Stripe, LemonSqueezy, Razorpay).

## 1. Environment Requirements
Ensure the following are set in your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # Update for production
```

## 2. Google OAuth Integration
We have already added the Google Log in buttons and configured the UI and Code structure to hit Supabase. 

**Steps to activate:**
1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create an **OAuth Client ID** (Web application).
3. Set the **Authorized redirect URI** to: `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
4. Copy your `Client ID` and `Client Secret`.
5. Go to your [Supabase Dashboard](https://supabase.com/dashboard) -> **Authentication** -> **Providers** -> **Google** and paste the keys in.
Everything is successfully mapped in the frontend.

## 3. How the Payment Flow Works
When a user signs up via Email/Password or uses Google OAuth, they do not inherently have "paid" access. 

- `app/dashboard/page.tsx` checks `user.user_metadata.payment_status`.
- If the status is not `"paid"`, the user is **seamlessly redirected** to `/payment`.

## 4. Where to integrate your Gateway Checkout
Located in `app/payment/page.tsx`:
```tsx
{/* 
  Here, the servicer will integrate the Gateway provider checkout button
  e.g., Stripe Checkout SDK, Razorpay pop-up, or a redirect to an external hosted checkout.
*/}
```
1. Embed your pop-up checkout here, or route the user to a Hosted Checkout Session.
2. Ensure you pass `user.id` and the selected plan's duration mapping into your checkout intent / subscription payload metadata! E.g. in Stripe: `metadata: { userId: user.id, duration_months: 6 }`.

## 5. Capturing Gateway Webhooks
Your gateway will signal when the user successfully pays. 

1. Route your webhook URL to our handler endpoint: `https://your-domain.com/api/webhooks/payment`
2. Update the payload logic inside `app/api/webhooks/payment/route.ts` to verify the payload signature of your specific gateway.
3. Once verified, parse out the `userId` and `duration_months` from the intent metadata.
4. The file already includes the execution block that utilizes the `SUPABASE_SERVICE_ROLE_KEY` to update the user's `raw_user_meta_data`, calculating the expiration string format!
   
```typescript
const validUntil = new Date();
validUntil.setMonth(validUntil.getMonth() + duration_months);

await supabaseAdmin.auth.admin.updateUserById(
  userId,
  { user_metadata: { 
      payment_status: 'paid',
      subscription_valid_until: validUntil.toISOString()
    } 
  }
);
```

As soon as the gateway pings the webhook and that code evaluates, the user will be instantly capable of viewing the dashboard without being redirected.
