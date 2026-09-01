import React from 'react';
import { X, ShieldCheck, Check, Ban, FileText, Video, Users, Settings, Database, Sliders } from 'lucide-react';
import { ROLE_PERMISSIONS_MATRIX } from '../../../data/userAdminStore';
import { UserRole } from '../../../types/user';

interface RolePermissionMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RolePermissionMatrixModal: React.FC<RolePermissionMatrixModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const roles: UserRole[] = ['admin', 'redaksi', 'editor', 'reporter', 'kontributor'];

  const matrixFeatures = [
    {
      category: 'KONTEN BERITA & ARTIKEL',
      items: [
        { name: 'Buat Draft Artikel Baru', admin: true, redaksi: true, editor: true, reporter: true, kontributor: true },
        { name: 'Edit Naskah Milik Sendiri', admin: true, redaksi: true, editor: true, reporter: true, kontributor: 'Hanya saat draft' },
        { name: 'Edit Naskah Lintas Wartawan', admin: true, redaksi: true, editor: true, reporter: false, kontributor: false },
        { name: 'Review & Fact Checking', admin: true, redaksi: true, editor: true, reporter: false, kontributor: false },
        { name: 'Menerbitkan (Publish) Berita', admin: true, redaksi: true, editor: true, reporter: false, kontributor: false },
        { name: 'Tarik dari Terbit (Unpublish / Sampah)', admin: true, redaksi: true, editor: true, reporter: false, kontributor: false },
        { name: 'Set Headline & Hero Carousel', admin: true, redaksi: true, editor: false, reporter: false, kontributor: false },
      ],
    },
    {
      category: 'KONTEN VIDEO LIPUTAN',
      items: [
        { name: 'Kelola Video & Siaran YouTube', admin: true, redaksi: true, editor: true, reporter: false, kontributor: false },
        { name: 'Menerbitkan (Publish) Video', admin: true, redaksi: true, editor: true, reporter: false, kontributor: false },
      ],
    },
    {
      category: 'MEDIA & PENDUKUNG',
      items: [
        { name: 'Upload Foto Liputan ke Media Library', admin: true, redaksi: true, editor: true, reporter: true, kontributor: true },
        { name: 'Kelola Kategori & Tag Berita', admin: true, redaksi: true, editor: false, reporter: false, kontributor: false },
      ],
    },
    {
      category: 'MASTER DATA & TAMPILAN',
      items: [
        { name: 'Master Data Penulis', admin: true, redaksi: true, editor: 'Lihat Saja', reporter: false, kontributor: false },
        { name: 'Master Data Halaman Statis (Pages)', admin: true, redaksi: true, editor: false, reporter: false, kontributor: false },
        { name: 'Manajemen Navigasi SO2 Portal', admin: true, redaksi: true, editor: false, reporter: false, kontributor: false },
        { name: 'Master Data Footer & Site Settings', admin: true, redaksi: false, editor: false, reporter: false, kontributor: false },
      ],
    },
    {
      category: 'SISTEM & USER MANAGEMENT',
      items: [
        { name: 'Manajemen Pengguna (User Management)', admin: true, redaksi: false, editor: false, reporter: false, kontributor: false },
        { name: 'Reset Password & Suspend Akun', admin: true, redaksi: false, editor: false, reporter: false, kontributor: false },
        { name: 'Konfigurasi Keamanan & Session Timeout', admin: true, redaksi: false, editor: false, reporter: false, kontributor: false },
        { name: 'Backup & Restore Database CMS', admin: true, redaksi: false, editor: false, reporter: false, kontributor: false },
        { name: 'Audit Log Aktivitas Redaksi', admin: true, redaksi: false, editor: false, reporter: false, kontributor: false },
      ],
    },
  ];

  const renderPermissionBadge = (val: boolean | string) => {
    if (val === true) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600">
          <Check className="w-4 h-4" />
        </span>
      );
    }
    if (val === false) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-300">
          <Ban className="w-3.5 h-3.5" />
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-amber-50 text-amber-700 border border-amber-200">
        {val}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Matriks Hak Akses &amp; Permission Role CMS
              </h3>
              <p className="text-xs text-slate-500">
                Perbandingan batasan wewenang antara Admin, Redaksi, Editor, Reporter, dan Kontributor BatuTV.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Cards Quick Summary */}
        <div className="p-6 pb-2 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white">
          {roles.map((roleKey) => {
            const roleInfo = ROLE_PERMISSIONS_MATRIX[roleKey];
            return (
              <div
                key={roleKey}
                className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <span
                    className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-md border ${roleInfo.badgeColor}`}
                  >
                    {roleInfo.name}
                  </span>
                  <p className="text-[11.5px] text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {roleInfo.description}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium">
                  {roleKey === 'admin' && '👑 Root Access'}
                  {roleKey === 'redaksi' && '📰 Dewan Redaksi'}
                  {roleKey === 'editor' && '✍️ Gatekeeper Publikasi'}
                  {roleKey === 'reporter' && '🎙️ Jurnalis Lapangan'}
                  {roleKey === 'kontributor' && '🤝 Penulis Komunitas'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-4 w-1/3">Fitur / Hak Akses</th>
                  <th className="py-3 px-3 text-center">Admin</th>
                  <th className="py-3 px-3 text-center">Redaksi</th>
                  <th className="py-3 px-3 text-center">Editor</th>
                  <th className="py-3 px-3 text-center">Reporter</th>
                  <th className="py-3 px-3 text-center">Kontributor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrixFeatures.map((group, gIdx) => (
                  <React.Fragment key={gIdx}>
                    <tr className="bg-slate-50/90 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                      <td colSpan={6} className="py-2.5 px-4 bg-slate-100/60 text-slate-600">
                        {group.category}
                      </td>
                    </tr>
                    {group.items.map((item, itemIdx) => (
                      <tr key={itemIdx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-4 font-medium text-slate-800">{item.name}</td>
                        <td className="py-2.5 px-3 text-center">{renderPermissionBadge(item.admin)}</td>
                        <td className="py-2.5 px-3 text-center">{renderPermissionBadge(item.redaksi)}</td>
                        <td className="py-2.5 px-3 text-center">{renderPermissionBadge(item.editor)}</td>
                        <td className="py-2.5 px-3 text-center">{renderPermissionBadge(item.reporter)}</td>
                        <td className="py-2.5 px-3 text-center">{renderPermissionBadge(item.kontributor)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <span className="text-base">💡</span>
            <div>
              <p className="font-bold">Ketentuan Alur Kerja Redaksional (Editorial Workflow):</p>
              <p className="mt-0.5 text-amber-800">
                Reporter dan Kontributor hanya dapat menyimpan naskah dalam bentuk <strong>Draft / Pengajuan</strong>. Seluruh proses peninjauan naskah, cek fakta, hingga publikasi berita dan video ke portal publik sepenuhnya berada di bawah otoritas <strong>Editor, Redaksi, dan Administrator</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
          >
            Tutup Matriks
          </button>
        </div>
      </div>
    </div>
  );
};
