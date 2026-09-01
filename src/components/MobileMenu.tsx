import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronDown,
  Flame,
  MapPin,
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  Phone,
  Home,
} from 'lucide-react';
import { CategoryItem } from '../types/news';
import { NavItemWithChildren } from '../types/navigation';
import { getPublicNavigationTree, isNavItemActive } from '../data/navigationStore';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: CategoryItem[];
  activeCategory: string;
  currentPath?: string;
  onSelectCategory: (slug: string, url?: string) => void;
  onNavigate?: (url: string) => void;
  onOpenLiveStream?: () => void;
  onOpenSearch?: () => void;
  hotTopics: string[];
  onSelectTopic: (topic: string) => void;
  onNavigateLogin?: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  activeCategory,
  currentPath = '/',
  onSelectCategory,
  onNavigate,
  hotTopics,
  onSelectTopic,
}) => {
  const [navTree, setNavTree] = useState<NavItemWithChildren[]>(() => getPublicNavigationTree());
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({
    'nav-news': true, // Keep primary news expanded by default for instant discovery
  });

  // Keep mobile nav synchronized with store updates
  useEffect(() => {
    const syncTree = () => {
      setNavTree(getPublicNavigationTree());
    };

    syncTree();

    window.addEventListener('batutv_navigation_updated', syncTree);
    window.addEventListener('storage', syncTree);

    return () => {
      window.removeEventListener('batutv_navigation_updated', syncTree);
      window.removeEventListener('storage', syncTree);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleParent = (parentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedParents((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: NavItemWithChildren,
    slug: string,
    url: string
  ) => {
    if (item.type === 'external' || item.openNewTab || url.startsWith('http://') || url.startsWith('https://')) {
      onClose();
      return;
    }

    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onClose();
    if (onSelectCategory) {
      onSelectCategory(slug, url);
    } else if (onNavigate) {
      onNavigate(url);
    }
  };

  return (
    <div id="mobile-menu-backdrop" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex md:hidden">
      <div
        id="mobile-menu-drawer"
        className="bg-white w-[88%] max-w-sm h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 overflow-y-auto"
      >
        {/* Top Bar with Close Button (X) */}
        <div className="flex items-center justify-end p-3 border-b border-slate-100">
          <button
            onClick={onClose}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* Dynamic Navigation Links (Home downwards)                 */}
        {/* ========================================================= */}
        <nav aria-label="Navigasi Menu Mobile" className="p-4 border-b border-slate-100">
          <ul className="space-y-1.5">
            {navTree.map((parent) => {
              const hasChildren = Boolean(parent.children && parent.children.length > 0);
              const isExpanded = Boolean(expandedParents[parent.id]);
              const isParentActive = isNavItemActive(parent, currentPath, activeCategory);
              const isHomeIcon = parent.slug === 'home' || parent.icon === 'home';
              const isVideo = parent.slug === 'video' || parent.label.toLowerCase() === 'video';

              return (
                <li key={parent.id} className="rounded-xl overflow-hidden">
                  <div
                    className={`flex items-center justify-between rounded-xl transition ${
                      isParentActive && !hasChildren
                        ? 'bg-red-600 text-white shadow-2xs font-bold'
                        : isParentActive
                        ? 'bg-red-50 text-red-700 font-bold'
                        : 'text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {/* Parent Menu Link */}
                    <a
                      id={`mobile-nav-${parent.slug}`}
                      href={parent.url}
                      target={parent.openNewTab ? '_blank' : undefined}
                      rel={parent.openNewTab ? 'noopener noreferrer' : undefined}
                      onClick={(e) => handleLinkClick(e, parent, parent.slug, parent.url)}
                      className="flex-1 flex items-center gap-2 px-3.5 py-2.5 text-[13px] font-bold"
                    >
                      {isHomeIcon && <Home className={`w-4 h-4 shrink-0 ${isParentActive ? 'text-amber-300' : 'text-slate-400'}`} />}
                      {isVideo ? (
                        <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-black tracking-wider">
                          VIDEO
                        </span>
                      ) : (
                        <span>{parent.label}</span>
                      )}
                    </a>

                    {/* Accordion Expand/Collapse Trigger */}
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={(e) => toggleParent(parent.id, e)}
                        aria-expanded={isExpanded}
                        aria-label={`Buka submenu ${parent.label}`}
                        className={`p-2.5 mr-1 rounded-lg transition ${
                          isExpanded ? 'text-red-600 bg-red-100/60' : 'text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Level 2 Submenu Items Accordion */}
                  {hasChildren && isExpanded && (
                    <ul className="mt-1 mb-2 ml-4 pl-3 border-l-2 border-red-200 space-y-1 py-1 animate-in slide-in-from-top-1 duration-150">
                      {parent.children!.map((child) => {
                        const isChildActive = isNavItemActive(child, currentPath, activeCategory);

                        return (
                          <li key={child.id}>
                            <a
                              id={`mobile-subnav-${child.slug}`}
                              href={child.url}
                              target={child.openNewTab ? '_blank' : undefined}
                              rel={child.openNewTab ? 'noopener noreferrer' : undefined}
                              onClick={(e) => handleLinkClick(e, child, child.slug, child.url)}
                              className={`block px-3 py-2 rounded-lg text-xs font-bold transition ${
                                isChildActive
                                  ? 'bg-red-600 text-white font-extrabold shadow-2xs'
                                  : 'text-slate-600 hover:text-red-600 hover:bg-slate-100'
                              }`}
                            >
                              <span>{child.label}</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Hot Topics */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-red-600 mb-2.5">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Topik Hangat</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {hotTopics.map((topic, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectTopic(topic);
                  onClose();
                }}
                className="text-[11px] bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 px-2.5 py-1 rounded-full border border-slate-200 transition font-medium"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-4 mt-auto bg-slate-50 text-slate-500 text-xs space-y-3">
          <div className="flex items-center gap-3">
            <a href="#yt" onClick={(e) => e.preventDefault()} className="p-2 bg-white rounded-full text-red-600 border border-slate-200">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="#fb" onClick={(e) => e.preventDefault()} className="p-2 bg-white rounded-full text-blue-600 border border-slate-200">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#ig" onClick={(e) => e.preventDefault()} className="p-2 bg-white rounded-full text-pink-600 border border-slate-200">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#tw" onClick={(e) => e.preventDefault()} className="p-2 bg-white rounded-full text-slate-800 border border-slate-200">
              <Twitter className="w-4 h-4" />
            </a>
          </div>

          <div className="text-[11px] space-y-1 text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-red-600 flex-shrink-0" />
              <span>Studio: Jl. Sultan Agung No. 12, Kota Batu, Jatim</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span>Redaksi: (0341) 591-234</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400">
            © 2026 BatuTV. All Rights Reserved.
          </div>
        </div>
      </div>
    </div>
  );
};
