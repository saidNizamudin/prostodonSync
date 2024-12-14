import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

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
  title: "Koas Helper",
  description: "Collection of tools for Koas Residency",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-dvw h-dvh`}
      >
        <main className="h-[calc(100vh-40px)]">
          <Toaster />
          {children}
        </main>
        <footer className="absolute bottom-0 w-dvw flex justify-center items-center h-10 z-[99999] bg-white">
          <span>
            Created by{" "}
            <Link
              className="underline"
              href="https://said-nizamudin.netlify.app/"
            >
              @Bingbong
            </Link>
          </span>
        </footer>
      </body>
    </html>
  );
}
