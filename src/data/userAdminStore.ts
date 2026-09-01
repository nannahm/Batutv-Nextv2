import { CMSUser, UserFormInput, UserRole, UserStatus, RolePermissionDetail } from '../types/user';
import { getStoredAuthors } from './authorAdminStore';
import { logSystemActivity, getStoredSecurityConfig } from './systemSettingsStore';
import { AdminUser } from '../types/admin';
import { firestoreUserRepository } from '../repositories/firestore/firestoreUserRepository';

export const USER_STORAGE_KEY = 'batutv_cms_users';
export const USER_UPDATED_EVENT = 'batutv_users_updated';

// Matrix of role capabilities based on project specification
export const ROLE_PERMISSIONS_MATRIX: Record<UserRole, RolePermissionDetail> = {
  admin: {
    role: 'admin',
    name: 'Administrator',
    badgeColor: 'bg-red-600/10 text-red-500 border-red-500/20',
    description: 'Akses penuh ke seluruh modul CMS, arsitektur sistem, keamanan, konfigurasi portal, dan manajemen akun pengguna.',
    allowedAccess: [
      'Dashboard & Statistik',
      'Artikel Berita (Full)',
      'Video Liputan (Full)',
      'Media Library (Full)',
      'Kategori & Tag',
      'Master Data Penulis',
      'Master Data Pages',
      'Manajemen Navigasi SO2',
      'Master Data Footer',
      'Master Data Site Settings',
      'Pengaturan Sistem & Keamanan',
      'Manajemen Pengguna (User Management)',
    ],
    capabilities: [
      'Menerbitkan (Publish) & Menarik (Unpublish) semua konten',
      'Mengatur Headline Utama & Hero Carousel',
      'Menambah, mengedit, dan menghapus seluruh akun CMS',
      'Konfigurasi Session Timeout, Password Policy, dan Maintenance Mode',
      'Ekspor & Impor Data Backup CMS',
      'Akses Audit Log Aktivitas Redaksi Lengkap',
    ],
    restrictedActions: [],
    workflowNotes: 'Akses root tanpa batasan workflow redaksional.',
  },
  redaksi: {
    role: 'redaksi',
    name: 'Redaksi',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    description: 'Dewan redaksi penanggung jawab kebijakan editorial, penataan beranda, kurasi naskah, dan supervisi publikasi.',
    allowedAccess: [
      'Dashboard Redaksi',
      'Artikel Berita (Full)',
      'Video Liputan (Full)',
      'Media Library (Full)',
      'Kategori & Tag',
      'Master Data Penulis',
      'Master Data Pages',
      'Manajemen Navigasi SO2',
    ],
    capabilities: [
      'Publish & Unpublish Berita dan Video',
      'Penetapan Berita Headline & Hero Banner',
      'Manajemen Tata Letak Beranda (Homepage Management)',
      'Penyuntingan Naskah Lintas Wartawan',
      'Pengelolaan Kategori dan Tag',
    ],
    restrictedActions: [
      'Tidak dapat mengakses User Management',
      'Tidak dapat mengubah Pengaturan Keamanan Sistem',
      'Tidak dapat melakukan Backup / Restore Sistem',
      'Tidak dapat mengaktifkan Maintenance Mode',
    ],
    workflowNotes: 'Otoritas editorial tertinggi untuk kelayakan tayang berita & penataan homepage.',
  },
  editor: {
    role: 'editor',
    name: 'Editor',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    description: 'Penyunting naskah berita, kurator video liputan, dan verifikator akurasi data sebelum diterbitkan ke publik.',
    allowedAccess: [
      'Dashboard Editor',
      'Artikel Berita (Semua Naskah)',
      'Video Liputan (Semua Video)',
      'Media Library (Upload & Pilih)',
      'Daftar Penulis (Master Data)',
    ],
    capabilities: [
      'Mengedit dan menyempurnakan naskah semua artikel',
      'Melakukan review dan fact-checking naskah reporter/kontributor',
      'Menerbitkan (Publish) artikel berita yang telah lolos uji',
      'Menerbitkan (Publish) siaran video YouTube',
    ],
    restrictedActions: [
      'Tidak dapat mengubah Site Settings',
      'Tidak dapat mengedit Footer & Navigasi',
      'Tidak dapat mengelola Pengguna (User Management)',
      'Tidak dapat mengakses Pengaturan Sistem',
    ],
    workflowNotes: 'Menerima draft dari Reporter / Kontributor → Penyuntingan → Publikasi.',
  },
  reporter: {
    role: 'reporter',
    name: 'Reporter',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    description: 'Jurnalis lapangan yang memproduksi berita, meliput peristiwa langsung, dan menyusun draft naskah.',
    allowedAccess: [
      'Dashboard Reporter',
      'Artikel Berita (Draft Milik Sendiri)',
      'Media Library (Upload Foto Liputan)',
    ],
    capabilities: [
      'Membuat artikel berita baru',
      'Mengedit artikel naskah milik sendiri selama berstatus Draft/Review',
      'Mengunggah dokumentasi foto pendukung ke media library',
    ],
    restrictedActions: [
      'Tidak dapat Menerbitkan (Publish) langsung ke website',
      'Tidak dapat Mengedit naskah milik reporter/jurnalis lain',
      'Tidak dapat Mengelola siaran Video',
      'Tidak dapat Mengakses Master Data, Kategori, atau Pengaturan',
    ],
    workflowNotes: 'Reporter → Tulis Draft Berita → Ajukan Review ke Editor → Editor Publish.',
  },
  kontributor: {
    role: 'kontributor',
    name: 'Kontributor',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description: 'Penulis lepas dan kontributor foto/opini yang mengirimkan liputan khusus komunitas, wisata, atau budaya.',
    allowedAccess: [
      'Dashboard Kontributor',
      'Kirim Naskah Artikel (Draft Submission)',
      'Upload Foto Pendukung',
    ],
    capabilities: [
      'Mengirim naskah tulisan/artikel sebagai draft submission',
      'Mengunggah foto karya asli untuk melengkapi tulisan',
    ],
    restrictedActions: [
      'Tidak dapat Menerbitkan (Publish) artikel langsung',
      'Tidak dapat Mengedit naskah setelah disetujui / naskah orang lain',
      'Tidak dapat Mengelola modul Video',
      'Tidak dapat Mengakses Master Data apa pun',
    ],
    workflowNotes: 'Kontributor → Draft Submission → Editor Review & Fact Check → Publish.',
  },
};

