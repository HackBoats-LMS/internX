import React from 'react';
import Header from './Header';
import AvatarNode from './AvatarNode';

const Hero = () => {
  return (
    <div className="relative w-full min-h-screen flex flex-col pt-4">
      {/* Background glowing gradients */}
      {/* Left glow (Matched perfectly to Right glow scale/intensity) */}
      <div className="absolute top-[80%] left-[-5%] -translate-y-1/2 w-[650px] h-[650px] bg-[#ff1a1a]/50 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[120%] left-[-10%] -translate-y-1/2 w-[450px] h-[450px] bg-[#ff1a1a]/50 blur-[150px] rounded-full pointer-events-none z-0" />
      
      {/* Right glow */}
      <div className="absolute top-[0%] right-[-5%] -translate-y-1/2 w-[650px] h-[650px] bg-[#ff1a1a]/50 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[-20%] right-[-10%] w-[450px] h-[450px] bg-[#ff1a1a]/50 blur-[150px] rounded-full pointer-events-none z-0" />

      <Header />

      {/* Hero Content */}
      <main className="flex-1 w-full max-w-[1500px] mx-auto px-6 lg:px-16 flex flex-col lg:flex-row items-center justify-between pb-10 relative z-10 pt-10 lg:pt-0">
        
        {/* Left Section - Typography */}
        <div className="w-full lg:w-1/2 flex flex-col items-center gap-6 z-20 mt-10 lg:mt-0 relative">
          <h1 className="text-4xl sm:text-5xl lg:text-[46px] leading-[1.1] font-semibold tracking-wide text-center text-white">
            Stop Collecting Certificates.<br />
            Start Shipping Products
          </h1>
          <p className="text-[17px] text-gray-300 max-w-[480px] text-center font-light leading-relaxed">
            Onboard to a simulated engineering floor and build the real-world portfolio that actually gets you hired.
          </p>
          <div className="flex flex-row gap-5 mt-4">
            <button className="bg-[#ff1a1a] hover:bg-[#ff3333] transition-colors text-white rounded-full px-10 py-3.5 text-[15px] font-medium shadow-[0_0_25px_rgba(255,26,26,0.6)]">
              Get Started
            </button>
            <button className="border border-white hover:bg-white/10 transition-colors text-white rounded-full px-10 py-3.5 text-[15px] font-medium">
              Explore
            </button>
          </div>
        </div>

        {/* Right Section - Orbits and Avatars */}
        <div className="w-full lg:w-1/2 flex justify-center items-center mt-32 lg:mt-0 relative group min-h-[500px] lg:min-h-[600px] z-10">
          <div className="relative w-full max-w-[500px] aspect-square flex justify-center items-center">
             {/* Center Server Icon */}
             <div className="w-[72px] h-[72px] rounded-full border border-gray-400 bg-black/70 flex items-center justify-center z-10 backdrop-blur-md">
               <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-gray-200">
                  <path d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V8C20 9.10457 19.1046 10 18 10H6C4.89543 10 4 9.10457 4 8V6Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 12C4 10.8954 4.89543 10 6 10H18C19.1046 10 20 10.8954 20 12V14C20 15.1046 19.1046 16 18 16H6C4.89543 16 4 15.1046 4 14V12Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 18C4 16.8954 4.89543 16 6 16H18C19.1046 16 20 16.8954 20 18V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V18Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 7H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 7H16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 13H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 13H16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 19H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 19H16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
             </div>
             {/* Orbit Rings */}
             <div className="absolute border-[1.5px] border-white rounded-full w-[140px] h-[140px]" />
             <div className="absolute border-[1.5px] border-white rounded-full w-[240px] h-[240px]" />
             <div className="absolute border-[1.5px] border-white rounded-full w-[360px] h-[360px]" />
             <div className="absolute border-[1.5px] border-white rounded-full w-[480px] h-[480px]" />
             {/* Avatars */}
             <AvatarNode angle={-45} radius={120} name1="UI/UX" name2="DESIGNER" image="/avatar_3_1775365425369.png" badgeColor="bg-[#E91E63]" />
             <AvatarNode angle={-100} radius={180} name1="PRODUCT" name2="MANAGER" image="/avatar_2_1775365411548.png" badgeColor="bg-gray-200" />
             <AvatarNode angle={180} radius={180} name1="SOFTWARE" name2="DEVELOPER" image="/avatar_1_1775365394047.png" badgeColor="bg-gray-400" />
             <AvatarNode angle={135} radius={180} name1="DATA" name2="SCIENTIST" image="/avatar_5_1775365466411.png" badgeColor="bg-[#2196F3]" />
             <AvatarNode angle={0} radius={240} name1="DEVOPS" name2="ENGINEER" image="/avatar_4_1775365449449.png" badgeColor="bg-[#2196F3]" />
             <AvatarNode angle={65} radius={240} name1="Q&A" name2="TESTER" image="/avatar_6_1775365482321.png" badgeColor="bg-[#F44336]" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Hero;
