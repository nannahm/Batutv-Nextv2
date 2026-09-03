import {
  NavigationItem,
  SubNavigationItem,
  SubNavSettings,
} from '../types/navigation';

export interface INavigationRepository {
  getPrimaryNav(): Promise<NavigationItem[]>;
  getSubNav(): Promise<SubNavigationItem[]>;
  getSubNavSettings(): Promise<SubNavSettings>;
  savePrimaryNav(items: NavigationItem[]): Promise<void>;
  saveSubNav(items: SubNavigationItem[]): Promise<void>;
  saveSubNavSettings(settings: SubNavSettings): Promise<void>;
  createPrimaryItem(item: NavigationItem): Promise<NavigationItem>;
  updatePrimaryItem(id: string, partial: Partial<NavigationItem>): Promise<NavigationItem>;
  deletePrimaryItem(id: string): Promise<void>;
  createSubNavItem(item: SubNavigationItem): Promise<SubNavigationItem>;
  updateSubNavItem(id: string, partial: Partial<SubNavigationItem>): Promise<SubNavigationItem>;
  deleteSubNavItem(id: string): Promise<void>;
  subscribe(
    onNext: (data: {
      primary: NavigationItem[];
      subNav: SubNavigationItem[];
      subNavSettings: SubNavSettings;
    }) => void,
    onError?: (error: Error) => void
  ): () => void;
}
