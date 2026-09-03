'use client';

import React, { useEffect, useState } from 'react';
import { ArticleDetailPage } from './ArticleDetailPage';

export default function ClientArticleDetailWrapper({ slug }: { slug: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="text-center font-bold text-slate-700">Memuat Berita BatuTV...</div>
      </div>
    );
  }

  return (
    <ArticleDetailPage
      slug={slug}
      onNavigate={handleNavigate}
      onSelectCategory={(cat) => handleNavigate(`/kategori/${cat.toLowerCase()}`)}
      onSelectTag={(tag) => handleNavigate(`/tag/${tag.toLowerCase()}`)}
    />
  );
}
