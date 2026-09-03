'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Tv, Play, Eye, Clock, Sparkles } from 'lucide-react';
import { PublicVideoItem } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { VideoCard } from './VideoCard';

interface VideoBentoGridProps {
  videos: PublicVideoItem[];
  title?: string;
  showLiveButton?: boolean;
}

export function VideoBentoGrid({
  videos,
  title = 'BatuTV Video & Siaran',
  showLiveButton = true,
}: VideoBentoGridProps) {
  const [activeVideo, setActiveVideo] = useState<PublicVideoItem | null>(null);

  if (!videos || videos.length === 0) {
    return null;
  }

  const featuredVideo = activeVideo || videos[0];
  const secondaryVideos = videos.filter((v) => v.id !== featuredVideo.id).slice(0, 4);

  return (
    <section className="w-full space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white uppercase font-serif">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {showLiveButton && (
            <Link
              href="/video/live"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-full transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Tv className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE STREAMING</span>
            </Link>
          )}

          <Link
            href="/video"
            className="text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition"
          >
            Lihat Semua →
          </Link>
        </div>
      </div>

      {/* Bento Grid: 1 Hero (60%) + Secondary Grid (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Featured Video Player & Details (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <VideoPlayer
              key={featuredVideo.videoEmbedId}
              videoId={featuredVideo.videoEmbedId}
              title={featuredVideo.title}
              thumbnailUrl={featuredVideo.thumbnailUrl}
              duration={featuredVideo.duration}
            />

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 uppercase">
                  {featuredVideo.category}
                </span>
                <span className="text-xs text-neutral-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {featuredVideo.timestamp}
                </span>
                <span className="text-xs text-neutral-500 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {featuredVideo.views.toLocaleString('id-ID')} tayangan
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 leading-snug hover:text-red-600 dark:hover:text-red-400 transition">
                <Link href={`/video/${featuredVideo.slug}`}>
                  {featuredVideo.title}
                </Link>
              </h3>

              {featuredVideo.excerpt && (
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                  {featuredVideo.excerpt}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <span>Liputan: <strong className="text-neutral-700 dark:text-neutral-300 font-medium">{featuredVideo.presenter}</strong></span>
            <Link
              href={`/video/${featuredVideo.slug}`}
              className="text-red-600 dark:text-red-400 font-semibold hover:underline"
            >
              Buka Halaman Detail →
            </Link>
          </div>
        </div>

        {/* Secondary Videos (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-200 dark:border-neutral-800">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Video Lainnya
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 overflow-y-auto max-h-[560px] pr-0.5">
            {secondaryVideos.map((video) => (
              <div
                key={video.id}
                className="cursor-pointer"
                onClick={() => setActiveVideo(video)}
              >
                <div className="group flex gap-3 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-800 transition">
                  <div className="relative w-28 sm:w-32 aspect-video bg-neutral-900 rounded overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Play className="w-4 h-4 fill-white text-white" />
                    </div>
                    {video.duration && (
                      <span className="absolute bottom-1 right-1 text-[10px] bg-black/80 text-white px-1 rounded font-semibold">
                        {video.duration}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">
                        {video.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                        {video.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                      <span>{video.timestamp}</span>
                      <span>•</span>
                      <span>{video.views} tonton</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
