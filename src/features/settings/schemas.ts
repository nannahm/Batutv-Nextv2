import { z } from 'zod';

export const supportedFontSchema = z.enum([
  'Inter',
  'Poppins',
  'Roboto',
  'Montserrat',
  'Open Sans',
  'Lato',
  'Outfit',
  'Plus Jakarta Sans',
]);

export const siteIdentitySchema = z.object({
  siteName: z.string().min(1, 'Nama situs wajib diisi').max(100),
  tagline: z.string().max(200).default(''),
  siteDescription: z.string().max(500).default(''),
  mainDomain: z.string().default('https://batutv.com'),
});

export const brandLogosSchema = z.object({
  headerDesktop: z.string().default('/brand/batutv-logo.svg'),
  headerDesktopAlt: z.string().optional().default(''),
  headerDesktopMediaId: z.string().optional(),

  navbarCompact: z.string().optional().default(''),
  navbarCompactAlt: z.string().optional().default(''),
  navbarCompactMediaId: z.string().optional(),

  headerMobile: z.string().default('/brand/batutv-logo.svg'),
  headerMobileAlt: z.string().optional().default(''),
  headerMobileMediaId: z.string().optional(),

  footer: z.string().default('/brand/batutv-logo.svg'),
  footerAlt: z.string().optional().default(''),
  footerMediaId: z.string().optional(),

  darkMode: z.string().optional().default(''),
  darkModeAlt: z.string().optional().default(''),
  darkModeMediaId: z.string().optional(),

  publisherSchema: z.string().default('/brand/batutv-logo-publisher.png'),
  publisherSchemaAlt: z.string().optional().default(''),
  publisherSchemaMediaId: z.string().optional(),
});

export const faviconSettingsSchema = z.object({
  faviconUrl: z.string().default('/favicon.svg'),
  faviconAlt: z.string().optional().default(''),
  faviconMediaId: z.string().optional(),
});

export const brandColorsSchema = z.object({
  primary: z.string().default('#D6001C'),
  secondary: z.string().default('#111827'),
  accent: z.string().default('#F59E0B'),
  background: z.string().default('#F8FAFC'),
});

export const topicBarTypographySchema = z.object({
  fontSize: z.number().default(11),
  fontWeight: z.enum(['400', '500', '600', '700']).default('400'),
  fontFamily: z.string().default('inherit'),
  textTransform: z.enum(['none', 'uppercase', 'capitalize', 'lowercase']).default('none'),
  badgePadding: z.enum(['compact', 'normal', 'spacious']).default('normal'),
  badgeBgColor: z.string().optional().default('#f1f3f5'),
  badgeTextColor: z.string().optional().default('#334155'),
});

export const navigationTypographySchema = z.object({
  fontSize: z.number().default(12.5),
  fontWeight: z.enum(['400', '500', '600', '700', '800', '900']).default('900'),
  letterSpacing: z.enum(['tight', 'normal', 'wide', 'wider']).default('wide'),
  textTransform: z.enum(['uppercase', 'capitalize', 'none']).default('uppercase'),
});

export const footerMenuTypographySchema = z.object({
  fontSize: z.number().default(13),
  fontWeight: z.enum(['400', '500', '600', '700']).default('700'),
  gap: z.enum(['compact', 'normal', 'spacious']).default('normal'),
  textColor: z.string().optional().default('#ffffff'),
  hoverColor: z.string().optional().default('#D6001C'),
});

export const typographySettingsSchema = z.object({
  headingFont: supportedFontSchema.default('Outfit'),
  bodyFont: supportedFontSchema.default('Plus Jakarta Sans'),
  headingWeight: z.enum(['600', '700', '800', '900']).optional().default('800'),
  bodyWeight: z.enum(['400', '500']).optional().default('400'),
  fontSizeScale: z.enum(['compact', 'normal', 'spacious']).optional().default('normal'),
  topicBar: topicBarTypographySchema.optional(),
  navigation: navigationTypographySchema.optional(),
  footerMenu: footerMenuTypographySchema.optional(),
});

export const globalSEOSettingsSchema = z.object({
  defaultSiteTitle: z.string().default('BATUTV - Portal Berita Batu Raya'),
  defaultMetaDescription: z.string().default('Portal Berita Terkini Seputar Kota Batu dan Malang Raya.'),
  defaultKeywords: z.string().default('batutv, berita kota batu, malang raya, jawa timur'),
  defaultOgImage: z.string().default('/brand/batutv-og.jpg'),
  defaultOgImageAlt: z.string().optional().default(''),
  defaultOgImageMediaId: z.string().optional(),
  titleSeparator: z.string().optional().default('|'),
});

export const publisherInfoSchema = z.object({
  companyName: z.string().default('PT BATU TELEVISI INDONESIA'),
  publisherName: z.string().default('Dewan Redaksi BatuTV'),
  fullAddress: z.string().default('Jl. TVRI No. 1, Oro-Oro Ombo, Kota Batu, Jawa Timur'),
  city: z.string().default('Kota Batu'),
  province: z.string().default('Jawa Timur'),
  postalCode: z.string().default('65316'),
  editorialEmail: z.string().default('redaksi@batutv.com'),
  businessEmail: z.string().default('marketing@batutv.com'),
  phoneNumber: z.string().default('(0341) 590000'),
  whatsApp: z.string().default('081234567890'),
});

export const socialMediaSettingsSchema = z.object({
  facebook: z.string().default('https://facebook.com/batutvofficial'),
  instagram: z.string().default('https://instagram.com/batutv'),
  youtube: z.string().default('https://youtube.com/@BatuTV'),
  tiktok: z.string().default('https://tiktok.com/@batutvofficial'),
  twitter: z.string().default('https://twitter.com/batutv'),
  telegram: z.string().default(''),
  linkedin: z.string().default(''),
});

export const googleVerificationSettingsSchema = z.object({
  googleSearchConsole: z.string().default(''),
  googleAnalyticsId: z.string().default(''),
  googleTagManagerId: z.string().default(''),
  metaPixelId: z.string().default(''),
  customHeaderScript: z.string().optional().default(''),
  customFooterScript: z.string().optional().default(''),
});

export const siteSettingsSchema = z.object({
  identity: siteIdentitySchema,
  logos: brandLogosSchema,
  favicon: faviconSettingsSchema,
  colors: brandColorsSchema,
  typography: typographySettingsSchema,
  seo: globalSEOSettingsSchema,
  publisher: publisherInfoSchema,
  socialMedia: socialMediaSettingsSchema,
  verification: googleVerificationSettingsSchema,
  updatedAt: z.string().default(() => new Date().toISOString()),
  updatedBy: z.string().optional().default('Administrator'),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
