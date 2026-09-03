import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  NavigationItem,
  SubNavigationItem,
  SubNavSettings,
} from '../../types/navigation';
import { INavigationRepository } from '../INavigationRepository';
import { sanitizeForFirestore } from './converterUtils';

const COLLECTION_NAME = 'navigation';

export function toNavigationItemFirestore(item: NavigationItem): Record<string, any> {
  return sanitizeForFirestore({
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
    icon: item.icon || '',
    section: 'primary',
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  });
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
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

export function toSubNavItemFirestore(item: SubNavigationItem): Record<string, any> {
  return sanitizeForFirestore({
    id: item.id,
    label: item.label,
    targetType: item.targetType || 'category',
    targetId: item.targetId || '',
    url: item.url || '/',
    slug: item.slug || '',
    sortOrder: Number(item.sortOrder) || 0,
    active: item.active !== false,
    openNewTab: item.openNewTab === true,
    badge: item.badge || '',
    section: 'subnav',
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  });
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
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

const DEFAULT_SUBNAV_SETTINGS: SubNavSettings = {
  showBreakingBadge: true,
  breakingBadgeText: 'LIVE REPORT',
  breakingNewsTitle: 'Siaran Langsung Peliputan Khusus BatuTV Menjangkau Seluruh Jawa Timur',
  breakingNewsUrl: '/video',
};

export class FirestoreNavigationRepository implements INavigationRepository {
  private colRef = collection(db, COLLECTION_NAME);

  async getPrimaryNav(): Promise<NavigationItem[]> {
    const snap = await getDocs(this.colRef);
    const list: NavigationItem[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.section === 'primary' || (data.label && data.section !== 'subnav' && docSnap.id !== 'subnav_settings')) {
        list.push(fromNavigationItemFirestore(docSnap.id, data));
      }
    });
    list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return list;
  }

  async getSubNav(): Promise<SubNavigationItem[]> {
    const snap = await getDocs(this.colRef);
    const list: SubNavigationItem[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.section === 'subnav') {
        list.push(fromSubNavItemFirestore(docSnap.id, data));
      }
    });
    list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return list;
  }

  async getSubNavSettings(): Promise<SubNavSettings> {
    const docRef = doc(db, COLLECTION_NAME, 'subnav_settings');
    const snap = await getDoc(docRef);
    if (!snap.exists()) return DEFAULT_SUBNAV_SETTINGS;
    const data = snap.data();
    return {
      showBreakingBadge: data.showBreakingBadge !== false,
      breakingBadgeText: data.breakingBadgeText || DEFAULT_SUBNAV_SETTINGS.breakingBadgeText,
      breakingNewsTitle: data.breakingNewsTitle || DEFAULT_SUBNAV_SETTINGS.breakingNewsTitle,
      breakingNewsUrl: data.breakingNewsUrl || DEFAULT_SUBNAV_SETTINGS.breakingNewsUrl,
    };
  }

  async savePrimaryNav(items: NavigationItem[]): Promise<void> {
    const batch = writeBatch(db);
    for (const item of items) {
      const docRef = doc(db, COLLECTION_NAME, item.id);
      batch.set(docRef, toNavigationItemFirestore(item), { merge: true });
    }
    await batch.commit();
  }

  async saveSubNav(items: SubNavigationItem[]): Promise<void> {
    const batch = writeBatch(db);
    for (const item of items) {
      const docRef = doc(db, COLLECTION_NAME, item.id);
      batch.set(docRef, toSubNavItemFirestore(item), { merge: true });
    }
    await batch.commit();
  }

  async saveSubNavSettings(settings: SubNavSettings): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, 'subnav_settings');
    await setDoc(docRef, { ...settings, section: 'settings', updatedAt: new Date().toISOString() }, { merge: true });
  }

  async createPrimaryItem(item: NavigationItem): Promise<NavigationItem> {
    const docRef = doc(db, COLLECTION_NAME, item.id);
    await setDoc(docRef, toNavigationItemFirestore(item));
    return item;
  }

  async updatePrimaryItem(id: string, partial: Partial<NavigationItem>): Promise<NavigationItem> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const cleanPartial = sanitizeForFirestore({
      ...partial,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(docRef, cleanPartial);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error(`Navigation item ${id} not found`);
    return fromNavigationItemFirestore(snap.id, snap.data());
  }

  async deletePrimaryItem(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  async createSubNavItem(item: SubNavigationItem): Promise<SubNavigationItem> {
    const docRef = doc(db, COLLECTION_NAME, item.id);
    await setDoc(docRef, toSubNavItemFirestore(item));
    return item;
  }

  async updateSubNavItem(id: string, partial: Partial<SubNavigationItem>): Promise<SubNavigationItem> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const cleanPartial = sanitizeForFirestore({
      ...partial,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(docRef, cleanPartial);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error(`SubNav item ${id} not found`);
    return fromSubNavItemFirestore(snap.id, snap.data());
  }

  async deleteSubNavItem(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  subscribe(
    onNext: (data: {
      primary: NavigationItem[];
      subNav: SubNavigationItem[];
      subNavSettings: SubNavSettings;
    }) => void,
    onError?: (error: Error) => void
  ): () => void {
    return onSnapshot(
      this.colRef,
      (snap) => {
        const primary: NavigationItem[] = [];
        const subNav: SubNavigationItem[] = [];
        let subNavSettings: SubNavSettings = DEFAULT_SUBNAV_SETTINGS;

        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (docSnap.id === 'subnav_settings') {
            subNavSettings = {
              showBreakingBadge: d.showBreakingBadge !== false,
              breakingBadgeText: d.breakingBadgeText || DEFAULT_SUBNAV_SETTINGS.breakingBadgeText,
              breakingNewsTitle: d.breakingNewsTitle || DEFAULT_SUBNAV_SETTINGS.breakingNewsTitle,
              breakingNewsUrl: d.breakingNewsUrl || DEFAULT_SUBNAV_SETTINGS.breakingNewsUrl,
            };
          } else if (d.section === 'subnav') {
            subNav.push(fromSubNavItemFirestore(docSnap.id, d));
          } else {
            primary.push(fromNavigationItemFirestore(docSnap.id, d));
          }
        });

        primary.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        subNav.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        onNext({ primary, subNav, subNavSettings });
      },
      (err) => {
        console.warn('[FirestoreNavigationRepository] subscription error:', err);
        if (onError) onError(err);
      }
    );
  }
}

export const firestoreNavigationRepository = new FirestoreNavigationRepository();
