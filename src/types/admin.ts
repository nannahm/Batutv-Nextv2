export type ContentStatus = 'published' | 'draft' | 'scheduled' | 'archived';
export type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'trash';
export type VideoStatus = 'draft' | 'scheduled' | 'published' | 'trash';
export type CategoryStatus = 'active' | 'inactive';
export type CategoryContentType = 'news' | 'video';
export type TagStatus = 'active' | 'inactive';
export type TagContentType = 'news' | 'video';
export type MediaType = 'image' | 'document' | 'other';
export type AuthorPosition = 'Reporter' | 'Editor' | 'Redaksi' | 'Kontributor';
export type AuthorStatus = 'active' | 'inactive';
export type PageStatus = 'published' | 'draft';

export interface AdminPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: PageStatus;
  seoTitle?: string;
  metaDescription?: string;
  featuredImageMediaId?: string;
  featuredImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface AdminMediaSizes {
  thumbnail?: string;
  medium?: string;
  large?: string;
  original?: string;
}

export interface AdminMediaUsageItem {
  id: string;
  title: string;
  type: 'news' | 'video' | 'banner' | 'category' | 'logo';
  slug?: string;
  field?: string;
}

export type MediaUsageReference = AdminMediaUsageItem;

export interface AdminMedia {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  extension: string;
  mediaType: MediaType;
  width: number;
  height: number;
  fileSize: number; // in bytes
  altText: string;
  caption: string;
  description: string;
  url: string;
  sizes?: AdminMediaSizes;
  usageCount: number;
  usedIn?: AdminMediaUsageItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuthor {
  id: string;
  name: string;
  slug: string;
  photoMediaId?: string;
  photoUrl?: string;
  position: AuthorPosition;
  email: string;
  phone?: string;
  bio?: string;
  status: AuthorStatus;
  newsCount?: number;
  videoCount?: number;
  totalCount?: number;
  seoTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  contentTypes: CategoryContentType[];
  status: CategoryStatus;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  createdAt: string;
  updatedAt: string;
  newsCount?: number;
  videoCount?: number;
  totalCount?: number;
}

export interface AdminTag {
  id: string;
  name: string;
  slug: string;
  contentTypes: TagContentType[];
  status: TagStatus;
  seoTitle?: string;
  metaDescription?: string;
  newsCount?: number;
  videoCount?: number;
  totalCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  authorId?: string;
  username?: string;
}

export interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  categorySlug: string;
  author: string;
  authorId?: string;
  editor: string;
  featuredImage: string;
  imageCaption: string;
  imageAlt: string;
  status: ArticleStatus;
  publishedAt: string; // ISO or human format
  updatedAt: string;
  createdAt: string;
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  views: number;
  tags: string[];

  // Editorial Placement for SO3 Hero Headline
  isHeadline?: boolean;
  headlinePosition?: number | null;
  headlineUntil?: string | null;
}

export interface AdminVideo {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  thumbnailSource: 'youtube' | 'custom';
  customThumbnail?: string;
  thumbnailMediaId?: string;
  customThumbnailAlt?: string;
  customThumbnailCaption?: string;
  duration?: string;
  category: string;
  categorySlug?: string;
  author: string;
  authorId?: string;
  status: VideoStatus;
  publishedAt: string; // ISO format
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  views: number;
  tags?: string[];
}

export interface DashboardStats {
  totalArticles: number;
  totalVideos: number;
  draftArticles: number;
  publishedTotal: number;
  scheduledArticles?: number;
  totalViews?: number;
  totalCategories?: number;
  totalUsers?: number;
}

export interface AdminArticleItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  status: ContentStatus;
  author: string;
  publishDate: string;
  viewsCount: number;
  thumbnailUrl: string;
}

export interface AdminVideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnailUrl: string;
  category: string;
  categorySlug: string;
  status: ContentStatus;
  publishDate: string;
  duration?: string;
  channelName?: string;
}

export interface AdminActivityLog {
  id: string;
  userName: string;
  userRole: string;
  action: 'publish_article' | 'add_video' | 'edit_article' | 'create_draft' | 'delete_item' | 'login';
  targetTitle: string;
  targetType: 'article' | 'video' | 'category' | 'system';
  timestamp: string;
  timeAgo: string;
}
