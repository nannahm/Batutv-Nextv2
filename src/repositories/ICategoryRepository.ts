import { AdminCategory, CategoryStatus } from '../types/admin';

export interface ICategoryRepository {
  getAll(): Promise<AdminCategory[]>;
  getById(id: string): Promise<AdminCategory | null>;
  getBySlug(slug: string): Promise<AdminCategory | null>;
  create(category: AdminCategory): Promise<AdminCategory>;
  update(id: string, partial: Partial<AdminCategory>): Promise<AdminCategory>;
  delete(id: string): Promise<void>;
  bulkUpdateStatus(ids: string[], status: CategoryStatus): Promise<number>;
  subscribe(
    onNext: (categories: AdminCategory[]) => void,
    onError?: (error: Error) => void
  ): () => void;
}
