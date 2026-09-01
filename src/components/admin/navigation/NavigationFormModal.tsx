import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Save,
  Link as LinkIcon,
  ExternalLink,
  Layers,
  CheckCircle2,
  FolderTree,
  AlertTriangle,
  FileText,
  Tags,
  Globe,
} from 'lucide-react';
import {
  NavigationItem,
  NavigationTargetType,
  NavigationInternalType,
} from '../../../types/navigation';
import { getStoredCategories } from '../../../data/categoryAdminStore';
import { getStoredPages } from '../../../data/pagesAdminStore';
import { generateNavSlug } from '../../../data/navigationStore';

interface NavigationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<NavigationItem>) => void;
  itemToEdit: NavigationItem | null;
  parentItems: NavigationItem[]; // List of Level 1 parents
  defaultParentId?: string | null;
  existingItems: NavigationItem[];
}

export const NavigationFormModal: React.FC<NavigationFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
  parentItems,
  defaultParentId = null,
  existingItems,
}) => {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<NavigationTargetType>('internal');
  const [targetType, setTargetType] = useState<NavigationInternalType>('kategori');
  const [targetId, setTargetId] = useState('');
  const [url, setUrl] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [active, setActive] = useState<boolean>(true);
  const [openNewTab, setOpenNewTab] = useState<boolean>(false);
  const [icon, setIcon] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Categories & Pages from CMS stores for auto-generated internal links
  const [categories, setCategories] = useState(() => getStoredCategories());
  const [pages, setPages] = useState(() => getStoredPages());

  useEffect(() => {
    setCategories(getStoredCategories());
    setPages(getStoredPages());
  }, [isOpen]);

  // Check if itemToEdit is already a Parent having submenus
  const hasChildren = itemToEdit
    ? existingItems.some((i) => i.parentId === itemToEdit.id)
    : false;

  // Initialize or reset form state
  useEffect(() => {
    if (!isOpen) return;

    setErrors({});

    if (itemToEdit) {
      setLabel(itemToEdit.label || '');
      setType(itemToEdit.type || 'internal');
      setTargetType(itemToEdit.targetType || 'kategori');
      setTargetId(itemToEdit.targetId || '');
      setUrl(itemToEdit.url || '');
      setParentId(itemToEdit.parentId || null);
      setSortOrder(itemToEdit.sortOrder || 1);
      setActive(itemToEdit.active !== undefined ? itemToEdit.active : true);
      setOpenNewTab(itemToEdit.openNewTab || false);
      setIcon(itemToEdit.icon || '');
    } else {
      // New Menu Form
      setLabel('');
      setType('internal');
      setTargetType('kategori');
      const firstCat = categories[0];
      if (firstCat) {
        setTargetId(firstCat.slug);
        setUrl(`/kategori/${firstCat.slug}`);
      } else {
        setTargetId('');
        setUrl('/');
      }
      setParentId(defaultParentId || null);

      // Determine default order
      const siblings = existingItems.filter((i) => i.parentId === (defaultParentId || null));
      const maxOrder = siblings.length > 0 ? Math.max(...siblings.map((s) => s.sortOrder)) : 0;
      setSortOrder(maxOrder + 1);

      setActive(true);
      setOpenNewTab(false);
      setIcon('');
    }
  }, [isOpen, itemToEdit, defaultParentId, categories]);

  // Handle auto-calculating URL when targetType or targetId changes
  const handleTargetTypeChange = (newTargetType: NavigationInternalType) => {
    setTargetType(newTargetType);
    if (newTargetType === 'kategori') {
      const firstCat = categories[0];
      if (firstCat) {
        setTargetId(firstCat.slug);
        setUrl(`/kategori/${firstCat.slug}`);
        if (!label) setLabel(firstCat.name);
      }
    } else if (newTargetType === 'page') {
      const firstPage = pages[0];
      if (firstPage) {
        setTargetId(firstPage.slug);
        setUrl(`/${firstPage.slug}`);
        if (!label) setLabel(firstPage.title);
      }
    } else if (newTargetType === 'custom') {
      setTargetId('');
      setUrl('/');
    }
  };

  const handleCategorySelect = (slug: string) => {
    setTargetId(slug);
    setUrl(`/kategori/${slug}`);
    const selectedCat = categories.find((c) => c.slug === slug);
    if (selectedCat && (!label || label === 'Menu Baru')) {
      setLabel(selectedCat.name);
    }
  };

  const handlePageSelect = (slug: string) => {
    setTargetId(slug);
    setUrl(`/${slug}`);
    const selectedPage = pages.find((p) => p.slug === slug);
    if (selectedPage && (!label || label === 'Menu Baru')) {
      setLabel(selectedPage.title);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!label.trim()) {
      newErrors.label = 'Nama menu wajib diisi.';
    }

    if (type === 'internal') {
      if (!url.trim()) {
        newErrors.url = 'Tujuan URL internal tidak boleh kosong.';
      }
    } else if (type === 'external') {
      if (!url.trim()) {
        newErrors.url = 'URL eksternal wajib diisi.';
      } else if (!/^https?:\/\/.+/i.test(url.trim())) {
        newErrors.url = 'URL harus diawali dengan http:// atau https://';
      }
    }

    // Circular parent check: item cannot be its own parent
    if (itemToEdit && parentId === itemToEdit.id) {
      newErrors.parentId = 'Menu tidak dapat menjadi parent untuk dirinya sendiri.';
    }

    // Max 2 level rule check: If item has children, it cannot become a child of another parent
    if (hasChildren && parentId !== null) {
      newErrors.parentId = 'Menu ini memiliki submenu. Sistem hanya mendukung maksimal 2 level.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Partial<NavigationItem> = {
      label: label.trim(),
      type,
      targetType: type === 'internal' ? targetType : undefined,
      targetId: type === 'internal' ? targetId : undefined,
      url: url.trim(),
      slug: generateNavSlug(label.trim()),
      parentId: parentId || null,
      sortOrder: Number(sortOrder) || 1,
      active,
      openNewTab: type === 'external' ? openNewTab : false,
      icon: icon.trim() || undefined,
    };

    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  // Filter available parent items:
  // Cannot pick self as parent, and cannot pick items that are already children
  const availableParents = parentItems.filter((p) => {
    if (itemToEdit && p.id === itemToEdit.id) return false;
    return !p.parentId;
  });

  return (
    <div
      id="navigation-form-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="navigation-form-modal-dialog"
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col my-8 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {itemToEdit ? 'Edit Item Navigasi' : 'Tambah Menu Navigasi'}
              </h3>
              <p className="text-xs text-slate-400">
                Maksimal 2 Level Hirarki • Terhubung langsung ke SO2 Homepage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Tutup Dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-130px)]">
          {/* Level Warning if item has children */}
          {hasChildren && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Item ini bertindak sebagai Parent Menu:</span> Memiliki sub-menu di bawahnya. Untuk mematuhi aturan maksimal 2 level, posisi parent dikunci di Root.
              </div>
            </div>
          )}

          {/* Nama Menu */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nama Menu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Contoh: News, Nasional, Tentang Kami"
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
                errors.label ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
              }`}
            />
            {errors.label ? (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.label}</p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Label nama yang akan tampil pada bar navigasi SO2.
              </p>
            )}
          </div>

          {/* Posisi & Hirarki: Parent Menu (Max 2 Level) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Hirarki / Parent Menu (Maks 2 Level)
            </label>
            <select
              value={parentId || ''}
              disabled={hasChildren}
              onChange={(e) => setParentId(e.target.value ? e.target.value : null)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60 disabled:bg-slate-100"
            >
              <option value="">Root / Menu Utama (Level 1 — Tanpa Parent)</option>
              {availableParents.map((p) => (
                <option key={p.id} value={p.id}>
                  ↳ Submenu di bawah &quot;{p.label}&quot; (Level 2)
                </option>
              ))}
            </select>
            {errors.parentId && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.parentId}</p>
            )}
            <p className="text-[11px] text-slate-500">
              {parentId
                ? 'Item ini akan muncul sebagai dropdown submenu di bawah parent yang dipilih.'
                : 'Item ini akan tampil langsung di baris utama navigasi SO2.'}
            </p>
          </div>

          {/* Tipe Tujuan: Internal vs External */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Tipe Tujuan Tautan
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType('internal');
                  if (targetType === 'kategori' && categories[0]) {
                    setUrl(`/kategori/${categories[0].slug}`);
                  }
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition ${
                  type === 'internal'
                    ? 'bg-red-50 border-red-500 text-red-700 ring-2 ring-red-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>Internal (CMS)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('external');
                  setUrl('https://');
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition ${
                  type === 'external'
                    ? 'bg-red-50 border-red-500 text-red-700 ring-2 ring-red-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                <span>Eksternal Link</span>
              </button>
            </div>
          </div>

          {/* Detail Tujuan: Jika INTERNAL */}
          {type === 'internal' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Sumber Internal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTargetTypeChange('kategori')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      targetType === 'kategori'
                        ? 'bg-white border-red-500 text-red-600 shadow-2xs'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <Tags className="w-3.5 h-3.5" />
                    <span>Kategori</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTargetTypeChange('page')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      targetType === 'page'
                        ? 'bg-white border-red-500 text-red-600 shadow-2xs'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Halaman</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTargetTypeChange('custom')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      targetType === 'custom'
                        ? 'bg-white border-red-500 text-red-600 shadow-2xs'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Kustom / Route</span>
                  </button>
                </div>
              </div>

              {/* Dropdown Kategori */}
              {targetType === 'kategori' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Kategori Berita CMS
                  </label>
                  <select
                    value={targetId}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name} ({cat.slug})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dropdown Halaman (Page) */}
              {targetType === 'page' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Halaman Statis CMS
                  </label>
                  <select
                    value={targetId}
                    onChange={(e) => handlePageSelect(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {pages.map((pg) => (
                      <option key={pg.id} value={pg.slug}>
                        {pg.title} (/{pg.slug})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Path */}
              {targetType === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jalur URL Internal Kustom
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Contoh: /video, /, /siaran-langsung"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              {/* Preview Hasil Otomatis */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Hasil Otomatis URL:</span>
                <span className="font-mono font-bold text-red-600 bg-red-100/60 px-2 py-0.5 rounded border border-red-200">
                  {url || '/'}
                </span>
              </div>
            </div>
          )}

          {/* Detail Tujuan: Jika EXTERNAL */}
          {type === 'external' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Eksternal Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/halaman"
                  className={`w-full px-3.5 py-2 bg-white border rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.url ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  }`}
                />
                {errors.url && <p className="text-xs text-red-500 mt-1 font-medium">{errors.url}</p>}
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-700">Buka di Tab Baru</div>
                  <div className="text-[11px] text-slate-400">
                    Menambahkan atribut target=&quot;_blank&quot; rel=&quot;noopener noreferrer&quot;
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="open-new-tab"
                  checked={openNewTab}
                  onChange={(e) => setOpenNewTab(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Urutan dan Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Urutan (Order)
              </label>
              <input
                type="number"
                min={1}
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Status Publikasi
              </label>
              <select
                value={active ? 'true' : 'false'}
                onChange={(e) => setActive(e.target.value === 'true')}
                className={`w-full px-3.5 py-2 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  active
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
              >
                <option value="true">Aktif (Tampil di SO2)</option>
                <option value="false">Nonaktif (Sembunyikan)</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{itemToEdit ? 'Simpan Perubahan' : 'Tambahkan Menu'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
