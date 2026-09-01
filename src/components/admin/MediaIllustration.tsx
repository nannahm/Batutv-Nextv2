import React from 'react';

interface MediaIllustrationProps {
  className?: string;
}

export const MediaIllustration: React.FC<MediaIllustrationProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full max-w-[480px] aspect-[4/3] flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 600 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
        aria-label="Ilustrasi Studio Broadcast & Newsroom BatuTV"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="isoBaseGrad" x1="100" y1="200" x2="500" y2="460" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e8edfa" />
            <stop offset="100%" stopColor="#dce4f7" />
          </linearGradient>

          <linearGradient id="screenGrad" x1="150" y1="120" x2="420" y2="340" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1a202c" />
          </linearGradient>

          <linearGradient id="redAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff2a3b" />
            <stop offset="100%" stopColor="#d30816" />
          </linearGradient>

          <linearGradient id="deskGrad" x1="240" y1="280" x2="380" y2="380" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#edf2f9" />
          </linearGradient>

          <linearGradient id="towerGrad" x1="90" y1="150" x2="150" y2="360" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8ba4c9" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Isometric Platform / Ground Base Plane */}
        <polygon
          points="300,160 540,280 300,430 60,300"
          fill="url(#isoBaseGrad)"
          opacity="0.75"
        />
        <polygon
          points="60,300 300,430 300,442 60,312"
          fill="#c8d5ee"
          opacity="0.9"
        />
        <polygon
          points="300,430 540,280 540,292 300,442"
          fill="#b3c5e5"
          opacity="0.9"
        />

        {/* Distant Background Soft Silhouette (Pagoda / Landmark) */}
        <g opacity="0.22" fill="#88a2ce">
          {/* Central Soft Building/Temple Tower */}
          <polygon points="260,140 280,120 300,140" />
          <polygon points="250,160 280,135 310,160" />
          <polygon points="240,185 280,155 320,185" />
          <rect x="265" y="185" width="30" height="40" />
          {/* Spire Tower on right */}
          <polygon points="400,150 410,125 420,150" />
          <rect x="405" y="150" width="10" height="50" />
        </g>

        {/* Left Side: Broadcast Transmission Tower */}
        <g id="broadcastTower">
          {/* Tower legs and lattice */}
          <line x1="120" y1="170" x2="90" y2="340" stroke="url(#towerGrad)" strokeWidth="4" strokeLinecap="round" />
          <line x1="120" y1="170" x2="150" y2="340" stroke="url(#towerGrad)" strokeWidth="4" strokeLinecap="round" />
          <line x1="90" y1="340" x2="150" y2="340" stroke="#64748b" strokeWidth="3" />
          {/* Cross braces */}
          <line x1="98" y1="300" x2="142" y2="300" stroke="#7e96b8" strokeWidth="2.5" />
          <line x1="98" y1="300" x2="142" y2="260" stroke="#7e96b8" strokeWidth="2" />
          <line x1="142" y1="300" x2="98" y2="260" stroke="#7e96b8" strokeWidth="2" />
          <line x1="106" y1="260" x2="134" y2="260" stroke="#7e96b8" strokeWidth="2" />
          <line x1="106" y1="260" x2="134" y2="220" stroke="#7e96b8" strokeWidth="1.8" />
          <line x1="134" y1="260" x2="106" y2="220" stroke="#7e96b8" strokeWidth="1.8" />
          <line x1="113" y1="220" x2="127" y2="220" stroke="#7e96b8" strokeWidth="1.5" />
          {/* Top Antenna Mast & Beacon */}
          <line x1="120" y1="170" x2="120" y2="140" stroke="#e50914" strokeWidth="3" />
          <circle cx="120" cy="140" r="4.5" fill="#e50914" filter="url(#softGlow)" />

          {/* Radiating Red Broadcast Signal Waves */}
          <path d="M106,132 C102,137 102,143 106,148" stroke="#e50914" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M96,126 C90,134 90,146 96,154" stroke="#e50914" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M134,132 C138,137 138,143 134,148" stroke="#e50914" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M144,126 C150,134 150,146 144,154" stroke="#e50914" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
        </g>

        {/* Big Studio Desktop Monitor (Isometric Perspective) */}
        <g id="mainMonitor">
          {/* Monitor Stand Base & Arm */}
          <polygon points="190,320 220,305 240,315 210,330" fill="#94a3b8" />
          <polygon points="205,270 220,260 225,295 210,305" fill="#64748b" />

          {/* Outer Monitor Frame (White/Silver bezel) */}
          <polygon points="140,200 340,110 395,250 195,340" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          <polygon points="195,340 395,250 398,258 198,348" fill="#94a3b8" />
          <polygon points="140,200 140,208 198,348 195,340" fill="#64748b" />

          {/* Screen Inner Display Area */}
          <polygon points="152,203 332,122 383,245 203,326" fill="url(#screenGrad)" />

          {/* Screen UI: Header Bar */}
          <g>
            {/* Hamburger Icon */}
            <line x1="164" y1="214" x2="173" y2="210" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="164" y1="217" x2="173" y2="213" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Logo on screen: "BatuTV" */}
            <text x="215" y="195" fill="#ffffff" fontSize="13" fontWeight="900" transform="rotate(-23 215 195)">
              Batu<tspan fill="#e50914">TV</tspan>
            </text>
            {/* Search icon */}
            <circle cx="340" cy="150" r="3.5" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
            <line x1="343" y1="152" x2="346" y2="155" stroke="#94a3b8" strokeWidth="1.2" />
          </g>

          {/* Screen UI: Center Big Red Play Button */}
          <g>
            <circle cx="270" cy="215" r="16" fill="url(#redAccentGrad)" filter="url(#softGlow)" />
            <polygon points="266,208 277,215 266,222" fill="#ffffff" />
          </g>

          {/* Screen UI: Thumbnail Carousel / Grid Cards Below */}
          <g opacity="0.9">
            <polygon points="180,285 210,272 225,295 195,308" fill="#334155" stroke="#475569" strokeWidth="1" />
            <circle cx="202" cy="290" r="3" fill="#e50914" />
            
            <polygon points="218,268 248,255 263,278 233,291" fill="#334155" stroke="#475569" strokeWidth="1" />
            <circle cx="240" cy="273" r="3" fill="#38bdf8" />

            <polygon points="256,251 286,238 301,261 271,274" fill="#334155" stroke="#475569" strokeWidth="1" />
            <circle cx="278" cy="256" r="3" fill="#e50914" />

            <polygon points="294,234 324,221 339,244 309,257" fill="#334155" stroke="#475569" strokeWidth="1" />
            <circle cx="316" cy="239" r="3" fill="#a855f7" />
          </g>
        </g>

        {/* Floating Red Speech Bubble with Play Icon */}
        <g id="floatingPlayBubble">
          <polygon points="380,185 415,195 415,225 380,215" fill="#e50914" rx="4" />
          {/* Rounded Rect Bubble effect */}
          <rect x="382" y="185" width="28" height="26" rx="6" fill="#e50914" filter="url(#softGlow)" />
          <polygon points="392,193 403,198 392,204" fill="#ffffff" />
          {/* Bubble tail */}
          <polygon points="383,208 376,215 388,210" fill="#e50914" />
        </g>

        {/* Newsroom Editorial Desk with Audio Console */}
        <g id="newsDesk">
          {/* Desk Top Surface */}
          <polygon points="260,310 380,260 410,290 290,340" fill="url(#deskGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Desk Front Panel */}
          <polygon points="290,340 410,290 410,335 290,385" fill="#cbd5e1" />
          {/* Desk Side Panel */}
          <polygon points="260,310 290,340 290,385 260,355" fill="#94a3b8" />

          {/* Sound & Audio Mixing Console Surface */}
          <polygon points="280,315 330,295 345,315 295,335" fill="#1e293b" />
          {/* Console colorful knobs & sliders */}
          <circle cx="295" cy="318" r="1.8" fill="#e50914" />
          <circle cx="302" cy="315" r="1.8" fill="#38bdf8" />
          <circle cx="309" cy="312" r="1.8" fill="#22c55e" />
          <circle cx="316" cy="309" r="1.8" fill="#eab308" />
          <line x1="322" y1="302" x2="332" y2="315" stroke="#64748b" strokeWidth="1.5" />
          <line x1="328" y1="300" x2="338" y2="313" stroke="#64748b" strokeWidth="1.5" />

          {/* Seated Editor / Operator (Female News Editor with headset) */}
          <g id="seatedOperator">
            {/* Operator Chair Base */}
            <polygon points="360,330 385,320 395,340 370,350" fill="#334155" />
            <line x1="380" y1="340" x2="380" y2="365" stroke="#1e293b" strokeWidth="3" />
            <polygon points="365,365 395,365 380,380" fill="#0f172a" />
            {/* Operator Body & Red Outfit */}
            <path d="M370,295 C370,285 395,280 395,295 L395,330 L370,335 Z" fill="#e50914" />
            {/* Arms at desk */}
            <path d="M365,305 L345,315" stroke="#e50914" strokeWidth="5" strokeLinecap="round" />
            {/* Head & Hair */}
            <circle cx="382" cy="275" r="9" fill="#1e293b" />
            <circle cx="380" cy="276" r="6.5" fill="#fbcfe8" />
            {/* Headset */}
            <path d="M375,272 C375,268 387,268 387,272" stroke="#38bdf8" strokeWidth="2" fill="none" />
            <circle cx="375" cy="274" r="2.5" fill="#0284c7" />

            {/* Laptop / Screen on Desk */}
            <polygon points="325,285 360,270 365,295 330,310" fill="#0f172a" stroke="#475569" strokeWidth="1" />
            <polygon points="330,286 355,275 358,294 333,305" fill="#1e293b" />
            <text x="335" y="295" fill="#ffffff" fontSize="6" fontWeight="bold" transform="rotate(-23 335 295)">
              Batu<tspan fill="#e50914">TV</tspan>
            </text>
          </g>
        </g>

        {/* Standing News Reporter / Anchor (Male in Red & Navy) */}
        <g id="standingReporter">
          {/* Head & Hair */}
          <circle cx="215" cy="285" r="9" fill="#1e293b" />
          <circle cx="216" cy="287" r="7" fill="#fed7aa" />
          <path d="M210,282 C210,278 222,278 223,284 Z" fill="#1e293b" />

          {/* Torso: Red Polo / Shirt */}
          <path d="M202,298 C202,293 228,293 228,298 L226,335 L204,335 Z" fill="#e50914" />

          {/* Left Arm holding Mobile / Smart Tablet */}
          <path d="M204,302 L196,316 L210,324" stroke="#e50914" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Mobile device screen */}
          <polygon points="208,318 218,313 222,326 212,331" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />

          {/* Right Arm */}
          <path d="M226,302 L230,318" stroke="#e50914" strokeWidth="4.5" strokeLinecap="round" />

          {/* Pants: Dark Navy */}
          <path d="M204,335 L204,385 L213,385 L215,345 L217,385 L226,385 L226,335 Z" fill="#1e293b" />
          {/* Shoes: White Sneakers */}
          <ellipse cx="208" cy="386" rx="5" ry="2.5" fill="#f8fafc" />
          <ellipse cx="222" cy="386" rx="5" ry="2.5" fill="#f8fafc" />
        </g>

        {/* Studio Broadcast Video Camera on Tripod (Right side) */}
        <g id="studioCamera">
          {/* Tripod Legs */}
          <line x1="440" y1="270" x2="415" y2="365" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="440" y1="270" x2="445" y2="375" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="440" y1="270" x2="465" y2="355" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="440" cy="270" r="4" fill="#0f172a" />

          {/* Camera Body & Lens */}
          <polygon points="420,245 450,230 460,250 430,265" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          {/* Camera Lens Hood (pointing left at anchor) */}
          <polygon points="415,248 425,243 425,258 415,253" fill="#0f172a" />
          <ellipse cx="415" cy="250" rx="2" ry="4" fill="#38bdf8" />
          {/* Top Tally Light / Red Rec Light */}
          <circle cx="442" cy="232" r="2.5" fill="#e50914" filter="url(#softGlow)" />
        </g>

        {/* Studio Microphone Stand (Left foreground) */}
        <g id="studioMic">
          {/* Mic Stand Base */}
          <ellipse cx="115" cy="370" rx="14" ry="7" fill="#64748b" />
          <line x1="115" y1="370" x2="115" y2="330" stroke="#334155" strokeWidth="3" />
          {/* Mic Capsule & Pop Filter */}
          <rect x="110" y="315" width="10" height="16" rx="5" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="115" cy="323" r="2" fill="#e50914" />
          {/* Plant / Studio Decor Pot */}
          <ellipse cx="115" cy="375" rx="8" ry="4" fill="#cbd5e1" />
          <path d="M110,365 Q102,350 106,345 Q114,352 110,365 Z" fill="#22c55e" />
          <path d="M120,365 Q128,350 124,345 Q116,352 120,365 Z" fill="#16a34a" />
        </g>

        {/* 3D Red Play Button Isometric Cube (Left Foreground) */}
        <g id="playCube">
          {/* Top Face */}
          <polygon points="150,370 170,360 185,370 165,380" fill="#ff4d5a" />
          {/* Left Face */}
          <polygon points="150,370 165,380 165,398 150,388" fill="#e50914" />
          {/* Right Face */}
          <polygon points="165,380 185,370 185,388 165,398" fill="#b91c1c" />
          {/* White Play Icon on Left Face */}
          <polygon points="155,377 161,382 155,387" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
};
