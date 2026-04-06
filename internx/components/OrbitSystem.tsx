"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface AvatarData {
  name1: string;
  name2: string;
  image: string;
  badgeColor: string;
  startAngle: number;
  popDelay: number;
  note: string;
}

const innerAvatars: AvatarData[] = [
  { startAngle: 0, name1: "UI/UX", name2: "DESIGNER", image: "/avatar_3_1775365425369.png", badgeColor: "#E91E63", popDelay: 200, note: "InternX lets me mock up high-fidelity interfaces and test them in real-world simulation environments." },
  { startAngle: 120, name1: "PRODUCT", name2: "MANAGER", image: "/avatar_2_1775365411548.png", badgeColor: "#9CA3AF", popDelay: 400, note: "I flawlessly streamline my sprint tickets here. Tracking progress on live simulated teams is seamless." },
  { startAngle: 240, name1: "SOFTWARE", name2: "DEVELOPER", image: "/avatar_1_1775365394047.png", badgeColor: "#6B7280", popDelay: 600, note: "Deploying directly to production-like sandboxes proves my code is ready. The CLI streamlines everything." },
];

const outerAvatars: AvatarData[] = [
  { startAngle: 60, name1: "DATA", name2: "SCIENTIST", image: "/avatar_5_1775365466411.png", badgeColor: "#2196F3", popDelay: 300, note: "Accessing sanitized production datasets allows me to build and train models with zero friction." },
  { startAngle: 180, name1: "DEVOPS", name2: "ENGINEER", image: "/avatar_4_1775365449449.png", badgeColor: "#2196F3", popDelay: 500, note: "I configure cloud pipelines that test the entire team's code identically to live server deployments." },
  { startAngle: 300, name1: "Q&A", name2: "TESTER", image: "/avatar_6_1775365482321.png", badgeColor: "#F44336", popDelay: 700, note: "Running automated test suites against these simulated branches catches regressions before they ship." },
];

const INNER_RADIUS = 120;
const OUTER_RADIUS = 200;

const orbitStyles = `
  @keyframes spinCW {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes spinCCW {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
  }
  @keyframes popBubble {
    0% { opacity: 0; transform: scale(0.6) translateY(20px); }
    50% { transform: scale(1.05) translateY(-5px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  .orbit-cw {
    animation: spinCW 90s linear infinite;
    will-change: transform;
  }
  .orbit-ccw {
    animation: spinCCW 110s linear infinite;
    will-change: transform;
  }
  .counter-cw {
    animation: spinCCW 90s linear infinite;
    will-change: transform;
  }
  .counter-ccw {
    animation: spinCW 110s linear infinite;
    will-change: transform;
  }
  .animate-thought-bubble {
    animation: popBubble 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
`;

const TypewriterText = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 35); // Speed of typewriter
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayed}</span>;
};

