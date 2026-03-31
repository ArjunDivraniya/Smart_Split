'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Image from 'next/image';
import { UserPlus, PlusCircle, BarChart3, CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const steps = [
  {
    title: 'Create Your Group',
    description: 'Set up a group for your trip, roommate expenses, or a night out. Invite friends with a single link.',
    image: '/groups-mockup.png',
    icon: UserPlus,
    color: '#00FF9D',
  },
  {
    title: 'Add Expenses on the Go',
    description: 'Log any expense as it happens. Snap a receipt, categorize it, and let SmartSplit handle the math.',
    image: '/hero-mockup.png',
    icon: PlusCircle,
    color: '#3B82F6',
  },
  {
    title: 'Track Real-time Insights',
    description: 'Monitor your spending trends and group balances in real-time. See who owes whom at a glance.',
    image: '/analytics-mockup.png',
    icon: BarChart3,
    color: '#A855F7',
  },
  {
    title: 'Settle Records Instantly',
    description: 'Clear all debts with one tap. Integrated UPI links and payment tracking make settling effortless.',
    image: '/settle-mockup.png',
    icon: CheckCircle2,
    color: '#00FF9D',
  },
];

const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth the scroll progress for a more "cinematic" feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Transform mapping for the mockup image active state
  const activeImageIndex = useTransform(smoothProgress, [0, 0.25, 0.5, 0.75, 1], [0, 0, 1, 2, 3]);
  const progressLineHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  
  return (
    <section 
      ref={containerRef} 
      id="how-it-works" 
      className="relative h-[400vh] bg-[#0D0D0D] overflow-clip"
    >
      {/* Sticky Content Wrapper */}
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        
        {/* Background Accents that shift color based on scroll */}
        <motion.div 
          style={{ 
            backgroundColor: useTransform(smoothProgress, [0, 0.33, 0.66, 1], ["rgba(0,255,157,0.05)", "rgba(59,130,246,0.05)", "rgba(168,85,247,0.05)", "rgba(0,255,157,0.05)"]) 
          }}
          className="absolute inset-0 transition-colors duration-700 pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full relative z-10">
          
          {/* Left Side: Scrolling Text Blocks */}
          <div className="relative h-[80vh] flex items-center">
             {/* Vertical Progress Indicator */}
             <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-white/5 hidden lg:block">
               <motion.div 
                 style={{ height: progressLineHeight }}
                 className="w-full bg-gradient-to-b from-[#00FF9D] via-[#3B82F6] to-[#A855F7]"
               />
             </div>

             <div className="relative w-full h-[60vh] overflow-hidden">
               {steps.map((step, idx) => (
                 <StepText key={idx} step={step} index={idx} progress={smoothProgress} />
               ))}
             </div>
          </div>

          {/* Right Side: Sticky Device Mockup */}
          <div className="hidden lg:flex justify-center items-center perspective-1000">
            <motion.div 
              style={{
                rotateY: useTransform(smoothProgress, [0, 1], [-5, 5]),
                rotateX: useTransform(smoothProgress, [0, 1], [2, -2]),
              }}
              className="w-[320px] h-[650px] relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 rounded-[45px] -m-2 blur-sm" />
              <div className="relative w-full h-full bg-[#080808] border-[10px] border-slate-900 rounded-[45px] overflow-hidden shadow-2xl">
                {/* Mockup Images Overlayed for Transitions */}
                {steps.map((step, idx) => (
                  <MockupImage 
                    key={idx} 
                    src={step.image} 
                    index={idx} 
                    progress={smoothProgress} 
                  />
                ))}
                
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 pointer-events-none" />
              </div>
            </motion.div>
          </div>
          
        </div>
      </div>

       {/* Mobile Version Placeholder */}
       <div className="lg:hidden absolute top-0 left-0 w-full px-6 py-24 space-y-32">
          {steps.map((step, idx) => (
            <div key={idx} className="space-y-6">
               <div className="relative w-full aspect-[9/18] bg-slate-900 rounded-3xl overflow-hidden border-4 border-slate-800">
                  <Image src={step.image} alt={step.title} fill className="object-cover" sizes="100vw" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                  <p className="text-slate-400">{step.description}</p>
               </div>
            </div>
          ))}
       </div>
    </section>
  );
};

interface StepTextProps {
  step: any;
  index: number;
  progress: any;
}

const StepText = ({ step, index, progress }: StepTextProps) => {
  // Each step active range (0.25 segments)
  const range = [index * 0.25 - 0.1, index * 0.25, index * 0.25 + 0.15, index * 0.25 + 0.25];
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, range, [40, 0, 0, -40]);

  return (
    <motion.div 
      style={{ opacity, y, display: index === 0 ? 'block' : 'block' }}
      className="absolute inset-0 flex flex-col justify-center space-y-6 pointer-events-none"
    >
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ backgroundColor: `${step.color}20`, border: `1px solid ${step.color}40` }}
        >
          <step.icon style={{ color: step.color }} size={24} />
        </div>
        <span className="text-sm font-bold tracking-widest uppercase text-slate-500">Step 0{index + 1}</span>
      </div>
      
      <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
        {step.title.split(" ").map((word: string, i: number) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              filter: 'blur(0px)',
              transition: { duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] } 
            }}
            className="inline-block mr-3"
          >
            {word}
          </motion.span>
        ))}
      </h2>
      <p className="text-lg text-slate-400 max-w-md leading-relaxed">
        {step.description}
      </p>
    </motion.div>
  );
};

interface MockupImageProps {
  src: string;
  index: number;
  progress: any;
}

const MockupImage = ({ src, index, progress }: MockupImageProps) => {
    const range = [index * 0.25 - 0.1, index * 0.25, index * 0.25 + 0.15, index * 0.25 + 0.25];
    const opacity = useTransform(progress, range, [0, 1, 1, 0]);
    const scale = useTransform(progress, range, [1.1, 1, 1, 0.95]);

    return (
        <motion.div 
            style={{ opacity, scale }}
            className="absolute inset-0 w-full h-full"
        >
            <Image 
                src={src} 
                alt="Mockup Step" 
                fill 
                priority={index === 0}
                className="object-cover" 
                sizes="320px"
            />
        </motion.div>
    );
};

export default HowItWorks;
