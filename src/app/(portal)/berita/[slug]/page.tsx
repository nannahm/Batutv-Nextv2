import React from 'react';
import { ArticleDetailPage, defaultSpecificArticle } from '@/src/components/article/ArticleDetailPage';
import { resolveArticleSlug } from '@/src/utils/slugResolver';

interface ArticlePageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default function NextArticleDetailPage({ params }: ArticlePageProps) {
  // Support both synchronous and promise-based params (Next.js 15+)
  const unwrappedParams = typeof (params as any)?.then === 'function' 
    ? (params as any)
    : (params as { slug: string });

  const slug = (unwrappedParams && typeof unwrappedParams === 'object' && 'slug' in unwrappedParams)
    ? unwrappedParams.slug
    : '';

  const resolved = resolveArticleSlug(slug);
  const article = resolved || defaultSpecificArticle;

  const handleBackToHome = () => {
    if (typeof window !== 'undefined') window.location.href = '/';
  };

  return (
    <ArticleDetailPage
      article={article}
      onBackToHome={handleBackToHome}
      onSelectArticle={(art) => {
        if (typeof window !== 'undefined') window.location.href = `/berita/${art.slug || art.id}`;
      }}
      onSelectCategory={(cat) => {
        if (typeof window !== 'undefined') window.location.href = `/kategori/${cat.toLowerCase()}`;
      }}
      onSelectTag={(tag) => {
        if (typeof window !== 'undefined') window.location.href = `/tag/${tag.toLowerCase()}`;
      }}
    />
  );
}