// Initial Seed Users mapped to Author Master Data
export const INITIAL_CMS_USERS: CMSUser[] = [
  {
    id: 'usr-001',
    fullName: 'Ahmad Fauzi, S.I.Kom',
    username: 'ahmad.fauzi',
    email: 'ahmad.fauzi@batutv.id',
    password: 'Password@123',
    role: 'admin',
    status: 'aktif',
    lastLogin: '2026-08-29T18:45:00.000Z',
    lastLoginDetails: {
      browser: 'Chrome 128.0 (macOS)',
      device: 'MacBook Pro Apple Silicon',
      ipAddress: '103.144.12.89',
      status: 'success',
      timestamp: '2026-08-29T18:45:00.000Z',
    },
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-08-29T18:45:00.000Z',
    authorId: 'aut-001',
    authorName: 'Ahmad Fauzi',
    forcePasswordChange: false,
    failedLoginAttempts: 0,
    sessionsCount: 1,
    notes: 'Akun Super Administrator Utama IT & Redaksi BatuTV',
  },
  {
    id: 'usr-002',
    fullName: 'Budi Santoso, M.I.Kom',
    username: 'budi.redaksi',
    email: 'budi.santoso@batutv.id',
    password: 'Password@123',
    role: 'redaksi',
    status: 'aktif',
    lastLogin: '2026-08-29T17:15:00.000Z',
    lastLoginDetails: {
      browser: 'Chrome 128.0 (Windows 11)',
      device: 'Desktop Newsroom BatuTV',
      ipAddress: '114.122.38.10',
      status: 'success',
      timestamp: '2026-08-29T17:15:00.000Z',
    },
    createdAt: '2026-01-01T07:00:00.000Z',
    updatedAt: '2026-08-29T17:15:00.000Z',
    authorId: 'aut-009',
    authorName: 'Budi Santoso',
    forcePasswordChange: false,
    failedLoginAttempts: 0,
    sessionsCount: 1,
    notes: 'Pemimpin Redaksi BatuTV Media',
  },
  {
    id: 'usr-003',
    fullName: 'Sinta Rahmawati',
    username: 'sinta.editor',
    email: 'sinta.rahma@batutv.id',
    password: 'Password@123',
    role: 'editor',
    status: 'aktif',
    lastLogin: '2026-08-29T16:20:00.000Z',
    lastLoginDetails: {
      browser: 'Firefox 129.0 (Windows)',
      device: 'Lenovo ThinkPad Redaksi',
      ipAddress: '180.252.19.44',
      status: 'success',
      timestamp: '2026-08-29T16:20:00.000Z',
    },
    createdAt: '2026-01-12T09:15:00.000Z',
    updatedAt: '2026-08-29T16:20:00.000Z',
    authorId: 'aut-002',
    authorName: 'Sinta Rahma',
    forcePasswordChange: false,
    failedLoginAttempts: 0,
    sessionsCount: 1,
    notes: 'Editor Senior Rubrik Ekonomi & Pemerintahan',
  },
  {
    id: 'usr-004',
    fullName: 'Dimas Pratama',
    username: 'dimas.reporter',
    email: 'dimas.pratama@batutv.id',
    password: 'Password@123',
    role: 'reporter',
    status: 'aktif',
    lastLogin: '2026-08-29T14:10:00.000Z',
    lastLoginDetails: {
      browser: 'Mobile Safari 17.5 (iOS)',
      device: 'iPhone 15 Pro Liputan',
      ipAddress: '114.124.90.11',
      status: 'success',
      timestamp: '2026-08-29T14:10:00.000Z',
    },
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-08-29T14:10:00.000Z',
    authorId: 'aut-003',
    authorName: 'Dimas Pratama',
    forcePasswordChange: false,
    failedLoginAttempts: 0,
    sessionsCount: 1,
    notes: 'Reporter Lapangan Olahraga & Komunitas',
  },
  {
    id: 'usr-005',
    fullName: 'Rina Wulandari',
    username: 'rina.redaksi',
    email: 'rina.wulandari@batutv.id',
    password: 'Password@123',
    role: 'redaksi',
    status: 'aktif',
    lastLogin: '2026-08-28T19:30:00.000Z',
    lastLoginDetails: {
      browser: 'Chrome 128.0 (macOS)',
      device: 'MacBook Air M2',
      ipAddress: '103.144.12.89',
      status: 'success',
      timestamp: '2026-08-28T19:30:00.000Z',
    },
    createdAt: '2026-01-05T07:30:00.000Z',
    updatedAt: '2026-08-28T19:30:00.000Z',
    authorId: 'aut-004',
    authorName: 'Rina Wulandari',
    forcePasswordChange: false,
    failedLoginAttempts: 0,
    sessionsCount: 1,
    notes: 'Dewan Redaksi BatuTV',
  },
  {
    id: 'usr-006',
    fullName: 'Dewi Anggraini',
    username: 'dewi.editor',
    email: 'dewi.anggraini@batutv.id',
    password: 'Password@123',
    role: 'editor',
    status: 'aktif',
    lastLogin: '2026-08-29T11:40:00.000Z',
    lastLoginDetails: {
      browser: 'Safari 17.5 (iPadOS)',
      device: 'iPad Pro 11-inch',
      ipAddress: '125.166.4.15',
      status: 'success',
      timestamp: '2026-08-29T11:40:00.000Z',
    },
    createdAt: '2026-01-20T09:00:00.000Z',
    updatedAt: '2026-08-29T11:40:00.000Z',
    authorId: 'aut-008',
    authorName: 'Dewi Anggraini',
    forcePasswordChange: false,
    failedLoginAttempts: 0,
    sessionsCount: 1,
    notes: 'Editor Rubrik Kesehatan & Edukasi',
  },
  {
    id: 'usr-007',
    fullName: 'Nadia Putri',
    username: 'nadia.kontributor',
    email: 'nadia.putri@batutv.id',
    password: 'Password@123',
    role: 'kontributor',
    status: 'aktif',
    lastLogin: '2026-08-27T15:00:00.000Z',
    lastLoginDetails: {
      browser: 'Chrome 128.0 (Windows)',
      device: 'ASUS Vivobook',
      ipAddress: '182.1.200.55',
      status: 'success',
      timestamp: '2026-08-27T15:00:00.000Z',
    },
    createdAt: '2026-03-01T08:40:00.000Z',
    updatedAt: '2026-08-27T15:00:00.000Z',
    authorId: 'aut-006',
    authorName: 'Nadia Putri',
    forcePasswordChange: false,
    failedLoginAttempts: 0,
    sessionsCount: 0,
    notes: 'Kontributor Budaya & Kuliner Khas Batu',
  },
  {
    id: 'usr-008',
    fullName: 'Arif Setiawan',
    username: 'arif.foto',
    email: 'arif.setiawan@batutv.id',
    password: 'Password@123',
    role: 'kontributor',
    status: 'nonaktif',
    lastLogin: '2026-08-10T09:12:00.000Z',
    lastLoginDetails: {
      browser: 'Chrome 127.0 (Android)',
      device: 'Samsung Galaxy S23',
      ipAddress: '110.138.45.2',
      status: 'success',
      timestamp: '2026-08-10T09:12:00.000Z',
    },
    createdAt: '2026-04-01T14:00:00.000Z',
    updatedAt: '2026-08-15T10:00:00.000Z',
    authorId: 'aut-011',
    authorName: 'Arif Setiawan',
    forcePasswordChange: false,
    failedLoginAttempts: 0,
    sessionsCount: 0,
    notes: 'Akun nonaktif sementara - cuti operasional fotografi',
  },
  {
    id: 'usr-009',
    fullName: 'Fajar Hidayat',
    username: 'fajar.reporter',
    email: 'fajar.hidayat@batutv.id',
    password: 'Password@123',
    role: 'reporter',
    status: 'ditangguhkan',
    lastLogin: '2026-08-22T08:30:00.000Z',
    lastLoginDetails: {
      browser: 'Firefox 129.0 (Linux)',
      device: 'Ubuntu Workstation',
      ipAddress: '103.220.10.99',
      status: 'failed',
      timestamp: '2026-08-22T08:30:00.000Z',
    },
    createdAt: '2026-02-15T11:20:00.000Z',
    updatedAt: '2026-08-22T08:30:00.000Z',
    authorId: 'aut-005',
    authorName: 'Fajar Hidayat',
    forcePasswordChange: true,
    failedLoginAttempts: 4,
    sessionsCount: 0,
    notes: 'Akun ditangguhkan oleh Administrator karena percobaan login mencurigakan',
  },
];

