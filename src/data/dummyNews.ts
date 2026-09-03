import { NewsArticle, VideoNews, CategoryItem, LiveScheduleItem, WeatherData } from '../types/news';

export const categoriesData: CategoryItem[] = [
  { id: '1', name: 'Home', slug: 'home', color: '#dc2626' },
  { id: '2', name: 'Batu Raya', slug: 'batu-raya', color: '#0284c7', description: 'Kabar Kota Batu & Malang Raya' },
  { id: '3', name: 'Nasional', slug: 'nasional', color: '#dc2626', description: 'Berita Politik & Nasional' },
  { id: '4', name: 'Ekonomi & Bisnis', slug: 'ekonomi', color: '#16a34a', description: 'Pasar, UMKM, & Investasi' },
  { id: '5', name: 'Hukum & Kriminal', slug: 'hukum', color: '#7c3aed', description: 'Peristiwa & Kepolisian' },
  { id: '6', name: 'Pariwisata & Budaya', slug: 'pariwisata', color: '#ea580c', description: 'Destinasi & Seni Budaya' },
  { id: '7', name: 'Olahraga', slug: 'olahraga', color: '#0d9488', description: 'Sepak Bola & Arena' },
  { id: '8', name: 'Lifestyle & Kuliner', slug: 'lifestyle', color: '#db2777', description: 'Gaya Hidup & Kuliner' },
  { id: '9', name: 'Teknologi & Sains', slug: 'teknologi', color: '#4f46e5', description: 'Inovasi Digital' },
  { id: '10', name: 'Video BatuTV', slug: 'video', color: '#e11d48', description: 'Liputan Video Eksklusif' },
  { id: '11', name: 'BatuTV Live', slug: 'live', color: '#ef4444', description: 'Siaran Langsung' },
];

export const hotTopicsData: string[] = [
  '#FestivalApelBatu',
  '#WisataMalangRaya',
  '#PemiluDaerah2026',
  '#InfrastrukturJatim',
  '#DigitalisasiUMKM',
  '#AremaFCUpdate',
  '#PertanianOrganik',
  '#KopiLerengArjuno',
];

export const breakingNewsData = [
  {
    id: 'bn-1',
    title: 'Festival Bunga dan Hortikultura Kota Batu 2026 Resmi Dibuka, Hadirkan 120 Peserta Mancanegara',
    category: 'Batu Raya',
    time: 'Baru saja'
  },
  {
    id: 'bn-2',
    title: 'Gubernur Jatim Tinjau Pembangunan Jalur Lingkar Barat Batu-Pujon untuk Urai Kemacetan Wisata',
    category: 'Daerah',
    time: '15 menit lalu'
  },
  {
    id: 'bn-3',
    title: 'Pemerintah Pusat Resmikan Pusat Inkubasi Agribisnis Berbasis AI di Wilayah Jawa Timur',
    category: 'Nasional',
    time: '40 menit lalu'
  },
  {
    id: 'bn-4',
    title: 'BMKG Rilis Prakiraan Cuaca Kawasan Pegunungan: Suhu Sejuk 18-24 Derajat Celcius Sepanjang Pekan',
    category: 'Lingkungan',
    time: '1 jam lalu'
  },
  {
    id: 'bn-5',
    title: 'Ekspor Apel Olahan & Keripik Buah Khas Batu Tembus Pasar Asia Timur Senilai 45 Miliar Rupiah',
    category: 'Ekonomi',
    time: '2 jam lalu'
  }
];

export const weatherData: WeatherData = {
  city: 'Kota Batu',
  temp: 21,
  condition: 'Cerah Berawan',
  humidity: 78,
  airQuality: 'Baik (AQI 24)'
};

export const liveScheduleData: LiveScheduleItem[] = [
  { time: '06:00 - 07:30', program: 'Batu Pagi Ini', presenter: 'Rian Pratama' },
  { time: '07:30 - 09:00', program: 'Inspirasi Tani & Agrowisata', presenter: 'Siti Rahma' },
  { time: '09:00 - 11:30', program: 'Kilas Nusantara', presenter: 'Dian Anggraini' },
  { time: '11:30 - 13:00', program: 'Batu Hari Ini Siang (LIVE)', isLiveNow: true, presenter: 'Bayu Wicaksono' },
  { time: '13:00 - 14:30', program: 'Jelajah Kuliner & Wisata Lereng', presenter: 'Maya Putri' },
  { time: '14:30 - 16:00', program: 'Suara Parlemen & Publik', presenter: 'Ahmad Fauzi' },
  { time: '16:00 - 17:30', program: 'Batu Petang & Liputan Khusus', presenter: 'Rian Pratama' },
  { time: '18:30 - 20:00', program: 'Prime News BatuTV Terkini', presenter: 'Bayu Wicaksono' },
  { time: '20:00 - 21:30', program: 'Dialog Interaktif: Jawa Timur Menyapa', presenter: 'Dian Anggraini' },
  { time: '21:30 - 23:00', program: 'Zona Malam & Ragam Budaya', presenter: 'Eko Santoso' },
];

