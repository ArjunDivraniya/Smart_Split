'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';

export default function Export() {
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
        <h1 className="text-3xl font-bold text-white">Export Your Data</h1>
        <p className="text-slate-400">Download all your transaction history and data</p>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: 'Export as JSON',
            description: 'Complete data export in JSON format',
            icon: '📄',
          },
          {
            title: 'Export as CSV',
            description: 'Transactions in spreadsheet format',
            icon: '📊',
          },
          {
            title: 'Export as PDF',
            description: 'Formatted report of all transactions',
            icon: '📕',
          },
          {
            title: 'Export Receipts',
            description: 'All uploaded receipt images',
            icon: '📸',
          },
        ].map((option, idx) => (
          <Card key={idx} className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
            <div className="space-y-4">
              <div className="text-3xl">{option.icon}</div>
              <div>
                <h3 className="font-semibold text-white">{option.title}</h3>
                <p className="text-sm text-slate-400">{option.description}</p>
              </div>
              <Button className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white">
                <Download size={16} className="mr-2" />
                Export
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Note */}
      <Card className="bg-blue-900/20 border-blue-700/30 p-4">
        <p className="text-blue-200 text-sm">
          💡 Your data export is generated on-demand. Depending on the amount of data, this may take a few moments.
        </p>
      </Card>
    </div>
  );
}
