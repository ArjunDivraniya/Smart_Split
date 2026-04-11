'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';

export default function About() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 pt-20 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {/* Hero */}
            <div className="text-center space-y-4">
              <h1 className="text-5xl sm:text-6xl font-bold text-white">About SmartSplit</h1>
              <p className="text-xl text-slate-400">
                Making expense splitting simple and fair for everyone
              </p>
            </div>

            {/* Mission */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-8 space-y-4">
              <h2 className="text-3xl font-bold text-white">Our Mission</h2>
              <p className="text-slate-300 leading-relaxed">
                We believe that managing shared expenses shouldn't be complicated or cause conflicts. 
                SmartSplit combines the simplicity of expense splitting with powerful personal finance 
                tracking to give you complete control over your money.
              </p>
            </Card>

            {/* Values */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'Transparency',
                    description: 'Complete visibility into all transactions and settlements',
                  },
                  {
                    title: 'Fairness',
                    description: 'Smart algorithms ensure everyone pays their fair share',
                  },
                  {
                    title: 'Simplicity',
                    description: 'Easy-to-use interface that anyone can master in minutes',
                  },
                  {
                    title: 'Security',
                    description: 'Bank-level encryption for all your financial data',
                  },
                ].map((value, idx) => (
                  <Card key={idx} className="bg-slate-800 border-slate-700 p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                    <p className="text-slate-400">{value.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Team */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-8 space-y-4">
              <h2 className="text-3xl font-bold text-white">Built by a passionate team</h2>
              <p className="text-slate-300 leading-relaxed">
                SmartSplit was founded by a group of developers and designers who got tired of 
                complicated expense tracking and payment apps. We wanted to build something 
                simple, beautiful, and actually useful.
              </p>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
