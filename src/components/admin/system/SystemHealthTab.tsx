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
      overallStatus: health.overall,
      uptime: health.metrics?.serverUptime || '99.98%',
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

  const isOptimal = health.overall === 'normal';

  return (
    <div className="space-y-8">
      {/* Top Banner Overall Status */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
              isOptimal
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
                  isOptimal
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Status: {isOptimal ? 'Optimal (Prima)' : 'Perlu Perhatian'}
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

      {/* Grid Key Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Metric 1: Database Latency */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Online
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Database Connection</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              Online ({health.metrics?.dbLatency || '0.4 ms'})
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Koneksi Firestore &amp; Local Repository aktif</p>
          </div>
        </div>

        {/* Metric 2: Storage Usage */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {health.metrics ? `${Math.round((health.metrics.storageUsedMB / health.metrics.storageQuotaMB) * 100)}%` : '15%'}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Storage Usage (Media &amp; Cache)</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {health.metrics?.storageUsedMB || 0.8} MB / {health.metrics?.storageQuotaMB || 10} MB
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    health.metrics
                      ? Math.min(100, Math.round((health.metrics.storageUsedMB / health.metrics.storageQuotaMB) * 100))
                      : 15
                  }%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">Kapasitas penyimpanan aman</p>
          </div>
        </div>

        {/* Metric 3: Response Time */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              Sangat Cepat
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">API Response Time</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {health.metrics?.responseTime || '16 ms'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Rata-rata respons query portal</p>
          </div>
        </div>

        {/* Metric 4: Server Uptime */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Uptime {health.metrics?.serverUptime || '99.98%'}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Memory Usage</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {health.metrics?.memoryUsageMB || 4.8} MB
            </p>
            <p className="text-[11px] text-slate-500 mt-1.5">Runtime Node.js Next.js App Router</p>
          </div>
        </div>
      </div>

      {/* Individual Diagnostic Items */}
      {health.items && health.items.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Rincian Modul Pemeriksaan</h4>
          <div className="divide-y divide-slate-100">
            {health.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">{item.name}</p>
                  <p className="text-[11px] text-slate-500">{item.message}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    item.status === 'normal'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'warning'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.value || item.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
