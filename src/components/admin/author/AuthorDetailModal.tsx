import React from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  FileText,
  Video,
  Layers,
  Award,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Edit,
  CheckCircle2,
  XCircle,
  Hash,
} from 'lucide-react';
import { AdminAuthor, AuthorPosition } from '../../../types/admin';
import { calculateAuthorUsage } from '../../../data/authorAdminStore';

interface AuthorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  author: AdminAuthor | null;
  onEdit: (author: AdminAuthor) => void;
}

export const AuthorDetailModal: React.FC<AuthorDetailModalProps> = ({
  isOpen,
  onClose,
  author,
  onEdit,
}) => {
  if (!isOpen || !author) return null;

  const usage = calculateAuthorUsage(author);

  const getPositionBadge = (position: AuthorPosition) => {
    switch (position) {
      case 'Reporter':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <User className="w-3.5 h-3.5 text-blue-500" />
            <span>Reporter</span>
          </span>
        );
      case 'Editor':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            <Award className="w-3.5 h-3.5 text-purple-500" />
            <span>Editor</span>
          </span>
        );
      case 'Redaksi':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
            <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
            <span>Dewan Redaksi</span>
          </span>
        );
      case 'Kontributor':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Kontributor Lepas</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            <span>{position}</span>
          </span>
        );
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Detail Master Penulis
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">ID: {author.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(author);
              }}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          {/* Profile Card Summary */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md bg-slate-200 shrink-0">
              {author.photoUrl ? (
                <img
                  src={author.photoUrl}
                  alt={author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <User className="w-10 h-10" />
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="space-y-2 flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-slate-900 leading-tight">
                    {author.name}
                  </h2>
                  <div className="text-[11px] text-slate-400 font-mono">
                    /penulis/{author.slug}
                  </div>
                </div>

                <div>
                  {author.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Aktif</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-500 border border-slate-200">
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Nonaktif</span>
                    </span>
                  )}
                </div>
              </div>

              <div>{getPositionBadge(author.position)}</div>

              {/* Bio */}
              {author.bio && (
                <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-200/60">
                  {author.bio}
                </p>
              )}
            </div>
          </div>

          {/* Metrics Grid (Usage Count) */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-red-50/50 border border-red-100 rounded-2xl text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-red-600 font-bold text-[11px]">
                <FileText className="w-3.5 h-3.5" />
                <span>Berita</span>
              </div>
              <div className="text-2xl font-black text-red-700">{usage.newsCount}</div>
              <div className="text-[10px] text-slate-500">Artikel Terbit</div>
            </div>

            <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-blue-600 font-bold text-[11px]">
                <Video className="w-3.5 h-3.5" />
                <span>Video</span>
              </div>
              <div className="text-2xl font-black text-blue-700">{usage.videoCount}</div>
              <div className="text-[10px] text-slate-500">Liputan Tayang</div>
            </div>

            <div className="p-3.5 bg-slate-100/80 border border-slate-200 rounded-2xl text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-slate-700 font-bold text-[11px]">
                <Layers className="w-3.5 h-3.5" />
                <span>Total Konten</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{usage.totalCount}</div>
              <div className="text-[10px] text-slate-500">Karya Terpublikasi</div>
            </div>
          </div>

          {/* Contact Details & Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-2xl text-xs">
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Email Redaksi
                </span>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a
                    href={`mailto:${author.email}`}
                    className="hover:text-red-600 hover:underline"
                  >
                    {author.email}
                  </a>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nomor Kontak
                </span>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{author.phone || 'Belum diisi'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tanggal Didaftarkan
                </span>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDateTime(author.createdAt)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Terakhir Diperbarui
                </span>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDateTime(author.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Metadata Box */}
          {(author.seoTitle || author.metaDescription) && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>SEO Metadata</span>
              </h4>
              <div className="space-y-1.5 text-xs">
                {author.seoTitle && (
                  <div>
                    <span className="font-bold text-slate-700">SEO Title: </span>
                    <span className="text-slate-600">{author.seoTitle}</span>
                  </div>
                )}
                {author.metaDescription && (
                  <div>
                    <span className="font-bold text-slate-700">Meta Description: </span>
                    <span className="text-slate-600">{author.metaDescription}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
