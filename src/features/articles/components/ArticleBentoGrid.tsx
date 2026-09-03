import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Clock, User, ArrowUpRight } from 'lucide-react';
import { NewsArticle } from '@/src/types/news';
import { Badge } from '@/src/components/ui/badge';

interface ArticleBentoGridProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

export function ArticleBentoGrid({ articles, onSelectArticle }: ArticleBentoGridProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  const primaryHeadline = articles[0];
  const secondaryArticles = articles.slice(1, 5);

  return (
    <section className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white uppercase font-serif">
            Fokus Berita Utama
          </h2>
        </div>
        <Badge variant="outline" className="hidden sm:inline-flex gap-1 py-1">
          <Sparkles className="w-3 h-3 text-red-600" /> Kurasi Redaksi BatuTV
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Main Hero Bento Card (2 Cols, 2 Rows on Large screens) */}
        {primaryHeadline && (
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            onClick={() => onSelectArticle(primaryHeadline)}
            className="md:col-span-2 lg:col-span-2 row-span-2 group relative overflow-hidden rounded-2xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              <img
                src={primaryHeadline.imageUrl}
                alt={primaryHeadline.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/40 to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="default" className="shadow-md">
                  {primaryHeadline.category}
                </Badge>
                {primaryHeadline.isEditorPick && (
                  <Badge variant="warning" className="shadow-md">
                    Pilihan Redaksi
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2">
                  {primaryHeadline.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                  {primaryHeadline.summary}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800/60 text-xs text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-medium">
                    <User className="w-3.5 h-3.5" />
                    {primaryHeadline.author?.name || 'Redaksi BatuTV'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {primaryHeadline.publishedAt || 'Baru saja'}
                  </span>
                </div>
                <span className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Secondary Bento Grid Cards */}
        {secondaryArticles.map((article, idx) => (
          <motion.div
            key={article.id || idx}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            onClick={() => onSelectArticle(article)}
            className="group relative overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm p-4 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-[10px] py-0 px-2 bg-black/60 text-white backdrop-blur-md">
                    {article.category}
                  </Badge>
                </div>
              </div>

              <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2">
                {article.title}
              </h4>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800/50 text-[11px] text-neutral-500">
              <span>{article.publishedAt || 'Terkini'}</span>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {article.author?.name || 'BatuTV'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
