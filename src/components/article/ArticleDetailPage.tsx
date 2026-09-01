import React, { useState, useEffect } from 'react';
import {
  Share2,
  Bookmark,
  Heart,
  Clock,
  Calendar,
  Eye,
  User,
  ChevronRight,
  Flame,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ThumbsUp,
  Smile,
  AlertCircle,
  Send,
} from 'lucide-react';
import { SocialShareGroup } from '../common/SocialShareGroup';
import { NewsArticle } from '../../types/news';
import { allNewsArticles, heroLeadArticle } from '../../data/dummyNews';
import { defaultLatestNewsPosts, defaultPopularNews, defaultTrendingSidebarItems } from '../../data/latestNewsData';
import { getArticleBySlug, getStoredArticles } from '../../data/newsAdminStore';
import { resolveArticleSlug, resolveArticleHref } from '../../utils/slugResolver';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';
import { getStoredSiteSettings } from '../../data/siteSettingsStore';
import { getBaseDomain } from '../../utils/seoGenerators';

interface ArticleDetailPageProps {
  slug?: string;
  article?: NewsArticle | null;
  onNavigate: (path: string) => void;
  onSelectCategory?: (categorySlug: string) => void;
  onSelectTag?: (tag: string) => void;
  onSelectAuthor?: (authorSlug: string) => void;
  onBookmark?: (article: NewsArticle) => void;
  isBookmarked?: boolean;
}

export interface DetailedArticleData {
  id: string;
  slug: string;
  category: string;
  categorySlug: string;
  title: string;
  subheadline: string;
  author: {
    name: string;
    role: string;
    slug: string;
    avatar: string;
    bio: string;
  };
  publishedAt: string;
  publishedIso: string;
  updatedAt: string;
  updatedIso: string;
  readTime: string;
  views: number;
  featuredImage: {
    url: string;
    alt: string;
    caption: string;
  };
  contentSections: {
    introParagraphs: string[];
    subheading1: string;
    paragraphs1: string[];
    quote: {
      text: string;
      sourceText: string;
      sourceHref: string;
    };
    secondImage: {
      url: string;
      alt: string;
      caption: string;
    };
    subheading2: string;
    paragraphs2: string[];
  };
  fullHtmlContent?: string;
  tags: { name: string; slug: string }[];
}

const cleanHtmlEntities = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, ' ');
};

/**
 * Robust HTML Sanitizer to prevent XSS & unsafe script injections
 * while preserving article structure, headings, blockquotes, lists, images, and links.
 */
export const sanitizeArticleHtml = (dirtyHtml: string): string => {
  if (!dirtyHtml) return '';
  return dirtyHtml
    // Strip script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Strip style tags and contents
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Strip non-whitelisted iframes (only allow reputable video embeds)
    .replace(/<iframe\b(?![^>]*(?:youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com))[^>]*>.*?<\/iframe>/gi, '')
    // Strip inline javascript handlers (onclick, onerror, onload, onmouseover, etc.)
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    // Strip javascript: pseudo protocols
    .replace(/href\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, 'href="#"')
    .replace(/src\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, 'src=""');
};

export const defaultSpecificArticle: DetailedArticleData = {
  id: 'art-nasional-menkes-dpr-donasi-ntt',
  slug: '165-dus-pasukam-ntt-menkes-ajak-anggota-dpr-super-kaya-ikut-bantu-warga',
  category: 'NASIONAL',
  categorySlug: 'nasional',
  title: '165 Dus Pasukam NTT! Menkes Ajak Anggota DPR Super Kaya Ikut Bantu Warga',
  subheadline: 'Pemerintah mendorong berbagai pihak untuk ikut membantu masyarakat di wilayah terdampak, termasuk melalui dukungan fasilitas kesehatan dan kebutuhan dasar warga.',
  author: {
    name: 'Muhamad Yandi',
    role: 'Jurnalis',
    slug: 'muhamad-yandi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    bio: 'Jurnalis desk nasional dan politik. Fokus pada isu kebijakan publik, parlemen, dan perkembangan sosial masyarakat di seluruh penjuru nusantara.'
  },
  publishedAt: 'Kamis, 27 Agustus 2026 | 18:30 WIB',
  publishedIso: '2026-08-27T18:30:00+07:00',
  updatedAt: 'Kamis, 27 Agustus 2026 | 19:05 WIB',
  updatedIso: '2026-08-27T19:05:00+07:00',
  readTime: '4 menit baca',
  views: 14820,
  featuredImage: {
    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
    alt: 'Suasana rapat kerja dan tinjauan fasilitas kesehatan masyarakat',
    caption: 'Sejumlah pasien dan perwakilan masyarakat terdampak mendapatkan perhatian khusus. (Foto: ANTARA FOTO/Cecio Vianalokhiz / Dok. Kemenkes RI)'
  },
  contentSections: {
    introParagraphs: [
      'Suara Media – Pemerintah terus mendorong berbagai pihak untuk ikut memberikan perhatian terhadap kondisi masyarakat di sejumlah wilayah.',
      'Dalam pembahasan terbaru, sejumlah pihak menilai dukungan terhadap masyarakat tidak hanya menjadi tanggung jawab pemerintah, tetapi juga membutuhkan keterlibatan berbagai unsur lintas sektoral.',
      'Menurut keterangan yang disampaikan, perhatian terhadap fasilitas umum, layanan kesehatan, serta kebutuhan dasar masyarakat menjadi salah satu hal krusial yang perlu diprioritaskan secara menyeluruh.'
    ],
    subheading1: 'Kondisi Masyarakat Menjadi Perhatian',
    paragraphs1: [
      'Sejumlah wilayah masih membutuhkan dukungan tambahan dalam hal perbaikan sarana medis dan logistik dasar. Pemerintah mengatakan akan terus melakukan koordinasi dengan berbagai pihak untuk memastikan bantuan dapat tersalurkan secara cepat dan tepat sasaran.',
      '"Yang paling penting adalah bagaimana masyarakat bisa mendapatkan dukungan nyata sesuai kebutuhan mendesak mereka di lapangan tanpa kendala birokrasi," ujar salah satu perwakilan dalam keterangan resmi yang diterima redaksi.',
      'Selain itu, pemerintah juga meminta agar proses penanganan dan pemulihan pascabencana dilakukan secara berkelanjutan, berkesinambungan, dan tidak hanya berfokus pada satu bentuk bantuan sesaat.'
    ],
    quote: {
      text: 'Mahasiswa Mundur Tertib Pukul 18.00 WIB, Massa Lain Masih Bertahan di DPR',
      sourceText: 'Baca Juga',
      sourceHref: '/berita/demo-27-agustus-2026-mulai-jam-berapa-cek-link-live-cctv'
    },
    secondImage: {
      url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1000&auto=format&fit=crop',
      alt: 'Pertemuan koordinasi rapat kerja pemulihan fasilitas kesehatan',
      caption: 'Menteri Kesehatan saat memaparkan rencana aksi perbaikan fasilitas kesehatan di hadapan Komisi IX DPR RI. (Foto: Dok. Humas Kemenkes RI / Biro Pers Media)'
    },
    subheading2: 'Dukungan Berbagai Pihak',
    paragraphs2: [
      'Sejumlah tokoh masyarakat dan anggota dewan juga menyampaikan pentingnya kerja sama yang sinergis antara pemerintah pusat, pemerintah daerah, lembaga filantropi, serta elemen masyarakat sipil.',
      'Dengan adanya koordinasi dan transparansi data yang baik, diharapkan berbagai persoalan mendesak di daerah terdampak dapat ditangani secara jauh lebih cepat, efektif, dan merata.',
      'Pemerintah menyatakan akan terus melakukan monitoring dan evaluasi mingguan terhadap perkembangan di lapangan guna memastikan target pemulihan sarana publik tercapai sesuai jadwal yang telah ditetapkan.'
    ]
  },
  tags: [
    { name: 'Nasional', slug: 'nasional' },
    { name: 'Pemerintah', slug: 'pemerintah' },
    { name: 'DPR', slug: 'dpr' },
    { name: 'Kesehatan', slug: 'kesehatan' },
    { name: 'Donasi', slug: 'donasi' },
    { name: 'Bantuan', slug: 'bantuan' },
    { name: 'NTT', slug: 'ntt' },
    { name: 'Puskesmas', slug: 'puskesmas' }
  ]
};

