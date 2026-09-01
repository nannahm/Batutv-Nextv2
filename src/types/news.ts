export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  categoryColor?: string;
  summary: string;
  content: string[];
  imageUrl: string;
  imageCaption?: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  timestamp: string;
  readTime: string;
  views: number;
  tags: string[];
  isBreaking?: boolean;
  isEditorPick?: boolean;
  isTrending?: boolean;
  ranking?: number;
  region?: 'Batu' | 'Malang' | 'Jatim' | 'Nasional' | 'Internasional';
}

export interface VideoNews {
  id: string;
  title: string;
  category: string;
  duration: string;
  thumbnailUrl: string;
  videoEmbedId: string;
  publishedAt: string;
  views: number;
  presenter: string;
  program: string;
  description: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
}

export interface LiveScheduleItem {
  time: string;
  program: string;
  isLiveNow?: boolean;
  presenter?: string;
}

export interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
  airQuality: string;
}
