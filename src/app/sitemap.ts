import { MetadataRoute } from 'next';
import { fetchPublishedArticlesLive } from '@/src/features/articles/data/liveFirestoreService';
import { fetchPublishedVideosLive } from '@/src/features/videos/data/liveFirestoreVideoService';

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
    {
      url: `${baseUrl}/video`,
      lastModified: now,
      changeFrequency: 'daily',
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

  const videoFetchResult = await fetchPublishedVideosLive(100);
  const videoRoutes: MetadataRoute.Sitemap = videoFetchResult.videos.map((video) => ({
    url: `${baseUrl}/video/${video.slug}`,
    lastModified: video.updatedAt
      ? new Date(video.updatedAt)
      : video.publishedAt
      ? new Date(video.publishedAt)
      : now,
    changeFrequency: 'weekly',
    priority: video.views && video.views > 5000 ? 0.8 : 0.6,
  }));

  return [...staticRoutes, ...articleRoutes, ...videoRoutes];
}