// In-Memory state for instant UI rendering and synchronous helper lookups
let inMemoryUsers: CMSUser[] = loadLocalCache();
let isSubscribed = false;

function loadLocalCache(): CMSUser[] {
  if (typeof window === 'undefined') return INITIAL_CMS_USERS;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(INITIAL_CMS_USERS));
      return INITIAL_CMS_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_CMS_USERS;
  } catch (err) {
    console.error('Error reading stored users:', err);
    return INITIAL_CMS_USERS;
  }
}

function updateLocalCache(users: CMSUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT, { detail: users }));
  } catch (err) {
    console.error('Error saving stored users:', err);
  }
}

function initRealtimeSync() {
  if (typeof window === 'undefined' || isSubscribed) return;
  isSubscribed = true;

  firestoreUserRepository.subscribe(
    (cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        const local = loadLocalCache();
        const merged = cloudUsers.map((cu) => {
          const localMatch = local.find(
            (lu) =>
              lu.id === cu.id ||
              lu.email.toLowerCase() === cu.email.toLowerCase() ||
              lu.username.toLowerCase() === cu.username.toLowerCase()
          );
          return {
            ...cu,
            password: cu.password || localMatch?.password || 'Password@123',
          };
        });
        inMemoryUsers = merged;
        updateLocalCache(merged);
      }
    },
    (err) => {
      console.warn('[userAdminStore] Firestore subscription fallback to local cache:', err);
    }
  );
}

