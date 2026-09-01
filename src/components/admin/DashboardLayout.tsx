import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DashboardPage } from './DashboardPage';
import { PlaceholderModule } from './PlaceholderModule';
import { NewsManagementModule } from './news/NewsManagementModule';
import { VideoManagementModule } from './video/VideoManagementModule';
import { CategoryManagementModule } from './category/CategoryManagementModule';
import { MediaManagementModule } from './media/MediaManagementModule';
import { TagManagementModule } from './tag/TagManagementModule';
import { AuthorManagementModule } from './author/AuthorManagementModule';
import { PageManagementModule } from './pages/PageManagementModule';
import { NavigationManagementModule } from './navigation/NavigationManagementModule';
import { FooterManagementModule } from './footer/FooterManagementModule';
import { SiteSettingsModule } from './settings/SiteSettingsModule';
import { SystemSettingsModule } from './system/SystemSettingsModule';
import { UserManagementModule } from './user/UserManagementModule';
import { AccessDeniedModule } from './common/AccessDeniedModule';
import { checkRoutePermission } from '../../utils/rbac';
import { AdminUser } from '../../types/admin';
import { getStoredAdminSession } from '../../utils/authSession';

interface DashboardLayoutProps {
  currentPath: string;
  user: AdminUser | null;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentPath,
  user,
  onNavigate,
  onLogout,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const effectiveUser = user || getStoredAdminSession();

  // Get Page Title from current path
  const getPageTitle = (path: string) => {
    if (path.startsWith('/batutv-control/berita/tulis')) return 'Tulis Berita Baru';
    if (path.startsWith('/batutv-control/berita/edit')) return 'Edit Naskah Berita';
    if (path.startsWith('/batutv-control/berita/draft')) return 'Draft Berita';
    if (path.startsWith('/batutv-control/berita/terbit')) return 'Berita Terbit';
    if (path.startsWith('/batutv-control/berita/terjadwal')) return 'Berita Terjadwal';
    if (path.startsWith('/batutv-control/berita/sampah')) return 'Sampah Berita';
    if (path.startsWith('/batutv-control/berita/headline')) return 'Headline Hero Portal';
    if (path.startsWith('/batutv-control/berita')) return 'Manajemen Berita';

    if (path.startsWith('/batutv-control/video/tambah')) return 'Tambah Video Baru';
    if (path.startsWith('/batutv-control/video/edit')) return 'Edit Video';
    if (path.startsWith('/batutv-control/video/draft')) return 'Draft Video';
    if (path.startsWith('/batutv-control/video/terjadwal')) return 'Video Terjadwal';
    if (path.startsWith('/batutv-control/video/terbit')) return 'Video Terbit';
    if (path.startsWith('/batutv-control/video/sampah')) return 'Sampah Video';
    if (path.startsWith('/batutv-control/video')) return 'Manajemen Video';

    switch (path) {
      case '/batutv-control/dashboard':
        return 'Dashboard';
      case '/batutv-control/kategori':
        return 'Manajemen Kategori';
      case '/batutv-control/media':
        return 'Penyimpanan Media';
      case '/batutv-control/tag':
        return 'Manajemen Tag & Topik';
      case '/batutv-control/penulis':
      case '/batutv-control/master-data/penulis':
        return 'Master Data Penulis';
      case '/batutv-control/pages':
      case '/batutv-control/master-data/pages':
        return 'Master Data Pages';
      case '/batutv-control/navigasi':
        return 'Manajemen Navigasi SO2';
      case '/batutv-control/footer':
      case '/batutv-control/master-data/footer':
        return 'Master Data Footer';
      case '/batutv-control/site-settings':
      case '/batutv-control/master-data/site-settings':
        return 'Master Data Site Settings';
      case '/batutv-control/banner':
        return 'Manajemen Banner (Ditunda)';
      case '/batutv-control/pengguna':
        return 'Manajemen Pengguna';
      case '/batutv-control/pengaturan':
        return 'Pengaturan Sistem';
      default:
        return 'BatuTV Control';
    }
  };

