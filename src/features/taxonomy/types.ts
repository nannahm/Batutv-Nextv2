import {
  AdminCategory,
  AdminTag,
  CategoryStatus,
  TagStatus,
  CategoryContentType,
  TagContentType,
} from '@/src/types/admin';

export type {
  AdminCategory,
  AdminTag,
  CategoryStatus,
  TagStatus,
  CategoryContentType,
  TagContentType,
};

export interface TaxonomyActionResult<T = any> {
  success: boolean;
  message: string;
  id?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export type CategoryFetchResult =
  | { source: 'firestore'; category: AdminCategory }
  | { source: 'seed-fallback'; category: AdminCategory; warning: string }
  | { source: 'not-found'; category: null };

export type CategoriesListFetchResult =
  | { source: 'firestore'; categories: AdminCategory[] }
  | { source: 'seed-fallback'; categories: AdminCategory[]; warning: string };

export type TagFetchResult =
  | { source: 'firestore'; tag: AdminTag }
  | { source: 'seed-fallback'; tag: AdminTag; warning: string }
  | { source: 'not-found'; tag: null };

export type TagsListFetchResult =
  | { source: 'firestore'; tags: AdminTag[] }
  | { source: 'seed-fallback'; tags: AdminTag[]; warning: string };
