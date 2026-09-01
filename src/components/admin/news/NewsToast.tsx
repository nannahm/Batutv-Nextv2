import React from 'react';
import { CheckCircle2, AlertCircle, Info, X, Trash2, RotateCcw } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'trash';
  title: string;
  message?: string;
  onUndo?: () => void;
}

interface NewsToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NewsToast: React.FC<NewsToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const getBg = () => {
          switch (toast.type) {
            case 'success':
              return 'bg-slate-900 border-emerald-500/50 text-white';
            case 'error':
              return 'bg-slate-900 border-red-500/50 text-white';
            case 'trash':
              return 'bg-slate-900 border-amber-500/50 text-white';
            case 'info':
            default:
              return 'bg-slate-900 border-blue-500/50 text-white';
          }
        };

        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />;
            case 'error':
              return <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />;
            case 'trash':
              return <Trash2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />;
            case 'info':
            default:
              return <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />;
          }
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200 backdrop-blur-md ${getBg()}`}
          >
            <div className="flex items-start gap-3 min-w-0">
              {getIcon()}
              <div className="min-w-0">
                <h4 className="text-xs font-bold leading-tight">{toast.title}</h4>
                {toast.message && (
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
                )}
                {toast.onUndo && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.onUndo?.();
                      onDismiss(toast.id);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 underline mt-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Urungkan</span>
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Tutup notifikasi"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
