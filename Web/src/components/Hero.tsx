'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlayCircle, ArrowRight } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function Hero() {
  const { data: session } = useSession();

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden pt-20 pb-10">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="text-white">Split Expenses.</span>
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  Track Spending.
                </span>
                <br />
                <span className="text-white">Settle Smarter.</span>
              </h1>
            </div>

            <p className="text-xl text-slate-300 max-w-md leading-relaxed">
              The only app that combines group expense splitting with personal finance tracking. Perfect for roommates, friends, and trips.
            </p>

            {/* Trust badges */}
            <div className="flex items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-1">
                <span className="text-2xl">👥</span>
                <span>10,000+ users</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl">⭐</span>
                <span>4.8 rating</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {session ? (
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white text-lg h-12 px-8 group">
                    Go to Dashboard
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white text-lg h-12 px-8 group">
                      Start for Free
                      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-800 text-lg h-12 px-8 group gap-2"
                  >
                    <PlayCircle size={20} />
                    Watch Demo
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Right - Phone Mockup */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-80 h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 animate-pulse" />
              <div className="relative text-center space-y-4">
                <div className="text-5xl">💰</div>
                <p className="text-slate-300 text-sm">Dashboard Preview</p>
                <div className="space-y-2 text-left text-xs text-slate-400">
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded">
                    <span>Rent</span>
                    <span className="text-violet-400">₹15,000</span>
                  </div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded">
                    <span>Groceries</span>
                    <span className="text-cyan-400">₹3,500</span>
                  </div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded">
                    <span>You owe</span>
                    <span className="text-green-400">₹7,500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
