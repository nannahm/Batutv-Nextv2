import React from 'react';

export const metadata = {
  title: 'BatuTV Control Panel - Dashboard CMS Redaksi',
  description: 'Pusat Manajemen Berita, Video Streaming, Jurnalis, dan Sistem BatuTV.',
};

export default function DashboardControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col">
      {children}
    </div>
  );
}