initRealtimeSync();

// Helper: Read users (SSoT synced with Firestore & LocalStorage cache)
export const getStoredUsers = (): CMSUser[] => {
  if (inMemoryUsers && inMemoryUsers.length > 0) {
    return inMemoryUsers;
  }
  return loadLocalCache();
};

/**
 * Force refresh from Firestore
 */
export async function refreshUsersFromFirestore(): Promise<CMSUser[]> {
  try {
    const users = await firestoreUserRepository.getUsers();
    if (users && users.length > 0) {
      inMemoryUsers = users;
      updateLocalCache(users);
      return users;
    }
  } catch (err) {
    console.warn('[userAdminStore] Failed to fetch users from Firestore:', err);
  }
  return getStoredUsers();
}

// Helper: Save users to cache and broadcast event
export const saveStoredUsers = (users: CMSUser[]): void => {
  inMemoryUsers = users;
  updateLocalCache(users);
};

// Helper: Get user by ID
export const getUserById = (id: string): CMSUser | undefined => {
  const users = getStoredUsers();
  return users.find((u) => u.id === id);
};

// Helper: Get user by Username
export const getUserByUsername = (username: string): CMSUser | undefined => {
  const users = getStoredUsers();
  return users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
};

// Helper: Get user by Email
export const getUserByEmail = (email: string): CMSUser | undefined => {
  const users = getStoredUsers();
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
};

