import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AdminUser } from '../../types/admin';

interface TopbarProps {
  user: AdminUser | null;
  pageTitle: string;
  onToggleSidebar: () => void;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  user,
  pageTitle,
  onToggleSidebar,
  onLogout,
  onNavigate,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="a02-topbar-header"
      className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-shadow duration-200"
    >
      {/* Left side: Mobile Toggle & Breadcrumb / Page Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* A02.2.1 — Menu Toggle */}
        <button
          type="button"
          id="a02-btn-toggle-sidebar"
          onClick={onToggleSidebar}
          aria-label="Buka / Tutup Navigasi Sidebar"
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb / Title */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-400">
            BatuTV Control
          </span>
          <span className="hidden sm:inline-block text-slate-300">/</span>
          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right side: Notifications & User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* A02.2.2 — Notification Placeholder */}
        <div className="relative" ref={notifMenuRef}>
          <button
            type="button"
            id="a02-btn-notifications"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            aria-label="Pemberitahuan Sistem"
            title="Pemberitahuan Sistem"
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white animate-pulse" />
          </button>

          {/* Notification Dropdown Placeholder */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Pemberitahuan Sistem</span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Semua Berjalan Normal
                </span>
              </div>
              <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-800">
                      Sesi autentikasi aktif sebagai <strong>{user?.role || 'Admin'}</strong>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Baru saja</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-100 transition-colors">
                  <AlertCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-800">
                      Modul CMS A02 Dashboard berhasil diinisialisasi
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">1 menit lalu</p>
                  </div>
                </div>
              </div>
              <div className="px-4 pt-2 border-t border-slate-100 text-center">
                <span className="text-[11px] text-slate-400">
                  Sistem Notifikasi Lengkap akan dikembangkan pada tahap selanjutnya.
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* A02.2.3 — User Menu Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            id="a02-btn-user-menu"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            aria-label="Menu Pengguna Administrator"
            className="flex items-center gap-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors flex items-center gap-1">
                <span>{user?.name || 'Admin'}</span>
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">{user?.role || 'Administrator'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform" />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Admin'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'admin@batutv.com'}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-extrabold rounded-md border border-red-200">
                  {user?.role || 'Administrator'}
                </span>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onNavigate('/batutv-control/pengguna');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profil Akun</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onNavigate('/batutv-control/pengaturan');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Pengaturan CMS</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
