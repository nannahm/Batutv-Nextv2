import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  Globe,
  RefreshCw,
  Copy,
  Check,
  FilePlus,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { AdminPage, PageStatus } from '../../../types/admin';

interface PageListViewProps {
  pages: AdminPage[];
  onAddNew: () => void;
  onEdit: (page: AdminPage) => void;
  onViewDetail: (page: AdminPage) => void;
  onViewPublic: (slug: string) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (page: AdminPage) => void;
  onRefresh: () => void;
}

export const PageListView: React.FC<PageListViewProps> = ({
  pages,
  onAddNew,
  onEdit,
  onViewDetail,
  onViewPublic,
  onToggleStatus,
  onDelete,
  onRefresh,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Filtered pages
  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      const matchSearch =
        page.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        page.slug.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (page.excerpt && page.excerpt.toLowerCase().includes(searchQuery.toLowerCase().trim()));

      const matchStatus =
        statusFilter === 'all' ? true : page.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [pages, searchQuery, statusFilter]);

  // Summary counts
  const publishedCount = pages.filter((p) => p.status === 'published').length;
  const draftCount = pages.filter((p) => p.status === 'draft').length;

  const handleCopyLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Stats Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 rounded-md">
              MASTER DATA
            </span>
            <span className="text-xs text-slate-400 font-medium">• Halaman Statis & Informasi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Manajemen Pages
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola halaman informasi, pedoman redaksi, kebijakan, dan kontak portal berita BatuTV.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            title="Muat Ulang Data"
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onAddNew}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Halaman</span>
          </button>
        </div>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Pages */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Halaman</span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{pages.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Published Pages */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600">Terbit (Publik)</span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{publishedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Draft Pages */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-600">Draft (Tersimpan)</span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{draftCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul atau slug halaman..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({pages.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'published'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Terbit ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'draft'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Draft ({draftCount})
          </button>
        </div>
      </div>

      {/* 4. Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredPages.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      Judul & Ringkasan
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Slug URL
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Status Publikasi
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Terakhir Diperbarui
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPages.map((page) => (
                    <tr
                      key={page.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Judul & Excerpt */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => onViewDetail(page)}
                              className="font-bold text-slate-900 hover:text-red-600 transition-colors text-left line-clamp-1 cursor-pointer"
                            >
                              {page.title}
                            </button>
                            {page.excerpt ? (
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {page.excerpt}
                              </p>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Tanpa ringkasan excerpt
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Slug URL */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-red-600 font-semibold bg-red-50/70 px-2 py-0.5 rounded-md">
                            /{page.slug}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(page.slug)}
                            title="Salin Tautan Lengkap"
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          >
                            {copiedSlug === page.slug ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onToggleStatus(page.id)}
                            title={
                              page.status === 'published'
                                ? 'Klik untuk Ubah ke Draft'
                                : 'Klik untuk Publikasikan'
                            }
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                              page.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                          >
                            {page.status === 'published' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Published</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Draft</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Last Updated */}
                      <td className="px-6 py-4 text-[11px] text-slate-500 whitespace-nowrap">
                        {formatDate(page.updatedAt)}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Detail Modal */}
                          <button
                            type="button"
                            onClick={() => onViewDetail(page)}
                            title="Lihat Detail Naskah"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Open in Public Template */}
                          <button
                            type="button"
                            onClick={() => onViewPublic(page.slug)}
                            title="Lihat Tampilan Publik (/slug)"
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => onEdit(page)}
                            title="Edit Halaman"
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => onDelete(page)}
                            title="Hapus Halaman"
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredPages.map((page) => (
                <div key={page.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => onViewDetail(page)}
                        className="text-sm font-bold text-slate-900 text-left"
                      >
                        {page.title}
                      </button>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-red-600 font-semibold">
                          /{page.slug}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleStatus(page.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        page.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {page.status === 'published' ? 'Published' : 'Draft'}
                    </button>
                  </div>

                  {page.excerpt && (
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {page.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    <span>{formatDate(page.updatedAt)}</span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onViewPublic(page.slug)}
                        className="p-1.5 text-slate-500 hover:text-red-600"
                        title="Buka Publik"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(page)}
                        className="p-1.5 text-blue-600 hover:text-blue-700"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(page)}
                        className="p-1.5 text-red-500 hover:text-red-700"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              {searchQuery ? 'Halaman tidak ditemukan.' : 'Belum Ada Halaman Terdaftar'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              {searchQuery
                ? `Tidak ditemukan halaman dengan kata kunci "${searchQuery}". Coba gunakan kata kunci lain.`
                : 'Mulai dengan menambahkan halaman statis baru untuk portal berita BatuTV.'}
            </p>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Reset Pencarian
              </button>
            ) : (
              <button
                type="button"
                onClick={onAddNew}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                + Tambah Halaman Pertama
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
