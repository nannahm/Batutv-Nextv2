import React from 'react';
import type { Metadata, Viewport } from 'next';
import '@/src/styles/globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'BatuTV | Portal Berita Terkini, Daerah Batu, Nasional & Video',
  description: 'Portal Berita Terkini, Akurat, dan Terpercaya Seputar Kota Batu, Malang Raya, Jawa Timur, Nasional, Ekonomi, Politik, dan Siaran TV Streaming - BatuTV.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="min-h-screen bg-[#FDFCFB] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased selection:bg-red-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
