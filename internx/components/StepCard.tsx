"use client";

import React from 'react';

const StepCard = ({ step, title, desc, SVGContent }: { step: string, title: string, desc: string, SVGContent: React.ReactNode }) => {
  const glyphStyles = `
    @keyframes glyphPulse {
      0%, 100% { opacity: 0.15; }
      20%, 60% { opacity: 1; }
    }
    .glyph-card .glyph-line {
      opacity: 0.15;
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
      transition: opacity 0.4s ease;
    }
    .glyph-card:hover .glyph-grid {
      opacity: 0.4;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: glyphStyles }} />
      <div className="glyph-card group bg-[#e4e3dc] text-[#1a1a1a] w-full h-[410px] rounded-[1.5rem] pt-10 pb-8 px-5 lg:px-6 flex flex-col items-center text-center shadow-xl relative overflow-hidden cursor-pointer">
        <span className="text-[26px] font-bold mb-1 tracking-tight">{step}</span>
        <h3 className="text-[22px] font-bold tracking-tight mb-3">{title}</h3>
        <p className="text-[14px] text-gray-700 font-semibold leading-snug px-1 max-w-[220px]">{desc}</p>
        
        <div className="mt-auto w-[85%] max-w-[210px] aspect-square relative transition-transform duration-500">
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className="absolute bottom-0 left-0">
            {/* Background Grid */}
            <g className="glyph-grid" stroke="#ffffff" strokeWidth="3.5" strokeDasharray="14 6" strokeLinecap="butt">
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
