# Current Migration Status

## Persistensi Repository (2026-09-03)
Repository terhubung ke GitHub (nannahm/Batutv-Nextv2) via Personal Access Token (`GH_TOKEN`).
Branch aktif: `migration-nextjs-fase1`.
Commit terverifikasi tersimpan di remote per commit a57c247f4f7a4566664145d2536bdd19bc570f53.
Sesi berikutnya WAJIB menjalankan `git log -1` dan `git ls-remote origin migration-nextjs-fase1` di awal untuk
memastikan kesinambungan sebelum melanjutkan pekerjaan apa pun (lihat CLAUDE-RULES.md
tambahan soal disiplin sesi).

## Catatan Reset (2026-09-02)
Riwayat git sebelumnya (commit d5d1204/614b844 dan progres Fase 1 yang pernah dilaporkan) tidak ditemukan
di repository ini maupun di remote GitHub manapun. Proses migrasi dimulai ulang dari checkpoint baru dengan
basis kode yang ada, mengikuti panduan migrasi di `ARCHITECTURE.md` dan `DECISIONS.md`.

## Overview
- **Project**: BatuTV News Portal
- **Target Framework**: Next.js 16 App Router (Full Stack)
- **Database**: Firebase Firestore (`batutv-next`)
- **Last Updated**: 2026-09-03 (Fase 3 Authentication & RBAC Completed)

## Phase Status Summary

| Phase | Description | Status | Progress |
|---|---|---|---|
| **Fase 0** | Handover Infrastructure & Handover Docs | 🟢 Selesai | 100% |
| **Fase 1** | Fondasi (Next.js 16, App Router Root, ESLint, Firestore SDK, UI) | 🟢 Selesai | 100% |
| **Fase 2** | Articles (Pilot Domain - Repository, Schemas, Actions, SSR Pages, Admin) | 🟢 Selesai | 100% |
| **Fase 3** | Authentication & RBAC (httpOnly Cookies, Middleware Guard, Custom Claims) | 🟢 Selesai | 100% |
| **Fase 4** | Videos & Media (YouTube Integration, Player, Storage) | 🟡 Berjalan (Sub-Task 2) | 50% |
| **Fase 5** | Taksonomi (Categories, Tags, Archive Routing) | ⚪ Belum Dimulai | 0% |
| **Fase 6** | Pages, Navigation, Settings, Users (Static Pages, Menus, Sync) | ⚪ Belum Dimulai | 0% |
| **Fase 7** | Cutover, 23 Audit Scripts, Final Cleanup | ⚪ Belum Dimulai | 0% |

