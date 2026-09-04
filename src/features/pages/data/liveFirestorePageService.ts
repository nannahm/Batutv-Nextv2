import { initialAdminPagesData } from '@/src/data/pagesAdminDummyData';
import { adminFirestorePageRepository } from './adminFirestorePageRepository';
import { isReservedPageSlug } from '../schemas';
import { PageFetchResult, PagesListFetchResult } from '../types';

/**
 * Mengambil 1 halaman statis aktif berdasarkan slug di server context:
 * - Menolak secara instan jika slug termasuk dalam reserved words sistem.
 * - Menggunakan Firebase Admin SDK murni (D-002 compliant).
 * - Filter status 'published' agar draft tidak bocor ke publik.
 * - 2-Tier Architecture: Admin SDK Firestore -> Static Seed Cache fallback.
 */
export async function fetchPageBySlugLive(slug: string): Promise<PageFetchResult> {
  const cleanSlug = (slug || '')
    .toLowerCase()
    .trim()
    .split('?')[0]
    .split('#')[0]
    .replace(/^\/+|\/+$/g, '');

  if (!cleanSlug) {
    return { source: 'not-found', page: null };
  }

  // 1. Guard against reserved keywords
  if (isReservedPageSlug(cleanSlug)) {
    return {
      source: 'reserved-slug',
      page: null,
      warning: `Slug "/${cleanSlug}" merupakan kata kunci sistem yang dilindungi.`,
    };
  }

  try {
    const page = await adminFirestorePageRepository.getBySlug(cleanSlug);

    if (page) {
      if (page.status === 'published') {
        return { source: 'firestore', page };
      }
      // Draft page: do not expose to public
      return { source: 'not-found', page: null };
    }

    return { source: 'not-found', page: null };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    const warning = `[LiveFirestorePageService] Gagal fetch page slug "${cleanSlug}" (${errorMsg}). Fallback ke seed cache.`;
    console.warn(warning);

    const seedPage = initialAdminPagesData.find(
      (p) => p.slug.toLowerCase() === cleanSlug && p.status === 'published'
    );

    if (seedPage) {
      return { source: 'seed-fallback', page: seedPage, warning };
    }

    return { source: 'not-found', page: null };
  }
}

/**
 * Mengambil seluruh halaman terpublikasi untuk generateStaticParams() dan sitemap
 */
export async function fetchPublishedPagesLive(): Promise<PagesListFetchResult> {
  try {
    const pages = await adminFirestorePageRepository.getPublished();
    return {
      source: 'firestore',
      pages,
      total: pages.length,
    };
  } catch (err: any) {
    const warning = `[LiveFirestorePageService] Fallback ke seed cache: ${err?.message || String(err)}`;
    const publishedSeed = initialAdminPagesData.filter((p) => p.status === 'published');
    return {
      source: 'seed-fallback',
      pages: publishedSeed,
      total: publishedSeed.length,
      warning,
    };
  }
}
