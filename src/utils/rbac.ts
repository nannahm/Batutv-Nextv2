import { UserRole, RolePermissionDetail } from '../types/user';
import { AdminArticle, AdminUser } from '../types/admin';
import { ROLE_PERMISSIONS_MATRIX, getStoredUsers } from '../data/userAdminStore';
import { logSystemActivity } from '../data/systemSettingsStore';

/**
 * RBAC & PERMISSION SERVICE
 * BatuTV Control CMS
 * 
 * Strict Role-Based Access Control enforcing editorial hierarchy:
 * 1. Admin (Super Admin) - Full system & CMS root control
 * 2. Redaksi (Chief Editor) - Full editorial, media, categories, navigation, homepage
 * 3. Editor - Review, editing, and publishing all news and videos
 * 4. Reporter - Create and edit own drafts, upload photos (NO direct publish)
 * 5. Kontributor - Draft submissions and photo upload (NO direct publish)
 */

export const normalizeUserRole = (roleStr?: string | null): UserRole => {
  if (!roleStr) return 'admin';
  const clean = roleStr.toLowerCase().trim();
  if (
    clean === 'admin' ||
    clean === 'administrator' ||
    clean === 'super administrator' ||
    clean === 'super admin' ||
    clean.includes('admin')
  ) {
    return 'admin';
  }
  if (
    clean === 'redaksi' ||
    clean === 'redaktur' ||
    clean === 'pemred' ||
    clean === 'pemimpin redaksi' ||
    clean === 'dewan redaksi'
  ) {
    return 'redaksi';
  }
  if (clean === 'editor' || clean === 'penyunting') {
    return 'editor';
  }
  if (
    clean === 'reporter' ||
    clean === 'wartawan' ||
    clean === 'jurnalis' ||
    clean.includes('reporter')
  ) {
    return 'reporter';
  }
  if (
    clean === 'kontributor' ||
    clean === 'penulis tamu' ||
    clean === 'kolumnis'
  ) {
    return 'kontributor';
  }
  return 'reporter';
};

export interface RouteAccessCheck {
  allowed: boolean;
  role: UserRole;
  requiredRoleName?: string;
  moduleName: string;
  reason?: string;
}

/**
 * Route Guard validator for BATUTV Control CMS
 */
