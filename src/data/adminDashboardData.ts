import {
  DashboardStats,
  AdminArticleItem,
  AdminVideoItem,
  AdminActivityLog,
} from '../types/admin';
import { getStoredArticles, getArticlesCounts, getArticlePublishedTimestamp, formatNewsFeedDateTime } from './newsAdminStore';
import { getStoredVideos } from './videoAdminStore';
import { getStoredCategories } from './categoryAdminStore';
import { getMediaById } from './mediaAdminStore';

// Isolated Mock Data for A02 — Dashboard BatuTV Control
export const mockDashboardStats: DashboardStats = {
  totalArticles: 128,
  totalVideos: 42,
  draftArticles: 12,
  publishedTotal: 158,
  scheduledArticles: 4,
  totalViews: 842900,
  totalCategories: 8,
  totalUsers: 5,
};

export const mockLatestArticles: AdminArticleItem[] = [
  {
    id: 'art-001',
    title: 'Pemkot Batu Resmikan Pusat Edukasi Pertanian Apel Ramah Lingkungan di Bumiaji',
    slug: 'pemkot-batu-resmikan-pusat-edukasi-apel',
    category: 'Daerah',
    categorySlug: 'daerah',
    status: 'published',
    author: 'Redaktur BatuTV',
    publishDate: '27 Agu 2026, 09:30 WIB',
    viewsCount: 1420,
    thumbnailUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'art-002',
    title: 'Kementerian ESDM Luncurkan Insentif Konversi Panel Surya Skala Rumah Tangga',
    slug: 'kementerian-esdm-insentif-panel-surya',
    category: 'Nasional',
    categorySlug: 'nasional',
    status: 'published',
    author: 'Biro Jakarta',
    publishDate: '27 Agu 2026, 08:15 WIB',
    viewsCount: 980,
    thumbnailUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'art-003',
    title: 'Revitalisasi Pasar Induk Among Tani Tingkatkan Perputaran Omzet UMKM Hingga 40%',
    slug: 'revitalisasi-pasar-among-tani-omzet-umkm',
    category: 'Ekonomi',
    categorySlug: 'ekonomi',
    status: 'draft',
    author: 'Tim Liputan Ekonomi',
    publishDate: '26 Agu 2026, 17:45 WIB',
    viewsCount: 0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'art-004',
    title: 'Diskominfo Kota Batu Kembangkan Jaringan Sensor IoT Pencegah Dini Longsor Lereng',
    slug: 'diskominfo-batu-kembangkan-iot-longsor',
    category: 'Teknologi',
    categorySlug: 'teknologi',
    status: 'published',
    author: 'Redaktur BatuTV',
    publishDate: '26 Agu 2026, 14:10 WIB',
    viewsCount: 2310,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'art-005',
    title: 'Daftar Rekayasa Arus Lalu Lintas Wisata Akhir Pekan Jalur Klemuk & Payung',
    slug: 'rekayasa-lalu-lintas-klemuk-payung',
    category: 'Daerah',
    categorySlug: 'daerah',
    status: 'draft',
    author: 'Reporter Wilayah',
    publishDate: '26 Agu 2026, 11:00 WIB',
    viewsCount: 0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&auto=format&fit=crop&q=80',
  },
];

export const mockLatestVideos: AdminVideoItem[] = [
  {
    id: 'vid-001',
    title: 'LIVE REPORT: Suasana Pembukaan Gelar Seni Budaya Bantengan Nusantara 2026',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    category: 'Budaya & Wisata',
    categorySlug: 'wisata',
    status: 'published',
    publishDate: '27 Agu 2026, 09:00 WIB',
    duration: '14:20',
    channelName: 'BatuTV Official',
  },
  {
    id: 'vid-002',
    title: 'LIPUTAN KHUSUS: Inovasi Petani Organik Desa Sumbergondo Tembus Ekspor Asia Pasifik',
    youtubeUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    youtubeId: 'aqz-KE-bpKQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80',
    category: 'Liputan Khusus',
    categorySlug: 'daerah',
    status: 'published',
    publishDate: '26 Agu 2026, 16:30 WIB',
    duration: '08:45',
    channelName: 'BatuTV Official',
  },
  {
    id: 'vid-003',
    title: 'Wawancara Eksklusif: Arah Pembangunan Pariwisata Hijau Kota Batu Menuju 2030',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    youtubeId: 'kJQP7kiw5Fk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&auto=format&fit=crop&q=80',
    category: 'Dialog Redaksi',
    categorySlug: 'politik',
    status: 'published',
    publishDate: '25 Agu 2026, 19:00 WIB',
    duration: '22:15',
    channelName: 'BatuTV Official',
  },
];