export const heroLeadArticle: NewsArticle = {
  id: 'hero-1',
  title: 'Revitalisasi Kawasan Sentra Pertanian Apel Terpadu Kota Batu Mulai Diresmikan, Bidik Kemandirian Petani Lokal',
  slug: 'revitalisasi-sentra-pertanian-apel-terpadu-kota-batu-diresmikan',
  category: 'Batu Raya',
  categorySlug: 'batu-raya',
  categoryColor: '#0284c7',
  summary: 'Pemerintah Kota Batu bersama Kementerian Pertanian meluncurkan proyek agropolitan terpadu seluas 80 hektar di kawasan Bumiaji yang menggabungkan riset bibit unggul, digital farming, dan ekowisata edukatif.',
  content: [
    'Pemerintah Kota Batu bersama Kementerian Pertanian Republik Indonesia secara resmi meresmikan Kawasan Sentra Pertanian Apel Terpadu di Kecamatan Bumiaji, Kota Batu. Proyek strategis ini bertujuan untuk mengembalikan kejayaan komoditas apel khas Kota Batu melalui penerapan teknologi pertanian presisi serta pembibitan varietas tahan hama.',
    'Wali Kota Batu dalam pidato peresmiannya menegaskan bahwa program revitalisasi ini mencakup penyediaan bibit bersertifikat secara gratis kepada 1.500 kelompok tani, pembangunan fasilitas rumah kaca modern, serta instalasi sistem irigasi tetes otomatis bertenaga surya.',
    '"Kami ingin memastikan para petani muda Kota Batu bangga dan mendapatkan kepastian hasil panen yang menguntungkan. Melalui integrasi agrowisata dan digital farming, nilai tambah komoditas apel bisa meningkat hingga tiga kali lipat," ungkap Wali Kota di hadapan ratusan perwakilan gabungan kelompok tani (Gapoktan).',
    'Selain fokus pada peningkatan volume panen, kawasan ini juga dilengkapi laboratorium kultur jaringan dan pusat pengolahan hasil panen turunan seperti cuka apel, kripik higienis berstandar ekspor, serta sirup konsentrat organik yang langsung disalurkan ke jaringan retail nasional.'
  ],
  imageUrl: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?q=80&w=1200&auto=format&fit=crop',
  imageCaption: 'Hamparan perkebunan apel modern terintegrasi di kawasan perbukitan Bumiaji, Kota Batu. (Foto: Dok. BatuTV/Rizky Kurniawan)',
  author: {
    name: 'Bayu Wicaksono',
    role: 'Redaktur Pelaksana BatuTV',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop'
  },
  publishedAt: '26 Agustus 2026, 11:45 WIB',
  timestamp: '25 menit lalu',
  readTime: '4 menit baca',
  views: 14250,
  tags: ['Pertanian Batu', 'Apel Manalagi', 'Bumiaji', 'Agropolitan', 'Ekonomi Daerah'],
  isBreaking: true,
  isEditorPick: true,
  region: 'Batu'
};

