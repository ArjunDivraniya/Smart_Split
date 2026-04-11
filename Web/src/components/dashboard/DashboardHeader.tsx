'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  Bell,
  Moon,
  Sun,
  ChevronDown,
  Settings,
  LogOut,
  Wallet,
  Download,
  Menu,
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface DashboardHeaderProps {
  pageTitle?: string;
  onMenuClick?: () => void;
}

export function DashboardHeader({ pageTitle = 'Dashboard', onMenuClick }: DashboardHeaderProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-[#14141F] to-[#0F0F1A]/80 backdrop-blur-sm border-b border-[#1A1A2B]/50 shadow-lg">
      <div className="h-16 flex items-center justify-between px-4 lg:pl-72 lg:px-8">
        {/* Left - Hamburger & Title */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-[#1A1A2B] rounded-lg transition-colors"
          >
            <Menu size={24} className="text-[#F0F0FF]" />
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-[#F0F0FF] to-[#8888AA] bg-clip-text text-transparent truncate hidden sm:block">
            {pageTitle}
          </h1>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-[#1A1A2B] rounded-lg transition-colors">
            <Bell size={20} className="text-[#8888AA] hover:text-[#F0F0FF]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF5F7E] rounded-full" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 hover:bg-[#1A1A2B] rounded-lg transition-colors hidden sm:block"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-[#8888AA] hover:text-[#F0F0FF]" />
            ) : (
              <Moon size={20} className="text-[#8888AA] hover:text-[#F0F0FF]" />
            )}
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-[#1A1A2B] rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#9B7FFF] flex items-center justify-center text-white font-bold text-sm">
                {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm text-[#F0F0FF] hidden sm:block truncate max-w-[120px]">
                {session?.user?.name?.split(' ')[0]}
              </span>
              <ChevronDown
                size={16}
                className={`text-[#8888AA] transition-transform hidden sm:block ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-gradient-to-b from-[#14141F] to-[#0F0F1A] border border-[#1A1A2B] rounded-lg shadow-2xl shadow-black/50 overflow-hidden z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-[#1A1A2B] bg-gradient-to-r from-[#7C5CFC]/10 to-transparent">
                    <p className="text-sm font-semibold text-[#F0F0FF]">{session?.user?.name}</p>
                    <p className="text-xs text-[#8888AA]">{session?.user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-[#F0F0FF] hover:bg-[#1A1A2B] transition-colors flex items-center gap-2"
                    >
                      <span>👤</span> Profile
                    </Link>
                    <Link
                      href="/profile/preferences"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-[#F0F0FF] hover:bg-[#1A1A2B] transition-colors flex items-center gap-2"
                    >
                      <Settings size={16} /> Preferences
                    </Link>
                    <Link
                      href="/profile/export"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-[#F0F0FF] hover:bg-[#1A1A2B] transition-colors flex items-center gap-2"
                    >
                      <Download size={16} /> Export Data
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-[#F0F0FF] hover:bg-[#1A1A2B] transition-colors flex items-center gap-2"
                    >
                      <Wallet size={16} /> Payment History
                    </Link>

                    {/* Divider */}
                    <div className="my-2 border-t border-[#1A1A2B]" />

                    {/* Logout */}
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        signOut({ redirect: true, callbackUrl: '/login' });
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[#FF5F7E] hover:bg-[#1A1A2B] transition-colors flex items-center gap-2"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
