import { FooterConfig, FooterValidationErrors } from '../types/footer';
import { firestoreFooterRepository } from '../repositories/firestore/firestoreFooterRepository';

export type { FooterConfig, FooterValidationErrors };

export const FOOTER_STORAGE_KEY = 'batutv_footer_config';
export const FOOTER_UPDATED_EVENT = 'batutv_footer_updated';

export const INITIAL_FOOTER_CONFIG: FooterConfig = {
  mediaInfo: {
    mediaName: 'BatuTV Media Network',
    shortDescription: 'Portal berita dan streaming televisi lokal terpercaya Malang Raya dan Jawa Timur. Menghadirkan jurnalisme independen, akurat, dan berimbang.',
    address: 'Jl. TVRI No. 1, Oro-Oro Ombo, Kec. Batu',
    city: 'Kota Batu',
    province: 'Jawa Timur',
    postalCode: '65316',
    editorialEmail: 'redaksi@batutv.id',
    businessEmail: 'marketing@batutv.id',
    phoneNumber: '+62 341 590001',
    whatsappNumber: '+62 812-3456-7890',
  },
  companyLinks: {
    tentangKamiUrl: '/tentang-kami',
    redaksiUrl: '/redaksi',
    kontakUrl: '/kontak-kami',
    karirUrl: '/karir',
  },
  legalLinks: {
    pedomanMediaSiberUrl: '/pedoman-media-siber',
    kodeEtikJurnalistikUrl: '/kode-etik-jurnalistik',
    disclaimerUrl: '/disclaimer',
    privacyPolicyUrl: '/kebijakan-privasi',
    termsOfServiceUrl: '/syarat-ketentuan',
  },
  socialMedia: {
    showSection: true,
    headingText: 'Ikuti kami di:',
    facebookUrl: 'https://facebook.com/batutvofficial',
    showFacebook: true,
    instagramUrl: 'https://instagram.com/batutv_official',
    showInstagram: true,
    youtubeUrl: 'https://youtube.com/@batutv',
    showYoutube: true,
    tiktokUrl: 'https://tiktok.com/@batutv',
    showTiktok: true,
    xTwitterUrl: 'https://x.com/batutv_official',
    showXTwitter: true,
    googleNewsUrl: 'https://news.google.com',
    showGoogleNews: true,
    telegramUrl: 'https://t.me/batutvchannel',
    showTelegram: true,
    linkedInUrl: 'https://linkedin.com/company/batutv',
    showLinkedIn: true,
  },
  copyright: {
    copyrightText: '© 2026 BATUTV Media Network. All Rights Reserved.',
    networkSubtitle: 'A Group Member of Batu Digital Media Network',
  },
  logo: {
    showLogo: true,
    logoUrl: '/brand/batutv-logo.svg',
    altText: 'BatuTV Media Network Official Logo',
  },
  mediaNetworks: [
    {
      id: 'net-viva',
      name: 'VIVA News & Insights',
      url: 'https://www.viva.co.id',
      presetStyle: 'viva',
      altText: 'VIVA News & Insights',
      order: 1,
      isActive: true,
    },
    {
      id: 'net-vlix',
      name: 'VLIX',
      url: 'https://www.vlix.id',
      presetStyle: 'vlix',
      altText: 'VLIX Video Network',
      order: 2,
      isActive: true,
    },
    {
      id: 'net-tvonenews',
      name: 'tvOnenews.com',
      url: 'https://www.tvonenews.com',
      presetStyle: 'tvonenews',
      altText: 'tvOnenews.com',
      order: 3,
      isActive: true,
    },
    {
      id: 'net-antvklik',
      name: 'antvklik.com',
      url: 'https://www.antvklik.com',
      presetStyle: 'antvklik',
      altText: 'antvklik.com',
      order: 4,
      isActive: true,
    },
    {
      id: 'net-intipseleb',
      name: 'INTIP SELEB',
      url: 'https://www.intipseleb.com',
      presetStyle: 'intipseleb',
      altText: 'INTIP SELEB',
      order: 5,
      isActive: true,
    },
    {
      id: 'net-jagodangdut',
      name: 'jago dangdut',
      url: 'https://www.jagodangdut.com',
      presetStyle: 'jagodangdut',
      altText: 'jago dangdut',
      order: 6,
      isActive: true,
    },
  ],
  updatedAt: '2026-08-29T00:00:00.000Z',
  updatedBy: 'Redaksi BatuTV',
};

