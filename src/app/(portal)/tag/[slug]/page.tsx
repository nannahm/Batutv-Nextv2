import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Tag as TagIcon,
  ChevronRight,
  Clock,
  Eye,
  User,
  Layers,
  Hash,
  ArrowRight,
} from 'lucide-react';
import {
  fetchTagBySlugLive,
  fetchActiveTagsLive,
  fetchArticlesByTagLive,
} from '@/src/features/taxonomy';
import { TerpopulerWidget } from '@/src/components/TerpopulerWidget';

export const revalidate = 60;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { tags } = await fetchActiveTagsLive();
  return tags.map((tag) => ({
    slug: tag.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchTagBySlugLive(slug);

  if (!result.tag) {
    return {
      title: 'Tag Tidak Ditemukan | BatuTV',
      description: 'Topik atau tag yang Anda cari tidak ditemukan atau telah dinonaktifkan.',
    };
  }

  const tag = result.tag;
  const pageTitle = tag.seoTitle || `Topik #${tag.name} - Berita & Liputan | BatuTV`;
  const pageDescription =
    tag.metaDescription ||
    `Kumpulan liputan, informasi, dan berita terbaru terkait topik #${tag.name} di Kota Batu dan sekitarnya.`;
  const canonicalUrl = `https://batutv.id/tag/${tag.slug}`;

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
      type: 'website',
      siteName: 'BatuTV',
    },
  };
}

export default async function TagArchivePage({ params }: PageProps) {
  const { slug } = await params;
  const result = await fetchTagBySlugLive(slug);

  if (!result.tag) {
    notFound();
  }

  const tag = result.tag;
  const articles = await fetchArticlesByTagLive(tag.slug, 30);
  const { tags: allTags } = await fetchActiveTagsLive();

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
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
        name: `Tag: #${tag.name}`,
        item: `https://batutv.id/tag/${tag.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">
              <li>
                <Link href="/" className="hover:text-red-600 transition-colors">
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">
                <ChevronRight className="w-3.5 h-3.5" />
              </li>
              <li>
                <span className="text-neutral-400">Tag</span>
              </li>
              <li aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">
                <ChevronRight className="w-3.5 h-3.5" />
              </li>
              <li className="text-red-600 font-semibold">#{tag.name}</li>
            </ol>
          </nav>

          {/* Tag Header Hero */}
          <header className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold">
                  <Hash className="w-3.5 h-3.5 text-red-600" />
                  <span>Topik / Tag</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  #{tag.name}
                </h1>
                {tag.metaDescription && (
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-3xl">
                    {tag.metaDescription}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-center">
                  <span className="block text-xl font-bold text-neutral-900 dark:text-white">
                    {articles.length}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    Artikel Terkait
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Articles Stream */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-5 bg-red-600 rounded-xs inline-block" />
                  <span>Artikel dengan Topik #{tag.name}</span>
                </h2>
                <span className="text-xs text-neutral-500">
                  Menampilkan {articles.length} artikel
                </span>
              </div>

              {articles.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-12 text-center space-y-3">
                  <Layers className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
                  <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
                    Belum Ada Artikel dengan Tag Ini
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                    Belum ada artikel publik yang dikaitkan dengan topik ini. Silakan jelajahi topik dan kategori lainnya.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 mt-2"
                  >
                    <span>Kembali ke Beranda</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {articles.map((article) => (
                    <article
                      key={article.id}
                      className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col"
                    >
                      <Link
                        href={`/berita/${article.slug}`}
                        className="relative block aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-800"
                      >
                        <img
                          src={article.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80'}
                          alt={article.imageAlt || article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-600 text-white text-[11px] font-semibold">
                          {article.category}
                        </span>
                      </Link>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <h3 className="text-base font-bold text-neutral-900 dark:text-white line-clamp-2 group-hover:text-red-600 transition-colors">
                            <Link href={`/berita/${article.slug}`}>
                              {article.title}
                            </Link>
                          </h3>
                          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                            {article.excerpt}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-neutral-400" />
                            <span className="truncate max-w-[120px]">{article.author}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              {article.views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Baru'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Column */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Tag Populer Lainnya */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-red-600" />
                  <span>Topik & Tag Terkait</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allTags
                    .filter((t) => t.slug !== tag.slug)
                    .slice(0, 20)
                    .map((item) => (
                      <Link
                        key={item.id}
                        href={`/tag/${item.slug}`}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        #{item.name}
                      </Link>
                    ))}
                </div>
              </div>

              {/* Terpopuler Widget */}
              <TerpopulerWidget />
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
