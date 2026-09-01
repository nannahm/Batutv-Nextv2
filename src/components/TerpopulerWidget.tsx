import React from 'react';
import { ChevronRight } from 'lucide-react';
import { NewsArticle } from '../types/news';
import { HeadlineArticleData } from './HeroHeadlineGrid';

export interface TerpopulerItem {
  id: string;
  rank: number;
  title: string;
  href: string;
  slug: string;
  timeAgo?: string;
  category?: string;
  date?: string;
  views?: number;
}

export const defaultTerpopulerNews: TerpopulerItem[] = [
  {
    id: 'pop-1',
    rank: 1,
    title: 'Muktamar ke-35 NU: Pemilihan Ketum PBNU Pakai Mekanisme AHWA',
    slug: 'muktamar-ke-35-nu-pemilihan-ketum-pbnu-pakai-mekanisme-ahwa',
    href: '/berita/muktamar-ke-35-nu-pemilihan-ketum-pbnu-pakai-mekanisme-ahwa',
    timeAgo: '10 jam lalu',
    category: 'Nasional',
  },
  {
    id: 'pop-2',
    rank: 2,
    title: 'Muktamar ke-35 NU Putuskan Hukum Chip Otak hingga Bitcoin',
    slug: 'muktamar-ke-35-nu-putuskan-hukum-chip-otak-hingga-bitcoin',
    href: '/berita/muktamar-ke-35-nu-putuskan-hukum-chip-otak-hingga-bitcoin',
    timeAgo: '11 jam lalu',
    category: 'Nasional',
  },
  {
    id: 'pop-3',
    rank: 3,
    title: 'Prabowo Rapat Bareng Menhan-Panglima TNI, Bahas Syarat Suku Dayak Masuk Militer',
    slug: 'prabowo-rapat-bareng-menhan-panglima-tni-bahas-syarat-suku-dayak',
    href: '/berita/prabowo-rapat-bareng-menhan-panglima-tni-bahas-syarat-suku-dayak',
    timeAgo: '5 jam lalu',
    category: 'Nasional',
  },
  {
    id: 'pop-4',
    rank: 4,
    title: 'Muktamar NU: Rais Aam dan Ketum PBNU Dilarang Rangkap Jabatan Publik',
    slug: 'muktamar-nu-rais-aam-dan-ketum-pbnu-dilarang-rangkap-jabatan-publik',
    href: '/berita/muktamar-nu-rais-aam-dan-ketum-pbnu-dilarang-rangkap-jabatan-publik',
    timeAgo: '6 jam lalu',
    category: 'Nasional',
  },
  {
    id: 'pop-5',
    rank: 5,
    title: '10 Besar Klub Eropa dengan Tagihan Gaji Tertinggi, Real Madrid di Puncak',
    slug: '10-besar-klub-eropa-dengan-tagihan-gaji-tertinggi-real-madrid-di-puncak',
    href: '/berita/10-besar-klub-eropa-dengan-tagihan-gaji-tertinggi-real-madrid-di-puncak',
    timeAgo: '7 jam lalu',
    category: 'Olahraga',
  },
  {
    id: 'pop-6',
    rank: 6,
    title: 'Cerita Warga NTT Bertahan Hidup di Tengah Gempa Susulan',
    slug: 'cerita-warga-ntt-bertahan-hidup-di-tengah-gempa-susulan',
    href: '/berita/cerita-warga-ntt-bertahan-hidup-di-tengah-gempa-susulan',
    timeAgo: '8 jam lalu',
    category: 'Nasional',
  },
  {
    id: 'pop-7',
    rank: 7,
    title: 'Muktamar NU Desak Koperasi Desa Merah Putih Dievaluasi',
    slug: 'muktamar-nu-desak-koperasi-desa-merah-putih-dievaluasi',
    href: '/berita/muktamar-nu-desak-koperasi-desa-merah-putih-dievaluasi',
    timeAgo: '9 jam lalu',
    category: 'Ekonomi',
  },
  {
    id: 'pop-8',
    rank: 8,
    title: 'BPJS Ketenagakerjaan Salurkan Bantuan untuk Korban Gempa NTT, Wujud Nyata Kepedulian',
    slug: 'bpjs-ketenagakerjaan-salurkan-bantuan-untuk-korban-gempa-ntt-wujud-nyata-kepedulian',
    href: '/berita/bpjs-ketenagakerjaan-salurkan-bantuan-untuk-korban-gempa-ntt-wujud-nyata-kepedulian',
    timeAgo: '9 jam lalu',
    category: 'Sosial',
  },
  {
    id: 'pop-9',
    rank: 9,
    title: 'BYON Combat Showbiz 8: Jeka Saragih Tumbang di Ronde Pertama, Ammarul Raih Sabuk',
    slug: 'byon-combat-showbiz-8-jeka-saragih-tumbang-di-ronde-pertama-ammarul-raih-sabuk',
    href: '/berita/byon-combat-showbiz-8-jeka-saragih-tumbang-di-ronde-pertama-ammarul-raih-sabuk',
    timeAgo: '10 jam lalu',
    category: 'Olahraga',
  },
  {
    id: 'pop-10',
    rank: 10,
    title: 'Harga Emas Antam Sepekan: Sempat Meroket, Mendadak Anjlok Parah',
    slug: 'harga-emas-antam-sepekan-sempat-meroket-mendadak-anjlok-parah',
    href: '/berita/harga-emas-antam-sepekan-sempat-meroket-mendadak-anjlok-parah',
    timeAgo: '10 jam lalu',
    category: 'Bisnis',
  },
];

