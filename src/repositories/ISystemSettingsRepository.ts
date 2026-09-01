import {
  SystemInfoConfig,
  MaintenanceConfig,
  SecurityConfig,
  ActivityLogItem,
  CacheStats,
} from '../types/systemSettings';

export interface SystemSettingsSnapshot {
  info?: SystemInfoConfig;
  maintenance?: MaintenanceConfig;
  security?: SecurityConfig;
  logs?: ActivityLogItem[];
  cacheStats?: CacheStats;
}

export interface ISystemSettingsRepository {
  getInfo(): Promise<SystemInfoConfig>;
  saveInfo(info: SystemInfoConfig): Promise<SystemInfoConfig>;

  getMaintenance(): Promise<MaintenanceConfig>;
  saveMaintenance(config: MaintenanceConfig): Promise<MaintenanceConfig>;

  getSecurity(): Promise<SecurityConfig>;
  saveSecurity(config: SecurityConfig): Promise<SecurityConfig>;

  getActivityLogs(limitCount?: number): Promise<ActivityLogItem[]>;
  addActivityLog(log: ActivityLogItem): Promise<ActivityLogItem>;
  logActivity(log: ActivityLogItem): Promise<ActivityLogItem>;
  clearActivityLogs(): Promise<void>;
  clearLogs(): Promise<void>;

  getCacheStats(): Promise<CacheStats>;
  saveCacheStats(stats: CacheStats): Promise<CacheStats>;

  subscribe(
    onNext: (snapshot: SystemSettingsSnapshot) => void,
    onError?: (error: Error) => void
  ): () => void;

  subscribeMaintenance(
    onNext: (config: MaintenanceConfig) => void,
    onError?: (error: Error) => void
  ): () => void;

  subscribeSecurity(
    onNext: (config: SecurityConfig) => void,
    onError?: (error: Error) => void
  ): () => void;
}
