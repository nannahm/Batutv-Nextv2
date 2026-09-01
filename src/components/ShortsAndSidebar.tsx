import React from 'react';
import { Play } from 'lucide-react';
import { VideoNews, NewsArticle } from '../types/news';

export interface ShortVideoItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoEmbedId?: string;
  href: string;
  slug: string;
  duration?: string;
}

export interface PopularNewsItemData {
  id: string;
  rank: number;
  title: string;
  href: string;
  slug: string;
  category?: string;
  date?: string;
}

export const defaultBatuTvShorts: ShortVideoItem[] = [
  {
    id: 'short-1',
    title: 'Budi Arie Minta Maaf soal Isu Pemilu Dipercepat: Tidak Ada Kaitan dengan Jokowi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=400&auto=format&fit=crop',
    videoEmbedId: 'dQw4w9WgXcQ',
    href: '/video/budi-arie-minta-maaf-isu-pemilu',
    slug: 'budi-arie-minta-maaf-isu-pemilu',
    duration: '0:58',
  },
  {
    id: 'short-2',
    title: 'Botok Ungkap Persiapan Demo 27 Agustus di DPR: Tak Ada Niat Rusuh, Tak Ditunggangi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=400&auto=format&fit=crop',
    videoEmbedId: 'dQw4w9WgXcQ',
    href: '/video/persiapan-demo-27-agustus-dpr',
    slug: 'persiapan-demo-27-agustus-dpr',
    duration: '0:45',
  },
  {
    id: 'short-3',
    title: 'Hakim Tolak Praperadilan Keempat Roy Suryo soal Larangan ke Luar Negeri',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400&auto=format&fit=crop',
    videoEmbedId: 'dQw4w9WgXcQ',
    href: '/video/hakim-tolak-praperadilan-roy-suryo',
    slug: 'hakim-tolak-praperadilan-roy-suryo',
    duration: '0:52',
  },
  {
    id: 'short-4',
    title: 'MENTERI KEHUTANAN: 42 KASUS PIDANA KARHUTLA DIPROSES HUKUM',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=400&auto=format&fit=crop',
    videoEmbedId: 'dQw4w9WgXcQ',
    href: '/video/menteri-kehutanan-kasus-pidana-karhutla',
    slug: 'menteri-kehutanan-kasus-pidana-karhutla',
    duration: '1:00',
  },
  {
    id: 'short-5',
    title: 'KUALITAS UDARA BERBAHAYA, SISWA DI RIAU BELAJAR DARI RUMAH',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?q=80&w=400&auto=format&fit=crop',
    videoEmbedId: 'dQw4w9WgXcQ',
    href: '/video/kualitas-udara-berbahaya-riau',
    slug: 'kualitas-udara-berbahaya-riau',
    duration: '0:49',
  },
];

export const defaultPopularNews: PopularNewsItemData[] = [
  {
    id: 'pop-1',
    rank: 1,
    title: 'Situasi Terkini DPR! Jelang Demo 27 Agustus 2026, Pengamanan Berlapis Diperketat',
    href: '/berita/situasi-terkini-dpr-demo-27-agustus',
    slug: 'situasi-terkini-dpr-demo-27-agustus',
    category: 'Nasional',
    date: '26/08/2026',
  },
  {
    id: 'pop-2',
    rank: 2,
    title: 'Jelang Aksi 27 Agustus, Aliansi Masyarakat Pati Suarakan Aspirasi Kebijakan Agraria',
    href: '/berita/jelang-aksi-aliansi-masyarakat-pati',
    slug: 'jelang-aksi-aliansi-masyarakat-pati',
    category: 'Daerah',
    date: '26/08/2026',
  },
  {
    id: 'pop-3',
    rank: 3,
    title: 'Jelang Aksi 27 Agustus di DPR, 4 Bus Warga Pati Siap Berangkat Kawal Tuntutan',
    href: '/berita/warga-pati-siap-berangkat-ke-dpr',
    slug: 'warga-pati-siap-berangkat-ke-dpr',
    category: 'Nasional',
    date: '26/08/2026',
  },
  {
    id: 'pop-4',
    rank: 4,
    title: 'FULL! Kontroversi Pemblokiran Rekening Aktivis dan Penjelasan Resmi OJK',
    href: '/berita/kontroversi-pemblokiran-rekening-aktivis',
    slug: 'kontroversi-pemblokiran-rekening-aktivis',
    category: 'Ekonomi Bisnis',
    date: '26/08/2026',
  },
];

interface ShortsAndSidebarProps {
  shorts?: ShortVideoItem[];
  popularNews?: PopularNewsItemData[];
  onPlayVideo?: (video: VideoNews | ShortVideoItem) => void;
  onSelectArticle?: (article: NewsArticle | PopularNewsItemData) => void;
}

/**
 * S04 — BATUTV SHORTS + SIDEBAR
 * 
 * S04.1 — MAIN CONTENT: BATUTV SHORTS (70-75% width)
 *   ├── Section Title: BATUTV SHORTS
 *   ├── Accent Line: short red indicator
 *   └── Shorts List: 5 portrait cards with play button and bottom text
 * 
 * S04.2 — SIDEBAR: BERITA TERPOPULER (25-30% width)
 *   └── Numbered circular rank badges (1, 2, 3, 4) with clear titles and dividers
 */
