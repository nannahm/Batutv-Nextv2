import {
  NavigationItem,
  NavigationItemWithChildren,
  SubNavigationItem,
  SubNavSettings,
} from '../types/navigation';
import { firestoreNavigationRepository } from '../repositories/firestore/firestoreNavigationRepository';

export const INITIAL_SUB_NAVIGATION_DATA: SubNavigationItem[] = [
  {
    id: 'subnav-sumatera',
    label: 'Sumatera',
    targetType: 'region',
    targetId: 'sumatera',
    url: '/kategori/daerah',
    slug: 'sumatera',
    sortOrder: 1,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'subnav-jabar',
    label: 'Jabar',
    targetType: 'region',
    targetId: 'jabar',
    url: '/kategori/daerah',
    slug: 'jabar',
    sortOrder: 2,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'subnav-banten',
    label: 'Banten',
    targetType: 'region',
    targetId: 'banten',
    url: '/kategori/daerah',
    slug: 'banten',
    sortOrder: 3,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'subnav-jateng',
    label: 'Jateng',
    targetType: 'region',
    targetId: 'jateng',
    url: '/kategori/daerah',
    slug: 'jateng',
    sortOrder: 4,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'subnav-diyogya',
    label: 'DI Yogya',
    targetType: 'region',
    targetId: 'di-yogya',
    url: '/kategori/daerah',
    slug: 'di-yogya',
    sortOrder: 5,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'subnav-jatim',
    label: 'Jatim',
    targetType: 'category',
    targetId: 'jawa-timur',
    url: '/kategori/jawa-timur',
    slug: 'jatim',
    sortOrder: 6,
    active: true,
    openNewTab: false,
    badge: 'HOT',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'subnav-bali',
    label: 'Bali',
    targetType: 'region',
    targetId: 'bali',
    url: '/kategori/daerah',
    slug: 'bali',
    sortOrder: 7,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'subnav-sulawesi',
    label: 'Sulawesi',
    targetType: 'region',
    targetId: 'sulawesi',
    url: '/kategori/daerah',
    slug: 'sulawesi',
    sortOrder: 8,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'subnav-batu',
    label: 'Batu',
    targetType: 'tag',
    targetId: 'kota-batu',
    url: '/tag/kota-batu',
    slug: 'kota-batu',
    sortOrder: 9,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'subnav-malang',
    label: 'Malang',
    targetType: 'category',
    targetId: 'malang-raya',
    url: '/kategori/malang-raya',
    slug: 'malang-raya',
    sortOrder: 10,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'subnav-lainnya',
    label: 'Lainnya',
    targetType: 'region',
    targetId: 'daerah-lain',
    url: '/kategori/daerah',
    slug: 'daerah-lain',
    sortOrder: 11,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
];

export const INITIAL_SUB_NAV_SETTINGS: SubNavSettings = {
  showBreakingBadge: true,
  breakingBadgeText: 'BREAKING NEWS',
  breakingNewsTitle: 'Peringatan Dini Cuaca Ekstrem dan Gelombang Tinggi Jawa Timur',
  breakingNewsUrl: '/kategori/daerah',
};

export const INITIAL_NAVIGATION_DATA: NavigationItem[] = [
  {
    id: 'nav-home',
    label: 'HOME',
    type: 'internal',
    targetType: 'custom',
    targetId: 'home',
    url: '/',
    slug: 'home',
    parentId: null,
    sortOrder: 1,
    active: true,
    openNewTab: false,
    icon: 'home',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-news',
    label: 'NEWS',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'nasional',
    url: '/kategori/nasional',
    slug: 'news',
    parentId: null,
    sortOrder: 2,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-nasional',
    label: 'Nasional',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'nasional',
    url: '/kategori/nasional',
    slug: 'nasional',
    parentId: 'nav-news',
    sortOrder: 1,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-internasional',
    label: 'Internasional',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'internasional',
    url: '/kategori/internasional',
    slug: 'internasional',
    parentId: 'nav-news',
    sortOrder: 2,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-opini',
    label: 'Opini',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'opini',
    url: '/kategori/opini',
    slug: 'opini',
    parentId: 'nav-news',
    sortOrder: 3,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-ekonomi',
    label: 'EKONOMI BISNIS',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'ekonomi-bisnis',
    url: '/kategori/ekonomi-bisnis',
    slug: 'ekonomi-bisnis',
    parentId: null,
    sortOrder: 3,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-ekonomi',
    label: 'Ekonomi',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'ekonomi-bisnis',
    url: '/kategori/ekonomi-bisnis',
    slug: 'ekonomi',
    parentId: 'nav-ekonomi',
    sortOrder: 1,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-bisnis',
    label: 'Bisnis',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'bisnis',
    url: '/kategori/bisnis',
    slug: 'bisnis',
    parentId: 'nav-ekonomi',
    sortOrder: 2,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-keuangan',
    label: 'Keuangan',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'keuangan',
    url: '/kategori/keuangan',
    slug: 'keuangan',
    parentId: 'nav-ekonomi',
    sortOrder: 3,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-daerah',
    label: 'DAERAH',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'daerah',
    url: '/kategori/daerah',
    slug: 'daerah',
    parentId: null,
    sortOrder: 4,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-sumatera',
    label: 'SUMATERA',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'daerah',
    url: '/kategori/daerah?region=sumatera',
    slug: 'sumatera',
    parentId: 'nav-daerah',
    sortOrder: 1,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-jabar',
    label: 'JABAR',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'daerah',
    url: '/kategori/daerah?region=jabar',
    slug: 'jabar',
    parentId: 'nav-daerah',
    sortOrder: 2,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-banten',
    label: 'BANTEN',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'daerah',
    url: '/kategori/daerah?region=banten',
    slug: 'banten',
    parentId: 'nav-daerah',
    sortOrder: 3,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-jateng',
    label: 'JATENG',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'daerah',
    url: '/kategori/daerah?region=jateng',
    slug: 'jateng',
    parentId: 'nav-daerah',
    sortOrder: 4,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-diyogya',
    label: 'DI YOGYA',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'daerah',
    url: '/kategori/daerah?region=di-yogya',
    slug: 'di-yogya',
    parentId: 'nav-daerah',
    sortOrder: 5,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-jatim',
    label: 'JATIM',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'jawa-timur',
    url: '/kategori/jawa-timur',
    slug: 'jatim',
    parentId: 'nav-daerah',
    sortOrder: 6,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-bali',
    label: 'BALI',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'daerah',
    url: '/kategori/daerah?region=bali',
    slug: 'bali',
    parentId: 'nav-daerah',
    sortOrder: 7,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-sulawesi',
    label: 'SULAWESI',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'daerah',
    url: '/kategori/daerah?region=sulawesi',
    slug: 'sulawesi',
    parentId: 'nav-daerah',
    sortOrder: 8,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-lainnya',
    label: 'LAINNYA',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'daerah',
    url: '/kategori/daerah',
    slug: 'lainnya',
    parentId: 'nav-daerah',
    sortOrder: 9,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-bola',
    label: 'BOLA',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'sepak-bola',
    url: '/kategori/sepak-bola',
    slug: 'bola',
    parentId: null,
    sortOrder: 5,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sport',
    label: 'SPORT',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'olahraga',
    url: '/kategori/olahraga',
    slug: 'sport',
    parentId: null,
    sortOrder: 6,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-bulutangkis',
    label: 'BULU TANGKIS',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'olahraga',
    url: '/kategori/olahraga',
    slug: 'bulu-tangkis',
    parentId: 'nav-sport',
    sortOrder: 1,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-onepride',
    label: 'ONE PRIDE',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'olahraga',
    url: '/kategori/olahraga',
    slug: 'one-pride',
    parentId: 'nav-sport',
    sortOrder: 2,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-onjrek',
    label: 'ON JREK',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'olahraga',
    url: '/kategori/olahraga',
    slug: 'on-jrek',
    parentId: 'nav-sport',
    sortOrder: 3,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-arena',
    label: 'ARENA',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'olahraga',
    url: '/kategori/olahraga',
    slug: 'arena',
    parentId: 'nav-sport',
    sortOrder: 4,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-gayahidup',
    label: 'GAYA HIDUP',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'gaya-hidup',
    url: '/kategori/gaya-hidup',
    slug: 'gaya-hidup',
    parentId: null,
    sortOrder: 7,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-kesehatan',
    label: 'KESEHATAN',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'kesehatan',
    url: '/kategori/kesehatan',
    slug: 'kesehatan',
    parentId: 'nav-gayahidup',
    sortOrder: 1,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-travel',
    label: 'TRAVEL',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'pariwisata',
    url: '/kategori/pariwisata',
    slug: 'travel',
    parentId: 'nav-gayahidup',
    sortOrder: 2,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-trend',
    label: 'TREND',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'gaya-hidup',
    url: '/kategori/gaya-hidup',
    slug: 'trend',
    parentId: 'nav-gayahidup',
    sortOrder: 3,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-sub-otomotif',
    label: 'OTOMOTIF',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'otomotif',
    url: '/kategori/otomotif',
    slug: 'otomotif',
    parentId: 'nav-gayahidup',
    sortOrder: 4,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-religi',
    label: 'RELIGI',
    type: 'internal',
    targetType: 'kategori',
    targetId: 'religi',
    url: '/kategori/religi',
    slug: 'religi',
    parentId: null,
    sortOrder: 8,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-video',
    label: 'VIDEO',
    type: 'internal',
    targetType: 'custom',
    targetId: 'video',
    url: '/video',
    slug: 'video',
    parentId: null,
    sortOrder: 9,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-tvone',
    label: 'TVONE',
    type: 'internal',
    targetType: 'custom',
    targetId: 'tvone',
    url: '/',
    slug: 'tvone',
    parentId: null,
    sortOrder: 10,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: 'nav-index',
    label: 'INDEX',
    type: 'internal',
    targetType: 'custom',
    targetId: 'index',
    url: '/indeks',
    slug: 'index',
    parentId: null,
    sortOrder: 11,
    active: true,
    openNewTab: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
];

const NAVIGATION_STORAGE_KEY = 'batutv_primary_navigation_v7';
const SUB_NAV_STORAGE_KEY = 'batutv_sub_navigation_items_v1';
const SUB_NAV_SETTINGS_STORAGE_KEY = 'batutv_sub_nav_settings_v1';

// In-Memory state for instant UI rendering & synchronization
let inMemoryPrimaryNav: NavigationItem[] = loadLocalPrimaryCache();
let inMemorySubNav: SubNavigationItem[] = loadLocalSubNavCache();
let inMemorySubNavSettings: SubNavSettings = loadLocalSubNavSettingsCache();
let isSubscribed = false;

function loadLocalPrimaryCache(): NavigationItem[] {
  if (typeof window === 'undefined') return INITIAL_NAVIGATION_DATA;
  try {
    const raw = localStorage.getItem(NAVIGATION_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(INITIAL_NAVIGATION_DATA));
      return INITIAL_NAVIGATION_DATA;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return INITIAL_NAVIGATION_DATA;
  } catch (err) {
    console.error('Error reading primary navigation cache:', err);
    return INITIAL_NAVIGATION_DATA;
  }
}

function loadLocalSubNavCache(): SubNavigationItem[] {
  if (typeof window === 'undefined') return INITIAL_SUB_NAVIGATION_DATA;
  try {
    const raw = localStorage.getItem(SUB_NAV_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SUB_NAV_STORAGE_KEY, JSON.stringify(INITIAL_SUB_NAVIGATION_DATA));
      return INITIAL_SUB_NAVIGATION_DATA;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return INITIAL_SUB_NAVIGATION_DATA;
  } catch (err) {
    console.error('Error reading sub nav cache:', err);
    return INITIAL_SUB_NAVIGATION_DATA;
  }
}

function loadLocalSubNavSettingsCache(): SubNavSettings {
  if (typeof window === 'undefined') return INITIAL_SUB_NAV_SETTINGS;
  try {
    const raw = localStorage.getItem(SUB_NAV_SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SUB_NAV_SETTINGS_STORAGE_KEY, JSON.stringify(INITIAL_SUB_NAV_SETTINGS));
      return INITIAL_SUB_NAV_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading sub nav settings cache:', err);
    return INITIAL_SUB_NAV_SETTINGS;
  }
}

function notifyNavigationChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('batutv_navigation_updated'));
  }
}

