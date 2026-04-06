"use client";

import React from 'react';

const StepCard = ({ step, title, desc, SVGContent }: { step: string, title: string, desc: string, SVGContent: React.ReactNode }) => {
  const glyphStyles = `
    @keyframes glyphPulse {
      0%, 100% { opacity: 0.3; }
      20%, 60% { opacity: 1; }
    }
    .glyph-card .glyph-line {
      opacity: 1;
      transition: opacity 0.3s ease;
    }
    .glyph-card:hover .glyph-line {
      animation: glyphPulse 2s ease-in-out infinite;
    }
    .glyph-card:hover .glyph-line:nth-child(1) { animation-delay: 0s; }
    .glyph-card:hover .glyph-line:nth-child(2) { animation-delay: 0.1s; }
    .glyph-card:hover .glyph-line:nth-child(3) { animation-delay: 0.2s; }
    .glyph-card:hover .glyph-line:nth-child(4) { animation-delay: 0.3s; }
    .glyph-card:hover .glyph-line:nth-child(5) { animation-delay: 0.4s; }
    .glyph-card:hover .glyph-line:nth-child(6) { animation-delay: 0.5s; }
    .glyph-card:hover .glyph-line:nth-child(7) { animation-delay: 0.6s; }
    .glyph-card:hover .glyph-line:nth-child(8) { animation-delay: 0.7s; }
    .glyph-card:hover .glyph-line:nth-child(9) { animation-delay: 0.8s; }
    .glyph-card:hover .glyph-line:nth-child(10) { animation-delay: 0.9s; }
    .glyph-card:hover .glyph-line:nth-child(11) { animation-delay: 1.0s; }
    .glyph-card:hover .glyph-line:nth-child(12) { animation-delay: 1.1s; }

    .glyph-card .glyph-grid {
      opacity: 0.85;
      transition: 0.4s ease;
    }
    
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: glyphStyles }} />
      <div className="glyph-card group text-[#1a1a1a] w-full h-[410px] pt-10 pb-8 px-5 lg:px-6 flex flex-col items-center text-center shadow-xl relative cursor-pointer z-0">
        <svg
          viewBox="0 0 350 550"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full -z-10"
        >
          <path
            d="M0 26.25C0 4.63 4.63 0 26.25 0H323.75C345.37 0 350 4.63 350 26.25V523.75C350 545.37 345.37 550 323.75 550H26.25C4.63 550 0 545.37 0 523.75V26.25Z"
            fill="#DEDBD4"
          />
        </svg>

        <span className="text-[26px] font-bold mb-1 tracking-tight">{step}</span>
        <h3 className="text-[22px] font-bold tracking-tight mb-3">{title}</h3>
        <p className="text-[14px] text-gray-700 font-semibold leading-snug px-1 max-w-[220px]">{desc}</p>
        
        <div className="mt-auto w-[90%] max-w-[210px] aspect-square relative transition-transform duration-500">
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className="absolute bottom-0 left-0">
            {/* Background Grid */}
            <g className="glyph-grid" stroke="#E9E8E4" strokeWidth="2.5" strokeDasharray="14 6" strokeLinecap="butt">
              <line x1="13" y1="10" x2="87" y2="10" />
              <line x1="13" y1="30" x2="87" y2="30" />
              <line x1="13" y1="50" x2="87" y2="50" />
              <line x1="13" y1="70" x2="87" y2="70" />
              <line x1="13" y1="90" x2="87" y2="90" />
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
    </>
  );
};

export default StepCard;
