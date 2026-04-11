'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Preferences() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Link href="/profile">
        <Button variant="ghost" className="text-slate-300 hover:text-white">
          <ArrowLeft size={16} className="mr-2" />
          Back to Profile
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-white">Preferences</h1>
        <p className="text-slate-400">Manage your notification and privacy settings</p>
      </div>

      {/* Notifications */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
        <h2 className="text-lg font-bold text-white mb-4">Notifications</h2>
        <div className="space-y-3">
          {[
            { label: 'Settlement reminders', enabled: true },
            { label: 'Budget alerts', enabled: true },
            { label: 'Group updates', enabled: false },
            { label: 'Marketing emails', enabled: false },
          ].map((pref, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-700">
              <label className="text-white cursor-pointer">{pref.label}</label>
              <Checkbox checked={pref.enabled} className="border-slate-600 bg-slate-700" />
            </div>
          ))}
        </div>
      </Card>

      {/* Privacy */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
        <h2 className="text-lg font-bold text-white mb-4">Privacy</h2>
        <div className="space-y-3">
          {[
            { label: 'Show profile publicly', enabled: false },
            { label: 'Allow others to see groups', enabled: true },
          ].map((pref, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-700">
              <label className="text-white cursor-pointer">{pref.label}</label>
              <Checkbox checked={pref.enabled} className="border-slate-600 bg-slate-700" />
            </div>
          ))}
        </div>
      </Card>

      <Button className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white">
        Save Preferences
      </Button>
    </div>
  );
}
