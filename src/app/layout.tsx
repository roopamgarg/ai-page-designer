import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'AI Landing Page Generator',
  description: 'Generate beautiful, production-ready landing pages with AI. Just describe your idea and get a complete HTML page.',
  keywords: ['AI', 'landing page', 'generator', 'website builder', 'HTML'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
