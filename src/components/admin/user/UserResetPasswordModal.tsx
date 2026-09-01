import React, { useState } from 'react';
import {
  X,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  Copy,
  Check,
  ShieldAlert,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { CMSUser } from '../../../types/user';
import { validatePasswordPolicy } from '../../../data/userAdminStore';
import { getStoredSecurityConfig } from '../../../data/systemSettingsStore';

interface UserResetPasswordModalProps {
  user: CMSUser | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: (userId: string, newPass: string, forceChange: boolean) => void;
}

export const UserResetPasswordModal: React.FC<UserResetPasswordModalProps> = ({
  user,
  isOpen,
  onClose,
  onConfirmReset,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forceChangeOnLogin, setForceChangeOnLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !user) return null;

  const security = getStoredSecurityConfig();
  const minLength = security.passwordMinLength || 8;

  // Generate strong random password
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

    setNewPassword(pass);
    setErrorMsg('');
  };

  const handleCopyPassword = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setErrorMsg('Password baru wajib dimasukkan atau dibuat otomatis.');
      return;
    }

    const check = validatePasswordPolicy(newPassword);
    if (!check.isValid) {
      setErrorMsg(check.message || 'Password belum memenuhi standar keamanan.');
      return;
    }

    onConfirmReset(user.id, newPassword, forceChangeOnLogin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Reset Password Pengguna
              </h3>
              <p className="text-xs text-slate-500">
                Atur ulang kata sandi akun @{user.username}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
            <p><strong>Nama:</strong> {user.fullName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> <span className="capitalize font-semibold text-slate-900">{user.role}</span></p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Password Baru
              </label>
              <button
                type="button"
                onClick={generateStrongPassword}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buat Password Kuat Acak</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Masukkan password baru..."
                className="w-full h-10 pl-3.5 pr-20 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10"
              />
              <div className="absolute right-2 top-2 flex items-center gap-1">
                {newPassword && (
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    title="Salin Password"
                    className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mt-2 text-xs text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Security Checklist */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Kebijakan Keamanan Sistem:</p>
            <div className="flex items-center gap-2">
              <span className={newPassword.length >= minLength ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                {newPassword.length >= minLength ? '✓' : '•'} Minimal {minLength} karakter
              </span>
            </div>
            {security.passwordComplexityRequired && (
              <div className="flex items-center gap-2">
                <span
                  className={
                    /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) && /[0-9]/.test(newPassword)
                      ? 'text-emerald-600 font-bold'
                      : 'text-slate-400'
                  }
                >
                  {/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) && /[0-9]/.test(newPassword)
                    ? '✓'
                    : '•'}{' '}
                  Kombinasi huruf besar (A-Z), huruf kecil (a-z), dan angka (0-9)
                </span>
              </div>
            )}
          </div>

          {/* Force Change on Login Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/70 cursor-pointer">
            <input
              type="checkbox"
              checked={forceChangeOnLogin}
              onChange={(e) => setForceChangeOnLogin(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-red-600 border-slate-300 focus:ring-red-500"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-800">
                Wajibkan Ganti Password saat Login Pertama
              </span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Pengguna harus membuat kata sandi baru milik mereka sendiri sebelum dapat mengakses menu CMS.
              </p>
            </div>
          </label>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
            >
              Simpan &amp; Terapkan Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
