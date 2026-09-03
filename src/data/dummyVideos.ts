export interface DetailedVideoData {
  id: string;
  slug: string;
  category: string;
  categorySlug: string;
  title: string;
  summary: string;
  author: {
    name: string;
    role: string;
    slug: string;
    avatar: string;
    bio: string;
  };
  publishedAt: string;
  publishedIso: string;
  updatedAt: string;
  updatedIso: string;
  duration: string;
  durationIso: string; // PT3M45S for VideoObject ISO 8601
  views: number;
  videoUrl: string;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  posterUrl: string;
  descriptionHtml?: string;
  descriptionParagraphs: string[];
  tags: { name: string; slug: string }[];
}

export const defaultMainVideo: DetailedVideoData = {
  id: 'vid-menkes-dpr-bantu-warga-ntt',
  slug: 'menkes-ajak-anggota-dpr-bantu-warga-ntt',
  category: 'NASIONAL',
  categorySlug: 'nasional',
  title: 'Menkes Ajak Berbagai Pihak Ikut Bantu Warga di Wilayah Terdampak',
  summary: 'Pemerintah mendorong kolaborasi berbagai pihak untuk membantu masyarakat melalui dukungan layanan kesehatan, fasilitas umum, dan kebutuhan dasar warga.',
  author: {
    name: 'Suara Media Video',
    role: 'Video Journalist',
    slug: 'suara-media',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    bio: 'Tim video yang menyajikan liputan visual dan informasi terkini dari berbagai daerah di seluruh penjuru Indonesia.'
  },
  publishedAt: 'Kamis, 27 Agustus 2026 | 18:30 WIB',
  publishedIso: '2026-08-27T18:30:00+07:00',
  updatedAt: 'Kamis, 27 Agustus 2026 | 19:05 WIB',
  updatedIso: '2026-08-27T19:05:00+07:00',
  duration: '03:45',
  durationIso: 'PT3M45S',
  views: 12540,
  youtubeVideoId: 'dQw4w9WgXcQ',
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  posterUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1280&auto=format&fit=crop',
  descriptionParagraphs: [
    'Video ini membahas upaya pemerintah dalam mendorong berbagai pihak untuk ikut memberikan perhatian kepada masyarakat di sejumlah wilayah.',
    'Sejumlah pihak menilai kerja sama antara pemerintah, lembaga terkait, dan masyarakat menjadi bagian penting dalam mempercepat penanganan berbagai kebutuhan.',
    'Dalam video ini, sejumlah informasi terbaru dan tanggapan dari pihak terkait dirangkum untuk memberikan gambaran mengenai perkembangan situasi dan langkah konkret ke depan.'
  ],
  tags: [
    { name: 'Nasional', slug: 'nasional' },
    { name: 'Pemerintah', slug: 'pemerintah' },
    { name: 'DPR', slug: 'dpr' },
    { name: 'Kesehatan', slug: 'kesehatan' },
    { name: 'Bantuan Warga', slug: 'bantuan-warga' },
    { name: 'NTT', slug: 'ntt' }
  ]
};

export interface RelatedVideoCardItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  duration: string;
  thumbnailUrl: string;
  publishedAt: string;
  views: string;
}

