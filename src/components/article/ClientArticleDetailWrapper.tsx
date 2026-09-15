'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArticleDetailPage } from './ArticleDetailPage';
import { AdminArticle } from '../../types/admin';

interface ClientArticleDetailWrapperProps {
  slug: string;
  initialArticle?: AdminArticle | null;
}

export default function ClientArticleDetailWrapper({
  slug,
  initialArticle,
}: ClientArticleDetailWrapperProps) {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <ArticleDetailPage
      slug={slug}
      initialArticle={initialArticle}
      onNavigate={handleNavigate}
      onSelectCategory={(cat) => handleNavigate(`/kategori/${cat.toLowerCase()}`)}
      onSelectTag={(tag) => handleNavigate(`/tag/${tag.toLowerCase()}`)}
    />
  );
}
