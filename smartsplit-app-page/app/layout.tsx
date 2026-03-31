import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartSplit | Split Smarter. Live Better.",
  description: "The premium fintech app to manage group expenses, track personal spending, and settle balances instantly.",
};

import CustomCursor from "@/components/CustomCursor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased selection:bg-[#00FF9D]/30`}
    >
      <body className="min-h-full flex flex-col relative bg-[#0D0D0D]">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
