import React from 'react';
import { Youtube, FilePlus, Zap } from 'lucide-react';

interface QuickActionsProps {
  onWriteArticle: () => void;
  onAddVideo: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onWriteArticle,
  onAddVideo,
}) => {
  return (
    <section aria-label="Aksi Cepat Administrasi Konten" className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900">
              Aksi Cepat Redaksi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mulai produksi artikel berita baru atau tautkan siaran video YouTube ke sistem portal.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Button: + Tulis Berita */}
          <button
            type="button"
            id="a02-btn-tulis-berita"
            onClick={onWriteArticle}
            aria-label="Tulis Artikel Berita Baru"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all duration-200 cursor-pointer"
          >
            <FilePlus className="w-4 h-4 stroke-[2.2]" />
            <span>Tulis Berita Baru</span>
          </button>

          {/* Button: + Tambah Video */}
          <button
            type="button"
            id="a02-btn-tambah-video"
            onClick={onAddVideo}
            aria-label="Tambah Video Siaran YouTube Baru"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all duration-200 cursor-pointer"
          >
            <Youtube className="w-4 h-4 text-red-600 stroke-[2.2]" />
            <span>Tambah Video</span>
          </button>
        </div>
      </div>
    </section>
  );
};
