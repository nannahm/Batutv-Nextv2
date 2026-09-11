import {
  NavigationItem,
  SubNavigationItem,
  SubNavSettings,
} from '@/src/types/navigation';
import { INavigationRepository } from '@/src/repositories/INavigationRepository';
import { getAdminFirestore } from '@/src/lib/firebaseAdmin';
import {
  INITIAL_NAVIGATION_DATA,
  INITIAL_SUB_NAVIGATION_DATA,
  INITIAL_SUB_NAV_SETTINGS,
} from '@/src/data/initialNavigationData';

const COLLECTION_NAME = 'navigation';

function convertDateToString(val: any, fallback: string = new Date().toISOString()): string {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val?.toDate === 'function') {
    return val.toDate().toISOString();
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  return fallback;
}

export function toNavigationItemFirestore(item: NavigationItem): Record<string, any> {
  const result: Record<string, any> = {
    id: item.id,
    label: item.label,
    type: item.type || 'internal',
    targetType: item.targetType || 'kategori',
    targetId: item.targetId || '',
    url: item.url || '/',
    slug: item.slug || '',
    parentId: item.parentId || null,
    sortOrder: Number(item.sortOrder) || 0,
    active: item.active !== false,
    openNewTab: item.openNewTab === true,
    section: 'primary',
    createdAt: convertDateToString(item.createdAt),
    updatedAt: convertDateToString(item.updatedAt),
  };
  if (item.icon) {
    result.icon = item.icon;
  }
  return result;
}

export function fromNavigationItemFirestore(id: string, data: Record<string, any>): NavigationItem {
  return {
    id: data.id || id,
    label: data.label || '',
    type: data.type || 'internal',
    targetType: data.targetType || 'kategori',
    targetId: data.targetId || '',
    url: data.url || '/',
    slug: data.slug || '',
    parentId: data.parentId || null,
    sortOrder: Number(data.sortOrder) || 0,
    active: data.active !== false,
    openNewTab: Boolean(data.openNewTab),
    icon: data.icon || undefined,
    createdAt: convertDateToString(data.createdAt),
    updatedAt: convertDateToString(data.updatedAt),
  };
}

export function toSubNavItemFirestore(item: SubNavigationItem): Record<string, any> {
  const result: Record<string, any> = {
    id: item.id,
    label: item.label,
    targetType: item.targetType || 'category',
    targetId: item.targetId || '',
    url: item.url || '/',
    slug: item.slug || '',
    sortOrder: Number(item.sortOrder) || 0,
    active: item.active !== false,
    openNewTab: item.openNewTab === true,
    section: 'subnav',
    createdAt: convertDateToString(item.createdAt),
    updatedAt: convertDateToString(item.updatedAt),
  };
  if (item.badge) {
    result.badge = item.badge;
  }
  return result;
}

export function fromSubNavItemFirestore(id: string, data: Record<string, any>): SubNavigationItem {
  return {
    id: data.id || id,
    label: data.label || '',
    targetType: data.targetType || 'category',
    targetId: data.targetId || '',
    url: data.url || '/',
    slug: data.slug || '',
    sortOrder: Number(data.sortOrder) || 0,
    active: data.active !== false,
    openNewTab: Boolean(data.openNewTab),
    badge: data.badge || '',
    createdAt: convertDateToString(data.createdAt),
    updatedAt: convertDateToString(data.updatedAt),
  };
}

