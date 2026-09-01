import React from 'react';
import {
  AlertTriangle,
  X,
  Trash2,
  XCircle,
  FileText,
  Video,
  Layers,
  ShieldAlert,
  UserCheck,
  Shield,
} from 'lucide-react';
import { AdminAuthor } from '../../../types/admin';
import { calculateAuthorUsage, getAuthorLinkedUser } from '../../../data/authorAdminStore';

interface AuthorDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  author: AdminAuthor | null;
  onConfirmDelete: (id: string) => void;
  onDeactivate: (id: string) => void;
}

export const AuthorDeleteModal: React.FC<AuthorDeleteModalProps> = ({
  isOpen,
  onClose,
  author,
  onConfirmDelete,
  onDeactivate,
}) => {
  if (!isOpen || !author) return null;

  const usage = calculateAuthorUsage(author);
  const linkedCMSUser = getAuthorLinkedUser(author.id);
  const hasContentUsage = usage.totalCount > 0;
  const isProtected = hasContentUsage || Boolean(linkedCMSUser);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md my-auto overflow-hidden flex flex-col">
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isProtected
              ? 'bg-amber-50/80 border-amber-200'
              : 'bg-red-50/80 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isProtected
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {isProtected ? (
                <ShieldAlert className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                {isProtected
                  ? 'Proteksi Penghapusan Penulis'
                  : 'Hapus Penulis Permanen'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {linkedCMSUser
                  ? 'Penulis Terhubung Akun Login CMS'
                  : hasContentUsage
                  ? 'Penulis Terikat dengan Konten'
                  : 'Konfirmasi Penghapusan Data'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          {/* Author Badge */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-200 shrink-0">
              {author.photoUrl ? (
                <img
                  src={author.photoUrl}
                  alt={author.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-bold">
                  {author.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-slate-900 truncate">{author.name}</h4>
              <p className="text-[11px] text-slate-500 truncate">
                {author.position} • {author.email}
              </p>
            </div>
          </div>

          {/* Conditional message based on protection */}
          {linkedCMSUser ? (
            <div className="space-y-3">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold">
                  <UserCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Terhubung dengan Akun CMS Aktif</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-amber-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">@{linkedCMSUser.username}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700 uppercase">
                      Role: {linkedCMSUser.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Status Akun: <span className="capitalize font-semibold">{linkedCMSUser.status}</span>
                  </p>
                </div>
                <p className="text-[11.5px] text-amber-900 leading-relaxed">
                  Berdasarkan arsitektur <strong>Author First</strong>, Master Data Penulis yang terhubung ke akun login tidak boleh dihapus secara langsung.
                </p>
              </div>

              <p className="text-slate-600 leading-relaxed">
                Silakan putuskan relasi atau hapus akun login CMS pengguna <strong>@{linkedCMSUser.username}</strong> di menu <strong>Pengaturan → Pengguna</strong> terlebih dahulu jika ingin menghapus master data ini.
              </p>
              <p className="text-slate-600 leading-relaxed font-semibold">
                Alternatif lain: Anda dapat memilih <strong>Nonaktifkan Penulis</strong>.
              </p>
            </div>
          ) : hasContentUsage ? (
            <div className="space-y-3">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-2">
                <p className="font-bold text-xs">
                  Penulis masih digunakan oleh {usage.totalCount} konten aktif:
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800">
                    <FileText className="w-3.5 h-3.5 text-red-500" />
                    <span>{usage.newsCount} Berita</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800">
                    <Video className="w-3.5 h-3.5 text-blue-500" />
                    <span>{usage.videoCount} Video</span>
                  </span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed">
                Untuk menjaga integritas arsip publikasi dan riwayat jurnalisme portal, penulis yang telah memiliki karya artikel/video tidak boleh dihapus secara permanen.
              </p>
              <p className="text-slate-600 leading-relaxed font-semibold">
                Anda dapat memilih <strong>Nonaktifkan Penulis</strong> agar namanya tidak lagi muncul saat membuat berita atau video baru.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="leading-relaxed">
                Apakah Anda yakin ingin menghapus data penulis <strong>{author.name}</strong> secara permanen?
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 leading-snug">
                Penulis ini memiliki <strong>0 konten terhubung</strong> dan <strong>tidak terhubung ke akun CMS</strong>. Tindakan ini tidak dapat dibatalkan dan data akan dihapus dari sistem.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>

          {isProtected ? (
            <button
              type="button"
              onClick={() => {
                onDeactivate(author.id);
                onClose();
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Nonaktifkan Penulis</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onConfirmDelete(author.id);
                onClose();
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Permanen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
