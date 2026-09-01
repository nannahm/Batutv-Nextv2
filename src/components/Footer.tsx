import React, { useState, useEffect } from 'react';
import { CategoryItem } from '../types/news';
import { FooterConfig, getStoredFooterConfig, FOOTER_UPDATED_EVENT, generateOrganizationSchema } from '../data/footerAdminStore';
import { getStoredSiteSettings, SITE_SETTINGS_UPDATED_EVENT } from '../data/siteSettingsStore';
import { SiteSettings } from '../types/siteSettings';
import { BatuTVBrandLogo } from './common/BatuTVBrandLogo';

interface FooterProps {
  categories?: CategoryItem[];
  onSelectCategory?: (slug: string) => void;
  onOpenLiveStream?: () => void;
  onOpenPrivacyModal?: () => void;
  onNavigateAdmin?: () => void;
  onNavigate?: (path: string) => void;
}

/**
 * S08 — SITE FOOTER (BATUTV)
 * 
 * Terintegrasi penuh secara dinamis dengan MASTER DATA → FOOTER MANAGEMENT:
 * - Layout, styling (#222222), tipografi, dan responsive design 100% dipertahankan.
 * - Konten (Media Info, Link Perusahaan, Link Legal, Sosial Media, Copyright, & Logo)
 *   bersumber langsung dari Footer Management CMS dan sinkron secara real-time.
 */
