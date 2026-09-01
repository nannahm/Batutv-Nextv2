import React, { useState } from 'react';
import {
  Server,
  Cpu,
  Database,
  Globe,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  HardDrive,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { SystemInfoConfig } from '../../../types/systemSettings';
import { getStoredSystemInfo, setStoredSystemInfo } from '../../../data/systemSettingsStore';
import { AdminUser } from '../../../types/admin';

interface SystemInfoTabProps {
  user: AdminUser | null;
  isAdmin: boolean;
  onRefreshHealth: () => void;
}

export const SystemInfoTab: React.FC<SystemInfoTabProps> = ({
  user,
  isAdmin,
  onRefreshHealth,
}) => {
  const [info, setInfo] = useState<SystemInfoConfig>(() => getStoredSystemInfo());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isEditingEnv, setIsEditingEnv] = useState(false);
  const [tempEnv, setTempEnv] = useState(info.environment);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveEnv = () => {
    if (!isAdmin) return;
    const updated = setStoredSystemInfo({ environment: tempEnv });
    setInfo(updated);
    setIsEditingEnv(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                {info.appName}
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white shadow-xs">
                {info.cmsVersion}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  info.systemStatus === 'Online'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    info.systemStatus === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                Status: {info.systemStatus}
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Pusat kontrol operasional, arsitektur server, build version, dan diagnosa kesehatan portal berita BatuTV.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setInfo(getStoredSystemInfo());
              onRefreshHealth();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>Periksa Ulang</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Pengaturan environment sistem berhasil diperbarui!</span>
        </div>
      )}

      {/* Grid Key System Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Application & CMS Version */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
              <Layers className="w-4 h-4 text-red-600" />
              <span>Aplikasi & CMS</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              Core
            </span>
          </div>
          <div className="mt-4 space-y-3.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Nama Aplikasi</span>
              <span className="font-bold text-slate-900">{info.appName}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Versi CMS</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">
                <span>{info.cmsVersion}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(info.cmsVersion, 'cmsVer')}
                  title="Copy Versi"
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {copiedKey === 'cmsVer' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Build Version</span>
              <div className="flex items-center gap-1.5 font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">
                <span>{info.buildVersion}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(info.buildVersion, 'buildVer')}
                  title="Copy Build"
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {copiedKey === 'buildVer' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Framework UI</span>
              <span className="font-semibold text-slate-900">{info.serverSpecs.framework}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Environment & Status */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Environment & Mode</span>
            </div>
            {isAdmin && !isEditingEnv ? (
              <button
                type="button"
                onClick={() => setIsEditingEnv(true)}
                className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
              >
                Ubah
              </button>
            ) : null}
          </div>
          <div className="mt-4 space-y-3.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Environment</span>
              {isEditingEnv && isAdmin ? (
                <div className="flex items-center gap-2">
                  <select
                    value={tempEnv}
                    onChange={(e) => setTempEnv(e.target.value as any)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 font-bold text-slate-900 bg-white"
                  >
                    <option value="Production">Production</option>
                    <option value="Staging">Staging</option>
                    <option value="Development">Development</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleSaveEnv}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold cursor-pointer"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingEnv(false)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    info.environment === 'Production'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : info.environment === 'Staging'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {info.environment}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Status Operasional</span>
              <span
                className={`font-bold text-xs px-2.5 py-0.5 rounded-full border ${
                  info.systemStatus === 'Online'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {info.systemStatus}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Tanggal Instalasi</span>
              <div className="flex items-center gap-1 text-slate-900 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{info.installationDate}</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Zona Waktu</span>
              <span className="font-semibold text-slate-800">{info.serverSpecs.timezone}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Server Architecture */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:shadow-md transition md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>Infrastruktur & Runtime</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              Active
            </span>
          </div>
          <div className="mt-4 space-y-3.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Runtime Node</span>
              <span className="font-mono text-xs font-bold text-slate-900">{info.serverSpecs.runtime}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Region Server</span>
              <span className="font-semibold text-slate-900">{info.serverSpecs.serverRegion}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Database Layer</span>
              <span className="font-semibold text-slate-900">{info.serverSpecs.database}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Keamanan Enkripsi</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                TLS 1.3 / HTTPS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Note Distinction between Site Settings and System Settings */}
      <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs sm:text-sm leading-relaxed flex items-start gap-3.5">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950">
            Perbedaan Pengaturan Sistem vs Site Settings:
          </p>
          <p className="text-amber-900">
            <strong>Site Settings</strong> mengatur Identitas Situs, Logo, Favicon, SEO Global, Publisher, dan Sosial Media.
            Sedangkan <strong>Pengaturan Sistem</strong> bertanggung jawab atas operasional CMS, Backup & Restore, Cache, Log Aktivitas, Mode Maintenance, Keamanan, dan Diagnosa Kesehatan Sistem.
          </p>
        </div>
      </div>
    </div>
  );
};
