import React from 'react';
import ClientArticleDetailWrapper from '@/src/components/article/ClientArticleDetailWrapper';

export default async function NextArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ClientArticleDetailWrapper slug={slug} />;
}
