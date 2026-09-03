import React, { useState } from 'react';
import {
  Server,
  Database,
  Zap,
  Activity,
  AlertTriangle,
  Shield,
  HeartPulse,
  Lock,
  ArrowLeft,
  RefreshCw,
  Info,
} from 'lucide-react';
import { SystemSettingsTab } from '../../../types/systemSettings';
import { SystemInfoTab } from './SystemInfoTab';
import { BackupRestoreTab } from './BackupRestoreTab';
import { CacheManagementTab } from './CacheManagementTab';
import { ActivityLogTab } from './ActivityLogTab';
import { MaintenanceModeTab } from './MaintenanceModeTab';
import { SecuritySettingsTab } from './SecuritySettingsTab';
import { SystemHealthTab } from './SystemHealthTab';
import { AdminUser } from '../../../types/admin';

interface SystemSettingsModuleProps {
  currentUser: AdminUser | null;
  onNavigate: (path: string) => void;
}

interface TabDef {
  id: SystemSettingsTab;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: string;
}

const TABS: TabDef[] = [
  { id: 'info', label: 'Informasi Sistem', shortLabel: 'Info', icon: Server },
  { id: 'backup', label: 'Backup & Restore', shortLabel: 'Backup', icon: Database },
  { id: 'cache', label: 'Cache Management', shortLabel: 'Cache', icon: Zap },
  { id: 'activity', label: 'Activity Log', shortLabel: 'Log Aktivitas', icon: Activity },
  { id: 'maintenance', label: 'Maintenance Mode', shortLabel: 'Maintenance', icon: AlertTriangle },
  { id: 'security', label: 'Keamanan', shortLabel: 'Keamanan', icon: Shield },
  { id: 'health', label: 'System Health', shortLabel: 'Diagnosa', icon: HeartPulse },
];

export const SystemSettingsModule: React.FC<SystemSettingsModuleProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<SystemSettingsTab>('info');

  const isAdmin = currentUser?.role === 'Administrator';
  const isEditor = currentUser?.role === 'Editor';
  const isPenulis = currentUser?.role === 'Penulis';

  // Access Restriction for Penulis
  if (isPenulis) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Akses Dibatasi</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
              Modul <strong>Pengaturan Sistem</strong> hanya dapat diakses oleh peran <strong>Administrator</strong> dan <strong>Editor</strong>. Hubungi tim redaksi utama untuk permohonan izin operasional.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/batutv-control')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard Utama</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider rounded-md">
              Sistem &amp; Pemeliharaan
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">
              Konfigurasi Operasional
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Pengaturan Sistem
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Pusat konfigurasi operasional, cadangan data, cache, log audit, mode maintenance, dan parameter keamanan CMS BatuTV.
          </p>
        </div>

        {/* User Role Badge Indicator */}
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
              isAdmin
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Akses: {currentUser?.role || 'Guest'}</span>
          </span>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs overflow-x-auto">
        <nav className="flex space-x-1 min-w-max" aria-label="Tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="transition-all duration-200">
        {activeTab === 'info' && (
          <SystemInfoTab
            user={currentUser}
            isAdmin={isAdmin}
            onRefreshHealth={() => setActiveTab('health')}
          />
        )}
        {activeTab === 'backup' && (
          <BackupRestoreTab user={currentUser} isAdmin={isAdmin} />
        )}
        {activeTab === 'cache' && (
          <CacheManagementTab user={currentUser} isAdmin={isAdmin} />
        )}
        {activeTab === 'activity' && (
          <ActivityLogTab user={currentUser} isAdmin={isAdmin} />
        )}
        {activeTab === 'maintenance' && (
          <MaintenanceModeTab
            user={currentUser}
            isAdmin={isAdmin}
            onNavigateToPublic={onNavigate}
          />
        )}
        {activeTab === 'security' && (
          <SecuritySettingsTab user={currentUser} isAdmin={isAdmin} />
        )}
        {activeTab === 'health' && (
          <SystemHealthTab user={currentUser} isAdmin={isAdmin} />
        )}
      </div>
    </div>
  );
};
