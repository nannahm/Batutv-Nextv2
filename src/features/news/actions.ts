import { newsArticleSchema, NewsArticleFormValues } from './schemas';
import { NewsActionResult } from './types';
import { AdminArticle, ArticleStatus } from '@/src/types/admin';
import { firestoreArticleRepository } from '@/src/repositories/firestore/firestoreArticleRepository';
import { getStoredArticles, saveStoredArticles } from '@/src/data/newsAdminStore';
import { logSystemActivity } from '@/src/data/systemSettingsStore';
import { getStoredAdminSession } from '@/src/utils/authSession';

/**
 * Server Action: Buat Artikel Berita Baru dengan validasi Zod
 */
export async function createArticleAction(
  values: NewsArticleFormValues
): Promise<NewsActionResult> {
  const parsed = newsArticleSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Validasi form berita gagal. Harap periksa kolom yang ditandai.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const validData = parsed.data;
  const adminUser = getStoredAdminSession();
  const nowIso = new Date().toISOString();
  const newId = `art_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  const newArticle: AdminArticle = {
    id: newId,
    title: validData.title,
    slug: validData.slug,
    excerpt: validData.excerpt,
    content: validData.content,
    category: validData.category,
    categorySlug: validData.categorySlug,
    author: validData.author,
    authorId: validData.authorId || 'author_redaksi',
    editor: validData.editor,
    featuredImage: validData.featuredImage,
    imageCaption: validData.imageCaption || '',
    imageAlt: validData.imageAlt || '',
    status: validData.status as ArticleStatus,
    tags: validData.tags,
    isHeadline: validData.isHeadline,
    headlinePosition: validData.headlinePosition || null,
    seoTitle: validData.seoTitle || validData.title,
    metaDescription: validData.metaDescription || validData.excerpt,
    canonicalUrl: validData.canonicalUrl || '',
    views: 0,
    createdAt: nowIso,
    updatedAt: nowIso,
    publishedAt: validData.status === 'published' ? nowIso : null,
  };

  try {
    // 1. Simpan ke local cache store
    const current = getStoredArticles();
    saveStoredArticles([newArticle, ...current], true);

    // 2. Persist via repository ke Firestore
    try {
      await firestoreArticleRepository.saveArticle(newArticle);
    } catch (firestoreErr) {
      console.warn('Firestore direct write notice:', firestoreErr);
    }

    if (adminUser) {
      logSystemActivity(
        adminUser,
        'Buat Artikel',
        `Membuat artikel baru: "${validData.title}" [${validData.status}]`,
        'success',
        'Berita'
      );
    }

    return {
      success: true,
      message: 'Artikel berita berhasil disimpan dan dipublikasikan!',
      articleId: newArticle.id,
      data: newArticle,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Terjadi kegagalan server';
    return {
      success: false,
      message: `Gagal menyimpan berita: ${errorMsg}`,
    };
  }
}

/**
 * Server Action: Update Artikel Berita
 */
export async function updateArticleAction(
  id: string,
  values: Partial<NewsArticleFormValues>
): Promise<NewsActionResult> {
  const adminUser = getStoredAdminSession();

  try {
    const current = getStoredArticles();
    const existingIndex = current.findIndex((a) => a.id === id);
    if (existingIndex === -1) {
      return {
        success: false,
        message: 'Artikel tidak ditemukan dalam database.',
      };
    }

    const updated: AdminArticle = {
      ...current[existingIndex],
      ...values,
      status: (values.status as ArticleStatus) || current[existingIndex].status,
      updatedAt: new Date().toISOString(),
    };

    current[existingIndex] = updated;
    saveStoredArticles([...current], true);

    // Persist ke Firestore
    try {
      await firestoreArticleRepository.updateArticle(id, updated);
    } catch (firestoreErr) {
      console.warn('Firestore update warning:', firestoreErr);
    }

    if (adminUser) {
      logSystemActivity(
        adminUser,
        'Update Artikel',
        `Memperbarui artikel: "${updated.title}"`,
        'info',
        'Berita'
      );
    }

    return {
      success: true,
      message: 'Artikel berhasil diperbarui!',
      articleId: id,
      data: updated,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Terjadi kegagalan saat update';
    return {
      success: false,
      message: `Gagal memperbarui artikel: ${errorMsg}`,
    };
  }
}

/**
 * Server Action: Hapus / Trash Artikel
 */
export async function deleteArticleAction(
  id: string,
  permanent = false
): Promise<NewsActionResult> {
  const adminUser = getStoredAdminSession();

  try {
    const current = getStoredArticles();
    let updatedList: AdminArticle[];

    if (permanent) {
      updatedList = current.filter((a) => a.id !== id);
      try {
        await firestoreArticleRepository.deleteArticle(id);
      } catch (e) {
        console.warn('Firestore delete article:', e);
      }
    } else {
      updatedList = current.map((a) => (a.id === id ? { ...a, status: 'trash' as ArticleStatus } : a));
      try {
        await firestoreArticleRepository.updateArticle(id, { status: 'trash' as ArticleStatus });
      } catch (e) {
        console.warn('Firestore trash article:', e);
      }
    }

    saveStoredArticles(updatedList, true);

    if (adminUser) {
      logSystemActivity(
        adminUser,
        'Hapus Artikel',
        `Menghapus artikel ID: ${id} (${permanent ? 'Permanen' : 'Pindah ke Sampah'})`,
        'warning',
        'Berita'
      );
    }

    return {
      success: true,
      message: permanent ? 'Artikel telah dihapus permanen.' : 'Artikel dipindahkan ke sampah.',
      articleId: id,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Gagal menghapus';
    return {
      success: false,
      message: errorMsg,
    };
  }
}
