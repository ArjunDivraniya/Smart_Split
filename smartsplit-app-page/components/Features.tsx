'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Users, Timer, Wallet, User, ShieldCheck, BarChart3, Zap, Sparkles } from 'lucide-react';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const features = [
  {
    title: 'Group Expense Splitting',
    description: 'Split bills with friends, roommates, or travel buddies effortlessly.',
    icon: Users,
    color: '#00FF9D',
  },
  {
    title: 'Trip Timeline Tracking',
    description: 'See your travel expenses chronologically. Add activities as you move.',
    icon: Timer,
    color: '#3B82F6',
  },
  {
    title: 'Personal Expense Manager',
    description: 'Track your own daily spending alongside group costs.',
    icon: Wallet,
    color: '#A855F7',
  },
  {
    title: 'Smart Friend Balances',
    description: 'Keep track of who owes who. Instant settlements.',
    icon: User,
    color: '#F59E0B',
  },
  {
    title: 'Budget Tracking',
    description: 'Set monthly limits and get notified before you exceed them.',
    icon: ShieldCheck,
    color: '#EF4444',
  },
  {
    title: 'Deep Analytics',
    description: 'Visualize your spending habits with intuitive charts.',
    icon: BarChart3,
    color: '#06B6D4',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            <Sparkles className="w-3 h-3" />
            Cutting Edge Tech
          </motion.div>
          
          <motion.h2
            className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
          >
            {["Smart", "Features", "for", "Modern", "Finances."].map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "inline-block mr-3",
                  (word === "Modern" || word === "Finances.") && "text-transparent bg-clip-text bg-gradient-to-r from-[#00FF9D] to-[#3B82F6]"
                )}
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} index={idx} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const FeatureCard = ({ feature, index }: { feature: typeof features[0], index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="p-10 rounded-[40px] bg-white/5 border border-white/10 hover:border-[#00FF9D]/40 transition-all group relative overflow-hidden h-full"
    >
      <div style={{ transform: "translateZ(50px)" }} className="relative z-10">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-2xl relative overflow-hidden group-hover:scale-110 transition-transform duration-500"
          style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
        >
          <feature.icon className="w-8 h-8 relative z-10" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#00FF9D] transition-colors">
          {feature.title}
        </h3>
        <p className="text-slate-400 leading-relaxed text-sm">
          {feature.description}
        </p>

        <div className="mt-10 flex items-center gap-2 text-[#00FF9D] text-xs font-bold uppercase tracking-widest opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          Explore Feature <Zap className="w-3 h-3 fill-current" />
        </div>
      </div>

      <div 
        className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ transform: "translateZ(-10px)" }}
      />
    </motion.div>
  );
};

export default Features;
