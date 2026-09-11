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

import {
  FooterConfig,
  MediaInfoData,
  CompanyLinksData,
  LegalLinksData,
  SocialMediaData,
  CopyrightData,
  FooterLogoData,
  MediaNetworkItem,
  FooterValidationErrors,
} from '@/src/types/footer';

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
  FooterConfig,
  MediaInfoData,
  CompanyLinksData,
  LegalLinksData,
  SocialMediaData,
  CopyrightData,
  FooterLogoData,
  MediaNetworkItem,
  FooterValidationErrors,
};

export interface SiteSettingsFetchResult {
  source: 'firestore' | 'seed-cache';
  settings: SiteSettings;
  warning?: string;
}

export interface FooterConfigFetchResult {
  source: 'firestore' | 'seed-cache';
  config: FooterConfig;
  warning?: string;
}
