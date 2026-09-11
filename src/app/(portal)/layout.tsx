import React from 'react';
import type { Metadata } from 'next';
import { Footer } from '@/src/components/Footer';
import { fetchFooterConfigLive, fetchSiteSettingsLive } from '@/src/features/settings';

export async function generateMetadata(): Promise<Metadata> {
  const settingsResult = await fetchSiteSettingsLive();
  const { seo, identity } = settingsResult.settings;

  return {
    title: {
      default:
        seo?.defaultSiteTitle ||
        `${identity?.siteName || 'BatuTV'} - ${identity?.tagline || 'Portal Berita Batu Raya'}`,
      template: `%s ${seo?.titleSeparator || '|'} ${identity?.siteName || 'BatuTV'}`,
    },
    description:
      seo?.defaultMetaDescription ||
      identity?.siteDescription ||
      'Portal berita teraktual, independen dan terpercaya.',
    openGraph: {
      title: seo?.defaultSiteTitle || identity?.siteName || 'BatuTV',
      description: seo?.defaultMetaDescription || identity?.siteDescription,
      images: seo?.defaultOgImage ? [seo.defaultOgImage] : ['/brand/batutv-og.jpg'],
    },
  };
}

export default async function PortalGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [footerResult, settingsResult] = await Promise.all([
    fetchFooterConfigLive(),
    fetchSiteSettingsLive(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
      <Footer
        initialFooterConfig={footerResult.config}
        initialSiteSettings={settingsResult.settings}
      />
    </div>
  );
}
