import React from 'react';
import { Skeleton } from '@/src/components/ui/skeleton';

export function NewsBentoSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
      {/* Main Feature Bento Card Skeleton */}
      <div className="md:col-span-2 lg:col-span-2 row-span-2 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/70 p-5 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-7 w-4/5 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Secondary Bento Grid Items */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/70 p-4 backdrop-blur-md space-y-3"
        >
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function NewsTableRowSkeleton() {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/40 dark:bg-neutral-900/40"
        >
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-12 w-16 rounded-lg flex-shrink-0" />
            <div className="space-y-2 flex-1 max-w-md">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
