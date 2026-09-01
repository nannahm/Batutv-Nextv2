import { AdminVideo, VideoStatus } from '../types/admin';

export interface VideoQueryOptions {
  status?: VideoStatus;
  categorySlug?: string;
  isFeatured?: boolean;
  authorId?: string;
  limit?: number;
}

export interface IVideoRepository {
  getVideos(options?: VideoQueryOptions): Promise<AdminVideo[]>;
  getVideoById(id: string): Promise<AdminVideo | null>;
  getVideoBySlug(slug: string): Promise<AdminVideo | null>;
  saveVideo(video: AdminVideo): Promise<AdminVideo>;
  updateVideo(id: string, updates: Partial<AdminVideo>): Promise<AdminVideo>;
  deleteVideo(id: string): Promise<void>;
  bulkUpdateStatus(ids: string[], status: VideoStatus): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
  subscribe(
    onNext: (videos: AdminVideo[]) => void,
    onError?: (error: Error) => void,
    options?: VideoQueryOptions
  ): () => void;
}
