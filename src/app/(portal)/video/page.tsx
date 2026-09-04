import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Tv, ChevronRight } from 'lucide-react';
import {
  fetchPublishedVideosLive,
  toPublicVideoItem,
  VideoBentoGrid,
  VideoCatalog,
} from '@/src/features/videos';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Koleksi Video Berita & Liputan Khusus | BatuTV',
  description:
    'Tonton siaran video berita teraktual, liputan khusus, pariwisata, budaya, dan agrowisata Kota Batu dan Malang Raya di BatuTV.',
  openGraph: {
    title: 'Koleksi Video Berita & Liputan Khusus | BatuTV',
    description:
      'Tonton siaran video berita teraktual, liputan khusus, pariwisata, budaya, dan agrowisata Kota Batu dan Malang Raya di BatuTV.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://batutv.id/video',
  },
};

export default async function VideoIndexPage() {
  const result = await fetchPublishedVideosLive(60);
  const publicVideos = result.videos.map(toPublicVideoItem);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb & Header */}
        <div className="space-y-3 border-b border-neutral-200 dark:border-neutral-800 pb-5">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-500">
              <li>
                <Link href="/" className="hover:text-red-600 transition-colors">
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true" className="text-neutral-300">
                <ChevronRight className="w-3.5 h-3.5" />
              </li>
              <li className="text-red-600 font-semibold">Video</li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <span className="w-2 h-7 bg-red-600 rounded-xs inline-block" />
                <Tv className="w-6 h-6 text-red-600" />
                <span>Koleksi Video BatuTV</span>
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
                Kompilasi berita video, liputan mendalam, wisata, dan budaya Malang Raya.
              </p>
            </div>
          </div>
        </div>

        {/* Bento Grid Featured Section */}
        {publicVideos.length > 0 && (
          <section aria-labelledby="featured-videos-heading" className="space-y-4">
            <h2 id="featured-videos-heading" className="sr-only">
              Video Pilihan & Utama
            </h2>
            <VideoBentoGrid videos={publicVideos} showLiveButton={false} />
          </section>
        )}

        {/* Full Video Catalog with Filter, Search, and Category Pills */}
        <section aria-labelledby="catalog-videos-heading" className="space-y-4 pt-4">
          <h2 id="catalog-videos-heading" className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-5 bg-red-600 rounded-xs" />
            <span>Semua Video & Arsip</span>
          </h2>
          <VideoCatalog initialVideos={publicVideos} />
        </section>
      </div>
    </main>
  );
}
