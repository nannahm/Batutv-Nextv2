import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  Trash2,
  RotateCcw,
  MoreVertical,
  ExternalLink,
  Edit3,
  Copy,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  AlertTriangle,
  Play,
  Tv,
} from 'lucide-react';
import { AdminVideo, VideoStatus, AdminUser } from '../../../types/admin';
import { VideoPreviewModal } from './VideoPreviewModal';
import { getYouTubeThumbnailUrl } from '../../../utils/youtube';
import { getMediaById } from '../../../data/mediaAdminStore';
import { canRolePublish, canRolePermanentDelete, canRoleTrashPublished } from '../../../utils/rbac';

interface VideoListViewProps {
  videos: AdminVideo[];
  activeTab: 'all' | 'draft' | 'scheduled' | 'published' | 'trash';
  counts: {
    all: number;
    draft: number;
    scheduled: number;
    published: number;
    trash: number;
  };
  onTabChange: (tab: 'all' | 'draft' | 'scheduled' | 'published' | 'trash') => void;
  onNewVideo: () => void;
  onEditVideo: (video: AdminVideo) => void;
  onTrashVideo: (id: string) => void;
  onRestoreVideo: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onDuplicateVideo: (id: string) => void;
  onQuickStatusChange: (id: string, status: VideoStatus) => void;
  onBulkStatusChange: (ids: string[], status: VideoStatus) => void;
  onBulkPermanentDelete: (ids: string[]) => void;
  onNavigateToPublic: (slug: string) => void;
  currentUser?: AdminUser | null;
}

const CATEGORIES = [
  'Semua Kategori',
  'Wisata & Kuliner',
  'Pemerintahan',
  'Budaya',
  'Ekonomi',
  'Lingkungan',
  'Olahraga',
  'Edukasi',
  'Kesehatan',
  'Hukum & Kriminal',
];

