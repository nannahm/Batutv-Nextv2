'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  categorySchema,
  CategoryFormValues,
  tagSchema,
  TagFormValues,
  generateTaxonomySlug,
} from './schemas';
import {
  adminFirestoreCategoryRepository,
  adminFirestoreTagRepository,
} from './data';
import { getAdminAuth } from '@/src/lib/firebaseAdmin';
import { AdminCategory, AdminTag, CategoryStatus, TagStatus } from '@/src/types/admin';
import { TaxonomyActionResult } from './types';

/**
 * Helper: Verifikasi sesi autentikasi server dan role pengguna
 */
async function verifyStaffSession(): Promise<{ uid: string; email: string; role: string } | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;
    if (!sessionCookie) return null;

    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const role = (decodedToken.role as string) || 'reporter';

    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role,
    };
  } catch (err) {
    console.warn('[TaxonomyActions.verifyStaffSession] Session verification error:', err);
    return null;
  }
}

/**
 * Helper: Memastikan pengguna memiliki peran Editor atau Superadmin
 */
function assertTaxonomyPermission(staff: { role: string }): { allowed: boolean; message?: string } {
  if (staff.role !== 'editor' && staff.role !== 'superadmin') {
    return {
      allowed: false,
      message: 'Akses ditolak: Hanya Editor dan Superadmin yang memiliki izin mengelola taksonomi kategori dan tag.',
    };
  }
  return { allowed: true };
}

/* =========================================================================
 * CATEGORY SERVER ACTIONS
 * ========================================================================= */

/**
 * Server Action: Buat Kategori Baru
 */
export async function createCategoryAction(
  values: CategoryFormValues
): Promise<TaxonomyActionResult<AdminCategory>> {
  const staff = await verifyStaffSession();
  if (!staff) {
    return {
      success: false,
      message: 'Sesi login tidak valid atau telah berakhir. Harap login kembali.',
    };
  }

  const permission = assertTaxonomyPermission(staff);
  if (!permission.allowed) {
    return { success: false, message: permission.message! };
  }

  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validasi form kategori gagal. Periksa input yang ditandai.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const cleanSlug = generateTaxonomySlug(data.slug || data.name);

  // Cek duplikasi slug
  const existingWithSlug = await adminFirestoreCategoryRepository.getBySlug(cleanSlug);
  if (existingWithSlug) {
    return {
      success: false,
      message: `Kategori dengan slug "${cleanSlug}" sudah ada. Gunakan slug lain.`,
      errors: { slug: ['Slug sudah digunakan oleh kategori lain.'] },
    };
  }

  const nowIso = new Date().toISOString();
  const docId = data.id || `cat-${Date.now()}`;

  const newCategory: AdminCategory = {
    id: docId,
    name: data.name,
    slug: cleanSlug,
    description: data.description || '',
    parentId: data.parentId || null,
    contentTypes: data.contentTypes,
    status: data.status,
    seoTitle: data.seoTitle || `${data.name} | BatuTV`,
    metaDescription: data.metaDescription || data.description || `Informasi seputar ${data.name}`,
    canonicalUrl: data.canonicalUrl || `/kategori/${cleanSlug}`,
    createdAt: nowIso,
    updatedAt: nowIso,
    newsCount: 0,
    videoCount: 0,
    totalCount: 0,
  };

  try {
    const created = await adminFirestoreCategoryRepository.create(newCategory);

    revalidatePath('/batutv-control/categories');
    revalidatePath('/kategori/[slug]', 'page');
    revalidatePath('/sitemap.xml');
    revalidatePath('/');

    return {
      success: true,
      message: `Kategori "${created.name}" berhasil dibuat.`,
      id: created.id,
      data: created,
    };
  } catch (err: any) {
    console.error('[createCategoryAction] Gagal menyimpan kategori:', err);
    return {
      success: false,
      message: `Gagal menyimpan kategori ke database: ${err?.message || 'Terjadi kesalahan sistem'}`,
    };
  }
}

