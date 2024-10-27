import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BotWidget from "@/components/AIBot";
import Navbar from "@/components/Navbar";

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
  title: "Wing Heights",
  description: "Ghana's only insurance solution !",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen flex flex-col">
          
          <Navbar />
          
          <main >
            {children}
            <BotWidget />
          </main>

          
          <footer className="bg-gray-200 p-4">
            <div className="container mx-auto text-center">
              &copy; {new Date().getFullYear()} Wing Heights. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
