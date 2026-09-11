import { FooterConfig } from '@/src/types/footer';
import { IFooterRepository } from '@/src/repositories/IFooterRepository';
import { getAdminFirestore } from '@/src/lib/firebaseAdmin';
import { INITIAL_FOOTER_CONFIG } from '@/src/data/initialFooterConfig';

const COLLECTION_NAME = 'footer';
const PRIMARY_DOC_ID = 'config';

export function toFooterFirestore(config: FooterConfig): Record<string, any> {
  return {
    mediaInfo: config.mediaInfo || INITIAL_FOOTER_CONFIG.mediaInfo,
    companyLinks: config.companyLinks || INITIAL_FOOTER_CONFIG.companyLinks,
    legalLinks: config.legalLinks || INITIAL_FOOTER_CONFIG.legalLinks,
    socialMedia: config.socialMedia || INITIAL_FOOTER_CONFIG.socialMedia,
    copyright: config.copyright || INITIAL_FOOTER_CONFIG.copyright,
    logo: config.logo || INITIAL_FOOTER_CONFIG.logo,
    mediaNetworks: Array.isArray(config.mediaNetworks)
      ? config.mediaNetworks
      : INITIAL_FOOTER_CONFIG.mediaNetworks,
    updatedAt: new Date().toISOString(),
    updatedBy: config.updatedBy || 'Administrator',
  };
}

export function fromFooterFirestore(data: Record<string, any>): FooterConfig {
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
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
    updatedBy: data.updatedBy || 'Administrator',
  };
}

export class AdminFirestoreFooterRepository
  implements Omit<IFooterRepository, 'subscribe'>
{
  async getConfig(): Promise<FooterConfig> {
    return this.getFooterConfig();
  }

  async saveConfig(config: FooterConfig): Promise<FooterConfig> {
    return this.saveFooterConfig(config);
  }

  async getFooterConfig(): Promise<FooterConfig> {
    try {
      const db = getAdminFirestore();
      const docSnap = await db.collection(COLLECTION_NAME).doc(PRIMARY_DOC_ID).get();
      if (!docSnap.exists) {
        return INITIAL_FOOTER_CONFIG;
      }
      return fromFooterFirestore(docSnap.data() || {});
    } catch (err) {
      console.warn(
        '[AdminFirestoreFooterRepository] Gagal membaca footer dari Firestore. Fallback ke initial config:',
        err
      );
      return INITIAL_FOOTER_CONFIG;
    }
  }

  async saveFooterConfig(config: FooterConfig): Promise<FooterConfig> {
    const db = getAdminFirestore();
    const docRef = db.collection(COLLECTION_NAME).doc(PRIMARY_DOC_ID);
    const dataToSave = toFooterFirestore({
      ...config,
      updatedAt: new Date().toISOString(),
    });
    await docRef.set(dataToSave, { merge: true });
    return fromFooterFirestore(dataToSave);
  }
}

export const adminFirestoreFooterRepository = new AdminFirestoreFooterRepository();