export const Footer: React.FC<FooterProps> = ({ onNavigateAdmin, onNavigate }) => {
  const [config, setConfig] = useState<FooterConfig>(() => getStoredFooterConfig());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => getStoredSiteSettings());

  // Listen to live updates from CMS without requiring full page reload
  useEffect(() => {
    const handleFooterUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<FooterConfig>;
      if (customEvent.detail) {
        setConfig(customEvent.detail);
      } else {
        setConfig(getStoredFooterConfig());
      }
    };

    const handleSiteSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteSettings>;
      if (customEvent.detail) {
        setSiteSettings(customEvent.detail);
      } else {
        setSiteSettings(getStoredSiteSettings());
      }
    };

    window.addEventListener(FOOTER_UPDATED_EVENT, handleFooterUpdate);
    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, handleSiteSettingsUpdate);
    return () => {
      window.removeEventListener(FOOTER_UPDATED_EVENT, handleFooterUpdate);
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, handleSiteSettingsUpdate);
    };
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (!path) return;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      // External link - let default navigation proceed
      return;
    }
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      if (onNavigate) {
        onNavigate(path);
      }
    }
  };

  const orgSchema = generateOrganizationSchema(config);

  return (
    <footer id="s08-site-footer" className="w-full bg-[#222222] text-white pt-8 pb-10 select-none relative">
      {/* Organization SEO Schema (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      <div className="w-full max-w-[1020px] mx-auto px-3.5 sm:px-4 md:px-0 flex flex-col items-center text-center">
        
        {/* ========================================================= */}
        {/* 0. BRAND LOGO: BatuTV (Footer Centered Vector)            */}
        {/* ========================================================= */}
        {config.logo?.showLogo !== false && (
          <div className="mb-6 flex justify-center">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="group inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-md"
              aria-label="BatuTV - Televisi Kota Batu"
            >
              {config.logo?.logoUrl &&
              config.logo.logoUrl !== '/brand/batutv-logo.svg' &&
              config.logo.logoUrl !== '/brand/batutv-logo-publisher.png' ? (
                <img
                  src={config.logo.logoUrl}
                  alt={config.logo.altText || 'Logo BatuTV Footer'}
                  className="h-9 sm:h-11 max-w-[240px] object-contain"
                />
              ) : (
                <BatuTVBrandLogo
                  height={38}
                  variant="full"
                  theme="dark"
                  showSlogan={true}
                  className="transition-transform duration-200 group-hover:scale-105 opacity-95 hover:opacity-100"
                />
              )}
            </a>
          </div>
        )}

        {/* ========================================================= */}
        {/* 1. SOCIAL MEDIA SECTION                                    */}
        {/* ========================================================= */}
        {config.socialMedia?.showSection !== false && (
          <div className="flex flex-col items-center space-y-3 mb-6">
            {config.socialMedia?.headingText !== '' && (
              <span className="text-xs sm:text-[13px] font-normal text-slate-300">
                {config.socialMedia?.headingText || 'Ikuti kami di:'}
              </span>
            )}

            <div className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
              {/* Facebook (Official Meta Vector Circle) */}
              {config.socialMedia.showFacebook !== false && config.socialMedia.facebookUrl && (
                <a
                  href={config.socialMedia.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Facebook ${config.mediaInfo.mediaName}`}
                  title="Facebook"
                  className="w-8 h-8 rounded-full bg-[#1877F2] hover:bg-[#166fe5] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-none cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}

              {/* X / Twitter (Official Monogram Vector Circle) */}
              {config.socialMedia.showXTwitter !== false && config.socialMedia.xTwitterUrl && (
                <a
                  href={config.socialMedia.xTwitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`X / Twitter ${config.mediaInfo.mediaName}`}
                  title="X"
                  className="w-8 h-8 rounded-full bg-black hover:bg-neutral-900 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-none cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}

              {/* Google News (Official Google News Vector Circle) */}
              {config.socialMedia.showGoogleNews !== false && (
                <a
                  href={config.socialMedia.googleNewsUrl || 'https://news.google.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Google News ${config.mediaInfo.mediaName}`}
                  title="Google News"
                  className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 shadow-none cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M3 4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4z" />
                    <path fill="#EA4335" d="M14.5 7h4v10h-4z" />
                    <path fill="#FBBC05" d="M5.5 7h7v2.5h-7z" />
                    <path fill="#34A853" d="M5.5 11h7v2.5h-7z" />
                    <path fill="#ffffff" d="M5.5 15h7v1.8h-7z" />
                  </svg>
                </a>
              )}

              {/* TikTok (Official TikTok Note Vector Circle) */}
              {config.socialMedia.showTiktok !== false && config.socialMedia.tiktokUrl && (
                <a
                  href={config.socialMedia.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`TikTok ${config.mediaInfo.mediaName}`}
                  title="TikTok"
                  className="w-8 h-8 rounded-full bg-black hover:bg-neutral-900 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-none cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.78 1.53-.05 2.87-1.16 3.15-2.66.07-.37.09-.76.09-1.14V.02z" />
                  </svg>
                </a>
              )}

              {/* Instagram (Official Instagram Camera Vector Circle) */}
              {config.socialMedia.showInstagram !== false && config.socialMedia.instagramUrl && (
                <a
                  href={config.socialMedia.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Instagram ${config.mediaInfo.mediaName}`}
                  title="Instagram"
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-none cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}

              {/* YouTube (Official YouTube Play Vector Circle) */}
              {config.socialMedia.showYoutube !== false && config.socialMedia.youtubeUrl && (
                <a
                  href={config.socialMedia.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`YouTube ${config.mediaInfo.mediaName}`}
                  title="YouTube"
                  className="w-8 h-8 rounded-full bg-[#FF0000] hover:bg-[#e60000] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-none cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}

              {/* Telegram (Official Paper Plane Vector Circle) */}
              {config.socialMedia.showTelegram !== false && config.socialMedia.telegramUrl && (
                <a
                  href={config.socialMedia.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Telegram ${config.mediaInfo.mediaName}`}
                  title="Telegram"
                  className="w-8 h-8 rounded-full bg-[#24A1DE] hover:bg-[#2092c9] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-none cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.37 0 12C0 18.63 5.37 24 12 24C18.63 24 24 18.63 24 12C24 5.37 18.63 0 12 0ZM17.9 8.24L15.93 17.52C15.78 18.18 15.39 18.34 14.84 18.03L11.84 15.82L10.39 17.21C10.23 17.37 10.1 17.5 9.79 17.5L10.01 14.45L15.56 9.44C15.8 9.22 15.51 9.1 15.19 9.31L8.33 13.63L5.37 12.7C4.73 12.5 4.71 12.06 5.5 11.75L17.07 7.29C17.61 7.09 18.08 7.42 17.9 8.24Z" />
                  </svg>
                </a>
              )}

              {/* LinkedIn (Official LinkedIn In Vector Circle) */}
              {config.socialMedia.showLinkedIn !== false && config.socialMedia.linkedInUrl && (
                <a
                  href={config.socialMedia.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`LinkedIn ${config.mediaInfo.mediaName}`}
                  title="LinkedIn"
                  className="w-8 h-8 rounded-full bg-[#0077B5] hover:bg-[#00669c] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-none cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. SUBTLE HORIZONTAL DIVIDER                              */}
        {/* ========================================================= */}
        <div className="w-full border-t border-slate-700/60 my-4 sm:my-5" />

        {/* ========================================================= */}
        {/* 3. SITE NAVIGATION LINKS (Bold White Centered Row)        */}
        {/* ========================================================= */}
        {(() => {
          const ftTypo = siteSettings?.typography?.footerMenu || {
            fontSize: 13,
            fontWeight: '700',
            gap: 'normal',
            textColor: '#ffffff',
            hoverColor: '#ef4444',
          };
          const getGapClass = (gap?: string) => {
            if (gap === 'compact') return 'gap-x-3 sm:gap-x-4 gap-y-2';
            if (gap === 'spacious') return 'gap-x-6 sm:gap-x-10 gap-y-3';
            return 'gap-x-4 sm:gap-x-7 gap-y-2.5';
          };

          return (
            <nav
              aria-label="Navigasi Footer Portal"
              style={{
                fontSize: ftTypo.fontSize ? `${ftTypo.fontSize}px` : undefined,
                fontWeight: ftTypo.fontWeight || 700,
                color: ftTypo.textColor || undefined,
              }}
              className={`flex flex-wrap items-center justify-center ${getGapClass(
                ftTypo.gap
              )} my-3 tracking-normal`}
            >
              {config.companyLinks.tentangKamiUrl && (
                <a
                  href={config.companyLinks.tentangKamiUrl}
                  onClick={(e) => handleLinkClick(e, config.companyLinks.tentangKamiUrl)}
                  className="hover:text-red-500 transition-colors"
                >
                  Tentang Kami
                </a>
              )}
              {config.companyLinks.redaksiUrl && (
                <a
                  href={config.companyLinks.redaksiUrl}
                  onClick={(e) => handleLinkClick(e, config.companyLinks.redaksiUrl)}
                  className="hover:text-red-500 transition-colors"
                >
                  Redaksi
                </a>
              )}
              {config.companyLinks.kontakUrl && (
                <a
                  href={config.companyLinks.kontakUrl}
                  onClick={(e) => handleLinkClick(e, config.companyLinks.kontakUrl)}
                  className="hover:text-red-500 transition-colors"
                >
                  Kontak
                </a>
              )}
              {config.companyLinks.karirUrl && (
                <a
                  href={config.companyLinks.karirUrl}
                  onClick={(e) => handleLinkClick(e, config.companyLinks.karirUrl)}
                  className="hover:text-red-500 transition-colors"
                >
                  Karir
                </a>
              )}
              {config.legalLinks.pedomanMediaSiberUrl && (
                <a
                  href={config.legalLinks.pedomanMediaSiberUrl}
                  onClick={(e) => handleLinkClick(e, config.legalLinks.pedomanMediaSiberUrl)}
                  className="hover:text-red-500 transition-colors"
                >
                  Pedoman Media Siber
                </a>
              )}
              {config.legalLinks.kodeEtikJurnalistikUrl && (
                <a
                  href={config.legalLinks.kodeEtikJurnalistikUrl}
                  onClick={(e) => handleLinkClick(e, config.legalLinks.kodeEtikJurnalistikUrl)}
                  className="hover:text-red-500 transition-colors"
                >
                  Kode Etik
                </a>
              )}
              {config.legalLinks.disclaimerUrl && (
                <a
                  href={config.legalLinks.disclaimerUrl}
                  onClick={(e) => handleLinkClick(e, config.legalLinks.disclaimerUrl)}
                  className="hover:text-red-500 transition-colors"
                >
                  Disclaimer
                </a>
              )}
              {config.legalLinks.privacyPolicyUrl && (
                <a
                  href={config.legalLinks.privacyPolicyUrl}
                  onClick={(e) => handleLinkClick(e, config.legalLinks.privacyPolicyUrl)}
                  className="hover:text-red-500 transition-colors"
                >
                  Privacy Policy
                </a>
              )}
              {config.legalLinks.termsOfServiceUrl && (
                <a
                  href={config.legalLinks.termsOfServiceUrl}
                  onClick={(e) => handleLinkClick(e, config.legalLinks.termsOfServiceUrl)}
                  className="hover:text-red-500 transition-colors"
                >
                  Terms of Service
                </a>
              )}
            </nav>
          );
        })()}

        {/* ========================================================= */}
        {/* 4. COPYRIGHT & NETWORK SUBTITLE                            */}
        {/* ========================================================= */}
        <div className="mt-5 mb-4 space-y-1 text-center">
          <p className="text-xs sm:text-[13px] text-slate-300 font-normal">
            {config.copyright.copyrightText || 'BatuTV ©2026 | All Rights Reserved'}
          </p>
          {config.copyright.networkSubtitle && (
            <p className="text-xs sm:text-[13px] text-slate-400 font-normal">
              {config.copyright.networkSubtitle}
            </p>
          )}
        </div>

        {/* ========================================================= */}
        {/* 5. MEDIA NETWORK BRANDS LOGO ROW (Dynamic from CMS)       */}
        {/* ========================================================= */}
        {config.mediaNetworks && config.mediaNetworks.length > 0 && (
          <div className="flex items-center justify-center gap-4 sm:gap-7 flex-wrap pt-2 opacity-95">
            {config.mediaNetworks
              .filter((item) => item.isActive !== false)
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((item) => {
                const renderLogoContent = () => {
                  if (item.logoUrl) {
                    return (
                      <img
                        src={item.logoUrl}
                        alt={item.altText || item.name}
                        className="h-5 sm:h-6 max-w-[120px] object-contain"
                      />
                    );
                  }

                  switch (item.presetStyle) {
                    case 'viva':
                      return (
                        <div className="flex items-center gap-1.5 text-white">
                          <span className="font-black text-lg sm:text-xl tracking-tighter">VIVA</span>
                          <div className="text-[8px] sm:text-[9px] font-semibold leading-tight text-left text-slate-300">
                            News &<br />Insights
                          </div>
                        </div>
                      );
                    case 'vlix':
                      return (
                        <div className="flex items-center tracking-tighter font-black text-lg sm:text-xl">
                          <span className="text-[#00c2ff]">V</span>
                          <span className="text-[#ff2d55]">L</span>
                          <span className="text-[#00c2ff]">I</span>
                          <span className="text-[#ff2d55]">X</span>
                        </div>
                      );
                    case 'tvonenews':
                      return (
                        <div className="flex items-center font-bold text-white text-base sm:text-lg tracking-tight">
                          <span className="text-white">tv</span>
                          <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#b91c1c] text-white text-[10px] sm:text-xs font-black inline-flex items-center justify-center mx-0.5">
                            O
                          </span>
                          <span className="text-white">nenews.com</span>
                        </div>
                      );
                    case 'antvklik':
                      return (
                        <div className="flex items-center font-bold text-sm sm:text-base">
                          <span className="text-white text-xs sm:text-sm font-semibold">antv</span>
                          <span className="text-[#e11d48] font-black text-sm sm:text-base italic">klik</span>
                          <span className="text-[8px] text-slate-400">.com</span>
                        </div>
                      );
                    case 'intipseleb':
                      return (
                        <div className="flex items-center gap-1 text-xs sm:text-sm font-black tracking-tight text-[#f43f5e]">
                          <span>★</span>
                          <span className="text-white font-extrabold">INTIP</span>
                          <span className="text-[#f43f5e]">SELEB</span>
                        </div>
                      );
                    case 'jagodangdut':
                      return (
                        <div className="flex items-center text-xs sm:text-sm font-bold text-white">
                          <span>jago</span>
                          <span className="text-[#f97316] font-extrabold mx-0.5">♪</span>
                          <span className="text-[#f97316]">dangdut</span>
                        </div>
                      );
                    default:
                      return (
                        <span className="font-bold text-xs sm:text-sm text-slate-200 hover:text-white transition-colors">
                          {item.name}
                        </span>
                      );
                  }
                };

                if (item.url) {
                  return (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={item.name}
                      aria-label={item.name}
                      className="hover:opacity-85 active:scale-95 transition-all inline-flex items-center"
                    >
                      {renderLogoContent()}
                    </a>
                  );
                }

                return (
                  <div key={item.id} className="inline-flex items-center" title={item.name}>
                    {renderLogoContent()}
                  </div>
                );
              })}
          </div>
        )}

      </div>
    </footer>
  );
};


