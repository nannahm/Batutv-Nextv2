export interface MediaInfoData {
  mediaName: string;
  shortDescription: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  editorialEmail: string;
  businessEmail: string;
  phoneNumber: string;
  whatsappNumber: string;
}

export interface CompanyLinksData {
  tentangKamiUrl: string;
  redaksiUrl: string;
  kontakUrl: string;
  karirUrl: string;
}

export interface LegalLinksData {
  pedomanMediaSiberUrl: string;
  kodeEtikJurnalistikUrl: string;
  disclaimerUrl: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
}

export interface SocialMediaData {
  showSection?: boolean;
  headingText?: string;
  facebookUrl: string;
  showFacebook?: boolean;
  instagramUrl: string;
  showInstagram?: boolean;
  youtubeUrl: string;
  showYoutube?: boolean;
  tiktokUrl: string;
  showTiktok?: boolean;
  xTwitterUrl: string;
  showXTwitter?: boolean;
  googleNewsUrl?: string;
  showGoogleNews?: boolean;
  telegramUrl: string;
  showTelegram?: boolean;
  linkedInUrl: string;
  showLinkedIn?: boolean;
}

export interface CopyrightData {
  copyrightText: string;
  networkSubtitle: string;
}

export interface FooterLogoData {
  showLogo?: boolean;
  logoUrl: string;
  altText: string;
  mediaId?: string;
}

export interface MediaNetworkItem {
  id: string;
  name: string;
  url: string;
  logoUrl?: string;
  presetStyle?: 'viva' | 'vlix' | 'tvonenews' | 'antvklik' | 'intipseleb' | 'jagodangdut' | 'custom';
  altText?: string;
  order: number;
  isActive: boolean;
}

export interface FooterConfig {
  mediaInfo: MediaInfoData;
  companyLinks: CompanyLinksData;
  legalLinks: LegalLinksData;
  socialMedia: SocialMediaData;
  copyright: CopyrightData;
  logo: FooterLogoData;
  mediaNetworks: MediaNetworkItem[];
  updatedAt: string;
  updatedBy?: string;
}

export interface FooterValidationErrors {
  mediaInfo?: Partial<Record<keyof MediaInfoData, string>>;
  companyLinks?: Partial<Record<keyof CompanyLinksData, string>>;
  legalLinks?: Partial<Record<keyof LegalLinksData, string>>;
  socialMedia?: Partial<Record<keyof SocialMediaData, string>>;
  copyright?: Partial<Record<keyof CopyrightData, string>>;
  logo?: Partial<Record<keyof FooterLogoData, string>>;
  mediaNetworks?: string;
}
