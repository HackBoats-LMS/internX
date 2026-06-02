"use client"

import React, { useState, useEffect } from 'react'

const Timer = () => {
    const [timeLeft, setTimeLeft] = useState({ days: 0 }); 

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const targetDate = new Date(
                now.getFullYear(), 
                now.getMonth() + 1, 
                1, 
                0, 0, 0
            );

            const diff = targetDate.getTime() - now.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            setTimeLeft({ days: days > 0 ? days : 0 });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex justify-center items-center gap-2 px-3 py-1.5 rounded-full">
            
            <div className="flex items-center justify-center h-4 w-2">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff1a1a] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff1a1a]"></span>
                </span>
            </div>
            
            <div className="flex items-center gap-1.5 leading-none">
                <span className="text-2xl font-black text-black tabular-nums">
                    {timeLeft.days}
                </span>
                
                <span className="text-[11px] font-semibold text-gray-700 tracking-wide uppercase">
                    Days left for the next batch to start
                </span>
            </div>
        </div>
    )
}

export default Timer