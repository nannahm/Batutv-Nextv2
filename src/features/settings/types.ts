import {
  SiteSettings,
  SiteIdentity,
  BrandLogos,
  FaviconSettings,
  BrandColors,
  TypographySettings,
  SupportedFont,
  GlobalSEOSettings,
  PublisherInfo,
  SocialMediaSettings,
  GoogleVerificationSettings,
  SiteSettingsValidationErrors,
} from '@/src/types/siteSettings';

export type {
  SiteSettings,
  SiteIdentity,
  BrandLogos,
  FaviconSettings,
  BrandColors,
  TypographySettings,
  SupportedFont,
  GlobalSEOSettings,
  PublisherInfo,
  SocialMediaSettings,
  GoogleVerificationSettings,
  SiteSettingsValidationErrors,
};

export interface SiteSettingsFetchResult {
  source: 'firestore' | 'seed-cache';
  settings: SiteSettings;
  warning?: string;
}
