import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Quote,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Code2,
  Eye,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  RemoveFormatting,
  ChevronDown,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { InsertPhotoModal, InsertImagePayload } from '../news/InsertPhotoModal';

export interface VisualRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  allowPhotoInsert?: boolean;
  showWordStats?: boolean;
}

type HeadingType = 'p' | 'h1' | 'h2' | 'h3' | 'h4';

interface HeadingOption {
  value: HeadingType;
  label: string;
  tag: string;
  desc: string;
  className: string;
}

const HEADING_OPTIONS: HeadingOption[] = [
  {
    value: 'p',
    label: 'Paragraf',
    tag: '<p>',
    desc: 'Teks artikel standar',
    className: 'text-sm font-normal text-slate-800',
  },
  {
    value: 'h1',
    label: 'Penajukan 1',
    tag: '<h1>',
    desc: 'Judul Utama Bagian',
    className: 'text-lg font-bold text-slate-900',
  },
  {
    value: 'h2',
    label: 'Penajukan 2',
    tag: '<h2>',
    desc: 'Subjudul Artikel',
    className: 'text-base font-bold text-slate-900',
  },
  {
    value: 'h3',
    label: 'Penajukan 3',
    tag: '<h3>',
    desc: 'Sub-subjudul Pokok',
    className: 'text-sm font-bold text-slate-900',
  },
  {
    value: 'h4',
    label: 'Penajukan 4',
    tag: '<h4>',
    desc: 'Rincian / Kategori Poin',
    className: 'text-xs font-bold text-slate-800',
  },
];

