import React, { useState, useEffect, useRef } from 'react';
import { Home, ChevronDown, Search, Radio, User } from 'lucide-react';
import { NavItemWithChildren, SubNavigationItem, SubNavSettings } from '../types/navigation';
import {
  getPublicNavigationTree,
  isNavItemActive,
  getPublicSubNavItems,
  getStoredSubNavSettings,
} from '../data/navigationStore';
import { getStoredSiteSettings, SITE_SETTINGS_UPDATED_EVENT } from '../data/siteSettingsStore';
import { SiteSettings } from '../types/siteSettings';

export interface PrimaryNavItem {
  id: string;
  label: string;
  href: string;
  slug: string;
  children?: PrimaryNavItem[];
}

interface PrimaryNavigationProps {
  isScrolled?: boolean;
  activeSlug?: string;
  currentPath?: string;
  onSelectNav?: (slug: string, url?: string) => void;
  onNavigate?: (url: string) => void;
  onGoHome?: () => void;
  // Backwards compatibility optional props
  items?: any[];
  onOpenLiveStream?: () => void;
  onOpenUserAccount?: () => void;
  onOpenSearch?: () => void;
}

/**
 * S02 — PRIMARY NAVIGATION & SUB-NAV BAR (TVOne News Style)
 * 
 * - Sticky pinned crimson red navigation bar
 * - Multi-level dropdown submenus with animated pink shimmer on hover
 * - Right Action Controls: LIVESTREAM, User Profile, Search
 * - Attached Sub-Navigation bar with BREAKING NEWS badge and regional / tag / category filters
 */
