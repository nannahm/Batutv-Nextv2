import { FooterConfig } from '@/src/types/footer';
import { INITIAL_FOOTER_CONFIG } from '@/src/data/initialFooterConfig';
import { FooterConfigFetchResult } from '../types';
import { adminFirestoreFooterRepository } from './adminFirestoreFooterRepository';

export async function fetchFooterConfigLive(): Promise<FooterConfigFetchResult> {
  try {
    const config = await adminFirestoreFooterRepository.getFooterConfig();
    return {
      source: 'firestore',
      config,
    };
  } catch (error) {
    console.warn(
      '[liveFirestoreFooterService] Gagal fetch footer live. Fallback ke seed-cache:',
      error
    );
    return {
      source: 'seed-cache',
      config: INITIAL_FOOTER_CONFIG,
      warning:
        error instanceof Error
          ? error.message
          : 'Gagal menghubungkan Firestore Admin SDK untuk footer config.',
    };
  }
}
