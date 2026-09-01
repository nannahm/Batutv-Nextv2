import React from 'react';
import '@/src/styles/globals.css';

export const metadata = {
  title: 'BatuTV News - Portal Berita Resmi Kota Wisata Batu & Malang Raya',
  description: 'Portal berita independen, terpercaya, dan teraktual seputar Kota Batu, Malang Raya, Jawa Timur, dan Nasional oleh BatuTV.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FDFCFB] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased selection:bg-red-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
