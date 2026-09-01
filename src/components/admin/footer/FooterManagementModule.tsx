import React, { useState, useEffect } from 'react';
import {
  Building2,
  Globe,
  ShieldCheck,
  Share2,
  Copyright,
  Image as ImageIcon,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Info,
  Sparkles,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  FileText,
  Code2,
  Network,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  X,
  Layers,
} from 'lucide-react';
import {
  FooterConfig,
  FooterValidationErrors,
  getStoredFooterConfig,
  saveFooterConfig,
  resetFooterConfig,
  validateFooterForm,
  generateOrganizationSchema,
} from '../../../data/footerAdminStore';
import { MediaNetworkItem } from '../../../types/footer';
import { MediaPickerModal } from '../media/MediaPickerModal';
import { AdminMedia } from '../../../types/admin';

interface FooterManagementModuleProps {
  onNavigateToPublic?: (path: string) => void;
}

type ActiveTab =
  | 'mediaInfo'
  | 'companyLinks'
  | 'legalLinks'
  | 'socialMedia'
  | 'copyright'
  | 'logo'
  | 'mediaNetworks'
  | 'seoSchema';

export const FooterManagementModule: React.FC<FooterManagementModuleProps> = ({
  onNavigateToPublic,
}) => {
  const [config, setConfig] = useState<FooterConfig>(() => getStoredFooterConfig());
  const [activeTab, setActiveTab] = useState<ActiveTab>('mediaInfo');
  const [errors, setErrors] = useState<FooterValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'footerLogo' | string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editingNetworkId, setEditingNetworkId] = useState<string | null>(null);

  // New Network Partner form draft state
  const [newNetwork, setNewNetwork] = useState<Partial<MediaNetworkItem>>({
    name: '',
    url: 'https://',
    presetStyle: 'custom',
    logoUrl: '',
    altText: '',
    isActive: true,
  });
  const [isAddingNetwork, setIsAddingNetwork] = useState(false);

  // Auto hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  // Generic updater for nested objects
  const handleMediaInfoChange = (field: keyof FooterConfig['mediaInfo'], value: string) => {
    setConfig((prev) => ({
      ...prev,
      mediaInfo: { ...prev.mediaInfo, [field]: value },
    }));
    // Clear error for that field
    if (errors.mediaInfo?.[field]) {
      setErrors((prev) => ({
        ...prev,
        mediaInfo: { ...prev.mediaInfo, [field]: undefined },
      }));
    }
  };

  const handleCompanyLinkChange = (field: keyof FooterConfig['companyLinks'], value: string) => {
    setConfig((prev) => ({
      ...prev,
      companyLinks: { ...prev.companyLinks, [field]: value },
    }));
    if (errors.companyLinks?.[field]) {
      setErrors((prev) => ({
        ...prev,
        companyLinks: { ...prev.companyLinks, [field]: undefined },
      }));
    }
  };

  const handleLegalLinkChange = (field: keyof FooterConfig['legalLinks'], value: string) => {
    setConfig((prev) => ({
      ...prev,
      legalLinks: { ...prev.legalLinks, [field]: value },
    }));
    if (errors.legalLinks?.[field]) {
      setErrors((prev) => ({
        ...prev,
        legalLinks: { ...prev.legalLinks, [field]: undefined },
      }));
    }
  };

  const handleSocialMediaChange = (field: keyof FooterConfig['socialMedia'], value: any) => {
    setConfig((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [field]: value },
    }));
    if (errors.socialMedia?.[field]) {
      setErrors((prev) => ({
        ...prev,
        socialMedia: { ...prev.socialMedia, [field]: undefined },
      }));
    }
  };

  const handleLogoChange = (field: keyof FooterConfig['logo'], value: any) => {
    setConfig((prev) => ({
      ...prev,
      logo: { ...prev.logo, [field]: value },
    }));
  };

  const handleCopyrightChange = (field: keyof FooterConfig['copyright'], value: string) => {
    setConfig((prev) => ({
      ...prev,
      copyright: { ...prev.copyright, [field]: value },
    }));
    if (errors.copyright?.[field]) {
      setErrors((prev) => ({
        ...prev,
        copyright: { ...prev.copyright, [field]: undefined },
      }));
    }
  };

  const handleLogoSelect = (media: AdminMedia) => {
    if (mediaPickerTarget === 'footerLogo' || !mediaPickerTarget) {
      setConfig((prev) => ({
        ...prev,
        logo: {
          logoUrl: media.url,
          altText: media.altText || prev.logo.altText || 'BatuTV Media Logo',
          mediaId: media.id,
        },
      }));
      showToast(`Logo footer diperbarui: ${media.filename}`, 'success');
    } else if (mediaPickerTarget === 'newNetwork') {
      setNewNetwork((prev) => ({
        ...prev,
        logoUrl: media.url,
        altText: media.altText || prev.name || 'Media Partner Logo',
      }));
      showToast(`Logo partner dipilih: ${media.filename}`, 'success');
    } else {
      // It's a specific network ID
      const targetId = mediaPickerTarget;
      setConfig((prev) => ({
        ...prev,
        mediaNetworks: (prev.mediaNetworks || []).map((net) =>
          net.id === targetId
            ? { ...net, logoUrl: media.url, altText: media.altText || net.name }
            : net
        ),
      }));
      showToast(`Logo partner diperbarui: ${media.filename}`, 'success');
    }
    setIsMediaPickerOpen(false);
    setMediaPickerTarget(null);
  };

  // Media Network Handlers
  const handleToggleNetworkActive = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      mediaNetworks: (prev.mediaNetworks || []).map((net) =>
        net.id === id ? { ...net, isActive: !net.isActive } : net
      ),
    }));
  };

  const handleMoveNetwork = (index: number, direction: 'up' | 'down') => {
    const list = [...(config.mediaNetworks || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // reassign order numbers
    const updated = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    setConfig((prev) => ({ ...prev, mediaNetworks: updated }));
  };

  const handleUpdateNetworkField = (
    id: string,
    field: keyof MediaNetworkItem,
    value: any
  ) => {
    setConfig((prev) => ({
      ...prev,
      mediaNetworks: (prev.mediaNetworks || []).map((net) =>
        net.id === id ? { ...net, [field]: value } : net
      ),
    }));
  };

  const handleDeleteNetwork = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      mediaNetworks: (prev.mediaNetworks || []).filter((net) => net.id !== id),
    }));
    showToast('Partner media network dihapus.', 'success');
  };

  const handleAddNetworkSubmit = () => {
    if (!newNetwork.name?.trim()) {
      showToast('Nama Media Network wajib diisi.', 'error');
      return;
    }
    if (!newNetwork.url?.trim() || newNetwork.url === 'https://') {
      showToast('Target URL tautan wajib diisi.', 'error');
      return;
    }

    const newItem: MediaNetworkItem = {
      id: `net-${Date.now()}`,
      name: newNetwork.name.trim(),
      url: newNetwork.url.trim(),
      presetStyle: newNetwork.presetStyle || 'custom',
      logoUrl: newNetwork.logoUrl?.trim() || undefined,
      altText: newNetwork.altText?.trim() || newNetwork.name.trim(),
      order: (config.mediaNetworks?.length || 0) + 1,
      isActive: newNetwork.isActive !== false,
    };

    setConfig((prev) => ({
      ...prev,
      mediaNetworks: [...(prev.mediaNetworks || []), newItem],
    }));

    setNewNetwork({
      name: '',
      url: 'https://',
      presetStyle: 'custom',
      logoUrl: '',
      altText: '',
      isActive: true,
    });
    setIsAddingNetwork(false);
    showToast(`Partner media "${newItem.name}" berhasil ditambahkan!`, 'success');
  };

  // Submit & Save
  const handleSave = () => {
    const validation = validateFooterForm(config);
    if (!validation.isValid) {
      setErrors(validation.errors);
      showToast('Terdapat kesalahan input. Silakan periksa formulir.', 'error');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const ok = saveFooterConfig(config);
      setIsSaving(false);
      if (ok) {
        setErrors({});
        showToast('Konfigurasi Footer berhasil disimpan dan langsung aktif di seluruh website!', 'success');
      } else {
        showToast('Gagal menyimpan konfigurasi footer.', 'error');
      }
    }, 300);
  };

  // Handle Reset to initial template
  const handleResetToDefault = () => {
    const defaults = resetFooterConfig();
    setConfig(defaults);
    setErrors({});
    setShowResetConfirm(false);
    showToast('Konfigurasi Footer berhasil dikembalikan ke format awal.', 'success');
  };

  const schemaJson = JSON.stringify(generateOrganizationSchema(config), null, 2);

  const tabs: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    {
      id: 'mediaInfo',
      label: '1. Informasi Media',
      icon: Building2,
      badge: Object.keys(errors.mediaInfo || {}).filter((k) => !!(errors.mediaInfo as any)[k]).length || undefined,
    },
    {
      id: 'companyLinks',
      label: '2. Link Perusahaan',
      icon: Globe,
      badge: Object.keys(errors.companyLinks || {}).filter((k) => !!(errors.companyLinks as any)[k]).length || undefined,
    },
    {
      id: 'legalLinks',
      label: '3. Link Legal',
      icon: ShieldCheck,
      badge: Object.keys(errors.legalLinks || {}).filter((k) => !!(errors.legalLinks as any)[k]).length || undefined,
    },
    {
      id: 'socialMedia',
      label: '4. Sosial Media',
      icon: Share2,
      badge: Object.keys(errors.socialMedia || {}).filter((k) => !!(errors.socialMedia as any)[k]).length || undefined,
    },
    {
      id: 'copyright',
      label: '5. Copyright',
      icon: Copyright,
      badge: Object.keys(errors.copyright || {}).filter((k) => !!(errors.copyright as any)[k]).length || undefined,
    },
    {
      id: 'logo',
      label: '6. Logo Footer',
      icon: ImageIcon,
    },
    {
      id: 'mediaNetworks',
      label: '7. Media Network Links',
      icon: Network,
      badge: (config.mediaNetworks || []).filter((n) => n.isActive !== false).length || undefined,
    },
    {
      id: 'seoSchema',
      label: 'SEO Schema',
      icon: Code2,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all duration-300 transform translate-y-0 ${
            toastType === 'success'
              ? 'bg-emerald-800 text-emerald-50 border border-emerald-700'
              : 'bg-rose-800 text-rose-50 border border-rose-700'
          }`}
        >
          {toastType === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner & Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Master Data • Konten Footer Dinamis</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Footer Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">
            Kelola data dan konten footer BATUTV tanpa mengubah struktur layout, warna resmi (#222222), serta responsive grid yang telah ada.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center gap-1.5"
            title="Kembalikan ke data default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          {onNavigateToPublic && (
            <button
              type="button"
              onClick={() => onNavigateToPublic('/')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Lihat Frontend</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:scale-98 rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
              <span>{t.label}</span>
              {t.badge && t.badge > 0 ? (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                  {t.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        
        {/* ========================================================= */}
        {/* TAB 1: INFORMASI MEDIA                                    */}
        {/* ========================================================= */}
        {activeTab === 'mediaInfo' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-600" />
                <span>Section 1: Informasi Media & Kontak Penerbit</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Data profil lembaga pers, alamat kantor redaksi, surel resmi, dan saluran narahubung.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nama Media */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Media <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.mediaInfo.mediaName}
                  onChange={(e) => handleMediaInfoChange('mediaName', e.target.value)}
                  placeholder="Contoh: BATUTV Media Network"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.mediaInfo?.mediaName
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                  } focus:outline-hidden focus:ring-3 transition-all`}
                />
                {errors.mediaInfo?.mediaName && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.mediaInfo.mediaName}</p>
                )}
              </div>

              {/* Deskripsi Singkat */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Deskripsi Singkat Media
                </label>
                <textarea
                  rows={2}
                  value={config.mediaInfo.shortDescription}
                  onChange={(e) => handleMediaInfoChange('shortDescription', e.target.value)}
                  placeholder="Deskripsi singkat profil media dan visi jurnalisme..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-red-500 focus:ring-3 focus:ring-red-100 focus:outline-hidden transition-all resize-none"
                />
                <span className="text-[11px] text-slate-400">
                  Digunakan untuk metadata SEO schema dan deskripsi publisher.
                </span>
              </div>

              {/* Alamat */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Alamat Kantor Redaksi</span>
                </label>
                <input
                  type="text"
                  value={config.mediaInfo.address}
                  onChange={(e) => handleMediaInfoChange('address', e.target.value)}
                  placeholder="Jl. TVRI No. 1, Oro-Oro Ombo, Kec. Batu"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-red-500 focus:ring-3 focus:ring-red-100 focus:outline-hidden transition-all"
                />
              </div>

              {/* Kota */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kota / Kabupaten</label>
                <input
                  type="text"
                  value={config.mediaInfo.city}
                  onChange={(e) => handleMediaInfoChange('city', e.target.value)}
                  placeholder="Kota Batu"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-red-500 focus:ring-3 focus:ring-red-100 focus:outline-hidden transition-all"
                />
              </div>

              {/* Provinsi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Provinsi</label>
                <input
                  type="text"
                  value={config.mediaInfo.province}
                  onChange={(e) => handleMediaInfoChange('province', e.target.value)}
                  placeholder="Jawa Timur"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-red-500 focus:ring-3 focus:ring-red-100 focus:outline-hidden transition-all"
                />
              </div>

              {/* Kode Pos */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kode Pos</label>
                <input
                  type="text"
                  value={config.mediaInfo.postalCode}
                  onChange={(e) => handleMediaInfoChange('postalCode', e.target.value)}
                  placeholder="65316"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-red-500 focus:ring-3 focus:ring-red-100 focus:outline-hidden transition-all"
                />
              </div>

              {/* Nomor Telepon */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nomor Telepon</span>
                </label>
                <input
                  type="text"
                  value={config.mediaInfo.phoneNumber}
                  onChange={(e) => handleMediaInfoChange('phoneNumber', e.target.value)}
                  placeholder="+62 341 590001"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.mediaInfo?.phoneNumber
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                  } focus:outline-hidden focus:ring-3 transition-all`}
                />
                {errors.mediaInfo?.phoneNumber && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.mediaInfo.phoneNumber}</p>
                )}
              </div>

              {/* Email Redaksi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Redaksi</span>
                </label>
                <input
                  type="email"
                  value={config.mediaInfo.editorialEmail}
                  onChange={(e) => handleMediaInfoChange('editorialEmail', e.target.value)}
                  placeholder="redaksi@batutv.id"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.mediaInfo?.editorialEmail
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                  } focus:outline-hidden focus:ring-3 transition-all`}
                />
                {errors.mediaInfo?.editorialEmail && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.mediaInfo.editorialEmail}</p>
                )}
              </div>

              {/* Email Bisnis */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Bisnis / Iklan</span>
                </label>
                <input
                  type="email"
                  value={config.mediaInfo.businessEmail}
                  onChange={(e) => handleMediaInfoChange('businessEmail', e.target.value)}
                  placeholder="marketing@batutv.id"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.mediaInfo?.businessEmail
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                  } focus:outline-hidden focus:ring-3 transition-all`}
                />
                {errors.mediaInfo?.businessEmail && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.mediaInfo.businessEmail}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp Hotline</span>
                </label>
                <input
                  type="text"
                  value={config.mediaInfo.whatsappNumber}
                  onChange={(e) => handleMediaInfoChange('whatsappNumber', e.target.value)}
                  placeholder="+62 812-3456-7890"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.mediaInfo?.whatsappNumber
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                  } focus:outline-hidden focus:ring-3 transition-all`}
                />
                {errors.mediaInfo?.whatsappNumber && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.mediaInfo.whatsappNumber}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: LINK PERUSAHAAN                                    */}
        {/* ========================================================= */}
        {activeTab === 'companyLinks' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-red-600" />
                <span>Section 2: Link Informasi Perusahaan</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tentukan target URL halaman profil perusahaan yang tertera pada navigasi footer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Tentang Kami */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  URL "Tentang Kami"
                </label>
                <input
                  type="text"
                  value={config.companyLinks.tentangKamiUrl}
                  onChange={(e) => handleCompanyLinkChange('tentangKamiUrl', e.target.value)}
                  placeholder="/tentang-kami atau https://..."
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.companyLinks?.tentangKamiUrl
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                  } focus:outline-hidden focus:ring-3 transition-all`}
                />
                {errors.companyLinks?.tentangKamiUrl && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.companyLinks.tentangKamiUrl}</p>
                )}
              </div>

              {/* Redaksi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  URL "Redaksi" / Susunan Pengurus
                </label>
                <input
                  type="text"
                  value={config.companyLinks.redaksiUrl}
                  onChange={(e) => handleCompanyLinkChange('redaksiUrl', e.target.value)}
                  placeholder="/redaksi atau https://..."
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.companyLinks?.redaksiUrl
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                  } focus:outline-hidden focus:ring-3 transition-all`}
                />
                {errors.companyLinks?.redaksiUrl && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.companyLinks.redaksiUrl}</p>
                )}
              </div>

              {/* Kontak */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  URL "Kontak"
                </label>
                <input
                  type="text"
                  value={config.companyLinks.kontakUrl}
                  onChange={(e) => handleCompanyLinkChange('kontakUrl', e.target.value)}
                  placeholder="/kontak-kami atau https://..."
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.companyLinks?.kontakUrl
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                  } focus:outline-hidden focus:ring-3 transition-all`}
                />
                {errors.companyLinks?.kontakUrl && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.companyLinks.kontakUrl}</p>
                )}
              </div>

              {/* Karir */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  URL "Karir" / Rekrutmen
                </label>
                <input
                  type="text"
                  value={config.companyLinks.karirUrl}
                  onChange={(e) => handleCompanyLinkChange('karirUrl', e.target.value)}
                  placeholder="/karir atau https://..."
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.companyLinks?.karirUrl
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                  } focus:outline-hidden focus:ring-3 transition-all`}
                />
                {errors.companyLinks?.karirUrl && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.companyLinks.karirUrl}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: LINK LEGAL                                         */}
        {/* ========================================================= */}
        {activeTab === 'legalLinks' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>Section 3: Link Kebijakan & Regulasi Legal</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Kelola tautan kepatuhan dewan pers, pedoman media siber, sanggahan, serta privasi pengguna.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Pedoman Media Siber */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pedoman Media Siber
                </label>
                <input
                  type="text"
                  value={config.legalLinks.pedomanMediaSiberUrl}
                  onChange={(e) => handleLegalLinkChange('pedomanMediaSiberUrl', e.target.value)}
                  placeholder="/pedoman-media-siber"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.legalLinks?.pedomanMediaSiberUrl
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                  } focus:outline-hidden focus:ring-3 transition-all`}
                />
                {errors.legalLinks?.pedomanMediaSiberUrl && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.legalLinks.pedomanMediaSiberUrl}</p>
                )}
              </div>

              {/* Kode Etik Jurnalistik */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kode Etik Jurnalistik
                </label>
                <input
                  type="text"
                  value={config.legalLinks.kodeEtikJurnalistikUrl}
                  onChange={(e) => handleLegalLinkChange('kodeEtikJurnalistikUrl', e.target.value)}
                  placeholder="/kode-etik-jurnalistik"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.legalLinks?.kodeEtikJurnalistikUrl
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                  } focus:outline-hidden focus:ring-3 transition-all`}
                />
                {errors.legalLinks?.kodeEtikJurnalistikUrl && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.legalLinks.kodeEtikJurnalistikUrl}</p>
                )}
              </div>

              {/* Disclaimer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Disclaimer / Sanggahan
                </label>
                <input
                  type="text"
                  value={config.legalLinks.disclaimerUrl}
                  onChange={(e) => handleLegalLinkChange('disclaimerUrl', e.target.value)}
                  placeholder="/disclaimer"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.legalLinks?.disclaimerUrl
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                  } focus:outline-hidden focus:ring-3 transition-all`}
                />
                {errors.legalLinks?.disclaimerUrl && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.legalLinks.disclaimerUrl}</p>
                )}
              </div>

              {/* Privacy Policy */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Privacy Policy / Kebijakan Privasi
                </label>
                <input
                  type="text"
                  value={config.legalLinks.privacyPolicyUrl}
                  onChange={(e) => handleLegalLinkChange('privacyPolicyUrl', e.target.value)}
                  placeholder="/kebijakan-privasi"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.legalLinks?.privacyPolicyUrl
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                  } focus:outline-hidden focus:ring-3 transition-all`}
                />
                {errors.legalLinks?.privacyPolicyUrl && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.legalLinks.privacyPolicyUrl}</p>
                )}
              </div>

              {/* Terms of Service */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Terms of Service / Syarat & Ketentuan
                </label>
                <input
                  type="text"
                  value={config.legalLinks.termsOfServiceUrl}
                  onChange={(e) => handleLegalLinkChange('termsOfServiceUrl', e.target.value)}
                  placeholder="/syarat-ketentuan"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.legalLinks?.termsOfServiceUrl
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                  } focus:outline-hidden focus:ring-3 transition-all`}
                />
                {errors.legalLinks?.termsOfServiceUrl && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.legalLinks.termsOfServiceUrl}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SOSIAL MEDIA                                       */}
        {/* ========================================================= */}
        {activeTab === 'socialMedia' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-red-600" />
                  <span>Section 4: Akun Sosial Media & Pengaturan Tampilan Link</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Atur link dan visibilitas masing-masing akun sosial media resmi pada footer situs web.
                </p>
              </div>

              {/* Master Section Toggle */}
              <div className="flex items-center gap-3 bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Tampilkan Section Medsos:</span>
                <button
                  type="button"
                  onClick={() =>
                    handleSocialMediaChange('showSection', config.socialMedia.showSection === false ? true : false)
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    config.socialMedia.showSection !== false ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={config.socialMedia.showSection !== false}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      config.socialMedia.showSection !== false ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    config.socialMedia.showSection !== false
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {config.socialMedia.showSection !== false ? 'Aktif' : 'Disembunyikan'}
                </span>
              </div>
            </div>

            {/* Section Heading Text */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Teks Judul / Heading Section Sosial Media
              </label>
              <input
                type="text"
                value={config.socialMedia.headingText ?? 'Ikuti kami di:'}
                onChange={(e) => handleSocialMediaChange('headingText', e.target.value)}
                placeholder="Ikuti kami di:"
                className="w-full max-w-md px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:border-red-500 focus:ring-3 focus:ring-red-100 focus:outline-hidden transition-all"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Teks pengantar di atas barisan ikon sosial media. Kosongkan jika tidak ingin menampilkan teks.
              </p>
            </div>

            {/* Social Media Platforms Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Facebook */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center text-white shrink-0">
                      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold text-slate-800">Facebook</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {config.socialMedia.showFacebook !== false ? 'Tampil' : 'Sembunyi'}
                    </span>
                    <input
                      type="checkbox"
                      checked={config.socialMedia.showFacebook !== false}
                      onChange={(e) => handleSocialMediaChange('showFacebook', e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
                <div>
                  <input
                    type="text"
                    value={config.socialMedia.facebookUrl || ''}
                    onChange={(e) => handleSocialMediaChange('facebookUrl', e.target.value)}
                    placeholder="https://facebook.com/batutvofficial"
                    className={`w-full px-3 py-2 text-xs rounded-lg border ${
                      errors.socialMedia?.facebookUrl
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                    } focus:outline-hidden focus:ring-2 transition-all`}
                  />
                  {errors.socialMedia?.facebookUrl && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.socialMedia.facebookUrl}</p>
                  )}
                </div>
              </div>

              {/* Instagram */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shrink-0">
                      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold text-slate-800">Instagram</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {config.socialMedia.showInstagram !== false ? 'Tampil' : 'Sembunyi'}
                    </span>
                    <input
                      type="checkbox"
                      checked={config.socialMedia.showInstagram !== false}
                      onChange={(e) => handleSocialMediaChange('showInstagram', e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
                <div>
                  <input
                    type="text"
                    value={config.socialMedia.instagramUrl || ''}
                    onChange={(e) => handleSocialMediaChange('instagramUrl', e.target.value)}
                    placeholder="https://instagram.com/batutv_official"
                    className={`w-full px-3 py-2 text-xs rounded-lg border ${
                      errors.socialMedia?.instagramUrl
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                    } focus:outline-hidden focus:ring-2 transition-all`}
                  />
                  {errors.socialMedia?.instagramUrl && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.socialMedia.instagramUrl}</p>
                  )}
                </div>
              </div>

              {/* YouTube */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#FF0000] flex items-center justify-center text-white shrink-0">
                      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold text-slate-800">YouTube</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {config.socialMedia.showYoutube !== false ? 'Tampil' : 'Sembunyi'}
                    </span>
                    <input
                      type="checkbox"
                      checked={config.socialMedia.showYoutube !== false}
                      onChange={(e) => handleSocialMediaChange('showYoutube', e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
                <div>
                  <input
                    type="text"
                    value={config.socialMedia.youtubeUrl || ''}
                    onChange={(e) => handleSocialMediaChange('youtubeUrl', e.target.value)}
                    placeholder="https://youtube.com/@batutv"
                    className={`w-full px-3 py-2 text-xs rounded-lg border ${
                      errors.socialMedia?.youtubeUrl
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                    } focus:outline-hidden focus:ring-2 transition-all`}
                  />
                  {errors.socialMedia?.youtubeUrl && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.socialMedia.youtubeUrl}</p>
                  )}
                </div>
              </div>

              {/* TikTok */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white shrink-0">
                      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.78 1.53-.05 2.87-1.16 3.15-2.66.07-.37.09-.76.09-1.14V.02z" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold text-slate-800">TikTok</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {config.socialMedia.showTiktok !== false ? 'Tampil' : 'Sembunyi'}
                    </span>
                    <input
                      type="checkbox"
                      checked={config.socialMedia.showTiktok !== false}
                      onChange={(e) => handleSocialMediaChange('showTiktok', e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
                <div>
                  <input
                    type="text"
                    value={config.socialMedia.tiktokUrl || ''}
                    onChange={(e) => handleSocialMediaChange('tiktokUrl', e.target.value)}
                    placeholder="https://tiktok.com/@batutv"
                    className={`w-full px-3 py-2 text-xs rounded-lg border ${
                      errors.socialMedia?.tiktokUrl
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                    } focus:outline-hidden focus:ring-2 transition-all`}
                  />
                  {errors.socialMedia?.tiktokUrl && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.socialMedia.tiktokUrl}</p>
                  )}
                </div>
              </div>

              {/* X / Twitter */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white shrink-0">
                      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold text-slate-800">X (Twitter)</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {config.socialMedia.showXTwitter !== false ? 'Tampil' : 'Sembunyi'}
                    </span>
                    <input
                      type="checkbox"
                      checked={config.socialMedia.showXTwitter !== false}
                      onChange={(e) => handleSocialMediaChange('showXTwitter', e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
                <div>
                  <input
                    type="text"
                    value={config.socialMedia.xTwitterUrl || ''}
                    onChange={(e) => handleSocialMediaChange('xTwitterUrl', e.target.value)}
                    placeholder="https://x.com/batutv_official"
                    className={`w-full px-3 py-2 text-xs rounded-lg border ${
                      errors.socialMedia?.xTwitterUrl
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                    } focus:outline-hidden focus:ring-2 transition-all`}
                  />
                  {errors.socialMedia?.xTwitterUrl && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.socialMedia.xTwitterUrl}</p>
                  )}
                </div>
              </div>

              {/* Google News */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M3 4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4z" />
                        <path fill="#EA4335" d="M14.5 7h4v10h-4z" />
                        <path fill="#FBBC05" d="M5.5 7h7v2.5h-7z" />
                        <path fill="#34A853" d="M5.5 11h7v2.5h-7z" />
                        <path fill="#ffffff" d="M5.5 15h7v1.8h-7z" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold text-slate-800">Google News</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {config.socialMedia.showGoogleNews !== false ? 'Tampil' : 'Sembunyi'}
                    </span>
                    <input
                      type="checkbox"
                      checked={config.socialMedia.showGoogleNews !== false}
                      onChange={(e) => handleSocialMediaChange('showGoogleNews', e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
                <div>
                  <input
                    type="text"
                    value={config.socialMedia.googleNewsUrl || ''}
                    onChange={(e) => handleSocialMediaChange('googleNewsUrl', e.target.value)}
                    placeholder="https://news.google.com"
                    className={`w-full px-3 py-2 text-xs rounded-lg border ${
                      errors.socialMedia?.googleNewsUrl
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                    } focus:outline-hidden focus:ring-2 transition-all`}
                  />
                  {errors.socialMedia?.googleNewsUrl && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.socialMedia.googleNewsUrl}</p>
                  )}
                </div>
              </div>

              {/* Telegram */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#24A1DE] flex items-center justify-center text-white shrink-0">
                      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12C0 18.63 5.37 24 12 24C18.63 24 24 18.63 24 12C24 5.37 18.63 0 12 0ZM17.9 8.24L15.93 17.52C15.78 18.18 15.39 18.34 14.84 18.03L11.84 15.82L10.39 17.21C10.23 17.37 10.1 17.5 9.79 17.5L10.01 14.45L15.56 9.44C15.8 9.22 15.51 9.1 15.19 9.31L8.33 13.63L5.37 12.7C4.73 12.5 4.71 12.06 5.5 11.75L17.07 7.29C17.61 7.09 18.08 7.42 17.9 8.24Z" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold text-slate-800">Telegram Channel</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {config.socialMedia.showTelegram !== false ? 'Tampil' : 'Sembunyi'}
                    </span>
                    <input
                      type="checkbox"
                      checked={config.socialMedia.showTelegram !== false}
                      onChange={(e) => handleSocialMediaChange('showTelegram', e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
                <div>
                  <input
                    type="text"
                    value={config.socialMedia.telegramUrl || ''}
                    onChange={(e) => handleSocialMediaChange('telegramUrl', e.target.value)}
                    placeholder="https://t.me/batutvchannel"
                    className={`w-full px-3 py-2 text-xs rounded-lg border ${
                      errors.socialMedia?.telegramUrl
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                    } focus:outline-hidden focus:ring-2 transition-all`}
                  />
                  {errors.socialMedia?.telegramUrl && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.socialMedia.telegramUrl}</p>
                  )}
                </div>
              </div>

              {/* LinkedIn */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#0077B5] flex items-center justify-center text-white shrink-0">
                      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </span>
                    <span className="text-xs font-bold text-slate-800">LinkedIn (Opsional)</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {config.socialMedia.showLinkedIn !== false ? 'Tampil' : 'Sembunyi'}
                    </span>
                    <input
                      type="checkbox"
                      checked={config.socialMedia.showLinkedIn !== false}
                      onChange={(e) => handleSocialMediaChange('showLinkedIn', e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
                <div>
                  <input
                    type="text"
                    value={config.socialMedia.linkedInUrl || ''}
                    onChange={(e) => handleSocialMediaChange('linkedInUrl', e.target.value)}
                    placeholder="https://linkedin.com/company/batutv"
                    className={`w-full px-3 py-2 text-xs rounded-lg border ${
                      errors.socialMedia?.linkedInUrl
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                    } focus:outline-hidden focus:ring-2 transition-all`}
                  />
                  {errors.socialMedia?.linkedInUrl && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.socialMedia.linkedInUrl}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Real-time Footer Social Live Preview */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-red-500" />
                  <span>Live Preview Bagian Sosial Media di Footer (Dark Canvas #222222)</span>
                </span>
                {config.socialMedia.showSection === false && (
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                    Section dinonaktifkan / disembunyikan
                  </span>
                )}
              </div>

              <div className="w-full bg-[#222222] rounded-xl border border-slate-700/60 p-6 flex flex-col items-center justify-center text-center">
                {config.socialMedia.showSection === false ? (
                  <div className="text-xs text-slate-500 py-3 italic flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-slate-600" />
                    <span>Seluruh section media sosial disembunyikan dari footer.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {config.socialMedia.headingText !== '' && (
                      <span className="text-xs font-normal text-slate-300">
                        {config.socialMedia.headingText || 'Ikuti kami di:'}
                      </span>
                    )}
                    <div className="flex items-center justify-center gap-2.5 flex-wrap">
                      {config.socialMedia.showFacebook !== false && config.socialMedia.facebookUrl && (
                        <span className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-sm" title="Facebook">
                          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        </span>
                      )}
                      {config.socialMedia.showXTwitter !== false && config.socialMedia.xTwitterUrl && (
                        <span className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white shadow-sm" title="X">
                          <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </span>
                      )}
                      {config.socialMedia.showGoogleNews !== false && (
                        <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm" title="Google News">
                          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M3 4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4z" /><path fill="#EA4335" d="M14.5 7h4v10h-4z" /><path fill="#FBBC05" d="M5.5 7h7v2.5h-7z" /><path fill="#34A853" d="M5.5 11h7v2.5h-7z" /><path fill="#ffffff" d="M5.5 15h7v1.8h-7z" /></svg>
                        </span>
                      )}
                      {config.socialMedia.showTiktok !== false && config.socialMedia.tiktokUrl && (
                        <span className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white shadow-sm" title="TikTok">
                          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.78 1.53-.05 2.87-1.16 3.15-2.66.07-.37.09-.76.09-1.14V.02z" /></svg>
                        </span>
                      )}
                      {config.socialMedia.showInstagram !== false && config.socialMedia.instagramUrl && (
                        <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-sm" title="Instagram">
                          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                        </span>
                      )}
                      {config.socialMedia.showYoutube !== false && config.socialMedia.youtubeUrl && (
                        <span className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center text-white shadow-sm" title="YouTube">
                          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                        </span>
                      )}
                      {config.socialMedia.showTelegram !== false && config.socialMedia.telegramUrl && (
                        <span className="w-8 h-8 rounded-full bg-[#24A1DE] flex items-center justify-center text-white shadow-sm" title="Telegram">
                          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12C0 18.63 5.37 24 12 24C18.63 24 24 18.63 24 12C24 5.37 18.63 0 12 0ZM17.9 8.24L15.93 17.52C15.78 18.18 15.39 18.34 14.84 18.03L11.84 15.82L10.39 17.21C10.23 17.37 10.1 17.5 9.79 17.5L10.01 14.45L15.56 9.44C15.8 9.22 15.51 9.1 15.19 9.31L8.33 13.63L5.37 12.7C4.73 12.5 4.71 12.06 5.5 11.75L17.07 7.29C17.61 7.09 18.08 7.42 17.9 8.24Z" /></svg>
                        </span>
                      )}
                      {config.socialMedia.showLinkedIn !== false && config.socialMedia.linkedInUrl && (
                        <span className="w-8 h-8 rounded-full bg-[#0077B5] flex items-center justify-center text-white shadow-sm" title="LinkedIn">
                          <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: COPYRIGHT                                          */}
        {/* ========================================================= */}
        {activeTab === 'copyright' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Copyright className="w-4 h-4 text-red-600" />
                <span>Section 5: Teks Hak Cipta & Jaringan Media</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Atur teks pernyataan hak cipta (copyright) dan keterangan keanggotaan grup media.
              </p>
            </div>

            <div className="space-y-5 max-w-3xl">
              {/* Copyright Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Copyright Text <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.copyright.copyrightText}
                  onChange={(e) => handleCopyrightChange('copyrightText', e.target.value)}
                  placeholder="© 2026 BATUTV Media Network. All Rights Reserved."
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.copyright?.copyrightText
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-100'
                  } focus:outline-hidden focus:ring-3 transition-all`}
                />
                {errors.copyright?.copyrightText && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.copyright.copyrightText}</p>
                )}
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Contoh: "© 2026 BATUTV Media Network. All Rights Reserved."
                </span>
              </div>

              {/* Network Subtitle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Network Subtitle (Grup/Afiliasi Jaringan)
                </label>
                <input
                  type="text"
                  value={config.copyright.networkSubtitle}
                  onChange={(e) => handleCopyrightChange('networkSubtitle', e.target.value)}
                  placeholder="A Group Member of Batu Digital Media Network"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-red-500 focus:ring-3 focus:ring-red-100 focus:outline-hidden transition-all"
                />
              </div>

              {/* Visual Box Preview */}
              <div className="bg-[#222222] p-4 rounded-xl text-center text-white space-y-1">
                <div className="text-[11px] text-slate-400 font-mono mb-2 border-b border-slate-700 pb-1">
                  PREVIEW TEKS HAK CIPTA FRONTEND
                </div>
                <p className="text-xs sm:text-[13px] text-slate-300 font-normal">
                  {config.copyright.copyrightText || '© 2026 BATUTV Media Network. All Rights Reserved.'}
                </p>
                {config.copyright.networkSubtitle && (
                  <p className="text-xs sm:text-[13px] text-slate-400 font-normal">
                    {config.copyright.networkSubtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: LOGO FOOTER (Media Library Picker & Toggle)         */}
        {/* ========================================================= */}
        {activeTab === 'logo' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-red-600" />
                  <span>Section 6: Logo Footer & Brand Asset</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Atur tampilan, visibilitas (tampilkan/sembunyikan), serta aset logo footer situs web.
                </p>
              </div>

              {/* Master Logo Visibility Toggle */}
              <div className="flex items-center gap-3 bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Tampilkan Logo di Footer:</span>
                <button
                  type="button"
                  onClick={() =>
                    handleLogoChange('showLogo', config.logo.showLogo === false ? true : false)
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    config.logo.showLogo !== false ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={config.logo.showLogo !== false}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      config.logo.showLogo !== false ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    config.logo.showLogo !== false
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {config.logo.showLogo !== false ? 'Aktif' : 'Disembunyikan'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Logo Footer URL / Path
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={config.logo.logoUrl}
                      onChange={(e) => handleLogoChange('logoUrl', e.target.value)}
                      placeholder="/brand/batutv-logo.svg atau https://..."
                      className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-red-500 focus:ring-3 focus:ring-red-100 focus:outline-hidden transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-slate-500" />
                      <span>Media Library</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alt Text Gambar Logo
                  </label>
                  <input
                    type="text"
                    value={config.logo.altText}
                    onChange={(e) => handleLogoChange('altText', e.target.value)}
                    placeholder="BatuTV Media Network"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-red-500 focus:ring-3 focus:ring-red-100 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-red-500" />
                    <span>Live Preview Logo (Dark Canvas #222222)</span>
                  </span>
                  {config.logo.showLogo === false && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                      Logo Disembunyikan
                    </span>
                  )}
                </div>
                
                <div className="w-full max-w-[260px] h-28 bg-[#222222] rounded-xl border border-slate-700/60 flex items-center justify-center p-4">
                  {config.logo.showLogo === false ? (
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 italic">
                      <EyeOff className="w-4 h-4 text-slate-600" />
                      <span>Logo footer disembunyikan</span>
                    </div>
                  ) : config.logo.logoUrl ? (
                    <img
                      src={config.logo.logoUrl}
                      alt={config.logo.altText || 'Logo Preview'}
                      className="max-h-16 max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-xs text-slate-500">Belum ada logo dipilih</span>
                  )}
                </div>

                <p className="text-xs text-slate-400">
                  {config.logo.showLogo === false
                    ? 'Status: Tidak ditampilkan pada footer'
                    : config.logo.altText || 'BatuTV Media Network'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: MEDIA NETWORK LOGOS & LINKS                        */}
        {/* ========================================================= */}
        {activeTab === 'mediaNetworks' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Network className="w-4 h-4 text-red-600" />
                  <span>Section 7: Media Network Partners & Konsorsium Logos</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Kelola daftar logo jaringan media/afiliasi lengkap dengan link URL tujuan masing-masing (VIVA, VLIX, tvOnenews, antvklik, INTIP SELEB, jago dangdut, atau custom partner baru).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingNetwork(!isAddingNetwork)}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-98 rounded-xl transition-all flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
              >
                {isAddingNetwork ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{isAddingNetwork ? 'Tutup Formulir' : 'Tambah Media Partner'}</span>
              </button>
            </div>

            {/* Live Interactive Footer Network Bar Preview */}
            <div className="bg-[#222222] p-5 rounded-2xl border border-slate-800 text-center space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Live Preview Baris Media Network di Frontend (#222222)</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {(config.mediaNetworks || []).filter((n) => n.isActive !== false).length} Aktif
                </span>
              </div>

              <div className="flex items-center justify-center gap-4 sm:gap-7 flex-wrap py-2">
                {(config.mediaNetworks || [])
                  .filter((item) => item.isActive !== false)
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((item) => {
                    const renderLogo = () => {
                      if (item.logoUrl) {
                        return (
                          <img
                            src={item.logoUrl}
                            alt={item.altText || item.name}
                            className="h-5 sm:h-6 max-w-[120px] object-contain"
                          />
                        );
                      }

                      switch (item.presetStyle) {
                        case 'viva':
                          return (
                            <div className="flex items-center gap-1.5 text-white">
                              <span className="font-black text-lg sm:text-xl tracking-tighter">VIVA</span>
                              <div className="text-[8px] sm:text-[9px] font-semibold leading-tight text-left text-slate-300">
                                News &<br />Insights
                              </div>
                            </div>
                          );
                        case 'vlix':
                          return (
                            <div className="flex items-center tracking-tighter font-black text-lg sm:text-xl">
                              <span className="text-[#00c2ff]">V</span>
                              <span className="text-[#ff2d55]">L</span>
                              <span className="text-[#00c2ff]">I</span>
                              <span className="text-[#ff2d55]">X</span>
                            </div>
                          );
                        case 'tvonenews':
                          return (
                            <div className="flex items-center font-bold text-white text-base sm:text-lg tracking-tight">
                              <span className="text-white">tv</span>
                              <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#b91c1c] text-white text-[10px] sm:text-xs font-black inline-flex items-center justify-center mx-0.5">
                                O
                              </span>
                              <span className="text-white">nenews.com</span>
                            </div>
                          );
                        case 'antvklik':
                          return (
                            <div className="flex items-center font-bold text-sm sm:text-base">
                              <span className="text-white text-xs sm:text-sm font-semibold">antv</span>
                              <span className="text-[#e11d48] font-black text-sm sm:text-base italic">klik</span>
                              <span className="text-[8px] text-slate-400">.com</span>
                            </div>
                          );
                        case 'intipseleb':
                          return (
                            <div className="flex items-center gap-1 text-xs sm:text-sm font-black tracking-tight text-[#f43f5e]">
                              <span>★</span>
                              <span className="text-white font-extrabold">INTIP</span>
                              <span className="text-[#f43f5e]">SELEB</span>
                            </div>
                          );
                        case 'jagodangdut':
                          return (
                            <div className="flex items-center text-xs sm:text-sm font-bold text-white">
                              <span>jago</span>
                              <span className="text-[#f97316] font-extrabold mx-0.5">♪</span>
                              <span className="text-[#f97316]">dangdut</span>
                            </div>
                          );
                        default:
                          return (
                            <span className="font-bold text-xs sm:text-sm text-slate-200">
                              {item.name}
                            </span>
                          );
                      }
                    };

                    return (
                      <a
                        key={item.id}
                        href={item.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 transition-all cursor-pointer p-1 rounded-sm bg-white/5 border border-white/10"
                        title={`Buka ${item.name} (${item.url})`}
                      >
                        {renderLogo()}
                      </a>
                    );
                  })}
              </div>

              <p className="text-[11px] text-slate-500 pt-1">
                Tip: Pengunjung website dapat mengklik logo partner untuk membuka URL tujuan di tab baru.
              </p>
            </div>

            {/* Form Tambah Partner Baru (Collapsible) */}
            {isAddingNetwork && (
              <div className="bg-red-50/50 border border-red-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-red-200/60 pb-3">
                  <h3 className="text-sm font-bold text-red-950 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-red-600" />
                    <span>Tambah Media Partner Network Baru</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingNetwork(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama Media */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Media Network <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newNetwork.name || ''}
                      onChange={(e) => setNewNetwork((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Contoh: Viva Jogja / TVRI / Kompas"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                    />
                  </div>

                  {/* Target URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Link URL Media <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newNetwork.url || ''}
                      onChange={(e) => setNewNetwork((prev) => ({ ...prev, url: e.target.value }))}
                      placeholder="https://www.nama-media.com"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                    />
                  </div>

                  {/* Preset / Style Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tipe Tampilan Logo / Preset Style
                    </label>
                    <select
                      value={newNetwork.presetStyle || 'custom'}
                      onChange={(e) =>
                        setNewNetwork((prev) => ({
                          ...prev,
                          presetStyle: e.target.value as any,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                    >
                      <option value="custom">Logo Gambar Custom / Upload</option>
                      <option value="viva">Preset: VIVA News & Insights</option>
                      <option value="vlix">Preset: VLIX Video</option>
                      <option value="tvonenews">Preset: tvOnenews.com</option>
                      <option value="antvklik">Preset: antvklik.com</option>
                      <option value="intipseleb">Preset: INTIP SELEB</option>
                      <option value="jagodangdut">Preset: jago dangdut</option>
                    </select>
                  </div>

                  {/* Custom Logo Image URL + Media Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Upload / URL Logo Gambar
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newNetwork.logoUrl || ''}
                        onChange={(e) => setNewNetwork((prev) => ({ ...prev, logoUrl: e.target.value }))}
                        placeholder="https://... atau /uploads/..."
                        className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMediaPickerTarget('newNetwork');
                          setIsMediaPickerOpen(true);
                        }}
                        className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors shrink-0 flex items-center gap-1"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>Media</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNetwork(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNetworkSubmit}
                    className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambahkan ke Daftar</span>
                  </button>
                </div>
              </div>
            )}

            {/* List / Cards of Configured Media Networks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>Daftar Logo & Link Media Network ({(config.mediaNetworks || []).length} Item)</span>
                </h3>
              </div>

              {(config.mediaNetworks || []).length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6">
                  <p className="text-xs text-slate-500">Belum ada partner media network yang ditambahkan.</p>
                  <button
                    type="button"
                    onClick={() => setIsAddingNetwork(true)}
                    className="mt-3 px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                  >
                    Tambah Partner Pertama
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {(config.mediaNetworks || [])
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((item, index, arr) => (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl border ${
                          item.isActive !== false ? 'border-slate-200/90 shadow-2xs' : 'border-slate-200 bg-slate-50/70 opacity-70'
                        } p-4 transition-all`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Left: Re-order controls + Preview Thumbnail + Name & Target Link */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Reorder Up/Down */}
                            <div className="flex flex-col gap-0.5 shrink-0">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleMoveNetwork(index, 'up')}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                                title="Geser ke atas"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={index === arr.length - 1}
                                onClick={() => handleMoveNetwork(index, 'down')}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                                title="Geser ke bawah"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Logo Thumbnail Box (#222222) */}
                            <div className="w-24 h-12 bg-[#222222] rounded-xl border border-slate-700 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                              {item.logoUrl ? (
                                <img
                                  src={item.logoUrl}
                                  alt={item.name}
                                  className="max-h-7 max-w-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-white tracking-tight truncate">
                                  {item.presetStyle || item.name}
                                </span>
                              )}
                            </div>

                            {/* Name & URL Editable Inputs */}
                            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                  Nama Media Network
                                </label>
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) =>
                                    handleUpdateNetworkField(item.id, 'name', e.target.value)
                                  }
                                  placeholder="Nama Media"
                                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-100 bg-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center justify-between">
                                  <span>Link URL Tujuan</span>
                                  {item.url && (
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-red-500 hover:text-red-700 inline-flex items-center gap-0.5 normal-case font-normal text-[10px]"
                                    >
                                      <span>Buka</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                </label>
                                <input
                                  type="text"
                                  value={item.url}
                                  onChange={(e) =>
                                    handleUpdateNetworkField(item.id, 'url', e.target.value)
                                  }
                                  placeholder="https://..."
                                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-100 bg-white text-blue-600 font-mono"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Right: Preset / Logo Picker + Active Toggle + Delete */}
                          <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center border-t lg:border-t-0 pt-2 lg:pt-0 w-full lg:w-auto justify-between lg:justify-end">
                            {/* Logo / Media Library Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setMediaPickerTarget(item.id);
                                setIsMediaPickerOpen(true);
                              }}
                              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                              title="Pilih Gambar Logo dari Media Library"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                              <span className="hidden sm:inline">Ganti Logo</span>
                            </button>

                            {/* Toggle Active */}
                            <button
                              type="button"
                              onClick={() => handleToggleNetworkActive(item.id)}
                              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                                item.isActive !== false
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              }`}
                            >
                              {item.isActive !== false ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Aktif</span>
                                </>
                              ) : (
                                <span>Nonaktif</span>
                              )}
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteNetwork(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Partner"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: SEO & SCHEMA (JSON-LD)                             */}
        {/* ========================================================= */}
        {activeTab === 'seoSchema' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-red-600" />
                <span>SEO Schema Structured Data (JSON-LD)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Otomatis diinjeksikan ke dalam tag &lt;script type="application/ld+json"&gt; di frontend untuk pengenalan Google News & Publisher.
              </p>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between bg-slate-900 text-slate-300 px-4 py-2 rounded-t-xl text-xs font-mono">
                <span>Schema: NewsMediaOrganization</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terintegrasi
                </span>
              </div>
              <pre className="bg-slate-950 text-slate-100 p-4 rounded-b-xl text-xs font-mono overflow-x-auto max-h-[380px] border border-t-0 border-slate-800">
                {schemaJson}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectMedia={handleLogoSelect}
        title="Pilih Logo Footer dari Media Library"
      />

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                Kembalikan Konfigurasi ke Default?
              </h3>
              <p className="text-xs text-slate-500">
                Semua tautan, surel, nomor telepon, dan data sosial media footer akan dikembalikan ke pengaturan awal template portal BATUTV.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Ya, Reset Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
