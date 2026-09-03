import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  Trash2,
  Download,
  Calendar,
  User,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowUpDown,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { ActivityLogItem } from '../../../types/systemSettings';
import {
  getStoredActivityLogs,
  clearStoredActivityLogs,
  SYSTEM_ACTIVITY_LOGGED_EVENT,
} from '../../../data/systemSettingsStore';
import { AdminUser } from '../../../types/admin';

interface ActivityLogTabProps {
  user: AdminUser | null;
  isAdmin: boolean;
}

export const ActivityLogTab: React.FC<ActivityLogTabProps> = ({ user, isAdmin }) => {
  const [logs, setLogs] = useState<ActivityLogItem[]>(() => getStoredActivityLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [confirmClearModal, setConfirmClearModal] = useState(false);

  useEffect(() => {
    const handleLogUpdated = () => {
      setLogs(getStoredActivityLogs());
    };

    window.addEventListener(SYSTEM_ACTIVITY_LOGGED_EVENT, handleLogUpdated);
    return () => window.removeEventListener(SYSTEM_ACTIVITY_LOGGED_EVENT, handleLogUpdated);
  }, []);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === '' ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.entity && log.entity.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesEntity =
      selectedEntity === 'all' || (log.entity && log.entity.toLowerCase() === selectedEntity.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || log.status === selectedStatus;

    return matchesSearch && matchesEntity && matchesStatus;
  });

  // Export Logs to CSV
  const handleExportCsv = () => {
    let csvContent = 'ID,Waktu,User,Role,Aktivitas,Deskripsi,Status,IP\n';
    filteredLogs.forEach((l) => {
      csvContent += `"${l.id}","${new Date(l.timestamp).toLocaleString('id-ID')}","${l.user}","${l.role}","${l.action}","${(l.description || '').replace(/"/g, '""')}","${l.status}","${l.ip || ''}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batutv-activity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    if (!isAdmin) return;
    clearStoredActivityLogs(user || undefined);
    setLogs([]);
    setConfirmClearModal(false);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date) + ' WIB';
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" />
              <span>Log Aktivitas Admin</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Rekam jejak audit autentikasi, publikasi konten, dan perubahan konfigurasi sistem.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCsv}
              disabled={filteredLogs.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setConfirmClearModal(true)}
                disabled={logs.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Kosongkan Log</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari user, aksi, deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:outline-none transition"
            />
          </div>

          {/* Entity Filter */}
          <div>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:outline-none transition font-medium"
            >
              <option value="all">Semua Modul / Entitas</option>
              <option value="Auth">Autentikasi (Auth)</option>
              <option value="Artikel">Artikel Berita</option>
              <option value="Video">Video</option>
              <option value="Site Settings">Site Settings</option>
              <option value="Navigasi">Navigasi</option>
              <option value="Footer">Footer</option>
              <option value="Cache">Cache</option>
              <option value="Backup">Backup & Restore</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Security">Keamanan</option>
              <option value="System">Sistem Umum</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:outline-none transition font-medium"
            >
              <option value="all">Semua Status</option>
              <option value="success">Success (Berhasil)</option>
              <option value="info">Info (Informasi)</option>
              <option value="warning">Warning (Peringatan)</option>
              <option value="error">Error (Gagal)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Log Table / Card List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Activity className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="font-bold text-slate-800 text-sm">Tidak ada log aktivitas ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">
              Coba sesuaikan kata kunci pencarian atau filter yang dipilih.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Waktu</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Aktivitas</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Deskripsi</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatDate(log.timestamp)}</span>
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {log.user.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{log.user}</p>
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {log.role}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-slate-900 block">{log.action}</span>
                          {log.entity && (
                            <span className="text-[10px] text-red-600 font-semibold uppercase tracking-wider">
                              {log.entity}
                            </span>
                          )}
                          <p className="text-xs text-slate-500 mt-1 md:hidden line-clamp-2">
                            {log.description}
                          </p>
                        </div>
                      </td>

                      {/* Description (Desktop) */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-slate-600 text-xs max-w-xs xl:max-w-md">
                        <span className="line-clamp-2">{log.description}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            log.status === 'success'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : log.status === 'info'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : log.status === 'warning'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {log.status === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {log.status === 'info' && <Clock className="w-3 h-3 text-blue-600" />}
                          {log.status === 'warning' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                          {log.status === 'error' && <XCircle className="w-3 h-3 text-red-600" />}
                          <span className="capitalize">{log.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {confirmClearModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Kosongkan Log Aktivitas?</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Tindakan ini akan menghapus seluruh riwayat aktivitas admin yang tersimpan di sistem. Riwayat yang sudah dihapus tidak dapat dipulihkan kembali.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setConfirmClearModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleClearLogs}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-md cursor-pointer"
              >
                Ya, Kosongkan Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
