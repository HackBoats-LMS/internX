import React from 'react';
import Image from 'next/image';
import MeraEvents from './MeraEvents';

const Testimonial = () => {
  return (
    <section className="w-full flex justify-center relative z-10">
      <div className="max-w-3xl flex flex-col items-center text-center">
        <h2 className='text-white leading-relaxed max-w-[500px] font-medium' style={{ fontSize: 'clamp(1.3rem, 4vw, 2rem)' }}>"Your Future Won’t Wait."</h2>
        <MeraEvents />
      </div>
    </section>
  );
};

export default Testimonial;
