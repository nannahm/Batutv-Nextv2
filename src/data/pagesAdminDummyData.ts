import { AdminPage } from '../types/admin';

export const initialAdminPagesData: AdminPage[] = [
  {
    id: 'page-1',
    title: 'Tentang Kami',
    slug: 'tentang-kami',
    excerpt: 'Profil perusahaan BatuTV, visi misi, sejarah singkat, dan dedikasi dalam menghadirkan jurnalisme terpercaya untuk Malang Raya dan Indonesia.',
    content: `
<p>Pada mulanya adalah kehendak menjangkau khalayak lebih luas. Sebuah televisi berita dan media digital, BatuTV memiliki banyak video peristiwa terbaru, telah disampaikan lebih cepat di layar kaca maupun kanal daring -- yang membuatnya ada di <em>top of mind</em> khalayak luas, lalu memerlukan kanal untuk menampung kabar bagi pemirsanya selama 24 jam.</p>

<p>Namun, dalam perkembangannya, kami bertumbuh lebih cepat dari yang kami bayangkan. Kami dituntut untuk terus memperbarui informasi yang kami sajikan, berpacu dengan "banjir bandang" informasi dari media sosial. Kami lalu fokus menjadi portal berita yang menampilkan berbagai peristiwa paling aktual dengan cepat, dikemas dengan lengkap dan akurat.</p>

<p>Jurnalisme adalah disiplin verifikasi. Karena itu kami terus merekrut jurnalis muda untuk mengembangkan liputan dengan terjun langsung ke lapangan, menemui narasumber, menulis reportase, menyajikan produk jurnalisme yang segar untuk mengisi kanal-kanal kami yang semakin beragam.</p>

<p>Gaya jurnalisme kami lugas, apa adanya, namun tetap "netral" dan tidak tendensius. Kami menggunakan bahasa yang hidup, plastis, tidak bertabur eufimisme. Dengan gaya ini kami melayani konsumen muda pembaca kami -- yang jumlahnya semakin membesar, yang secara serentak mengakses informasi dari berbagai platform, sejak desktop, laptop, hingga gadget.</p>

<h2>Visi dan Misi Kami</h2>
<p>Sebagai salah satu pelopor stasiun televisi dan media siber lokal yang berwawasan nasional di kawasan Malang Raya dan Jawa Timur, BatuTV memegang teguh komitmen keterbukaan dan integritas informasi publik.</p>

<ul>
  <li><strong>Menyajikan Berita Terverifikasi:</strong> Mengutamakan akurasi fakta di atas sekadar kecepatan klik (anti-clickbait).</li>
  <li><strong>Mendorong Kemajuan Daerah:</strong> Menjadi wadah aspirasi warga Kota Batu, Malang Raya, serta representasi isu daerah di kancah nasional.</li>
  <li><strong>Edukasi dan Literasi Digital:</strong> Menyajikan ulasan mendalam, infografis, dan video investigasi yang mencerahkan masyarakat.</li>
</ul>

<h2>Komitmen Independensi</h2>
<p>BatuTV beroperasi secara independen di bawah naungan PT Batu Televisi Indonesia. Setiap produk jurnalistik yang diterbitkan tunduk pada Undang-Undang Pers No. 40 Tahun 1999 dan Kode Etik Jurnalistik Dewan Pers.</p>
`.trim(),
    status: 'published',
    seoTitle: 'Tentang Kami | Profil & Komitmen Redaksi BatuTV',
    metaDescription: 'Informasi mengenai BatuTV, profil perusahaan, visi misi, dan komitmen dalam menyajikan berita terpercaya, aktual, dan berimbang untuk masyarakat Indonesia.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    createdAt: '2025-01-10T08:00:00.000Z',
    updatedAt: '2026-08-20T10:15:00.000Z',
    publishedAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'page-2',
    title: 'Kontak Kami',
    slug: 'kontak-kami',
    excerpt: 'Informasi alamat kantor redaksi BatuTV, nomor telepon, email redaksi, pengaduan pemberitaan, dan kerja sama liputan.',
    content: `
<p>Kami senantiasa terbuka untuk menerima masukan, saran, kerja sama kemitraan, undangan liputan, serta pengaduan masyarakat seputar pemberitaan yang kami tayangkan di portal maupun siaran televisi BatuTV.</p>

<h2>Alamat Kantor Redaksi & Studio</h2>
<p><strong>Gedung Graha BatuTV</strong><br />
Jl. Ir. Soekarno No. 112, Beji, Kec. Junrejo, Kota Batu, Jawa Timur 65326<br />
Indonesia</p>

<h2>Layanan Komunikasi & Redaksi</h2>
<ul>
  <li><strong>Telepon Kantor:</strong> (0341) 123456 / (0341) 591234</li>
  <li><strong>Hotline WhatsApp Redaksi:</strong> +62 812-3456-7890 (Khusus Pesan & Pengaduan Warga)</li>
  <li><strong>Email Redaksi:</strong> <a href="mailto:redaksi@batutv.com">redaksi@batutv.com</a></li>
  <li><strong>Email Iklan & Kemitraan:</strong> <a href="mailto:iklan@batutv.com">iklan@batutv.com</a></li>
  <li><strong>Email Manajemen:</strong> <a href="mailto:info@batutv.com">info@batutv.com</a></li>
</ul>

<h2>Jam Operasional Redaksi</h2>
<p>Newsroom portal daring BatuTV beroperasi 24 jam sehari, 7 hari seminggu. Kantor administrasi dan studio beroperasi setiap hari Senin – Jumat pukul 08.00 – 17.00 WIB.</p>
`.trim(),
    status: 'published',
    seoTitle: 'Kontak Kami | Layanan Redaksi & Kerjasama BatuTV',
    metaDescription: 'Hubungi tim redaksi BatuTV melalui alamat kantor, nomor telepon, hotline WhatsApp pengaduan, dan email resmi kerja sama liputan maupun periklanan.',
    createdAt: '2025-01-10T08:30:00.000Z',
    updatedAt: '2026-08-15T09:00:00.000Z',
    publishedAt: '2025-01-10T08:30:00.000Z',
  },
  {
    id: 'page-3',
    title: 'Info Iklan',
    slug: 'info-iklan',
    excerpt: 'Paket pasang iklan di portal berita BatuTV, banner display ads, artikel advertorial bersponsor, dan slot siaran televisi program sponsor.',
    content: `
<p>BatuTV menghadirkan solusi periklanan dan kemitraan terpadu (Integrated Marketing Solutions) lintas platform: Televisi Terestrial Digital, Portal Berita Daring (Web & Mobile), Kanal YouTube Resmi, serta Media Sosial dengan jangkauan puluhan ribu audiens aktif setiap harinya.</p>

<h2>Pilihan Format Periklanan Digital</h2>
<ul>
  <li><strong>Display Banner Ads:</strong> Leaderboard Top Banner (970x90), Sticky Header, Sidebar Half Page (300x600), dan In-Article Rectangle (300x250).</li>
  <li><strong>Native & Advertorial Article:</strong> Artikel ulasan produk, rilis perusahaan, atau profil instansi dengan penandaan jelas <em>"Sponsored Content"</em>.</li>
  <li><strong>Video In-Stream & YouTube Sponsorship:</strong> Slot iklan bumper, sponsor segmen program video berita, atau talkshow eksklusif.</li>
  <li><strong>Social Media Amplification:</strong> Distribusi konten kreatif di akun resmi Instagram, TikTok, dan Facebook BatuTV.</li>
</ul>

<h2>Hubungi Tim Pemasaran & Kerjasama</h2>
<p>Untuk mendapatkan proposal media kit resmi, rate card harga terbaru, dan konsultasi strategi kampanye bisnis Anda, silakan hubungi tim marketing kami:</p>
<p>Email: <a href="mailto:iklan@batutv.com">iklan@batutv.com</a><br />
WhatsApp Business: +62 811-9876-5432</p>
`.trim(),
    status: 'published',
    seoTitle: 'Info Iklan & Kerjasama Media | Pasang Iklan di BatuTV',
    metaDescription: 'Layanan pemasangan iklan banner, artikel advertorial, dan sponsor siaran televisi BatuTV dengan jangkauan luas di Malang Raya dan seluruh Indonesia.',
    createdAt: '2025-01-11T09:00:00.000Z',
    updatedAt: '2026-07-30T14:20:00.000Z',
    publishedAt: '2025-01-11T09:00:00.000Z',
  },
  {
    id: 'page-4',
    title: 'Pedoman Media Siber',
    slug: 'pedoman-media-siber',
    excerpt: 'Pedoman Pemberitaan Media Siber sesuai ketetapan Dewan Pers Nomor: 1/Peraturan-DP/III/2012 untuk menjamin kemerdekaan pers yang bertanggung jawab.',
    content: `
<p>Kemerdekaan berpendapat, kemerdekaan berekspresi, dan kemerdekaan pers adalah hak asasi manusia yang dilindungi Pancasila, Undang-Undang Dasar 1945, dan Deklarasi Universal Hak Asasi Manusia PBB. Keberadaan media siber di Indonesia juga merupakan bagian dari kemerdekaan berpendapat, kemerdekaan berekspresi, dan kemerdekaan pers.</p>

<p>Media siber memiliki karakter khusus sehingga memerlukan pedoman agar pengelolaannya dapat dilaksanakan secara profesional, memenuhi fungsi, hak, dan kewajibannya sesuai Undang-Undang Nomor 40 Tahun 1999 tentang Pers dan Kode Etik Jurnalistik. Untuk itu Dewan Pers bersama organisasi pers, pengelola media siber, dan masyarakat menyusun Pedoman Pemberitaan Media Siber sebagai berikut:</p>

<h2>1. Ruang Lingkup</h2>
<p>Media Siber adalah segala bentuk media yang menggunakan wahana internet dan melaksanakan kegiatan jurnalistik, serta memenuhi persyaratan Undang-Undang Pers dan Standar Perusahaan Pers yang ditetapkan Dewan Pers. Isi Buatan Pengguna (User Generated Content) adalah segala isi yang dibuat dan atau dipublikasikan oleh pengguna media siber, antara lain artikel, gambar, komentar, suara, video dan berbagai bentuk unggahan yang melekat pada media siber.</p>

<h2>2. Verifikasi dan Keberimbangan Berita</h2>
<p>Pada prinsipnya setiap berita harus melalui verifikasi. Berita yang dapat merugikan pihak lain memerlukan verifikasi pada berita yang sama untuk memenuhi prinsip akurasi dan keberimbangan.</p>

<h2>3. Isi Buatan Pengguna (User Generated Content)</h2>
<p>Media siber wajib mencantumkan syarat dan ketentuan mengenai Isi Buatan Pengguna yang tidak bertentangan dengan Undang-Undang No. 40 tahun 1999 tentang Pers dan Kode Etik Jurnalistik, yang ditempatkan secara terang dan jelas.</p>

<h2>4. Ralat, Koreksi, dan Hak Jawab</h2>
<p>Ralat, koreksi, dan hak jawab mengacu pada Undang-Undang Pers, Kode Etik Jurnalistik, dan Pedoman Hak Jawab yang ditetapkan Dewan Pers. Ralat, koreksi dan atau hak jawab wajib ditautkan pada berita yang diralat, dikoreksi atau yang diberi hak jawab.</p>

<h2>5. Pencabutan Berita</h2>
<p>Berita yang sudah dipublikasikan tidak dapat dicabut karena alasan penyensoran dari pihak luar redaksi, kecuali terkait masalah SARA, kesusilaan, masa depan anak, pengalaman traumatik korban atau berdasarkan pertimbangan khusus lain yang ditetapkan Dewan Pers.</p>
`.trim(),
    status: 'published',
    seoTitle: 'Pedoman Pemberitaan Media Siber | Dewan Pers - BatuTV',
    metaDescription: 'Pedoman resmi pemberitaan media siber yang diterapkan oleh redaksi BatuTV sesuai ketentuan dan standar etik Dewan Pers Republik Indonesia.',
    createdAt: '2025-01-11T10:00:00.000Z',
    updatedAt: '2026-08-01T11:00:00.000Z',
    publishedAt: '2025-01-11T10:00:00.000Z',
  },
  {
    id: 'page-5',
    title: 'Panduan Kebijakan',
    slug: 'panduan-kebijakan',
    excerpt: 'Panduan operasional, etika jurnalistik liputan, kebijakan moderasi kolom komentar, serta standar perlindungan privasi narasumber.',
    content: `
<p>Panduan Kebijakan ini merupakan dokumen internal dan panduan publik yang menjelaskan bagaimana redaksi BatuTV mengambil keputusan editorial, memverifikasi narasumber, dan menjaga standar kualitas pemberitaan.</p>

<h2>Standar Jurnalisme & Kode Etik</h2>
<p>Seluruh jurnalis, juru kamera, editor, dan staf redaksi BatuTV dilarang keras menerima suap, gratifikasi, fasilitas istimewa, atau imbalan dalam bentuk apa pun yang dapat memengaruhi objektivitas narasumber dan independensi berita.</p>

<h2>Kebijakan Ralat & Hak Jawab</h2>
<p>Apabila terdapat kekeliruan data atau fakta pada berita yang telah terbit, pembaca berhak mengajukan sanggahan dan permintaan ralat dengan melampirkan bukti autentik ke alamat email <a href="mailto:redaksi@batutv.com">redaksi@batutv.com</a>. Kami akan memproses koreksi dalam waktu maksimal 1x24 jam.</p>

<h2>Moderasi Kolom Komentar & Partisipasi Publik</h2>
<p>Kami menyambut baik diskusi cerdas di kanal media kami. Namun, kami berhak menyaring atau menghapus komentar yang mengandung unsur fitnah, ujaran kebencian (hate speech), penistaan SARA, pornografi, maupun tautan promosi spam.</p>
`.trim(),
    status: 'published',
    seoTitle: 'Panduan Kebijakan Editorial & Etika Jurnalisme | BatuTV',
    metaDescription: 'Panduan kebijakan editorial, standar etika kerja jurnalistik, tata cara pengajuan hak jawab, dan aturan partisipasi pembaca portal BatuTV.',
    createdAt: '2025-01-12T09:00:00.000Z',
    updatedAt: '2026-07-25T13:40:00.000Z',
    publishedAt: '2025-01-12T09:00:00.000Z',
  },
  {
    id: 'page-6',
    title: 'Kebijakan Privasi',
    slug: 'kebijakan-privasi',
    excerpt: 'Kebijakan pengumpulan, penggunaan, pengamanan, dan perlindungan data pribadi pengguna saat mengakses situs web dan aplikasi BatuTV.',
    content: `
<p>Kebijakan Privasi ini menjelaskan bagaimana BatuTV mengumpulkan, mengelola, dan melindungi data pribadi Anda saat menggunakan layanan situs web, portal berita, siaran live streaming, dan fitur interaktif kami.</p>

<h2>1. Data yang Kami Kumpulkan</h2>
<p>Kami dapat mencatat informasi non-pribadi seperti jenis peramban (browser), alamat IP, resolusi layar, halaman yang dikunjungi, dan waktu akses untuk tujuan analisis performa situs web dan peningkatan pengalaman pengguna.</p>

<h2>2. Penggunaan Cookie</h2>
<p>Situs kami memanfaatkan teknologi <em>cookie</em> dan <em>local storage</em> untuk mengingat preferensi Anda (seperti ukuran teks, tema gelap/terang, dan artikel yang disimpan di bookmark).</p>

<h2>3. Perlindungan Informasi Pribadi</h2>
<p>BatuTV tidak akan pernah menjual, menyewakan, atau memberikan data pribadi pembaca kepada pihak ketiga tanpa persetujuan eksplisit dari Anda, kecuali diwajibkan oleh putusan pengadilan atau peraturan perundang-undangan Republik Indonesia yang berlaku.</p>

<h2>4. Tautan ke Situs Pihak Ketiga</h2>
<p>Artikel kami dapat memuat tautan ke situs web eksternal untuk keperluan referensi. Kami tidak bertanggung jawab atas isi dan kebijakan privasi situs-situs eksternal tersebut.</p>
`.trim(),
    status: 'published',
    seoTitle: 'Kebijakan Privasi | Perlindungan Data Pengguna BatuTV',
    metaDescription: 'Pahami bagaimana BatuTV melindungi data privasi Anda saat mengakses layanan informasi, artikel, dan streaming siaran televisi kami.',
    createdAt: '2025-01-12T10:00:00.000Z',
    updatedAt: '2026-08-10T16:00:00.000Z',
    publishedAt: '2025-01-12T10:00:00.000Z',
  },
  {
    id: 'page-7',
    title: 'Disclaimer',
    slug: 'disclaimer',
    excerpt: 'Pernyataan sanggahan, batasan tanggung jawab hukum terhadap konten, opini penulis kolom, tautan eksternal, dan materi promosi pihak ketiga.',
    content: `
<p>Seluruh materi dan informasi yang dimuat di portal berita BatuTV disajikan untuk tujuan penyebaran informasi umum dan edukasi publik semata dengan iktikad baik.</p>

<h2>1. Keakuratan Informasi</h2>
<p>Redaksi berupaya semaksimal mungkin menyajikan data yang akurat dan terverifikasi. Namun demikian, dinamika peristiwa di lapangan dapat mengubah konteks informasi. BatuTV tidak bertanggung jawab atas kerugian materiil maupun immateriil yang timbul akibat penggunaan informasi dari portal ini tanpa konfirmasi lebih lanjut.</p>

<h2>2. Artikel Opini & Kolom Warga</h2>
<p>Artikel opini, kolom pembaca, atau surat terbuka merupakan pandangan pribadi penulisnya dan tidak serta-merta mencerminkan sikap editorial resmi dari manajemen BatuTV.</p>

<h2>3. Konten Iklan dan Sponsor</h2>
<p>Klaim manfaat produk, garansi, maupun layanan dalam materi promosi iklan komersial sepenuhnya menjadi tanggung jawab pihak pengiklan yang bersangkutan.</p>
`.trim(),
    status: 'published',
    seoTitle: 'Disclaimer & Batasan Tanggung Jawab | BatuTV',
    metaDescription: 'Sanggahan resmi dan batasan tanggung jawab terkait konten, artikel opini pembaca, data pasar, dan materi iklan pada situs berita BatuTV.',
    createdAt: '2025-01-13T11:00:00.000Z',
    updatedAt: '2026-06-18T10:00:00.000Z',
    publishedAt: '2025-01-13T11:00:00.000Z',
  },
  {
    id: 'page-8',
    title: 'Susunan Redaksi',
    slug: 'redaksi',
    excerpt: 'Daftar dewan komisaris, pemimpin redaksi, redaktur pelaksana, produser eksekutif, dan jurnalis peliput PT Batu Televisi Indonesia.',
    content: `
<p>Berikut adalah struktur kepemimpinan dan tim redaksi yang bertugas mengawal mutu jurnalistik siaran televisi dan portal siber BatuTV:</p>

<h2>Dewan Manajemen & Pengarah</h2>
<ul>
  <li><strong>Komisaris Utama:</strong> Ir. H. Bambang Sujarwo, M.Si</li>
  <li><strong>Direktur Utama:</strong> Dr. Hendra Wijaya, S.Sos., M.I.Kom</li>
  <li><strong>Pemimpin Redaksi / Penanggung Jawab:</strong> Muhamad Yandi, M.Si</li>
  <li><strong>Wakil Pemimpin Redaksi:</strong> Ahmad Fauzi, S.I.Kom</li>
</ul>

<h2>Redaktur & Divisi Pemberitaan</h2>
<ul>
  <li><strong>Redaktur Pelaksana:</strong> Hendra Wijaya</li>
  <li><strong>Koordinator Liputan Daerah & Nasional:</strong> Siti Nurhaliza, S.Sos</li>
  <li><strong>Editor Naskah & Bahasa:</strong> Rahmat Hidayat, S.S.</li>
  <li><strong>Produser Eksekutif TV & Video:</strong> Dimas Prasetyo</li>
  <li><strong>Tim Wartawan / Reporter:</strong> Budi Santoso, Dewi Lestari, Rizky Pratama, Maya Anggraini</li>
  <li><strong>Multimedia & IT Newsroom:</strong> Fajar Kurniawan, S.Kom</li>
</ul>

<p><em>Seluruh jurnalis BatuTV dibekali Tanda Pengenal Resmi (ID Card) dan Surat Tugas yang sah. Dilarang mengaku sebagai wartawan BatuTV tanpa dokumen legal.</em></p>
`.trim(),
    status: 'published',
    seoTitle: 'Susunan Redaksi & Dewan Pengarah | BatuTV',
    metaDescription: 'Informasi struktur organisasi, susunan pemimpin redaksi, jurnalis, dan penanggung jawab pemberitaan PT Batu Televisi Indonesia.',
    createdAt: '2025-01-14T09:00:00.000Z',
    updatedAt: '2026-08-12T15:30:00.000Z',
    publishedAt: '2025-01-14T09:00:00.000Z',
  },
  {
    id: 'page-9',
    title: 'Karier',
    slug: 'karier',
    excerpt: 'Bergabunglah bersama keluarga besar BatuTV untuk posisi reporter berita, video journalist, produser kreatif, dan tim teknologi digital.',
    content: `
<p>BatuTV mengundang talenta-talenta muda kreatif dan berdedikasi tinggi di bidang jurnalistik, penyiaran televisi digital, serta rekayasa perangkat lunak untuk bertumbuh bersama kami.</p>

<h2>Posisi yang Sedang Dibuka</h2>

<h3>1. Video Journalist / Reporter Lapangan (Malang Raya)</h3>
<ul>
  <li>Pendidikan minimal D3/S1 segala jurusan (diutamakan Jurnalistik/Komunikasi).</li>
  <li>Memiliki wawasan luas mengenai dinamika isu sosial, politik, dan ekonomi lokal.</li>
  <li>Mampu mengoperasikan kamera video berita dan mengedit video dasar.</li>
</ul>

<h3>2. Content Creator & Motion Graphic Designer</h3>
<ul>
  <li>Mahir menggunakan Adobe Premiere Pro, After Effects, atau DaVinci Resolve.</li>
  <li>Kreatif, adaptif terhadap tren format vertikal (TikTok/Reels/Shorts).</li>
</ul>

<h2>Cara Melamar</h2>
<p>Kirimkan surat lamaran, Curriculum Vitae (CV), dan portofolio karya terbaru Anda melalui email ke <a href="mailto:karir@batutv.com">karir@batutv.com</a> dengan subjek format: <code>[POSISI] - Nama Lengkap</code>.</p>
`.trim(),
    status: 'published',
    seoTitle: 'Karier & Lowongan Kerja | Bergabung Bersama BatuTV',
    metaDescription: 'Temukan peluang karier menarik di bidang jurnalisme, produksi siaran televisi, dan teknologi media digital bersama tim BatuTV.',
    createdAt: '2025-01-15T11:00:00.000Z',
    updatedAt: '2026-08-05T09:00:00.000Z',
    publishedAt: '2025-01-15T11:00:00.000Z',
  },
  {
    id: 'page-10',
    title: 'Syarat & Ketentuan',
    slug: 'syarat-ketentuan',
    excerpt: 'Ketentuan penggunaan portal, hak cipta materi teks dan video, serta batasan lisensi konten berita BatuTV.',
    content: `
<p>Selamat datang di situs portal berita BatuTV. Dengan mengakses atau menggunakan situs ini, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan Penggunaan berikut.</p>

<h2>1. Hak Kekayaan Intelektual (Hak Cipta)</h2>
<p>Seluruh materi naskah berita, foto jurnalistik, rekaman audio visual, logo, grafis, dan tata letak yang terdapat pada situs ini dilindungi oleh Undang-Undang Hak Cipta Republik Indonesia. Dilarang keras menggandakan, menyadur, mendistribusikan ulang, atau memanfaatkan konten untuk tujuan komersial tanpa izin tertulis dari PT Batu Televisi Indonesia.</p>

<h2>2. Kutipan Berita untuk Publik</h2>
<p>Pengutipan sebagian naskah berita untuk kepentingan non-komersial, karya ilmiah, atau edukasi diperkenankan maksimal 25% dari total panjang artikel dengan wajib menyertakan atribusi sumber yang jelas dan mencantumkan tautan aktif (<em>hyperlink</em>) ke URL artikel asli di portal BatuTV.</p>

<h2>3. Perubahan Ketentuan</h2>
<p>BatuTV berhak untuk memperbarui atau mengubah Syarat & Ketentuan ini sewaktu-waktu tanpa pemberitahuan terlebih dahulu. Penggunaan Anda secara berkelanjutan setelah perubahan dianggap sebagai penerimaan atas ketentuan yang telah diperbarui.</p>
`.trim(),
    status: 'published',
    seoTitle: 'Syarat & Ketentuan Penggunaan Portal | BatuTV',
    metaDescription: 'Aturan hak cipta, tata tertib pengutipan naskah berita, dan batasan lisensi penggunaan portal berita digital BatuTV.',
    createdAt: '2025-01-15T12:00:00.000Z',
    updatedAt: '2026-07-20T10:00:00.000Z',
    publishedAt: '2025-01-15T12:00:00.000Z',
  },
  {
    id: 'page-11',
    title: 'Peta Situs',
    slug: 'peta-situs',
    excerpt: 'Direktori navigasi lengkap portal berita BatuTV, kanal berita daerah, kategori populer, siaran live streaming, dan informasi legal perusahaan.',
    content: `
<p>Selamat datang di laman Peta Situs (Sitemap) portal berita BatuTV. Gunakan direktori navigasi berikut untuk menemukan kanal informasi, artikel berita, arsip video, dan dokumen legal redaksi kami.</p>

<h2>1. Kanal Berita Utama</h2>
<ul>
  <li><a href="/">Home (Beranda Utama)</a></li>
  <li><a href="/kategori/nasional">Nasional</a></li>
  <li><a href="/kategori/ekonomi">Ekonomi & Bisnis</a></li>
  <li><a href="/kategori/bola">Sepak Bola</a></li>
  <li><a href="/kategori/otomotif">Otomotif</a></li>
  <li><a href="/kategori/entertainment">Entertainment & Seleb</a></li>
  <li><a href="/kategori/tekno">Teknologi & Gadget</a></li>
  <li><a href="/kategori/gaya-hidup">Gaya Hidup & Kuliner</a></li>
  <li><a href="/kategori/sport">Olahraga</a></li>
</ul>

<h2>2. Layanan Multimedia & Interaktif</h2>
<ul>
  <li><a href="/video">Kanal Video Berita & Reportase Khusus</a></li>
  <li><a href="/?stream=live">Live Streaming Siaran Televisi BatuTV</a></li>
</ul>

<h2>3. Informasi Perusahaan & Regulasi Media</h2>
<ul>
  <li><a href="/tentang-kami">Tentang Kami</a></li>
  <li><a href="/redaksi">Susunan Redaksi</a></li>
  <li><a href="/kontak-kami">Kontak Redaksi & Kantor</a></li>
  <li><a href="/pedoman-media-siber">Pedoman Pemberitaan Media Siber</a></li>
  <li><a href="/panduan-kebijakan">Panduan Kebijakan Editorial</a></li>
  <li><a href="/info-iklan">Info Iklan & Media Kit</a></li>
  <li><a href="/kebijakan-privasi">Kebijakan Privasi</a></li>
  <li><a href="/disclaimer">Disclaimer / Sanggahan</a></li>
  <li><a href="/syarat-ketentuan">Syarat & Ketentuan Penggunaan</a></li>
  <li><a href="/karier">Karier & Lowongan Kerja</a></li>
</ul>
`.trim(),
    status: 'published',
    seoTitle: 'Peta Situs (Sitemap) | Direktori Lengkap Portal Berita BatuTV',
    metaDescription: 'Direktori lengkap kanal berita, video streaming, dan halaman informasi resmi portal berita televisi BatuTV.',
    createdAt: '2025-01-16T08:00:00.000Z',
    updatedAt: '2026-08-20T11:00:00.000Z',
    publishedAt: '2025-01-16T08:00:00.000Z',
  },
];
