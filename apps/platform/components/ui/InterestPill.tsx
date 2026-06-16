import React from 'react';
import { INTEREST_CATEGORIES } from '@/utils/constants';

interface InterestPillProps {
  interest: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const InterestPill = ({ interest, className = "", size = "md" }: InterestPillProps) => {
  // Find the category for this interest to get the consistent style
  const category = INTEREST_CATEGORIES.find(cat =>
    cat.items.some(item => item.toLowerCase() === interest.toLowerCase())
  );

  const color = category ? category.color : '#94A3B8'; // Default slate-400

  const heightClass = size === 'sm' ? 'h-7 px-2.5' : 'h-9 px-4';
  const textClass = size === 'sm' ? 'text-[11px]' : 'text-[12px] md:text-[14px]';

  return (
    <div 
      className={`${heightClass} rounded-full border flex justify-center items-center transition-all hover:brightness-95 shrink-0 ${className}`}
      style={{
        backgroundColor: `${color}10`, // ~6% opacity for bg
        color: color,
        borderColor: `${color}40`  // ~25% opacity for border
      }}
    >
      <span className={`${textClass} font-medium text-center line-clamp-1 truncate font-sans select-none`}>
        {interest}
      </span>
    </div>
  );
};

export default InterestPill;
