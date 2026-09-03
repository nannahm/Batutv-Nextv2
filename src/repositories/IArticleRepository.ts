import { AdminArticle, ArticleStatus } from '../types/admin';

export interface ArticleQueryOptions {
  status?: ArticleStatus;
  categorySlug?: string;
  tag?: string;
  authorId?: string;
  isHeadline?: boolean;
  limit?: number;
  offset?: number;
}

export interface IArticleRepository {
  getArticles(options?: ArticleQueryOptions): Promise<AdminArticle[]>;
  getArticleById(id: string): Promise<AdminArticle | null>;
  getArticleBySlug(slug: string): Promise<AdminArticle | null>;
  saveArticle(article: AdminArticle): Promise<AdminArticle>;
  updateArticle(id: string, updates: Partial<AdminArticle>): Promise<AdminArticle>;
  deleteArticle(id: string): Promise<void>;
  bulkUpdateStatus(ids: string[], status: ArticleStatus): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
  subscribe(
    onNext: (articles: AdminArticle[]) => void,
    onError?: (error: Error) => void,
    options?: ArticleQueryOptions
  ): () => void;
}
