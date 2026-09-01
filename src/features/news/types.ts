import { NewsArticle, VideoNews } from '@/src/types/news';
import { AdminArticle } from '@/src/types/admin';

export type { NewsArticle, VideoNews, AdminArticle };

export type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'trash';

export interface NewsFilters {
  category?: string;
  status?: ArticleStatus | 'all';
  searchQuery?: string;
  author?: string;
  page?: number;
  limit?: number;
}

export interface NewsActionResult {
  success: boolean;
  message: string;
  articleId?: string;
  errors?: Record<string, string[]>;
  data?: AdminArticle | null;
}
