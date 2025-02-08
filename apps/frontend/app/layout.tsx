import type { Metadata } from "next";
import localFont from "next/font/local";

import DefaultLayout from "@/components/DefaultLayout";

import "@/app/globals.css";

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
    images: [
      {
        url: "https://media.ordinalswallet.com/b4ed12ce805c6d1ab0ab44e7b454f20cb4c81e4ec8b1999616839efb397bc243.png",
        width: 1200,
        height: 630,
        alt: "Description of the image",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DefaultLayout>{children}</DefaultLayout>
      </body>
    </html>
  );
}
