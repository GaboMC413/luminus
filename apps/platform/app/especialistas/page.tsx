"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { DirectoryToolbar } from "@/components/ui/DirectoryToolbar";
import { UserCard } from "@/components/ui/UserCard";
import { SelectInput } from "@/components/ui/SelectInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { DirectoryGridSkeleton } from "@/components/ui/Skeleton";

type Specialist = {
  id: string;
  name: string;
  avatar: string;
  city: string;
  country: string;
  specialty: string;
};

type ApplicationStatus = {
  hasApplication: boolean;
  status: string | null;
};

export default function EspecialistasPage() {
  const router = useRouter();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [application, setApplication] = useState<ApplicationStatus | null>(null);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/especialistas", { cache: "no-store" }),
      fetch("/api/especialistas/application-status", { cache: "no-store" }),
    ])
      .then(async ([directoryResponse, statusResponse]) => {
        if (!directoryResponse.ok) throw new Error("No pudimos cargar los especialistas.");
        const directory = await directoryResponse.json();
        setSpecialists(directory.specialists || []);
        if (statusResponse.ok) setApplication(await statusResponse.json());
      })
      .catch((err) => setError(err.message || "No pudimos cargar los especialistas."))
      .finally(() => setLoading(false));
  }, []);

  const countries = useMemo(
    () => Array.from(new Set(specialists.map((item) => item.country).filter(Boolean))).sort(),
    [specialists]
  );
  const specialties = useMemo(
    () => Array.from(new Set(specialists.map((item) => item.specialty).filter(Boolean))).sort(),
    [specialists]
  );

  const visibleSpecialists = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    return specialists.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        [item.name, item.city, item.country, item.specialty].some((value) =>
          value?.toLocaleLowerCase("es").includes(normalizedQuery)
        );
      return matchesQuery && (!country || item.country === country) && (!specialty || item.specialty === specialty);
    });
  }, [specialists, query, country, specialty]);

  const activeFiltersCount = (country ? 1 : 0) + (specialty ? 1 : 0);
  const isPending = application?.status === "pending_review";

  const activeChips = useMemo(() => {
    const chips = [];
    if (country) {
      chips.push({
        id: "country",
        label: `País: ${country}`,
        onRemove: () => setCountry(""),
      });
    }
    if (specialty) {
      chips.push({
        id: "specialty",
        label: `Especialidad: ${specialty}`,
        onRemove: () => setSpecialty(""),
      });
    }
    return chips;
  }, [country, specialty]);

  if (loading) return <DirectoryGridSkeleton count={10} />;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 pb-12 pt-4 font-sans sm:px-6 md:gap-6 md:py-6">
      {/* 1. Standardized In-App Page Header */}
      <PageHeader
        title="Especialistas"
        description="Profesionales verificados para acompañarte en tu bienestar."
      />

      {/* 2. Pending Application Notice */}
      {isPending && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 flex items-center justify-between gap-3">
          <span>Tu aplicación como especialista está en revisión por el equipo LUMINUS.</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/especialistas/unirme")}
            className="text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/60"
          >
            Ver estado
          </Button>
        </section>
      )}

      {/* 3. Unified Directory Search & Filter Toolbar */}
      <DirectoryToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar por nombre, especialidad o ubicación..."
        filtersOpen={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        activeFiltersCount={activeFiltersCount}
        activeFilterChips={activeChips}
        onClearAllFilters={() => {
          setCountry("");
          setSpecialty("");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            label="País"
            value={country}
            options={[
              { label: "Todos los países", value: "" },
              ...countries.map((c) => ({ label: c, value: c })),
            ]}
            onSelect={setCountry}
          />

          <SelectInput
            label="Especialidad"
            value={specialty}
            options={[
              { label: "Todas las especialidades", value: "" },
              ...specialties.map((s) => ({ label: s, value: s })),
            ]}
            onSelect={setSpecialty}
          />
        </div>
      </DirectoryToolbar>

      {/* 4. Directory Grid or Empty/Error State */}
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
          {error}
        </div>
      ) : visibleSpecialists.length > 0 ? (
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {visibleSpecialists.map((specialist) => (
            <UserCard
              key={specialist.id}
              user={{
                id: specialist.id,
                name: specialist.name,
                avatar: specialist.avatar,
                city: specialist.city,
                country: specialist.country,
                specialty: specialist.specialty,
              }}
              profileHref={`/inicio/public-profile?id=${encodeURIComponent(specialist.id)}&from=especialistas`}
              actionLabel="Ver perfil"
            />
          ))}
        </section>
      ) : (
        <EmptyState
          title="No encontramos especialistas"
          description="Prueba con otra búsqueda o limpia los filtros para ver todos los especialistas disponibles."
          actionLabel={activeFiltersCount > 0 ? "Limpiar filtros" : undefined}
          onAction={
            activeFiltersCount > 0
              ? () => {
                  setQuery("");
                  setCountry("");
                  setSpecialty("");
                }
              : undefined
          }
        />
      )}

      {/* 5. Institutional CTA Banner for Specialists */}
      {!application?.hasApplication && (
        <section className="relative flex w-full flex-col gap-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 md:p-8">
          <div className="flex w-full flex-1 flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-jakarta">
                Comunidad de especialistas
              </span>
              <h2 className="font-jakarta text-xl sm:text-2xl font-bold leading-tight tracking-tight text-slate-900">
                Haz visible tu forma de acompañar
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-slate-600 mt-1">
                LUMINUS reúne a personas que están explorando bienestar, cambio personal, salud integral y nuevas formas de vivir con más conciencia. Tu lugar como especialista no es solo aparecer en una lista, sino ayudar a que más personas encuentren orientación clara, humana y confiable.
              </p>
            </div>

            <div className="flex items-stretch gap-3 py-1">
              <div className="w-[3px] bg-slate-900 shrink-0 rounded-full" />
              <p className="font-jakarta text-xs sm:text-sm font-medium italic text-slate-500">
                “Un espacio para mostrar quién eres, cómo trabajas y qué puedes aportar.”
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center pt-2">
              <Button
                variant="primary"
                onClick={() => router.push("/especialistas/unirme")}
                className="w-full sm:w-auto"
              >
                Aplicar como Especialista
              </Button>
              <a
                href="https://luminuslatam.com/especialistas"
                target="_blank"
                rel="noopener noreferrer"
                className="font-jakarta text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors px-2 py-1"
              >
                Conocer más sobre el programa
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
