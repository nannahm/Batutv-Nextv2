import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  limit,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AdminVideo, VideoStatus } from '../../types/admin';
import { IVideoRepository, VideoQueryOptions } from '../IVideoRepository';
import { sanitizeForFirestore } from './converterUtils';
import { initialAdminVideos } from '../../data/videoAdminDummyData';
import { extractYouTubeVideoId, generateVideoSlug } from '../../utils/youtube';

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

  return sanitizeForFirestore({
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
  });
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

export class FirestoreVideoRepository implements IVideoRepository {
  async getVideos(options: VideoQueryOptions = {}): Promise<AdminVideo[]> {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      let q = query(colRef);

      if (options.status) {
        q = query(colRef, where('status', '==', options.status));
      }
      if (options.limit && options.limit > 0) {
        q = query(q, limit(options.limit));
      }

      const snap = await getDocs(q);
      if (!snap.empty) {
        const videos: AdminVideo[] = [];
        snap.forEach((docSnap) => {
          videos.push(fromVideoFirestoreDocument(docSnap.id, docSnap.data()));
        });

        let result = videos;
        if (options.categorySlug) {
          result = result.filter(
            (v) => v.categorySlug?.toLowerCase() === options.categorySlug?.toLowerCase()
          );
        }
        if (options.authorId) {
          result = result.filter((v) => v.authorId === options.authorId);
        }

        return result;
      }
    } catch (err) {
      console.warn('[FirestoreVideoRepository] getVideos error, falling back to seed data:', err);
    }
    return initialAdminVideos;
  }

  async getVideoById(id: string): Promise<AdminVideo | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return fromVideoFirestoreDocument(snap.id, snap.data());
      }
    } catch (err) {
      console.warn(`[FirestoreVideoRepository] getVideoById(${id}) error:`, err);
    }
    const fallback = initialAdminVideos.find((v) => v.id === id);
    return fallback || null;
  }

  async getVideoBySlug(slug: string): Promise<AdminVideo | null> {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const q = query(colRef, where('slug', '==', slug), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return fromVideoFirestoreDocument(docSnap.id, docSnap.data());
      }
    } catch (err) {
      console.warn(`[FirestoreVideoRepository] getVideoBySlug(${slug}) error:`, err);
    }
    const fallback = initialAdminVideos.find((v) => v.slug === slug || v.id === slug);
    return fallback || null;
  }

  async saveVideo(video: AdminVideo): Promise<AdminVideo> {
    const docId = video.id || `vid-${Date.now()}`;
    const payload = toVideoFirestoreDocument({ ...video, id: docId });
    const docRef = doc(db, COLLECTION_NAME, docId);
    await setDoc(docRef, payload, { merge: true });
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
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  async bulkUpdateStatus(ids: string[], status: VideoStatus): Promise<void> {
    if (ids.length === 0) return;
    const batch = writeBatch(db);
    const nowIso = new Date().toISOString();
    for (const id of ids) {
      const docRef = doc(db, COLLECTION_NAME, id);
      batch.update(docRef, {
        status,
        updatedAt: nowIso,
      });
    }
    await batch.commit();
  }

  async bulkDelete(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const batch = writeBatch(db);
    for (const id of ids) {
      const docRef = doc(db, COLLECTION_NAME, id);
      batch.delete(docRef);
    }
    await batch.commit();
  }

  subscribe(
    onNext: (videos: AdminVideo[]) => void,
    onError?: (error: Error) => void,
    options: VideoQueryOptions = {}
  ): () => void {
    const colRef = collection(db, COLLECTION_NAME);
    let q = query(colRef);

    if (options.status) {
      q = query(colRef, where('status', '==', options.status));
    }

    return onSnapshot(
      q,
      (snap) => {
        const list: AdminVideo[] = [];
        snap.forEach((docSnap) => {
          list.push(fromVideoFirestoreDocument(docSnap.id, docSnap.data()));
        });
        onNext(list);
      },
      (err) => {
        console.warn('[FirestoreVideoRepository] subscription error:', err);
        if (onError) onError(err);
      }
    );
  }
}

export const firestoreVideoRepository = new FirestoreVideoRepository();
