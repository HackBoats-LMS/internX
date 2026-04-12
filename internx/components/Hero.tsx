import React from 'react';
import Header from './Header';
import OrbitSystem from './OrbitSystem';

const Hero = () => {
  return (
    <div className="relative w-full lg:min-h-screen flex flex-col pt-4">
      {/* Background glowing gradients */}
      {/* Left glow (Matched perfectly to Right glow scale/intensity) */}
      <div className="absolute top-[80%] left-[-5%] -translate-y-1/2 w-[650px] h-[650px] bg-[#ff1a1a]/50 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[120%] left-[-10%] -translate-y-1/2 w-[450px] h-[450px] bg-[#ff1a1a]/50 blur-[150px] rounded-full pointer-events-none z-0" />
      
      {/* Right glow */}
      <div className="absolute top-[0%] right-[-5%] -translate-y-1/2 w-[650px] h-[650px] bg-[#ff1a1a]/50 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[-20%] right-[-10%] w-[450px] h-[450px] bg-[#ff1a1a]/50 blur-[150px] rounded-full pointer-events-none z-0" />

      <Header />

      {/* Hero Content */}
      <main className="flex-1 w-full max-w-[1500px] mx-auto px-6 lg:px-16 flex flex-col lg:flex-row items-center justify-center lg:justify-between py-10 lg:py-0 relative z-10 pt-4 lg:pt-0">
        
        {/* Left Section - Typography */}
        <div className="w-full lg:w-1/2 flex flex-col items-center gap-4 lg:gap-6 z-20 mt-6 lg:mt-0 relative">
          <h1 className="text-[1.65rem] sm:text-4xl lg:text-[40px] leading-[1.15] font-semibold tracking-wide text-center text-white w-full">
            Stop Collecting Certificates.<br />
            Start Shipping Products
          </h1>
          <p className="text-[14px] sm:text-[17px] text-white/70 max-w-[480px] text-center font-light leading-relaxed">
            Onboard to a simulated engineering floor and build the real-world portfolio that actually gets you hired.
          </p>
          <div className="flex flex-row gap-3 sm:gap-5 mt-2 lg:mt-4">
            <button className="bg-[#ff1a1a] hover:bg-[#ff3333] transition-colors text-white rounded-full px-9 sm:px-10 py-3 sm:py-3.5 text-[15px] sm:text-[15px] font-medium">
              Get Started
            </button>
            <button className="border border-white hover:bg-white/10 transition-colors text-white rounded-full px-9 sm:px-10 py-3 sm:py-3.5 text-[15px] sm:text-[15px] font-medium">
              Explore
            </button>
          </div>
        </div>

        {/* Right Section - Orbits and Avatars */}
        <div className="hidden lg:flex w-full lg:w-1/2 justify-center items-center lg:mt-0 relative lg:min-h-[600px] z-10">
          <OrbitSystem />
        </div>
      </main>
    </div>
  );
};

export default Hero;
