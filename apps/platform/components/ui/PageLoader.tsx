import React from "react";
import { DotSpinner } from "./DotSpinner";

interface PageLoaderProps {
  className?: string;
}

export function PageLoader({ className = "" }: PageLoaderProps) {
  return (
    <div className={`flex-1 w-full h-full min-h-[300px] flex flex-col items-center justify-center select-none bg-[#F8FAFC] ${className}`}>
      <DotSpinner size={40} color="black" />
    </div>
  );
}
