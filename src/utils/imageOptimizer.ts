import { AdminMediaSizes, AdminMedia } from '../types/admin';

/**
 * ATURAN IMAGE OPTIMIZATION:
 * 1. Maksimal ukuran upload: 2 MB (2,097,152 bytes).
 * 2. Format yang diterima: JPG, JPEG, PNG, WebP.
 * 3. File di atas 2 MB ditolak dengan pesan yang jelas.
 * 4. Optimasi otomatis: Resize max 1920px, pertahankan aspect ratio, konversi WebP kualitas 82-85%.
 * 5. Menghasilkan variasi:
 *    - Thumbnail (320px)
 *    - Medium (640px)
 *    - Large (1280px)
 *    - Original / Optimized Master (max 1920px)
 * 6. Homepage & Daftar Berita -> Thumbnail / Medium
 * 7. SO3 Hero -> Large (1280px)
 * 8. Halaman Artikel -> Large (1280px)
 */

export const MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB (2,097,152 bytes)
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
export const OPTIMIZATION_QUALITY = 0.85; // 85% high-quality WebP default

// Target file size budgets according to mandatory storage rules
export const BUDGET_THUMBNAIL_BYTES = 60 * 1024;  // Max 60 KB
export const BUDGET_MEDIUM_BYTES = 120 * 1024;     // Max 120 KB
export const BUDGET_LARGE_BYTES = 200 * 1024;      // Max 200 KB

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export interface OptimizedVariant {
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  qualityUsed: number;
}

export interface OptimizedImagePackage {
  filename: string;
  originalName: string;
  mimeType: string;
  extension: string;
  width: number;
  height: number;
  fileSize: number; // in bytes (optimized master)
  sizes: {
    thumbnail: string; // 320px (<= 60 KB)
    medium: string;    // 640px (<= 120 KB)
    large: string;     // 1280px (<= 200 KB)
    original: string;  // max 1920px
  };
  altText?: string;
  caption?: string;
  variantsMeta: {
    thumbnail: { width: number; height: number; sizeBytes: number; qualityUsed: number };
    medium: { width: number; height: number; sizeBytes: number; qualityUsed: number };
    large: { width: number; height: number; sizeBytes: number; qualityUsed: number };
    original: { width: number; height: number; sizeBytes: number; qualityUsed: number };
  };
}

/**
 * Format bytes to readable string (e.g., "842 KB", "1.45 MB")
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Validates an image file according to strict optimization rules:
 * - Max 2 MB
 * - Only JPG, JPEG, PNG, WebP (rejects BMP, TIFF, SVG, etc.)
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'Berkas gambar tidak ditemukan.' };
  }

  // 1. Check file size (Max 2 MB)
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Ukuran gambar maksimal 2 MB.',
    };
  }

  // 2. Check MIME type and Extension
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());
  const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);

  if (!isMimeAllowed || !isExtAllowed) {
    return {
      valid: false,
      error: `Format berkas .${ext.toUpperCase() || 'unknown'} tidak didukung. Format yang diterima hanya JPG, JPEG, PNG, dan WebP.`,
    };
  }

  return { valid: true };
}

/**
 * Helper to calculate proportional dimensions constrained to a max bounding box
 */
export function calculateDimensions(
  origW: number,
  origH: number,
  maxW: number,
  maxH?: number
): { width: number; height: number } {
  if (!origW || !origH) {
    return { width: maxW, height: Math.round((maxW * 9) / 16) };
  }

  let targetW = origW;
  let targetH = origH;

  // Scale down if wider than maxW
  if (targetW > maxW) {
    targetH = Math.round((targetH * maxW) / targetW);
    targetW = maxW;
  }

  // Scale down if taller than maxH (if specified)
  if (maxH && targetH > maxH) {
    targetW = Math.round((targetW * maxH) / targetH);
    targetH = maxH;
  }

  return { width: Math.max(1, targetW), height: Math.max(1, targetH) };
}

/**
 * Estimates byte size of a base64 Data URL
 */
