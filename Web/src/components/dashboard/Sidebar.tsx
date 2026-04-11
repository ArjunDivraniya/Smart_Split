'use client';

import Link from 'next/link';
import {
  LayoutGrid,
  Users,
  Wallet,
  TrendingUp,
  Settings,
  LogOut,
  BarChart3,
  Home,
  PieChart,
  Clock,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard', section: 'main' },
    { icon: Home, label: 'Personal', href: '/personal', section: 'main' },
    { icon: Users, label: 'Groups', href: '/groups', section: 'main' },
    { icon: Users, label: 'Friends', href: '/friends', section: 'main' },
    { icon: Wallet, label: 'Settlements', href: '/settlements', section: 'main' },
    { type: 'divider' },
    { icon: TrendingUp, label: 'Analytics', href: '/analytics', section: 'insights' },
    { icon: PieChart, label: 'Budget', href: '/budget', section: 'insights' },
    { type: 'divider' },
    { icon: Clock, label: 'Notifications', href: '/notifications', section: 'other' },
    { icon: Settings, label: 'Profile', href: '/profile', section: 'other' },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">💸</span>
          <span className="font-bold text-lg bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            SmartSplit
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-1">
          {menuItems.map((item, idx) => {
            if (item.type === 'divider') {
              return <div key={idx} className="my-4 border-t border-slate-800" />;
            }

            const Icon = item.icon;
            return (
              <Link key={idx} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <Button
          onClick={() => signOut()}
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
