import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#f1f0eb] text-[#1a1a1a] py-16 px-6 lg:px-16 border-t border-gray-300 relative z-10 mt-10">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">
        
        {/* Left Col */}
        <div className="w-full lg:w-[35%] flex flex-col gap-6">
          <div className="text-2xl font-bold tracking-wide flex items-center">
            <span>intern</span>
            <span className="text-[#ff1a1a] relative">X</span>
          </div>
          <p className="text-[13px] text-gray-600 font-medium leading-relaxed max-w-[250px]">
            123 Innovation Street<br/>
            Tech District, CA 94103<br/>
            United States
          </p>
          <p className="text-[13px] text-gray-600 font-medium leading-relaxed mt-2">
            Phone: +1 (555) 123-4567<br/>
            Email: contact@internx.inc
          </p>
          <div className="flex gap-4 mt-2">
            {/* Social Icons mapped as simple dots for now to match exactly without external libs */}
            <div className="w-5 h-5 rounded bg-gray-400 flex items-center justify-center text-[10px] text-white">X</div>
            <div className="w-5 h-5 rounded bg-gray-400 flex items-center justify-center text-[10px] text-white">ig</div>
            <div className="w-5 h-5 rounded bg-gray-400 flex items-center justify-center text-[10px] text-white">yt</div>
            <div className="w-5 h-5 rounded bg-gray-400 flex items-center justify-center text-[10px] text-white">in</div>
          </div>
        </div>

        {/* Links Columns */}
        <div className="w-full lg:w-[65%] grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-[14px]">Company</h4>
            <ul className="flex flex-col gap-3 text-[13px] text-gray-600 font-medium cursor-pointer">
              <li className="hover:text-black">About Us</li>
              <li className="hover:text-black">Careers</li>
              <li className="hover:text-black">Press</li>
              <li className="hover:text-black">Blog</li>
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-[14px]">Support</h4>
            <ul className="flex flex-col gap-3 text-[13px] text-gray-600 font-medium cursor-pointer">
              <li className="hover:text-black">Customer Desk</li>
              <li className="hover:text-black">Help Center</li>
              <li className="hover:text-black">FAQ</li>
              <li className="hover:text-black">Contact Us</li>
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-[14px]">Legal</h4>
            <ul className="flex flex-col gap-3 text-[13px] text-gray-600 font-medium cursor-pointer">
              <li className="hover:text-black">Privacy Policy</li>
              <li className="hover:text-black">Terms & Conditions</li>
              <li className="hover:text-black">Cookie Policy</li>
              <li className="hover:text-black">GDPR Compliance</li>
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-[14px]">Resources</h4>
            <ul className="flex flex-col gap-3 text-[13px] text-gray-600 font-medium cursor-pointer">
              <li className="hover:text-black">Documentation</li>
              <li className="hover:text-black">API Reference</li>
              <li className="hover:text-black">Community</li>
              <li className="hover:text-black">Partners</li>
            </ul>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