export const defaultRelatedVideos: RelatedVideoCardItem[] = [
  {
    id: 'rel-vid-1',
    slug: 'pemerintah-bahas-langkah-baru-untuk-masyarakat',
    title: 'Pemerintah Bahas Langkah Baru untuk Masyarakat',
    category: 'Nasional',
    duration: '04:12',
    thumbnailUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=600&auto=format&fit=crop',
    publishedAt: '27 Agustus 2026',
    views: '8.9k'
  },
  {
    id: 'rel-vid-2',
    slug: 'kondisi-terbaru-di-wilayah-terdampak',
    title: 'Kondisi Terbaru di Wilayah Terdampak Bencana',
    category: 'News',
    duration: '03:30',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=600&auto=format&fit=crop',
    publishedAt: '27 Agustus 2026',
    views: '14.2k'
  },
  {
    id: 'rel-vid-3',
    slug: 'sejumlah-tokoh-berikan-tanggapan',
    title: 'Sejumlah Tokoh Berikan Tanggapan Terkait Alokasi Bantuan',
    category: 'Politik',
    duration: '05:45',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    publishedAt: '26 Agustus 2026',
    views: '6.5k'
  },
  {
    id: 'rel-vid-4',
    slug: 'liputan-khusus-perkembangan-hari-ini',
    title: 'Liputan Khusus Perkembangan Hari Ini di DPR RI',
    category: 'Liputan Khusus',
    duration: '08:20',
    thumbnailUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=600&auto=format&fit=crop',
    publishedAt: '26 Agustus 2026',
    views: '19.8k'
  },
  {
    id: 'rel-vid-5',
    slug: 'evaluasi-distribusi-fasilitas-medis-pelosok',
    title: 'Evaluasi Distribusi Fasilitas Medis di Pelosok Daerah',
    category: 'Kesehatan',
    duration: '04:50',
    thumbnailUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=600&auto=format&fit=crop',
    publishedAt: '26 Agustus 2026',
    views: '5.1k'
  },
  {
    id: 'rel-vid-6',
    slug: 'sinergi-antar-lembaga-tanggap-darurat',
    title: 'Sinergi Antar Lembaga Tanggap Darurat Logistik Kesehatan',
    category: 'Nasional',
    duration: '06:15',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=600&auto=format&fit=crop',
    publishedAt: '25 Agustus 2026',
    views: '11.3k'
  }
];

export interface RelatedArticleItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  time: string;
  imageUrl: string;
  excerpt: string;
}

export const defaultRelatedArticlesList: RelatedArticleItem[] = [
  {
    id: 'rel-art-1',
    slug: 'pemerintah-siapkan-langkah-penanganan-wilayah-terdampak',
    title: 'Pemerintah Siapkan Langkah Penanganan Wilayah Terdampak Secara Komprehensif',
    category: 'Nasional',
    date: '27 Agustus 2026',
    time: '17:15 WIB',
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=500&auto=format&fit=crop',
    excerpt: 'Koordinasi lintas kementerian dipercepat guna menjamin ketersediaan obat-obatan dan tenaga perawat di lapangan.'
  },
  {
    id: 'rel-art-2',
    slug: 'komisi-dpr-bahas-kebijakan-baru',
    title: 'Komisi DPR Bahas Kebijakan Baru Terkait Penguatan Fasilitas Kesehatan',
    category: 'Parlemen',
    date: '27 Agustus 2026',
    time: '15:40 WIB',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=500&auto=format&fit=crop',
    excerpt: 'Rapat dengar pendapat bersama pemangku kepentingan menyoroti transparansi anggaran dan bantuan darurat.'
  },
  {
    id: 'rel-art-3',
    slug: 'sejumlah-pihak-soroti-kondisi-masyarakat',
    title: 'Sejumlah Pihak Soroti Kondisi Masyarakat dan Distribusi Bantuan Logistik',
    category: 'Kesejahteraan',
    date: '26 Agustus 2026',
    time: '19:20 WIB',
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=500&auto=format&fit=crop',
    excerpt: 'Pemerhati kebijakan sosial meminta agar posko tanggap darurat dilengkapi sistem pelacakan bantuan secara digital.'
  },
  {
    id: 'rel-art-4',
    slug: 'distribusi-bantuan-logistik-kesehatan-dipercepat',
    title: 'Distribusi Bantuan Logistik dan Tenaga Medis Dipercepat ke Titik Pengungsian',
    category: 'Kesehatan',
    date: '26 Agustus 2026',
    time: '14:10 WIB',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=500&auto=format&fit=crop',
    excerpt: 'Helikopter bantuan dikerahkan untuk menjangkau lokasi terisolir yang sulit dilalui jalur darat.'
  }
];

export interface LatestVideoFeedItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  duration: string;
  timeAgo: string;
  thumbnailUrl: string;
}

