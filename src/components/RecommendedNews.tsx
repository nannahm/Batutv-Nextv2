import React from 'react';
import { Award, Clock, Bookmark, ChevronRight } from 'lucide-react';
import { NewsArticle } from '../types/news';

interface RecommendedNewsProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onToggleBookmark: (article: NewsArticle) => void;
  isBookmarked: (id: string) => boolean;
}

export const RecommendedNews: React.FC<RecommendedNewsProps> = ({
  articles,
  onSelectArticle,
  onToggleBookmark,
  isBookmarked,
}) => {
  return (
    <section id="recommended-news-section" className="my-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-4 border-b-2 border-red-600">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 font-serif-heading">
            Pilihan Redaksi
          </h3>
        </div>
        <span className="text-xs text-slate-500">Liputan Mendalam & Rekomendasi</span>
      </div>

      {/* Grid 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.slice(0, 3).map((article, idx) => (
          <div
            key={article.id}
            id={`recommended-card-${idx}`}
            className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div
                className="relative aspect-[16/9] overflow-hidden bg-slate-900 cursor-pointer"
                onClick={() => onSelectArticle(article)}
              >
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                  {article.category}
                </span>
                <button
                  id={`btn-bookmark-rec-${article.id}`}
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

              <div className="p-4">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1.5">
                  <Clock className="w-3 h-3" />
                  <span>{article.timestamp}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>

                <h4
                  onClick={() => onSelectArticle(article)}
                  className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-red-600 transition line-clamp-2 cursor-pointer font-serif-heading mb-2"
                >
                  {article.title}
                </h4>

                <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-700">{article.author.name}</span>
              <button
                onClick={() => onSelectArticle(article)}
                className="text-red-600 font-bold hover:underline"
              >
                Baca Artikel →
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
