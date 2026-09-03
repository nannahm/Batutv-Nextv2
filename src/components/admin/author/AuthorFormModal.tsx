import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Image as ImageIcon,
  Mail,
  Phone,
  FileText,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FolderOpen,
  RefreshCw,
} from 'lucide-react';
import { AdminAuthor, AuthorPosition, AuthorStatus, AdminMedia } from '../../../types/admin';
import { generateAuthorSlug, validateEmail } from '../../../data/authorAdminStore';
import { MediaPickerModal } from '../media/MediaPickerModal';

interface AuthorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    slug: string;
    photoMediaId?: string;
    photoUrl?: string;
    position: AuthorPosition;
    email: string;
    phone?: string;
    bio?: string;
    status: AuthorStatus;
    seoTitle?: string;
    metaDescription?: string;
  }) => void;
  initialAuthor?: AdminAuthor | null;
}

export const AuthorFormModal: React.FC<AuthorFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAuthor,
}) => {
  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugCustom, setIsSlugCustom] = useState(false);
  const [position, setPosition] = useState<AuthorPosition>('Reporter');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState<AuthorStatus>('active');

  // Media picker integration
  const [photoMediaId, setPhotoMediaId] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Validation Error State
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    slug?: string;
    bio?: string;
  }>({});

  // Populate data when modal opens or initialAuthor changes
  useEffect(() => {
    if (isOpen) {
      if (initialAuthor) {
        setName(initialAuthor.name);
        setSlug(initialAuthor.slug);
        setIsSlugCustom(true);
        setPosition(initialAuthor.position);
        setEmail(initialAuthor.email);
        setPhone(initialAuthor.phone || '');
        setBio(initialAuthor.bio || '');
        setStatus(initialAuthor.status);
        setPhotoMediaId(initialAuthor.photoMediaId || '');
        setPhotoUrl(initialAuthor.photoUrl || '');
        setSeoTitle(initialAuthor.seoTitle || '');
        setMetaDescription(initialAuthor.metaDescription || '');
      } else {
        // Reset to fresh defaults
        setName('');
        setSlug('');
        setIsSlugCustom(false);
        setPosition('Reporter');
        setEmail('');
        setPhone('');
        setBio('');
        setStatus('active');
        setPhotoMediaId('');
        setPhotoUrl('');
        setSeoTitle('');
        setMetaDescription('');
      }
      setErrors({});
    }
  }, [isOpen, initialAuthor]);

  // Handle Name change and auto slug generation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugCustom) {
      const generated = generateAuthorSlug(val, initialAuthor?.id);
      setSlug(generated);
    }
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  // Handle Slug change manually
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSlug(val);
    setIsSlugCustom(true);
    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: undefined }));
    }
  };

  // Regenerate slug from name
  const handleRegenerateSlug = () => {
    const generated = generateAuthorSlug(name, initialAuthor?.id);
    setSlug(generated);
    setIsSlugCustom(false);
  };

  // Handle Media Picker Select
  const handleMediaSelect = (media: AdminMedia) => {
    setPhotoMediaId(media.id);
    setPhotoUrl(media.sizes?.thumbnail || media.sizes?.medium || media.url);
  };

  // Remove photo selection
  const handleRemovePhoto = () => {
    setPhotoMediaId('');
    setPhotoUrl('');
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string; slug?: string; bio?: string } = {};

    // Validate Name
    if (!name.trim()) {
      newErrors.name = 'Nama lengkap penulis wajib diisi.';
    }

    // Validate Email
    if (!email.trim()) {
      newErrors.email = 'Alamat email wajib diisi.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Format email tidak valid (contoh: nama@batutv.id).';
    }

    // Validate Bio Length
    if (bio.length > 300) {
      newErrors.bio = `Bio tidak boleh melebihi 300 karakter (${bio.length}/300).`;
    }

    // Validate Slug
    if (!slug.trim()) {
      newErrors.slug = 'Slug penulis tidak boleh kosong.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare payload
    onSave({
      name: name.trim(),
      slug: slug.trim(),
      photoMediaId: photoMediaId || undefined,
      photoUrl: photoUrl || undefined,
      position,
      email: email.trim(),
      phone: phone.trim() || undefined,
      bio: bio.trim() || undefined,
      status,
      seoTitle: seoTitle.trim() || `Profil & Berita Karya ${name.trim()} - BatuTV`,
      metaDescription:
        metaDescription.trim() ||
        `Kumpulan artikel berita dan liputan video oleh ${name.trim()} (${position}) di portal resmi BatuTV.`,
    });
  };

  if (!isOpen) return null;

  const isEdit = Boolean(initialAuthor);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  {isEdit ? 'Edit Data Master Penulis' : 'Tambah Master Penulis Baru'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isEdit
                    ? 'Perbarui profil jurnalis, kontak, foto, serta metadata SEO.'
                    : 'Daftarkan nama wartawan/reporter baru ke Master Data Redaksi.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* 1. FOTO PROFIL DARI MEDIA LIBRARY */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-red-600" />
                  <span>Foto Profil (Media Library)</span>
                </span>
                <span className="text-[11px] font-normal text-slate-400">
                  Terintegrasi Media Pustaka
                </span>
              </label>

              <div className="flex items-center gap-4">
                {/* Photo Preview Thumbnail */}
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 bg-white shrink-0 shadow-xs flex items-center justify-center">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Preview Foto Penulis"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-300" />
                  )}
                </div>

                {/* Photo Controls */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="px-3.5 py-1.5 bg-white border border-slate-300 hover:border-red-500 hover:text-red-600 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>{photoUrl ? 'Ganti Foto' : 'Pilih dari Media Library'}</span>
                    </button>

                    {photoUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl font-bold transition-colors cursor-pointer"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Foto diambil dari modul Media Library demi efisiensi penyimpanan.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. NAMA LENGKAP & JABATAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Nama Lengkap <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Contoh: Ahmad Fauzi"
                  className={`w-full px-3.5 py-2 text-xs text-slate-900 bg-slate-50 border rounded-xl focus:ring-2 focus:bg-white focus:outline-none transition-all ${
                    errors.name
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-slate-300 focus:ring-red-500'
                  }`}
                />
                {errors.name && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Jabatan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Jabatan / Posisi Redaksi <span className="text-red-500">*</span>
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as AuthorPosition)}
                  className="w-full px-3.5 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="Reporter">Reporter</option>
                  <option value="Editor">Editor</option>
                  <option value="Redaksi">Redaksi</option>
                  <option value="Kontributor">Kontributor</option>
                </select>
              </div>
            </div>

            {/* 3. SLUG (URL IDENTIFIER) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Slug Penulis (URL Path) <span className="text-red-500">*</span>
                </label>
                {isSlugCustom && (
                  <button
                    type="button"
                    onClick={handleRegenerateSlug}
                    className="text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Otomatis</span>
                  </button>
                )}
              </div>

              <div className="flex items-center">
                <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-xs text-slate-500 font-mono">
                  /penulis/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="ahmad-fauzi"
                  className={`w-full px-3.5 py-2 text-xs text-slate-900 bg-slate-50 border rounded-r-xl font-mono focus:ring-2 focus:bg-white focus:outline-none transition-all ${
                    errors.slug
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-slate-300 focus:ring-red-500'
                  }`}
                />
              </div>
              {errors.slug && (
                <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.slug}</span>
                </p>
              )}
            </div>

            {/* 4. KONTAK: EMAIL & TELEPON */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Redaksi <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="contoh@batutv.id"
                  className={`w-full px-3.5 py-2 text-xs text-slate-900 bg-slate-50 border rounded-xl focus:ring-2 focus:bg-white focus:outline-none transition-all ${
                    errors.email
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-slate-300 focus:ring-red-500'
                  }`}
                />
                {errors.email && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Telepon */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nomor Telepon (Opsional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-3456-7890"
                  className="w-full px-3.5 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:bg-white focus:ring-red-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* 5. BIO SINGKAT (MAKSIMAL 300 KARAKTER DENGAN COUNTER) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Biografi Singkat (Bio)
                </label>
                <span
                  className={`text-[11px] font-bold ${
                    bio.length > 300 ? 'text-red-600' : 'text-slate-400'
                  }`}
                >
                  {bio.length} / 300 Karakter
                </span>
              </div>
              <textarea
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  if (errors.bio && e.target.value.length <= 300) {
                    setErrors((prev) => ({ ...prev, bio: undefined }));
                  }
                }}
                rows={3}
                placeholder="Tuliskan ringkasan pengalaman jurnalis, fokus peliputan, atau sertifikasi..."
                className={`w-full px-3.5 py-2 text-xs text-slate-900 bg-slate-50 border rounded-xl focus:ring-2 focus:bg-white focus:outline-none transition-all resize-none ${
                  errors.bio || bio.length > 300
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-300 focus:ring-red-500'
                }`}
              />
              {errors.bio && (
                <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.bio}</span>
                </p>
              )}
            </div>

            {/* 6. STATUS AKTIF / NONAKTIF */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Status Penulis</span>
                <span className="text-[11px] text-slate-500 block">
                  Penulis aktif akan muncul di pilihan dropdown berita dan video baru.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStatus(status === 'active' ? 'inactive' : 'active')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    status === 'active' ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      status === 'active' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-extrabold w-16">
                  {status === 'active' ? (
                    <span className="text-emerald-700">Aktif</span>
                  ) : (
                    <span className="text-slate-500">Nonaktif</span>
                  )}
                </span>
              </div>
            </div>

            {/* 7. SEO METADATA (READY FOR FUTURE PUBLIC AUTHOR PAGE) */}
            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Metadata SEO (Database Ready)</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">SEO Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={
                      name
                        ? `Profil & Berita Karya ${name} - BatuTV`
                        : 'Judul halaman profil penulis di Google'
                    }
                    className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Meta Description</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={2}
                    placeholder="Ringkasan deskripsi arsip karya penulis untuk mesin pencari..."
                    className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEdit ? 'Simpan Perubahan' : 'Daftarkan Penulis'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Media Picker Modal for selecting photo from Media Library */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectMedia={handleMediaSelect}
        currentSelectedUrl={photoUrl}
        title="Pilih Foto Profil Penulis dari Media Library"
      />
    </>
  );
};
