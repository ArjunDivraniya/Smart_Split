'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Insights from '@/components/Insights';
import DownloadCTA from '@/components/Download';
import Footer from '@/components/Footer';
import ComingSoon from '@/components/ComingSoon';

export default function Home() {
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#0D0D0D] selection:bg-[#00FF9D]/30 text-white">
      <Navbar />
      <Hero onWatchDemo={() => setIsComingSoonOpen(true)} />
      <Features />
      <HowItWorks />
      <Insights />
      <DownloadCTA />
      <Footer />
      
      {/* Premium Coming Soon Modal */}
      <ComingSoon 
        isOpen={isComingSoonOpen} 
        onClose={() => setIsComingSoonOpen(false)} 
      />
    </main>
  );
}