export const ShortsAndSidebar: React.FC<ShortsAndSidebarProps> = ({
  shorts = defaultBatuTvShorts,
  popularNews = defaultPopularNews,
  onPlayVideo,
  onSelectArticle,
}) => {
  const handleShortClick = (e: React.MouseEvent<HTMLAnchorElement>, short: ShortVideoItem) => {
    e.preventDefault();
    if (onPlayVideo) {
      onPlayVideo(short);
    }
  };

  const handlePopularClick = (e: React.MouseEvent<HTMLAnchorElement>, item: PopularNewsItemData) => {
    e.preventDefault();
    if (onSelectArticle) {
      onSelectArticle(item);
    }
  };

  return (
    <section
      id="s04-batutv-shorts-sidebar"
      aria-label="BatuTV Shorts dan Berita Terpopuler"
      className="batutv-shorts-sidebar-section w-full py-2.5 sm:py-3"
    >
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* S04.1 — MAIN CONTENT / BATUTV SHORTS (8 / 12 cols = ~67-70%) */}
          <div className="lg:col-span-8 flex flex-col">
            {/* Section Header */}
            <div className="section-header mb-3.5 sm:mb-4">
              <h2
                id="batutv-shorts-title"
                className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight font-sans"
              >
                BATUTV SHORTS
              </h2>
              {/* Short Red Accent Line */}
              <div
                aria-hidden="true"
                className="w-12 h-1 bg-[#c8102e] mt-1.5 rounded-full"
              />
            </div>

            {/* Shorts List (5 Horizontal Portrait Cards) */}
            <div className="shorts-list-container relative -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar scroll-smooth">
              <div className="flex items-stretch gap-1.5 sm:gap-2 min-w-[660px] sm:min-w-0">
                {shorts.slice(0, 5).map((short, idx) => (
                  <article
                    key={short.id || idx}
                    id={`s04-short-card-${idx + 1}`}
                    className="short-card flex-1 min-w-[125px] sm:min-w-0 relative aspect-[9/14] rounded-lg overflow-hidden group shadow-sm bg-slate-900 select-none flex flex-col justify-end"
                  >
                    <a
                      href={short.href}
                      onClick={(e) => handleShortClick(e, short)}
                      aria-label={`Tonton short: ${short.title}`}
                      className="relative w-full h-full flex flex-col justify-end p-2.5 sm:p-3 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 z-10"
                    >
                      {/* Thumbnail Background */}
                      <img
                        src={short.thumbnailUrl}
                        alt={short.title}
                        className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 group-hover:brightness-95 transition-all duration-300 pointer-events-none"
                        loading="lazy"
                      />

                      {/* Top subtle brand badge "#VOD by BatuTV" */}
                      <div className="absolute top-2 left-0 right-0 flex justify-center z-10 pointer-events-none opacity-90">
                        <span className="text-[11px] font-black italic text-red-500 tracking-tighter drop-shadow-md">
                          #VOD <span className="text-[10px] font-normal text-white not-italic font-sans">by BatuTV</span>
                        </span>
                      </div>

                      {/* Centered Play Button */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                      >
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 group-hover:scale-110 group-hover:bg-[#c8102e] transition-all duration-200 shadow-md">
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                        </div>
                      </div>

                      {/* Dark Gradient Overlay for Text Legibility */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-1 pointer-events-none"
                      />

                      {/* Bottom Title */}
                      <div className="relative z-10 mt-auto">
                        <h3 className="text-xs sm:text-[13px] md:text-[13.5px] font-bold text-white leading-snug line-clamp-3 group-hover:text-red-100 transition-colors drop-shadow-sm font-sans">
                          {short.title}
                        </h3>
                      </div>
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* S04.2 — SIDEBAR / POPULAR NEWS (4 / 12 cols = ~30-33%) */}
          <aside
            id="s04-popular-sidebar"
            aria-label="Berita Terpopuler"
            className="lg:col-span-4 bg-white rounded-xl border border-slate-100 p-4 sm:p-5 shadow-none"
          >
            {/* Popular List with Circular Number Badges */}
            <div className="divide-y divide-slate-100/80">
              {popularNews.slice(0, 4).map((item) => (
                <article
                  key={item.id || item.rank}
                  id={`s04-popular-item-${item.rank}`}
                  className="popular-item py-2.5 first:pt-0 last:pb-0 group"
                >
                  <a
                    href={item.href}
                    onClick={(e) => handlePopularClick(e, item)}
                    aria-label={`Berita terpopuler peringkat ${item.rank}: ${item.title}`}
                    className="flex items-start gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md p-0.5 -m-0.5"
                  >
                    {/* Red Circular Rank Badge */}
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-[#c8102e] text-white font-extrabold text-xs sm:text-[13px] flex items-center justify-center shadow-none group-hover:scale-105 transition-transform">
                        {item.rank}
                      </span>
                    </div>

                    {/* News Title */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-[13.5px] font-bold text-slate-800 leading-snug group-hover:text-[#c8102e] transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      {item.category && (
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                          <span className="uppercase text-slate-500 font-semibold">{item.category}</span>
                          {item.date && (
                            <>
                              <span>•</span>
                              <span>{item.date}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </a>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
