import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Insights from '@/components/Insights';
import DownloadCTA from '@/components/Download';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0D0D0D] selection:bg-[#00FF9D]/30">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Insights />
      <DownloadCTA />
      <Footer />
    </main>
  );
}