export interface BacaJugaItem {
  id: string;
  slug: string;
  href: string;
  title: string;
  category?: string;
}

/**
 * Splits HTML content after the N-th closing paragraph tag (</p>)
 * Returns { before, after }
 */
function splitHtmlAfterParagraphs(html: string, targetParagraphIndex: number = 3): { before: string; after: string } {
  if (!html) return { before: '', after: '' };

  const regex = /<\/p>/gi;
  let match: RegExpExecArray | null;
  let count = 0;
  let splitIndex = -1;

  while ((match = regex.exec(html)) !== null) {
    count++;
    if (count === targetParagraphIndex) {
      splitIndex = match.index + match[0].length;
      break;
    }
  }

  // Fallback if there are fewer paragraphs than target
  if (splitIndex === -1 && count > 0) {
    regex.lastIndex = 0;
    let lastMatchEnd = -1;
    while ((match = regex.exec(html)) !== null) {
      lastMatchEnd = match.index + match[0].length;
    }
    if (lastMatchEnd !== -1) {
      splitIndex = lastMatchEnd;
    }
  }

  if (splitIndex !== -1 && splitIndex < html.length) {
    return {
      before: html.substring(0, splitIndex),
      after: html.substring(splitIndex)
    };
  }

  return { before: html, after: '' };
}

/**
 * Inline "BACA JUGA" Component matching the approved reference design:
 * - Left: Large quote icon in BatuTV Purple (#3B1E7B)
 * - Divider: Subtle vertical border line
 * - Right: "Baca Juga" label (red) + Related Article Title (bold, dark, hover:red)
 * - SEO Semantic <a href="/berita/[slug]">
 */
