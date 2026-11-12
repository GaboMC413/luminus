"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { UserCard } from "@/components/ui/UserCard";
import { Button } from "@/components/ui/Button";
import { SelectInput } from "@/components/ui/SelectInput";
import { PageHeader } from "@/components/ui/PageHeader";
import { DirectoryToolbar, DirectoryTagPopover } from "@/components/ui/DirectoryToolbar";
import { SearchSuggestion } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { DirectoryGridSkeleton, UserCardSkeleton } from "@/components/ui/Skeleton";

export default function MiembrosPage() {
  return (
    <Suspense fallback={<DirectoryGridSkeleton count={10} showBack />}>
      <MiembrosContent />
    </Suspense>
  );
}

function MiembrosContent() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    country: "",
    city: "",
    selectedInterests: [] as string[],
  });
  const [tempFilters, setTempFilters] = useState({
    country: "",
    city: "",
    selectedInterests: [] as string[],
  });

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    countries: [] as string[],
    cities: [] as string[],
    interests: [] as string[],
    names: [] as string[],
  });

  const [fetchingMore, setFetchingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const countriesWithResults = filterOptions.countries;
  const availableCities = filterOptions.cities;
  const interestsWithResults = filterOptions.interests;

  const hasActiveFilters =
    Boolean(appliedSearchQuery) ||
    Boolean(appliedFilters.country) ||
    Boolean(appliedFilters.city) ||
    appliedFilters.selectedInterests.length > 0;

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
      selectedInterests: [] as string[],
    };
    setSearchQuery("");
    setAppliedSearchQuery("");
    setTempFilters(cleared);
    setAppliedFilters(cleared);
    setShowFilters(false);
  };

  const activeCountryForCities = showFilters ? tempFilters.country : appliedFilters.country;

  // Load available filter options from the API
  useEffect(() => {
    async function loadFilters() {
      try {
        const countryParam = activeCountryForCities || "";
        const res = await fetch(
          `/api/comunidad/filters?country=${encodeURIComponent(countryParam)}`
        );
        if (res.ok) {
          const data = await res.json();
          setFilterOptions({
            countries: data.countries || [],
            cities: data.cities || [],
            interests: data.interests || [],
            names: data.names || [],
          });
        }
      } catch (err) {
        console.error("[MiembrosPage] Error loading filter options:", err);
      }
    }
    loadFilters();
  }, [activeCountryForCities]);

  // Categorized autocomplete suggestions based on available data (Names, Cities, Countries, Interests)
  const searchSuggestions = useMemo<SearchSuggestion[]>(() => {
    const q = searchQuery.trim().toLocaleLowerCase("es");
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

    const allNames = Array.from(
      new Set([...filterOptions.names, ...users.map((u) => u.name).filter(Boolean)])
    );

    allNames.forEach((name) => {
      if (name.toLocaleLowerCase("es").includes(q)) {
        pushMatch({ label: name, value: name, category: "Miembro", icon: "user" });
      }
    });

    availableCities.forEach((city) => {
      if (city.toLocaleLowerCase("es").includes(q)) {
        pushMatch({ label: city, value: city, category: "Ciudad", icon: "city" });
      }
    });

    countriesWithResults.forEach((country) => {
      if (country.toLocaleLowerCase("es").includes(q)) {
        pushMatch({ label: country, value: country, category: "País", icon: "country" });
      }
    });

    interestsWithResults.forEach((interest) => {
      if (interest.toLocaleLowerCase("es").includes(q)) {
        pushMatch({ label: interest, value: interest, category: "Interés", icon: "interest" });
      }
    });

    return matches;
  }, [searchQuery, filterOptions.names, users, availableCities, countriesWithResults, interestsWithResults]);

  // Fetch users only when appliedSearchQuery or appliedFilters change (never mid-keystroke)
  async function fetchUsers(cursorVal?: string | null) {
    try {
      if (!cursorVal) {
        setLoading(true);
      } else {
        setFetchingMore(true);
      }
      setError(null);

      const params = new URLSearchParams();
      params.set("limit", "24");
      if (cursorVal) params.set("cursor", cursorVal);
      if (appliedSearchQuery) params.set("query", appliedSearchQuery);
      if (appliedFilters.country) params.set("country", appliedFilters.country);
      if (appliedFilters.city) params.set("city", appliedFilters.city);
      if (appliedFilters.selectedInterests.length > 0) {
        params.set("interests", appliedFilters.selectedInterests.join(","));
      }
      params.set("_t", Date.now().toString());

      const res = await fetch(`/api/comunidad?${params.toString()}`, { cache: "no-store" });
      if (res.status === 401 || res.status === 403) {
        router.replace("/auth/iniciar-sesion");
        return;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Error del servidor: ${res.status}`);
      }
      const data = await res.json();

      if (!cursorVal) {
        setUsers(data.users || []);
      } else {
        setUsers((current) => [...current, ...(data.users || [])]);
      }
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err: any) {
      console.error("[MiembrosPage] Error fetching members:", err);
      setError(err.message || "Error de conexión con el servidor");
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  }

  useEffect(() => {
    fetchUsers(null);
  }, [appliedSearchQuery, appliedFilters]);

  // Build active chips
  const activeChips = useMemo(() => {
    const chips: Array<{ id: string; label: string; onRemove: () => void }> = [];
    if (appliedSearchQuery) {
      chips.push({
        id: "search-query",
        label: `Búsqueda: "${appliedSearchQuery}"`,
        onRemove: () => {
          setSearchQuery("");
          setAppliedSearchQuery("");
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
        label: `Ciudad: ${appliedFilters.city.split(",")[0]}`,
        onRemove: () => setAppliedFilters((p) => ({ ...p, city: "" })),
      });
    }
    appliedFilters.selectedInterests.forEach((interest) => {
      chips.push({
        id: `interest-${interest}`,
        label: interest,
        onRemove: () =>
          setAppliedFilters((p) => ({
            ...p,
            selectedInterests: p.selectedInterests.filter((i) => i !== interest),
          })),
      });
    });
    return chips;
  }, [appliedSearchQuery, appliedFilters]);

  const activeFiltersCount =
    (appliedFilters.country ? 1 : 0) +
    (appliedFilters.city ? 1 : 0) +
    appliedFilters.selectedInterests.length;

  if (loading && users.length === 0 && !hasActiveFilters) {
    return <DirectoryGridSkeleton count={10} showBack />;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 pb-12 pt-4 font-sans sm:px-6 md:gap-6 md:py-6">
      {/* 1. Standardized In-App Header with Back Navigation */}
      <PageHeader
        title="Miembros"
        description="Personas que forman parte de la comunidad LUMINUS."
        backHref="/inicio"
      />

      {/* 2. Unified Directory Toolbar (Inline Desktop Controls + Mobile Bottom Sheet) */}
      <DirectoryToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={(val) => setAppliedSearchQuery(val)}
        onSearchClear={() => {
          setSearchQuery("");
          setAppliedSearchQuery("");
        }}
        searchSuggestions={searchSuggestions}
        onSelectSuggestion={(suggestion) => {
          setSearchQuery(suggestion.value);
          setAppliedSearchQuery(suggestion.value);
        }}
        searchPlaceholder="Buscar en la comunidad"
        desktopFilters={
          <>
            <div className="w-[165px] lg:w-[185px]">
              <SelectInput
                value={appliedFilters.country}
                placeholder="Todos los países"
                options={[
                  { label: "Todos los países", value: "" },
                  ...countriesWithResults.map((c) => ({ label: c, value: c })),
                ]}
                onSelect={(val) =>
                  setAppliedFilters((prev) => ({ ...prev, country: val, city: "" }))
                }
              />
            </div>

            <div className="w-[165px] lg:w-[185px]">
              <SelectInput
                value={appliedFilters.city}
                placeholder="Todas las ciudades"
                options={[
                  { label: "Todas las ciudades", value: "" },
                  ...availableCities.map((c) => ({ label: c, value: c })),
                ]}
                onSelect={(val) =>
                  setAppliedFilters((prev) => ({ ...prev, city: val }))
                }
              />
            </div>

            <DirectoryTagPopover
              label="Temas de interés"
              options={interestsWithResults}
              selectedValues={appliedFilters.selectedInterests}
              onChange={(nextSelected) =>
                setAppliedFilters((prev) => ({ ...prev, selectedInterests: nextSelected }))
              }
              searchPlaceholder="Buscar tema de interés..."
              emptyText="No hay temas de interés disponibles."
            />
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
                ...countriesWithResults.map((c) => ({ label: c, value: c })),
              ]}
              onSelect={(val) => setTempFilters({ ...tempFilters, country: val, city: "" })}
            />

            <SelectInput
              label="Ciudad"
              value={tempFilters.city}
              placeholder="Todas las ciudades"
              options={[
                { label: "Todas las ciudades", value: "" },
                ...availableCities.map((c) => ({ label: c, value: c })),
              ]}
              onSelect={(val) => setTempFilters({ ...tempFilters, city: val })}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 font-jakarta flex items-center">
                <span>Temas de interés</span>
                {tempFilters.selectedInterests.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                    {tempFilters.selectedInterests.length} seleccionado
                    {tempFilters.selectedInterests.length > 1 ? "s" : ""}
                  </span>
                )}
              </label>

              {tempFilters.selectedInterests.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTempFilters({ ...tempFilters, selectedInterests: [] })}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 border-none bg-transparent cursor-pointer p-0 font-jakarta transition-colors"
                >
                  Desmarcar todos
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto pr-1.5 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
              {interestsWithResults.length === 0 ? (
                <p className="text-xs text-slate-400 py-2 w-full text-center font-sans">
                  No hay temas de interés disponibles.
                </p>
              ) : (
                interestsWithResults.map((interest) => {
                  const isChecked = tempFilters.selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => {
                        const nextSelected = isChecked
                          ? tempFilters.selectedInterests.filter((i) => i !== interest)
                          : [...tempFilters.selectedInterests, interest];
                        setTempFilters({ ...tempFilters, selectedInterests: nextSelected });
                      }}
                      className={`h-8 px-3.5 rounded-full text-xs font-medium font-jakarta transition-all border cursor-pointer select-none flex items-center gap-1.5 shrink-0 ${
                        isChecked
                          ? "bg-slate-900 text-white border-slate-900 shadow-none font-semibold"
                          : "bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900"
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                      <span>{interest}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </DirectoryToolbar>

      {/* 3. Members Grid or States */}
      {loading && users.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 w-full">
          {[...Array(10)].map((_, i) => (
            <UserCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
          <p className="font-semibold mb-1">Ocurrió un problema de conexión</p>
          <p className="text-xs text-rose-600 mb-3">{error}</p>
          <Button variant="soft" size="sm" onClick={() => fetchUsers(null)}>
            Reintentar
          </Button>
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title="No encontramos miembros"
          description="Prueba con otros términos de búsqueda o limpia los filtros para ver todos los miembros."
          actionLabel={hasActiveFilters ? "Limpiar filtros" : undefined}
          onAction={hasActiveFilters ? handleClearFilters : undefined}
        />
      ) : (
        <div className="flex flex-col gap-6 w-full pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 w-full">
            {users.map((user: any) => (
              <UserCard
                key={user.id}
                user={user}
                actionLabel="Ver perfil"
                profileHref={`/inicio/public-profile?id=${encodeURIComponent(user.id)}&from=miembros`}
              />
            ))}
          </div>

          {hasMore && (
            <div className="w-full flex justify-center py-4">
              <Button
                onClick={() => fetchUsers(nextCursor)}
                disabled={fetchingMore}
                variant="secondary"
                size="md"
                className="px-6"
              >
                {fetchingMore ? "Cargando..." : "Cargar más miembros"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
