/**
 * YouTube Utility Helper for BATUTV CMS
 * Handles YouTube URL parsing, Video ID extraction, thumbnail generation, embed URLs, and slug formatting.
 */

/**
 * Extracts standard 11-character YouTube Video ID from various YouTube URL formats:
 * - https://www.youtube.com/watch?v=AbCdEf12345
 * - https://youtu.be/AbCdEf12345
 * - https://www.youtube.com/shorts/AbCdEf12345
 * - https://www.youtube.com/embed/AbCdEf12345
 * - https://m.youtube.com/watch?v=AbCdEf12345
 * - Raw 11-char Video ID (e.g. AbCdEf12345)
 */
export function extractYouTubeVideoId(input: string): string | null {
  if (!input || typeof input !== 'string') return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  // If already an 11-character alphanumeric/dash/underscore ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    // Regex matching all standard YouTube URL patterns
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = trimmed.match(regex);

    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }

    // Secondary fallback using URL object
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const parsed = new URL(trimmed);
      if (parsed.hostname.includes('youtube.com')) {
        const vParam = parsed.searchParams.get('v');
        if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
          return vParam;
        }
        const pathSegments = parsed.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          const lastSeg = pathSegments[pathSegments.length - 1];
          if (/^[a-zA-Z0-9_-]{11}$/.test(lastSeg)) {
            return lastSeg;
          }
        }
      } else if (parsed.hostname.includes('youtu.be')) {
        const pathSegments = parsed.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0 && /^[a-zA-Z0-9_-]{11}$/.test(pathSegments[0])) {
          return pathSegments[0];
        }
      }
    }
  } catch {
    // If URL parsing fails, return null
    return null;
  }

  return null;
}

/**
 * Generates official YouTube thumbnail image URL based on Video ID.
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: 'hq' | 'maxres' | 'mq' | 'default' = 'hq'
): string {
  if (!videoId) {
    return 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=800&auto=format&fit=crop';
  }
  
  if (quality === 'maxres') {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  if (quality === 'mq') {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Generates YouTube privacy-enhanced embed URL
 */
export function getYouTubeEmbedUrl(videoId: string, autoplay = false): string {
  if (!videoId) return '';
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1${autoplay ? '&autoplay=1' : ''}`;
}

/**
 * Converts MM:SS or HH:MM:SS string to ISO 8601 duration format (e.g. PT4M35S)
 * for Google Schema VideoObject compliance.
 */
export function formatDurationToIso8601(durationStr?: string): string {
  if (!durationStr || typeof durationStr !== 'string') return 'PT4M00S';
  const clean = durationStr.trim();
  const parts = clean.split(':').map(Number);
  
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    const mins = parts[0];
    const secs = parts[1];
    return `PT${mins}M${secs}S`;
  } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    const hours = parts[0];
    const mins = parts[1];
    const secs = parts[2];
    return `PT${hours}H${mins}M${secs}S`;
  }
  
  const num = parseInt(clean, 10);
  if (!isNaN(num)) {
    return `PT${num}S`;
  }
  
  return 'PT4M00S';
}

/**
 * Converts date string or timestamp to valid ISO 8601 with timezone (e.g. 2026-08-27T10:15:00+07:00)
 */
export function formatDateToIso8601(dateInput?: string): string {
  if (!dateInput) return new Date().toISOString();
  try {
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  } catch {
    // fallback
  }
  return new Date().toISOString();
}

/**
 * Generates a clean URL slug from title string:
 * - Lowercase
 * - Spaces replaced with single dash '-'
 * - Special characters stripped
 * - Leading/trailing dashes removed
 */
export function generateVideoSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric except hyphen and space
    .trim()
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/-+/g, '-') // replace multiple - with single -
    .replace(/^-+|-+$/g, ''); // trim - from ends
}

/**
 * Format relative date time string in Indonesian
 */
export function formatTimeAgo(dateInput?: string): string {
  if (!dateInput) return 'Baru saja';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'Baru saja';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 30) return `${diffDays} hari lalu`;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Baru saja';
  }
}

