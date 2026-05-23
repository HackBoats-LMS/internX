import React from 'react';
import Link from 'next/link';

export default async function Header() {

  return (
    <header className="flex justify-between items-center w-full px-[5vw] lg:px-16 py-5 relative z-20">
      <Link href="/" className="flex items-center">
        <img src="/internx-logo-white.png" alt="internX Logo" className="h-8 lg:h-10 w-auto object-contain" />
      </Link>
    </header>
  );
};
