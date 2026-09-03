import React, { useState, useEffect } from 'react';
import { generateTagSlug } from '../data/tagAdminStore';
import { getStoredSiteSettings, SITE_SETTINGS_UPDATED_EVENT } from '../data/siteSettingsStore';

interface TrendingTopicsBarProps {
  topics?: string[];
  onSelectTopic: (topic: string) => void;
  activeTopic?: string;
}

const DEFAULT_FEATURED_TOPICS = [
  'Rektor Unsoed Terjaring OTT KPK',
  'Gempa Guncang Sumut',
  'Gempa Guncang NTT',
  'Piala AFF 2026',
  'KPK OTT Pejabat',
  'Festival Bunga Batu 2026',
  'Wisata Apel Malang Raya',
  'Tol Trans Jawa 2026',
  'Pertanian Organik Kota Batu',
];

export const TrendingTopicsBar: React.FC<TrendingTopicsBarProps> = ({
  topics = DEFAULT_FEATURED_TOPICS,
  onSelectTopic,
  activeTopic,
}) => {
  const displayTopics = topics && topics.length > 0 ? topics : DEFAULT_FEATURED_TOPICS;
  const [siteSettings, setSiteSettings] = useState(() => getStoredSiteSettings());

  useEffect(() => {
    const handleUpdate = (e: CustomEvent) => {
      if (e.detail) {
        setSiteSettings(e.detail);
      }
    };
    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT as any, handleUpdate);
    return () => {
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT as any, handleUpdate);
    };
  }, []);

  const topicTypography = siteSettings?.typography?.topicBar || {
    fontSize: 11,
    fontWeight: '400',
    fontFamily: 'inherit',
    textTransform: 'none',
    badgePadding: 'normal',
    badgeBgColor: '#f1f3f5',
    badgeTextColor: '#334155',
  };

  const getPaddingClass = (padding?: string) => {
    if (padding === 'compact') return 'px-2 py-0.5';
    if (padding === 'spacious') return 'px-3.5 py-1 sm:py-1.5';
    return 'px-2.5 py-0.5 sm:py-1';
  };

  const getTextTransformStyle = (transform?: string): React.CSSProperties['textTransform'] => {
    if (transform === 'uppercase') return 'uppercase';
    if (transform === 'capitalize') return 'capitalize';
    if (transform === 'lowercase') return 'lowercase';
    return 'none';
  };

  return (
    <div id="trending-topics-bar" className="w-full bg-transparent py-1.5 sm:py-2 select-none">
      <div className="w-full max-w-[1020px] mx-auto px-3.5 sm:px-4 md:px-0">
        <div className="bg-white border border-[#940a13]/40 rounded-lg shadow-xs px-3.5 py-2 flex items-center gap-3 overflow-hidden">
          {/* Label # TOPIK */}
          <div className="flex items-center gap-1 text-xs sm:text-[13px] font-black text-[#940a13] uppercase tracking-wider flex-shrink-0">
            <span># TOPIK</span>
          </div>

          {/* Tags List with invisible scrollbar */}
          <div
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 text-slate-700 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayTopics.map((topic, idx) => {
              const cleanTopic = topic.replace(/^#/, '');
              const isSelected = activeTopic === topic || activeTopic === cleanTopic;
              const tagSlug = generateTagSlug(cleanTopic);

              return (
                <a
                  key={idx}
                  id={`topic-tag-${idx}`}
                  href={`/tag/${tagSlug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTopic(cleanTopic);
                  }}
                  style={{
                    fontSize: topicTypography.fontSize ? `${topicTypography.fontSize}px` : undefined,
                    fontWeight: topicTypography.fontWeight || 400,
                    fontFamily:
                      topicTypography.fontFamily && topicTypography.fontFamily !== 'inherit'
                        ? topicTypography.fontFamily
                        : undefined,
                    textTransform: getTextTransformStyle(topicTypography.textTransform),
                    backgroundColor: isSelected
                      ? undefined
                      : topicTypography.badgeBgColor || undefined,
                    color: isSelected
                      ? undefined
                      : topicTypography.badgeTextColor || undefined,
                  }}
                  className={`text-[10px] sm:text-[11px] ${getPaddingClass(
                    topicTypography.badgePadding
                  )} rounded-full whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#940a13] text-white font-medium shadow-2xs'
                      : 'hover:bg-red-50 hover:text-[#940a13]'
                  }`}
                >
                  {cleanTopic}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};


