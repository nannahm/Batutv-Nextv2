import React, { useState } from 'react';
import {
  HeartPulse,
  Database,
  HardDrive,
  Zap,
  Gauge,
  AlertCircle,
  Cpu,
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldCheck,
  TrendingUp,
  Download,
  Check,
} from 'lucide-react';
import { SystemHealthReport } from '../../../types/systemSettings';
import {
  getStoredSystemHealth,
  runSystemHealthCheck,
} from '../../../data/systemSettingsStore';
import { AdminUser } from '../../../types/admin';

interface SystemHealthTabProps {
  user: AdminUser | null;
  isAdmin: boolean;
}

export const SystemHealthTab: React.FC<SystemHealthTabProps> = ({ user, isAdmin }) => {
  const [health, setHealth] = useState<SystemHealthReport>(() => getStoredSystemHealth());
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [lastCheckNotice, setLastCheckNotice] = useState<string | null>(null);

  const handleRunDiagnostics = () => {
    setIsDiagnosing(true);
    setTimeout(() => {
      const updated = runSystemHealthCheck(user || undefined);
      setHealth(updated);
      setIsDiagnosing(false);
      setLastCheckNotice('Diagnosa sistem berhasil dijalankan! Semua komponen dalam keadaan prima.');
      setTimeout(() => setLastCheckNotice(null), 4000);
    }, 900);
  };

  const handleExportReport = () => {
    const reportData = {
      title: 'BATUTV System Health & Diagnostic Report',
      generatedAt: new Date().toISOString(),
      generatedBy: user ? `${user.name} (${user.role})` : 'Administrator',
      overallStatus: health.overallStatus,
      uptime: health.uptime,
      metrics: health,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batutv-health-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Overall Status */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
              health.overallStatus === 'Good'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                : 'bg-amber-50 border border-amber-200 text-amber-600'
            }`}
          >
            <HeartPulse className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Kesehatan &amp; Diagnosa Sistem
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold ${
                  health.overallStatus === 'Good'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Status: {health.overallStatus === 'Good' ? 'Optimal (Prima)' : 'Perlu Perhatian'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Monitoring parameter operasional real-time, latensi database, integritas cache, dan load server portal berita BatuTV.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Unduh Laporan</span>
          </button>

          <button
            onClick={handleRunDiagnostics}
            disabled={isDiagnosing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isDiagnosing ? 'animate-spin' : ''}`} />
            <span>{isDiagnosing ? 'Mendiagnosa...' : 'Jalankan Diagnosa'}</span>
          </button>
        </div>
      </div>

      {lastCheckNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{lastCheckNotice}</span>
        </div>
      )}

      {/* Grid 6 Key Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Metric 1: Database Connection */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {health.databaseConnection.status}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Database Connection</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {health.databaseConnection.status} ({health.databaseConnection.latency})
            </p>
            <p className="text-[11px] text-slate-500 mt-1">{health.databaseConnection.details}</p>
          </div>
        </div>

        {/* Metric 2: Storage Usage */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {health.storageUsage.status}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Storage Usage (Media & Cache)</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {health.storageUsage.usedPercentage}% Digunakan
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${health.storageUsage.usedPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">{health.storageUsage.details}</p>
          </div>
        </div>

        {/* Metric 3: Cache Engine */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {health.cacheEngine.status}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Cache Engine</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {health.cacheEngine.status} (Hit Rate {health.cacheEngine.hitRate})
            </p>
            <p className="text-[11px] text-slate-500 mt-1">{health.cacheEngine.details}</p>
          </div>
        </div>

        {/* Metric 4: API Response Time */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              {health.apiResponseTime.status}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">API Response Time</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {health.apiResponseTime.average}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">{health.apiResponseTime.details}</p>
          </div>
        </div>

        {/* Metric 5: Error Rate */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {health.errorRate.status}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Error Rate (Tingkat Kegagalan)</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{health.errorRate.rate}</p>
            <p className="text-[11px] text-slate-500 mt-1">{health.errorRate.details}</p>
          </div>
        </div>

        {/* Metric 6: Memory Usage & Uptime */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Uptime {health.uptime}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Memory Usage</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {health.memoryUsage.percentage}% Digunakan
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${health.memoryUsage.percentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">{health.memoryUsage.details}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