export const VideoListView: React.FC<VideoListViewProps> = ({
  videos,
  activeTab,
  counts,
  onTabChange,
  onNewVideo,
  onEditVideo,
  onTrashVideo,
  onRestoreVideo,
  onPermanentDelete,
  onDuplicateVideo,
  onQuickStatusChange,
  onBulkStatusChange,
  onBulkPermanentDelete,
  onNavigateToPublic,
  currentUser,
}) => {
  const userRole = currentUser?.role;
  const canPublish = canRolePublish(userRole);
  const canPermanentDeleteRole = canRolePermanentDelete(userRole);
  const canTrashPublished = canRoleTrashPublished(userRole);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [selectedSort, setSelectedSort] = useState<'latest' | 'oldest' | 'views' | 'title'>('latest');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Action Menu Dropdown State
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Preview Modal State
  const [previewVideo, setPreviewVideo] = useState<AdminVideo | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Permanent Delete Confirmation Modal State
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ id: string; title: string } | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Filter & Search Pipeline
  const filteredVideos = useMemo(() => {
    return videos.filter((vid) => {
      // Tab filter
      if (activeTab === 'all' && vid.status === 'trash') return false;
      if (activeTab === 'published' && vid.status !== 'published') return false;
      if (activeTab === 'scheduled' && vid.status !== 'scheduled') return false;
      if (activeTab === 'draft' && vid.status !== 'draft') return false;
      if (activeTab === 'trash' && vid.status !== 'trash') return false;

      // Category filter
      if (selectedCategory !== 'Semua Kategori' && vid.category !== selectedCategory) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const vidDate = new Date(vid.publishedAt).getTime();
        const now = Date.now();
        if (dateFilter === 'today' && now - vidDate > 24 * 60 * 60 * 1000) return false;
        if (dateFilter === '7days' && now - vidDate > 7 * 24 * 60 * 60 * 1000) return false;
        if (dateFilter === '30days' && now - vidDate > 30 * 24 * 60 * 60 * 1000) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = vid.title.toLowerCase().includes(q);
        const matchAuthor = vid.author.toLowerCase().includes(q);
        const matchDesc = vid.description.toLowerCase().includes(q);
        const matchId = vid.youtubeVideoId.toLowerCase().includes(q);
        const matchTags = vid.tags?.some((t) => t.toLowerCase().includes(q));
        return matchTitle || matchAuthor || matchDesc || matchId || matchTags;
      }

      return true;
    });
  }, [videos, activeTab, selectedCategory, dateFilter, searchQuery]);

  // Sort Pipeline
  const sortedVideos = useMemo(() => {
    return [...filteredVideos].sort((a, b) => {
      if (selectedSort === 'latest') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      if (selectedSort === 'oldest') {
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      }
      if (selectedSort === 'views') {
        return b.views - a.views;
      }
      if (selectedSort === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [filteredVideos, selectedSort]);

  // Pagination Pipeline
  const totalPages = Math.max(1, Math.ceil(sortedVideos.length / itemsPerPage));
  const paginatedVideos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedVideos.slice(start, start + itemsPerPage);
  }, [sortedVideos, currentPage, itemsPerPage]);

  // Selection Handlers
  const handleSelectAllOnPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pageIds = paginatedVideos.map((v) => v.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = paginatedVideos.map((v) => v.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllPageSelected =
    paginatedVideos.length > 0 &&
    paginatedVideos.every((v) => selectedIds.includes(v.id));

  // Quick Open Preview
  const handleOpenPreview = (video: AdminVideo) => {
    setPreviewVideo(video);
    setIsPreviewModalOpen(true);
    setOpenActionMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manajemen Video
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Kelola arsip siaran dan tayangan video BATUTV.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewVideo}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Video Baru</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto border-b border-slate-200 pb-px scrollbar-none">
        <button
          type="button"
          onClick={() => onTabChange('all')}
          className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'all'
              ? 'border-red-600 text-red-600 bg-red-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Semua Video</span>
          <span
            className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
              activeTab === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {counts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('published')}
          className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'published'
              ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Terbit</span>
          <span
            className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
              activeTab === 'published'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {counts.published}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('scheduled')}
          className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'scheduled'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Terjadwal</span>
          <span
            className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
              activeTab === 'scheduled'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {counts.scheduled}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('draft')}
          className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'draft'
              ? 'border-amber-600 text-amber-600 bg-amber-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Draft</span>
          <span
            className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
              activeTab === 'draft'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {counts.draft}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('trash')}
          className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'trash'
              ? 'border-red-600 text-red-600 bg-red-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Sampah</span>
          <span
            className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
              activeTab === 'trash'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {counts.trash}
          </span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari judul, reporter, tag, atau ID YouTube..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="lg:col-span-2">
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
            >
              <option value="all">Semua Tanggal</option>
              <option value="today">Hari Ini</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="30days">30 Hari Terakhir</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
            >
              <option value="latest">Urutkan: Terbaru</option>
              <option value="oldest">Urutkan: Terlama</option>
              <option value="views">Urutkan: Views Terbanyak</option>
              <option value="title">Urutkan: Judul (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Selected Count & Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-xs font-bold text-red-900">
                {selectedIds.length} video terpilih
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canPublish && activeTab !== 'published' && activeTab !== 'trash' && (
                <button
                  type="button"
                  onClick={() => {
                    onBulkStatusChange(selectedIds, 'published');
                    setSelectedIds([]);
                  }}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Tandai Terbit
                </button>
              )}

              {activeTab !== 'draft' && activeTab !== 'trash' && (
                <button
                  type="button"
                  onClick={() => {
                    onBulkStatusChange(selectedIds, 'draft');
                    setSelectedIds([]);
                  }}
                  className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Jadikan Draft
                </button>
              )}

              {activeTab !== 'trash' ? (
                <button
                  type="button"
                  onClick={() => {
                    onBulkStatusChange(selectedIds, 'trash');
                    setSelectedIds([]);
                  }}
                  className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Pindahkan ke Sampah</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onBulkStatusChange(selectedIds, 'draft');
                      setSelectedIds([]);
                    }}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Pulihkan Terpilih</span>
                  </button>
                  {canPermanentDeleteRole && (
                    <button
                      type="button"
                      onClick={() => setIsBulkDeleteModalOpen(true)}
                      className="px-2.5 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Hapus Permanen</span>
                    </button>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {paginatedVideos.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Tv className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Tidak Ada Video Ditemukan
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'Semua Kategori'
                ? 'Coba sesuaikan kata kunci pencarian atau filter kategori yang dipilih.'
                : 'Belum ada video di tab ini. Klik tombol di bawah untuk menambahkan video baru.'}
            </p>
            {!searchQuery && selectedCategory === 'Semua Kategori' && (
              <button
                type="button"
                onClick={onNewVideo}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Video Baru</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={isAllPageSelected}
                      onChange={handleSelectAllOnPage}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-3 min-w-[280px]">Video & Informasi</th>
                  <th className="py-4 px-3 min-w-[130px]">Kategori</th>
                  <th className="py-4 px-3 min-w-[140px]">Reporter / Author</th>
                  <th className="py-4 px-3 min-w-[120px]">Tanggal</th>
                  <th className="py-4 px-3 min-w-[110px]">Status</th>
                  <th className="py-4 px-3 min-w-[80px] text-right">Views</th>
                  <th className="py-4 px-4 w-28 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedVideos.map((video) => {
                  const isSelected = selectedIds.includes(video.id);
                  const isMenuOpen = openActionMenuId === video.id;
                  const thumb =
                    video.thumbnailSource === 'custom'
                      ? (video.customThumbnail || (video.thumbnailMediaId ? getMediaById(video.thumbnailMediaId)?.url : '') || getYouTubeThumbnailUrl(video.youtubeVideoId))
                      : getYouTubeThumbnailUrl(video.youtubeVideoId);

                  return (
                    <tr
                      key={video.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-red-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 align-top">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(video.id)}
                          className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer mt-1"
                        />
                      </td>

                      {/* Video Media & Title */}
                      <td className="py-4 px-3 align-top">
                        <div className="flex items-start gap-3">
                          {/* Thumbnail */}
                          <div
                            onClick={() => handleOpenPreview(video)}
                            className="relative w-24 h-14 sm:w-28 sm:h-16 rounded-lg overflow-hidden bg-slate-900 shrink-0 cursor-pointer group shadow-2xs"
                          >
                            <img
                              src={thumb}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <div className="w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xs">
                                <Play className="w-3 h-3 fill-current translate-x-0.5" />
                              </div>
                            </div>
                            {video.duration && (
                              <div className="absolute bottom-1 right-1 px-1.5 py-0.2 bg-black/80 text-white text-[9px] font-bold rounded">
                                {video.duration}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <h4
                              onClick={() => handleOpenPreview(video)}
                              className="text-xs sm:text-sm font-bold text-slate-900 hover:text-red-600 transition-colors leading-snug cursor-pointer line-clamp-2"
                            >
                              {video.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                              <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                YT: {video.youtubeVideoId}
                              </span>
                              <span>•</span>
                              <span className="truncate max-w-[180px]">
                                /video/{video.slug}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="py-4 px-3 align-top">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">
                          {video.category}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-4 px-3 align-top text-xs font-medium text-slate-600">
                        {video.author}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-3 align-top text-xs font-medium text-slate-500">
                        <div>
                          {video.publishedAt.split('T')[0] || '-'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {video.publishedAt.includes('T')
                            ? video.publishedAt.split('T')[1].slice(0, 5) + ' WIB'
                            : ''}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3 align-top">
                        {video.status === 'published' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-md border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Terbit
                          </span>
                        )}
                        {video.status === 'scheduled' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-md border border-blue-200">
                            <Clock className="w-3 h-3" />
                            Terjadwal
                          </span>
                        )}
                        {video.status === 'draft' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-md border border-amber-200">
                            <FileText className="w-3 h-3" />
                            Draft
                          </span>
                        )}
                        {video.status === 'trash' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-[11px] font-bold rounded-md border border-red-200">
                            <Trash2 className="w-3 h-3" />
                            Sampah
                          </span>
                        )}
                      </td>

                      {/* Views */}
                      <td className="py-4 px-3 align-top text-right font-bold text-xs text-slate-800">
                        {video.views.toLocaleString('id-ID')}
                      </td>

                      {/* Action Menu */}
                      <td className="py-4 px-4 align-top text-center relative">
                        <div className="flex items-center justify-center gap-1">
                          {/* Quick Edit */}
                          <button
                            type="button"
                            onClick={() => onEditVideo(video)}
                            title="Edit Video"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Quick Preview */}
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(video)}
                            title="Preview Video"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* More Options Dropdown Toggle */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenActionMenuId((prev) =>
                                  prev === video.id ? null : video.id
                                )
                              }
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                              <div
                                onMouseLeave={() => setOpenActionMenuId(null)}
                                className="absolute right-0 top-8 z-30 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs text-left animate-in fade-in zoom-in-95 duration-100"
                              >
                                {video.status === 'published' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      onNavigateToPublic(video.slug);
                                    }}
                                    className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer font-medium"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Lihat Halaman Publik</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionMenuId(null);
                                    onDuplicateVideo(video.id);
                                  }}
                                  className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Duplikat Video</span>
                                </button>

                                {canPublish && video.status === 'draft' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      onQuickStatusChange(video.id, 'published');
                                    }}
                                    className="w-full px-3.5 py-2 hover:bg-slate-50 text-emerald-600 flex items-center gap-2 cursor-pointer font-bold"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Terbitkan Sekarang</span>
                                  </button>
                                )}

                                {canPublish && video.status === 'published' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      onQuickStatusChange(video.id, 'draft');
                                    }}
                                    className="w-full px-3.5 py-2 hover:bg-slate-50 text-amber-600 flex items-center gap-2 cursor-pointer font-medium"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Jadikan Draft</span>
                                  </button>
                                )}

                                <div className="border-t border-slate-100 my-1" />

                                {video.status !== 'trash' ? (
                                  (video.status !== 'published' || canTrashPublished) && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenActionMenuId(null);
                                        onTrashVideo(video.id);
                                      }}
                                      className="w-full px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer font-medium"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Pindahkan ke Sampah</span>
                                    </button>
                                  )
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenActionMenuId(null);
                                        onRestoreVideo(video.id);
                                      }}
                                      className="w-full px-3.5 py-2 hover:bg-emerald-50 text-emerald-600 flex items-center gap-2 cursor-pointer font-bold"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                      <span>Pulihkan Video</span>
                                    </button>
                                    {canPermanentDeleteRole && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenActionMenuId(null);
                                          setDeleteConfirmTarget({
                                            id: video.id,
                                            title: video.title,
                                          });
                                        }}
                                        className="w-full px-3.5 py-2 hover:bg-red-50 text-red-700 flex items-center gap-2 cursor-pointer font-bold"
                                      >
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        <span>Hapus Permanen</span>
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer & Pagination */}
        {sortedVideos.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span>Menampilkan</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>
                dari total <strong>{sortedVideos.length}</strong> video
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold disabled:opacity-40 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Sebelumnya
              </button>
              <span className="px-3 py-1.5 font-bold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold disabled:opacity-40 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Video Preview Modal */}
      <VideoPreviewModal
        video={previewVideo}
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewVideo(null);
        }}
        onEdit={(vid) => onEditVideo(vid)}
        onOpenPublic={(slug) => onNavigateToPublic(slug)}
      />

      {/* Delete Permanently Confirmation Modal */}
      {deleteConfirmTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                Hapus Video Secara Permanen?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Video "
                <strong className="text-slate-800">
                  {deleteConfirmTarget.title}
                </strong>
                " akan dihapus dari sistem BATUTV.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onPermanentDelete(deleteConfirmTarget.id);
                  setDeleteConfirmTarget(null);
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Permanently Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                Hapus {selectedIds.length} Video Secara Permanen?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seluruh video yang terpilih akan dihapus sepenuhnya dari database redaksi dan tidak dapat dipulihkan.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onBulkPermanentDelete(selectedIds);
                  setSelectedIds([]);
                  setIsBulkDeleteModalOpen(false);
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Ya, Hapus Permanen ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
