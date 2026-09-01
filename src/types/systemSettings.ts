export type EnvironmentMode = 'Production' | 'Staging' | 'Development';

export type SystemStatusMode = 'Online' | 'Maintenance';

export type HealthStatus = 'normal' | 'warning' | 'error';

export type SystemSettingsTab =
  | 'info'
  | 'backup'
  | 'cache'
  | 'activity'
  | 'maintenance'
  | 'security'
  | 'health';

export type BackupEntity =
  | 'articles'
  | 'videos'
  | 'media'
  | 'authors'
  | 'categories'
  | 'tags'
  | 'pages'
  | 'navigation'
  | 'site_settings'
  | 'footer';

export type BackupFormat = 'json' | 'csv';

export interface SystemInfoConfig {
  appName: string;
  cmsVersion: string;
  buildVersion: string;
  environment: EnvironmentMode;
  installationDate: string;
  systemStatus: SystemStatusMode;
  serverSpecs: {
    runtime: string;
    framework: string;
    engine: string;
    database: string;
    serverRegion: string;
    timezone: string;
  };
}

export interface MaintenanceConfig {
  isEnabled: boolean;
  title: string;
  message: string;
  estimatedCompletion: string;
  allowAdminBypass: boolean;
  contactEmail: string;
  contactPhone: string;
  lastToggledAt?: string;
  toggledBy?: string;
}

export interface SecurityConfig {
  sessionTimeoutMinutes: number; // 15, 30, 60, 120, 480, 1440
  loginAttemptLimit: number; // 3, 5, 10
  autoLogoutEnabled: boolean;
  passwordMinLength: number; // 8, 10, 12, 16
  passwordComplexityRequired: boolean;
  twoFactorAuthReady: boolean;
  ipProtectionEnabled: boolean;
  forceHttps: boolean;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  user: string;
  userEmail?: string;
  role: string;
  action: string;
  description: string;
  status: 'success' | 'warning' | 'error' | 'info';
  ip?: string;
  entity?: string;
  userAgent?: string;
}

export interface CacheStats {
  memoryUsage: string;
  hitRate: string;
  lastCleared: string;
  cachedKeysCount: number;
  homepageCacheStatus: string;
  sitemapCacheStatus: string;
  searchIndexCacheStatus: string;
  seoMetadataStatus: string;
}

export interface HealthCheckItem {
  id: string;
  name: string;
  category: 'storage' | 'database' | 'media' | 'seo' | 'security';
  status: HealthStatus;
  message: string;
  detail: string;
  value?: string;
  latencyMs?: number;
  recommendation?: string;
}

export interface SystemHealthReport {
  overall: HealthStatus;
  items: HealthCheckItem[];
  lastChecked: string;
  metrics: {
    serverUptime: string;
    responseTime: string;
    dbLatency: string;
    activeWorkers: number;
    memoryUsageMB: number;
    storageUsedMB: number;
    storageQuotaMB: number;
  };
}

export interface BackupDataPayload {
  version: string;
  exportDate: string;
  exportedBy: string;
  appName: string;
  entities: {
    articles?: any[];
    videos?: any[];
    media?: any[];
    authors?: any[];
    categories?: any[];
    tags?: any[];
    pages?: any[];
    navigation?: any[];
    site_settings?: any;
    footer?: any;
  };
  summary: Record<string, number>;
  checksum: string;
}

export interface ImportValidationResult {
  isValid: boolean;
  version?: string;
  exportDate?: string;
  summary: Record<string, number>;
  errors: string[];
  warnings: string[];
  payload?: BackupDataPayload;
}
