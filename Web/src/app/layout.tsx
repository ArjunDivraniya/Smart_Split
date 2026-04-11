import type { Metadata, Viewport } from "next"; // Import Viewport
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"] });

// 1. Add Viewport export for mobile scaling
export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming for a native app feel
};

// 2. Add Apple-specific PWA metadata
export const metadata: Metadata = {
  title: "SmartSplit - Split Expenses Easily",
  description: "Modern expense splitting & settlement management app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SmartSplit",
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: "#080810",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${dmSans.className} bg-[#080810] text-[#F0F0FF] antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}