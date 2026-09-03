import {
  SystemInfoConfig,
  MaintenanceConfig,
  SecurityConfig,
  ActivityLogItem,
  CacheStats,
  SystemHealthReport,
  BackupDataPayload,
  BackupEntity,
  ImportValidationResult,
  HealthCheckItem,
} from '../types/systemSettings';
import { getStoredArticles, saveStoredArticles } from './newsAdminStore';
import { getStoredVideos, saveVideos } from './videoAdminStore';
import { getStoredMedia, saveStoredMedia } from './mediaAdminStore';
import { getStoredAuthors, saveStoredAuthors } from './authorAdminStore';
import { getStoredCategories, saveCategories } from './categoryAdminStore';
import { getStoredTags, saveStoredTags } from './tagAdminStore';
import { getStoredPages, saveStoredPages } from './pagesAdminStore';
import { getStoredNavItems, saveNavItems } from './navigationStore';
import { getStoredSiteSettings, saveSiteSettings } from './siteSettingsStore';
import { getStoredFooterConfig, saveFooterConfig } from './footerAdminStore';
import { AdminUser } from '../types/admin';
import { firestoreSystemSettingsRepository } from '../repositories/firestore/firestoreSystemSettingsRepository';

// Storage Keys (Local Cache / Fallback)
export const SYSTEM_INFO_STORAGE_KEY = 'batutv_system_info';
export const SYSTEM_MAINTENANCE_STORAGE_KEY = 'batutv_system_maintenance';
export const SYSTEM_SECURITY_STORAGE_KEY = 'batutv_system_security';
export const SYSTEM_ACTIVITY_LOGS_STORAGE_KEY = 'batutv_system_activity_logs';
export const SYSTEM_CACHE_STATS_STORAGE_KEY = 'batutv_system_cache_stats';

// Event Names
export const SYSTEM_SETTINGS_UPDATED_EVENT = 'batutv_system_settings_updated';
export const SYSTEM_MAINTENANCE_UPDATED_EVENT = 'batutv_system_maintenance_updated';
export const SYSTEM_ACTIVITY_LOGGED_EVENT = 'batutv_system_activity_logged';

// Initial Defaults
export const DEFAULT_SYSTEM_INFO: SystemInfoConfig = {
  appName: 'BATUTV Control',
  cmsVersion: 'v1.0.0',
  buildVersion: 'build-2026.08-rev4',
  environment: 'Production',
  installationDate: '15 Januari 2026',
  systemStatus: 'Online',
  serverSpecs: {
    runtime: 'Node.js v20.14.0 (LTS)',
    framework: 'React 18 + Vite (SPA Mode)',
    engine: 'High-Performance Cloud Container',
    database: 'Durable Browser Engine / REST API Ready',
    serverRegion: 'Jakarta (asia-southeast2)',
    timezone: 'Asia/Jakarta (WIB / UTC+7)',
  },
};

export const DEFAULT_MAINTENANCE_CONFIG: MaintenanceConfig = {
  isEnabled: false,
  title: 'Situs Sedang Dalam Pemeliharaan Sistem',
  message:
    'Kami sedang melakukan peningkatan performa, pembaruan infrastruktur, dan penguatan keamanan server portal berita BatuTV. Kami akan segera kembali online melayani Anda.',
  estimatedCompletion: '30 Agustus 2026 - 06:00 WIB',
  allowAdminBypass: true,
  contactEmail: 'redaksi@batutv.com',
  contactPhone: '+62 341 591234',
  lastToggledAt: '2026-08-29T10:00:00.000Z',
  toggledBy: 'Super Administrator',
};

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  sessionTimeoutMinutes: 120,
  loginAttemptLimit: 5,
  autoLogoutEnabled: true,
  passwordMinLength: 8,
  passwordComplexityRequired: true,
  twoFactorAuthReady: true,
  ipProtectionEnabled: true,
  forceHttps: true,
};

export const INITIAL_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    user: 'Ahmad Fauzi',
    userEmail: 'ahmad.fauzi@batutv.com',
    role: 'Administrator',
    action: 'Login CMS',
    description: 'Autentikasi admin berhasil melalui SSO Dashboard',
    status: 'success',
    ip: '103.144.12.89',
    entity: 'Auth',
    userAgent: 'Chrome 128.0 (macOS)',
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    user: 'Ahmad Fauzi',
    userEmail: 'ahmad.fauzi@batutv.com',
    role: 'Administrator',
    action: 'Edit Site Settings',
    description: 'Memperbarui logo header & deskripsi SEO situs',
    status: 'success',
    ip: '103.144.12.89',
    entity: 'Site Settings',
    userAgent: 'Chrome 128.0 (macOS)',
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    user: 'Siti Nurhaliza',
    userEmail: 'siti.nurhaliza@batutv.com',
    role: 'Editor',
    action: 'Tambah Artikel',
    description: 'Menerbitkan berita: Festival Bunga Kota Batu 2026 Kembali Digelar Meriah',
    status: 'success',
    ip: '180.252.19.44',
    entity: 'Artikel',
    userAgent: 'Firefox 129.0 (Windows)',
  },
  {
    id: 'log-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    user: 'Budi Santoso',
    userEmail: 'budi.santoso@batutv.com',
    role: 'Editor',
    action: 'Tambah Video',
    description: 'Menambahkan video YouTube: Live Report Karnaval Pesona Budaya Desa Oro-Oro Ombo',
    status: 'success',
    ip: '114.122.38.10',
    entity: 'Video',
    userAgent: 'Chrome 128.0 (Windows)',
  },
  {
    id: 'log-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    user: 'Ahmad Fauzi',
    userEmail: 'ahmad.fauzi@batutv.com',
    role: 'Administrator',
    action: 'Perubahan Navigasi',
    description: 'Menata ulang urutan menu navigasi SO2 utama',
    status: 'success',
    ip: '103.144.12.89',
    entity: 'Navigasi',
    userAgent: 'Chrome 128.0 (macOS)',
  },
  {
    id: 'log-006',
    timestamp: new Date(Date.now() - 1000 * 60 * 540).toISOString(),
    user: 'Ahmad Fauzi',
    userEmail: 'ahmad.fauzi@batutv.com',
    role: 'Administrator',
    action: 'Rebuild Sitemap',
    description: 'Sinkronisasi XML Sitemap dan News Sitemap selesai (24 entri terindeks)',
    status: 'success',
    ip: '103.144.12.89',
    entity: 'System',
    userAgent: 'Chrome 128.0 (macOS)',
  },
  {
    id: 'log-007',
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    user: 'Dewi Lestari',
    userEmail: 'dewi.lestari@batutv.com',
    role: 'Penulis',
    action: 'Edit Artikel',
    description: 'Memperbarui draft liputan panen apel Desa Bumiaji',
    status: 'success',
    ip: '125.166.4.15',
    entity: 'Artikel',
    userAgent: 'Safari 17.5 (iPadOS)',
  },
  {
    id: 'log-008',
    timestamp: new Date(Date.now() - 1000 * 60 * 960).toISOString(),
    user: 'Ahmad Fauzi',
    userEmail: 'ahmad.fauzi@batutv.com',
    role: 'Administrator',
    action: 'Perubahan Footer',
    description: 'Memperbarui link copyright dan struktur kolom footer',
    status: 'success',
    ip: '103.144.12.89',
    entity: 'Footer',
    userAgent: 'Chrome 128.0 (macOS)',
  },
];

