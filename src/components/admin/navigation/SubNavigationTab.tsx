import React, { useState } from 'react';
import {
  Compass,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Tag,
  FolderTree,
  Link,
  Globe,
  Flame,
  Radio,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';
import { SubNavigationItem, SubNavSettings } from '../../../types/navigation';
import {
  getStoredSubNavItems,
  getStoredSubNavSettings,
  saveSubNavSettings,
  deleteSubNavItem,
  toggleSubNavItemActive,
  moveSubNavItemOrder,
  resetToDefaultSubNavigation,
  addSubNavItem,
  updateSubNavItem,
} from '../../../data/navigationStore';
import { SubNavFormModal } from './SubNavFormModal';

interface SubNavigationTabProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SubNavigationTab: React.FC<SubNavigationTabProps> = ({ onShowToast }) => {
  const [subItems, setSubItems] = useState<SubNavigationItem[]>(() => getStoredSubNavItems());
  const [settings, setSettings] = useState<SubNavSettings>(() => getStoredSubNavSettings());

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<SubNavigationItem | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SubNavigationItem | null>(null);

  const refreshList = () => {
    setSubItems(getStoredSubNavItems().sort((a, b) => a.sortOrder - b.sortOrder));
    setSettings(getStoredSubNavSettings());
  };

  const handleOpenAdd = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SubNavigationItem) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = (data: Partial<SubNavigationItem>) => {
    if (itemToEdit) {
      updateSubNavItem(itemToEdit.id, data);
      onShowToast(`Sub-navigasi "${data.label}" berhasil diperbarui!`, 'success');
    } else {
      addSubNavItem(data as Omit<SubNavigationItem, 'id' | 'createdAt' | 'updatedAt'>);
      onShowToast(`Sub-navigasi "${data.label}" berhasil ditambahkan!`, 'success');
    }
    refreshList();
  };

  const handleToggleActive = (id: string, label: string) => {
    toggleSubNavItemActive(id);
    onShowToast(`Status "${label}" berhasil diubah!`, 'info');
    refreshList();
  };

  const handleMoveOrder = (id: string, direction: 'up' | 'down') => {
    moveSubNavItemOrder(id, direction);
    refreshList();
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteSubNavItem(itemToDelete.id);
      onShowToast(`Sub-navigasi "${itemToDelete.label}" telah dihapus.`, 'info');
      setItemToDelete(null);
      setIsDeleteConfirmOpen(false);
      refreshList();
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSubNavSettings(settings);
    onShowToast('Pengaturan Bar Breaking News berhasil disimpan!', 'success');
  };

  const handleReset = () => {
    if (window.confirm('Kembalikan daftar Sub-Navigasi ke setelan awal default (Batu, Jatim, Jateng, dll)?')) {
      resetToDefaultSubNavigation();
      onShowToast('Daftar Sub-Navigasi dikembalikan ke default.', 'info');
      refreshList();
    }
  };

  const getTargetTypeBadge = (type: string) => {
    switch (type) {
      case 'category':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            <FolderTree className="w-3 h-3 text-blue-500" />
            Kategori
          </span>
        );
      case 'tag':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            <Tag className="w-3 h-3 text-amber-500" />
            Tag / Topik
          </span>
        );
      case 'region':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
            <Compass className="w-3 h-3 text-purple-500" />
            Wilayah Daerah
          </span>
        );
      case 'external':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            <Globe className="w-3 h-3 text-slate-500" />
            Eksternal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Link className="w-3 h-3 text-emerald-500" />
            Custom Path
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Breaking News & Sub-Bar Global Config */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-100">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pengaturan Badge Kiri (Breaking News)</h3>
              <p className="text-xs text-slate-500">
                Atur label badge kilat yang muncul di sisi kiri bilah sub-navigasi
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveSettings}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            Simpan Pengaturan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Status Badge Breaking
            </label>
            <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showBreakingBadge}
                onChange={(e) => setSettings({ ...settings, showBreakingBadge: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-800">Tampilkan Badge BREAKING NEWS</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Teks Badge
            </label>
            <input
              type="text"
              value={settings.breakingBadgeText}
              onChange={(e) => setSettings({ ...settings, breakingBadgeText: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              placeholder="BREAKING NEWS / KILAT / INFO"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tautan Klik Badge (URL)
            </label>
            <input
              type="text"
              value={settings.breakingNewsUrl}
              onChange={(e) => setSettings({ ...settings, breakingNewsUrl: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-mono"
              placeholder="/kategori/daerah"
            />
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Items Management */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Top Bar */}
        <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Daftar Sub-Navigasi (Bar Daerah, Kategori, & Tag Populer)</span>
              <span className="bg-red-100 text-red-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                {subItems.length} Item
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Item ini tampil di bilah abu-abu tepat di bawah menu utama merah (seperti di TVOne News)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              title="Reset ke setelan bawaan"
            >
              Reset Bawaan
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Sub-Navigasi</span>
            </button>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="bg-slate-100/80 p-3 border-b border-slate-200">
          <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-red-500" />
            <span>Pratinjau Langsung Bilah Sub-Navigasi (Live Preview):</span>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-lg p-2 flex items-center gap-3 overflow-x-auto no-scrollbar shadow-2xs">
            {settings.showBreakingBadge && (
              <div className="flex items-center shrink-0 rounded-xs overflow-hidden text-[10px] font-black uppercase tracking-wider">
                <span className="flex items-center gap-1 bg-[#0c2340] text-white px-2 py-0.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  BREAKING
                </span>
                <span className="bg-[#940a13] text-white px-1.5 py-0.5">NEWS</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs font-bold text-slate-700 whitespace-nowrap">
              {subItems
                .filter((item) => item.active)
                .map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 text-slate-700 hover:text-red-600 transition-colors"
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-black px-1 py-0.2 bg-red-600 text-white rounded-xs">
                        {item.badge}
                      </span>
                    )}
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-16 text-center">Urutan</th>
                <th className="py-3 px-4">Label Tampilan</th>
                <th className="py-3 px-4">Tipe Target</th>
                <th className="py-3 px-4">URL Tujuan</th>
                <th className="py-3 px-4 text-center">Badge</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {subItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada item sub-navigasi. Klik <strong>+ Tambah Sub-Navigasi</strong> untuk menambahkan.
                  </td>
                </tr>
              ) : (
                subItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      !item.active ? 'opacity-60 bg-slate-50/30' : ''
                    }`}
                  >
                    {/* Reorder Buttons */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveOrder(item.id, 'up')}
                          className={`p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 ${
                            index === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          title="Geser ke Kiri/Atas"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-[11px] font-bold text-slate-500 w-4 text-center">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          disabled={index === subItems.length - 1}
                          onClick={() => handleMoveOrder(item.id, 'down')}
                          className={`p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 ${
                            index === subItems.length - 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          title="Geser ke Kanan/Bawah"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Label & Indicator */}
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.openNewTab && (
                          <ExternalLink className="w-3 h-3 text-slate-400" title="Buka Tab Baru" />
                        )}
                      </div>
                    </td>

                    {/* Target Type */}
                    <td className="py-2.5 px-4">
                      {getTargetTypeBadge(item.targetType)}
                    </td>

                    {/* Target URL */}
                    <td className="py-2.5 px-4">
                      <code className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
                        {item.url}
                      </code>
                    </td>

                    {/* Badge */}
                    <td className="py-2.5 px-4 text-center">
                      {item.badge ? (
                        <span className="text-[10px] font-black px-2 py-0.5 bg-red-600 text-white rounded-md">
                          {item.badge}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Active Toggle */}
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(item.id, item.label)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          item.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {item.active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            Nonaktif
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Sub-Navigasi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setItemToDelete(item);
                            setIsDeleteConfirmOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Sub-Navigasi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Form Modal */}
      <SubNavFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h4 className="text-base font-bold text-slate-900 mb-2">
              Hapus Sub-Navigasi "{itemToDelete.label}"?
            </h4>
            <p className="text-xs text-slate-600 mb-6">
              Item ini akan dihapus dari bilah sub-navigasi di bawah menu utama. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
