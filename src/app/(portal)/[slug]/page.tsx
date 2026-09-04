import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Home, ChevronRight, Calendar, Clock, BookOpen } from 'lucide-react';
import { fetchPageBySlugLive, fetchPublishedPagesLive, isReservedPageSlug } from '@/src/features/pages';

export const revalidate = 60;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const result = await fetchPublishedPagesLive();
  return result.pages
    .filter((p) => !isReservedPageSlug(p.slug))
    .map((p) => ({
      slug: p.slug,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (isReservedPageSlug(slug)) {
    return {
      title: 'Halaman Tidak Ditemukan | BatuTV',
      description: 'Halaman informasi yang Anda cari tidak ditemukan.',
    };
  }

  const result = await fetchPageBySlugLive(slug);

  if (!result.page) {
    return {
      title: 'Halaman Tidak Ditemukan | BatuTV',
      description: 'Halaman informasi yang Anda cari tidak ditemukan atau masih dalam status draft.',
    };
  }

  const page = result.page;
  const pageTitle = page.seoTitle || `${page.title} | BatuTV`;
  const pageDescription =
    page.metaDescription ||
    page.excerpt ||
    `Informasi resmi mengenai ${page.title} dari portal berita BatuTV.`;
  const canonicalUrl = `https://batutv.id/${page.slug}`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      type: 'article',
      siteName: 'BatuTV',
      images: page.featuredImageUrl ? [{ url: page.featuredImageUrl }] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default async function StaticInformationPage({ params }: PageProps) {
  const { slug } = await params;

  // Protect against reserved routes catch-all
  if (isReservedPageSlug(slug)) {
    notFound();
  }

  const result = await fetchPageBySlugLive(slug);

  if (!result.page) {
    notFound();
  }

  const page = result.page;
  const formattedDate = new Date(page.updatedAt || page.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const wordCount = page.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `https://batutv.id/${page.slug}#webpage`,
        url: `https://batutv.id/${page.slug}`,
        name: page.seoTitle || page.title,
        headline: page.title,
        description: page.metaDescription || page.excerpt || '',
        inLanguage: 'id-ID',
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://batutv.id/#website',
          name: 'BatuTV',
          url: 'https://batutv.id',
        },
        breadcrumb: {
          '@id': `https://batutv.id/${page.slug}#breadcrumb`,
        },
        publisher: {
          '@type': 'NewsMediaOrganization',
          name: 'BatuTV',
          url: 'https://batutv.id',
          logo: {
            '@type': 'ImageObject',
            url: 'https://batutv.id/logo.png',
          },
        },
        datePublished: page.createdAt,
        dateModified: page.updatedAt || page.createdAt,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `https://batutv.id/${page.slug}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Beranda',
            item: 'https://batutv.id/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: page.title,
            item: `https://batutv.id/${page.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <article className="w-full bg-[#fcfcfd] min-h-screen py-8 sm:py-12">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-red-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">
            {page.title}
          </span>
        </nav>

        {/* Header Section */}
        <header className="space-y-4 border-b border-slate-200/80 pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider rounded-md border border-red-100">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Halaman Informasi Resmi</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {page.title}
          </h1>

          {page.excerpt && (
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              {page.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Diperbarui: {formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Estimasi baca: ~{readTimeMinutes} menit</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {page.featuredImageUrl && (
          <div className="relative w-full aspect-16/9 rounded-2xl overflow-hidden shadow-xs border border-slate-200/80">
            <Image
              src={page.featuredImageUrl}
              alt={page.title}
              fill
              priority
              className="object-cover"
              referrerPolicy="no-referrer"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        )}

        {/* Content Body */}
        <div
          className="prose prose-slate max-w-none text-slate-800 leading-relaxed
            prose-headings:font-bold prose-headings:text-slate-900 prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2
            prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-base prose-p:my-4
            prose-ul:list-disc prose-ul:pl-5 prose-ul:my-4
            prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-4
            prose-li:my-1.5
            prose-a:text-red-600 prose-a:font-semibold prose-a:underline hover:prose-a:text-red-700
            prose-blockquote:border-l-4 prose-blockquote:border-red-500 prose-blockquote:bg-red-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic
            prose-table:w-full prose-table:my-6 prose-table:border-collapse
            prose-th:bg-slate-100 prose-th:p-3 prose-th:text-left prose-th:text-xs prose-th:font-bold prose-th:text-slate-700
            prose-td:p-3 prose-td:border-b prose-td:border-slate-200 prose-td:text-sm"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </article>
  );
}
