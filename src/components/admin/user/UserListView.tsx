import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Activity,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserX,
  ChevronLeft,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Lock,
  Unlock,
  LogOut,
} from 'lucide-react';
import { CMSUser, UserRole, UserStatus } from '../../../types/user';
import { ROLE_PERMISSIONS_MATRIX } from '../../../data/userAdminStore';

interface UserListViewProps {
  users: CMSUser[];
  onViewDetail: (user: CMSUser) => void;
  onEdit: (user: CMSUser) => void;
  onDelete: (user: CMSUser) => void;
  onResetPassword: (user: CMSUser) => void;
  onOpenMonitoring: (user: CMSUser) => void;
  onToggleSuspend: (userId: string) => void;
  onToggleForcePassword: (userId: string) => void;
  onRevokeSessions: (userId: string) => void;
}

export const UserListView: React.FC<UserListViewProps> = ({
  users,
  onViewDetail,
  onEdit,
  onDelete,
  onResetPassword,
  onOpenMonitoring,
  onToggleSuspend,
  onToggleForcePassword,
  onRevokeSessions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [authorRelationFilter, setAuthorRelationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'created_desc' | 'created_asc' | 'last_login'>('created_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Active Action Dropdown index
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = () => setActiveDropdownId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter & Search Logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        user.fullName.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        (user.authorName && user.authorName.toLowerCase().includes(q));

      // 2. Role Filter
      const matchRole = roleFilter === 'all' || user.role === roleFilter;

      // 3. Status Filter
      const matchStatus = statusFilter === 'all' || user.status === statusFilter;

      // 4. Author Relation Filter
      const matchAuthor =
        authorRelationFilter === 'all' ||
        (authorRelationFilter === 'linked' && Boolean(user.authorId)) ||
        (authorRelationFilter === 'unlinked' && !user.authorId);

      return matchSearch && matchRole && matchStatus && matchAuthor;
    });
  }, [users, searchQuery, roleFilter, statusFilter, authorRelationFilter]);

  // Sort Logic
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      if (sortBy === 'name_asc') {
        return a.fullName.localeCompare(b.fullName);
      }
      if (sortBy === 'name_desc') {
        return b.fullName.localeCompare(a.fullName);
      }
      if (sortBy === 'created_asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'last_login') {
        const timeA = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
        const timeB = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
        return timeB - timeA;
      }
      // default: created_desc
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredUsers, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(start, start + itemsPerPage);
  }, [sortedUsers, currentPage]);

  const resetFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
    setAuthorRelationFilter('all');
    setSortBy('created_desc');
    setCurrentPage(1);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      {/* Filters & Search Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/40 space-y-3.5">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Live Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama, username, email, atau penulis..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 placeholder:text-slate-400 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Selectors Grid */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter Peran Role"
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 shadow-xs capitalize"
            >
              <option value="all">Semua Peran (Role)</option>
              <option value="admin">Administrator</option>
              <option value="redaksi">Redaksi</option>
              <option value="editor">Editor</option>
              <option value="reporter">Reporter</option>
              <option value="kontributor">Kontributor</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter Status Akun"
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 shadow-xs"
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="ditangguhkan">Ditangguhkan</option>
            </select>

            {/* Relasi Penulis Filter */}
            <select
              value={authorRelationFilter}
              onChange={(e) => {
                setAuthorRelationFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter Relasi Penulis"
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 shadow-xs"
            >
              <option value="all">Semua Relasi</option>
              <option value="linked">Terhubung ke Penulis</option>
              <option value="unlinked">Belum Terhubung</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Urutkan Daftar"
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 shadow-xs"
            >
              <option value="created_desc">Tanggal Dibuat (Terbaru)</option>
              <option value="created_asc">Tanggal Dibuat (Terlama)</option>
              <option value="last_login">Login Terakhir (Terbaru)</option>
              <option value="name_asc">Nama (A - Z)</option>
              <option value="name_desc">Nama (Z - A)</option>
            </select>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || authorRelationFilter !== 'all') && (
          <div className="flex items-center gap-2 pt-1 flex-wrap text-xs text-slate-600">
            <span className="font-semibold text-slate-500">Filter Aktif:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                Pencarian: "{searchQuery}"
              </span>
            )}
            {roleFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium capitalize">
                Role: {roleFilter}
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium capitalize">
                Status: {statusFilter}
              </span>
            )}
            {authorRelationFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                Relasi: {authorRelationFilter === 'linked' ? 'Terhubung Penulis' : 'Belum Terhubung'}
              </span>
            )}
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-red-600 hover:text-red-700 font-semibold underline ml-1"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200/90 text-[11.5px] uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Pengguna CMS</th>
              <th className="py-3.5 px-4">Peran (Role)</th>
              <th className="py-3.5 px-4">Status Akun</th>
              <th className="py-3.5 px-4">Relasi Penulis</th>
              <th className="py-3.5 px-4">Login Terakhir</th>
              <th className="py-3.5 px-4 text-right pr-6">Aksi Kontrol</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 px-4 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center justify-center text-slate-400">
                    <UserX className="w-10 h-10 mb-2.5 text-slate-300 stroke-[1.5]" />
                    <p className="text-sm font-bold text-slate-700">Tidak ada pengguna ditemukan</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Coba sesuaikan kata kunci pencarian atau bersihkan filter yang aktif.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-3.5 px-4 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 rounded-lg"
                    >
                      Reset Filter
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => {
                const roleInfo = ROLE_PERMISSIONS_MATRIX[user.role];
                const isDropdownOpen = activeDropdownId === user.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* User Identity Column */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                          {user.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onViewDetail(user)}
                            className="font-bold text-slate-900 hover:text-red-600 text-xs sm:text-[13px] truncate block text-left transition-colors"
                          >
                            {user.fullName}
                          </button>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono text-slate-600">@{user.username}</span>
                            <span className="text-slate-300">•</span>
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-md border ${roleInfo?.badgeColor}`}
                      >
                        {roleInfo?.name || user.role}
                      </span>
                    </td>

                    {/* Status Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                          user.status === 'aktif'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : user.status === 'ditangguhkan'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'aktif'
                              ? 'bg-emerald-500'
                              : user.status === 'ditangguhkan'
                              ? 'bg-red-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        {user.status === 'aktif'
                          ? 'Aktif'
                          : user.status === 'ditangguhkan'
                          ? 'Ditangguhkan'
                          : 'Nonaktif'}
                      </span>
                      {user.forcePasswordChange && (
                        <span
                          title="Wajib ganti kata sandi pada login berikutnya"
                          className="ml-1.5 inline-block text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 font-bold rounded"
                        >
                          Ganti Pass
                        </span>
                      )}
                    </td>

                    {/* Relasi Penulis Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {user.authorId ? (
                        <div className="flex items-center gap-1.5 text-blue-700">
                          <UserCheck className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="font-semibold text-slate-800 hover:text-blue-700 text-xs">
                            {user.authorName || 'Penulis Terhubung'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">— Belum Ditautkan —</span>
                      )}
                    </td>

                    {/* Login Terakhir Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      {user.lastLogin ? (
                        <div>
                          <p className="font-medium text-slate-800">
                            {new Date(user.lastLogin).toLocaleDateString('id-ID', {
                              dateStyle: 'medium',
                            })}
                          </p>
                          <p className="text-[10.5px] text-slate-400">
                            {new Date(user.lastLogin).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            WIB
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Belum pernah login</span>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap relative">
                      <div className="inline-flex items-center gap-1 justify-end">
                        {/* Quick View Button */}
                        <button
                          type="button"
                          onClick={() => onViewDetail(user)}
                          title="Lihat Detail Profil Akun"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Quick Edit Button */}
                        <button
                          type="button"
                          onClick={() => onEdit(user)}
                          title="Edit Pengguna"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu Trigger */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(isDropdownOpen ? null : user.id);
                            }}
                            title="Menu Tindakan Lengkap"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Action Dropdown Menu */}
                          {isDropdownOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-8 z-30 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-left text-xs animate-fadeIn"
                            >
                              <div className="px-3 py-1.5 border-b border-slate-100 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                                Kontrol Akun: @{user.username}
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  onViewDetail(user);
                                }}
                                className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                <span>Lihat Profil Lengkap</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  onEdit(user);
                                }}
                                className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Edit className="w-3.5 h-3.5 text-slate-400" />
                                <span>Edit Akun &amp; Role</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  onResetPassword(user);
                                }}
                                className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                                <span>Reset Kata Sandi</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  onOpenMonitoring(user);
                                }}
                                className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Audit &amp; Monitoring Sesi</span>
                              </button>

                              <div className="my-1 border-t border-slate-100" />

                              {/* Toggle Suspend */}
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  onToggleSuspend(user.id);
                                }}
                                className={`w-full px-3 py-2 text-left flex items-center gap-2 ${
                                  user.status === 'ditangguhkan'
                                    ? 'text-emerald-700 hover:bg-emerald-50'
                                    : 'text-amber-700 hover:bg-amber-50'
                                }`}
                              >
                                {user.status === 'ditangguhkan' ? (
                                  <>
                                    <Unlock className="w-3.5 h-3.5" />
                                    <span>Aktifkan Kembali Akun</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Tangguhkan Akun (Suspend)</span>
                                  </>
                                )}
                              </button>

                              {/* Toggle Force Password Change */}
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  onToggleForcePassword(user.id);
                                }}
                                className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                                <span>
                                  {user.forcePasswordChange
                                    ? 'Batalkan Paksa Ganti Pass'
                                    : 'Paksa Ganti Password'}
                                </span>
                              </button>

                              {/* Revoke Sessions */}
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  onRevokeSessions(user.id);
                                }}
                                className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                                <span>Logout Semua Sesi</span>
                              </button>

                              <div className="my-1 border-t border-slate-100" />

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  onDelete(user);
                                }}
                                className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus Pengguna</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {sortedUsers.length > 0 && (
        <div className="px-4 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Menampilkan <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> -{' '}
            <span className="font-bold text-slate-900">
              {Math.min(currentPage * itemsPerPage, sortedUsers.length)}
            </span>{' '}
            dari <span className="font-bold text-slate-900">{sortedUsers.length}</span> pengguna
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                  currentPage === pageNum
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
