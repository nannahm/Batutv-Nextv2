import { AdminPage } from '@/src/types/admin';

export interface PageFetchResult {
  source: 'firestore' | 'seed-fallback' | 'not-found' | 'reserved-slug';
  page: AdminPage | null;
  warning?: string;
}

export interface PagesListFetchResult {
  source: 'firestore' | 'seed-fallback';
  pages: AdminPage[];
  total: number;
  warning?: string;
}

export interface PageBreadcrumbItem {
  name: string;
  url: string;
}
