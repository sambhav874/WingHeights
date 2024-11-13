import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BotWidget from "@/components/AIBot";
import { getNavigation } from '@/lib/api'
import { MainNavigation } from "@/components/MainNavigation";
import { Footer } from "@/components/Footer";

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
          
          <main >
            {children}
            
          </main>

          
          <footer className="bg-gray-200 ">
            
             <Footer items={navigation} />
            
          </footer>
        </div>
      </body>
    </html>
  );
}
