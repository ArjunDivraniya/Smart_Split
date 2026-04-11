'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditProfile() {
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
        <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
        <p className="text-slate-400">Update your personal information</p>
      </div>

      {/* Edit Form */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Full Name</label>
            <Input
              defaultValue="John Doe"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Email</label>
            <Input
              type="email"
              defaultValue="john@example.com"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Phone</label>
            <Input
              type="tel"
              defaultValue="+91 98765 43210"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white">
              Save Changes
            </Button>
            <Link href="/profile">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
