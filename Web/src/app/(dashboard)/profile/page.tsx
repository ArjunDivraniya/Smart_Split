'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit2, Lock, Download, Trash2 } from 'lucide-react';

export default function Profile() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="text-slate-400">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-white text-3xl font-bold">
            J
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">John Doe</h2>
            <p className="text-slate-400">john@example.com</p>
            <p className="text-sm text-slate-500 mt-1">Member since 2024</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link href="/profile/edit">
            <Button className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white">
              <Edit2 size={16} className="mr-2" />
              Edit Profile
            </Button>
          </Link>
          <Link href="/profile/preferences">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              <Lock size={16} className="mr-2" />
              Preferences
            </Button>
          </Link>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/profile/export">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-4 hover:border-cyan-500 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Download size={24} className="text-cyan-400" />
              <div>
                <p className="font-semibold text-white">Export Data</p>
                <p className="text-sm text-slate-400">Download all your data</p>
              </div>
            </div>
          </Card>
        </Link>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-4 hover:border-red-500 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <Trash2 size={24} className="text-red-400" />
            <div>
              <p className="font-semibold text-white">Delete Account</p>
              <p className="text-sm text-slate-400">Permanently delete</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Account Information */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Account Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-slate-700">
            <span className="text-slate-400">Email</span>
            <span className="text-white">john@example.com</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-700">
            <span className="text-slate-400">Phone</span>
            <span className="text-white">+91 98765 43210</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-700">
            <span className="text-slate-400">Member Since</span>
            <span className="text-white">January 2024</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-400">Two-Factor Auth</span>
            <span className="text-green-400 font-semibold">Enabled</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
