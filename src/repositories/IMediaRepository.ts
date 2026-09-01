import { AdminMedia, MediaType } from '../types/admin';

export interface IMediaRepository {
  getAll(filter?: { mediaType?: MediaType; search?: string }): Promise<AdminMedia[]>;
  getById(id: string): Promise<AdminMedia | null>;
  create(media: AdminMedia): Promise<AdminMedia>;
  update(id: string, partial: Partial<AdminMedia>): Promise<AdminMedia>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<number>;
  subscribe(
    onNext: (mediaList: AdminMedia[]) => void,
    onError?: (error: Error) => void
  ): () => void;
}
