import { SiteSettings } from '../types/siteSettings';

export interface ISiteSettingsRepository {
  getSettings(): Promise<SiteSettings>;
  saveSettings(settings: SiteSettings): Promise<SiteSettings>;
  subscribe(
    onNext: (settings: SiteSettings) => void,
    onError?: (error: Error) => void
  ): () => void;
}
