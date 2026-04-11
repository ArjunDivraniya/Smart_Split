'use client';

export function Stats() {
  const stats = [
    { value: '10,000+', label: 'Users' },
    { value: '50,000+', label: 'Expenses' },
    { value: '₹2Cr+', label: 'Settled' },
    { value: '4.8⭐', label: 'Rating' },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <p className="text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
