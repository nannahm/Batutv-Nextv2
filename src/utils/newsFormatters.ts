import { AdminArticle } from '../types/admin';
import { HeroHeadlineData, HeadlineArticleData, defaultHeroHeadlineData } from '../components/HeroHeadlineGrid';
import { LatestNewsPost } from '../data/latestNewsData';
import { resolveArticleSlug, resolveArticleHref, ensureUniqueFeedSlugs } from './slugResolver';

/**
 * Utilitas pemformatan murni artikel berita BatuTV.
 * 
 * KRITERIA ARSITEKTUR (D-019):
 * - File ini murni fungsional / deterministik (pure functions).
 * - Tidak memiliki impor ke Firestore Client SDK maupun firestoreArticleRepository.
 * - Bebas dari side-effects top-level browser (aman diimpor di Server Components maupun Client).
 */

// Parse article published date string into exact timestamp for deterministic sorting (DESC)
export function getArticlePublishedTimestamp(art: AdminArticle): number {
  if (art.publishedAt) {
    const match = art.publishedAt.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (match) {
      const [, y, m, d, hh = '00', mm = '00', ss = '00'] = match;
      const t = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss)).getTime();
      if (!isNaN(t)) return t;
    }
    const t = new Date(art.publishedAt).getTime();
    if (!isNaN(t)) return t;
  }
  if (art.createdAt) {
    const t = new Date(art.createdAt).getTime();
    if (!isNaN(t)) return t;
  }
  return 0;
}

// Format date and time for News Feed display (Indonesian WIB standard)
export function formatNewsFeedDateTime(dateStr?: string): { date: string; time: string; fullDateIndo: string } {
  if (!dateStr) {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return {
      date: `${d}/${m}/${y}`,
      time: `${hh}:${mm} WIB`,
      fullDateIndo: `${d} ${m} ${y}`,
    };
  }

  try {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (match) {
      const [, y, m, d, hh = '00', mm = '00', ss = '00'] = match;
      const day = d.padStart(2, '0');
      const month = m.padStart(2, '0');
      const year = y;
      const hours = hh.padStart(2, '0');
      const minutes = mm.padStart(2, '0');
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const monthIndex = parseInt(month, 10) - 1;
      const fullDateIndo = `${parseInt(day, 10)} ${monthNames[monthIndex] || month} ${year}`;
      return {
        date: `${day}/${month}/${year}`,
        time: `${hours}:${minutes} WIB`,
        fullDateIndo,
      };
    }

    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const fullDateIndo = `${d.getDate()} ${monthNames[d.getMonth()]} ${year}`;
      return {
        date: `${day}/${month}/${year}`,
        time: `${hours}:${minutes} WIB`,
        fullDateIndo,
      };
    }
  } catch {
    // Fallback on parsing failure
  }

  return { date: '27/08/2026', time: '09:00 WIB', fullDateIndo: '27 Agustus 2026' };
}

