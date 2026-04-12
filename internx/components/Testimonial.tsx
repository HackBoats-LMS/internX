import React from 'react';
import Image from 'next/image';

const Testimonial = () => {
  return (
    <section className="w-full flex justify-center py-14 sm:py-20 relative z-10">
      <div className="max-w-3xl flex flex-col items-center text-center px-6">
        <h2 className="text-[26px] sm:text-[32px] font-semibold text-white mb-10 sm:mb-12">Listen to our students</h2>
        
        <div className="flex items-center gap-6 sm:gap-10">
          {/* Left Chevron */}
          <button className="text-gray-400 hover:text-white transition-colors">
            <svg width="24" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          
          {/* Profile */}
          <div className="flex flex-col items-center">
            <div className="w-[84px] h-[84px] rounded-full border-2 border-gray-700 overflow-hidden mb-4 bg-gray-800 shadow-xl">
              <Image src="/avatar_2_1775365411548.png" alt="Student" width={84} height={84} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-semibold tracking-wide">k.Prasad</h3>
          </div>
          
          {/* Right Chevron */}
          <button className="text-gray-400 hover:text-white transition-colors">
            <svg width="24" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
        
        <p className="mt-8 text-gray-400 text-[18px] leading-relaxed max-w-[500px] font-medium">
          "This is the best platform I've seen—its unique teaching style aligns with industry needs and has greatly improved me."
        </p>
        
        <button className="mt-12 bg-[#ff1a1a] hover:bg-[#ff3333] transition-colors text-white rounded-full px-12 py-3.5 text-[16px] font-medium shadow-[0_0_25px_rgba(255,26,26,0.5)]">
          Get Started
        </button>
      </div>
    </section>
  );
};

export default Testimonial;
