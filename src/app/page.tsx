import React from 'react';
import type { Metadata } from 'next';
import { fetchPublishedArticlesLive } from '@/src/features/articles/data/liveFirestoreService';
import { ClientPortalHome } from '@/src/components/home/ClientPortalHome';

/**
 * ISR Revalidation: 60 detik.
 * Menjaga performa TTFB tetap instan melalui edge cache (SSG/ISR)
 * dan memastikan pembaruan konten redaksi langsung terefleksi secara otomatis.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'BatuTV | Portal Berita Terkini, Daerah Batu, Nasional & Video',
  description:
    'Portal Berita Terkini, Akurat, dan Terpercaya Seputar Kota Batu, Malang Raya, Jawa Timur, Nasional, Ekonomi, Politik, dan Siaran TV Streaming - BatuTV.',
};

export default async function RootHomePage() {
  // Fetch up to 30 published articles from Live Firestore (with fallback to seed cache)
  const result = await fetchPublishedArticlesLive(30);

  return <ClientPortalHome initialArticles={result.articles} />;
}
