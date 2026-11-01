"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CardHeader } from "@/components/ui/CardHeader";
import { ListItemRow } from "@/components/ui/ListItemRow";
import { Button } from "@/components/ui/Button";
import { formatLocationDisplay } from "@/utils/locationUtils";

interface RecentMembersCardProps {
  members: any[];
  loading?: boolean;
  onViewAllMembers: () => void;
}

export function RecentMembersCard({ members, loading, onViewAllMembers }: RecentMembersCardProps) {
  const router = useRouter();

  // Display only the first 6 members with photos, excluding ghost & official accounts
  const recentMembers = members
    .filter(
      (m) =>
        !m.isGhost &&
        m.id !== "50d13047-bab8-44f1-9541-a821113845cc" &&
        m.id !== "mock-luminus" &&
        m.name?.toLowerCase() !== "luminus" &&
        Boolean(m.avatar && typeof m.avatar === "string" && m.avatar.trim())
    )
    .slice(0, 6);

  return (
    <div className="card-surface flex flex-col gap-3">
      {/* Molecule: CardHeader */}
      <CardHeader title="Nuevos miembros" />

      {/* Members list */}
      {loading && members.length === 0 ? (
        <div className="flex flex-col gap-3 py-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse p-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="w-24 h-3 bg-slate-100 rounded" />
                <div className="w-16 h-2.5 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : recentMembers.length === 0 ? (
        <p className="text-meta text-slate-400 py-3 text-center">
          No hay miembros registrados aún.
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {recentMembers.map((member) => (
            <ListItemRow
              key={member.id}
              avatar={member.avatar}
              name={member.name}
              subtitle={formatLocationDisplay(member.location) || "Miembro de la comunidad"}
              onClick={() => router.push(`/inicio/public-profile?id=${encodeURIComponent(member.id)}`)}
            />
          ))}
        </div>
      )}

      {/* Button to see all members */}
      <Button
        variant="soft"
        size="sm"
        onClick={onViewAllMembers}
        className="w-full mt-1"
      >
        Ver todos los miembros
      </Button>
    </div>
  );
}
