import React, { useState } from 'react';
import { Clock, Eye, Bookmark, Share2, Tag } from 'lucide-react';
import { NewsArticle } from '../types/news';

interface LatestNewsProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onToggleBookmark: (article: NewsArticle) => void;
  isBookmarked: (id: string) => boolean;
}

export const LatestNews: React.FC<LatestNewsProps> = ({
  articles,
  onSelectArticle,
  onToggleBookmark,
  isBookmarked,
}) => {
  const [selectedFilter, setSelectedFilter] = useState('Semua');
  const [displayCount, setDisplayCount] = useState(8);

  const filterTabs = [
    'Semua',
    'Batu Raya',
    'Nasional',
    'Ekonomi',
    'Olahraga',
    'Pariwisata',
    'Hukum',
    'Teknologi',
  ];

  const filteredArticles = selectedFilter === 'Semua'
    ? articles
    : articles.filter(
        (a) =>
          a.category.toLowerCase().includes(selectedFilter.toLowerCase()) ||
          (a.categorySlug && a.categorySlug.toLowerCase().includes(selectedFilter.toLowerCase()))
      );

  const visibleArticles = filteredArticles.slice(0, displayCount);

  return (
    <div id="latest-news-section" className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-red-600 rounded-xs"></span>
          <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 font-serif-heading">
            Berita Terkini
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {filterTabs.map((tab) => {
            const isActive = selectedFilter === tab;
            return (
              <button
                key={tab}
                id={`filter-tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  setSelectedFilter(tab);
                  setDisplayCount(8);
                }}
                className={`text-xs px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Article List Cards */}
      <div className="divide-y divide-slate-100">
        {visibleArticles.map((article, idx) => (
          <article
            key={article.id}
            id={`latest-article-row-${idx}`}
            className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 items-start group hover:bg-slate-50/70 p-2 rounded-lg transition"
          >
            {/* Thumbnail */}
            <div
              className="relative w-full sm:w-48 sm:min-w-[192px] aspect-[16/10] sm:aspect-[16/11] rounded-lg overflow-hidden bg-slate-900 flex-shrink-0 cursor-pointer"
              onClick={() => onSelectArticle(article)}
            >
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                {article.category}
              </span>
            </div>

            {/* Content Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between w-full">
              <div>
                {/* Meta info */}
                <div className="flex items-center gap-2.5 text-xs text-slate-400 mb-1.5 font-medium">
                  <span className="text-red-600 font-bold uppercase text-[11px]">{article.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {article.timestamp}
                  </span>
                  <span className="hidden md:inline">•</span>
                  <span className="hidden md:inline">{article.publishedAt}</span>
                </div>

                {/* Headline */}
                <h4
                  onClick={() => onSelectArticle(article)}
                  className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-red-600 transition leading-snug cursor-pointer font-serif-heading mb-2 line-clamp-2"
                >
                  {article.title}
                </h4>

                {/* Excerpt */}
                <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-3">
                  {article.summary}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="font-semibold text-slate-700">{article.author.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id={`btn-bookmark-list-${article.id}`}
                    onClick={() => onToggleBookmark(article)}
                    className={`p-1.5 rounded hover:bg-slate-200 transition ${
                      isBookmarked(article.id) ? 'text-red-600 font-bold' : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title="Simpan Berita"
                    aria-label="Simpan Berita"
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    onClick={() => onSelectArticle(article)}
                    className="text-xs font-bold text-red-600 hover:text-red-800 transition"
                  >
                    Selengkapnya →
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}

        {visibleArticles.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            <p className="font-medium text-sm">Tidak ada berita di kategori ini.</p>
          </div>
        )}
      </div>

        {/* Load More Button */}
        {filteredArticles.length > displayCount && (
          <div className="mt-6 text-center border-t border-slate-100 pt-4">
            <button
              id="btn-load-more-latest"
              onClick={() => setDisplayCount((prev) => prev + 6)}
              className="bg-slate-100 hover:bg-red-600 hover:text-white text-slate-700 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-lg transition duration-200 shadow-2xs"
            >
              Muat Berita Lainnya ({filteredArticles.length - displayCount} tersisa)
            </button>
          </div>
        )}
    </div>
  );
};
