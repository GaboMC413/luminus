import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base primitive for ghost / skeleton loading states.
 * Adheres strictly to LUMINUS tokens: neutral slate shades with smooth CSS pulse animation.
 */
export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200/70 rounded-xl ${className}`}
      {...props}
    />
  );
}

/**
 * Skeleton replicating a Community Post Card (`PostCard.tsx`).
 */
export function PostCardSkeleton() {
  return (
    <article className="bg-white rounded-2xl border border-zinc-200 flex flex-col shadow-none overflow-hidden">
      {/* 1. Header: Author info and Post date */}
      <div className="px-4 pt-3.5 pb-2.5 sm:px-5 sm:pt-4 sm:pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex flex-col gap-1.5 min-w-0">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
      </div>

      {/* 2. Post Content */}
      <div className="px-4 py-2 sm:px-5 space-y-2">
        <Skeleton className="h-4 w-2/3 rounded-md mb-1" />
        <Skeleton className="h-3.5 w-full rounded-md" />
        <Skeleton className="h-3.5 w-4/5 rounded-md" />
      </div>

      {/* 3. Media Placeholder */}
      <div className="px-4 sm:px-5 py-2">
        <Skeleton className="h-48 sm:h-64 w-full rounded-xl" />
      </div>

      {/* 4. Action bar */}
      <div className="px-4 py-3 sm:px-5 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-16 rounded-xl" />
          <Skeleton className="h-8 w-16 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
    </article>
  );
}

/**
 * Skeleton replicating a User Card (`UserCard.tsx`).
 */
export function UserCardSkeleton() {
  return (
    <div className="relative bg-white rounded-2xl p-3 md:p-4 flex flex-col items-center gap-2.5 md:gap-3 border border-slate-200 shadow-none">
      {/* Avatar Box */}
      <Skeleton className="w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] md:w-[80px] md:h-[80px] rounded-[16px] sm:rounded-[18px] md:rounded-[22px] shrink-0" />
      
      {/* Name and Location */}
      <div className="flex flex-col items-center gap-1.5 text-center w-full min-w-0">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-3 w-16 rounded-md" />
      </div>

      {/* Action Button */}
      <Skeleton className="w-full mt-0.5 h-8 sm:h-9 rounded-xl" />
    </div>
  );
}

/**
 * Skeleton replicating Specialist Card in Directory (`SpecialistCard`).
 */
export function SpecialistCardSkeleton() {
  return (
    <article className="flex min-h-[220px] flex-col items-center rounded-2xl border border-slate-200 bg-white px-3 py-4 text-center">
      <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl shrink-0" />
      <Skeleton className="mt-3 h-4 w-28 rounded-md" />
      <Skeleton className="mt-1 h-3.5 w-20 rounded-md" />
      <Skeleton className="mt-3 h-4 w-24 rounded-md" />
      <Skeleton className="mt-auto pt-3 h-3 w-16 rounded-md" />
    </article>
  );
}

/**
 * Exact layout skeleton for the 3-column Community Feed (`/inicio`).
 * Matches PlatformContent DOM geometry: Left profile & network, Center feed, Right members.
 */
export function FeedSkeleton() {
  return (
    <div className="flex-1 w-full flex flex-col h-full overflow-visible">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6 lg:gap-7 h-full overflow-visible pt-4 pb-12 md:py-6">
        
        {/* COLUMN 1 (LEFT): Profile Card & Mi Red Card */}
        <div className="hidden md:flex w-[240px] lg:w-[270px] flex-col gap-4 shrink-0 h-fit">
          {/* Main Profile Card */}
          <div className="card-surface !p-0 overflow-hidden flex flex-col relative">
            <Skeleton className="h-20 w-full rounded-none" />
            <div className="flex justify-center -mt-[55px] relative z-10">
              <div className="w-[100px] h-[100px] rounded-[22px] overflow-hidden bg-white border-4 border-white shrink-0 flex items-center justify-center">
                <Skeleton className="w-full h-full rounded-[18px]" />
              </div>
            </div>
            <div className="p-4 flex flex-col items-center text-center gap-3">
              <div className="flex flex-col items-center gap-1.5 w-full">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-24 rounded-md" />
              </div>
              <Skeleton className="h-9 w-full rounded-xl mt-1" />
            </div>
          </div>

          {/* Mi Red Card */}
          <div className="card-surface flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-1">
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="w-10 h-10 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-9 w-full rounded-xl mt-1" />
          </div>
        </div>

        {/* COLUMN 2 (CENTER): Community Heading, Create Post & Posts Feed */}
        <main className="flex-1 min-w-0 max-w-2xl flex flex-col gap-4">
          <div className="shrink-0 pt-0.5">
            <Skeleton className="h-8 w-36 rounded-lg" />
          </div>

          {/* Create Post Input */}
          <div className="card-surface p-3.5 sm:p-4 rounded-2xl border border-zinc-200 flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <Skeleton className="h-10 flex-1 rounded-xl" />
          </div>

          {/* Feed Posts */}
          <div className="flex flex-col gap-4">
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        </main>

        {/* COLUMN 3 (RIGHT): Recent Members Card */}
        <aside className="hidden lg:flex w-[260px] xl:w-[290px] flex-col gap-4 shrink-0 h-fit">
          <div className="card-surface flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-1">
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
            <div className="flex flex-col gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-1.5">
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-24 rounded-md" />
                    <Skeleton className="h-2.5 w-16 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-9 w-full rounded-xl mt-1" />
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Exact layout skeleton for the Network / Connections page (`/red`).
 * Matches NetworkContent DOM structure: Back button, Mi red title, Tabs, Search bar, and UserCard grid.
 */
export function NetworkSkeleton() {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 flex flex-col min-h-0">
      {/* Title & Back Button */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-28 rounded-md" />
          <Skeleton className="h-3.5 w-64 rounded-md" />
        </div>
      </div>

      {/* Toolbar: Navigation Tabs & Search */}
      <div className="flex flex-col gap-3 w-full pb-4">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>

        {/* Search Bar */}
        <Skeleton className="h-11 md:h-12 w-full rounded-xl" />
      </div>

      {/* Grid of UserCards */}
      <div className="flex-1 w-full pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 w-full">
          {[...Array(8)].map((_, idx) => (
            <UserCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Exact layout skeleton for Specialist Directory (`/especialistas`).
 * Matches DOM structure: Search input + filter button + 4-column SpecialistCard grid.
 */
export function DirectorySkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-3 pb-8 pt-4 font-sans sm:px-6 md:gap-6 md:py-6">
      {/* Search Bar & Tune Button */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-12 min-w-0 flex-1 rounded-xl" />
        <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
      </div>

      {/* Specialists 4-Column Grid */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <SpecialistCardSkeleton key={i} />
        ))}
      </section>
    </div>
  );
}

/**
 * Exact layout skeleton for Messages (`/mensajes`).
 * Matches 12-column split: Left 4-cols conversation list, Right 8-cols chat window with header & speech bubbles.
 */
export function MessagesSkeleton() {
  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 min-h-0 md:h-full overflow-hidden">
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col min-h-0 overflow-hidden px-4 md:px-6 py-4 md:py-4">
        <div className="w-full max-w-6xl mx-auto flex flex-col flex-1 min-h-0 overflow-hidden">
          
          {/* Header row */}
          <div className="flex items-center gap-3 mb-3 md:mb-4 shrink-0">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <Skeleton className="h-6 w-32 rounded-md" />
          </div>

          {/* 12-Column Split */}
          <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 items-stretch flex-1 min-h-0 overflow-hidden">
            {/* Left 4 cols: Conversations List */}
            <div className="md:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden flex-1 md:flex-initial md:h-full md:min-h-0">
              <div className="p-3 border-b border-slate-100 shrink-0">
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
              <div className="flex-1 min-h-0 p-2 flex flex-col gap-2 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-3.5 w-24 rounded-md" />
                        <Skeleton className="h-2.5 w-10 rounded-md" />
                      </div>
                      <Skeleton className="h-3 w-36 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 8 cols: Active Chat */}
            <div className="hidden md:flex md:col-span-8 flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden flex-1 h-full min-h-0">
              {/* Chat Header */}
              <div className="p-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 flex flex-col gap-4 justify-end overflow-hidden">
                <div className="flex flex-col items-start gap-1">
                  <Skeleton className="w-[55%] h-10 rounded-xl rounded-tl-none" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="w-[45%] h-12 rounded-xl rounded-tr-none" />
                </div>
                <div className="flex flex-col items-start gap-1">
                  <Skeleton className="w-[65%] h-10 rounded-xl rounded-tl-none" />
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 border-t border-slate-100 flex items-center gap-2">
                <Skeleton className="h-11 flex-1 rounded-xl" />
                <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Exact layout skeleton for Notifications (`/notificaciones`).
 * Matches 12-column split: Left 4-cols sidebar filter list, Right 8-cols notification item rows.
 */
export function NotificationsSkeleton() {
  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 min-h-0 md:h-full overflow-hidden">
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col min-h-0 overflow-hidden px-4 md:px-6 py-4 md:py-4">
        <div className="w-full max-w-6xl mx-auto flex flex-col flex-1 min-h-0 overflow-hidden">
          
          {/* Header row */}
          <div className="flex items-center gap-3 mb-3 md:mb-4 shrink-0">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <Skeleton className="h-6 w-36 rounded-md" />
          </div>

          {/* 12-Column Split */}
          <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 items-stretch flex-1 min-h-0 overflow-hidden lg:overflow-visible">
            
            {/* Sidebar Column (Filters) - 4 cols */}
            <div className="md:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden h-fit md:h-full shrink-0">
              <div className="p-3 border-b border-slate-100 shrink-0">
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
              <div className="hidden md:flex flex-col gap-1 p-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-11 w-full rounded-xl" />
                ))}
              </div>
            </div>

            {/* List Column - 8 cols */}
            <div className="md:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden flex-1 md:flex-initial md:h-full md:min-h-0">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <Skeleton className="h-3.5 w-28 rounded-md" />
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-4 sm:p-5 flex items-start gap-4">
                    <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 rounded-md" />
                      <Skeleton className="h-3 w-1/3 rounded-md" />
                    </div>
                    <Skeleton className="h-3 w-12 rounded-md shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Exact layout skeleton for User Profile (`/perfil-usuario`).
 * Matches ProfileContent DOM: ProfileHeaderCover + 12-col layout (Left 4-cols sidebar with negative top margin, Right 8-cols sections).
 */
export function ProfileSkeleton() {
  return (
    <div className="w-full flex flex-col relative">
      {/* Cover Skeleton */}
      <Skeleton className="w-full aspect-[3/1] sm:aspect-[4/1] md:aspect-[5/1] max-h-[320px] rounded-none" />

      {/* Main Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 pb-6 md:pb-12">
        <div className="w-full max-w-6xl mx-auto pt-4 lg:pt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-4 lg:gap-8 items-start">
            
            {/* LEFT COLUMN (4 cols with negative margin overlapping cover) */}
            <div className="md:col-span-4 flex flex-col gap-4 lg:gap-6 mt-0 md:-mt-[136px] lg:-mt-[224px]">
              {/* Profile Card */}
              <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 flex flex-col items-center text-center gap-4 shadow-none">
                <Skeleton className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl shrink-0 shadow-md border-4 border-white" />
                <div className="flex flex-col items-center gap-1.5 w-full">
                  <Skeleton className="h-5 w-36 rounded-md" />
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                  <Skeleton className="h-3 w-28 rounded-md" />
                </div>
                <Skeleton className="h-9 w-full rounded-xl mt-1" />
              </div>

              {/* Membership Card */}
              <div className="hidden md:flex flex-col gap-4 bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3.5 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            </div>

            {/* RIGHT COLUMN (8 cols): About, Interests, Prompts */}
            <div className="md:col-span-8 flex flex-col gap-4 lg:gap-6">
              {/* About Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-3">
                <Skeleton className="h-4 w-28 rounded-md mb-2" />
                <Skeleton className="h-3.5 w-full rounded-md" />
                <Skeleton className="h-3.5 w-4/5 rounded-md" />
              </div>

              {/* Interests Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-3">
                <Skeleton className="h-4 w-24 rounded-md mb-2" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-16 rounded-full" />
                  <Skeleton className="h-7 w-28 rounded-full" />
                </div>
              </div>

              {/* Prompts Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Exact layout skeleton for Unified Banner Showcase screens (`/espacios`, `/grupos`, `/faro`, `/mapa`).
 * Matches exact DOM structure: Outer rounded-3xl container, banner aspect ratio, bottom card with icon container & CTA button.
 */
export function UnifiedBannerSkeleton() {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col items-center justify-center h-full min-h-0 overflow-hidden">
      <div className="w-full max-w-5xl border border-slate-200/80 rounded-3xl overflow-hidden flex flex-col shadow-none flex-1 h-full min-h-0">
        {/* Banner Area */}
        <Skeleton className="w-full flex-1 min-h-0 md:aspect-[2.39/1] md:min-h-[350px] md:flex-initial rounded-none" />

        {/* Info Card */}
        <div className="w-full bg-white border-t border-slate-200/80 p-4 md:p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-6 shadow-none shrink-0">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 w-full md:w-auto">
            <Skeleton className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl shrink-0" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-4 w-64 sm:w-80 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-11 w-full md:w-44 rounded-xl shrink-0" />
        </div>
      </div>
    </div>
  );
}
