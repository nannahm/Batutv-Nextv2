import { categorySchema, CategoryFormValues } from './schemas';
import { CategoryActionResult, CategoryItem } from './types';
import { getStoredCategories, saveCategories } from '@/src/data/categoryAdminStore';
import { firestoreCategoryRepository } from '@/src/repositories/firestore/firestoreCategoryRepository';
import { logSystemActivity } from '@/src/data/systemSettingsStore';
import { getStoredAdminSession } from '@/src/utils/authSession';
import { AdminCategory } from '@/src/types/admin';

export async function createCategoryAction(values: CategoryFormValues): Promise<CategoryActionResult> {
  const parsed = categorySchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Validasi form kategori gagal.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const valid = parsed.data;
  const admin = getStoredAdminSession();
  const nowIso = new Date().toISOString();

  const newAdminCat: AdminCategory = {
    id: `cat_${Date.now()}`,
    name: valid.name,
    slug: valid.slug,
    description: valid.description || '',
    parentId: null,
    contentTypes: ['news', 'video'],
    status: 'active',
    seoTitle: `${valid.name} | BatuTV`,
    metaDescription: valid.description || `Kategori berita ${valid.name}`,
    canonicalUrl: `/kategori/${valid.slug}`,
    createdAt: nowIso,
    updatedAt: nowIso,
    newsCount: 0,
    videoCount: 0,
    totalCount: 0,
  };

  try {
    const current = getStoredCategories();
    saveCategories([...current, newAdminCat]);

    try {
      await firestoreCategoryRepository.create(newAdminCat);
    } catch (e) {
      console.warn('Firestore write category fallback:', e);
    }

    if (admin) {
      logSystemActivity(admin, 'Tambah Kategori', `Menambahkan kategori "${valid.name}"`, 'success', 'Kategori');
    }

    const catItem: CategoryItem = {
      id: newAdminCat.id,
      name: newAdminCat.name,
      slug: newAdminCat.slug,
      description: newAdminCat.description,
      color: valid.color || '#dc2626',
      articleCount: 0,
    };

    return {
      success: true,
      message: 'Kategori berhasil ditambahkan!',
      categoryId: newAdminCat.id,
      data: catItem,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal';
    return { success: false, message: msg };
  }
}
