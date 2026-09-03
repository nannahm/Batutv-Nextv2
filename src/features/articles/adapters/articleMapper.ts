import { AdminArticle } from '@/src/types/admin';
import { NewsArticle } from '@/src/types/news';
import { categoriesData } from '@/src/data/dummyNews';
import { initialAdminAuthors } from '@/src/data/authorAdminDummyData';

/**
 * Calculates estimated reading time based on Indonesian reading speed (~200 words per minute).
 * Strips HTML tags if content is in HTML format.
 */
export function calculateReadTime(content: string | string[]): string {
  let rawText = '';
  if (Array.isArray(content)) {
    rawText = content.join(' ');
  } else if (typeof content === 'string') {
    // Strip HTML tags
    rawText = content.replace(/<[^>]*>/g, ' ');
  }

  // Count words
  const words = rawText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} menit baca`;
}

/**
 * Formats a given date string into a relative human-readable timestamp in Indonesian.
 */
export function formatRelativeTimestamp(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Baru saja';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Baru saja';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari lalu`;

    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return 'Baru saja';
  }
}

/**
 * Formats a given date string into long Indonesian format (e.g., '27 Agustus 2026, 09:30 WIB').
 */
export function formatFullPublishedDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const formatted = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);

    return `${formatted} WIB`;
  } catch {
    return dateString;
  }
}

/**
 * Resolves category color from master categoriesData or fallback default.
 */
export function resolveCategoryColor(categorySlug: string): string {
  const found = categoriesData.find(
    (c) => c.slug.toLowerCase() === categorySlug.toLowerCase()
  );
  return found?.color || '#dc2626';
}

/**
 * Maps AdminArticle (Firestore domain model) to NewsArticle (Public View Model).
 * Ensures author avatar, role, readTime, isBreaking, categoryColor, and content formatting are preserved.
 */
export function toNewsArticle(admin: AdminArticle): NewsArticle {
  // Try to lookup author details from initialAdminAuthors
  const matchedAuthor = initialAdminAuthors.find(
    (a) =>
      a.id === admin.authorId ||
      a.name.toLowerCase() === (admin.author || '').toLowerCase()
  );

  const authorRole = matchedAuthor?.position || 'Jurnalis BatuTV';
  const authorAvatar =
    matchedAuthor?.photoUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop';

  // Split HTML or multiline content into string array for public portal renderer
  let contentParagraphs: string[] = [];
  if (typeof admin.content === 'string') {
    if (admin.content.includes('<p>')) {
      // Extract <p> or <h2> contents or keep raw HTML blocks
      const matches = admin.content.match(/<(p|h2|blockquote)[^>]*>([\s\S]*?)<\/\1>/gi);
      if (matches && matches.length > 0) {
        contentParagraphs = matches.map((m) => m.replace(/<[^>]*>/g, '').trim()).filter(Boolean);
      } else {
        contentParagraphs = [admin.content.replace(/<[^>]*>/g, '').trim()];
      }
    } else {
      contentParagraphs = admin.content.split('\n\n').filter(Boolean);
    }
  }

  if (contentParagraphs.length === 0 && admin.excerpt) {
    contentParagraphs = [admin.excerpt];
  }

  // Detect breaking news flag from admin properties or tags
  const isBreaking =
    admin.isHeadline && admin.headlinePosition === 1
      ? true
      : (admin.tags || []).some(
          (t) =>
            t.toLowerCase().includes('breaking') ||
            t.toLowerCase().includes('utama')
        );

  // Region detection from tags or category
  let region: 'Batu' | 'Malang' | 'Jatim' | 'Nasional' | 'Internasional' = 'Batu';
  const tagString = (admin.tags || []).join(' ').toLowerCase();
  if (tagString.includes('internasional') || admin.categorySlug === 'internasional') {
    region = 'Internasional';
  } else if (tagString.includes('nasional') || admin.categorySlug === 'nasional') {
    region = 'Nasional';
  } else if (tagString.includes('jatim') || tagString.includes('jawa timur')) {
    region = 'Jatim';
  } else if (tagString.includes('malang') || tagString.includes('kabupaten malang')) {
    region = 'Malang';
  }

  const publishedDateStr = admin.publishedAt || admin.createdAt || new Date().toISOString();

  return {
    id: admin.id,
    title: admin.title,
    slug: admin.slug,
    category: admin.category,
    categorySlug: admin.categorySlug,
    categoryColor: resolveCategoryColor(admin.categorySlug),
    summary: admin.excerpt,
    content: contentParagraphs,
    imageUrl: admin.featuredImage,
    imageCaption: admin.imageCaption || undefined,
    author: {
      name: admin.author,
      role: authorRole,
      avatar: authorAvatar,
    },
    publishedAt: formatFullPublishedDate(publishedDateStr),
    timestamp: formatRelativeTimestamp(publishedDateStr),
    readTime: calculateReadTime(admin.content),
    views: admin.views || 0,
    tags: admin.tags || [],
    isBreaking,
    isEditorPick: !!admin.isHeadline,
    isTrending: (admin.views || 0) > 1000,
    region,
  };
}

/**
 * Maps NewsArticle (Public View Model) back to AdminArticle (Firestore domain model).
 */
export function toAdminArticle(
  news: NewsArticle,
  overrides?: Partial<AdminArticle>
): AdminArticle {
  const contentString = Array.isArray(news.content)
    ? news.content.map((p) => `<p>${p}</p>`).join('\n')
    : String(news.content || '');

  return {
    id: news.id,
    title: news.title,
    slug: news.slug,
    excerpt: news.summary,
    content: contentString,
    category: news.category,
    categorySlug: news.categorySlug,
    author: news.author.name,
    authorId: undefined,
    editor: 'Redaksi BatuTV',
    featuredImage: news.imageUrl,
    imageCaption: news.imageCaption || '',
    imageAlt: news.title,
    status: 'published',
    publishedAt: news.publishedAt,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    seoTitle: `${news.title} | BatuTV`,
    metaDescription: news.summary,
    canonicalUrl: `https://batutv.id/berita/${news.slug}`,
    views: news.views || 0,
    tags: news.tags || [],
    isHeadline: !!news.isEditorPick || !!news.isBreaking,
    headlinePosition: news.isBreaking ? 1 : null,
    headlineUntil: null,
    ...overrides,
  };
}
