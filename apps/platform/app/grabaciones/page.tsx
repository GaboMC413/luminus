"use client";

import React, { useState, useEffect, useMemo } from "react";
import { RecordingCard, RecordingItem } from "@/components/events/RecordingCard";
import {
  RecordingCategorySelector,
  RECORDING_CATEGORIES,
} from "@/components/events/RecordingCategorySelector";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { RecordingsSkeleton } from "@/components/ui/Skeleton";

function normalizeCategoryString(cat?: string | null): string {
  if (!cat) return "";
  const norm = cat.trim().toLowerCase();
  if (
    norm.includes("vinculo") ||
    norm.includes("vínculo") ||
    norm.includes("relacion") ||
    norm.includes("relación")
  ) {
    return "vínculos y relaciones";
  }
  if (
    norm.includes("movimiento") ||
    norm.includes("actividad") ||
    norm.includes("fisic") ||
    norm.includes("físic")
  ) {
    return "movimiento físico";
  }
  if (norm.includes("crecimiento")) return "crecimiento personal";
  if (norm.includes("emocional")) return "bienestar emocional";
  if (norm.includes("salud") || norm.includes("integral")) return "salud integral";
  if (norm.includes("nutricion") || norm.includes("nutrición")) return "nutrición";
  if (norm.includes("espiritual")) return "espiritualidad";
  if (norm.includes("terapia")) return "terapias complementarias";
  return norm;
}

export default function GrabacionesPage() {
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    RECORDING_CATEGORIES[0].id
  );

  useEffect(() => {
    async function fetchRecordings() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/events?type=past&_t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("No se pudieron cargar las grabaciones.");
        }
        const data = await res.json();
        setRecordings(data.events || []);
      } catch (err: any) {
        console.error("[GrabacionesPage] Error fetching past events:", err);
        setError(err.message || "Error al cargar las grabaciones.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecordings();
  }, []);

  const filteredRecordings = useMemo(() => {
    if (
      !selectedCategory ||
      selectedCategory === "Todas las grabaciones" ||
      selectedCategory === "Todos"
    ) {
      return recordings;
    }

    const targetNorm = normalizeCategoryString(selectedCategory);

    return recordings.filter((item) => {
      const itemNorm = normalizeCategoryString(item.category);
      return itemNorm === targetNorm || item.category === selectedCategory;
    });
  }, [recordings, selectedCategory]);

  if (loading) return <RecordingsSkeleton />;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 pb-12 pt-4 font-sans sm:px-6 md:gap-7 md:py-6">
      {/* 1. Standardized In-App Header */}
      <PageHeader
        title="Grabaciones"
        description="Entrevistas y conversaciones sobre bienestar."
      />

      {/* 2. Category Selector */}
      <section className="w-full">
        <RecordingCategorySelector
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </section>

      {/* 3. Recordings Grid / Empty States */}
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
          <p className="font-semibold mb-1">Hubo un problema al cargar las grabaciones</p>
          <p className="text-xs text-rose-600 mb-3">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-xs font-semibold text-rose-800 underline"
          >
            Reintentar
          </button>
        </div>
      ) : filteredRecordings.length === 0 ? (
        <EmptyState
          title="No hay grabaciones disponibles"
          description={
            selectedCategory !== "Todas las grabaciones"
              ? `No encontramos grabaciones registradas en la categoría "${selectedCategory}".`
              : "Actualmente no hay grabaciones pasadas publicadas en la videoteca."
          }
          actionLabel={
            selectedCategory !== "Todas las grabaciones"
              ? "Ver todas las grabaciones"
              : undefined
          }
          onAction={
            selectedCategory !== "Todas las grabaciones"
              ? () => setSelectedCategory("Todas las grabaciones")
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-1">
          {filteredRecordings.map((recording) => (
            <RecordingCard key={recording.id} recording={recording} />
          ))}
        </div>
      )}
    </div>
  );
}
