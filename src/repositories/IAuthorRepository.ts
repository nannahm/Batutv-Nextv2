import { AdminAuthor, AuthorStatus } from '../types/admin';

export interface IAuthorRepository {
  getAll(): Promise<AdminAuthor[]>;
  getById(id: string): Promise<AdminAuthor | null>;
  getBySlug(slug: string): Promise<AdminAuthor | null>;
  getByEmail(email: string): Promise<AdminAuthor | null>;
  create(author: AdminAuthor): Promise<AdminAuthor>;
  update(id: string, partial: Partial<AdminAuthor>): Promise<AdminAuthor>;
  delete(id: string): Promise<void>;
  bulkUpdateStatus(ids: string[], status: AuthorStatus): Promise<number>;
  subscribe(
    onNext: (authors: AdminAuthor[]) => void,
    onError?: (error: Error) => void
  ): () => void;
}