/**
 * Server Action: Perbarui Kategori
 */
export async function updateCategoryAction(
  id: string,
  values: Partial<CategoryFormValues>
): Promise<TaxonomyActionResult<AdminCategory>> {
  const staff = await verifyStaffSession();
  if (!staff) {
    return {
      success: false,
      message: 'Sesi login tidak valid atau telah berakhir. Harap login kembali.',
    };
  }

  const permission = assertTaxonomyPermission(staff);
  if (!permission.allowed) {
    return { success: false, message: permission.message! };
  }

  try {
    const existing = await adminFirestoreCategoryRepository.getById(id);
    if (!existing) {
      return {
        success: false,
        message: `Kategori dengan ID "${id}" tidak ditemukan.`,
      };
    }

    // Jika slug diubah, pastikan tidak bertabrakan dengan kategori lain
    if (values.slug && values.slug !== existing.slug) {
      const cleanSlug = generateTaxonomySlug(values.slug);
      const duplicate = await adminFirestoreCategoryRepository.getBySlug(cleanSlug);
      if (duplicate && duplicate.id !== id) {
        return {
          success: false,
          message: `Slug "${cleanSlug}" telah digunakan oleh kategori lain.`,
          errors: { slug: ['Slug sudah digunakan oleh kategori lain.'] },
        };
      }
      values.slug = cleanSlug;
    }

    const updated = await adminFirestoreCategoryRepository.update(id, values);

    revalidatePath('/batutv-control/categories');
    revalidatePath(`/kategori/${updated.slug}`, 'page');
    revalidatePath('/sitemap.xml');
    revalidatePath('/');

    return {
      success: true,
      message: `Kategori "${updated.name}" berhasil diperbarui.`,
      id: updated.id,
      data: updated,
    };
  } catch (err: any) {
    console.error(`[updateCategoryAction] Gagal update kategori ${id}:`, err);
    return {
      success: false,
      message: `Gagal memperbarui kategori: ${err?.message || 'Terjadi kesalahan sistem'}`,
    };
  }
}

/**
 * Server Action: Hapus Kategori
 */
export async function deleteCategoryAction(id: string): Promise<TaxonomyActionResult> {
  const staff = await verifyStaffSession();
  if (!staff) {
    return {
      success: false,
      message: 'Sesi login tidak valid atau telah berakhir.',
    };
  }

  const permission = assertTaxonomyPermission(staff);
  if (!permission.allowed) {
    return { success: false, message: permission.message! };
  }

  try {
    const existing = await adminFirestoreCategoryRepository.getById(id);
    if (!existing) {
      return { success: false, message: 'Kategori tidak ditemukan.' };
    }

    await adminFirestoreCategoryRepository.delete(id);

    revalidatePath('/batutv-control/categories');
    revalidatePath('/sitemap.xml');
    revalidatePath('/');

    return {
      success: true,
      message: `Kategori "${existing.name}" berhasil dihapus.`,
      id,
    };
  } catch (err: any) {
    console.error(`[deleteCategoryAction] Gagal menghapus kategori ${id}:`, err);
    return {
      success: false,
      message: `Gagal menghapus kategori: ${err?.message || 'Terjadi kesalahan sistem'}`,
    };
  }
}

/**
 * Server Action: Ubah Status Massal Kategori
 */
export async function bulkUpdateCategoryStatusAction(
  ids: string[],
  status: CategoryStatus
): Promise<TaxonomyActionResult> {
  const staff = await verifyStaffSession();
  if (!staff) {
    return { success: false, message: 'Sesi login tidak valid.' };
  }

  const permission = assertTaxonomyPermission(staff);
  if (!permission.allowed) {
    return { success: false, message: permission.message! };
  }

  try {
    const count = await adminFirestoreCategoryRepository.bulkUpdateStatus(ids, status);
    revalidatePath('/batutv-control/categories');
    revalidatePath('/sitemap.xml');
    revalidatePath('/');

    return {
      success: true,
      message: `Status ${count} kategori berhasil diubah menjadi "${status}".`,
    };
  } catch (err: any) {
    console.error('[bulkUpdateCategoryStatusAction] Gagal update massal:', err);
    return {
      success: false,
      message: `Gagal memperbarui status: ${err?.message || 'Terjadi kesalahan sistem'}`,
    };
  }
}

