import type { Metadata } from 'next';
import { Playfair_Display, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cafe Prince',
  description: 'A cafe ordering website.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
      <Analytics/>
        <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}