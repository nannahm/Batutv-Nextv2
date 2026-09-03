'use client';

import React, { useEffect, useState } from 'react';
import { NotFoundPage } from './NotFoundPage';

export default function ClientNotFoundWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="text-center font-bold text-slate-700">Halaman Tidak Ditemukan</div>
      </div>
    );
  }

  return <NotFoundPage onNavigate={handleNavigate} />;
}
