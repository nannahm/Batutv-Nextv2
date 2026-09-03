'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Video, Tv } from 'lucide-react';
import Link from 'next/link';
import { PublicVideoItem } from '../types';
import { VideoCard } from './VideoCard';

interface VideoCatalogProps {
  initialVideos: PublicVideoItem[];
  categories?: { name: string; slug: string }[];
}

export function VideoCatalog({ initialVideos, categories = [] }: VideoCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  // Extract unique categories if not provided
  const categoryList = useMemo(() => {
    if (categories.length > 0) return categories;
    const catMap = new Map<string, string>();
    initialVideos.forEach((v) => {
      if (v.categorySlug && v.category) {
        catMap.set(v.categorySlug, v.category);
      }
    });
    return Array.from(catMap.entries()).map(([slug, name]) => ({ slug, name }));
  }, [categories, initialVideos]);

  // Filter and sort videos
  const filteredVideos = useMemo(() => {
    return initialVideos
      .filter((video) => {
        const matchesCategory =
          selectedCategory === 'all' || video.categorySlug === selectedCategory;
        const matchesQuery =
          !searchQuery.trim() ||
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (video.tags && video.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return (b.views || 0) - (a.views || 0);
        }
        // Default latest: parse date
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
  }, [initialVideos, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search + Category Pills + Sort */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 sm:p-5 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari video liputan, program, topik..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                Reset
              </button>
            )}
          </div>

          {/* Sort & Live Stream CTA */}
          <div className="flex items-center gap-2.5 justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'latest' | 'popular')}
              className="px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:ring-2 focus:ring-red-500"
            >
              <option value="latest">Terbaru</option>
              <option value="popular">Terpopuler</option>
            </select>

            <Link
              href="/video/live"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-xs"
            >
              <Tv className="w-4 h-4" />
              <span className="hidden sm:inline">Live Stream</span>
            </Link>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full font-medium transition cursor-pointer whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
            }`}
          >
            Semua Video ({initialVideos.length})
          </button>
          {categoryList.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-full font-medium transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.slug
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-8">
          <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400 mb-3">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
            Tidak Ada Video Ditemukan
          </h3>
          <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `Tidak ada video yang cocok dengan kata kunci "${searchQuery}". Coba gunakan kata kunci lain.`
              : 'Belum ada video pada kategori yang dipilih.'}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition"
            >
              Reset Filter Pencarian
            </button>
          )}
        </div>
      )}
    </div>
  );
}
