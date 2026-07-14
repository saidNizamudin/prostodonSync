import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AppNavbar from "@/components/app-navbar";
import Footer from "@/components/footer";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FKG Schedule Race",
  description: "Schedule registration for Prostodonsia and Bedah Mulut",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} antialiased flex flex-col min-h-screen bg-gray-100`}
      >
        <AppNavbar />
        <main className="flex min-h-0 flex-1 flex-col overflow-auto px-4 pb-5 pt-20 sm:px-6">
          <Toaster
            toastOptions={{
              style: {
                zIndex: 100,
              },
            }}
          />
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
