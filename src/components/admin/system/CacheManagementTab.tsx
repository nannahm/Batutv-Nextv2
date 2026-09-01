import React, { useState } from 'react';
import {
  Zap,
  RotateCcw,
  RefreshCw,
  FileCode,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  Activity,
  Lock,
  Clock,
} from 'lucide-react';
import { CacheStats } from '../../../types/systemSettings';
import {
  getStoredCacheStats,
  performClearCache,
  performRefreshHomepageCache,
  performRebuildSitemap,
  performRebuildSearchIndex,
  performRefreshSeoMetadata,
} from '../../../data/systemSettingsStore';
import { AdminUser } from '../../../types/admin';

interface CacheManagementTabProps {
  user: AdminUser | null;
  isAdmin: boolean;
}

export const CacheManagementTab: React.FC<CacheManagementTabProps> = ({ user, isAdmin }) => {
  const [stats, setStats] = useState<CacheStats>(() => getStoredCacheStats());
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4500);
  };

  // 1. Clear Cache
  const handleClearCache = async () => {
    if (!isAdmin) return;
    setActiveAction('clear_cache');
    try {
      const res = await performClearCache(user || undefined);
      setStats(getStoredCacheStats());
      showFeedback(res.message);
    } catch (e: any) {
      showFeedback('Gagal membersihkan cache: ' + (e?.message || 'Error'), 'error');
    } finally {
      setActiveAction(null);
    }
  };

  // 2. Refresh Homepage Cache
  const handleRefreshHomepage = async () => {
    if (!isAdmin) return;
    setActiveAction('refresh_homepage');
    try {
      const res = await performRefreshHomepageCache(user || undefined);
      setStats(getStoredCacheStats());
      showFeedback(res.message);
    } catch (e: any) {
      showFeedback('Gagal merefresh homepage cache: ' + (e?.message || 'Error'), 'error');
    } finally {
      setActiveAction(null);
    }
  };

  // 3. Rebuild Sitemap
  const handleRebuildSitemap = async () => {
    if (!isAdmin) return;
    setActiveAction('rebuild_sitemap');
    try {
      const res = await performRebuildSitemap(user || undefined);
      setStats(getStoredCacheStats());
      showFeedback(res.message);
    } catch (e: any) {
      showFeedback('Gagal rebuild sitemap: ' + (e?.message || 'Error'), 'error');
    } finally {
      setActiveAction(null);
    }
  };

  // 4. Rebuild Search Index
  const handleRebuildSearch = async () => {
    if (!isAdmin) return;
    setActiveAction('rebuild_search');
    try {
      const res = await performRebuildSearchIndex(user || undefined);
      setStats(getStoredCacheStats());
      showFeedback(res.message);
    } catch (e: any) {
      showFeedback('Gagal rebuild search index: ' + (e?.message || 'Error'), 'error');
    } finally {
      setActiveAction(null);
    }
  };

  // 5. Refresh SEO Metadata
  const handleRefreshSeo = async () => {
    if (!isAdmin) return;
    setActiveAction('refresh_seo');
    try {
      const res = await performRefreshSeoMetadata(user || undefined);
      setStats(getStoredCacheStats());
      showFeedback(res.message);
    } catch (e: any) {
      showFeedback('Gagal refresh SEO metadata: ' + (e?.message || 'Error'), 'error');
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Hit Rate Cache</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{stats.hitRate}</p>
            <span className="text-[11px] font-bold text-emerald-600">Optimal (Zero lag)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Alokasi Memori Cache</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{stats.memoryUsage}</p>
            <span className="text-[11px] font-medium text-slate-500">Kapasitas aman (&lt; 15 MB)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Kunci Cache Aktif</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{stats.cachedKeysCount} Key</p>
            <span className="text-[11px] font-medium text-slate-500">Feed, Media, Pages</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Terakhir Dibersihkan</p>
            <p className="text-sm font-bold text-slate-900 mt-1 truncate max-w-[140px]" title={stats.lastCleared}>
              {stats.lastCleared}
            </p>
            <span className="text-[11px] font-medium text-slate-500">Sinkronisasi rutin</span>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center gap-3 animate-fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="font-medium">{feedbackMsg.text}</span>
        </div>
      )}

      {/* Cache Action Items */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Operasi Pemeliharaan Cache</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Jalankan regenerasi cache atau pembersihan instan bila ada perubahan konten yang belum muncul di frontend.
            </p>
          </div>
          {!isAdmin && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Lock className="w-3 h-3" />
              Mode Lihat Saja
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Action 1: Clear Cache */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Clear Cache (Pembersihan Penuh)</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Mengosongkan seluruh buffer memori sementara, cache render komponen, dan memaksa browser mereload aset terbaru.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleClearCache}
                disabled={!isAdmin || activeAction !== null}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-xs transition cursor-pointer"
              >
                {activeAction === 'clear_cache' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Membersihkan...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Cache</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action 2: Refresh Homepage Cache */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Refresh Homepage Cache</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Memaksa sinkronisasi feed Headline SO3, breaking news ticker, feed terkini SO4, dan video SO5 di beranda.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleRefreshHomepage}
                disabled={!isAdmin || activeAction !== null}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-xs transition cursor-pointer"
              >
                {activeAction === 'refresh_homepage' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyegarkan...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Homepage Cache</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action 3: Rebuild Sitemap */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Rebuild Sitemap XML</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Menyusun ulang file <code className="text-slate-800 bg-slate-200/80 px-1 rounded">/sitemap.xml</code> dan <code className="text-slate-800 bg-slate-200/80 px-1 rounded">/news-sitemap.xml</code> dengan URL berita/video terbit terkini.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleRebuildSitemap}
                disabled={!isAdmin || activeAction !== null}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-xs transition cursor-pointer"
              >
                {activeAction === 'rebuild_sitemap' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Membangun Ulang...</span>
                  </>
                ) : (
                  <>
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Rebuild Sitemap</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action 4: Rebuild Search Index */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Rebuild Search Index</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Mengompilasi indeks pencarian artikel, video, judul, dan konten agar fitur pencarian modal instan dan akurat.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleRebuildSearch}
                disabled={!isAdmin || activeAction !== null}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-xs transition cursor-pointer"
              >
                {activeAction === 'rebuild_search' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengindeks Ulang...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Rebuild Search Index</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action 5: Refresh SEO Metadata */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between gap-4 md:col-span-2">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Refresh SEO Metadata & Schema.org</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Memuat ulang struktur schema JSON-LD, meta tag OpenGraph, Twitter Cards, canonical tags, dan identitas publisher dari database ke DOM header.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleRefreshSeo}
                disabled={!isAdmin || activeAction !== null}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-xs transition cursor-pointer"
              >
                {activeAction === 'refresh_seo' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Memperbarui SEO...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Refresh SEO Metadata</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
