import type { Metadata } from "next";

import "@/app/globals.css";

import { Analytics } from "@vercel/analytics/next";
import { EB_Garamond, Geist_Mono, Inter } from "next/font/google";
import { AppWrapper } from "./app-wrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono"
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond"
});

export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Homebrew HN"
  },
  description: "Brew your morning HN",
  icons: {
    icon: process.env.NODE_ENV === "development" ? "/icon.svg" : "/icon.svg"
  },
  themeColor: "#245be5",
  title:
    process.env.NODE_ENV === "development" ? "DEV | Homebrew HN" : "Homebrew HN"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} ${ebGaramond.variable} antialiased`}
      >
        <AppWrapper>{children}</AppWrapper>
        <Analytics />
      </body>
    </html>
  );
}
