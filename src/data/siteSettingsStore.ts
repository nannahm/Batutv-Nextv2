import {
  SiteSettings,
  SiteSettingsValidationErrors,
  SupportedFont,
} from '../types/siteSettings';
import { firestoreSiteSettingsRepository } from '../repositories/firestore/firestoreSiteSettingsRepository';

export const SITE_SETTINGS_STORAGE_KEY = 'batutv_site_settings';
export const SITE_SETTINGS_UPDATED_EVENT = 'batutv_site_settings_updated';

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  identity: {
    siteName: 'BATUTV',
    tagline: 'Portal Berita Batu Raya',
    siteDescription:
      'Portal Berita Terkini, Akurat, dan Terpercaya Seputar Kota Batu, Malang Raya, Jawa Timur, Nasional, Ekonomi, Politik, dan Siaran TV Streaming - BatuTV.',
    mainDomain: 'https://batutv.com',
  },
  logos: {
    headerDesktop: '/brand/batutv-logo.svg',
    headerDesktopAlt: 'BatuTV Inspirasi Untuk Negeri - Header Logo Desktop',
    navbarCompact: '',
    navbarCompactAlt: 'BatuTV Compact Navbar Badge Logo',
    headerMobile: '/brand/batutv-logo.svg',
    headerMobileAlt: 'BatuTV Mobile Logo',
    footer: '/brand/batutv-logo.svg',
    footerAlt: 'BatuTV Media Network Footer Logo',
    darkMode: '/brand/batutv-logo-dark.svg',
    darkModeAlt: 'BatuTV Dark Mode Logo',
    publisherSchema: '/brand/batutv-logo-publisher.png',
    publisherSchemaAlt: 'BatuTV Publisher Schema Logo 600x60',
  },
  favicon: {
    faviconUrl: '/favicon.svg',
    faviconAlt: 'BatuTV Official Favicon Icon',
  },
  colors: {
    primary: '#D6001C',
    secondary: '#111827',
    accent: '#F59E0B',
    background: '#F8FAFC',
  },
  typography: {
    headingFont: 'Outfit' as SupportedFont,
    bodyFont: 'Plus Jakarta Sans' as SupportedFont,
    headingWeight: '800',
    bodyWeight: '400',
    fontSizeScale: 'normal',
    topicBar: {
      fontSize: 11,
      fontWeight: '400',
      fontFamily: 'inherit',
      textTransform: 'none',
      badgePadding: 'normal',
      badgeBgColor: '#f1f3f5',
      badgeTextColor: '#334155',
    },
    navigation: {
      fontSize: 12.5,
      fontWeight: '900',
      letterSpacing: 'wide',
      textTransform: 'uppercase',
    },
    footerMenu: {
      fontSize: 13,
      fontWeight: '700',
      gap: 'normal',
      textColor: '#ffffff',
      hoverColor: '#ef4444',
    },
  },
  seo: {
    defaultSiteTitle: 'BatuTV | Portal Berita Terkini, Daerah Batu, Nasional & Video',
    defaultMetaDescription:
      'Portal Berita Terkini, Akurat, dan Terpercaya Seputar Kota Batu, Malang Raya, Jawa Timur, Nasional, Ekonomi, Politik, dan Siaran TV Streaming - BatuTV.',
    defaultKeywords:
      'BatuTV, berita kota batu, portal berita batu, malang raya, jawa timur, berita terkini, berita nasional, video berita, live streaming batu tv',
    defaultOgImage:
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
    defaultOgImageAlt: 'BatuTV Official Open Graph Social Image',
  },
  publisher: {
    companyName: 'PT Batu Televisi Indonesia',
    publisherName: 'Redaksi BatuTV',
    fullAddress: 'Jl. TVRI No. 1, Oro-Oro Ombo, Kec. Batu',
    city: 'Kota Batu',
    province: 'Jawa Timur',
    postalCode: '65316',
    editorialEmail: 'redaksi@batutv.com',
    businessEmail: 'iklan@batutv.com',
    phoneNumber: '+62 341 591234',
    whatsApp: '+62 812 3456 7890',
  },
  socialMedia: {
    facebook: 'https://facebook.com/batutvofficial',
    instagram: 'https://instagram.com/batutv_official',
    youtube: 'https://youtube.com/@batutv_official',
    tiktok: 'https://tiktok.com/@batutv_official',
    twitter: 'https://twitter.com/batutv_official',
    telegram: 'https://t.me/batutv_news',
    linkedin: 'https://linkedin.com/company/batutv',
  },
  verification: {
    googleSearchConsole: 'google-site-verification-batutv-official-2026',
    googleAnalyticsId: 'G-BATUTV2026',
    googleTagManagerId: 'GTM-BTV9988',
    metaPixelId: '1029384756',
    customHeaderScript: '',
    customFooterScript: '',
  },
  updatedAt: '2026-08-29T00:00:00.000Z',
  updatedBy: 'Redaksi BatuTV',
};

