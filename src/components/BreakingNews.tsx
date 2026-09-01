import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Zap } from 'lucide-react';

interface BreakingNewsItem {
  id: string;
  title: string;
  category: string;
  time: string;
}

interface BreakingNewsProps {
  items: BreakingNewsItem[];
  onSelectBreaking: (title: string) => void;
}

export const BreakingNews: React.FC<BreakingNewsProps> = ({ items, onSelectBreaking }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const currentItem = items[currentIndex] || items[0];

  return (
    <div id="breaking-news-ticker" className="bg-[#1e293b] border-b border-slate-700 text-white">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 flex items-stretch min-h-[42px]">
        {/* Label Badge */}
        <div className="flex items-center gap-1.5 bg-red-600 px-3 sm:px-4 py-2 font-black text-xs sm:text-sm tracking-wider uppercase whitespace-nowrap shadow-inner flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <Zap className="w-3.5 h-3.5 fill-white text-white" />
          <span>BREAKING NEWS</span>
        </div>

        {/* Content Ticker */}
        <div className="flex-1 flex items-center px-3 sm:px-4 overflow-hidden">
          <div className="flex items-center gap-2 overflow-hidden w-full">
            <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/60 flex-shrink-0">
              {currentItem.category}
            </span>
            <button
              id={`breaking-item-${currentItem.id}`}
              onClick={() => onSelectBreaking(currentItem.title)}
              className="text-xs sm:text-sm font-medium text-slate-100 hover:text-red-400 transition text-left truncate flex-1 hover:underline cursor-pointer"
            >
              {currentItem.title}
            </button>
            <span className="text-[11px] text-slate-400 whitespace-nowrap hidden md:inline-block flex-shrink-0">
              ({currentItem.time})
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1 px-2 border-l border-slate-700 bg-slate-800/60 flex-shrink-0">
          <button
            id="btn-ticker-prev"
            onClick={handlePrev}
            className="p-1 text-slate-400 hover:text-white transition rounded hover:bg-slate-700"
            title="Berita Sebelumnya"
            aria-label="Berita Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            id="btn-ticker-pause"
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 text-slate-400 hover:text-white transition rounded hover:bg-slate-700"
            title={isPaused ? 'Lanjutkan Ticker' : 'Jeda Ticker'}
            aria-label={isPaused ? 'Lanjutkan Ticker' : 'Jeda Ticker'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
          </button>
          <button
            id="btn-ticker-next"
            onClick={handleNext}
            className="p-1 text-slate-400 hover:text-white transition rounded hover:bg-slate-700"
            title="Berita Selanjutnya"
            aria-label="Berita Selanjutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
