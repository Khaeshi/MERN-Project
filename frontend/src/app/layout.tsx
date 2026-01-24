'use client'

import { Geist, Geist_Mono } from "next/font/google";
import dynamic from 'next/dynamic';
import { Footer } from '../app/components/Footer';
import { CartProvider } from './context/CartContext';  
import { CartSidebar } from "./components/Cart/CartSidebar";
import "./globals.css";

const Header = dynamic(() => import('../app/components/Header').then(mod => mod.Header), { ssr: false });  

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CartProvider>
          <div className="app min-h-screen flex flex-col">
            <Header />
            <main>{children}</main>
            <Footer />
            <CartSidebar />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}