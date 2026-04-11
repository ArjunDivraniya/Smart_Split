'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'Forever',
    description: 'Perfect to get started',
    features: [
      'Up to 3 groups',
      'Unlimited expenses',
      'Basic analytics',
      'Community support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '₹99',
    period: '/month',
    description: 'For power users',
    features: [
      'Unlimited groups',
      'Advanced analytics',
      'UPI payments',
      'Priority support',
      'Data export',
    ],
    cta: 'Start 7-Day Trial',
    highlighted: true,
  },
  {
    name: 'Business',
    price: 'Custom',
    period: 'pricing',
    description: 'For enterprises',
    features: [
      'Everything in Pro',
      'Team management',
      'Custom reporting',
      'API access',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold text-white">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Choose the perfect plan for your needs. Always flexible to scale.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <Card
                key={idx}
                className={`relative flex flex-col p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-violet-900 to-violet-950 border-violet-500 scale-105 shadow-2xl shadow-violet-500/50'
                    : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-slate-600'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-violet-600 to-violet-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-center gap-3">
                      <Check className="text-green-400 flex-shrink-0" size={20} />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" className="w-full">
                  <Button
                    className={`w-full h-12 text-lg font-semibold ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: 'Can I cancel anytime?',
                  a: 'Yes! Cancel your subscription anytime without any penalties or hidden fees.',
                },
                {
                  q: 'Is there a free trial?',
                  a: 'Yes, Pro plan comes with a 7-day free trial. No credit card required.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards, debit cards, and UPI payments.',
                },
                {
                  q: 'Can I change plans?',
                  a: 'Yes, you can upgrade or downgrade your plan anytime. Changes take effect immediately.',
                },
              ].map((faq, idx) => (
                <Card key={idx} className="bg-slate-800 border-slate-700 p-6">
                  <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                  <p className="text-slate-400">{faq.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
