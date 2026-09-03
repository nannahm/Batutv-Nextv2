import { videoItemSchema, VideoItemFormValues } from './schemas';
import { VideoActionResult } from './types';
import { AdminVideo, VideoStatus } from '@/src/types/admin';
import { firestoreVideoRepository } from '@/src/repositories/firestore/firestoreVideoRepository';
import { getStoredVideos, saveVideos } from '@/src/data/videoAdminStore';
import { logSystemActivity } from '@/src/data/systemSettingsStore';
import { getStoredAdminSession } from '@/src/utils/authSession';
import { extractYouTubeVideoId } from '@/src/utils/youtube';

export async function createVideoAction(
  values: VideoItemFormValues
): Promise<VideoActionResult> {
  const parsed = videoItemSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Validasi form video gagal. Silakan periksa input Anda.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const validData = parsed.data;
  const adminUser = getStoredAdminSession();
  const ytId = extractYouTubeVideoId(validData.youtubeUrl) || 'batutv_video';
  const nowIso = new Date().toISOString();
  const newId = `vid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  const newVideo: AdminVideo = {
    id: newId,
    title: validData.title,
    slug: validData.slug,
    excerpt: validData.description.slice(0, 150),
    description: validData.description,
    youtubeUrl: validData.youtubeUrl,
    youtubeVideoId: ytId,
    thumbnailSource: 'custom',
    customThumbnail: validData.thumbnailUrl,
    duration: validData.duration,
    category: validData.category,
    categorySlug: validData.categorySlug,
    author: validData.presenter,
    authorId: 'author_batutv',
    status: validData.status as VideoStatus,
    tags: validData.tags,
    createdAt: nowIso,
    updatedAt: nowIso,
    publishedAt: validData.status === 'published' ? nowIso : '',
    seoTitle: validData.title,
    metaDescription: validData.description.slice(0, 150),
    canonicalUrl: '',
    views: 0,
  };

  try {
    const current = getStoredVideos();
    saveVideos([newVideo, ...current]);

    try {
      await firestoreVideoRepository.saveVideo(newVideo);
    } catch (err) {
      console.warn('Firestore write video fallback:', err);
    }

    if (adminUser) {
      logSystemActivity(
        adminUser,
        'Upload Video',
        `Menambahkan video berita baru: "${validData.title}"`,
        'success',
        'Video'
      );
    }

    return {
      success: true,
      message: 'Video berita BatuTV berhasil dipublikasikan!',
      videoId: newVideo.id,
      data: newVideo,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Kegagalan server';
    return {
      success: false,
      message: `Gagal menyimpan video: ${errorMsg}`,
    };
  }
}

export async function deleteVideoAction(id: string): Promise<VideoActionResult> {
  const adminUser = getStoredAdminSession();

  try {
    const current = getStoredVideos();
    const filtered = current.filter((v) => v.id !== id);
    saveVideos(filtered);

    try {
      await firestoreVideoRepository.deleteVideo(id);
    } catch (e) {
      console.warn('Firestore delete video:', e);
    }

    if (adminUser) {
      logSystemActivity(
        adminUser,
        'Hapus Video',
        `Menghapus video ID: ${id}`,
        'warning',
        'Video'
      );
    }

    return {
      success: true,
      message: 'Video berhasil dihapus.',
      videoId: id,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Gagal';
    return {
      success: false,
      message: errorMsg,
    };
  }
}
