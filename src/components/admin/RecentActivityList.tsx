import React from 'react';
import { History, FileText, Youtube, Edit3, Plus, User, Clock } from 'lucide-react';
import { AdminActivityLog } from '../../types/admin';

interface RecentActivityListProps {
  activities: AdminActivityLog[];
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({ activities }) => {
  const getActionIcon = (action: AdminActivityLog['action']) => {
    switch (action) {
      case 'publish_article':
        return <FileText className="w-3.5 h-3.5 text-emerald-600" />;
      case 'add_video':
        return <Youtube className="w-3.5 h-3.5 text-red-600" />;
      case 'edit_article':
        return <Edit3 className="w-3.5 h-3.5 text-blue-600" />;
      case 'create_draft':
        return <Plus className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getActionText = (activity: AdminActivityLog) => {
    switch (activity.action) {
      case 'publish_article':
        return 'menerbitkan berita:';
      case 'add_video':
        return 'menambahkan video YouTube:';
      case 'edit_article':
        return 'mengedit berita:';
      case 'create_draft':
        return 'membuat draft berita baru:';
      default:
        return 'melakukan pembaruan pada:';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
          <History className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            Aktivitas Terbaru Redaksi
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Log tindakan staf dan editor di sistem BatuTV Control
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {activities.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
              {getActionIcon(item.action)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-700 leading-snug">
                <strong className="text-slate-900 font-bold">{item.userName}</strong>{' '}
                <span className="text-slate-600">{getActionText(item)}</span>{' '}
                <span className="font-semibold text-slate-900 italic">
                  "{item.targetTitle}"
                </span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.timeAgo}
                </span>
                <span className="text-slate-300 text-[10px]">•</span>
                <span className="text-[10px] text-slate-700 font-bold bg-slate-100 border border-slate-200/80 px-1.5 py-0.2 rounded">
                  {item.userRole}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
