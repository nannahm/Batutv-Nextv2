'use client';

import React, { useEffect, useState } from 'react';
import App from '../App';

export default function ClientAppWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="text-center font-bold text-slate-700">Memuat Portal BatuTV...</div>
      </div>
    );
  }

  return <App />;
}
