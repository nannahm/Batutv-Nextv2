import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Globe,
  Image as ImageIcon,
  Palette,
  Type,
  Search,
  Building2,
  Share2,
  ShieldCheck,
  Save,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  UploadCloud,
  Layers,
  Sparkles,
  Info,
  Check,
  X,
  Code2,
  SlidersHorizontal,
  Hash,
  Menu,
  PanelBottom,
  RefreshCw,
} from 'lucide-react';
import {
  SiteSettings,
  SiteSettingsValidationErrors,
  SupportedFont,
} from '../../../types/siteSettings';
import {
  getStoredSiteSettings,
  saveSiteSettings,
  resetSiteSettings,
  validateSiteSettings,
  INITIAL_SITE_SETTINGS,
  generateSiteSchema,
} from '../../../data/siteSettingsStore';
import { MediaPickerModal } from '../media/MediaPickerModal';
import { AdminMedia } from '../../../types/admin';

interface SiteSettingsModuleProps {
  onNavigateToPublic?: (path: string) => void;
}

type ActiveTab =
  | 'identity'
  | 'logos'
  | 'favicon'
  | 'colors'
  | 'typography'
  | 'seo'
  | 'publisher'
  | 'socialMedia'
  | 'verification';

const SUPPORTED_FONTS: { name: SupportedFont; label: string; sample: string }[] = [
  { name: 'Inter', label: 'Inter (Modern & Neutral)', sample: 'Inspirasi Untuk Negeri' },
  { name: 'Poppins', label: 'Poppins (Geometric & Bold)', sample: 'Inspirasi Untuk Negeri' },
  { name: 'Roboto', label: 'Roboto (Clean & Editorial)', sample: 'Inspirasi Untuk Negeri' },
  { name: 'Montserrat', label: 'Montserrat (Classic & Authoritative)', sample: 'Inspirasi Untuk Negeri' },
  { name: 'Open Sans', label: 'Open Sans (Friendly & Legible)', sample: 'Inspirasi Untuk Negeri' },
  { name: 'Lato', label: 'Lato (Warm & Professional)', sample: 'Inspirasi Untuk Negeri' },
];

