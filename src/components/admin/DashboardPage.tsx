import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import {
  DashboardStats,
  AdminArticleItem,
  AdminVideoItem,
  AdminActivityLog,
  AdminUser,
} from '../../types/admin';
import {
  getDashboardStats,
  getLatestArticles,
  getLatestVideos,
  getRecentActivities,
} from '../../data/adminDashboardData';
import { StatisticsCards } from './StatisticsCards';
import { QuickActions } from './QuickActions';
import { LatestArticlesTable } from './LatestArticlesTable';
import { LatestVideosGrid } from './LatestVideosGrid';
import { RecentActivityList } from './RecentActivityList';

interface DashboardPageProps {
  user: AdminUser | null;
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [articles, setArticles] = useState<AdminArticleItem[]>([]);
  const [videos, setVideos] = useState<AdminVideoItem[]>([]);
  const [activities, setActivities] = useState<AdminActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch initial data from data layer
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [s, a, v, act] = await Promise.all([
        getDashboardStats(),
        getLatestArticles(),
        getLatestVideos(),
        getRecentActivities(),
      ]);
      setStats(s);
      setArticles(a);
      setVideos(v);
      setActivities(act);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome / Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider rounded-md">
              Newsroom
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">
              BatuTV Control Center
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Dashboard Utama
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Selamat datang di panel kontrol BatuTV, <strong>{user?.name || 'Administrator'}</strong>. Pantau metrik penerbitan berita, status redaksi, dan liputan video secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            title="Segarkan Data Dashboard"
            aria-label="Segarkan Data Dashboard"
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* A02.3.2 — Statistics Cards */}
      {stats && <StatisticsCards stats={stats} onNavigate={onNavigate} />}

      {/* A02.3.3 — Quick Actions */}
      <QuickActions
        onWriteArticle={() => onNavigate('/batutv-control/berita/tulis')}
        onAddVideo={() => onNavigate('/batutv-control/video')}
      />

      {/* Main Grid: Left (Articles + Videos), Right (Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* A02.3.4 — Latest Articles Table */}
          <LatestArticlesTable
            articles={articles}
            onViewAll={() => onNavigate('/batutv-control/berita')}
          />

          {/* A02.3.5 — Latest YouTube Videos Grid */}
          <LatestVideosGrid
            videos={videos}
            onViewAll={() => onNavigate('/batutv-control/video')}
          />
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6">
          {/* A02.3.6 — Recent Activity Log */}
          <RecentActivityList activities={activities} />

          {/* System Environment Info Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-900">
                  Status Sistem CMS
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Online
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sistem beroperasi normal dengan sinkronisasi master data artikel, video YouTube, kategori, dan tag terpadu.
            </p>
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
              <span>BatuTV Control Build</span>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                v1.0 (A02)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