// In-Memory state for instant UI rendering & synchronization
let inMemoryFooterConfig: FooterConfig = loadLocalCache();
let isSubscribed = false;

function loadLocalCache(): FooterConfig {
  if (typeof window === 'undefined') return INITIAL_FOOTER_CONFIG;
  try {
    const raw = localStorage.getItem(FOOTER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FOOTER_STORAGE_KEY, JSON.stringify(INITIAL_FOOTER_CONFIG));
      return INITIAL_FOOTER_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_FOOTER_CONFIG,
      ...parsed,
      mediaInfo: { ...INITIAL_FOOTER_CONFIG.mediaInfo, ...(parsed.mediaInfo || {}) },
      companyLinks: { ...INITIAL_FOOTER_CONFIG.companyLinks, ...(parsed.companyLinks || {}) },
      legalLinks: { ...INITIAL_FOOTER_CONFIG.legalLinks, ...(parsed.legalLinks || {}) },
      socialMedia: { ...INITIAL_FOOTER_CONFIG.socialMedia, ...(parsed.socialMedia || {}) },
      copyright: { ...INITIAL_FOOTER_CONFIG.copyright, ...(parsed.copyright || {}) },
      logo: { ...INITIAL_FOOTER_CONFIG.logo, ...(parsed.logo || {}) },
      mediaNetworks: parsed.mediaNetworks && Array.isArray(parsed.mediaNetworks) && parsed.mediaNetworks.length > 0
        ? parsed.mediaNetworks
        : INITIAL_FOOTER_CONFIG.mediaNetworks,
    };
  } catch (err) {
    console.error('Failed to load footer configuration from cache:', err);
    return INITIAL_FOOTER_CONFIG;
  }
}

function updateLocalCache(config: FooterConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FOOTER_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(FOOTER_UPDATED_EVENT, { detail: config }));
  } catch (err) {
    console.error('Failed to save footer configuration to cache:', err);
  }
}

function initRealtimeSync() {
  if (typeof window === 'undefined' || isSubscribed) return;
  isSubscribed = true;

  firestoreFooterRepository.subscribe(
    (cloudConfig) => {
      if (cloudConfig) {
        inMemoryFooterConfig = cloudConfig;
        updateLocalCache(cloudConfig);
      }
    },
    (err) => {
      console.warn('[footerAdminStore] Firestore subscription fallback to local cache:', err);
    }
  );
}

initRealtimeSync();

/**
 * Get stored Footer Configuration (SSoT synced with Firestore)
 */
export function getStoredFooterConfig(): FooterConfig {
  if (inMemoryFooterConfig) {
    return inMemoryFooterConfig;
  }
  return loadLocalCache();
}

/**
 * Force refresh from Firestore
 */
export async function refreshFooterConfigFromFirestore(): Promise<FooterConfig> {
  try {
    const config = await firestoreFooterRepository.getConfig();
    if (config) {
      inMemoryFooterConfig = config;
      updateLocalCache(config);
      return config;
    }
  } catch (err) {
    console.warn('[footerAdminStore] Failed to fetch footer config from Firestore:', err);
  }
  return getStoredFooterConfig();
}

/**
 * Save Footer Configuration & dispatch notification event (Writes to Firestore & Cache)
 */
export function saveFooterConfig(config: FooterConfig): boolean {
  const configToSave: FooterConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
  };

  inMemoryFooterConfig = configToSave;
  updateLocalCache(configToSave);

  // Async persist to Firestore
  firestoreFooterRepository.saveConfig(configToSave).catch((err) => {
    console.warn('[footerAdminStore] Firestore async saveConfig error:', err);
  });

  return true;
}

/**
 * Reset Footer Configuration to initial defaults
 */
export function resetFooterConfig(): FooterConfig {
  saveFooterConfig(INITIAL_FOOTER_CONFIG);
  return INITIAL_FOOTER_CONFIG;
}

