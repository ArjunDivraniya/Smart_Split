'use client';

import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Arjun Sharma',
    role: 'College Student',
    image: '👨‍🎓',
    rating: 5,
    quote: 'Finally, a hassle-free way to track shared expenses with my roommates. No more arguments about who owes what!',
  },
  {
    name: 'Priya Patel',
    role: 'Freelancer',
    image: '👩‍💼',
    rating: 5,
    quote: 'The analytics are incredible. I can see exactly where my money goes every month. Highly recommend!',
  },
  {
    name: 'Raj Kumar',
    role: 'Startup Founder',
    image: '👨‍💻',
    rating: 5,
    quote: 'We use SmartSplit for company expenses. The settlement feature saves us hours of bookkeeping every month.',
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">Loved by users</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            See what people are saying about SmartSplit
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <Card
              key={idx}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-8"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-slate-300 mb-6 italic lowercase first-letter:uppercase">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-3">
                <div className="text-3xl">{testimonial.image}</div>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