  // Render appropriate view based on route and RBAC permission
  const renderContent = () => {
    // 1. Central RBAC Route Guard
    const permission = checkRoutePermission(effectiveUser?.role, currentPath);
    if (!permission.allowed) {
      return (
        <AccessDeniedModule
          currentPath={currentPath}
          moduleName={permission.moduleName}
          requiredRoleName={permission.requiredRoleName}
          reason={permission.reason}
          user={effectiveUser}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
      );
    }

    // 2. KONTEN -> BERITA Module Handling
    if (currentPath.startsWith('/batutv-control/berita')) {
      return (
        <NewsManagementModule
          currentPath={currentPath}
          onNavigate={onNavigate}
          currentUser={effectiveUser}
        />
      );
    }

    // 3. KONTEN -> VIDEO Module Handling
    if (currentPath.startsWith('/batutv-control/video')) {
      return (
        <VideoManagementModule
          currentPath={currentPath}
          onNavigate={onNavigate}
          onNavigateToPublic={onNavigate}
          currentUser={effectiveUser}
        />
      );
    }

    switch (currentPath) {
      case '/batutv-control/dashboard':
        return <DashboardPage user={effectiveUser} onNavigate={onNavigate} />;

      case '/batutv-control/kategori':
        return <CategoryManagementModule onNavigateToPublic={onNavigate} />;

      case '/batutv-control/media':
        return <MediaManagementModule onNavigateToPublic={onNavigate} />;

      case '/batutv-control/tag':
        return <TagManagementModule onNavigateToPublic={onNavigate} />;

      case '/batutv-control/penulis':
      case '/batutv-control/master-data/penulis':
        return <AuthorManagementModule onNavigateToPublic={onNavigate} />;

      case '/batutv-control/pages':
      case '/batutv-control/master-data/pages':
        return <PageManagementModule onNavigateToPublic={onNavigate} />;

      case '/batutv-control/navigasi':
        return <NavigationManagementModule onNavigateToPublic={onNavigate} />;

      case '/batutv-control/footer':
      case '/batutv-control/master-data/footer':
        return <FooterManagementModule onNavigateToPublic={onNavigate} />;

      case '/batutv-control/site-settings':
      case '/batutv-control/master-data/site-settings':
        return <SiteSettingsModule onNavigateToPublic={onNavigate} />;

      case '/batutv-control/banner':
        return (
          <PlaceholderModule
            moduleName="Manajemen Banner & Iklan"
            moduleCode="BANNER (DITUNDA)"
            description="Modul banner iklan dan promosi portal BatuTV saat ini ditunda sesuai instruksi project."
            onBackToDashboard={() => onNavigate('/batutv-control/dashboard')}
          />
        );

      case '/batutv-control/pengguna':
        return (
          <UserManagementModule
            currentUser={effectiveUser}
            onNavigateToSettings={() => onNavigate('/batutv-control/pengaturan')}
            onNavigateToAuthors={() => onNavigate('/batutv-control/penulis')}
          />
        );

      case '/batutv-control/pengaturan':
        return (
          <SystemSettingsModule
            currentUser={effectiveUser}
            onNavigate={onNavigate}
          />
        );

      default:
        return <DashboardPage user={effectiveUser} onNavigate={onNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans text-slate-900 selection:bg-red-600 selection:text-white">
      {/* A02.1 — SIDEBAR */}
      <Sidebar
        currentPath={currentPath}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={onNavigate}
        onLogout={onLogout}
        user={effectiveUser}
      />

      {/* MAIN WRAPPER (Offset on desktop for fixed sidebar) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 transition-all duration-300">
        {/* A02.2 — TOPBAR */}
        <Topbar
          user={effectiveUser}
          pageTitle={getPageTitle(currentPath)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={onLogout}
          onNavigate={onNavigate}
        />

        {/* A02.3 — MAIN CONTENT CONTAINER */}
        <main
          id="a02-main-content-area"
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"
        >
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

