# Legacy Vite SPA Architecture Archive (BatuTV News Portal)

Folder ini menyimpan artefak kode arsitektur Single Page Application (SPA) berbasis Vite dan custom Express server yang digunakan sebelum migrasi penuh ke **Next.js 16 App Router**.

## Riwayat Berkas yang Diarsipkan:
- `App.tsx`: Komponen monolithic routing SPA lama (sebelumnya dimount di root aplikasi Vite).
- `main.tsx`: Client-side DOM mounting entry point (`createRoot(document.getElementById('root')!)`).
- `server.ts`: Custom Express server v5 port 3000 untuk dynamic SEO meta injection, sitemap proxy, dan static assets.
- `index.html`: Berkas template HTML statis Vite dengan root container `#root` dan initial splash animation.
- `vite.config.ts`: Konfigurasi build bundler Vite dan plugin Tailwind v4.

## Status Arsitektural Saat Ini:
1. Seluruh 104 rute aplikasi kini berjalan native di bawah Next.js App Router (`src/app/`).
2. Server-side rendering (SSR), Incremental Static Regeneration (ISR), dynamic metadata (`generateMetadata`), sitemap dinamis (`src/app/sitemap.ts`), dan health check API (`src/app/api/health`) telah sepenuhnya diambil alih oleh Next.js.
3. Seluruh berkas dalam folder ini dikecualikan (`exclude`) dari `tsconfig.json` dan tidak diikutsertakan dalam proses build produksi Next.js.
4. Skrip npm untuk menjalankan environment legacy ini dialihkan ke alias:
   - `npm run legacy:vite` (menjalankan bundler Vite)
   - `npm run legacy:preview` (menjalankan vite preview)
   - `npm run legacy:server` (menjalankan Express server arsip)
