import React from 'react';
import { Search, Bookmark, Menu, Tv, BellRing } from 'lucide-react';
import { BatuTVBrandLogo } from './common/BatuTVBrandLogo';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenMobileMenu: () => void;
  onOpenLiveStream: () => void;
  onOpenBookmarks: () => void;
  bookmarkCount: number;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenMobileMenu,
  onOpenLiveStream,
  onOpenBookmarks,
  bookmarkCount,
  onGoHome,
}) => {
  return (
    <header id="main-header" className="bg-white border-b border-slate-200 sticky top-0 md:static z-30 shadow-xs">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        {/* Mobile Menu Button & Search Shortcut (Left on mobile) */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            id="btn-mobile-menu-trigger"
            onClick={onOpenMobileMenu}
            className="p-2 text-slate-700 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
            aria-label="Buka Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <button
            id="btn-mobile-search-trigger"
            onClick={onOpenSearch}
            className="p-2 text-slate-700 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
            aria-label="Cari Berita"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Logo BatuTV */}
        <div
          id="header-brand-logo"
          className="flex items-center gap-3 cursor-pointer py-0.5 group focus:outline-none"
          onClick={onGoHome}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onGoHome();
          }}
          aria-label="Beranda BatuTV"
        >
          {/* Official 3D Vector Brand Logo */}
          <BatuTVBrandLogo
            height={44}
            theme="light"
            showSlogan={true}
            className="transition-transform duration-200 group-hover:scale-[1.02]"
          />
          
          <div className="hidden lg:flex flex-col border-l border-slate-200 pl-3">
            <span className="text-[12px] font-bold tracking-tight text-slate-800 uppercase">
              Portal Berita Terkini &amp; Terpercaya
            </span>
            <span className="text-[10.5px] text-slate-500 font-medium">
              Kabar Kota Batu, Malang Raya, Jawa Timur &amp; Nasional
            </span>
          </div>
        </div>

        {/* Right Action Tools on Desktop */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Quick Search Bar (Desktop) */}
          <div className="hidden md:block">
            <button
              id="btn-desktop-search-trigger"
              onClick={onOpenSearch}
              className="flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 text-xs px-3.5 py-2 rounded-full border border-slate-200 transition w-44 lg:w-64"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="truncate">Cari berita terkini...</span>
              <kbd className="hidden lg:inline-block ml-auto text-[10px] bg-white border border-slate-300 px-1.5 py-0.5 rounded text-slate-400 shadow-2xs font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Bookmarks Counter */}
          <button
            id="btn-bookmarks-drawer"
            onClick={onOpenBookmarks}
            className="relative p-2 text-slate-700 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
            title="Berita Tersimpan"
            aria-label="Berita Tersimpan"
          >
            <Bookmark className="w-5 h-5" />
            {bookmarkCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Live Streaming Button on Header */}
          <button
            id="btn-header-live-stream"
            onClick={onOpenLiveStream}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-md transition shadow-sm"
          >
            <Tv className="w-4 h-4" />
            <span className="hidden sm:inline">LIVE STREAMING</span>
            <span className="sm:hidden text-xs">LIVE</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
