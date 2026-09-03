'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { adminVideoSchema, AdminVideoFormValues, extractYouTubeId } from './schemas';
import { adminFirestoreVideoRepository } from './data/adminFirestoreVideoRepository';
import { getAdminAuth } from '@/src/lib/firebaseAdmin';
import { AdminVideo, VideoStatus } from '@/src/types/admin';

export interface VideoActionResult {
  success: boolean;
  message: string;
  video?: AdminVideo;
  errors?: Record<string, string[]>;
}

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
    console.warn('[verifyStaffSession] Session verification error:', err);
    return null;
  }
}

/**
 * Server Action: Buat Video Baru
 */
export async function createVideoAction(
  values: AdminVideoFormValues
): Promise<VideoActionResult> {
  const staff = await verifyStaffSession();
  if (!staff) {
    return {
      success: false,
      message: 'Sesi login tidak valid atau telah berakhir. Harap login kembali.',
    };
  }

  const parsed = adminVideoSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validasi form video gagal. Periksa input yang ditandai.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  // Reporter hanya boleh membuat video berstatus draft
  let targetStatus: VideoStatus = data.status;
  if (staff.role === 'reporter' && targetStatus !== 'draft') {
    targetStatus = 'draft';
  }

  const nowIso = new Date().toISOString();
  const docId = data.id || `vid-${Date.now()}`;
  const youtubeId = data.youtubeVideoId || extractYouTubeId(data.youtubeUrl) || 'dQw4w9WgXcQ';

  const newVideo: AdminVideo = {
    id: docId,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    description: data.description,
    youtubeUrl: data.youtubeUrl,
    youtubeVideoId: youtubeId,
    thumbnailSource: data.thumbnailSource,
    customThumbnail: data.customThumbnail,
    thumbnailMediaId: data.thumbnailMediaId,
    customThumbnailAlt: data.customThumbnailAlt,
    customThumbnailCaption: data.customThumbnailCaption,
    duration: data.duration,
    category: data.category,
    categorySlug: data.categorySlug,
    author: data.author || staff.email,
    authorId: staff.uid,
    status: targetStatus,
    publishedAt: targetStatus === 'published' ? (data.publishedAt || nowIso) : nowIso,
    scheduledAt: data.scheduledAt || null,
    createdAt: nowIso,
    updatedAt: nowIso,
    seoTitle: data.seoTitle || data.title,
    metaDescription: data.metaDescription || data.excerpt,
    canonicalUrl: data.canonicalUrl || `https://batutv.id/video/${data.slug}`,
    views: 0,
    tags: data.tags,
  };

  try {
    const saved = await adminFirestoreVideoRepository.saveVideo(newVideo);

    revalidatePath('/video');
    revalidatePath('/batutv-control/videos');
    revalidatePath(`/video/${saved.slug}`);

    return {
      success: true,
      message: `Video "${saved.title}" berhasil disimpan (${saved.status}).`,
      video: saved,
    };
  } catch (err: any) {
    console.error('[createVideoAction] Error:', err);
    return {
      success: false,
      message: `Gagal menyimpan video: ${err.message || String(err)}`,
    };
  }
}

/**
 * Server Action: Update Video
 */
export async function updateVideoAction(
  id: string,
  values: Partial<AdminVideoFormValues>
): Promise<VideoActionResult> {
  const staff = await verifyStaffSession();
  if (!staff) {
    return {
      success: false,
      message: 'Sesi login tidak valid. Harap login kembali.',
    };
  }

  try {
    const existing = await adminFirestoreVideoRepository.getVideoById(id);
    if (!existing) {
      return {
        success: false,
        message: `Video dengan ID ${id} tidak ditemukan.`,
      };
    }

    // Role check: Reporter hanya bisa edit video miliknya sendiri
    if (staff.role === 'reporter' && existing.authorId && existing.authorId !== staff.uid) {
      return {
        success: false,
        message: 'Akses ditolak: Reporter hanya dapat mengedit video buatannya sendiri.',
      };
    }

    // Ekstrak youtube id jika url berubah
    const youtubeVideoId = values.youtubeUrl
      ? extractYouTubeId(values.youtubeUrl) || existing.youtubeVideoId
      : existing.youtubeVideoId;

    const mergedData: AdminVideo = {
      ...existing,
      ...values,
      youtubeVideoId: youtubeVideoId || existing.youtubeVideoId,
      updatedAt: new Date().toISOString(),
    };

    const updated = await adminFirestoreVideoRepository.saveVideo(mergedData);

    revalidatePath('/video');
    revalidatePath('/batutv-control/videos');
    revalidatePath(`/video/${updated.slug}`);
    if (existing.slug !== updated.slug) {
      revalidatePath(`/video/${existing.slug}`);
    }

    return {
      success: true,
      message: `Video "${updated.title}" berhasil diperbarui.`,
      video: updated,
    };
  } catch (err: any) {
    console.error('[updateVideoAction] Error:', err);
    return {
      success: false,
      message: `Gagal memperbarui video: ${err.message || String(err)}`,
    };
  }
}

/**
 * Server Action: Hapus Video
 */
export async function deleteVideoAction(id: string): Promise<VideoActionResult> {
  const staff = await verifyStaffSession();
  if (!staff) {
    return {
      success: false,
      message: 'Sesi login tidak valid. Harap login kembali.',
    };
  }

  // Hanya Superadmin dan Editor yang boleh menghapus video
  if (staff.role !== 'superadmin' && staff.role !== 'editor') {
    return {
      success: false,
      message: 'Akses ditolak: Hanya Editor atau Superadmin yang berwenang menghapus video.',
    };
  }

  try {
    const existing = await adminFirestoreVideoRepository.getVideoById(id);
    await adminFirestoreVideoRepository.deleteVideo(id);

    revalidatePath('/video');
    revalidatePath('/batutv-control/videos');
    if (existing) {
      revalidatePath(`/video/${existing.slug}`);
    }

    return {
      success: true,
      message: `Video ${id} berhasil dihapus.`,
    };
  } catch (err: any) {
    console.error('[deleteVideoAction] Error:', err);
    return {
      success: false,
      message: `Gagal menghapus video: ${err.message || String(err)}`,
    };
  }
}

/**
 * Server Action: Publikasikan Video Langsung
 */
export async function publishVideoAction(id: string): Promise<VideoActionResult> {
  const staff = await verifyStaffSession();
  if (!staff) {
    return {
      success: false,
      message: 'Sesi login tidak valid. Harap login kembali.',
    };
  }

  if (staff.role !== 'superadmin' && staff.role !== 'editor') {
    return {
      success: false,
      message: 'Akses ditolak: Hanya Editor atau Superadmin yang berwenang menerbitkan video.',
    };
  }

  try {
    const existing = await adminFirestoreVideoRepository.getVideoById(id);
    if (!existing) {
      return { success: false, message: `Video ${id} tidak ditemukan.` };
    }

    const updated = await adminFirestoreVideoRepository.saveVideo({
      ...existing,
      status: 'published',
      publishedAt: existing.publishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    revalidatePath('/video');
    revalidatePath('/batutv-control/videos');
    revalidatePath(`/video/${updated.slug}`);

    return {
      success: true,
      message: `Video "${updated.title}" berhasil dipublikasikan.`,
      video: updated,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menerbitkan video: ${err.message || String(err)}`,
    };
  }
}
