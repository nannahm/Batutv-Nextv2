# Architecture Decisions Log (DECISIONS.md)

### D-001: Tetap Menggunakan Firebase Firestore
- **Keputusan**: Tetap menggunakan Cloud Firestore (project `batutv-next`), tidak migrasi ke SQL / relational database.
- **Alasan**: Data live production sudah aktif terisi, skema dokumen fleksibel untuk konten multimedia portal berita.
- **Alternatif dipertimbangkan**: PostgreSQL / Cloud SQL.
- **Konsekuensi**: Mengoptimalkan indeks Firestore dan menjaga aturan keamanan rules.

### D-002: Firebase Admin SDK Server-Only
- **Keputusan**: Firebase Admin SDK hanya diinisialisasi dan diakses di sisi server (Server Components, Server Actions, Route Handlers, Middleware).
- **Alasan**: Menjaga credential service account agar tidak bocor ke client bundle.
- **Alternatif dipertimbangkan**: Direct client-side updates dengan credential admin.
- **Konsekuensi**: Client menggunakan Client SDK untuk listener real-time dan Server Actions untuk mutasi aman.

### D-003: Pertahankan Repository Pattern (`I<Domain>Repository`)
- **Keputusan**: Pola interface repository tetap dipertahankan dan di-port ke `src/features/<domain>/data/`.
- **Alasan**: Memisahkan layer data access dari framework routing Next.js dan mempermudah unit testing.
- **Alternatif dipertimbangkan**: Query Firestore langsung di dalam file page.
- **Konsekuensi**: Kode terstruktur rapi, decoupled, dan mudah diuji dengan mock.

### D-004: Larangan Menghapus `App.tsx` & `server.ts` Sebelum Tuntas
- **Keputusan**: File legacy `App.tsx` dan `server.ts` dipertahankan hingga seluruh domain selesai dimigrasi dan diverifikasi.
- **Alasan**: Menghindari regresi logika bisnis dan memastikan fallback fungsional tetap ada.
- **Konsekuensi**: Menjaga stabilitas aplikasi selama masa transisi.

### D-005: Migrasi SSR/SEO String-Replace ke Native Next.js Metadata
- **Keputusan**: Mengganti logic SSR string-replace di `server.ts` dengan `generateMetadata()`, `app/sitemap.ts`, dan `app/robots.ts`.
- **Alasan**: Standar native Next.js 16, performa lebih tinggi, dan type-safe.
- **Konsekuensi**: Query Firestore by slug diadaptasi ke server function.

### D-006: Auth Migration ke httpOnly Session Cookie
- **Keputusan**: Mengganti auth state di `localStorage` menjadi session cookie yang diverifikasi di `middleware.ts`.
- **Alasan**: Melindungi rute `/batutv-control/*` di level edge/server sebelum komponen dirender.
- **Konsekuensi**: Alur login menjadi 2 tahap: login di client via Firebase SDK -> exchange token ke route handler server untuk set cookie.

### D-007: Strategi Vertical Slice Per Domain
- **Keputusan**: Migrasi dikerjakan domain demi domain secara vertikal (Articles -> Auth -> Videos -> Taxonomy -> Pages/Settings).
- **Alasan**: Mengurangi risiko kegagalan dan memastikan setiap modul teruji penuh sebelum melangkah ke modul berikutnya.
- **Konsekuensi**: Setiap domain memiliki schema, repository, action, UI, dan tesnya sendiri.

### D-008: Folder `src/app/` Lama Ditulis Ulang
- **Keputusan**: Merestrukturisasi isi `src/app/` sesuai standar Next.js 16 App Router.
- **Alasan**: File app lama adalah stub awal dari eksperimen.
- **Konsekuensi**: Route groups `(portal)`, `(auth)`, `(dashboard)`, `api/` dibangun dengan arsitektur bersih.

### D-009: Observability & 23 Script Audit Dipertahankan Apa Adanya
- **Keputusan**: Folder `src/observability/` dan 23 script `audit:*` dipindahkan tanpa mengubah logic intinya.
- **Alasan**: Script audit operasional, SLO, dan DR runbook sudah teruji dan esensial untuk tata kelola sistem.
- **Alternatif dipertimbangkan**: Menghapus atau menulis ulang script menjadi endpoint API.
- **Konsekuensi**: Penyesuaian path import dilakukan tanpa mengubah algoritma audit.