// Format date and time for SO3 Headline component
export function formatHeadlineDateTime(isoDateString?: string) {
  if (!isoDateString) {
    return { date: '27/08/2026', time: '08:00 WIB', humanDate: 'Kamis, 27 Agustus 2026' };
  }
  try {
    const d = new Date(isoDateString);
    if (isNaN(d.getTime())) {
      return { date: '27/08/2026', time: '08:00 WIB', humanDate: 'Kamis, 27 Agustus 2026' };
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const humanDate = `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${year}`;
    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes} WIB`,
      humanDate,
    };
  } catch {
    return { date: '27/08/2026', time: '08:00 WIB', humanDate: 'Kamis, 27 Agustus 2026' };
  }
}

// Convert AdminArticle to HeadlineArticleData with safe slug & URL resolution
export function mapAdminArticleToHeadlineData(art: AdminArticle): HeadlineArticleData {
  const dt = formatHeadlineDateTime(art.publishedAt || art.createdAt);
  const safeSlug = resolveArticleSlug(art.slug, art.id);
  const safeHref = resolveArticleHref(art.slug, art.id);

  return {
    id: art.id,
    category: art.category || 'Daerah',
    title: art.title,
    imageUrl:
      art.featuredImage ||
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1200&auto=format&fit=crop',
    imageAlt: art.imageAlt || art.title,
    date: dt.humanDate,
    time: dt.time,
    href: safeHref,
    slug: safeSlug,
  };
}

// Helper to determine if an article is active & published
export function isArticleLive(art: AdminArticle): boolean {
  if (art.status !== 'published') return false;
  if (art.publishedAt) {
    const pubTime = getArticlePublishedTimestamp(art);
    if (pubTime > Date.now()) return false;
  }
  return true;
}

/**
 * Mengonversi array AdminArticle[] menjadi LatestNewsPost[] yang siap dirender di MainPortalFeed.
 * Mengikuti urutan publishedAt DESC, sanitasi excerpt 160 char, dan penjaminan slug unik.
 */
export function mapAdminArticlesToFeedPosts(articles: AdminArticle[], limit?: number): LatestNewsPost[] {
  const now = Date.now();

  const publishedArticles = articles.filter((a) => {
    if (a.status !== 'published') return false;
    if (a.publishedAt) {
      const pubTime = getArticlePublishedTimestamp(a);
      if (pubTime > now) return false;
    }
    return true;
  });

  publishedArticles.sort((a, b) => {
    return getArticlePublishedTimestamp(b) - getArticlePublishedTimestamp(a);
  });

  const rawFeedPosts: LatestNewsPost[] = publishedArticles.map((art) => {
    const dt = formatNewsFeedDateTime(art.publishedAt || art.createdAt);

    let cleanExcerpt = art.excerpt ? art.excerpt.trim() : '';
    if (!cleanExcerpt && art.content) {
      cleanExcerpt = art.content
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 160);
      if (cleanExcerpt.length >= 160) cleanExcerpt += '...';
    }

    const safeSlug = resolveArticleSlug(art.slug, art.id);
    const safeHref = resolveArticleHref(art.slug, art.id);

    return {
      id: art.id,
      title: art.title,
      category: art.category || 'Daerah',
      date: dt.date,
      time: dt.time,
      imageUrl:
        art.featuredImage ||
        'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80',
      imageAlt: art.imageAlt || art.title,
      excerpt: cleanExcerpt || 'Berita terkini seputar Kota Batu dan informasi nasional aktual dari redaksi BatuTV.',
      href: safeHref,
      slug: safeSlug,
    };
  });

  const feedPosts = ensureUniqueFeedSlugs(rawFeedPosts);
  return limit ? feedPosts.slice(0, limit) : feedPosts;
}

/**
 * Mengonversi array AdminArticle[] menjadi HeroHeadlineData untuk HeroHeadlineGrid.
 * Memprioritaskan artikel bertanda headline dan editorial position (1..5),
 * dengan backfill otomatis bila headline kurang dari 4.
 */
export function mapAdminArticlesToHeroData(articles: AdminArticle[]): HeroHeadlineData {
  const now = Date.now();

  const headlineCandidates = articles
    .filter((a) => {
      if (a.status !== 'published') return false;
      if (!a.isHeadline) return false;
      if (a.publishedAt) {
        const pubTime = getArticlePublishedTimestamp(a);
        if (pubTime > now) return false;
      }
      if (a.headlineUntil) {
        const expTime = new Date(a.headlineUntil).getTime();
        if (!isNaN(expTime) && expTime < now) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const posA = a.headlinePosition || 999;
      const posB = b.headlinePosition || 999;
      if (posA !== posB) return posA - posB;
      return getArticlePublishedTimestamp(b) - getArticlePublishedTimestamp(a);
    });

  if (headlineCandidates.length === 0) {
    const livePublished = articles
      .filter((a) => isArticleLive(a))
      .sort((a, b) => getArticlePublishedTimestamp(b) - getArticlePublishedTimestamp(a));

    if (livePublished.length > 0) {
      const mainArt = livePublished[0];
      const main = mapAdminArticleToHeadlineData(mainArt);
      const subHeadlines = livePublished.slice(1, 5).map(mapAdminArticleToHeadlineData);

      if (subHeadlines.length < 4) {
        const remainingNeed = 4 - subHeadlines.length;
        const defaults = defaultHeroHeadlineData.subHeadlines.filter(
          (dh) => dh.slug !== main.slug && !subHeadlines.some((sh) => sh.slug === dh.slug)
        );
        subHeadlines.push(...defaults.slice(0, remainingNeed));
      }

      return {
        main,
        subHeadlines,
        adBanner: defaultHeroHeadlineData.adBanner,
      };
    }

    return defaultHeroHeadlineData;
  }

  const mainArticle = headlineCandidates[0];
  const main = mapAdminArticleToHeadlineData(mainArticle);
  const subHeadlines: HeadlineArticleData[] = headlineCandidates.slice(1, 5).map(mapAdminArticleToHeadlineData);

  if (subHeadlines.length < 4) {
    const headlineIds = new Set(headlineCandidates.map((h) => h.id));
    const otherLiveArticles = articles
      .filter((a) => isArticleLive(a) && !headlineIds.has(a.id))
      .sort((a, b) => getArticlePublishedTimestamp(b) - getArticlePublishedTimestamp(a));

    for (const art of otherLiveArticles) {
      if (subHeadlines.length >= 4) break;
      subHeadlines.push(mapAdminArticleToHeadlineData(art));
    }

    if (subHeadlines.length < 4) {
      const remainingNeed = 4 - subHeadlines.length;
      const existingSlugs = new Set([main.slug, ...subHeadlines.map((sh) => sh.slug)]);
      const defaults = defaultHeroHeadlineData.subHeadlines.filter((dh) => !existingSlugs.has(dh.slug));
      subHeadlines.push(...defaults.slice(0, remainingNeed));
    }
  }

  return {
    main,
    subHeadlines,
    adBanner: defaultHeroHeadlineData.adBanner,
  };
}
