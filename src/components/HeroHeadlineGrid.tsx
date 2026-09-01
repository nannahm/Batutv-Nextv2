import React from 'react';
import { NewsArticle } from '../types/news';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { TerpopulerWidget, TerpopulerItem, defaultTerpopulerNews } from './TerpopulerWidget';

export interface HeadlineArticleData {
  id: string;
  category: string;
  title: string;
  imageUrl: string;
  imageAlt?: string;
  date: string;
  time: string;
  href: string;
  slug: string;
}

export interface AdBannerData {
  id: string;
  brand: string;
  tagline?: string;
  title: string;
  period?: string;
  promoBadge?: string;
  description?: string;
  voucherText?: string;
  voucherAmount?: string;
  targetUrl: string;
  imageUrl?: string;
}

export interface HeroHeadlineData {
  main: HeadlineArticleData;
  subHeadlines: HeadlineArticleData[];
  terpopuler?: TerpopulerItem[];
  adBanner?: AdBannerData;
  // Backwards compatibility
  secondary?: HeadlineArticleData[];
}

export const defaultHeroHeadlineData: HeroHeadlineData = {
  main: {
    id: 's03-headline-main',
    category: 'News',
    title: 'Perubahan Rute Transjakarta Selama Demo di Gedung DPR RI',
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1200&auto=format&fit=crop',
    imageAlt: 'Bus Transjakarta melintas di tengah dinamika situasi kota',
    date: 'Kamis, 27 Agustus 2026',
    time: '08:52 WIB',
    href: '/berita/perubahan-rute-transjakarta-selama-demo-dpr',
    slug: 'perubahan-rute-transjakarta-selama-demo-dpr',
  },
  subHeadlines: [
    {
      id: 's03-sub-1',
      category: 'News',
      title: 'FMN UI Serukan Demo di Istana Hari Ini, Bawa Sejumlah Tuntutan ke...',
      imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=500&auto=format&fit=crop',
      imageAlt: 'Aksi mahasiswa menyampaikan aspirasi di hadapan publik',
      date: '27/08/2026',
      time: '08:43 WIB',
      href: '/berita/fmn-ui-serukan-demo-di-istana-hari-ini',
      slug: 'fmn-ui-serukan-demo-di-istana-hari-ini',
    },
    {
      id: 's03-sub-2',
      category: 'News',
      title: 'Jelang Demo di DPR, Aparat Amankan Sejumlah Terduga...',
      imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=500&auto=format&fit=crop',
      imageAlt: 'Aparat keamanan melakukan pengawasan dan pengamanan di sekitar lokasi',
      date: '27/08/2026',
      time: '08:31 WIB',
      href: '/berita/jelang-demo-di-dpr-aparat-amankan-sejumlah-terduga-penyusup',
      slug: 'jelang-demo-di-dpr-aparat-amankan-sejumlah-terduga-penyusup',
    },
    {
      id: 's03-sub-3',
      category: 'News',
      title: 'Tuntutan Hukum Mati Koruptor Membentang di Depan Gedung DPR RI Pa...',
      imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=500&auto=format&fit=crop',
      imageAlt: 'Spanduk tuntutan pemberantasan korupsi di depan gedung parlemen',
      date: '27/08/2026',
      time: '08:20 WIB',
      href: '/berita/tuntutan-hukum-mati-koruptor-membentang-di-depan-dpr',
      slug: 'tuntutan-hukum-mati-koruptor-membentang-di-depan-dpr',
    },
    {
      id: 's03-sub-4',
      category: 'News',
      title: 'Dikawal Ratusan Ojol, Botok Tiba di Gedung DPR',
      imageUrl: 'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?q=80&w=500&auto=format&fit=crop',
      imageAlt: 'Iring-iringan massa dan pengemudi ojek online menuju lokasi',
      date: '27/08/2026',
      time: '08:15 WIB',
      href: '/berita/dikawal-ratusan-ojol-botok-tiba-di-gedung-dpr',
      slug: 'dikawal-ratusan-ojol-botok-tiba-di-gedung-dpr',
    },
  ],
  adBanner: {
    id: 's03-ad-epson',
    brand: 'EPSON',
    tagline: 'ENGINEERED FOR good',
    title: 'MERDEKA MENCETAK ONLINE ROADSHOW',
    period: 'Periode promo : 01-31 Agustus 2026',
    promoBadge: 'MERDEKA MENCETAK',
    description: 'Rayakan Kemerdekaan Indonesia dengan semangat merdeka dalam mencetak, tanpa rasa khawatir, dan berkarya tanpa batas bersama Epson.',
    voucherText: 'Dapatkan Shopping Voucher (IDR 150.000)',
    voucherAmount: 'Setiap pembelian Produk L121, L3211, L3251',
    targetUrl: '#',
  },
};

