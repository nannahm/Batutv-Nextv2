import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FooterConfig } from '../../types/footer';
import { IFooterRepository } from '../IFooterRepository';
import { sanitizeForFirestore } from './converterUtils';
import { INITIAL_FOOTER_CONFIG } from '../../data/footerAdminStore';

const COLLECTION_NAME = 'footer';
const PRIMARY_DOC_ID = 'config';

export function toFooterFirestoreDocument(config: FooterConfig): Record<string, any> {
  return sanitizeForFirestore({
    mediaInfo: config.mediaInfo,
    companyLinks: config.companyLinks,
    legalLinks: config.legalLinks,
    socialMedia: config.socialMedia,
    copyright: config.copyright,
    logo: config.logo,
    mediaNetworks: config.mediaNetworks || [],
    updatedAt: new Date().toISOString(),
  });
}

export function fromFooterFirestoreDocument(data: Record<string, any>): FooterConfig {
  return {
    mediaInfo: {
      ...INITIAL_FOOTER_CONFIG.mediaInfo,
      ...(data.mediaInfo || {}),
    },
    companyLinks: {
      ...INITIAL_FOOTER_CONFIG.companyLinks,
      ...(data.companyLinks || {}),
    },
    legalLinks: {
      ...INITIAL_FOOTER_CONFIG.legalLinks,
      ...(data.legalLinks || {}),
    },
    socialMedia: {
      ...INITIAL_FOOTER_CONFIG.socialMedia,
      ...(data.socialMedia || {}),
    },
    copyright: {
      ...INITIAL_FOOTER_CONFIG.copyright,
      ...(data.copyright || {}),
    },
    logo: {
      ...INITIAL_FOOTER_CONFIG.logo,
      ...(data.logo || {}),
    },
    mediaNetworks: Array.isArray(data.mediaNetworks)
      ? data.mediaNetworks
      : INITIAL_FOOTER_CONFIG.mediaNetworks,
    updatedAt: data.updatedAt || new Date().toISOString(),
    updatedBy: data.updatedBy || 'Administrator',
  };
}

export class FirestoreFooterRepository implements IFooterRepository {
  async getConfig(): Promise<FooterConfig> {
    try {
      const docRef = doc(db, COLLECTION_NAME, PRIMARY_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return fromFooterFirestoreDocument(snap.data());
      }

      // Check fallback 'default'
      const fallbackRef = doc(db, COLLECTION_NAME, 'default');
      const fallbackSnap = await getDoc(fallbackRef);
      if (fallbackSnap.exists()) {
        return fromFooterFirestoreDocument(fallbackSnap.data());
      }
    } catch (err) {
      console.warn('[FirestoreFooterRepository] Failed to read from firestore:', err);
    }
    return INITIAL_FOOTER_CONFIG;
  }

  async saveConfig(config: FooterConfig): Promise<FooterConfig> {
    const payload = toFooterFirestoreDocument(config);
    const docRef = doc(db, COLLECTION_NAME, PRIMARY_DOC_ID);
    await setDoc(docRef, payload, { merge: true });

    // Also mirror to 'default' for blueprint compatibility
    try {
      const mirrorRef = doc(db, COLLECTION_NAME, 'default');
      await setDoc(mirrorRef, payload, { merge: true });
    } catch {
      // ignore
    }

    return config;
  }

  subscribe(
    onNext: (config: FooterConfig) => void,
    onError?: (error: Error) => void
  ): () => void {
    const docRef = doc(db, COLLECTION_NAME, PRIMARY_DOC_ID);
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          onNext(fromFooterFirestoreDocument(snap.data()));
        }
      },
      (err) => {
        console.warn('[FirestoreFooterRepository] subscription error:', err);
        if (onError) onError(err);
      }
    );
  }
}

export const firestoreFooterRepository = new FirestoreFooterRepository();
