import { login } from '@/app/actions/auth'
import Link from 'next/link'
import { SocialAuth } from '@/components/SocialAuth'

export default async function LoginPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-sm p-8 bg-[#111] rounded-2xl shadow-2xl border border-white/5">
        <h2 className="text-2xl font-bold text-center mb-6 text-white tracking-tight">Welcome Back</h2>
        
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1" htmlFor="email">Email</label>
            <input
              className="px-4 py-2.5 bg-black border border-white/10 text-white placeholder-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff1a1a] focus:border-transparent transition-all"
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400" htmlFor="password">Password</label>
              <Link href="/forgot-password" size="sm" className="text-[10px] uppercase font-bold text-[#ff1a1a] hover:underline">Forgot?</Link>
            </div>
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
            formAction={login}
            className="w-full py-3 mt-4 rounded-xl bg-[#ff1a1a] text-white font-bold hover:bg-[#e60000] shadow-lg shadow-[#ff1a1a]/20 transition-all active:scale-[0.98]"
          >
            Log In
          </button>

          <SocialAuth />

          {searchParams?.message && (
            <p className="mt-4 p-3 bg-red-500/10 text-red-400 text-center text-xs rounded-lg border border-red-500/20">
              {searchParams.message}
            </p>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#ff1a1a] font-bold hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