// In-Memory state for instant UI rendering & synchronization
let inMemorySiteSettings: SiteSettings = loadLocalCache();
let isSubscribed = false;

function loadLocalCache(): SiteSettings {
  if (typeof window === 'undefined') {
    return INITIAL_SITE_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return INITIAL_SITE_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return {
      identity: { ...INITIAL_SITE_SETTINGS.identity, ...(parsed.identity || {}) },
      logos: { ...INITIAL_SITE_SETTINGS.logos, ...(parsed.logos || {}) },
      favicon: { ...INITIAL_SITE_SETTINGS.favicon, ...(parsed.favicon || {}) },
      colors: { ...INITIAL_SITE_SETTINGS.colors, ...(parsed.colors || {}) },
      typography: {
        ...INITIAL_SITE_SETTINGS.typography,
        ...(parsed.typography || {}),
        topicBar: {
          ...INITIAL_SITE_SETTINGS.typography.topicBar,
          ...(parsed.typography?.topicBar || {}),
        },
        navigation: {
          ...INITIAL_SITE_SETTINGS.typography.navigation,
          ...(parsed.typography?.navigation || {}),
        },
        footerMenu: {
          ...INITIAL_SITE_SETTINGS.typography.footerMenu,
          ...(parsed.typography?.footerMenu || {}),
        },
      },
      seo: { ...INITIAL_SITE_SETTINGS.seo, ...(parsed.seo || {}) },
      publisher: { ...INITIAL_SITE_SETTINGS.publisher, ...(parsed.publisher || {}) },
      socialMedia: { ...INITIAL_SITE_SETTINGS.socialMedia, ...(parsed.socialMedia || {}) },
      verification: { ...INITIAL_SITE_SETTINGS.verification, ...(parsed.verification || {}) },
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      updatedBy: parsed.updatedBy || 'Administrator',
    };
  } catch (err) {
    console.error('Failed to load site settings from cache:', err);
    return INITIAL_SITE_SETTINGS;
  }
}

function updateLocalCache(settings: SiteSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(
      new CustomEvent(SITE_SETTINGS_UPDATED_EVENT, {
        detail: settings,
      })
    );
    applySiteSettingsToDOM(settings);
  } catch (err) {
    console.error('Failed to save site settings to cache:', err);
  }
}

function initRealtimeSync() {
  if (typeof window === 'undefined' || isSubscribed) return;
  isSubscribed = true;

  firestoreSiteSettingsRepository.subscribe(
    (cloudSettings) => {
      if (cloudSettings) {
        inMemorySiteSettings = cloudSettings;
        updateLocalCache(cloudSettings);
      }
    },
    (err) => {
      console.warn('[siteSettingsStore] Firestore subscription fallback to local cache:', err);
    }
  );
}

initRealtimeSync();

/**
 * Get current Site Settings (SSoT synced with Firestore)
 */
export function getStoredSiteSettings(): SiteSettings {
  if (inMemorySiteSettings) {
    return inMemorySiteSettings;
  }
  return loadLocalCache();
}

/**
 * Force refresh from Firestore
 */
export async function refreshSiteSettingsFromFirestore(): Promise<SiteSettings> {
  try {
    const settings = await firestoreSiteSettingsRepository.getSettings();
    if (settings) {
      inMemorySiteSettings = settings;
      updateLocalCache(settings);
      return settings;
    }
  } catch (err) {
    console.warn('[siteSettingsStore] Failed to fetch settings from Firestore:', err);
  }
  return getStoredSiteSettings();
}

/**
 * Save Site Settings & notify subscribers across the frontend (Writes to Firestore & Cache)
 */