export const defaultLatestVideoFeed: LatestVideoFeedItem[] = [
  {
    id: 'lat-vid-1',
    slug: 'pemerintah-sampaikan-informasi-terbaru',
    title: 'Pemerintah Sampaikan Informasi Terbaru Hari Ini Mengenai Tata Kelola Bantuan',
    category: 'Nasional',
    duration: '02:34',
    timeAgo: '10 menit lalu',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'lat-vid-2',
    slug: '7-ribu-lebih-gempa-susulan-ntt-bnpb',
    title: '7 Ribu Lebih Gempa Susulan Terjadi di NTT, BNPB Laporkan Perkembangan',
    category: 'News',
    duration: '08:28',
    timeAgo: '30 menit lalu',
    thumbnailUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'lat-vid-3',
    slug: 'bayang-bayang-karhutla-mulai-ancam-ikn',
    title: 'Bayang-bayang Karhutla Mulai Ancam Kawasan IKN, Petugas Siagakan Modifikasi Cuaca',
    category: 'Lingkungan',
    duration: '05:13',
    timeAgo: '1 jam lalu',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'lat-vid-4',
    slug: 'warga-maumere-dibekali-logistik',
    title: 'Warga Maumere Dibekali Logistik saat Hendak Pulang ke Rumah Masing-masing',
    category: 'Kemanusiaan',
    duration: '01:41',
    timeAgo: '2 jam lalu',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'lat-vid-5',
    slug: 'insiden-beruntun-pesawat-cassa-tergelincir',
    title: 'Insiden Pesawat Cassa Tergelincir di Bandara Sultan Hasanuddin',
    category: 'Peristiwa',
    duration: '05:27',
    timeAgo: '3 jam lalu',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'lat-vid-6',
    slug: 'racun-api-digunakan-petugas-karhutla-riau',
    title: 'Racun Api Digunakan Petugas untuk Pemadaman Karhutla di Lahan Gambut Riau',
    category: 'News',
    duration: '02:26',
    timeAgo: '4 jam lalu',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'lat-vid-7',
    slug: 'pusat-komando-digital-polres-pantau-wisata',
    title: 'Pusat Komando Digital CCTV Polres Pantau Kepadatan Wisatawan Kota Batu',
    category: 'Daerah',
    duration: '04:15',
    timeAgo: '5 jam lalu',
    thumbnailUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'lat-vid-8',
    slug: 'eksplorasi-sentra-kopi-arabika-arjuno',
    title: 'Eksplorasi Sentra Budidaya Kopi Arabika Lereng Gunung Arjuno Tembus Ekspor',
    category: 'Ekonomi',
    duration: '06:10',
    timeAgo: '6 jam lalu',
    thumbnailUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=400&auto=format&fit=crop'
  }
];

export interface PopularVideoSidebarItem {
  id: string;
  slug: string;
  title: string;
  duration: string;
  thumbnailUrl: string;
  views: string;
}

export const defaultPopularVideosSidebar: PopularVideoSidebarItem[] = [
  {
    id: 'pop-vid-1',
    slug: 'menkes-ajak-anggota-dpr-bantu-warga-ntt',
    title: 'Menkes Ajak Anggota DPR Super Kaya Ikut Bantu Warga Terdampak',
    duration: '03:45',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=300&auto=format&fit=crop',
    views: '24.5k'
  },
  {
    id: 'pop-vid-2',
    slug: 'live-report-suasana-pembukaan-festival-agropolitan',
    title: 'LIVE REPORT: Suasana Pembukaan Festival Agropolitan Kota Batu',
    duration: '08:42',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?q=80&w=300&auto=format&fit=crop',
    views: '18.9k'
  },
  {
    id: 'pop-vid-3',
    slug: 'rahasia-resep-ketan-durian-legendaris',
    title: 'Jelajah Rasa: Rahasia Kuliner Ketan Durian Legendaris Sejak 1967',
    duration: '12:08',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=300&auto=format&fit=crop',
    views: '31.4k'
  },
  {
    id: 'pop-vid-4',
    slug: 'taktik-singo-edan-hadapi-derby-jatim',
    title: 'Ulasan Taktik Singo Edan Hadapi Lawan Berat di Derby Jawa Timur',
    duration: '15:30',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=300&auto=format&fit=crop',
    views: '42.1k'
  }
];
