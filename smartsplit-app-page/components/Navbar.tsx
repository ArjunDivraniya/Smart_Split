'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Menu, X, Rocket } from 'lucide-react';
import Magnetic from './Magnetic';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Insights', href: '#insights' },
  ];

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  if (!mounted) return null;

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4',
        isScrolled ? 'top-2' : 'top-0'
      )}
    >
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#00FF9D] via-[#3B82F6] to-[#A855F7] origin-left z-[100]"
        style={{ scaleX }}
      />
      <div
        className={cn(
          'max-w-7xl mx-auto rounded-2xl transition-all duration-300 flex items-center justify-between px-6 py-3',
          isScrolled
            ? 'bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.4)]'
            : 'bg-transparent'
        )}
      >
        {/* Logo */}
        <Magnetic>
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00FF9D] to-[#3B82F6] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,157,0.3)] group-hover:scale-110 transition-transform">
              <Rocket className="text-black w-6 h-6" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">SmartSplit</span>
          </div>
        </Magnetic>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-slate-400 hover:text-[#00FF9D] transition-colors text-sm font-medium"
            >
              {link.name}
            </a>
          ))}
          <Magnetic>
            <button 
              onClick={() => window.open('https://expo.dev/accounts/arjundivraniya/projects/smartsplit/builds/9357e0ec-b1a8-4fba-9d95-d50b460ba5ad', '_blank')}
              className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-[#00FF9D] hover:shadow-[0_0_20px_rgba(0,255,157,0.4)] transition-all active:scale-95"
            >
              Download App
            </button>
          </Magnetic>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-6 right-6 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:hidden z-50"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-300 hover:text-[#00FF9D] text-lg font-medium"
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-white/5 my-2" />
              <button className="w-full bg-[#00FF9D] text-black py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(0,255,157,0.3)]">
                Download App
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