### D-010: Strategi Dual-Runner Selama Transisi (Next.js 16 + Vite Standby)
- **Keputusan**: Menyediakan konfigurasi build dan dev untuk Next.js 16 sebagai target arsitektur migrasi, sementara engine Vite tetap dipertahankan dalam skrip runner alternatif (`dev:vite`, `build:vite`, `dev`, `build`) hingga pemotongan akhir di Fase 7.
- **Alasan**: Menjamin preview dan fungsionalitas portal berita BatuTV tetap online 100% tanpa downtime selama proses migrasi modular domain per domain berlangsung.
- **Alternatif dipertimbangkan**: Langsung menghapus seluruh konfigurasi Vite sejak Fase 1.
- **Konsekuensi**: Konfigurasi ganda dikelola di root (`next.config.ts` dan `vite.config.ts`) dengan skrip `build:next` dan `dev:next` untuk verifikasi build App Router.

### D-011: Mempertahankan dan Mengadaptasi Struktur `src/app/` Eksisting (Koreksi terhadap D-008)
- **Keputusan**: Membatalkan asumsi D-008 yang menganggap `src/app/` lama hanyalah stub kosong yang harus dihapus total dari nol. Struktur rute App Router yang sudah terbentuk (`(portal)`, `(auth)`, `(dashboard)`, `api/`, `layout.tsx`, `not-found.tsx`) dipertahankan, diintegrasikan, dan diselaraskan secara modular dengan Server Components & Feature Modules.
- **Alasan**: Hasil audit kode komprehensif membuktikan bahwa folder `src/app/` telah memiliki routing dan layout fungsional untuk portal berita, detail artikel, halaman informasi, login, dan BatuTV control. Menulis ulang dari nol akan membuang logika UI/UX yang sudah berjalan baik dan meningkatkan risiko regresi visual maupun alur login.
- **Alternatif dipertimbangkan**: Membuang seluruh isi `src/app/` dan membuat ulang dari nol file per file.
- **Konsekuensi**: Menghemat waktu pengerjaan, menghindari hilangnya fitur portal/dashboard, dan memfokuskan pekerjaan pada standardisasi server actions, metadata dynamic SSR, dan repository data fetching.

### D-012: Mode TypeScript Toleran Sementara (`strict: false` di `tsconfig.json`)
- **Keputusan**: Menyetel `strict: false` secara sementara di root `tsconfig.json` selama migrasi inkremental Fase 1 s.d. Fase 6, dengan kewajiban bahwa semua modul baru di `src/features/*` dan `src/lib/*` harus 100% strict dan tervalidasi Zod. Mode `strict: true` diaktifkan kembali secara global pada kriteria selesai Fase 7.
- **Alasan**: Komponen legacy UI berukuran besar (`App.tsx`), mock store transisi, dan skrip utilitas operasional memiliki implicit types yang akan memblokir kompilasi Next.js jika strict mode dipaksakan sebelum domain terkait selesai di-refactor.
- **Alternatif dipertimbangkan**: Memperbaiki semua implicit types di seluruh codebase legacy secara bersamaan (big-bang typing).
- **Konsekuensi**: Migrasi modular per domain dapat berjalan lancar tanpa terhambat file legacy yang nantinya akan dipensiunkan pada Fase 7.

### D-013: Flat ESLint 9+ Configuration (`eslint.config.mjs`) & Git Hooks Integration
- **Keputusan**: Mengadopsi ESLint 9 Flat Config (`eslint.config.mjs`) dengan `@eslint/js`, `eslint-config-next`, dan parser TypeScript, serta mengintegrasikan Husky (`pre-commit`, `commit-msg`) dan `lint-staged`.
- **Alasan**: Menjamin kebersihan kode, konsistensi formatting tim, dan mencegah kode cacat masuk ke git commit history.
- **Alternatif dipertimbangkan**: Menggunakan `.eslintrc.json` legacy atau menunda instalasi linter ke fase akhir.
- **Konsekuensi**: Setup tooling modern terstandarisasi, lolos audit linting dengan 0 errors.