export function saveSiteSettings(
  settings: SiteSettings,
  editorName: string = 'Redaksi BatuTV'
): { success: boolean; data?: SiteSettings; error?: string } {
  try {
    const updated: SiteSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy: editorName,
    };

    inMemorySiteSettings = updated;
    updateLocalCache(updated);

    // Async persist to Firestore
    firestoreSiteSettingsRepository.saveSettings(updated).catch((err) => {
      console.warn('[siteSettingsStore] Firestore async saveSettings error:', err);
    });

    return { success: true, data: updated };
  } catch (err) {
    console.error('Error saving site settings:', err);
    return { success: false, error: 'Gagal menyimpan pengaturan situs.' };
  }
}

/**
 * Reset site settings to initial default
 */
export function resetSiteSettings(): SiteSettings {
  if (typeof window !== 'undefined') {
    inMemorySiteSettings = INITIAL_SITE_SETTINGS;
    localStorage.removeItem(SITE_SETTINGS_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(SITE_SETTINGS_UPDATED_EVENT, {
        detail: INITIAL_SITE_SETTINGS,
      })
    );
    applySiteSettingsToDOM(INITIAL_SITE_SETTINGS);

    // Async persist default to Firestore
    firestoreSiteSettingsRepository.saveSettings(INITIAL_SITE_SETTINGS).catch((err) => {
      console.warn('[siteSettingsStore] Firestore async reset error:', err);
    });
  }
  return INITIAL_SITE_SETTINGS;
}

/**
 * Helper to validate URL or Path
 */
function isValidUrlOrPath(val: string): boolean {
  if (!val) return true;
  const trimmed = val.trim();
  if (trimmed === '') return true;
  if (trimmed.startsWith('/') || trimmed.startsWith('./')) return true;
  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate Site Settings Form
 */
export function validateSiteSettings(settings: SiteSettings): SiteSettingsValidationErrors {
  const errors: SiteSettingsValidationErrors = {};

  // 1. Identity
  const idErrors: Partial<Record<keyof typeof settings.identity, string>> = {};
  if (!settings.identity.siteName.trim()) {
    idErrors.siteName = 'Nama situs wajib diisi.';
  }
  if (!settings.identity.mainDomain.trim()) {
    idErrors.mainDomain = 'Domain utama wajib diisi.';
  } else if (!isValidUrlOrPath(settings.identity.mainDomain)) {
    idErrors.mainDomain = 'Format domain tidak valid (gunakan https://...)';
  }
  if (Object.keys(idErrors).length > 0) errors.identity = idErrors;

  // 2. Publisher
  const pubErrors: Partial<Record<keyof typeof settings.publisher, string>> = {};
  if (!settings.publisher.companyName.trim()) {
    pubErrors.companyName = 'Nama perusahaan wajib diisi.';
  }
  if (
    settings.publisher.editorialEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.publisher.editorialEmail.trim())
  ) {
    pubErrors.editorialEmail = 'Format email redaksi tidak valid.';
  }
  if (
    settings.publisher.businessEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.publisher.businessEmail.trim())
  ) {
    pubErrors.businessEmail = 'Format email bisnis tidak valid.';
  }
  if (Object.keys(pubErrors).length > 0) errors.publisher = pubErrors;

  // 3. Social Media
  const socErrors: Partial<Record<keyof typeof settings.socialMedia, string>> = {};
  for (const [key, val] of Object.entries(settings.socialMedia)) {
    if (val && !isValidUrlOrPath(val as string)) {
      socErrors[key as keyof typeof settings.socialMedia] = `Format tautan ${key} tidak valid.`;
    }
  }
  if (Object.keys(socErrors).length > 0) errors.socialMedia = socErrors;

  return errors;
}

/**
 * Apply Site Settings dynamically to DOM (Title, Favicon, Meta, CSS Variables, Schema)
 */
