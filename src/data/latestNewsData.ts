import React from 'react';
import { NewsArticle } from '../types/news';

export interface PopularNewsItemData {
  id: string;
  rank: number;
  title: string;
  href: string;
  slug: string;
  category?: string;
  date?: string;
}

export interface LatestNewsPost {
  id: string | number;
  title: string;
  category: string;
  date: string;
  time: string;
  imageUrl: string;
  imageAlt?: string;
  excerpt: string;
  href: string;
  slug: string;
}

export interface SidebarSpecialCardData {
  title: string;
  subtitle?: string;
  eventDate?: string;
  speaker?: string;
  speakerDate?: string;
  buttonText: string;
  href: string;
}

export interface TrendingSidebarItem {
  id: string | number;
  title: string;
  category: string;
  date: string;
  time: string;
  imageUrl: string;
  href: string;
  slug: string;
}

export interface ViralTopicItem {
  rank: number;
  title: string;
  articleCount: number;
  slug: string;
  href: string;
}

export interface LatestVideoItem {
  id: string | number;
  title: string;
  category: string;
  date: string;
  duration: string;
  thumbnailUrl: string;
  videoEmbedId?: string;
  description?: string;
  href: string;
  slug: string;
}

export const defaultLatestNewsPosts: LatestNewsPost[] = [
  {
    id: 'latest-1',
    title: 'Krisis Usia 25: Lepas dari Jebakan Timeline Media Sosial dan Temukan Rute Sendiri',
    category: 'Your Say',
    date: '27/08/2026',
    time: '09:15 WIB',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    imageAlt: 'Wanita karier muda memegang dokumen di kantor',
    excerpt: 'Memasuki usia seperempat abad kerap dibayangi standar kesuksesan semu di linimasa media sosial. Saatnya menentukan jalan hidup dengan ritme diri sendiri tanpa terjebak komparasi toxic.',
    href: '/berita/krisis-usia-25-lepas-dari-jebakan-timeline-media-sosial',
    slug: 'krisis-usia-25-lepas-dari-jebakan-timeline-media-sosial',
  },
  {
    id: 'latest-2',
    title: 'Demo 27 Agustus 2026 Mulai Jam Berapa? Cek Link Live CCTV untuk Pantau...',
    category: 'News',
    date: '27/08/2026',
    time: '09:13 WIB',
    imageUrl: 'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?q=80&w=500&auto=format&fit=crop',
    imageAlt: 'Massa aksi demonstrasi memegang pengeras suara',
    excerpt: 'Massa aksi gabungan buruh dan elemen masyarakat mulai berkumpul sejak pagi di kawasan strategis ibu kota. Masyarakat dapat memantau arus lalu lintas melalui siaran CCTV online.',
    href: '/berita/demo-27-agustus-2026-mulai-jam-berapa-cek-link-live-cctv',
    slug: 'demo-27-agustus-2026-mulai-jam-berapa-cek-link-live-cctv',
  },
  {
    id: 'latest-3',
    title: 'Harga Minyak Turun Didorong Prospek Pembukaan Selat Hormuz',
    category: 'Bisnis',
    date: '27/08/2026',
    time: '09:09 WIB',
    imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=500&auto=format&fit=crop',
    imageAlt: 'Kapal kargo kontainer melintasi jalur pelayaran laut lepas',
    excerpt: 'Harga minyak mentah dunia terkoreksi pada sesi perdagangan pagi menyusul sentimen positif potensi pemulihan jalur logistik dan perdagangan energi global di perairan strategis.',
    href: '/berita/harga-minyak-turun-didorong-prospek-pembukaan-selat-hormuz',
    slug: 'harga-minyak-turun-didorong-prospek-pembukaan-selat-hormuz',
  },
  {
    id: 'latest-4',
    title: 'Sinergi Kemanusiaan, Komunitas Polisi Baik Polres Bogor Bersama Mahasiswa NTT Salurkan Bantuan Rp100 Juta ke Manggarai',
    category: 'Jabar',
    date: '27/08/2026',
    time: '08:58 WIB',
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=500&auto=format&fit=crop',
    imageAlt: 'Simbolis penyerahan paket bantuan kemanusiaan',
    excerpt: 'Penyaluran bantuan logistik dan dana pendidikan bagi keluarga terdampak bencana alam di wilayah Manggarai Timur terealisasi melalui sinergi nyata kepolisian bersama perkumpulan mahasiswa daerah.',
    href: '/berita/sinergi-kemanusiaan-polres-bogor-bantuan-manggarai',
    slug: 'sinergi-kemanusiaan-polres-bogor-bantuan-manggarai',
  },
  {
    id: 'latest-5',
    title: 'Pemerintah Kota Batu Resmikan Sentra Edukasi Apel dan Pusat Inovasi Pertanian Organik Modern',
    category: 'Daerah',
    date: '27/08/2026',
    time: '08:45 WIB',
    imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=500&auto=format&fit=crop',
    imageAlt: 'Perkebunan apel dan agrowisata Kota Batu',
    excerpt: 'Pj Wali Kota Batu meresmikan sentra terpadu agrowisata dan pusat pelatihan budidaya apel organik guna memperkuat daya saing komoditas unggulan lokal serta menarik minat wisatawan.',
    href: '/berita/pemkot-batu-resmikan-sentra-edukasi-apel',
    slug: 'pemkot-batu-resmikan-sentra-edukasi-apel',
  },
  {
    id: 'latest-6',
    title: 'BI Catat Cadangan Devisa Menguat Jadi 140 Miliar Dolar AS, Ditopang Penerimaan Pajak dan Jasa Ekspor',
    category: 'Ekonomi Bisnis',
    date: '27/08/2026',
    time: '08:30 WIB',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=500&auto=format&fit=crop',
    imageAlt: 'Gedung Bank Indonesia dan aktivitas transaksi pasar keuangan',
    excerpt: 'Bank Indonesia melaporkan posisi cadangan devisa nasional pada akhir bulan ini tetap sangat memadai untuk mendukung ketahanan sektor eksternal serta menjaga stabilitas makroekonomi.',
    href: '/berita/bi-catat-cadangan-devisa-menguat',
    slug: 'bi-catat-cadangan-devisa-menguat',
  },
  {
    id: 'latest-7',
    title: 'BMKG Rilis Potensi Hujan Lebat dan Angin Kencang di Sejumlah Wilayah Jawa Timur Sepekan ke Depan',
    category: 'News',
    date: '27/08/2026',
    time: '08:15 WIB',
    imageUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=500&auto=format&fit=crop',
    imageAlt: 'Kondisi cuaca hujan dan awan mendung di kawasan pegunungan',
    excerpt: 'Masyarakat di kawasan Malang Raya dan pesisir Jawa Timur diimbau tetap waspada terhadap potensi cuaca ekstrem yang dipicu dinamika atmosfer dan peningkatan kelembapan udara.',
    href: '/berita/bmkg-potensi-cuaca-ekstrem-jawa-timur',
    slug: 'bmkg-potensi-cuaca-ekstrem-jawa-timur',
  },
  {
    id: 'latest-8',
    title: 'Bukti Hukum di Era Digital Tak Lagi Cuma Dokumen dan Saksi, Ada Jejak Data hingga AI',
    category: 'Nasional',
    date: '26/08/2026',
    time: '20:06',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=500&auto=format&fit=crop',
    imageAlt: 'Palu sidang pengadilan dan buku hukum digital',
    excerpt: 'Bukti hukum di era digital kini mencakup metadata, GPS, transaksi elektronik hingga AI. Harli Siregar menegaskan aparat penegak hukum harus adaptif dengan pembuktian forensik digital.',
    href: '/berita/bukti-hukum-era-digital-jejak-data-ai',
    slug: 'bukti-hukum-era-digital-jejak-data-ai',
  },
  {
    id: 'latest-9',
    title: 'Dilibas Petenis Ukraina Dua Set Langsung, Langkah Janice Tjen Terhenti di Perempat Final Monterrey Open 2026',
    category: 'Arena',
    date: '26/08/2026',
    time: '20:04',
    imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=500&auto=format&fit=crop',
    imageAlt: 'Petenis putri Indonesia Janice Tjen berlaga di turnamen WTA',
    excerpt: 'Petenis Indonesia, Janice Tjen, harus menelan pil pahit pada pertandingan di babak perempat final WTA 500 Monterrey Open usai kalah dari unggulan ketiga asal Ukraina.',
    href: '/berita/langkah-janice-tjen-terhenti-monterrey-open-2026',
    slug: 'langkah-janice-tjen-terhenti-monterrey-open-2026',
  },
  {
    id: 'latest-10',
    title: 'Peringatan Ketum GRIB Jaya Hercules ke Massa Aksi Jelang Demo 27 Agustus di DPR: Tetap Jaga Jakarta, Ini Negara Hukum',
    category: 'Nasional',
    date: '26/08/2026',
    time: '20:00',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=500&auto=format&fit=crop',
    imageAlt: 'Konferensi pers ormas dan tokoh masyarakat',
    excerpt: 'Ketua Umum ormas GRIB Jaya, Hercules Rozario Marshal mengimbau massa aksi demo menjelang sidang terbuka untuk menjaga ketertiban umum dan menaati supremasi hukum di ibu kota.',
    href: '/berita/peringatan-hercules-grib-jaya-massa-aksi-dpr',
    slug: 'peringatan-hercules-grib-jaya-massa-aksi-dpr',
  },
  {
    id: 'latest-11',
    title: 'Izin Laga Persija Vs Persib di GBK Belum Keluar, Ferry Paulus Angkat Bicara',
    category: 'Liga Indonesia',
    date: '26/08/2026',
    time: '19:52',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=500&auto=format&fit=crop',
    imageAlt: 'Konferensi pers PT LIB terkait izin pertandingan sepak bola',
    excerpt: 'Persija vs Persib dijadwalkan berlangsung di SUGBK pada 12 September 2026. Ferry Paulus mengungkapkan koordinasi perizinan keamanan masih terus diupayakan bersama Polda Metro Jaya.',
    href: '/berita/izin-laga-persija-vs-persib-gbk-ferry-paulus',
    slug: 'izin-laga-persija-vs-persib-gbk-ferry-paulus',
  },
  {
    id: 'latest-12',
    title: 'Pembelaan Mercedes Terkait Keputusan Team Order di F1 GP Belanda 2026: Demi Bantu George Russell',
    category: 'One Prix',
    date: '26/08/2026',
    time: '19:48',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=500&auto=format&fit=crop',
    imageAlt: 'Pembalap tim Formula 1 Mercedes di paddock',
    excerpt: 'Mercedes menjelaskan alasan di balik team order yang diterapkan kepada George Russell dan Kimi Antonelli saat balapan sengit di Sirkuit Zandvoort guna mengamankan podium konstruktor.',
    href: '/berita/pembelaan-mercedes-team-order-f1-gp-belanda-2026',
    slug: 'pembelaan-mercedes-team-order-f1-gp-belanda-2026',
  },
  {
    id: 'latest-13',
    title: '3 Hal yang Paling Ruben Onsu Sayangkan Setelah Ditetapkan Jadi Tersangka Dugaan Penipuan Bisnis Kuliner',
    category: 'Seleb',
    date: '26/08/2026',
    time: '19:40',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop',
    imageAlt: 'Wawancara selebritas dan kuasa hukum',
    excerpt: 'Ruben Onsu akhirnya buka suara terkait penetapan status tersangka dalam sengketa merek dagang dan bisnis kuliner, menyoroti nasib ribuan karyawan dan iktikad baik yang telah dijalin.',
    href: '/berita/ruben-onsu-sayangkan-tersangka-bisnis-kuliner',
    slug: 'ruben-onsu-sayangkan-tersangka-bisnis-kuliner',
  },
  {
    id: 'latest-14',
    title: 'Pemkot Batu Perkuat Kerja Sama Agrowisata dan Distribusi Produk Pertanian Organik ke Pasar Ekspor',
    category: 'Daerah',
    date: '26/08/2026',
    time: '19:30',
    imageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=500&auto=format&fit=crop',
    imageAlt: 'Sentra agrowisata dan buah apel organik Kota Batu',
    excerpt: 'Pemerintah Kota Batu terus memperluas jaringan kemitraan agrowisata untuk mendongkrak nilai tambah produk petani apel dan hortikultura di pasar regional maupun internasional.',
    href: '/berita/pemkot-batu-perkuat-agrowisata-ekspor-organik',
    slug: 'pemkot-batu-perkuat-agrowisata-ekspor-organik',
  },
];

