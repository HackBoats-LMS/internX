"use client";

import React from 'react';
import { FaLinkedin, FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const footerLinks = [
    { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Blog'] },
    { title: 'Support', links: ['Customer Desk', 'Help Center', 'FAQ', 'Contact Us'] },
    { title: 'Legal', links: ['Privacy Policy', 'Terms & Conditions', 'Cookie Policy', 'GDPR Compliance'] },
    { title: 'Resources', links: ['Documentation', 'API Reference', 'Community', 'Partners'] },
  ];

  return (
    <footer className="w-full bg-[#f1f0eb] text-[#1a1a1a] py-8 lg:py-[clamp(2.5rem,6vw,4rem)] px-[5vw] lg:px-16 border-t border-gray-300 relative z-10 mt-10">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between gap-8 lg:gap-8">

        {/* Left Col */}
        <div className="w-full lg:w-[35%] flex flex-col gap-4 lg:gap-5">
          <div className="flex items-center">
            <img src="/internx-logo.png" alt="internX Logo" className="h-8 lg:h-10 w-auto object-contain" />
          </div>
          <p className="text-gray-600 font-medium leading-relaxed max-w-[250px] text-sm lg:text-[clamp(0.75rem,2vw,0.8125rem)]">

            201 and 203, lake view apartment,
            Pragathi nagar , Kphb , hyd - 500090
          </p>
          <p className="text-gray-600 font-medium leading-relaxed text-sm lg:text-[clamp(0.75rem,2vw,0.8125rem)]">
            Phone: +91 8886099957 , +91 8886099927<br />
            Email: official@internx.com
          </p>
          <div className="flex gap-4 mt-4 lg:mt-3">
            {[
              { id: 'linkedin', icon: <FaLinkedin className="w-8 h-8 lg:w-7 lg:h-7 text-[#0a66c2]" />, link: 'https://linkedin.com' },
              { id: 'instagram', icon: <FaInstagram className="w-8 h-8 lg:w-7 lg:h-7 text-[#E1306C]" />, link: 'https://instagram.com' },
              { id: 'whatsapp', icon: <FaWhatsapp className="w-8 h-8 lg:w-7 lg:h-7 text-[#25D366]" />, link: 'https://wa.me/qr/QF2H7NZ3IRYRB1' },
              { id: 'email', icon: <FaEnvelope className="w-8 h-8 lg:w-7 lg:h-7 text-[#ea4335]" />, link: 'mailto:official@hackboats.com' }
            ].map(s => (
              <a href={s.link} target="_blank" rel="noopener noreferrer" key={s.id} className="cursor-pointer hover:scale-110 hover:-translate-y-1 transition-all duration-200 drop-shadow-sm">
                {s.icon}
              </a>
            ))}
          </div>.
        </div>

        {/* Links Columns Desktop */}
        <div className="hidden sm:grid w-full lg:w-[65%] grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {footerLinks.map(({ title, links }) => (
            <div key={title} className="flex flex-col gap-3">
              <h4 className="font-bold" style={{ fontSize: 'clamp(0.8rem, 2vw, 0.875rem)' }}>{title}</h4>
              <ul className="flex flex-col gap-2 text-gray-600 font-medium cursor-pointer" style={{ fontSize: 'clamp(0.75rem, 1.8vw, 0.8125rem)' }}>
                {links.map(l => <li key={l} className="hover:text-black">{l}</li>)}
              </ul>
            </div>
          ))}
        </div>

        {/* Links Mobile Accordion */}
        <div className="flex sm:hidden flex-col w-full mt-2">
          {footerLinks.map(({ title, links }) => (
            <details key={title} className="group border-b border-gray-300/60 pb-2 mb-2">
              <summary className="font-bold cursor-pointer text-sm py-2 select-none group-open:text-[#ff1a1a] transition-colors outline-none list-none flex justify-between items-center">
                {title}
                <span className="text-xl leading-none group-open:rotate-45 transition-transform duration-200">+</span>
              </summary>
              <ul className="flex flex-col gap-3 text-gray-600 font-medium pb-2 text-sm pl-2 pt-1 border-l-2 border-[#ff1a1a]/20 ml-2">
                {links.map(l => <li key={l} className="hover:text-black cursor-pointer">{l}</li>)}
              </ul>
            </details>
          ))}
        </div>

      </div>
      
      {/* Bottom Bar */}
      <div className="max-w-[1400px] mx-auto mt-10 lg:mt-16 pt-6 border-t border-gray-300/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500 font-medium">
          © {new Date().getFullYear()} internX. All rights reserved.
        </p>
        <a href="https://hackboats.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-gray-500 font-medium group cursor-pointer hover:text-gray-700 transition-colors">
          <span className="translate-y-[3px]">Powered by</span>
          <img 
            src="/hackboats-logo.png" 
            alt="HackBoats Logo" 
            className="h-6 sm:h-7 object-contain group-hover:scale-105 transition-transform"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.classList.remove('hidden');
              }
            }}
          />
          <span className="hidden font-bold text-[#1a1a1a] text-base sm:text-lg tracking-wide group-hover:text-[#ff1a1a] transition-colors">
            Hack<span className="text-[#ff1a1a] group-hover:text-[#1a1a1a] transition-colors">Boats</span>
          </span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
