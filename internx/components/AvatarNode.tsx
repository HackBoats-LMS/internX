import React from 'react';
import Image from "next/image";

const AvatarNode = ({ 
  angle, 
  radius, 
  name1, 
  name2, 
  image, 
  badgeColor 
}: { 
  angle: number, 
  radius: number, 
  name1: string, 
  name2: string, 
  image: string, 
  badgeColor: string 
}) => {
  return (
    <div
      className="absolute top-1/2 left-1/2 z-20 flex flex-col items-center gap-1.5 transition-transform duration-500 hover:scale-125 cursor-pointer group w-[max-content]"
      style={{
        transform: `translate(-50%, -50%) rotate(${angle}deg) translate(${radius}px, 0) rotate(-${angle}deg)`,
      }}
    >
      <div className="relative">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-white/80 overflow-hidden bg-black/50 shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:border-white transition-colors">
           <Image src={image} alt={`${name1} ${name2}`} width={48} height={48} className="w-full h-full object-cover" />
        </div>
        {/* Tiny notification badge */}
        <div className={`absolute -top-0.5 -right-0.5 w-[14px] h-[14px] rounded-full border-[2px] border-[#0a0a0a] ${badgeColor}`} />
      </div>
      <span className="text-[7.5px] lg:text-[8.5px] font-bold tracking-widest text-gray-300 uppercase text-center leading-tight">
        {name1}<br/>{name2}
      </span>
    </div>
  )
}

export default AvatarNode;
