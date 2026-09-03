# Current Migration Status

## Catatan Reset (2026-09-02)
Riwayat git sebelumnya (commit d5d1204/614b844 dan progres Fase 1 yang pernah dilaporkan) tidak ditemukan
di repository ini maupun di remote GitHub manapun. Proses migrasi dimulai ulang dari checkpoint baru dengan
verifikasi command-by-command untuk setiap klaim progres.

## Overview
- **Project**: BatuTV News Portal
- **Target Framework**: Next.js 16 App Router (Full Stack)
- **Database**: Firebase Firestore (`batutv-next`)
- **Last Updated**: 2026-09-02 (Reset & Verifikasi Riil)

## Phase Status Summary

| Phase | Description | Status | Progress |
|---|---|---|---|
| **Fase 0** | Handover Infrastructure & Handover Docs | 🟢 Selesai | 100% |
| **Fase 1** | Fondasi (Next.js 16, App Router Root, ESLint, Firestore SDK, UI) | 🟢 Selesai | 100% |
| **Fase 2** | Articles (Pilot Domain - Repository, Schemas, Actions, SSR Pages) | ⚪ Siap Dimulai | 0% |
| **Fase 3** | Authentication & RBAC (httpOnly Cookies, Middleware Guard) | ⚪ Belum Dimulai | 0% |
| **Fase 4** | Videos & Media (YouTube Integration, Player, Storage) | ⚪ Belum Dimulai | 0% |
| **Fase 5** | Taksonomi (Categories, Tags, Archive Routing) | ⚪ Belum Dimulai | 0% |
| **Fase 6** | Pages, Navigation, Settings, Users (Static Pages, Menus, Sync) | ⚪ Belum Dimulai | 0% |
| **Fase 7** | Cutover, 23 Audit Scripts, Final Cleanup | ⚪ Belum Dimulai | 0% |

## Temuan Audit & Resolusi Riil (2026-09-02)
1. **Status Build Next.js (`npx next build --webpack`)**:
   - **Hasil**: Lolos bersih `EXIT: 0` (Kompilasi Webpack sukses dalam 5.8 detik, 7/7 halaman statis berhasil di-generate).
   - **Akar Masalah Prerender Sebelumnya**: Container environment mengekspor `NODE_ENV=development`. Next.js App Router mengaktifkan development bindings proxy untuk React dispatcher saat render SSG, menyebabkan `resolveDispatcher()` mengembalikan `null` sehingga memicu `TypeError: Cannot read properties of null (reading 'use')`.
   - **Solusi**: Dikonfigurasi penanganan otomatis mode produksi pada `next.config.ts` saat argumen `build` dijalankan, serta diselaraskan dengan script npm `build:next`.
2. **Status Dev Server & Typecheck**:
   - `timeout 15 npx next dev -p 3001`: Ready dalam 573ms tanpa error.
   - `npx tsc --noEmit`: Lolos bersih `EXIT: 0` dengan 0 error.
3. **Status Domain Code**:
   - `src/features/articles/` terverifikasi aktif sesuai D-016 di `DECISIONS.md`.
   - `src/features/news/` telah dihapus/dialihkan.
   - CLI `next` terpasang di `node_modules/.bin/next` (Next.js 16.3.4).

## Penyelesaian 6 Item Prasyarat Fase 1
1. **D-010 s.d. D-015 Lengkap**: Format standar (Keputusan, Alasan, Alternatif dipertimbangkan, Konsekuensi) telah ditulis lengkap di `DECISIONS.md`. D-011 secara eksplisit mencatat koreksi terhadap D-008, D-012 mencatat mode toleransi TypeScript sementara, dan D-014 mencatat otomasi `@types/react`.
2. **Domain Berita Resmi: `articles` (D-016)**: Domain diputuskan dan dicatat di `DECISIONS.md`. Folder `src/features/news/` telah direname menjadi `src/features/articles/`. Semua referensi di `PROJECT.md`, `ARCHITECTURE.md`, dan `MIGRATION-PLAN.md` telah diselaraskan.
3. **Dokumentasi Basi Diperbarui**: `PROJECT.md` §6 kini merujuk ke `CURRENT-STATUS.md` sebagai live single source of truth. Tabel `ARCHITECTURE.md` telah dikoreksi sesuai D-011.
4. **Urutan DECISIONS.md Rapi**: Nomor berurutan dari D-001 hingga D-016.
5. **Rencana Konkret Strict Mode**: Target transisi `strict: true` telah dicatat di `MIGRATION-PLAN.md` sebagai blocking exit criteria Fase 7.
6. **Otomasi Script Build**: `package.json` telah dikonfigurasi dengan script `build:next`, `dev:next`, dan `start:next` yang berjalan otomatis tanpa langkah manual.

## Technical Debt & Open Items Tracked (Transferred to Specific Phases)
The following technical debts identified during audits are formally recorded and tracked:
1. **AdminStore & Legacy Stores Porting**: In-memory `newsAdminStore.ts`, `userAdminStore.ts`, and `videoAdminStore.ts` are active during transition; scheduled for full repository porting in **Fase 2, Fase 3, and Fase 4**.
2. **Media Upload Flow**: Client-side storage vs Server Action multipart upload pipeline will be standardized in **Fase 4 (Videos & Media)**.
3. **AI SDK Integration (`@google/genai`)**: Currently stubbed in admin SEO/tag generator; will be connected via official Server Action in **Fase 6 (Settings & AI)**.
4. **Security Audit for `firestore.rules`**: Initial rules exist; deep RBAC security matrix review and audit rule testing scheduled in **Fase 3 & Fase 7**.
5. **Dual Lockfiles (`bun.lock` + `package-lock.json`)**: `package-lock.json` is the primary npm lockfile in production container; lockfile consolidation cleanup scheduled for **Fase 7**.
6. **TypeScript Strictness**: `strict: false` in root `tsconfig.json` temporarily allows gradual legacy migration; 39 legacy typecheck warnings/errors tracked and targeted for 0-error `strict: true` in **Fase 7**.

## Files Migrated in Phase 1
- `PROJECT.md`, `ARCHITECTURE.md`, `MIGRATION-PLAN.md`, `DECISIONS.md`, `CURRENT-STATUS.md`, `CLAUDE-RULES.md`
- `eslint.config.mjs`, `commitlint.config.js`, `.husky/pre-commit`, `.husky/commit-msg`
- `src/config/env.ts` & `src/config/site.ts`
- `src/lib/firebase/admin.ts` & `src/lib/firebase/client.ts`
- `src/lib/db.ts`
- `src/lib/utils.ts`
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/not-found.tsx`
- `src/features/articles/` (Actions, Schemas, Types, Components)
- `src/components/ui/` (Button, Input, Card, Badge, Skeleton, Dialog, Sheet, Table)
- `src/middleware.ts`
- `vitest.config.ts`, `.github/workflows/ci.yml`, `components.json`