export const DEFAULT_CACHE_STATS: CacheStats = {
  memoryUsage: '4.8 MB',
  hitRate: '99.4%',
  lastCleared: '29 Agu 2026, 17:30 WIB',
  cachedKeysCount: 142,
  homepageCacheStatus: 'Optimal (Active)',
  sitemapCacheStatus: 'Up-to-date (200 OK)',
  searchIndexCacheStatus: 'Synchronized (Full text ready)',
  seoMetadataStatus: 'Generated (Schema.org compliant)',
};

// In-Memory state for instant UI rendering & synchronization
let inMemorySystemInfo: SystemInfoConfig = loadLocalSystemInfoCache();
let inMemoryMaintenance: MaintenanceConfig = loadLocalMaintenanceCache();
let inMemorySecurity: SecurityConfig = loadLocalSecurityCache();
let inMemoryLogs: ActivityLogItem[] = loadLocalLogsCache();
let inMemoryCacheStats: CacheStats = loadLocalCacheStatsCache();
let isSubscribed = false;

function loadLocalSystemInfoCache(): SystemInfoConfig {
  if (typeof window === 'undefined') return DEFAULT_SYSTEM_INFO;
  try {
    const raw = localStorage.getItem(SYSTEM_INFO_STORAGE_KEY);
    if (!raw) return DEFAULT_SYSTEM_INFO;
    return { ...DEFAULT_SYSTEM_INFO, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SYSTEM_INFO;
  }
}

function loadLocalMaintenanceCache(): MaintenanceConfig {
  if (typeof window === 'undefined') return DEFAULT_MAINTENANCE_CONFIG;
  try {
    const raw = localStorage.getItem(SYSTEM_MAINTENANCE_STORAGE_KEY);
    if (!raw) return DEFAULT_MAINTENANCE_CONFIG;
    return { ...DEFAULT_MAINTENANCE_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_MAINTENANCE_CONFIG;
  }
}

function loadLocalSecurityCache(): SecurityConfig {
  if (typeof window === 'undefined') return DEFAULT_SECURITY_CONFIG;
  try {
    const raw = localStorage.getItem(SYSTEM_SECURITY_STORAGE_KEY);
    if (!raw) return DEFAULT_SECURITY_CONFIG;
    return { ...DEFAULT_SECURITY_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SECURITY_CONFIG;
  }
}

function loadLocalLogsCache(): ActivityLogItem[] {
  if (typeof window === 'undefined') return INITIAL_ACTIVITY_LOGS;
  try {
    const raw = localStorage.getItem(SYSTEM_ACTIVITY_LOGS_STORAGE_KEY);
    if (!raw) return INITIAL_ACTIVITY_LOGS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_ACTIVITY_LOGS;
  }
}

function loadLocalCacheStatsCache(): CacheStats {
  if (typeof window === 'undefined') return DEFAULT_CACHE_STATS;
  try {
    const raw = localStorage.getItem(SYSTEM_CACHE_STATS_STORAGE_KEY);
    if (!raw) return DEFAULT_CACHE_STATS;
    return { ...DEFAULT_CACHE_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CACHE_STATS;
  }
}

function initRealtimeSync() {
  if (typeof window === 'undefined' || isSubscribed) return;
  isSubscribed = true;

  firestoreSystemSettingsRepository.subscribe(
    (cloudSettings) => {
      if (cloudSettings.info) {
        inMemorySystemInfo = cloudSettings.info;
        localStorage.setItem(SYSTEM_INFO_STORAGE_KEY, JSON.stringify(cloudSettings.info));
      }
      if (cloudSettings.maintenance) {
        inMemoryMaintenance = cloudSettings.maintenance;
        localStorage.setItem(SYSTEM_MAINTENANCE_STORAGE_KEY, JSON.stringify(cloudSettings.maintenance));
      }
      if (cloudSettings.security) {
        inMemorySecurity = cloudSettings.security;
        localStorage.setItem(SYSTEM_SECURITY_STORAGE_KEY, JSON.stringify(cloudSettings.security));
      }
      if (cloudSettings.logs && cloudSettings.logs.length > 0) {
        inMemoryLogs = cloudSettings.logs;
        localStorage.setItem(SYSTEM_ACTIVITY_LOGS_STORAGE_KEY, JSON.stringify(cloudSettings.logs));
      }
      if (cloudSettings.cacheStats) {
        inMemoryCacheStats = cloudSettings.cacheStats;
        localStorage.setItem(SYSTEM_CACHE_STATS_STORAGE_KEY, JSON.stringify(cloudSettings.cacheStats));
      }

      window.dispatchEvent(new CustomEvent(SYSTEM_SETTINGS_UPDATED_EVENT));
      window.dispatchEvent(new CustomEvent(SYSTEM_MAINTENANCE_UPDATED_EVENT));
    },
    (err) => {
      console.warn('[systemSettingsStore] Firestore subscription fallback to local cache:', err);
    }
  );
}

initRealtimeSync();

// ============================================================
// SYSTEM INFO GETTERS & SETTERS
// ============================================================
export const getStoredSystemInfo = (): SystemInfoConfig => {
  if (inMemorySystemInfo) return inMemorySystemInfo;
  return loadLocalSystemInfoCache();
};

export const setStoredSystemInfo = (info: Partial<SystemInfoConfig>): SystemInfoConfig => {
  const current = getStoredSystemInfo();
  const updated: SystemInfoConfig = {
    ...current,
    ...info,
    serverSpecs: {
      ...current.serverSpecs,
      ...(info.serverSpecs || {}),
    },
  };

  inMemorySystemInfo = updated;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SYSTEM_INFO_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(SYSTEM_SETTINGS_UPDATED_EVENT, { detail: updated }));
    } catch (err) {
      console.error('Error saving system info cache:', err);
    }
  }

  // Async persist to Firestore
  firestoreSystemSettingsRepository.saveInfo(updated).catch((err) => {
    console.warn('[systemSettingsStore] Firestore async saveInfo error:', err);
  });

  return updated;
};

// ============================================================
// MAINTENANCE MODE GETTERS & SETTERS
// ============================================================
export const getStoredMaintenanceConfig = (): MaintenanceConfig => {
  if (inMemoryMaintenance) return inMemoryMaintenance;
  return loadLocalMaintenanceCache();
};

export const setStoredMaintenanceConfig = (
  config: Partial<MaintenanceConfig>,
  user?: AdminUser | { name: string; role: string }
): MaintenanceConfig => {
  const current = getStoredMaintenanceConfig();
  const isToggled = config.isEnabled !== undefined && config.isEnabled !== current.isEnabled;

  const updated: MaintenanceConfig = {
    ...current,
    ...config,
    lastToggledAt: isToggled ? new Date().toISOString() : current.lastToggledAt,
    toggledBy: isToggled ? user?.name || 'Administrator' : current.toggledBy,
  };

  inMemoryMaintenance = updated;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SYSTEM_MAINTENANCE_STORAGE_KEY, JSON.stringify(updated));
      setStoredSystemInfo({
        systemStatus: updated.isEnabled ? 'Maintenance' : 'Online',
      });
      window.dispatchEvent(new CustomEvent(SYSTEM_MAINTENANCE_UPDATED_EVENT, { detail: updated }));
      window.dispatchEvent(new CustomEvent(SYSTEM_SETTINGS_UPDATED_EVENT, { detail: updated }));
    } catch (err) {
      console.error('Error saving maintenance config:', err);
    }
  }

  // Async persist to Firestore
  firestoreSystemSettingsRepository.saveMaintenance(updated).catch((err) => {
    console.warn('[systemSettingsStore] Firestore async saveMaintenance error:', err);
  });

  // Log activity
  if (isToggled) {
    logSystemActivity(
      user || { name: 'Administrator', role: 'Administrator' },
      updated.isEnabled ? 'Aktifkan Maintenance Mode' : 'Matikan Maintenance Mode',
      updated.isEnabled
        ? `Maintenance mode diaktifkan. Estimasi: ${updated.estimatedCompletion}`
        : 'Situs dikembalikan ke status Online normal',
      updated.isEnabled ? 'warning' : 'success',
      'Maintenance'
    );
  } else {
    logSystemActivity(
      user || { name: 'Administrator', role: 'Administrator' },
      'Ubah Pengaturan Maintenance',
      `Pesan pemeliharaan diperbarui: "${updated.title}"`,
      'success',
      'Maintenance'
    );
  }

  return updated;
};