export const defaultSidebarSpecialCard: SidebarSpecialCardData = {
  title: 'BatuTV Special Forum 2026',
  subtitle: 'Dialog Interaktif Nasional & Daerah',
  eventDate: 'Kamis, 28 Mei 2026 - 06:45 WIB',
  speaker: 'Pj Wali Kota Batu & Pakar Tata Kota',
  speakerDate: 'Sabtu, 4 April 2026 - 13:42 WIB',
  buttonText: 'BACA SELENGKAPNYA »',
  href: '/special-event/dialog-nasional-batutv-2026',
};

export const defaultTrendingSidebarItems: TrendingSidebarItem[] = [
  {
    id: 'trend-1',
    title: 'Agustus 2026, Massa Aksi Mulai Siapkan Tuntutan Sidang Parlemen Terbuka',
    category: 'Nasional',
    date: '26/08/2026',
    time: '12:09',
    imageUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=200&auto=format&fit=crop',
    href: '/berita/massa-aksi-siapkan-tuntutan-parlemen',
    slug: 'massa-aksi-siapkan-tuntutan-parlemen',
  },
  {
    id: 'trend-2',
    title: 'Bakal Naik Level, 5 Zodiak Ini Paling Beruntung Soal Karier dan Peluang Baru',
    category: 'Trend',
    date: '26/08/2026',
    time: '11:03',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=200&auto=format&fit=crop',
    href: '/berita/5-zodiak-paling-beruntung-karier',
    slug: '5-zodiak-paling-beruntung-karier',
  },
  {
    id: 'trend-3',
    title: 'Siap-Siap Kebanjiran Rezeki! 6 Zodiak Paling Bercuan Pekan Ini Menjelang Akhir Bulan',
    category: 'Trend',
    date: '26/08/2026',
    time: '10:59',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=200&auto=format&fit=crop',
    href: '/berita/6-zodiak-paling-bercuan-pekan-ini',
    slug: '6-zodiak-paling-bercuan-pekan-ini',
  },
  {
    id: 'trend-4',
    title: 'Hati Makin Berbunga-Bunga, 5 Zodiak Paling Romantis dan Harmonis',
    category: 'Trend',
    date: '26/08/2026',
    time: '08:29',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
    href: '/berita/5-zodiak-paling-romantis',
    slug: '5-zodiak-paling-romantis',
  },
];

