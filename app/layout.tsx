import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050508",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://resumeroaster.in"),
  title: "Resume Roaster — Brutal AI Resume Feedback",
  description:
    "Paste your resume. Get a brutally honest AI critique for free. Fix it with a professional AI rewrite for ₹99.",
  icons: { icon: "/favicon.png" },
  openGraph: {
    title: "Resume Roaster — Your resume is probably terrible.",
    description:
      "Free AI resume critique. Professional AI rewrite for ₹99. No signup. Results in 10 seconds.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Roaster — Brutal AI Resume Feedback",
    description: "Free AI roast. Professional rewrite for ₹99. No signup.",
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
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased bg-[#050508] text-white`}
      >
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