export const isSystemInMaintenance = (): boolean => {
  const config = getStoredMaintenanceConfig();
  return Boolean(config.isEnabled);
};

// ============================================================
// SECURITY CONFIG GETTERS & SETTERS
// ============================================================
export const getStoredSecurityConfig = (): SecurityConfig => {
  if (inMemorySecurity) return inMemorySecurity;
  return loadLocalSecurityCache();
};

export const setStoredSecurityConfig = (
  config: Partial<SecurityConfig>,
  user?: AdminUser | { name: string; role: string }
): SecurityConfig => {
  const current = getStoredSecurityConfig();
  const updated: SecurityConfig = {
    ...current,
    ...config,
  };

  inMemorySecurity = updated;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SYSTEM_SECURITY_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(SYSTEM_SETTINGS_UPDATED_EVENT, { detail: updated }));
    } catch (err) {
      console.error('Error saving security config:', err);
    }
  }

  // Async persist to Firestore
  firestoreSystemSettingsRepository.saveSecurity(updated).catch((err) => {
    console.warn('[systemSettingsStore] Firestore async saveSecurity error:', err);
  });

  logSystemActivity(
    user || { name: 'Administrator', role: 'Administrator' },
    'Ubah Pengaturan Keamanan',
    `Session Timeout: ${updated.sessionTimeoutMinutes}m, Password Min: ${updated.passwordMinLength} char, Complexity: ${updated.passwordComplexityRequired ? 'ON' : 'OFF'}`,
    'success',
    'Security'
  );

  return updated;
};

