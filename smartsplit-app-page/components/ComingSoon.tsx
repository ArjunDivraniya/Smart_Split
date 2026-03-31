'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlayCircle, Sparkles } from 'lucide-react';

interface ComingSoonProps {
  isOpen: boolean;
  onClose: () => void;
}

const ComingSoon = ({ isOpen, onClose }: ComingSoonProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] cursor-pointer"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-6 z-[101] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[#0D0D0D] border border-white/10 rounded-[40px] p-10 relative pointer-events-auto overflow-hidden shadow-[0_0_100px_rgba(0,255,157,0.15)]"
            >
              {/* Animated Background Orbs */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00FF9D]/10 rounded-full blur-[60px]" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#3B82F6]/10 rounded-full blur-[60px]" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-8 relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#00FF9D] to-[#3B82F6] flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(0,255,157,0.2)]">
                  <PlayCircle size={40} className="text-black" />
                </div>

                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] text-[10px] font-black uppercase tracking-[0.2em]">
                    <Sparkles size={10} />
                    In Production
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight">Demo Video Coming Soon</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Our team is currently polishing a cinematic walkthrough to show you exactly how SmartSplit revolutionizes your finances. Stay tuned!
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#00FF9D] transition-all hover:shadow-[0_0_30px_rgba(0,255,157,0.3)] active:scale-95"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ComingSoon;
