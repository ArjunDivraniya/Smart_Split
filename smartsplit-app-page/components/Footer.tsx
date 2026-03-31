'use client';

import React from 'react';
import { Rocket, Share2, Globe, MessageCircle, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-20 mt-24 border-t border-white/5 bg-black/40">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00FF9D] to-[#3B82F6] flex items-center justify-center shadow-lg">
              <Rocket className="text-black w-6 h-6" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">SmartSplit</span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
            Manage group expenses, track personal spending, and settle balances instantly with our premium fintech tool.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-[#3B82F6] hover:border-[#3B82F6] transition-all">
              <Globe className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-white transition-all">
              <Share2 className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-[#00FF9D] hover:border-[#00FF9D] transition-all">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Product Column */}
        <div className="flex flex-col gap-6">
          <h4 className="text-white font-bold uppercase tracking-widest text-xs">Product</h4>
          <ul className="flex flex-col gap-3">
            {['Features', 'Dashboard', 'Analytics', 'Budgeting'].map((item) => (
              <li key={item}>
                <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources Column */}
        <div className="flex flex-col gap-6">
          <h4 className="text-white font-bold uppercase tracking-widest text-xs">Resources</h4>
          <ul className="flex flex-col gap-3">
            {['Download APK', 'Privacy Policy', 'Terms of Service', 'Support'].map((item) => (
              <li key={item}>
                <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Company Column */}
        <div className="flex flex-col gap-6">
          <h4 className="text-white font-bold uppercase tracking-widest text-xs">Company</h4>
          <ul className="flex flex-col gap-3">
            {['About Us', 'Contact', 'Feedback', 'Careers'].map((item) => (
              <li key={item}>
                <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">{item}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-slate-600 text-xs">
          © {new Date().getFullYear()} SmartSplit. All rights reserved.
        </p>
        <p className="text-slate-500 text-xs flex items-center gap-2">
          Designed with <Heart className="w-3 h-3 text-red-500 fill-current" /> for modern finance.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
