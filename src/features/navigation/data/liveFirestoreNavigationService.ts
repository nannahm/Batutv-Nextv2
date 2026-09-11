import {
  NavigationItem,
  NavigationItemWithChildren,
  SubNavigationItem,
  SubNavSettings,
} from '@/src/types/navigation';
import {
  INITIAL_NAVIGATION_DATA,
  INITIAL_SUB_NAVIGATION_DATA,
  INITIAL_SUB_NAV_SETTINGS,
} from '@/src/data/initialNavigationData';
import { adminFirestoreNavigationRepository } from './adminFirestoreNavigationRepository';
import { NavigationFetchResult, SubNavFetchResult } from '../types';

/**
 * Mengubah daftar NavigationItem flat menjadi struktur hirarkis tree (parent-children).
 */
export function buildNavigationTree(
  items: NavigationItem[],
  activeOnly: boolean = true
): NavigationItemWithChildren[] {
  const filtered = activeOnly ? items.filter((item) => item.active) : items;

  const parents: NavigationItemWithChildren[] = filtered
    .filter((item) => !item.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((parent) => ({
      ...parent,
      children: [],
    }));

  filtered
    .filter((item) => item.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .forEach((child) => {
      const parent = parents.find((p) => p.id === child.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push({
          ...child,
          children: [],
        });
      } else if (!activeOnly) {
        // Pada admin view, jika parent tidak ditemukan, tampilkan di root agar tidak hilang
        parents.push({
          ...child,
          parentId: null,
          children: [],
        });
      }
    });

  return parents;
}

/**
 * Mengambil menu navigasi utama (Primary Navigation) di server context (SSR / Server Component):
 * - Firebase Admin SDK murni (D-002 compliant).
 * - 2-Tier Architecture: Admin Firestore -> Seed Cache fallback.
 */
export async function fetchPrimaryNavLive(): Promise<NavigationFetchResult> {
  try {
    const items = await adminFirestoreNavigationRepository.getPrimaryNav();
    const tree = buildNavigationTree(items, true);
    return {
      source: 'firestore',
      items,
      tree,
    };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    const warning = `[LiveFirestoreNavigationService] Gagal fetch primary navigation (${errorMsg}). Fallback ke seed cache.`;
    console.warn(warning);

    const items = INITIAL_NAVIGATION_DATA;
    const tree = buildNavigationTree(items, true);
    return {
      source: 'seed-cache',
      items,
      tree,
      warning,
    };
  }
}

/**
 * Mengambil sub-navigasi (Sub Navigation / Wilayah / Bar Topik) di server context:
 * - Mengembalikan items dan settings berita genting (breaking news ticker).
 * - 2-Tier Architecture: Admin Firestore -> Seed Cache fallback.
 */
export async function fetchSubNavLive(): Promise<SubNavFetchResult> {
  try {
    const [items, settings] = await Promise.all([
      adminFirestoreNavigationRepository.getSubNav(),
      adminFirestoreNavigationRepository.getSubNavSettings(),
    ]);

    return {
      source: 'firestore',
      items,
      settings,
    };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    const warning = `[LiveFirestoreNavigationService] Gagal fetch sub-navigation (${errorMsg}). Fallback ke seed cache.`;
    console.warn(warning);

    return {
      source: 'seed-cache',
      items: INITIAL_SUB_NAVIGATION_DATA,
      settings: INITIAL_SUB_NAV_SETTINGS,
      warning,
    };
  }
}
