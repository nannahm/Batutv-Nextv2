import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  CheckSquare,
  Square,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Video,
  FolderOpen,
  UserCheck,
  Tags,
  Hash,
  FolderTree,
  Sliders,
  RefreshCw,
  Info,
  Lock,
  CloudUpload,
  Database,
} from 'lucide-react';
import { BackupEntity, ImportValidationResult } from '../../../types/systemSettings';
import {
  downloadBackupJson,
  downloadBackupCsv,
  validateImportFile,
  executeImportRestore,
} from '../../../data/systemSettingsStore';
import { AdminUser } from '../../../types/admin';
import { seedAllDataToFirestore, SeedProgress } from '../../../scripts/clientFirestoreSeeder';

interface BackupRestoreTabProps {
  user: AdminUser | null;
  isAdmin: boolean;
}

interface EntityOption {
  key: BackupEntity;
  label: string;
  description: string;
  icon: React.ElementType;
}

const ALL_ENTITIES: EntityOption[] = [
  {
    key: 'articles',
    label: 'Artikel Berita',
    description: 'Seluruh naskah berita, draft, terjadwal, & headline',
    icon: FileText,
  },
  {
    key: 'videos',
    label: 'Video Berita',
    description: 'Koleksi liputan video, YouTube ID, & deskripsi',
    icon: Video,
  },
  {
    key: 'media',
    label: 'Media Library',
    description: 'Metadata gambar, alt text, dan riwayat upload',
    icon: FolderOpen,
  },
  {
    key: 'authors',
    label: 'Penulis & Redaksi',
    description: 'Profil jurnalis, posisi, email, dan bio',
    icon: UserCheck,
  },
  {
    key: 'categories',
    label: 'Kategori',
    description: 'Struktur rubrik berita & video portal',
    icon: Tags,
  },
  {
    key: 'tags',
    label: 'Tag & Topik',
    description: 'Kumpulan tag trending & topik berita',
    icon: Hash,
  },
  {
    key: 'pages',
    label: 'Pages (Informasi)',
    description: 'Halaman statis resmi (Tentang, Pedoman, Redaksi, dll.)',
    icon: FileText,
  },
  {
    key: 'navigation',
    label: 'Navigasi SO2',
    description: 'Susunan menu header & dropdown kategori',
    icon: FolderTree,
  },
  {
    key: 'site_settings',
    label: 'Site Settings',
    description: 'Identitas situs, SEO global, logo, favicon, & metadata',
    icon: Sliders,
  },
  {
    key: 'footer',
    label: 'Footer Config',
    description: 'Struktur link, kolom, disclaimer, dan copyright footer',
    icon: Sliders,
  },
];

