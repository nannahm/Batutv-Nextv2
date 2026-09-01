export type NavigationTargetType = 'internal' | 'external';
export type NavigationInternalType = 'kategori' | 'page' | 'custom';

export interface NavigationItem {
  id: string;
  label: string;
  type: NavigationTargetType;
  targetType?: NavigationInternalType;
  targetId?: string;
  url: string;
  slug: string;
  parentId?: string | null;
  sortOrder: number;
  active: boolean;
  openNewTab: boolean;
  icon?: 'home' | 'video' | string;
  createdAt: string;
  updatedAt: string;
}

export interface NavigationItemWithChildren extends NavigationItem {
  children?: NavigationItemWithChildren[];
}

// Backwards compatibility alias
export type NavItemData = NavigationItem;
export type NavItemWithChildren = NavigationItemWithChildren;

/**
 * Sub-Navigation (Bar Kategori/Wilayah/Tag/Topik di Bawah Menu Utama)
 */
export type SubNavTargetType = 'category' | 'tag' | 'region' | 'custom' | 'external';

export interface SubNavigationItem {
  id: string;
  label: string;
  targetType: SubNavTargetType;
  targetId?: string; // ID / slug kategori atau tag yang dipilih
  url: string;
  slug: string;
  sortOrder: number;
  active: boolean;
  openNewTab: boolean;
  badge?: 'HOT' | 'LIVE' | 'BARU' | 'POPULER' | '' | string;
  createdAt: string;
  updatedAt: string;
}

export interface SubNavSettings {
  showBreakingBadge: boolean;
  breakingBadgeText: string;
  breakingNewsTitle: string;
  breakingNewsUrl: string;
}

