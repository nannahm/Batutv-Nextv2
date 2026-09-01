import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  ExternalLink,
  Search,
  Globe,
  Radio,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  generateSitemapXml,
  generateNewsSitemapXml,
  generateRobotsTxt,
  getPublishedSitemapEntries,
  getNewsSitemapEntries,
} from '../../utils/seoGenerators';

interface SeoViewerPageProps {
  type: 'sitemap' | 'news-sitemap' | 'robots';
  onNavigate: (path: string) => void;
}

export const SeoViewerPage: React.FC<SeoViewerPageProps> = ({ type, onNavigate }) => {
  const [copied, setCopied] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('raw');

  const content = React.useMemo(() => {
    if (type === 'sitemap') return generateSitemapXml();
    if (type === 'news-sitemap') return generateNewsSitemapXml();
    return generateRobotsTxt();
  }, [type]);

  const sitemapEntries = React.useMemo(() => {
    if (type === 'sitemap') return getPublishedSitemapEntries();
    return [];
  }, [type]);

  const newsEntries = React.useMemo(() => {
    if (type === 'news-sitemap') return getNewsSitemapEntries();
    return [];
  }, [type]);

  useEffect(() => {
    const title =
      type === 'sitemap'
        ? 'Sitemap XML (sitemap.xml) | BatuTV'
        : type === 'news-sitemap'
        ? 'Google News Sitemap (sitemap-news.xml) | BatuTV'
        : 'Robots.txt | BatuTV';
    document.title = title;
  }, [type]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename =
      type === 'sitemap'
        ? 'sitemap.xml'
        : type === 'news-sitemap'
        ? 'sitemap-news.xml'
        : 'robots.txt';
    const mimeType = type === 'robots' ? 'text/plain' : 'application/xml';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const badgeText =
    type === 'sitemap'
      ? 'Sitemap.xml • W3C Standard XML'
      : type === 'news-sitemap'
      ? 'Google News Sitemap • schema.org / news'
      : 'Robots.txt • Search Crawler Directives';

  const titleText =
    type === 'sitemap'
      ? '/sitemap.xml'
      : type === 'news-sitemap'
      ? '/sitemap-news.xml'
      : '/robots.txt';

  const descriptionText =
    type === 'sitemap'
      ? 'Daftar seluruh URL resmi BatuTV (Beranda, Berita Terbit, Video, Kategori, Tag, Halaman) yang siap diindeks Search Console & Google.'
      : type === 'news-sitemap'
      ? 'Sitemap khusus Google News memuat artikel berita terbit dengan timestamp ISO, judul, nama publikasi, dan bahasa resmi id.'
      : 'Direktif crawler bot mesin pencari mengizinkan pengindeksan seluruh konten publik dan memblokir akses area kontrol admin.';

  return (
    <main className="flex-1 w-full bg-[#f8f9fa] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('/sitemap.xml')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                type === 'sitemap' ? 'bg-red-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              /sitemap.xml
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/sitemap-news.xml')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                type === 'news-sitemap' ? 'bg-red-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              /sitemap-news.xml
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/robots.txt')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                type === 'robots' ? 'bg-red-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              /robots.txt
            </button>
          </div>
        </div>

        {/* Top Header Card */}
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{badgeText}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                {titleText}
              </h1>
              <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
                {descriptionText}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              {type !== 'robots' && (
                <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setViewMode('raw')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      viewMode === 'raw' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Raw XML
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('formatted')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      viewMode === 'formatted' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tabel Visual
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-black text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 block text-[11px]">Format / MIME</span>
              <span className="font-mono font-bold text-slate-800">
                {type === 'robots' ? 'text/plain' : 'application/xml'}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 block text-[11px]">Total URL Terdaftar</span>
              <span className="font-bold text-slate-800">
                {type === 'sitemap'
                  ? `${sitemapEntries.length} URL`
                  : type === 'news-sitemap'
                  ? `${newsEntries.length} Berita`
                  : '3 Aturan Crawler'}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 block text-[11px]">Status Validasi</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Valid & Siap Crawl
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 block text-[11px]">Target Bot</span>
              <span className="font-bold text-slate-800">Googlebot & All Spiders</span>
            </div>
          </div>
        </div>

        {/* Content Viewer */}
        {viewMode === 'formatted' && type === 'sitemap' ? (
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-slate-900 text-sm">Pratinjau Tabel URL Sitemap</h3>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter URL..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Tipe</th>
                    <th className="py-2.5 px-3">URL Lokasi (&lt;loc&gt;)</th>
                    <th className="py-2.5 px-3">Last Modified</th>
                    <th className="py-2.5 px-3">Frekuensi</th>
                    <th className="py-2.5 px-3">Prioritas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sitemapEntries
                    .filter((e) => !filterQuery || e.loc.toLowerCase().includes(filterQuery.toLowerCase()))
                    .map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                            {item.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-800">
                          <a
                            href={item.loc}
                            onClick={(e) => {
                              e.preventDefault();
                              const path = item.loc.replace(/^https?:\/\/[^/]+/, '');
                              onNavigate(path || '/');
                            }}
                            className="hover:text-red-600 hover:underline inline-flex items-center gap-1"
                          >
                            {item.loc}
                          </a>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500">{item.lastmod}</td>
                        <td className="py-2 px-3 text-slate-600">{item.changefreq}</td>
                        <td className="py-2 px-3 font-semibold text-slate-700">{item.priority}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : viewMode === 'formatted' && type === 'news-sitemap' ? (
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden space-y-4 p-5">
            <h3 className="font-bold text-slate-900 text-sm">Pratinjau Artikel Google News</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Judul Berita</th>
                    <th className="py-2.5 px-3">URL Berita (&lt;loc&gt;)</th>
                    <th className="py-2.5 px-3">Tanggal Terbit</th>
                    <th className="py-2.5 px-3">Publikasi / Bahasa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {newsEntries.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-medium text-slate-900 max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700">
                        <a
                          href={item.loc}
                          onClick={(e) => {
                            e.preventDefault();
                            const path = item.loc.replace(/^https?:\/\/[^/]+/, '');
                            onNavigate(path || '/');
                          }}
                          className="hover:text-red-600 hover:underline"
                        >
                          {item.loc}
                        </a>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-500">{item.publicationDate}</td>
                      <td className="py-2 px-3 text-slate-600">
                        {item.publicationName} ({item.publicationLanguage})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-md overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-slate-400 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-slate-300 font-semibold">{titleText}</span>
              </div>
              <span>{type === 'robots' ? 'UTF-8 Plain Text' : 'UTF-8 XML Document'}</span>
            </div>
            <pre className="p-4 sm:p-6 text-xs sm:text-sm font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed selection:bg-red-600 selection:text-white">
              {content}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
};
