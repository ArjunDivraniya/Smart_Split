'use client';

import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function MobileNav({ isOpen, setIsOpen }: MobileNavProps) {
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="lg:hidden text-slate-300 hover:text-white"
    >
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );
}
