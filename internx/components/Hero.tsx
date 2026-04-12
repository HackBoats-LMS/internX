import React from 'react';
import Header from './Header';
import OrbitSystem from './OrbitSystem';

const Hero = () => {
  return (
    <div className="relative w-full lg:min-h-screen flex flex-col pt-4">
      {/* Background glowing gradients */}
      <div className="absolute top-[80%] left-[-5%] -translate-y-1/2 w-[650px] h-[650px] bg-[#ff1a1a]/50 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[120%] left-[-10%] -translate-y-1/2 w-[450px] h-[450px] bg-[#ff1a1a]/50 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[0%] right-[-5%] -translate-y-1/2 w-[650px] h-[650px] bg-[#ff1a1a]/50 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[-20%] right-[-10%] w-[450px] h-[450px] bg-[#ff1a1a]/50 blur-[150px] rounded-full pointer-events-none z-0" />

      <Header />

      {/* Hero Content */}
      <main className="flex-1 w-full max-w-[1500px] mx-auto px-[5vw] lg:px-16 flex flex-col lg:flex-row items-center justify-center lg:justify-between py-10 lg:py-0 relative z-10 lg:pt-0">

        {/* Left Section - Typography */}
        <div className="w-full lg:w-1/2 flex flex-col items-center gap-[clamp(0.75rem,2vw,1.5rem)] z-20 mt-4 lg:mt-0 relative">
          <h1
            className="font-semibold tracking-wide text-center text-white w-full leading-[1.15]"
            style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)' }}
          >
            Stop Collecting Certificates.<br />
            Start Shipping Products
          </h1>
          <p
            className="text-white/70 text-center font-light leading-relaxed max-w-[480px]"
            style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)' }}
          >
            Onboard to a simulated engineering floor and build the real-world portfolio that actually gets you hired.
          </p>
          <div className="flex flex-row gap-[clamp(0.6rem,2vw,1.25rem)] mt-1 lg:mt-4">
            <button
              className="bg-[#ff1a1a] hover:bg-[#ff3333] transition-colors text-white rounded-full font-medium"
              style={{ fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', padding: 'clamp(0.55rem, 1.5vw, 0.875rem) clamp(1.5rem, 4vw, 2.5rem)' }}
            >
              Get Started
            </button>
            <button
              className="border border-white hover:bg-white/10 transition-colors text-white rounded-full font-medium"
              style={{ fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', padding: 'clamp(0.55rem, 1.5vw, 0.875rem) clamp(1.5rem, 4vw, 2.5rem)' }}
            >
              Explore
            </button>
          </div>
        </div>

        {/* Right Section - Orbits and Avatars — desktop only */}
        <div className="hidden lg:flex w-full lg:w-1/2 justify-center items-center relative lg:min-h-[600px] z-10">
          <OrbitSystem />
        </div>
      </main>
    </div>
  );
};

export default Hero;
