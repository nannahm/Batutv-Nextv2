import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  Video,
  CornerDownRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  Layers,
  Globe,
} from 'lucide-react';
import { AdminCategory, CategoryContentType, CategoryStatus } from '../../../types/admin';

interface CategoryListViewProps {
  categories: AdminCategory[];
  onAddNew: () => void;
  onEdit: (category: AdminCategory) => void;
  onRequestDelete: (category: AdminCategory) => void;
  onToggleStatus: (categoryId: string, currentStatus: CategoryStatus) => void;
  onBulkUpdateStatus: (ids: string[], status: CategoryStatus) => void;
  onViewPublicCategory?: (slug: string) => void;
}

export const CategoryListView: React.FC<CategoryListViewProps> = ({
  categories,
  onAddNew,
  onEdit,
  onRequestDelete,
  onToggleStatus,
  onBulkUpdateStatus,
  onViewPublicCategory,
}) => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'news' | 'video' | 'both'>('all');
  const [hierarchyFilter, setHierarchyFilter] = useState<'all' | 'parent_only' | 'sub_only'>('all');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'count_desc' | 'created_desc' | 'created_asc'>('name_asc');

  // Selected for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Map of categories by ID for quick parent lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, AdminCategory>();
    categories.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

  // Filter & Sort logic
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = cat.name.toLowerCase().includes(q);
          const matchSlug = cat.slug.toLowerCase().includes(q);
          const matchDesc = (cat.description || '').toLowerCase().includes(q);
          if (!matchName && !matchSlug && !matchDesc) return false;
        }

        // Status filter
        if (statusFilter !== 'all' && cat.status !== statusFilter) {
          return false;
        }

        // Content type filter
        if (contentTypeFilter === 'news') {
          if (!cat.contentTypes.includes('news')) return false;
        } else if (contentTypeFilter === 'video') {
          if (!cat.contentTypes.includes('video')) return false;
        } else if (contentTypeFilter === 'both') {
          if (!(cat.contentTypes.includes('news') && cat.contentTypes.includes('video'))) return false;
        }

        // Hierarchy filter
        if (hierarchyFilter === 'parent_only' && cat.parentId) return false;
        if (hierarchyFilter === 'sub_only' && !cat.parentId) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name, 'id');
        }
        if (sortBy === 'name_desc') {
          return b.name.localeCompare(a.name, 'id');
        }
        if (sortBy === 'count_desc') {
          return (b.totalCount || 0) - (a.totalCount || 0);
        }
        if (sortBy === 'created_desc') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'created_asc') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return 0;
      });
  }, [categories, searchQuery, statusFilter, contentTypeFilter, hierarchyFilter, sortBy]);

  // Reset pagination when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchQuery, statusFilter, contentTypeFilter, hierarchyFilter, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, currentPage, itemsPerPage]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedCategories.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    paginatedCategories.length > 0 &&
    paginatedCategories.every((c) => selectedIds.includes(c.id));

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setContentTypeFilter('all');
    setHierarchyFilter('all');
    setSortBy('name_asc');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Filter and Action Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kategori berdasarkan nama atau slug..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200/60 hover:bg-slate-200 px-1.5 py-0.5 rounded-full cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action: Add Button */}
          <button
            type="button"
            onClick={onAddNew}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 self-start md:self-auto shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
        </div>

        {/* Filter Dropdowns & Sorting */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Filter Status */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>

          {/* Filter Penggunaan */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Penggunaan</label>
            <select
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="all">Semua Penggunaan</option>
              <option value="news">Berita</option>
              <option value="video">Video</option>
              <option value="both">Berita + Video</option>
            </select>
          </div>

          {/* Filter Hirarki */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Hirarki</label>
            <select
              value={hierarchyFilter}
              onChange={(e) => setHierarchyFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="all">Semua Level</option>
              <option value="parent_only">Kategori Utama</option>
              <option value="sub_only">Subkategori</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Urutan</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="name_asc">Nama A-Z</option>
              <option value="name_desc">Nama Z-A</option>
              <option value="count_desc">Konten Terbanyak</option>
              <option value="created_desc">Terbaru Dibuat</option>
              <option value="created_asc">Terlama</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar if items selected */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-red-50/80 border border-red-200 rounded-xl animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs text-red-900 font-semibold">
            <span className="font-bold text-white bg-red-600 px-2 py-0.5 rounded">
              {selectedIds.length}
            </span>
            <span>kategori dipilih</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onBulkUpdateStatus(selectedIds, 'active');
                setSelectedIds([]);
              }}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aktifkan</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onBulkUpdateStatus(selectedIds, 'inactive');
                setSelectedIds([]);
              }}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Nonaktifkan</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-800 font-medium text-xs cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 min-w-[200px]">Nama Kategori &amp; Deskripsi</th>
                <th className="py-3 px-4 min-w-[140px]">Slug URL</th>
                <th className="py-3 px-4 min-w-[120px]">Parent</th>
                <th className="py-3 px-4 text-center min-w-[130px]">Penggunaan</th>
                <th className="py-3 px-4 text-center min-w-[120px]">Jumlah Konten</th>
                <th className="py-3 px-4 text-center min-w-[100px]">Status</th>
                <th className="py-3 px-4 text-right min-w-[100px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {paginatedCategories.length > 0 ? (
                paginatedCategories.map((cat) => {
                  const isSelected = selectedIds.includes(cat.id);
                  const parentCat = cat.parentId ? categoryMap.get(cat.parentId) : null;
                  const isSubCategory = Boolean(cat.parentId);
                  const isBothTypes = cat.contentTypes.includes('news') && cat.contentTypes.includes('video');
                  const isNewsOnly = cat.contentTypes.includes('news') && !cat.contentTypes.includes('video');
                  const isVideoOnly = cat.contentTypes.includes('video') && !cat.contentTypes.includes('news');

                  return (
                    <tr
                      key={cat.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-red-50/30' : ''
                      } ${cat.status === 'inactive' ? 'opacity-70' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(cat.id)}
                          className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                        />
                      </td>

                      {/* Nama & Deskripsi */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2">
                          {isSubCategory ? (
                            <CornerDownRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 ml-2" />
                          ) : (
                            <Layers className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm hover:text-red-600 transition-colors">
                                {cat.name}
                              </span>
                              {isSubCategory && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.2 rounded font-semibold">
                                  Sub
                                </span>
                              )}
                            </div>
                            {cat.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-3 px-4 font-mono text-xs">
                        <span className="text-slate-400">/kategori/</span>
                        <span className="font-semibold text-slate-800">{cat.slug}</span>
                      </td>

                      {/* Parent */}
                      <td className="py-3 px-4">
                        {parentCat ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-slate-700 font-semibold text-[11px]">
                            {parentCat.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Utama (Level 1)</span>
                        )}
                      </td>

                      {/* Penggunaan */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          {isBothTypes && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 rounded-md text-[11px] font-semibold">
                              <FileText className="w-3 h-3" />
                              <span>+</span>
                              <Video className="w-3 h-3" />
                              <span>Berita &amp; Video</span>
                            </span>
                          )}
                          {isNewsOnly && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-[11px] font-semibold">
                              <FileText className="w-3 h-3" />
                              <span>Berita</span>
                            </span>
                          )}
                          {isVideoOnly && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-[11px] font-semibold">
                              <Video className="w-3 h-3" />
                              <span>Video</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Jumlah Konten */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 font-bold rounded-full text-xs">
                            {cat.totalCount || 0} konten
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            B: {cat.newsCount || 0} | V: {cat.videoCount || 0}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(cat.id, cat.status)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border cursor-pointer ${
                            cat.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              cat.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          ></span>
                          <span>{cat.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => onEdit(cat)}
                            title="Edit Kategori"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => onRequestDelete(cat)}
                            title="Hapus Kategori"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Preview / Public Link */}
                          {onViewPublicCategory && (
                            <button
                              type="button"
                              onClick={() => onViewPublicCategory(cat.slug)}
                              title="Lihat Halaman Publik"
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* Empty state */
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3 bg-slate-100 rounded-2xl text-slate-400">
                        <Filter className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">Tidak ada kategori yang cocok</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Kategori yang sesuai dengan filter atau kata kunci pencarian tidak ditemukan.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Filter</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 gap-3">
          <div>
            Menampilkan{' '}
            <strong className="text-slate-800">
              {filteredCategories.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </strong>{' '}
            -{' '}
            <strong className="text-slate-800">
              {Math.min(currentPage * itemsPerPage, filteredCategories.length)}
            </strong>{' '}
            dari <strong className="text-slate-800">{filteredCategories.length}</strong> kategori
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    currentPage === page
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