/**
 * Helper to validate URL (absolute https:// or relative /path)
 */
export function isValidUrlOrPath(val: string): boolean {
  if (!val || val.trim() === '') return true;
  const trimmed = val.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Helper to validate email format
 */
export function isValidEmail(val: string): boolean {
  if (!val || val.trim() === '') return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(val.trim());
}

/**
 * Helper to validate phone number
 */
export function isValidPhone(val: string): boolean {
  if (!val || val.trim() === '') return true;
  const phoneRegex = /^[\d\s+\-().]{6,25}$/;
  return phoneRegex.test(val.trim());
}

/**
 * Perform comprehensive validation for Footer Management
 */
export function validateFooterForm(config: FooterConfig): {
  isValid: boolean;
  errors: FooterValidationErrors;
} {
  const errors: FooterValidationErrors = {
    mediaInfo: {},
    companyLinks: {},
    legalLinks: {},
    socialMedia: {},
    copyright: {},
    logo: {},
  };

  let hasError = false;

  // 1. Media Info Validation
  if (!config.mediaInfo.mediaName?.trim()) {
    errors.mediaInfo!.mediaName = 'Nama Media wajib diisi';
    hasError = true;
  }

  if (config.mediaInfo.editorialEmail && !isValidEmail(config.mediaInfo.editorialEmail)) {
    errors.mediaInfo!.editorialEmail = 'Format email redaksi tidak valid';
    hasError = true;
  }

  if (config.mediaInfo.businessEmail && !isValidEmail(config.mediaInfo.businessEmail)) {
    errors.mediaInfo!.businessEmail = 'Format email bisnis tidak valid';
    hasError = true;
  }

  if (config.mediaInfo.phoneNumber && !isValidPhone(config.mediaInfo.phoneNumber)) {
    errors.mediaInfo!.phoneNumber = 'Format nomor telepon tidak valid (contoh: +62 341 590001)';
    hasError = true;
  }

  if (config.mediaInfo.whatsappNumber && !isValidPhone(config.mediaInfo.whatsappNumber)) {
    errors.mediaInfo!.whatsappNumber = 'Format nomor WhatsApp tidak valid (contoh: +62 812-3456-7890)';
    hasError = true;
  }

  // 2. Company Links Validation
  if (config.companyLinks.tentangKamiUrl && !isValidUrlOrPath(config.companyLinks.tentangKamiUrl)) {
    errors.companyLinks!.tentangKamiUrl = 'URL atau path tidak valid (contoh: /tentang-kami atau https://...)';
    hasError = true;
  }
  if (config.companyLinks.redaksiUrl && !isValidUrlOrPath(config.companyLinks.redaksiUrl)) {
    errors.companyLinks!.redaksiUrl = 'URL atau path tidak valid';
    hasError = true;
  }
  if (config.companyLinks.kontakUrl && !isValidUrlOrPath(config.companyLinks.kontakUrl)) {
    errors.companyLinks!.kontakUrl = 'URL atau path tidak valid';
    hasError = true;
  }
  if (config.companyLinks.karirUrl && !isValidUrlOrPath(config.companyLinks.karirUrl)) {
    errors.companyLinks!.karirUrl = 'URL atau path tidak valid';
    hasError = true;
  }

  // 3. Legal Links Validation
  if (config.legalLinks.pedomanMediaSiberUrl && !isValidUrlOrPath(config.legalLinks.pedomanMediaSiberUrl)) {
    errors.legalLinks!.pedomanMediaSiberUrl = 'URL atau path tidak valid';
    hasError = true;
  }
  if (config.legalLinks.kodeEtikJurnalistikUrl && !isValidUrlOrPath(config.legalLinks.kodeEtikJurnalistikUrl)) {
    errors.legalLinks!.kodeEtikJurnalistikUrl = 'URL atau path tidak valid';
    hasError = true;
  }
  if (config.legalLinks.disclaimerUrl && !isValidUrlOrPath(config.legalLinks.disclaimerUrl)) {
    errors.legalLinks!.disclaimerUrl = 'URL atau path tidak valid';
    hasError = true;
  }
  if (config.legalLinks.privacyPolicyUrl && !isValidUrlOrPath(config.legalLinks.privacyPolicyUrl)) {
    errors.legalLinks!.privacyPolicyUrl = 'URL atau path tidak valid';
    hasError = true;
  }
  if (config.legalLinks.termsOfServiceUrl && !isValidUrlOrPath(config.legalLinks.termsOfServiceUrl)) {
    errors.legalLinks!.termsOfServiceUrl = 'URL atau path tidak valid';
    hasError = true;
  }

  // 4. Social Media Validation
  if (config.socialMedia.facebookUrl && !isValidUrlOrPath(config.socialMedia.facebookUrl)) {
    errors.socialMedia!.facebookUrl = 'URL Facebook tidak valid';
    hasError = true;
  }
  if (config.socialMedia.instagramUrl && !isValidUrlOrPath(config.socialMedia.instagramUrl)) {
    errors.socialMedia!.instagramUrl = 'URL Instagram tidak valid';
    hasError = true;
  }
  if (config.socialMedia.youtubeUrl && !isValidUrlOrPath(config.socialMedia.youtubeUrl)) {
    errors.socialMedia!.youtubeUrl = 'URL YouTube tidak valid';
    hasError = true;
  }
  if (config.socialMedia.tiktokUrl && !isValidUrlOrPath(config.socialMedia.tiktokUrl)) {
    errors.socialMedia!.tiktokUrl = 'URL TikTok tidak valid';
    hasError = true;
  }
  if (config.socialMedia.xTwitterUrl && !isValidUrlOrPath(config.socialMedia.xTwitterUrl)) {
    errors.socialMedia!.xTwitterUrl = 'URL X / Twitter tidak valid';
    hasError = true;
  }
  if (config.socialMedia.telegramUrl && !isValidUrlOrPath(config.socialMedia.telegramUrl)) {
    errors.socialMedia!.telegramUrl = 'URL Telegram tidak valid';
    hasError = true;
  }
  if (config.socialMedia.linkedInUrl && !isValidUrlOrPath(config.socialMedia.linkedInUrl)) {
    errors.socialMedia!.linkedInUrl = 'URL LinkedIn tidak valid';
    hasError = true;
  }
  if (config.socialMedia.googleNewsUrl && !isValidUrlOrPath(config.socialMedia.googleNewsUrl)) {
    errors.socialMedia!.googleNewsUrl = 'URL Google News tidak valid';
    hasError = true;
  }

  // 5. Copyright Validation
  if (!config.copyright.copyrightText?.trim()) {
    errors.copyright!.copyrightText = 'Copyright Text wajib diisi';
    hasError = true;
  }

  return {
    isValid: !hasError,
    errors,
  };
}

/**
 * Generate Organization Schema (JSON-LD) from footer data for SEO
 */
export function generateOrganizationSchema(config: FooterConfig) {
  const sameAsLinks = [
    config.socialMedia.facebookUrl,
    config.socialMedia.instagramUrl,
    config.socialMedia.youtubeUrl,
    config.socialMedia.tiktokUrl,
    config.socialMedia.xTwitterUrl,
    config.socialMedia.telegramUrl,
    config.socialMedia.linkedInUrl,
    config.socialMedia.googleNewsUrl,
  ].filter((url): url is string => typeof url === 'string' && url.trim().length > 0);

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: config.mediaInfo.mediaName,
    description: config.mediaInfo.shortDescription,
    url: typeof window !== 'undefined' ? window.location.origin : 'https://batutv.id',
    logo: config.logo.logoUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: config.mediaInfo.address,
      addressLocality: config.mediaInfo.city,
      addressRegion: config.mediaInfo.province,
      postalCode: config.mediaInfo.postalCode,
      addressCountry: 'ID',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: config.mediaInfo.phoneNumber,
        contactType: 'editorial',
        email: config.mediaInfo.editorialEmail,
      },
      {
        '@type': 'ContactPoint',
        telephone: config.mediaInfo.whatsappNumber,
        contactType: 'customer service',
        email: config.mediaInfo.businessEmail,
      },
    ],
    sameAs: sameAsLinks,
  };
}
