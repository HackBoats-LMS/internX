import React from 'react';

const Header = () => {
  return (
    <header className="flex justify-between items-center w-full px-[5vw] lg:px-16 py-5 lg:py-8 relative z-20">
      <div className="font-bold tracking-wide flex items-center" style={{ fontSize: 'clamp(1.4rem, 4vw, 1.75rem)' }}>
        <span className="text-white">intern</span>
        <span className="text-[#ff1a1a]">X</span>
      </div>
      <button
        className="border border-white hover:bg-white/10 transition-colors text-white rounded-full font-medium"
        style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)', padding: 'clamp(0.4rem, 1.5vw, 0.6rem) clamp(1rem, 4vw, 2rem)' }}
      >
        Login
      </button>
    </header>
  );
};

export default Header;
