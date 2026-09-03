import { AdminVideo, VideoStatus } from '@/src/types/admin';
import { IVideoRepository, VideoQueryOptions } from '@/src/repositories/IVideoRepository';
import { getAdminFirestore } from '@/src/lib/firebaseAdmin';
import { initialAdminVideos } from '@/src/data/videoAdminDummyData';
import { extractYouTubeVideoId, generateVideoSlug } from '@/src/utils/youtube';

const COLLECTION_NAME = 'videos';

function convertDateToString(val: any, fallback: string = new Date().toISOString()): string {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val?.toDate === 'function') {
    return val.toDate().toISOString();
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  return fallback;
}

export function toVideoFirestoreDocument(video: AdminVideo): Record<string, any> {
  const youtubeVideoId =
    video.youtubeVideoId || extractYouTubeVideoId(video.youtubeUrl) || 'dQw4w9WgXcQ';
  const cleanSlug = video.slug ? generateVideoSlug(video.slug) : generateVideoSlug(video.title);

  const cleanDoc: Record<string, any> = {
    id: video.id,
    title: video.title || '',
    slug: cleanSlug || `video-${video.id}`,
    excerpt: video.excerpt || '',
    description: video.description || '',
    youtubeUrl: video.youtubeUrl || '',
    youtubeVideoId,
    thumbnailSource: video.thumbnailSource || 'youtube',
    customThumbnail: video.customThumbnail || null,
    thumbnailMediaId: video.thumbnailMediaId || null,
    customThumbnailAlt: video.customThumbnailAlt || null,
    customThumbnailCaption: video.customThumbnailCaption || null,
    duration: video.duration || '00:00',
    category: video.category || 'Berita',
    categorySlug: video.categorySlug || 'berita',
    author: video.author || 'Redaksi BatuTV',
    authorId: video.authorId || null,
    status: video.status || 'draft',
    publishedAt: convertDateToString(video.publishedAt),
    scheduledAt: video.scheduledAt ? convertDateToString(video.scheduledAt) : null,
    createdAt: convertDateToString(video.createdAt),
    updatedAt: convertDateToString(video.updatedAt),
    seoTitle: video.seoTitle || video.title || '',
    metaDescription: video.metaDescription || video.excerpt || '',
    canonicalUrl: video.canonicalUrl || `https://batutv.id/video/${cleanSlug}`,
    views: typeof video.views === 'number' ? video.views : 0,
    tags: Array.isArray(video.tags) ? video.tags : [],
  };

  return cleanDoc;
}

export function fromVideoFirestoreDocument(id: string, data: Record<string, any>): AdminVideo {
  const title = data.title || 'Untitled Video';
  const slug = data.slug || `video-${id}`;
  const nowIso = new Date().toISOString();

  return {
    id,
    title,
    slug,
    excerpt: data.excerpt || data.description || '',
    description: data.description || '',
    youtubeUrl: data.youtubeUrl || '',
    youtubeVideoId: data.youtubeVideoId || extractYouTubeVideoId(data.youtubeUrl || '') || '',
    thumbnailSource: data.thumbnailSource || 'youtube',
    customThumbnail: data.customThumbnail || undefined,
    thumbnailMediaId: data.thumbnailMediaId || undefined,
    customThumbnailAlt: data.customThumbnailAlt || undefined,
    customThumbnailCaption: data.customThumbnailCaption || undefined,
    duration: data.duration || '00:00',
    category: data.category || 'Berita',
    categorySlug: data.categorySlug || 'berita',
    author: data.author || 'Redaksi BatuTV',
    authorId: data.authorId || undefined,
    status: (data.status as VideoStatus) || 'draft',
    publishedAt: convertDateToString(data.publishedAt, nowIso),
    scheduledAt: data.scheduledAt ? convertDateToString(data.scheduledAt) : null,
    createdAt: convertDateToString(data.createdAt, nowIso),
    updatedAt: convertDateToString(data.updatedAt, nowIso),
    seoTitle: data.seoTitle || title,
    metaDescription: data.metaDescription || data.excerpt || '',
    canonicalUrl: data.canonicalUrl || `https://batutv.id/video/${slug}`,
    views: typeof data.views === 'number' ? data.views : 0,
    tags: Array.isArray(data.tags) ? data.tags : [],
  };
}

