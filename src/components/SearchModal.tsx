import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Clock, Tag, ArrowRight, FileText } from 'lucide-react';
import { NewsArticle } from '../types/news';
import { getStoredArticles } from '../data/newsAdminStore';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  initialQuery?: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  articles,
  onSelectArticle,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialQuery]);

  // Combine static and dynamic articles seamlessly
  const allSearchableArticles = useMemo<NewsArticle[]>(() => {
    const stored = getStoredArticles().filter((a) => a.status === 'published');
    const dynamicConverted: NewsArticle[] = stored.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      category: a.category,
      categorySlug: a.categorySlug,
      summary: a.excerpt || a.title,
      content: [a.content || ''],
      imageUrl: a.featuredImage || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&auto=format&fit=crop&q=80',
      publishedAt: a.publishedAt,
      timestamp: a.publishedAt || a.createdAt,
      author: {
        name: a.author || 'Redaksi BatuTV',
        role: 'Jurnalis',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      },
      readTime: '3 menit',
      tags: a.tags || [],
      views: a.views || 0,
    }));

    const map = new Map<string, NewsArticle>();
    dynamicConverted.forEach((a) => map.set(a.slug, a));
    articles.forEach((a) => {
      if (!map.has(a.slug)) map.set(a.slug, a);
    });

    return Array.from(map.values());
  }, [articles, isOpen]);

  if (!isOpen) return null;

  const categories = ['Semua', 'Batu Raya', 'Nasional', 'Ekonomi', 'Olahraga', 'Pariwisata', 'Hukum', 'Teknologi'];

  const filteredResults = allSearchableArticles.filter((article) => {
    const matchesQuery =
      query.trim() === '' ||
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.summary.toLowerCase().includes(query.toLowerCase()) ||
      article.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'Semua' ||
      article.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (article.categorySlug && article.categorySlug.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesQuery && matchesCategory;
  });

  const popularSearches = ['Festival Apel', 'Wisata Batu', 'Jalur Klemuk', 'Ekonomi Jatim', 'Arema', 'Bantengan'];

  return (
    <div id="search-modal-backdrop" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        id="search-modal-container"
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Search Input Box */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik kata kunci berita, topik, atau peristiwa..."
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base font-medium outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            id="btn-close-search"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="px-4 sm:px-6 py-2.5 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-xs text-slate-400 font-semibold mr-1 flex-shrink-0">Kategori:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Suggestion Tags */}
        {query.trim() === '' && (
          <div className="p-4 sm:p-6 bg-slate-50/50 border-b border-slate-100">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Pencarian Populer
            </div>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="text-xs bg-white hover:bg-red-50 hover:text-red-600 text-slate-700 font-medium px-3 py-1.5 rounded-lg border border-slate-200 transition shadow-2xs"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Ditemukan {filteredResults.length} Berita
          </div>

          {filteredResults.map((article) => (
            <div
              key={article.id}
              onClick={() => {
                onSelectArticle(article);
                onClose();
              }}
              className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition"
            >
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-16 sm:w-24 h-14 sm:h-16 object-cover rounded-md flex-shrink-0 bg-slate-200"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                  <span className="font-bold text-red-600 uppercase">{article.category}</span>
                  <span>•</span>
                  <span>{article.timestamp}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition line-clamp-1 font-serif-heading">
                  {article.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{article.summary}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-red-600 group-hover:translate-x-1 transition flex-shrink-0" />
            </div>
          ))}

          {filteredResults.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Tidak ada berita yang cocok dengan kata kunci</p>
              <p className="text-xs mt-1">Coba gunakan kata kunci lain atau pilih kategori Semua</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
