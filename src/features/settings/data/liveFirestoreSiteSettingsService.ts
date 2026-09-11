import { SiteSettings } from '@/src/types/siteSettings';
import { INITIAL_SITE_SETTINGS } from '@/src/data/initialSiteSettings';
import { SiteSettingsFetchResult } from '../types';
import { adminFirestoreSiteSettingsRepository } from './adminFirestoreSiteSettingsRepository';

export async function fetchSiteSettingsLive(): Promise<SiteSettingsFetchResult> {
  try {
    const settings = await adminFirestoreSiteSettingsRepository.getSettings();
    return {
      source: 'firestore',
      settings,
    };
  } catch (error) {
    console.warn(
      '[liveFirestoreSiteSettingsService] Gagal fetch site settings live. Fallback ke seed-cache:',
      error
    );
    return {
      source: 'seed-cache',
      settings: INITIAL_SITE_SETTINGS,
      warning:
        error instanceof Error
          ? error.message
          : 'Gagal menghubungkan Firestore Admin SDK untuk site settings.',
    };
  }
}
