import React from 'react';
import Link from 'next/link';
import { Play, Eye, Clock, User } from 'lucide-react';
import { PublicVideoItem } from '../types';

interface VideoCardProps {
  video: PublicVideoItem;
  onPlayQuick?: (video: PublicVideoItem) => void;
  compact?: boolean;
}

export function VideoCard({ video, onPlayQuick, compact = false }: VideoCardProps) {
  return (
    <article className="group flex flex-col bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:shadow-md">
      {/* Thumbnail Container */}
      <div className="relative aspect-video bg-neutral-950 overflow-hidden">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlay Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Category Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-600/90 text-white shadow-xs">
            {video.category}
          </span>
        </div>

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2.5 right-2.5 z-10">
            <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-black/80 backdrop-blur-xs text-white border border-white/10 shadow-xs">
              {video.duration}
            </span>
          </div>
        )}

        {/* Quick Play Action Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          {onPlayQuick ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onPlayQuick(video);
              }}
              className="w-11 h-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 active:scale-95 cursor-pointer"
              aria-label={`Tonton langsung ${video.title}`}
            >
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </button>
          ) : (
            <Link
              href={`/video/${video.slug}`}
              className="w-11 h-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 active:scale-95"
              aria-label={`Tonton ${video.title}`}
            >
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 text-base leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            <Link href={`/video/${video.slug}`}>
              {video.title}
            </Link>
          </h3>

          {!compact && video.excerpt && (
            <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
              {video.excerpt}
            </p>
          )}
        </div>

        {/* Card Footer Metadata */}
        <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1 truncate max-w-[120px]">
            <User className="w-3.5 h-3.5 flex-shrink-0 text-neutral-400" />
            <span className="truncate">{video.presenter}</span>
          </span>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-neutral-400" />
              <span>{video.views.toLocaleString('id-ID')}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>{video.timestamp}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
