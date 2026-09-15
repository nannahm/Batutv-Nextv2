'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { VideoDetailPage } from './VideoDetailPage';
import { AdminVideo } from '../../types/admin';

interface ClientVideoDetailWrapperProps {
  slug: string;
  initialVideo?: AdminVideo | null;
}

export default function ClientVideoDetailWrapper({
  slug,
  initialVideo,
}: ClientVideoDetailWrapperProps) {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <VideoDetailPage
      slug={slug}
      initialVideo={initialVideo}
      onNavigate={handleNavigate}
      onSelectCategory={(cat) => handleNavigate(`/kategori/${cat.toLowerCase()}`)}
      onSelectTag={(tag) => handleNavigate(`/tag/${tag.toLowerCase()}`)}
      onSelectAuthor={(author) =>
        handleNavigate(`/penulis/${author.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)
      }
    />
  );
}