### D-014: Otomasi Penanganan Versi Type Definitions (`@types/react`)
- **Keputusan**: Mengunci versi `@types/react` (19.2.x) dan `@types/react-dom` yang kompatibel dengan React 19 / Next.js 16 secara deklaratif dalam `devDependencies` dan mengotomasi proses build dalam script npm `build:next` tanpa memerlukan intervensi manual.
- **Alasan**: Prosedur manual install-dan-uninstall tipe sangat rentan terlupa antar-sesi developer dan melanggar prinsip automasi CI/CD.
- **Alternatif dipertimbangkan**: Menjalankan skrip bash terpisah atau membiarkan developer melakukan uninstall manual sesudah build.
- **Konsekuensi**: Build Next.js (`npm run build:next`) berjalan deterministik dan otomatis baik di lingkungan lokal, AI Studio, maupun CI/CD pipeline.

### D-015: Observability & 23 Script Operasional Dipertahankan Penuh
- **Keputusan**: Mempertahankan seluruh modul `src/observability/` dan 23 skrip audit operasional (Security, SLO, Disaster Recovery, Backup Verification, Cost & Capacity, Drift Detection) tanpa memodifikasi logic dasarnya.
- **Alasan**: Sistem audit operasional dan runbook DR sudah terbukti menjamin tata kelola enterprise BatuTV dan harus siap diuji ulang pada Fase 7.
- **Alternatif dipertimbangkan**: Menghapus atau menulis ulang skrip audit menjadi route handler API.
- **Konsekuensi**: Path import disesuaikan dengan struktur baru, script tetap dapat dijalankan melalui `npm run audit:*`.

### D-016: Standarisasi Penamaan Domain Inti Berita: "articles"
- **Keputusan**: Menetapkan nama resmi domain berita sebagai **`articles`** (jamak) di seluruh struktur arsitektur (`src/features/articles/`, `IArticleRepository`, `firestoreArticleRepository`, `/batutv-control/articles`, dsb.).
- **Alasan**: Konsisten dengan nama koleksi Firestore live `articles`, nama repository `firestoreArticleRepository`, tipe `AdminArticle`, dan rute dashboard yang sudah didefinisikan di `ARCHITECTURE.md` serta `MIGRATION-PLAN.md`.
- **Alternatif dipertimbangkan**: Menggunakan nama `news`.
- **Konsekuensi**: Direktori `src/features/news/` direname menjadi `src/features/articles/` dan seluruh referensi di PROJECT.md, ARCHITECTURE.md, dan MIGRATION-PLAN.md diselaraskan menggunakan nama `articles`.

### D-017: Insiden Keamanan Firestore Rules Public Write & Remediasi Arsitektur (2026-09-03)
- **Apa yang Ditemukan**: Pada saat audit live fetcher Fase 2 (2026-09-03), ditemukan bahwa file `firestore.rules` di database production `batutv-next` mengandung aturan catch-all test mode yang tertinggal dari seeding awal: `match /{document=**} { allow read, write: if true; }`. Celah ini membuka potensi operasi read/write/delete tanpa autentikasi terhadap seluruh koleksi production bagi siapa pun yang mengetahui API config Firebase publik.
- **Dampak Potensial**: Risiko integritas data berita riil BatuTV (defacement, penghapusan), kebocoran draft artikel yang belum terbit, serta pembacaan privat dokumen staf di koleksi `users`.
- **Tindakan Perbaikan Segera**:
  1. *Hardening Rules*: Menutup total celah write publik.
     - `match /articles/{articleId}`: Read publik HANYA untuk artikel berstatus `published` (`resource.data.status == 'published'`). Seluruh operasi write wajib superadmin terautentikasi.
     - `match /users/{userId}`: Tertutup penuh dari publik. Hanya user terautentikasi untuk datanya sendiri atau superadmin.
     - `match /categories/{id}` & `tags`: Read publik, write superadmin.
     - `match /{document=**}`: Default deny untuk publik.
  2. *Deployment Hotfix*: Rules yang telah diperketat langsung dideploy ke project `batutv-next`.
