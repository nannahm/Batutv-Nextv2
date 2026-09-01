import React, { useState } from 'react';
import {
  X,
  Clock,
  Eye,
  Bookmark,
  Share2,
  Check,
  MessageSquare,
  ThumbsUp,
  Tag,
  Send,
  ArrowLeft,
  Calendar,
  User,
  Sparkles,
} from 'lucide-react';
import { NewsArticle } from '../types/news';

interface ArticleModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  onSelectRelated: (article: NewsArticle) => void;
  relatedArticles: NewsArticle[];
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (article: NewsArticle) => void;
  fontSizeLevel: number;
  onChangeFontSize: (level: number) => void;
}

interface Comment {
  id: string;
  name: string;
  avatar: string;
  time: string;
  text: string;
  likes: number;
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

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onSelectRelated,
  relatedArticles,
  isBookmarked,
  onToggleBookmark,
  fontSizeLevel,
  onChangeFontSize,
}) => {
  const [copied, setCopied] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c1',
      name: 'Sugeng Haryadi (Warga Bumiaji)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop',
      time: '2 jam lalu',
      text: 'Langkah yang sangat tepat untuk memajukan petani lokal Batu. Semoga distribusi bibit unggul dan pendampingan teknologi benar-benar merata sampai ke dusun-dusun.',
      likes: 14,
    },
    {
      id: 'c2',
      name: 'Dr. Indah Pratiwi',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=120&auto=format&fit=crop',
      time: '1 jam lalu',
      text: 'Integrasi digital farming dan laboratorium kultur jaringan akan mengembalikan citra apel Manalagi Batu sebagai ikon agribisnis Jawa Timur.',
      likes: 9,
    },
  ]);

  if (!article) return null;

  const bookmarked = isBookmarked(article.id);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      name: commentName.trim() || 'Pembaca BatuTV',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop',
      time: 'Baru saja',
      text: commentText.trim(),
      likes: 0,
    };

    setComments([newComment, ...comments]);
    setCommentText('');
    setCommentName('');
  };

  const fontSizeClasses = [
    'text-base leading-relaxed',
    'text-lg leading-relaxed',
    'text-xl leading-loose',
  ];

  return (
    <div
      id="article-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs overflow-y-auto flex justify-center p-0 sm:p-4 md:p-6"
    >
      <div
        id="article-modal-container"
        className="bg-white w-full max-w-4xl min-h-screen sm:min-h-0 sm:rounded-2xl shadow-2xl overflow-hidden my-0 sm:my-6 flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Sticky Header Nav Inside Reader */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between z-10">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-red-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {/* Font Size controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs text-slate-600">
              <span className="text-[10px] text-slate-400 font-semibold mr-1">Huruf:</span>
              <button
                onClick={() => onChangeFontSize(Math.max(0, fontSizeLevel - 1))}
                className={`px-1 font-bold ${fontSizeLevel === 0 ? 'text-slate-300' : 'hover:text-red-600'}`}
              >
                A-
              </button>
              <button
                onClick={() => onChangeFontSize(1)}
                className={`px-1 font-bold ${fontSizeLevel === 1 ? 'text-red-600' : 'hover:text-red-600'}`}
              >
                A
              </button>
              <button
                onClick={() => onChangeFontSize(Math.min(2, fontSizeLevel + 1))}
                className={`px-1 font-bold ${fontSizeLevel === 2 ? 'text-slate-300' : 'hover:text-red-600'}`}
              >
                A+
              </button>
            </div>

            {/* Bookmark button */}
            <button
              onClick={() => onToggleBookmark(article)}
              className={`p-2 rounded-lg transition border ${
                bookmarked
                  ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
              title={bookmarked ? 'Hapus Simpanan' : 'Simpan Berita'}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>

            {/* Close Button */}
            <button
              id="btn-close-article-modal"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Article Body Content */}
        <div className="p-4 sm:p-8 flex-1">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <span>BatuTV</span>
            <span>/</span>
            <span className="text-red-600 font-bold uppercase">{article.category}</span>
            <span>/</span>
            <span className="truncate max-w-[200px] sm:max-w-xs">{article.title}</span>
          </nav>

          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-red-600 text-white text-xs font-black uppercase px-2.5 py-1 rounded shadow-2xs">
              {article.category}
            </span>
            {article.region && (
              <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-1 rounded">
                Wilayah: {article.region}
              </span>
            )}
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 font-serif-heading leading-tight mb-4">
            {article.title}
          </h1>

          {/* Subheading / Summary */}
          <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed mb-6 border-l-4 border-red-600 pl-4 bg-slate-50 py-2.5 rounded-r">
            {article.summary}
          </p>

          {/* Author & Publish Date Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 border-y border-slate-200 mb-6 bg-slate-50/50 px-4 rounded-xl">
            <div className="flex items-center gap-3">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-red-500/20"
              />
              <div>
                <div className="text-sm font-bold text-slate-800">{article.author.name}</div>
                <div className="text-xs text-slate-500">{article.author.role}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {article.publishedAt}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {article.views.toLocaleString('id-ID')} views
              </span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-6">
            <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 shadow-md">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
            {article.imageCaption && (
              <p className="text-xs text-slate-500 italic mt-2 text-center sm:text-left">
                {article.imageCaption}
              </p>
            )}
          </div>

          {/* Social Share Bar */}
          <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-100 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5" />
              Bagikan:
            </span>
            <button
              onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' - BatuTV')}`, '_blank')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
            >
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}`, '_blank')}
              className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
            >
              <span>X (Twitter)</span>
            </button>
            <button
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php`, '_blank')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
            >
              <span>Facebook</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition border border-slate-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tautan Disalin!' : 'Salin Tautan'}</span>
            </button>
          </div>

          {/* Article Editorial Paragraphs */}
          <div className={`text-slate-800 space-y-5 ${fontSizeClasses[fontSizeLevel]} font-sans`}>
            {article.content.map((paragraph, index) => (
              <p key={index} className="text-justify leading-relaxed">
                {cleanHtmlEntities(paragraph)}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Topik Terkait
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer transition"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Related News Carousel */}
          {relatedArticles.length > 0 && (
            <div className="mt-10 pt-8 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-5 bg-red-600 rounded-xs"></span>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 font-serif-heading">
                  Berita Terkait Lainnya
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedArticles.slice(0, 3).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated(rel)}
                    className="group cursor-pointer bg-slate-50 hover:bg-slate-100 p-3 rounded-xl border border-slate-200 transition"
                  >
                    <img
                      src={rel.imageUrl}
                      alt={rel.title}
                      className="w-full aspect-[16/10] object-cover rounded-lg mb-2 group-hover:scale-102 transition"
                    />
                    <div className="text-[10px] font-bold text-red-600 uppercase mb-1">{rel.category}</div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition line-clamp-2 font-serif-heading">
                      {rel.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-10 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 font-serif-heading">
                  Komentar Pembaca ({comments.length})
                </h3>
              </div>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Tulis Tanggapan Anda
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="Nama Lengkap / Inisial..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-red-600 transition"
                />
              </div>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Sampaikan opini Anda secara sopan dan konstruktif..."
                rows={3}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-red-600 transition mb-3 resize-none"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Komentar</span>
              </button>
            </form>

            {/* Comment List */}
            <div className="space-y-4">
              {comments.map((comm) => (
                <div key={comm.id} className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <img src={comm.avatar} alt={comm.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-bold text-slate-800">{comm.name}</div>
                        <div className="text-[10px] text-slate-400">{comm.time}</div>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-600 transition">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{comm.likes}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pl-9">{comm.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