export class AdminFirestoreNavigationRepository implements Omit<INavigationRepository, 'subscribe'> {
  async getPrimaryNav(): Promise<NavigationItem[]> {
    try {
      const db = getAdminFirestore();
      const snap = await db.collection(COLLECTION_NAME).get();
      if (snap.empty) {
        return INITIAL_NAVIGATION_DATA;
      }
      const list: NavigationItem[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (
          data.section === 'primary' ||
          (data.label && data.section !== 'subnav' && docSnap.id !== 'subnav_settings')
        ) {
          list.push(fromNavigationItemFirestore(docSnap.id, data));
        }
      });
      if (list.length === 0) {
        return INITIAL_NAVIGATION_DATA;
      }
      list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      return list;
    } catch (err) {
      console.warn('[AdminFirestoreNavigationRepository] getPrimaryNav failed, fallback to seed cache:', err);
      return INITIAL_NAVIGATION_DATA;
    }
  }

  async getSubNav(): Promise<SubNavigationItem[]> {
    try {
      const db = getAdminFirestore();
      const snap = await db.collection(COLLECTION_NAME).get();
      if (snap.empty) {
        return INITIAL_SUB_NAVIGATION_DATA;
      }
      const list: SubNavigationItem[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.section === 'subnav') {
          list.push(fromSubNavItemFirestore(docSnap.id, data));
        }
      });
      if (list.length === 0) {
        return INITIAL_SUB_NAVIGATION_DATA;
      }
      list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      return list;
    } catch (err) {
      console.warn('[AdminFirestoreNavigationRepository] getSubNav failed, fallback to seed cache:', err);
      return INITIAL_SUB_NAVIGATION_DATA;
    }
  }

  async getSubNavSettings(): Promise<SubNavSettings> {
    try {
      const db = getAdminFirestore();
      const docSnap = await db.collection(COLLECTION_NAME).doc('subnav_settings').get();
      if (!docSnap.exists) {
        return INITIAL_SUB_NAV_SETTINGS;
      }
      const data = docSnap.data() || {};
      return {
        showBreakingBadge: data.showBreakingBadge !== false,
        breakingBadgeText: data.breakingBadgeText || INITIAL_SUB_NAV_SETTINGS.breakingBadgeText,
        breakingNewsTitle: data.breakingNewsTitle || INITIAL_SUB_NAV_SETTINGS.breakingNewsTitle,
        breakingNewsUrl: data.breakingNewsUrl || INITIAL_SUB_NAV_SETTINGS.breakingNewsUrl,
      };
    } catch (err) {
      console.warn('[AdminFirestoreNavigationRepository] getSubNavSettings failed, fallback to seed cache:', err);
      return INITIAL_SUB_NAV_SETTINGS;
    }
  }

  async savePrimaryNav(items: NavigationItem[]): Promise<void> {
    const db = getAdminFirestore();
    const batch = db.batch();
    for (const item of items) {
      const docRef = db.collection(COLLECTION_NAME).doc(item.id);
      batch.set(docRef, toNavigationItemFirestore(item), { merge: true });
    }
    await batch.commit();
  }

  async saveSubNav(items: SubNavigationItem[]): Promise<void> {
    const db = getAdminFirestore();
    const batch = db.batch();
    for (const item of items) {
      const docRef = db.collection(COLLECTION_NAME).doc(item.id);
      batch.set(docRef, toSubNavItemFirestore(item), { merge: true });
    }
    await batch.commit();
  }

  async saveSubNavSettings(settings: SubNavSettings): Promise<void> {
    const db = getAdminFirestore();
    const docRef = db.collection(COLLECTION_NAME).doc('subnav_settings');
    await docRef.set(
      {
        ...settings,
        section: 'settings',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  async createPrimaryItem(item: NavigationItem): Promise<NavigationItem> {
    const db = getAdminFirestore();
    const docRef = db.collection(COLLECTION_NAME).doc(item.id);
    await docRef.set(toNavigationItemFirestore(item));
    return item;
  }

  async updatePrimaryItem(id: string, partial: Partial<NavigationItem>): Promise<NavigationItem> {
    const db = getAdminFirestore();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snap = await docRef.get();
    const existing = snap.exists ? fromNavigationItemFirestore(id, snap.data() || {}) : null;
    const merged: NavigationItem = {
      ...(existing || INITIAL_NAVIGATION_DATA.find((n) => n.id === id) || {
        id,
        label: '',
        type: 'internal',
        url: '/',
        slug: '',
        sortOrder: 0,
        active: true,
        openNewTab: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    await docRef.set(toNavigationItemFirestore(merged), { merge: true });
    return merged;
  }

  async deletePrimaryItem(id: string): Promise<void> {
    const db = getAdminFirestore();
    await db.collection(COLLECTION_NAME).doc(id).delete();
  }

  async createSubNavItem(item: SubNavigationItem): Promise<SubNavigationItem> {
    const db = getAdminFirestore();
    const docRef = db.collection(COLLECTION_NAME).doc(item.id);
    await docRef.set(toSubNavItemFirestore(item));
    return item;
  }

  async updateSubNavItem(id: string, partial: Partial<SubNavigationItem>): Promise<SubNavigationItem> {
    const db = getAdminFirestore();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snap = await docRef.get();
    const existing = snap.exists ? fromSubNavItemFirestore(id, snap.data() || {}) : null;
    const merged: SubNavigationItem = {
      ...(existing || INITIAL_SUB_NAVIGATION_DATA.find((n) => n.id === id) || {
        id,
        label: '',
        targetType: 'category',
        url: '/',
        slug: '',
        sortOrder: 0,
        active: true,
        openNewTab: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    await docRef.set(toSubNavItemFirestore(merged), { merge: true });
    return merged;
  }

  async deleteSubNavItem(id: string): Promise<void> {
    const db = getAdminFirestore();
    await db.collection(COLLECTION_NAME).doc(id).delete();
  }
}

export const adminFirestoreNavigationRepository = new AdminFirestoreNavigationRepository();
