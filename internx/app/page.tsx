import React from 'react';
import Hero from '../components/Hero';
import EngineeringLoop from '../components/EngineeringLoop';
import CommandCenter from '../components/CommandCenter';
import Courses from '../components/Courses';
import Testimonial from '../components/Testimonial';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-x-hidden relative">
      <Hero />
      <EngineeringLoop />
      <CommandCenter />
      <Courses />
      <Testimonial />
      <Footer />
    </div>
  );
}
