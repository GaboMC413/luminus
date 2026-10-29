"use client";

import React from "react";

interface SettingsGhostLoaderProps {
  activeTab?: string;
}

export function SettingsGhostLoader({ activeTab = "personal" }: SettingsGhostLoaderProps) {
  return (
    <div className="w-full flex flex-col font-sans animate-pulse select-none">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-1.5 mb-5 md:mb-6">
        <div className="h-7 w-52 bg-slate-200/80 rounded-lg hidden md:block" />
        <div className="h-4 w-72 max-w-full bg-slate-100 rounded-md" />
      </div>

      {activeTab === "membership" ? (
        <div className="flex flex-col gap-6 max-w-3xl w-full">
          {/* 1. Subscription Card Skeleton */}
          <div className="flex flex-col gap-2.5">
            <div className="h-3.5 w-32 bg-slate-200/70 rounded" />
            <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
              {/* Header: Title, Price, Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="h-6 w-40 bg-slate-200/80 rounded-lg" />
                  <div className="h-9 w-32 bg-slate-200/90 rounded-lg" />
                  <div className="h-4 w-64 bg-slate-100 rounded-md mt-1" />
                </div>
              </div>

              {/* Benefits list skeleton */}
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                {[1, 2, 3, 4].map((b) => (
                  <div key={b} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-slate-200/80 shrink-0" />
                    <div className="h-3.5 bg-slate-100 rounded" style={{ width: `${55 + b * 9}%` }} />
                  </div>
                ))}
                <div className="h-3 w-4/5 bg-slate-100 rounded pt-1 mt-1" />
              </div>

              {/* Bottom cancel action */}
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <div className="h-6 w-28 bg-slate-100 rounded" />
              </div>
            </div>
          </div>

          {/* 2. Payment Methods Skeleton */}
          <div className="flex flex-col gap-2.5">
            <div className="h-3.5 w-32 bg-slate-200/70 rounded" />
            <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-slate-200/80 rounded" />
                  <div className="h-4 w-36 bg-slate-200/80 rounded" />
                </div>
                <div className="h-5 w-24 bg-slate-100 rounded-full" />
              </div>
            </div>
          </div>

          {/* 3. Billing Info Skeleton */}
          <div className="flex flex-col gap-2.5">
            <div className="h-3.5 w-44 bg-slate-200/70 rounded" />
            <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex flex-col gap-3">
                <div className="h-4 w-52 bg-slate-100 rounded" />
                <div className="h-4 w-64 bg-slate-100 rounded" />
                <div className="h-4 w-44 bg-slate-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "personal" ? (
        /* Personal Info Grid Skeleton - 1:1 match with real 5 fields in grid */
        <div className="flex flex-col gap-6 w-full">
          {/* Row 1: Nombre | Apellido */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5 w-full max-w-lg">
              <div className="h-3 w-16 bg-slate-200/80 rounded" />
              <div className="flex items-center gap-2">
                <div className="h-11 flex-1 bg-slate-50 border border-slate-200/70 rounded-xl" />
                <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 w-full max-w-lg">
              <div className="h-3 w-16 bg-slate-200/80 rounded" />
              <div className="flex items-center gap-2">
                <div className="h-11 flex-1 bg-slate-50 border border-slate-200/70 rounded-xl" />
                <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
              </div>
            </div>
          </div>

          {/* Row 2: Profesión | Ciudad */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5 w-full max-w-lg">
              <div className="h-3 w-20 bg-slate-200/80 rounded" />
              <div className="flex items-center gap-2">
                <div className="h-11 flex-1 bg-slate-50 border border-slate-200/70 rounded-xl" />
                <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 w-full max-w-lg">
              <div className="h-3 w-16 bg-slate-200/80 rounded" />
              <div className="flex items-center gap-2">
                <div className="h-11 flex-1 bg-slate-50 border border-slate-200/70 rounded-xl" />
                <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
              </div>
            </div>
          </div>

          {/* Row 3: Fecha de nacimiento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5 w-full max-w-lg">
              <div className="h-3 w-36 bg-slate-200/80 rounded" />
              <div className="flex items-center gap-2">
                <div className="h-11 flex-1 bg-slate-50 border border-slate-200/70 rounded-xl" />
                <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "phone" ? (
        /* Phone Section Skeleton */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <div className="flex flex-col gap-1.5 w-full max-w-lg">
            <div className="h-3 w-32 bg-slate-200/80 rounded" />
            <div className="flex items-center gap-2">
              <div className="h-11 flex-1 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center px-3.5">
                <div className="h-4 w-8 bg-slate-200/80 rounded mr-2" />
                <div className="h-5 border-r border-slate-200/80 mr-2.5" />
                <div className="h-4 w-28 bg-slate-200/60 rounded" />
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
            </div>
          </div>
        </div>
      ) : activeTab === "email" ? (
        /* Email Section Skeleton */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <div className="flex flex-col gap-1.5 w-full max-w-lg">
            <div className="h-3 w-16 bg-slate-200/80 rounded" />
            <div className="flex items-center gap-2">
              <div className="h-11 flex-1 bg-slate-50 border border-slate-200/70 rounded-xl" />
              <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
            </div>
          </div>
        </div>
      ) : (
        /* Password Section Skeleton */
        <div className="w-full max-w-md flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-32 bg-slate-200/80 rounded" />
            <div className="h-11 w-full bg-slate-50 border border-slate-200/70 rounded-xl" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-28 bg-slate-200/80 rounded" />
            <div className="h-11 w-full bg-slate-50 border border-slate-200/70 rounded-xl" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-36 bg-slate-200/80 rounded" />
            <div className="h-11 w-full bg-slate-50 border border-slate-200/70 rounded-xl" />
          </div>
          <div className="h-9 w-36 bg-slate-200/80 rounded-xl mt-2" />
        </div>
      )}
    </div>
  );
}
