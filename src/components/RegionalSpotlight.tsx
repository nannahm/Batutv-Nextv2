import React from 'react';
import { MapPin, Clock, Bookmark, ChevronRight } from 'lucide-react';
import { NewsArticle } from '../types/news';

interface RegionalSpotlightProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onToggleBookmark: (article: NewsArticle) => void;
  isBookmarked: (id: string) => boolean;
  onViewAllRegional: () => void;
}

export const RegionalSpotlight: React.FC<RegionalSpotlightProps> = ({
  articles,
  onSelectArticle,
  onToggleBookmark,
  isBookmarked,
  onViewAllRegional,
}) => {
  const displayArticles = articles.slice(0, 4);

  return (
    <section id="regional-spotlight-section" className="my-8 bg-sky-50/60 rounded-2xl p-4 sm:p-6 border border-sky-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-5 border-b border-sky-200">
        <div className="flex items-center gap-2.5">
          <div className="bg-sky-600 text-white p-1.5 rounded-lg shadow-2xs">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 font-serif-heading">
              Kabar Batu & Malang Raya
            </h3>
            <p className="text-xs text-slate-600">Seputar agrowisata, pembangunan daerah, dan kearifan lokal</p>
          </div>
        </div>

        <button
          onClick={onViewAllRegional}
          className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-sky-200 shadow-2xs hover:bg-sky-50 transition"
        >
          <span>Semua Kabar Daerah</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayArticles.map((article, idx) => (
          <div
            key={article.id}
            id={`regional-card-${idx}`}
            className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail */}
              <div
                className="relative aspect-[16/10] overflow-hidden bg-slate-900 cursor-pointer"
                onClick={() => onSelectArticle(article)}
              >
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 bg-sky-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-xs">
                  {article.region || 'Batu'}
                </span>
                <button
                  id={`btn-bookmark-regional-${article.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(article);
                  }}
                  className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition ${
                    isBookmarked(article.id)
                      ? 'bg-red-600 text-white'
                      : 'bg-black/40 text-white hover:bg-red-600'
                  }`}
                  title="Simpan Berita"
                  aria-label="Simpan Berita"
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              {/* Body */}
              <div className="p-3.5">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1.5 font-medium">
                  <Clock className="w-3 h-3" />
                  <span>{article.timestamp}</span>
                </div>

                <h4
                  onClick={() => onSelectArticle(article)}
                  className="font-bold text-slate-900 text-sm leading-snug group-hover:text-sky-700 transition line-clamp-2 cursor-pointer font-serif-heading mb-2"
                >
                  {article.title}
                </h4>

                <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>
              </div>
            </div>

            <div className="p-3.5 pt-0 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>{article.author.name}</span>
              <button
                onClick={() => onSelectArticle(article)}
                className="text-sky-700 font-bold hover:underline"
              >
                Baca →
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
