import React from "react";
import { Skeleton } from "./Skeleton";

interface PageLoaderProps {
  className?: string;
}

/**
 * Global fallback page loader.
 * Renders a clean ghost skeleton container instead of a blocking circular spinner.
 */
export function PageLoader({ className = "" }: PageLoaderProps) {
  return (
    <div className={`flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-40 rounded-md" />
          <Skeleton className="h-3 w-28 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