export const defaultViralTopics: ViralTopicItem[] = [
  {
    rank: 1,
    title: 'Timnas Indonesia',
    articleCount: 50415,
    slug: 'timnas-indonesia',
    href: '/tag/timnas-indonesia',
  },
  {
    rank: 2,
    title: 'Piala Dunia 2026',
    articleCount: 10150,
    slug: 'piala-dunia-2026',
    href: '/tag/piala-dunia-2026',
  },
  {
    rank: 3,
    title: 'Viral',
    articleCount: 6109,
    slug: 'viral',
    href: '/tag/viral',
  },
  {
    rank: 4,
    title: 'Piala Dunia',
    articleCount: 19357,
    slug: 'piala-dunia',
    href: '/tag/piala-dunia',
  },
  {
    rank: 5,
    title: 'John Herdman',
    articleCount: 2708,
    slug: 'john-herdman',
    href: '/tag/john-herdman',
  },
];

export const defaultLatestVideos: LatestVideoItem[] = [
  {
    id: 'video-latest-1',
    title: '7 Ribu Lebih Gempa Susulan Terjadi di NTT, BNPB Laporkan Perkembangan Penanganan...',
    category: 'News',
    date: '26/08/2026',
    duration: '08:28',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=600&auto=format&fit=crop',
    videoEmbedId: 'dQw4w9WgXcQ',
    description: 'BNPB melaporkan situasi pasca gempa susulan di wilayah NTT dan percepatan pengiriman logistik bantuan.',
    href: '/video/7-ribu-lebih-gempa-susulan-ntt-bnpb',
    slug: '7-ribu-lebih-gempa-susulan-ntt-bnpb',
  },
  {
    id: 'video-latest-2',
    title: 'Bayang-bayang Karhutla Mulai Ancam Kawasan IKN',
    category: 'News',
    date: '26/08/2026',
    duration: '05:13',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=600&auto=format&fit=crop',
    videoEmbedId: 'dQw4w9WgXcQ',
    description: 'OIKN dan BMKG melakukan operasi modifikasi cuaca dengan menebar 800 kg garam guna mencegah karhutla.',
    href: '/video/bayang-bayang-karhutla-mulai-ancam-ikn',
    slug: 'bayang-bayang-karhutla-mulai-ancam-ikn',
  },
  {
    id: 'video-latest-3',
    title: 'Tidak Ada Tenda Bantuan Warga Manggarai Timur Mengungsi Mandiri',
    category: 'News',
    date: '26/08/2026',
    duration: '03:46',
    thumbnailUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=600&auto=format&fit=crop',
    videoEmbedId: 'dQw4w9WgXcQ',
    description: 'Warga terdampak bencana di Manggarai Timur terpaksa mendirikan tenda darurat seadanya sambil menanti bantuan.',
    href: '/video/tidak-ada-tenda-bantuan-warga-manggarai-timur',
    slug: 'tidak-ada-tenda-bantuan-warga-manggarai-timur',
  },
  {
    id: 'video-latest-4',
    title: 'Insiden Beruntun Usai Sukhoi, Pesawat Cassa Tergelincir di Bandara Sultan Hasanuddin',
    category: 'News',
    date: '26/08/2026',
    duration: '05:27',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=600&auto=format&fit=crop',
    videoEmbedId: 'dQw4w9WgXcQ',
    description: 'Pesawat jenis Cassa mengalami insiden tergelincir di landasan pacu Bandara Internasional Sultan Hasanuddin.',
    href: '/video/insiden-beruntun-pesawat-cassa-tergelincir',
    slug: 'insiden-beruntun-pesawat-cassa-tergelincir',
  },
  {
    id: 'video-latest-5',
    title: 'Racun Api Digunakan Petugas untuk Pemadaman Karhutla di Riau',
    category: 'News',
    date: '26/08/2026',
    duration: '02:26',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop',
    videoEmbedId: 'dQw4w9WgXcQ',
    description: 'Petugas gabungan menyemprotkan air bercampur zat pemadam ke titik panas lahan gambut di Riau.',
    href: '/video/racun-api-digunakan-petugas-karhutla-riau',
    slug: 'racun-api-digunakan-petugas-karhutla-riau',
  },
  {
    id: 'video-latest-6',
    title: 'Warga Maumere Dibekali Logistik saat Hendak Pulang ke Rumah Masing-masing',
    category: 'News',
    date: '26/08/2026',
    duration: '01:41',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=600&auto=format&fit=crop',
    videoEmbedId: 'dQw4w9WgXcQ',
    description: 'Pemberian paket sembako dan bantuan logistik bagi warga Maumere yang mulai kembali ke kediaman mereka.',
    href: '/video/warga-maumere-dibekali-logistik',
    slug: 'warga-maumere-dibekali-logistik',
  },
];

