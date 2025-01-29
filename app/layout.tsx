import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
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
      <body className={`${poppins.className} antialiased`}>
        <main className="h-screen w-screen overflow-auto p-5">
          <Toaster
            toastOptions={{
              style: {
                zIndex: 100,
              },
            }}
          />
          {children}
        </main>
      </body>
    </html>
  );
}