/* =========================================================================
 * TAG SERVER ACTIONS
 * ========================================================================= */

/**
 * Server Action: Buat Tag Baru
 */
export async function createTagAction(
  values: TagFormValues
): Promise<TaxonomyActionResult<AdminTag>> {
  const staff = await verifyStaffSession();
  if (!staff) {
    return {
      success: false,
      message: 'Sesi login tidak valid atau telah berakhir. Harap login kembali.',
    };
  }

  const permission = assertTaxonomyPermission(staff);
  if (!permission.allowed) {
    return { success: false, message: permission.message! };
  }

  const parsed = tagSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validasi form tag gagal. Periksa input yang ditandai.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const cleanSlug = generateTaxonomySlug(data.slug || data.name);

  // Cek duplikasi slug
  const existingWithSlug = await adminFirestoreTagRepository.getBySlug(cleanSlug);
  if (existingWithSlug) {
    return {
      success: false,
      message: `Tag dengan slug "${cleanSlug}" sudah ada.`,
      errors: { slug: ['Slug tag sudah digunakan.'] },
    };
  }

  const nowIso = new Date().toISOString();
  const docId = data.id || `tag-${Date.now()}`;

  const newTag: AdminTag = {
    id: docId,
    name: data.name,
    slug: cleanSlug,
    contentTypes: data.contentTypes,
    status: data.status,
    seoTitle: data.seoTitle || `${data.name} | Berita Tag BatuTV`,
    metaDescription: data.metaDescription || `Kumpulan berita dan informasi terkait tag #${data.name}`,
    createdAt: nowIso,
    updatedAt: nowIso,
    newsCount: 0,
    videoCount: 0,
    totalCount: 0,
  };

  try {
    const created = await adminFirestoreTagRepository.create(newTag);

    revalidatePath('/batutv-control/tags');
    revalidatePath('/tag/[slug]', 'page');
    revalidatePath('/sitemap.xml');
    revalidatePath('/');

    return {
      success: true,
      message: `Tag #${created.name} berhasil dibuat.`,
      id: created.id,
      data: created,
    };
  } catch (err: any) {
    console.error('[createTagAction] Gagal menyimpan tag:', err);
    return {
      success: false,
      message: `Gagal menyimpan tag ke database: ${err?.message || 'Terjadi kesalahan sistem'}`,
    };
  }
}

/**
 * Server Action: Perbarui Tag
 */
export async function updateTagAction(
  id: string,
  values: Partial<TagFormValues>
): Promise<TaxonomyActionResult<AdminTag>> {
  const staff = await verifyStaffSession();
  if (!staff) {
    return {
      success: false,
      message: 'Sesi login tidak valid atau telah berakhir.',
    };
  }

  const permission = assertTaxonomyPermission(staff);
  if (!permission.allowed) {
    return { success: false, message: permission.message! };
  }

  try {
    const existing = await adminFirestoreTagRepository.getById(id);
    if (!existing) {
      return { success: false, message: `Tag dengan ID "${id}" tidak ditemukan.` };
    }

    if (values.slug && values.slug !== existing.slug) {
      const cleanSlug = generateTaxonomySlug(values.slug);
      const duplicate = await adminFirestoreTagRepository.getBySlug(cleanSlug);
      if (duplicate && duplicate.id !== id) {
        return {
          success: false,
          message: `Slug "${cleanSlug}" telah digunakan oleh tag lain.`,
          errors: { slug: ['Slug tag sudah digunakan.'] },
        };
      }
      values.slug = cleanSlug;
    }

    const updated = await adminFirestoreTagRepository.update(id, values);

    revalidatePath('/batutv-control/tags');
    revalidatePath(`/tag/${updated.slug}`, 'page');
    revalidatePath('/sitemap.xml');
    revalidatePath('/');

    return {
      success: true,
      message: `Tag #${updated.name} berhasil diperbarui.`,
      id: updated.id,
      data: updated,
    };
  } catch (err: any) {
    console.error(`[updateTagAction] Gagal update tag ${id}:`, err);
    return {
      success: false,
      message: `Gagal memperbarui tag: ${err?.message || 'Terjadi kesalahan sistem'}`,
    };
  }
}