- **Hasil Audit Integritas Pasca-Insiden**:
  1. *Audit Koleksi `users`*: Pengujian query tanpa autentikasi terbukti ditolak dengan error `permission-denied`.
  2. *Audit Koleksi `articles`*: Terverifikasi 12 dokumen artikel published bersih dari defacement, spam (casino/judi/porn/crypto), maupun script injection (`<script>`).
  3. *Uji Eksploitasi Write*: Simulasi penambahan dokumen baru tanpa autentikasi ke koleksi `articles` dan `categories` terbukti diblokir 100% dengan kode `PERMISSION_DENIED`.
- **Tindak Lanjut Arsitektur (Fase 3)**:
  1. *Custom Claims RBAC*: Mengganti verifikasi email hardcoded (`request.auth.token.email == ...`) dengan Firebase Custom Claims (`request.auth.token.role == 'superadmin'`) melalui Firebase Admin SDK.
  2. *Admin SDK Server Fetcher*: Memindahkan data fetcher server-side dari Client SDK ke Firebase Admin SDK (D-002).
  3. *Protokol Deploy Infrastruktur*: Penggunaan tool `deploy_firebase` untuk perubahan infrastruktur di luar darurat keamanan wajib memerlukan persetujuan eksplisit dari tim teknis/user.

### D-018: Arsitektur Keamanan Bertingkat: Edge Runtime Middleware Session Guard, Server Component Layout Verification, & Node.js Actions (2026-09-03)
- **Konteks & Kendala**:
  Next.js Middleware berjalan di Edge Runtime yang secara fundamental tidak mendukung modul Node.js tingkat rendah (`net`, `tls`, `dns`) yang diwajibkan oleh Google gRPC / `firebase-admin/auth` untuk parsing sertifikat kriptografis x509 dan validasi session cookie secara lokal. Jika verifikasi hanya diletakkan di middleware sebagai pemeriksaan keberadaan cookie semata tanpa verifikasi di level render Server Component, penyerang dengan cookie palsu (`__session=dummy`) berpotensi melihat tampilan Server Component sebelum aksi mutasi data dipanggil.
- **Keputusan Arsitektur**:
  Menerapkan arsitektur keamanan tiga lapis (Defense-in-Depth):
  1. *Lapisan 1 (Fast Edge Guard di `middleware.ts`)*:
     - Memeriksa keberadaan cookie sesi httpOnly (`__session`).
     - Jika cookie tidak ada, request ke `/batutv-control/*` langsung di-short-circuit dan di-redirect ke `/login?redirect=...` dengan overhead ~0ms di edge.
  2. *Lapisan 2 (Render-Level Cryptographic Verification di Server Component Layout `DashboardControlLayout`)*:
     - Berjalan di Node.js Server Runtime sebelum halaman anak dashboard dirender.
     - Mengekstrak `__session` via `await cookies()` dan memvalidasi keabsahan tanda tangan kriptografis serta status revocation via `await adminAuth.verifySessionCookie(sessionCookie, true)`.
     - Jika cookie tidak valid, expired, atau dimanipulasi, server langsung melempar `redirect('/login?redirect=...')`. Tidak ada sekelumit pun UI sensitif/redaksi yang ter-render ke browser penyerang.
  3. *Lapisan 3 (Action & API Level RBAC Verification)*:
     - Endpoint penukaran token (`/api/auth/session`), Server Actions (`setUserRoleAction`), dan CMS admin API routes memverifikasi token dan hak akses spesifik (role superadmin/editor/reporter).
- **Konsekuensi**:
  - `middleware.ts` tetap sangat ringan dan kompatibel penuh dengan edge routing Next.js tanpa kompromi performa.
  - Celah pembacaan UI/HTML dashboard tertutup 100% karena layout server menolak render jika cookie tidak tervalidasi secara kriptografis.

### D-019: Eliminasi Client SDK Fallback pada Server-Side Data Fetcher `liveFirestoreService` (2026-09-03)
- **Konteks & Masalah**:
  Implementasi awal Sub-Task 2 menyediakan fallback 3-tingkat: Admin SDK -> Client SDK -> Static Seed Cache. Ketergantungan pada Client SDK di server context menimbulkan dua risiko:
  1. Menutupi kegagalan konfigurasi kredensial Admin SDK secara diam-diam.
  2. Menciptakan ketergantungan kembali pada rules Firestore publik yang bertentangan dengan prinsip pemisahan tanggung jawab D-002.
