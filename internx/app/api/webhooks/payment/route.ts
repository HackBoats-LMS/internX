import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Admin client to bypass RLS and update user metadata
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: Request) {
  try {
    const event = await req.json();

    // Servicer can replace 'payment.success' Event Type with their gateway's actual payload type
    if (event.type === 'payment.success') {
      const userId = event.data.userId; // Payment intent metadata should include user id
      const purchasedMonths = event.data.duration_months || 6; // Default to 6 months if not specified
      
      if (!userId) {
        return NextResponse.json({ error: 'User ID missing from webhook payload metadata' }, { status: 400 });
      }

      // Calculate the expiration date
      const validUntil = new Date();
      validUntil.setMonth(validUntil.getMonth() + purchasedMonths);

      // Update the public.users table to set subscription_valid_until and payment_status
      const { error } = await supabaseAdmin
        .from('users')
        .update({ 
          payment_status: 'paid',
          subscription_valid_until: validUntil.toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw new Error(error.message);
      }
      
      // Bonus trigger Email Provider API to send receipt goes here...
      return NextResponse.json({ received: true, status: 'Payment recognized and user authorized' });
    }
    
    if (event.type === 'payment.failed') {
      const userId = event.data.userId;
      if (userId) {
        await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { user_metadata: { payment_status: 'unpaid' } }
        );
      }
      return NextResponse.json({ received: true, status: 'Payment failure handled' });
    }

    return NextResponse.json({ received: true, message: 'Event ignored' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Webhook Handler Failed', details: error.message }, { status: 500 });
  }
}