interface TerpopulerWidgetProps {
  items?: TerpopulerItem[];
  onSelectArticle?: (article: NewsArticle | HeadlineArticleData | TerpopulerItem) => void;
  onNavigateMore?: () => void;
  className?: string;
  id?: string;
  limit?: number;
  title?: string;
  maxHeight?: string;
}

/**
 * TerpopulerWidget (Desain Persis Video & Gambar 1)
 * - Header dengan aksen garis vertikal merah tebal di kiri dan judul "Terpopuler"
 * - Daftar 10 berita terpopuler yang dapat di-scroll vertikal secara mulus
 * - List nomor urut berongga (hollow text-stroke outline) warna oranye/coral
 * - Judul berita tebal dengan hover effect merah
 * - Keterangan waktu relatif (contoh: "10 jam lalu", "11 jam lalu", dsb.)
 * - Di bagian bawah scroll terdapat link/tulisan "Selengkapnya >"
 */
export const TerpopulerWidget: React.FC<TerpopulerWidgetProps> = ({
  items = defaultTerpopulerNews,
  onSelectArticle,
  onNavigateMore,
  className = '',
  id = 'sidebar-terpopuler-widget',
  limit = 10,
  title = 'Terpopuler',
  maxHeight = 'max-h-[465px]',
}) => {
  const displayItems = items.slice(0, limit);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, item: TerpopulerItem) => {
    e.preventDefault();
    if (onSelectArticle) {
      onSelectArticle(item);
    }
  };

  const handleMoreClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (onNavigateMore) {
      e.preventDefault();
      onNavigateMore();
    }
  };

  return (
    <aside
      id={id}
      aria-label="Berita Terpopuler"
      className={`w-full bg-transparent p-0 flex flex-col ${className}`}
    >
      {/* Header dengan Bar Merah Vertikal & Garis Bawah */}
      <div className="flex items-center gap-2 pb-2.5 mb-1 border-b border-slate-100 shrink-0">
        <span className="w-1.5 h-5 bg-red-600 rounded-xs inline-block shrink-0" aria-hidden="true" />
        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-sans">
          {title}
        </h3>
      </div>

      {/* Daftar Berita Terpopuler (Scrollable Container) */}
      <div
        className={`${maxHeight} overflow-y-auto overscroll-contain pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 transition-colors`}
        tabIndex={0}
        aria-label="Daftar 10 Berita Terpopuler"
      >
        <div className="flex flex-col">
          {displayItems.map((item, idx) => {
            const rankNumber = item.rank || idx + 1;

            return (
              <article
                key={item.id || item.slug || idx}
                id={`${id}-item-${rankNumber}`}
                className="py-2 border-b border-slate-100 first:pt-1 last:border-b-0 group"
              >
                <a
                  href={item.href || `/berita/${item.slug}`}
                  onClick={(e) => handleClick(e, item)}
                  aria-label={`Peringkat ${rankNumber}: ${item.title}`}
                  className="flex items-start gap-2.5 sm:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md"
                >
                  {/* Hollow Outlined Rank Number (Orange/Coral Stroke Persis Desain) */}
                  <div
                    className="w-7 sm:w-7.5 shrink-0 flex items-center justify-center pt-0.5 select-none"
                    aria-hidden="true"
                  >
                    <span
                      className="text-3xl sm:text-[32px] font-black italic leading-none font-sans tracking-tighter"
                      style={{
                        WebkitTextStroke: '2px #ff5945',
                        color: 'transparent',
                        fontFamily:
                          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      }}
                    >
                      {rankNumber}
                    </span>
                  </div>

                  {/* Content: Judul & Jam Lalu */}
                  <div className="flex-1 min-w-0 flex flex-col justify-start">
                    <h4 className="text-[13px] sm:text-[13.5px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors font-sans">
                      {item.title}
                    </h4>
                    <span className="text-[11px] sm:text-[11.5px] text-slate-400 font-normal mt-0.5 block">
                      {item.timeAgo || item.date || `${(rankNumber * 2 + 3) % 12 + 1} jam lalu`}
                    </span>
                  </div>
                </a>
              </article>
            );
          })}
        </div>

        {/* Tulisan Selengkapnya > di Bawah Berita Terpopuler (Persis seperti Video) */}
        <div className="pt-2.5 pb-1 flex items-center justify-start">
          <a
            href="/tren"
            onClick={handleMoreClick}
            className="inline-flex items-center gap-0.5 text-xs sm:text-[13px] font-bold text-[#ff5945] hover:text-red-700 transition-colors group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded"
          >
            <span>Selengkapnya</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </aside>
  );
};

