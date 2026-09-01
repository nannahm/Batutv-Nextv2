import React from 'react';
import { X, ExternalLink, Calendar, User, Eye, ArrowRight, Share2, Bookmark, Flame } from 'lucide-react';
import { AdminArticle } from '../../../types/admin';

interface NewsPreviewModalProps {
  article: AdminArticle | null;
  isOpen: boolean;
  onClose: () => void;
  onPublishNow?: (article: AdminArticle) => void;
}

export const NewsPreviewModal: React.FC<NewsPreviewModalProps> = ({
  article,
  isOpen,
  onClose,
  onPublishNow,
}) => {
  if (!isOpen || !article) return null;

  const formattedDate = () => {
    try {
      const d = new Date(article.publishedAt);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';
    } catch {
      return article.publishedAt;
    }
  };

  const getStatusBadge = () => {
    switch (article.status) {
      case 'published':
        return (
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/30">
            Status: Terbit (Published)
          </span>
        );
      case 'draft':
        return (
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30">
            Status: Draft Redaksi
          </span>
        );
      case 'scheduled':
        return (
          <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-lg border border-blue-500/30">
            Status: Terjadwal (Scheduled)
          </span>
        );
      case 'trash':
        return (
          <span className="px-2.5 py-1 bg-red-500/20 text-red-300 text-xs font-bold rounded-lg border border-red-500/30">
            Status: Sampah (Trash)
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-start p-2 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
    >
      {/* Top Banner Control Bar */}
      <div className="w-full max-w-[980px] bg-slate-900 text-white rounded-t-2xl p-3 sm:p-4 border border-slate-700 flex flex-wrap items-center justify-between gap-3 sticky top-2 z-10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h3 id="preview-title" className="text-xs sm:text-sm font-black tracking-wide text-white flex items-center gap-2">
              PRATINJAU ARTIKEL REDAKSI
            </h3>
            <p className="text-[11px] text-slate-300 font-normal">
              Visualisasi tampilan persis seperti yang dilihat pembaca portal BatuTV
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {article.isHeadline && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500/20 text-orange-300 text-xs font-bold rounded-lg border border-orange-500/30">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Hero #{article.headlinePosition || 1}</span>
            </span>
          )}
          {getStatusBadge()}

          {article.status === 'published' && (
            <a
              href={`/berita/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              <span>Buka di Tab Baru</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {article.status !== 'published' && onPublishNow && (
            <button
              type="button"
              onClick={() => {
                onPublishNow(article);
                onClose();
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Terbitkan Sekarang
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pratinjau"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview Content Container (Matches 980px 8+4 grid of public page) */}
      <div className="w-full max-w-[980px] bg-[#f8f9fa] rounded-b-2xl border-x border-b border-slate-200 shadow-2xl p-4 sm:p-6 lg:p-8 font-sans overflow-hidden">
        
        {/* SEMANTIC 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          
          {/* LEFT ARTICLE COLUMN (8 Cols) */}
          <article className="lg:col-span-8 w-full bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 sm:p-5 md:p-6">
            
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-4 text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <span>Home</span>
              <span className="text-slate-400">/</span>
              <span className="text-red-600 font-bold uppercase">{article.category}</span>
            </nav>

            {/* Category Badge */}
            <div className="mb-3">
              <span className="inline-block px-2.5 py-1 bg-red-600 text-white text-[11px] font-extrabold tracking-wider uppercase rounded">
                {article.category}
              </span>
            </div>

            {/* H1 Headline */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
              {article.title}
            </h1>

            {/* Subheadline / Excerpt */}
            {article.excerpt && (
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal mb-5 italic border-l-4 border-red-600 pl-3.5 py-0.5 bg-slate-50 rounded-r-md">
                {article.excerpt}
              </p>
            )}

            {/* Author & Meta Box */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-slate-100 mb-5 text-xs text-slate-500">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-300">
                  {article.author.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{article.author}</div>
                  <div className="text-[11px] text-slate-500">Editor: {article.editor}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formattedDate()}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>{article.views} views</span>
                </span>
              </div>
            </div>

            {/* Featured Image */}
            {article.featuredImage && (
              <figure className="mb-6">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={article.featuredImage}
                    alt={article.imageAlt || article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {article.imageCaption && (
                  <figcaption className="text-[11px] text-slate-500 mt-2 italic px-1">
                    {article.imageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Main Article Body */}
            <div
              className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-5 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  Topik Terkait:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {article.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md border border-slate-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* RIGHT SIDEBAR (4 Cols) */}
          <aside className="lg:col-span-4 w-full space-y-5">
            {/* Populer Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="font-extrabold text-slate-900 text-xs tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  Berita Populer
                </span>
                <span className="text-[10px] text-slate-400 font-medium">24 Jam</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex gap-2.5 items-start">
                  <span className="text-base font-black text-red-600">01</span>
                  <p className="font-bold text-slate-800 line-clamp-2">
                    Pemkot Batu Resmikan Pusat Edukasi Pertanian Apel di Bumiaji
                  </p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="text-base font-black text-red-600">02</span>
                  <p className="font-bold text-slate-800 line-clamp-2">
                    Kementerian ESDM Luncurkan Insentif Konversi Panel Surya
                  </p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="text-base font-black text-red-600">03</span>
                  <p className="font-bold text-slate-800 line-clamp-2">
                    Revitalisasi Pasar Induk Among Tani Tingkatkan Omzet UMKM
                  </p>
                </div>
              </div>
            </div>

            {/* SEO Summary Card */}
            <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-md border border-slate-800 space-y-3">
              <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider">
                Audit Meta & SEO Artikel
              </h4>
              <div className="space-y-2 text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-400 font-semibold block">SEO Title:</span>
                  <p className="text-white font-medium">{article.seoTitle || article.title}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Canonical URL:</span>
                  <p className="text-emerald-400 font-mono text-[10px] truncate">{article.canonicalUrl}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Meta Description:</span>
                  <p className="text-slate-300 line-clamp-2">{article.metaDescription || article.excerpt}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
