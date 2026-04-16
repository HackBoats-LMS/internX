import { getSession } from '@/app/actions/auth'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login')
  }

  const supabase = await createClient();
  // Fetch from the custom public.users table
  const { data: userRecord } = await supabase
    .from('users')
    .select('payment_status, subscription_valid_until, full_name, email')
    .eq('id', session.userId)
    .single();

  // Enforce access control based on payment status
  if (!userRecord || userRecord.payment_status !== 'paid') {
    redirect('/payment');
  }

  const displayName = userRecord?.full_name || session.email;

  return (
    <div className="max-w-[1400px] mx-auto px-[5vw] lg:px-16 py-12 min-h-[70vh]">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to your Dashboard</h1>
        <p className="text-gray-600 mt-2 text-lg">Hello, {displayName}!</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder course items */}
        {[1, 2, 3].map((item) => (
          <div key={item} className="p-6 bg-white rounded-xl shadow-md border border-gray-100 flex flex-col gap-4 hover:shadow-xl transition-shadow">
            <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 font-medium">Course Thumbnail</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Premium Course {item}</h3>
            <p className="text-sm text-gray-600 flex-grow">This content is unlocked because your account is marked as 'paid'. Dive in and start your journey.</p>
            <button className="py-2.5 rounded-lg bg-[#1a1a1a] text-white font-semibold hover:bg-[#ff1a1a] transition-colors mt-2">
              Start Learning
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