- **Keputusan**:
  Menyederhanakan alur data fetcher server menjadi 2-tingkat deterministik:
  - *Tier 1*: Firebase Admin SDK (`getAdminFirestore()`) dengan query filter eksplisit `where('status', '==', 'published')`.
  - *Tier 2*: Static Seed Cache (`initialAdminArticles`) jika koneksi Firestore offline, error, atau koleksi kosong.
- **Konsekuensi**:
  - Bundle server bersih dari import Client SDK Firestore (`firebase/firestore`).
  - Perilaku data fetching menjadi predictable, aman, dan mematuhi D-002 secara mutlak.

### D-020: Pola Migrasi Dokumen User Non-Destruktif & Pemetaan Kanonik Berbasis Auth UID (2026-09-03)
- **Konteks & Masalah**:
  Data pengguna awal disimpan dalam dokumen seed Firestore dengan Document ID warisan format `usr-XXX` (`usr-000` s/d `usr-009`). Sementara itu, aturan keamanan `firestore.rules` dan arsitektur otentikasi Firebase modern mengandalkan `request.auth.uid == userId` di mana Document ID harus persis sama dengan Firebase Auth UID (`users/{uid}`).
  Menghapus dokumen lama `usr-XXX` secara langsung akan memusnahkan jejak audit (audit trail) dan metadata historis penting, sedangkan membuat dokumen baru tanpa koordinasi berisiko menimbulkan data duplikat yang membingungkan.
- **Keputusan**:
  1. Menerapkan pola migrasi non-destruktif:
     - Dokumen warisan `users/usr-XXX` TIDAK dihapus, melainkan ditandai secara permanen dengan metadata:
       ```json
       {
         "isMigrated": true,
         "migrationStatus": "migrated",
         "canonicalUid": "<Firebase_Auth_UID>",
         "migratedAt": "<ISO_Timestamp>",
         "auditNote": "Legacy seed record migrated to canonical auth UID document users/<Firebase_Auth_UID>"
       }
       ```
     - Dokumen kanonik baru dibuat pada path `users/<Firebase_Auth_UID>` dengan menyertakan atribut role kanonik (`superadmin`, `editor`, atau `reporter`) dan profil terverifikasi.
  2. Penegakan Prinsip Zero-Assumption untuk Akun Seed:
     - Akun staf yang baru berupa dokumen seed Firestore dan belum memiliki akun di Firebase Authentication tidak boleh diasumsikan UID-nya dan tidak boleh dibuatkan akun Auth tanpa konfirmasi eksplisit user.
- **Konsekuensi**:
  - Jejak audit dan integritas data historis terlindungi penuh (bebas data loss).
  - Skema data Firestore bersih, seragam, dan selaras dengan `firestore.rules` live.

### D-021: Pola Penyimpanan Media & Thumbnail (Porting Pola URL/DataURL Tanpa Storage SDK)
- **Konteks**:
  Audit Fase 4 Sub-Task 0 mengonfirmasi bahwa codebase legacy tidak menggunakan Firebase Storage SDK (baik Client maupun Admin). Media disimpan sebagai URL eksternal (Unsplash/CDN) atau DataURL WebP base64 yang dihasilkan oleh canvas client (`optimizeUploadedImage`).
- **Keputusan**:
  Mempertahankan dan mem-porting pola URL/DataURL yang sudah berjalan pada repository media dan skema validasi Zod tanpa membangun infrastruktur Firebase Storage SDK baru di Fase 4. Prinsip: "Port pola existing, bukan rewrite; migrasi ke Firebase Storage SDK asli dipertimbangkan di luar scope 7 fase migrasi utama (atau masuk Fase 7 jika ada sisa waktu)".
- **Konsekuensi**:
  - Implementasi Fase 4 tetap ramping, aman, dan tidak menambah kompleksitas infrastruktur/rules bucket baru.
  - DataURL base64 langsung di Firestore dicatat sebagai technical debt terkait batas 1MB dokumen Firestore.

### D-022: Penegakan Filter Status Taksonomi di Level Aplikasi (Repository/Query)
- **Status**: Diterima
- **Tanggal**: 2026-09-03 (Fase 5 Sub-Task 1 & 2)
- **Konteks**:
  Aturan keamanan `firestore.rules` untuk koleksi `categories` dan `tags` mengizinkan `read: if true` tanpa filter status (terbuka publik untuk kebutuhan navigasi dan badge UI portal). Beda dengan `articles` dan `videos` di mana rules membatasi `read` hanya untuk dokumen dengan `status == 'published'`, pada taksonomi dokumen berstatus `inactive` secara teknis dapat dibaca oleh client mana pun jika query tidak difilter.
