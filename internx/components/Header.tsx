'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LogIn, LayoutDashboard, LogOut } from 'lucide-react';

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Header() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.user) {
            setUser(data.user);
          }
        }
      } catch {
        // Not authenticated
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      await signOut({ redirect: false });
      setUser(null);
      window.location.href = '/';
    } catch {
      window.location.href = '/login';
    }
  };

  const handleCoursesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('courses');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = 'courses';
      }
    }
  };

  return (
    <header className="flex justify-between items-center w-full px-[5vw] lg:px-16 py-5 relative z-30">
      {/* Logo */}
      <Link href="/" className="flex items-center group transition-transform hover:scale-[1.02]">
        {/* Mobile Logo */}
        <Image
          src="/internx-logo.png"
          alt="internX Logo"
          className="block md:hidden h-8 w-auto object-contain"
          width={100}
          height={32}
          priority
        />
        {/* Desktop/Tablet Logo */}
        <Image
          src="/internx-logo-white.png"
          alt="internX Logo"
          className="hidden md:block h-8 lg:h-10 w-auto object-contain"
          width={120}
          height={40}
          priority
        />
      </Link>

      {/* Navigation & Login */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Course Link - Smooth scrolls to #courses */}
        <Link
          href="/#courses"
          onClick={handleCoursesClick}
          className="text-xs sm:text-sm font-medium text-white/75 hover:text-white transition-colors px-3 py-1.5 cursor-pointer"
        >
          Courses
        </Link>

        {isLoading ? (
          <div className="h-9 w-20 rounded-full bg-white/[0.04] animate-pulse" />
        ) : user ? (
          /* User is Logged In */
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={user.role === 'admin' ? '/admin' : '/dashboard'}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold py-2 px-4 rounded-full bg-gradient-to-r from-[#ff1a1a] to-[#d60000] hover:from-[#ff3333] hover:to-[#ff1a1a] text-white shadow-lg shadow-[#ff1a1a]/25 transition-all hover:scale-105"
            >
              <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{user.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}</span>
            </Link>

            <button
              onClick={handleLogout}
              title="Logout"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* User is Logged Out - Clean Login Button (no signup icon/button) */
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold py-2 px-5 rounded-full bg-[#ff1a1a] hover:bg-[#ff3333] active:bg-[#e60000] text-white shadow-lg shadow-[#ff1a1a]/30 hover:shadow-[#ff1a1a]/50 transition-all cursor-pointer hover:scale-105"
          >
            <LogIn className="w-4 h-4 text-white" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </header>
  );
}
