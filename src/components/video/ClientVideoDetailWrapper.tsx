'use client';

import React, { useEffect, useState } from 'react';
import { VideoDetailPage } from './VideoDetailPage';

interface ClientVideoDetailWrapperProps {
  slug: string;
}

export default function ClientVideoDetailWrapper({ slug }: ClientVideoDetailWrapperProps) {
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
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-center font-bold text-slate-700">Memuat Video BatuTV...</div>
      </div>
    );
  }

  return (
    <VideoDetailPage
      slug={slug}
      onNavigate={handleNavigate}
      onSelectCategory={(cat) => handleNavigate(`/kategori/${cat.toLowerCase()}`)}
      onSelectTag={(tag) => handleNavigate(`/tag/${tag.toLowerCase()}`)}
      onSelectAuthor={(author) => handleNavigate(`/penulis/${author.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}
    />
  );
}
