import { getSession } from '@/app/actions/auth'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PaymentPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await getSession();

  // If logged in, check subscription status
  if (session) {
    const supabase = await createClient();
    const { data: userRecord } = await supabase
      .from('users')
      .select('subscription_valid_until')
      .eq('id', session.userId)
      .single();

    const validUntil = userRecord?.subscription_valid_until;
    if (validUntil && new Date(validUntil) > new Date()) {
      redirect('/dashboard');
    }
  }

  const message = searchParams.message;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12">
      {message && (
        <div className="w-full max-w-sm mb-8 p-4 bg-blue-50 border border-blue-100 text-blue-700 text-sm rounded-xl text-center shadow-sm">
          {message}
        </div>
      )}

      <div className="w-full max-w-4xl text-center mb-10">
        <h2 className="text-4xl font-extrabold mb-4 text-gray-900">Select Your Subscription</h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Choose a plan that fits your goals. Unlock full access to the Dashboard, exclusive materials, and premium support.
        </p>
      </div>

      <div className="flex flex-col items-center gap-8 w-full max-w-sm mx-auto">
        {/* 6 Months Plan - Flat 6000 Rupees */}
        <div className="w-full p-8 bg-[#1a1a1a] rounded-2xl shadow-xl flex flex-col relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#ff1a1a] text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase">Subscription</div>
          <h3 className="text-2xl font-bold text-white mb-2 text-center mt-2">6 Months Plan</h3>
          <div className="text-5xl font-extrabold text-white mb-6 text-center">₹6000</div>
          <ul className="flex flex-col gap-3 text-gray-300 flex-grow mb-8 text-sm px-4">
            <li className="flex items-center gap-2"><svg className="w-5 h-5 text-[#ff1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Full Dashboard Access</li>
            <li className="flex items-center gap-2"><svg className="w-5 h-5 text-[#ff1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> 6 Months Validation</li>
            <li className="flex items-center gap-2"><svg className="w-5 h-5 text-[#ff1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Exclusive Support</li>
          </ul>
          
          {/* Servicer Integration Checkout Hook */}
          {!session ? (
            <Link 
              href="/login" 
              className="w-full py-4 rounded-xl bg-[#1a1a1a] text-white font-bold text-lg hover:bg-black text-center shadow-lg transition-colors block"
            >
              Log in to Complete Payment
            </Link>
          ) : (
            <button className="w-full py-4 rounded-xl bg-[#ff1a1a] text-white font-bold text-lg hover:bg-[#e60000] shadow-lg shadow-[#ff1a1a]/30 transition-colors">
              Proceed to Payment
            </button>
          )}
        </div>
      </div>

      <div className="mt-12 text-center">
        <span className="text-xs text-gray-400 flex items-center justify-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
          Secured by Servicer Gateway Integration
        </span>
        
        {/* Mock testing links */}
        <div className="pt-6 border-t border-gray-200 inline-block w-full max-w-sm">
          <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wider">Dev Testing Only</p>
          <div className="flex justify-center gap-4 text-sm font-semibold">
            <Link href="/payment-success" className="text-green-600 hover:text-green-700 hover:underline">Simulate Success</Link>
            <Link href="/payment-failure" className="text-red-500 hover:text-red-600 hover:underline">Simulate Failure</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
