'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setSent(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradient Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-[#7C5CFC] to-transparent rounded-full blur-3xl opacity-15 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-[#38BDF8] to-transparent rounded-full blur-3xl opacity-15 animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Form Card */}
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border border-[#1A1A2B]/50 p-8 shadow-2xl shadow-[#7C5CFC]/20">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#F0F0FF]">Reset your password</h1>
            <p className="text-[#8888AA] mt-2">
              {sent
                ? 'Check your email for a password reset link'
                : 'Enter your email address and we will send you a link to reset your password'}
            </p>
          </div>

          {sent ? (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-[#1E3D1E] to-[#143D14] border border-[#323F32] rounded-lg text-center shadow-lg shadow-green-500/10">
                <p className="text-[#99FF99] font-semibold">
                  Password reset link sent to <strong>{email}</strong>
                </p>
                <p className="text-sm text-[#66DD66] mt-2">Check your spam folder if you don't see it</p>
              </div>

              <Button className="w-full bg-gradient-to-r from-[#0F0F1A] to-[#1A1A2B] border border-[#1A1A2B] text-[#F0F0FF] hover:from-[#1A1A2B] hover:to-[#252540] shadow-lg shadow-black/20 transition-all" variant="outline">
                <Link href="/login" className="flex items-center gap-2">
                  <ArrowLeft size={16} />
                  Back to login
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#F0F0FF] mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0F0F1A] border border-[#1A1A2B] text-[#F0F0FF] placeholder:text-[#55556A] focus:border-[#7C5CFC] focus:ring-1 focus:ring-[#7C5CFC]/30 transition-colors"
                  required
                />
              </div>

              {error && <div className="p-3 bg-gradient-to-r from-[#3D1E1E] to-[#5F3232] border border-[#5F3232] rounded-lg text-[#FF9999] text-sm shadow-lg shadow-red-500/10">{error}</div>}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-br from-[#7C5CFC] to-[#6B4CE5] hover:from-[#8B6CFF] hover:to-[#5A3FD5] text-white h-10 font-semibold shadow-lg shadow-[#7C5CFC]/30 hover:shadow-[#7C5CFC]/50 transition-all"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Button className="w-full bg-gradient-to-r from-[#0F0F1A] to-[#1A1A2B] border border-[#1A1A2B] text-[#F0F0FF] hover:from-[#1A1A2B] hover:to-[#252540] shadow-lg shadow-black/20 transition-all" variant="outline">
                <Link href="/login" className="flex items-center gap-2">
                  <ArrowLeft size={16} />
                  Back to login
                </Link>
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
