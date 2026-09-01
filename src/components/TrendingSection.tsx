import React from 'react';
import { Flame, Clock, Eye, TrendingUp } from 'lucide-react';
import { NewsArticle } from '../types/news';

interface TrendingSectionProps {
  trendingArticles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  trendingArticles,
  onSelectArticle,
}) => {
  return (
    <div id="trending-ranking-section" className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-red-600">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 fill-red-600 text-red-600" />
          <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 font-serif-heading">
            Terpopuler
          </h3>
        </div>
        <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded border border-red-100">
          24 Jam Terakhir
        </span>
      </div>

      {/* Ranked List */}
      <div className="space-y-4">
        {trendingArticles.map((article, idx) => {
          const rankNumber = String(idx + 1).padStart(2, '0');
          const isTop3 = idx < 3;

          return (
            <div
              key={article.id}
              id={`trending-item-${rankNumber}`}
              onClick={() => onSelectArticle(article)}
              className="flex items-start gap-3.5 group cursor-pointer border-b border-slate-100 pb-3.5 last:border-b-0 last:pb-0"
            >
              {/* Giant Rank Number */}
              <div
                className={`font-black text-2xl sm:text-3xl leading-none w-8 text-center flex-shrink-0 transition font-serif ${
                  isTop3
                    ? 'text-red-600 group-hover:scale-110'
                    : 'text-slate-300 group-hover:text-slate-500'
                }`}
              >
                {rankNumber}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[11px] mb-1">
                  <span className="font-bold text-red-600 uppercase tracking-wider">
                    {article.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.timestamp}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-800 group-hover:text-red-600 transition leading-snug line-clamp-2 font-serif-heading">
                  {article.title}
                </h4>

                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-slate-400" />
                    {article.views.toLocaleString('id-ID')} views
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
