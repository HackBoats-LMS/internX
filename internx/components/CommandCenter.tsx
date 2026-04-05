import React from 'react';

const CommandCenter = () => {
  return (
    <section className="w-full flex justify-center py-20 relative px-6 z-10">
      <div className="w-full max-w-[1240px] border border-gray-800 rounded-[2.5rem] bg-[#111111] overflow-hidden flex flex-col lg:flex-row relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Left side text/stats */}
        <div className="w-full lg:w-1/2 p-14 lg:p-20 flex flex-col justify-center relative z-10">
          <h2 className="text-3xl lg:text-[40px] leading-tight font-semibold mb-6">
            Your Engineering<br/>Command Center
          </h2>
          <p className="text-lg text-gray-400 mb-12 max-w-[400px]">
            Stop wondering if you're job-ready...<br/>Prove it in a production simulation.
          </p>

          <div className="flex gap-8 lg:gap-14">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-gray-600 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <span className="text-sm font-semibold text-gray-300">99%<br/>Development<br/>success</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-gray-600 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <span className="text-sm font-semibold text-gray-300">1k<br/>Tasks<br/>Completed</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-gray-600 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
              </div>
              <span className="text-sm font-semibold text-gray-300">#1<br/>Local<br/>Rank</span>
            </div>
          </div>
        </div>

        {/* Right side Dashboard Mockups (Isometric) */}
        <div className="w-full lg:w-1/2 min-h-[400px] lg:min-h-full relative overflow-hidden bg-gradient-to-br from-[#181818] to-[#0a0a0a]">
          {/* Decorative background glow for the UI */}
          <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] bg-red-900/20 blur-[100px] rounded-full pointer-events-none" />
          
          {/* Tilted Wrapper for Isometric Perspective */}
          <div className="absolute top-[5%] left-[10%] w-[600px] h-[600px]" style={{ transform: 'rotate(-10deg) rotateX(15deg) rotateY(-10deg) scale(0.95)' }}>
            
            {/* Dashboard Panel 1 */}
            <div className="absolute top-0 right-[20%] w-[380px] h-[100px] bg-[#0c0c0c] border border-gray-800 rounded-2xl shadow-xl flex items-center px-6 gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center border-2 border-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="red"><path d="M21 12.0001L19.0003 12.0001L15.3333 19L8.66667 5L5.00032 12.0001L3 12.0001" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="w-[200px] h-[30px] rounded bg-gray-800/50" />
            </div>

            {/* Dashboard Panel 2 - Main Table */}
            <div className="absolute top-[120px] left-[5%] w-[480px] h-[300px] bg-[#0c0c0c] border border-gray-800 rounded-2xl shadow-xl p-6">
              <div className="w-24 h-4 bg-gray-700/50 rounded mb-6" />
              <div className="flex border-b border-gray-800 pb-2 mb-4">
                <div className="flex-1 text-xs text-gray-500">Name</div>
                <div className="flex-1 text-xs text-gray-500 text-center">Status</div>
                <div className="flex-1 text-xs text-gray-500 text-right">Region</div>
              </div>
              {[1,2,3].map(i => (
                <div key={i} className="flex border-b border-gray-800/50 py-4 items-center">
                  <div className="flex-1 text-xs text-gray-300">prod_deploy_{i}</div>
                  <div className="flex-1 flex justify-center"><div className="w-12 h-5 bg-gray-800 rounded border border-gray-700" /></div>
                  <div className="flex-1 text-xs text-gray-400 text-right">us-east</div>
                </div>
              ))}
            </div>

            {/* Dashboard Panel 3 - Graph */}
            <div className="absolute top-[320px] left-[-5%] w-[420px] h-[220px] bg-[#0c0c0c] border border-gray-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
              <div className="w-32 h-4 bg-gray-700/50 rounded mb-6 relative z-10" />
              {/* Fake Area Graph */}
              <div className="absolute bottom-[-10px] left-[-10px] w-[450px] h-[150px]">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0 100 L0 80 L20 60 L40 70 L60 30 L80 50 L100 20 L100 100 Z" fill="url(#grad)" opacity="0.8" />
                  <path d="M0 80 L20 60 L40 70 L60 30 L80 50 L100 20" fill="none" stroke="#ff1a1a" strokeWidth="2" />
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff1a1a" stopOpacity="0.4" />
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
