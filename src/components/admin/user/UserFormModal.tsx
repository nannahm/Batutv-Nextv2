import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  User,
  Mail,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  Info,
  Lock,
  ExternalLink,
  Briefcase,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { CMSUser, UserFormInput, UserRole, UserStatus } from '../../../types/user';
import {
  getAvailableAuthorsForUser,
  ROLE_PERMISSIONS_MATRIX,
  validatePasswordPolicy,
  mapAuthorPositionToRole,
} from '../../../data/userAdminStore';
import { getStoredSecurityConfig } from '../../../data/systemSettingsStore';

interface UserFormModalProps {
  userToEdit: CMSUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserFormInput) => void;
  preselectedAuthorId?: string | null;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  userToEdit,
  isOpen,
  onClose,
  onSave,
  preselectedAuthorId,
}) => {
  const [formData, setFormData] = useState<UserFormInput>({
    authorId: null,
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'reporter',
    status: 'aktif',
    forcePasswordChange: true,
  });

  const [isManualStandalone, setIsManualStandalone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [availableAuthors, setAvailableAuthors] = useState<
    ReturnType<typeof getAvailableAuthorsForUser>
  >([]);

  const security = getStoredSecurityConfig();
  const minLength = security.passwordMinLength || 8;

  // Selected Author Object derived from master data
  const selectedAuthor = useMemo(() => {
    if (!formData.authorId) return null;
    return availableAuthors.find((a) => a.id === formData.authorId) || null;
  }, [formData.authorId, availableAuthors]);

  // Sync state when modal opens, userToEdit changes, or preselectedAuthorId provided
  useEffect(() => {
    if (isOpen) {
      const authors = getAvailableAuthorsForUser(userToEdit?.id);
      setAvailableAuthors(authors);

      if (userToEdit) {
        setIsManualStandalone(!userToEdit.authorId);
        setFormData({
          authorId: userToEdit.authorId || null,
          fullName: userToEdit.fullName,
          username: userToEdit.username,
          email: userToEdit.email,
          password: '',
          confirmPassword: '',
          role: userToEdit.role,
          status: userToEdit.status,
          forcePasswordChange: Boolean(userToEdit.forcePasswordChange),
        });
      } else {
        const initialAuthorId = preselectedAuthorId || null;
        let initialFullName = '';
        let initialEmail = '';
        let initialUsername = '';
        let initialRole: UserRole = 'reporter';

        if (initialAuthorId) {
          const matched = authors.find((a) => a.id === initialAuthorId);
          if (matched) {
            initialFullName = matched.name;
            initialEmail = matched.email;
            initialUsername = matched.slug.replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
            initialRole = mapAuthorPositionToRole(matched.position);
          }
        }

        setIsManualStandalone(false);
        setFormData({
          authorId: initialAuthorId,
          fullName: initialFullName,
          username: initialUsername,
          email: initialEmail,
          password: '',
          confirmPassword: '',
          role: initialRole,
          status: 'aktif',
          forcePasswordChange: true,
        });
      }

      setErrorMessage('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, userToEdit, preselectedAuthorId]);

  if (!isOpen) return null;

  // Handler when Author is selected in dropdown
  const handleAuthorSelect = (authorId: string) => {
    setErrorMessage('');
    if (!authorId) {
      setFormData((prev) => ({
        ...prev,
        authorId: null,
      }));
      return;
    }

    const author = availableAuthors.find((a) => a.id === authorId);
    if (!author) return;

    // Automatic role mapping based on author position
    const suggestedRole = mapAuthorPositionToRole(author.position);

    // Automatic username suggestion from slug or email
    const suggestedUsername =
      author.slug || author.email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();

    setFormData((prev) => ({
      ...prev,
      authorId: author.id,
      fullName: author.name,
      email: author.email,
      username: prev.username ? prev.username : suggestedUsername,
      role: suggestedRole,
    }));
  };

  // Password Generator
  const generateStrongPassword = () => {
    const charsUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const charsLower = 'abcdefghijkmnopqrstuvwxyz';
    const charsNum = '23456789';
    const charsSpecial = '!@#$%&*';

    let pass = '';
    pass += charsUpper.charAt(Math.floor(Math.random() * charsUpper.length));
    pass += charsLower.charAt(Math.floor(Math.random() * charsLower.length));
    pass += charsNum.charAt(Math.floor(Math.random() * charsNum.length));
    pass += charsSpecial.charAt(Math.floor(Math.random() * charsSpecial.length));

    const all = charsUpper + charsLower + charsNum + charsSpecial;
    for (let i = pass.length; i < 12; i++) {
      pass += all.charAt(Math.floor(Math.random() * all.length));
    }

    setFormData((prev) => ({
      ...prev,
      password: pass,
      confirmPassword: pass,
    }));
    setShowPassword(true);
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Author First constraint: If not standalone manual admin, Author is mandatory
    if (!isManualStandalone && !formData.authorId) {
      setErrorMessage('Silakan pilih Penulis dari Master Data untuk membuat akun CMS (Author First Architecture).');
      return;
    }

    // Basic Validation
    if (!formData.username.trim()) {
      setErrorMessage('Username login wajib diisi.');
      return;
    }

    if (isManualStandalone) {
      if (!formData.fullName?.trim()) {
        setErrorMessage('Nama lengkap administrator wajib diisi.');
        return;
      }
      if (!formData.email?.trim()) {
        setErrorMessage('Alamat email login wajib diisi.');
        return;
      }
    }

    // Password validation for new users
    if (!userToEdit) {
      if (!formData.password) {
        setErrorMessage('Password awal wajib diisi untuk akun pengguna baru.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
        return;
      }
      const passCheck = validatePasswordPolicy(formData.password);
      if (!passCheck.isValid) {
        setErrorMessage(passCheck.message || 'Password belum memenuhi standar keamanan sistem.');
        return;
      }
    }

    onSave({
      ...formData,
      authorId: isManualStandalone ? null : formData.authorId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {userToEdit ? 'Edit Akun Pengguna CMS' : 'Tambah Pengguna CMS'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Author First
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {userToEdit
                  ? `Sinkronisasi akun login @${userToEdit.username} dengan Master Data Penulis`
                  : 'Hubungkan Master Data Penulis dengan Akun Login CMS BatuTV'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Author First Selector (Master Data Penulis) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>1. Pilih Penulis (Master Data Utama) <span className="text-red-500">*</span></span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Profil publik, nama, foto avatar, email, jabatan, dan SEO berasal dari Master Data Penulis.
                </p>
              </div>

              {/* Standalone Admin Toggle (Opsional untuk Root IT Admin) */}
              <button
                type="button"
                onClick={() => {
                  setIsManualStandalone(!isManualStandalone);
                  if (!isManualStandalone) {
                    setFormData((prev) => ({ ...prev, authorId: null, role: 'admin' }));
                  }
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline flex items-center gap-1"
              >
                {isManualStandalone ? '← Gunakan Master Data Penulis' : 'Akun IT Admin Non-Penulis?'}
              </button>
            </div>

            {!isManualStandalone ? (
              <div>
                <select
                  value={formData.authorId || ''}
                  onChange={(e) => handleAuthorSelect(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-medium focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 shadow-xs"
                >
                  <option value="">-- Pilih Penulis dari Master Data --</option>
                  {availableAuthors.map((author) => {
                    const isAlreadyLinked = author.isLinked && author.id !== userToEdit?.authorId;
                    return (
                      <option
                        key={author.id}
                        value={author.id}
                        disabled={isAlreadyLinked}
                      >
                        {author.name} — {author.position} ({author.email})
                        {isAlreadyLinked
                          ? ` (Sudah Memiliki Akun CMS - @${author.linkedToUsername})`
                          : ''}
                      </option>
                    );
                  })}
                </select>

                {/* Read-Only Author Details Preview Card */}
                {selectedAuthor ? (
                  <div className="mt-3 p-3.5 rounded-xl bg-white border border-blue-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      {selectedAuthor.photoUrl ? (
                        <img
                          src={selectedAuthor.photoUrl}
                          alt={selectedAuthor.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                          {selectedAuthor.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm truncate">
                            {selectedAuthor.name}
                          </span>
                          <span className="px-2 py-0.5 text-[10.5px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            {selectedAuthor.position}
                          </span>
                        </div>
                        <div className="text-[11.5px] text-slate-500 mt-0.5 truncate flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{selectedAuthor.email}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-slate-400">/{selectedAuthor.slug}</span>
                        </div>
                        {selectedAuthor.bio && (
                          <p className="text-[11px] text-slate-600 line-clamp-1 mt-1 italic">
                            "{selectedAuthor.bio}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 self-end sm:self-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Master Terhubung
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-800 text-xs flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Pilih nama penulis di atas. Sistem akan secara otomatis mengisi profil data dan menentukan rekomendasi peran (Role) sesuai jabatan redaksionalnya.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Standalone Form for IT Admin */
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Mode Akun IT / Non-Penulis:</span> Akun ini dibuat khusus untuk akses teknis/administrator tanpa terhubung ke profil penulis publik di website.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap Administrator <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Contoh: Sysadmin BatuTV"
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Administrator <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="admin.it@batutv.id"
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Account Login Credentials */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-red-600" />
              <span>2. Kredensial Login &amp; Peran CMS</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username Login <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-mono">@</span>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value.toLowerCase().replace(/\s+/g, ''),
                      })
                    }
                    placeholder="ahmad.fauzi"
                    className="w-full h-10 pl-8 pr-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 shadow-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Digunakan untuk otentikasi login ke panel CMS.
                </p>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Status Akun <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-medium focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 shadow-xs capitalize"
                >
                  <option value="aktif">Aktif (Dapat Login)</option>
                  <option value="nonaktif">Nonaktif (Cuti / Dihormati)</option>
                  <option value="ditangguhkan">Ditangguhkan (Terkunci / Suspended)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pengguna hanya dapat login apabila berstatus Aktif.
                </p>
              </div>
            </div>

            {/* Role Mapping & Selector */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-red-600" />
                  <span>Peran Pengguna (Role CMS) <span className="text-red-500">*</span></span>
                </label>
                {selectedAuthor && (
                  <span className="text-[11px] text-slate-500">
                    Otomatis dari jabatan: <strong className="text-slate-800">{selectedAuthor.position}</strong>
                  </span>
                )}
              </div>

              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-medium focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 shadow-xs capitalize"
              >
                <option value="admin">Administrator (Akses Penuh Seluruh Modul &amp; Pengaturan)</option>
                <option value="redaksi">Redaksi (Pemimpin / Dewan Redaksi - Publish &amp; Layout)</option>
                <option value="editor">Editor (Penyuntingan Naskah, Approval, &amp; Kurasi)</option>
                <option value="reporter">Reporter (Tulis Berita Sendiri, Upload Media &amp; Liputan)</option>
                <option value="kontributor">Kontributor (Draft Submission &amp; Tulisan Kolom)</option>
              </select>

              <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
                <strong className="text-slate-900">{ROLE_PERMISSIONS_MATRIX[formData.role]?.name}:</strong>{' '}
                {ROLE_PERMISSIONS_MATRIX[formData.role]?.description}
              </div>
            </div>
          </div>

          {/* Section 3: Password Fields (Only for New Users) */}
          {!userToEdit && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-red-600" />
                  <span>3. Password Awal Akun <span className="text-red-500">*</span></span>
                </label>
                <button
                  type="button"
                  onClick={generateStrongPassword}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Password Kuat</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Password awal..."
                    className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Konfirmasi password..."
                    className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                <p className="font-semibold text-slate-700">Persyaratan Password Keamanan:</p>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      (formData.password?.length || 0) >= minLength
                        ? 'text-emerald-600 font-bold'
                        : 'text-slate-400'
                    }
                  >
                    {(formData.password?.length || 0) >= minLength ? '✓' : '•'} Minimal {minLength} karakter
                  </span>
                  {security.passwordComplexityRequired && (
                    <span
                      className={
                        /[A-Z]/.test(formData.password || '') &&
                        /[a-z]/.test(formData.password || '') &&
                        /[0-9]/.test(formData.password || '')
                          ? 'text-emerald-600 font-bold'
                          : 'text-slate-400'
                      }
                    >
                      • Huruf Besar, Kecil, &amp; Angka
                    </span>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 pt-2 border-t border-slate-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.forcePasswordChange}
                  onChange={(e) => setFormData({ ...formData, forcePasswordChange: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 border-slate-300 focus:ring-red-500"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Wajibkan pengguna mengganti kata sandi pada saat login pertama kali
                </span>
              </label>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
            >
              {userToEdit ? 'Simpan Perubahan Akun' : 'Daftarkan Akun Pengguna'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
