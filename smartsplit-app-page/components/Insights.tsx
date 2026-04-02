'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { PieChart, TrendingUp, Wallet2, ArrowUpRight, Target } from 'lucide-react';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Insights = () => {
  return (
    <section id="insights" className="py-32 bg-gradient-to-b from-transparent to-black/30 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-[#3B82F6]/5 rounded-full blur-[150px] -mr-96 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Left Side: Stats and Context */}
        <div className="flex flex-col gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 text-[#3B82F6] font-black text-[10px] tracking-[0.3em] uppercase"
          >
            <div className="w-8 h-[1px] bg-[#3B82F6]/40" />
            Financial Intelligence
          </motion.div>
          
          <div className="space-y-6">
            <motion.h2
              className="text-4xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight"
            >
              {["Insights", "that", "help", "you", "save", "more."].map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "inline-block mr-3",
                    (word === "save" || word === "more.") && "text-[#3B82F6]"
                  )}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h2>
            
            <motion.p
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="text-slate-400 max-w-lg leading-relaxed text-lg"
            >
              Understand where your money goes with military-grade precision. SmartSplit's AI engines categorize your spending in real-time.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <CounterStat value={32} label="Avg. Savings" suffix="%" color="#3B82F6" delay={0.3} />
            <CounterStat value={2.4} label="Settlement Speed" suffix="x" color="#00FF9D" delay={0.4} />
          </div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4 text-white hover:text-[#3B82F6] transition-colors font-bold tracking-widest text-xs uppercase"
          >
            View all Analytics Reports <ArrowUpRight size={16} />
          </motion.button>
        </div>

        {/* Right Side: Data Visualization Section */}
        <div className="relative">
          {/* Decorative Floating Element */}
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-12 -left-12 w-32 h-32 bg-[#A855F7]/10 rounded-3xl border border-white/5 backdrop-blur-3xl z-0 flex items-center justify-center pointer-events-none"
          >
            <Target className="text-[#A855F7] animate-pulse" size={32} />
          </motion.div>

          {/* Main Visual Card */}
          <motion.div
             initial={{ opacity: 0, scale: 0.9, y: 40 }}
             whileInView={{ opacity: 1, scale: 1, y: 0 }}
             viewport={{ once: true }}
             className="w-full relative z-10 p-1 rounded-[40px] bg-gradient-to-br from-white/10 to-transparent"
          >
            <div className="w-full bg-[#0D0D0D] rounded-[38px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
               {/* Grid Pattern */}
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="flex items-center justify-between mb-12 relative z-10">
                  <h3 className="text-white font-bold text-2xl">Spending Breakdown</h3>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400">
                    <PieChart size={20} />
                  </div>
                </div>

                <div className="space-y-10 relative z-10">
                  {/* Vertical Scan Line */}
                  <motion.div 
                    animate={{ x: ["0%", "100%", "0%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 bottom-0 w-[1px] bg-[#00FF9D]/30 shadow-[0_0_10px_#00FF9D] z-20 pointer-events-none"
                  />
                  
                  <InsightBar label="Food & Drinks" value="45%" color="#00FF9D" width="45%" delay={0.6} />
                  <InsightBar label="Travel & Trips" value="30%" color="#3B82F6" width="30%" delay={0.7} />
                  <InsightBar label="Entertainment" value="25%" color="#A855F7" width="25%" delay={0.8} />
                </div>

                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: 1 }}
                   className="mt-14 p-6 rounded-3xl bg-[#00FF9D]/5 border border-[#00FF9D]/20 flex items-center gap-5 relative z-10 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF9D]/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  
                  <div className="w-14 h-14 rounded-2xl bg-[#00FF9D] flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,255,157,0.3)]">
                    <Wallet2 size={28} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Monthly Budget Remaining</span>
                    <span className="text-white font-bold text-2xl tracking-tight">₹ 12,450.00</span>
                  </div>
                </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const CounterStat = ({ value, label, suffix = "", color, delay }: any) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  // Custom counter logic that triggers on viewport
  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
    >
        <div style={{ color }} className="text-4xl md:text-5xl font-black mb-2 flex items-center">
            <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                onViewportEnter={() => {
                   let start = 0;
                   const end = value;
                   const duration = 2000;
                   const stepTime = 50;
                   const timer = setInterval(() => {
                       start += end / (duration / stepTime);
                       if (start >= end) {
                           setDisplayValue(end);
                           clearInterval(timer);
                       } else {
                           setDisplayValue(start);
                       }
                   }, stepTime);
                }}
            >
                {suffix === 'x' ? displayValue.toFixed(1) : Math.floor(displayValue)}
            </motion.span>
            <span>{suffix}</span>
        </div>
        <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">
            {label}
        </div>
    </motion.div>
  );
};

const InsightBar = ({ label, value, color, width, delay }: any) => {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</span>
                <span className="text-white font-black text-sm">{value}</span>
            </div>
            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width }}
                    viewport={{ once: true }}
                    transition={{ 
                        delay, 
                        duration: 1.5, 
                        ease: [0.33, 1, 0.68, 1] 
                    }}
                    className="h-full rounded-full relative"
                    style={{ backgroundColor: color }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30" />
                </motion.div>
            </div>
        </div>
    );
};

export default Insights;
