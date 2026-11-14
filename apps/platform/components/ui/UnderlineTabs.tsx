"use client";

import React from "react";

export interface UnderlineTabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

export interface UnderlineTabsProps<T extends string = string> {
  tabs: UnderlineTabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  className?: string;
}

/**
 * Canonical underline navigation tabs — visually distinct from CTA buttons.
 */
export function UnderlineTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = "",
}: UnderlineTabsProps<T>) {
  return (
    <div
      role="tablist"
      className={`grid grid-cols-2 md:flex md:items-center md:gap-8 border-b border-slate-200/90 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`pb-3 pt-1 inline-flex items-center justify-center md:justify-start gap-2 text-xs sm:text-sm font-jakarta transition-colors relative cursor-pointer bg-transparent border-none outline-none whitespace-nowrap ${
              isActive
                ? "text-slate-900 font-bold after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-slate-900 after:rounded-full"
                : "text-slate-500 hover:text-slate-800 font-medium"
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                className={`px-2 py-0.5 rounded-full text-meta leading-none font-semibold ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default UnderlineTabs;
