import React from 'react';

const StepCard = ({ step, title, desc, SVGContent }: { step: string, title: string, desc: string, SVGContent: React.ReactNode }) => (
  <div className="bg-[#e4e3dc] text-[#1a1a1a] w-full h-[410px] rounded-[1.5rem] pt-10 pb-8 px-5 lg:px-6 flex flex-col items-center text-center shadow-xl relative overflow-hidden group">
    <span className="text-[26px] font-bold mb-1 tracking-tight">{step}</span>
    <h3 className="text-[22px] font-bold tracking-tight mb-3">{title}</h3>
    <p className="text-[14px] text-gray-700 font-semibold leading-snug px-1 max-w-[220px]">{desc}</p>
    
    <div className="mt-auto w-[85%] max-w-[210px] aspect-square relative opacity-100 transition-transform duration-500 group-hover:scale-105">
      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className="absolute bottom-0 left-0">
         {/* Background Grid - Solid precision blocks with tight gaps */}
         <g stroke="#ffffff" strokeWidth="3.5" strokeDasharray="14 6" opacity="0.85" strokeLinecap="butt">
           {/* Horizontals */}
           <line x1="13" y1="10" x2="87" y2="10" />
           <line x1="13" y1="30" x2="87" y2="30" />
           <line x1="13" y1="50" x2="87" y2="50" />
           <line x1="13" y1="70" x2="87" y2="70" />
           <line x1="13" y1="90" x2="87" y2="90" />
           {/* Verticals */}
           <line x1="10" y1="13" x2="10" y2="87" strokeDasharray="14 6" />
           <line x1="30" y1="13" x2="30" y2="87" strokeDasharray="14 6" />
           <line x1="50" y1="13" x2="50" y2="87" strokeDasharray="14 6" />
           <line x1="70" y1="13" x2="70" y2="87" strokeDasharray="14 6" />
           <line x1="90" y1="13" x2="90" y2="87" strokeDasharray="14 6" />
         </g>
         {SVGContent}
      </svg>
    </div>
  </div>
);

export default StepCard;
