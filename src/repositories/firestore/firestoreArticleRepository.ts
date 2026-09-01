import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AdminArticle, ArticleStatus } from '../../types/admin';
import { IArticleRepository, ArticleQueryOptions } from '../IArticleRepository';
import { sanitizeForFirestore } from './converterUtils';
import { initialAdminArticles } from '../../data/newsAdminDummyData';

const COLLECTION_NAME = 'articles';

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

export function toArticleFirestoreDocument(article: AdminArticle): Record<string, any> {
  return sanitizeForFirestore({
    id: article.id,
    title: article.title || '',
    slug: article.slug || '',
    excerpt: article.excerpt || '',
    content: article.content || '',
    category: article.category || 'Berita',
    categorySlug: article.categorySlug || 'berita',
    author: article.author || 'Redaksi BatuTV',
    authorId: article.authorId || null,
    editor: article.editor || 'Redaksi BatuTV',
    featuredImage: article.featuredImage || '',
    imageCaption: article.imageCaption || '',
    imageAlt: article.imageAlt || article.title || '',
    status: article.status || 'draft',
    publishedAt: convertDateToString(article.publishedAt),
    updatedAt: convertDateToString(article.updatedAt),
    createdAt: convertDateToString(article.createdAt),
    seoTitle: article.seoTitle || article.title || '',
    metaDescription: article.metaDescription || article.excerpt || '',
    canonicalUrl: article.canonicalUrl || `https://batutv.id/berita/${article.slug}`,
    views: typeof article.views === 'number' ? article.views : 0,
    tags: Array.isArray(article.tags) ? article.tags : [],
    isHeadline: Boolean(article.isHeadline),
    headlinePosition: article.headlinePosition ?? null,
    headlineUntil: article.headlineUntil ?? null,
  });
}

export function fromArticleFirestoreDocument(id: string, data: Record<string, any>): AdminArticle {
  const title = data.title || 'Untitled Article';
  const slug = data.slug || `artikel-${id}`;
  const excerpt = data.excerpt || data.description || '';
  const nowIso = new Date().toISOString();

  return {
    id,
    title,
    slug,
    excerpt,
    content: data.content || '',
    category: data.category || 'Berita',
    categorySlug: data.categorySlug || 'berita',
    author: data.author || data.authorName || 'Redaksi BatuTV',
    authorId: data.authorId || undefined,
    editor: data.editor || 'Redaksi BatuTV',
    featuredImage: data.featuredImage || data.image || data.imageUrl || '',
    imageCaption: data.imageCaption || '',
    imageAlt: data.imageAlt || title,
    status: (data.status as ArticleStatus) || 'draft',
    publishedAt: convertDateToString(data.publishedAt, nowIso),
    updatedAt: convertDateToString(data.updatedAt, nowIso),
    createdAt: convertDateToString(data.createdAt, nowIso),
    seoTitle: data.seoTitle || title,
    metaDescription: data.metaDescription || excerpt,
    canonicalUrl: data.canonicalUrl || `https://batutv.id/berita/${slug}`,
    views: typeof data.views === 'number' ? data.views : 0,
    tags: Array.isArray(data.tags) ? data.tags : [],
    isHeadline: Boolean(data.isHeadline),
    headlinePosition: typeof data.headlinePosition === 'number' ? data.headlinePosition : null,
    headlineUntil: data.headlineUntil || null,
  };
}

export class FirestoreArticleRepository implements IArticleRepository {
  async getArticles(options: ArticleQueryOptions = {}): Promise<AdminArticle[]> {
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
        const articles: AdminArticle[] = [];
        snap.forEach((docSnap) => {
          articles.push(fromArticleFirestoreDocument(docSnap.id, docSnap.data()));
        });

        // In-memory filter & sort for high precision
        let result = articles;
        if (options.categorySlug) {
          result = result.filter(
            (a) => a.categorySlug?.toLowerCase() === options.categorySlug?.toLowerCase()
          );
        }
        if (options.tag) {
          result = result.filter((a) =>
            a.tags?.some((t) => t.toLowerCase() === options.tag?.toLowerCase())
          );
        }
        if (options.authorId) {
          result = result.filter((a) => a.authorId === options.authorId);
        }
        if (options.isHeadline !== undefined) {
          result = result.filter((a) => Boolean(a.isHeadline) === options.isHeadline);
        }

        return result;
      }
    } catch (err) {
      console.warn('[FirestoreArticleRepository] getArticles error, falling back to seed cache:', err);
    }
    return initialAdminArticles;
  }

  async getArticleById(id: string): Promise<AdminArticle | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return fromArticleFirestoreDocument(snap.id, snap.data());
      }
    } catch (err) {
      console.warn(`[FirestoreArticleRepository] getArticleById(${id}) error:`, err);
    }
    const fallback = initialAdminArticles.find((a) => a.id === id);
    return fallback || null;
  }

  async getArticleBySlug(slug: string): Promise<AdminArticle | null> {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const q = query(colRef, where('slug', '==', slug), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return fromArticleFirestoreDocument(docSnap.id, docSnap.data());
      }
    } catch (err) {
      console.warn(`[FirestoreArticleRepository] getArticleBySlug(${slug}) error:`, err);
    }
    const fallback = initialAdminArticles.find((a) => a.slug === slug);
    return fallback || null;
  }

  async saveArticle(article: AdminArticle): Promise<AdminArticle> {
    const docId = article.id || `art-${Date.now()}`;
    const payload = toArticleFirestoreDocument({ ...article, id: docId });
    const docRef = doc(db, COLLECTION_NAME, docId);
    await setDoc(docRef, payload, { merge: true });
    return { ...article, id: docId };
  }

  async updateArticle(id: string, updates: Partial<AdminArticle>): Promise<AdminArticle> {
    const existing = await this.getArticleById(id);
    if (!existing) {
      throw new Error(`Article with id ${id} not found`);
    }
    const merged: AdminArticle = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.saveArticle(merged);
  }

  async deleteArticle(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  async bulkUpdateStatus(ids: string[], status: ArticleStatus): Promise<void> {
    if (ids.length === 0) return;
    const batch = writeBatch(db);
    const nowIso = new Date().toISOString();
    for (const id of ids) {
      const docRef = doc(db, COLLECTION_NAME, id);
      batch.update(docRef, {
        status,
        updatedAt: nowIso,
        ...(status !== 'published' ? { isHeadline: false, headlinePosition: null } : {}),
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
    onNext: (articles: AdminArticle[]) => void,
    onError?: (error: Error) => void,
    options: ArticleQueryOptions = {}
  ): () => void {
    const colRef = collection(db, COLLECTION_NAME);
    let q = query(colRef);

    if (options.status) {
      q = query(colRef, where('status', '==', options.status));
    }

    return onSnapshot(
      q,
      (snap) => {
        const list: AdminArticle[] = [];
        snap.forEach((docSnap) => {
          list.push(fromArticleFirestoreDocument(docSnap.id, docSnap.data()));
        });
        onNext(list);
      },
      (err) => {
        console.warn('[FirestoreArticleRepository] subscription error:', err);
        if (onError) onError(err);
      }
    );
  }
}

export const firestoreArticleRepository = new FirestoreArticleRepository();
