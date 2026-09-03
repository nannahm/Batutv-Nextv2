import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ClientArticleDetailWrapper from '@/src/components/article/ClientArticleDetailWrapper';
import { initialAdminArticles } from '@/src/data/newsAdminDummyData';
import { AdminArticle } from '@/src/types/admin';

interface NextArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

function findArticleBySlug(slug: string): AdminArticle | undefined {
  return initialAdminArticles.find(
    (a) => a.slug === slug && a.status === 'published'
  );
}

export async function generateStaticParams() {
  return initialAdminArticles
    .filter((a) => a.status === 'published')
    .map((a) => ({
      slug: a.slug,
    }));
}

export async function generateMetadata({
  params,
}: NextArticleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Berita Tidak Ditemukan | BatuTV',
      description: 'Halaman berita yang Anda cari tidak ditemukan di portal BatuTV.',
    };
  }

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
  return <ClientArticleDetailWrapper slug={slug} />;
}
