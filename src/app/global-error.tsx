import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4 text-neutral-900 dark:text-neutral-100">
        <div className="max-w-md w-full p-6 text-center space-y-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black font-serif">Terjadi Kendala Sistem</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {error?.message || 'Maaf, terjadi kesalahan saat memuat halaman portal berita BatuTV.'}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="default" onClick={() => reset()} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Muat Ulang Halaman
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
