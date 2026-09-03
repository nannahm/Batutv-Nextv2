# Architecture & Design Guide

## 1. Directory Structure (Next.js 16 App Router)

```
src/
├── app/
│   ├── (portal)/                     # Route Group: Public Portal
│   │   ├── layout.tsx                # Public Layout (Header, Breaking News, Footer)
│   │   ├── page.tsx                  # Public Homepage
│   │   ├── berita/[slug]/page.tsx    # Article Detail (SSR + generateMetadata)
│   │   ├── kategori/[slug]/page.tsx  # Category Archive
│   │   ├── tag/[slug]/page.tsx       # Tag Archive
│   │   ├── author/[id]/page.tsx      # Author Archive
│   │   └── video/page.tsx            # Video Catalog & Livestream
│   ├── (auth)/                       # Route Group: Authentication
│   │   └── login/page.tsx            # Login Page
│   ├── (dashboard)/                  # Route Group: BatuTV Control CMS
│   │   └── batutv-control/
│   │       ├── layout.tsx            # Dashboard shell (Sidebar, Topbar, Auth Guard)
│   │       ├── page.tsx              # Overview & Analytics
│   │       ├── articles/page.tsx     # Articles Management
│   │       ├── videos/page.tsx       # Videos Management
│   │       ├── categories/page.tsx   # Categories Management
│   │       ├── tags/page.tsx         # Tags Management
│   │       ├── authors/page.tsx      # Authors Management
│   │       ├── pages/page.tsx        # Static Pages Management
│   │       ├── navigation/page.tsx   # Navigation Menu Builder
│   │       ├── media/page.tsx        # Media Library
│   │       ├── users/page.tsx        # User Management & RBAC
│   │       └── settings/page.tsx     # Site & System Settings
│   ├── api/                          # API Route Handlers
│   │   ├── auth/session/route.ts     # Session cookie exchange
│   │   ├── health/route.ts           # Health check endpoint
│   │   └── webhooks/route.ts         # Ingestion webhook
│   ├── sitemap.ts                    # Dynamic Next.js sitemap
│   ├── robots.ts                     # Dynamic robots.txt
│   ├── layout.tsx                    # Root Layout
│   ├── not-found.tsx                 # Custom 404 page
│   └── global-error.tsx              # Error boundary
├── features/                         # Feature-Driven Modules
│   └── <domain>/                     # e.g., articles, videos, auth, categories, etc.
│       ├── data/                     # Repositories (Firestore server-side)
│       ├── schemas/                  # Zod validation schemas
│       ├── actions/                  # Next.js Server Actions
│       ├── components/               # Domain-specific UI components
│       └── hooks/                    # Domain-specific hooks
├── components/
│   ├── ui/                           # Primitive Shadcn/Radix components
│   ├── feedback/                     # Toast, Alerts, Loading states
│   ├── layouts/                      # Shared structural layouts
│   └── providers/                    # Context providers (Theme, Query, Session)
├── config/
│   ├── env.ts                        # @t3-oss/env-nextjs environment validation
│   └── site.ts                       # Site-wide configuration & constants
├── lib/
│   ├── db.ts                         # Single entry point for Admin Firestore
│   ├── firebase/
│   │   ├── admin.ts                  # Firebase Admin SDK initialization (Server only)
│   │   └── client.ts                 # Firebase Client SDK initialization
│   └── utils.ts                      # Common utility functions (cn, formatters)
├── observability/                    # Logger, metrics, SLO, audit trackers
└── middleware.ts                     # Auth verification & route protection
```

## 2. Core Principles
- **Server-Only Firebase Admin**: Firebase Admin SDK (`firebase-admin`) is strictly isolated to server contexts (`src/lib/firebase/admin.ts`, Server Actions, Route Handlers). Never exported or imported into client components.
- **Repository Pattern**: All database interactions pass through well-defined repository interfaces (`I<Domain>Repository`) implemented with Firestore in `src/features/<domain>/data/`.
- **Domain Standardization**: Domain berita secara resmi dinamakan `articles` (`src/features/articles/`, `IArticleRepository`, `firestoreArticleRepository`, `/batutv-control/articles/page.tsx`) sesuai D-016.
- **Validation**: All mutations and external inputs are validated via Zod schemas in `src/features/<domain>/schemas/`.
- **Authentication**: Firebase Auth on client triggers server-side exchange for `httpOnly` secure session cookies, validated via `middleware.ts`.

## 3. Pemetaan Direktori Eksisting ke Target (Sesuai D-011)

| Direktori Eksisting | Status & Tindakan Target | Rujukan Keputusan |
|---|---|---|
| `src/app/**` | **Dipertahankan & Diadaptasi** ke App Router Next.js 16 (Bukan dibuang dari nol, menyerap implementasi portal dan dashboard yang sudah berjalan) | **D-011** |
| `src/features/news/` | **Direname & Distandarisasi** menjadi `src/features/articles/` | **D-016** |
| `src/observability/**` & `src/scripts/**` | **Dipertahankan utuh** untuk 23 skrip audit operasional | **D-009, D-015** |
| `src/repositories/firestore/**` | **Di-port bertahap** ke `src/features/<domain>/data/` | **D-003, D-007** |
| `src/lib/firebase/**` | **Single source of truth** untuk Admin SDK (server) & Client SDK (browser) | **D-002** |
| `src/App.tsx` & `server.ts` | **Dipertahankan selama masa transisi**, dipensiunkan pada Fase 7 | **D-004** |

