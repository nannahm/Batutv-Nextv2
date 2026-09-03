import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  RotateCcw,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  X,
  Send,
  Flame,
  ArrowUp,
  ArrowDown,
  Sparkles,
  LayoutGrid,
  Lock,
} from 'lucide-react';
import { AdminArticle, ArticleStatus, AdminUser } from '../../../types/admin';
import { canRolePublish, normalizeUserRole } from '../../../utils/rbac';
import { NewsPreviewModal } from './NewsPreviewModal';

interface NewsListViewProps {
  articles: AdminArticle[];
  currentTab: 'all' | 'headlines' | 'draft' | 'scheduled' | 'published' | 'trash';
  onTabChange: (tab: 'all' | 'headlines' | 'draft' | 'scheduled' | 'published' | 'trash') => void;
  onNewArticle: () => void;
  onEditArticle: (article: AdminArticle) => void;
  onTrashArticle: (id: string) => void;
  onRestoreArticle: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onDuplicateArticle: (id: string) => void;
  onQuickStatusChange: (id: string, newStatus: ArticleStatus) => void;
  onBulkTrash: (ids: string[]) => void;
  onBulkRestore: (ids: string[]) => void;
  onBulkPermanentDelete: (ids: string[]) => void;
  onBulkStatusChange: (ids: string[], status: ArticleStatus) => void;
  onToggleHeadline?: (id: string, newIsHeadline: boolean, position?: number) => void;
  onReorderHeadlines?: (orderedIds: string[]) => void;
  currentUser?: AdminUser | null;
}