- **Keputusan**:
  Penegakan filter status aktif taksonomi ditegakkan secara ketat dan mutlak pada level repository/query aplikasi:
  1. `liveFirestoreTaxonomyService.ts`: Menggunakan filter query `where('status', '==', 'active')` baik pada pemanggilan tunggal (by slug) maupun koleksi list.
  2. Fallback in-memory store: Mengaplikasikan filter `.filter(c => c.status === 'active')`.
  3. Halaman arsip publik `/kategori/[slug]` dan `/tag/[slug]`: Memvalidasi status aktif secara ketat dan memicu `notFound()` (404 kanonik) jika taksonomi yang diminta berstatus non-aktif atau tidak terdaftar.
- **Konsekuensi**:
  - Integritas data publik terjaga tanpa perlu mengubah struktur rules yang sudah stabil.
  - Taksonomi non-aktif terlindungi dari pemaparan tidak sengaja di portal publik.

### D-023: Normalisasi Rute Admin Taksonomi (/categories & /tags) dengan Graceful Redirect
- **Status**: Diterima
- **Tanggal**: 2026-09-03 (Fase 5 Sub-Task 3)
- **Konteks**:
  Rute admin lama portal berita menggunakan penamaan campuran: bahasa Indonesia untuk taksonomi (`/batutv-control/kategori` dan `/batutv-control/tag`), sedangkan modul lainnya menggunakan bahasa Inggris standar plural (`/batutv-control/articles`, `/batutv-control/videos`, `/batutv-control/media`).
- **Keputusan**:
  Menormalisasi rute admin taksonomi ke bahasa Inggris standar: `/batutv-control/categories` dan `/batutv-control/tags`. Untuk menjamin kompatibilitas ke belakang bagi tautan lama, riwayat browser, atau bookmark staf redaksi, rute `/batutv-control/kategori` dan `/batutv-control/tag` diimplementasikan sebagai graceful permanent redirect (`redirect('/batutv-control/categories')` dan `redirect('/batutv-control/tags')`).
- **Konsekuensi**:
  - Konvensi URL seluruh panel admin konsisten.
  - Tidak ada broken link bagi staf redaksi yang mengakses path lama.

### D-024: Integrasi Form Editor Artikel & Video via TaxonomyTagInput & Live Categories Sync
- **Status**: Diterima
- **Tanggal**: 2026-09-03 (Fase 5 Sub-Task 4)
- **Konteks**:
  Form editor naskah berita (`NewsEditorView`) dan video (`VideoEditorView`) sebelumnya mengandalkan string input koma manual untuk tagar dan daftar kategori lokal statis tanpa validasi sinkronisasi ke master data taksonomi di Firestore.
- **Keputusan**:
  1. Membangun komponen reusable `TaxonomyTagInput` (`src/components/admin/common/TaxonomyTagInput.tsx`) yang menyediakan fitur chip interaktif, autocomplete saran dari master tag aktif, filter relevansi konten (`news` vs `video`), dan quick-selection chips.
  2. Mengintegrasikan sinkronisasi kategori live dari master taksonomi ke dalam dropdown `NewsEditorView` dan `VideoEditorView` dengan filter `status == 'active'` dan tipe konten yang sesuai.
  3. Menyimpan referensi terstruktur `categoryId` dan `categorySlug` yang teresolusi secara otomatis di payload simpan naskah berita dan video.
- **Konsekuensi**:
  - Mengurangi inkonsistensi penamaan tag dan typo redaksi.
  - Memastikan seluruh artikel dan video terindeks ke taksonomi aktif yang sah.

