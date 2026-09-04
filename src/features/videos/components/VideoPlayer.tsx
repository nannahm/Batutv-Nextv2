'use client';

import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { getYouTubeEmbedUrl } from '@/src/utils/youtube';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  duration?: string;
  autoPlay?: boolean;
  className?: string;
}

export function VideoPlayer({
  videoId,
  title,
  thumbnailUrl,
  duration,
  autoPlay = false,
  className = '',
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <div
      className={`relative w-full aspect-video bg-neutral-950 rounded-xl overflow-hidden shadow-lg border border-neutral-800 group ${className}`}
    >
      {isPlaying ? (
        <iframe
          src={getYouTubeEmbedUrl(videoId, true)}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={handlePlay}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handlePlay();
            }
          }}
          className="relative w-full h-full cursor-pointer select-none"
          aria-label={`Putar video: ${title}`}
        >
          {/* Poster Image */}
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Vignette & Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* BatuTV Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            <span className="bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded shadow-sm tracking-wider uppercase">
              BatuTV HD
            </span>
          </div>

          {/* Duration Badge */}
          {duration && (
            <div className="absolute bottom-3 right-3 z-10">
              <span className="bg-black/80 backdrop-blur-xs text-white text-xs font-semibold px-2 py-1 rounded border border-white/10 shadow">
                {duration}
              </span>
            </div>
          )}

          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-red-600 group-active:scale-95 border-2 border-white/20">
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white ml-0.5" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