export function applySiteSettingsToDOM(settings: SiteSettings): void {
  if (typeof document === 'undefined') return;

  try {
    // 1. Document Title
    if (settings.seo.defaultSiteTitle) {
      document.title = settings.seo.defaultSiteTitle;
    }

    // 2. Meta description & keywords
    const setMetaContent = (nameOrProp: string, value: string, isProp = false) => {
      const selector = isProp
        ? `meta[property="${nameOrProp}"]`
        : `meta[name="${nameOrProp}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        if (isProp) {
          meta.setAttribute('property', nameOrProp);
        } else {
          meta.setAttribute('name', nameOrProp);
        }
        document.head.appendChild(meta);
      }
      meta.content = value;
    };

    if (settings.seo.defaultMetaDescription) {
      setMetaContent('description', settings.seo.defaultMetaDescription);
      setMetaContent('og:description', settings.seo.defaultMetaDescription, true);
      setMetaContent('twitter:description', settings.seo.defaultMetaDescription);
    }

    if (settings.seo.defaultSiteTitle) {
      setMetaContent('title', settings.seo.defaultSiteTitle);
      setMetaContent('og:title', settings.seo.defaultSiteTitle, true);
      setMetaContent('twitter:title', settings.seo.defaultSiteTitle);
    }

    if (settings.identity.siteName) {
      setMetaContent('og:site_name', settings.identity.siteName, true);
    }

    if (settings.seo.defaultKeywords) {
      setMetaContent('keywords', settings.seo.defaultKeywords);
    }

    if (settings.seo.defaultOgImage) {
      setMetaContent('og:image', settings.seo.defaultOgImage, true);
      setMetaContent('twitter:image', settings.seo.defaultOgImage);
    }

    if (settings.verification.googleSearchConsole) {
      setMetaContent('google-site-verification', settings.verification.googleSearchConsole);
    }

    // 3. Dynamic Favicon Update
    if (settings.favicon.faviconUrl) {
      let favLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
      if (!favLink) {
        favLink = document.createElement('link');
        favLink.rel = 'icon';
        document.head.appendChild(favLink);
      }
      favLink.href = settings.favicon.faviconUrl;

      let appleFav = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
      if (!appleFav) {
        appleFav = document.createElement('link');
        appleFav.rel = 'apple-touch-icon';
        document.head.appendChild(appleFav);
      }
      appleFav.href = settings.favicon.faviconUrl;
    }

    // 4. Dynamic Theme CSS Variables & Typography
    const root = document.documentElement;
    if (settings.colors) {
      if (settings.colors.primary) {
        root.style.setProperty('--color-brand-primary', settings.colors.primary);
      }
      if (settings.colors.secondary) {
        root.style.setProperty('--color-brand-secondary', settings.colors.secondary);
      }
      if (settings.colors.accent) {
        root.style.setProperty('--color-brand-accent', settings.colors.accent);
      }
      if (settings.colors.background) {
        root.style.setProperty('--color-brand-bg', settings.colors.background);
      }
    }

    if (settings.typography) {
      if (settings.typography.headingFont) {
        root.style.setProperty('--font-heading', `'${settings.typography.headingFont}', sans-serif`);
      }
      if (settings.typography.bodyFont) {
        root.style.setProperty('--font-body', `'${settings.typography.bodyFont}', sans-serif`);
      }
      if (settings.typography.headingWeight) {
        root.style.setProperty('--font-heading-weight', settings.typography.headingWeight);
      }
      if (settings.typography.bodyWeight) {
        root.style.setProperty('--font-body-weight', settings.typography.bodyWeight);
      }
      if (settings.typography.fontSizeScale) {
        const scaleMap: Record<string, string> = {
          compact: '110%',
          normal: '120%',
          spacious: '130%',
        };
        root.style.setProperty('--font-base-scale', scaleMap[settings.typography.fontSizeScale] || '120%');
        root.style.fontSize = scaleMap[settings.typography.fontSizeScale] || '120%';
      }

      // Topic Bar Typography Variables
      if (settings.typography.topicBar) {
        const tb = settings.typography.topicBar;
        root.style.setProperty('--topic-font-size', `${tb.fontSize || 11}px`);
        root.style.setProperty('--topic-font-weight', tb.fontWeight || '400');
        if (tb.fontFamily && tb.fontFamily !== 'inherit') {
          root.style.setProperty('--topic-font-family', `'${tb.fontFamily}', sans-serif`);
        } else {
          root.style.removeProperty('--topic-font-family');
        }
        if (tb.badgeBgColor) {
          root.style.setProperty('--topic-badge-bg', tb.badgeBgColor);
        }
        if (tb.badgeTextColor) {
          root.style.setProperty('--topic-badge-color', tb.badgeTextColor);
        }
      }

      // Navigation Typography Variables
      if (settings.typography.navigation) {
        const nav = settings.typography.navigation;
        root.style.setProperty('--nav-font-size', `${nav.fontSize || 12.5}px`);
        root.style.setProperty('--nav-font-weight', nav.fontWeight || '900');
      }

      // Footer Menu Typography Variables
      if (settings.typography.footerMenu) {
        const ft = settings.typography.footerMenu;
        root.style.setProperty('--footer-menu-font-size', `${ft.fontSize || 13}px`);
        root.style.setProperty('--footer-menu-font-weight', ft.fontWeight || '700');
        if (ft.textColor) {
          root.style.setProperty('--footer-menu-color', ft.textColor);
        }
        if (ft.hoverColor) {
          root.style.setProperty('--footer-menu-hover-color', ft.hoverColor);
        }
      }
    }

    // 5. Dynamic Custom Header Script Injection
    let customHeaderEl = document.getElementById('batutv-custom-header-script') as HTMLElement | null;
    if (settings.verification?.customHeaderScript?.trim()) {
      if (!customHeaderEl) {
        customHeaderEl = document.createElement('div');
        customHeaderEl.id = 'batutv-custom-header-script';
        document.head.appendChild(customHeaderEl);
      }
      customHeaderEl.innerHTML = settings.verification.customHeaderScript;
    } else if (customHeaderEl) {
      customHeaderEl.remove();
    }

    // 6. Dynamic Custom Footer Script Injection
    let customFooterEl = document.getElementById('batutv-custom-footer-script') as HTMLElement | null;
    if (settings.verification?.customFooterScript?.trim()) {
      if (!customFooterEl) {
        customFooterEl = document.createElement('div');
        customFooterEl.id = 'batutv-custom-footer-script';
        document.body.appendChild(customFooterEl);
      }
      customFooterEl.innerHTML = settings.verification.customFooterScript;
    } else if (customFooterEl) {
      customFooterEl.remove();
    }

    // 7. Dynamic Schema.org JSON-LD injection / update
    let schemaScript = document.getElementById('batutv-dynamic-schema') as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'batutv-dynamic-schema';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = generateSiteSchema(settings);
  } catch (e) {
    console.warn('Unable to apply site settings to DOM:', e);
  }
}

/**
 * Generate Schema.org structured data
 */
export function generateSiteSchema(settings: SiteSettings): string {
  const sameAsList: string[] = [];
  if (settings.socialMedia.youtube) sameAsList.push(settings.socialMedia.youtube);
  if (settings.socialMedia.facebook) sameAsList.push(settings.socialMedia.facebook);
  if (settings.socialMedia.instagram) sameAsList.push(settings.socialMedia.instagram);
  if (settings.socialMedia.tiktok) sameAsList.push(settings.socialMedia.tiktok);
  if (settings.socialMedia.twitter) sameAsList.push(settings.socialMedia.twitter);
  if (settings.socialMedia.telegram) sameAsList.push(settings.socialMedia.telegram);
  if (settings.socialMedia.linkedin) sameAsList.push(settings.socialMedia.linkedin);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsMediaOrganization',
        '@id': `${settings.identity.mainDomain}/#organization`,
        name: settings.identity.siteName,
        alternateName: settings.publisher.companyName,
        url: settings.identity.mainDomain,
        logo: {
          '@type': 'ImageObject',
          url: settings.logos.publisherSchema || settings.logos.headerDesktop,
          width: 600,
          height: 60,
        },
        description: settings.identity.siteDescription,
        email: settings.publisher.editorialEmail,
        telephone: settings.publisher.phoneNumber,
        sameAs: sameAsList,
        address: {
          '@type': 'PostalAddress',
          streetAddress: settings.publisher.fullAddress,
          addressLocality: settings.publisher.city,
          addressRegion: settings.publisher.province,
          postalCode: settings.publisher.postalCode,
          addressCountry: 'ID',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${settings.identity.mainDomain}/#website`,
        url: settings.identity.mainDomain,
        name: settings.seo.defaultSiteTitle || settings.identity.siteName,
        description: settings.identity.siteDescription,
        publisher: {
          '@id': `${settings.identity.mainDomain}/#organization`,
        },
        inLanguage: 'id-ID',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${settings.identity.mainDomain}/cari?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return JSON.stringify(schema, null, 2);
}