export const BackupRestoreTab: React.FC<BackupRestoreTabProps> = ({ user, isAdmin }) => {
  // Export State
  const [selectedEntities, setSelectedEntities] = useState<BackupEntity[]>([
    'articles',
    'videos',
    'media',
    'authors',
    'categories',
    'tags',
    'pages',
    'navigation',
    'site_settings',
    'footer',
  ]);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isImporting, setIsImporting] = useState(false);
  const [importResultMsg, setImportResultMsg] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [confirmReplaceModal, setConfirmReplaceModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cloud Firestore Seeding State
  const [isCloudSeeding, setIsCloudSeeding] = useState(false);
  const [cloudSeedProgress, setCloudSeedProgress] = useState<SeedProgress | null>(null);
  const [cloudSeedResult, setCloudSeedResult] = useState<{
    success: boolean;
    message: string;
    summary?: Record<string, number>;
  } | null>(null);

  const handleExecuteCloudSeed = async () => {
    if (!isAdmin || isCloudSeeding) return;
    setIsCloudSeeding(true);
    setCloudSeedResult(null);

    try {
      const result = await seedAllDataToFirestore((prog) => {
        setCloudSeedProgress(prog);
      });
      setCloudSeedResult(result);
    } catch (err: any) {
      setCloudSeedResult({
        success: false,
        message: err?.message || 'Gagal melakukan inisialisasi cloud database',
      });
    } finally {
      setIsCloudSeeding(false);
    }
  };

  // Toggle Entity Check
  const handleToggleEntity = (key: BackupEntity) => {
    setSelectedEntities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    if (selectedEntities.length === ALL_ENTITIES.length) {
      setSelectedEntities([]);
    } else {
      setSelectedEntities(ALL_ENTITIES.map((e) => e.key));
    }
  };

  // Handle Export Execution
  const handleExecuteExport = () => {
    if (selectedEntities.length === 0) return;
    setIsExporting(true);

    setTimeout(() => {
      if (exportFormat === 'json') {
        downloadBackupJson(selectedEntities, user || undefined);
        setExportSuccessMsg('File backup JSON berhasil digenerate dan diunduh!');
      } else {
        downloadBackupCsv(selectedEntities, user || undefined);
        setExportSuccessMsg('File export spreadsheet CSV berhasil digenerate dan diunduh!');
      }
      setIsExporting(false);
      setTimeout(() => setExportSuccessMsg(null), 4000);
    }, 600);
  };

  // Handle File Upload & Validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportResultMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateImportFile(content);
      setValidationResult(validation);
    };
    reader.readAsText(file);
  };

  // Execute Restore
  const handleExecuteImport = () => {
    if (!isAdmin) return;
    if (!validationResult || !validationResult.isValid || !validationResult.payload) return;

    if (importMode === 'replace' && !confirmReplaceModal) {
      setConfirmReplaceModal(true);
      return;
    }

    setIsImporting(true);
    setConfirmReplaceModal(false);

    setTimeout(() => {
      const res = executeImportRestore(validationResult.payload!, importMode, user || undefined);
      setIsImporting(false);

      if (res.success) {
        setImportResultMsg({
          type: 'success',
          message: res.message,
        });
        // Reset file
        setImportFile(null);
        setValidationResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setImportResultMsg({
          type: 'error',
          message: res.message,
        });
      }
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* SECTION 0: CLOUD FIRESTORE INITIALIZATION & SEEDING */}
      <div className="bg-gradient-to-br from-red-50/80 via-white to-slate-50 rounded-2xl border border-red-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-red-100">
          <div>
            <div className="flex items-center gap-2">
              <CloudUpload className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-bold text-slate-900">Inisialisasi Cloud Firestore</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sinkronkan dan isi seluruh struktur data awal (Berita, Kategori, Tipografi, Navigasi, Penulis, Video, dll.) langsung ke database Cloud Firestore <strong>batutv-portal</strong> milik Anda.
            </p>
          </div>

          <div>
            <button
              onClick={handleExecuteCloudSeed}
              disabled={isCloudSeeding || !isAdmin}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition cursor-pointer ${
                isCloudSeeding || !isAdmin
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
                  : 'bg-red-600 hover:bg-red-700 active:scale-98'
              }`}
            >
              {isCloudSeeding ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>
                    Sinkronisasi: {cloudSeedProgress?.currentEntity || 'Memproses...'} ({cloudSeedProgress?.completedEntities || 0}/{cloudSeedProgress?.totalEntities || 11})
                  </span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>Sinkronkan Seluruh Data ke Firestore</span>
                </>
              )}
            </button>
          </div>
        </div>

        {cloudSeedResult && (
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm flex flex-col gap-2 animate-fade-in ${
              cloudSeedResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2.5 font-bold">
              {cloudSeedResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span>{cloudSeedResult.message}</span>
            </div>

            {cloudSeedResult.summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-2 pt-2 border-t border-emerald-200">
                {Object.entries(cloudSeedResult.summary).map(([col, count]) => (
                  <div key={col} className="bg-white/80 p-2 rounded-lg border border-emerald-100 text-xs">
                    <span className="text-slate-500 font-medium capitalize block truncate">{col}</span>
                    <span className="font-bold text-slate-900">{count} record</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 1: EXPORT DATA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-bold text-slate-900">Export Data CMS</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Unduh cadangan data aktif sistem ke komputer Anda dalam format JSON terstruktur atau spreadsheet CSV.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              {selectedEntities.length === ALL_ENTITIES.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
            </button>
          </div>
        </div>

        {/* Entity Selection Checklist */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Pilih Modul Data yang Ingin Diekspor ({selectedEntities.length}/{ALL_ENTITIES.length} Terpilih)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ALL_ENTITIES.map((entity) => {
              const isSelected = selectedEntities.includes(entity.key);
              const Icon = entity.icon;
              return (
                <div
                  key={entity.key}
                  onClick={() => handleToggleEntity(entity.key)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 select-none ${
                    isSelected
                      ? 'bg-red-50/50 border-red-200 text-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-red-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Icon
                        className={`w-3.5 h-3.5 ${isSelected ? 'text-red-600' : 'text-slate-400'}`}
                      />
                      <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {entity.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                      {entity.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Export Format Selector & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Format File:</span>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setExportFormat('json')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  exportFormat === 'json'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileJson className="w-3.5 h-3.5 text-amber-600" />
                <span>JSON (Penuh)</span>
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  exportFormat === 'csv'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>CSV (Spreadsheet)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExecuteExport}
              disabled={selectedEntities.length === 0 || isExporting}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition cursor-pointer ${
                selectedEntities.length === 0 || isExporting
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
                  : 'bg-red-600 hover:bg-red-700 active:scale-98'
              }`}
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses Export...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Backup ({exportFormat.toUpperCase()})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {exportSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{exportSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* SECTION 2: IMPORT & RESTORE DATA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Import & Restore Data</h3>
            </div>
            {!isAdmin && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Lock className="w-3 h-3" />
                Hanya Administrator
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pulihkan data sistem dari file backup JSON resmi BatuTV. Sistem akan memvalidasi skema sebelum melakukan proses pemulihan untuk mencegah kerusakan data aktif.
          </p>
        </div>

        {/* Upload Box */}
        <div className="space-y-4">
          <div
            onClick={() => {
              if (isAdmin && fileInputRef.current) fileInputRef.current.click();
            }}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition flex flex-col items-center justify-center gap-3 ${
              !isAdmin
                ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                : 'bg-slate-50/50 hover:bg-slate-50 border-slate-300 hover:border-red-400 cursor-pointer'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              disabled={!isAdmin}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {importFile ? importFile.name : 'Pilih file backup .JSON untuk dianalisis'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {importFile
                  ? `Ukuran: ${(importFile.size / 1024).toFixed(1)} KB`
                  : 'Klik atau seret file JSON backup resmi ke area ini'}
              </p>
            </div>
          </div>
        </div>

        {/* Validation Result Preview Card */}
        {validationResult && (
          <div
            className={`p-5 rounded-2xl border ${
              validationResult.isValid
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                : 'bg-red-50/60 border-red-200 text-red-950'
            }`}
          >
            <div className="flex items-start gap-3">
              {validationResult.isValid ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-bold text-sm">
                    {validationResult.isValid
                      ? '✓ Validasi Skema Berhasil — Data Aman untuk Diimpor'
                      : '✕ Validasi Gagal — File Rusak atau Skema Tidak Cocok'}
                  </h4>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/80 border border-current">
                    Versi Schema: {validationResult.version}
                  </span>
                </div>

                {/* Summary Table of Detected Entities */}
                {validationResult.isValid && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-emerald-900">
                      Entitas data terdeteksi di dalam file:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(validationResult.summary).map(([key, count]) => (
                        <div
                          key={key}
                          className="bg-white/80 p-2 rounded-lg border border-emerald-200 text-xs flex justify-between items-center"
                        >
                          <span className="capitalize font-medium text-slate-700">{key}</span>
                          <span className="font-bold text-slate-900">{count} item</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Errors & Warnings */}
                {validationResult.errors.length > 0 && (
                  <ul className="text-xs space-y-1 text-red-700 list-disc list-inside">
                    {validationResult.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                )}
                {validationResult.warnings.length > 0 && (
                  <ul className="text-xs space-y-1 text-amber-700 list-disc list-inside">
                    {validationResult.warnings.map((warn, idx) => (
                      <li key={idx}>{warn}</li>
                    ))}
                  </ul>
                )}

                {/* Import Mode Options */}
                {validationResult.isValid && isAdmin && (
                  <div className="pt-3 border-t border-emerald-200/80 space-y-3">
                    <label className="block text-xs font-bold text-slate-800">
                      Pilih Metode Impor:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 ${
                          importMode === 'merge'
                            ? 'bg-white border-emerald-500 shadow-xs'
                            : 'bg-white/60 border-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="importMode"
                          value="merge"
                          checked={importMode === 'merge'}
                          onChange={() => setImportMode('merge')}
                          className="mt-0.5 text-emerald-600"
                        />
                        <div>
                          <p className="font-bold text-slate-900">Merge / Tambah Data Baru (Direkomendasikan)</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Menambahkan record baru tanpa menghapus konten yang sudah ada di portal.
                          </p>
                        </div>
                      </label>

                      <label
                        className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 ${
                          importMode === 'replace'
                            ? 'bg-white border-red-500 shadow-xs'
                            : 'bg-white/60 border-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="importMode"
                          value="replace"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="mt-0.5 text-red-600"
                        />
                        <div>
                          <p className="font-bold text-red-900">Restore Penuh / Timpa Database</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Mengganti data modul dengan isi file backup ini sepenuhnya.
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleExecuteImport}
                        disabled={isImporting}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition cursor-pointer ${
                          importMode === 'replace'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        {isImporting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Menjalankan Pemulihan...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>
                              {importMode === 'replace'
                                ? 'Konfirmasi Restore Timpa'
                                : 'Jalankan Merge Data'}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {importResultMsg && (
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center gap-3 animate-fade-in ${
              importResultMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {importResultMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{importResultMsg.message}</span>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Replace Mode */}
      {confirmReplaceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Konfirmasi Restore Penuh</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Anda memilih mode <strong>Restore Penuh / Timpa</strong>. Tindakan ini akan menggantikan data aktif dengan data dari file backup. Pastikan Anda telah mengunduh backup terkini sebelumnya.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setConfirmReplaceModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteImport}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-md cursor-pointer"
              >
                Ya, Lanjutkan Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
