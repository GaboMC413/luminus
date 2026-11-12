"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DirectoryToolbar, DirectoryTagPopover } from "@/components/ui/DirectoryToolbar";
import { SearchSuggestion } from "@/components/ui/SearchBar";
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
  title: string;
  areas?: string[];
};

type ApplicationStatus = {
  hasApplication: boolean;
  status: string | null;
};

export default function EspecialistasPage() {
  const router = useRouter();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [application, setApplication] = useState<ApplicationStatus | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    country: "",
    city: "",
    specialty: "",
    selectedAreas: [] as string[],
  });

  const [tempFilters, setTempFilters] = useState({
    country: "",
    city: "",
    specialty: "",
    selectedAreas: [] as string[],
  });

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

  const activeCountryForCities = showFilters ? tempFilters.country : appliedFilters.country;

  const cities = useMemo(
    () =>
      Array.from(
        new Set(
          specialists
            .filter((item) => !activeCountryForCities || item.country === activeCountryForCities)
            .map((item) => item.city)
            .filter(Boolean)
        )
      ).sort(),
    [specialists, activeCountryForCities]
  );

  const specialties = useMemo(
    () => Array.from(new Set(specialists.map((item) => item.specialty).filter(Boolean))).sort(),
    [specialists]
  );

  const activeSpecialtyForAreas = showFilters ? tempFilters.specialty : appliedFilters.specialty;

  const availableAreas = useMemo(
    () =>
      Array.from(
        new Set(
          specialists
            .filter((item) => !activeSpecialtyForAreas || item.specialty === activeSpecialtyForAreas)
            .flatMap((item) => item.areas || [])
            .filter(Boolean)
        )
      ).sort(),
    [specialists, activeSpecialtyForAreas]
  );

  // Categorized autocomplete suggestions (Name, Professional Title, Area of Accompaniment, Specialty, City, Country)
  const searchSuggestions = useMemo<SearchSuggestion[]>(() => {
    const q = searchInput.trim().toLocaleLowerCase("es");
    if (q.length < 2) return [];

    const matches: SearchSuggestion[] = [];
    const seen = new Set<string>();

    const pushMatch = (item: SearchSuggestion) => {
      const key = `${item.category}:${item.value.toLocaleLowerCase("es")}`;
      if (!seen.has(key) && matches.length < 7) {
        seen.add(key);
        matches.push(item);
      }
    };

    specialists.forEach((s) => {
      if (s.name && s.name.toLocaleLowerCase("es").includes(q)) {
        pushMatch({ label: s.name, value: s.name, category: "Especialista", icon: "user" });
      }
      if (s.title && s.title.toLocaleLowerCase("es").includes(q)) {
        pushMatch({ label: s.title, value: s.title, category: "Título", icon: "title" });
      }
      (s.areas || []).forEach((area) => {
        if (area && area.toLocaleLowerCase("es").includes(q)) {
          pushMatch({ label: area, value: area, category: "Área", icon: "area" });
        }
      });
      if (s.specialty && s.specialty.toLocaleLowerCase("es").includes(q)) {
        pushMatch({ label: s.specialty, value: s.specialty, category: "Especialidad", icon: "area" });
      }
      if (s.city && s.city.toLocaleLowerCase("es").includes(q)) {
        pushMatch({ label: s.city, value: s.city, category: "Ciudad", icon: "city" });
      }
      if (s.country && s.country.toLocaleLowerCase("es").includes(q)) {
        pushMatch({ label: s.country, value: s.country, category: "País", icon: "country" });
      }
    });

    return matches;
  }, [searchInput, specialists]);

  const visibleSpecialists = useMemo(() => {
    const normalizedQuery = appliedQuery.trim().toLocaleLowerCase("es");
    return specialists.filter((item) => {
      const searchableValues = [
        item.name,
        item.city,
        item.country,
        item.specialty,
        item.title,
        ...(item.areas || []),
      ];
      const matchesQuery =
        !normalizedQuery ||
        searchableValues.some((value) => value?.toLocaleLowerCase("es").includes(normalizedQuery));

      const matchesCountry = !appliedFilters.country || item.country === appliedFilters.country;
      const matchesCity = !appliedFilters.city || item.city === appliedFilters.city;
      const matchesSpecialty =
        !appliedFilters.specialty || item.specialty === appliedFilters.specialty;
      const matchesAreas =
        appliedFilters.selectedAreas.length === 0 ||
        appliedFilters.selectedAreas.some((area) => (item.areas || []).includes(area));

      return (
        matchesQuery &&
        matchesCountry &&
        matchesCity &&
        matchesSpecialty &&
        matchesAreas
      );
    });
  }, [specialists, appliedQuery, appliedFilters]);

  const activeFiltersCount =
    (appliedFilters.country ? 1 : 0) +
    (appliedFilters.city ? 1 : 0) +
    (appliedFilters.specialty ? 1 : 0) +
    appliedFilters.selectedAreas.length;

  const hasAnyActiveConstraint = Boolean(appliedQuery) || activeFiltersCount > 0;
  const isPending = application?.status === "pending_review";

  const handleToggleFilters = () => {
    if (!showFilters) {
      setTempFilters({ ...appliedFilters });
      setShowFilters(true);
    } else {
      setShowFilters(false);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...tempFilters });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const cleared = {
      country: "",
      city: "",
      specialty: "",
      selectedAreas: [] as string[],
    };
    setSearchInput("");
    setAppliedQuery("");
    setTempFilters(cleared);
    setAppliedFilters(cleared);
    setShowFilters(false);
  };

  const activeChips = useMemo(() => {
    const chips: Array<{ id: string; label: string; onRemove: () => void }> = [];
    if (appliedQuery) {
      chips.push({
        id: "query",
        label: `Búsqueda: "${appliedQuery}"`,
        onRemove: () => {
          setSearchInput("");
          setAppliedQuery("");
        },
      });
    }
    if (appliedFilters.country) {
      chips.push({
        id: "country",
        label: `País: ${appliedFilters.country}`,
        onRemove: () => setAppliedFilters((p) => ({ ...p, country: "", city: "" })),
      });
    }
    if (appliedFilters.city) {
      chips.push({
        id: "city",
        label: `Ciudad: ${appliedFilters.city}`,
        onRemove: () => setAppliedFilters((p) => ({ ...p, city: "" })),
      });
    }
    if (appliedFilters.specialty) {
      chips.push({
        id: "specialty",
        label: `Especialidad: ${appliedFilters.specialty}`,
        onRemove: () => setAppliedFilters((p) => ({ ...p, specialty: "" })),
      });
    }
    appliedFilters.selectedAreas.forEach((area) => {
      chips.push({
        id: `area-${area}`,
        label: area,
        onRemove: () =>
          setAppliedFilters((p) => ({
            ...p,
            selectedAreas: p.selectedAreas.filter((a) => a !== area),
          })),
      });
    });
    return chips;
  }, [appliedQuery, appliedFilters]);

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
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={(val) => setAppliedQuery(val)}
        onSearchClear={() => {
          setSearchInput("");
          setAppliedQuery("");
        }}
        searchSuggestions={searchSuggestions}
        onSelectSuggestion={(suggestion) => {
          setSearchInput(suggestion.value);
          setAppliedQuery(suggestion.value);
        }}
        searchPlaceholder="Buscar especialista"
        desktopFilters={
          <>
            <div className="w-[155px] lg:w-[175px]">
              <SelectInput
                value={appliedFilters.country}
                placeholder="Todos los países"
                options={[
                  { label: "Todos los países", value: "" },
                  ...countries.map((c) => ({ label: c, value: c })),
                ]}
                onSelect={(val) =>
                  setAppliedFilters((prev) => ({ ...prev, country: val, city: "" }))
                }
              />
            </div>

            <div className="w-[155px] lg:w-[175px]">
              <SelectInput
                value={appliedFilters.city}
                placeholder="Todas las ciudades"
                options={[
                  { label: "Todas las ciudades", value: "" },
                  ...cities.map((c) => ({ label: c, value: c })),
                ]}
                onSelect={(val) =>
                  setAppliedFilters((prev) => ({ ...prev, city: val }))
                }
              />
            </div>

            <div className="w-[180px] lg:w-[205px]">
              <SelectInput
                value={appliedFilters.specialty}
                placeholder="Todas las especialidades"
                options={[
                  { label: "Todas las especialidades", value: "" },
                  ...specialties.map((s) => ({ label: s, value: s })),
                ]}
                onSelect={(val) =>
                  setAppliedFilters((prev) => ({ ...prev, specialty: val }))
                }
              />
            </div>

            {availableAreas.length > 0 && (
              <DirectoryTagPopover
                label="Áreas"
                options={availableAreas}
                selectedValues={appliedFilters.selectedAreas}
                onChange={(nextSelected) =>
                  setAppliedFilters((prev) => ({ ...prev, selectedAreas: nextSelected }))
                }
                searchPlaceholder="Buscar área de acompañamiento..."
                emptyText="No hay áreas disponibles."
              />
            )}
          </>
        }
        filtersOpen={showFilters}
        onToggleFilters={handleToggleFilters}
        activeFiltersCount={activeFiltersCount}
        activeFilterChips={activeChips}
        onClearAllFilters={handleClearFilters}
        filterActions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleApplyFilters}
            >
              Aplicar filtros
            </Button>
          </div>
        }
      >
        {/* Mobile Bottom Sheet Content */}
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              label="País"
              value={tempFilters.country}
              placeholder="Todos los países"
              options={[
                { label: "Todos los países", value: "" },
                ...countries.map((c) => ({ label: c, value: c })),
              ]}
              onSelect={(val) => setTempFilters({ ...tempFilters, country: val, city: "" })}
            />

            <SelectInput
              label="Ciudad"
              value={tempFilters.city}
              placeholder="Todas las ciudades"
              options={[
                { label: "Todas las ciudades", value: "" },
                ...cities.map((c) => ({ label: c, value: c })),
              ]}
              onSelect={(val) => setTempFilters({ ...tempFilters, city: val })}
            />
          </div>

          <SelectInput
            label="Especialidad"
            value={tempFilters.specialty}
            placeholder="Todas las especialidades"
            options={[
              { label: "Todas las especialidades", value: "" },
              ...specialties.map((s) => ({ label: s, value: s })),
            ]}
            onSelect={(val) => setTempFilters({ ...tempFilters, specialty: val })}
          />

          {availableAreas.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 font-jakarta flex items-center">
                  <span>Áreas de acompañamiento</span>
                  {tempFilters.selectedAreas.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {tempFilters.selectedAreas.length} seleccionada
                      {tempFilters.selectedAreas.length > 1 ? "s" : ""}
                    </span>
                  )}
                </label>

                {tempFilters.selectedAreas.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTempFilters({ ...tempFilters, selectedAreas: [] })}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 border-none bg-transparent cursor-pointer p-0 font-jakarta transition-colors"
                  >
                    Desmarcar todas
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto pr-1.5 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                {availableAreas.map((area) => {
                  const isChecked = tempFilters.selectedAreas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => {
                        const nextSelected = isChecked
                          ? tempFilters.selectedAreas.filter((a) => a !== area)
                          : [...tempFilters.selectedAreas, area];
                        setTempFilters({ ...tempFilters, selectedAreas: nextSelected });
                      }}
                      className={`h-8 px-3.5 rounded-full text-xs font-medium font-jakarta transition-all border cursor-pointer select-none flex items-center gap-1.5 shrink-0 ${
                        isChecked
                          ? "bg-slate-900 text-white border-slate-900 shadow-none font-semibold"
                          : "bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900"
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                      <span>{area}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
                title: specialist.title,
              }}
              title={specialist.title}
              specialty={specialist.specialty}
              profileHref={`/inicio/public-profile?id=${encodeURIComponent(specialist.id)}&from=especialistas`}
              actionLabel="Ver perfil"
            />
          ))}
        </section>
      ) : (
        <EmptyState
          title="No encontramos especialistas"
          description="Prueba con otra búsqueda o limpia los filtros para ver todos los especialistas disponibles."
          actionLabel={hasAnyActiveConstraint ? "Limpiar filtros" : undefined}
          onAction={hasAnyActiveConstraint ? handleClearFilters : undefined}
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
