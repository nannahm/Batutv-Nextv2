import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

// Custom Vite plugin to handle /sitemap.xml, /sitemap-news.xml, /robots.txt with exact MIME types
function seoEndpointsPlugin(): Plugin {
  return {
    name: 'batutv-seo-endpoints',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0];

        if (url === '/sitemap.xml') {
          try {
            const publicPath = path.resolve(__dirname, 'public/sitemap.xml');
            if (fs.existsSync(publicPath)) {
              const content = fs.readFileSync(publicPath, 'utf-8');
              res.setHeader('Content-Type', 'application/xml; charset=utf-8');
              res.setHeader('Cache-Control', 'public, max-age=3600');
              res.statusCode = 200;
              res.end(content);
              return;
            }
          } catch (e) {
            console.error('Error serving /sitemap.xml:', e);
          }
        }

        if (url === '/sitemap-news.xml') {
          try {
            const publicPath = path.resolve(__dirname, 'public/sitemap-news.xml');
            if (fs.existsSync(publicPath)) {
              const content = fs.readFileSync(publicPath, 'utf-8');
              res.setHeader('Content-Type', 'application/xml; charset=utf-8');
              res.setHeader('Cache-Control', 'public, max-age=1800');
              res.statusCode = 200;
              res.end(content);
              return;
            }
          } catch (e) {
            console.error('Error serving /sitemap-news.xml:', e);
          }
        }

        if (url === '/robots.txt') {
          try {
            const publicPath = path.resolve(__dirname, 'public/robots.txt');
            if (fs.existsSync(publicPath)) {
              const content = fs.readFileSync(publicPath, 'utf-8');
              res.setHeader('Content-Type', 'text/plain; charset=utf-8');
              res.setHeader('Cache-Control', 'public, max-age=86400');
              res.statusCode = 200;
              res.end(content);
              return;
            }
          } catch (e) {
            console.error('Error serving /robots.txt:', e);
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), seoEndpointsPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            icons: ['lucide-react'],
            firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          },
        },
      },
    },
  };
});
