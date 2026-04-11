'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 pt-20 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-5xl sm:text-6xl font-bold text-white">Get in touch</h1>
              <p className="text-xl text-slate-400">
                We'd love to hear from you. Send us a message and we'll get back to you as soon as possible.
              </p>
            </div>

            {/* Contact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: '📧',
                  title: 'Email',
                  value: 'support@smartsplit.app',
                },
                {
                  icon: '💬',
                  title: 'Live Chat',
                  value: 'Available 9 AM - 6 PM IST',
                },
                {
                  icon: '📱',
                  title: 'Phone',
                  value: '+91 XXXX-XXXX-XX',
                },
              ].map((contact, idx) => (
                <Card key={idx} className="bg-slate-800 border-slate-700 p-6 text-center">
                  <div className="text-4xl mb-4">{contact.icon}</div>
                  <h3 className="font-semibold text-white mb-2">{contact.title}</h3>
                  <p className="text-slate-400">{contact.value}</p>
                </Card>
              ))}
            </div>

            {/* Contact Form */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Name</label>
                    <Input
                      type="text"
                      placeholder="Your name"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Subject</label>
                  <Input
                    type="text"
                    placeholder="How can we help?"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Message</label>
                  <textarea
                    placeholder="Your message here..."
                    rows={6}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 p-3 focus:outline-none focus:border-violet-500"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <Button className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white h-12 font-semibold">
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
