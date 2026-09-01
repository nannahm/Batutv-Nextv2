import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { getStoredSiteSettings } from '../../data/siteSettingsStore';
import { getBaseDomain } from '../../utils/seoGenerators';

interface SocialShareGroupProps {
  url?: string;
  title?: string;
  summary?: string;
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
}

export const SocialShareGroup: React.FC<SocialShareGroupProps> = ({
  url,
  title = 'Berita BatuTV',
  summary = '',
  className = '',
  iconSize = 'md',
}) => {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (url && url.trim().length > 0) {
      const cleanUrl = url.trim();
      if (typeof window !== 'undefined' && window.location.origin) {
        const origin = window.location.origin.replace(/\/+$/, '');
        if (origin && !origin.includes('localhost:3000') && cleanUrl.startsWith('https://batutv.com')) {
          return cleanUrl.replace('https://batutv.com', origin);
        }
      }
      return cleanUrl;
    }
    if (typeof window !== 'undefined' && window.location.href) {
      return window.location.href;
    }
    const base = getBaseDomain();
    return base;
  };

  const currentUrl = getShareUrl();
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleShare = (platform: 'facebook' | 'whatsapp' | 'twitter' | 'telegram') => {
    let shareLink = '';
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'whatsapp': {
        const settings = getStoredSiteSettings();
        const cleanTitle = (title || 'Berita BatuTV').trim();
        const cleanExcerpt = (summary || '').trim();

        const igUrl = settings.socialMedia?.instagram || 'https://instagram.com/batutv_official';
        const tiktokUrl = settings.socialMedia?.tiktok || 'https://tiktok.com/@batutv_official';
        const fbUrl = settings.socialMedia?.facebook || 'https://facebook.com/batutvofficial';
        const ytUrl = settings.socialMedia?.youtube || 'https://youtube.com/@batutv_official';

        // WhatsApp message format required:
        // *{ARTICLE_TITLE}*
        //
        // {ARTICLE_URL}
        //
        // {ARTICLE_EXCERPT}
        //
        // *Ikuti kami di berbagai platform untuk update berita terbaru:*
        //
        // *Instagram*
        // {INSTAGRAM_URL}
        //
        // *TikTok*
        // {TIKTOK_URL}
        //
        // *Facebook*
        // {FACEBOOK_URL}
        //
        // *YouTube*
        // {YOUTUBE_URL}
        const messageParts: string[] = [
          `*${cleanTitle}*`,
          '',
          currentUrl,
        ];

        if (cleanExcerpt) {
          messageParts.push('', cleanExcerpt);
        }

        messageParts.push(
          '',
          '*Ikuti kami di berbagai platform untuk update berita terbaru:*',
          '',
          '*Instagram*',
          igUrl,
          '',
          '*TikTok*',
          tiktokUrl,
          '',
          '*Facebook*',
          fbUrl,
          '',
          '*YouTube*',
          ytUrl
        );

        const whatsappMessage = messageParts.join('\n');
        shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;
        break;
      }
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
    }

    if (shareLink && typeof window !== 'undefined') {
      window.open(shareLink, '_blank', 'width=600,height=500,scrollbars=yes,resizable=yes');
    }
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-9 h-9',
  };

  const btnClass = `${sizeClasses[iconSize]} rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-none`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 1. FACEBOOK (Official Meta Vector Icon) */}
      <button
        type="button"
        onClick={() => handleShare('facebook')}
        aria-label="Bagikan ke Facebook"
        title="Bagikan ke Facebook"
        className={`${btnClass} bg-[#1877F2] hover:bg-[#166fe5] text-white`}
      >
        <svg
          className="w-4 h-4 fill-white"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </button>

      {/* 2. WHATSAPP (Official WhatsApp Vector with Handset Phone) */}
      <button
        type="button"
        onClick={() => handleShare('whatsapp')}
        aria-label="Bagikan ke WhatsApp"
        title="Bagikan ke WhatsApp"
        className={`${btnClass} bg-[#25D366] hover:bg-[#20bd5a] text-white`}
      >
        <svg
          className="w-[18px] h-[18px] fill-white"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2ZM12.04 3.67C14.24 3.67 16.31 4.53 17.87 6.09C19.42 7.64 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.04 20.16C10.66 20.16 9.3 19.8 8.1 19.09L7.81 18.92L4.7 19.74L5.53 16.71L5.34 16.41C4.55 15.15 4.14 13.56 4.14 11.92C4.14 7.38 7.84 3.67 12.04 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.72C7 10.94 7.89 12.12 8.01 12.29C8.14 12.45 9.74 14.92 12.19 15.98C12.78 16.23 13.23 16.38 13.59 16.5C14.18 16.68 14.72 16.66 15.15 16.6C15.63 16.53 16.62 16 16.83 15.42C17.04 14.84 17.04 14.34 16.98 14.24C16.91 14.13 16.75 14.07 16.5 13.95C16.25 13.82 15.02 13.22 14.79 13.14C14.57 13.06 14.4 13.02 14.24 13.27C14.07 13.51 13.6 14.07 13.45 14.24C13.31 14.4 13.16 14.42 12.91 14.3C12.67 14.17 11.87 13.91 10.93 13.07C10.19 12.41 9.7 11.6 9.55 11.35C9.41 11.11 9.53 10.97 9.66 10.85C9.77 10.74 9.91 10.55 10.03 10.41C10.16 10.26 10.2 10.16 10.28 10C10.36 9.83 10.32 9.69 10.26 9.56C10.2 9.44 9.7 8.22 9.5 7.73C9.3 7.25 9.1 7.31 8.94 7.31L8.53 7.33Z" />
        </svg>
      </button>

      {/* 3. X (Official Geometric Vector Monogram) */}
      <button
        type="button"
        onClick={() => handleShare('twitter')}
        aria-label="Bagikan ke X"
        title="Bagikan ke X"
        className={`${btnClass} bg-black hover:bg-neutral-900 text-white`}
      >
        <svg
          className="w-3.5 h-3.5 fill-white"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      {/* 4. TELEGRAM (Official Paper Plane Vector) */}
      <button
        type="button"
        onClick={() => handleShare('telegram')}
        aria-label="Bagikan ke Telegram"
        title="Bagikan ke Telegram"
        className={`${btnClass} bg-[#24A1DE] hover:bg-[#2092c9] text-white`}
      >
        <svg
          className="w-4 h-4 fill-white"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 0C5.37 0 0 5.37 0 12C0 18.63 5.37 24 12 24C18.63 24 24 18.63 24 12C24 5.37 18.63 0 12 0ZM17.9 8.24L15.93 17.52C15.78 18.18 15.39 18.34 14.84 18.03L11.84 15.82L10.39 17.21C10.23 17.37 10.1 17.5 9.79 17.5L10.01 14.45L15.56 9.44C15.8 9.22 15.51 9.1 15.19 9.31L8.33 13.63L5.37 12.7C4.73 12.5 4.71 12.06 5.5 11.75L17.07 7.29C17.61 7.09 18.08 7.42 17.9 8.24Z" />
        </svg>
      </button>

      {/* 5. COPY LINK (Precision Chain Vector & Feedback Checkmark) */}
      <button
        type="button"
        onClick={handleCopy}
        className={`${btnClass} ${
          copied
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-700 hover:bg-slate-800 text-white'
        }`}
        aria-label="Salin Tautan"
        title={copied ? 'Tautan Berhasil Disalin!' : 'Salin Tautan'}
      >
        {copied ? (
          <Check className="w-4 h-4 stroke-[2.8]" />
        ) : (
          <svg
            className="w-4 h-4 stroke-current fill-none"
            viewBox="0 0 24 24"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        )}
      </button>
    </div>
  );
};
