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
- **Last Updated**: 2026-09-03 (Fase 3 Authentication & RBAC In Progress)

## Phase Status Summary

| Phase | Description | Status | Progress |
|---|---|---|---|
| **Fase 0** | Handover Infrastructure & Handover Docs | 🟢 Selesai | 100% |
| **Fase 1** | Fondasi (Next.js 16, App Router Root, ESLint, Firestore SDK, UI) | 🟢 Selesai | 100% |
| **Fase 2** | Articles (Pilot Domain - Repository, Schemas, Actions, SSR Pages, Admin) | 🟢 Selesai | 100% |
| **Fase 3** | Authentication & RBAC (httpOnly Cookies, Middleware Guard, Custom Claims) | 🟡 Sedang Berjalan | 85% |
| **Fase 4** | Videos & Media (YouTube Integration, Player, Storage) | ⚪ Belum Dimulai | 0% |
| **Fase 5** | Taksonomi (Categories, Tags, Archive Routing) | ⚪ Belum Dimulai | 0% |
| **Fase 6** | Pages, Navigation, Settings, Users (Static Pages, Menus, Sync) | ⚪ Belum Dimulai | 0% |
| **Fase 7** | Cutover, 23 Audit Scripts, Final Cleanup | ⚪ Belum Dimulai | 0% |

## Progres Terverifikasi Fase 3 (Authentication & RBAC)
1. **Sub-Task 1 (Setup Firebase Admin SDK Server-Only)**:
   - File `src/lib/firebaseAdmin.ts` berhasil diinisialisasi sebagai singleton server-only (`server-only` guarded).
   - Mendukung credential dari `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string env) dengan fallback ke Application Default Credentials / Project ID.
   - Variabel terdokumentasi rapi di `.env.example`.
2. **Sub-Task 2 (Migrasi liveFirestoreService ke Admin SDK)**:
   - `src/features/articles/data/liveFirestoreService.ts` dialihkan ke `getAdminFirestore()` di server context.
   - Filter query `where('status', '==', 'published')` dipertahankan mutlak untuk keamanan status draft.
   - Multi-tier resilience: Admin SDK -> Client SDK public-read fallback -> Seed cache data dengan warning log.
3. **Sub-Task 3 (Custom Claims RBAC & Server Action)**:
   - Skema Zod hierarki role: `superadmin` (3) > `editor` (2) > `reporter` (1) di `src/features/auth/schemas.ts`.
   - Server Action `setUserRoleAction` di `src/features/auth/serverActions.ts` menggunakan `getAdminAuth().setCustomUserClaims()`.
   - *Status Eksekusi*: Helper siap, siap dijalankan pada 5 akun staf begitu persetujuan user diberikan.
4. **Sub-Task 4 (Update firestore.rules ke Custom Claims)**:
   - Aturan `firestore.rules` diperbarui mendukung fungsi `hasRole(role)` dan `isSuperAdmin()` berbasis claims `request.auth.token.role`.
   - Fallback email hardcoded dipertahankan selama masa transisi agar staf tidak terkunci.
   - *Catatan Kritis*: Draft rules telah di-commit ke Git tapi **TIDAK dideploy** ke production Firestore tanpa konfirmasi eksplisit user (Protokol Bagian B).
5. **Sub-Task 5 (Session Cookie Flow)**:
   - Endpoint `POST` & `DELETE` di `src/app/api/auth/session/route.ts` untuk pertukaran ID token Firebase menjadi httpOnly cookie `__session` (durasi 5 hari, `sameSite: 'lax'`).
   - `LoginPage.tsx` otomatis mengontak endpoint sesi setelah berhasil login di client.
6. **Sub-Task 6 (Middleware Logic Guard)**:
   - `src/middleware.ts` memproteksi rute `/batutv-control/*` di Edge Runtime dengan memeriksa cookie `__session` (D-018). Request tanpa cookie otomatis dialihkan ke `/login?redirect=...`.

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

## Catatan Kredensial Firebase Admin Service Account (Prasyarat CI/CD & Production Build)
Untuk pipeline CI/CD produksi mandiri penuh di luar sandbox:
- **Kebutuhan**: Environment variable `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON private key) atau kredensial ADC GCP (`GOOGLE_APPLICATION_CREDENTIALS`) diperlukan agar Next.js Server Components dan Node.js build runner dapat mengautentikasi Firestore live secara langsung tanpa fallback seed.
- **Jadwal Eksekusi**: Wajib diinjeksi dan diaudit sebelum Fase 7 (Cutover). Untuk fase pengembangan saat ini, arsitektur hybrid live-first dengan graceful fallback terverifikasi aman dan tidak menggagalkan build.

## Sisa Pekerjaan Fase 2 (10%)
1. Unit testing suite untuk mapper, Zod schema, dan repository.
2. Pengintegrasian/pemberdayaan `ArticleBentoGrid` & `ArticleSkeleton` di rute portal publik.

## Technical Debt Teridentifikasi (Fase 2)
1. **Heuristik Deteksi isBreaking & Region**:
   - Logika penentuan `isBreaking` dan `region` di `articleMapper.ts` saat ini menggunakan string matching heuristik pada teks tag (`breaking`, `utama`, nama kota).
   - Pendekatan ini rentan terhadap variasi penulisan atau typo editor.
   - **Rencana Mitigasi**: Pada Fase 6/7, ganti dengan field boolean eksplisit (`isBreaking: boolean`, `region: RegionEnum`) terstruktur di schema Firestore dan form admin CMS.

2. **Migrasi Server Fetcher ke Firebase Admin SDK (D-002 Compliance)**:
   - *Kondisi*: `generateStaticParams()` dan `generateMetadata()` di `app/(portal)/berita/[slug]/page.tsx` saat ini masih menggunakan Web Client SDK (`firebase/firestore`).
   - *Penyebab*: Client SDK digunakan sebagai transisi cepat porting Fase 2 sebelum infrastruktur credentials Admin SDK dipasang.
   - *Alasan Ditunda ke Fase 3*: Inisialisasi Firebase Admin SDK (`firebase-admin`) dijadwalkan secara utuh pada **Fase 3 (Authentication & RBAC)** untuk menangani token/session verification cookie httpOnly dan middleware. Memindahkan fetcher artikel sekarang sebelum arsitektur `firebase-admin` Fase 3 berdiri akan menyebabkan inisialisasi ganda dan fragmentasi arsitektur.
   - *Rencana Mitigasi (Fase 3)*: Begitu modul server Admin SDK (`src/lib/firebaseAdmin.ts`) selesai di Fase 3, `liveFirestoreService.ts` akan dialihkan menggunakan Admin SDK untuk semua server-side runtime Next.js.

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
