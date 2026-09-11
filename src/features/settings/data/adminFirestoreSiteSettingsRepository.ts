import { SiteSettings } from '@/src/types/siteSettings';
import { ISiteSettingsRepository } from '@/src/repositories/ISiteSettingsRepository';
import { getAdminFirestore } from '@/src/lib/firebaseAdmin';
import { INITIAL_SITE_SETTINGS } from '@/src/data/initialSiteSettings';

const COLLECTION_NAME = 'site_settings';
const PRIMARY_DOC_ID = 'default';

export function toSiteSettingsFirestore(settings: SiteSettings): Record<string, any> {
  return {
    identity: settings.identity || INITIAL_SITE_SETTINGS.identity,
    logos: settings.logos || INITIAL_SITE_SETTINGS.logos,
    favicon: settings.favicon || INITIAL_SITE_SETTINGS.favicon,
    colors: settings.colors || INITIAL_SITE_SETTINGS.colors,
    typography: settings.typography || INITIAL_SITE_SETTINGS.typography,
    seo: settings.seo || INITIAL_SITE_SETTINGS.seo,
    publisher: settings.publisher || INITIAL_SITE_SETTINGS.publisher,
    socialMedia: settings.socialMedia || INITIAL_SITE_SETTINGS.socialMedia,
    verification: settings.verification || INITIAL_SITE_SETTINGS.verification,
    updatedAt: settings.updatedAt || new Date().toISOString(),
    updatedBy: settings.updatedBy || 'Administrator',
  };
}

export function fromSiteSettingsFirestore(data: Record<string, any>): SiteSettings {
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
      topicBar: {
        ...INITIAL_SITE_SETTINGS.typography.topicBar,
        ...(data.typography?.topicBar || {}),
      },
      navigation: {
        ...INITIAL_SITE_SETTINGS.typography.navigation,
        ...(data.typography?.navigation || {}),
      },
      footerMenu: {
        ...INITIAL_SITE_SETTINGS.typography.footerMenu,
        ...(data.typography?.footerMenu || {}),
      },
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
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
    updatedBy: data.updatedBy || 'Administrator',
  };
}

export class AdminFirestoreSiteSettingsRepository
  implements Omit<ISiteSettingsRepository, 'subscribe'>
{
  async getSettings(): Promise<SiteSettings> {
    try {
      const db = getAdminFirestore();
      const docSnap = await db.collection(COLLECTION_NAME).doc(PRIMARY_DOC_ID).get();
      if (!docSnap.exists) {
        return INITIAL_SITE_SETTINGS;
      }
      return fromSiteSettingsFirestore(docSnap.data() || {});
    } catch (err) {
      console.warn(
        '[AdminFirestoreSiteSettingsRepository] Gagal membaca site_settings dari Firestore. Fallback ke initial settings:',
        err
      );
      return INITIAL_SITE_SETTINGS;
    }
  }

  async saveSettings(settings: SiteSettings): Promise<SiteSettings> {
    const db = getAdminFirestore();
    const docRef = db.collection(COLLECTION_NAME).doc(PRIMARY_DOC_ID);
    const dataToSave = toSiteSettingsFirestore({
      ...settings,
      updatedAt: new Date().toISOString(),
    });
    await docRef.set(dataToSave, { merge: true });
    return fromSiteSettingsFirestore(dataToSave);
  }
}

export const adminFirestoreSiteSettingsRepository = new AdminFirestoreSiteSettingsRepository();
