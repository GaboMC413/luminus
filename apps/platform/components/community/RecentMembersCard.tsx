"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface RecentMembersCardProps {
  members: any[];
  loading?: boolean;
  onViewAllMembers: () => void;
}

export function RecentMembersCard({ members, loading, onViewAllMembers }: RecentMembersCardProps) {
  const router = useRouter();
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Display only the first 10 members, excluding official LUMINUS account
  const recent10 = members
    .filter(
      (m) =>
        m.id !== "50d13047-bab8-44f1-9541-a821113845cc" &&
        m.id !== "mock-luminus" &&
        m.name?.toLowerCase() !== "luminus"
    )
    .slice(0, 10);

  const handleAvatarError = (userId: string) => {
    setImgErrors((prev) => ({ ...prev, [userId]: true }));
  };

  const formatLocation = (loc?: string) => {
    if (!loc) return "";
    const parts = loc.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length <= 2) return loc;
    return `${parts[0]}, ${parts[parts.length - 1]}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 flex flex-col gap-4 shadow-none">
      {/* Header */}
      <h4 className="text-base font-bold text-slate-900 font-jakarta">Nuevos miembros</h4>

      {/* Members list */}
      {loading && members.length === 0 ? (
        <div className="flex flex-col gap-3 py-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="w-24 h-3 bg-slate-100 rounded" />
                <div className="w-16 h-2.5 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : recent10.length === 0 ? (
        <p className="text-xs text-slate-400 py-3 text-center font-sans">
          No hay miembros registrados aún.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {recent10.map((member) => {
            const hasAvatar = member.avatar && !imgErrors[member.id];
            return (
              <div
                key={member.id}
                onClick={() => router.push(`/comunidad/public-profile?id=${encodeURIComponent(member.id)}`)}
                className="flex items-center justify-between py-1.5 px-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 group-hover:border-slate-200 transition-colors duration-200 flex items-center justify-center shrink-0">
                    {hasAvatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={() => handleAvatarError(member.id)}
                      />
                    ) : (
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
                    )}
                  </div>

                  {/* Name & Location */}
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-900 group-hover:underline truncate font-jakarta">
                      {member.name}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate font-sans">
                      {formatLocation(member.location) || "Miembro de la comunidad"}
                    </span>
                  </div>
                </div>

                <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 ml-2">
                  chevron_right
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Button to see all members */}
      <button
        type="button"
        onClick={onViewAllMembers}
        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold font-jakarta transition flex items-center justify-center gap-2 cursor-pointer border-none"
      >
        Ver todos los miembros
      </button>
    </div>
  );
}
