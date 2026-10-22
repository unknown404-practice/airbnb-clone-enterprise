import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3">
      {/* Image aspect ratio container */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden animate-shimmer" />

      {/* Meta lines */}
      <div className="flex items-center justify-between pt-1">
        <div className="h-4 w-3/5 rounded-md animate-shimmer" />
        <div className="h-4 w-10 rounded-md animate-shimmer" />
      </div>

      <div className="h-3 w-4/5 rounded-md animate-shimmer" />
      <div className="h-3 w-2/5 rounded-md animate-shimmer" />

      <div className="pt-1 flex items-baseline space-x-1">
        <div className="h-4 w-16 rounded-md animate-shimmer" />
        <div className="h-3 w-10 rounded-md animate-shimmer" />
      </div>
    </div>
  );
}
