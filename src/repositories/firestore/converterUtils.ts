/**
 * Utility to recursively clean undefined properties from objects before saving to Firestore.
 * Firestore throws errors on undefined fields; this replaces them or omits them cleanly.
 */
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }

  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue; // omit undefined
    } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      cleaned[key] = sanitizeForFirestore(value);
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned as T;
}
