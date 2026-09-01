import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  Lock,
  Clock,
  UserX,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Globe,
  Sliders,
  Save,
  Check,
} from 'lucide-react';
import { SecurityConfig } from '../../../types/systemSettings';
import {
  getStoredSecurityConfig,
  setStoredSecurityConfig,
} from '../../../data/systemSettingsStore';
import { AdminUser } from '../../../types/admin';

interface SecuritySettingsTabProps {
  user: AdminUser | null;
  isAdmin: boolean;
}

export const SecuritySettingsTab: React.FC<SecuritySettingsTabProps> = ({ user, isAdmin }) => {
  const [config, setConfig] = useState<SecurityConfig>(() => getStoredSecurityConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsSaving(true);

    setTimeout(() => {
      const updated = setStoredSecurityConfig(config, user || undefined);
      setConfig(updated);
      setIsSaving(false);
      setSaveSuccessMsg('Kebijakan keamanan sistem CMS BatuTV berhasil diperbarui!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }, 400);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Kebijakan Keamanan CMS</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Active Shield
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Atur durasi sesi, pembatasan percobaan login, auto logout saat idle, serta standar kekuatan kata sandi pengguna redaksi.
            </p>
          </div>
        </div>

        {!isAdmin && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Lock className="w-3.5 h-3.5" />
            Mode Lihat Saja
          </span>
        )}
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Security Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Session Management */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
              <Clock className="w-4 h-4 text-red-600" />
              <span>Manajemen Sesi & Timeout</span>
            </div>

            {/* Field 1: Session Timeout */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Session Timeout (Batas Waktu Sesi Aktif)
              </label>
              <select
                disabled={!isAdmin}
                value={config.sessionTimeoutMinutes}
                onChange={(e) =>
                  setConfig({ ...config, sessionTimeoutMinutes: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:outline-none transition font-medium text-slate-900 disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value={15}>15 Menit (Sangat Ketat)</option>
                <option value={30}>30 Menit</option>
                <option value={60}>1 Jam</option>
                <option value={120}>2 Jam (Standar Redaksi)</option>
                <option value={480}>8 Jam (1 Shift Kerja)</option>
                <option value={1440}>24 Jam (Maksimal)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Sesi login pengguna akan kedaluwarsa setelah durasi ini tercapai.
              </p>
            </div>

            {/* Field 2: Auto Logout Toggle */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-900">Auto Logout Saat Idle</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Otomatis mengakhiri sesi jika tidak ada aktivitas mouse / ketikan selama 30 menit.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={config.autoLogoutEnabled}
                  onChange={(e) => setConfig({ ...config, autoLogoutEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>

          {/* Card 2: Login Attempts & Brute Force */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
              <UserX className="w-4 h-4 text-blue-600" />
              <span>Proteksi Percobaan Login (Brute Force)</span>
            </div>

            {/* Field 3: Login Attempt Limit */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Login Attempt Limit (Batas Gagal Login)
              </label>
              <select
                disabled={!isAdmin}
                value={config.loginAttemptLimit}
                onChange={(e) =>
                  setConfig({ ...config, loginAttemptLimit: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:outline-none transition font-medium text-slate-900 disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value={3}>3 Kali Percobaan (Ketat)</option>
                <option value={5}>5 Kali Percobaan (Direkomendasikan)</option>
                <option value={10}>10 Kali Percobaan (Longgar)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Akun akan dikunci sementara selama 15 menit setelah melebihi batas percobaan.
              </p>
            </div>

            {/* IP Protection Indicator */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-900">Perlindungan IP & Rate Limiting</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mendeteksi serangan automated bot dan throttling request API login.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                Aktif (WAF)
              </span>
            </div>
          </div>

          {/* Card 3: Password Standards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5 md:col-span-2">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>Standar & Kompleksitas Kata Sandi Pengguna</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Field 4: Password Min Length */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password Minimum Length: <span className="text-red-600 font-bold">{config.passwordMinLength} Karakter</span>
                </label>
                <input
                  type="range"
                  min={8}
                  max={16}
                  step={2}
                  disabled={!isAdmin}
                  value={config.passwordMinLength}
                  onChange={(e) =>
                    setConfig({ ...config, passwordMinLength: Number(e.target.value) })
                  }
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>8 Karakter</span>
                  <span>10 Karakter</span>
                  <span>12 Karakter</span>
                  <span>16 Karakter</span>
                </div>
              </div>

              {/* Field 5: Password Complexity */}
              <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-900">Password Complexity (ON/OFF)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Wajib mengandung kombinasi huruf besar, kecil, angka, dan karakter khusus (!@#$).
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={config.passwordComplexityRequired}
                    onChange={(e) =>
                      setConfig({ ...config, passwordComplexityRequired: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {isAdmin && (
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-red-600 hover:bg-red-700 active:scale-98 shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan Pengaturan...' : 'Simpan Pengaturan Keamanan'}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