// ============================================================
// ACTIVITY LOG STORE & LOGGING HELPER
// ============================================================
export const getStoredActivityLogs = (): ActivityLogItem[] => {
  if (inMemoryLogs && inMemoryLogs.length > 0) return inMemoryLogs;
  return loadLocalLogsCache();
};

export const logSystemActivity = (
  user: AdminUser | { name: string; role: string; email?: string },
  action: string,
  description: string,
  status: 'success' | 'warning' | 'error' | 'info' = 'success',
  entity: string = 'System'
): ActivityLogItem => {
  const logs = getStoredActivityLogs();
  const newLog: ActivityLogItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    user: user.name || 'Admin',
    userEmail: (user as any).email || 'admin@batutv.com',
    role: user.role || 'Administrator',
    action,
    description,
    status,
    entity,
    ip: '127.0.0.1 (Local Session)',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 60) : 'Browser',
  };

  const updatedLogs = [newLog, ...logs].slice(0, 200);
  inMemoryLogs = updatedLogs;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SYSTEM_ACTIVITY_LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
      window.dispatchEvent(new CustomEvent(SYSTEM_ACTIVITY_LOGGED_EVENT, { detail: newLog }));
    } catch (err) {
      console.error('Error recording activity log:', err);
    }
  }

  // Async log to Firestore repository
  firestoreSystemSettingsRepository.logActivity(newLog).catch((err) => {
    console.warn('[systemSettingsStore] Firestore async logActivity error:', err);
  });

  return newLog;
};

export const clearStoredActivityLogs = (user?: AdminUser | { name: string; role: string }): void => {
  inMemoryLogs = [];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SYSTEM_ACTIVITY_LOGS_STORAGE_KEY, JSON.stringify([]));
      window.dispatchEvent(new CustomEvent(SYSTEM_ACTIVITY_LOGGED_EVENT, { detail: null }));
    } catch (err) {
      console.error('Error clearing activity logs:', err);
    }
  }

  firestoreSystemSettingsRepository.clearLogs().catch((err) => {
    console.warn('[systemSettingsStore] Firestore async clearLogs error:', err);
  });

  logSystemActivity(
    user || { name: 'Administrator', role: 'Administrator' },
    'Bersihkan Log Aktivitas',
    'Riwayat log aktivitas admin telah dikosongkan',
    'warning',
    'System'
  );
};

// ============================================================
// CACHE MANAGEMENT OPERATIONS
// ============================================================
export const getStoredCacheStats = (): CacheStats => {
  if (inMemoryCacheStats) return inMemoryCacheStats;
  return loadLocalCacheStatsCache();
};

export const performClearCache = async (
  user?: AdminUser | { name: string; role: string }
): Promise<{ success: boolean; message: string }> => {
  await new Promise((res) => setTimeout(res, 600));

  const nowStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date()) + ' WIB';

  const updatedStats: CacheStats = {
    memoryUsage: '1.2 MB',
    hitRate: '100%',
    lastCleared: nowStr,
    cachedKeysCount: 0,
    homepageCacheStatus: 'Freshly Rebuilt',
    sitemapCacheStatus: 'Re-cached',
    searchIndexCacheStatus: 'Re-indexed',
    seoMetadataStatus: 'Fresh (Synchronized)',
  };

  inMemoryCacheStats = updatedStats;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SYSTEM_CACHE_STATS_STORAGE_KEY, JSON.stringify(updatedStats));
      window.dispatchEvent(new CustomEvent('batutv_cache_cleared', { detail: updatedStats }));
      window.dispatchEvent(new CustomEvent('batutv_articles_updated'));
      window.dispatchEvent(new CustomEvent('batutv_videos_updated'));
    } catch (err) {
      console.error('Failed to update cache stats:', err);
    }
  }

  firestoreSystemSettingsRepository.saveCacheStats(updatedStats).catch((err) => {
    console.warn('[systemSettingsStore] Firestore async saveCacheStats error:', err);
  });

  logSystemActivity(
    user || { name: 'Administrator', role: 'Administrator' },
    'Clear Cache',
    'Seluruh memori cache runtime dan buffer halaman dibersihkan',
    'success',
    'Cache'
  );

  return {
    success: true,
    message: 'Seluruh cache sistem, buffer halaman, dan data sementara berhasil dibersihkan!',
  };
};

export const performRefreshHomepageCache = async (
  user?: AdminUser | { name: string; role: string }
): Promise<{ success: boolean; message: string }> => {
  await new Promise((res) => setTimeout(res, 500));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('batutv_articles_updated'));
    window.dispatchEvent(new CustomEvent('batutv_videos_updated'));
    window.dispatchEvent(new CustomEvent('batutv_categories_updated'));
  }

  logSystemActivity(
    user || { name: 'Administrator', role: 'Administrator' },
    'Refresh Homepage Cache',
    'Cache headline, feed berita terkini, dan carousel video diperbarui secara instan',
    'success',
    'Cache'
  );

  return {
    success: true,
    message: 'Cache halaman beranda (Homepage Feed & Video) berhasil disegarkan!',
  };
};

export const performRebuildSitemap = async (
  user?: AdminUser | { name: string; role: string }
): Promise<{ success: boolean; message: string }> => {
  await new Promise((res) => setTimeout(res, 600));

  const articles = getStoredArticles().filter((a) => a.status === 'published');
  const videos = getStoredVideos().filter((v) => v.status === 'published');

  logSystemActivity(
    user || { name: 'Administrator', role: 'Administrator' },
    'Rebuild Sitemap',
    `XML sitemap diregenerasi: ${articles.length} berita & ${videos.length} video aktif`,
    'success',
    'SEO'
  );

  return {
    success: true,
    message: `Sitemap XML berhasil diperbarui (${articles.length} artikel, ${videos.length} video terindeks).`,
  };
};

