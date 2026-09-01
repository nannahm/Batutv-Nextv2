import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Newspaper,
  Video,
  Tags,
  FolderOpen,
  Users,
  Settings,
  LogOut,
  X,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  FilePlus,
  FileText,
  Clock,
  CheckCircle2,
  Trash2,
  List,
  Flame,
  Hash,
  UserCheck,
  FolderTree,
  Image as ImageIcon,
  PanelBottom,
  Sliders,
} from 'lucide-react';
import { BatuTVBrandLogo } from '../common/BatuTVBrandLogo';
import { getArticlesCounts } from '../../data/newsAdminStore';
import { getVideosCounts } from '../../data/videoAdminStore';
import { getStoredCategories } from '../../data/categoryAdminStore';
import { getStoredMedia } from '../../data/mediaAdminStore';
import { getStoredTags } from '../../data/tagAdminStore';
import { getStoredAuthors } from '../../data/authorAdminStore';
import { getPagesCount } from '../../data/pagesAdminStore';
import { getNavigationCounts } from '../../data/navigationStore';
import { getStoredUsers, USER_UPDATED_EVENT } from '../../data/userAdminStore';
import { AdminUser } from '../../types/admin';
import { normalizeUserRole } from '../../utils/rbac';

interface SidebarProps {
  currentPath: string;
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

interface SubMenuItem {
  name: string;
  path: string;
  icon?: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

interface MenuItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  isReady?: boolean;
  subItems?: SubMenuItem[];
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  isOpen,
  user,
  onClose,
  onNavigate,
  onLogout,
}) => {
  const roleKey = normalizeUserRole(user?.role);

  // Live counts for news, video, category, media, tag, and author badge indicators
  const [counts, setCounts] = useState(() => getArticlesCounts());
  const [videoCounts, setVideoCounts] = useState(() => getVideosCounts());
  const [categoryCount, setCategoryCount] = useState(() => getStoredCategories().length);
  const [mediaCount, setMediaCount] = useState(() => getStoredMedia().length);
  const [tagCount, setTagCount] = useState(() => getStoredTags().length);
  const [authorCount, setAuthorCount] = useState(() => getStoredAuthors().length);
  const [pagesCount, setPagesCount] = useState(() => getPagesCount().total);
  const [navCount, setNavCount] = useState(() => getNavigationCounts().total);
  const [userCount, setUserCount] = useState(() => getStoredUsers().length);

  // Auto update counts when currentPath changes or event fires
  useEffect(() => {
    const updateAllCounts = () => {
      setCounts(getArticlesCounts());
      setVideoCounts(getVideosCounts());
      setCategoryCount(getStoredCategories().length);
      setMediaCount(getStoredMedia().length);
      setTagCount(getStoredTags().length);
      setAuthorCount(getStoredAuthors().length);
      setPagesCount(getPagesCount().total);
      setNavCount(getNavigationCounts().total);
      setUserCount(getStoredUsers().length);
    };

    updateAllCounts();

    window.addEventListener('batutv_navigation_updated', updateAllCounts);
    window.addEventListener('batutv_videos_updated', updateAllCounts);
    window.addEventListener('batutv_articles_updated', updateAllCounts);
    window.addEventListener('batutv_categories_updated', updateAllCounts);
    window.addEventListener('batutv_media_updated', updateAllCounts);
    window.addEventListener('batutv_tags_updated', updateAllCounts);
    window.addEventListener('batutv_authors_updated', updateAllCounts);
    window.addEventListener('batutv_pages_updated', updateAllCounts);
    window.addEventListener(USER_UPDATED_EVENT, updateAllCounts);
    return () => {
      window.removeEventListener('batutv_navigation_updated', updateAllCounts);
      window.removeEventListener('batutv_videos_updated', updateAllCounts);
      window.removeEventListener('batutv_articles_updated', updateAllCounts);
      window.removeEventListener('batutv_categories_updated', updateAllCounts);
      window.removeEventListener('batutv_media_updated', updateAllCounts);
      window.removeEventListener('batutv_tags_updated', updateAllCounts);
      window.removeEventListener('batutv_authors_updated', updateAllCounts);
      window.removeEventListener('batutv_pages_updated', updateAllCounts);
      window.removeEventListener(USER_UPDATED_EVENT, updateAllCounts);
    };
  }, [currentPath]);

  // Keep news submenu open when within /batutv-control/berita
  const isNewsActive = currentPath.startsWith('/batutv-control/berita');
  const [isNewsExpanded, setIsNewsExpanded] = useState<boolean>(true);

  // Keep video submenu open when within /batutv-control/video
  const isVideoActive = currentPath.startsWith('/batutv-control/video');
  const [isVideoExpanded, setIsVideoExpanded] = useState<boolean>(true);

  useEffect(() => {
    if (isNewsActive) {
      setIsNewsExpanded(true);
    }
  }, [isNewsActive]);

  useEffect(() => {
    if (isVideoActive) {
      setIsVideoExpanded(true);
    }
  }, [isVideoActive]);

  // Dynamic news sub-items per role
  const newsSubItems: SubMenuItem[] = (() => {
    if (roleKey === 'kontributor') {
      return [
        {
          name: 'Tulis Naskah Baru',
          path: '/batutv-control/berita/tulis',
          icon: FilePlus,
        },
        {
          name: 'Draft Naskah Saya',
          path: '/batutv-control/berita/draft',
          icon: FileText,
          badge: counts.draft > 0 ? counts.draft : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        },
        {
          name: 'Semua Naskah',
          path: '/batutv-control/berita',
          icon: List,
          badge: counts.all,
        },
      ];
    }

    if (roleKey === 'reporter') {
      return [
        {
          name: 'Semua Berita',
          path: '/batutv-control/berita',
          icon: List,
          badge: counts.all,
        },
        {
          name: 'Tulis Berita',
          path: '/batutv-control/berita/tulis',
          icon: FilePlus,
        },
        {
          name: 'Draft Naskah',
          path: '/batutv-control/berita/draft',
          icon: FileText,
          badge: counts.draft > 0 ? counts.draft : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        },
        {
          name: 'Sampah',
          path: '/batutv-control/berita/sampah',
          icon: Trash2,
          badge: counts.trash > 0 ? counts.trash : undefined,
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
        },
      ];
    }

    // Admin, Redaksi, Editor
    return [
      {
        name: 'Semua Berita',
        path: '/batutv-control/berita',
        icon: List,
        badge: counts.all,
      },
      {
        name: 'Headline',
        path: '/batutv-control/berita/headline',
        icon: Flame,
        badge: counts.headlines > 0 ? counts.headlines : undefined,
        badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      },
      {
        name: 'Tulis Berita',
        path: '/batutv-control/berita/tulis',
        icon: FilePlus,
      },
      {
        name: 'Draft',
        path: '/batutv-control/berita/draft',
        icon: FileText,
        badge: counts.draft > 0 ? counts.draft : undefined,
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      },
      {
        name: 'Terjadwal',
        path: '/batutv-control/berita/terjadwal',
        icon: Clock,
        badge: counts.scheduled > 0 ? counts.scheduled : undefined,
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      },
      {
        name: 'Terbit',
        path: '/batutv-control/berita/terbit',
        icon: CheckCircle2,
        badge: counts.published > 0 ? counts.published : undefined,
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      },
      {
        name: 'Sampah',
        path: '/batutv-control/berita/sampah',
        icon: Trash2,
        badge: counts.trash > 0 ? counts.trash : undefined,
        badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
      },
    ];
  })();

  // Construct filtered menu sections strictly according to RBAC specifications
  const menuSections: MenuSection[] = (() => {
    const sections: MenuSection[] = [
      {
        items: [
          {
            name: 'Dashboard',
            path: '/batutv-control/dashboard',
            icon: LayoutDashboard,
            isReady: true,
          },
        ],
      },
    ];

    // 1. KONTEN SECTION
    const kontenItems: MenuItem[] = [
      {
        name: roleKey === 'kontributor' ? 'Naskah Tulisan' : 'Berita',
        path: '/batutv-control/berita',
        icon: Newspaper,
        badge: counts.all.toString(),
        isReady: true,
        subItems: newsSubItems,
      },
    ];

    // Videos are accessible to Admin, Redaksi, and Editor only
    if (roleKey === 'admin' || roleKey === 'redaksi' || roleKey === 'editor') {
      kontenItems.push({
        name: 'Video',
        path: '/batutv-control/video',
        icon: Video,
        badge: videoCounts.all.toString(),
        isReady: true,
        subItems: [
          {
            name: 'Semua Video',
            path: '/batutv-control/video',
            icon: List,
            badge: videoCounts.all,
          },
          {
            name: 'Tambah Video',
            path: '/batutv-control/video/tambah',
            icon: FilePlus,
          },
          {
            name: 'Draft',
            path: '/batutv-control/video/draft',
            icon: FileText,
            badge: videoCounts.draft > 0 ? videoCounts.draft : undefined,
            badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          },
          {
            name: 'Terjadwal',
            path: '/batutv-control/video/terjadwal',
            icon: Clock,
            badge: videoCounts.scheduled > 0 ? videoCounts.scheduled : undefined,
            badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          },
          {
            name: 'Terbit',
            path: '/batutv-control/video/terbit',
            icon: CheckCircle2,
            badge: videoCounts.published > 0 ? videoCounts.published : undefined,
            badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          },
          {
            name: 'Sampah',
            path: '/batutv-control/video/sampah',
            icon: Trash2,
            badge: videoCounts.trash > 0 ? videoCounts.trash : undefined,
            badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
          },
        ],
      });
    }

    sections.push({
      title: 'KONTEN',
      items: kontenItems,
    });

    // 2. KONTEN PENDUKUNG SECTION
    const pendukungItems: MenuItem[] = [];

    if (roleKey === 'admin' || roleKey === 'redaksi' || roleKey === 'editor') {
      pendukungItems.push({
        name: 'Kategori',
        path: '/batutv-control/kategori',
        icon: Tags,
        badge: categoryCount.toString(),
        isReady: true,
      });
    }

    pendukungItems.push({
      name: roleKey === 'kontributor' ? 'Media Saya' : 'Media',
      path: '/batutv-control/media',
      icon: FolderOpen,
      badge: mediaCount.toString(),
      isReady: true,
    });

    if (roleKey === 'admin' || roleKey === 'redaksi' || roleKey === 'editor') {
      pendukungItems.push({
        name: 'Tag',
        path: '/batutv-control/tag',
        icon: Hash,
        badge: tagCount.toString(),
        isReady: true,
      });
    }

    if (pendukungItems.length > 0) {
      sections.push({
        title: 'KONTEN PENDUKUNG',
        items: pendukungItems,
      });
    }

    // 3. MASTER DATA SECTION
    const masterItems: MenuItem[] = [];

    // Penulis is visible to Admin, Redaksi, and Editor
    if (roleKey === 'admin' || roleKey === 'redaksi' || roleKey === 'editor') {
      masterItems.push({
        name: 'Penulis',
        path: '/batutv-control/penulis',
        icon: UserCheck,
        badge: authorCount.toString(),
        isReady: true,
      });
    }

    // Pages, Navigasi, Footer, Site Settings only for Admin & Redaksi
    if (roleKey === 'admin' || roleKey === 'redaksi') {
      masterItems.push(
        {
          name: 'Pages',
          path: '/batutv-control/pages',
          icon: FileText,
          badge: pagesCount.toString(),
          isReady: true,
        },
        {
          name: 'Navigasi',
          path: '/batutv-control/navigasi',
          icon: FolderTree,
          badge: navCount.toString(),
          isReady: true,
        },
        {
          name: 'Footer',
          path: '/batutv-control/footer',
          icon: PanelBottom,
          isReady: true,
        },
        {
          name: 'Site Settings',
          path: '/batutv-control/site-settings',
          icon: Sliders,
          isReady: true,
        }
      );
    }

    if (roleKey === 'admin') {
      masterItems.push({
        name: 'Banner',
        path: '/batutv-control/banner',
        icon: ImageIcon,
        badge: 'Ditunda',
        isReady: false,
      });
    }

    if (masterItems.length > 0) {
      sections.push({
        title: 'MASTER DATA',
        items: masterItems,
      });
    }

    // 4. PENGATURAN SECTION (Only Admin)
    if (roleKey === 'admin') {
      sections.push({
        title: 'PENGATURAN',
        items: [
          {
            name: 'Pengguna',
            path: '/batutv-control/pengguna',
            icon: Users,
            badge: userCount.toString(),
            isReady: true,
          },
          {
            name: 'Pengaturan Sistem',
            path: '/batutv-control/pengaturan',
            icon: Settings,
            isReady: true,
          },
        ],
      });
    }

    return sections;
  })();

  const handleItemClick = (path: string) => {
    onNavigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const isSubItemActive = (subPath: string) => {
    if (subPath === '/batutv-control/berita') {
      return (
        currentPath === '/batutv-control/berita' ||
        currentPath === '/batutv-control/berita/semua' ||
        currentPath.startsWith('/batutv-control/berita/edit')
      );
    }
    if (subPath === '/batutv-control/video') {
      return (
        currentPath === '/batutv-control/video' ||
        currentPath === '/batutv-control/video/semua' ||
        currentPath.startsWith('/batutv-control/video/edit')
      );
    }
    return currentPath === subPath;
  };

  return (
    <>
      {/* Mobile/Tablet Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="a02-sidebar-container"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 lg:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        aria-label="Navigasi Utama CMS BatuTV Control"
      >
        {/* A02.1.1 — Sidebar Brand */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/60">
          <button
            type="button"
            onClick={() => handleItemClick('/batutv-control/dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 p-1 flex items-center justify-center shadow-xs group-hover:border-red-500/50 transition-colors">
              <BatuTVBrandLogo variant="symbol" height={28} />
            </div>
            <div>
              <div className="text-white font-black text-sm tracking-wide flex items-center gap-1.5">
                BATUTV <span className="text-red-400 font-extrabold text-[11px] px-1.5 py-0.5 bg-red-500/10 rounded border border-red-500/20">CONTROL</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Newsroom CMS v1.0</p>
            </div>
          </button>

          {/* Close button for Mobile/Tablet */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Sidebar Menu"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Portal Switcher Link */}
        <div className="px-3 pt-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-all duration-200 group"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Lihat Portal Publik</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* A02.1.2 — Sidebar Menu Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto custom-scrollbar">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.title && (
                <div className="px-3 pb-1.5 text-[10px] font-extrabold tracking-wider text-slate-400/80 uppercase">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
                const isNewsItem = item.path === '/batutv-control/berita';
                const isVideoItem = item.path === '/batutv-control/video';
                const isExpanded = isNewsItem ? isNewsExpanded : isVideoItem ? isVideoExpanded : false;
                const isParentActive =
                  currentPath === item.path ||
                  (isNewsItem && currentPath.startsWith('/batutv-control/berita')) ||
                  (isVideoItem && currentPath.startsWith('/batutv-control/video'));

                const toggleExpand = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (isNewsItem) {
                    setIsNewsExpanded((prev) => !prev);
                  } else if (isVideoItem) {
                    setIsVideoExpanded((prev) => !prev);
                  }
                };

                return (
                  <div key={item.path} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (hasSubItems) {
                          if (isNewsItem && !isNewsExpanded) setIsNewsExpanded(true);
                          if (isVideoItem && !isVideoExpanded) setIsVideoExpanded(true);
                          handleItemClick(item.path);
                        } else {
                          handleItemClick(item.path);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer ${
                        isParentActive
                          ? 'bg-red-600 text-white shadow-xs font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isParentActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              isParentActive
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {hasSubItems ? (
                          <span
                            onClick={toggleExpand}
                            className="p-0.5 hover:bg-black/20 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                            )}
                          </span>
                        ) : (
                          !isParentActive && (
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                          )
                        )}
                      </div>
                    </button>

                    {/* Submenu rendering */}
                    {hasSubItems && isExpanded && (
                      <div className="pl-3.5 pr-1 py-1 space-y-1 ml-2 border-l border-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
                        {item.subItems?.map((sub) => {
                          const isSubActive = isSubItemActive(sub.path);
                          const SubIcon = sub.icon || FileText;

                          return (
                            <button
                              key={sub.path}
                              type="button"
                              onClick={() => handleItemClick(sub.path)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all text-left group cursor-pointer ${
                                isSubActive
                                  ? 'bg-red-500/20 text-white font-bold border border-red-500/30'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <SubIcon
                                  className={`w-3.5 h-3.5 ${
                                    isSubActive ? 'text-red-400' : 'text-slate-400 group-hover:text-slate-300'
                                  }`}
                                />
                                <span>{sub.name}</span>
                              </div>

                              {sub.badge !== undefined && (
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                                    sub.badgeColor ||
                                    (isSubActive
                                      ? 'bg-red-500/30 text-white border-red-500/40'
                                      : 'bg-slate-800 text-slate-300 border-slate-700/60')
                                  }`}
                                >
                                  {sub.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* A02.1.3 — Active Role & Logout Area */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
          <div className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Peran Aktif</span>
              <span className="text-white font-bold truncate block">{user?.name || 'Administrator'}</span>
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border shrink-0 ${
              roleKey === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
              roleKey === 'redaksi' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
              roleKey === 'editor' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              roleKey === 'reporter' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {roleKey.toUpperCase()}
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            id="a02-btn-sidebar-logout"
            aria-label="Logout dari Sistem BatuTV Control"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-white hover:bg-red-600/20 active:scale-[0.98] border border-red-500/20 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
};

