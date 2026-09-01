import { AdminPage } from '../types/admin';

export interface IPageRepository {
  getAll(): Promise<AdminPage[]>;
  getById(id: string): Promise<AdminPage | null>;
  getBySlug(slug: string): Promise<AdminPage | null>;
  getPublished(): Promise<AdminPage[]>;
  create(page: AdminPage): Promise<AdminPage>;
  update(id: string, partial: Partial<AdminPage>): Promise<AdminPage>;
  delete(id: string): Promise<void>;
  subscribe(
    onNext: (pages: AdminPage[]) => void,
    onError?: (error: Error) => void
  ): () => void;
}
