import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#f1f0eb] text-[#1a1a1a] py-[clamp(2.5rem,6vw,4rem)] px-[5vw] lg:px-16 border-t border-gray-300 relative z-10 mt-10">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between gap-10 lg:gap-8">

        {/* Left Col */}
        <div className="w-full lg:w-[35%] flex flex-col gap-5">
          <div className="font-bold tracking-wide flex items-center" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }}>
            <span>intern</span>
            <span className="text-[#ff1a1a]">X</span>
          </div>
          <p className="text-gray-600 font-medium leading-relaxed max-w-[250px]" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.8125rem)' }}>
            123 Innovation Street<br />
            Tech District, CA 94103<br />
            United States
          </p>
          <p className="text-gray-600 font-medium leading-relaxed" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.8125rem)' }}>
            Phone: +1 (555) 123-4567<br />
            Email: contact@internx.inc
          </p>
          <div className="flex gap-3 mt-1">
            {['X', 'ig', 'yt', 'in'].map(s => (
              <div key={s} className="w-5 h-5 rounded bg-gray-400 flex items-center justify-center text-[10px] text-white">{s}</div>
            ))}
          </div>
        </div>

        {/* Links Columns */}
        <div className="w-full lg:w-[65%] grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {[
            { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Blog'] },
            { title: 'Support', links: ['Customer Desk', 'Help Center', 'FAQ', 'Contact Us'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms & Conditions', 'Cookie Policy', 'GDPR Compliance'] },
            { title: 'Resources', links: ['Documentation', 'API Reference', 'Community', 'Partners'] },
          ].map(({ title, links }) => (
            <div key={title} className="flex flex-col gap-3">
              <h4 className="font-bold" style={{ fontSize: 'clamp(0.8rem, 2vw, 0.875rem)' }}>{title}</h4>
              <ul className="flex flex-col gap-2 text-gray-600 font-medium cursor-pointer" style={{ fontSize: 'clamp(0.75rem, 1.8vw, 0.8125rem)' }}>
                {links.map(l => <li key={l} className="hover:text-black">{l}</li>)}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </footer>
  );
};

export default Footer;
