'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Timer, Wallet, User, ShieldCheck, BarChart3, Zap, Sparkles } from 'lucide-react';

const features = [
  {
    title: 'Group Expense Splitting',
    description: 'Split bills with friends, roommates, or travel buddies effortlessly. Handle different ratios and percentages.',
    icon: Users,
    color: '#00FF9D',
  },
  {
    title: 'Trip Timeline Tracking',
    description: 'See your travel expenses chronologically. Add activities and group spending as you move.',
    icon: Timer,
    color: '#3B82F6',
  },
  {
    title: 'Personal Expense Manager',
    description: 'Track your own daily spending alongside group costs. Get a complete picture of your finances.',
    icon: Wallet,
    color: '#A855F7',
  },
  {
    title: 'Smart Friend Balances',
    description: 'Keep track of who owes who. Instant settlements and automated balance calculations.',
    icon: User,
    color: '#F59E0B',
  },
  {
    title: 'Budget Tracking',
    description: 'Set monthly limits and get notified when you are close to exceeding your budget.',
    icon: ShieldCheck,
    color: '#EF4444',
  },
  {
    title: 'Deep Analytics',
    description: 'Visualize your spending habits with intuitive charts and category-wise breakdowns.',
    icon: BarChart3,
    color: '#06B6D4',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
};

const Features = () => {
  return (
    <section id="features" className="py-32 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00FF9D]/5 rounded-full blur-[100px] -mr-48 -mt-24 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#3B82F6]/5 rounded-full blur-[120px] -ml-64 -mb-32 pointer-events-none" />

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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
          >
            Smart Features for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF9D] to-[#3B82F6]">
              Modern Finances.
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            Everything you need to master group spending, travel budgeting, and personal savings in one high-performance interface.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ 
                y: -12,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              className="p-10 rounded-[40px] bg-white/5 border border-white/10 hover:border-[#00FF9D]/40 hover:bg-white/10 transition-all group relative overflow-hidden"
            >
              {/* Dynamic Glow using mouse-tracking could be complex, using top-right glow for now */}
              <div 
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[40px] opacity-0 group-hover:opacity-20 transition-opacity"
                style={{ backgroundColor: feature.color }}
              />

              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-2xl relative overflow-hidden group-hover:scale-110 transition-transform duration-500"
                style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <feature.icon className="w-8 h-8 relative z-10" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-white transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm group-hover:text-slate-300 transition-colors">
                {feature.description}
              </p>

              <div className="mt-10 flex items-center gap-2 text-[#00FF9D] text-xs font-bold uppercase tracking-widest opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                Explore Feature <Zap className="w-3 h-3 fill-current" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
