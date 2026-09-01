import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Hash,
  FileText,
  Video,
  ExternalLink,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  CheckSquare,
  Square,
  AlertCircle,
  Tag as TagIcon,
  Globe,
} from 'lucide-react';
import { AdminTag, TagContentType, TagStatus } from '../../../types/admin';

interface TagListViewProps {
  tags: AdminTag[];
  onEdit: (tag: AdminTag) => void;
  onDelete: (tag: AdminTag) => void;
  onToggleStatus: (id: string, currentStatus: TagStatus) => void;
  onBulkUpdateStatus: (ids: string[], status: TagStatus) => void;
  onNavigateToPublic?: (path: string) => void;
}

type SortOption = 'name_asc' | 'name_desc' | 'newest' | 'oldest' | 'usage_desc';
type StatusFilter = 'all' | 'active' | 'inactive';
type ContentTypeFilter = 'all' | 'news' | 'video' | 'both';

export const TagListView: React.FC<TagListViewProps> = ({
  tags,
  onEdit,
  onDelete,
  onToggleStatus,
  onBulkUpdateStatus,
  onNavigateToPublic,
}) => {
  // Search, Filter, Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentTypeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('usage_desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter and sort logic
  const filteredAndSortedTags = useMemo(() => {
    let result = [...tags];

    // 1. Search by name or slug
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          (t.seoTitle && t.seoTitle.toLowerCase().includes(q))
      );
    }

    // 2. Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // 3. Filter by content types
    if (contentTypeFilter === 'news') {
      result = result.filter(
        (t) => t.contentTypes.includes('news') && !t.contentTypes.includes('video')
      );
    } else if (contentTypeFilter === 'video') {
      result = result.filter(
        (t) => !t.contentTypes.includes('news') && t.contentTypes.includes('video')
      );
    } else if (contentTypeFilter === 'both') {
      result = result.filter(
        (t) => t.contentTypes.includes('news') && t.contentTypes.includes('video')
      );
    }

    // 4. Sort logic
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name, 'id');
        case 'name_desc':
          return b.name.localeCompare(a.name, 'id');
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'usage_desc':
        default: {
          const totalA = a.totalCount !== undefined ? a.totalCount : 0;
          const totalB = b.totalCount !== undefined ? b.totalCount : 0;
          if (totalB !== totalA) {
            return totalB - totalA;
          }
          return a.name.localeCompare(b.name, 'id');
        }
      }
    });

    return result;
  }, [tags, searchQuery, statusFilter, contentTypeFilter, sortBy]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, contentTypeFilter, sortBy]);

  // Pagination slicing
  const totalItems = filteredAndSortedTags.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedTags = filteredAndSortedTags.slice(startIndex, startIndex + itemsPerPage);

  // Bulk selection helpers
  const isAllOnPageSelected =
    paginatedTags.length > 0 &&
    paginatedTags.every((t) => selectedIds.includes(t.id));

  const handleToggleSelectAllOnPage = () => {
    if (isAllOnPageSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedTags.some((t) => t.id === id))
      );
    } else {
      const pageIds = paginatedTags.map((t) => t.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkActivate = () => {
    if (selectedIds.length === 0) return;
    onBulkUpdateStatus(selectedIds, 'active');
    setSelectedIds([]);
  };

  const handleBulkDeactivate = () => {
    if (selectedIds.length === 0) return;
    onBulkUpdateStatus(selectedIds, 'inactive');
    setSelectedIds([]);
  };

  const formatShortDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama tag, slug URL, atau kata kunci..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200/60 hover:bg-slate-200 px-1.5 py-0.5 rounded-full"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Status */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <span className="text-slate-500 text-[11px] font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">Semua</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>

            {/* Filter Content Type */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <span className="text-slate-500 text-[11px] font-medium">Digunakan:</span>
              <select
                value={contentTypeFilter}
                onChange={(e) => setContentTypeFilter(e.target.value as ContentTypeFilter)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">Semua Tipe</option>
                <option value="both">Berita + Video</option>
                <option value="news">Hanya Berita</option>
                <option value="video">Hanya Video</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 text-[11px] font-medium">Urutan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="usage_desc">Paling Banyak Digunakan</option>
                <option value="name_asc">Nama A–Z</option>
                <option value="name_desc">Nama Z–A</option>
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar if items selected */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-red-50/80 border border-red-200 rounded-xl text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-red-900 font-semibold">
              <CheckSquare className="w-4 h-4 text-red-600" />
              <span>
                <strong>{selectedIds.length}</strong> tag terpilih
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkActivate}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors"
              >
                Aktifkan Terpilih
              </button>
              <button
                type="button"
                onClick={handleBulkDeactivate}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors"
              >
                Nonaktifkan Terpilih
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1 text-slate-600 hover:text-slate-800 font-medium text-xs"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tags Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[10px]">
                <th className="py-3 px-4 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAllOnPage}
                    className="text-slate-400 hover:text-slate-700 flex items-center justify-center"
                    title={isAllOnPageSelected ? 'Batalkan semua di halaman ini' : 'Pilih semua di halaman ini'}
                  >
                    {isAllOnPageSelected ? (
                      <CheckSquare className="w-4 h-4 text-red-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 min-w-[180px]">Nama Tag</th>
                <th className="py-3 px-4 min-w-[140px]">Slug URL</th>
                <th className="py-3 px-4 min-w-[130px]">Digunakan Oleh</th>
                <th className="py-3 px-4 min-w-[130px]">Jumlah Konten</th>
                <th className="py-3 px-4 min-w-[100px]">Status</th>
                <th className="py-3 px-4 min-w-[100px]">Dibuat</th>
                <th className="py-3 px-4 text-right min-w-[100px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {paginatedTags.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <TagIcon className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        Tidak ada tag yang ditemukan
                      </p>
                      <p className="text-xs text-slate-500">
                        {searchQuery || statusFilter !== 'all' || contentTypeFilter !== 'all'
                          ? 'Coba sesuaikan kata kunci pencarian atau reset filter di atas.'
                          : 'Belum ada data tag. Tambahkan tag baru untuk memulai.'}
                      </p>
                      {(searchQuery || statusFilter !== 'all' || contentTypeFilter !== 'all') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('all');
                            setContentTypeFilter('all');
                          }}
                          className="mt-2 text-xs text-red-600 font-bold hover:underline"
                        >
                          Reset Semua Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTags.map((tag) => {
                  const isSelected = selectedIds.includes(tag.id);
                  const isBoth =
                    tag.contentTypes.includes('news') && tag.contentTypes.includes('video');
                  const isNewsOnly =
                    tag.contentTypes.includes('news') && !tag.contentTypes.includes('video');
                  const isVideoOnly =
                    !tag.contentTypes.includes('news') && tag.contentTypes.includes('video');

                  return (
                    <tr
                      key={tag.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-red-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(tag.id)}
                          className="text-slate-400 hover:text-slate-700 flex items-center justify-center"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-red-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* Nama Tag */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0 font-bold font-mono text-xs">
                            #
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{tag.name}</span>
                              {tag.status === 'inactive' && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-500 font-semibold rounded">
                                  Nonaktif
                                </span>
                              )}
                            </div>
                            {tag.seoTitle && (
                              <p className="text-[10px] text-slate-400 truncate max-w-xs">
                                {tag.seoTitle}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Slug URL */}
                      <td className="py-3 px-4">
                        <a
                          href={`/tag/${tag.slug}`}
                          onClick={(e) => {
                            if (onNavigateToPublic) {
                              e.preventDefault();
                              onNavigateToPublic(`/tag/${tag.slug}`);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 font-mono text-slate-600 hover:text-red-600 transition-colors group/slug"
                          title="Buka halaman publik tag"
                        >
                          <span className="text-slate-400 text-[10px]">/tag/</span>
                          <span className="font-semibold text-slate-800 group-hover/slug:text-red-600 underline decoration-slate-200 group-hover/slug:decoration-red-400">
                            {tag.slug}
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-300 group-hover/slug:text-red-500 shrink-0" />
                        </a>
                      </td>

                      {/* Digunakan Oleh */}
                      <td className="py-3 px-4">
                        {isBoth ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            <FileText className="w-3 h-3" />
                            <span>+</span>
                            <Video className="w-3 h-3" />
                            <span>Berita &amp; Video</span>
                          </span>
                        ) : isNewsOnly ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <FileText className="w-3 h-3" />
                            <span>Berita</span>
                          </span>
                        ) : isVideoOnly ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Video className="w-3 h-3" />
                            <span>Video</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>

                      {/* Jumlah Konten */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col items-start">
                          <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 font-bold rounded-full text-xs">
                            {tag.totalCount || 0} konten
                          </span>
                          {(tag.totalCount || 0) > 0 && (
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              B: {tag.newsCount || 0} | V: {tag.videoCount || 0}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(tag.id, tag.status)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border cursor-pointer ${
                            tag.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Klik untuk mengubah status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              tag.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          ></span>
                          <span>{tag.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                        </button>
                      </td>

                      {/* Dibuat */}
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {formatShortDate(tag.createdAt)}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`/tag/${tag.slug}`}
                            onClick={(e) => {
                              if (onNavigateToPublic) {
                                e.preventDefault();
                                onNavigateToPublic(`/tag/${tag.slug}`);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Lihat Halaman Publik Tag"
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => onEdit(tag)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Tag"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(tag)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              (tag.totalCount || 0) > 0
                                ? 'text-amber-500 hover:text-amber-700 hover:bg-amber-50'
                                : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title={
                              (tag.totalCount || 0) > 0
                                ? 'Tag sedang digunakan (Proteksi hapus aktif)'
                                : 'Hapus Tag'
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer & Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-200 bg-slate-50/50 text-xs">
          <div className="flex items-center gap-3 text-slate-500">
            <span>
              Menampilkan{' '}
              <strong>{totalItems === 0 ? 0 : startIndex + 1}</strong>–
              <strong>{Math.min(startIndex + itemsPerPage, totalItems)}</strong> dari{' '}
              <strong>{totalItems}</strong> tag
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px]">Per halaman:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-semibold text-slate-800 text-xs">
              Halaman {validCurrentPage} dari {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