export const PrimaryNavigation: React.FC<PrimaryNavigationProps> = ({
  isScrolled = false,
  activeSlug = 'home',
  currentPath = '/',
  onSelectNav,
  onNavigate,
  onGoHome,
  onOpenLiveStream,
  onOpenUserAccount,
  onOpenSearch,
}) => {
  const [navTree, setNavTree] = useState<NavItemWithChildren[]>(() => getPublicNavigationTree());
  const [subNavItems, setSubNavItems] = useState<SubNavigationItem[]>(() => getPublicSubNavItems());
  const [subNavSettings, setSubNavSettings] = useState<SubNavSettings>(() => getStoredSubNavSettings());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => getStoredSiteSettings());
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const navRef = useRef<HTMLElement | null>(null);

  // Sync navigation data and listen for live updates from Dashboard
  useEffect(() => {
    const syncData = () => {
      setNavTree(getPublicNavigationTree());
      setSubNavItems(getPublicSubNavItems());
      setSubNavSettings(getStoredSubNavSettings());
    };

    const syncSettings = (e?: Event) => {
      const customEvent = e as CustomEvent<SiteSettings>;
      if (customEvent?.detail) {
        setSiteSettings(customEvent.detail);
      } else {
        setSiteSettings(getStoredSiteSettings());
      }
    };

    syncData();
    syncSettings();

    window.addEventListener('batutv_navigation_updated', syncData);
    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, syncSettings);
    window.addEventListener('storage', syncData);

    return () => {
      window.removeEventListener('batutv_navigation_updated', syncData);
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, syncSettings);
      window.removeEventListener('storage', syncData);
    };
  }, []);


  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdownId(null);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: NavItemWithChildren,
    slug: string,
    url: string
  ) => {
    // Allow external links or open in new tab to function natively
    if (item.type === 'external' || item.openNewTab || url.startsWith('http://') || url.startsWith('https://')) {
      setOpenDropdownId(null);
      return;
    }

    // Allow new tab/window shortcuts (Ctrl+Click, Cmd+Click, Shift+Click, Middle Click)
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }

    e.preventDefault();
    setOpenDropdownId(null);

    if (onSelectNav) {
      onSelectNav(slug, url);
    } else if (onNavigate) {
      onNavigate(url);
    }
  };

  const handleSubNavClick = (e: React.MouseEvent, item: SubNavigationItem) => {
    if (item.openNewTab || item.targetType === 'external' || item.url.startsWith('http://') || item.url.startsWith('https://')) {
      return;
    }
    e.preventDefault();
    setSelectedRegion(item.slug);
    if (onSelectNav) {
      onSelectNav(item.slug, item.url);
    } else if (onNavigate) {
      onNavigate(item.url);
    }
  };

  return (
    <div
      ref={navRef}
      id="s02-navigation-sticky-wrapper"
      className={`navigation-sticky-wrapper hidden md:block sticky top-0 z-40 w-full select-none transition-shadow duration-200 ${
        isScrolled ? 'shadow-md shadow-black/15' : ''
      }`}
    >
      {/* 1. PRIMARY RED NAVIGATION BAR (Boxed when at top, Full-width when scrolled) */}
      <nav
        id="s02-primary-navigation"
        aria-label="Navigasi Utama"
        className={`primary-navigation w-full transition-colors duration-200 ${
          isScrolled
            ? 'bg-[#940a13] border-b border-red-950/20'
            : 'bg-transparent'
        }`}
      >
        <div className="w-full max-w-[1020px] mx-auto px-3.5 sm:px-4 md:px-0">
          <div
            className={`flex items-center justify-between h-[38px] sm:h-[41px] text-white transition-all duration-200 overflow-visible ${
              isScrolled
                ? 'w-full bg-transparent'
                : 'w-full bg-[#940a13] shadow-xs'
            }`}
          >
            <div className="flex items-center h-full overflow-visible">
              {/* Navigation Category List */}
              <div className="navigation-list-wrapper flex items-center overflow-x-auto md:overflow-visible no-scrollbar h-full">
                {(() => {
                  const navTypo = siteSettings?.typography?.navigation || {
                    fontSize: 12.5,
                    fontWeight: '900',
                    letterSpacing: 'wide',
                    textTransform: 'uppercase',
                  };

                  const getLetterSpacingVal = (spacing?: string) => {
                    if (spacing === 'tight') return '-0.025em';
                    if (spacing === 'normal') return '0em';
                    if (spacing === 'wider') return '0.05em';
                    return '0.025em';
                  };

                  const sharedMenuStyle: React.CSSProperties = {
                    fontSize: navTypo.fontSize ? `${navTypo.fontSize}px` : '12.5px',
                    fontWeight: navTypo.fontWeight ? (navTypo.fontWeight as any) : '900',
                    letterSpacing: getLetterSpacingVal(navTypo.letterSpacing),
                    textTransform: (navTypo.textTransform || 'uppercase') as React.CSSProperties['textTransform'],
                  };

                  return (
                    <ul
                      style={sharedMenuStyle}
                      className="navigation-list flex items-center justify-start text-[11.5px] sm:text-[12px] lg:text-[12.5px] font-black tracking-wide whitespace-nowrap h-full"
                    >
                      {navTree.map((item) => {
                        const hasChildren = Boolean(item.children && item.children.length > 0);
                        const isActive = isNavItemActive(item, currentPath, activeSlug);
                        const isDropdownOpen = openDropdownId === item.id;
                        const isHomeIcon = item.slug === 'home' || item.icon === 'home';

                        return (
                          <li
                            key={item.id}
                            className="navigation-item relative group flex-shrink-0 h-full flex items-center"
                            onMouseEnter={() => hasChildren && setOpenDropdownId(item.id)}
                            onMouseLeave={() => hasChildren && setOpenDropdownId(null)}
                          >
                            {/* LEVEL 1: PARENT MENU LINK */}
                            <a
                              id={`s02-nav-${item.slug}`}
                              href={item.url}
                              target={item.openNewTab ? '_blank' : undefined}
                              rel={item.openNewTab ? 'noopener noreferrer' : undefined}
                              onClick={(e) => handleLinkClick(e, item, item.slug, item.url)}
                              aria-haspopup={hasChildren ? 'true' : undefined}
                              aria-expanded={hasChildren ? (isDropdownOpen ? 'true' : 'false') : undefined}
                              aria-current={isActive ? 'page' : undefined}
                              style={sharedMenuStyle}
                              className={`nav-link menu-hover-animated h-full inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 transition-all duration-200 relative focus:outline-none focus-visible:ring-1 focus-visible:ring-white/80 text-white ${
                                isDropdownOpen
                                  ? 'bg-[#c81e28] text-white shadow-inner'
                                  : 'hover:bg-[#c81e28] hover:text-white'
                              }`}
                            >
                              {isHomeIcon ? (
                                <span className="flex items-center justify-center p-0.5" title={item.label || 'Home'}>
                                  <Home className="w-4 h-4 text-white shrink-0 stroke-[2.4]" aria-hidden="true" />
                                  <span className="sr-only">{item.label || 'Home'}</span>
                                </span>
                              ) : (
                                <span>{item.label}</span>
                              )}
                            </a>

                            {/* LEVEL 2: SUBMENU / DROPDOWN CONTAINER WITH PROPORTIONAL GAP & ROUNDED CORNERS */}
                            {hasChildren && (
                              <div
                                className={`absolute top-full left-0 pt-1 sm:pt-1.5 z-50 min-w-[145px] max-w-[220px] transition-all duration-150 ease-out ${
                                  isDropdownOpen
                                    ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                                    : 'opacity-0 invisible -translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:pointer-events-auto'
                                }`}
                              >
                                <ul
                                  role="menu"
                                  aria-label={`Submenu ${item.label}`}
                                  className="bg-[#c0232a] rounded-lg shadow-2xl overflow-hidden divide-y divide-black/15 border border-black/10"
                                >
                                  {item.children!.map((child) => {
                                    const isChildActive = isNavItemActive(child, currentPath, activeSlug);

                                    return (
                                      <li key={child.id} role="none">
                                        <a
                                          id={`s02-subnav-${child.slug}`}
                                          href={child.url}
                                          role="menuitem"
                                          target={child.openNewTab ? '_blank' : undefined}
                                          rel={child.openNewTab ? 'noopener noreferrer' : undefined}
                                          aria-current={isChildActive ? 'page' : undefined}
                                          onClick={(e) => handleLinkClick(e, child, child.slug, child.url)}
                                          style={sharedMenuStyle}
                                          className={`block px-4 py-2 text-white text-left transition-colors duration-150 focus:outline-none whitespace-nowrap ${
                                            isChildActive
                                              ? 'bg-[#9f151c] text-white'
                                              : 'hover:bg-[#d4272f] hover:text-white'
                                          }`}
                                        >
                                          {child.label}
                                        </a>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  );
                })()}
              </div>
            </div>

            {/* Right Action Icons: LIVESTREAM, User Profile & Search (Seamless without divider lines, close spacing) */}
            <div className="flex-shrink-0 flex items-center h-full ml-auto gap-1 sm:gap-1.5">
              {/* 1. LIVESTREAM BUTTON (Solid dot + Bold LIVESTREAM text) */}
              {onOpenLiveStream && (
                <button
                  id="s02-btn-livestream"
                  onClick={onOpenLiveStream}
                  title="Tonton Live Streaming BatuTV"
                  aria-label="Tonton Live Streaming"
                  className="menu-hover-animated h-full flex items-center gap-1.5 px-2 sm:px-2.5 hover:bg-[#c81e28] text-white transition-all cursor-pointer focus:outline-none"
                >
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e05260] border border-white/40"></span>
                  </span>
                  <span className="font-black text-[12px] sm:text-[12.5px] uppercase tracking-tight text-white leading-none">
                    LIVESTREAM
                  </span>
                </button>
              )}

              {/* 2. USER PROFILE / CMS ACCOUNT BUTTON (White ring circular avatar silhouette) */}
              <button
                id="s02-btn-user"
                onClick={onOpenUserAccount}
                title="Masuk ke Akun / Login CMS"
                aria-label="Masuk ke Akun"
                className="menu-hover-animated h-full px-1.5 sm:px-2 hover:bg-[#c81e28] text-white transition-all focus:outline-none cursor-pointer flex items-center justify-center"
              >
                <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full border-[1.5px] border-white bg-zinc-600/90 flex items-center justify-center overflow-hidden shadow-2xs">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-white fill-white translate-y-0.5"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </button>

              {/* 3. SEARCH MAGNIFYING BUTTON (Bold white magnifying glass) */}
              {onOpenSearch && (
                <button
                  id="s02-btn-search"
                  onClick={onOpenSearch}
                  title="Pencarian Berita"
                  aria-label="Buka Pencarian"
                  className="menu-hover-animated h-full px-1.5 sm:px-2 hover:bg-[#c81e28] text-white transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
                >
                  <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white stroke-[3.2]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 2. SUB-NAVIGATION BAR (Breaking News Badge + Regional/Category/Tag Links) */}
      <div
        id="sub-navigation-bar"
        className={`w-full transition-colors duration-200 ${
          isScrolled
            ? 'bg-[#f1f3f5] border-b border-slate-300/80 shadow-2xs'
            : 'bg-transparent py-0'
        }`}
      >
        <div className="w-full max-w-[1020px] mx-auto px-3.5 sm:px-4 md:px-0">
          <div
            className={`w-full flex items-center gap-3 overflow-hidden py-1 px-1 sm:px-2 ${
              isScrolled
                ? 'bg-transparent'
                : 'bg-[#f1f3f5] border border-t-0 border-slate-200/90 shadow-2xs px-3'
            }`}
          >
            {/* Breaking News Double-pill Badge */}
            {subNavSettings.showBreakingBadge && (
              <a
                href={subNavSettings.breakingNewsUrl || '/kategori/daerah'}
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate(subNavSettings.breakingNewsUrl || '/kategori/daerah');
                  }
                }}
                className="flex items-center shrink-0 shadow-2xs rounded-xs overflow-hidden text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider group cursor-pointer"
                title="Buka Berita Kilat"
              >
                <span className="flex items-center gap-1.5 bg-[#0c2340] text-white px-2 py-0.5 group-hover:bg-[#13335a] transition-colors">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  {subNavSettings.breakingBadgeText.split(' ')[0] || 'BREAKING'}
                </span>
                <span className="bg-[#940a13] text-white px-1.5 py-0.5 group-hover:bg-[#b00c17] transition-colors">
                  {subNavSettings.breakingBadgeText.split(' ').slice(1).join(' ') || 'NEWS'}
                </span>
              </a>
            )}

            {/* Sub-Navigation Quick Links (Regional, Category, Tag) */}
            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-0.5 text-xs sm:text-[12.5px] font-bold text-slate-700 whitespace-nowrap">
              {subNavItems.map((sub) => {
                const isSubActive =
                  selectedRegion === sub.slug ||
                  (currentPath && currentPath === sub.url);

                return (
                  <a
                    key={sub.id}
                    href={sub.url}
                    onClick={(e) => handleSubNavClick(e, sub)}
                    target={sub.openNewTab ? '_blank' : undefined}
                    rel={sub.openNewTab ? 'noopener noreferrer' : undefined}
                    className={`inline-flex items-center gap-1 transition-colors cursor-pointer hover:text-[#940a13] ${
                      isSubActive
                        ? 'text-[#940a13] font-black underline underline-offset-4'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>{sub.label}</span>
                    {sub.badge && (
                      <span className="text-[9px] font-black px-1 py-0.2 bg-[#940a13] text-white rounded-xs">
                        {sub.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

