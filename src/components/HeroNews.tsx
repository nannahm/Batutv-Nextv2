import React from 'react';
import { Clock, Eye, Bookmark, Share2, Sparkles } from 'lucide-react';
import { NewsArticle } from '../types/news';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

interface HeroNewsProps {
  leadArticle: NewsArticle;
  companionArticles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onToggleBookmark: (article: NewsArticle) => void;
  isBookmarked: (id: string) => boolean;
}

export const HeroNews: React.FC<HeroNewsProps> = ({
  leadArticle,
  companionArticles,
  onSelectArticle,
  onToggleBookmark,
  isBookmarked,
}) => {
  return (
    <section id="hero-news-section" className="mb-8">
      {/* Section Title */}
      <div className="flex items-center justify-between mb-3 border-b-2 border-red-600 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-red-600 rounded-xs"></span>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 font-serif-heading">
            Sorotan Utama
          </h2>
          <span className="hidden sm:inline-block bg-red-100 text-red-700 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase">
            Headlines
          </span>
        </div>
        <span className="text-xs text-slate-500 font-medium">Diperbarui beberapa menit lalu</span>
      </div>

      {/* Grid: 1 Big Hero on Left (60-65% width) + 4 Companions on Right (2x2 grid) on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Main Lead Story (7 cols) */}
        <div
          id="hero-lead-article"
          className="lg:col-span-7 bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col"
        >
          {/* Main Image Container */}
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 cursor-pointer" onClick={() => onSelectArticle(leadArticle)}>
            <img
              src={getOptimizedImageUrl(leadArticle.imageUrl, 'large')}
              alt={leadArticle.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="eager"
            />
            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="bg-red-600 text-white text-xs font-black uppercase px-2.5 py-1 rounded shadow-md tracking-wider">
                {leadArticle.category}
              </span>
              <span className="bg-black/70 backdrop-blur-xs text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                UTAMA
              </span>
            </div>

            {/* Bookmark button */}
            <button
              id={`btn-bookmark-lead-${leadArticle.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(leadArticle);
              }}
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition shadow-md ${
                isBookmarked(leadArticle.id)
                  ? 'bg-red-600 text-white'
                  : 'bg-black/50 text-white hover:bg-red-600'
              }`}
              title="Simpan Berita"
              aria-label="Simpan Berita"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>

            {/* Subtle bottom gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Floating Title on Mobile Image */}
            <div className="absolute bottom-3 left-3 right-3 text-white lg:hidden">
              <div className="flex items-center gap-3 text-xs text-slate-300 mb-1 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {leadArticle.timestamp}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {leadArticle.views.toLocaleString('id-ID')} pembaca
                </span>
              </div>
            </div>
          </div>

          {/* Lead Content Box */}
          <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
            <div>
              {/* Meta for Desktop */}
              <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500 mb-2.5 font-medium">
                <span className="text-red-600 font-bold uppercase">{leadArticle.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  {leadArticle.timestamp}
                </span>
                <span>•</span>
                <span>{leadArticle.readTime}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Eye className="w-3.5 h-3.5" />
                  {leadArticle.views.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Title */}
              <h3
                onClick={() => onSelectArticle(leadArticle)}
                className="text-lg sm:text-2xl font-extrabold text-slate-900 group-hover:text-red-600 transition-colors leading-snug cursor-pointer font-serif-heading mb-3"
              >
                {leadArticle.title}
              </h3>

              {/* Excerpt */}
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3 mb-4">
                {leadArticle.summary}
              </p>
            </div>

            {/* Author Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={leadArticle.author.avatar}
                  alt={leadArticle.author.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">{leadArticle.author.name}</div>
                  <div className="text-[11px] text-slate-400">{leadArticle.author.role}</div>
                </div>
              </div>

              <button
                onClick={() => onSelectArticle(leadArticle)}
                className="text-xs font-bold text-red-600 hover:text-red-800 transition flex items-center gap-1"
              >
                Baca Selengkapnya →
              </button>
            </div>
          </div>
        </div>

        {/* 4 Secondary Companion News (5 cols - 2x2 Grid on md/lg) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {companionArticles.slice(0, 4).map((art, idx) => (
            <div
              key={art.id}
              id={`hero-companion-${idx}`}
              className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-md transition group flex flex-col"
            >
              {/* Card Image */}
              <div
                className="relative aspect-[16/10] overflow-hidden bg-slate-900 cursor-pointer"
                onClick={() => onSelectArticle(art)}
              >
                <img
                  src={getOptimizedImageUrl(art.imageUrl, 'medium')}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                  {art.category}
                </span>
                <button
                  id={`btn-bookmark-companion-${art.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(art);
                  }}
                  className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition ${
                    isBookmarked(art.id)
                      ? 'bg-red-600 text-white'
                      : 'bg-black/40 text-white hover:bg-red-600'
                  }`}
                  title="Simpan Berita"
                  aria-label="Simpan Berita"
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{art.timestamp}</span>
                  </div>
                  <h4
                    onClick={() => onSelectArticle(art)}
                    className="font-bold text-slate-800 text-sm leading-snug group-hover:text-red-600 transition line-clamp-2 cursor-pointer font-serif-heading"
                  >
                    {art.title}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{art.author.name}</span>
                  <span className="text-red-600 font-semibold cursor-pointer" onClick={() => onSelectArticle(art)}>
                    Baca →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
