'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Session } from 'next-auth';

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  session: Session | null;
  status: string;
}

export function MobileMenu({ isOpen, setIsOpen, session, status }: MobileMenuProps) {
  return (
    <div className="md:hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="text-white">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-slate-900 border-b border-slate-800 p-4 space-y-3">
          <Link href="#features" className="block text-slate-300 hover:text-white">
            Features
          </Link>
          <Link href="#how-it-works" className="block text-slate-300 hover:text-white">
            How It Works
          </Link>
          <Link href="/pricing" className="block text-slate-300 hover:text-white">
            Pricing
          </Link>
          <Link href="/about" className="block text-slate-300 hover:text-white">
            About
          </Link>

          <div className="pt-4 border-t border-slate-700 space-y-2">
            {status === 'loading' ? (
              <div className="w-full h-8 bg-slate-700 rounded animate-pulse" />
            ) : session ? (
              <>
                <Link href="/dashboard">
                  <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={() => signOut()}
                  variant="outline"
                  className="w-full text-red-400 border-red-400 hover:bg-red-950"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register" className="block">
                  <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
