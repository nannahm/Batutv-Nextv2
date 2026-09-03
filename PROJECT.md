# BatuTV News Portal - Project Overview

## 1. Identitas Project
- **Nama**: BatuTV News Portal & BatuTV Control
- **Fokus**: Portal Berita & Televisi Digital Kota Batu, Malang Raya, dan Jawa Timur
- **Stack Target**: Next.js 16 (App Router), TypeScript Strict, Tailwind CSS, Shadcn UI, Zustand, React Hook Form + Zod, `@t3-oss/env-nextjs`, Vitest + Playwright, Firebase Firestore & Firebase Auth (Server-side Admin + Client SDK).

## 2. Fitur Utama
- **Portal Publik**:
  - Homepage: Headline grid, latest news, trending ticker, regional spotlight, editor's choice, video spotlight, livestream player modal.
  - Berita: Detail artikel (`/berita/[slug]`), rich typography, social share, related news, dynamic SEO OpenGraph metadata.
  - Kategori, Tags, dan Author Archive.
  - Video & Streaming: Video catalog, YouTube embed player modal, live broadcast banner.
  - Interaktif: Modal pencarian cepat, bookmark lokal, drawer navigasi mobile, mode baca.
- **Admin CMS Panel (`/batutv-control`)**:
  - Articles Management: CRUD, filter status/kategori, workflow draft/publish, headline/pilihan editor toggle, AI assist tags.
  - Video Management: CRUD YouTube video, thumbnail generator otomatis, live broadcast status toggle.
  - Taxonomy: Manajemen Kategori & Tags dengan generator slug.
  - Halaman & Navigasi: Custom static pages, hierarchical header & footer menu builder.
  - Media Library: Upload aset, asset picker modal, filter format gambar.
  - Pengguna & RBAC: Superadmin, Editor, Wartawan, Kontributor.
  - Site Settings: Branding, logos, media sosial, cache & sinkronisasi Firestore.
- **Infrastruktur & Observability**:
  - Generator dynamic `sitemap.xml` & `robots.txt`.
  - Health checks (`/api/health`, `/live`, `/ready`).
  - 23 script audit operasional (Security, SLO, Disaster Recovery, Backup Verification, Cost & Capacity, Drift Detection).

## 3. Tujuan Migrasi Arsitektur
- Migrasi dari Single-Page Application (Vite + Express fallback) ke Next.js 16 App Router full-stack.
- Penerapan Server Components, Server Actions, Dynamic SSR Metadata (`generateMetadata`), dan standardisasi HTTP-only session cookies.
- TypeScript Strict type safety di seluruh domain modul (diaktifkan penuh pada kriteria exit Fase 7).
- Penerapan repository pattern terisolasi (`IArticleRepository`, `IVideoRepository`, dll.) dengan koneksi Firestore Admin di server dan Client SDK di browser.

## 4. Standar Penamaan Domain
Sesuai **D-016 (DECISIONS.md)**, penamaan domain resmi untuk modul berita adalah **`articles`** (`src/features/articles/`, `IArticleRepository`, `firestoreArticleRepository`, dan `/batutv-control/articles`).

## 5. Struktur Modul & Arsitektur
Arsitektur lengkap dan panduan direktori didefinisikan dalam `ARCHITECTURE.md`.

## 6. Kondisi Project Saat Ini (Live Status)
> **Catatan Penting**: Status live progres migrasi, tahapan fase aktif, dan catatan audit operasional dikelola secara dinamis dalam satu sumber kebenaran tunggal (**Single Source of Truth**):
> 👉 **Silakan rujuk langsung ke `CURRENT-STATUS.md`** untuk melihat status real-time setiap fase dan capaian terakhir.