export function estimateDataUrlSizeBytes(dataUrl: string): number {
  if (!dataUrl) return 0;
  const base64Str = dataUrl.split(',')[1] || dataUrl;
  const padding = (base64Str.match(/=/g) || []).length;
  return Math.round((base64Str.length * 3) / 4 - padding);
}

/**
 * Renders an HTMLImageElement to a canvas with high-quality smoothing and exports to WebP Data URL.
 * Automatically performs step-wise quality compression if the output exceeds maxTargetSizeBytes.
 */
export function renderCanvasVariant(
  img: HTMLImageElement,
  targetMaxWidth: number,
  initialQuality: number = OPTIMIZATION_QUALITY,
  maxTargetSizeBytes?: number
): OptimizedVariant {
  const { width: targetW, height: targetH } = calculateDimensions(
    img.naturalWidth || img.width,
    img.naturalHeight || img.height,
    targetMaxWidth
  );

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    throw new Error('Canvas 2D context tidak tersedia.');
  }

  // Bicubic / High Quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(img, 0, 0, targetW, targetH);

  let currentQuality = initialQuality;
  let dataUrl = '';
  let sizeBytes = 0;

  // Step-wise quality reduction loop (85% down to 68% in ~3% steps) if size exceeds budget
  while (currentQuality >= 0.68) {
    let exportUrl = canvas.toDataURL('image/webp', currentQuality);

    // Fallback to JPEG if browser doesn't support WebP in canvas
    if (!exportUrl.startsWith('data:image/webp')) {
      exportUrl = canvas.toDataURL('image/jpeg', currentQuality);
    }

    const currentBytes = estimateDataUrlSizeBytes(exportUrl);
    dataUrl = exportUrl;
    sizeBytes = currentBytes;

    if (!maxTargetSizeBytes || currentBytes <= maxTargetSizeBytes) {
      break;
    }

    // Step down quality
    currentQuality = parseFloat((currentQuality - 0.03).toFixed(2));
  }

  return {
    dataUrl,
    width: targetW,
    height: targetH,
    sizeBytes,
    qualityUsed: Math.max(0.68, currentQuality),
  };
}

/**
 * Loads an image from Blob or File into an HTMLImageElement
 */
export function loadImageElement(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gagal memuat elemen gambar untuk proses optimasi.'));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Gagal membaca data berkas lokal.'));
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Main Image Optimization Pipeline:
 * - Validates < 2 MB and formats JPG/PNG/WebP
 * - Loads image
 * - Resizes max 1920px
 * - Preserves aspect ratio
 * - Converts to WebP (82-85% quality)
 * - Generates 4 variations:
 *    * Thumbnail: 320px (budget <= 60 KB)
 *    * Medium: 640px (budget <= 120 KB)
 *    * Large: 1280px (budget <= 200 KB)
 *    * Original / Master: max 1920px
 * - Stepwise quality reduction if any variant exceeds budget
 * - Computes complete metadata
 */
export async function optimizeUploadedImage(file: File): Promise<OptimizedImagePackage> {
  // 1. Validation
  const val = validateImageFile(file);
  if (!val.valid) {
    throw new Error(val.error);
  }

  // 2. Load Image
  const img = await loadImageElement(file);

  // 3. Generate 4 Variations with storage budget enforcement
  // Thumbnail (320px <= 60 KB)
  const thumbnail = renderCanvasVariant(img, 320, OPTIMIZATION_QUALITY, BUDGET_THUMBNAIL_BYTES);
  // Medium (640px <= 120 KB)
  const medium = renderCanvasVariant(img, 640, OPTIMIZATION_QUALITY, BUDGET_MEDIUM_BYTES);
  // Large (1280px <= 200 KB)
  const large = renderCanvasVariant(img, 1280, OPTIMIZATION_QUALITY, BUDGET_LARGE_BYTES);
  // Original / Master (max 1920px)
  const original = renderCanvasVariant(img, 1920, OPTIMIZATION_QUALITY);

  const cleanFilenameBase = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const finalFilename = `${cleanFilenameBase}.webp`;

  return {
    filename: finalFilename,
    originalName: file.name,
    mimeType: 'image/webp',
    extension: 'webp',
    width: original.width,
    height: original.height,
    fileSize: original.sizeBytes,
    sizes: {
      thumbnail: thumbnail.dataUrl,
      medium: medium.dataUrl,
      large: large.dataUrl,
      original: original.dataUrl,
    },
    variantsMeta: {
      thumbnail: { width: thumbnail.width, height: thumbnail.height, sizeBytes: thumbnail.sizeBytes, qualityUsed: thumbnail.qualityUsed },
      medium: { width: medium.width, height: medium.height, sizeBytes: medium.sizeBytes, qualityUsed: medium.qualityUsed },
      large: { width: large.width, height: large.height, sizeBytes: large.sizeBytes, qualityUsed: large.qualityUsed },
      original: { width: original.width, height: original.height, sizeBytes: original.sizeBytes, qualityUsed: original.qualityUsed },
    },
  };
}

