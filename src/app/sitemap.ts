import { MetadataRoute } from 'next';
import { fetchPublishedArticlesLive } from '@/src/features/articles/data/liveFirestoreService';
import { fetchPublishedVideosLive } from '@/src/features/videos/data/liveFirestoreVideoService';
import {
  fetchActiveCategoriesLive,
  fetchActiveTagsLive,
} from '@/src/features/taxonomy/data/liveFirestoreTaxonomyService';

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

  const categoriesResult = await fetchActiveCategoriesLive();
  const categoryRoutes: MetadataRoute.Sitemap = categoriesResult.categories.map((category) => ({
    url: `${baseUrl}/kategori/${category.slug}`,
    lastModified: category.updatedAt ? new Date(category.updatedAt) : now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const tagsResult = await fetchActiveTagsLive();
  const tagRoutes: MetadataRoute.Sitemap = tagsResult.tags.map((tag) => ({
    url: `${baseUrl}/tag/${tag.slug}`,
    lastModified: tag.updatedAt ? new Date(tag.updatedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...articleRoutes, ...videoRoutes, ...categoryRoutes, ...tagRoutes];
}

