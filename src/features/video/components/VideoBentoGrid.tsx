import React from 'react';
import { motion } from 'motion/react';
import { Play, Tv, Eye } from 'lucide-react';
import { VideoNews } from '@/src/types/news';
import { Badge } from '@/src/components/ui/badge';

interface VideoBentoGridProps {
  videos: VideoNews[];
  onPlayVideo: (video: VideoNews) => void;
  onOpenLiveStream?: () => void;
}

export function VideoBentoGrid({
  videos,
  onPlayVideo,
  onOpenLiveStream,
}: VideoBentoGridProps) {
  if (!videos || videos.length === 0) {
    return null;
  }

  const featuredVideo = videos[0];
  const secondaryVideos = videos.slice(1, 5);

  return (
    <section className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white uppercase font-serif">
            BatuTV Video & Siaran
          </h2>
        </div>
        {onOpenLiveStream && (
          <button
            onClick={onOpenLiveStream}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-full transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Tv className="w-3.5 h-3.5 animate-bounce" /> LIVE STREAMING
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Main Video Bento Box */}
        {featuredVideo && (
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            onClick={() => onPlayVideo(featuredVideo)}
            className="md:col-span-2 lg:col-span-2 row-span-2 group relative overflow-hidden rounded-2xl border border-neutral-200/90 dark:border-neutral-800/90 bg-neutral-900 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
              <img
                src={featuredVideo.thumbnailUrl}
                alt={featuredVideo.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition-all">
                  <Play className="w-6 h-6 fill-white translate-x-0.5" />
                </div>
              </div>

              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="default" className="font-bold">
                  {featuredVideo.category}
                </Badge>
                <Badge variant="secondary" className="bg-black/70 text-white">
                  {featuredVideo.duration || '05:20'}
                </Badge>
              </div>
            </div>

            <div className="p-5 space-y-2 text-white bg-neutral-900">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight group-hover:text-red-400 transition-colors line-clamp-2">
                {featuredVideo.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <span>{featuredVideo.views || 0} tayangan</span>
                <span>•</span>
                <span>{featuredVideo.publishedAt || 'Terkini'}</span>
                <span>•</span>
                <span>{featuredVideo.presenter || 'BatuTV'}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Secondary Video Bento Items */}
        {secondaryVideos.map((video, idx) => (
          <motion.div
            key={video.id || idx}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            onClick={() => onPlayVideo(video)}
            className="group relative overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm p-3.5 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-950">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2">
                  <span className="px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                    {video.duration || '03:15'}
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2">
                {video.title}
              </h4>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/50 text-[10px] text-neutral-500">
              <span>{video.publishedAt || 'Terkini'}</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" /> {video.views || 0}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