/**
 * Optimizes an existing external or Unsplash image URL to generate 4 variations
 */
export function generateUrlVariations(
  url: string,
  width: number = 1920,
  height: number = 1080
): {
  thumbnail: string;
  medium: string;
  large: string;
  original: string;
} {
  if (!url) {
    return { thumbnail: '', medium: '', large: '', original: '' };
  }

  // If Unsplash URL, utilize high-performance dynamic image CDN params with WebP & 85% quality
  if (url.includes('images.unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return {
      thumbnail: `${baseUrl}?w=320&auto=format&fit=crop&fm=webp&q=85`,
      medium: `${baseUrl}?w=640&auto=format&fit=crop&fm=webp&q=85`,
      large: `${baseUrl}?w=1280&auto=format&fit=crop&fm=webp&q=85`,
      original: `${baseUrl}?w=1920&auto=format&fit=crop&fm=webp&q=85`,
    };
  }

  // If already data URL or generic URL
  return {
    thumbnail: url,
    medium: url,
    large: url,
    original: url,
  };
}

/**
 * Utility to get the optimized image URL based on display context:
 * - 'thumbnail': 320px (Grid item, sidebar list, ticker, small badge)
 * - 'medium': 640px (Homepage news card, category list card, related news card)
 * - 'large': 1280px (SO3 Hero Headline, Article Detail featured image)
 * - 'original': 1920px (Full screen lightbox)
 */
export function getOptimizedImageUrl(
  source: string | { sizes?: AdminMediaSizes; url?: string } | AdminMedia | undefined | null,
  targetSize: 'thumbnail' | 'medium' | 'large' | 'original' = 'medium'
): string {
  if (!source) return '';

  // Case 1: Source is an object with `sizes`
  if (typeof source === 'object') {
    const s = source.sizes;
    if (s) {
      if (targetSize === 'thumbnail' && s.thumbnail) return s.thumbnail;
      if (targetSize === 'medium' && s.medium) return s.medium;
      if (targetSize === 'large' && s.large) return s.large;
      if (targetSize === 'original' && s.original) return s.original;
      return s.medium || s.large || s.thumbnail || s.original || (source as any).url || '';
    }
    if ((source as any).url) {
      return getOptimizedImageUrl((source as any).url, targetSize);
    }
  }

  // Case 2: Source is a string URL
  if (typeof source === 'string') {
    if (source.includes('images.unsplash.com')) {
      const baseUrl = source.split('?')[0];
      switch (targetSize) {
        case 'thumbnail':
          return `${baseUrl}?w=320&auto=format&fit=crop&fm=webp&q=85`;
        case 'medium':
          return `${baseUrl}?w=640&auto=format&fit=crop&fm=webp&q=85`;
        case 'large':
          return `${baseUrl}?w=1280&auto=format&fit=crop&fm=webp&q=85`;
        case 'original':
        default:
          return `${baseUrl}?w=1920&auto=format&fit=crop&fm=webp&q=85`;
      }
    }
    return source;
  }

  return '';
}