export const checkRoutePermission = (
  roleInput: UserRole | string | undefined,
  path: string
): RouteAccessCheck => {
  const role = normalizeUserRole(roleInput);

  // 1. Dashboard is accessible to all authenticated CMS users
  if (path === '/batutv-control/dashboard' || path === '/batutv-control') {
    return {
      allowed: true,
      role,
      moduleName: 'Dashboard',
    };
  }

  // 2. Berita (News) Module
  if (path.startsWith('/batutv-control/berita')) {
    // Everyone can access news, but specific subroutes have role restrictions
    if (path.includes('/headline')) {
      // Headline curation only for Admin and Redaksi
      if (role === 'admin' || role === 'redaksi') {
        return { allowed: true, role, moduleName: 'Headline Berita' };
      }
      return {
        allowed: false,
        role,
        requiredRoleName: 'Administrator atau Dewan Redaksi',
        moduleName: 'Headline Berita',
        reason: 'Penetapan urutan headline beranda hanya dapat dikelola oleh Administrator dan Dewan Redaksi.',
      };
    }
    return { allowed: true, role, moduleName: 'Manajemen Berita' };
  }

  // 3. Video Module
  if (path.startsWith('/batutv-control/video')) {
    if (role === 'admin' || role === 'redaksi' || role === 'editor') {
      return { allowed: true, role, moduleName: 'Manajemen Video' };
    }
    return {
      allowed: false,
      role,
      requiredRoleName: 'Administrator, Redaksi, atau Editor',
      moduleName: 'Manajemen Video',
      reason: 'Pengelolaan video YouTube dibatasi khusus untuk tim Redaksi dan Editor.',
    };
  }

  // 4. Media Storage Module
  if (path.startsWith('/batutv-control/media')) {
    return { allowed: true, role, moduleName: 'Penyimpanan Media' };
  }

  // 5. Kategori & Tag
  if (path.startsWith('/batutv-control/kategori')) {
    if (role === 'admin' || role === 'redaksi') {
      return { allowed: true, role, moduleName: 'Manajemen Kategori' };
    }
    return {
      allowed: false,
      role,
      requiredRoleName: 'Administrator atau Dewan Redaksi',
      moduleName: 'Manajemen Kategori',
      reason: 'Taksonomi rubrik/kategori portal hanya dapat dikonfigurasi oleh Administrator dan Dewan Redaksi.',
    };
  }

  if (path.startsWith('/batutv-control/tag')) {
    if (role === 'admin' || role === 'redaksi') {
      return { allowed: true, role, moduleName: 'Manajemen Tag & Topik' };
    }
    return {
      allowed: false,
      role,
      requiredRoleName: 'Administrator atau Dewan Redaksi',
      moduleName: 'Manajemen Tag & Topik',
      reason: 'Manajemen kata kunci dan topik viral dibatasi untuk Administrator dan Redaksi.',
    };
  }

  // 6. Master Data Penulis
  if (path.startsWith('/batutv-control/penulis') || path.startsWith('/batutv-control/master-data/penulis')) {
    if (role === 'admin' || role === 'redaksi' || role === 'editor') {
      return { allowed: true, role, moduleName: 'Master Data Penulis' };
    }
    return {
      allowed: false,
      role,
      requiredRoleName: 'Administrator, Redaksi, atau Editor',
      moduleName: 'Master Data Penulis',
      reason: 'Master data profil publik penulis hanya dapat diakses oleh Editor ke atas.',
    };
  }

  // 7. Master Data Pages, Navigasi, Footer, Site Settings
  if (path.startsWith('/batutv-control/pages') || path.startsWith('/batutv-control/master-data/pages')) {
    if (role === 'admin' || role === 'redaksi') {
      return { allowed: true, role, moduleName: 'Master Data Halaman Statis (Pages)' };
    }
    return {
      allowed: false,
      role,
      requiredRoleName: 'Administrator atau Dewan Redaksi',
      moduleName: 'Master Data Pages',
      reason: 'Halaman statis portal (Tentang Kami, Pedoman Siber, dll) dilindungi untuk Administrator & Redaksi.',
    };
  }

  if (path.startsWith('/batutv-control/navigasi')) {
    if (role === 'admin' || role === 'redaksi') {
      return { allowed: true, role, moduleName: 'Manajemen Navigasi SO2' };
    }
    return {
      allowed: false,
      role,
      requiredRoleName: 'Administrator atau Dewan Redaksi',
      moduleName: 'Manajemen Navigasi',
      reason: 'Susunan menu navigasi portal utama hanya boleh diubah oleh Administrator dan Redaksi.',
    };
  }

  if (path.startsWith('/batutv-control/footer') || path.startsWith('/batutv-control/master-data/footer')) {
    if (role === 'admin' || role === 'redaksi') {
      return { allowed: true, role, moduleName: 'Master Data Footer' };
    }
    return {
      allowed: false,
      role,
      requiredRoleName: 'Administrator atau Dewan Redaksi',
      moduleName: 'Master Data Footer',
      reason: 'Konfigurasi tautan dan struktur footer portal hanya dapat dikelola oleh Administrator.',
    };
  }

  if (path.startsWith('/batutv-control/site-settings') || path.startsWith('/batutv-control/master-data/site-settings')) {
    if (role === 'admin' || role === 'redaksi') {
      return { allowed: true, role, moduleName: 'Master Data Site Settings' };
    }
    return {
      allowed: false,
      role,
      requiredRoleName: 'Administrator',
      moduleName: 'Master Data Site Settings',
      reason: 'Pengaturan identitas portal, SEO meta, dan branding dibatasi khusus untuk Administrator.',
    };
  }

  // 8. User Management (Pengguna)
  if (path.startsWith('/batutv-control/pengguna')) {
    if (role === 'admin') {
      return { allowed: true, role, moduleName: 'Manajemen Pengguna' };
    }
    return {
      allowed: false,
      role,
      requiredRoleName: 'Administrator (Super Admin)',
      moduleName: 'Manajemen Pengguna',
      reason: 'Modul User Management merupakan area sensitif dan hanya dapat diakses oleh Administrator.',
    };
  }

  // 9. Pengaturan Sistem (System Settings)
  if (path.startsWith('/batutv-control/pengaturan')) {
    if (role === 'admin') {
      return { allowed: true, role, moduleName: 'Pengaturan Sistem & Keamanan' };
    }
    return {
      allowed: false,
      role,
      requiredRoleName: 'Administrator (Super Admin)',
      moduleName: 'Pengaturan Sistem',
      reason: 'Konfigurasi keamanan, session policy, dan maintenance mode dibatasi untuk Administrator.',
    };
  }

  // Default fallback
  return { allowed: true, role, moduleName: 'BatuTV Control' };
};

/**
 * Article Publishing Permissions
 */
export const canRolePublish = (roleInput?: string): boolean => {
  const role = normalizeUserRole(roleInput);
  return role === 'admin' || role === 'redaksi' || role === 'editor';
};

/**
 * Permanent Deletion Permissions (Super Admin only)
 */
