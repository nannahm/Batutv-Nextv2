import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LoginCredentials } from '../../types/auth';

interface LoginFormPanelProps {
  onLogin: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  onForgotPassword: () => void;
  onRegisterContact: () => void;
}

export const LoginFormPanel: React.FC<LoginFormPanelProps> = ({
  onLogin,
  onForgotPassword,
  onRegisterContact,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    // Client-side quick validation UX
    if (!email.trim() || !password) {
      setErrorMessage('Silakan isi email dan password Anda.');
      return;
    }

    // Check brute force throttling (temporary lock after 5 rapid failed attempts)
    if (failedAttempts >= 5) {
      setErrorMessage('Terlalu banyak percobaan login gagal. Silakan tunggu beberapa saat.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const result = await onLogin({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (result.success) {
        setSuccessMessage('Login berhasil! Mengalihkan ke dashboard...');
        setFailedAttempts(0);
      } else {
        // Safe generic error (prevents user enumeration)
        setErrorMessage(result.message || 'Email atau password salah.');
        setFailedAttempts((prev) => prev + 1);
      }
    } catch {
      setErrorMessage('Terjadi kesalahan pada sistem. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialClick = (provider: string) => {
    setErrorMessage(`Autentikasi ${provider} dinonaktifkan untuk akun administrator CMS. Silakan gunakan email dan password terdaftar.`);
  };

  return (
    <div
      id="login-form-panel"
      className="flex flex-col justify-center p-6 sm:p-10 lg:p-14 bg-white"
    >
      <div className="w-full max-w-[400px] mx-auto">
        {/* ========================================================= */}
        {/* HEADING & SUBTITLE                                        */}
        {/* ========================================================= */}
        <div className="mb-6 sm:mb-8 text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Selamat Datang di <span className="text-[#e50914]">BatuTV</span>
          </h1>
          <p className="text-sm text-slate-500 font-normal mt-2">
            Silakan masuk ke akun Anda
          </p>
        </div>

        {/* ========================================================= */}
        {/* ERROR / SUCCESS ALERTS                                     */}
        {/* ========================================================= */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <span className="flex-1 leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
            <span className="flex-1 leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* FORM CONTAINER                                            */}
        {/* ========================================================= */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
          {/* EMAIL FIELD */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="email"
              className="block text-xs sm:text-[13px] font-semibold text-slate-700 font-sans"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4 stroke-[1.8]" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                required
                disabled={isLoading}
                className="w-full h-10 sm:h-11 pl-10 pr-4 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/15 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed font-sans"
              />
            </div>
          </div>

          {/* PASSWORD FIELD */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="password"
              className="block text-xs sm:text-[13px] font-semibold text-slate-700 font-sans"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4 stroke-[1.8]" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                required
                disabled={isLoading}
                className="w-full h-10 sm:h-11 pl-10 pr-10 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/15 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={0}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:text-red-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 stroke-[1.8]" />
                ) : (
                  <Eye className="w-4 h-4 stroke-[1.8]" />
                )}
              </button>
            </div>
          </div>

          {/* REMEMBER ME & FORGOT PASSWORD */}
          <div className="flex items-center justify-between pt-0.5">
            <label
              htmlFor="rememberMe"
              className="flex items-center gap-2 cursor-pointer select-none text-xs sm:text-[13px] text-slate-600 hover:text-slate-800"
            >
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="w-3.5 h-3.5 rounded border-slate-300 text-[#e50914] focus:ring-red-600/20 cursor-pointer"
              />
              <span>Ingat saya</span>
            </label>

            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs sm:text-[13px] font-medium text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 rounded"
            >
              Lupa password?
            </button>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              id="login-submit-button"
              type="submit"
              disabled={isLoading}
              className="w-full h-11 sm:h-12 bg-[#e50914] hover:bg-[#d00812] active:scale-[0.99] text-white font-bold text-sm sm:text-[15px] rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Masuk</span>
              )}
            </button>
          </div>
        </form>

        {/* ========================================================= */}
        {/* SOCIAL LOGIN DIVIDER & BUTTONS                             */}
        {/* ========================================================= */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative inline-block px-3 bg-white text-xs text-slate-400 font-medium">
            atau masuk dengan
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {/* Facebook Button */}
          <button
            type="button"
            onClick={() => handleSocialClick('Facebook')}
            aria-label="Masuk dengan Facebook"
            title="Masuk dengan Facebook"
            className="w-11 h-10 sm:w-12 sm:h-10.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center shadow-2xs"
          >
            <div className="w-6 h-6 rounded-full bg-[#1877F2] flex items-center justify-center text-white">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
          </button>

          {/* Google Button */}
          <button
            type="button"
            onClick={() => handleSocialClick('Google')}
            aria-label="Masuk dengan Google"
            title="Masuk dengan Google"
            className="w-11 h-10 sm:w-12 sm:h-10.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center shadow-2xs"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </button>
        </div>

        {/* ========================================================= */}
        {/* FOOTNOTE / REGISTER NOTE                                   */}
        {/* ========================================================= */}
        <div className="mt-8 text-center text-xs sm:text-[13px] text-slate-500">
          <span>Belum punya akun? </span>
          <button
            type="button"
            onClick={onRegisterContact}
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 rounded"
          >
            Daftar sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
