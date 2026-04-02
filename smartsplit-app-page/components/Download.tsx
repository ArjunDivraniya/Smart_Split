'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, PlayCircle, QrCode, Sparkles, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Magnetic from './Magnetic';

import { QRCodeSVG } from 'qrcode.react';

const DOWNLOAD_URL = 'https://expo.dev/accounts/arjundivraniya/projects/smartsplit/builds/e12b1d22-148b-48ef-b768-f24408e25de2';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DownloadCTA = () => {
  return (
    <section id="download" className="py-32 relative overflow-hidden flex items-center justify-center">
      {/* Dynamic Background Glows */}
      <motion.div 
        animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-tr from-[#00FF9D]/20 to-[#3B82F6]/20 rounded-full blur-[140px] pointer-events-none" 
      />

      <div className="max-w-6xl mx-auto px-6 w-full relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
           className="relative p-12 md:p-24 rounded-[50px] bg-[#0A0A0A] border border-white/10 overflow-hidden shadow-2xl"
        >
          {/* Internal Grid Glow */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Content and Buttons */}
            <div className="text-left space-y-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    <Smartphone size={14} className="text-[#00FF9D]" />
                    Ready for the Next Generation
                </motion.div>

                <motion.h2 
                    className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tighter"
                >
                    {["Take", "Control", "of", "Your", "Future."].map((word, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                          "inline-block mr-4",
                          (word === "Your" || word === "Future.") && "text-transparent bg-clip-text bg-gradient-to-r from-[#00FF9D] to-[#3B82F6]"
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
                    className="text-slate-400 text-xl leading-relaxed max-w-lg"
                >
                    Stop the awkward math and endless group chats. Join over 1,000 users managing their wealth with SmartSplit.
                </motion.p>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                    <Magnetic>
                      <motion.button
                          onClick={() => window.open(DOWNLOAD_URL, '_blank')}
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full sm:w-auto bg-[#00FF9D] text-black px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-4 shadow-[0_0_50px_rgba(0,255,157,0.4)] transition-all group"
                      >
                          <Download size={22} className="group-hover:translate-y-0.5 transition-transform" />
                          Download APK
                      </motion.button>
                    </Magnetic>
                    
                    <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="w-full sm:w-auto bg-transparent border border-white/20 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-3 opacity-40 hover:opacity-100 transition-all cursor-not-allowed"
                    >
                        <PlayCircle size={22} />
                        Play Store
                        <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-full ml-1 font-bold">Soon</span>
                    </motion.button>
                </div>

                <div className="flex items-center gap-6 pt-8 border-t border-white/5 opacity-50">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={18} className="text-[#00FF9D]" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Safe & Secure</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-[#3B82F6]" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ad-Free Forever</span>
                    </div>
                </div>
            </div>

            {/* Right: Illustration and QR */}
            <div className="flex flex-col items-center lg:items-end gap-10">
                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-full max-w-[280px] aspect-[9/18]"
                >
                    <div className="absolute inset-0 bg-[#00FF9D]/10 blur-[60px] rounded-full" />
                    <div className="relative w-full h-full rounded-[40px] border-8 border-slate-900 overflow-hidden shadow-2xl bg-[#080808]">
                        <Image src="/settle-mockup.png" alt="Success Screen" fill className="object-cover" sizes="280px" />
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="p-8 rounded-[35px] bg-white/5 border border-white/10 flex flex-col items-center gap-6 group hover:border-[#00FF9D]/40 transition-all backdrop-blur-2xl"
                >
                    <div className="p-3 rounded-[20px] bg-white flex items-center justify-center shadow-[0_0_30px_rgba(0,255,157,0.3)] transition-transform group-hover:scale-110">
                         <QRCodeSVG 
                            value={DOWNLOAD_URL}
                            size={100}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"L"}
                            includeMargin={false}
                         />
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-white font-bold text-xs">Scan to Download</p>
                        <p className="text-slate-600 font-bold text-[9px] uppercase tracking-widest">Android 8.0 or Higher</p>
                    </div>
                </motion.div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DownloadCTA;
