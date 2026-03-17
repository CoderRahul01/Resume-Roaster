import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
  title: "Resume Roaster — Get Your Resume Brutally Critiqued by AI",
  description:
    "Paste your resume, get a brutal AI roast free. Then unlock a professionally rewritten version for $4.99.",
  openGraph: {
    title: "Resume Roaster — Brutal AI Resume Feedback",
    description:
      "Paste your resume, get a brutal AI roast free. Then unlock a professionally rewritten version for $4.99.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white`}
      >
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