/**
 * Server Action: Hapus Tag
 */
export async function deleteTagAction(id: string): Promise<TaxonomyActionResult> {
  const staff = await verifyStaffSession();
  if (!staff) {
    return { success: false, message: 'Sesi login tidak valid.' };
  }

  const permission = assertTaxonomyPermission(staff);
  if (!permission.allowed) {
    return { success: false, message: permission.message! };
  }

  try {
    const existing = await adminFirestoreTagRepository.getById(id);
    if (!existing) {
      return { success: false, message: 'Tag tidak ditemukan.' };
    }

    await adminFirestoreTagRepository.delete(id);

    revalidatePath('/batutv-control/tags');
    revalidatePath('/sitemap.xml');
    revalidatePath('/');

    return {
      success: true,
      message: `Tag #${existing.name} berhasil dihapus.`,
      id,
    };
  } catch (err: any) {
    console.error(`[deleteTagAction] Gagal menghapus tag ${id}:`, err);
    return {
      success: false,
      message: `Gagal menghapus tag: ${err?.message || 'Terjadi kesalahan sistem'}`,
    };
  }
}

/**
 * Server Action: Hapus Massal Tag
 */
export async function bulkDeleteTagsAction(ids: string[]): Promise<TaxonomyActionResult> {
  const staff = await verifyStaffSession();
  if (!staff) {
    return { success: false, message: 'Sesi login tidak valid.' };
  }

  const permission = assertTaxonomyPermission(staff);
  if (!permission.allowed) {
    return { success: false, message: permission.message! };
  }

  try {
    const count = await adminFirestoreTagRepository.bulkDelete(ids);
    revalidatePath('/batutv-control/tags');
    revalidatePath('/sitemap.xml');
    revalidatePath('/');

    return {
      success: true,
      message: `${count} tag berhasil dihapus secara permanen.`,
    };
  } catch (err: any) {
    console.error('[bulkDeleteTagsAction] Gagal hapus massal tag:', err);
    return {
      success: false,
      message: `Gagal menghapus tag: ${err?.message || 'Terjadi kesalahan sistem'}`,
    };
  }
}

/**
 * Server Action: Ubah Status Massal Tag
 */
export async function bulkUpdateTagStatusAction(
  ids: string[],
  status: TagStatus
): Promise<TaxonomyActionResult> {
  const staff = await verifyStaffSession();
  if (!staff) {
    return { success: false, message: 'Sesi login tidak valid.' };
  }

  const permission = assertTaxonomyPermission(staff);
  if (!permission.allowed) {
    return { success: false, message: permission.message! };
  }

  try {
    const count = await adminFirestoreTagRepository.bulkUpdateStatus(ids, status);
    revalidatePath('/batutv-control/tags');
    revalidatePath('/sitemap.xml');
    revalidatePath('/');

    return {
      success: true,
      message: `Status ${count} tag berhasil diubah menjadi "${status}".`,
    };
  } catch (err: any) {
    console.error('[bulkUpdateTagStatusAction] Gagal update massal tag:', err);
    return {
      success: false,
      message: `Gagal memperbarui status: ${err?.message || 'Terjadi kesalahan sistem'}`,
    };
  }
}
