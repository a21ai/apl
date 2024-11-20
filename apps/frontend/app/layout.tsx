import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import DefaultLayout from "@/components/DefaultLayout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Archway.gg",
  description: "Your gateway to the Arch ecosystem",
  openGraph: {
    images: [{
      url: 'https://media.ordinalswallet.com/b4ed12ce805c6d1ab0ab44e7b454f20cb4c81e4ec8b1999616839efb397bc243.png',
      width: 1200,
      height: 630,
      alt: 'Description of the image',
    }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-slate-900 to-black p-4 md:p-8 relative overflow-hidden">
          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[20%] left-[20%] w-48 h-48 bg-pink-500/30 rounded-full blur-2xl animate-float" />
            <div className="absolute top-[25%] right-[25%] w-64 h-64 bg-blue-500/20 rounded-full blur-2xl animate-float-delayed" />
            <div className="absolute bottom-[30%] left-[30%] w-56 h-56 bg-purple-500/20 rounded-full blur-2xl animate-float" />
          </div>

          <DefaultLayout>{children}</DefaultLayout>
        </div>
      </body>
    </html>
  );
}
