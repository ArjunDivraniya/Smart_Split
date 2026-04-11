'use client';

import { useSession } from 'next-auth/react';
import { Menu, X, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface DashboardHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function DashboardHeader({ sidebarOpen, setSidebarOpen }: DashboardHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden text-slate-300 hover:text-white"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="flex-1" />

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:text-white hover:bg-slate-700 relative"
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Settings & Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 flex items-center justify-center text-white font-semibold">
                  {session?.user?.name?.[0] || 'U'}
                </div>
                <span className="hidden sm:inline text-sm">{session?.user?.name?.split(' ')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
              <DropdownMenuItem className="text-slate-100 cursor-pointer">
                <Link href="/profile" className="w-full">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-100 cursor-pointer">
                <Link href="/profile/preferences" className="w-full">
                  Preferences
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-100 cursor-pointer border-t border-slate-700 mt-2 pt-2">
                <Link href="/profile/export" className="w-full">
                  Export Data
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
