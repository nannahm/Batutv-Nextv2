import {
  NavigationItem,
  NavigationItemWithChildren,
  NavigationTargetType,
  NavigationInternalType,
  SubNavigationItem,
  SubNavTargetType,
  SubNavSettings,
} from '@/src/types/navigation';

export type {
  NavigationItem,
  NavigationItemWithChildren,
  NavigationTargetType,
  NavigationInternalType,
  SubNavigationItem,
  SubNavTargetType,
  SubNavSettings,
};

export interface NavigationFetchResult {
  source: 'firestore' | 'seed-cache';
  items: NavigationItem[];
  tree: NavigationItemWithChildren[];
  warning?: string;
}

export interface SubNavFetchResult {
  source: 'firestore' | 'seed-cache';
  items: SubNavigationItem[];
  settings: SubNavSettings;
  warning?: string;
}
