import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Database,
  User,
  KeyRound,
} from 'lucide-react';
import { CMSUser, toCanonicalRole } from '../../../types/user';
import { ROLE_PERMISSIONS_MATRIX } from '../../../data/userAdminStore';
import { setUserRoleAction } from '../../../features/auth/serverActions.client';

interface UserMigrationModalProps {
  user: CMSUser | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmMigration: (userId: string, firebaseUid: string) => Promise<boolean | void> | void;
}

export const UserMigrationModal: React.FC<UserMigrationModalProps> = ({
  user,
  isOpen,
  onClose,
  onConfirmMigration,
}) => {
  const [firebaseUid, setFirebaseUid] = useState('');
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFirebaseUid(user?.firebaseUid || '');
      setHasConfirmed(false);
      setIsProcessing(false);
      setErrorMessage(null);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const canonicalRole = toCanonicalRole(user.role);
  const roleInfo = ROLE_PERMISSIONS_MATRIX[canonicalRole];

  const handleConfirm = async () => {
    const cleanUid = firebaseUid.trim();
    if (!cleanUid || cleanUid.length < 5) {
      setErrorMessage('UID Firebase Auth wajib diisi minimal 5 karakter.');
      return;
    }
    if (!hasConfirmed) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Eksekusi Server Action setUserRoleAction (Admin SDK) untuk menetapkan Firebase Custom Claims
      const actionResult = await setUserRoleAction(cleanUid, canonicalRole);

      if (!actionResult.success) {
        setErrorMessage(actionResult.message || 'Gagal menetapkan custom claims pada Firebase Auth.');
        setIsProcessing(false);
        return;
      }

      // 2. Sinkronisasikan status migrasi dan UID ke dokumen profil pengguna
      await onConfirmMigration(user.id, cleanUid);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses migrasi.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Konfirmasi Migrasi Akun Firebase Auth
              </h3>
              <p className="text-[11px] text-slate-500">
                Dokumen Legacy ({user.id}) → Sinkronisasi Kredensial Firebase
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Notice Alert */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Langkah Sadar Wajib:</span> Akun legacy tidak dibuatkan kredensial Firebase Auth otomatis. Staf harus dibuatkan akun/login di Firebase Auth terlebih dahulu, lalu masukkan UID Firebase Auth di bawah untuk menyematkan custom claims peran.
            </div>
          </div>

          {/* User Preview Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Nama Pengguna:</span>
              <span className="font-bold text-slate-900">{user.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Username CMS:</span>
              <span className="font-mono text-slate-800">@{user.username}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Email Terdaftar:</span>
              <span className="text-slate-800">{user.email}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/70">
              <span className="text-slate-500 font-medium">Peran Kanonik Ditetapkan:</span>
              <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-md border ${roleInfo?.badgeColor}`}>
                {roleInfo?.name || canonicalRole}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Status Saat Ini:</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-bold rounded bg-amber-100 text-amber-800">
                Belum Dimigrasikan (Unmigrated)
              </span>
            </div>
          </div>

          {/* Manual Firebase Auth UID Input */}
          <div className="space-y-1.5 pt-1">
            <label htmlFor="migration-firebase-uid" className="block text-xs font-bold text-slate-800">
              UID Firebase Auth (Wajib Diinput Manual) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="migration-firebase-uid"
                type="text"
                value={firebaseUid}
                onChange={(e) => {
                  setFirebaseUid(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Contoh: vG9xL2pQ8rM7sT4u... (dari Firebase Auth Console / Sesi Staf)"
                className="w-full h-10 px-3 font-mono text-xs rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 shadow-xs"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              <strong>Langkah Sadar Superadmin:</strong> Masukkan UID Firebase Auth staf yang diperoleh dari Firebase Authentication Console atau sesi login. Sistem tidak pernah mencari atau membuat UID secara diam-diam.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="leading-normal">{errorMessage}</div>
            </div>
          )}

          {/* Explanation Box */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-900 space-y-1.5">
            <span className="font-bold flex items-center gap-1.5 text-blue-900">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              Efek Eksekusi Server Action:
            </span>
            <ul className="list-disc list-inside space-y-1 text-blue-800 text-[11.5px] pl-1">
              <li>Memanggil <code>setUserRoleAction(uid, role)</code> di server via Firebase Admin SDK.</li>
              <li>Menyematkan Custom Claims peran <code>{`{ role: '${canonicalRole}' }`}</code> ke Firebase Auth token.</li>
              <li>Memperbarui status dokumen pengguna menjadi <strong>Migrated</strong> dan menyimpan UID Firebase.</li>
            </ul>
          </div>

          {/* Explicit Confirmation Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors select-none">
            <input
              type="checkbox"
              checked={hasConfirmed}
              onChange={(e) => setHasConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-xs text-slate-700 leading-relaxed font-medium">
              Saya mengonfirmasi secara sadar untuk menyematkan Custom Claims peran <strong>{roleInfo?.name}</strong> ke Firebase Auth UID di atas dan menyelesaikan migrasi akun <strong>@{user.username}</strong>.
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!firebaseUid.trim() || !hasConfirmed || isProcessing}
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isProcessing ? 'Menyematkan Claims...' : 'Sematkan Claims & Migrasikan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
