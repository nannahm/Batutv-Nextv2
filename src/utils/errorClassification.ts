/**
 * Standardized Firestore & Firebase Auth Error Classification.
 * Maps raw error codes to structured taxonomy with retryable and category tags.
 */

export type ErrorCategory =
  | 'authorization'
  | 'authentication'
  | 'validation'
  | 'infrastructure'
  | 'not-found'
  | 'conflict'
  | 'unknown';

export interface ClassifiedError {
  rawCode: string;
  category: ErrorCategory;
  retryable: boolean;
  userMessage: string;
  httpStatus: number;
}

export function classifyFirestoreError(error: any): ClassifiedError {
  const code = (error?.code || error?.message || 'unknown').toString().toLowerCase();

  if (code.includes('permission-denied') || code.includes('insufficient permissions')) {
    return {
      rawCode: 'permission-denied',
      category: 'authorization',
      retryable: false,
      userMessage: 'Akses ditolak. Anda tidak memiliki wewenang untuk melakukan tindakan ini.',
      httpStatus: 403,
    };
  }

  if (code.includes('unauthenticated') || code.includes('auth/invalid-token')) {
    return {
      rawCode: 'unauthenticated',
      category: 'authentication',
      retryable: false,
      userMessage: 'Sesi autentikasi telah berakhir. Silakan masuk kembali.',
      httpStatus: 401,
    };
  }

  if (code.includes('not-found')) {
    return {
      rawCode: 'not-found',
      category: 'not-found',
      retryable: false,
      userMessage: 'Dokumen atau entitas data tidak ditemukan.',
      httpStatus: 404,
    };
  }

  if (code.includes('already-exists')) {
    return {
      rawCode: 'already-exists',
      category: 'conflict',
      retryable: false,
      userMessage: 'Data dengan ID atau pengenal ini sudah ada.',
      httpStatus: 409,
    };
  }

  if (code.includes('invalid-argument') || code.includes('failed-precondition')) {
    return {
      rawCode: 'invalid-argument',
      category: 'validation',
      retryable: false,
      userMessage: 'Data masukan tidak valid atau melanggar aturan skema.',
      httpStatus: 400,
    };
  }

  if (code.includes('unavailable') || code.includes('network-request-failed')) {
    return {
      rawCode: 'unavailable',
      category: 'infrastructure',
      retryable: true,
      userMessage: 'Koneksi ke Firestore sedang tidak stabil. Membaca dari cadangan lokal...',
      httpStatus: 503,
    };
  }

  if (code.includes('deadline-exceeded') || code.includes('timeout')) {
    return {
      rawCode: 'deadline-exceeded',
      category: 'infrastructure',
      retryable: true,
      userMessage: 'Batas waktu permintaan terlampaui. Sedang mencoba kembali...',
      httpStatus: 504,
    };
  }

  if (code.includes('resource-exhausted') || code.includes('quota-exceeded')) {
    return {
      rawCode: 'resource-exhausted',
      category: 'infrastructure',
      retryable: true,
      userMessage: 'Batas kuota layanan tercapai sementara waktu. Coba beberapa saat lagi.',
      httpStatus: 429,
    };
  }

  if (code.includes('aborted') || code.includes('cancelled')) {
    return {
      rawCode: 'aborted',
      category: 'infrastructure',
      retryable: true,
      userMessage: 'Operasi database dibatalkan atau terjadi konflik transaksi.',
      httpStatus: 409,
    };
  }

  return {
    rawCode: error?.code || 'internal-error',
    category: 'unknown',
    retryable: false,
    userMessage: 'Terjadi kesalahan sistem internal. Silakan hubungi administrator.',
    httpStatus: 500,
  };
}
