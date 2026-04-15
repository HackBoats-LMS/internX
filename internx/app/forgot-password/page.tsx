import { requestOTP } from '@/app/actions/auth'
import Link from 'next/link'

export default async function ForgotPasswordPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-sm p-8 bg-[#111] rounded-2xl shadow-2xl border border-white/5">
        <h2 className="text-2xl font-bold text-center mb-2 text-white tracking-tight">Forgot Password</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Enter your email and we'll send you a 6-digit OTP to reset your password.</p>
        
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1" htmlFor="email">Email Address</label>
            <input
              className="px-4 py-2.5 bg-black border border-white/10 text-white placeholder-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff1a1a] focus:border-transparent transition-all"
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <button
            formAction={requestOTP}
            className="w-full py-3 mt-4 rounded-xl bg-[#ff1a1a] text-white font-bold hover:bg-[#e60000] shadow-lg shadow-[#ff1a1a]/20 transition-all active:scale-[0.98]"
          >
            Send OTP
          </button>

          {searchParams?.message && (
            <p className="mt-4 p-3 bg-red-500/10 text-red-400 text-center text-xs rounded-lg border border-red-500/20">
              {searchParams.message}
            </p>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            Remembered your password?{' '}
            <Link href="/login" className="text-[#ff1a1a] font-bold hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