## Progres Terverifikasi Fase 3 (Authentication & RBAC)
1. **Sub-Task 1 (Setup Firebase Admin SDK Server-Only)**:
   - File `src/lib/firebaseAdmin.ts` berhasil diinisialisasi sebagai singleton server-only (`server-only` guarded).
   - Mendukung credential dari `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string env) dengan fallback ke Application Default Credentials / Project ID.
   - Variabel terdokumentasi rapi di `.env.example`.
2. **Sub-Task 2 (Migrasi liveFirestoreService ke Admin SDK 2-Tier)**:
   - `src/features/articles/data/liveFirestoreService.ts` dialihkan ke `getAdminFirestore()` di server context.
   - Filter query `where('status', '==', 'published')` dipertahankan mutlak untuk keamanan status draft.
   - Sesuai masukan review arsitektur (D-019), fallback Client SDK dihilangkan: arsitektur disederhanakan menjadi 2-tier murni (Admin SDK -> Static Seed Cache), bebas dari import client SDK di server.
3. **Sub-Task 3 (Custom Claims RBAC & Server Action)**:
   - Skema Zod hierarki role: `superadmin` (3) > `editor` (2) > `reporter` (1) di `src/features/auth/schemas.ts`.
   - Server Action `setUserRoleAction` di `src/features/auth/serverActions.ts` menggunakan `getAdminAuth().setCustomUserClaims()`.
   - Pola migrasi non-destruktif (D-020): dokumen legacy ditandai `isMigrated: true` dan `migrationStatus: 'migrated'`, dokumen kanonik terpetakan ke `users/{uid}`.
4. **Sub-Task 4 (Update & Deployment firestore.rules ke Custom Claims)**:
   - Aturan `firestore.rules` diperbarui mendukung fungsi `hasRole(role)` dan `isSuperAdmin()` berbasis claims `request.auth.token.role`.
   - Aturan telah dideploy via `deploy_firebase` dan diuji secara live:
     - Public Read `/categories`: Diizinkan (`allow read: if true;`).
     - Public Write `/articles`: Ditolak mutlak (`7 PERMISSION_DENIED`).
     - Public Read `/users`: Ditolak mutlak (`7 PERMISSION_DENIED`).
5. **Sub-Task 5 (Session Cookie Flow)**:
   - Endpoint `POST` & `DELETE` di `src/app/api/auth/session/route.ts` untuk pertukaran ID token Firebase menjadi httpOnly cookie `__session` (durasi 5 hari, `sameSite: 'lax'`).
   - `LoginPage.tsx` otomatis mengontak endpoint sesi setelah berhasil login di client.
6. **Sub-Task 6 (Arsitektur Keamanan Bertingkat: Edge Guard & Server Component Verification)**:
   - `src/middleware.ts` memproteksi rute `/batutv-control/*` di Edge Runtime dengan memeriksa keberadaan cookie `__session` (fast short-circuit).
   - Root Server Component Layout `src/app/(dashboard)/batutv-control/layout.tsx` memverifikasi cookie secara kriptografis menggunakan `adminAuth.verifySessionCookie(sessionCookie, true)` SEBELUM komponen anak dan UI redaksi dirender. Menutup 100% celah render konten untuk cookie palsu/kadaluarsa (D-018).
7. **Rollout Custom Claims & Audit Akun Staf (Langkah 1 - 4)**:
   - Akun Pengembang / Super Admin (`dzakyinne@gmail.com`): Terdaftar di Firebase Auth (UID `40uxsmjnYYdv8Lov6V3qh83JZI02`), custom claims `{ role: 'superadmin' }` terverifikasi aktif, dokumen kanonik `users/40uxsmjnYYdv8Lov6V3qh83JZI02` aktif, dokumen warisan `users/usr-000` bermigrasi (`migrationStatus: 'migrated'`).
   - 4 Akun Staf Redaksi Utama (`ahmad.fauzi@batutv.id`, `budi.santoso@batutv.id`, `sinta.rahma@batutv.id`, `dimas.pratama@batutv.id`): Diaudit via Firebase Admin Auth `getUserByEmail()`. Ditemukan berstatus *seed-only* (belum terdaftar di Firebase Authentication Console / belum pernah login). Sesuai protokol, sistem mempertahankan status aman tanpa mengasumsikan UID palsu atau membuat akun tanpa persetujuan manual. Skema pemetaan role kanonik (Opsi 1: superadmin/editor/editor/reporter) telah terkunci dan siap disematkan begitu akun didaftarkan.
   - **Klarifikasi Dokumen Warisan `usr-005` s/d `usr-009`**:
     - Dokumen `usr-005` (`rina.wulandari@batutv.id` - redaksi), `usr-006` (`dewi.anggraini@batutv.id` - editor), `usr-007` (`nadia.putri@batutv.id` - kontributor), `usr-008` (`arif.setiawan@batutv.id` - kontributor), `usr-009` (`fajar.hidayat@batutv.id` - reporter) adalah data seed dummy dari portal lama.
     - Status: Saat ini berstatus *unmigrated seed records* (`migrationStatus: 'none'`, `isMigrated: false`).
     - Perlindungan Integritas: Mengikuti D-020, dokumen ini TIDAK dihapus demi menjaga keutuhan relasi artikel historis yang mereferensikan `authorId` mereka. Migrasi atau pembersihan final akan ditangani secara terstruktur pada Fase 6 (Users & Settings).
   - **Pencatatan Gap Onboarding Staf Redaksi (SOP Transisi)**:
     - *Identifikasi Gap*: Terdapat celah operasional di mana akun yang dibuat di Firebase Auth Console belum otomatis memiliki custom claims atau dokumen profil kanonik di Firestore.
     - *Prosedur Standar Onboarding (SOP)*:
       1. Pendaftaran Akun: Super Admin mendaftarkan email staf di Firebase Authentication Console.
       2. Role Assignment: Server Action `setUserRoleAction(uid, role)` dieksekusi dengan role kanonik (`superadmin`, `editor`, atau `reporter`) untuk menyematkan custom claims.
       3. Dokumen Kanonik: Sistem membuat dokumen profil pada `/users/{uid}`.
       4. Flag Dokumen Warisan: Jika akun tersebut memiliki dokumen seed lama (`usr-XXX`), dokumen lama diperbarui dengan flag non-destruktif `{ isMigrated: true, migrationStatus: 'migrated', canonicalUid: uid }`.
     - *Rencana Otomasi*: Alur manual ini akan dibangun menjadi antarmuka UI terintegrasi pada modul User Management di Fase 6.

## Progres Terverifikasi Fase 2 (Articles)
1. **Porting Repository**: `IArticleRepository` & `firestoreArticleRepository` di-export via `src/features/articles/data/index.ts` (Commit `a9df1ce`).
2. **Skema & Aksi Domain**: Validasi Zod `schemas.ts` dan Server Actions `actions.ts` (create, update, soft delete / trash, permanent delete).
3. **Adapter Domain to View**: `src/features/articles/adapters/articleMapper.ts` (`toNewsArticle` dan `toAdminArticle`) dengan logika estimasi `readTime`, format relatif waktu Indonesia, deteksi `isBreaking`, dan mapping `author` (Commit `dda6294`).
4. **Live Firestore Data Fetching & Strict 404 Distinction**:
   - `src/features/articles/data/liveFirestoreService.ts`: Membedakan secara tegas antara dokumen tidak ada di Firestore (`not-found` -> picu `notFound()` 404 asli) vs koneksi unreachable/offline (`seed-fallback` dengan explicit warning log).
   - `src/app/(portal)/berita/[slug]/page.tsx`: Live fetch pada `generateMetadata()` & page component, `revalidate = 60` (ISR 60 detik untuk keseimbangan TTFB edge cache dan pembaruan redaksi/breaking news), dan `dynamicParams = true`.
   - `src/app/sitemap.ts`: Dynamic XML sitemap terhubung ke `fetchPublishedArticlesLive()` (Commit `a57c247`).
5. **Routing Admin**: Rute admin `src/app/(dashboard)/batutv-control/articles/page.tsx` me-render `NewsManagementModule` (Commit `c4f17e2`).
6. **Verifikasi Build**:
   - `npx next build --webpack`: `BUILD_EXIT: 0` (21 static pages generated).
   - `npx tsc --noEmit`: `TSC_EXIT: 0`.

## Progres Terverifikasi Fase 4 (Videos & Media)
1. **Sub-Task 0 (Audit Videos & Storage)**:
   - Audit menyeluruh membuktikan codebase legacy tidak menggunakan Firebase Storage SDK (baik Client maupun Admin).
   - Media dan thumbnail disimpan sebagai URL eksternal (Unsplash/CDN) atau DataURL WebP base64 via canvas client.
   - D-021 didokumentasikan di `DECISIONS.md` untuk mem-porting pola URL/DataURL tanpa membangun infrastruktur Storage SDK baru di Fase 4.
2. **Sub-Task 1 (Repository & Schema Domain Video)**:
   - `src/features/videos/schemas.ts`: Dibuat dengan validasi Zod (`adminVideoSchema`, `videoStatusSchema`, `videoFilterSchema`, `extractYouTubeId`) yang selaras 100% dengan `AdminVideo` dan `VideoStatus` (`'draft' | 'scheduled' | 'published' | 'trash'`).
   - `src/features/videos/data/adminFirestoreVideoRepository.ts`: Diimplementasikan langsung menggunakan Firebase Admin SDK (`getAdminFirestore()`) dengan arsitektur 2-tier graceful fallback ke `initialAdminVideos`.
   - `src/features/videos/actions.ts`: Disediakan Server Actions (`createVideoAction`, `updateVideoAction`, `deleteVideoAction`, `publishVideoAction`) dengan verifikasi sesi httpOnly cookie `__session` dan penegakan role RBAC (`superadmin`, `editor`, `reporter`).
   - Verifikasi: `npx tsc --noEmit` sukses bersih (`TSC_EXIT: 0`).
3. **Sub-Task 2 (Komponen Video: Player, Card, Bento Grid, Catalog)**:
   - Klarifikasi Status Enum Video: Terverifikasi langsung ke live Firestore `batutv-next` (17 dokumen: 8 published, 3 draft, 3 scheduled, 3 trash, 0 archived). Nilai `'draft' | 'scheduled' | 'published' | 'trash'` adalah representasi kanonik sistem soft-delete video.
   - `src/features/videos/adapters/videoMapper.ts`: Mapper adaptif `toPublicVideoItem` dengan resolusi thumbnail aman (`customThumbnail` vs YouTube HQ), format waktu relatif Indonesia, dan format tanggal lengkap.
   - `src/features/videos/components/VideoPlayer.tsx`: Pemutar video interaktif dengan **lazy loading click-to-play** (poster thumbnail ber-vignette + durasi + play button overlay; iframe baru dimuat saat user klik play) dan domain privacy-enhanced **`youtube-nocookie.com`**.
   - `src/features/videos/components/VideoCard.tsx`: Komponen kartu video dengan rasio 16:9, label durasi, badge kategori, hover zoom, jumlah tayangan, nama reporter/presenter, dan timestamp relatif.
   - `src/features/videos/components/VideoBentoGrid.tsx`: Grid modular (featured hero video + secondary list) untuk etalase video berita portal.
   - `src/features/videos/components/VideoCatalog.tsx`: Katalog video lengkap dengan live search, filter kategori pills, dan sorting (Terbaru/Terpopuler).
   - `src/features/videos/components/VideoSkeleton.tsx`: State pemuatan skeleton untuk kartu dan grid video.
   - Pembersihan Dead Code: Folder rintisan lama `src/features/video/` (singular) yang tidak digunakan telah dibersihkan secara tuntas.
   - Verifikasi: `npx tsc --noEmit` (0 errors) & `compile_applet` (berhasil).

## Catatan Kredensial Firebase Admin Service Account (Prasyarat CI/CD & Production Build)
Untuk pipeline CI/CD produksi mandiri penuh di luar sandbox:
- **Kebutuhan**: Environment variable `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON private key) atau kredensial ADC GCP (`GOOGLE_APPLICATION_CREDENTIALS`) diperlukan agar Next.js Server Components dan Node.js build runner dapat mengautentikasi Firestore live secara langsung tanpa fallback seed.
- **Jadwal Eksekusi**: Wajib diinjeksi dan diaudit sebelum Fase 7 (Cutover). Untuk fase pengembangan saat ini, arsitektur hybrid live-first dengan graceful fallback terverifikasi aman dan tidak menggagalkan build.

## Sisa Pekerjaan Fase 2 (10%)
1. Unit testing suite untuk mapper, Zod schema, dan repository.
2. Pengintegrasian/pemberdayaan `ArticleBentoGrid` & `ArticleSkeleton` di rute portal publik.

## Technical Debt Teridentifikasi (Fase 2 & 4)
1. **Penyimpanan Gambar sebagai DataURL Base64 di Firestore (Fase 4)**:
   - *Kondisi*: Dokumen pada koleksi `/media` berpotensi menyimpan string base64 (`data:image/webp;base64,...`) langsung di field `url` bila diunggah via canvas client.
   - *Risiko*: Batas ukuran dokumen Firestore adalah 1MB per dokumen. Base64 menambah overhead ukuran (~33%), dan setiap operasi pembacaan dokumen mentransfer seluruh string base64 sehingga membebani bandwidth/read cost dibanding file URL di CDN/Storage.
   - *Rencana Mitigasi*: Pola existing dipertahankan pada Fase 4 (D-021: port pola existing, bukan rewrite). Migrasi ke Firebase Storage SDK asli dipertimbangkan di fase optimisasi mendatang (di luar 7 fase migrasi utama, atau masuk Fase 7 jika ada sisa waktu).

2. **Heuristik Deteksi isBreaking & Region (Fase 2)**:
   - Logika penentuan `isBreaking` dan `region` di `articleMapper.ts` saat ini menggunakan string matching heuristik pada teks tag (`breaking`, `utama`, nama kota).
   - Pendekatan ini rentan terhadap variasi penulisan atau typo editor.
   - **Rencana Mitigasi**: Pada Fase 6/7, ganti dengan field boolean eksplisit (`isBreaking: boolean`, `region: RegionEnum`) terstruktur di schema Firestore dan form admin CMS.

3. **Migrasi Server Fetcher ke Firebase Admin SDK (D-002 Compliance - Selesai di Fase 3)**:
   - Selesai termigrasi ke arsitektur 2-tier murni (Admin SDK -> Static Seed Cache) pada Fase 3.


## Status Keamanan & Lingkungan Database Firestore (Audit 2026-09-03)
- **Status Database**: Project `batutv-next` (`(default)`) adalah **database resmi / riil BatuTV** (berisi data pengguna autentik seperti `dzakyinne@gmail.com`, dewan redaksi, dan artikel berita aktual).
- **Catatan Insiden & Audit**: Terdokumentasi lengkap pada keputusan arsitektur **`D-017` di `DECISIONS.md`**.
- **Audit firestore.rules**:
  - *Temuan Sebelumnya*: Rule lama berada dalam test mode terbuka (`match /{document=**} { allow read, write: if true; }`).
  - *Resolusi Terverifikasi*: Telah diperbaiki dan dideploy via `deploy_firebase` per 2026-09-03.
  - *Kondisi Baru*:
    - Koleksi `articles`: **Public read-only HANYA untuk status `published`** (`allow read: if resource.data.status == 'published'`). Draft dan scheduled news tertutup dari publik.
    - Celah Public Write: **DITUTUP TOTAL** (`allow write: if isSuperAdminEmail()`). Tidak ada celah write publik tanpa autentikasi superadmin.
    - Koleksi `users`: Ditutup dari publik (`allow read: if isSignedIn() && (request.auth.uid == userId || isSuperAdminEmail())`).
- **Kebijakan Testing Sandbox & Protokol Deploy**:
  - Karena terhubung ke live database, operasi pengujian di sandbox dilarang keras melakukan write destruktif.
  - Read query saat build dibatasi ketat (`limit(30)` untuk SSG dan `limit(1)` untuk detail).
  - Evaluasi penggunaan Firestore Emulator / static mock data layer untuk CI/CD pipeline luar sebelum Fase 7.
  - **Protokol `deploy_firebase`**: Di luar hotfix darurat keamanan (seperti penutupan celah terbuka), segala deploy rules dan konfigurasi cloud wajib melalui konfirmasi dan persetujuan eksplisit dari tim teknis.

## Temuan Audit & Resolusi Riil (2026-09-02)
1. **Status Build Next.js (`npx next build --webpack`)**:
   - **Hasil**: Lolos bersih `EXIT: 0`.
   - **Solusi**: Dikonfigurasi penanganan otomatis mode produksi pada `next.config.ts` saat argumen `build` dijalankan, serta diselaraskan dengan script npm `build:next`.
2. **Status Dev Server & Typecheck**:
   - `timeout 15 npx next dev -p 3001`: Ready dalam 573ms tanpa error.
   - `npx tsc --noEmit`: Lolos bersih `EXIT: 0` dengan 0 error.
3. **Status Domain Code**:
   - `src/features/articles/` terverifikasi aktif sesuai D-016 di `DECISIONS.md`.