### D-025: Pemisahan Akses Server Actions vs Client Store pada Komponen Klien SPA
- **Status**: Diterima
- **Tanggal**: 2026-09-04 (Pasca Fase 5 / Hardening Arsitektur)
- **Konteks**:
  Komponen UI admin yang di-render dalam mode SPA Vite (`src/components/admin/...`) sempat mengimpor Server Actions (`src/features/taxonomy/actions.ts`). Karena `actions.ts` mengimpor `firebaseAdmin.ts` yang memerlukan modul runtime Node.js server (`@google-cloud/firestore`, `firebase-admin`, `stream`, `tls`), bundler klien Vite mengeksternalkannya menjadi `undefined`, sehingga memicu error runtime browser `Uncaught TypeError: Class extends value undefined is not a constructor or null` dan layar putih (blank screen).
- **Keputusan**:
  1. Komponen sisi klien (SPA) yang berjalan di bawah bundler Vite/browser DILARANG mengimpor Server Actions yang mengikat dependensi Firebase Admin SDK Node.js.
  2. Komponen sisi klien berinteraksi melalui client data store (`categoryAdminStore.ts`, `tagAdminStore.ts`) yang menggunakan Firebase Client SDK (`src/repositories/firestore/*`) dan event-driven state sync (`CATEGORIES_UPDATED_EVENT`, `TAGS_UPDATED_EVENT`).
  3. Server Actions (`src/features/taxonomy/actions.ts`) didedikasikan secara eksklusif untuk Server Components dan route handlers Next.js (SSR/App Router).
  4. Menyelaraskan aturan `firestore.rules` agar mengizinkan peran `editor` selain `superadmin` (`isSuperAdmin() || hasRole('editor')`) untuk operasi write pada koleksi `categories` dan `tags`.
- **Konsekuensi**:
  - Bundle klien bersih 100% dari kebocoran modul server Node.js.
  - Mencegah runtime crash dan layar putih pada preview browser.
  - Arsitektur dua-jalur (Client Store via Client SDK untuk CSR, Server Actions via Admin SDK untuk SSR Next.js) terdokumentasi dan terisolasi secara tegas.

### D-026: Penyelarasan Field `role` Dokumen Firestore `CMSUser` ke 3 Role Kanonik
- **Status**: Diterima
- **Tanggal**: 2026-09-04 (Fase 6 Sub-Task 0)
- **Konteks**:
  Terdapat diskrepansi antara 5 nilai role warisan legacy di dokumen Firestore CMSUser (`admin`, `redaksi`, `editor`, `reporter`, `kontributor`) dengan 3 role kanonik sistem otorisasi Firebase Auth Custom Claims (`superadmin`, `editor`, `reporter`). Kondisi ini berpotensi memicu fragmentasi hak akses (dual-role system) dan inkonsistensi evaluasi izin pada guard SSR maupun aturan keamanan Firestore (`firestore.rules`).
- **Keputusan**:
  1. Menyelaraskan seluruh field `role` dokumen Firestore `CMSUser` (`/users/{userId}`) ke 3 role kanonik: `superadmin` | `editor` | `reporter` sebagai *single source of truth*.
  2. Menerapkan tabel pemetaan kanonik definitif:
     | Nilai Lama (`UserRole`) | Nilai Kanonik Baru (`CanonicalUserRole`) |
     | :--- | :--- |
     | `admin` | `superadmin` |
     | `redaksi` | `editor` |
     | `editor` | `editor` |
     | `reporter` | `reporter` |
     | `kontributor` | `reporter` |
  3. Mempertahankan helper `toCanonicalRole()` pada `src/types/user.ts` untuk normalisasi non-destruktif saat membaca/menyimpan dokumen Firestore di repository layer (`FirestoreUserRepository`).
  4. Menyelaraskan seed data `INITIAL_CMS_USERS`, helper jabatan redaksi `mapAuthorPositionToRole()`, dan agregasi statistik `getUserStats()` di `src/data/userAdminStore.ts` agar langsung menggunakan nilai kanonik dengan tetap menyediakan alias kompatibilitas mundur.
  5. Menyelaraskan validasi RBAC pada `src/utils/rbac.ts` agar memeriksa role kanonik secara langsung dan konsisten dengan hierarki otorisasi.
- **Konsekuensi**:
  - Satu sistem peran tunggal yang seragam dari token klaim Firebase Auth, cookie sesi SSR, hingga penyimpanan dokumen database Firestore.
  - Menghilangkan ambiguitas pemetaan peran pada UI formulir dan pengelolaan staf redaksi.
  - Kompatibilitas mundur tetap terlindungi secara aman selama proses transisi migrasi data.
