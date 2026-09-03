import { VideoNews } from '@/src/types/news';
import { AdminVideo } from '@/src/types/admin';

export type { VideoNews, AdminVideo };

export interface VideoActionResult {
  success: boolean;
  message: string;
  videoId?: string;
  errors?: Record<string, string[]>;
  data?: AdminVideo | null;
}
