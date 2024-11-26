import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BotWidget from "@/components/AIBot";
import { getNavigation } from '@/lib/api'
import { MainNavigation } from "@/components/MainNavigation";
import { Footer } from "@/components/Footer";
import InsuranceQuoteWidget from "@/components/InsuranceQuoteWidget";
import { TestContext } from "node:test";
import Test from "@/components/ChatBot";

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
  title: 'Wing Heights Ghana',
  description: 'Ghana\'s leading insurance brokers',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navigation = await getNavigation();
  
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen flex flex-col">
          {navigation && <MainNavigation items={navigation} />}
          
          <main className="flex-grow">
            {children}
          </main>
          
          <footer className="bg-gray-200">
            <Footer items={navigation} />
          </footer>
        </div>

        <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-6">
          <div className="relative mb-4">
            {process.env.NEXT_PUBLIC_SOCKET_URL && <Test />}
          </div>
          
        </div>
      </body>
    </html>
  );
}