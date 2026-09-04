import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ClientVideoDetailWrapper from '@/src/components/video/ClientVideoDetailWrapper';
import {
  fetchVideoBySlugLive,
  fetchPublishedVideosLive,
  resolveVideoThumbnail,
} from '@/src/features/videos';

/**
 * ISR Revalidation: 60 detik.
 */
export const revalidate = 60;

/**
 * dynamicParams = true memungkinkan video baru yang dipublish setelah build time
 * langsung di-render on-demand di server (SSR) dan di-cache secara otomatis.
 */
export const dynamicParams = true;

interface NextVideoDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const result = await fetchPublishedVideosLive(30);
  return result.videos.map((v) => ({
    slug: v.slug,
  }));
}

export async function generateMetadata({
  params,
}: NextVideoDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchVideoBySlugLive(slug);

  if (result.source === 'not-found' || !result.video) {
    return {
      title: 'Video Tidak Ditemukan | BatuTV',
      description: 'Halaman video yang Anda cari tidak ditemukan di portal BatuTV.',
    };
  }

  const video = result.video;
  const title = `${video.title} | Video BatuTV`;
  const description = video.excerpt || video.description?.slice(0, 160) || 'Tonton liputan video BatuTV.';
  const posterUrl = resolveVideoThumbnail(video);
  const canonicalUrl = `https://batutv.id/video/${video.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'video.other',
      url: canonicalUrl,
      images: posterUrl
        ? [
            {
              url: posterUrl,
              alt: video.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: posterUrl ? [posterUrl] : [],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function NextVideoDetailPage({
  params,
}: NextVideoDetailPageProps) {
  const { slug } = await params;
  const result = await fetchVideoBySlugLive(slug);

  // Jika video berstatus draft atau memang tidak ditemukan (404 riil di Firestore),
  // picu Next.js notFound() agar merender halaman 404 asli.
  if (result.source === 'not-found' || !result.video) {
    notFound();
  }

  return <ClientVideoDetailWrapper slug={slug} />;
}
