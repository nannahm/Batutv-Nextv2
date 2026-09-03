import React from 'react';
import { X, Bookmark, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import { NewsArticle } from '../types/news';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedArticles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onRemoveBookmark: (id: string) => void;
  onClearAllBookmarks: () => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  savedArticles,
  onSelectArticle,
  onRemoveBookmark,
  onClearAllBookmarks,
}) => {
  if (!isOpen) return null;

  return (
    <div id="bookmarks-modal-backdrop" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end">
      <div
        id="bookmarks-drawer"
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 text-white p-1.5 rounded-lg shadow-2xs">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif-heading">
                Berita Tersimpan ({savedArticles.length})
              </h3>
              <p className="text-[11px] text-slate-500">Akses cepat berita favorit Anda</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {savedArticles.map((article) => (
            <div
              key={article.id}
              className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3 group"
            >
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-20 h-16 object-cover rounded-lg flex-shrink-0 cursor-pointer"
                onClick={() => {
                  onSelectArticle(article);
                  onClose();
                }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-red-600 uppercase">
                  {article.category}
                </span>
                <h4
                  onClick={() => {
                    onSelectArticle(article);
                    onClose();
                  }}
                  className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-red-600 transition line-clamp-2 cursor-pointer leading-snug font-serif-heading"
                >
                  {article.title}
                </h4>
                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                  <span>{article.timestamp}</span>
                  <button
                    onClick={() => onRemoveBookmark(article.id)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold"
                    title="Hapus dari simpanan"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {savedArticles.length === 0 && (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center">
              <BookOpen className="w-10 h-10 mb-3 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">Belum ada berita yang disimpan</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Klik ikon pita bookmark pada berita mana saja untuk membacanya nanti.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {savedArticles.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              onClick={onClearAllBookmarks}
              className="text-xs text-slate-500 hover:text-red-600 font-semibold"
            >
              Hapus Semua
            </button>
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-2xs"
            >
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