export const NewsListView: React.FC<NewsListViewProps> = ({
  articles,
  currentTab,
  onTabChange,
  onNewArticle,
  onEditArticle,
  onTrashArticle,
  onRestoreArticle,
  onPermanentDelete,
  onDuplicateArticle,
  onQuickStatusChange,
  onBulkTrash,
  onBulkRestore,
  onBulkPermanentDelete,
  onBulkStatusChange,
  onToggleHeadline,
  onReorderHeadlines,
  currentUser,
}) => {
  const userRole = normalizeUserRole(currentUser?.role);
  const canPublish = canRolePublish(currentUser?.role);
  const canManageHeadline = userRole === 'admin' || userRole === 'redaksi';
  const canPermanentDeleteRole = userRole === 'admin';
  const canTrashPublished = userRole === 'admin' || userRole === 'redaksi' || userRole === 'editor';
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'title_asc'>('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selection for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Preview Modal State
  const [previewArticle, setPreviewArticle] = useState<AdminArticle | null>(null);

  // Delete Confirmation Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Calculate live counts
  const counts = useMemo(() => {
    return {
      all: articles.filter((a) => a.status !== 'trash').length,
      headlines: articles.filter((a) => a.status === 'published' && a.isHeadline).length,
      draft: articles.filter((a) => a.status === 'draft').length,
      scheduled: articles.filter((a) => a.status === 'scheduled').length,
      published: articles.filter((a) => a.status === 'published').length,
      trash: articles.filter((a) => a.status === 'trash').length,
    };
  }, [articles]);

  // Unique categories list
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set);
  }, [articles]);

  // Active Headline articles sorted strictly by headlinePosition (1..N)
  const activeHeadlines = useMemo(() => {
    return articles
      .filter((a) => a.status === 'published' && a.isHeadline)
      .sort((a, b) => (a.headlinePosition || 99) - (b.headlinePosition || 99));
  }, [articles]);

  // Filtered list
  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      // 1. Tab Status Filter
      if (currentTab === 'all') {
        if (item.status === 'trash') return false;
      } else if (currentTab === 'headlines') {
        if (item.status !== 'published' || !item.isHeadline) return false;
      } else if (currentTab === 'draft') {
        if (item.status !== 'draft') return false;
      } else if (currentTab === 'scheduled') {
        if (item.status !== 'scheduled') return false;
      } else if (currentTab === 'published') {
        if (item.status !== 'published') return false;
      } else if (currentTab === 'trash') {
        if (item.status !== 'trash') return false;
      }

      // 2. Category Filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      // 3. Search Query Filter (Title, Author, Excerpt, Tags)
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchAuthor = item.author.toLowerCase().includes(q);
        const matchExcerpt = item.excerpt.toLowerCase().includes(q);
        const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchAuthor && !matchExcerpt && !matchTags) {
          return false;
        }
      }

      // 4. Date Filter
      if (dateFilter !== 'all') {
        const itemDate = new Date(item.publishedAt || item.createdAt);
        const now = new Date();
        if (dateFilter === 'today') {
          if (
            itemDate.getDate() !== now.getDate() ||
            itemDate.getMonth() !== now.getMonth() ||
            itemDate.getFullYear() !== now.getFullYear()
          ) {
            return false;
          }
        } else if (dateFilter === 'week') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (itemDate < sevenDaysAgo) return false;
        } else if (dateFilter === 'month') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          if (itemDate < thirtyDaysAgo) return false;
        }
      }

      return true;
    });
  }, [articles, currentTab, categoryFilter, searchQuery, dateFilter]);

  // Sorted list
  const sortedArticles = useMemo(() => {
    const list = [...filteredArticles];
    if (currentTab === 'headlines') {
      return list.sort((a, b) => (a.headlinePosition || 99) - (b.headlinePosition || 99));
    }
    return list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.publishedAt || a.createdAt).getTime() - new Date(b.publishedAt || b.createdAt).getTime();
      }
      if (sortBy === 'views') {
        return b.views - a.views;
      }
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [filteredArticles, sortBy, currentTab]);

  // Paginated list
  const totalPages = Math.max(1, Math.ceil(sortedArticles.length / pageSize));
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedArticles.slice(start, start + pageSize);
  }, [sortedArticles, currentPage, pageSize]);

  // Checkbox handlers
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedArticles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedArticles.map((a) => a.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Move Headline Up or Down in Order
  const handleMoveHeadline = (articleId: string, direction: 'up' | 'down') => {
    if (!onReorderHeadlines) return;
    const currentIndex = activeHeadlines.findIndex((a) => a.id === articleId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= activeHeadlines.length) return;

    const reordered = [...activeHeadlines];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    onReorderHeadlines(reordered.map((a) => a.id));
  };

  // Helper date format
  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (st: ArticleStatus) => {
    switch (st) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Terbit
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            Terjadwal
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            Draft
          </span>
        );
      case 'trash':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
            <Trash2 className="w-3 h-3 text-red-600" />
            Sampah
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Main Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manajemen Berita
            </h1>
            <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
              {counts.all} Berita
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola artikel, susun Headline beranda, jadwalkan publikasi, dan tinjau naskah portal BatuTV.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onNewArticle}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Berita Baru</span>
        </button>
      </div>

      {/* Navigation Tabs (Semua, Headline, Terbit, Terjadwal, Draft, Sampah) */}
      <div className="border-b border-slate-200 bg-white px-4 sm:px-6 rounded-2xl border shadow-xs overflow-x-auto">
        <div className="flex items-center gap-2 sm:gap-4 -mb-px min-w-max py-2">
          {/* Tab: Semua Berita */}
          <button
            type="button"
            onClick={() => {
              onTabChange('all');
              setCurrentPage(1);
              setSelectedIds([]);
            }}
            className={`py-2 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              currentTab === 'all'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <span>Semua Berita</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                currentTab === 'all'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.all}
            </span>
          </button>

          {/* Tab: Headline */}
          <button
            type="button"
            onClick={() => {
              onTabChange('headlines');
              setCurrentPage(1);
              setSelectedIds([]);
            }}
            className={`py-2 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              currentTab === 'headlines'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${currentTab === 'headlines' ? 'text-orange-500 fill-orange-500' : 'text-orange-400'}`} />
            <span>Headline</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                currentTab === 'headlines'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.headlines}/5
            </span>
          </button>

          {/* Tab: Terbit */}
          <button
            type="button"
            onClick={() => {
              onTabChange('published');
              setCurrentPage(1);
              setSelectedIds([]);
            }}
            className={`py-2 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              currentTab === 'published'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <span>Terbit</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                currentTab === 'published'
                  ? 'bg-emerald-100 text-emerald-800 font-bold'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.published}
            </span>
          </button>

          {/* Tab: Terjadwal */}
          <button
            type="button"
            onClick={() => {
              onTabChange('scheduled');
              setCurrentPage(1);
              setSelectedIds([]);
            }}
            className={`py-2 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              currentTab === 'scheduled'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <span>Terjadwal</span>
            {counts.scheduled > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  currentTab === 'scheduled'
                    ? 'bg-blue-100 text-blue-800 font-bold'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {counts.scheduled}
              </span>
            )}
          </button>

          {/* Tab: Draft */}
          <button
            type="button"
            onClick={() => {
              onTabChange('draft');
              setCurrentPage(1);
              setSelectedIds([]);
            }}
            className={`py-2 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              currentTab === 'draft'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <span>Draft</span>
            {counts.draft > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  currentTab === 'draft'
                    ? 'bg-amber-100 text-amber-800 font-bold'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {counts.draft}
              </span>
            )}
          </button>

          {/* Tab: Sampah */}
          <button
            type="button"
            onClick={() => {
              onTabChange('trash');
              setCurrentPage(1);
              setSelectedIds([]);
            }}
            className={`py-2 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              currentTab === 'trash'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Sampah</span>
            {counts.trash > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  currentTab === 'trash'
                    ? 'bg-red-100 text-red-800 font-bold'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {counts.trash}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SPECIAL HEADLINE HERO MANAGEMENT PANEL (Visible when currentTab === 'headlines') */}
      {currentTab === 'headlines' && (
        <div className="bg-gradient-to-br from-orange-50/80 via-white to-amber-50/50 p-5 sm:p-6 rounded-2xl border border-orange-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-500 text-white">
                  <Flame className="w-4 h-4" />
                </span>
                <h2 className="text-base font-black text-slate-900">
                  Pengelola Slot Headline
                </h2>
                <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 text-xs font-black rounded-full border border-orange-200">
                  {activeHeadlines.length} dari 5 Slot Aktif
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Berita di bawah ini tampil langsung di blok Headline Beranda portal. Posisi #1 adalah Headline Utama Besar (Kiri), Posisi #2–#5 adalah Sub-Headline (Kanan).
              </p>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs shrink-0 self-start sm:self-auto"
            >
              <span>Lihat Beranda Publik</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Visual Slot Cards (5 Slots) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {[1, 2, 3, 4, 5].map((slotNumber) => {
              const articleAtSlot = activeHeadlines.find((a) => a.headlinePosition === slotNumber) || activeHeadlines[slotNumber - 1];
              const isMainSlot = slotNumber === 1;

              return (
                <div
                  key={`slot-${slotNumber}`}
                  className={`rounded-xl p-3 border transition-all flex flex-col justify-between relative ${
                    articleAtSlot
                      ? isMainSlot
                        ? 'bg-amber-50/90 border-orange-300 shadow-xs'
                        : 'bg-white border-slate-200 shadow-2xs'
                      : 'bg-slate-50 border-dashed border-slate-300'
                  }`}
                >
                  {/* Slot Header */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        isMainSlot
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-800 text-white'
                      }`}
                    >
                      {isMainSlot ? 'Slot #1 (Utama)' : `Slot #${slotNumber}`}
                    </span>
                    {articleAtSlot && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Live
                      </span>
                    )}
                  </div>

                  {articleAtSlot ? (
                    <div className="space-y-2 flex-1 flex flex-col justify-between">
                      {/* Image & Title */}
                      <div>
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-200 mb-2 border border-slate-200">
                          <img
                            src={articleAtSlot.featuredImage}
                            alt={articleAtSlot.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                          {articleAtSlot.title}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                          <span>{articleAtSlot.category}</span>
                          <span>{articleAtSlot.views.toLocaleString()} views</span>
                        </div>
                      </div>

                      {/* Slot Reorder Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                        {canManageHeadline ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={slotNumber === 1}
                              onClick={() => handleMoveHeadline(articleAtSlot.id, 'up')}
                              className="p-1 rounded-md bg-slate-100 hover:bg-orange-100 hover:text-orange-700 disabled:opacity-30 disabled:hover:bg-slate-100 disabled:hover:text-slate-400 text-slate-700 transition-colors cursor-pointer"
                              title="Naikkan Posisi (Ke Atas)"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={slotNumber === activeHeadlines.length || slotNumber === 5}
                              onClick={() => handleMoveHeadline(articleAtSlot.id, 'down')}
                              className="p-1 rounded-md bg-slate-100 hover:bg-orange-100 hover:text-orange-700 disabled:opacity-30 disabled:hover:bg-slate-100 disabled:hover:text-slate-400 text-slate-700 transition-colors cursor-pointer"
                              title="Turunkan Posisi (Ke Bawah)"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-300" />
                            <span>Urutan Tetap</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditArticle(articleAtSlot)}
                            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Edit Artikel"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {canManageHeadline && onToggleHeadline && (
                            <button
                              type="button"
                              onClick={() => onToggleHeadline(articleAtSlot.id, false)}
                              className="p-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                              title="Keluarkan dari Headline"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-slate-400">
                      <Flame className="w-6 h-6 mb-1 text-slate-300" />
                      <span className="text-xs font-bold text-slate-500">Slot Kosong</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        Pilih artikel dari daftar "Semua Berita" atau "Terbit" lalu klik jadikan headline.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari judul berita, penulis, ringkasan, atau tag..."
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Rubrik / Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Rubrik ({categoriesList.length})</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Waktu</option>
                <option value="today">Hari Ini</option>
                <option value="week">7 Hari Terakhir</option>
                <option value="month">30 Hari Terakhir</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="views">Terpopuler (Views)</option>
                <option value="title_asc">Judul (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions Banner (Visible when rows are selected) */}
        {selectedIds.length > 0 && (
          <div className="bg-slate-900 text-white p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-xs font-bold">
              <CheckSquare className="w-4 h-4 text-red-500" />
              <span>{selectedIds.length} artikel terpilih</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {currentTab !== 'trash' ? (
                <>
                  {canPublish && (
                    <button
                      type="button"
                      onClick={() => {
                        onBulkStatusChange(selectedIds, 'published');
                        setSelectedIds([]);
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Tandai Terbit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onBulkStatusChange(selectedIds, 'draft');
                      setSelectedIds([]);
                    }}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Jadikan Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onBulkTrash(selectedIds);
                      setSelectedIds([]);
                    }}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Pindahkan ke Sampah</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onBulkRestore(selectedIds);
                      setSelectedIds([]);
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Pulihkan Semua</span>
                  </button>
                  {canPermanentDeleteRole && (
                    <button
                      type="button"
                      onClick={() => {
                        onBulkPermanentDelete(selectedIds);
                        setSelectedIds([]);
                      }}
                      className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus Permanen</span>
                    </button>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                title="Batalkan Pilihan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {paginatedArticles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th scope="col" className="w-10 px-4 py-3.5">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-slate-500 hover:text-slate-900 cursor-pointer"
                      title="Pilih Semua Halaman Ini"
                    >
                      {selectedIds.length > 0 &&
                      selectedIds.length === paginatedArticles.length ? (
                        <CheckSquare className="w-4 h-4 text-red-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Gambar & Judul Artikel
                  </th>
                  <th scope="col" className="px-3 py-3.5 hidden md:table-cell">
                    Kategori
                  </th>
                  <th scope="col" className="px-3 py-3.5 hidden lg:table-cell">
                    Penulis & Editor
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Tanggal
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 hidden sm:table-cell text-right">
                    Views
                  </th>
                  <th scope="col" className="w-36 px-4 py-3.5 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedArticles.map((article) => {
                  const isSelected = selectedIds.includes(article.id);
                  const isArticleHeadline = article.isHeadline && article.status === 'published';

                  return (
                    <tr
                      key={article.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-red-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(article.id)}
                          className="text-slate-400 hover:text-slate-900 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-red-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Thumbnail & Title */}
                      <td className="px-3 py-3.5">
                        <div className="flex items-start gap-3 min-w-[260px] max-w-md">
                          {/* Thumbnail */}
                          <div
                            className="w-16 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative group cursor-pointer"
                            onClick={() => onEditArticle(article)}
                          >
                            {article.featuredImage ? (
                              <img
                                src={article.featuredImage}
                                alt={article.imageAlt || article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <FileText className="w-4 h-4" />
                              </div>
                            )}
                          </div>

                          {/* Title & Slug & Headline Badge */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {isArticleHeadline && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-black rounded-md border border-orange-200 shrink-0">
                                  <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                                  <span>HEADLINE #{article.headlinePosition || 1}</span>
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => onEditArticle(article)}
                                className="text-left font-bold text-slate-900 hover:text-red-600 line-clamp-2 leading-snug transition-colors cursor-pointer text-xs sm:text-sm"
                              >
                                {article.title}
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                              <span className="font-mono truncate max-w-[180px]">
                                /{article.slug}
                              </span>
                              <span className="md:hidden px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                {article.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-3 py-3.5 hidden md:table-cell">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-bold text-[11px] border border-slate-200">
                          {article.category}
                        </span>
                      </td>

                      {/* Author & Editor */}
                      <td className="px-3 py-3.5 hidden lg:table-cell">
                        <div className="font-bold text-slate-800">{article.author}</div>
                        <div className="text-[10px] text-slate-400">Ed: {article.editor}</div>
                      </td>

                      {/* Date */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="text-[11px] text-slate-700 font-medium">
                          {formatDateTime(article.publishedAt || article.createdAt)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {article.status === 'scheduled' ? 'Dijadwalkan' : 'Dibuat'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {getStatusBadge(article.status)}
                      </td>

                      {/* Views */}
                      <td className="px-3 py-3.5 hidden sm:table-cell text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 font-bold text-slate-700">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>{article.views.toLocaleString()}</span>
                        </div>
                      </td>

                      {/* Action Menu Buttons */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Quick Headline Hero Toggle (for Published Articles - Admin & Redaksi only) */}
                          {article.status === 'published' && onToggleHeadline && canManageHeadline && (
                            <button
                              type="button"
                              onClick={() => onToggleHeadline(article.id, !article.isHeadline)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                article.isHeadline
                                  ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-2xs'
                                  : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'
                              }`}
                              title={
                                article.isHeadline
                                  ? `Headline #${article.headlinePosition} (Klik untuk Nonaktifkan)`
                                  : 'Jadikan Headline di Beranda'
                              }
                            >
                              <Flame className={`w-3.5 h-3.5 ${article.isHeadline ? 'fill-white' : ''}`} />
                            </button>
                          )}

                          {/* Quick Action: Edit */}
                          {article.status !== 'trash' && (
                            <button
                              type="button"
                              onClick={() => onEditArticle(article)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Edit Berita"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Quick Action: Preview */}
                          <button
                            type="button"
                            onClick={() => setPreviewArticle(article)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                            title="Pratinjau Tampilan Berita"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Action: Quick Publish (if draft or scheduled - Only for Admin, Redaksi, Editor) */}
                          {canPublish && article.status !== 'trash' && (article.status === 'draft' || article.status === 'scheduled') && (
                            <button
                              type="button"
                              onClick={() => onQuickStatusChange(article.id, 'published')}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Terbitkan Sekarang"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Action: Quick Unpublish to Draft (if published - Only for Admin, Redaksi, Editor) */}
                          {canPublish && article.status === 'published' && (
                            <button
                              type="button"
                              onClick={() => onQuickStatusChange(article.id, 'draft')}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                              title="Jadikan Draft (Unpublish)"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Action: Duplicate Article */}
                          {article.status !== 'trash' && (
                            <button
                              type="button"
                              onClick={() => onDuplicateArticle(article.id)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Duplikasi Naskah (Copy Draft)"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Action: Lihat Publik (If Published) */}
                          {article.status === 'published' && (
                            <a
                              href={`/berita/${article.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                              title="Buka Tautan Berita Publik"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Action: Trash or Restore */}
                          {article.status !== 'trash' ? (
                            (article.status !== 'published' || canTrashPublished) && (
                              <button
                                type="button"
                                onClick={() => onTrashArticle(article.id)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Pindahkan ke Sampah"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => onRestoreArticle(article.id)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                                title="Pulihkan Artikel"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              {canPermanentDeleteRole && (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(article.id)}
                                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Hapus Permanen"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 px-4 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              {currentTab === 'headlines' ? (
                <Flame className="w-8 h-8 text-orange-400" />
              ) : currentTab === 'trash' ? (
                <Trash2 className="w-8 h-8 text-slate-400" />
              ) : (
                <FileText className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {searchQuery
                ? 'Tidak ada berita yang cocok'
                : currentTab === 'headlines'
                ? 'Belum ada Headline aktif'
                : currentTab === 'trash'
                ? 'Folder Sampah Kosong'
                : currentTab === 'draft'
                ? 'Tidak ada draft artikel'
                : currentTab === 'scheduled'
                ? 'Tidak ada artikel terjadwal'
                : 'Belum ada artikel berita'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery
                ? `Tidak ditemukan hasil pencarian untuk "${searchQuery}". Coba kata kunci lain atau reset filter.`
                : currentTab === 'headlines'
                ? 'Jadikan artikel berstatus Terbit sebagai Headline agar tampil di halaman depan portal.'
                : currentTab === 'trash'
                ? 'Artikel yang dihapus ke sampah akan muncul di sini sebelum dihapus permanen.'
                : 'Mulai buat artikel baru untuk dipublikasikan ke portal berita BatuTV.'}
            </p>

            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setDateFilter('all');
                }}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Reset Semua Filter
              </button>
            ) : currentTab !== 'trash' && currentTab !== 'headlines' ? (
              <button
                type="button"
                onClick={onNewArticle}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tulis Berita Baru</span>
              </button>
            ) : null}
          </div>
        )}

        {/* Pagination Footer */}
        {sortedArticles.length > 0 && (
          <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Menampilkan</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>dari {sortedArticles.length} artikel</span>
            </div>

            {/* Page Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-bold text-slate-800">
                Halaman {currentPage} dari {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 cursor-pointer"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Live Article Preview Modal */}
      <NewsPreviewModal
        article={previewArticle}
        isOpen={Boolean(previewArticle)}
        onClose={() => setPreviewArticle(null)}
        onPublishNow={(art) => {
          onQuickStatusChange(art.id, 'published');
          setPreviewArticle(null);
        }}
      />

      {/* Permanent Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Hapus Artikel Secara Permanen?
              </h3>
              <p className="text-xs text-slate-500">
                Tindakan ini tidak dapat dibatalkan. Naskah berita dan seluruh datanya akan dihapus permanen dari sistem BatuTV.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onPermanentDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
