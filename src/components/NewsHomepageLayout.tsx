import React from 'react';

export interface NewsHomepageLayoutProps {
  children?: React.ReactNode;
  mainContent?: React.ReactNode;
  sidebarContent?: React.ReactNode;
  topBar?: React.ReactNode;
  heroHeadline?: React.ReactNode;
  className?: string;
}

/**
 * Pixel-Scaled News Homepage Layout
 * 
 * Specifications:
 * - Container Utama: max-w-[1020px] mx-auto (Centered, strict boundary)
 * - 2-Kolom Desktop Composition (md:flex-row, items-start):
 *   - Kolom Utama Berita (Main Content Area): 731px (w-full md:w-[731px] md:max-w-[731px] md:shrink-0)
 *   - Kolom Sidebar (Sidebar Widget Area): 255px (w-full md:w-[255px] md:max-w-[255px] md:shrink-0)
 *   - Gutter / Gap: Presisi 34px (md:gap-[34px]) => 731px + 34px + 255px = 1020px
 * - Rasio Dimensi Komponen:
 *   - Headline Utama: 731px x 411px (16:9 aspect ratio)
 *   - Thumbnail Berita Sekunder: 153px x 86px (16:9 aspect ratio)
 *   - Video Shorts: 128px x 227px (9:16 portrait aspect ratio)
 *   - Slot Banner Iklan Sidebar: 255px x 213px (Medium) & 255px x 510px (Skyscraper)
 * - Mobile Responsiveness: Under 768px (md), collapses into fluid single-column flow
 * - Semantik: Semantic HTML5 (<main>, <article>, <aside>, <time>, <nav>)
 */
export const NewsHomepageLayout: React.FC<NewsHomepageLayoutProps> = ({
  children,
  mainContent,
  sidebarContent,
  topBar,
  heroHeadline,
  className = '',
}) => {
  return (
    <main
      id="pixel-scaled-homepage-layout"
      className={`w-full flex-1 flex flex-col items-center select-none font-sans ${className}`}
    >
      {/* Top Bar / Topics Area (Full width restricted to max 1020px) */}
      {topBar && (
        <section aria-label="Topik Hangat Portal" className="w-full">
          <div className="w-full max-w-[1020px] mx-auto px-3.5 sm:px-4 md:px-0">
            {topBar}
          </div>
        </section>
      )}

      {/* Hero Headline Section (Full width restricted to max 1020px) */}
      {heroHeadline && (
        <section aria-label="Berita Utama & Headline Portal" className="w-full">
          <div className="w-full max-w-[1020px] mx-auto px-3.5 sm:px-4 md:px-0">
            {heroHeadline}
          </div>
        </section>
      )}

      {/* Main 2-Column Grid Container (1020px = 731px Main + 34px Gap + 255px Sidebar) */}
      {(mainContent || sidebarContent) && (
        <div className="w-full max-w-[1020px] mx-auto px-3.5 sm:px-4 md:px-0 pt-2 pb-12">
          <div className="w-full flex flex-col md:flex-row items-start md:gap-[34px] gap-8">
            {/* Left Column (Main Content Area): 731px on desktop */}
            <div className="w-full md:w-[731px] md:max-w-[731px] md:shrink-0 flex flex-col space-y-8 sm:space-y-10">
              {mainContent}
            </div>

            {/* Right Column (Sidebar Widget Area): 255px on desktop */}
            <aside
              aria-label="Sidebar Berita & Widget Interaktif"
              className="w-full md:w-[255px] md:max-w-[255px] md:shrink-0 flex flex-col space-y-6 md:sticky md:top-[68px] self-start"
            >
              {sidebarContent}
            </aside>
          </div>
        </div>
      )}

      {/* Fallback Direct Children Rendering */}
      {children && (
        <div className="w-full max-w-[1020px] mx-auto px-3.5 sm:px-4 md:px-0">
          {children}
        </div>
      )}
    </main>
  );
};

/**
 * Pixel-Scaled Sidebar Ad Banner Component
 * Supports Standard Sizes:
 * - Medium Banner: 255px x 213px
 * - Skyscraper Banner: 255px x 510px
 */
export interface SidebarAdBannerSlotProps {
  id?: string;
  size?: 'medium' | 'skyscraper';
  bannerUrl?: string;
  targetUrl?: string;
  title?: string;
  altText?: string;
  onBannerClick?: () => void;
  className?: string;
}

export const SidebarAdBannerSlot: React.FC<SidebarAdBannerSlotProps> = ({
  id = 'sidebar-ad-slot',
  size = 'medium',
  bannerUrl,
  targetUrl = '#',
  title = 'Sponsor & Promosi BatuTV',
  altText = 'Iklan Promosi BatuTV',
  onBannerClick,
  className = '',
}) => {
  const isMedium = size === 'medium';
  const dimensionClass = isMedium
    ? 'w-full md:w-[255px] h-[213px] min-h-[213px] max-h-[213px]'
    : 'w-full md:w-[255px] h-[510px] min-h-[510px] max-h-[510px]';

  return (
    <div
      id={id}
      aria-label={title}
      className={`sidebar-ad-slot bg-slate-100 rounded-xl border border-slate-200/80 overflow-hidden flex flex-col items-center justify-center text-center relative group ${dimensionClass} ${className}`}
    >
      {/* Sponsored Tag */}
      <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 text-white text-[9.5px] font-black uppercase tracking-wider rounded backdrop-blur-xs z-10">
        IKLAN
      </span>

      {bannerUrl ? (
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onBannerClick}
          className="w-full h-full block focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          aria-label={altText}
        >
          <img
            src={bannerUrl}
            alt={altText}
            className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300 pointer-events-none"
            loading="lazy"
          />
        </a>
      ) : (
        <div className="p-4 flex flex-col items-center justify-center text-slate-400 space-y-1.5 select-none">
          <div className="w-8 h-8 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-500 font-bold text-xs">
            📢
          </div>
          <span className="text-xs font-bold text-slate-600 font-sans">{title}</span>
          <span className="text-[11px] text-slate-400 font-mono">
            {isMedium ? '255 × 213 px' : '255 × 510 px'}
          </span>
        </div>
      )}
    </div>
  );
};
