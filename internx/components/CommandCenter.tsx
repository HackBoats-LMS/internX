"use client";

import React, { useEffect, useState } from 'react';

const CommandCenter = () => {
  const [stats, setStats] = useState({ dev: 0, tasks: 0, rank: 11 });

  useEffect(() => {
    let frame = 0;
    const totalFrames = 60; // 1 second at 60fps

    const animate = () => {
      frame++;
      const progress = frame / totalFrames;
      const easeOut = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      setStats({
        dev: Math.round(99 * easeOut),
        tasks: Math.round(1000 * easeOut),
        rank: Math.max(1, Math.round(11 - (10 * easeOut)))
      });

      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const dashboardStyles = `
    @keyframes float1 {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-12px) rotate(0.5deg); }
    }
    @keyframes float2 {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-8px) rotate(-0.5deg); }
    }
    @keyframes float3 {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-14px) rotate(1deg); }
    }
    @keyframes drawLine {
      from { stroke-dashoffset: 200; }
      to { stroke-dashoffset: 0; }
    }
    @keyframes pulseGlow {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }
    @keyframes heartbeat {
      0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px red); }
      50% { transform: scale(1.1); filter: drop-shadow(0 0 10px red); }
    }
    .panel-1 { animation: float1 6s ease-in-out infinite; }
    .panel-2 { animation: float2 5s ease-in-out infinite 1s; }
    .panel-3 { animation: float3 7s ease-in-out infinite 0.5s; }
    
    .chart-line {
      stroke-dasharray: 200;
      stroke-dashoffset: 200;
      animation: drawLine 2s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.5s;
    }
    .chart-glow {
      animation: pulseGlow 3s ease-in-out infinite;
    }
    .status-heartbeat svg {
      animation: heartbeat 2s ease-in-out infinite;
    }
  `;

  return (
    <section className="w-full flex justify-center py-20 relative px-6 z-10 group">
      <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />
      <div className="w-full max-w-[1240px] border border-gray-800 rounded-[2.5rem] bg-[#111111] overflow-hidden flex flex-col lg:flex-row relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Left side text/stats */}
        <div className="w-full lg:w-1/2 p-14 lg:p-20 flex flex-col justify-center relative z-10">
          
          <h2 className="text-3xl lg:text-[40px] leading-tight font-semibold mb-6">
            Your Engineering<br/>Command Center
          </h2>
          <p className="text-lg text-gray-400 mb-12 max-w-[400px]">
            Stop wondering if you're job-ready...<br/>Prove it in a production simulation.
          </p>

          <div className="flex gap-8 lg:gap-14 relative z-10">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-gray-600 flex items-center justify-center transition-colors duration-500 group-hover:border-gray-400 group-hover:bg-gray-800/50">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-200 group-hover:text-white transition-colors"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <span className="text-sm font-semibold text-gray-300">
                <span className="text-xl text-white block mb-0.5">{stats.dev}%</span>
                Development<br/>success
              </span>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-gray-600 flex items-center justify-center transition-colors duration-500 delay-100 group-hover:border-gray-400 group-hover:bg-gray-800/50">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-200 group-hover:text-white transition-colors"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <span className="text-sm font-semibold text-gray-300">
                <span className="text-xl text-white block mb-0.5">{stats.tasks >= 1000 ? '1k+' : stats.tasks}</span>
                Tasks<br/>Completed
              </span>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-gray-600 flex items-center justify-center transition-colors duration-500 delay-200 group-hover:border-gray-400 group-hover:bg-gray-800/50">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-200 group-hover:text-white transition-colors"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
              </div>
              <span className="text-sm font-semibold text-gray-300">
                <span className="text-xl text-white block mb-0.5">#{stats.rank}</span>
                Local<br/>Rank
              </span>
            </div>
          </div>
        </div>

        {/* Right side Dashboard Mockups (Isometric) */}
        <div className="w-full lg:w-1/2 min-h-[400px] lg:min-h-full relative overflow-hidden bg-gradient-to-br from-[#181818] to-[#0a0a0a]">
          {/* Decorative background glow for the UI */}
          <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] bg-red-900/10 blur-[100px] rounded-full pointer-events-none" />
          
          {/* Tilted Wrapper for Isometric Perspective */}
          <div className="absolute top-[5%] left-[10%] w-[600px] h-[600px] transition-transform duration-1000 group-hover:scale-[1.02]" style={{ transform: 'rotate(-10deg) rotateX(15deg) rotateY(-10deg) scale(0.95)' }}>
            
            {/* Dashboard Panel 1 */}
            <div className="panel-1 absolute top-0 right-[20%] w-[380px] h-[100px] bg-[#0c0c0c] border border-gray-700/50 hover:border-gray-600 rounded-2xl shadow-2xl flex items-center px-6 gap-4 backdrop-blur-sm transition-colors duration-300">
              <div className="status-heartbeat w-10 h-10 rounded-full bg-red-100 flex items-center justify-center border-2 border-white shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="red"><path d="M21 12.0001L19.0003 12.0001L15.3333 19L8.66667 5L5.00032 12.0001L3 12.0001" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="w-[200px] h-[30px] rounded bg-gray-800/80" />
            </div>

            {/* Dashboard Panel 2 - Main Table */}
            <div className="panel-2 absolute top-[120px] left-[5%] w-[480px] h-[300px] bg-[#0c0c0c]/90 border border-gray-700/50 hover:border-gray-600 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] backdrop-blur-md p-6 transition-colors duration-300">
              <div className="w-24 h-4 bg-gray-700/80 rounded mb-6" />
              <div className="flex border-b border-gray-800 pb-2 mb-4">
                <div className="flex-1 text-xs text-gray-500 font-medium">Name</div>
                <div className="flex-1 text-xs text-gray-500 font-medium text-center">Status</div>
                <div className="flex-1 text-xs text-gray-500 font-medium text-right">Region</div>
              </div>
              {[1,2,3].map(i => (
                <div key={i} className="flex border-b border-gray-800/50 py-4 items-center group/row cursor-pointer">
                  <div className="flex-1 text-xs text-gray-300 transition-colors group-hover/row:text-white">prod_deploy_{i}</div>
                  <div className="flex-1 flex justify-center">
                    <div className="w-12 h-5 bg-gray-800 rounded border border-gray-700 relative overflow-hidden">
                       <div className="absolute top-0 left-0 h-full w-full bg-green-500/20 opacity-0 group-hover/row:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="flex-1 text-xs text-gray-400 text-right transition-colors group-hover/row:text-gray-300">us-east</div>
                </div>
              ))}
            </div>

            {/* Dashboard Panel 3 - Graph */}
            <div className="panel-3 absolute top-[320px] left-[-5%] w-[420px] h-[220px] bg-[#0c0c0c]/95 border border-gray-700/50 hover:border-gray-600 rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.9)] backdrop-blur-xl p-6 overflow-hidden transition-colors duration-300">
              <div className="w-32 h-4 bg-gray-700/80 rounded mb-6 relative z-10" />
              {/* Fake Area Graph */}
              <div className="absolute bottom-[-10px] left-[-10px] w-[450px] h-[150px]">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path className="chart-glow" d="M0 100 L0 80 L20 60 L40 70 L60 30 L80 50 L100 20 L100 100 Z" fill="url(#grad)" />
                  <path className="chart-line" d="M0 80 L20 60 L40 70 L60 30 L80 50 L100 20" fill="none" stroke="#ff1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff1a1a" />
                      <stop offset="100%" stopColor="#ff1a1a" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommandCenter;
