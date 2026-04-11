'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Home,
  Users,
  Wallet,
  TrendingUp,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <Home size={20} /> },
    { label: 'Groups', href: '/groups', icon: <Users size={20} /> },
    { label: 'Personal', href: '/personal', icon: <Wallet size={20} /> },
    { label: 'Friends', href: '/friends', icon: <Users size={20} /> },
    { label: 'Settlements', href: '/settlements', icon: <TrendingUp size={20} /> },
    { label: 'Analytics', href: '/analytics', icon: <TrendingUp size={20} /> },
    { label: 'Budget', href: '/budget', icon: <Wallet size={20} /> },
  ];

  const bottomItems: NavItem[] = [
    { label: 'Notifications', href: '/notifications', icon: <Bell size={20} /> },
    { label: 'Settings', href: '/profile/preferences', icon: <Settings size={20} /> },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  return (
    <div
      className={`h-full bg-gradient-to-b from-[#14141F] to-[#0F0F1A] border-r border-[#1A1A2B]/50 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      } shadow-2xl shadow-black/50`}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-[#1A1A2B] flex items-center justify-between gap-3">
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="text-2xl">💸</div>
          {!collapsed && <span className="font-bold text-[#F0F0FF] text-lg">SmartSplit</span>}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 hover:bg-[#1A1A2B] rounded transition-colors"
          >
            <Menu size={16} className="text-[#8888AA]" />
          </button>
        )}
      </div>

      {/* User Profile Section */}
      {!collapsed && (
        <div className="p-4 border-b border-[#1A1A2B] bg-gradient-to-r from-[#7C5CFC]/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#9B7FFF] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#F0F0FF] text-sm truncate">{session?.user?.name || 'User'}</p>
              <p className="text-xs text-[#8888AA] truncate">{session?.user?.email}</p>
              <p className="text-xs text-[#7C5CFC] font-semibold">₹2,260 net</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE5] text-white shadow-lg shadow-[#7C5CFC]/30'
                    : 'text-[#8888AA] hover:bg-[#1A1A2B] hover:text-[#F0F0FF]'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {!collapsed && (
                  <span className="flex-1 font-medium text-sm">{item.label}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div className="border-t border-[#1A1A2B] p-3 space-y-2">
        {bottomItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE5] text-white shadow-lg shadow-[#7C5CFC]/30'
                    : 'text-[#8888AA] hover:bg-[#1A1A2B] hover:text-[#F0F0FF]'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {!collapsed && <span className="flex-1 font-medium text-sm">{item.label}</span>}
              </div>
            </Link>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-[#8888AA] hover:bg-[#1A1A2B] hover:text-[#FF5F7E] ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {!collapsed && <span className="flex-1 font-medium text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
}
