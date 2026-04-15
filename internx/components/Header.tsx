import React from 'react';
import Link from 'next/link';
import { getSession, logout } from '@/app/actions/auth';

export default async function Header() {
  const session = await getSession();

  return (
    <header className="flex justify-between items-center w-full px-[5vw] lg:px-16 py-5 relative z-20">
      <Link href="/" className="font-bold tracking-wide flex items-center" style={{ fontSize: 'clamp(1.4rem, 4vw, 1.75rem)' }}>
        <span className="text-white">intern</span>
        <span className="text-[#ff1a1a]">X</span>
      </Link>
      <div className="flex gap-4 items-center">
        {!session ? (
          <Link
            href="/login"
            className="border border-white hover:bg-white/10 transition-colors text-white rounded-full font-medium hover:cursor-pointer"
            style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)', padding: 'clamp(0.4rem, 1.5vw, 0.6rem) clamp(1rem, 4vw, 2rem)' }}
          >
            Login
          </Link>
        ) : (
          <>
            <Link
              href="/dashboard"
              className="text-white hover:text-[#ff1a1a] transition-colors font-medium text-sm lg:text-base"
            >
              Dashboard
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="border border-red-500 hover:bg-red-500 text-red-500 hover:text-white transition-colors rounded-full font-medium hover:cursor-pointer"
                style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)', padding: 'clamp(0.4rem, 1.5vw, 0.6rem) clamp(1rem, 4vw, 2rem)' }}
              >
                Logout
              </button>
            </form>
          </>
        )}
      </div>
    </header>
  );
};
