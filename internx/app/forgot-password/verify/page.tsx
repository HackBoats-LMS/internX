import { resetPasswordWithOTP } from '@/app/actions/auth'
import Link from 'next/link'

export default async function VerifyOTPPage(props: { searchParams: Promise<{ message?: string, email?: string }> }) {
  const searchParams = await props.searchParams;
  const email = searchParams.email || '';

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-sm p-8 bg-[#111] rounded-2xl shadow-2xl border border-white/5">
        <h2 className="text-2xl font-bold text-center mb-2 text-white tracking-tight">Verify OTP</h2>
        <p className="text-sm text-gray-500 text-center mb-6">We've sent a code to {email}. Enter it below along with your new password.</p>
        
        <form className="flex flex-col gap-4">
          <input type="hidden" name="email" value={email} />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1" htmlFor="otp">6-Digit Code</label>
            <input
              className="px-4 py-2.5 bg-black border border-white/10 text-white placeholder-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff1a1a] focus:border-transparent transition-all text-center text-xl tracking-widest font-bold"
              id="otp"
              name="otp"
              type="text"
              maxLength={6}
              placeholder="000000"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1" htmlFor="password">New Password</label>
            <input
              className="px-4 py-2.5 bg-black border border-white/10 text-white placeholder-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff1a1a] focus:border-transparent transition-all"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            formAction={resetPasswordWithOTP}
            className="w-full py-3 mt-4 rounded-xl bg-[#ff1a1a] text-white font-bold hover:bg-[#e60000] shadow-lg shadow-[#ff1a1a]/20 transition-all active:scale-[0.98]"
          >
            Reset Password
          </button>

          {searchParams?.message && (
            <p className="mt-4 p-3 bg-blue-500/10 text-blue-400 text-center text-xs rounded-lg border border-blue-500/20">
              {searchParams.message}
            </p>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            Didn't get the code?{' '}
            <Link href="/forgot-password" className="text-[#ff1a1a] font-bold hover:underline">
              Resend OTP
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
