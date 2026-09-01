import { collection, doc, writeBatch, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { initialAdminCategories } from '../data/categoryAdminDummyData';
import { initialAdminTags } from '../data/tagAdminDummyData';
import { initialAdminAuthors } from '../data/authorAdminDummyData';
import { initialAdminMedia } from '../data/mediaAdminDummyData';
import { initialAdminPagesData } from '../data/pagesAdminDummyData';
import { INITIAL_NAVIGATION_DATA, INITIAL_SUB_NAVIGATION_DATA, INITIAL_SUB_NAV_SETTINGS } from '../data/navigationStore';
import { INITIAL_FOOTER_CONFIG } from '../data/footerAdminStore';
import { INITIAL_SITE_SETTINGS } from '../data/siteSettingsStore';
import { DEFAULT_SYSTEM_INFO, DEFAULT_MAINTENANCE_CONFIG, DEFAULT_SECURITY_CONFIG } from '../data/systemSettingsStore';
import { INITIAL_CMS_USERS } from '../data/userAdminStore';
import { initialAdminArticles } from '../data/newsAdminDummyData';
import { initialAdminVideos } from '../data/videoAdminDummyData';

export interface SeedProgress {
  totalEntities: number;
  completedEntities: number;
  currentEntity: string;
  summary: Record<string, number>;
}

export async function seedAllDataToFirestore(
  onProgress?: (progress: SeedProgress) => void
): Promise<{ success: boolean; summary: Record<string, number>; message: string }> {
  const summary: Record<string, number> = {};

  try {
    // Helper to write in chunks
    const writeCollectionBatch = async (
      collectionName: string,
      items: Array<{ id: string; [key: string]: any }>
    ) => {
      const BATCH_SIZE = 100;
      let count = 0;
      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = items.slice(i, i + BATCH_SIZE);
        for (const item of chunk) {
          const docRef = doc(db, collectionName, item.id);
          batch.set(docRef, item, { merge: true });
          count++;
        }
        await batch.commit();
      }
      summary[collectionName] = count;
      return count;
    };

    // 1. Categories
    onProgress?.({ totalEntities: 11, completedEntities: 1, currentEntity: 'Kategori Berita', summary });
    await writeCollectionBatch('categories', initialAdminCategories);

    // 2. Tags
    onProgress?.({ totalEntities: 11, completedEntities: 2, currentEntity: 'Tags & Topik', summary });
    await writeCollectionBatch('tags', initialAdminTags);

    // 3. Authors
    onProgress?.({ totalEntities: 11, completedEntities: 3, currentEntity: 'Profil Penulis & Redaksi', summary });
    await writeCollectionBatch('authors', initialAdminAuthors);

    // 4. Media
    onProgress?.({ totalEntities: 11, completedEntities: 4, currentEntity: 'Media Library', summary });
    await writeCollectionBatch('media', initialAdminMedia);

    // 5. Pages
    onProgress?.({ totalEntities: 11, completedEntities: 5, currentEntity: 'Pages Informasi', summary });
    await writeCollectionBatch('pages', initialAdminPagesData);

    // 6. Navigation
    onProgress?.({ totalEntities: 11, completedEntities: 6, currentEntity: 'Menu Navigasi', summary });
    const navItems = [
      ...INITIAL_NAVIGATION_DATA.map((nav) => ({ ...nav, section: 'primary' })),
      ...INITIAL_SUB_NAVIGATION_DATA.map((subnav) => ({ ...subnav, section: 'subnav' })),
      { ...INITIAL_SUB_NAV_SETTINGS, id: 'subnav_settings', section: 'settings' },
    ];
    await writeCollectionBatch('navigation', navItems);

    // 7. Footer
    onProgress?.({ totalEntities: 11, completedEntities: 7, currentEntity: 'Konfigurasi Footer', summary });
    await setDoc(doc(db, 'footer', 'config'), INITIAL_FOOTER_CONFIG, { merge: true });
    await setDoc(doc(db, 'footer', 'default'), INITIAL_FOOTER_CONFIG, { merge: true });
    summary['footer'] = 2;

    // 8. Site Settings
    onProgress?.({ totalEntities: 11, completedEntities: 8, currentEntity: 'Site Settings & Tipografi', summary });
    await setDoc(doc(db, 'site_settings', 'default'), INITIAL_SITE_SETTINGS, { merge: true });
    summary['site_settings'] = 1;

    // 9. System Settings
    onProgress?.({ totalEntities: 11, completedEntities: 9, currentEntity: 'System Settings', summary });
    await setDoc(doc(db, 'system_settings', 'info'), DEFAULT_SYSTEM_INFO, { merge: true });
    await setDoc(doc(db, 'system_settings', 'maintenance'), DEFAULT_MAINTENANCE_CONFIG, { merge: true });
    await setDoc(doc(db, 'system_settings', 'security'), DEFAULT_SECURITY_CONFIG, { merge: true });
    summary['system_settings'] = 3;

    // 10. Articles
    onProgress?.({ totalEntities: 11, completedEntities: 10, currentEntity: 'Artikel Berita', summary });
    await writeCollectionBatch('articles', initialAdminArticles);

    // 11. Videos
    onProgress?.({ totalEntities: 11, completedEntities: 11, currentEntity: 'Video Liputan', summary });
    await writeCollectionBatch('videos', initialAdminVideos);

    return {
      success: true,
      summary,
      message: 'Seluruh struktur dan data awal berhasil disinkronisasi ke Google Cloud Firestore!',
    };
  } catch (error: any) {
    console.error('Failed to seed Firestore:', error);
    return {
      success: false,
      summary,
      message: error?.message || 'Gagal menyinkronisasi data ke Firestore',
    };
  }
}
