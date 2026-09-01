import { AdminTag, TagStatus } from '../types/admin';

export interface ITagRepository {
  getAll(): Promise<AdminTag[]>;
  getById(id: string): Promise<AdminTag | null>;
  getBySlug(slug: string): Promise<AdminTag | null>;
  create(tag: AdminTag): Promise<AdminTag>;
  update(id: string, partial: Partial<AdminTag>): Promise<AdminTag>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<number>;
  bulkUpdateStatus(ids: string[], status: TagStatus): Promise<number>;
  subscribe(
    onNext: (tags: AdminTag[]) => void,
    onError?: (error: Error) => void
  ): () => void;
}
