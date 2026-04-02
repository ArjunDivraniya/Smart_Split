'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import Image from 'next/image';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import Magnetic from './Magnetic';

interface HeroProps {
  onWatchDemo: () => void;
}

const Hero = ({ onWatchDemo }: HeroProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax effects
  const phoneY = useTransform(smoothProgress, [0, 1], [0, -100]);
  const textY = useTransform(smoothProgress, [0, 1], [0, 50]);
  const glowScale = useTransform(smoothProgress, [0, 1], [1, 1.2]);
  const glowOpacity = useTransform(smoothProgress, [0, 1], [1, 0.5]);

  return (
    <section ref={containerRef} className="relative min-h-screen pt-32 pb-20 overflow-hidden flex items-center justify-center bg-[#0D0D0D]">
      {/* Background Animated Glows with Parallax */}
      <motion.div 
        style={{ scale: glowScale, opacity: glowOpacity, y: useTransform(smoothProgress, [0, 1], [0, 150]) }}
        className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-[#00FF9D]/10 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        style={{ scale: glowScale, opacity: glowOpacity, y: useTransform(smoothProgress, [0, 1], [0, 120]) }}
        className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-[#3B82F6]/10 rounded-full blur-[150px] pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full relative z-10">
        {/* Left Content */}
        <motion.div style={{ y: textY }} className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#00FF9D] text-[10px] font-black uppercase tracking-[0.2em] mb-8"
          >
            <Sparkles size={12} className="animate-pulse" />
            Empowering Financial Freedom
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-bold text-white mb-8 leading-[0.9] tracking-tighter"
          >
            {["Split", "Smarter.", "Live", "Better."].map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "inline-block mr-4",
                  (word === "Live" || word === "Better.") && "text-transparent bg-clip-text bg-gradient-to-r from-[#00FF9D] via-[#3B82F6] to-[#A855F7] animate-gradient-x"
                )}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-xl text-slate-400 mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
          >
            The all-in-one app to manage group expenses, track personal spending, and settle balances instantly with zero friction.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start"
          >
            <Magnetic>
              <button 
                onClick={() => window.open('https://expo.dev/accounts/arjundivraniya/projects/smartsplit/builds/9357e0ec-b1a8-4fba-9d95-d50b460ba5ad', '_blank')}
                className="w-full sm:w-auto bg-white text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#00FF9D] hover:shadow-[0_0_50px_rgba(0,255,157,0.4)] transition-all active:scale-95 group"
              >
                Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Magnetic>
            
            <Magnetic>
              <button 
                onClick={onWatchDemo}
                className="w-full sm:w-auto bg-transparent border border-white/10 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/5 transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                   <Play size={14} className="fill-white translate-x-[1px]" />
                </div>
                Watch Demo
              </button>
            </Magnetic>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-16 flex items-center gap-6 justify-center lg:justify-start"
          >
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-[#0D0D0D] bg-slate-800 overflow-hidden relative shadow-xl">
                   <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800" />
                   <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-[#0D0D0D] bg-[#00FF9D] flex items-center justify-center text-black font-black text-xs shadow-xl relative z-10">
                +1k
              </div>
            </div>
            <div className="flex flex-col">
                <p className="text-white font-bold text-sm leading-none mb-1">1,000+ Users</p>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Building Financial Clarity</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Phone Mockup with Parallax & Float */}
        <motion.div
          style={{ y: phoneY }}
          initial={{ opacity: 0, scale: 0.8, rotateY: 30, rotateX: 10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0, rotateX: 0 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex justify-center perspective-1000"
        >
          {/* Glowing Ring behind phone */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-[#00FF9D]/20 to-[#3B82F6]/20 rounded-full blur-[100px] animate-pulse" />
          
          <motion.div
            animate={{ 
                y: [0, -20, 0],
                rotateZ: [-1, 1, -1] 
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-[300px] h-[600px] md:w-[360px] md:h-[720px]"
          >
            {/* The actual image from generated assets */}
            <div className="w-full h-full rounded-[45px] border-[10px] border-slate-900 overflow-hidden shadow-[0_0_120px_rgba(0,255,157,0.2)] bg-[#080808] relative">
               <Image 
                src="/hero-mockup.png" 
                alt="SmartSplit App Interface" 
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/10 pointer-events-none" />
            </div>
            
            {/* Subtle floating UI overlay card */}
            <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 4, repeat: Infinity, delay: 1 }}
               className="absolute -right-12 top-1/4 p-4 rounded-2xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-2xl hidden md:block"
            >
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-[#00FF9D] flex items-center justify-center">
                      <Sparkles size={18} className="text-black" />
                   </div>
                   <div>
                       <p className="text-white font-bold text-xs">Settled Up!</p>
                       <p className="text-slate-400 text-[10px]">Rs 1,200 from Rahul</p>
                   </div>
                </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
