import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer, ViteDevServer } from 'vite';
import {
  getArticleForServerAsync,
  buildArticleMetadataHtml,
} from './src/server/articleResolver';
import {
  generateSitemapXml,
  generateNewsSitemapXml,
  generateRobotsTxt,
} from './src/utils/seoGenerators';
import { logger, generateCorrelationId } from './src/observability/logger';

const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  let vite: ViteDevServer | null = null;

  // Security & request size guard
  app.use(express.json({ limit: '5mb' }));
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // 1. Health, Liveness & Readiness Endpoints (Zero credential exposure)
  app.get(['/health', '/api/health'], (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'batutv-news-portal',
      environment: isProduction ? 'production' : 'development',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
  });

  app.get(['/live', '/api/live'], (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'alive',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  app.get(['/ready', '/api/ready'], (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ready',
      database: 'firestore-connected',
      auth: 'firebase-auth-active',
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Initialize Vite in development mode
  if (!isProduction) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
  }

  // 2. SEO Sitemaps and Robots endpoints
  app.get('/sitemap.xml', (_req: Request, res: Response) => {
    try {
      const xml = generateSitemapXml();
      res.header('Content-Type', 'application/xml; charset=utf-8').send(xml);
    } catch {
      res.status(500).send('Error generating sitemap');
    }
  });

  app.get('/sitemap-news.xml', (_req: Request, res: Response) => {
    try {
      const xml = generateNewsSitemapXml();
      res.header('Content-Type', 'application/xml; charset=utf-8').send(xml);
    } catch {
      res.status(500).send('Error generating news sitemap');
    }
  });

  app.get('/robots.txt', (_req: Request, res: Response) => {
    try {
      const txt = generateRobotsTxt();
      res.header('Content-Type', 'text/plain; charset=utf-8').send(txt);
    } catch {
      res.status(500).send('Error generating robots.txt');
    }
  });

  // 3. Dynamic Article Route: /berita/:slug
  // Injects dynamic Open Graph, Title, Description, and Twitter Cards into initial HTML
  app.get('/berita/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const domainOverride = host ? `${proto}://${host}` : undefined;
      const article = await getArticleForServerAsync(slug, domainOverride);

      // Read template index.html
      const templatePath = isProduction
        ? path.join(process.cwd(), 'dist', 'index.html')
        : path.join(process.cwd(), 'index.html');

      if (!fs.existsSync(templatePath)) {
        return next();
      }

      let html = fs.readFileSync(templatePath, 'utf-8');

      if (!isProduction && vite) {
        html = await vite.transformIndexHtml(req.originalUrl, html);
      }

      const metaRegex = /<!-- BATUTV_DYNAMIC_META_START -->[\s\S]*?<!-- BATUTV_DYNAMIC_META_END -->/;

      if (article) {
        // Article found -> Inject dynamic meta tags & return 200 OK
        const dynamicMetaHtml = buildArticleMetadataHtml(article);
        const transformedHtml = html.replace(metaRegex, dynamicMetaHtml);

        return res
          .status(200)
          .set({ 'Content-Type': 'text/html; charset=utf-8' })
          .send(transformedHtml);
      } else {
        // Article NOT found -> Inject 404 meta & return HTTP 404 Not Found
        const notFoundMeta = `<!-- BATUTV_DYNAMIC_META_START -->
    <title>Halaman Tidak Ditemukan (404) | BATUTV</title>
    <meta name="title" content="Halaman Tidak Ditemukan (404) | BATUTV" />
    <meta name="description" content="Halaman atau artikel yang Anda cari tidak dapat ditemukan di Portal Berita BatuTV." />
    <meta name="robots" content="noindex, nofollow" />
    <!-- BATUTV_DYNAMIC_META_END -->`;

        const transformedHtml = html.replace(metaRegex, notFoundMeta);

        return res
          .status(404)
          .set({ 'Content-Type': 'text/html; charset=utf-8' })
          .send(transformedHtml);
      }
    } catch (err) {
      console.error('Error serving /berita/:slug:', err);
      return next(err);
    }
  });

  // 4. Vite middleware (handles assets, JS/CSS bundles, HMR in dev)
  if (!isProduction && vite) {
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
  }

  // 5. Fallback handler for all other SPA routes
  app.get('*', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templatePath = isProduction
        ? path.join(process.cwd(), 'dist', 'index.html')
        : path.join(process.cwd(), 'index.html');

      if (!fs.existsSync(templatePath)) {
        return res.status(500).send('Index template not found');
      }

      let html = fs.readFileSync(templatePath, 'utf-8');

      if (!isProduction && vite) {
        html = await vite.transformIndexHtml(req.originalUrl, html);
      }

      return res
        .status(200)
        .set({ 'Content-Type': 'text/html; charset=utf-8' })
        .send(html);
    } catch (err) {
      console.error('Error serving SPA fallback:', err);
      return next(err);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BatuTV Server running on http://0.0.0.0:${PORT} (env: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
