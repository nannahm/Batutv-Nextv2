import React from 'react';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';

interface PlaceholderModuleProps {
  moduleName: string;
  moduleCode: string;
  description: string;
  onBackToDashboard: () => void;
}

export const PlaceholderModule: React.FC<PlaceholderModuleProps> = ({
  moduleName,
  moduleCode,
  description,
  onBackToDashboard,
}) => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto mb-5 border border-purple-100 shadow-xs">
          <Clock className="w-8 h-8 stroke-[1.8]" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-black rounded-full mb-3 border border-red-200">
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          <span>MODUL CMS: {moduleCode}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
          {moduleName}
        </h2>

        <p className="text-sm text-slate-600 max-w-lg mx-auto mb-8 leading-relaxed">
          {description} Sesuai arahan arsitektur sistem, modul ini akan diimplementasikan secara terisolasi pada tahap berikutnya setelah fondasi <strong>A02 — Dashboard Dasar</strong> selesai.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-6 py-3 bg-[#e50914] hover:bg-[#c80812] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Kembali ke Dashboard Utama
          </button>
        </div>
      </div>
    </div>
  );
};
