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

