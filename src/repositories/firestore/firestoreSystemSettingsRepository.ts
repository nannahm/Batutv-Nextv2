import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  SystemInfoConfig,
  MaintenanceConfig,
  SecurityConfig,
  ActivityLogItem,
  CacheStats,
} from '../../types/systemSettings';
import {
  ISystemSettingsRepository,
  SystemSettingsSnapshot,
} from '../ISystemSettingsRepository';
import { sanitizeForFirestore } from './converterUtils';
import {
  DEFAULT_SYSTEM_INFO,
  DEFAULT_MAINTENANCE_CONFIG,
  DEFAULT_SECURITY_CONFIG,
  DEFAULT_CACHE_STATS,
} from '../../data/systemSettingsStore';

const COLLECTION_NAME = 'system_settings';
const LOGS_COLLECTION_NAME = 'activity_logs';

export class FirestoreSystemSettingsRepository implements ISystemSettingsRepository {
  async getInfo(): Promise<SystemInfoConfig> {
    try {
      const docRef = doc(db, COLLECTION_NAME, 'info');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          ...DEFAULT_SYSTEM_INFO,
          ...data,
          serverSpecs: {
            ...DEFAULT_SYSTEM_INFO.serverSpecs,
            ...(data.serverSpecs || {}),
          },
        };
      }
    } catch (err) {
      console.warn('[FirestoreSystemSettingsRepository] getInfo error:', err);
    }
    return DEFAULT_SYSTEM_INFO;
  }

  async saveInfo(info: SystemInfoConfig): Promise<SystemInfoConfig> {
    const payload = sanitizeForFirestore({
      ...info,
      updatedAt: new Date().toISOString(),
    });
    const docRef = doc(db, COLLECTION_NAME, 'info');
    await setDoc(docRef, payload, { merge: true });
    return info;
  }

  async getMaintenance(): Promise<MaintenanceConfig> {
    try {
      const docRef = doc(db, COLLECTION_NAME, 'maintenance');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return {
          ...DEFAULT_MAINTENANCE_CONFIG,
          ...snap.data(),
        };
      }
    } catch (err) {
      console.warn('[FirestoreSystemSettingsRepository] getMaintenance error:', err);
    }
    return DEFAULT_MAINTENANCE_CONFIG;
  }

  async saveMaintenance(config: MaintenanceConfig): Promise<MaintenanceConfig> {
    const payload = sanitizeForFirestore({
      ...config,
      updatedAt: new Date().toISOString(),
    });
    const docRef = doc(db, COLLECTION_NAME, 'maintenance');
    await setDoc(docRef, payload, { merge: true });
    return config;
  }

  async getSecurity(): Promise<SecurityConfig> {
    try {
      const docRef = doc(db, COLLECTION_NAME, 'security');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return {
          ...DEFAULT_SECURITY_CONFIG,
          ...snap.data(),
        };
      }
    } catch (err) {
      console.warn('[FirestoreSystemSettingsRepository] getSecurity error:', err);
    }
    return DEFAULT_SECURITY_CONFIG;
  }

  async saveSecurity(config: SecurityConfig): Promise<SecurityConfig> {
    const payload = sanitizeForFirestore({
      ...config,
      updatedAt: new Date().toISOString(),
    });
    const docRef = doc(db, COLLECTION_NAME, 'security');
    await setDoc(docRef, payload, { merge: true });
    return config;
  }

  async getCacheStats(): Promise<CacheStats> {
    try {
      const docRef = doc(db, COLLECTION_NAME, 'cache_stats');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return {
          ...DEFAULT_CACHE_STATS,
          ...snap.data(),
        };
      }
    } catch (err) {
      console.warn('[FirestoreSystemSettingsRepository] getCacheStats error:', err);
    }
    return DEFAULT_CACHE_STATS;
  }

  async saveCacheStats(stats: CacheStats): Promise<CacheStats> {
    const payload = sanitizeForFirestore({
      ...stats,
      updatedAt: new Date().toISOString(),
    });
    const docRef = doc(db, COLLECTION_NAME, 'cache_stats');
    await setDoc(docRef, payload, { merge: true });
    return stats;
  }

  async getActivityLogs(limitCount: number = 100): Promise<ActivityLogItem[]> {
    try {
      const logsCol = collection(db, LOGS_COLLECTION_NAME);
      const q = query(logsCol, orderBy('timestamp', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      const list: ActivityLogItem[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          timestamp: d.timestamp || new Date().toISOString(),
          user: d.user || d.userName || 'System',
          userEmail: d.userEmail || d.email,
          role: d.role || d.userRole || 'admin',
          action: d.action || 'Aktivitas Sistem',
          description: d.description || d.details || '',
          status: d.status || d.level || 'info',
          ip: d.ip || d.ipAddress,
          entity: d.entity || d.category || 'System',
          userAgent: d.userAgent,
        });
      });
      return list;
    } catch (err) {
      console.warn('[FirestoreSystemSettingsRepository] getActivityLogs fallback:', err);
      return [];
    }
  }

  async addActivityLog(log: ActivityLogItem): Promise<ActivityLogItem> {
    try {
      const logsCol = collection(db, LOGS_COLLECTION_NAME);
      const payload = sanitizeForFirestore({
        timestamp: log.timestamp || new Date().toISOString(),
        user: log.user,
        userEmail: log.userEmail || null,
        role: log.role,
        action: log.action,
        description: log.description,
        status: log.status,
        ip: log.ip || null,
        entity: log.entity || 'System',
        userAgent: log.userAgent || null,
      });
      const docRef = await addDoc(logsCol, payload);
      return { ...log, id: docRef.id };
    } catch (err) {
      console.warn('[FirestoreSystemSettingsRepository] addActivityLog error:', err);
      return log;
    }
  }

  async logActivity(log: ActivityLogItem): Promise<ActivityLogItem> {
    return this.addActivityLog(log);
  }

  async clearActivityLogs(): Promise<void> {
    try {
      const logsCol = collection(db, LOGS_COLLECTION_NAME);
      const snap = await getDocs(logsCol);
      const batch = writeBatch(db);
      snap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    } catch (err) {
      console.warn('[FirestoreSystemSettingsRepository] clearActivityLogs error:', err);
    }
  }

  async clearLogs(): Promise<void> {
    return this.clearActivityLogs();
  }

  subscribe(
    onNext: (snapshot: SystemSettingsSnapshot) => void,
    onError?: (error: Error) => void
  ): () => void {
    const infoRef = doc(db, COLLECTION_NAME, 'info');
    const maintenanceRef = doc(db, COLLECTION_NAME, 'maintenance');
    const securityRef = doc(db, COLLECTION_NAME, 'security');

    let currentSnapshot: SystemSettingsSnapshot = {};

    const unsubInfo = onSnapshot(
      infoRef,
      (snap) => {
        if (snap.exists()) {
          currentSnapshot = {
            ...currentSnapshot,
            info: { ...DEFAULT_SYSTEM_INFO, ...snap.data() },
          };
          onNext(currentSnapshot);
        }
      },
      onError
    );

    const unsubMaint = onSnapshot(
      maintenanceRef,
      (snap) => {
        if (snap.exists()) {
          currentSnapshot = {
            ...currentSnapshot,
            maintenance: { ...DEFAULT_MAINTENANCE_CONFIG, ...snap.data() },
          };
          onNext(currentSnapshot);
        }
      },
      onError
    );

    const unsubSec = onSnapshot(
      securityRef,
      (snap) => {
        if (snap.exists()) {
          currentSnapshot = {
            ...currentSnapshot,
            security: { ...DEFAULT_SECURITY_CONFIG, ...snap.data() },
          };
          onNext(currentSnapshot);
        }
      },
      onError
    );

    return () => {
      unsubInfo();
      unsubMaint();
      unsubSec();
    };
  }

  subscribeMaintenance(
    onNext: (config: MaintenanceConfig) => void,
    onError?: (error: Error) => void
  ): () => void {
    const docRef = doc(db, COLLECTION_NAME, 'maintenance');
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          onNext({
            ...DEFAULT_MAINTENANCE_CONFIG,
            ...snap.data(),
          });
        }
      },
      (err) => {
        console.warn('[FirestoreSystemSettingsRepository] subscribeMaintenance error:', err);
        if (onError) onError(err);
      }
    );
  }

  subscribeSecurity(
    onNext: (config: SecurityConfig) => void,
    onError?: (error: Error) => void
  ): () => void {
    const docRef = doc(db, COLLECTION_NAME, 'security');
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          onNext({
            ...DEFAULT_SECURITY_CONFIG,
            ...snap.data(),
          });
        }
      },
      (err) => {
        console.warn('[FirestoreSystemSettingsRepository] subscribeSecurity error:', err);
        if (onError) onError(err);
      }
    );
  }
}

export const firestoreSystemSettingsRepository = new FirestoreSystemSettingsRepository();
