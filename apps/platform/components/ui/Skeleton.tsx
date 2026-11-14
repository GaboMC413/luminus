import React from "react";
import { PostCardSkeleton } from "@/components/community/PostCard";
import { UserCardSkeleton } from "@/components/ui/UserCard";
import { ActivityCardSkeleton } from "@/components/events/ActivityCard";
import { RecordingCardSkeleton } from "@/components/events/RecordingCard";
import { ProfileSkeleton } from "@/features/user-profile/components/ProfileHeroHeader";

export {
  PostCardSkeleton,
  UserCardSkeleton,
  ActivityCardSkeleton,
  RecordingCardSkeleton,
  ProfileSkeleton,
};

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
 * Skeleton replicating Specialist Card in Directory.
 */
export function SpecialistCardSkeleton() {
  return <UserCardSkeleton />;
}

/**
 * Route-level Suspense fallback for the 3-column Community Feed (`/inicio`).
 * Matches `inicio/page.tsx` DOM geometry: Left profile & network, Center feed, Right members.
 */
export function FeedSkeleton() {
  return (
    <div className="flex-1 w-full flex flex-col h-full overflow-visible">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6 lg:gap-7 h-full overflow-visible pt-4 pb-12 md:py-6">
        {/* COLUMN 1 (LEFT): Profile Card & Mi Red Card */}
        <div className="hidden md:flex w-[240px] lg:w-[270px] flex-col gap-4 shrink-0 h-fit">
          <div className="card-surface !p-0 overflow-hidden flex flex-col relative">
            <Skeleton className="h-20 w-full rounded-none" />
            <div className="flex justify-center -mt-12 relative z-10">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border-4 border-white shrink-0 flex items-center justify-center shadow-sm">
                <Skeleton className="w-full h-full rounded-xl" />
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
            <h1 className="font-jakarta font-bold text-slate-900 tracking-tight text-xl sm:text-2xl m-0 leading-tight">
              Comunidad
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 w-full">
            <div className="flex-1 min-w-0 card-surface p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <Skeleton className="h-10 flex-1 rounded-xl" />
            </div>
            <div className="flex md:hidden items-center gap-2 shrink-0">
              <Skeleton className="w-11 h-11 rounded-xl" />
              <Skeleton className="w-11 h-11 rounded-xl" />
            </div>
          </div>

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
              {[...Array(5)].map((_, i) => (
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
 * Route-level Suspense fallback for Network / Connections (`/red`).
 * Matches `red/page.tsx` exact `max-w-6xl` container and shell structure.
 */
export function NetworkSkeleton() {
  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 min-h-0 overflow-visible font-sans">
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 pt-4 pb-12 md:py-6 flex flex-col min-h-0 overflow-visible">
        <div className="flex items-center gap-3 mb-4 md:mb-6 shrink-0">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <h1 className="text-xl md:text-2xl text-slate-900 font-bold font-jakarta tracking-tight m-0 leading-tight">
            Mi red
          </h1>
        </div>

        <div className="flex flex-col pb-4 gap-3 w-full">
          <div className="grid grid-cols-2 md:flex md:items-center md:gap-8 border-b border-slate-200/90 pb-3 pt-1">
            <Skeleton className="h-5 w-28 rounded-md mx-auto md:mx-0" />
            <Skeleton className="h-5 w-28 rounded-md mx-auto md:mx-0" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>

        <div className="flex-1 w-full pb-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 w-full">
            {[...Array(8)].map((_, idx) => (
              <UserCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Route-level Suspense fallback for Specialist Directory (`/especialistas`).
 */
export function DirectorySkeleton() {
  return <DirectoryGridSkeleton count={10} />;
}

/**
 * Route-level Suspense fallback for Messages (`/mensajes`).
 * Matches 12-column split with clean unselected right-pane surface (no fake active chat bubbles).
 */
export function MessagesSkeleton() {
  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 min-h-0 md:h-full overflow-hidden">
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col min-h-0 overflow-hidden px-4 md:px-6 py-4 md:py-4">
        <div className="w-full max-w-6xl mx-auto flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center gap-3 mb-3 md:mb-4 shrink-0">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <h1 className="text-xl md:text-2xl text-slate-900 font-bold font-jakarta">Mensajes</h1>
          </div>

          <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 items-stretch flex-1 min-h-0 overflow-hidden">
            {/* Left 4 cols: Conversations List */}
            <div className="md:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden flex-1 md:flex-initial md:h-full md:min-h-0">
              <div className="p-3 border-b border-slate-100 shrink-0">
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
              <div className="flex-1 min-h-0 p-2 flex flex-col gap-2 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
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

            {/* Right 8 cols: Neutral Surface (matches unselected empty pane) */}
            <div className="hidden md:flex md:col-span-8 flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden flex-1 h-full min-h-0 items-center justify-center p-8">
              <Skeleton className="w-16 h-16 rounded-2xl mb-4" />
              <Skeleton className="h-6 w-36 rounded-md mb-2" />
              <Skeleton className="h-4 w-64 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Route-level Suspense fallback for Notifications (`/notificaciones`).
 * Matches 12-column split on desktop and horizontal pill bar on mobile.
 */
export function NotificationsSkeleton() {
  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 min-h-0 md:h-full overflow-hidden">
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col min-h-0 overflow-hidden px-4 md:px-6 py-4 md:py-4">
        <div className="w-full max-w-6xl mx-auto flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center gap-3 mb-3 md:mb-4 shrink-0">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <h1 className="text-xl md:text-2xl text-slate-900 font-bold font-jakarta">Notificaciones</h1>
          </div>

          <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 items-stretch flex-1 min-h-0 overflow-hidden lg:overflow-visible">
            <div className="md:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden h-fit md:h-full shrink-0">
              <div className="p-3 border-b border-slate-100 shrink-0">
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
              <div className="flex md:hidden items-center gap-2 p-3 overflow-hidden">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24 rounded-full shrink-0" />
                ))}
              </div>
              <div className="hidden md:flex flex-col gap-1 p-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-11 w-full rounded-xl" />
                ))}
              </div>
            </div>

            <div className="md:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden flex-1 md:flex-initial md:h-full md:min-h-0">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <Skeleton className="h-3.5 w-28 rounded-md" />
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-4 sm:p-5 flex items-start gap-4">
                    <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
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
 * Standardized timeline skeleton for Activities (`/actividades`).
 */
export function ActivitiesSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 pb-12 pt-4 sm:px-6 md:gap-7 md:py-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-36 rounded-md" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>
      <div className="w-full flex flex-col">
        {[...Array(3)].map((_, index) => {
          const isLast = index === 2;
          return (
            <div key={index} className="flex gap-4 sm:gap-6 md:gap-7 items-stretch">
              <div className="w-6 shrink-0 flex flex-col items-center">
                <Skeleton className="w-3 h-3 rounded-full shrink-0 mt-1.5" />
                {!isLast && <div className="flex-1 w-[2px] bg-slate-200" />}
              </div>
              <div className={`flex-1 min-w-0 flex flex-col gap-3.5 ${isLast ? "pb-4" : "pb-10 sm:pb-12"}`}>
                <div className="flex items-baseline gap-2">
                  <Skeleton className="h-5 w-16 rounded-md" />
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
                <ActivityCardSkeleton />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Standardized grid skeleton for Recordings (`/grabaciones`).
 */
export function RecordingsSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 pb-12 pt-4 sm:px-6 md:gap-7 md:py-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40 rounded-md" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-1">
        {[...Array(8)].map((_, i) => (
          <RecordingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Standardized directory skeleton for `/especialistas` and `/inicio/miembros` Suspense boundaries.
 */
export function DirectoryGridSkeleton({
  count = 10,
  showBack = false,
}: {
  count?: number;
  showBack?: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 pb-12 pt-4 sm:px-6 md:gap-6 md:py-6">
      <div className="flex flex-col gap-1.5">
        {showBack && <Skeleton className="h-5 w-16 rounded-md mb-1.5" />}
        <Skeleton className="h-7 w-40 rounded-md" />
        <Skeleton className="h-4 w-72 rounded-md mt-0.5" />
      </div>

      <div className="flex items-center gap-2.5 w-full">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <Skeleton className="h-11 w-44 rounded-xl" />
          <Skeleton className="h-11 w-44 rounded-xl" />
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
        <Skeleton className="flex md:hidden h-11 w-24 rounded-xl shrink-0" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 w-full">
        {[...Array(count)].map((_, i) => (
          <UserCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
