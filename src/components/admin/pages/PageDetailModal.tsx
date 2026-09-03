import React from 'react';
import {
  X,
  FileText,
  Calendar,
  Globe,
  ExternalLink,
  Edit,
  CheckCircle2,
  Clock,
  Code2,
} from 'lucide-react';
import { AdminPage } from '../../../types/admin';

interface PageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: AdminPage | null;
  onEdit: (page: AdminPage) => void;
  onViewPublic: (slug: string) => void;
}

export const PageDetailModal: React.FC<PageDetailModalProps> = ({
  isOpen,
  onClose,
  page,
  onEdit,
  onViewPublic,
}) => {
  if (!isOpen || !page) return null;

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {page.title}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono text-red-600 font-bold">
                  /{page.slug}
                </span>
                <span className="text-slate-300">•</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md ${
                    page.status === 'published'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {page.status === 'published' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Terbit (Published)</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Draft (Disembunyikan)</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Tanggal Dibuat:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(page.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Terakhir Diperbarui:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(page.updatedAt)}
              </span>
            </div>
          </div>

          {/* Excerpt if any */}
          {page.excerpt && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Ringkasan / Excerpt
              </h3>
              <p className="text-sm text-slate-700 italic bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
                "{page.excerpt}"
              </p>
            </div>
          )}

          {/* SEO Metadata Box */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Metadata Mesin Pencari (SEO)</span>
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Tag Title:</span>
                <p className="text-xs font-semibold text-slate-800">{page.seoTitle || '-'}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Meta Description:</span>
                <p className="text-xs text-slate-600">{page.metaDescription || '-'}</p>
              </div>
            </div>
          </div>

          {/* Content Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Pratinjau Naskah Halaman</span>
              </h3>
            </div>
            <div className="p-5 border border-slate-200 rounded-xl bg-white">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                {page.title}
              </h1>
              <div
                className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed space-y-4 [&>p]:leading-relaxed [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-6 [&>h2]:mb-2 [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-4 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1 [&>blockquote]:border-l-4 [&>blockquote]:border-red-600 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-600 [&>a]:text-red-600 [&>a]:underline"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewPublic(page.slug);
              }}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Buka Halaman Publik</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(page);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Halaman</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
