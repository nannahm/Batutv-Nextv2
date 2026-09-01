/**
 * Robust Centralized Admin Session Management for BatuTV Control
 * Supports localStorage, sessionStorage, and document.cookie fallbacks.
 */

export interface StoredAdminSession {
  name: string;
  email: string;
  role: string;
  uid?: string;
  timestamp: number;
}

const SESSION_KEY = 'batutv_admin_session';

/**
 * Read session from localStorage -> sessionStorage -> Cookie
 */
export function getStoredAdminSession(): StoredAdminSession | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Try localStorage
    const localData = localStorage.getItem(SESSION_KEY);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (parsed && typeof parsed === 'object' && (parsed.email || parsed.role)) {
        return {
          name: parsed.name || 'Super Administrator BatuTV',
          email: parsed.email || 'admin@batutv.com',
          role: parsed.role || 'Administrator',
          uid: parsed.uid || 'admin',
          timestamp: parsed.timestamp || Date.now(),
        };
      }
    }
  } catch {
    // ignore
  }

  try {
    // 2. Try sessionStorage fallback
    const sessionData = sessionStorage.getItem(SESSION_KEY);
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      if (parsed && typeof parsed === 'object' && (parsed.email || parsed.role)) {
        return {
          name: parsed.name || 'Super Administrator BatuTV',
          email: parsed.email || 'admin@batutv.com',
          role: parsed.role || 'Administrator',
          uid: parsed.uid || 'admin',
          timestamp: parsed.timestamp || Date.now(),
        };
      }
    }
  } catch {
    // ignore
  }

  try {
    // 3. Try cookie fallback
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, val] = cookie.trim().split('=');
      if (key === SESSION_KEY && val) {
        const decoded = decodeURIComponent(val);
        const parsed = JSON.parse(decoded);
        if (parsed && typeof parsed === 'object' && (parsed.email || parsed.role)) {
          return {
            name: parsed.name || 'Super Administrator BatuTV',
            email: parsed.email || 'admin@batutv.com',
            role: parsed.role || 'Administrator',
            uid: parsed.uid || 'admin',
            timestamp: parsed.timestamp || Date.now(),
          };
        }
      }
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Save session to localStorage, sessionStorage, and Cookie
 */
export function saveAdminSession(user: { name: string; email: string; role: string; uid?: string }): void {
  if (typeof window === 'undefined') return;

  const sessionObj: StoredAdminSession = {
    name: user.name || 'Super Administrator BatuTV',
    email: user.email || 'admin@batutv.com',
    role: user.role || 'Administrator',
    uid: user.uid || 'admin',
    timestamp: Date.now(),
  };

  const serialized = JSON.stringify(sessionObj);

  try {
    localStorage.setItem(SESSION_KEY, serialized);
  } catch {
    // ignore
  }

  try {
    sessionStorage.setItem(SESSION_KEY, serialized);
  } catch {
    // ignore
  }

  try {
    // Cookie valid for 30 days
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${SESSION_KEY}=${encodeURIComponent(serialized)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
}

/**
 * Clear session from all storage layers
 */
export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }

  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }

  try {
    document.cookie = `${SESSION_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  } catch {
    // ignore
  }
}
