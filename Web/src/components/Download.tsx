'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { useRef } from 'react';

export function Download() {
  const qrRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl font-bold text-white mb-4">Also available on mobile</h2>
                <p className="text-slate-300">
                  Download SmartSplit on Android and manage your expenses on the go.
                </p>
              </div>

              <div className="space-y-3">
                <Link href="https://play.google.com/store" target="_blank">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white h-12 text-lg">
                    📱 Download for Android
                  </Button>
                </Link>
                <Button
                  disabled
                  className="w-full bg-slate-700 text-slate-400 h-12 text-lg cursor-not-allowed"
                >
                  🍎 Coming soon on iOS
                </Button>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <div ref={qrRef}>
                  <QRCodeSVG
                    value="https://play.google.com/store"
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
