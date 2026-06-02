import React from 'react';
import Image from 'next/image';
import MeraEvents from './MeraEvents';

const Testimonial = () => {
  return (
    <section className="w-full flex justify-center py-[clamp(3rem,7vw,5rem)] relative z-10">
      <div className="max-w-3xl flex flex-col items-center text-center px-[5vw]">
        <h2 className="font-semibold text-white mb-8 lg:mb-12" style={{ fontSize: 'clamp(1.3rem, 4vw, 2rem)' }}>
          What Future Engineers Say About InternX
        </h2>

        <div className="flex items-center gap-[clamp(1.5rem,5vw,2.5rem)]">
          <button className="text-gray-400 hover:text-white transition-colors">
            <svg width="24" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>

          <div className="flex flex-col items-center">
            <div className="rounded-full border-2 border-gray-700 overflow-hidden mb-4 bg-gray-800 shadow-xl" style={{ width: 'clamp(64px,12vw,84px)', height: 'clamp(64px,12vw,84px)' }}>
              <Image src="/avatar_2_1775365411548.png" alt="Student" width={84} height={84} className="w-full h-full object-cover" />
            </div>
            <h3 className="font-semibold tracking-wide" style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>k.Prasad</h3>
          </div>

          <button className="text-gray-400 hover:text-white transition-colors">
            <svg width="24" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        <p className="mt-6 lg:mt-8 text-gray-400 leading-relaxed max-w-[500px] font-medium" style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.125rem)' }}>
          "Before InternX, I only watched tutorials. Here, I actually worked on projects with deadlines and team collaboration"
        </p>

        <h2 className='mt-8 lg:mt-10 text-white leading-relaxed max-w-[500px] font-medium' style={{ fontSize: 'clamp(1.3rem, 4vw, 2rem)' }}>"Your Future Won’t Wait."</h2>

        <MeraEvents />
      </div>
    </section>
  );
};

export default Testimonial;