export const VisualRichEditor: React.FC<VisualRichEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tulis naskah atau isi konten di sini...',
  minHeight = '360px',
  allowPhotoInsert = true,
  showWordStats = true,
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [currentBlock, setCurrentBlock] = useState<HeadingType>('p');
  const [isHeadingDropdownOpen, setIsHeadingDropdownOpen] = useState(false);
  const [isInsertPhotoModalOpen, setIsInsertPhotoModalOpen] = useState(false);
  
  // Link Popover state
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState('https://');
  const [linkTextInput, setLinkTextInput] = useState('');
  const savedSelectionRef = useRef<Range | null>(null);

  // Active state indicators
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [isBlockquote, setIsBlockquote] = useState(false);
  const [isUl, setIsUl] = useState(false);
  const [isOl, setIsOl] = useState(false);

  // DOM Refs
  const visualEditorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const headingDropdownRef = useRef<HTMLDivElement>(null);

  // Stats calculation
  const cleanText = (value || '')
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
  const characterCount = cleanText.length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  // Sync external value to visual editor when changed externally
  useEffect(() => {
    if (visualEditorRef.current) {
      // Only set innerHTML if it doesn't match to avoid resetting cursor
      const currentHtml = visualEditorRef.current.innerHTML;
      const normalizedValue = value || '';
      if (currentHtml !== normalizedValue) {
        visualEditorRef.current.innerHTML = normalizedValue;
      }
    }
  }, [value, activeTab]);

  // Ensure default paragraph separator is <p>
  useEffect(() => {
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch {
      // ignore
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        headingDropdownRef.current &&
        !headingDropdownRef.current.contains(e.target as Node)
      ) {
        setIsHeadingDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Update active state based on current cursor selection
  const updateSelectionState = useCallback(() => {
    if (activeTab !== 'visual') return;

    try {
      setIsBold(document.queryCommandState('bold'));
      setIsItalic(document.queryCommandState('italic'));
      setIsUnderline(document.queryCommandState('underline'));
      setIsStrike(document.queryCommandState('strikeThrough'));
      setIsUl(document.queryCommandState('insertUnorderedList'));
      setIsOl(document.queryCommandState('insertOrderedList'));

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      let node: Node | null = selection.anchorNode;
      if (node && node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode;
      }

      let detectedBlock: HeadingType = 'p';
      let inQuote = false;

      while (node && node !== visualEditorRef.current) {
        const tag = (node as HTMLElement).tagName?.toLowerCase();
        if (tag === 'blockquote') {
          inQuote = true;
        }
        if (tag === 'h1') detectedBlock = 'h1';
        else if (tag === 'h2') detectedBlock = 'h2';
        else if (tag === 'h3') detectedBlock = 'h3';
        else if (tag === 'h4') detectedBlock = 'h4';
        else if (tag === 'p' && detectedBlock === 'p') detectedBlock = 'p';

        node = node.parentNode;
      }

      setCurrentBlock(detectedBlock);
      setIsBlockquote(inQuote);
    } catch {
      // ignore queryCommandState failures
    }
  }, [activeTab]);

  const handleVisualInput = () => {
    if (visualEditorRef.current) {
      let html = visualEditorRef.current.innerHTML;
      // Clean up literal &amp;nbsp; or unnecessary &nbsp; entities into standard clean spaces
      html = html.replace(/&amp;nbsp;/g, ' ').replace(/&nbsp;/g, ' ');
      onChange(html);
      updateSelectionState();
    }
  };

  const handleVisualPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text/plain');
    if (text && text.includes('&nbsp;')) {
      e.preventDefault();
      const cleaned = text.replace(/&nbsp;/g, ' ');
      document.execCommand('insertText', false, cleaned);
      handleVisualInput();
    }
  };

  // Execute standard formatting commands
  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (activeTab === 'visual') {
      visualEditorRef.current?.focus();
      try {
        document.execCommand(command, false, arg);
        handleVisualInput();
      } catch (err) {
        console.error('execCommand error:', err);
      }
    } else {
      // In code mode, apply tag around selection
      handleCodeModeTag(command, arg);
    }
  };

  // Change heading block (WordPress style)
  const handleSelectHeading = (heading: HeadingType) => {
    setIsHeadingDropdownOpen(false);
    setCurrentBlock(heading);

    if (activeTab === 'visual') {
      visualEditorRef.current?.focus();
      try {
        if (heading === 'p') {
          document.execCommand('formatBlock', false, '<p>');
        } else {
          document.execCommand('formatBlock', false, `<${heading}>`);
        }
        handleVisualInput();
      } catch {
        // fallback
      }
    } else {
      if (heading === 'p') {
        insertTextInCode('<p>', '</p>', 'Teks paragraf');
      } else {
        insertTextInCode(`<${heading}>`, `</${heading}>`, `Judul ${heading.toUpperCase()}`);
      }
    }
  };

  // Toggle Blockquote
  const handleToggleBlockquote = () => {
    if (activeTab === 'visual') {
      visualEditorRef.current?.focus();
      if (isBlockquote) {
        document.execCommand('formatBlock', false, '<p>');
      } else {
        document.execCommand('formatBlock', false, '<blockquote>');
      }
      handleVisualInput();
    } else {
      insertTextInCode('<blockquote>', '</blockquote>', 'Kutipan narasumber...');
    }
  };

  // Save selection before opening link modal
  const handleOpenLinkModal = () => {
    if (activeTab === 'visual') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
        const text = sel.toString();
        if (text) setLinkTextInput(text);
      }
    }
    setShowLinkPrompt(true);
  };

  // Insert Link
  const handleInsertLink = () => {
    if (!linkUrlInput.trim()) return;
    const url = linkUrlInput.trim();
    const text = linkTextInput.trim() || url;

    if (activeTab === 'visual') {
      visualEditorRef.current?.focus();
      if (savedSelectionRef.current) {
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(savedSelectionRef.current);
      }

      const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-red-600 font-semibold hover:underline">${text}</a>`;
      document.execCommand('insertHTML', false, linkHtml);
      handleVisualInput();
    } else {
      const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      insertTextInCode(linkHtml, '', '');
    }

    setLinkUrlInput('https://');
    setLinkTextInput('');
    setShowLinkPrompt(false);
    savedSelectionRef.current = null;
  };

  // Insert Photo from Modal
  const handleInsertImagePayload = (payload: InsertImagePayload) => {
    const mediaIdAttr = payload.mediaId ? ` data-media-id="${payload.mediaId}"` : '';
    const captionHtml = payload.caption?.trim()
      ? `\n  <figcaption class="text-xs text-slate-500 mt-2 italic text-center">${payload.caption.trim()}</figcaption>`
      : '';
    const figureHtml = `<figure class="my-6"${mediaIdAttr}><img src="${payload.url.trim()}" alt="${payload.alt?.trim() || 'Ilustrasi Berita'}" class="w-full rounded-md object-cover" />${captionHtml}</figure><p><br></p>`;

    if (activeTab === 'visual') {
      visualEditorRef.current?.focus();
      document.execCommand('insertHTML', false, figureHtml);
      handleVisualInput();
    } else {
      insertTextInCode('\n' + figureHtml + '\n', '', '');
    }
  };

  // Helper for Code Mode tag insertion
  const insertTextInCode = (openTag: string, closeTag: string, defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end) || defaultText;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);

    const newContent = `${before}${openTag}${selected}${closeTag}${after}`;
    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + openTag.length,
        start + openTag.length + selected.length
      );
    }, 10);
  };

  const handleCodeModeTag = (command: string, arg?: string) => {
    switch (command) {
      case 'bold':
        insertTextInCode('<strong>', '</strong>', 'teks tebal');
        break;
      case 'italic':
        insertTextInCode('<em>', '</em>', 'teks miring');
        break;
      case 'underline':
        insertTextInCode('<u>', '</u>', 'teks bergaris bawah');
        break;
      case 'strikeThrough':
        insertTextInCode('<s>', '</s>', 'teks dicoret');
        break;
      case 'insertUnorderedList':
        insertTextInCode('<ul>\n  <li>', '</li>\n  <li>Poin kedua</li>\n</ul>\n', 'Poin pertama');
        break;
      case 'insertOrderedList':
        insertTextInCode('<ol>\n  <li>', '</li>\n  <li>Langkah kedua</li>\n</ol>\n', 'Langkah pertama');
        break;
      default:
        break;
    }
  };

  // Keydown handler in Visual Editor
  const handleVisualKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Shift + Enter -> Single line break <br>
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertLineBreak');
      handleVisualInput();
      return;
    }

    // Standard Enter -> creates clean paragraph <p> with margin
    if (e.key === 'Enter' && !e.shiftKey) {
      // Let browser execute default paragraph separator (which is <p>)
      setTimeout(() => {
        handleVisualInput();
        updateSelectionState();
      }, 0);
    }
  };

  const activeHeadingObj = HEADING_OPTIONS.find((h) => h.value === currentBlock) || HEADING_OPTIONS[0];

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
      {/* Top Toolbar Bar (WordPress Classic Style) */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap items-center justify-between gap-2">
        {/* Left Toolbar formatting cluster */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* WordPress-Style Heading Dropdown */}
          <div className="relative" ref={headingDropdownRef}>
            <button
              type="button"
              onClick={() => setIsHeadingDropdownOpen(!isHeadingDropdownOpen)}
              title="Pilih Format Penajukan / Paragraf"
              className="h-8 px-2.5 py-1 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-between gap-2 min-w-[125px] shadow-2xs transition-colors cursor-pointer"
            >
              <span className="truncate">{activeHeadingObj.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isHeadingDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isHeadingDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1.5 animate-fade-in divide-y divide-slate-100">
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Format Blok Teks
                </div>
                <div className="py-1">
                  {HEADING_OPTIONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleSelectHeading(item.value)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        currentBlock === item.value ? 'bg-red-50/70 text-red-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className={item.className}>{item.label}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{item.desc}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-300 mx-0.5" />

          {/* Bold */}
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            title="Tebal (Ctrl+B) - <strong>"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isBold
                ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                : 'text-slate-700 hover:bg-slate-200/80 bg-white border-slate-200/80'
            }`}
          >
            <Bold className="w-4 h-4" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            title="Miring (Ctrl+I) - <em>"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isItalic
                ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                : 'text-slate-700 hover:bg-slate-200/80 bg-white border-slate-200/80'
            }`}
          >
            <Italic className="w-4 h-4" />
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            title="Garis Bawah (Ctrl+U) - <u>"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isUnderline
                ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                : 'text-slate-700 hover:bg-slate-200/80 bg-white border-slate-200/80'
            }`}
          >
            <Underline className="w-4 h-4" />
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            onClick={() => executeCommand('strikeThrough')}
            title="Coret Teks - <s>"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isStrike
                ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                : 'text-slate-700 hover:bg-slate-200/80 bg-white border-slate-200/80'
            }`}
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-0.5" />

          {/* Blockquote */}
          <button
            type="button"
            onClick={handleToggleBlockquote}
            title="Kutipan Narasumber (<blockquote>)"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isBlockquote
                ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                : 'text-slate-700 hover:bg-slate-200/80 bg-white border-slate-200/80'
            }`}
          >
            <Quote className="w-4 h-4" />
          </button>

          {/* Unordered List */}
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            title="Daftar Simbol Titik (<ul><li>)"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isUl
                ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                : 'text-slate-700 hover:bg-slate-200/80 bg-white border-slate-200/80'
            }`}
          >
            <List className="w-4 h-4" />
          </button>

          {/* Ordered List */}
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            title="Daftar Nomor (<ol><li>)"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isOl
                ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                : 'text-slate-700 hover:bg-slate-200/80 bg-white border-slate-200/80'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-0.5" />

          {/* Align Left */}
          <button
            type="button"
            onClick={() => executeCommand('justifyLeft')}
            title="Rata Kiri"
            className="p-1.5 text-slate-700 hover:bg-slate-200/80 bg-white border border-slate-200/80 rounded-lg transition-colors cursor-pointer"
          >
            <AlignLeft className="w-4 h-4" />
          </button>

          {/* Align Center */}
          <button
            type="button"
            onClick={() => executeCommand('justifyCenter')}
            title="Rata Tengah"
            className="p-1.5 text-slate-700 hover:bg-slate-200/80 bg-white border border-slate-200/80 rounded-lg transition-colors cursor-pointer"
          >
            <AlignCenter className="w-4 h-4" />
          </button>

          {/* Align Right */}
          <button
            type="button"
            onClick={() => executeCommand('justifyRight')}
            title="Rata Kanan"
            className="p-1.5 text-slate-700 hover:bg-slate-200/80 bg-white border border-slate-200/80 rounded-lg transition-colors cursor-pointer"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-0.5" />

          {/* Insert Link */}
          <button
            type="button"
            onClick={handleOpenLinkModal}
            title="Sisipkan Tautan (Link)"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              showLinkPrompt
                ? 'bg-red-600 text-white border-red-600'
                : 'text-slate-700 hover:bg-slate-200/80 bg-white border-slate-200/80'
            }`}
          >
            <Link2 className="w-4 h-4" />
          </button>

          {/* Insert Photo Button */}
          {allowPhotoInsert && (
            <button
              type="button"
              onClick={() => setIsInsertPhotoModalOpen(true)}
              title="Sisipkan Foto dari Media Library / Upload (Otomatis WebP)"
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 bg-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <ImageIcon className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold text-slate-800">Sisipkan Foto</span>
            </button>
          )}

          {/* Clear Format */}
          <button
            type="button"
            onClick={() => executeCommand('removeFormat')}
            title="Hapus Format (Clear Formatting)"
            className="p-1.5 text-slate-600 hover:bg-slate-200/80 bg-white border border-slate-200/80 rounded-lg transition-colors cursor-pointer"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>

          {/* Undo / Redo */}
          <div className="hidden sm:flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => executeCommand('undo')}
              title="Urungkan (Ctrl+Z)"
              className="p-1.5 text-slate-600 hover:bg-slate-200/80 bg-white border border-slate-200/80 rounded-lg transition-colors cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('redo')}
              title="Ulangi (Ctrl+Y)"
              className="p-1.5 text-slate-600 hover:bg-slate-200/80 bg-white border border-slate-200/80 rounded-lg transition-colors cursor-pointer"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Tab Switcher: Visual (WYSIWYG) vs Teks (HTML Code) */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setActiveTab('visual');
              setTimeout(updateSelectionState, 50);
            }}
            className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'visual'
                ? 'bg-white text-red-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visual</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Teks / HTML</span>
          </button>
        </div>
      </div>

      {/* Pop-up Sub-form: Insert Link */}
      {showLinkPrompt && (
        <div className="bg-red-50/70 border-b border-red-200 p-3 flex flex-wrap items-center gap-2 animate-fade-in">
          <input
            type="text"
            placeholder="Teks tautan (opsional)"
            value={linkTextInput}
            onChange={(e) => setLinkTextInput(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs flex-1 min-w-[150px] focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          <input
            type="url"
            placeholder="URL Target (https://...)"
            value={linkUrlInput}
            onChange={(e) => setLinkUrlInput(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs flex-1 min-w-[220px] focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleInsertLink}
            className="px-3.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors cursor-pointer shadow-2xs"
          >
            Sisipkan Link
          </button>
          <button
            type="button"
            onClick={() => {
              setShowLinkPrompt(false);
              savedSelectionRef.current = null;
            }}
            className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-300 transition-colors cursor-pointer"
          >
            Batal
          </button>
        </div>
      )}

      {/* Insert Photo Modal */}
      {allowPhotoInsert && (
        <InsertPhotoModal
          isOpen={isInsertPhotoModalOpen}
          onClose={() => setIsInsertPhotoModalOpen(false)}
          onInsert={handleInsertImagePayload}
        />
      )}

      {/* Main Editing Area */}
      <div className="relative bg-white" style={{ minHeight }}>
        {/* MODE 1: VISUAL (WYSIWYG CONTENTEDITABLE) */}
        <div
          style={{ display: activeTab === 'visual' ? 'block' : 'none' }}
          className="h-full"
        >
          <div
            ref={visualEditorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleVisualInput}
            onPaste={handleVisualPaste}
            onKeyUp={updateSelectionState}
            onMouseUp={updateSelectionState}
            onTouchEnd={updateSelectionState}
            onKeyDown={handleVisualKeyDown}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className="p-5 text-slate-800 text-sm sm:text-base leading-relaxed focus:outline-none overflow-y-auto max-h-[600px] custom-scrollbar
              prose prose-slate max-w-none
              [&>p]:mb-4 [&>p]:leading-relaxed
              [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-slate-900 [&>h1]:mb-3 [&>h1]:mt-6
              [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-6 [&>h2]:mb-3
              [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-5 [&>h3]:mb-2
              [&>h4]:text-base [&>h4]:font-bold [&>h4]:text-slate-800 [&>h4]:mt-4 [&>h4]:mb-2
              [&>blockquote]:border-l-4 [&>blockquote]:border-red-600 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-700 [&>blockquote]:my-4 [&>blockquote]:bg-slate-50/50 [&>blockquote]:py-2 [&>blockquote]:rounded-r-lg
              [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:my-3 [&>ul]:space-y-1
              [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:my-3 [&>ol]:space-y-1
              [&>figure]:my-6 [&>figure>img]:rounded-xl [&>figure>img]:w-full [&>figure>img]:shadow-sm
              [&>figure>figcaption]:text-xs [&>figure>figcaption]:text-slate-500 [&>figure>figcaption]:mt-2 [&>figure>figcaption]:text-center [&>figure>figcaption]:italic
              [&>a]:text-red-600 [&>a]:font-semibold [&>a]:underline
              empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:italic empty:before:pointer-events-none"
          />
        </div>

        {/* MODE 2: TEKS / CODE (HTML SOURCE) */}
        {activeTab === 'code' && (
          <div className="p-0">
            <textarea
              ref={textareaRef}
              rows={16}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              style={{ minHeight }}
              className="w-full p-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:bg-slate-50/40 resize-y font-mono leading-relaxed custom-scrollbar border-0 bg-transparent"
            />
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 font-medium">
        {showWordStats ? (
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span>
              Format Aktif: <strong className="text-red-600 font-bold">{activeHeadingObj.label}</strong>
            </span>
            <span>•</span>
            <span>
              Jumlah Kata: <strong className="text-slate-700">{wordCount}</strong>
            </span>
            <span>•</span>
            <span>
              Karakter: <strong className="text-slate-700">{characterCount}</strong>
            </span>
            <span>•</span>
            <span>
              Estimasi Baca: <strong className="text-slate-700">~{readTimeMinutes} menit</strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span>
              Format Aktif: <strong className="text-red-600 font-bold">{activeHeadingObj.label}</strong>
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Editor Visual Interaktif (Tekan Enter untuk &lt;p&gt;, Shift+Enter untuk &lt;br&gt;)</span>
        </div>
      </div>
    </div>
  );
};