function initRealtimeSync() {
  if (typeof window === 'undefined' || isSubscribed) return;
  isSubscribed = true;

  firestoreNavigationRepository.subscribe(
    (data) => {
      if (data.primary && data.primary.length > 0) {
        inMemoryPrimaryNav = data.primary;
        localStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(data.primary));
      }
      if (data.subNav && data.subNav.length > 0) {
        inMemorySubNav = data.subNav;
        localStorage.setItem(SUB_NAV_STORAGE_KEY, JSON.stringify(data.subNav));
      }
      if (data.subNavSettings) {
        inMemorySubNavSettings = data.subNavSettings;
        localStorage.setItem(SUB_NAV_SETTINGS_STORAGE_KEY, JSON.stringify(data.subNavSettings));
      }
      notifyNavigationChanged();
    },
    (err) => {
      console.warn('[navigationStore] Firestore subscription fallback to local cache:', err);
    }
  );
}

initRealtimeSync();

/**
 * Generate slug helper
 */
export function generateNavSlug(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Retrieve all raw navigation items from memory / cache (SSoT Firestore synced)
 */
export function getStoredNavItems(): NavigationItem[] {
  if (inMemoryPrimaryNav && inMemoryPrimaryNav.length > 0) {
    return inMemoryPrimaryNav;
  }
  return loadLocalPrimaryCache();
}

/**
 * Save raw navigation items (Writes to Firestore & Cache)
 */
export function saveNavItems(items: NavigationItem[]): void {
  inMemoryPrimaryNav = items;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(items));
      notifyNavigationChanged();
    } catch (err) {
      console.error('Error saving primary navigation data:', err);
    }
  }

  // Async persist to Firestore
  firestoreNavigationRepository.savePrimaryNav(items).catch((err) => {
    console.warn('[navigationStore] Firestore async savePrimaryNav error:', err);
  });
}

