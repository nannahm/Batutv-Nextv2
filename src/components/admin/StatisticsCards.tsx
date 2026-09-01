import React from 'react';
import { Newspaper, Video, FileEdit, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { DashboardStats } from '../../types/admin';

interface StatisticsCardsProps {
  stats: DashboardStats;
  onNavigate: (path: string) => void;
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ stats, onNavigate }) => {
  const cards = [
    {
      id: 'stat-total-berita',
      title: 'TOTAL BERITA',
      value: stats.totalArticles,
      subtitle: 'Artikel & liputan aktif',
      icon: Newspaper,
      color: 'text-blue-600',
      bgIcon: 'bg-blue-50',
      borderColor: 'border-blue-100',
      path: '/batutv-control/berita',
      ariaLabel: `Total berita saat ini: ${stats.totalArticles} artikel`,
    },
    {
      id: 'stat-total-video',
      title: 'TOTAL VIDEO',
      value: stats.totalVideos,
      subtitle: 'Video tayangan YouTube',
      icon: Video,
      color: 'text-red-600',
      bgIcon: 'bg-red-50',
      borderColor: 'border-red-100',
      path: '/batutv-control/video',
      ariaLabel: `Total video saat ini: ${stats.totalVideos} video`,
    },
    {
      id: 'stat-berita-draft',
      title: 'BERITA DRAFT',
      value: stats.draftArticles,
      subtitle: 'Menunggu review redaksi',
      icon: FileEdit,
      color: 'text-amber-600',
      bgIcon: 'bg-amber-50',
      borderColor: 'border-amber-100',
      path: '/batutv-control/berita',
      ariaLabel: `Berita draft: ${stats.draftArticles} artikel`,
    },
    {
      id: 'stat-total-published',
      title: 'PUBLISHED',
      value: stats.publishedTotal,
      subtitle: 'Total konten tayang',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgIcon: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      path: '/batutv-control/berita',
      ariaLabel: `Konten terpublikasi: ${stats.publishedTotal} konten`,
    },
  ];

  return (
    <section aria-label="Ringkasan Statistik Konten" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black tracking-wider text-slate-400 uppercase">
          Ringkasan Statistik Konten
        </h3>
        <span className="text-[11px] font-medium text-slate-400">
          Data tersinkronisasi real-time
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              id={card.id}
              onClick={() => onNavigate(card.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate(card.path);
                }
              }}
              aria-label={card.ariaLabel}
              className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                    {card.title}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight block">
                    {card.value}
                  </span>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl ${card.bgIcon} ${card.color} flex items-center justify-center transition-transform group-hover:scale-105 shrink-0`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">{card.subtitle}</span>
                <span className="text-slate-400 group-hover:text-red-600 flex items-center gap-0.5 font-bold transition-colors">
                  Detail <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
