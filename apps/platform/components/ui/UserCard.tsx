"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { formatLocationDisplay } from "@/utils/locationUtils";
import { UserAvatar } from "./UserAvatar";
import { getCategoryTextClass } from "./InterestPill";

export interface UserCardData {
  id: string;
  name: string;
  location?: string | null;
  city?: string | null;
  country?: string | null;
  avatar?: string | null;
  interests?: string[];
  categories?: any[];
  specialty?: string | null;
}

export interface UserCardProps {
  user: UserCardData;
  specialty?: string | null;
  actionLabel?: string;
  actionMenu?: React.ReactNode;
  profileHref?: string;
  onSelect?: () => void;
  className?: string;
}

/**
 * Standardized directory card for both Members and Specialists across LUMINUS.
 * Conforms strictly to DESIGN.md Section 2.2, 2.3, and 5.
 */
export function UserCard({
  user,
  specialty,
  actionLabel = "Ver perfil",
  actionMenu,
  profileHref,
  onSelect,
  className = "",
}: UserCardProps) {
  const router = useRouter();

  const isOfficial =
    user.name?.toLowerCase() === "luminus" ||
    user.id === "50d13047-bab8-44f1-9541-a821113845cc" ||
    user.id === "mock-luminus";

  const defaultHref = `/inicio/public-profile?id=${encodeURIComponent(user.id)}`;
  const destination = profileHref || defaultHref;

  const handleCardClick = () => {
    if (isOfficial) return;
    if (onSelect) {
      onSelect();
    } else {
      router.push(destination);
    }
  };

  const rawLocation = user.location || [user.city, user.country].filter(Boolean).join(", ");
  const displayLocation = formatLocationDisplay(rawLocation);
  const activeSpecialty = specialty || user.specialty;

  return (
    <article
      onClick={handleCardClick}
      className={`group relative bg-white rounded-2xl p-3.5 sm:p-4 flex flex-col items-center gap-2.5 sm:gap-3 border border-slate-200/90 hover:border-slate-300 transition-colors shadow-none select-none ${
        isOfficial ? "cursor-default" : "cursor-pointer"
      } ${className}`}
    >
      {actionMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2.5 right-2.5 z-10"
        >
          {actionMenu}
        </div>
      )}

      {/* Standardized Avatar Molecule */}
      <UserAvatar
        src={user.avatar}
        alt={user.name}
        size="lg"
        className="transition-transform duration-150 group-hover:scale-[1.02]"
      />

      {/* User Information */}
      <div className="flex flex-col items-center gap-0.5 text-center w-full min-w-0">
        <h3
          className="font-jakarta text-sm font-semibold text-slate-900 leading-snug truncate w-full px-0.5 group-hover:text-slate-700 transition-colors"
          title={user.name}
        >
          {user.name}
        </h3>

        <p
          className="text-xs font-medium text-slate-500 font-sans truncate w-full px-0.5"
          title={displayLocation || "Ubicación no especificada"}
        >
          {displayLocation || "Ubicación no especificada"}
        </p>

        {activeSpecialty && (
          <span
            className={`text-xs font-semibold mt-1 truncate max-w-full px-1 ${getCategoryTextClass(
              activeSpecialty
            )}`}
            title={activeSpecialty}
          >
            {activeSpecialty}
          </span>
        )}
      </div>

      {/* Standardized Action CTA */}
      {!isOfficial && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors shrink-0 cursor-pointer bg-transparent border-none outline-none font-jakarta mt-auto pt-1"
        >
          {actionLabel}
        </button>
      )}
    </article>
  );
}

export default UserCard;
