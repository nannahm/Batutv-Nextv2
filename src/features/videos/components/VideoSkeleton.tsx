import React from 'react';

export function VideoCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 animate-pulse">
      <div className="aspect-video bg-neutral-200 dark:bg-neutral-800 w-full" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
        <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
        <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-4/5" />
        <div className="pt-2 flex justify-between">
          <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
          <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function VideoGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}
