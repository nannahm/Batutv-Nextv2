import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SiteSettings } from '../../types/siteSettings';
import { ISiteSettingsRepository } from '../ISiteSettingsRepository';
import { sanitizeForFirestore } from './converterUtils';
import { INITIAL_SITE_SETTINGS } from '../../data/siteSettingsStore';

const COLLECTION_NAME = 'site_settings';
const PRIMARY_DOC_ID = 'default';

export function toSiteSettingsFirestoreDocument(settings: SiteSettings): Record<string, any> {
  return sanitizeForFirestore({
    identity: settings.identity,
    logos: settings.logos,
    favicon: settings.favicon,
    colors: settings.colors,
    typography: settings.typography,
    seo: settings.seo,
    publisher: settings.publisher,
    socialMedia: settings.socialMedia,
    verification: settings.verification,
    updatedAt: settings.updatedAt || new Date().toISOString(),
    updatedBy: settings.updatedBy || 'Administrator',
  });
}

export function fromSiteSettingsFirestoreDocument(data: Record<string, any>): SiteSettings {
  return {
    identity: {
      ...INITIAL_SITE_SETTINGS.identity,
      ...(data.identity || {}),
    },
    logos: {
      ...INITIAL_SITE_SETTINGS.logos,
      ...(data.logos || {}),
    },
    favicon: {
      ...INITIAL_SITE_SETTINGS.favicon,
      ...(data.favicon || {}),
    },
    colors: {
      ...INITIAL_SITE_SETTINGS.colors,
      ...(data.colors || {}),
    },
    typography: {
      ...INITIAL_SITE_SETTINGS.typography,
      ...(data.typography || {}),
    },
    seo: {
      ...INITIAL_SITE_SETTINGS.seo,
      ...(data.seo || {}),
    },
    publisher: {
      ...INITIAL_SITE_SETTINGS.publisher,
      ...(data.publisher || {}),
    },
    socialMedia: {
      ...INITIAL_SITE_SETTINGS.socialMedia,
      ...(data.socialMedia || {}),
    },
    verification: {
      ...INITIAL_SITE_SETTINGS.verification,
      ...(data.verification || {}),
    },
    updatedAt: data.updatedAt || new Date().toISOString(),
    updatedBy: data.updatedBy || 'Administrator',
  };
}

export class FirestoreSiteSettingsRepository implements ISiteSettingsRepository {
  async getSettings(): Promise<SiteSettings> {
    try {
      const docRef = doc(db, COLLECTION_NAME, PRIMARY_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return fromSiteSettingsFirestoreDocument(snap.data());
      }

      const globalRef = doc(db, COLLECTION_NAME, 'global');
      const globalSnap = await getDoc(globalRef);
      if (globalSnap.exists()) {
        return fromSiteSettingsFirestoreDocument(globalSnap.data());
      }
    } catch (err) {
      console.warn('[FirestoreSiteSettingsRepository] Failed to read from firestore:', err);
    }
    return INITIAL_SITE_SETTINGS;
  }

  async saveSettings(settings: SiteSettings): Promise<SiteSettings> {
    const payload = toSiteSettingsFirestoreDocument(settings);
    const docRef = doc(db, COLLECTION_NAME, PRIMARY_DOC_ID);
    await setDoc(docRef, payload, { merge: true });

    // Also mirror to 'global'
    try {
      const globalRef = doc(db, COLLECTION_NAME, 'global');
      await setDoc(globalRef, payload, { merge: true });
    } catch {
      // ignore
    }

    return settings;
  }

  subscribe(
    onNext: (settings: SiteSettings) => void,
    onError?: (error: Error) => void
  ): () => void {
    const docRef = doc(db, COLLECTION_NAME, PRIMARY_DOC_ID);
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          onNext(fromSiteSettingsFirestoreDocument(snap.data()));
        }
      },
      (err) => {
        console.warn('[FirestoreSiteSettingsRepository] subscription error:', err);
        if (onError) onError(err);
      }
    );
  }
}

export const firestoreSiteSettingsRepository = new FirestoreSiteSettingsRepository();
