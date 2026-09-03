import { MetadataRoute } from 'next';
import { initialAdminArticles } from '@/src/data/newsAdminDummyData';

export default function sitemap(): MetadataRoute.Sitemap {
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

  const articleRoutes: MetadataRoute.Sitemap = initialAdminArticles
    .filter((article) => article.status === 'published')
    .map((article) => ({
      url: `${baseUrl}/berita/${article.slug}`,
      lastModified: article.updatedAt ? new Date(article.updatedAt) : now,
      changeFrequency: 'daily',
      priority: article.isHeadline ? 0.9 : 0.7,
    }));

  return [...staticRoutes, ...articleRoutes];
}
