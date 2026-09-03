import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ClientArticleDetailWrapper from '@/src/components/article/ClientArticleDetailWrapper';
import { initialAdminArticles } from '@/src/data/newsAdminDummyData';
import { fetchArticleBySlugLive, fetchPublishedArticlesLive } from '@/src/features/articles/data/liveFirestoreService';

/**
 * ISR Revalidation: 60 detik.
 * Nilai 60 detik dipilih untuk portal berita dinamis agar:
 * 1. Menjaga performa TTFB tetap instan melalui edge cache (SSG/ISR).
 * 2. Memastikan pembaruan konten redaksi, perbaikan typo, dan breaking news updates
 *    dapat terefleksi secara otomatis ke pembaca & search bot maksimal dalam 1 menit tanpa redeploy.
 */
export const revalidate = 60;

/**
 * dynamicParams = true memungkinkan artikel baru yang dipublish setelah build time
 * langsung di-render on-demand di server (SSR) dan di-cache secara otomatis.
 */
export const dynamicParams = true;

interface NextArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const result = await fetchPublishedArticlesLive(30);
  return result.articles.map((a) => ({
    slug: a.slug,
  }));
}

export async function generateMetadata({
  params,
}: NextArticleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchArticleBySlugLive(slug);

  // Jika dokumen not-found sungguhan (bukan error koneksi), kembalikan metadata 404
  if (result.source === 'not-found' || !result.article) {
    return {
      title: 'Berita Tidak Ditemukan | BatuTV',
      description: 'Halaman berita yang Anda cari tidak ditemukan di portal BatuTV.',
    };
  }

  const article = result.article;
  const title = article.seoTitle || `${article.title} | BatuTV`;
  const description = article.metaDescription || article.excerpt;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.publishedAt || article.createdAt,
      authors: [article.author],
      images: article.featuredImage
        ? [
            {
              url: article.featuredImage,
              alt: article.imageAlt || article.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.featuredImage ? [article.featuredImage] : [],
    },
    alternates: {
      canonical: article.canonicalUrl || `https://batutv.id/berita/${article.slug}`,
    },
  };
}

export default async function NextArticleDetailPage({
  params,
}: NextArticleDetailPageProps) {
  const { slug } = await params;
  const result = await fetchArticleBySlugLive(slug);

  // Jika artikel memang tidak ditemukan (404 riil di Firestore dan bukan issue koneksi),
  // picu Next.js notFound() agar merender halaman 404 asli, BUKAN fallback ke artikel sembarang.
  if (result.source === 'not-found' || !result.article) {
    notFound();
  }

  return <ClientArticleDetailWrapper slug={slug} />;
}
