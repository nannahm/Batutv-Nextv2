import React from 'react';
import {
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Shield,
  Radio,
} from 'lucide-react';
import { MaintenanceConfig } from '../../types/systemSettings';
import { getStoredMaintenanceConfig } from '../../data/systemSettingsStore';
import { getStoredSiteSettings } from '../../data/siteSettingsStore';

interface MaintenancePageProps {
  onNavigateToLogin: () => void;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ onNavigateToLogin }) => {
  const maintenance = getStoredMaintenanceConfig();
  const siteSettings = getStoredSiteSettings();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 p-6 sm:p-8 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-red-600/30">
            B
          </div>
          <div>
            <span className="font-bold text-base tracking-wider text-white">
              {siteSettings?.identity?.siteName || 'BATUTV'}
            </span>
            <span className="text-[10px] block text-red-400 font-semibold tracking-widest uppercase">
              Official News Network
            </span>
          </div>
        </div>

        <button
          onClick={onNavigateToLogin}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Login Redaksi</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center flex flex-col items-center justify-center my-auto space-y-6">
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner animate-pulse">
          <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>PEMELIHARAAN SISTEM BERKALA</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {maintenance.title || 'Situs Sedang Dalam Pemeliharaan'}
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
            {maintenance.message ||
              'Portal berita BatuTV saat ini sedang menjalani optimalisasi infrastruktur server untuk meningkatkan kecepatan dan kenyamanan pembaca.'}
          </p>
        </div>

        {/* Estimated Completion Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl inline-flex items-center gap-3 text-xs sm:text-sm text-slate-300 max-w-md w-full justify-center">
          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-left">
            <span className="text-[11px] text-slate-500 block uppercase font-bold tracking-wider">
              Estimasi Selesai:
            </span>
            <span className="font-bold text-slate-100">
              {maintenance.estimatedCompletion || 'Segera Kembali'}
            </span>
          </div>
        </div>

        {/* Contact info */}
        {(maintenance.contactEmail || maintenance.contactPhone) && (
          <div className="pt-6 border-t border-slate-800/80 w-full flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-400">
            {maintenance.contactEmail && (
              <a
                href={`mailto:${maintenance.contactEmail}`}
                className="inline-flex items-center gap-1.5 hover:text-white transition"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{maintenance.contactEmail}</span>
              </a>
            )}
            {maintenance.contactEmail && maintenance.contactPhone && (
              <span className="hidden sm:inline text-slate-700">•</span>
            )}
            {maintenance.contactPhone && (
              <a
                href={`tel:${maintenance.contactPhone}`}
                className="inline-flex items-center gap-1.5 hover:text-white transition"
              >
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{maintenance.contactPhone}</span>
              </a>
            )}
          </div>
        )}
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 p-6 text-center text-xs text-slate-600 border-t border-slate-800/80">
        <p>
          &copy; {new Date().getFullYear()} {siteSettings?.identity?.siteName || 'BatuTV Media Network'}. Hak cipta dilindungi undang-undang.
        </p>
      </footer>
    </div>
  );
};
