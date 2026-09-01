import React from 'react';
import { Radio, Flame, ChevronRight } from 'lucide-react';
import { CategoryItem } from '../types/news';

interface NavbarProps {
  categories: CategoryItem[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
  onOpenLiveStream: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  onOpenLiveStream,
}) => {
  return (
    <nav id="category-navbar" className="bg-[#940a13] text-white shadow-md sticky top-0 z-20 border-b border-red-950/20">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-0.5">
          <ul className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-[13px] font-black tracking-wide whitespace-nowrap">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.slug;
              if (cat.slug === 'live') {
                return (
                  <li key={cat.id}>
                    <button
                      id={`nav-item-${cat.slug}`}
                      onClick={onOpenLiveStream}
                      className="menu-hover-animated flex items-center gap-1.5 px-3 py-1.5 my-1 rounded-full bg-[#c81e28] hover:bg-[#b0141a] text-white transition font-black uppercase shadow-xs cursor-pointer border border-white/20"
                    >
                      <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
                      <span>{cat.name}</span>
                    </button>
                  </li>
                );
              }

              return (
                <li key={cat.id}>
                  <button
                    id={`nav-item-${cat.slug}`}
                    onClick={() => onSelectCategory(cat.slug)}
                    className="menu-hover-animated px-3 py-1.5 my-1 rounded text-center transition-all duration-200 uppercase font-black tracking-wide cursor-pointer text-white hover:bg-[#c81e28] hover:text-white"
                  >
                    {cat.name}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Quick indicator link on right */}
          <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-red-800/60 text-xs font-bold text-white/90">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span>Update 24 Jam</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