const PRESET_PRIMARY_COLORS = [
  { name: 'BatuTV Red', hex: '#D6001C' },
  { name: 'Crimson Scarlet', hex: '#E50914' },
  { name: 'Ruby Dark', hex: '#99000A' },
  { name: 'Sky Blue', hex: '#0284C7' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Dark Slate', hex: '#0F172A' },
];

const PRESET_SECONDARY_COLORS = [
  { name: 'Dark Charcoal', hex: '#111827' },
  { name: 'Deep Slate', hex: '#1E293B' },
  { name: 'Rich Black', hex: '#000000' },
  { name: 'Night Purple', hex: '#240046' },
];

const PRESET_ACCENT_COLORS = [
  { name: 'Amber Glow', hex: '#F59E0B' },
  { name: 'Orange Vivid', hex: '#EA580C' },
  { name: 'Cyan Highlight', hex: '#06B6D4' },
  { name: 'Rose Bright', hex: '#F43F5E' },
];

export const SiteSettingsModule: React.FC<SiteSettingsModuleProps> = ({
  onNavigateToPublic,
}) => {
  const [settings, setSettings] = useState<SiteSettings>(() => getStoredSiteSettings());
  const [activeTab, setActiveTab] = useState<ActiveTab>('identity');
  const [errors, setErrors] = useState<SiteSettingsValidationErrors>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Media Picker state
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<
    | 'headerDesktop'
    | 'navbarCompact'
    | 'headerMobile'
    | 'footer'
    | 'darkMode'
    | 'publisherSchema'
    | 'favicon'
    | 'defaultOgImage'
    | null
  >(null);
  const [mediaPickerTitle, setMediaPickerTitle] = useState('Pilih Media dari Library');

  // Auto hide toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleOpenMediaPicker = (
    target: typeof mediaPickerTarget,
    title: string
  ) => {
    setMediaPickerTarget(target);
    setMediaPickerTitle(title);
    setIsMediaPickerOpen(true);
  };

  const handleMediaSelect = (media: AdminMedia) => {
    if (!mediaPickerTarget) return;

    if (
      mediaPickerTarget === 'headerDesktop' ||
      mediaPickerTarget === 'navbarCompact' ||
      mediaPickerTarget === 'headerMobile' ||
      mediaPickerTarget === 'footer' ||
      mediaPickerTarget === 'darkMode' ||
      mediaPickerTarget === 'publisherSchema'
    ) {
      setSettings((prev) => ({
        ...prev,
        logos: {
          ...prev.logos,
          [mediaPickerTarget]: media.url,
          [`${mediaPickerTarget}Alt`]: media.altText || prev.identity.siteName,
          [`${mediaPickerTarget}MediaId`]: media.id,
        },
      }));
      showToast(`Asset logo berhasil dipilih: ${media.filename}`, 'success');
    } else if (mediaPickerTarget === 'favicon') {
      setSettings((prev) => ({
        ...prev,
        favicon: {
          faviconUrl: media.url,
          faviconAlt: media.altText || 'Favicon Icon',
          faviconMediaId: media.id,
        },
      }));
      showToast(`Favicon berhasil diperbarui: ${media.filename}`, 'success');
    } else if (mediaPickerTarget === 'defaultOgImage') {
      setSettings((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          defaultOgImage: media.url,
          defaultOgImageAlt: media.altText || 'Default OG Image',
          defaultOgImageMediaId: media.id,
        },
      }));
      showToast(`Default OG Image diperbarui: ${media.filename}`, 'success');
    }

    setIsMediaPickerOpen(false);
    setMediaPickerTarget(null);
  };

  const handleRemoveAsset = (
    type: 'logos' | 'favicon' | 'seo',
    field: string
  ) => {
    if (type === 'logos') {
      setSettings((prev) => ({
        ...prev,
        logos: {
          ...prev.logos,
          [field]: '',
          [`${field}Alt`]: '',
          [`${field}MediaId`]: undefined,
        },
      }));
      showToast(`Asset ${field} dihapus.`, 'success');
    } else if (type === 'favicon') {
      setSettings((prev) => ({
        ...prev,
        favicon: {
          faviconUrl: '',
          faviconAlt: '',
          faviconMediaId: undefined,
        },
      }));
      showToast('Favicon dihapus.', 'success');
    } else if (type === 'seo' && field === 'defaultOgImage') {
      setSettings((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          defaultOgImage: '',
          defaultOgImageAlt: '',
          defaultOgImageMediaId: undefined,
        },
      }));
      showToast('Default OG Image dihapus.', 'success');
    }
  };

  const handleSave = () => {
    const validationErrors = validateSiteSettings(settings);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showToast('Mohon periksa kembali kolom yang bertanda merah.', 'error');
      // Switch to first tab with error
      if (validationErrors.identity) setActiveTab('identity');
      else if (validationErrors.publisher) setActiveTab('publisher');
      else if (validationErrors.socialMedia) setActiveTab('socialMedia');
      return;
    }

    const result = saveSiteSettings(settings, 'Administrator BatuTV');
    if (result.success && result.data) {
      setSettings(result.data);
      showToast('Pengaturan Situs (Site Settings) berhasil disimpan & disinkronkan ke seluruh frontend!', 'success');
    } else {
      showToast(result.error || 'Gagal menyimpan pengaturan.', 'error');
    }
  };

  const handleReset = () => {
    const fresh = resetSiteSettings();
    setSettings(fresh);
    setErrors({});
    setShowResetConfirm(false);
    showToast('Pengaturan situs berhasil dikembalikan ke standar awal pabrik.', 'success');
  };

  const tabs: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'identity', label: '1. Identitas Situs', icon: Globe },
    { id: 'logos', label: '2. Logo & Brand Asset', icon: ImageIcon },
    { id: 'favicon', label: '3. Favicon', icon: Sparkles },
    { id: 'colors', label: '4. Brand Color', icon: Palette },
    { id: 'typography', label: '5. Typography', icon: Type },
    { id: 'seo', label: '6. SEO Global', icon: Search },
    { id: 'publisher', label: '7. Informasi Publisher', icon: Building2 },
    { id: 'socialMedia', label: '8. Sosial Media', icon: Share2 },
    { id: 'verification', label: '9. Google & Verification', icon: ShieldCheck },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-medium transition-all animate-slide-up ${
            toastType === 'success'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
              : 'bg-rose-950 text-rose-100 border-rose-800'
          }`}
        >
          {toastType === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200/80 text-red-600 flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200/60">
                  Master Data
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  SINKRONISASI REAL-TIME
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Site Settings &amp; Identitas Portal
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Pusat konfigurasi global branding, logo, favicon, warna, tipografi, SEO, data publisher, dan verifikasi web master BATUTV.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-center flex-wrap">
          {onNavigateToPublic && (
            <button
              type="button"
              onClick={() => onNavigateToPublic('/')}
              className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Buka Website Frontend"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Web</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset ke Default Pabrik"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:scale-98 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {/* Main Content Card with Vertical/Horizontal Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Navigation Tabs Bar */}
        <div className="border-b border-slate-200 bg-slate-50/70 p-2 overflow-x-auto scrollbar-none flex gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-white text-red-600 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 sm:p-8">
          {/* ========================================================= */}
          {/* TAB 1: IDENTITAS SITUS                                    */}
          {/* ========================================================= */}
          {activeTab === 'identity' && (
            <div className="space-y-6 max-w-3xl">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-red-600" />
                  <span>Tab 1: Identitas Situs &amp; Domain Resmi</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Nama dan deskripsi resmi yang menjadi identitas utama portal berita BATUTV.
                </p>
              </div>

              <div className="space-y-4">
                {/* Nama Situs */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Situs <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={settings.identity.siteName}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        identity: { ...prev.identity, siteName: e.target.value },
                      }))
                    }
                    placeholder="BATUTV"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:ring-2 focus:ring-red-100 transition-all font-semibold ${
                      errors.identity?.siteName
                        ? 'border-rose-500 text-rose-900 bg-rose-50/50'
                        : 'border-slate-300 focus:border-red-500'
                    }`}
                  />
                  {errors.identity?.siteName && (
                    <p className="text-xs text-rose-600 mt-1">{errors.identity.siteName}</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    Contoh: <strong>BATUTV</strong> (Digunakan pada title bar, header, dan branding).
                  </p>
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tagline Situs
                  </label>
                  <input
                    type="text"
                    value={settings.identity.tagline}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        identity: { ...prev.identity, tagline: e.target.value },
                      }))
                    }
                    placeholder="Portal Berita Batu Raya"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Contoh: <em>Portal Berita Batu Raya</em> / <em>Inspirasi Untuk Negeri</em>.
                  </p>
                </div>

                {/* Deskripsi Situs */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deskripsi Situs (Meta Description &amp; Schema)
                  </label>
                  <textarea
                    rows={4}
                    value={settings.identity.siteDescription}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        identity: { ...prev.identity, siteDescription: e.target.value },
                      }))
                    }
                    placeholder="Tuliskan deskripsi lengkap portal berita..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Deskripsi ini digunakan untuk Meta Description default, Organization Schema, dan snippet Google Search.
                  </p>
                </div>

                {/* Domain Utama */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Domain Utama Situs <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={settings.identity.mainDomain}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        identity: { ...prev.identity, mainDomain: e.target.value },
                      }))
                    }
                    placeholder="https://batutv.com"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:ring-2 focus:ring-red-100 transition-all font-mono ${
                      errors.identity?.mainDomain
                        ? 'border-rose-500 text-rose-900 bg-rose-50/50'
                        : 'border-slate-300 focus:border-red-500'
                    }`}
                  />
                  {errors.identity?.mainDomain && (
                    <p className="text-xs text-rose-600 mt-1">{errors.identity.mainDomain}</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    Domain kanonikal resmi, sertakan protokol (contoh: <code>https://batutv.com</code>).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: LOGO & BRAND ASSET                                 */}
          {/* ========================================================= */}
          {activeTab === 'logos' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-red-600" />
                  <span>Tab 2: Logo &amp; Brand Asset Media Library</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Seluruh file logo dapat dipilih langsung dari Media Library BATUTV dengan pratinjau instan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Logo Header Desktop */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Logo Header Desktop</span>
                    <span className="text-[10px] bg-slate-200/70 text-slate-600 font-mono px-2 py-0.5 rounded">
                      Rekomendasi: 240x48px (PNG/SVG)
                    </span>
                  </div>

                  {/* Preview Box */}
                  <div className="h-20 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-3 overflow-hidden shadow-2xs">
                    {settings.logos.headerDesktop ? (
                      <img
                        src={settings.logos.headerDesktop}
                        alt="Header Desktop Preview"
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-400 italic">Menggunakan Vector Default BatuTV</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenMediaPicker('headerDesktop', 'Pilih Logo Header Desktop')
                      }
                      className="flex-1 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-red-600" />
                      <span>{settings.logos.headerDesktop ? 'Ganti dari Media' : 'Pilih dari Media'}</span>
                    </button>
                    {settings.logos.headerDesktop && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset('logos', 'headerDesktop')}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-300 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Logo Custom"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={settings.logos.headerDesktop}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        logos: { ...prev.logos, headerDesktop: e.target.value },
                      }))
                    }
                    placeholder="/brand/batutv-logo.svg atau URL"
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                {/* 2. Logo Badge Navbar Kompak (Sticky Bar) */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Logo Badge Navbar Kompak</span>
                      <span className="text-[11px] text-slate-500">Bilah Navigasi Merah Marun</span>
                    </div>
                    <span className="text-[10px] bg-red-100 text-red-700 font-mono px-2 py-0.5 rounded font-semibold">
                      Rekomendasi: 80x26px
                    </span>
                  </div>

                  {/* Preview Box */}
                  <div className="h-20 bg-gradient-to-r from-[#c00028] via-[#850831] to-[#450950] rounded-xl border border-slate-300 flex items-center justify-center p-3 overflow-hidden shadow-2xs">
                    {settings.logos.navbarCompact ? (
                      <img
                        src={settings.logos.navbarCompact}
                        alt="Navbar Compact Preview"
                        className="max-h-8 max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center tracking-tighter text-xs font-black rounded overflow-hidden shadow-sm">
                        <div className="bg-white text-red-600 px-2 py-0.5 leading-tight">BATU</div>
                        <div className="bg-[#240046] text-white px-1.5 py-0.5 border-l border-red-500/30 leading-tight">TV</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenMediaPicker('navbarCompact', 'Pilih Logo Badge Navbar Kompak')
                      }
                      className="flex-1 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-red-600" />
                      <span>{settings.logos.navbarCompact ? 'Ganti dari Media' : 'Pilih dari Media'}</span>
                    </button>
                    {settings.logos.navbarCompact && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset('logos', 'navbarCompact')}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-300 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Logo Custom"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={settings.logos.navbarCompact || ''}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        logos: { ...prev.logos, navbarCompact: e.target.value },
                      }))
                    }
                    placeholder="URL gambar atau kosongkan untuk badge default BATU TV"
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                {/* 3. Logo Header Mobile */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Logo Header Mobile</span>
                    <span className="text-[10px] bg-slate-200/70 text-slate-600 font-mono px-2 py-0.5 rounded">
                      Rekomendasi: 160x40px
                    </span>
                  </div>

                  <div className="h-20 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-3 overflow-hidden shadow-2xs">
                    {settings.logos.headerMobile ? (
                      <img
                        src={settings.logos.headerMobile}
                        alt="Header Mobile Preview"
                        className="max-h-10 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-400 italic">Menggunakan Vector Default BatuTV</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenMediaPicker('headerMobile', 'Pilih Logo Header Mobile')
                      }
                      className="flex-1 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-red-600" />
                      <span>{settings.logos.headerMobile ? 'Ganti dari Media' : 'Pilih dari Media'}</span>
                    </button>
                    {settings.logos.headerMobile && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset('logos', 'headerMobile')}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-300 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={settings.logos.headerMobile}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        logos: { ...prev.logos, headerMobile: e.target.value },
                      }))
                    }
                    placeholder="/brand/batutv-logo.svg"
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                {/* 3. Logo Footer */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Logo Footer</span>
                    <span className="text-[10px] bg-slate-200/70 text-slate-600 font-mono px-2 py-0.5 rounded">
                      Background Gelap (#222222)
                    </span>
                  </div>

                  <div className="h-20 bg-[#222222] rounded-xl border border-slate-700 flex items-center justify-center p-3 overflow-hidden shadow-2xs">
                    {settings.logos.footer ? (
                      <img
                        src={settings.logos.footer}
                        alt="Footer Logo Preview"
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-400 italic">Logo Footer Default</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenMediaPicker('footer', 'Pilih Logo Footer')}
                      className="flex-1 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-red-600" />
                      <span>{settings.logos.footer ? 'Ganti dari Media' : 'Pilih dari Media'}</span>
                    </button>
                    {settings.logos.footer && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset('logos', 'footer')}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-300 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={settings.logos.footer}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        logos: { ...prev.logos, footer: e.target.value },
                      }))
                    }
                    placeholder="/brand/batutv-logo.svg"
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                {/* 4. Logo Dark Mode (Opsional) */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Logo Dark Mode (Opsional)</span>
                    <span className="text-[10px] bg-slate-200/70 text-slate-600 font-mono px-2 py-0.5 rounded">
                      Background Hitam
                    </span>
                  </div>

                  <div className="h-20 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center p-3 overflow-hidden shadow-2xs">
                    {settings.logos.darkMode ? (
                      <img
                        src={settings.logos.darkMode}
                        alt="Dark Mode Logo Preview"
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-500 italic">Belum diatur (opsional)</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenMediaPicker('darkMode', 'Pilih Logo Dark Mode')
                      }
                      className="flex-1 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-red-600" />
                      <span>{settings.logos.darkMode ? 'Ganti dari Media' : 'Pilih dari Media'}</span>
                    </button>
                    {settings.logos.darkMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset('logos', 'darkMode')}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-300 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={settings.logos.darkMode || ''}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        logos: { ...prev.logos, darkMode: e.target.value },
                      }))
                    }
                    placeholder="URL logo dark mode"
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                {/* 5. Logo Publisher Schema (Google News & Schema.org) */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900">Logo Publisher Schema (JSON-LD)</span>
                      <p className="text-[11px] text-slate-500">
                        Wajib memenuhi standar Google News &amp; Schema.org (Dimensi persegi panjang max tinggi 60px, lebar max 600px).
                      </p>
                    </div>
                    <span className="text-[10px] bg-red-100 text-red-700 font-mono px-2 py-0.5 rounded font-bold">
                      Schema.org
                    </span>
                  </div>

                  <div className="h-20 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-3 overflow-hidden shadow-2xs">
                    {settings.logos.publisherSchema ? (
                      <img
                        src={settings.logos.publisherSchema}
                        alt="Publisher Schema Logo"
                        className="max-h-14 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-400 italic">Menggunakan logo utama</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenMediaPicker('publisherSchema', 'Pilih Logo Publisher Schema')
                      }
                      className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-red-600" />
                      <span>Pilih dari Media Library</span>
                    </button>
                    {settings.logos.publisherSchema && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset('logos', 'publisherSchema')}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-300 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <input
                      type="text"
                      value={settings.logos.publisherSchema}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          logos: { ...prev.logos, publisherSchema: e.target.value },
                        }))
                      }
                      placeholder="/brand/batutv-logo-publisher.png"
                      className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: FAVICON                                            */}
          {/* ========================================================= */}
          {activeTab === 'favicon' && (
            <div className="space-y-6 max-w-3xl">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  <span>Tab 3: Favicon Browser &amp; App Icon</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Ikon situs yang muncul di tab browser, bookmark bar, shortcut ponsel, dan Google Search.
                </p>
              </div>

              {/* Favicon Selector Card */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-0.5">
                      Sumber File Favicon
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Pilih gambar dari Media Library (Format: SVG, PNG 512x512, atau ICO).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenMediaPicker('favicon', 'Pilih Favicon dari Media Library')}
                      className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-red-600" />
                      <span>Pilih dari Media Library</span>
                    </button>
                    {settings.favicon.faviconUrl && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset('favicon', 'faviconUrl')}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-300 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Favicon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <input
                  type="text"
                  value={settings.favicon.faviconUrl}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      favicon: { ...prev.favicon, faviconUrl: e.target.value },
                    }))
                  }
                  placeholder="/favicon.svg atau URL"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                />

                {/* Multi-Resolution Favicon Preview Grid (16x16, 32x32, 180x180, 512x512) */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-800 block mb-3">
                    Pratinjau Multi-Resolusi Favicon:
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* 16x16 */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center space-y-2">
                      <span className="text-[10px] font-mono text-slate-400 block">16x16 (Tab Browser)</span>
                      <div className="h-14 flex items-center justify-center">
                        <div className="w-4 h-4 bg-slate-100 border border-slate-300 rounded-xs flex items-center justify-center overflow-hidden">
                          {settings.favicon.faviconUrl ? (
                            <img
                              src={settings.favicon.faviconUrl}
                              alt="16x16"
                              className="w-4 h-4 object-contain"
                            />
                          ) : (
                            <div className="w-2.5 h-2.5 bg-red-600 rounded-xs" />
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">16 × 16 px</span>
                    </div>

                    {/* 32x32 */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center space-y-2">
                      <span className="text-[10px] font-mono text-slate-400 block">32x32 (Bookmark)</span>
                      <div className="h-14 flex items-center justify-center">
                        <div className="w-8 h-8 bg-slate-100 border border-slate-300 rounded-sm flex items-center justify-center overflow-hidden">
                          {settings.favicon.faviconUrl ? (
                            <img
                              src={settings.favicon.faviconUrl}
                              alt="32x32"
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <div className="w-5 h-5 bg-red-600 rounded-xs" />
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">32 × 32 px</span>
                    </div>

                    {/* 180x180 */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center space-y-2">
                      <span className="text-[10px] font-mono text-slate-400 block">180x180 (Apple Touch)</span>
                      <div className="h-14 flex items-center justify-center">
                        <div className="w-12 h-12 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center overflow-hidden shadow-2xs">
                          {settings.favicon.faviconUrl ? (
                            <img
                              src={settings.favicon.faviconUrl}
                              alt="180x180"
                              className="w-12 h-12 object-contain"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-red-600 rounded-sm" />
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">180 × 180 px</span>
                    </div>

                    {/* 512x512 */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center space-y-2">
                      <span className="text-[10px] font-mono text-slate-400 block">512x512 (PWA App Icon)</span>
                      <div className="h-14 flex items-center justify-center">
                        <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center overflow-hidden shadow-xs">
                          {settings.favicon.faviconUrl ? (
                            <img
                              src={settings.favicon.faviconUrl}
                              alt="512x512"
                              className="w-14 h-14 object-contain"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-red-600 rounded-md" />
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">512 × 512 px</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Saat tombol <strong>Simpan Perubahan</strong> ditekan, tag <code>&lt;link rel="icon"&gt;</code> di seluruh tab browser frontend otomatis membaca favicon terbaru secara dinamis.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: BRAND COLOR                                        */}
          {/* ========================================================= */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-red-600" />
                  <span>Tab 4: Brand Color &amp; Palet Warna Global</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Pengaturan warna aksen dan tema yang dibaca secara dinamis melalui CSS Variables oleh seluruh elemen frontend.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Primary Color */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900">
                      Primary Color (Warna Utama) <span className="text-red-500">*</span>
                    </label>
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: settings.colors.primary }}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.colors.primary}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, primary: e.target.value },
                        }))
                      }
                      className="w-12 h-10 rounded-xl cursor-pointer border border-slate-300 p-1 bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={settings.colors.primary}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, primary: e.target.value },
                        }))
                      }
                      placeholder="#D6001C"
                      className="w-full px-3 py-2 text-sm font-mono uppercase rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                    />
                  </div>

                  {/* Preset Swatches */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Preset:</span>
                    {PRESET_PRIMARY_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, primary: c.hex },
                          }))
                        }
                        className="px-2 py-0.5 text-[10px] rounded-md font-mono font-bold text-white shadow-2xs hover:scale-105 transition-transform"
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {c.hex}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Secondary Color */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900">
                      Secondary Color (Warna Sekunder / Header-Footer)
                    </label>
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: settings.colors.secondary }}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.colors.secondary}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, secondary: e.target.value },
                        }))
                      }
                      className="w-12 h-10 rounded-xl cursor-pointer border border-slate-300 p-1 bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={settings.colors.secondary}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, secondary: e.target.value },
                        }))
                      }
                      placeholder="#111827"
                      className="w-full px-3 py-2 text-sm font-mono uppercase rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                    />
                  </div>

                  {/* Preset Swatches */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Preset:</span>
                    {PRESET_SECONDARY_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, secondary: c.hex },
                          }))
                        }
                        className="px-2 py-0.5 text-[10px] rounded-md font-mono font-bold text-white shadow-2xs hover:scale-105 transition-transform"
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {c.hex}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Accent Color */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900">
                      Accent Color (Aksen Sorotan / Breaking / Live)
                    </label>
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: settings.colors.accent }}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.colors.accent}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, accent: e.target.value },
                        }))
                      }
                      className="w-12 h-10 rounded-xl cursor-pointer border border-slate-300 p-1 bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={settings.colors.accent}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, accent: e.target.value },
                        }))
                      }
                      placeholder="#F59E0B"
                      className="w-full px-3 py-2 text-sm font-mono uppercase rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                    />
                  </div>

                  {/* Preset Swatches */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Preset:</span>
                    {PRESET_ACCENT_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, accent: c.hex },
                          }))
                        }
                        className="px-2 py-0.5 text-[10px] rounded-md font-mono font-bold text-white shadow-2xs hover:scale-105 transition-transform"
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {c.hex}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Background Color */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900">
                      Background Color (Kanvas Latar Website)
                    </label>
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: settings.colors.background }}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.colors.background}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, background: e.target.value },
                        }))
                      }
                      className="w-12 h-10 rounded-xl cursor-pointer border border-slate-300 p-1 bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={settings.colors.background}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          colors: { ...prev.colors, background: e.target.value },
                        }))
                      }
                      placeholder="#F8FAFC"
                      className="w-full px-3 py-2 text-sm font-mono uppercase rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Preset:</span>
                    {['#F8FAFC', '#FFFFFF', '#F1F5F9', '#F9FAFB'].map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, background: hex },
                          }))
                        }
                        className="px-2 py-0.5 text-[10px] rounded-md font-mono font-bold text-slate-700 bg-white border border-slate-300 shadow-2xs hover:bg-slate-50"
                      >
                        {hex}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Theme Mockup Preview */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>Live Theme Component Preview</span>
                  </span>
                </div>

                <div
                  className="p-4 rounded-xl border border-slate-700 transition-colors"
                  style={{ backgroundColor: settings.colors.background }}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div
                        className="px-3 py-1 text-xs font-bold text-white rounded-md shadow-xs"
                        style={{ backgroundColor: settings.colors.primary }}
                      >
                        LIVE STREAMING
                      </div>
                      <div
                        className="px-2.5 py-0.5 text-[11px] font-bold rounded-sm text-slate-900"
                        style={{ backgroundColor: settings.colors.accent }}
                      >
                        BREAKING NEWS
                      </div>
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{ color: settings.colors.secondary }}
                    >
                      BatuTV Portal Media Preview
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: TYPOGRAPHY                                         */}
          {/* ========================================================= */}
          {activeTab === 'typography' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Type className="w-4 h-4 text-red-600" />
                  <span>Tab 5: Tipografi &amp; Font Portal</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Pilih font utama untuk judul (Heading) dan konten artikel (Body text).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Heading Font */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Heading Font (Judul Berita &amp; Header)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Font yang digunakan untuk headline H1, H2, H3, dan banner berita.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {SUPPORTED_FONTS.map((f) => (
                      <label
                        key={f.name}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          settings.typography.headingFont === f.name
                            ? 'bg-white border-red-500 ring-2 ring-red-100 text-red-700 shadow-xs'
                            : 'bg-white/60 border-slate-200 hover:bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="headingFont"
                            value={f.name}
                            checked={settings.typography.headingFont === f.name}
                            onChange={() =>
                              setSettings((prev) => ({
                                ...prev,
                                typography: { ...prev.typography, headingFont: f.name },
                              }))
                            }
                            className="text-red-600 focus:ring-red-500"
                          />
                          <span className="text-xs font-bold">{f.label}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{f.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Body Font */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Body Font (Paragraf &amp; Konten Artikel)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Font yang digunakan untuk isi berita, deskripsi, dan teks navigasi.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {SUPPORTED_FONTS.map((f) => (
                      <label
                        key={f.name}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          settings.typography.bodyFont === f.name
                            ? 'bg-white border-red-500 ring-2 ring-red-100 text-red-700 shadow-xs'
                            : 'bg-white/60 border-slate-200 hover:bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="bodyFont"
                            value={f.name}
                            checked={settings.typography.bodyFont === f.name}
                            onChange={() =>
                              setSettings((prev) => ({
                                ...prev,
                                typography: { ...prev.typography, bodyFont: f.name },
                              }))
                            }
                            className="text-red-600 focus:ring-red-500"
                          />
                          <span className="text-xs font-bold">{f.label}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{f.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Typography Options: Weights & Scale Ratio */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Heading Weight */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                  <label className="block text-xs font-bold text-slate-900">
                    Ketebalan Judul (Heading Weight)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Bobot ketebalan untuk H1, H2, dan H3 berita.
                  </p>
                  <select
                    value={settings.typography.headingWeight || '800'}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        typography: {
                          ...prev.typography,
                          headingWeight: e.target.value as any,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  >
                    <option value="600">Semi-Bold (600)</option>
                    <option value="700">Bold (700) — Standar</option>
                    <option value="800">Extra-Bold (800) — Tebal Modern</option>
                    <option value="900">Black (900) — Sangat Tebal</option>
                  </select>
                </div>

                {/* Body Weight */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                  <label className="block text-xs font-bold text-slate-900">
                    Ketebalan Paragraf (Body Weight)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Bobot teks untuk isi naskah berita &amp; deskripsi.
                  </p>
                  <select
                    value={settings.typography.bodyWeight || '400'}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        typography: {
                          ...prev.typography,
                          bodyWeight: e.target.value as any,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  >
                    <option value="400">Regular (400) — Nyaman Dibaca</option>
                    <option value="500">Medium (500) — Lebih Kontras</option>
                  </select>
                </div>

                {/* Font Size Ratio / Scale */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                  <label className="block text-xs font-bold text-slate-900">
                    Rasio Skala Ukuran Teks Portal
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Proporsi perbesaran tipografi di seluruh portal.
                  </p>
                  <select
                    value={settings.typography.fontSizeScale || 'normal'}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        typography: {
                          ...prev.typography,
                          fontSizeScale: e.target.value as any,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  >
                    <option value="compact">Ringkas / Compact (120% Base)</option>
                    <option value="normal">Normal Standar (130% Base)</option>
                    <option value="spacious">Leluasa / Spacious (140% Base)</option>
                  </select>
                </div>
              </div>

              {/* ========================================================= */}
              {/* SECTION: KONTROL MANUAL TIPOGRAFI KHUSUS                  */}
              {/* ========================================================= */}
              <div className="pt-6 border-t border-slate-200 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-red-600" />
                      <span>Kontrol Manual Huruf &amp; Tampilan Khusus Per Bagian</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Atur ukuran, ketebalan, jenis huruf, dan format teks secara mandiri untuk Bar Topik, Menu Navigasi, dan Footer.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg w-fit">
                    Real-time Live Sync
                  </span>
                </div>

                <div className="space-y-6">
                  {/* ---------------------------------------------------- */}
                  {/* 1. KONTROL MANUAL BAR TOPIK (# TOPIK)                */}
                  {/* ---------------------------------------------------- */}
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-black text-xs">
                          <Hash className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Bilah Bar Topik Populer (# TOPIK)</h4>
                          <p className="text-[11px] text-slate-500">Kustomisasi ukuran dan gaya tag topik di bawah navigasi</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            typography: {
                              ...prev.typography,
                              topicBar: {
                                fontSize: 11,
                                fontWeight: '400',
                                fontFamily: 'inherit',
                                textTransform: 'none',
                                badgePadding: 'normal',
                                badgeBgColor: '#f1f3f5',
                                badgeTextColor: '#334155',
                              },
                            },
                          }))
                        }
                        className="text-[11px] font-semibold text-slate-600 hover:text-red-600 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset Default</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Ukuran Font */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-800">Ukuran Huruf</label>
                          <span className="text-xs font-mono font-bold text-red-600">
                            {settings.typography.topicBar?.fontSize || 11}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={9}
                          max={16}
                          step={0.5}
                          value={settings.typography.topicBar?.fontSize || 11}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              typography: {
                                ...prev.typography,
                                topicBar: {
                                  ...prev.typography.topicBar,
                                  fontSize: parseFloat(e.target.value),
                                  fontWeight: prev.typography.topicBar?.fontWeight || '400',
                                  fontFamily: prev.typography.topicBar?.fontFamily || 'inherit',
                                  textTransform: prev.typography.topicBar?.textTransform || 'none',
                                  badgePadding: prev.typography.topicBar?.badgePadding || 'normal',
                                },
                              },
                            }))
                          }
                          className="w-full accent-red-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>9px (Kecil)</span>
                          <span>11px (Ideal)</span>
                          <span>16px</span>
                        </div>
                      </div>

                      {/* Ketebalan Huruf */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-800 block">Ketebalan Huruf</label>
                        <select
                          value={settings.typography.topicBar?.fontWeight || '400'}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              typography: {
                                ...prev.typography,
                                topicBar: {
                                  ...prev.typography.topicBar,
                                  fontSize: prev.typography.topicBar?.fontSize || 11,
                                  fontWeight: e.target.value as any,
                                  fontFamily: prev.typography.topicBar?.fontFamily || 'inherit',
                                  textTransform: prev.typography.topicBar?.textTransform || 'none',
                                  badgePadding: prev.typography.topicBar?.badgePadding || 'normal',
                                },
                              },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="400">Regular (400) — Standar Biasa</option>
                          <option value="500">Medium (500) — Sedikit Tegas</option>
                          <option value="600">Semi-Bold (600) — Tebal Sedang</option>
                          <option value="700">Bold (700) — Tebal Penuh</option>
                        </select>
                      </div>

                      {/* Jenis Font Khusus */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-800 block">Jenis Huruf (Font)</label>
                        <select
                          value={settings.typography.topicBar?.fontFamily || 'inherit'}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              typography: {
                                ...prev.typography,
                                topicBar: {
                                  ...prev.typography.topicBar,
                                  fontSize: prev.typography.topicBar?.fontSize || 11,
                                  fontWeight: prev.typography.topicBar?.fontWeight || '400',
                                  fontFamily: e.target.value,
                                  textTransform: prev.typography.topicBar?.textTransform || 'none',
                                  badgePadding: prev.typography.topicBar?.badgePadding || 'normal',
                                },
                              },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="inherit">Sesuai Tema Body ({settings.typography.bodyFont})</option>
                          <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                          <option value="Inter">Inter</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Poppins">Poppins</option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Lato">Lato</option>
                        </select>
                      </div>

                      {/* Format Huruf (Text Transform) */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-800 block">Format Huruf</label>
                        <select
                          value={settings.typography.topicBar?.textTransform || 'none'}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              typography: {
                                ...prev.typography,
                                topicBar: {
                                  ...prev.typography.topicBar,
                                  fontSize: prev.typography.topicBar?.fontSize || 11,
                                  fontWeight: prev.typography.topicBar?.fontWeight || '400',
                                  fontFamily: prev.typography.topicBar?.fontFamily || 'inherit',
                                  textTransform: e.target.value as any,
                                  badgePadding: prev.typography.topicBar?.badgePadding || 'normal',
                                },
                              },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="none">Asli / Normal (e.g. FestivalApel)</option>
                          <option value="uppercase">HURUF BESAR (UPPERCASE)</option>
                          <option value="lowercase">huruf kecil (lowercase)</option>
                          <option value="capitalize">Kapital Depan (Capitalize)</option>
                        </select>
                      </div>
                    </div>

                    {/* Additional styling: Badge Padding & Color */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-800 block">Padding / Spasi Badge</label>
                        <select
                          value={settings.typography.topicBar?.badgePadding || 'normal'}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              typography: {
                                ...prev.typography,
                                topicBar: {
                                  ...prev.typography.topicBar,
                                  fontSize: prev.typography.topicBar?.fontSize || 11,
                                  fontWeight: prev.typography.topicBar?.fontWeight || '400',
                                  fontFamily: prev.typography.topicBar?.fontFamily || 'inherit',
                                  textTransform: prev.typography.topicBar?.textTransform || 'none',
                                  badgePadding: e.target.value as any,
                                },
                              },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="compact">Ringkas (Kecil)</option>
                          <option value="normal">Normal Standar</option>
                          <option value="spacious">Leluasa (Lebih Lebar)</option>
                        </select>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-800 block">Warna Latar Tag</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.typography.topicBar?.badgeBgColor || '#f1f3f5'}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                typography: {
                                  ...prev.typography,
                                  topicBar: {
                                    ...prev.typography.topicBar,
                                    fontSize: prev.typography.topicBar?.fontSize || 11,
                                    fontWeight: prev.typography.topicBar?.fontWeight || '400',
                                    fontFamily: prev.typography.topicBar?.fontFamily || 'inherit',
                                    textTransform: prev.typography.topicBar?.textTransform || 'none',
                                    badgePadding: prev.typography.topicBar?.badgePadding || 'normal',
                                    badgeBgColor: e.target.value,
                                  },
                                },
                              }))
                            }
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                          />
                          <input
                            type="text"
                            value={settings.typography.topicBar?.badgeBgColor || '#f1f3f5'}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                typography: {
                                  ...prev.typography,
                                  topicBar: {
                                    ...prev.typography.topicBar,
                                    fontSize: prev.typography.topicBar?.fontSize || 11,
                                    fontWeight: prev.typography.topicBar?.fontWeight || '400',
                                    fontFamily: prev.typography.topicBar?.fontFamily || 'inherit',
                                    textTransform: prev.typography.topicBar?.textTransform || 'none',
                                    badgePadding: prev.typography.topicBar?.badgePadding || 'normal',
                                    badgeBgColor: e.target.value,
                                  },
                                },
                              }))
                            }
                            className="w-full px-2 py-1 text-xs font-mono rounded-lg border border-slate-300"
                          />
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-800 block">Warna Teks Tag</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.typography.topicBar?.badgeTextColor || '#334155'}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                typography: {
                                  ...prev.typography,
                                  topicBar: {
                                    ...prev.typography.topicBar,
                                    fontSize: prev.typography.topicBar?.fontSize || 11,
                                    fontWeight: prev.typography.topicBar?.fontWeight || '400',
                                    fontFamily: prev.typography.topicBar?.fontFamily || 'inherit',
                                    textTransform: prev.typography.topicBar?.textTransform || 'none',
                                    badgePadding: prev.typography.topicBar?.badgePadding || 'normal',
                                    badgeTextColor: e.target.value,
                                  },
                                },
                              }))
                            }
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                          />
                          <input
                            type="text"
                            value={settings.typography.topicBar?.badgeTextColor || '#334155'}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                typography: {
                                  ...prev.typography,
                                  topicBar: {
                                    ...prev.typography.topicBar,
                                    fontSize: prev.typography.topicBar?.fontSize || 11,
                                    fontWeight: prev.typography.topicBar?.fontWeight || '400',
                                    fontFamily: prev.typography.topicBar?.fontFamily || 'inherit',
                                    textTransform: prev.typography.topicBar?.textTransform || 'none',
                                    badgePadding: prev.typography.topicBar?.badgePadding || 'normal',
                                    badgeTextColor: e.target.value,
                                  },
                                },
                              }))
                            }
                            className="w-full px-2 py-1 text-xs font-mono rounded-lg border border-slate-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Live Preview Box Bar Topik */}
                    <div className="bg-slate-100 rounded-xl p-3 border border-slate-300 space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Live Preview Bar Topik:
                      </span>
                      <div className="bg-white border border-[#940a13]/40 rounded-lg shadow-2xs px-3.5 py-2 flex items-center gap-3 overflow-hidden">
                        <div className="flex items-center gap-1 text-xs font-black text-[#940a13] uppercase tracking-wider flex-shrink-0">
                          <span># TOPIK</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                          {['Rektor Unsoed Terjaring OTT', 'Gempa Sumut', 'Festival Apel Batu 2026', 'Wisata Malang Raya'].map(
                            (tag, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: `${settings.typography.topicBar?.fontSize || 11}px`,
                                  fontWeight: settings.typography.topicBar?.fontWeight || '400',
                                  fontFamily:
                                    settings.typography.topicBar?.fontFamily &&
                                    settings.typography.topicBar?.fontFamily !== 'inherit'
                                      ? settings.typography.topicBar.fontFamily
                                      : settings.typography.bodyFont,
                                  textTransform: (settings.typography.topicBar?.textTransform || 'none') as any,
                                  backgroundColor:
                                    idx === 0
                                      ? '#940a13'
                                      : settings.typography.topicBar?.badgeBgColor || '#f1f3f5',
                                  color:
                                    idx === 0
                                      ? '#ffffff'
                                      : settings.typography.topicBar?.badgeTextColor || '#334155',
                                }}
                                className={`rounded-full whitespace-nowrap ${
                                  settings.typography.topicBar?.badgePadding === 'compact'
                                    ? 'px-2 py-0.5'
                                    : settings.typography.topicBar?.badgePadding === 'spacious'
                                    ? 'px-3.5 py-1.5'
                                    : 'px-2.5 py-1'
                                }`}
                              >
                                {tag}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ---------------------------------------------------- */}
                  {/* 2. KONTROL MANUAL MENU NAVIGASI UTAMA (HEADER)        */}
                  {/* ---------------------------------------------------- */}
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-black text-xs">
                          <Menu className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Menu Navigasi Utama (Header Bar)</h4>
                          <p className="text-[11px] text-slate-500">Atur ukuran &amp; ketebalan menu navbar merah</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            typography: {
                              ...prev.typography,
                              navigation: {
                                fontSize: 12.5,
                                fontWeight: '900',
                                letterSpacing: 'wide',
                                textTransform: 'uppercase',
                              },
                            },
                          }))
                        }
                        className="text-[11px] font-semibold text-slate-600 hover:text-red-600 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset Default</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Ukuran Font Navigasi */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-800">Ukuran Huruf Menu</label>
                          <span className="text-xs font-mono font-bold text-red-600">
                            {settings.typography.navigation?.fontSize || 12.5}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={16}
                          step={0.5}
                          value={settings.typography.navigation?.fontSize || 12.5}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              typography: {
                                ...prev.typography,
                                navigation: {
                                  ...prev.typography.navigation,
                                  fontSize: parseFloat(e.target.value),
                                  fontWeight: prev.typography.navigation?.fontWeight || '900',
                                  letterSpacing: prev.typography.navigation?.letterSpacing || 'wide',
                                  textTransform: prev.typography.navigation?.textTransform || 'uppercase',
                                },
                              },
                            }))
                          }
                          className="w-full accent-red-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>10px</span>
                          <span>12.5px (Standar)</span>
                          <span>16px</span>
                        </div>
                      </div>

                      {/* Ketebalan Huruf Navigasi */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-800 block">Ketebalan Huruf</label>
                        <select
                          value={settings.typography.navigation?.fontWeight || '900'}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              typography: {
                                ...prev.typography,
                                navigation: {
                                  ...prev.typography.navigation,
                                  fontSize: prev.typography.navigation?.fontSize || 12.5,
                                  fontWeight: e.target.value as any,
                                  letterSpacing: prev.typography.navigation?.letterSpacing || 'wide',
                                  textTransform: prev.typography.navigation?.textTransform || 'uppercase',
                                },
                              },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="400">Regular (400)</option>
                          <option value="500">Medium (500)</option>
                          <option value="600">Semi-Bold (600)</option>
                          <option value="700">Bold (700)</option>
                          <option value="800">Extra-Bold (800)</option>
                          <option value="900">Black (900) — TVOne Bold Style</option>
                        </select>
                      </div>

                      {/* Spasi Antar Huruf */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-800 block">Spasi Huruf (Letter Spacing)</label>
                        <select
                          value={settings.typography.navigation?.letterSpacing || 'wide'}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              typography: {
                                ...prev.typography,
                                navigation: {
                                  ...prev.typography.navigation,
                                  fontSize: prev.typography.navigation?.fontSize || 12.5,
                                  fontWeight: prev.typography.navigation?.fontWeight || '900',
                                  letterSpacing: e.target.value as any,
                                  textTransform: prev.typography.navigation?.textTransform || 'uppercase',
                                },
                              },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="tight">Rapat (Tight)</option>
                          <option value="normal">Normal</option>
                          <option value="wide">Lebar (Wide)</option>
                          <option value="wider">Sangat Lebar (Wider)</option>
                        </select>
                      </div>
                    </div>

                    {/* Live Preview Box Header Navbar */}
                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Live Preview Bilah Navigasi:
                      </span>
                      <div className="bg-[#940a13] rounded-lg px-3 py-2 flex items-center gap-4 text-white overflow-x-auto">
                        {['HOME', 'BERITA', 'DAERAH', 'EKONOMI', 'WISATA', 'VIDEO', 'STREAMING'].map((m, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: `${settings.typography.navigation?.fontSize || 12.5}px`,
                              fontWeight: settings.typography.navigation?.fontWeight || '900',
                            }}
                            className="uppercase tracking-wide whitespace-nowrap hover:bg-[#c81e28] px-2 py-0.5 rounded cursor-pointer transition-colors"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ---------------------------------------------------- */}
                  {/* 3. KONTROL MANUAL MENU NAVIGASI FOOTER                */}
                  {/* ---------------------------------------------------- */}
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-black text-xs">
                          <PanelBottom className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Menu Tautan Footer Portal</h4>
                          <p className="text-[11px] text-slate-500">Atur ukuran huruf &amp; jarak baris link Tentang Kami, Redaksi, Pedoman Siber, dll.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            typography: {
                              ...prev.typography,
                              footerMenu: {
                                fontSize: 13,
                                fontWeight: '700',
                                gap: 'normal',
                                textColor: '#ffffff',
                                hoverColor: '#ef4444',
                              },
                            },
                          }))
                        }
                        className="text-[11px] font-semibold text-slate-600 hover:text-red-600 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset Default</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Ukuran Font Footer */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-800">Ukuran Huruf Link</label>
                          <span className="text-xs font-mono font-bold text-red-600">
                            {settings.typography.footerMenu?.fontSize || 13}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={18}
                          step={0.5}
                          value={settings.typography.footerMenu?.fontSize || 13}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              typography: {
                                ...prev.typography,
                                footerMenu: {
                                  ...prev.typography.footerMenu,
                                  fontSize: parseFloat(e.target.value),
                                  fontWeight: prev.typography.footerMenu?.fontWeight || '700',
                                  gap: prev.typography.footerMenu?.gap || 'normal',
                                  textColor: prev.typography.footerMenu?.textColor || '#ffffff',
                                  hoverColor: prev.typography.footerMenu?.hoverColor || '#ef4444',
                                },
                              },
                            }))
                          }
                          className="w-full accent-red-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>10px</span>
                          <span>13px (Standar)</span>
                          <span>18px</span>
                        </div>
                      </div>

                      {/* Ketebalan Huruf Footer */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-800 block">Ketebalan Huruf</label>
                        <select
                          value={settings.typography.footerMenu?.fontWeight || '700'}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              typography: {
                                ...prev.typography,
                                footerMenu: {
                                  ...prev.typography.footerMenu,
                                  fontSize: prev.typography.footerMenu?.fontSize || 13,
                                  fontWeight: e.target.value as any,
                                  gap: prev.typography.footerMenu?.gap || 'normal',
                                  textColor: prev.typography.footerMenu?.textColor || '#ffffff',
                                  hoverColor: prev.typography.footerMenu?.hoverColor || '#ef4444',
                                },
                              },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="400">Regular (400) — Halus</option>
                          <option value="500">Medium (500)</option>
                          <option value="600">Semi-Bold (600)</option>
                          <option value="700">Bold (700) — Standar Putih Tebal</option>
                        </select>
                      </div>

                      {/* Jarak Antar Link Footer */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-800 block">Jarak Antar Link</label>
                        <select
                          value={settings.typography.footerMenu?.gap || 'normal'}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              typography: {
                                ...prev.typography,
                                footerMenu: {
                                  ...prev.typography.footerMenu,
                                  fontSize: prev.typography.footerMenu?.fontSize || 13,
                                  fontWeight: prev.typography.footerMenu?.fontWeight || '700',
                                  gap: e.target.value as any,
                                  textColor: prev.typography.footerMenu?.textColor || '#ffffff',
                                  hoverColor: prev.typography.footerMenu?.hoverColor || '#ef4444',
                                },
                              },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="compact">Rapat (Compact)</option>
                          <option value="normal">Normal Standar</option>
                          <option value="spacious">Leluasa (Spacious)</option>
                        </select>
                      </div>
                    </div>

                    {/* Live Preview Box Footer Menu */}
                    <div className="bg-[#222222] rounded-xl p-4 text-center space-y-2 border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Live Preview Navigasi Footer:
                      </span>
                      <div
                        style={{
                          fontSize: `${settings.typography.footerMenu?.fontSize || 13}px`,
                          fontWeight: settings.typography.footerMenu?.fontWeight || '700',
                          color: settings.typography.footerMenu?.textColor || '#ffffff',
                        }}
                        className={`flex flex-wrap items-center justify-center ${
                          settings.typography.footerMenu?.gap === 'compact'
                            ? 'gap-x-3 gap-y-1.5'
                            : settings.typography.footerMenu?.gap === 'spacious'
                            ? 'gap-x-8 gap-y-3'
                            : 'gap-x-5 gap-y-2'
                        }`}
                      >
                        {['Tentang Kami', 'Redaksi', 'Kontak', 'Karir', 'Pedoman Media Siber', 'Kode Etik', 'Disclaimer', 'Privacy Policy'].map(
                          (link, idx) => (
                            <span key={idx} className="hover:text-red-500 transition-colors cursor-pointer">
                              {link}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: SEO GLOBAL                                         */}
          {/* ========================================================= */}
          {activeTab === 'seo' && (
            <div className="space-y-6 max-w-3xl">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Search className="w-4 h-4 text-red-600" />
                  <span>Tab 6: SEO Global &amp; Fallback Social Media</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Tag meta default untuk mesin pencari Google, Facebook Open Graph, dan Twitter/X Cards.
                </p>
              </div>

              <div className="space-y-4">
                {/* Default Site Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default Site Title (&lt;title&gt;) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={settings.seo.defaultSiteTitle}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        seo: { ...prev.seo, defaultSiteTitle: e.target.value },
                      }))
                    }
                    placeholder="BatuTV | Portal Berita Terkini..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Format ideal: <code>[Nama Media] | [Tagline / Cakupan Berita]</code> (50-60 karakter).
                  </p>
                </div>

                {/* Default Meta Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={settings.seo.defaultMetaDescription}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        seo: { ...prev.seo, defaultMetaDescription: e.target.value },
                      }))
                    }
                    placeholder="Tuliskan deskripsi meta SEO..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Rekomendasi panjang: 150-160 karakter untuk keterbacaan optimal di Google SERP.
                  </p>
                </div>

                {/* Default Keywords */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default Keywords (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={settings.seo.defaultKeywords}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        seo: { ...prev.seo, defaultKeywords: e.target.value },
                      }))
                    }
                    placeholder="BatuTV, berita kota batu, portal berita, malang raya..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white font-mono text-xs"
                  />
                </div>

                {/* Default OG Image */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900">Default OG Image (Fallback Social Share)</span>
                      <p className="text-[11px] text-slate-500">
                        Gambar yang otomatis muncul saat link portal dibagikan ke WhatsApp, Facebook, dan X jika artikel tidak memiliki featured image.
                      </p>
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-600 font-mono px-2 py-0.5 rounded">
                      1200x630px
                    </span>
                  </div>

                  {/* OG Image Preview Box */}
                  <div className="h-44 bg-slate-900 rounded-xl border border-slate-300 overflow-hidden relative group flex items-center justify-center">
                    {settings.seo.defaultOgImage ? (
                      <img
                        src={settings.seo.defaultOgImage}
                        alt="Default OG Image Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Belum ada gambar OG default</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenMediaPicker('defaultOgImage', 'Pilih Default OG Image dari Media Library')
                      }
                      className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-red-600" />
                      <span>Pilih dari Media Library</span>
                    </button>
                    {settings.seo.defaultOgImage && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset('seo', 'defaultOgImage')}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-300 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Gambar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <input
                      type="text"
                      value={settings.seo.defaultOgImage}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          seo: { ...prev.seo, defaultOgImage: e.target.value },
                        }))
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {/* Google Search Snippet Preview Box */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-2xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Pratinjau Hasil Pencarian Google (Google SERP Snippet)
                  </span>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-600 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">
                        🌐
                      </div>
                      <span className="text-slate-800 font-medium">{settings.identity.mainDomain}</span>
                      <span className="text-slate-400">› portal</span>
                    </div>
                    <div className="text-base text-[#1a0dab] hover:underline font-medium cursor-pointer">
                      {settings.seo.defaultSiteTitle}
                    </div>
                    <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                      {settings.seo.defaultMetaDescription}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: INFORMASI PUBLISHER                                */}
          {/* ========================================================= */}
          {activeTab === 'publisher' && (
            <div className="space-y-6 max-w-3xl">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-red-600" />
                  <span>Tab 7: Informasi Lembaga Penerbit / Publisher</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Data badan hukum media pers untuk Footer, Schema.org Organization, Publisher Schema, dan Google News.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Perusahaan */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Perusahaan / PT Pers <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={settings.publisher.companyName}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        publisher: { ...prev.publisher, companyName: e.target.value },
                      }))
                    }
                    placeholder="PT Batu Televisi Indonesia"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                  />
                </div>

                {/* Nama Publisher */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Brand Publisher
                  </label>
                  <input
                    type="text"
                    value={settings.publisher.publisherName}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        publisher: { ...prev.publisher, publisherName: e.target.value },
                      }))
                    }
                    placeholder="Redaksi BatuTV"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                  />
                </div>

                {/* Alamat Lengkap */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Lengkap Redaksi
                  </label>
                  <textarea
                    rows={2}
                    value={settings.publisher.fullAddress}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        publisher: { ...prev.publisher, fullAddress: e.target.value },
                      }))
                    }
                    placeholder="Jl. TVRI No. 1, Oro-Oro Ombo..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                  />
                </div>

                {/* Kota */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kota / Kabupaten</label>
                  <input
                    type="text"
                    value={settings.publisher.city}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        publisher: { ...prev.publisher, city: e.target.value },
                      }))
                    }
                    placeholder="Kota Batu"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                  />
                </div>

                {/* Provinsi & Kode Pos */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Provinsi</label>
                    <input
                      type="text"
                      value={settings.publisher.province}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          publisher: { ...prev.publisher, province: e.target.value },
                        }))
                      }
                      placeholder="Jawa Timur"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kode Pos</label>
                    <input
                      type="text"
                      value={settings.publisher.postalCode}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          publisher: { ...prev.publisher, postalCode: e.target.value },
                        }))
                      }
                      placeholder="65316"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                    />
                  </div>
                </div>

                {/* Email Redaksi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Redaksi</label>
                  <input
                    type="email"
                    value={settings.publisher.editorialEmail}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        publisher: { ...prev.publisher, editorialEmail: e.target.value },
                      }))
                    }
                    placeholder="redaksi@batutv.com"
                    className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white focus:ring-2 focus:ring-red-100 ${
                      errors.publisher?.editorialEmail
                        ? 'border-rose-500 text-rose-900 bg-rose-50'
                        : 'border-slate-300 focus:border-red-500'
                    }`}
                  />
                  {errors.publisher?.editorialEmail && (
                    <p className="text-xs text-rose-600 mt-1">{errors.publisher.editorialEmail}</p>
                  )}
                </div>

                {/* Email Bisnis */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Iklan &amp; Bisnis</label>
                  <input
                    type="email"
                    value={settings.publisher.businessEmail}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        publisher: { ...prev.publisher, businessEmail: e.target.value },
                      }))
                    }
                    placeholder="iklan@batutv.com"
                    className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white focus:ring-2 focus:ring-red-100 ${
                      errors.publisher?.businessEmail
                        ? 'border-rose-500 text-rose-900 bg-rose-50'
                        : 'border-slate-300 focus:border-red-500'
                    }`}
                  />
                </div>

                {/* Nomor Telepon */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon Kantor</label>
                  <input
                    type="text"
                    value={settings.publisher.phoneNumber}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        publisher: { ...prev.publisher, phoneNumber: e.target.value },
                      }))
                    }
                    placeholder="+62 341 591234"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Redaksi</label>
                  <input
                    type="text"
                    value={settings.publisher.whatsApp}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        publisher: { ...prev.publisher, whatsApp: e.target.value },
                      }))
                    }
                    placeholder="+62 812 3456 7890"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 8: SOSIAL MEDIA                                       */}
          {/* ========================================================= */}
          {activeTab === 'socialMedia' && (
            <div className="space-y-6 max-w-3xl">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-red-600" />
                  <span>Tab 8: Akun Sosial Media Resmi</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Digunakan untuk link icon di Footer, Open Graph, dan properti Schema.org <code>sameAs</code>.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'youtube', label: 'YouTube Channel', icon: '📺', placeholder: 'https://youtube.com/@batutv_official' },
                  { key: 'facebook', label: 'Facebook Page', icon: '📘', placeholder: 'https://facebook.com/batutvofficial' },
                  { key: 'instagram', label: 'Instagram Profile', icon: '📷', placeholder: 'https://instagram.com/batutv_official' },
                  { key: 'tiktok', label: 'TikTok Account', icon: '🎵', placeholder: 'https://tiktok.com/@batutv_official' },
                  { key: 'twitter', label: 'X / Twitter', icon: '🐦', placeholder: 'https://twitter.com/batutv_official' },
                  { key: 'telegram', label: 'Telegram Channel', icon: '✈️', placeholder: 'https://t.me/batutv_news' },
                  { key: 'linkedin', label: 'LinkedIn Company', icon: '💼', placeholder: 'https://linkedin.com/company/batutv' },
                ].map((item) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </label>
                      {settings.socialMedia[item.key as keyof typeof settings.socialMedia] && (
                        <a
                          href={settings.socialMedia[item.key as keyof typeof settings.socialMedia]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-red-600 hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Test Link</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <input
                      type="text"
                      value={settings.socialMedia[item.key as keyof typeof settings.socialMedia]}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          socialMedia: {
                            ...prev.socialMedia,
                            [item.key]: e.target.value,
                          },
                        }))
                      }
                      placeholder={item.placeholder}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 9: GOOGLE & VERIFICATION                              */}
          {/* ========================================================= */}
          {activeTab === 'verification' && (
            <div className="space-y-6 max-w-3xl">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  <span>Tab 9: Integrasi Google &amp; Web Verification</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Pengaturan verifikasi kepemilikan domain untuk Google Search Console, Google Analytics 4, Google Tag Manager, dan Meta Pixel.
                </p>
              </div>

              <div className="space-y-4">
                {/* Google Search Console */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                  <label className="block text-xs font-bold text-slate-900">
                    Google Search Console Verification Tag
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Isikan kode token meta tag (contoh: <code>google-site-verification-xxxxxx</code> atau seluruh string token).
                  </p>
                  <input
                    type="text"
                    value={settings.verification.googleSearchConsole}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        verification: {
                          ...prev.verification,
                          googleSearchConsole: e.target.value,
                        },
                      }))
                    }
                    placeholder="google-site-verification-xxxx"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                  />
                </div>

                {/* Google Analytics ID */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                  <label className="block text-xs font-bold text-slate-900">
                    Google Analytics 4 (Measurement ID)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    ID pelacakan GA4 resmi (contoh: <code>G-XXXXXXXXXX</code>).
                  </p>
                  <input
                    type="text"
                    value={settings.verification.googleAnalyticsId}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        verification: {
                          ...prev.verification,
                          googleAnalyticsId: e.target.value,
                        },
                      }))
                    }
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white uppercase"
                  />
                </div>

                {/* Google Tag Manager */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                  <label className="block text-xs font-bold text-slate-900">
                    Google Tag Manager Container ID
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Container GTM (contoh: <code>GTM-XXXXXXX</code>).
                  </p>
                  <input
                    type="text"
                    value={settings.verification.googleTagManagerId}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        verification: {
                          ...prev.verification,
                          googleTagManagerId: e.target.value,
                        },
                      }))
                    }
                    placeholder="GTM-XXXXXXX"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white uppercase"
                  />
                </div>

                {/* Meta Pixel ID */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                  <label className="block text-xs font-bold text-slate-900">
                    Meta Pixel ID (Facebook Ads Tracking)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Pixel ID numerik dari Meta Events Manager (contoh: <code>123456789012345</code>).
                  </p>
                  <input
                    type="text"
                    value={settings.verification.metaPixelId}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        verification: {
                          ...prev.verification,
                          metaPixelId: e.target.value,
                        },
                      }))
                    }
                    placeholder="123456789012345"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                  />
                </div>

                {/* Custom Header Script */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-900">
                      Custom Header Script (&lt;head&gt;)
                    </label>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                      Raw HTML / JS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Disisipkan otomatis ke dalam tag <code>&lt;head&gt;</code> portal berita. Cocok untuk pixel ads, verification tag khusus, atau CSS kustom.
                  </p>
                  <textarea
                    rows={4}
                    value={settings.verification.customHeaderScript || ''}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        verification: {
                          ...prev.verification,
                          customHeaderScript: e.target.value,
                        },
                      }))
                    }
                    placeholder="<!-- Contoh: Tag script pihak ketiga -->&#10;<script>console.log('BatuTV analytics tracking');</script>"
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white text-slate-800"
                  />
                </div>

                {/* Custom Footer Script */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-900">
                      Custom Footer Script (Sebelum &lt;/body&gt;)
                    </label>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                      Raw HTML / JS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Disisipkan di akhir halaman sebelum penutup <code>&lt;/body&gt;</code>. Cocok untuk live chat widget, counter pihak ketiga, atau script analitik berat.
                  </p>
                  <textarea
                    rows={4}
                    value={settings.verification.customFooterScript || ''}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        verification: {
                          ...prev.verification,
                          customFooterScript: e.target.value,
                        },
                      }))
                    }
                    placeholder="<!-- Contoh: Widget chat, survey, atau script footer -->&#10;<script>/* footer tracker */</script>"
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar with Save Buttons */}
        <div className="border-t border-slate-200 bg-slate-50/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-slate-500">
            Terakhir diperbarui:{' '}
            <span className="font-mono text-slate-700 font-semibold">
              {new Date(settings.updatedAt).toLocaleString('id-ID')}
            </span>{' '}
            oleh <span className="font-semibold text-slate-800">{settings.updatedBy || 'Redaksi'}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:scale-98 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Site Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Media Picker Modal Integration */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => {
          setIsMediaPickerOpen(false);
          setMediaPickerTarget(null);
        }}
        onSelectMedia={handleMediaSelect}
        title={mediaPickerTitle}
      />

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Kembalikan ke Pengaturan Awal?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Seluruh pengaturan identitas, warna, logo, dan SEO akan dikembalikan ke konfigurasi standar pabrik BATUTV.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Ya, Reset Standar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
