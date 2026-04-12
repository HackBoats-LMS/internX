import React from 'react';

const Header = () => {
  return (
    <header className="flex justify-between items-center w-full px-8 lg:px-16 py-6 lg:py-8 relative z-20">
      <div className="text-3xl lg:text-2xl font-bold tracking-wide flex items-center">
        <span className="text-white">intern</span>
        <span className="text-[#ff1a1a] relative">X</span>
      </div>
      <button className="border border-white hover:bg-white/10 transition-colors text-white rounded-full px-8 py-2.5 text-[16px] lg:text-[15px] font-medium">
        Login
      </button>
    </header>
  );
};

export default Header;
