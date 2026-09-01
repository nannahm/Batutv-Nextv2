import React from 'react';

export interface BatuTVBrandLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'symbol';
  theme?: 'light' | 'dark' | 'auto';
  height?: number | string;
  showSlogan?: boolean;
  customLogoUrl?: string;
  altText?: string;
}

/**
 * Official BatuTV Brand Logo Component
 * High-fidelity, ultra-crisp vector rendering directly generated from the official BatuTV identity:
 * - Left Emblem: Bold stylized 'B' with white/red cutouts, 3D red faceted wing, and broadcast signal arcs
 * - Wordmark: Extra bold geometric 'BATU' with dynamic slanted red ribbon crossbar on 'A'
 * - TV Badge: Glossy red 3D slanted pill with italic white 'TV'
 * - Subline: Red rule, accent dot, and 'TELEVISI KOTA BATU'
 */
export const BatuTVBrandLogo: React.FC<BatuTVBrandLogoProps> = ({
  className = '',
  variant = 'full',
  theme = 'auto',
  height = 42,
  showSlogan = true,
  customLogoUrl,
  altText = 'BatuTV - Televisi Kota Batu',
}) => {
  const [imageError, setImageError] = React.useState(false);

  // If custom logo image is provided and valid (and not an internal vector placeholder that failed)
  if (
    customLogoUrl &&
    !imageError &&
    customLogoUrl !== '/brand/batutv-logo.svg' &&
    customLogoUrl !== '/brand/batutv-logo-dark.svg' &&
    customLogoUrl !== '/brand/batutv-logo-publisher.png'
  ) {
    return (
      <img
        src={customLogoUrl}
        alt={altText}
        className={`shrink-0 select-none object-contain max-w-full ${className}`}
        style={{ height }}
        onError={() => setImageError(true)}
      />
    );
  }

  // 1. Symbol Only Variant (Emblem B with broadcast arcs and 3D wing)
  if (variant === 'symbol') {
    return (
      <svg
        viewBox="0 0 250 240"
        className={`shrink-0 select-none ${className}`}
        style={{ height }}
        aria-label={altText}
      >
        <defs>
          <linearGradient id="sym-tv-wing-top" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d5a" />
            <stop offset="100%" stopColor="#e50914" />
          </linearGradient>
          <linearGradient id="sym-tv-wing-mid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e50914" />
            <stop offset="100%" stopColor="#b3000b" />
          </linearGradient>
          <linearGradient id="sym-tv-wing-deep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b3000b" />
            <stop offset="100%" stopColor="#660005" />
          </linearGradient>
          <linearGradient id="sym-tv-dark-charcoal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#252930" />
            <stop offset="60%" stopColor="#15171b" />
            <stop offset="100%" stopColor="#0a0b0d" />
          </linearGradient>
        </defs>

        <g transform="translate(10, 15)">
          {/* Broadcast Waves: Outer Dashed Arc */}
          <path
            d="M 195 38 C 248 80, 248 152, 195 194"
            stroke="#555c68"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="8 10"
            fill="none"
            opacity="0.85"
          />

          {/* Broadcast Waves: Inner Solid Red Arc */}
          <path
            d="M 175 52 C 218 85, 218 145, 175 178"
            stroke="#e50914"
            strokeWidth="6.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Main Solid Base 'B' Silhouette */}
          <path
            d="M 42 28 H 122 C 158 28 178 48 178 76 C 178 94 165 106 146 112 C 172 118 186 134 186 160 C 186 190 160 206 122 206 H 42 V 28 Z"
            fill="url(#sym-tv-dark-charcoal)"
          />

          {/* Upper Inner Counter Cutout (Crisp White) */}
          <path
            d="M 76 54 H 118 C 136 54 146 62 146 75 C 146 88 136 96 118 96 H 76 V 54 Z"
            fill="#ffffff"
          />

          {/* Lower Inner Counter Cutout */}
          <path
            d="M 76 138 H 118 C 138 138 150 148 150 162 C 150 176 138 184 118 184 H 76 V 138 Z"
            fill="#ffffff"
          />

          {/* Lower Left Red Accent Triangle Cutout */}
          <polygon
            points="76,184 135,184 76,142"
            fill="#e50914"
          />

          {/* 3D Faceted Dynamic Red Wing Overlay */}
          <polygon
            points="120,40 160,68 130,112 108,78"
            fill="url(#sym-tv-wing-top)"
          />
          
          <path
            d="M 124 44 
               C 155 52, 192 76, 190 108 
               C 188 128, 172 144, 150 152 
               C 176 164, 196 186, 174 212 
               C 152 200, 130 176, 114 154 
               C 134 136, 146 118, 144 98 
               C 142 80, 132 60, 124 44 Z"
            fill="url(#sym-tv-wing-mid)"
          />

          <polygon
            points="130,112 178,146 142,196 114,154"
            fill="url(#sym-tv-wing-deep)"
            opacity="0.9"
          />

          <path
            d="M 124 44 L 164 104 L 114 154"
            stroke="#ff6b76"
            strokeWidth="1.8"
            fill="none"
            opacity="0.75"
          />
        </g>
      </svg>
    );
  }

  // 2. Full or Compact Variant
  const isDark = theme === 'dark';
  const textColor = isDark ? '#ffffff' : '#15171b';
  const subtextColor = isDark ? '#cbd5e1' : '#737987';

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <svg
        viewBox={showSlogan && variant === 'full' ? '52 0 768 250' : '52 0 768 195'}
        className="h-full w-auto max-w-full"
        aria-label={altText}
        fill="none"
      >
        <defs>
          {/* 3D Red Badge Gradient for TV */}
          <linearGradient id="comp-tv-badge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff3a49" />
            <stop offset="40%" stopColor="#e50914" />
            <stop offset="85%" stopColor="#aa0009" />
            <stop offset="100%" stopColor="#7a0005" />
          </linearGradient>

          {/* Gloss Highlight for TV Badge */}
          <linearGradient id="comp-tv-gloss" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
          </linearGradient>

          {/* Red Wing Facet Gradients */}
          <linearGradient id="comp-wing-top" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d5a" />
            <stop offset="100%" stopColor="#e50914" />
          </linearGradient>

          <linearGradient id="comp-wing-mid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e50914" />
            <stop offset="100%" stopColor="#b3000b" />
          </linearGradient>

          <linearGradient id="comp-wing-deep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b3000b" />
            <stop offset="100%" stopColor="#660005" />
          </linearGradient>

          {/* Charcoal/Black Gradient for BATU text */}
          <linearGradient id="comp-dark-charcoal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#252930" />
            <stop offset="60%" stopColor="#15171b" />
            <stop offset="100%" stopColor="#0a0b0d" />
          </linearGradient>

          {/* TV Badge Shadow */}
          <filter id="comp-badge-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* 1. LEFT EMBLEM */}
        <g transform="translate(10, 15)">
          {/* Broadcast Waves: Outer Dashed Arc */}
          <path
            d="M 195 38 C 248 80, 248 152, 195 194"
            stroke={isDark ? '#6b7280' : '#555c68'}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="8 10"
            fill="none"
            opacity="0.85"
          />

          {/* Broadcast Waves: Inner Solid Red Arc */}
          <path
            d="M 175 52 C 218 85, 218 145, 175 178"
            stroke="#e50914"
            strokeWidth="6.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Main Base 'B' */}
          <path
            d="M 42 28 H 122 C 158 28 178 48 178 76 C 178 94 165 106 146 112 C 172 118 186 134 186 160 C 186 190 160 206 122 206 H 42 V 28 Z"
            fill={isDark ? '#1a1c22' : 'url(#comp-dark-charcoal)'}
          />

          {/* Upper Inner Counter Cutout (White) */}
          <path
            d="M 76 54 H 118 C 136 54 146 62 146 75 C 146 88 136 96 118 96 H 76 V 54 Z"
            fill="#ffffff"
          />

          {/* Lower Inner Counter Cutout (White) */}
          <path
            d="M 76 138 H 118 C 138 138 150 148 150 162 C 150 176 138 184 118 184 H 76 V 138 Z"
            fill="#ffffff"
          />

          {/* Lower Left Red Accent Triangle */}
          <polygon
            points="76,184 135,184 76,142"
            fill="#e50914"
          />

          {/* 3D Faceted Red Wing */}
          <polygon
            points="120,40 160,68 130,112 108,78"
            fill="url(#comp-wing-top)"
          />
          
          <path
            d="M 124 44 
               C 155 52, 192 76, 190 108 
               C 188 128, 172 144, 150 152 
               C 176 164, 196 186, 174 212 
               C 152 200, 130 176, 114 154 
               C 134 136, 146 118, 144 98 
               C 142 80, 132 60, 124 44 Z"
            fill="url(#comp-wing-mid)"
          />

          <polygon
            points="130,112 178,146 142,196 114,154"
            fill="url(#comp-wing-deep)"
            opacity="0.9"
          />

          <path
            d="M 124 44 L 164 104 L 114 154"
            stroke="#ff7a84"
            strokeWidth="1.8"
            fill="none"
            opacity="0.75"
          />
        </g>

        {/* 2. WORDMARK 'BATU' */}
        <g fill={textColor}>
          {/* Letter 'B' */}
          <path d="M 276 68 H 324 C 344 68 357 78 357 93 C 357 104 350 111 338 115 C 352 119 361 128 361 143 C 361 160 346 170 324 170 H 276 V 68 Z M 300 86 V 107 H 322 C 331 107 337 103 337 96 C 337 90 331 86 322 86 H 300 Z M 300 126 V 152 H 324 C 334 152 341 147 341 139 C 341 131 334 126 324 126 H 300 Z" />

          {/* Letter 'A' */}
          <path d="M 396 68 H 424 L 458 170 H 433 L 426 148 H 394 L 387 170 H 362 L 396 68 Z M 410 98 L 399 130 H 421 L 410 98 Z" />

          {/* Letter 'T' */}
          <path d="M 458 68 H 530 V 90 H 507 V 170 H 481 V 90 H 458 V 68 Z" />

          {/* Letter 'U' */}
          <path d="M 538 68 H 564 V 136 C 564 151 574 158 587 158 C 600 158 610 151 610 136 V 68 H 636 V 135 C 636 159 618 172 587 172 C 556 172 538 159 538 135 V 68 Z" />
        </g>

        {/* Slanted Dynamic Red Ribbon on 'A' */}
        <polygon
          points="382,142 438,118 442,132 386,156"
          fill="#e50914"
        />

        {/* 3. RED GLOSSY 'TV' BADGE */}
        <g transform="translate(642, 68)" filter="url(#comp-badge-shadow)">
          <path
            d="M 24 0 H 132 C 146 0 156 9 153 23 L 138 83 C 135 95 125 102 112 102 H 6 C -8 102 -18 93 -15 79 L 0 19 C 3 7 12 0 24 0 Z"
            fill="url(#comp-tv-badge-grad)"
          />

          <path
            d="M 24 2 H 130 C 142 2 150 9 148 20 L 140 54 C 110 46 45 46 8 58 L 2 20 C 4 8 13 2 24 2 Z"
            fill="url(#comp-tv-gloss)"
          />

          <g transform="translate(34, 76)">
            <path
              d="M 0 -54 H 42 V -39 H 28 V 0 H 12 V -39 H 0 V -54 Z"
              fill="#ffffff"
              transform="skewX(-14)"
            />
            <path
              d="M 44 -54 H 60 L 78 -8 L 96 -54 H 112 L 86 0 H 70 L 44 -54 Z"
              fill="#ffffff"
              transform="skewX(-14)"
            />
          </g>
        </g>

        {/* 4. SUBTITLE & RED ACCENT LINE (Full Variant) */}
        {showSlogan && variant === 'full' && (
          <g transform="translate(276, 188)">
            <line
              x1="0"
              y1="0"
              x2="320"
              y2="0"
              stroke="#e50914"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle
              cx="332"
              cy="0"
              r="3"
              fill="#e50914"
            />
            <text
              x="2"
              y="22"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="16.5"
              fontWeight="700"
              letterSpacing="0.48em"
              fill={subtextColor}
            >
              TELEVISI KOTA BATU
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