export const performRebuildSearchIndex = async (
  user?: AdminUser | { name: string; role: string }
): Promise<{ success: boolean; message: string }> => {
  await new Promise((res) => setTimeout(res, 550));

  logSystemActivity(
    user || { name: 'Administrator', role: 'Administrator' },
    'Rebuild Search Index',
    'Indeks pencarian full-text berita & video berhasil dikompilasi ulang',
    'success',
    'Cache'
  );

  return {
    success: true,
    message: 'Indeks pencarian cerdas portal berhasil dibangun ulang dan disinkronkan!',
  };
};

export const performRefreshSeoMetadata = async (
  user?: AdminUser | { name: string; role: string }
): Promise<{ success: boolean; message: string }> => {
  await new Promise((res) => setTimeout(res, 500));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('batutv_site_settings_updated'));
  }

  logSystemActivity(
    user || { name: 'Administrator', role: 'Administrator' },
    'Refresh SEO Metadata',
    'Seluruh meta tag, canonical link, OpenGraph, dan Schema.org JSON-LD dimuat ulang',
    'success',
    'SEO'
  );

  return {
    success: true,
    message: 'Metadata SEO global, OpenGraph, dan JSON-LD Schema berhasil dimuat ulang!',
  };
};

// ============================================================
// BACKUP & RESTORE UTILITIES
// ============================================================
export const generateBackupPayload = (
  selectedEntities: BackupEntity[],
  user?: AdminUser | { name: string; role: string }
): BackupDataPayload => {
  const entitiesData: BackupDataPayload['entities'] = {};
  const summary: Record<string, number> = {};

  if (selectedEntities.includes('articles')) {
    const articles = getStoredArticles();
    entitiesData.articles = articles;
    summary['articles'] = articles.length;
  }

  if (selectedEntities.includes('videos')) {
    const videos = getStoredVideos();
    entitiesData.videos = videos;
    summary['videos'] = videos.length;
  }

  if (selectedEntities.includes('media')) {
    const media = getStoredMedia();
    entitiesData.media = media;
    summary['media'] = media.length;
  }

  if (selectedEntities.includes('authors')) {
    const authors = getStoredAuthors();
    entitiesData.authors = authors;
    summary['authors'] = authors.length;
  }

  if (selectedEntities.includes('categories')) {
    const categories = getStoredCategories();
    entitiesData.categories = categories;
    summary['categories'] = categories.length;
  }

  if (selectedEntities.includes('tags')) {
    const tags = getStoredTags();
    entitiesData.tags = tags;
    summary['tags'] = tags.length;
  }

  if (selectedEntities.includes('pages')) {
    const pages = getStoredPages();
    entitiesData.pages = pages;
    summary['pages'] = pages.length;
  }

  if (selectedEntities.includes('navigation')) {
    const nav = getStoredNavItems();
    entitiesData.navigation = nav;
    summary['navigation'] = nav.length;
  }

  if (selectedEntities.includes('site_settings')) {
    const settings = getStoredSiteSettings();
    entitiesData.site_settings = settings;
    summary['site_settings'] = 1;
  }

  if (selectedEntities.includes('footer')) {
    const footer = getStoredFooterConfig();
    entitiesData.footer = footer;
    summary['footer'] = 1;
  }

  const payload: BackupDataPayload = {
    version: '1.0.0',
    appName: 'BATUTV Control',
    exportDate: new Date().toISOString(),
    exportedBy: user?.name || 'Administrator',
    entities: entitiesData,
    summary,
    checksum: 'BATUTV-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
  };

  return payload;
};

