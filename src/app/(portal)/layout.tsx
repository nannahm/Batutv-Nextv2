import React from 'react';

export const metadata = {
  title: 'BatuTV News - Portal Berita Resmi Kota Wisata Batu & Malang Raya',
  description: 'Portal berita teraktual, independen dan terpercaya.',
};

export default function PortalGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen flex flex-col">{children}</div>;
}