export const canRolePermanentDelete = (roleInput?: string): boolean => {
  const role = normalizeUserRole(roleInput);
  return role === 'admin';
};

/**
 * Move Published Content to Trash Permissions
 */
export const canRoleTrashPublished = (roleInput?: string): boolean => {
  const role = normalizeUserRole(roleInput);
  return role === 'admin' || role === 'redaksi' || role === 'editor';
};

/**
 * Headline Management Permissions
 */
export const canRoleManageHeadlines = (roleInput?: string): boolean => {
  const role = normalizeUserRole(roleInput);
  return role === 'admin' || role === 'redaksi';
};

/**
 * Video Management Permissions
 */
export const canRoleManageVideos = (roleInput?: string): boolean => {
  const role = normalizeUserRole(roleInput);
  return role === 'admin' || role === 'redaksi' || role === 'editor';
};

/**
 * User & Security Settings Permissions
 */
export const canRoleManageUsers = (roleInput?: string): boolean => {
  const role = normalizeUserRole(roleInput);
  return role === 'admin';
};

export const canRoleManageSystemSettings = (roleInput?: string): boolean => {
  const role = normalizeUserRole(roleInput);
  return role === 'admin';
};

/**
 * Check if the user is author of the given article
 */
export const isUserArticleAuthor = (
  article: AdminArticle | null | undefined,
  user?: AdminUser | { email?: string; name?: string; authorId?: string } | null
): boolean => {
  if (!article || !user) return false;

  // 1. Check authorId match
  if (user.authorId && article.authorId && user.authorId === article.authorId) {
    return true;
  }

  // 2. Check author name match (case-insensitive)
  if (user.name && article.author) {
    const userClean = user.name.toLowerCase().trim();
    const artClean = article.author.toLowerCase().trim();
    if (userClean === artClean || artClean.includes(userClean) || userClean.includes(artClean)) {
      return true;
    }
  }

  // 3. Check author in stored users relation
  const storedUsers = getStoredUsers();
  const matchedUser = storedUsers.find(
    (u) =>
      (user.email && u.email.toLowerCase() === user.email.toLowerCase()) ||
      (user.name && u.fullName.toLowerCase() === user.name.toLowerCase())
  );

  if (matchedUser) {
    if (matchedUser.authorId && article.authorId && matchedUser.authorId === article.authorId) {
      return true;
    }
    if (matchedUser.authorName && article.author) {
      if (matchedUser.authorName.toLowerCase() === article.author.toLowerCase()) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Check if user can edit this specific article
 */
export const checkArticleEditPermission = (
  roleInput: string | undefined,
  article: AdminArticle | null | undefined,
  user?: AdminUser | { email?: string; name?: string; authorId?: string } | null
): { allowed: boolean; isReadOnly: boolean; reason?: string } => {
  const role = normalizeUserRole(roleInput);

  // New article creation is allowed for all roles
  if (!article) {
    return { allowed: true, isReadOnly: false };
  }

  // Admin, Redaksi, and Editor can edit any article
  if (role === 'admin' || role === 'redaksi' || role === 'editor') {
    return { allowed: true, isReadOnly: false };
  }

  // Reporter & Kontributor: Can only edit their own draft/review articles
  const isAuthor = isUserArticleAuthor(article, user);

  if (isAuthor) {
    if (article.status === 'published' && (role === 'reporter' || role === 'kontributor')) {
      return {
        allowed: true,
        isReadOnly: true,
        reason: 'Artikel ini telah dipublikasikan oleh Redaksi. Perubahan naskah terbit harus diajukan melalui Dewan Editor.',
      };
    }
    return { allowed: true, isReadOnly: false };
  }

  // If not the author, Reporter/Kontributor can only view in Read-Only mode
  return {
    allowed: true,
    isReadOnly: true,
    reason: `Naskah ini ditulis oleh ${article.author || 'wartawan lain'}. Sebagai ${ROLE_PERMISSIONS_MATRIX[role]?.name || role}, Anda hanya dapat melihat naskah dalam mode Baca Saja (Read-Only).`,
  };
};

/**
 * Check if user can delete/trash an article
 */
export const canUserDeleteArticle = (
  roleInput: string | undefined,
  article: AdminArticle | null | undefined,
  user?: AdminUser | { email?: string; name?: string; authorId?: string } | null
): boolean => {
  const role = normalizeUserRole(roleInput);
  if (role === 'admin' || role === 'redaksi') return true;
  if (role === 'editor') return true;
  if (role === 'reporter') {
    return isUserArticleAuthor(article, user) && article?.status !== 'published';
  }
  return false;
};

/**
 * Super Admin Protected Account Check
 */
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