export const mockRecentActivities: AdminActivityLog[] = [
  {
    id: 'act-001',
    userName: 'Admin Redaksi',
    userRole: 'Editor',
    action: 'publish_article',
    targetTitle: 'Pemkot Batu Resmikan Pusat Edukasi Pertanian Apel',
    targetType: 'article',
    timestamp: '2026-08-27T09:30:00',
    timeAgo: '5 menit lalu',
  },
  {
    id: 'act-002',
    userName: 'Super Admin',
    userRole: 'Super Admin',
    action: 'add_video',
    targetTitle: 'LIVE REPORT: Suasana Pembukaan Gelar Seni Budaya Bantengan',
    targetType: 'video',
    timestamp: '2026-08-27T09:15:00',
    timeAgo: '20 menit lalu',
  },
  {
    id: 'act-003',
    userName: 'Redaktur Pelaksana',
    userRole: 'Editor',
    action: 'edit_article',
    targetTitle: 'Kementerian ESDM Luncurkan Insentif Panel Surya',
    targetType: 'article',
    timestamp: '2026-08-27T08:15:00',
    timeAgo: '1 jam lalu',
  },
  {
    id: 'act-004',
    userName: 'Reporter Wilayah',
    userRole: 'Kontributor',
    action: 'create_draft',
    targetTitle: 'Daftar Rekayasa Arus Lalu Lintas Wisata Akhir Pekan',
    targetType: 'article',
    timestamp: '2026-08-27T06:00:00',
    timeAgo: '3 jam lalu',
  },
];

// Helper functions for Data Layer (Simulating API Calls / Database Queries)
export async function getDashboardStats(): Promise<DashboardStats> {
  const articles = getStoredArticles();
  const counts = getArticlesCounts(articles);
  const videos = getStoredVideos();
  const categories = getStoredCategories();
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0) + videos.reduce((sum, v) => sum + (v.views || 0), 0);

  return Promise.resolve({
    totalArticles: counts.all,
    totalVideos: videos.filter((v) => v.status !== 'trash').length,
    draftArticles: counts.draft,
    publishedTotal: counts.published,
    scheduledArticles: counts.scheduled,
    totalViews: totalViews > 0 ? totalViews : 842900,
    totalCategories: categories.length,
    totalUsers: 5,
  });
}

export async function getLatestArticles(): Promise<AdminArticleItem[]> {
  const articles = getStoredArticles();
  const sorted = [...articles].sort((a, b) => {
    return getArticlePublishedTimestamp(b) - getArticlePublishedTimestamp(a);
  });

  const formatted: AdminArticleItem[] = sorted.slice(0, 10).map((a) => {
    const dt = formatNewsFeedDateTime(a.publishedAt || a.createdAt);
    return {
      id: a.id,
      title: a.title,
      slug: a.slug,
      category: a.category || 'Daerah',
      categorySlug: a.categorySlug || 'daerah',
      status: a.status === 'trash' ? 'draft' : a.status,
      author: a.author || 'Redaktur BatuTV',
      publishDate: `${dt.date}, ${dt.time}`,
      viewsCount: a.views || 0,
      thumbnailUrl:
        a.featuredImage ||
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80',
    };
  });

  return Promise.resolve(formatted);
}

export async function getLatestVideos(): Promise<AdminVideoItem[]> {
  const videos = getStoredVideos();
  const sorted = [...videos].sort((a, b) => {
    const tA = new Date(a.publishedAt).getTime();
    const tB = new Date(b.publishedAt).getTime();
    return tB - tA;
  });

  const formatted: AdminVideoItem[] = sorted.slice(0, 6).map((v) => ({
    id: v.id,
    title: v.title,
    slug: v.slug,
    category: v.category,
    categorySlug: v.categorySlug || v.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    youtubeId: v.youtubeVideoId,
    youtubeUrl: v.youtubeUrl || `https://www.youtube.com/watch?v=${v.youtubeVideoId}`,
    status: v.status === 'trash' ? 'draft' : v.status,
    publishDate: v.publishedAt,
    viewsCount: v.views,
    thumbnailUrl:
      v.thumbnailSource === 'custom'
        ? (v.customThumbnail || (v.thumbnailMediaId ? getMediaById(v.thumbnailMediaId)?.url : '') || `https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg`)
        : `https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg`,
    duration: v.duration || '04:00',
    channelName: 'BatuTV Official',
  }));

  return Promise.resolve(formatted);
}

export async function getRecentActivities(): Promise<AdminActivityLog[]> {
  return Promise.resolve(mockRecentActivities);
}
