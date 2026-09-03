import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderTree,
  Plus,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Search,
  SlidersHorizontal,
  Layers,
  Sparkles,
  ShieldCheck,
  Globe,
  Radio,
  Compass,
} from 'lucide-react';
import {
  NavigationItem,
  NavigationItemWithChildren,
} from '../../../types/navigation';
import {
  getStoredNavItems,
  getNavigationTreeAdmin,
  getNavigationCounts,
  addNavigationItem,
  updateNavigationItem,
  deleteNavigationItem,
  toggleNavigationItemActive,
  moveNavigationItemOrder,
  moveSubmenuToParent,
  resetToDefaultNavigation,
  getStoredSubNavItems,
} from '../../../data/navigationStore';
import { NavigationTreeList } from './NavigationTreeList';
import { NavigationFormModal } from './NavigationFormModal';
import { DeleteParentConfirmModal } from './DeleteParentConfirmModal';
import { SubNavigationTab } from './SubNavigationTab';

interface NavigationManagementModuleProps {
  onNavigateToPublic?: (path: string) => void;
}

export const NavigationManagementModule: React.FC<NavigationManagementModuleProps> = ({
  onNavigateToPublic,
}) => {
  // Navigation tabs state: 'primary' | 'subnav'
  const [activeTab, setActiveTab] = useState<'primary' | 'subnav'>('primary');

  // Master data tree state
  const [navTree, setNavTree] = useState<NavigationItemWithChildren[]>(() =>
    getNavigationTreeAdmin()
  );
  const [rawItems, setRawItems] = useState<NavigationItem[]>(() => getStoredNavItems());
  const [counts, setCounts] = useState(() => getNavigationCounts());
  const [subCount, setSubCount] = useState(() => getStoredSubNavItems().length);


  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<NavigationItem | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<NavigationItem | null>(null);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      setToast({ show: true, message, type });
      setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3500);
    },
    []
  );

  // Reload data from store
  const refreshData = useCallback(() => {
    setNavTree(getNavigationTreeAdmin());
    setRawItems(getStoredNavItems());
    setCounts(getNavigationCounts());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handlers
  const handleOpenAddModal = (parentId: string | null = null) => {
    setItemToEdit(null);
    setDefaultParentId(parentId);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item: NavigationItem) => {
    setItemToEdit(item);
    setDefaultParentId(item.parentId || null);
    setIsFormModalOpen(true);
  };

  const handleSaveItem = (data: Partial<NavigationItem>) => {
    try {
      if (itemToEdit) {
        updateNavigationItem(itemToEdit.id, data);
        showToast(`Menu "${data.label}" berhasil diperbarui!`, 'success');
      } else {
        addNavigationItem(
          data as Omit<NavigationItem, 'id' | 'createdAt' | 'updatedAt'>
        );
        showToast(`Menu "${data.label}" berhasil ditambahkan!`, 'success');
      }
      refreshData();
    } catch (err) {
      console.error('Error saving navigation item:', err);
      showToast('Gagal menyimpan menu navigasi.', 'error');
    }
  };

  const handleToggleActive = (id: string) => {
    toggleNavigationItemActive(id);
    refreshData();
    showToast('Status publikasi menu berhasil diubah.', 'info');
  };

  const handleMoveOrder = (id: string, direction: 'up' | 'down') => {
    moveNavigationItemOrder(id, direction);
    refreshData();
  };

  const handleMoveToParent = (childId: string, newParentId: string | null) => {
    moveSubmenuToParent(childId, newParentId);
    refreshData();
    showToast('Posisi parent submenu berhasil dipindahkan.', 'success');
  };

  const handleOpenDeleteModal = (item: NavigationItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmCascadeDelete = (parentId: string) => {
    deleteNavigationItem(parentId, 'cascade');
    refreshData();
    showToast('Parent menu dan semua submenunya berhasil dihapus.', 'success');
  };

  const handleConfirmPromoteDelete = (parentId: string) => {
    deleteNavigationItem(parentId, 'promote_to_root');
    refreshData();
    showToast('Parent menu dihapus, submenu berhasil dipindahkan ke Menu Utama.', 'success');
  };

  const handleConfirmSingleDelete = (itemId: string) => {
    deleteNavigationItem(itemId, 'cascade');
    refreshData();
    showToast('Item menu berhasil dihapus.', 'success');
  };

  const handleResetToDefault = () => {
    resetToDefaultNavigation();
    refreshData();
    setIsResetConfirmOpen(false);
    showToast('Navigasi berhasil direset ke susunan default BATUTV!', 'info');
  };

  // Filter tree based on search and status
  const filteredTree = navTree
    .map((parent) => {
      // Filter children first
      let matchingChildren = parent.children || [];

      if (statusFilter === 'active') {
        matchingChildren = matchingChildren.filter((c) => c.active);
      } else if (statusFilter === 'inactive') {
        matchingChildren = matchingChildren.filter((c) => !c.active);
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        matchingChildren = matchingChildren.filter(
          (c) => c.label.toLowerCase().includes(q) || c.url.toLowerCase().includes(q)
        );
      }

      const isParentMatch =
        (!searchQuery.trim() ||
          parent.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          parent.url.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (statusFilter === 'all' ||
          (statusFilter === 'active' && parent.active) ||
          (statusFilter === 'inactive' && !parent.active));

      if (isParentMatch || matchingChildren.length > 0) {
        return {
          ...parent,
          children: matchingChildren,
        };
      }

      return null;
    })
    .filter(Boolean) as NavigationItemWithChildren[];

  // Get parent items for form options
  const parentItems = rawItems.filter((i) => !i.parentId);

  // Submenus of itemToDelete for DeleteParentConfirmModal
  const submenusOfDeleted = itemToDelete
    ? rawItems.filter((i) => i.parentId === itemToDelete.id)
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300" id="navigation-admin-module">
      {/* Toast Notification */}
      {toast.show && (
        <div
          id="navigation-toast"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-bold text-white transition-all transform animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-600 border-emerald-500'
              : toast.type === 'error'
              ? 'bg-red-600 border-red-500'
              : 'bg-slate-900 border-slate-700'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-white" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-white" />}
          {toast.type === 'info' && <FolderTree className="w-4 h-4 text-cyan-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Quick Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 bg-red-600 text-white rounded-2xl shadow-md shadow-red-600/20 shrink-0">
              <FolderTree className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Manajemen Navigasi Portal
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Kelola Menu Utama (Level 1 &amp; 2) dan Sub-Navigasi (Bilah Daerah, Kategori, &amp; Tag Populer) yang langsung terhubung ke Homepage.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            {onNavigateToPublic && (
              <button
                type="button"
                onClick={() => onNavigateToPublic('/')}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-200 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-slate-500" />
                <span>Lihat Homepage</span>
              </button>
            )}

            {activeTab === 'primary' ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                  title="Kembalikan susunan menu ke default"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span>Reset Default</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAddModal(null)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm shadow-red-600/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Menu Utama</span>
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Tab Switcher: Menu Utama vs Sub-Navigasi */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('primary')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'primary'
                ? 'bg-red-600 text-white shadow-sm shadow-red-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Menu Utama (Navbar Merah)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'primary' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {counts.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subnav')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'subnav'
                ? 'bg-red-600 text-white shadow-sm shadow-red-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Sub-Navigasi (Bilah Daerah &amp; Tagar)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'subnav' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {subCount}
            </span>
          </button>
        </div>

        {/* Metric Badges (Only on primary tab) */}
        {activeTab === 'primary' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Menu
              </div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{counts.total}</div>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60">
              <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                Menu Aktif
              </div>
              <div className="text-xl font-black text-emerald-700 mt-0.5">{counts.active}</div>
            </div>
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
              <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                Parent Menu (Level 1)
              </div>
              <div className="text-xl font-black text-blue-700 mt-0.5">{counts.parents}</div>
            </div>
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/60">
              <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                Submenu (Level 2)
              </div>
              <div className="text-xl font-black text-purple-700 mt-0.5">{counts.children}</div>
            </div>
          </div>
        )}
      </div>

      {activeTab === 'subnav' ? (
        <SubNavigationTab onShowToast={showToast} />
      ) : (
        <>
          {/* Notice & Feature Highlight */}
          <div className="bg-gradient-to-r from-red-900/5 via-amber-900/5 to-slate-900/5 rounded-2xl border border-red-200/60 p-4 flex items-start gap-3 text-xs text-slate-700">
            <div className="p-1.5 bg-red-600 text-white rounded-lg shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-900">
                Kepatuhan Standar SO2 &amp; SEO Google Crawlability:
              </p>
              <p className="text-slate-600 leading-relaxed">
                Semua menu yang dikonfigurasi di sini dirender langsung ke dalam tag semantik{' '}
                <code className="bg-slate-200/80 px-1 py-0.5 rounded text-red-700 font-mono text-[11px]">
                  &lt;a href=&quot;...&quot;&gt;
                </code>{' '}
                pada SO2 Primary Navigation dan Mobile Menu. Sistem secara ketat membatasi struktur maksimal 2 level (Parent → Submenu) untuk navigasi yang bersih, cepat, dan terindeks optimal oleh mesin pencari Google.
              </p>
            </div>
          </div>

          {/* Toolbar: Search & Filter */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu, URL, atau slug..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Status:</span>
              </span>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    statusFilter === 'active'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-500 hover:text-emerald-700'
                  }`}
                >
                  Aktif
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    statusFilter === 'inactive'
                      ? 'bg-white text-slate-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Nonaktif
                </button>
              </div>
            </div>
          </div>

          {/* Main Tree List */}
          <NavigationTreeList
            tree={filteredTree}
            onToggleActive={handleToggleActive}
            onEditItem={handleOpenEditModal}
            onDeleteItem={handleOpenDeleteModal}
            onAddSubmenu={(parentId) => handleOpenAddModal(parentId)}
            onMoveOrder={handleMoveOrder}
            onMoveToParent={handleMoveToParent}
          />
        </>
      )}


      {/* Form Modal (Add & Edit) */}
      <NavigationFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
        parentItems={parentItems}
        defaultParentId={defaultParentId}
        existingItems={rawItems}
      />

      {/* Delete Parent Confirmation Modal (Cascade vs Promote to Root) */}
      <DeleteParentConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        itemToDelete={itemToDelete}
        submenus={submenusOfDeleted}
        onConfirmCascade={handleConfirmCascadeDelete}
        onConfirmPromoteToRoot={handleConfirmPromoteDelete}
        onConfirmSingleDelete={handleConfirmSingleDelete}
      />

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2 bg-amber-100 rounded-xl">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Reset Susunan Navigasi?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tindakan ini akan mengembalikan seluruh menu navigasi SO2 ke susunan default BATUTV (Home, News, Ekonomi Bisnis, Daerah, Sport, Video).
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl"
              >
                Ya, Reset ke Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
