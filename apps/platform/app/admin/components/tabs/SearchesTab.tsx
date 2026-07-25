"use client";

import { useState, useMemo } from "react";
import { AdminSearch } from "../../types";
import { InputField } from "@/components/ui/InputField";
import { formatShortTime, fieldValue } from "../../utils";
import { AdminCard } from "../AdminDesignSystem";

interface SearchesTabProps {
  searches: AdminSearch[];
}

export function SearchesTab({ searches }: SearchesTabProps) {
  const [searchQueryFilter, setSearchQueryFilter] = useState("");

  const filteredSearches = useMemo(() => {
    const query = searchQueryFilter.trim().toLowerCase();
    if (!query) return searches;

    return searches.filter((item) => {
      const full = item.user.profile.fullName || `${item.user.profile.firstName} ${item.user.profile.lastName}`;
      return (
        full.toLowerCase().includes(query) ||
        item.user.email.toLowerCase().includes(query) ||
        item.query.toLowerCase().includes(query)
      );
    });
  }, [searches, searchQueryFilter]);

  return (
    <div className="mx-auto flex max-w-[1350px] flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold leading-tight font-jakarta">Búsquedas de Comunidad</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            {filteredSearches.length}{" "}
            {filteredSearches.length === 1 ? "búsqueda registrada" : "búsquedas registradas"}
          </p>
        </div>
      </header>

      {/* Filter toolbar card */}
      <AdminCard className="p-4">
        <InputField
          value={searchQueryFilter}
          onChange={(event) => setSearchQueryFilter(event.target.value)}
          placeholder="Buscar por usuario, email o término de búsqueda..."
          className="!w-full !h-10 text-xs"
        />
      </AdminCard>

      {/* Table Card */}
      <AdminCard>
        <div className="grid grid-cols-[1.5fr_2fr_180px] border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
          <span>Usuario</span>
          <span>Término Buscado</span>
          <span>Fecha y Hora</span>
        </div>
        <div className="max-h-[680px] overflow-y-auto divide-y divide-slate-100">
          {filteredSearches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <span className="material-symbols-rounded text-[48px] mb-3 text-slate-300">search</span>
              <p className="text-sm font-medium">No se encontraron registros de búsquedas.</p>
            </div>
          ) : (
            filteredSearches.map((item) => (
              <div
                key={item.id}
                className="grid w-full grid-cols-[1.5fr_2fr_180px] items-center px-4 py-3.5 text-left text-[14px] transition hover:bg-slate-50 bg-white"
              >
                {/* User */}
                <span className="flex min-w-0 items-center gap-3">
                  {item.user.profile.avatarUrl ? (
                    <img
                      src={item.user.profile.avatarUrl}
                      alt=""
                      className="h-9 w-9 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[13px] font-bold text-slate-600 uppercase shrink-0">
                      {(item.user.profile.fullName || item.user.email).slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0 pr-2">
                    <span className="block truncate font-bold text-slate-900">
                      {fieldValue(
                        item.user.profile.fullName ||
                          `${item.user.profile.firstName} ${item.user.profile.lastName}`
                      )}
                    </span>
                    <span className="block truncate text-[12px] text-slate-500">{item.user.email}</span>
                  </span>
                </span>

                {/* Query */}
                <span className="font-semibold text-slate-900 truncate pr-4 text-xs" title={item.query}>
                  "{item.query}"
                </span>

                {/* Date */}
                <span className="text-slate-500 font-sans text-xs">{formatShortTime(item.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </AdminCard>
    </div>
  );
}
