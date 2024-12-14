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
        <main className="h-dvh">
          <Toaster
            toastOptions={{
              style: {
                zIndex: 100,
              },
            }}
          />
          {children}
        </main>
        <footer className="absolute bottom-0 w-[200px] flex justify-center items-center h-[60px] z-[90] bg-white border-t shadow-lg">
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