export const heroCompanionArticles: NewsArticle[] = [
  {
    id: 'hero-2',
    title: 'Jalur Alternatif Klemuk - Pujon Diperlebar, Pemkab Malang & Pemkot Batu Targetkan Rampung Sebelum Musim Liburan',
    slug: 'jalur-alternatif-klemuk-pujon-diperlebar-urai-kemacetan',
    category: 'Daerah',
    categorySlug: 'batu-raya',
    categoryColor: '#0284c7',
    summary: 'Proyek pelebaran jalan dan penguatan tebing penahan longsor di lintasan Klemuk kini telah mencapai progres 75 persen.',
    content: [
      'Proyek strategis konektivitas Malang Barat dan Kota Batu melalui jalur alternatif Klemuk terus dikebut penyelesaiannya.',
      'Dinas Bina Marga memastikan pemasangan guardrail baja elastis dan lampu penerangan jalan umum tenaga surya siap dipasang sepanjang 4,2 kilometer jalan.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=600&auto=format&fit=crop',
    imageCaption: 'Pengerjaan pengaspalan jalan penghubung antardaerah. (Foto: BatuTV)',
    author: {
      name: 'Rian Pratama',
      role: 'Jurnalis Daerah',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '26 Agustus 2026, 10:15 WIB',
    timestamp: '1 jam lalu',
    readTime: '3 menit baca',
    views: 8930,
    tags: ['Infrastruktur', 'Jalur Klemuk', 'Lalu Lintas', 'Kota Batu'],
    region: 'Batu'
  },
  {
    id: 'hero-3',
    title: 'Surplus Neraca Dagang Jawa Timur Capai Angka Tertinggi Didorong Sektor Manufaktur Ramah Lingkungan',
    slug: 'surplus-neraca-dagang-jatim-dorong-ekonomi-manufaktur',
    category: 'Ekonomi',
    categorySlug: 'ekonomi',
    categoryColor: '#16a34a',
    summary: 'Bank Indonesia perwakilan Jatim mencatatkan pertumbuhan transaksi ekspor produk olahan makanan dan komponen energi hijau naik 14,2 persen.',
    content: [
      'Kinerja perdagangan luar negeri kawasan Jawa Timur menunjukkan tren penguatan yang kokoh sepanjang semester pertama tahun 2026.',
      'Permintaan global untuk produk olahan agroindustri dan komponen manufaktur ramah lingkungan menjadi katalis utama pendorong surplus.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=600&auto=format&fit=crop',
    imageCaption: 'Aktivitas logistik dan perkapalan ekspor di Pelabuhan Tanjung Perak. (Foto: BatuTV/Aris)',
    author: {
      name: 'Siti Rahma',
      role: 'Jurnalis Ekonomi',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '26 Agustus 2026, 09:30 WIB',
    timestamp: '2 jam lalu',
    readTime: '4 menit baca',
    views: 6410,
    tags: ['Ekonomi Jatim', 'Ekspor', 'Bank Indonesia', 'Neraca Perdagangan'],
    region: 'Jatim'
  },
  {
    id: 'hero-4',
    title: 'PSSI Mantapkan Persiapan Stadion Kanjuruhan untuk Gelaran Turnamen Internasional Usia Muda',
    slug: 'pssi-mantapkan-stadion-kanjuruhan-turnamen-internasional',
    category: 'Olahraga',
    categorySlug: 'olahraga',
    categoryColor: '#0d9488',
    summary: 'Inspeksi menyeluruh terhadap fasilitas rumput hybrid, sistem drainase, dan keamanan penonton berbasis single seat telah memenuhi standar FIFA.',
    content: [
      'Stadion Kanjuruhan yang telah selesai direnovasi total kini siap menjadi venue pertandingan sepak bola tingkat Asia.',
      'Ketua Umum PSSI bersama perwakilan konfederasi meninjau langsung kesiapan teknologi VAR dan fasilitas broadcast penyiaran langsung.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop',
    imageCaption: 'Stadion megah berstandar internasional di Malang Raya. (Foto: BatuTV Sports)',
    author: {
      name: 'Dian Anggraini',
      role: 'Reporter Olahraga',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '26 Agustus 2026, 08:45 WIB',
    timestamp: '3 jam lalu',
    readTime: '3 menit baca',
    views: 11200,
    tags: ['Kanjuruhan', 'Sepak Bola', 'PSSI', 'Stadion'],
    region: 'Malang'
  },
  {
    id: 'hero-5',
    title: 'DPR & Pemerintah Sepakati RUU Perlindungan Data Pribadi Versi Penyempurnaan untuk Kuatkan Keamanan Siber',
    slug: 'dpr-sepakati-ruu-perlindungan-data-pribadi-keamanan-siber',
    category: 'Nasional',
    categorySlug: 'nasional',
    categoryColor: '#dc2626',
    summary: 'Regulasi baru menegaskan sanksi administratif dan pidana bagi kebocoran data institusi publik serta mewajibkan audit sistem keamanan berkala.',
    content: [
      'Komisi I DPR RI bersama kementerian terkait mengesahkan naskah final undang-undang penguatan tata kelola ruang siber nasional.',
      'Lembaga independen pengawas perlindungan data akan memiliki otoritas penuh untuk menindak pelanggaran kepatuhan digital.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=600&auto=format&fit=crop',
    imageCaption: 'Gedung DPR RI saat rapat paripurna pembahasan regulasi. (Foto: Dok. BatuTV Jakarta)',
    author: {
      name: 'Ahmad Fauzi',
      role: 'Koresponden Nasional',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '26 Agustus 2026, 08:10 WIB',
    timestamp: '4 jam lalu',
    readTime: '4 menit baca',
    views: 7850,
    tags: ['DPR RI', 'Politik', 'Keamanan Siber', 'Nasional'],
    region: 'Nasional'
  }
];

export const allNewsArticles: NewsArticle[] = [
  heroLeadArticle,
  ...heroCompanionArticles,
  {
    id: 'art-6',
    title: 'Wisata Edukasi Geologi Coban Talun Hadirkan Wahana Eksplorasi Alam Berbasis Augmented Reality',
    slug: 'wisata-edukasi-geologi-coban-talun-hadirkan-ar',
    category: 'Pariwisata',
    categorySlug: 'pariwisata',
    categoryColor: '#ea580c',
    summary: 'Pengunjung kini dapat mempelajari formasi batuan vulkanik lereng Gunung Arjuno-Welirang menggunakan kacamata interaktif berteknologi tinggi.',
    content: [
      'Kawasan wisata alam Coban Talun di Desa Tulungrejo, Kecamatan Bumiaji kembali menghadirkan inovasi segar.',
      'Melalui kolaborasi pengelola wisata desa dengan perguruan tinggi ternama di Malang Raya, wahana Geo-Park AR resmi beroperasi untuk umum.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?q=80&w=600&auto=format&fit=crop',
    imageCaption: 'Pemandangan air terjun dan perbukitan asri Coban Talun Batu.',
    author: {
      name: 'Maya Putri',
      role: 'Kontributor Wisata',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '26 Agustus 2026, 07:30 WIB',
    timestamp: '4 jam lalu',
    readTime: '3 menit baca',
    views: 5200,
    tags: ['Coban Talun', 'Wisata Batu', 'Augmented Reality', 'Alam'],
    region: 'Batu'
  },
  {
    id: 'art-7',
    title: 'Polres Batu Luncurkan Layanan Patroli Digital Terpadu untuk Tingkatkan Keamanan Kawasan Wisata',
    slug: 'polres-batu-layanan-patroli-digital-terpadu-keamanan',
    category: 'Hukum & Kriminal',
    categorySlug: 'hukum',
    categoryColor: '#7c3aed',
    summary: 'Sistem pengawasan kamera CCTV berbasis analitik AI disiagakan di 45 titik simpul strategis dan objek wisata utama kota.',
    content: [
      'Kepolisian Resor Batu meresmikan pusat komando Command Center Presisi 2.0.',
      'Kapolres Batu menyampaikan bahwa sistem ini mampu mendeteksi potensi kemacetan, respon cepat laporan darurat masyarakat, dan pencegahan tindak kriminalitas.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600&auto=format&fit=crop',
    imageCaption: 'Pusat komando pemantauan lalu lintas dan kamtibmas terpadu.',
    author: {
      name: 'Bayu Wicaksono',
      role: 'Redaktur Pelaksana',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '26 Agustus 2026, 07:00 WIB',
    timestamp: '5 jam lalu',
    readTime: '3 menit baca',
    views: 4300,
    tags: ['Polres Batu', 'Keamanan', 'CCTV Presisi', 'Kota Batu'],
    region: 'Batu'
  },
  {
    id: 'art-8',
    title: 'Menkomdigi Dorong Percepatan Jaringan Internet Cepat Serat Optik Masuk ke Seluruh Desa Lereng Gunung',
    slug: 'menkomdigi-dorong-internet-serat-optik-desa-pegunungan',
    category: 'Teknologi',
    categorySlug: 'teknologi',
    categoryColor: '#4f46e5',
    summary: 'Program desa digital mentargetkan 100 persen balai desa dan sekolah pelosok terhubung internet pita lebar berkecepatan 100 Mbps.',
    content: [
      'Kementerian Komunikasi dan Digital menggulirkan proyek ekspansi konektivitas serat optik di wilayah pedesaan dan sentra agrikultur pegunungan.',
      'Langkah ini diharapkan memicu pertumbuhan e-commerce desa, platform telemedisin, dan sistem pembelajaran digital untuk siswa pedalaman.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    imageCaption: 'Infrastruktur jaringan telekomunikasi pita lebar kecepatan tinggi.',
    author: {
      name: 'Ahmad Fauzi',
      role: 'Jurnalis Teknologi',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '26 Agustus 2026, 06:15 WIB',
    timestamp: '5 jam lalu',
    readTime: '4 menit baca',
    views: 3890,
    tags: ['Teknologi', 'Desa Digital', 'Internet Cepat', 'Komdigi'],
    region: 'Nasional'
  },
  {
    id: 'art-9',
    title: 'Pelaku Usaha Kopi Khas Lereng Panderman & Arjuno Tembus Pasar Kafe Specialty di Tiga Benua',
    slug: 'kopi-khas-lereng-panderman-tembus-pasar-internasional',
    category: 'Ekonomi & Bisnis',
    categorySlug: 'ekonomi',
    categoryColor: '#16a34a',
    summary: 'Cita rasa unik buah kopi fermentasi madu dengan aroma rempah pegunungan kian diminati roastery ternama di Eropa dan Timur Tengah.',
    content: [
      'Komoditas kopi arabika hasil budidaya petani di lereng Gunung Panderman dan Gunung Arjuno kian bersinar di kancah internasional.',
      'Koperasi produsen kopi Kota Batu mencatatkan pengiriman kontainer ketiga tahun ini ke Hamburg, Jerman dan Dubai.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=600&auto=format&fit=crop',
    imageCaption: 'Biji kopi arabika berkualitas tinggi siap disangrai.',
    author: {
      name: 'Siti Rahma',
      role: 'Jurnalis Ekonomi',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '26 Agustus 2026, 05:40 WIB',
    timestamp: '6 jam lalu',
    readTime: '3 menit baca',
    views: 7420,
    tags: ['Kopi Batu', 'UMKM Ekspor', 'Arabika Arjuno', 'Ekonomi'],
    isEditorPick: true,
    region: 'Batu'
  },
  {
    id: 'art-10',
    title: 'Dinkes Kota Batu Gelar Pemeriksaan Kesehatan Gratis & Vaksinasi Booster Jelang Musim Liburan',
    slug: 'dinkes-batu-pemeriksaan-kesehatan-gratis-puskesmas',
    category: 'Lifestyle & Kuliner',
    categorySlug: 'lifestyle',
    categoryColor: '#db2777',
    summary: 'Posko pelayanan kesehatan terintegrasi disiagakan di seluruh puskesmas pembantu dan pusat perbelanjaan oleh-oleh.',
    content: [
      'Dinas Kesehatan Kota Batu meluncurkan program jemput bola bertajuk "Keluarga Sehat Kota Wisata".',
      'Warga maupun wisatawan dapat memeriksakan tekanan darah, gula darah, dan konsultasi gizi secara cuma-cuma.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=600&auto=format&fit=crop',
    imageCaption: 'Pelayanan pemeriksaan kesehatan masyarakat oleh tenaga medis.',
    author: {
      name: 'Maya Putri',
      role: 'Jurnalis Kesehatan',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '25 Agustus 2026, 21:15 WIB',
    timestamp: '14 jam lalu',
    readTime: '3 menit baca',
    views: 3100,
    tags: ['Kesehatan', 'Dinkes Batu', 'Layanan Publik', 'Batu Sehat'],
    region: 'Batu'
  },
  {
    id: 'art-11',
    title: 'Klub Sepak Bola Asal Malang Matangkan Formasi Taktik Jelang Derby Jawa Timur Akhir Pekan',
    slug: 'klub-sepak-bola-malang-matangkan-formasi-derby-jatim',
    category: 'Olahraga',
    categorySlug: 'olahraga',
    categoryColor: '#0d9488',
    summary: 'Pelatih kepala menginstruksikan transisi cepat serangan balik dan pressing ketat di lini tengah guna mengamankan poin penuh.',
    content: [
      'Sesi latihan tertutup di kompleks olahraga Kusuma Agro Batu difokuskan pada pemulihan kebugaran fisik dan simulasi set-piece bola mati.',
      'Kapten tim optimis meraih hasil maksimal di hadapan puluhan ribu pendukung setia.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop',
    imageCaption: 'Aksi intensif latihan tim di lapangan berkabut sejuk Kota Batu.',
    author: {
      name: 'Dian Anggraini',
      role: 'Reporter Olahraga',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '25 Agustus 2026, 19:50 WIB',
    timestamp: '16 jam lalu',
    readTime: '3 menit baca',
    views: 9540,
    tags: ['Sepak Bola', 'Derby Jatim', 'Liga 1', 'Olahraga'],
    region: 'Malang'
  },
  {
    id: 'art-12',
    title: 'Pesona Kuliner Legendaris Pos Ketan dan Susu Segar Alun-Alun Batu Selalu Ramai Diburu Pelancong',
    slug: 'pesona-kuliner-legendaris-pos-ketan-alun-alun-batu',
    category: 'Lifestyle & Kuliner',
    categorySlug: 'lifestyle',
    categoryColor: '#db2777',
    summary: 'Perpaduan ketan gurih dengan aneka topping durian, nangka, dan keju parut tetap menjadi ikon malam yang tak tergantikan.',
    content: [
      'Menikmati suasana sejuk malam hari di Alun-Alun Kota Batu belum lengkap rasanya tanpa singgah di deretan kedai ketan legendaris.',
      'Pengelola wisata mencatat lebih dari seribu porsi ludes terjual setiap malam akhir pekan.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop',
    imageCaption: 'Suasana santap kuliner malam khas Kota Batu.',
    author: {
      name: 'Maya Putri',
      role: 'Kontributor Kuliner',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '25 Agustus 2026, 18:30 WIB',
    timestamp: '17 jam lalu',
    readTime: '3 menit baca',
    views: 8200,
    tags: ['Kuliner Batu', 'Ketan Legendaris', 'Alun-Alun', 'Wisata Malam'],
    isEditorPick: true,
    region: 'Batu'
  },
  {
    id: 'art-13',
    title: 'Kejaksaan Negeri Kota Batu Tuntaskan Restorative Justice untuk Perkara Ringan Masyarakat Pedesaan',
    slug: 'kejari-batu-tuntaskan-restorative-justice-masyarakat',
    category: 'Hukum & Kriminal',
    categorySlug: 'hukum',
    categoryColor: '#7c3aed',
    summary: 'Pendekatan musyawarah mufakat dan pemulihan keadilan sosial dikedepankan dengan melibatkan tokoh adat serta aparat desa.',
    content: [
      'Rumah Restorative Justice yang dibentuk Kejaksaan Negeri Batu kembali membuktikan efektivitas penyelesaian sengketa berbasis kekeluargaan.',
      'Kedua belah pihak bersepakat berdamai tanpa perlu melanjutkan proses ke meja pengadilan formal.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop',
    imageCaption: 'Palu sidang dan lambang keadilan hukum di ruang mediasi terpadu.',
    author: {
      name: 'Rian Pratama',
      role: 'Jurnalis Hukum',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '25 Agustus 2026, 17:10 WIB',
    timestamp: '18 jam lalu',
    readTime: '3 menit baca',
    views: 2980,
    tags: ['Kejaksaan', 'Hukum', 'Restorative Justice', 'Batu'],
    region: 'Batu'
  },
  {
    id: 'art-14',
    title: 'Inovasi Panel Surya Apung di Waduk Selorejo Pasok Listrik Bersih bagi Ribuan Rumah Tangga',
    slug: 'panel-surya-apung-waduk-selorejo-pasok-listrik-bersih',
    category: 'Teknologi & Sains',
    categorySlug: 'teknologi',
    categoryColor: '#4f46e5',
    summary: 'Pembangkit listrik tenaga surya terapung berkapasitas 35 Megawatt Peak resmi beroperasi secara komersial.',
    content: [
      'Transisi energi hijau di kawasan Jawa Timur memasuki babak baru dengan peresmian PLTS terapung di waduk Selorejo.',
      'Sistem fotovoltaik terapung ini memanfaatkan efek pendinginan air waduk yang meningkatkan efisiensi modul hingga 10 persen lebih tinggi dibanding di darat.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=600&auto=format&fit=crop',
    imageCaption: 'Instalasi panel surya ramah lingkungan di permukaan air waduk.',
    author: {
      name: 'Ahmad Fauzi',
      role: 'Jurnalis Sains',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '25 Agustus 2026, 15:45 WIB',
    timestamp: '20 jam lalu',
    readTime: '4 menit baca',
    views: 4620,
    tags: ['Energi Bersih', 'PLTS Terapung', 'Jatim Hijau', 'Inovasi'],
    region: 'Jatim'
  },
  {
    id: 'art-15',
    title: 'Ratusan Seniman Tradisional Meriahkan Parade Bantengan Agung di Sepanjang Jalan Panglima Sudirman',
    slug: 'parade-bantengan-agung-meriahkan-kota-batu',
    category: 'Pariwisata & Budaya',
    categorySlug: 'pariwisata',
    categoryColor: '#ea580c',
    summary: 'Atraksi seni tari bantengan yang sarat nilai filosofis dan kesaktian leluhur memukau ribuan warga dan wisatawan mancanegara.',
    content: [
      'Gema tabuhan kendang, gamelan, dan pecut sakti membahana di sepanjang jalan protokol Kota Batu dalam gelaran tahunan Parade Bantengan Nuswantara.',
      'Ketua Dewan Kesenian Kota Batu menyatakan kegiatan ini menjadi bukti nyata generasi muda tetap antusias melestarikan warisan adiluhung nenek moyang.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=600&auto=format&fit=crop',
    imageCaption: 'Semarak parade kesenian tradisional khas Malang Raya dan Kota Batu.',
    author: {
      name: 'Bayu Wicaksono',
      role: 'Redaktur Budaya',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '25 Agustus 2026, 14:00 WIB',
    timestamp: '21 jam lalu',
    readTime: '3 menit baca',
    views: 12450,
    tags: ['Bantengan', 'Budaya Jawa', 'Festival Seni', 'Kota Batu'],
    isEditorPick: true,
    region: 'Batu'
  },
  {
    id: 'art-16',
    title: 'Disperindag Jatim Gelar Bazar Murah Sembako Serentak di 10 Titik Pasar Tradisional',
    slug: 'bazar-murah-sembako-disperindag-stabilkan-harga',
    category: 'Ekonomi & Bisnis',
    categorySlug: 'ekonomi',
    categoryColor: '#16a34a',
    summary: 'Minyak goreng, beras premium, dan gula pasir dijual dengan potongan harga subsidi 30 persen untuk menjaga daya beli masyarakat.',
    content: [
      'Menyikapi fluktuasi harga komoditas pangan pokok, Dinas Perindustrian dan Perdagangan bersama Bulog menggelar operasi pasar murah.',
      'Antusiasme warga terlihat tinggi sejak pagi hari dengan sistem kupon tertib dan pembayaran non-tunai QRIS.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop',
    imageCaption: 'Aktivitas distribusi kebutuhan pokok di pasar rakyat.',
    author: {
      name: 'Siti Rahma',
      role: 'Jurnalis Ekonomi',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '25 Agustus 2026, 11:30 WIB',
    timestamp: '1 hari lalu',
    readTime: '3 menit baca',
    views: 3820,
    tags: ['Operasi Pasar', 'Sembako Murah', 'Ekonomi', 'Jatim'],
    region: 'Jatim'
  },
  {
    id: 'pop-art-1',
    title: 'Muktamar ke-35 NU: Pemilihan Ketum PBNU Pakai Mekanisme AHWA',
    slug: 'muktamar-ke-35-nu-pemilihan-ketum-pbnu-pakai-mekanisme-ahwa',
    category: 'Nasional',
    categorySlug: 'nasional',
    categoryColor: '#dc2626',
    summary: 'Muktamar ke-35 Nahdlatul Ulama menyepakati penerapan sistem Ahlul Halli wal Aqdi (AHWA) dalam pemilihan Ketua Umum PBNU.',
    content: [
      'Sidang Pleno Muktamar ke-35 Nahdlatul Ulama (NU) resmi menetapkan mekanisme pemilihan Ketua Umum Pengurus Besar Nahdlatul Ulama (PBNU) dan Rais Aam menggunakan sistem Ahlul Halli wal Aqdi (AHWA).',
      'Keputusan musyawarah mufakat ini diambil untuk menjaga marwah kepemimpinan ulama dan mencegah polarisasi politik praktis di tubuh jamiyyah.',
      'Ratusan perwakilan Pengurus Wilayah dan Pengurus Cabang NU dari seluruh pelosok tanah air menyambut baik penetapan tata tertib persidangan muktamar ini.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=800&auto=format&fit=crop',
    imageCaption: 'Suasana pembukaan musyawarah Muktamar ke-35 Nahdlatul Ulama.',
    author: {
      name: 'Ahmad Fauzi',
      role: 'Koresponden Nasional',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '27 Agustus 2026, 08:30 WIB',
    timestamp: '10 jam lalu',
    readTime: '3 menit baca',
    views: 19840,
    tags: ['Muktamar NU', 'PBNU', 'AHWA', 'Nasional', 'Ulama'],
    region: 'Nasional'
  },
  {
    id: 'pop-art-2',
    title: 'Muktamar ke-35 NU Putuskan Hukum Chip Otak hingga Bitcoin',
    slug: 'muktamar-ke-35-nu-putuskan-hukum-chip-otak-hingga-bitcoin',
    category: 'Nasional',
    categorySlug: 'nasional',
    categoryColor: '#dc2626',
    summary: 'Komisi Bahtsul Masail Muktamar NU merilis fatwa fikih kontemporer mengenai pemanfaatan implan cip otak dan aset kripto.',
    content: [
      'Komisi Bahtsul Masail Waqiiyah Muktamar ke-35 NU menuntaskan pembahasan fikih tematik mengenai perkembangan teknologi mutakhir, termasuk pemasangan chip otak Neuralink dan transaksi mata uang digital kripto.',
      'Para kiai dan pakar syariah menekankan pentingnya maslahat kesehatan manusia serta pencegahan gharar (ketidakpastian) dalam transaksi ekonomi digital masa kini.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
    imageCaption: 'Sidang Bahtsul Masail Muktamar ke-35 NU membahas fikih sains dan teknologi.',
    author: {
      name: 'Bayu Wicaksono',
      role: 'Redaktur Pelaksana',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '27 Agustus 2026, 07:45 WIB',
    timestamp: '11 jam lalu',
    readTime: '4 menit baca',
    views: 18450,
    tags: ['Muktamar NU', 'Bahtsul Masail', 'Chip Otak', 'Bitcoin', 'Fikih'],
    region: 'Nasional'
  },
  {
    id: 'pop-art-3',
    title: 'Prabowo Rapat Bareng Menhan-Panglima TNI, Bahas Syarat Suku Dayak Masuk Militer',
    slug: 'prabowo-rapat-bareng-menhan-panglima-tni-bahas-syarat-suku-dayak',
    category: 'Nasional',
    categorySlug: 'nasional',
    categoryColor: '#dc2626',
    summary: 'Pemerintah membahas afirmasi penerimaan prajurit TNI dari putra daerah dan masyarakat adat di wilayah perbatasan IKN Nusantara.',
    content: [
      'Presiden Prabowo Subianto memimpin rapat terbatas bersama Menteri Pertahanan, Panglima TNI, dan Kepala Staf Angkatan guna membahas kebijakan afirmasi rekrutmen prajurit TNI bagi pemuda suku Dayak di Kalimantan.',
      'Kebijakan ini bertujuan memperkuat ketahanan wilayah perbatasan dan memberikan kesempatan pengabdian seluas-luasnya bagi putra-putri masyarakat adat.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=800&auto=format&fit=crop',
    imageCaption: 'Rapat koordinasi pertahanan negara di Istana Kepresidenan.',
    author: {
      name: 'Ahmad Fauzi',
      role: 'Koresponden Nasional',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '27 Agustus 2026, 12:15 WIB',
    timestamp: '5 jam lalu',
    readTime: '3 menit baca',
    views: 16900,
    tags: ['Prabowo', 'TNI', 'Suku Dayak', 'Pertahanan', 'IKN'],
    region: 'Nasional'
  },
  {
    id: 'pop-art-4',
    title: 'Muktamar NU: Rais Aam dan Ketum PBNU Dilarang Rangkap Jabatan Publik',
    slug: 'muktamar-nu-rais-aam-dan-ketum-pbnu-dilarang-rangkap-jabatan-publik',
    category: 'Nasional',
    categorySlug: 'nasional',
    categoryColor: '#dc2626',
    summary: 'Ketentuan baru AD/ART Muktamar NU menegaskan independensi jamiyyah dengan melarang pimpinan puncak merangkap jabatan di pemerintahan.',
    content: [
      'Guna menjaga khittah 1926 dan independensi jamiyyah, Muktamar ke-35 NU menyetujui klausul larangan rangkap jabatan politik dan jabatan publik strategis bagi Rais Aam serta Ketua Umum Tanfidziyah.',
      'Aturan ini diharapkan memperkuat fokus kepengurusan dalam melayani umat dan memajukan pendidikan serta ekonomi warga Nahdliyin.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop',
    imageCaption: 'Sidang komisi organisasi Muktamar ke-35 NU.',
    author: {
      name: 'Dian Anggraini',
      role: 'Jurnalis Politik',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '27 Agustus 2026, 11:30 WIB',
    timestamp: '6 jam lalu',
    readTime: '3 menit baca',
    views: 15320,
    tags: ['Muktamar NU', 'PBNU', 'Khittah', 'Organisasi'],
    region: 'Nasional'
  },
  {
    id: 'pop-art-5',
    title: '10 Besar Klub Eropa dengan Tagihan Gaji Tertinggi, Real Madrid di Puncak',
    slug: '10-besar-klub-eropa-dengan-tagihan-gaji-tertinggi-real-madrid-di-puncak',
    category: 'Olahraga',
    categorySlug: 'olahraga',
    categoryColor: '#0d9488',
    summary: 'Laporan finansial UEFA menempatkan raksasa La Liga Real Madrid sebagai klub dengan beban pengeluaran upah pemain tertinggi di benua biru.',
    content: [
      'UEFA merilis laporan tolok ukur keuangan klub Eropa musim 2025/2026. Real Madrid memimpin daftar dengan total tagihan gaji tahunan mencapai lebih dari 500 juta euro menyusul kedatangan sederet bintang dunia.',
      'Klub-klub Premier League seperti Manchester City, Arsenal, dan Chelsea juga mendominasi deretan sepuluh besar.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
    imageCaption: 'Stadion Santiago Bernabeu dan pertandingan sepak bola Eropa.',
    author: {
      name: 'Rian Pratama',
      role: 'Reporter Olahraga',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '27 Agustus 2026, 10:20 WIB',
    timestamp: '7 jam lalu',
    readTime: '4 menit baca',
    views: 14100,
    tags: ['Sepak Bola', 'Real Madrid', 'Gaji Pemain', 'UEFA', 'Olahraga'],
    region: 'Nasional'
  },
  {
    id: 'pop-art-6',
    title: 'Cerita Warga NTT Bertahan Hidup di Tengah Gempa Susulan',
    slug: 'cerita-warga-ntt-bertahan-hidup-di-tengah-gempa-susulan',
    category: 'Nasional',
    categorySlug: 'nasional',
    categoryColor: '#dc2626',
    summary: 'Kisah perjuangan warga di pengungsian pascagempa bumi yang mengguncang sejumlah wilayah di Nusa Tenggara Timur.',
    content: [
      'Warga di sejumlah desa terdampak gempa bumi di Nusa Tenggara Timur memilih tetap bertahan di tenda-tenda darurat menyusul serangkaian gempa susulan.',
      'Petugas gabungan BNPB, TNI-Polri, dan relawan kemanusiaan terus mendistribusikan logistik, tenda keluarga, serta obat-obatan ke lokasi-lokasi terisolir.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=800&auto=format&fit=crop',
    imageCaption: 'Tenda pengungsian darurat warga terdampak gempa bumi di NTT.',
    author: {
      name: 'Ahmad Fauzi',
      role: 'Koresponden Nasional',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '27 Agustus 2026, 09:15 WIB',
    timestamp: '8 jam lalu',
    readTime: '3 menit baca',
    views: 13800,
    tags: ['Gempa NTT', 'Bencana Alam', 'Pengungsian', 'Kemanusiaan'],
    region: 'Nasional'
  },
  {
    id: 'pop-art-7',
    title: 'Muktamar NU Desak Koperasi Desa Merah Putih Dievaluasi',
    slug: 'muktamar-nu-desak-koperasi-desa-merah-putih-dievaluasi',
    category: 'Ekonomi',
    categorySlug: 'ekonomi',
    categoryColor: '#059669',
    summary: 'Komisi Ekonomi Muktamar ke-35 NU merekomendasikan evaluasi menyeluruh terhadap tata kelola Koperasi Desa demi kesejahteraan petani.',
    content: [
      'Komisi Rekomendasi Ekonomi Muktamar ke-35 NU menyoroti efektivitas program kemitraan Koperasi Desa Merah Putih dan meminta perbaikan transparansi manajemen permodalan.',
      'Umat mendorong penguatan ekosistem ekonomi mikro berbasis pesantren dan kelompok tani mandiri.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?q=80&w=800&auto=format&fit=crop',
    imageCaption: 'Pembahasan komisi ekonomi umat di Muktamar NU.',
    author: {
      name: 'Maya Putri',
      role: 'Jurnalis Ekonomi',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '27 Agustus 2026, 08:50 WIB',
    timestamp: '9 jam lalu',
    readTime: '3 menit baca',
    views: 12900,
    tags: ['Muktamar NU', 'Koperasi Desa', 'Ekonomi Syariah', 'Pertanian'],
    region: 'Nasional'
  },
  {
    id: 'pop-art-8',
    title: 'BPJS Ketenagakerjaan Salurkan Bantuan untuk Korban Gempa NTT, Wujud Nyata Kepedulian',
    slug: 'bpjs-ketenagakerjaan-salurkan-bantuan-untuk-korban-gempa-ntt-wujud-nyata-kepedulian',
    category: 'Sosial',
    categorySlug: 'sosial',
    categoryColor: '#2563eb',
    summary: 'Sebagai bagian dari Tanggung Jawab Sosial dan Lingkungan (TJSL), BPJS Ketenagakerjaan menyalurkan paket bantuan sembako dan perlengkapan medis.',
    content: [
      'BPJS Ketenagakerjaan menyalurkan ratusan paket bantuan logistik darurat kepada masyarakat korban gempa bumi di Nusa Tenggara Timur.',
      'Bantuan ini diserahkan langsung oleh perwakilan kantor wilayah bersama dinas sosial setempat untuk mempercepat pemulihan ekonomi keluarga korban.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop',
    imageCaption: 'Penyerahan bantuan kemanusiaan bagi warga terdampak gempa di NTT.',
    author: {
      name: 'Dian Anggraini',
      role: 'Redaktur Sosial',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '27 Agustus 2026, 08:30 WIB',
    timestamp: '9 jam lalu',
    readTime: '3 menit baca',
    views: 11850,
    tags: ['BPJS Ketenagakerjaan', 'Gempa NTT', 'TJSL', 'Bantuan Sosial'],
    region: 'Nasional'
  },
  {
    id: 'pop-art-9',
    title: 'BYON Combat Showbiz 8: Jeka Saragih Tumbang di Ronde Pertama, Ammarul Raih Sabuk',
    slug: 'byon-combat-showbiz-8-jeka-saragih-tumbang-di-ronde-pertama-ammarul-raih-sabuk',
    category: 'Olahraga',
    categorySlug: 'olahraga',
    categoryColor: '#0d9488',
    summary: 'Duel sengit di atas ring BYON Combat Showbiz 8 menyuguhkan kejutan besar dengan kemenangan knock-out cepat.',
    content: [
      'Ajang tarung bergengsi BYON Combat Showbiz 8 yang digelar di Tennis Indoor Senayan Jakarta berakhir dengan drama menegangkan pada partai utama.',
      'Ammarul sukses merebut sabuk juara setelah melancarkan hook telak yang menumbangkan lawannya di pengujung ronde pertama.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=800&auto=format&fit=crop',
    imageCaption: 'Pertarungan sengit di ring BYON Combat Showbiz 8.',
    author: {
      name: 'Rian Pratama',
      role: 'Reporter Olahraga',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '27 Agustus 2026, 07:15 WIB',
    timestamp: '10 jam lalu',
    readTime: '3 menit baca',
    views: 11200,
    tags: ['BYON Combat', 'Jeka Saragih', 'MMA', 'Tinju', 'Olahraga'],
    region: 'Nasional'
  },
  {
    id: 'pop-art-10',
    title: 'Harga Emas Antam Sepekan: Sempat Meroket, Mendadak Anjlok Parah',
    slug: 'harga-emas-antam-sepekan-sempat-meroket-mendadak-anjlok-parah',
    category: 'Bisnis',
    categorySlug: 'bisnis',
    categoryColor: '#d97706',
    summary: 'Fluktuasi harga komoditas logam mulia Antam sepekan terakhir dipengaruhi oleh pergerakan suku bunga The Fed dan kurs rupiah.',
    content: [
      'Harga emas batangan PT Aneka Tambang Tbk (Antam) mengalami volatilitas tajam dalam sepekan terakhir setelah sempat menyentuh rekor tertinggi sepanjang sejarah.',
      'Pengamat pasar modal menyarankan investor ritel untuk tetap mencermati momentum buyback dan menggunakan strategi dollar-cost averaging dalam jangka panjang.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=800&auto=format&fit=crop',
    imageCaption: 'Grafik dan batangan emas mulia Antam.',
    author: {
      name: 'Maya Putri',
      role: 'Jurnalis Ekonomi',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop'
    },
    publishedAt: '27 Agustus 2026, 07:00 WIB',
    timestamp: '10 jam lalu',
    readTime: '3 menit baca',
    views: 10600,
    tags: ['Harga Emas', 'Antam', 'Investasi', 'Keuangan', 'Bisnis'],
    region: 'Nasional'
  }
];

export const trendingRankingArticles: NewsArticle[] = [
  {
    ...heroLeadArticle,
    ranking: 1,
    views: 18450
  },
  {
    ...heroCompanionArticles[2], // Kanjuruhan
    ranking: 2,
    views: 15900
  },
  {
    ...allNewsArticles[13], // Parade Bantengan
    ranking: 3,
    views: 12450
  },
  {
    ...heroCompanionArticles[0], // Jalur Klemuk
    ranking: 4,
    views: 9830
  },
  {
    ...allNewsArticles[8], // Kopi Panderman
    ranking: 5,
    views: 8720
  }
];

export const videoNewsData: VideoNews[] = [
  {
    id: 'vid-1',
    title: 'LIVE REPORT: Suasana Pembukaan Festival Agropolitan & Apel Nusantara di Kota Batu',
    category: 'Liputan Khusus',
    duration: '08:42',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?q=80&w=800&auto=format&fit=crop',
    videoEmbedId: 'dummy-video-1',
    publishedAt: '26 Agustus 2026',
    views: 24500,
    presenter: 'Bayu Wicaksono',
    program: 'BatuTV Siang',
    description: 'Liputan langsung suasana kemeriahan stan pameran teknologi hortikultura dan wawancara eksklusif bersama Wali Kota Batu.'
  },
  {
    id: 'vid-2',
    title: 'Eksklusif Dialog: Menatap Masa Depan Agrowisata Berkelanjutan di Lereng Gunung Arjuno',
    category: 'Dialog Khusus',
    duration: '24:15',
    thumbnailUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop',
    videoEmbedId: 'dummy-video-2',
    publishedAt: '25 Agustus 2026',
    views: 18200,
    presenter: 'Dian Anggraini',
    program: 'Suara Parlemen',
    description: 'Diskusi mendalam bersama pakar tata ruang dan penggiat lingkungan mengenai konservasi sumber mata air dan perlindungan lahan hijau.'
  },
  {
    id: 'vid-3',
    title: 'Jelajah Rasa: Rahasia Resep Ketan Durian Legendaris yang Bertahan Sejak 1967',
    category: 'Ragam Budaya',
    duration: '12:08',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop',
    videoEmbedId: 'dummy-video-3',
    publishedAt: '25 Agustus 2026',
    views: 31400,
    presenter: 'Maya Putri',
    program: 'Jelajah Kuliner',
    description: 'Menelusuri kelezatan kuliner malam khas Alun-Alun Batu yang memikat lidah jutaan wisatawan setiap tahunnya.'
  },
  {
    id: 'vid-4',
    title: 'Ulasan Olahraga: Taktik & Formasi Singo Edan Hadapi Lawan Berat di Laga Kandang',
    category: 'BatuTV Sports',
    duration: '15:30',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
    videoEmbedId: 'dummy-video-4',
    publishedAt: '24 Agustus 2026',
    views: 42100,
    presenter: 'Rian Pratama',
    program: 'Zona Bola',
    description: 'Analisis mendalam kekuatan lini tengah, kondisi fisik pemain kunci, dan prediksi jalannya pertandingan big match.'
  }
];

export const regionalBatuArticles = allNewsArticles.filter(a => a.region === 'Batu');
export const editorPickArticles = allNewsArticles.filter(a => a.isEditorPick);
