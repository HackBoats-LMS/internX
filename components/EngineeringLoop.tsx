import React from 'react';
import StepCard from './StepCard';

const EngineeringLoop = () => {
  return (
    <section className="w-full flex justify-center py-[clamp(2rem,5vw,5rem)] relative z-10">
      <div className="max-w-[1300px] w-full px-[5vw] flex flex-col items-center">
        <h2
          className="font-semibold tracking-wide text-center text-[#f8f8f8] mb-3 lg:mb-4"
          style={{ fontSize: 'clamp(1.4rem, 4vw, 2.1rem)' }}
        >
          From Classroom to Command Center
        </h2>
        <p
          className="text-gray-400 text-center font-light mb-[clamp(2rem,5vw,4rem)] max-w-2xl"
          style={{ fontSize: 'clamp(0.85rem, 2vw, 1.05rem)' }}
        >
          The 4-step engineering loop that turns students into teammates.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[clamp(0.75rem,2vw,1.5rem)] w-full">
          <StepCard
            step="01"
            title="Onboarding"
            desc="Choose your role: Dev, Designer, or Tester."
            SVGContent={
              <g stroke="#c50d0d" strokeWidth="2.5" strokeLinecap="butt">
                <line className="glyph-line" x1="13" y1="70" x2="27" y2="70" />
                <line className="glyph-line" x1="30" y1="73" x2="30" y2="87" />
                <line className="glyph-line" x1="15" y1="85" x2="25" y2="75" />
                <line className="glyph-line" x1="33" y1="50" x2="47" y2="50" />
                <line className="glyph-line" x1="50" y1="53" x2="50" y2="67" />
                <line className="glyph-line" x1="35" y1="65" x2="45" y2="55" />
                <line className="glyph-line" x1="53" y1="30" x2="67" y2="30" />
                <line className="glyph-line" x1="70" y1="33" x2="70" y2="47" />
                <line className="glyph-line" x1="55" y1="45" x2="65" y2="35" />
                <line className="glyph-line" x1="73" y1="10" x2="87" y2="10" />
                <line className="glyph-line" x1="90" y1="13" x2="90" y2="27" />
                <line className="glyph-line" x1="75" y1="25" x2="85" y2="15" />
              </g>
            }
          />
          <StepCard
            step="02"
            title="Sprint Planning"
            desc="Receive real-world tickets via a simulated board."
            SVGContent={
              <g stroke="#c50d0d" strokeWidth="2.5" strokeLinecap="butt">
                <line className="glyph-line" x1="33" y1="50" x2="47" y2="50" />
                <line className="glyph-line" x1="53" y1="50" x2="67" y2="50" />
                <line className="glyph-line" x1="50" y1="33" x2="50" y2="47" />
                <line className="glyph-line" x1="50" y1="53" x2="50" y2="67" />
              </g>
            }
          />
          <StepCard
            step="03"
            title="Build & Review"
            desc="Submit your work for a Lead Engineer's critique and code review."
            SVGContent={
              <g strokeWidth="2.5" strokeLinecap="butt">
                <line className="glyph-line" x1="15" y1="85" x2="25" y2="75" stroke="#E9E8E4" />
                <line className="glyph-line" x1="30" y1="53" x2="30" y2="67" stroke="#c50d0d" />
                <line className="glyph-line" x1="33" y1="70" x2="47" y2="70" stroke="#c50d0d" />
                <line className="glyph-line" x1="35" y1="65" x2="45" y2="55" stroke="#c50d0d" />
                <line className="glyph-line" x1="70" y1="33" x2="70" y2="47" stroke="#c50d0d" />
                <line className="glyph-line" x1="53" y1="30" x2="67" y2="30" stroke="#c50d0d" />
                <line className="glyph-line" x1="55" y1="45" x2="65" y2="35" stroke="#c50d0d" />
                <line className="glyph-line" x1="75" y1="25" x2="85" y2="15" stroke="#E9E8E4" />
              </g>
            }
          />
          <StepCard
            step="04"
            title="The Ship"
            desc="Deploy your feature to a production-ready environment."
            SVGContent={
              <g stroke="#c50d0d" strokeWidth="2.5" strokeLinecap="butt">
                <line className="glyph-line" x1="13" y1="70" x2="27" y2="70" />
                <line className="glyph-line" x1="33" y1="50" x2="47" y2="50" />
                <line className="glyph-line" x1="53" y1="30" x2="67" y2="30" />
                <line className="glyph-line" x1="73" y1="10" x2="87" y2="10" />
              </g>
            }
          />
        </div>
      </div>
    </section>
  );
};

export default EngineeringLoop;
