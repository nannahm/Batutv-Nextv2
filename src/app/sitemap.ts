import { MetadataRoute } from 'next';
import { fetchPublishedArticlesLive } from '@/src/features/articles/data/liveFirestoreService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://batutv.id';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tren`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
  ];

  const fetchResult = await fetchPublishedArticlesLive(100);
  const articleRoutes: MetadataRoute.Sitemap = fetchResult.articles.map((article) => ({
    url: `${baseUrl}/berita/${article.slug}`,
    lastModified: article.updatedAt ? new Date(article.updatedAt) : now,
    changeFrequency: 'daily',
    priority: article.isHeadline ? 0.9 : 0.7,
  }));

  return [...staticRoutes, ...articleRoutes];
}
