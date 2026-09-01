import React, { useState } from 'react';
import {
  AlertTriangle,
  Power,
  Clock,
  Mail,
  Phone,
  CheckCircle2,
  Lock,
  Eye,
  ShieldCheck,
  Globe,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { MaintenanceConfig } from '../../../types/systemSettings';
import {
  getStoredMaintenanceConfig,
  setStoredMaintenanceConfig,
} from '../../../data/systemSettingsStore';
import { AdminUser } from '../../../types/admin';

interface MaintenanceModeTabProps {
  user: AdminUser | null;
  isAdmin: boolean;
  onNavigateToPublic: (path: string) => void;
}

export const MaintenanceModeTab: React.FC<MaintenanceModeTabProps> = ({
  user,
  isAdmin,
  onNavigateToPublic,
}) => {
  const [config, setConfig] = useState<MaintenanceConfig>(() => getStoredMaintenanceConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleToggleMode = () => {
    if (!isAdmin) return;
    const newStatus = !config.isEnabled;
    const updated = setStoredMaintenanceConfig({ isEnabled: newStatus }, user || undefined);
    setConfig(updated);
    setSaveSuccessMsg(
      newStatus
        ? 'Mode Maintenance berhasil DIAKTIFKAN. Frontend publik sekarang dalam status pemeliharaan.'
        : 'Mode Maintenance DINONAKTIFKAN. Situs kembali ONLINE secara normal.'
    );
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleSaveFields = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsSaving(true);

    setTimeout(() => {
      const updated = setStoredMaintenanceConfig(
        {
          title: config.title,
          message: config.message,
          estimatedCompletion: config.estimatedCompletion,
          contactEmail: config.contactEmail,
          contactPhone: config.contactPhone,
        },
        user || undefined
      );
      setConfig(updated);
      setIsSaving(false);
      setSaveSuccessMsg('Pengaturan pesan & estimasi maintenance berhasil disimpan!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }, 400);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Status */}
      <div
        className={`rounded-2xl p-5 sm:p-6 border transition-all ${
          config.isEnabled
            ? 'bg-amber-50/70 border-amber-300 text-amber-950 shadow-xs'
            : 'bg-white border-slate-200 text-slate-900 shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                config.isEnabled
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm animate-pulse'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {config.isEnabled ? <AlertTriangle className="w-6 h-6" /> : <Power className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  {config.isEnabled ? 'Mode Maintenance AKTIF' : 'Mode Maintenance Non-Aktif'}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    config.isEnabled
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {config.isEnabled ? 'Situs Terkunci (Maintenance)' : 'Situs Publik Online'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                {config.isEnabled
                  ? 'Pengunjung frontend saat ini diarahkan ke layar "Situs Sedang Dalam Pemeliharaan". Administrator tetap dapat login dan mengakses seluruh modul CMS.'
                  : 'Situs portal berita BatuTV dapat diakses publik secara bebas. Aktifkan mode pemeliharaan bila ingin melakukan migrasi atau perbaikan besar.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin ? (
              <button
                type="button"
                onClick={handleToggleMode}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer ${
                  config.isEnabled
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{config.isEnabled ? 'Matikan Maintenance (Kembali Online)' : 'Aktifkan Maintenance Mode'}</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                <Lock className="w-3.5 h-3.5" />
                Hanya Administrator
              </span>
            )}
          </div>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Grid: Form Configuration & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Configuration Fields */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h4 className="text-base font-bold text-slate-900">Pengaturan Tampilan Pemeliharaan</h4>
            <p className="text-xs text-slate-500 mt-1">
              Sesuaikan pesan pengumuman, estimasi penyelesaian, dan kontak darurat untuk pembaca.
            </p>
          </div>

          <form onSubmit={handleSaveFields} className="space-y-4">
            {/* Field 1: Judul Maintenance */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Judul Maintenance
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="Contoh: Situs Sedang Dalam Pemeliharaan Sistem"
                className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed font-medium text-slate-900"
                required
              />
            </div>

            {/* Field 2: Pesan Maintenance */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pesan Pemeliharaan (Deskripsi)
              </label>
              <textarea
                rows={4}
                disabled={!isAdmin}
                value={config.message}
                onChange={(e) => setConfig({ ...config, message: e.target.value })}
                placeholder="Tuliskan penjelasan mengenai proses pemeliharaan..."
                className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-900 leading-relaxed"
                required
              />
            </div>

            {/* Field 3: Estimasi Selesai */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estimasi Selesai (Waktu & Tanggal)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={config.estimatedCompletion}
                  onChange={(e) => setConfig({ ...config, estimatedCompletion: e.target.value })}
                  placeholder="Contoh: 30 Agustus 2026 - 06:00 WIB"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-900 font-semibold"
                  required
                />
              </div>
            </div>

            {/* Contact Info (Email & Phone) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Redaksi / Bantuan
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled={!isAdmin}
                    value={config.contactEmail}
                    onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                    placeholder="redaksi@batutv.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Telepon / Hotline
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={config.contactPhone}
                    onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
                    placeholder="+62 341 591234"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {isAdmin && (
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-xs transition cursor-pointer"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Pesan Maintenance'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Live Mockup Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-red-600" />
              <span>Pratinjau Layar Frontend</span>
            </h4>
            <span className="text-[11px] text-slate-400">Live Preview</span>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[380px]">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4 shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-red-600/20 text-red-400 border border-red-500/30 mb-3">
              <span>BATUTV MEDIA</span>
            </div>

            <h5 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
              {config.title || 'Situs Sedang Dalam Pemeliharaan'}
            </h5>

            <p className="text-xs text-slate-300 mt-2.5 max-w-sm leading-relaxed">
              {config.message || 'Kami sedang melakukan peningkatan sistem dan akan segera kembali.'}
            </p>

            <div className="mt-5 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 inline-flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Estimasi: <strong>{config.estimatedCompletion || 'Segera'}</strong></span>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 w-full flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <span>Email: {config.contactEmail}</span>
              <span>•</span>
              <span>Telp: {config.contactPhone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