interface HeroHeadlineGridProps {
  data?: HeroHeadlineData;
  onSelectArticle?: (article: NewsArticle | HeadlineArticleData | TerpopulerItem) => void;
  onNavigateMore?: () => void;
}

/**
 * S03 — HERO / HEADLINE GRID
 * 
 * - Mobile/Tablet (< lg):
 *   1. Berita Utama (Headline Card): Gambar dengan rounded corners di atas, di bawahnya terdapat Kategori merah | Jam, lalu Judul tebal hitam.
 *   2. Sub-Headlines Grid: 2 kolom berdampingan (col-span-1), masing-masing foto di atas, teks kategori & jam di bawah, lalu judul tebal hitam.
 * 
 * - Desktop (>= lg):
 *   1. Berita Utama (Overlay Card): Gambar besar dengan gradient overlay gelap, teks judul & badge overlay putih.
 *   2. Sub-Headlines Grid: List thumbnail horizontal 2x2.
 *   3. Kolom Berita Terpopuler di sisi kanan (4 / 12 kolom, persis desain Gambar 1).
 */
export const HeroHeadlineGrid: React.FC<HeroHeadlineGridProps> = ({
  data = defaultHeroHeadlineData,
  onSelectArticle,
  onNavigateMore,
}) => {
  const { main, subHeadlines = defaultHeroHeadlineData.subHeadlines, terpopuler = defaultTerpopulerNews } = data;

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>, item: HeadlineArticleData) => {
    e.preventDefault();
    if (onSelectArticle) {
      onSelectArticle(item);
    }
  };

  return (
    <section
      id="s03-hero-headline"
      aria-label="Berita Utama & Headline"
      className="hero-headline-section w-full pt-3 sm:pt-4 md:pt-5 pb-3 sm:pb-4 md:pb-5 select-none"
    >
      <div className="hero-headline-container w-full max-w-[1020px] mx-auto px-3.5 sm:px-4 md:px-0">
        <div className="w-full flex flex-col md:flex-row items-start md:gap-[34px] gap-6">
          
          {/* ========================================================= */}
          {/* MAIN COLUMN (Mobile/Tablet: Full width | Desktop: 731px)  */}
          {/* ========================================================= */}
          <div className="w-full md:w-[731px] md:max-w-[731px] md:shrink-0 flex flex-col space-y-4 sm:space-y-5">
            
            {/* ------------------------------------------------------- */}
            {/* S03.1 — MAIN HEADLINE CARD (731px x 411px - 16:9)       */}
            {/* ------------------------------------------------------- */}
            <article
              id="s03-main-headline"
              className="headline-card main-headline-card w-full group"
            >
              {/* MOBILE & TABLET VIEW (< md): Gambar di atas + Teks di bawah */}
              <div className="block md:hidden">
                <a
                  href={main.href}
                  onClick={(e) => handleCardClick(e, main)}
                  aria-label={`Berita utama: ${main.title}`}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md"
                >
                  {/* Headline Image with 16:9 Aspect Ratio */}
                  <div className="w-full aspect-[16/9] rounded-md overflow-hidden bg-slate-900 shadow-sm relative">
                    <img
                      src={getOptimizedImageUrl(main.imageUrl, 'large')}
                      alt={main.imageAlt || main.title}
                      className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
                      loading="eager"
                      fetchPriority="high"
                    />
                  </div>

                  {/* Headline Text Meta below image */}
                  <div className="pt-3 space-y-1.5">
                    {/* Category & Time (e.g. "News | 08:52 WIB") */}
                    <div className="flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-slate-500">
                      <span className="text-red-600 font-bold capitalize">
                        {main.category || 'News'}
                      </span>
                      <span>|</span>
                      <span>{main.time || '08:52 WIB'}</span>
                    </div>

                    {/* Headline Title */}
                    <h2 className="text-lg xs:text-xl sm:text-2xl font-black text-slate-900 leading-tight sm:leading-snug tracking-tight group-hover:text-red-600 transition-colors font-sans">
                      {main.title}
                    </h2>
                  </div>
                </a>
              </div>

              {/* DESKTOP VIEW (>= md): Card 731px x 411px (16:9) dengan dark gradient overlay */}
              <div className="hidden md:block relative w-full md:w-[731px] md:h-[411px] aspect-[16/9] rounded-md overflow-hidden shadow-sm bg-slate-900">
                <a
                  href={main.href}
                  onClick={(e) => handleCardClick(e, main)}
                  aria-label={`Berita utama: ${main.title}`}
                  className="relative w-full h-full flex flex-col justify-end p-6 text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-red-600 z-10"
                >
                  <img
                    src={getOptimizedImageUrl(main.imageUrl, 'large')}
                    alt={main.imageAlt || main.title}
                    className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out z-0 pointer-events-none"
                    loading="eager"
                    fetchPriority="high"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-1 pointer-events-none"
                  />
                  <div className="relative z-10 space-y-3 max-w-2xl">
                    <h2 className="text-[25px] font-black text-white leading-[1.25] tracking-tight group-hover:text-red-100 transition-colors drop-shadow-sm font-sans">
                      {main.title}
                    </h2>
                    <div className="flex items-center flex-wrap gap-2.5 pt-0.5 text-[13px] font-medium text-slate-200">
                      <span className="inline-flex items-center justify-center bg-white text-slate-950 font-black text-xs px-2.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                        {main.category || 'NEWS'}
                      </span>
                      <time dateTime={`${main.date} ${main.time}`} className="text-slate-200 font-normal">
                        {main.date} | {main.time}
                      </time>
                    </div>
                  </div>
                </a>
              </div>
            </article>

            {/* ------------------------------------------------------- */}
            {/* S03.2 — SUB-HEADLINES GRID (153px x 86px 16:9 Thumbnails) */}
            {/* ------------------------------------------------------- */}
            
            {/* MOBILE & TABLET VIEW (< md): 2-Kolom Berdampingan */}
            <div
              id="s03-sub-headlines-grid-mobile"
              className="grid grid-cols-2 gap-3.5 sm:gap-4 md:hidden pt-1"
            >
              {subHeadlines.slice(0, 4).map((item, idx) => (
                <article
                  key={item.id || idx}
                  id={`s03-sub-headline-m-${idx + 1}`}
                  className="sub-headline-card group flex flex-col"
                >
                  <a
                    href={item.href}
                    onClick={(e) => handleCardClick(e, item)}
                    aria-label={`Berita: ${item.title}`}
                    className="flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md"
                  >
                    {/* Top: Image Thumbnail 16:9 with rounded corners */}
                    <div className="w-full aspect-[16/9] rounded-md overflow-hidden bg-slate-100 relative shadow-2xs">
                      <img
                        src={getOptimizedImageUrl(item.imageUrl, 'medium')}
                        alt={item.imageAlt || item.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                        loading="lazy"
                      />
                    </div>

                    {/* Bottom: Meta (Category & Time) + Title */}
                    <div className="pt-2 space-y-1">
                      <div className="text-[11px] sm:text-xs font-semibold text-slate-500 leading-tight">
                        <span className="text-red-600 font-bold capitalize block xs:inline">
                          {item.category || 'News'}
                        </span>
                        <span className="block text-slate-400 font-normal text-[10.5px] sm:text-xs mt-0.5">
                          {item.time || '08:43 WIB'}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-[13.5px] font-black text-slate-900 leading-snug line-clamp-3 group-hover:text-red-600 transition-colors font-sans">
                        {item.title}
                      </h3>
                    </div>
                  </a>
                </article>
              ))}
            </div>

            {/* DESKTOP VIEW (>= md): List Horizontal 2x2 with Exact 153px x 86px (16:9) Thumbnails */}
            <div
              id="s03-sub-headlines-grid-desktop"
              className="hidden md:grid grid-cols-2 gap-4 pt-1"
            >
              {subHeadlines.slice(0, 4).map((item, idx) => (
                <article
                  key={item.id || idx}
                  id={`s03-sub-headline-d-${idx + 1}`}
                  className="sub-headline-card group"
                >
                  <a
                    href={item.href}
                    onClick={(e) => handleCardClick(e, item)}
                    aria-label={`Berita: ${item.title}`}
                    className="flex items-start gap-3 p-1 rounded-lg transition-all duration-200 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  >
                    {/* Formatted to 153px x 86px (16:9) */}
                    <div className="w-[153px] h-[86px] min-w-[153px] max-w-[153px] aspect-[16/9] flex-shrink-0 rounded-md overflow-hidden bg-slate-100 relative">
                      <img
                        src={getOptimizedImageUrl(item.imageUrl, 'thumbnail')}
                        alt={item.imageAlt || item.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-1">
                      <h3 className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors font-sans">
                        {item.title}
                      </h3>
                      <span className="text-xs font-semibold text-slate-400 capitalize">
                        {item.category || 'News'}
                      </span>
                    </div>
                  </a>
                </article>
              ))}
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: TERPOPULER WIDGET (255px on Desktop)        */}
          {/* ========================================================= */}
          <aside
            aria-label="Widget Terpopuler"
            className="w-full md:w-[255px] md:max-w-[255px] md:shrink-0"
          >
            <TerpopulerWidget
              id="s03-right-terpopuler"
              items={terpopuler}
              onSelectArticle={onSelectArticle}
              onNavigateMore={onNavigateMore}
            />
          </aside>

        </div>
      </div>
    </section>
  );
};