// Helper: Validate Password against system security policy
export const validatePasswordPolicy = (
  password: string
): { isValid: boolean; message?: string } => {
  const security = getStoredSecurityConfig();
  const minLength = security.passwordMinLength || 8;

  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Password harus memiliki panjang minimal ${minLength} karakter sesuai kebijakan keamanan sistem.`,
    };
  }

  if (security.passwordComplexityRequired) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return {
        isValid: false,
        message: 'Password wajib memuat kombinasi huruf besar (A-Z), huruf kecil (a-z), dan angka (0-9).',
      };
    }
  }

  return { isValid: true };
};

/**
 * Map Author Position from Master Data to CMS User Role
 * Redaksi / Redaktur -> redaksi
 * Editor -> editor
 * Reporter / Wartawan / Jurnalis -> reporter
 * Kontributor -> kontributor
 * Admin -> admin (manual)
 */
export const mapAuthorPositionToRole = (position?: string): UserRole => {
  if (!position) return 'reporter';
  const p = position.toLowerCase().trim();
  if (
    p.includes('redaksi') ||
    p.includes('redaktur') ||
    p.includes('pemred') ||
    p.includes('pemimpin redaksi')
  ) {
    return 'redaksi';
  }
  if (p.includes('editor') || p.includes('penyunting')) {
    return 'editor';
  }
  if (
    p.includes('reporter') ||
    p.includes('wartawan') ||
    p.includes('jurnalis') ||
    p.includes('liputan')
  ) {
    return 'reporter';
  }
  if (p.includes('kontributor') || p.includes('kolumnis') || p.includes('penulis tamu')) {
    return 'kontributor';
  }
  if (p.includes('admin') || p.includes('administrator')) {
    return 'admin';
  }
  return 'reporter';
};

// Helper: Get user by linked author ID
export const getUserByAuthorId = (authorId: string): CMSUser | undefined => {
  const users = getStoredUsers();
  return users.find((u) => u.authorId === authorId);
};

// Helper: Get available authors for user linking (enforcing 1 User = 1 Penulis)
export const getAvailableAuthorsForUser = (
  excludeUserId?: string
): {
  id: string;
  name: string;
  position: string;
  email: string;
  slug: string;
  bio?: string;
  photoUrl?: string;
  isLinked: boolean;
  linkedToUserId?: string;
  linkedToUsername?: string;
  linkedToRole?: string;
}[] => {
  const authors = getStoredAuthors();
  const users = getStoredUsers();

  return authors.map((author) => {
    const linkedUser = users.find(
      (u) => u.authorId === author.id && u.id !== excludeUserId
    );

    return {
      id: author.id,
      name: author.name,
      position: author.position,
      email: author.email,
      slug: author.slug,
      bio: author.bio,
      photoUrl: author.photoUrl,
      isLinked: Boolean(linkedUser),
      linkedToUserId: linkedUser?.id,
      linkedToUsername: linkedUser?.username,
      linkedToRole: linkedUser?.role,
    };
  });
};

// Pure helper: Check if account is the permanent protected Super Admin
export const isProtectedSuperAdminAccount = (userIdOrUsername: string, email?: string): boolean => {
  const cleanId = userIdOrUsername.toLowerCase().trim();
  const cleanEmail = email?.toLowerCase().trim() || '';

  if (
    cleanId === 'usr-001' ||
    cleanId === 'ahmad.fauzi' ||
    cleanId === 'admin' ||
    cleanEmail === 'admin@batutv.com' ||
    cleanEmail === 'ahmad.fauzi@batutv.id'
  ) {
    return true;
  }
  return false;
};

// Helper: Add new User (Author First Architecture)
export const addUser = (
  input: UserFormInput,
  currentUser?: AdminUser | { name: string; role: string; email?: string }
): { success: boolean; user?: CMSUser; error?: string } => {
  // Store-level RBAC check: only Admin can add users
  if (currentUser?.role) {
    const roleClean = currentUser.role.toLowerCase();
    if (!roleClean.includes('admin')) {
      return {
        success: false,
        error: 'Otorisasi ditolak: Hanya Administrator yang berwenang menambahkan pengguna baru.',
      };
    }
  }

  const users = getStoredUsers();
  const allAuthors = getStoredAuthors();

  // 1. Validation & Resolution: Author First Master Data
  let resolvedFullName = input.fullName?.trim() || '';
  let resolvedEmail = input.email?.trim().toLowerCase() || '';
  let resolvedAuthorName: string | undefined = undefined;
  let resolvedAuthorPosition: string | undefined = undefined;
  let resolvedAuthorPhoto: string | undefined = undefined;

  if (input.authorId) {
    const existingLink = users.find((u) => u.authorId === input.authorId);
    if (existingLink) {
      return {
        success: false,
        error: `Penulis ini sudah terhubung ke akun user @${existingLink.username}. Satu penulis hanya boleh terhubung ke satu akun CMS.`,
      };
    }
    const targetAuthor = allAuthors.find((a) => a.id === input.authorId);
    if (!targetAuthor) {
      return { success: false, error: 'Master Data Penulis yang dipilih tidak valid.' };
    }
    resolvedFullName = targetAuthor.name;
    resolvedEmail = targetAuthor.email.toLowerCase().trim();
    resolvedAuthorName = targetAuthor.name;
    resolvedAuthorPosition = targetAuthor.position;
    resolvedAuthorPhoto = targetAuthor.photoUrl;
  }

  // 2. Validation: Username uniqueness
  const cleanUsername = input.username.trim().toLowerCase();
  if (!cleanUsername) {
    return { success: false, error: 'Username wajib diisi.' };
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(cleanUsername)) {
    return {
      success: false,
      error: 'Username hanya boleh memuat huruf, angka, titik (.), strip (-), dan garis bawah (_).',
    };
  }
  if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
    return {
      success: false,
      error: `Username "${cleanUsername}" sudah digunakan oleh pengguna lain. Silakan pilih username lain.`,
    };
  }

  // 3. Validation: Email format & uniqueness
  if (!resolvedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resolvedEmail)) {
    return { success: false, error: 'Alamat email penulis tidak valid.' };
  }
  if (users.some((u) => u.email.toLowerCase() === resolvedEmail)) {
    return {
      success: false,
      error: `Email "${resolvedEmail}" sudah terdaftar pada akun login lain.`,
    };
  }

  // 4. Validation: Password & Security Policy
  if (!input.password) {
    return { success: false, error: 'Password wajib diisi untuk akun baru.' };
  }
  if (input.password !== input.confirmPassword) {
    return { success: false, error: 'Konfirmasi password tidak cocok dengan password yang dimasukkan.' };
  }

  const passCheck = validatePasswordPolicy(input.password);
  if (!passCheck.isValid) {
    return { success: false, error: passCheck.message };
  }

  // 5. Construct New User Record
  const newId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const nowIso = new Date().toISOString();

  const newUser: CMSUser = {
    id: newId,
    fullName: resolvedFullName || cleanUsername,
    username: cleanUsername,
    email: resolvedEmail,
    password: input.password,
    role: input.role,
    status: input.status || 'aktif',
    createdAt: nowIso,
    updatedAt: nowIso,
    lastLogin: null,
    authorId: input.authorId || null,
    authorName: resolvedAuthorName,
    authorPosition: resolvedAuthorPosition,
    authorPhotoUrl: resolvedAuthorPhoto,
    forcePasswordChange: Boolean(input.forcePasswordChange),
    failedLoginAttempts: 0,
    sessionsCount: 0,
  };

  const updatedUsers = [newUser, ...users];
  saveStoredUsers(updatedUsers);

  // Async persist to Firestore
  firestoreUserRepository.saveUser(newUser).catch((err) => {
    console.warn('[userAdminStore] Firestore async saveUser error:', err);
  });

  // Log activity
  logSystemActivity(
    currentUser || { name: 'Administrator', role: 'Administrator' },
    'Tambah Pengguna CMS',
    `Membuat akun pengguna baru: ${newUser.fullName} (@${newUser.username}) [Role: ${ROLE_PERMISSIONS_MATRIX[newUser.role]?.name || newUser.role}] terhubung ke Penulis: ${resolvedAuthorName || 'Tanpa Relasi'}`,
    'success',
    'Pengguna'
  );

  return { success: true, user: newUser };
};

// Helper: Update existing User (Author First Architecture)
export const updateUser = (
  id: string,
  input: Partial<UserFormInput>,
  currentUser?: AdminUser | { name: string; role: string; email?: string }
): { success: boolean; user?: CMSUser; error?: string } => {
  // Store-level RBAC check: only Admin can update users
  if (currentUser?.role) {
    const roleClean = currentUser.role.toLowerCase();
    if (!roleClean.includes('admin')) {
      return {
        success: false,
        error: 'Otorisasi ditolak: Hanya Administrator yang berwenang memperbarui pengguna.',
      };
    }
  }

  const users = getStoredUsers();
  const allAuthors = getStoredAuthors();
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return { success: false, error: 'Data pengguna tidak ditemukan.' };
  }

  const existingUser = users[index];

  // Super Admin Protection: Cannot downgrade Super Admin role or suspend Super Admin
  if (isProtectedSuperAdminAccount(existingUser.id, existingUser.email)) {
    if (input.role && input.role !== 'admin') {
      return {
        success: false,
        error: 'Akun Super Administrator Utama dilindungi: Peran Admin tidak dapat diturunkan atau diubah.',
      };
    }
    if (input.status && input.status === 'ditangguhkan') {
      return {
        success: false,
        error: 'Akun Super Administrator Utama dilindungi dan tidak dapat ditangguhkan.',
      };
    }
  }

  // 1. Author relation update & data synchronization
  let resolvedAuthorId = existingUser.authorId;
  let resolvedAuthorName = existingUser.authorName;
  let resolvedAuthorPosition = existingUser.authorPosition;
  let resolvedAuthorPhoto = existingUser.authorPhotoUrl;
  let resolvedFullName = existingUser.fullName;
  let resolvedEmail = existingUser.email;

  if (input.authorId !== undefined) {
    if (input.authorId) {
      const existingLink = users.find((u) => u.id !== id && u.authorId === input.authorId);
      if (existingLink) {
        return {
          success: false,
          error: `Penulis ini sudah terhubung ke akun user @${existingLink.username}. Satu penulis hanya boleh terhubung ke satu akun CMS.`,
        };
      }
      const targetAuthor = allAuthors.find((a) => a.id === input.authorId);
      if (targetAuthor) {
        resolvedAuthorId = input.authorId;
        resolvedAuthorName = targetAuthor.name;
        resolvedAuthorPosition = targetAuthor.position;
        resolvedAuthorPhoto = targetAuthor.photoUrl;
        resolvedFullName = targetAuthor.name;
        resolvedEmail = targetAuthor.email.toLowerCase().trim();
      }
    } else {
      resolvedAuthorId = null;
      resolvedAuthorName = undefined;
      resolvedAuthorPosition = undefined;
      resolvedAuthorPhoto = undefined;
      if (input.fullName) resolvedFullName = input.fullName.trim();
      if (input.email) resolvedEmail = input.email.trim().toLowerCase();
    }
  }

  // 2. Check Username uniqueness if changed
  let cleanUsername = existingUser.username;
  if (input.username && input.username.trim().toLowerCase() !== existingUser.username.toLowerCase()) {
    cleanUsername = input.username.trim().toLowerCase();
    if (!/^[a-zA-Z0-9._-]+$/.test(cleanUsername)) {
      return {
        success: false,
        error: 'Username hanya boleh memuat huruf, angka, titik (.), strip (-), dan garis bawah (_).',
      };
    }
    if (users.some((u) => u.id !== id && u.username.toLowerCase() === cleanUsername)) {
      return {
        success: false,
        error: `Username "${cleanUsername}" sudah digunakan oleh pengguna lain.`,
      };
    }
  }

  // 3. Check Email uniqueness if changed
  if (resolvedEmail !== existingUser.email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resolvedEmail)) {
      return { success: false, error: 'Format alamat email tidak valid.' };
    }
    if (users.some((u) => u.id !== id && u.email.toLowerCase() === resolvedEmail)) {
      return {
        success: false,
        error: `Email "${resolvedEmail}" sudah terdaftar pada akun lain.`,
      };
    }
  }

  // Track changed fields for audit log
  const roleChanged = input.role && input.role !== existingUser.role;
  const statusChanged = input.status && input.status !== existingUser.status;
  const authorChanged = resolvedAuthorId !== existingUser.authorId;

  const updatedRecord: CMSUser = {
    ...existingUser,
    fullName: resolvedFullName,
    username: cleanUsername,
    email: resolvedEmail,
    role: input.role || existingUser.role,
    status: input.status || existingUser.status,
    authorId: resolvedAuthorId,
    authorName: resolvedAuthorName,
    authorPosition: resolvedAuthorPosition,
    authorPhotoUrl: resolvedAuthorPhoto,
    forcePasswordChange:
      input.forcePasswordChange !== undefined
        ? input.forcePasswordChange
        : existingUser.forcePasswordChange,
    updatedAt: new Date().toISOString(),
  };

  users[index] = updatedRecord;
  saveStoredUsers(users);

  // Async persist to Firestore
  firestoreUserRepository.saveUser(updatedRecord).catch((err) => {
    console.warn('[userAdminStore] Firestore async updateUser error:', err);
  });

  // Log activity
  if (roleChanged) {
    logSystemActivity(
      currentUser || { name: 'Administrator', role: 'Administrator' },
      'Ganti Role Pengguna',
      `Mengubah peran @${updatedRecord.username} dari "${ROLE_PERMISSIONS_MATRIX[existingUser.role]?.name}" menjadi "${ROLE_PERMISSIONS_MATRIX[updatedRecord.role]?.name}"`,
      'warning',
      'Pengguna'
    );
  } else if (statusChanged) {
    logSystemActivity(
      currentUser || { name: 'Administrator', role: 'Administrator' },
      'Ubah Status Pengguna',
      `Status akun @${updatedRecord.username} diubah menjadi "${updatedRecord.status.toUpperCase()}"`,
      updatedRecord.status === 'ditangguhkan' ? 'warning' : 'success',
      'Pengguna'
    );
  } else if (authorChanged) {
    logSystemActivity(
      currentUser || { name: 'Administrator', role: 'Administrator' },
      'Ubah Relasi Penulis',
      `Menghubungkan akun @${updatedRecord.username} ke Penulis Master Data: ${resolvedAuthorName || 'Diputuskan'}`,
      'info',
      'Pengguna'
    );
  } else {
    logSystemActivity(
      currentUser || { name: 'Administrator', role: 'Administrator' },
      'Edit Data Pengguna',
      `Memperbarui profil data akun @${updatedRecord.username} (${updatedRecord.fullName})`,
      'success',
      'Pengguna'
    );
  }

  return { success: true, user: updatedRecord };
};

// Helper: Delete User (with safety checks)
export const deleteUser = (
  id: string,
  currentUser?: AdminUser | { name: string; role: string; email?: string }
): { success: boolean; error?: string } => {
  // Store-level RBAC check: only Admin can delete users
  if (currentUser?.role) {
    const roleClean = currentUser.role.toLowerCase();
    if (!roleClean.includes('admin')) {
      return {
        success: false,
        error: 'Otorisasi ditolak: Hanya Administrator yang berwenang menghapus pengguna.',
      };
    }
  }

  const users = getStoredUsers();
  const target = users.find((u) => u.id === id);

  if (!target) {
    return { success: false, error: 'Pengguna tidak ditemukan.' };
  }

  // Super Admin Protection: Cannot delete Super Administrator
  if (isProtectedSuperAdminAccount(target.id, target.email)) {
    return {
      success: false,
      error: 'Akun Super Administrator Utama dilindungi dan tidak dapat dihapus dari sistem.',
    };
  }

  // Safety: Prevent deleting the last active Administrator
  const adminUsers = users.filter((u) => u.role === 'admin' && u.status === 'aktif');
  if (target.role === 'admin' && adminUsers.length <= 1) {
    return {
      success: false,
      error: 'Tidak dapat menghapus akun Administrator ini karena merupakan satu-satunya Admin aktif di sistem.',
    };
  }

  // Safety: Prevent deleting self
  if (currentUser && (currentUser as any).email && target.email.toLowerCase() === (currentUser as any).email.toLowerCase()) {
    return {
      success: false,
      error: 'Anda tidak dapat menghapus akun yang sedang Anda gunakan untuk login.',
    };
  }

  const remaining = users.filter((u) => u.id !== id);
  saveStoredUsers(remaining);

  // Async persist to Firestore
  firestoreUserRepository.deleteUser(id).catch((err) => {
    console.warn('[userAdminStore] Firestore async deleteUser error:', err);
  });

  logSystemActivity(
    currentUser || { name: 'Administrator', role: 'Administrator' },
    'Hapus Pengguna CMS',
    `Menghapus akun pengguna @${target.username} (${target.fullName}) dengan role ${ROLE_PERMISSIONS_MATRIX[target.role]?.name || target.role}`,
    'warning',
    'Pengguna'
  );

  return { success: true };
};

// Helper: Reset User Password
export const resetUserPassword = (
  id: string,
  newPass: string,
  forceChangeOnLogin: boolean = true,
  currentUser?: AdminUser | { name: string; role: string; email?: string }
): { success: boolean; tempPassword?: string; error?: string } => {
  // Store-level RBAC check: only Admin can reset other user passwords
  if (currentUser?.role) {
    const roleClean = currentUser.role.toLowerCase();
    if (!roleClean.includes('admin')) {
      return {
        success: false,
        error: 'Otorisasi ditolak: Hanya Administrator yang berwenang mereset kata sandi pengguna.',
      };
    }
  }

  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return { success: false, error: 'Pengguna tidak ditemukan.' };
  }

  const passCheck = validatePasswordPolicy(newPass);
  if (!passCheck.isValid) {
    return { success: false, error: passCheck.message };
  }

  users[index] = {
    ...users[index],
    password: newPass,
    forcePasswordChange: forceChangeOnLogin,
    failedLoginAttempts: 0,
    updatedAt: new Date().toISOString(),
  };

  saveStoredUsers(users);

  // Async persist to Firestore
  firestoreUserRepository.saveUser(users[index]).catch((err) => {
    console.warn('[userAdminStore] Firestore async resetUserPassword error:', err);
  });

  logSystemActivity(
    currentUser || { name: 'Administrator', role: 'Administrator' },
    'Reset Password Pengguna',
    `Kata sandi untuk akun @${users[index].username} berhasil direset (Paksa Ganti: ${forceChangeOnLogin ? 'Ya' : 'Tidak'})`,
    'warning',
    'Keamanan'
  );

  return { success: true, tempPassword: newPass };
};

// Helper: Toggle Suspend Account
export const toggleUserSuspend = (
  id: string,
  currentUser?: AdminUser | { name: string; role: string; email?: string }
): { success: boolean; newStatus?: UserStatus; error?: string } => {
  // Store-level RBAC check: only Admin can suspend/unsuspend users
  if (currentUser?.role) {
    const roleClean = currentUser.role.toLowerCase();
    if (!roleClean.includes('admin')) {
      return {
        success: false,
        error: 'Otorisasi ditolak: Hanya Administrator yang berwenang menangguhkan akun.',
      };
    }
  }

  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return { success: false, error: 'Pengguna tidak ditemukan.' };
  }

  const user = users[index];

  // Super Admin Protection: Cannot suspend Super Administrator
  if (isProtectedSuperAdminAccount(user.id, user.email)) {
    return {
      success: false,
      error: 'Akun Super Administrator Utama dilindungi dan tidak dapat ditangguhkan.',
    };
  }

  const newStatus: UserStatus = user.status === 'ditangguhkan' ? 'aktif' : 'ditangguhkan';

  // Safety check: Cannot suspend the last admin
  if (newStatus === 'ditangguhkan' && user.role === 'admin') {
    const activeAdmins = users.filter((u) => u.role === 'admin' && u.status === 'aktif' && u.id !== id);
    if (activeAdmins.length === 0) {
      return {
        success: false,
        error: 'Tidak dapat menangguhkan akun Administrator ini karena merupakan satu-satunya Admin aktif.',
      };
    }
  }

  users[index] = {
    ...user,
    status: newStatus,
    failedLoginAttempts: newStatus === 'aktif' ? 0 : user.failedLoginAttempts,
    sessionsCount: newStatus === 'ditangguhkan' ? 0 : user.sessionsCount,
    updatedAt: new Date().toISOString(),
  };

  saveStoredUsers(users);

  const actionName = newStatus === 'ditangguhkan' ? 'Suspend User' : 'Aktifkan User';
  const desc =
    newStatus === 'ditangguhkan'
      ? `Akun @${user.username} ditangguhkan dan seluruh sesi login dicabut.`
      : `Akun @${user.username} diaktifkan kembali.`;

  logSystemActivity(
    currentUser || { name: 'Administrator', role: 'Administrator' },
    actionName,
    desc,
    newStatus === 'ditangguhkan' ? 'warning' : 'success',
    'Keamanan'
  );

  return { success: true, newStatus };
};

// Helper: Toggle Force Password Change on next login
export const toggleForcePasswordChange = (
  id: string,
  currentUser?: AdminUser | { name: string; role: string; email?: string }
): { success: boolean; forceChange?: boolean; error?: string } => {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return { success: false, error: 'Pengguna tidak ditemukan.' };
  }

  const nextState = !users[index].forcePasswordChange;
  users[index] = {
    ...users[index],
    forcePasswordChange: nextState,
    updatedAt: new Date().toISOString(),
  };

  saveStoredUsers(users);

  logSystemActivity(
    currentUser || { name: 'Administrator', role: 'Administrator' },
    'Paksa Ganti Password',
    `Status paksa ganti kata sandi untuk akun @${users[index].username} diatur menjadi: ${nextState ? 'Aktif' : 'Nonaktif'}`,
    'info',
    'Keamanan'
  );

  return { success: true, forceChange: nextState };
};

// Helper: Revoke all sessions (Logout Semua Session)
export const revokeAllUserSessions = (
  id: string,
  currentUser?: AdminUser | { name: string; role: string; email?: string }
): { success: boolean; error?: string } => {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return { success: false, error: 'Pengguna tidak ditemukan.' };
  }

  users[index] = {
    ...users[index],
    sessionsCount: 0,
    updatedAt: new Date().toISOString(),
  };

  saveStoredUsers(users);

  logSystemActivity(
    currentUser || { name: 'Administrator', role: 'Administrator' },
    'Logout Semua Session',
    `Seluruh sesi login aktif untuk akun @${users[index].username} telah dicabut secara paksa`,
    'warning',
    'Keamanan'
  );

  return { success: true };
};

// Helper: Calculate Statistics
export const getUserStats = () => {
  const users = getStoredUsers();
  return {
    total: users.length,
    active: users.filter((u) => u.status === 'aktif').length,
    inactive: users.filter((u) => u.status === 'nonaktif').length,
    suspended: users.filter((u) => u.status === 'ditangguhkan').length,
    linkedToAuthor: users.filter((u) => Boolean(u.authorId)).length,
    admins: users.filter((u) => u.role === 'admin').length,
    redaksi: users.filter((u) => u.role === 'redaksi').length,
    editors: users.filter((u) => u.role === 'editor').length,
    reporters: users.filter((u) => u.role === 'reporter').length,
    kontributors: users.filter((u) => u.role === 'kontributor').length,
  };
};
