import "./globals.css";

import type { Metadata, Viewport } from "next";

import { roboto } from "@/lib/fonts/roboto";

export const metadata: Metadata = {
  title: "Peak Poker",
  description:
    "A free, private chip tracker for poker nights with friends. No real money.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B1224",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="en" className={roboto.variable}>
    <body className="min-h-dvh font-sans antialiased">{children}</body>
  </html>
);

export default RootLayout;