/**
 * Build 2-level public navigation tree (only active items, sorted by sortOrder)
 */
export function getPublicNavigationTree(): NavigationItemWithChildren[] {
  const allItems = getStoredNavItems();
  const activeItems = allItems.filter((item) => item.active);

  const parents: NavigationItemWithChildren[] = activeItems
    .filter((item) => !item.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((parent) => ({
      ...parent,
      children: [],
    }));

  activeItems
    .filter((item) => item.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .forEach((child) => {
      const parent = parents.find((p) => p.id === child.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push({
          ...child,
          children: [],
        });
      }
    });

  return parents;
}

/**
 * Build full 2-level tree for Dashboard Admin
 */
export function getNavigationTreeAdmin(): NavigationItemWithChildren[] {
  const allItems = getStoredNavItems();

  const parents: NavigationItemWithChildren[] = allItems
    .filter((item) => !item.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((parent) => ({
      ...parent,
      children: [],
    }));

  allItems
    .filter((item) => item.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .forEach((child) => {
      const parent = parents.find((p) => p.id === child.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push({
          ...child,
          children: [],
        });
      } else {
        parents.push({
          ...child,
          parentId: null,
          children: [],
        });
      }
    });

  return parents;
}

/**
 * Get Navigation Summary Counts for Dashboard Badges
 */
export function getNavigationCounts() {
  const items = getStoredNavItems();
  const parents = items.filter((i) => !i.parentId);
  const children = items.filter((i) => Boolean(i.parentId));
  const active = items.filter((i) => i.active);
  const inactive = items.filter((i) => !i.active);

  return {
    total: items.length,
    active: active.length,
    inactive: inactive.length,
    parents: parents.length,
    children: children.length,
  };
}

/**
 * Add a new navigation item (strictly max 2 levels)
 */
export function addNavigationItem(
  data: Omit<NavigationItem, 'id' | 'createdAt' | 'updatedAt'>
): NavigationItem {
  const items = getStoredNavItems();
  const now = new Date().toISOString();

  let sortOrder = data.sortOrder;
  if (!sortOrder) {
    const siblings = items.filter((i) => i.parentId === (data.parentId || null));
    sortOrder = siblings.length > 0 ? Math.max(...siblings.map((s) => s.sortOrder)) + 1 : 1;
  }

  let parentId = data.parentId || null;
  if (parentId) {
    const parentItem = items.find((i) => i.id === parentId);
    if (parentItem && parentItem.parentId) {
      parentId = parentItem.parentId;
    }
  }

  const newItem: NavigationItem = {
    ...data,
    id: `nav-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    parentId,
    sortOrder,
    slug: data.slug || generateNavSlug(data.label),
    createdAt: now,
    updatedAt: now,
  };

  const updated = [...items, newItem];
  saveNavItems(updated);
  return newItem;
}

/**
 * Update an existing navigation item
 */
export function updateNavigationItem(
  id: string,
  data: Partial<NavigationItem>
): NavigationItem | null {
  const items = getStoredNavItems();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const current = items[index];
  const now = new Date().toISOString();

  let parentId = data.parentId !== undefined ? data.parentId : current.parentId;
  if (parentId === id) {
    parentId = null;
  }

  if (parentId) {
    const targetParent = items.find((i) => i.id === parentId);
    if (targetParent && targetParent.parentId) {
      parentId = targetParent.parentId;
    }
  }

  const updatedItem: NavigationItem = {
    ...current,
    ...data,
    parentId,
    slug: data.label ? (data.slug || generateNavSlug(data.label)) : current.slug,
    updatedAt: now,
  };

  items[index] = updatedItem;
  saveNavItems(items);
  return updatedItem;
}

/**
 * Delete a navigation item with strategy for submenus
 */
export function deleteNavigationItem(
  id: string,
  strategy: 'cascade' | 'promote_to_root' = 'cascade'
): boolean {
  const items = getStoredNavItems();
  const itemToDelete = items.find((i) => i.id === id);
  if (!itemToDelete) return false;

  const submenus = items.filter((i) => i.parentId === id);
  let updated: NavigationItem[];

  if (submenus.length > 0) {
    if (strategy === 'cascade') {
      updated = items.filter((i) => i.id !== id && i.parentId !== id);
    } else {
      const maxRootOrder = Math.max(0, ...items.filter((i) => !i.parentId).map((i) => i.sortOrder));
      updated = items
        .filter((i) => i.id !== id)
        .map((i, idx) => {
          if (i.parentId === id) {
            return {
              ...i,
              parentId: null,
              sortOrder: maxRootOrder + idx + 1,
              updatedAt: new Date().toISOString(),
            };
          }
          return i;
        });
    }
  } else {
    updated = items.filter((i) => i.id !== id);
  }

  saveNavItems(updated);

  firestoreNavigationRepository.deletePrimaryItem(id).catch((err) => {
    console.warn('[navigationStore] Firestore async delete error:', err);
  });

  return true;
}

/**
 * Toggle Active status
 */
export function toggleNavigationItemActive(id: string): boolean {
  const items = getStoredNavItems();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return false;

  items[index].active = !items[index].active;
  items[index].updatedAt = new Date().toISOString();
  saveNavItems(items);
  return true;
}

/**
 * Move item order (Up / Down) within its sibling group
 */
export function moveNavigationItemOrder(id: string, direction: 'up' | 'down'): boolean {
  const items = getStoredNavItems();
  const target = items.find((i) => i.id === id);
  if (!target) return false;

  const siblings = items
    .filter((i) => i.parentId === target.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const targetIdx = siblings.findIndex((i) => i.id === id);
  if (targetIdx === -1) return false;

  const swapIdx = direction === 'up' ? targetIdx - 1 : targetIdx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return false;

  const otherItem = siblings[swapIdx];

  const tempOrder = target.sortOrder;
  target.sortOrder = otherItem.sortOrder;
  otherItem.sortOrder = tempOrder;

  if (target.sortOrder === otherItem.sortOrder) {
    siblings.splice(targetIdx, 1);
    siblings.splice(swapIdx, 0, target);
    siblings.forEach((item, index) => {
      item.sortOrder = index + 1;
    });
  }

  saveNavItems(items);
  return true;
}

/**
 * Move a submenu item to a different Parent
 */
export function moveSubmenuToParent(childId: string, newParentId: string | null): boolean {
  const items = getStoredNavItems();
  const child = items.find((i) => i.id === childId);
  if (!child) return false;

  if (childId === newParentId) return false;

  const targetSiblings = items.filter((i) => i.parentId === (newParentId || null));
  const maxOrder = targetSiblings.length > 0 ? Math.max(...targetSiblings.map((s) => s.sortOrder)) : 0;

  child.parentId = newParentId || null;
  child.sortOrder = maxOrder + 1;
  child.updatedAt = new Date().toISOString();

  saveNavItems(items);
  return true;
}

/**
 * Reorder a whole list of siblings
 */
export function reorderNavItems(orderedIds: string[]): boolean {
  const items = getStoredNavItems();

  orderedIds.forEach((id, index) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      item.sortOrder = index + 1;
      item.updatedAt = new Date().toISOString();
    }
  });

  saveNavItems(items);
  return true;
}

/**
 * Reset navigation back to default sample dataset
 */
export function resetToDefaultNavigation(): NavigationItem[] {
  saveNavItems(INITIAL_NAVIGATION_DATA);
  return INITIAL_NAVIGATION_DATA;
}

/**
 * Check if a URL or slug matches the active state
 */
export function isNavItemActive(
  item: NavigationItemWithChildren | NavigationItem,
  currentPath: string,
  activeSlug: string
): boolean {
  const normPath = (currentPath || '/').toLowerCase().trim();
  const normSlug = (activeSlug || 'home').toLowerCase().trim();
  const itemUrl = (item.url || '').toLowerCase().trim();
  const itemSlug = (item.slug || '').toLowerCase().trim();

  if (itemSlug === 'home' || itemUrl === '/') {
    return normPath === '/' && (normSlug === 'home' || normSlug === '');
  }

  if (normSlug && normSlug === itemSlug) {
    return true;
  }

  if (itemUrl && normPath === itemUrl) {
    return true;
  }

  if (normPath.startsWith(`/kategori/${itemSlug}`)) {
    return true;
  }

  if ('children' in item && item.children && item.children.length > 0) {
    return item.children.some((child) => isNavItemActive(child, currentPath, activeSlug));
  }

  return false;
}

/* ========================================================================= */
/* SUB-NAVIGATION MANAGEMENT (BAR DAERAH / TAG / KATEGORI DI BAWAH MENU)     */
/* ========================================================================= */

export function getStoredSubNavItems(): SubNavigationItem[] {
  if (inMemorySubNav && inMemorySubNav.length > 0) {
    return inMemorySubNav;
  }
  return loadLocalSubNavCache();
}

export function saveSubNavItems(items: SubNavigationItem[]): void {
  inMemorySubNav = items;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SUB_NAV_STORAGE_KEY, JSON.stringify(items));
      notifyNavigationChanged();
    } catch (err) {
      console.error('Error saving sub navigation data:', err);
    }
  }

  // Async persist to Firestore
  firestoreNavigationRepository.saveSubNav(items).catch((err) => {
    console.warn('[navigationStore] Firestore async saveSubNav error:', err);
  });
}

export function getPublicSubNavItems(): SubNavigationItem[] {
  const all = getStoredSubNavItems();
  return all
    .filter((item) => item.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function addSubNavItem(
  data: Omit<SubNavigationItem, 'id' | 'createdAt' | 'updatedAt'>
): SubNavigationItem {
  const items = getStoredSubNavItems();
  const now = new Date().toISOString();

  let sortOrder = data.sortOrder;
  if (!sortOrder) {
    sortOrder = items.length > 0 ? Math.max(...items.map((s) => s.sortOrder)) + 1 : 1;
  }

  const newItem: SubNavigationItem = {
    ...data,
    id: `subnav-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sortOrder,
    slug: data.slug || generateNavSlug(data.label),
    createdAt: now,
    updatedAt: now,
  };

  const updated = [...items, newItem];
  saveSubNavItems(updated);
  return newItem;
}

export function updateSubNavItem(
  id: string,
  data: Partial<SubNavigationItem>
): SubNavigationItem | null {
  const items = getStoredSubNavItems();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const current = items[index];
  const now = new Date().toISOString();

  const updatedItem: SubNavigationItem = {
    ...current,
    ...data,
    slug: data.label ? (data.slug || generateNavSlug(data.label)) : current.slug,
    updatedAt: now,
  };

  items[index] = updatedItem;
  saveSubNavItems(items);
  return updatedItem;
}

export function deleteSubNavItem(id: string): boolean {
  const items = getStoredSubNavItems();
  const updated = items.filter((i) => i.id !== id);
  saveSubNavItems(updated);

  firestoreNavigationRepository.deleteSubNavItem(id).catch((err) => {
    console.warn('[navigationStore] Firestore async deleteSubNavItem error:', err);
  });

  return true;
}

export function toggleSubNavItemActive(id: string): boolean {
  const items = getStoredSubNavItems();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return false;

  items[index].active = !items[index].active;
  items[index].updatedAt = new Date().toISOString();
  saveSubNavItems(items);
  return true;
}

export function moveSubNavItemOrder(id: string, direction: 'up' | 'down'): boolean {
  const items = getStoredSubNavItems().sort((a, b) => a.sortOrder - b.sortOrder);
  const targetIdx = items.findIndex((i) => i.id === id);
  if (targetIdx === -1) return false;

  const swapIdx = direction === 'up' ? targetIdx - 1 : targetIdx + 1;
  if (swapIdx < 0 || swapIdx >= items.length) return false;

  const target = items[targetIdx];
  const other = items[swapIdx];

  const tempOrder = target.sortOrder;
  target.sortOrder = other.sortOrder;
  other.sortOrder = tempOrder;

  if (target.sortOrder === other.sortOrder) {
    items.splice(targetIdx, 1);
    items.splice(swapIdx, 0, target);
    items.forEach((item, index) => {
      item.sortOrder = index + 1;
    });
  }

  saveSubNavItems(items);
  return true;
}

export function reorderSubNavItems(orderedIds: string[]): boolean {
  const items = getStoredSubNavItems();
  orderedIds.forEach((id, index) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      item.sortOrder = index + 1;
      item.updatedAt = new Date().toISOString();
    }
  });
  saveSubNavItems(items);
  return true;
}

export function getStoredSubNavSettings(): SubNavSettings {
  if (inMemorySubNavSettings) {
    return inMemorySubNavSettings;
  }
  return loadLocalSubNavSettingsCache();
}

export function saveSubNavSettings(settings: SubNavSettings): void {
  inMemorySubNavSettings = settings;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SUB_NAV_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      notifyNavigationChanged();
    } catch (err) {
      console.error('Error saving sub nav settings:', err);
    }
  }

  firestoreNavigationRepository.saveSubNavSettings(settings).catch((err) => {
    console.warn('[navigationStore] Firestore async saveSubNavSettings error:', err);
  });
}

export function resetToDefaultSubNavigation(): SubNavigationItem[] {
  saveSubNavItems(INITIAL_SUB_NAVIGATION_DATA);
  saveSubNavSettings(INITIAL_SUB_NAV_SETTINGS);
  return INITIAL_SUB_NAVIGATION_DATA;
}
