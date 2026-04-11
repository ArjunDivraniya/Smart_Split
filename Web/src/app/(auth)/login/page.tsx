'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradient Elements - Mobile Style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-[#7C5CFC] to-transparent rounded-full blur-3xl opacity-15 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-[#38BDF8] to-transparent rounded-full blur-3xl opacity-15 animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Form Card with Gradient Border Effect */}
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border border-[#1A1A2B]/50 p-8 shadow-2xl shadow-[#7C5CFC]/20">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-3xl">💸</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#7C5CFC] to-[#9B7FFF] bg-clip-text text-transparent">
                SmartSplit
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#F0F0FF]">Welcome Back</h1>
            <p className="text-[#8888AA] mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#F0F0FF] mb-2">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0F0F1A] border border-[#1A1A2B] text-[#F0F0FF] placeholder:text-[#55556A] focus:border-[#7C5CFC] focus:ring-1 focus:ring-[#7C5CFC]/30 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#F0F0FF] mb-2">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1A1A2B]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#14141F] text-[#8888AA] text-xs font-semibold">Or continue with</span>
              </div>
            </div>

            <Button
              onClick={() => signIn('google')}
              className="w-full mt-4 bg-gradient-to-r from-[#0F0F1A] to-[#1A1A2B] border border-[#1A1A2B] text-[#F0F0FF] hover:from-[#1A1A2B] hover:to-[#252540] shadow-lg shadow-black/20 transition-all"
              variant="outline"
            >
              Google
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            <p className="text-[#8888AA]">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#7C5CFC] hover:text-[#9B7FFF] font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-[#8888AA] hover:text-[#F0F0FF] text-sm transition-colors">
              Forgot your password?
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