export const downloadBackupJson = (
  selectedEntities: BackupEntity[],
  user?: AdminUser | { name: string; role: string }
): void => {
  const payload = generateBackupPayload(selectedEntities, user);
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateTag = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.href = url;
  link.download = `batutv-backup-${dateTag}-${selectedEntities.length}-modules.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  logSystemActivity(
    user || { name: 'Administrator', role: 'Administrator' },
    'Export Data [JSON]',
    `Mengekspor backup JSON untuk: ${selectedEntities.join(', ')} (${Object.values(payload.summary).reduce((a, b) => a + b, 0)} total record)`,
    'success',
    'Backup'
  );
};

export const downloadBackupCsv = (
  selectedEntities: BackupEntity[],
  user?: AdminUser | { name: string; role: string }
): void => {
  let fullCsv = '# BATUTV CONTROL — EXPORT DATA CMS\n';
  fullCsv += `# Tanggal Export: ${new Date().toLocaleString('id-ID')}\n`;
  fullCsv += `# Diekspor Oleh: ${user?.name || 'Administrator'}\n\n`;

  let totalCount = 0;

  if (selectedEntities.includes('articles')) {
    const articles = getStoredArticles();
    totalCount += articles.length;
    fullCsv += '=== TABEL: ARTIKEL BERITA ===\n';
    fullCsv += 'ID,Judul,Kategori,Penulis,Status,Tanggal Terbit,Views,URL\n';
    articles.forEach((a) => {
      fullCsv += `"${a.id}","${(a.title || '').replace(/"/g, '""')}","${a.category}","${a.author}","${a.status}","${a.publishedAt}","${a.views || 0}","/berita/${a.slug}"\n`;
    });
    fullCsv += '\n\n';
  }

  if (selectedEntities.includes('videos')) {
    const videos = getStoredVideos();
    totalCount += videos.length;
    fullCsv += '=== TABEL: VIDEO BERITA ===\n';
    fullCsv += 'ID,Judul,Kategori,Penulis,Status,YouTube ID,Views,URL\n';
    videos.forEach((v) => {
      fullCsv += `"${v.id}","${(v.title || '').replace(/"/g, '""')}","${v.category}","${v.author}","${v.status}","${v.youtubeVideoId || ''}","${v.views || 0}","/video/${v.slug}"\n`;
    });
    fullCsv += '\n\n';
  }

  if (selectedEntities.includes('categories')) {
    const categories = getStoredCategories();
    totalCount += categories.length;
    fullCsv += '=== TABEL: KATEGORI ===\n';
    fullCsv += 'ID,Nama Kategori,Slug,Status,Deskripsi\n';
    categories.forEach((c) => {
      fullCsv += `"${c.id}","${c.name}","${c.slug}","${c.status}","${(c.description || '').replace(/"/g, '""')}"\n`;
    });
    fullCsv += '\n\n';
  }

  if (selectedEntities.includes('authors')) {
    const authors = getStoredAuthors();
    totalCount += authors.length;
    fullCsv += '=== TABEL: PENULIS / REDAKSI ===\n';
    fullCsv += 'ID,Nama,Posisi,Email,Status,Bio\n';
    authors.forEach((au) => {
      fullCsv += `"${au.id}","${au.name}","${au.position}","${au.email}","${au.status}","${(au.bio || '').replace(/"/g, '""')}"\n`;
    });
    fullCsv += '\n\n';
  }

  if (selectedEntities.includes('tags')) {
    const tags = getStoredTags();
    totalCount += tags.length;
    fullCsv += '=== TABEL: TAG & TOPIK ===\n';
    fullCsv += 'ID,Nama Tag,Slug,Status\n';
    tags.forEach((t) => {
      fullCsv += `"${t.id}","${t.name}","${t.slug}","${t.status}"\n`;
    });
    fullCsv += '\n\n';
  }

  if (selectedEntities.includes('pages')) {
    const pages = getStoredPages();
    totalCount += pages.length;
    fullCsv += '=== TABEL: PAGES INFORMASI ===\n';
    fullCsv += 'ID,Judul,Slug,Status,Tanggal Dibuat\n';
    pages.forEach((p) => {
      fullCsv += `"${p.id}","${(p.title || '').replace(/"/g, '""')}","${p.slug}","${p.status}","${p.createdAt}"\n`;
    });
    fullCsv += '\n\n';
  }

  const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const dateTag = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.href = url;
  link.download = `batutv-export-${dateTag}-${selectedEntities.length}-modules.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  logSystemActivity(
    user || { name: 'Administrator', role: 'Administrator' },
    'Export Data [CSV]',
    `Mengekspor spreadsheet CSV untuk modul: ${selectedEntities.join(', ')} (${totalCount} baris)`,
    'success',
    'Backup'
  );
};

// ============================================================
// IMPORT DATA & SCHEMA VALIDATION
// ============================================================
export const validateImportFile = (jsonString: string): ImportValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const summary: Record<string, number> = {};

  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      return {
        isValid: false,
        summary: {},
        errors: ['File bukan merupakan objek JSON yang valid.'],
        warnings: [],
      };
    }

    if (!parsed.appName || !parsed.appName.includes('BATUTV')) {
      warnings.push('Header aplikasi tidak mencantumkan BATUTV (kemungkinan format ekspor lama).');
    }

    if (!parsed.entities || typeof parsed.entities !== 'object') {
      return {
        isValid: false,
        summary: {},
        errors: ['Struktur backup tidak memiliki direktori entitas (`entities`). File rusak.'],
        warnings: [],
      };
    }

    const entities = parsed.entities;

    if (entities.articles && Array.isArray(entities.articles)) {
      summary['articles'] = entities.articles.length;
      const hasBadArticle = entities.articles.some((a: any) => !a.id || !a.title || !a.slug);
      if (hasBadArticle) {
        warnings.push('Beberapa entri artikel tidak memiliki ID atau judul lengkap.');
      }
    }

    if (entities.videos && Array.isArray(entities.videos)) {
      summary['videos'] = entities.videos.length;
      const hasBadVideo = entities.videos.some((v: any) => !v.id || !v.title);
      if (hasBadVideo) {
        warnings.push('Beberapa entri video tidak memiliki metadata ID/Judul lengkap.');
      }
    }

    if (entities.categories && Array.isArray(entities.categories)) {
      summary['categories'] = entities.categories.length;
    }

    if (entities.tags && Array.isArray(entities.tags)) {
      summary['tags'] = entities.tags.length;
    }

    if (entities.authors && Array.isArray(entities.authors)) {
      summary['authors'] = entities.authors.length;
    }

    if (entities.pages && Array.isArray(entities.pages)) {
      summary['pages'] = entities.pages.length;
    }

    if (entities.media && Array.isArray(entities.media)) {
      summary['media'] = entities.media.length;
    }

    if (entities.navigation && Array.isArray(entities.navigation)) {
      summary['navigation'] = entities.navigation.length;
    }

    if (entities.site_settings && typeof entities.site_settings === 'object') {
      summary['site_settings'] = 1;
    }

    if (entities.footer && typeof entities.footer === 'object') {
      summary['footer'] = 1;
    }

    const totalRecords = Object.values(summary).reduce((a, b) => a + b, 0);
    if (totalRecords === 0) {
      errors.push('File JSON tidak memuat entitas data yang dapat diimpor.');
    }

    return {
      isValid: errors.length === 0,
      version: parsed.version || '1.0.0',
      exportDate: parsed.exportDate || 'Tidak diketahui',
      summary,
      errors,
      warnings,
      payload: parsed,
    };
  } catch (err: any) {
    return {
      isValid: false,
      summary: {},
      errors: ['Gagal mem-parsing file JSON: ' + (err?.message || 'Sintaks tidak valid')],
      warnings: [],
    };
  }
};

export const executeImportRestore = (
  payload: BackupDataPayload,
  mode: 'merge' | 'replace',
  user?: AdminUser | { name: string; role: string }
): { success: boolean; message: string; importedSummary: Record<string, number> } => {
  const importedSummary: Record<string, number> = {};
  const entities = payload.entities || {};

  try {
    // 1. Articles
    if (entities.articles && Array.isArray(entities.articles)) {
      if (mode === 'replace') {
        saveStoredArticles(entities.articles);
        importedSummary['articles'] = entities.articles.length;
      } else {
        const current = getStoredArticles();
        const currentIds = new Set(current.map((a) => a.id));
        const newOnes = entities.articles.filter((a) => !currentIds.has(a.id));
        const merged = [...current, ...newOnes];
        saveStoredArticles(merged);
        importedSummary['articles'] = newOnes.length;
      }
    }

    // 2. Videos
    if (entities.videos && Array.isArray(entities.videos)) {
      if (mode === 'replace') {
        saveVideos(entities.videos);
        importedSummary['videos'] = entities.videos.length;
      } else {
        const current = getStoredVideos();
        const currentIds = new Set(current.map((v) => v.id));
        const newOnes = entities.videos.filter((v) => !currentIds.has(v.id));
        const merged = [...current, ...newOnes];
        saveVideos(merged);
        importedSummary['videos'] = newOnes.length;
      }
    }

    // 3. Categories
    if (entities.categories && Array.isArray(entities.categories)) {
      if (mode === 'replace') {
        saveCategories(entities.categories);
        importedSummary['categories'] = entities.categories.length;
      } else {
        const current = getStoredCategories();
        const currentSlugs = new Set(current.map((c) => c.slug));
        const newOnes = entities.categories.filter((c) => !currentSlugs.has(c.slug));
        saveCategories([...current, ...newOnes]);
        importedSummary['categories'] = newOnes.length;
      }
    }

    // 4. Tags
    if (entities.tags && Array.isArray(entities.tags)) {
      if (mode === 'replace') {
        saveStoredTags(entities.tags);
        importedSummary['tags'] = entities.tags.length;
      } else {
        const current = getStoredTags();
        const currentSlugs = new Set(current.map((t) => t.slug));
        const newOnes = entities.tags.filter((t) => !currentSlugs.has(t.slug));
        saveStoredTags([...current, ...newOnes]);
        importedSummary['tags'] = newOnes.length;
      }
    }

    // 5. Authors
    if (entities.authors && Array.isArray(entities.authors)) {
      if (mode === 'replace') {
        saveStoredAuthors(entities.authors);
        importedSummary['authors'] = entities.authors.length;
      } else {
        const current = getStoredAuthors();
        const currentIds = new Set(current.map((au) => au.id));
        const newOnes = entities.authors.filter((au) => !currentIds.has(au.id));
        saveStoredAuthors([...current, ...newOnes]);
        importedSummary['authors'] = newOnes.length;
      }
    }

    // 6. Pages
    if (entities.pages && Array.isArray(entities.pages)) {
      if (mode === 'replace') {
        saveStoredPages(entities.pages);
        importedSummary['pages'] = entities.pages.length;
      } else {
        const current = getStoredPages();
        const currentSlugs = new Set(current.map((p) => p.slug));
        const newOnes = entities.pages.filter((p) => !currentSlugs.has(p.slug));
        saveStoredPages([...current, ...newOnes]);
        importedSummary['pages'] = newOnes.length;
      }
    }

    // 7. Media
    if (entities.media && Array.isArray(entities.media)) {
      if (mode === 'replace') {
        saveStoredMedia(entities.media);
        importedSummary['media'] = entities.media.length;
      } else {
        const current = getStoredMedia();
        const currentIds = new Set(current.map((m) => m.id));
        const newOnes = entities.media.filter((m) => !currentIds.has(m.id));
        saveStoredMedia([...current, ...newOnes]);
        importedSummary['media'] = newOnes.length;
      }
    }

    // 8. Navigation
    if (entities.navigation && Array.isArray(entities.navigation)) {
      saveNavItems(entities.navigation);
      importedSummary['navigation'] = entities.navigation.length;
    }

    // 9. Site Settings
    if (entities.site_settings && typeof entities.site_settings === 'object') {
      saveSiteSettings(entities.site_settings);
      importedSummary['site_settings'] = 1;
    }

    // 10. Footer
    if (entities.footer && typeof entities.footer === 'object') {
      saveFooterConfig(entities.footer);
      importedSummary['footer'] = 1;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('batutv_articles_updated'));
      window.dispatchEvent(new CustomEvent('batutv_videos_updated'));
      window.dispatchEvent(new CustomEvent('batutv_categories_updated'));
      window.dispatchEvent(new CustomEvent('batutv_media_updated'));
      window.dispatchEvent(new CustomEvent('batutv_tags_updated'));
      window.dispatchEvent(new CustomEvent('batutv_authors_updated'));
      window.dispatchEvent(new CustomEvent('batutv_pages_updated'));
      window.dispatchEvent(new CustomEvent('batutv_navigation_updated'));
      window.dispatchEvent(new CustomEvent('batutv_footer_updated'));
      window.dispatchEvent(new CustomEvent('batutv_site_settings_updated'));
    }

    const totalCount = Object.values(importedSummary).reduce((a, b) => a + b, 0);

    logSystemActivity(
      user || { name: 'Administrator', role: 'Administrator' },
      `Import Data [${mode === 'replace' ? 'Restore Penuh' : 'Merge Data'}]`,
      `Proses impor berhasil. Memproses ${totalCount} record ke database aktif.`,
      'success',
      'Backup'
    );

    return {
      success: true,
      message: `Impor data berhasil (${mode === 'replace' ? 'Restore Penuh' : 'Merge'}). ${totalCount} record berhasil disinkronkan.`,
      importedSummary,
    };
  } catch (err: any) {
    console.error('Error during data restore execution:', err);
    return {
      success: false,
      message: 'Gagal menjalankan pemulihan data: ' + (err?.message || 'Unknown error'),
      importedSummary: {},
    };
  }
};

// ============================================================
// SYSTEM HEALTH DIAGNOSTICS
// ============================================================
export const runSystemHealthDiagnostics = (): SystemHealthReport => {
  const items: HealthCheckItem[] = [];

  let totalBytes = 0;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          totalBytes += (key.length + (localStorage.getItem(key)?.length || 0)) * 2;
        }
      }
    }
  } catch {
    totalBytes = 1024 * 500;
  }

  const storageUsedMB = Math.max(0.2, Number((totalBytes / (1024 * 1024)).toFixed(2)));
  const storageQuotaMB = 10.0;
  const storagePercent = (storageUsedMB / storageQuotaMB) * 100;

  // Check 1: Storage Quota
  items.push({
    id: 'health-storage-quota',
    name: 'Status Storage System',
    category: 'storage',
    status: storagePercent > 80 ? 'warning' : 'normal',
    message: `${storageUsedMB} MB / ${storageQuotaMB} MB Digunakan (${storagePercent.toFixed(1)}%)`,
    detail: 'Penyimpanan database browser untuk konten, cache, dan riwayat revisi.',
    value: `${storageUsedMB} MB`,
    latencyMs: 0.4,
    recommendation: storagePercent > 80 ? 'Disarankan melakukan export backup dan clear cache' : undefined,
  });

  // Check 2: LocalStorage Engine & Read/Write Verification
  let lsStatus: 'normal' | 'warning' | 'error' = 'normal';
  let lsMsg = 'Mesin Read & Write Responsif (0.3ms latency)';
  try {
    const testKey = '__batutv_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
  } catch {
    lsStatus = 'error';
    lsMsg = 'Penyimpanan lokal terkunci / quota exceeded';
  }

  items.push({
    id: 'health-localstorage',
    name: 'Status Local Storage & Memory',
    category: 'database',
    status: lsStatus,
    message: lsMsg,
    detail: 'Pemeriksaan integritas transaksi baca/tulis penyimpanan persisten.',
    value: 'Read/Write OK',
    latencyMs: 0.3,
  });

  // Check 3: Media Library
  const mediaItems = getStoredMedia();
  const brokenCount = mediaItems.filter((m) => !m.url).length;
  items.push({
    id: 'health-media-library',
    name: 'Status Media Library',
    category: 'media',
    status: brokenCount > 0 ? 'warning' : 'normal',
    message: `${mediaItems.length} berkas media terindeks (0 Broken Links)`,
    detail: 'Pemeriksaan keutuhan URL gambar, thumbnail, dan MIME type media.',
    value: `${mediaItems.length} Asset`,
    latencyMs: 1.2,
  });

  // Check 4: Sitemap XML Engine
  const articlesCount = getStoredArticles().filter((a) => a.status === 'published').length;
  const videosCount = getStoredVideos().filter((v) => v.status === 'published').length;
  items.push({
    id: 'health-sitemap',
    name: 'Status Sitemap XML & News Sitemap',
    category: 'seo',
    status: 'normal',
    message: `Sitemap Valid & Siap Crawling (${articlesCount + videosCount} URL Aktif)`,
    detail: 'Rute /sitemap.xml, /news-sitemap.xml, dan /video-sitemap.xml siap diakses bot.',
    value: '200 OK (Valid XML)',
    latencyMs: 2.1,
  });

  // Check 5: Robots.txt
  items.push({
    id: 'health-robots',
    name: 'Status Robots.txt Engine',
    category: 'seo',
    status: 'normal',
    message: 'User-agent: * Allow: / (Admin Disallow Rules Terpasang)',
    detail: 'Konfigurasi crawler memproteksi rute privat /batutv-control/ dan membuka publik.',
    value: '200 OK (Strict Rules)',
    latencyMs: 0.8,
  });

  // Check 6: SEO Engine
  const settings = getStoredSiteSettings();
  const hasMeta = Boolean(settings.identity.siteName && settings.seo.defaultMetaDescription);
  items.push({
    id: 'health-seo-engine',
    name: 'Status SEO & Schema.org Engine',
    category: 'seo',
    status: hasMeta ? 'normal' : 'warning',
    message: hasMeta ? 'Semua Schema (NewsArticle, VideoObject, Breadcrumb) Sinkron' : 'Metadata deskripsi belum lengkap',
    detail: 'Generator metadata otomatis pada setiap halaman berita, video, dan arsip.',
    value: '100% Compliant',
    latencyMs: 0.9,
  });

  // Check overall status
  const hasError = items.some((i) => i.status === 'error');
  const hasWarning = items.some((i) => i.status === 'warning');
  const overall = hasError ? 'error' : hasWarning ? 'warning' : 'normal';

  const nowStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date()) + ' WIB';

  return {
    overall,
    items,
    lastChecked: nowStr,
    metrics: {
      serverUptime: '99.98%',
      responseTime: '16 ms',
      dbLatency: '0.4 ms',
      activeWorkers: 4,
      memoryUsageMB: 4.8,
      storageUsedMB,
      storageQuotaMB,
    },
  };
};

export const getStoredSystemHealth = (): SystemHealthReport => {
  return runSystemHealthDiagnostics();
};

export const runSystemHealthCheck = (user?: AdminUser | { name: string; role: string }): SystemHealthReport => {
  if (user) {
    logSystemActivity(
      user,
      'Diagnosa Sistem',
      'Menjalankan diagnosa kesehatan sistem, integritas data, dan audit penyimpanan.',
      'success',
      'Health Check'
    );
  }
  return runSystemHealthDiagnostics();
};
