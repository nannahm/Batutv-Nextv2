'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 max-w-md">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Terjadi Kesalahan Sistem</h2>
            <p className="text-sm text-slate-600 mb-6">Silakan muat ulang halaman ini.</p>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
