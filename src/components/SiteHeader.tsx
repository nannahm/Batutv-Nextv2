import React, { useState, useEffect } from 'react';
import { Menu, Search, User } from 'lucide-react';
import { getStoredSiteSettings, SITE_SETTINGS_UPDATED_EVENT } from '../data/siteSettingsStore';
import { SiteSettings } from '../types/siteSettings';
import { BatuTVBrandLogo } from './common/BatuTVBrandLogo';

interface SiteHeaderProps {
  isScrolled?: boolean;
  onOpenSearch?: (query?: string) => void;
  onOpenUserAccount?: () => void;
  currentUser?: { name: string; role: string } | null;
  onOpenMenu?: () => void;
  onGoHome?: () => void;
  // Backwards compatibility
  onOpenLiveStream?: () => void;
}

/**
 * S01 — SITE HEADER (Clean TVOne News Style)
 * 
 * - Brand Logo "BatuTV" di kiri bersih (Dikelola penuh via Master Data -> Site Settings)
 * - Mobile & Tablet View (< md): Logo BatuTV di kiri + Tombol Ikon Kaca Pembesar Merah, Ikon User/Login & Ikon Menu Hitam di kanan
 * - Desktop View (>= md): Logo BatuTV bersih tanpa elemen mengganggu di kanan (kontrol dipindah ke navigasi merah)
 */
export const SiteHeader: React.FC<SiteHeaderProps> = ({
  isScrolled = false,
  onOpenSearch,
  onOpenUserAccount,
  currentUser,
  onOpenMenu,
  onGoHome,
}) => {
  const [settings, setSettings] = useState<SiteSettings>(() => getStoredSiteSettings());

  useEffect(() => {
    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        setSettings(getStoredSiteSettings());
      }
    };

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, handleSettingsUpdate);
    return () => {
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, handleSettingsUpdate);
    };
  }, []);

  const handleBrandClick = (e: React.MouseEvent) => {
    if (onGoHome) {
      e.preventDefault();
      onGoHome();
    }
  };

  return (
    <div className="w-full">
      {/* Top Red Border Accent Line */}
      <div className="w-full h-1 sm:h-1.5 bg-[#940a13]" />

      <header
        id="s01-site-header"
        className="site-header sticky top-0 md:static z-40 w-full bg-white border-b border-slate-200/80 md:border-slate-100 py-2.5 sm:py-3.5 shadow-xs md:shadow-none transition-shadow"
      >
        <div className="site-header-container w-full max-w-[1020px] mx-auto px-3.5 sm:px-4 md:px-0 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* ========================================================= */}
          {/* S01.1 — BRAND LOGO: BatuTV (Left Aligned)                 */}
          {/* ========================================================= */}
          <div className="brand-wrapper flex items-center flex-shrink-0">
            <a
              id="s01-brand-logo"
              href="/"
              onClick={handleBrandClick}
              className="brand group flex items-center select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md py-0.5"
              aria-label={settings.identity.siteName || 'BATUTV - Televisi Kota Batu'}
            >
              {settings.logos.headerDesktop &&
              settings.logos.headerDesktop !== '/brand/batutv-logo.svg' &&
              settings.logos.headerDesktop !== '/brand/batutv-logo-publisher.png' ? (
                <img
                  src={settings.logos.headerDesktop}
                  alt={settings.logos.headerDesktopAlt || settings.identity.siteName}
                  className={`${isScrolled ? 'h-7 sm:h-8' : 'h-8 sm:h-10'} max-w-[240px] object-contain transition-all duration-200`}
                />
              ) : (
                <BatuTVBrandLogo
                  height={isScrolled ? 34 : 44}
                  variant="full"
                  theme="light"
                  showSlogan={true}
                  className="transition-transform duration-200 group-hover:scale-[1.02]"
                />
              )}
            </a>
          </div>

          {/* ========================================================= */}
          {/* 1. MOBILE & TABLET RIGHT CONTROLS (< md)                  */}
          {/*    (User/Login Icon + Red Search Icon + Clean Menu Icon)  */}
          {/* ========================================================= */}
          <div className="flex md:hidden items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* User / Login Icon Button */}
            {onOpenUserAccount && (
              <button
                id="s01-mobile-user-btn"
                type="button"
                onClick={onOpenUserAccount}
                aria-label={currentUser ? `Buka Dashboard (${currentUser.name})` : "Masuk ke Akun Redaksi / Login CMS"}
                title={currentUser ? `Dashboard (${currentUser.name})` : "Masuk ke Akun / Login CMS"}
                className="p-1 text-slate-700 hover:text-[#c8102e] active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md cursor-pointer"
              >
                <div className={`w-7 h-7 rounded-full border flex items-center justify-center ${currentUser ? 'border-red-500 bg-red-50 text-red-700 font-bold text-xs' : 'border-slate-300 bg-slate-100 text-slate-700'}`}>
                  {currentUser ? (
                    currentUser.name.charAt(0).toUpperCase()
                  ) : (
                    <User className="w-4 h-4 text-slate-700 stroke-[2.2]" />
                  )}
                </div>
              </button>
            )}

            {/* Red Search Magnifying Glass Icon */}
            <button
              id="s01-mobile-search-btn"
              type="button"
              onClick={() => onOpenSearch && onOpenSearch('')}
              aria-label="Cari Berita"
              title="Cari Berita"
              className="p-1 text-[#c8102e] hover:text-red-700 active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md cursor-pointer"
            >
              <Search className="w-6 h-6 sm:w-6.5 sm:h-6.5 stroke-[2.4]" />
            </button>

            {/* Clean 3-Line Black Hamburger Menu Icon */}
            <button
              id="s01-mobile-menu-btn"
              type="button"
              onClick={onOpenMenu}
              aria-label="Buka Menu"
              title="Menu"
              className="p-1 text-slate-900 hover:text-slate-700 active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md cursor-pointer"
            >
              <Menu className="w-6.5 h-6.5 sm:w-7 sm:h-7 stroke-[2.4]" />
            </button>
          </div>

          {/* ========================================================= */}
          {/* 2. DESKTOP RIGHT CONTROLS (>= md)                         */}
          {/*    (Login CMS Pill Button + Quick Search Trigger)         */}
          {/* ========================================================= */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {onOpenUserAccount && (
              <button
                id="s01-desktop-login-btn"
                type="button"
                onClick={onOpenUserAccount}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer ${
                  currentUser
                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-[#940a13] hover:text-white hover:border-[#940a13]'
                    : 'bg-slate-100 hover:bg-[#940a13] text-slate-700 hover:text-white border border-slate-200/80 hover:border-[#940a13]'
                }`}
                title={currentUser ? `Buka Dashboard CMS (${currentUser.name} - ${currentUser.role})` : "Masuk ke Akun Redaksi / Login CMS"}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${currentUser ? 'bg-red-600 text-white font-extrabold' : ''}`}>
                  {currentUser ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5 stroke-[2.4]" />}
                </div>
                <span>{currentUser ? `Dashboard (${currentUser.name.split(' ')[0]})` : 'Masuk / Login CMS'}</span>
              </button>
            )}
          </div>

        </div>
      </header>
    </div>
  );
};