const OrbitSystem = () => {
  const [popped, setPopped] = useState<Set<number>>(new Set());
  const [activeAvatarName, setActiveAvatarName] = useState<string | null>(null);

  useEffect(() => {
    const all = [...innerAvatars, ...outerAvatars];
    const timeouts = all.map((av, i) =>
      setTimeout(() => {
        setPopped((prev) => new Set(prev).add(i));
      }, av.popDelay)
    );
    return () => timeouts.forEach(clearTimeout);
  }, []);

  const handleAvatarClick = (name: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents click from bubbling to document immediately
    setActiveAvatarName(activeAvatarName === name ? null : name);
  };

  const closeBubble = () => {
    setActiveAvatarName(null);
  };

  return (
    <div className="relative w-full max-w-[500px] aspect-square flex justify-center items-center" onClick={closeBubble}>
      <style dangerouslySetInnerHTML={{ __html: orbitStyles }} />

      {/* Decorative orbit ring visuals */}
      <div className="absolute w-full h-full">
       
        <div className="absolute rounded-full border-[2.5px] border-white/60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 160, height: 160 }} />
        <div className="absolute rounded-full border-[2.5px] border-white/60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: INNER_RADIUS * 2, height: INNER_RADIUS * 2 }} />
        <div className="absolute rounded-full border-[2.5px] border-white/60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 320, height: 320 }} />
        <div className="absolute rounded-full border-[2.5px] border-white/60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: OUTER_RADIUS * 2, height: OUTER_RADIUS * 2 }} />
        
      </div>

      {/* Inner orbit group — clockwise */}
      <div className={`absolute w-0 h-0 orbit-cw ${innerAvatars.some(a => a.name1 === activeAvatarName) ? 'z-[100]' : 'z-10'}`} style={{ animationPlayState: activeAvatarName ? 'paused' : 'running' }}>
        {innerAvatars.map((av, i) => {
          const rad = (av.startAngle * Math.PI) / 180;
          const x = (Math.cos(rad) * INNER_RADIUS).toFixed(2) + "px";
          const y = (Math.sin(rad) * INNER_RADIUS).toFixed(2) + "px";
          const isActive = activeAvatarName === av.name1;
          
          return (
            <div key={`i-${i}`} className={`absolute ${isActive ? 'z-[999]' : 'z-10'}`} style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}>
              <div className="counter-cw relative flex flex-col items-center" style={{ animationPlayState: activeAvatarName ? 'paused' : 'running' }}>
                
                {/* Thought Bubble linked to this Avatar */}
                {isActive && (
                  <div className="absolute bottom-[110%] mb-4 animate-thought-bubble w-[240px]" onClick={(e) => e.stopPropagation()}>
                    {/* The thinking dots leading to the avatar */}
                    <div className="absolute -bottom-3 left-[50%] w-3 h-3 rounded-full bg-[#151515] border border-[#333] shadow-lg" />
                    <div className="absolute -bottom-7 left-[45%] w-1.5 h-1.5 rounded-full bg-[#151515] border border-[#333] shadow-lg" />
                    
                    <div className="bg-[#151515] border border-[#333] rounded-[18px] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.9)] relative">
                      <button onClick={closeBubble} className="absolute top-2.5 right-3 text-gray-500 hover:text-white transition-colors">
                        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="13" y1="1" x2="1" y2="13"></line><line x1="1" y1="1" x2="13" y2="13"></line></svg>
                      </button>
                      <div className="text-gray-300 text-[12px] leading-relaxed font-mono flex items-start mt-1">
                        <span className="text-gray-500 mr-2">{'>'}</span>
                        <div>
                          <TypewriterText text={av.note} />
                          <span className="inline-block w-[6px] h-[12px] bg-red-500 ml-1 animate-pulse translate-y-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{
                  transform: popped.has(i) ? "scale(1)" : "scale(0)",
                  opacity: popped.has(i) ? 1 : 0,
                  transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
                }}>
                  <AvatarBubble av={av} onClick={(e) => handleAvatarClick(av.name1, e)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Outer orbit group — counter-clockwise */}
      <div className={`absolute w-0 h-0 orbit-ccw ${outerAvatars.some(a => a.name1 === activeAvatarName) ? 'z-[100]' : 'z-10'}`} style={{ animationPlayState: activeAvatarName ? 'paused' : 'running' }}>
        {outerAvatars.map((av, i) => {
          const idx = i + innerAvatars.length;
          const rad = (av.startAngle * Math.PI) / 180;
          const x = (Math.cos(rad) * OUTER_RADIUS).toFixed(2) + "px";
          const y = (Math.sin(rad) * OUTER_RADIUS).toFixed(2) + "px";
          const isActive = activeAvatarName === av.name1;

          return (
            <div key={`o-${i}`} className={`absolute ${isActive ? 'z-[999]' : 'z-10'}`} style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}>
              <div className="counter-ccw relative flex flex-col items-center" style={{ animationPlayState: activeAvatarName ? 'paused' : 'running' }}>
                
                {/* Thought Bubble linked to this Avatar */}
                {isActive && (
                  <div className="absolute bottom-[110%] mb-4 animate-thought-bubble w-[240px]" onClick={(e) => e.stopPropagation()}>
                    {/* The thinking dots leading to the avatar */}
                    <div className="absolute -bottom-3 left-[50%] w-3 h-3 rounded-full bg-[#151515] border border-[#333] shadow-lg" />
                    <div className="absolute -bottom-7 left-[45%] w-1.5 h-1.5 rounded-full bg-[#151515] border border-[#333] shadow-lg" />
                    
                    <div className="bg-[#151515] border border-[#333] rounded-[18px] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.9)] relative">
                      <button onClick={closeBubble} className="absolute top-2.5 right-3 text-gray-500 hover:text-white transition-colors">
                        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="13" y1="1" x2="1" y2="13"></line><line x1="1" y1="1" x2="13" y2="13"></line></svg>
                      </button>
                      <div className="text-gray-300 text-[12px] leading-relaxed font-mono flex items-start mt-1">
                        <span className="text-gray-500 mr-2">{'>'}</span>
                        <div>
                          <TypewriterText text={av.note} />
                          <span className="inline-block w-[6px] h-[12px] bg-red-500 ml-1 animate-pulse translate-y-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{
                  transform: popped.has(idx) ? "scale(1)" : "scale(0)",
                  opacity: popped.has(idx) ? 1 : 0,
                  transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
                }}>
                  <AvatarBubble av={av} onClick={(e) => handleAvatarClick(av.name1, e)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Center Server Icon */}
      <div className="w-[72px] h-[72px] rounded-full border border-gray-400 bg-black/70 flex items-center justify-center z-30 backdrop-blur-md">
         {/* ... (SVG kept same) ... */}
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-gray-200">
          <path d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V8C20 9.10457 19.1046 10 18 10H6C4.89543 10 4 9.10457 4 8V6Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 12C4 10.8954 4.89543 10 6 10H18C19.1046 10 20 10.8954 20 12V14C20 15.1046 19.1046 16 18 16H6C4.89543 16 4 15.1046 4 14V12Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 18C4 16.8954 4.89543 16 6 16H18C19.1046 16 20 16.8954 20 18V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V18Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 7H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 7H16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 13H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 13H16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 19H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 19H16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

const AvatarBubble = ({ av, onClick }: { av: AvatarData, onClick: (e: React.MouseEvent) => void }) => (
  <div onClick={onClick} className="flex flex-col items-center gap-1.5 cursor-pointer transition-transform duration-300 hover:scale-110 group relative z-10">
    <div className="relative">
      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-white/80 overflow-hidden bg-black/50 shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:border-white transition-colors">
        <Image src={av.image} alt={`${av.name1} ${av.name2}`} width={48} height={48} className="w-full h-full object-cover" />
      </div>
      <div
        className="absolute -top-0.5 -right-0.5 w-[14px] h-[14px] rounded-full border-[2px] border-[#0a0a0a]"
        style={{ backgroundColor: av.badgeColor }}
      />
    </div>
    <span className="text-[7.5px] lg:text-[8.5px] font-bold tracking-widest text-gray-300 uppercase text-center leading-tight whitespace-nowrap group-hover:text-white transition-colors">
      {av.name1}<br />{av.name2}
    </span>
  </div>
);

export default OrbitSystem;
