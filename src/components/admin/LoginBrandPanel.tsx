import React from 'react';
import { BatuTVLogo } from './BatuTVLogo';
import { MediaIllustration } from './MediaIllustration';

interface LoginBrandPanelProps {
  className?: string;
  onGoHome?: () => void;
}

export const LoginBrandPanel: React.FC<LoginBrandPanelProps> = ({
  className = '',
  onGoHome,
}) => {
  return (
    <div
      id="login-brand-panel"
      className={`relative flex flex-col justify-between p-6 sm:p-8 lg:p-10 bg-[#f4f6fc] border-b lg:border-b-0 lg:border-r border-slate-100 overflow-hidden ${className}`}
    >
      {/* Background Subtle Gradient & Grid Accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-[#f4f6fc] to-[#e8edf7] pointer-events-none" />
      
      {/* Top: Logo with Link to Portal */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          type="button"
          onClick={onGoHome}
          className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md transition-opacity hover:opacity-95"
          aria-label="BatuTV Portal Berita Batu"
          title="Kembali ke Beranda"
        >
          <BatuTVLogo size="md" />
        </button>
      </div>

      {/* Center: High-Fidelity 3D Isometric Media Broadcast Artwork */}
      <div className="relative z-10 my-auto py-6 sm:py-8 flex items-center justify-center">
        <MediaIllustration />
      </div>

      {/* Bottom Subtle Note (Desktop only) */}
      <div className="relative z-10 hidden lg:block text-left">
        <p className="text-[11.5px] text-slate-400 font-medium tracking-wide">
          Sistem Manajemen Konten &amp; Redaksi Terintegrasi
        </p>
      </div>
    </div>
  );
};
