"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { Check } from "lucide-react";
import { UserCard } from "@/components/ui/UserCard";
import { Button } from "@/components/ui/Button";
import { SelectInput } from "@/components/ui/SelectInput";
import { PageHeader } from "@/components/ui/PageHeader";
import { DirectoryToolbar } from "@/components/ui/DirectoryToolbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { DirectoryGridSkeleton } from "@/components/ui/Skeleton";

export default function MiembrosPage() {
  return (
    <Suspense fallback={<DirectoryGridSkeleton count={10} />}>
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
  });

  const [fetchingMore, setFetchingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const countriesWithResults = filterOptions.countries;
  const availableCities = filterOptions.cities;
  const interestsWithResults = filterOptions.interests;

  const hasActiveFilters =
    Boolean(appliedFilters.country) ||
    Boolean(appliedFilters.city) ||
    appliedFilters.selectedInterests.length > 0;

  const hasSelectedTempFilters =
    Boolean(tempFilters.country) ||
    Boolean(tempFilters.city) ||
    tempFilters.selectedInterests.length > 0;

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
      selectedInterests: [],
    };
    setTempFilters(cleared);
    setAppliedFilters(cleared);
    setShowFilters(false);
  };

  // Load available filter options from the API
  useEffect(() => {
    async function loadFilters() {
      try {
        const countryParam = tempFilters.country || "";
        const res = await fetch(`/api/comunidad/filters?country=${encodeURIComponent(countryParam)}`);
        if (res.ok) {
          const data = await res.json();
          setFilterOptions(data);
        }
      } catch (err) {
        console.error("[MiembrosPage] Error loading filter options:", err);
      }
    }
    loadFilters();
  }, [tempFilters.country]);

  // Fetch users with filters
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

  // Debounced search sync
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearchQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers(null);
  }, [appliedSearchQuery, appliedFilters]);

  // Build active chips
  const activeChips = useMemo(() => {
    const chips: Array<{ id: string; label: string; onRemove: () => void }> = [];
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
  }, [appliedFilters]);

  const activeFiltersCount =
    (appliedFilters.country ? 1 : 0) +
    (appliedFilters.city ? 1 : 0) +
    appliedFilters.selectedInterests.length;

  if (loading && users.length === 0) {
    return <DirectoryGridSkeleton count={10} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 pb-12 pt-4 font-sans sm:px-6 md:gap-6 md:py-6">
      {/* 1. Standardized In-App Header with Back Navigation */}
      <PageHeader
        title="Miembros"
        description="Personas que forman parte de la comunidad LUMINUS."
        backHref="/inicio"
      />

      {/* 2. Unified Directory Toolbar */}
      <DirectoryToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre, ubicación o interés..."
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
              disabled={!hasSelectedTempFilters}
            >
              Aplicar filtros
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Location Selectors */}
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectInput
              label="País"
              value={tempFilters.country}
              options={[
                { label: "Todos los países", value: "" },
                ...countriesWithResults.map((c) => ({ label: c, value: c })),
              ]}
              onSelect={(val) => setTempFilters({ ...tempFilters, country: val, city: "" })}
            />

            <SelectInput
              label="Ciudad"
              value={tempFilters.city}
              options={[
                { label: "Todas las ciudades", value: "" },
                ...availableCities.map((c) => ({ label: c, value: c })),
              ]}
              onSelect={(val) => setTempFilters({ ...tempFilters, city: val })}
            />
          </div>

          {/* Interest Chips */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 font-jakarta">
                Temas de interés
                {tempFilters.selectedInterests.length > 0 && (
                  <span className="ml-1.5 font-normal text-slate-400">
                    ({tempFilters.selectedInterests.length} seleccionado
                    {tempFilters.selectedInterests.length > 1 ? "s" : ""})
                  </span>
                )}
              </label>

              {tempFilters.selectedInterests.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTempFilters({ ...tempFilters, selectedInterests: [] })}
                  className="text-xs text-slate-400 hover:text-slate-800 underline border-none bg-transparent cursor-pointer p-0 font-jakarta transition-colors"
                >
                  Desmarcar todos
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto pr-1">
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
                      className={`h-7 px-3 rounded-full text-xs font-medium font-jakarta transition-all border cursor-pointer select-none flex items-center gap-1.5 shrink-0 ${
                        isChecked
                          ? "bg-slate-900 text-white border-slate-900 shadow-none"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900"
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
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
      {error ? (
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
