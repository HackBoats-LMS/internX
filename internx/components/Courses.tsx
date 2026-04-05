import React from 'react';

const Courses = () => {
  return (
    <section className="w-full flex justify-center py-10 relative z-10">
      <div className="w-full flex flex-col items-center">
        <h2 className="text-2xl font-semibold tracking-wide text-white mb-8">
          Courses we Offer
        </h2>
        
        {/* Logo Marquee Band */}
        <div className="w-full bg-[#111111] border-y border-gray-800 py-6 overflow-hidden">
          <div className="w-full max-w-[1400px] mx-auto px-4 flex justify-between items-center overflow-x-auto hide-scrollbar gap-8">
            {/* Manually repeating some simple tech logo circles matching the look */}
            {['Git', 'Hub', 'Node', 'Py', 'JS', 'React', 'HTML', 'CSS', 'AWS', 'DB', 'Vue', 'TS', 'Java'].map((tech, idx) => (
              <div key={idx} className="flex-shrink-0 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg border border-gray-300">
                  {/* Generic abstract shapes inside for the logos */}
                  <div className="text-black font-extrabold text-[10px] uppercase">{tech}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Courses;
