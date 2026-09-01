import React from 'react';
import { NotFoundPage } from '@/src/components/common/NotFoundPage';

export default function GlobalNotFound() {
  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return <NotFoundPage onGoHome={handleGoHome} />;
}
