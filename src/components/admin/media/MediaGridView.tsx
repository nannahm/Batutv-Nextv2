import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Image as ImageIcon,
  FileText,
  Copy,
  Check,
  Trash2,
  Maximize2,
  Calendar,
  Layers,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Info,
  RefreshCw,
} from 'lucide-react';
import { AdminMedia, MediaType } from '../../../types/admin';
import { formatBytes, formatDimensions, formatMediaDate } from '../../../data/mediaAdminStore';

interface MediaGridViewProps {
  mediaList: AdminMedia[];
  onSelectMedia: (media: AdminMedia) => void;
  onRequestDelete: (media: AdminMedia) => void;
  onOpenUpload: () => void;
}

type FilterType = 'all' | 'image' | 'document';
type FilterUsage = 'all' | 'used' | 'unused';
type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc';

export const MediaGridView: React.FC<MediaGridViewProps> = ({
  mediaList,
  onSelectMedia,
  onRequestDelete,
  onOpenUpload,
}) => {
  // Filters and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterUsage, setFilterUsage] = useState<FilterUsage>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Clipboard copy state tracking
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleQuickCopy = (e: React.MouseEvent, media: AdminMedia) => {
    e.stopPropagation();
    navigator.clipboard.writeText(media.url);
    setCopiedId(media.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter & sort logic
  const filteredMedia = useMemo(() => {
    return mediaList
      .filter((media) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchFilename = (media.filename || '').toLowerCase().includes(q);
          const matchAlt = (media.altText || '').toLowerCase().includes(q);
          const matchCaption = (media.caption || '').toLowerCase().includes(q);
          const matchDesc = (media.description || '').toLowerCase().includes(q);
          if (!matchFilename && !matchAlt && !matchCaption && !matchDesc) {
            return false;
          }
        }

        // Type filter
        if (filterType !== 'all') {
          if (media.mediaType !== filterType) return false;
        }

        // Usage filter
        if (filterUsage === 'used' && (media.usageCount || 0) === 0) return false;
        if (filterUsage === 'unused' && (media.usageCount || 0) > 0) return false;

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'name-asc':
            return a.filename.localeCompare(b.filename);
          case 'name-desc':
            return b.filename.localeCompare(a.filename);
          case 'size-desc':
            return (b.fileSize || 0) - (a.fileSize || 0);
          case 'size-asc':
            return (a.fileSize || 0) - (b.fileSize || 0);
          default:
            return 0;
        }
      });
  }, [mediaList, searchQuery, filterType, filterUsage, sortBy]);

  return (
    <div className="space-y-5">
      {/* Top Bar: Search, Filters, Sorters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama file, alt text, atau keterangan foto..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none placeholder:text-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Jenis */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-200 rounded-xl">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterType('image')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filterType === 'image'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Gambar
              </button>
              <button
                type="button"
                onClick={() => setFilterType('document')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filterType === 'document'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Dokumen
              </button>
            </div>

            {/* Filter Status Penggunaan */}
            <select
              value={filterUsage}
              onChange={(e) => setFilterUsage(e.target.value as FilterUsage)}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="used">Digunakan Konten</option>
              <option value="unused">Belum Digunakan</option>
            </select>

            {/* Sort Options */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 border border-slate-300 rounded-xl">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs font-medium text-slate-700 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none cursor-pointer"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="name-asc">Nama A-Z</option>
                <option value="name-desc">Nama Z-A</option>
                <option value="size-desc">Ukuran Terbesar</option>
                <option value="size-asc">Ukuran Terkecil</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter & Active Filter Tags */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <span>
            Menampilkan <strong className="text-slate-800 font-bold">{filteredMedia.length}</strong> dari{' '}
            {mediaList.length} media
          </span>

          {(searchQuery || filterType !== 'all' || filterUsage !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterUsage('all');
              }}
              className="text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Grid Display: Responsive 2 to 6 Columns */}
      {filteredMedia.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
          {filteredMedia.map((media) => {
            const isUsed = (media.usageCount || 0) > 0;
            const isCopied = copiedId === media.id;

            return (
              <div
                key={media.id}
                onClick={() => onSelectMedia(media)}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-square w-full bg-slate-900 overflow-hidden">
                  {media.mediaType === 'image' ? (
                    <img
                      src={media.sizes?.thumbnail || media.url}
                      alt={media.altText || media.filename}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-300 gap-1 p-2">
                      <FileText className="w-10 h-10 text-slate-400" />
                      <span className="text-[10px] font-mono uppercase bg-slate-700 px-1.5 py-0.5 rounded">
                        {media.extension}
                      </span>
                    </div>
                  )}

                  {/* Top Badge Overlay */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span className="px-1.5 py-0.5 bg-black/75 backdrop-blur-sm rounded text-[9px] font-mono font-bold text-white uppercase tracking-wider">
                      {media.extension}
                    </span>

                    {isUsed && (
                      <span className="px-1.5 py-0.5 bg-emerald-600/90 backdrop-blur-sm rounded text-[9px] font-extrabold text-white flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>{media.usageCount} Konten</span>
                      </span>
                    )}
                  </div>

                  {/* Quick Action Overlay on Hover */}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      onClick={(e) => handleQuickCopy(e, media)}
                      title="Salin URL Gambar"
                      className={`p-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestDelete(media);
                      }}
                      title={isUsed ? 'Lihat Proteksi Hapus' : 'Hapus Media'}
                      className="p-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-all shadow-md cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Meta Description */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2 bg-white">
                  <div>
                    <h4
                      title={media.filename}
                      className="text-xs font-bold text-slate-800 group-hover:text-red-600 truncate leading-snug"
                    >
                      {media.filename}
                    </h4>
                    <p
                      title={media.altText}
                      className="text-[11px] text-slate-400 truncate mt-0.5"
                    >
                      {media.altText || 'Tanpa alt text'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{formatDimensions(media.width, media.height)}</span>
                    <span className="font-semibold text-slate-600">{formatBytes(media.fileSize)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 opacity-50" />
          </div>
          <div className="max-w-md space-y-1">
            <h4 className="text-sm font-bold text-slate-800">
              Tidak Ada Media yang Sesuai
            </h4>
            <p className="text-xs text-slate-500">
              {searchQuery
                ? `Tidak ditemukan media dengan kata kunci "${searchQuery}". Coba gunakan kata kunci lain.`
                : 'Belum ada media pada kategori filter yang dipilih.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenUpload}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Unggah Media Baru</span>
          </button>
        </div>
      )}
    </div>
  );
};
