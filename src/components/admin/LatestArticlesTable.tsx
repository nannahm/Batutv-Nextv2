import React from 'react';
import { Newspaper, ChevronRight, Eye, Edit3, ExternalLink } from 'lucide-react';
import { AdminArticleItem, ContentStatus } from '../../types/admin';

interface LatestArticlesTableProps {
  articles: AdminArticleItem[];
  onViewAll: () => void;
  onSelectArticle?: (article: AdminArticleItem) => void;
}

export const LatestArticlesTable: React.FC<LatestArticlesTableProps> = ({
  articles,
  onViewAll,
  onSelectArticle,
}) => {
  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Draft
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Scheduled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Berita Terbaru
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Daftar artikel redaksi yang baru diterbitkan atau dalam draft
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-slate-600 hover:text-red-600 flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg hover:bg-slate-50"
        >
          <span>Lihat Semua Berita</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Tabel Berita Terbaru Redaksi">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th scope="col" className="py-3 px-4 sm:px-5">
                Judul Artikel
              </th>
              <th scope="col" className="py-3 px-3">
                Kategori
              </th>
              <th scope="col" className="py-3 px-3">
                Status
              </th>
              <th scope="col" className="py-3 px-3">
                Tanggal
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {articles.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                {/* Title + Thumbnail */}
                <td className="py-3.5 px-4 sm:px-5 font-semibold text-slate-900 max-w-xs sm:max-w-md">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.thumbnailUrl}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Penulis: {item.author}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md border border-slate-200">
                    {item.category}
                  </span>
                </td>

                {/* Status */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>

                {/* Date */}
                <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap font-medium text-[11px]">
                  {item.publishDate}
                </td>

                {/* Action Buttons */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectArticle?.(item)}
                      title="Lihat Detail Artikel"
                      aria-label={`Lihat detail artikel ${item.title}`}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={onViewAll}
                      title="Edit Artikel di CMS"
                      aria-label={`Edit artikel ${item.title}`}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer view all bar */}
      <div className="p-3 bg-slate-50/60 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-red-50 transition-colors"
        >
          <span>Lihat Semua Berita ({articles.length} Konten Ditampilkan)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