export const BacaJugaBlock: React.FC<{
  item: BacaJugaItem;
  onNavigate: (path: string) => void;
}> = ({ item, onNavigate }) => {
  return (
    <aside
      aria-label="Baca Juga"
      className="baca-juga-inline not-prose my-6 sm:my-7 p-3.5 sm:p-4 bg-[#f8f9fa] border border-slate-100 rounded-lg shadow-none group transition-colors hover:bg-slate-100/60 hover:border-slate-200"
    >
      <a
        href={item.href}
        onClick={(e) => {
          e.preventDefault();
          onNavigate(item.href);
        }}
        className="flex items-center gap-3 sm:gap-4 no-underline text-inherit cursor-pointer"
      >
        {/* Quote Icon in BatuTV Purple */}
        <div className="shrink-0 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8 sm:w-9 sm:h-9 text-[#3B1E7B] fill-current shrink-0"
            aria-hidden="true"
          >
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.18zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.18z" />
          </svg>
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-8 sm:h-9 bg-slate-200 shrink-0" aria-hidden="true" />

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-medium text-red-600 block leading-tight">
            Baca Juga
          </span>
          <h4 className="font-bold text-slate-900 text-[13.5px] sm:text-[15px] leading-snug group-hover:text-red-600 transition-colors mt-0.5 sm:mt-1 line-clamp-2">
            {item.title}
          </h4>
        </div>
      </a>
    </aside>
  );
};

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({
  slug,
  article,
  onNavigate,
  onSelectCategory,
  onSelectTag,
  onSelectAuthor,
  onBookmark,
  isBookmarked = false
}) => {
  const [appDownloadToast, setAppDownloadToast] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<{ [key: string]: number }>({
    '👍': 342,
    '❤️': 189,
    '😮': 94,
    '😂': 16,
    '😢': 58,
    '😡': 12
  });

  const [commentInput, setCommentInput] = useState('');
  const [userNameInput, setUserNameInput] = useState('');
  const [commentsList, setCommentsList] = useState<
    Array<{ id: string; name: string; time: string; text: string; likes: number }>
  >([
    {
      id: 'c-1',
      name: 'Rahmat Hidayat',
      time: '15 menit lalu',
      text: 'Langkah yang sangat baik. Semoga bantuan fasilitas kesehatan di NTT bisa segera rampung agar pelayanan warga kembali normal.',
      likes: 14
    },
    {
      id: 'c-2',
      name: 'Dr. Hendra Gunawan',
      time: '42 menit lalu',
      text: 'Kolaborasi lintas sektor memang kunci percepatan penanganan faskes terdampak. Kawal terus transparansinya.',
      likes: 9
    },
    {
      id: 'c-3',
      name: 'Siti Maryam',
      time: '1 jam lalu',
      text: 'Semoga anggota dewan dan pengusaha tergerak hatinya untuk bergotong royong membantu saudara kita.',
      likes: 21
    }
  ]);

  // Determine current article data to display
  const currentData: DetailedArticleData = React.useMemo(() => {
    // If a specific article object was passed in or matching slug found
    if (article) {
      return {
        id: article.id,
        slug: article.slug,
        category: (article.category || 'NASIONAL').toUpperCase(),
        categorySlug: article.categorySlug || 'nasional',
        title: article.title,
        subheadline: article.summary || defaultSpecificArticle.subheadline,
        author: {
          name: article.author?.name || defaultSpecificArticle.author.name,
          role: article.author?.role || defaultSpecificArticle.author.role,
          slug: (article.author?.name || 'muhamad-yandi').toLowerCase().replace(/\s+/g, '-'),
          avatar: article.author?.avatar || defaultSpecificArticle.author.avatar,
          bio: defaultSpecificArticle.author.bio
        },
        publishedAt: article.publishedAt || defaultSpecificArticle.publishedAt,
        publishedIso: defaultSpecificArticle.publishedIso,
        updatedAt: defaultSpecificArticle.updatedAt,
        updatedIso: defaultSpecificArticle.updatedIso,
        readTime: article.readTime || '3 menit baca',
        views: article.views || 3420,
        featuredImage: {
          url: article.imageUrl || defaultSpecificArticle.featuredImage.url,
          alt: article.title,
          caption: article.imageCaption || `Dokumentasi liputan: ${article.title}. (Foto: BatuTV Media)`
        },
        contentSections: {
          introParagraphs: article.content && article.content.length > 0 ? article.content.slice(0, 2) : defaultSpecificArticle.contentSections.introParagraphs,
          subheading1: 'Kondisi Masyarakat Menjadi Perhatian',
          paragraphs1: article.content && article.content.length > 2 ? article.content.slice(2, 4) : defaultSpecificArticle.contentSections.paragraphs1,
          quote: defaultSpecificArticle.contentSections.quote,
          secondImage: defaultSpecificArticle.contentSections.secondImage,
          subheading2: 'Dukungan Berbagai Pihak',
          paragraphs2: article.content && article.content.length > 4 ? article.content.slice(4) : defaultSpecificArticle.contentSections.paragraphs2
        },
        tags: article.tags ? article.tags.map(t => ({ name: t, slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-') })) : defaultSpecificArticle.tags
      };
    }

    // Lookup in Admin CMS store by slug
    if (slug) {
      const adminMatch = getArticleBySlug(slug);
      if (adminMatch) {
        // Strip HTML tags for paragraphs fallback and clean any html entities
        const rawParagraphs = adminMatch.content
          ? adminMatch.content
              .replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi, '')
              .replace(/<figure[^>]*>.*?<\/figure>/gi, '')
              .replace(/<blockquote[^>]*>.*?<\/blockquote>/gi, '')
              .split(/<\/?p>/)
              .map((p) => cleanHtmlEntities(p.replace(/<[^>]*>?/gm, '')).trim())
              .filter((p) => p.length > 0)
          : [];

        const pubDateStr = (() => {
          try {
            return new Date(adminMatch.publishedAt).toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }) + ' WIB';
          } catch {
            return adminMatch.publishedAt;
          }
        })();

        return {
          id: adminMatch.id,
          slug: adminMatch.slug,
          category: (adminMatch.category || 'DAERAH').toUpperCase(),
          categorySlug: adminMatch.categorySlug || 'daerah',
          title: adminMatch.title,
          subheadline: cleanHtmlEntities(adminMatch.excerpt || defaultSpecificArticle.subheadline),
          author: {
            name: adminMatch.author || 'Muhamad Yandi',
            role: 'Jurnalis',
            slug: (adminMatch.author || 'muhamad-yandi').toLowerCase().replace(/\s+/g, '-'),
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
            bio: defaultSpecificArticle.author.bio,
          },
          publishedAt: pubDateStr,
          publishedIso: adminMatch.publishedAt,
          updatedAt: adminMatch.updatedAt,
          updatedIso: adminMatch.updatedAt,
          readTime: `${Math.max(2, Math.ceil((adminMatch.content?.length || 500) / 400))} menit baca`,
          views: adminMatch.views || 120,
          featuredImage: {
            url: adminMatch.featuredImage || defaultSpecificArticle.featuredImage.url,
            alt: adminMatch.imageAlt || adminMatch.title,
            caption: adminMatch.imageCaption || `Dokumentasi: ${adminMatch.title}. (Foto: BatuTV)`,
          },
          fullHtmlContent: adminMatch.content || undefined,
          contentSections: {
            introParagraphs: rawParagraphs.slice(0, 2).length > 0 ? rawParagraphs.slice(0, 2) : defaultSpecificArticle.contentSections.introParagraphs,
            subheading1: 'Kondisi dan Situasi Terkini',
            paragraphs1: rawParagraphs.slice(2, 4).length > 0 ? rawParagraphs.slice(2, 4) : defaultSpecificArticle.contentSections.paragraphs1,
            quote: defaultSpecificArticle.contentSections.quote,
            secondImage: defaultSpecificArticle.contentSections.secondImage,
            subheading2: 'Dukungan dan Rencana Lanjutan',
            paragraphs2: rawParagraphs.slice(4).length > 0 ? rawParagraphs.slice(4) : defaultSpecificArticle.contentSections.paragraphs2,
          },
          tags: adminMatch.tags && adminMatch.tags.length > 0
            ? adminMatch.tags.map((t) => ({ name: t, slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))
            : defaultSpecificArticle.tags,
        };
      }

      // Lookup in allNewsArticles by slug or id
      const match = allNewsArticles.find((a) => a.slug === slug || a.id === slug);
      if (match) {
        return {
          id: match.id,
          slug: match.slug,
          category: (match.category || 'NASIONAL').toUpperCase(),
          categorySlug: match.categorySlug || 'nasional',
          title: match.title,
          subheadline: match.summary,
          author: {
            name: match.author?.name || 'Muhamad Yandi',
            role: match.author?.role || 'Jurnalis',
            slug: (match.author?.name || 'muhamad-yandi').toLowerCase().replace(/\s+/g, '-'),
            avatar: match.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
            bio: defaultSpecificArticle.author.bio
          },
          publishedAt: match.publishedAt,
          publishedIso: defaultSpecificArticle.publishedIso,
          updatedAt: defaultSpecificArticle.updatedAt,
          updatedIso: defaultSpecificArticle.updatedIso,
          readTime: match.readTime,
          views: match.views,
          featuredImage: {
            url: match.imageUrl,
            alt: match.title,
            caption: match.imageCaption || `Dokumentasi liputan: ${match.title}. (Foto: BatuTV Media)`
          },
          contentSections: {
            introParagraphs: match.content.slice(0, 2),
            subheading1: 'Kondisi dan Situasi Terkini di Lapangan',
            paragraphs1: match.content.slice(2, 4).length > 0 ? match.content.slice(2, 4) : defaultSpecificArticle.contentSections.paragraphs1,
            quote: defaultSpecificArticle.contentSections.quote,
            secondImage: defaultSpecificArticle.contentSections.secondImage,
            subheading2: 'Langkah dan Koordinasi Berkelanjutan',
            paragraphs2: match.content.slice(4).length > 0 ? match.content.slice(4) : defaultSpecificArticle.contentSections.paragraphs2
          },
          tags: match.tags.map(t => ({ name: t, slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))
        };
      }
    }

    return defaultSpecificArticle;
  }, [article, slug]);

  // SEO: Dynamic title, meta description, canonical, Open Graph and Structured Data (JSON-LD)
  useEffect(() => {
    const originalTitle = document.title;
    const settings = getStoredSiteSettings();
    const baseDomain = getBaseDomain();

    const titleSep = settings.seo.titleSeparator || '|';
    const siteName = settings.identity.siteName || 'BatuTV';
    const pageTitle = `${currentData.title} ${titleSep} ${siteName}`;
    document.title = pageTitle;

    // Helper to safely set or update meta tags
    const setMetaTag = (attrName: string, attrValue: string, content: string) => {
      let elem = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!elem) {
        elem = document.createElement('meta');
        elem.setAttribute(attrName, attrValue);
        document.head.appendChild(elem);
      }
      elem.setAttribute('content', content);
    };

    // Update Meta Description
    const metaDesc = currentData.subheadline || currentData.title;
    setMetaTag('name', 'description', metaDesc);

    // Update Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    const currentCanonicalUrl = `${baseDomain}/berita/${currentData.slug}`;
    canonical.setAttribute('href', currentCanonicalUrl);

    // Open Graph Tags
    const ogImg = currentData.featuredImage?.url || settings.seo.defaultOgImage || `${baseDomain}/logo.png`;
    setMetaTag('property', 'og:title', currentData.title);
    setMetaTag('property', 'og:description', metaDesc);
    setMetaTag('property', 'og:image', ogImg);
    setMetaTag('property', 'og:url', currentCanonicalUrl);
    setMetaTag('property', 'og:type', 'article');
    setMetaTag('property', 'og:site_name', siteName);
    setMetaTag('property', 'article:published_time', currentData.publishedIso);
    setMetaTag('property', 'article:modified_time', currentData.updatedIso);
    setMetaTag('property', 'article:section', currentData.category);
    if (currentData.author?.name) {
      setMetaTag('property', 'article:author', currentData.author.name);
    }

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', currentData.title);
    setMetaTag('name', 'twitter:description', metaDesc);
    setMetaTag('name', 'twitter:image', ogImg);

    // Inject JSON-LD Structured Data for NewsArticle and BreadcrumbList
    const jsonLdData = [
      {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': currentCanonicalUrl
        },
        'headline': currentData.title,
        'description': metaDesc,
        'image': [ogImg],
        'datePublished': currentData.publishedIso,
        'dateModified': currentData.updatedIso,
        'author': {
          '@type': 'Person',
          'name': currentData.author.name,
          'url': `${baseDomain}/penulis/${currentData.author.slug}`,
          'jobTitle': currentData.author.role || 'Jurnalis'
        },
        'publisher': {
          '@type': 'NewsMediaOrganization',
          'name': siteName,
          'url': baseDomain,
          'logo': {
            '@type': 'ImageObject',
            'url': settings.logos.publisherSchema || settings.logos.headerDesktop || `${baseDomain}/logo.png`
          }
        },
        'articleSection': currentData.category,
        'keywords': currentData.tags.map(t => t.name).join(', ')
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Beranda',
            'item': `${baseDomain}/`
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': currentData.category,
            'item': `${baseDomain}/kategori/${currentData.categorySlug}`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': currentData.title,
            'item': currentCanonicalUrl
          }
        ]
      }
    ];

    let scriptJsonLd = document.getElementById('jsonld-article-detail');
    if (!scriptJsonLd) {
      scriptJsonLd = document.createElement('script');
      scriptJsonLd.id = 'jsonld-article-detail';
      scriptJsonLd.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptJsonLd);
    }
    scriptJsonLd.textContent = JSON.stringify(jsonLdData);

    return () => {
      document.title = originalTitle;
      const scriptToRemove = document.getElementById('jsonld-article-detail');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [currentData]);

  // Handle Share Actions
  // Handle Emoji Reactions
  const handleReactionClick = (emoji: string) => {
    if (activeReaction === emoji) {
      setActiveReaction(null);
      setReactionCounts(prev => ({
        ...prev,
        [emoji]: Math.max(0, (prev[emoji] || 1) - 1)
      }));
    } else {
      const oldReaction = activeReaction;
      setActiveReaction(emoji);
      setReactionCounts(prev => ({
        ...prev,
        ...(oldReaction ? { [oldReaction]: Math.max(0, (prev[oldReaction] || 1) - 1) } : {}),
        [emoji]: (prev[emoji] || 0) + 1
      }));
    }
  };

  // Handle Comment Submission
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    const newComment = {
      id: `c-${Date.now()}`,
      name: userNameInput.trim() || 'Pembaca Setia',
      time: 'Baru saja',
      text: commentInput.trim(),
      likes: 1
    };
    setCommentsList([newComment, ...commentsList]);
    setCommentInput('');
    setUserNameInput('');
  };

  // Related Articles Data
  const relatedArticlesList = React.useMemo(() => {
    return allNewsArticles
      .filter(a => a.slug !== currentData.slug)
      .slice(0, 4);
  }, [currentData.slug]);

  // Single Recommended "BACA JUGA" Article with strict priority:
  // 1. Same Category -> 2. Same Tag -> 3. Latest Published News
  // Excludes current article, draft, scheduled, and trash articles.
  const bacaJugaArticle = React.useMemo<BacaJugaItem | null>(() => {
    const currentSlug = (currentData.slug || '').trim().toLowerCase();
    const currentId = (currentData.id || '').trim().toLowerCase();
    const currentCategorySlug = (currentData.categorySlug || '').trim().toLowerCase();
    const currentCategory = (currentData.category || '').trim().toLowerCase();
    const currentTagSlugs = (currentData.tags || []).map(t =>
      (typeof t === 'string' ? t : t.slug || t.name).toLowerCase()
    );

    // 1. Gather all published articles from CMS store
    const cmsArticles = getStoredArticles().filter(a => {
      if (a.status && a.status !== 'published') return false;
      const aSlug = resolveArticleSlug(a.slug, a.id).toLowerCase();
      if (!aSlug) return false;
      if (aSlug === currentSlug || String(a.id).toLowerCase() === currentId) return false;
      return true;
    });

    // 2. Gather dummy articles
    const dummyArticles = allNewsArticles.filter(a => {
      const aSlug = resolveArticleSlug(a.slug, a.id).toLowerCase();
      if (!aSlug) return false;
      if (aSlug === currentSlug || String(a.id).toLowerCase() === currentId) return false;
      return true;
    });

    // Unified candidate pool (deduplicated by slug)
    const pool: Array<{
      id: string;
      slug: string;
      title: string;
      category?: string;
      categorySlug?: string;
      tags?: string[];
    }> = [];
    const seenSlugs = new Set<string>();

    for (const a of cmsArticles) {
      const resolvedSlug = resolveArticleSlug(a.slug, a.id);
      if (resolvedSlug && !seenSlugs.has(resolvedSlug)) {
        seenSlugs.add(resolvedSlug);
        pool.push({
          id: a.id,
          slug: resolvedSlug,
          title: a.title,
          category: a.category,
          categorySlug: a.categorySlug,
          tags: a.tags || [],
        });
      }
    }

    for (const a of dummyArticles) {
      const resolvedSlug = resolveArticleSlug(a.slug, a.id);
      if (resolvedSlug && !seenSlugs.has(resolvedSlug)) {
        seenSlugs.add(resolvedSlug);
        pool.push({
          id: a.id,
          slug: resolvedSlug,
          title: a.title,
          category: a.category,
          categorySlug: a.categorySlug,
          tags: a.tags || [],
        });
      }
    }

    if (pool.length === 0) return null;

    // PRIORITY 1: Same Category
    if (currentCategorySlug || currentCategory) {
      const sameCat = pool.find(item => {
        const catSlug = (item.categorySlug || '').toLowerCase();
        const catName = (item.category || '').toLowerCase();
        return (
          (currentCategorySlug && (catSlug === currentCategorySlug || catName === currentCategorySlug)) ||
          (currentCategory && (catName === currentCategory || catSlug === currentCategory))
        );
      });
      if (sameCat) {
        const href = resolveArticleHref(sameCat.slug, sameCat.id);
        if (href) {
          return {
            id: sameCat.id,
            slug: sameCat.slug,
            href,
            title: sameCat.title,
            category: sameCat.category,
          };
        }
      }
    }

    // PRIORITY 2: Same Tag
    if (currentTagSlugs.length > 0) {
      const sameTag = pool.find(item => {
        if (!item.tags || item.tags.length === 0) return false;
        return item.tags.some(t => {
          const normalized = (typeof t === 'string' ? t : '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return currentTagSlugs.some(ct => ct === normalized || ct.includes(normalized) || normalized.includes(ct));
        });
      });
      if (sameTag) {
        const href = resolveArticleHref(sameTag.slug, sameTag.id);
        if (href) {
          return {
            id: sameTag.id,
            slug: sameTag.slug,
            href,
            title: sameTag.title,
            category: sameTag.category,
          };
        }
      }
    }

    // PRIORITY 3: Latest published news fallback
    const fallback = pool[0];
    if (fallback) {
      const href = resolveArticleHref(fallback.slug, fallback.id);
      if (href) {
        return {
          id: fallback.id,
          slug: fallback.slug,
          href,
          title: fallback.title,
          category: fallback.category,
        };
      }
    }

    return null;
  }, [currentData]);

  // Interesting Stories Data (Kumpulan Kisah Menarik / Feature)
  const interestingStoriesList = [
    {
      id: 'quiz-1',
      title: 'Seberapa Cepat Tanggap Kamu Mengenali Hoaks Seputar Bencana Alam?',
      category: 'KUIS BATUTV',
      slug: 'kuis-kenali-hoaks-bencana-alam',
      imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600&auto=format&fit=crop',
      actionText: 'Ikuti Kuisnya →'
    },
    {
      id: 'story-2',
      title: 'Jelajah Desa Wisata Lereng Pegunungan: Cerita Ketahanan Warga Menjaga Sumber Air',
      category: 'KISAH INSPIRATIF',
      slug: 'jelajah-desa-wisata-lereng-ketahanan-warga',
      imageUrl: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?q=80&w=600&auto=format&fit=crop',
      actionText: 'Baca Selengkapnya →'
    },
    {
      id: 'story-3',
      title: 'Kacamata Cerdas & Inovasi Teknologi Pemantau Cuaca Ekstrem Karya Mahasiswa',
      category: 'TEKNO & INOVASI',
      slug: 'kacamata-cerdas-pemantau-cuaca-ekstrem',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
      actionText: 'Baca Selengkapnya →'
    }
  ];

  // Latest news list (Terkini - 8 to 12 items)
  const latestList = React.useMemo(() => {
    return defaultLatestNewsPosts.slice(0, 10);
  }, []);

  // Popular Top 5 List
  const popularList = React.useMemo(() => {
    return defaultPopularNews.slice(0, 5);
  }, []);

  // Trending Topics List
  const trendingTopics = [
    { tag: 'Politik Indonesia', slug: 'politik-indonesia', count: '1.4k pembaca' },
    { tag: 'DPR RI', slug: 'dpr-ri', count: '980 pembaca' },
    { tag: 'Nasional', slug: 'nasional', count: '2.1k pembaca' },
    { tag: 'Viral Hari Ini', slug: 'viral-hari-ini', count: '1.8k pembaca' },
    { tag: 'Kesehatan & Fasilitas', slug: 'kesehatan', count: '740 pembaca' },
    { tag: 'Ekonomi Kerakyatan', slug: 'ekonomi-kerakyatan', count: '620 pembaca' }
  ];

  // Top Writers / Jurnalis Pilihan
  const topWriters = [
    { name: 'Muhamad Yandi', role: 'Jurnalis Senior', articles: 38, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop' },
    { name: 'Bayu Wicaksono', role: 'Redaktur Pelaksana', articles: 45, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop' },
    { name: 'Dini Sukmaningtyas', role: 'Koresponden Jatim', articles: 29, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop' },
    { name: 'Oktavia Ningrum', role: 'Jurnalis Daerah', articles: 24, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=120&auto=format&fit=crop' }
  ];

  const canonicalUrl = `${getBaseDomain()}/berita/${currentData.slug}`;

  return (
    <main id="article-detail-main" className="flex-1 w-full bg-[#f8f9fa] py-3 sm:py-4 lg:py-5">
      {/* Container max-width: 980px to match homepage */}
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SEMANTIC 2-COLUMN LAYOUT MATCHING HOMEPAGE 8+4 COLS */}
        <div className="article-layout grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">

          {/* ========================================================================= */}
          {/* ARTICLE COLUMN (Desktop: 8 Cols to match homepage)                        */}
          {/* ========================================================================= */}
          <article className="article-page lg:col-span-8 w-full bg-white rounded-xl shadow-none p-4 sm:p-5 md:p-6">
            
            {/* 1. BREADCRUMB */}
            <nav aria-label="Breadcrumb" className="mb-4 sm:mb-5">
              <ol className="flex items-center flex-wrap gap-1.5 text-xs sm:text-[13px] text-slate-500 font-medium">
                <li>
                  <a
                    href="/"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('/');
                    }}
                    className="hover:text-red-600 transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </li>
                <li>
                  <a
                    href={`/kategori/${currentData.categorySlug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (onSelectCategory) onSelectCategory(currentData.categorySlug);
                      onNavigate(`/kategori/${currentData.categorySlug}`);
                    }}
                    className="text-red-600 font-semibold hover:underline"
                  >
                    {currentData.category}
                  </a>
                </li>
              </ol>
            </nav>

            {/* 2. CATEGORY BADGE */}
            <div className="mb-2.5">
              <span className="inline-block bg-red-600 text-white text-[11px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded">
                {currentData.category}
              </span>
            </div>

            {/* 3. SINGLE H1 ARTICLE TITLE */}
            <h1 className="text-2xl sm:text-3xl md:text-[34px] font-black text-slate-900 leading-[1.22] tracking-tight mb-3.5">
              {currentData.title}
            </h1>

            {/* 4. SUBHEADLINE / SUMMARY */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal mb-5 border-b border-slate-100 pb-4">
              {currentData.subheadline}
            </p>

            {/* 5 & 6. SIMPLIFIED AUTHOR & SHARE BAR (Minimalist Layout) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-100">
              {/* Left: Author Avatar, Name, and Clean Timestamp */}
              <div className="flex items-center gap-3">
                <img
                  src={currentData.author.avatar}
                  alt={currentData.author.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                  width="40"
                  height="40"
                />
                <div>
                  <a
                    href={`/penulis/${currentData.author.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (onSelectAuthor) onSelectAuthor(currentData.author.slug);
                      onNavigate(`/penulis/${currentData.author.slug}`);
                    }}
                    className="font-bold text-slate-900 text-sm sm:text-[15px] hover:text-red-600 transition-colors block leading-tight"
                  >
                    {currentData.author.name}
                  </a>
                  <div className="text-xs sm:text-[13px] text-slate-500 mt-1 leading-tight">
                    <time dateTime={currentData.publishedIso}>
                      {currentData.publishedAt.replace(/\s*pukul\s*/i, ' | ')}
                    </time>
                  </div>
                </div>
              </div>

              {/* Right: Compact Circular Share Icons (Official High-Precision SVG Vectors) */}
              <SocialShareGroup
                url={canonicalUrl}
                title={currentData.title}
                summary={currentData.subheadline}
                className="self-start sm:self-center"
              />
            </div>

            {/* 7. FEATURED IMAGE (Above the fold - NO lazy load, high priority) */}
            <figure className="mb-6">
              <img
                src={getOptimizedImageUrl(currentData.featuredImage.url, 'large')}
                alt={currentData.featuredImage.alt}
                width={1200}
                height={675}
                fetchPriority="high"
                loading="eager"
                className="w-full aspect-[16/9] object-cover rounded-md shadow-2xs"
              />
              <figcaption className="text-xs text-slate-500 mt-2 px-1 leading-relaxed italic">
                {currentData.featuredImage.caption}
              </figcaption>
            </figure>

            {/* 8. ARTICLE EDITORIAL CONTENT */}
            {currentData.fullHtmlContent ? (
              <div
                className="article-body-content text-slate-800 text-[15.5px] sm:text-base leading-[1.8] font-normal
                  prose prose-slate max-w-none
                  [&>p]:mb-4 [&>p]:leading-[1.8]
                  [&>h1]:text-2xl [&>h1]:font-black [&>h1]:text-slate-900 [&>h1]:mb-3 [&>h1]:mt-7
                  [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-black [&>h2]:text-slate-900 [&>h2]:mt-7 [&>h2]:mb-3 [&>h2]:pt-2 [&>h2]:tracking-tight
                  [&>h3]:text-lg sm:[&>h3]:text-xl [&>h3]:font-black [&>h3]:text-slate-900 [&>h3]:mt-6 [&>h3]:mb-2
                  [&>h4]:text-base [&>h4]:font-bold [&>h4]:text-slate-800 [&>h4]:mt-4 [&>h4]:mb-2
                  [&>blockquote]:border-l-4 [&>blockquote]:border-red-600 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-700 [&>blockquote]:my-6 [&>blockquote]:bg-red-50/40 [&>blockquote]:py-3 [&>blockquote]:rounded-r-lg
                  [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:my-4 [&>ul]:space-y-1.5
                  [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:my-4 [&>ol]:space-y-1.5
                  [&>figure]:my-7 [&>figure>img]:rounded-md [&>figure>img]:w-full [&>figure>img]:aspect-[16/9] [&>figure>img]:object-cover [&>figure>img]:shadow-2xs
                  [&>figure>figcaption]:text-xs [&>figure>figcaption]:text-slate-500 [&>figure>figcaption]:mt-2 [&>figure>figcaption]:text-center [&>figure>figcaption]:italic
                  [&>a]:text-red-600 [&>a]:font-bold [&>a]:hover:underline"
              >
                {(() => {
                  const sanitized = sanitizeArticleHtml(currentData.fullHtmlContent);
                  const processedHtml = sanitized.replace(
                    /^(\s*<p[^>]*>)?(BatuTV\s*\/\s*Suara\s*Media|Suara\s*Media|BatuTV)?(\s*[–—\-]\s*)?/i,
                    (match, pTag) => (pTag || '<p>') + '<strong class="font-bold text-slate-900">BatuTV / Suara Media</strong> – '
                  );

                  if (bacaJugaArticle) {
                    const { before, after } = splitHtmlAfterParagraphs(processedHtml, 3);
                    return (
                      <>
                        <div dangerouslySetInnerHTML={{ __html: before }} />
                        <BacaJugaBlock item={bacaJugaArticle} onNavigate={onNavigate} />
                        {after && <div dangerouslySetInnerHTML={{ __html: after }} />}
                      </>
                    );
                  }

                  return <div dangerouslySetInnerHTML={{ __html: processedHtml }} />;
                })()}
              </div>
            ) : (
              <div className="article-body-content text-slate-800 text-[15.5px] sm:text-base leading-[1.75] font-normal space-y-4">
                {/* Intro Paragraph 1 */}
                <p className="text-justify sm:text-left">
                  <strong className="font-bold text-slate-900">BatuTV / Suara Media</strong> – {cleanHtmlEntities(currentData.contentSections.introParagraphs[0]?.replace(/^(Suara Media|BatuTV) – /, '') || '')}
                </p>

                {/* Intro Paragraph 2 */}
                {currentData.contentSections.introParagraphs[1] && (
                  <p className="text-justify sm:text-left">
                    {cleanHtmlEntities(currentData.contentSections.introParagraphs[1])}
                  </p>
                )}

                {/* Subheading H2 1 */}
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-7 mb-3 pt-2 tracking-tight">
                  {cleanHtmlEntities(currentData.contentSections.subheading1)}
                </h2>

                {/* Paragraph 3 */}
                {currentData.contentSections.paragraphs1[0] && (
                  <p className="text-justify sm:text-left">
                    {cleanHtmlEntities(currentData.contentSections.paragraphs1[0])}
                  </p>
                )}

                {/* Inline "BACA JUGA" Box placed strictly after Paragraph 3 */}
                {bacaJugaArticle && (
                  <BacaJugaBlock item={bacaJugaArticle} onNavigate={onNavigate} />
                )}

                {/* Remaining Paragraphs 1 */}
                {currentData.contentSections.paragraphs1.slice(1).map((para, idx) => (
                  <p key={`p1-${idx + 1}`} className="text-justify sm:text-left">
                    {cleanHtmlEntities(para)}
                  </p>
                ))}

                {/* Second In-Article Image */}
                <figure className="my-7">
                  <img
                    src={getOptimizedImageUrl(currentData.contentSections.secondImage.url, 'large')}
                    alt={currentData.contentSections.secondImage.alt}
                    width={1000}
                    height={560}
                    loading="lazy"
                    className="w-full aspect-[16/9] object-cover rounded-md shadow-2xs"
                  />
                  <figcaption className="text-xs text-slate-500 mt-2 px-1 leading-relaxed italic">
                    {currentData.contentSections.secondImage.caption}
                  </figcaption>
                </figure>

                {/* Subheading H2 2 */}
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-7 mb-3 pt-2 tracking-tight">
                  {cleanHtmlEntities(currentData.contentSections.subheading2)}
                </h2>

                {/* Paragraphs 2 */}
                {currentData.contentSections.paragraphs2.map((para, idx) => (
                  <p key={`p2-${idx}`} className="text-justify sm:text-left">
                    {cleanHtmlEntities(para)}
                  </p>
                ))}

                <p className="text-slate-500 text-xs italic pt-2 border-t border-slate-100">
                  (Kontributor: Tim Liputan Nasional &amp; Daerah BatuTV)
                </p>
              </div>
            )}

            {/* 9. ARTICLE TAGS (MATCHING IMAGE 3) */}
            <div className="mt-8 p-4 sm:p-5 bg-[#f8f9fa] rounded-lg border border-slate-100 shadow-none">
              <div className="flex items-center gap-3 mb-3.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 shrink-0">
                  Tag
                </h3>
                <div className="flex-1 h-px bg-slate-200 relative">
                  <div className="absolute left-0 top-0 h-px w-6 sm:w-8 bg-red-600" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {currentData.tags.map((tag) => (
                  <a
                    key={tag.slug}
                    href={`/tag/${tag.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (onSelectTag) onSelectTag(tag.slug);
                      onNavigate(`/tag/${tag.slug}`);
                    }}
                    className="inline-flex items-center px-3.5 py-1.5 rounded-md bg-gradient-to-r from-[#d91424] via-[#9e165b] to-[#431474] text-white font-medium text-xs sm:text-[13px] hover:opacity-90 active:scale-95 transition-all shadow-none"
                  >
                    # {tag.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Bottom Share Bar (MATCHING IMAGE 3) */}
            <div className="mt-3.5 p-3.5 sm:p-4 bg-[#f8f9fa] rounded-lg border border-slate-100 shadow-none flex items-center justify-between gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
              <span className="font-bold text-slate-900 text-sm sm:text-base shrink-0">
                Share Link
              </span>
              <SocialShareGroup
                url={canonicalUrl}
                title={currentData.title}
                summary={currentData.subheadline}
                className="ml-auto sm:ml-0"
              />
            </div>

            {/* 11. RELATED ARTICLES (BERITA TERKAIT) */}
            <section className="mt-10 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-5 bg-red-600 rounded-xs inline-block" />
                  BERITA TERKAIT
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedArticlesList.map((item) => (
                  <a
                    key={item.id}
                    href={`/berita/${item.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/berita/${item.slug}`);
                    }}
                    className="group p-3 rounded-lg border border-slate-100 hover:border-red-300 hover:shadow-xs transition bg-white flex gap-3 items-start"
                  >
                    <img
                      src={getOptimizedImageUrl(item.imageUrl, 'medium')}
                      alt={item.title}
                      width={96}
                      height={72}
                      loading="lazy"
                      className="w-24 h-18 sm:w-28 sm:h-20 object-cover rounded-md shrink-0 bg-slate-100 group-hover:scale-[1.02] transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10.5px] font-bold text-red-600 uppercase">
                        {item.category}
                      </span>
                      <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mt-0.5">
                        {item.title}
                      </h3>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        {item.publishedAt}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </section>

            {/* 12. INTERESTING STORIES (KUMPULAN KISAH MENARIK) */}
            <section className="mt-10 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  KUMPULAN KISAH MENARIK
                </h2>
                <span className="text-xs font-bold text-slate-400">Pilihan Redaksi</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {interestingStoriesList.map((story) => (
                  <a
                    key={story.id}
                    href={`/berita/${story.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/berita/${story.slug}`);
                    }}
                    className="group flex flex-col bg-slate-50 hover:bg-white rounded-lg border border-slate-100 overflow-hidden shadow-none hover:shadow-xs transition"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <img
                        src={getOptimizedImageUrl(story.imageUrl, 'medium')}
                        alt={story.title}
                        width={400}
                        height={250}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {story.category}
                      </span>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-red-600 line-clamp-3 leading-snug">
                        {story.title}
                      </h3>
                      <span className="text-[11.5px] font-bold text-red-600 flex items-center gap-1 mt-3 group-hover:underline">
                        {story.actionText}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </section>

            {/* 13. COMMENTS UI (KOMENTAR & REAKSI EMOJI) */}
            <section className="mt-10 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-red-600" />
                  KOMENTAR PEMBACA ({commentsList.length})
                </h2>
                <span className="text-xs text-slate-500">Moderasi Otomatis</span>
              </div>

              {/* Emoji Reactions Bar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-none mb-6">
                <div className="text-xs font-bold text-slate-600 mb-2.5">
                  Bagaimana perasaan Anda mengenai berita ini?
                </div>
                <div className="grid grid-cols-6 gap-2 text-center">
                  {Object.entries(reactionCounts).map(([emoji, count]) => {
                    const isSelected = activeReaction === emoji;
                    return (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleReactionClick(emoji)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg transition border ${
                          isSelected
                            ? 'bg-red-50 border-red-300 scale-105 shadow-2xs'
                            : 'bg-white border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xl sm:text-2xl mb-1">{emoji}</span>
                        <span className={`text-[11px] font-bold ${isSelected ? 'text-red-600' : 'text-slate-600'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Write Comment Form */}
              <form onSubmit={handleAddComment} className="mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-none">
                <div className="mb-3">
                  <label htmlFor="user-name-input" className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Anda (Opsional)
                  </label>
                  <input
                    id="user-name-input"
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    value={userNameInput}
                    onChange={(e) => setUserNameInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200/80 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="comment-text-input" className="block text-xs font-bold text-slate-700 mb-1">
                    Tulis Komentar
                  </label>
                  <textarea
                    id="comment-text-input"
                    rows={3}
                    placeholder="Tulis tanggapan Anda secara santun dan sesuai etika..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="w-full p-3 text-xs sm:text-sm border border-slate-200/80 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 resize-none"
                    required
                  />
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] text-slate-400">
                    Isi komentar sepenuhnya adalah tanggung jawab penulis &amp; diatur UU ITE.
                  </span>
                  <button
                    type="submit"
                    disabled={!commentInput.trim()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition shadow-none flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Kirim Komentar
                  </button>
                </div>
              </form>

              {/* Comments Stream */}
              <div className="space-y-3">
                {commentsList.map((comm) => (
                  <div key={comm.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 shadow-none">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                          {comm.name.charAt(0)}
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900">{comm.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{comm.time}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-9">
                      {comm.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 14. LATEST NEWS STREAM (TERKINI — 8 to 12 items list) */}
            <section className="mt-10 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-5 bg-red-600 rounded-xs inline-block" />
                  BERITA TERKINI
                </h2>
                <a
                  href="/kategori/terkini"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/');
                  }}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Lihat Indeks Berita →
                </a>
              </div>
              <div className="divide-y divide-slate-100">
                {latestList.map((item) => (
                  <a
                    key={item.id}
                    href={item.href || `/berita/${item.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.href || `/berita/${item.slug}`);
                    }}
                    className="py-3.5 first:pt-0 last:pb-0 flex gap-3.5 sm:gap-4 items-start group hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition"
                  >
                    <img
                      src={getOptimizedImageUrl(item.imageUrl, 'medium')}
                      alt={item.title}
                      width={110}
                      height={74}
                      loading="lazy"
                      className="w-24 h-16 sm:w-28 sm:h-18 object-cover rounded-md shrink-0 bg-slate-200 group-hover:scale-[1.02] transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                        <span className="font-bold text-red-600 uppercase">{item.category}</span>
                        <span>·</span>
                        <span>{item.date}, {item.time}</span>
                      </div>
                      <h3 className="text-xs sm:text-[13.5px] font-bold text-slate-900 group-hover:text-red-600 line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                    </div>
                  </a>
                ))}
              </div>
            </section>

          </article>

          {/* ========================================================================= */}
          {/* RIGHT SIDEBAR (Desktop: 4 Cols to match homepage)                         */}
          {/* ========================================================================= */}
          <aside className="article-sidebar lg:col-span-4 w-full lg:sticky lg:top-[68px] self-start space-y-5">
            
            {/* S1. POPULAR ARTICLES (POPULER 01 - 05) */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-none p-4 sm:p-5">
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 tracking-wide uppercase">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                  TERPOPULER
                </h3>
                <span className="text-[11px] font-bold text-slate-400">24 Jam Terakhir</span>
              </div>

              <div className="space-y-3.5">
                {popularList.map((pop, idx) => (
                  <a
                    key={pop.id || idx}
                    href={`/berita/${pop.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/berita/${pop.slug}`);
                    }}
                    className="flex items-start gap-3 group py-1"
                  >
                    <span className={`text-xl font-black shrink-0 w-7 text-center leading-none mt-0.5 ${
                      idx === 0 ? 'text-red-600' : idx === 1 ? 'text-orange-500' : 'text-slate-300'
                    }`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                        {pop.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10.5px] text-slate-400 mt-1">
                        <span className="font-semibold text-red-500">{pop.category || 'Nasional'}</span>
                        <span>·</span>
                        <span>{pop.date || 'Hari ini'}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* S2. TRENDING TOPICS (🔥 TRENDING) */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-none p-4 sm:p-5">
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 tracking-wide uppercase">
                  <Flame className="w-4 h-4 text-red-600" />
                  DISKUSI TERPANAS
                </h3>
                <span className="text-[11px] font-bold text-red-600 animate-pulse">LIVE</span>
              </div>

              <div className="space-y-2.5">
                {trendingTopics.map((topic) => (
                  <a
                    key={topic.slug}
                    href={`/tag/${topic.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/tag/${topic.slug}`);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-red-50/80 hover:text-red-600 transition group border border-slate-100"
                  >
                    <span className="text-xs font-bold text-slate-800 group-hover:text-red-600 flex items-center gap-1.5">
                      <span className="text-red-500">🔥</span> #{topic.tag}
                    </span>
                    <span className="text-[10px] text-slate-400 group-hover:text-red-500 font-medium">
                      {topic.count}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* S3. TOP WRITERS / JURNALIS PILIHAN */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-none p-4 sm:p-5">
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 tracking-wide uppercase">
                  <User className="w-4 h-4 text-red-600" />
                  TOP WRITERS
                </h3>
                <span className="text-[11px] font-bold text-slate-400">Redaksi</span>
              </div>

              <div className="space-y-3">
                {topWriters.map((writer) => (
                  <a
                    key={writer.name}
                    href={`/penulis/${writer.name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (onSelectAuthor) onSelectAuthor(writer.name.toLowerCase().replace(/\s+/g, '-'));
                      onNavigate(`/penulis/${writer.name.toLowerCase().replace(/\s+/g, '-')}`);
                    }}
                    className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-50 transition group"
                  >
                    <img
                      src={getOptimizedImageUrl(writer.avatar, 'thumbnail')}
                      alt={writer.name}
                      width={40}
                      height={40}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-red-600 truncate">
                        {writer.name}
                      </h4>
                      <p className="text-[10.5px] text-slate-400 truncate">{writer.role}</p>
                    </div>
                    <span className="text-[10.5px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                      {writer.articles} Artikel
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* S4. OPTIONAL PROMO / ADVERTISEMENT SLOT */}
            <div className="bg-gradient-to-br from-slate-900 to-[#1e0329] rounded-xl text-white p-5 text-center shadow-md relative overflow-hidden border border-purple-900/40">
              <div className="absolute top-2 right-2 bg-red-600/80 text-[9px] font-black px-1.5 py-0.5 rounded text-white tracking-widest uppercase">
                SPONSORED
              </div>
              <div className="w-12 h-12 mx-auto rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center mb-3 text-red-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-black text-sm tracking-tight mb-1">
                BatuTV Mobile Digital App
              </h4>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Dapatkan notifikasi berita terkini langsung di smartphone Anda. Gratis &amp; ringan!
              </p>
              <button
                type="button"
                onClick={() => {
                  setAppDownloadToast(true);
                  setTimeout(() => setAppDownloadToast(false), 3500);
                }}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition shadow-sm cursor-pointer"
              >
                Unduh Aplikasi Sekarang
              </button>
            </div>

          </aside>

        </div>

        {/* Global Toast for App Download */}
        {appDownloadToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Aplikasi mobile BatuTV sedang disiapkan untuk Google Play &amp; App Store.</span>
          </div>
        )}

      </div>
    </main>
  );
};