export const defaultPopularNews: PopularNewsItemData[] = [
  {
    id: 'pop-1',
    rank: 1,
    title: 'Situasi Terkini DPR! Jelang Demo 27 Agustus 2026, Pengamanan Berlapis Diperketat',
    href: '/berita/situasi-terkini-dpr-demo-27-agustus',
    slug: 'situasi-terkini-dpr-demo-27-agustus',
    category: 'Nasional',
    date: '26/08/2026',
  },
  {
    id: 'pop-2',
    rank: 2,
    title: 'Jelang Aksi 27 Agustus, Aliansi Masyarakat Pati Suarakan Aspirasi Kebijakan Agraria',
    href: '/berita/jelang-aksi-aliansi-masyarakat-pati',
    slug: 'jelang-aksi-aliansi-masyarakat-pati',
    category: 'Daerah',
    date: '26/08/2026',
  },
  {
    id: 'pop-3',
    rank: 3,
    title: 'Jelang Aksi 27 Agustus di DPR, 4 Bus Warga Pati Siap Berangkat Kawal Tuntutan',
    href: '/berita/warga-pati-siap-berangkat-ke-dpr',
    slug: 'warga-pati-siap-berangkat-ke-dpr',
    category: 'Nasional',
    date: '26/08/2026',
  },
  {
    id: 'pop-4',
    rank: 4,
    title: 'FULL! Kontroversi Pemblokiran Rekening Aktivis dan Penjelasan Resmi OJK',
    href: '/berita/kontroversi-pemblokiran-rekening-aktivis',
    slug: 'kontroversi-pemblokiran-rekening-aktivis',
    category: 'Ekonomi Bisnis',
    date: '26/08/2026',
  },
];

