import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  Video,
  User,
  Mail,
  Phone,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  Sparkles,
  AlertCircle,
  UserCheck,
  UserPlus,
  Shield,
  KeyRound,
} from 'lucide-react';
import { AdminAuthor, AuthorPosition, AuthorStatus } from '../../../types/admin';
import { getAuthorLinkedUser } from '../../../data/authorAdminStore';

interface AuthorListViewProps {
  authors: AdminAuthor[];
  onOpenDetail: (author: AdminAuthor) => void;
  onOpenEdit: (author: AdminAuthor) => void;
  onOpenDelete: (author: AdminAuthor) => void;
  onToggleStatus: (id: string, currentStatus: AuthorStatus) => void;
  onCreateCMSAccount?: (author: AdminAuthor) => void;
}

type SortOption =
  | 'name_asc'
  | 'name_desc'
  | 'newest'
  | 'oldest'
  | 'news_count'
  | 'video_count';

export const AuthorListView: React.FC<AuthorListViewProps> = ({
  authors,
  onOpenDetail,
  onOpenEdit,
  onOpenDelete,
  onToggleStatus,
  onCreateCMSAccount,
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [cmsAccountFilter, setCmsAccountFilter] = useState<string>('all');

  // Sort state
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter & Search Logic
  const filteredAuthors = useMemo(() => {
    return authors.filter((author) => {
      // 1. Search Query (Nama, Email, Jabatan, Slug)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = author.name.toLowerCase().includes(q);
        const matchEmail = author.email.toLowerCase().includes(q);
        const matchPosition = author.position.toLowerCase().includes(q);
        const matchSlug = author.slug.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPosition && !matchSlug) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== 'all' && author.status !== statusFilter) {
        return false;
      }

      // 3. Position Filter
      if (positionFilter !== 'all' && author.position !== positionFilter) {
        return false;
      }

      // 4. CMS Account Filter
      if (cmsAccountFilter !== 'all') {
        const linked = getAuthorLinkedUser(author.id);
        if (cmsAccountFilter === 'linked' && !linked) return false;
        if (cmsAccountFilter === 'unlinked' && linked) return false;
      }

      return true;
    });
  }, [authors, searchQuery, statusFilter, positionFilter, cmsAccountFilter]);

  // Sort Logic
  const sortedAuthors = useMemo(() => {
    const list = [...filteredAuthors];
    switch (sortBy) {
      case 'name_asc':
        return list.sort((a, b) => a.name.localeCompare(b.name, 'id'));
      case 'name_desc':
        return list.sort((a, b) => b.name.localeCompare(a.name, 'id'));
      case 'newest':
        return list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return list.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'news_count':
        return list.sort((a, b) => (b.newsCount || 0) - (a.newsCount || 0));
      case 'video_count':
        return list.sort((a, b) => (b.videoCount || 0) - (a.videoCount || 0));
      default:
        return list;
    }
  }, [filteredAuthors, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedAuthors.length / itemsPerPage) || 1;
  const paginatedAuthors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedAuthors.slice(start, start + itemsPerPage);
  }, [sortedAuthors, currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset pagination when filters change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handlePositionFilterChange = (val: string) => {
    setPositionFilter(val);
    setCurrentPage(1);
  };

  const handleCMSFilterChange = (val: string) => {
    setCmsAccountFilter(val);
    setCurrentPage(1);
  };

  // Helpers for position badge styling
  const getPositionBadge = (position: AuthorPosition) => {
    switch (position) {
      case 'Reporter':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <User className="w-3 h-3 text-blue-500" />
            <span>Reporter</span>
          </span>
        );
      case 'Editor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            <Award className="w-3 h-3 text-purple-500" />
            <span>Editor</span>
          </span>
        );
      case 'Redaksi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
            <ShieldCheck className="w-3 h-3 text-red-500" />
            <span>Redaksi</span>
          </span>
        );
      case 'Kontributor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>Kontributor</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            <span>{position}</span>
          </span>
        );
    }
  };

  // Format date
  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. FILTER, SEARCH & SORT CONTROLS BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Cari nama, email, atau jabatan..."
              className="w-full pl-9 pr-4 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <span className="text-[11px] font-bold text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>

            {/* Position Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <span className="text-[11px] font-bold text-slate-500">Jabatan:</span>
              <select
                value={positionFilter}
                onChange={(e) => handlePositionFilterChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Jabatan</option>
                <option value="Reporter">Reporter</option>
                <option value="Editor">Editor</option>
                <option value="Redaksi">Redaksi</option>
                <option value="Kontributor">Kontributor</option>
              </select>
            </div>

            {/* CMS Account Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <span className="text-[11px] font-bold text-slate-500">Akun CMS:</span>
              <select
                value={cmsAccountFilter}
                onChange={(e) => handleCMSFilterChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Relasi</option>
                <option value="linked">Terhubung CMS</option>
                <option value="unlinked">Belum Ada Akun</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="name_asc">Nama A–Z</option>
                <option value="name_desc">Nama Z–A</option>
                <option value="news_count">Berita Terbanyak</option>
                <option value="video_count">Video Terbanyak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Indicator / Results Count */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2 px-1">
          <span>
            Menampilkan <strong>{filteredAuthors.length}</strong> dari{' '}
            <strong>{authors.length}</strong> penulis terdaftar
          </span>
          {(searchQuery || statusFilter !== 'all' || positionFilter !== 'all' || cmsAccountFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPositionFilter('all');
                setCmsAccountFilter('all');
                setCurrentPage(1);
              }}
              className="text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* 2. TABLE VIEW (DESKTOP) & CARDS VIEW (MOBILE) */}
      {paginatedAuthors.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Penulis tidak ditemukan.
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tidak ada data penulis yang sesuai dengan kata kunci pencarian atau filter yang dipilih. Silakan coba atur ulang filter Anda.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setPositionFilter('all');
              setCmsAccountFilter('all');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">Foto</th>
                    <th className="py-3 px-4">Nama &amp; Slug</th>
                    <th className="py-3 px-4">Jabatan</th>
                    <th className="py-3 px-4">Kontak (Email / Telp)</th>
                    <th className="py-3 px-4">Akun Login CMS</th>
                    <th className="py-3 px-4 text-center">Berita</th>
                    <th className="py-3 px-4 text-center">Video</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Terdaftar</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {paginatedAuthors.map((author) => {
                    const linkedUser = getAuthorLinkedUser(author.id);

                    return (
                      <tr
                        key={author.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* 1. Foto Avatar */}
                        <td className="py-3 px-4 text-center">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 mx-auto bg-slate-100 shrink-0">
                            {author.photoUrl ? (
                              <img
                                src={author.photoUrl}
                                alt={author.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <User className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 2. Nama & Slug */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <button
                              type="button"
                              onClick={() => onOpenDetail(author)}
                              className="font-bold text-slate-900 hover:text-red-600 transition-colors text-left block text-sm"
                            >
                              {author.name}
                            </button>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                              <span>/penulis/{author.slug}</span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Jabatan */}
                        <td className="py-3 px-4">
                          {getPositionBadge(author.position)}
                        </td>

                        {/* 4. Email & Phone */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[180px]">
                                {author.email}
                              </span>
                            </div>
                            {author.phone && (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{author.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 5. Akun CMS (Author First Architecture) */}
                        <td className="py-3 px-4">
                          {linkedUser ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span>Terhubung CMS</span>
                              </span>
                              <div className="text-[11.5px] font-mono text-slate-800 font-semibold flex items-center gap-1">
                                <span>@{linkedUser.username}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-sans">
                                  ({linkedUser.role})
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                Belum Ada Akun
                              </span>
                              {onCreateCMSAccount && (
                                <button
                                  type="button"
                                  onClick={() => onCreateCMSAccount(author)}
                                  className="block text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                                >
                                  + Buat Akun CMS
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 6. Berita Count */}
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-black">
                            <FileText className="w-3 h-3 text-red-500" />
                            <span>{author.newsCount || 0}</span>
                          </span>
                        </td>

                        {/* 7. Video Count */}
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-black">
                            <Video className="w-3 h-3 text-blue-500" />
                            <span>{author.videoCount || 0}</span>
                          </span>
                        </td>

                        {/* 8. Status */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => onToggleStatus(author.id, author.status)}
                            title={`Klik untuk ubah menjadi ${
                              author.status === 'active' ? 'Nonaktif' : 'Aktif'
                            }`}
                            className="cursor-pointer inline-block"
                          >
                            {author.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span>Aktif</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition-colors">
                                <XCircle className="w-3 h-3 text-slate-400" />
                                <span>Nonaktif</span>
                              </span>
                            )}
                          </button>
                        </td>

                        {/* 9. Tanggal Dibuat */}
                        <td className="py-3 px-4 text-[11px] text-slate-500">
                          {formatDate(author.createdAt)}
                        </td>

                        {/* 10. Aksi */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Buat Akun CMS if unlinked */}
                            {!linkedUser && onCreateCMSAccount && (
                              <button
                                type="button"
                                onClick={() => onCreateCMSAccount(author)}
                                title="Buat Akun CMS untuk Penulis Ini"
                                className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <UserPlus className="w-4 h-4" />
                              </button>
                            )}

                            {/* Detail */}
                            <button
                              type="button"
                              onClick={() => onOpenDetail(author)}
                              title="Lihat Detail Profil & Konten"
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => onOpenEdit(author)}
                              title="Edit Data Penulis"
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => onOpenDelete(author)}
                              title="Hapus Penulis"
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARDS (RESPONSIVE VIEW) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-3">
            {paginatedAuthors.map((author) => {
              const linkedUser = getAuthorLinkedUser(author.id);

              return (
                <div
                  key={author.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                      {author.photoUrl ? (
                        <img
                          src={author.photoUrl}
                          alt={author.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          onClick={() => onOpenDetail(author)}
                          className="text-sm font-bold text-slate-900 truncate hover:text-red-600 cursor-pointer"
                        >
                          {author.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onToggleStatus(author.id, author.status)}
                          className="cursor-pointer shrink-0"
                        >
                          {author.status === 'active' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Aktif
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-500 border border-slate-200">
                              Nonaktif
                            </span>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPositionBadge(author.position)}
                      </div>
                    </div>
                  </div>

                  {/* Email & CMS Status */}
                  <div className="text-xs text-slate-600 space-y-1.5 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{author.email}</span>
                    </div>
                    {author.phone && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{author.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400 font-medium">Akun CMS:</span>
                      {linkedUser ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          @{linkedUser.username} ({linkedUser.role})
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Belum Ada Akun
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Usage Counts & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-bold">
                        <FileText className="w-3 h-3 text-red-500" />
                        <span>{author.newsCount || 0}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-bold">
                        <Video className="w-3 h-3 text-blue-500" />
                        <span>{author.videoCount || 0}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {!linkedUser && onCreateCMSAccount && (
                        <button
                          type="button"
                          onClick={() => onCreateCMSAccount(author)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 bg-emerald-50 rounded-lg"
                          title="Buat Akun CMS"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenDetail(author)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                        title="Detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenEdit(author)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenDelete(author)}
                        className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 rounded-lg"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-medium">
                Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (Total{' '}
                {sortedAuthors.length} Penulis)
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      currentPage === page
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