export class AdminFirestoreVideoRepository implements IVideoRepository {
  async getVideos(options: VideoQueryOptions = {}): Promise<AdminVideo[]> {
    try {
      const adminDb = getAdminFirestore();
      let queryRef: FirebaseFirestore.Query = adminDb.collection(COLLECTION_NAME);

      if (options.status) {
        queryRef = queryRef.where('status', '==', options.status);
      }
      if (options.categorySlug) {
        queryRef = queryRef.where('categorySlug', '==', options.categorySlug);
      }
      if (options.authorId) {
        queryRef = queryRef.where('authorId', '==', options.authorId);
      }
      if (options.limit && options.limit > 0) {
        queryRef = queryRef.limit(options.limit);
      }

      const snap = await queryRef.get();
      if (!snap.empty) {
        const list: AdminVideo[] = [];
        snap.forEach((docSnap) => {
          list.push(fromVideoFirestoreDocument(docSnap.id, docSnap.data()));
        });
        return list;
      }
    } catch (err: any) {
      console.warn(`[AdminFirestoreVideoRepository] Failed to query videos (${err.message}). Using fallback seed.`);
    }

    // 2-Tier Architecture: Static Seed Fallback
    let fallback = [...initialAdminVideos];
    if (options.status) {
      fallback = fallback.filter((v) => v.status === options.status);
    }
    if (options.categorySlug) {
      fallback = fallback.filter((v) => v.categorySlug === options.categorySlug);
    }
    if (options.authorId) {
      fallback = fallback.filter((v) => v.authorId === options.authorId);
    }
    if (options.limit && options.limit > 0) {
      fallback = fallback.slice(0, options.limit);
    }
    return fallback;
  }

  async getVideoById(id: string): Promise<AdminVideo | null> {
    try {
      const adminDb = getAdminFirestore();
      const snap = await adminDb.collection(COLLECTION_NAME).doc(id).get();
      if (snap.exists) {
        return fromVideoFirestoreDocument(snap.id, snap.data()!);
      }
    } catch (err: any) {
      console.warn(`[AdminFirestoreVideoRepository] getVideoById error (${err.message}).`);
    }

    const fallback = initialAdminVideos.find((v) => v.id === id);
    return fallback || null;
  }

  async getVideoBySlug(slug: string): Promise<AdminVideo | null> {
    try {
      const adminDb = getAdminFirestore();
      const snap = await adminDb
        .collection(COLLECTION_NAME)
        .where('slug', '==', slug)
        .limit(1)
        .get();

      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return fromVideoFirestoreDocument(docSnap.id, docSnap.data());
      }
    } catch (err: any) {
      console.warn(`[AdminFirestoreVideoRepository] getVideoBySlug error (${err.message}).`);
    }

    const fallback = initialAdminVideos.find((v) => v.slug === slug || v.id === slug);
    return fallback || null;
  }

  async saveVideo(video: AdminVideo): Promise<AdminVideo> {
    const docId = video.id || `vid-${Date.now()}`;
    const payload = toVideoFirestoreDocument({ ...video, id: docId });
    const adminDb = getAdminFirestore();
    await adminDb.collection(COLLECTION_NAME).doc(docId).set(payload, { merge: true });
    return { ...video, id: docId };
  }

  async updateVideo(id: string, updates: Partial<AdminVideo>): Promise<AdminVideo> {
    const existing = await this.getVideoById(id);
    if (!existing) {
      throw new Error(`Video with id ${id} not found`);
    }
    const merged: AdminVideo = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.saveVideo(merged);
  }

  async deleteVideo(id: string): Promise<void> {
    const adminDb = getAdminFirestore();
    await adminDb.collection(COLLECTION_NAME).doc(id).delete();
  }

  async bulkUpdateStatus(ids: string[], status: VideoStatus): Promise<void> {
    if (ids.length === 0) return;
    const adminDb = getAdminFirestore();
    const batch = adminDb.batch();
    const nowIso = new Date().toISOString();

    for (const id of ids) {
      const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
      batch.update(docRef, {
        status,
        updatedAt: nowIso,
      });
    }
    await batch.commit();
  }

  async bulkDelete(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const adminDb = getAdminFirestore();
    const batch = adminDb.batch();

    for (const id of ids) {
      const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
      batch.delete(docRef);
    }
    await batch.commit();
  }

  subscribe(
    _onNext: (videos: AdminVideo[]) => void,
    _onError?: (error: Error) => void,
    _options?: VideoQueryOptions
  ): () => void {
    // Server-side Admin SDK does not subscribe; return unsubscribe noop
    return () => {};
  }
}

export const adminFirestoreVideoRepository = new AdminFirestoreVideoRepository();
