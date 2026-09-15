"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { UserCard } from "@/components/ui/UserCard";
import { Button } from "@/components/ui/Button";
import { SelectInput } from "@/components/ui/SelectInput";
import { PageLoader } from "@/components/ui/PageLoader";

export default function MiembrosPage() {
  return (
    <Suspense fallback={<PageLoader className="h-screen" />}>
      <MiembrosContent />
    </Suspense>
  );
}

function MiembrosContent() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    countries: [] as string[],
    cities: [] as string[],
    interests: [] as string[],
  });
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const router = useRouter();

  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (
        target.closest('[data-mobile-filters="true"]') ||
        target.closest('[data-select-portal="true"]')
      ) {
        return;
      }

      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(target) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(target)
      ) {
        setShowFilters(false);
      }
    }
    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  const countriesWithResults = filterOptions.countries;
  const citiesWithResults = filterOptions.cities;
  const interestsWithResults = filterOptions.interests;
  const availableCities = filterOptions.cities;

  const hasActiveFilters = 
    appliedFilters.country !== "" ||
    appliedFilters.city !== "" ||
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
      selectedInterests: [],
    };
    setTempFilters(cleared);
    setAppliedFilters(cleared);
    setShowFilters(false);
  };

  const isSearching = searchQuery.length > 0;

  useEffect(() => {
    async function loadFilters() {
      try {
        const countryParam = tempFilters.country || "";
        const res = await fetch(`/api/comunidad/filters?country=${countryParam}`);
        if (res.ok) {
          const data = await res.json();
          setFilterOptions(data);
        }
      } catch (err) {
        console.error("Error loading filters:", err);
      }
    }
    loadFilters();
  }, [tempFilters.country]);

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
      console.error("Error al cargar usuarios de la comunidad:", err);
      setError(err.message || "Error de conexión con el servidor");
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearchQuery(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers(null);
  }, [appliedSearchQuery, appliedFilters]);

  useEffect(() => {
    if (searchQuery.length < 2 || searchQuery === selectedSuggestion) {
      setSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const matches: any[] = [];

    countriesWithResults.forEach(country => {
      if (country.toLowerCase().includes(query)) matches.push({ type: 'País', value: country });
    });

    citiesWithResults.forEach(city => {
      if (city.toLowerCase().includes(query)) matches.push({ type: 'Ciudad', value: city });
    });

    interestsWithResults.forEach(interest => {
      if (interest.toLowerCase().includes(query)) matches.push({ type: 'Interés', value: interest });
    });

    setSuggestions(matches.slice(0, 5));
  }, [searchQuery, countriesWithResults, citiesWithResults, interestsWithResults]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (isSearching) return;

    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      if (showSearch) setShowSearch(false);
    } else {
      if (!showSearch) setShowSearch(true);
    }

    setLastScrollY(currentScrollY);
  };

  const filteredUsers = users;

  if (users.length === 0 && loading) {
    return <PageLoader className="h-screen" />;
  }

  if (error) {
    return (
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-none flex flex-col items-center text-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
            <span className="material-symbols-outlined text-[28px]">wifi_off</span>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-[20px] font-bold text-slate-900 font-jakarta">
              Ocurrió un problema de conexión
            </h2>
            <p className="text-[14px] text-slate-500 max-w-md font-sans">
              No pudimos cargar la información en este momento. Por favor, intenta de nuevo en unos minutos.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="h-11 px-6 bg-black text-white rounded-xl text-[14px] font-bold hover:bg-zinc-800 transition duration-200 cursor-pointer font-jakarta"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const renderFilterFields = (isMobile: boolean) => {
    return (
      <>
        {/* Country & City Dropdowns */}
        <div className="flex flex-col gap-3">
          <SelectInput
            label="País"
            value={tempFilters.country}
            options={[{ label: "Cualquier país", value: "" }, ...countriesWithResults.map(country => ({ label: country, value: country }))] }
            onSelect={(val) => setTempFilters({ ...tempFilters, country: val, city: "" })}
            placeholder="Cualquier país"
            preventScrollOnOpen={isMobile}
          />

          <SelectInput
            label="Ciudad"
            value={tempFilters.city}
            options={[{ label: "Cualquier ciudad", value: "" }, ...availableCities.map(city => ({ label: city, value: city }))] }
            onSelect={(val) => setTempFilters({ ...tempFilters, city: val })}
            placeholder="Cualquier ciudad"
            preventScrollOnOpen={isMobile}
          />
        </div>

        {/* Dynamic Interest Pills */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-label ml-1">
              Tema de interés
              {tempFilters.selectedInterests.length > 0 && (
                <span className="ml-1.5 text-[11px] font-normal text-slate-400 normal-case">
                  ({tempFilters.selectedInterests.length} seleccionado{tempFilters.selectedInterests.length > 1 ? "s" : ""})
                </span>
              )}
            </label>
            {tempFilters.selectedInterests.length > 0 && (
              <button
                type="button"
                onClick={() => setTempFilters({ ...tempFilters, selectedInterests: [] })}
                className="text-[11px] text-slate-400 hover:text-slate-800 underline border-none bg-transparent cursor-pointer p-0 font-jakarta transition-colors"
              >
                Desmarcar todos
              </button>
            )}
          </div>

          {/* Interactive Pills with visible internal scrollbar */}
          <div className="flex flex-wrap gap-1.5 max-h-[155px] overflow-y-auto visible-scrollbar pr-2 p-0.5">
            {interestsWithResults.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 w-full text-center font-sans">
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
                    {isChecked && (
                      <span className="material-symbols-rounded text-[13px]">check</span>
                    )}
                    <span>{interest}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </>
    );
  };

  const renderActionsFooter = () => {
    return (
      <>
        <button
          type="button"
          onClick={handleClearFilters}
          className="text-xs font-semibold text-slate-400 hover:text-slate-900 transition-colors cursor-pointer border-none bg-transparent font-jakarta"
        >
          Limpiar
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters(false)}
            className="h-9 px-4 bg-white hover:bg-slate-50 text-slate-950 font-medium text-xs rounded-xl border border-zinc-200 transition-colors cursor-pointer font-jakarta"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApplyFilters}
            className="h-9 px-4 bg-black hover:bg-zinc-900 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer border-none font-jakarta"
          >
            Aplicar
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 min-h-[calc(100vh-64px)] overflow-visible">
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 pt-4 pb-12 md:py-6 flex flex-col min-h-0 overflow-visible">

        {/* Header: Back Arrow + Title */}
        <div className="flex items-center gap-3 mb-4 md:mb-6 shrink-0">
          <button
            onClick={() => typeof window !== "undefined" && window.history.length > 1 ? router.back() : router.push("/comunidad")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-slate-900 cursor-pointer"
            title="Volver"
          >
            <span className="material-symbols-rounded text-[20px]">arrow_back</span>
          </button>
          <h1 className="text-xl md:text-2xl text-slate-900 font-semibold font-jakarta">Miembros</h1>
        </div>

        {/* Search & Filter Section (Sticky below 64px navbar) */}
        <div className="flex flex-col sticky top-[64px] z-30 bg-slate-50 pb-4 gap-3 w-full">
          <div className="flex items-center gap-3 w-full relative">
            {/* Search Bar */}
            <div className="flex-1 min-w-0 h-11 md:h-12 px-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3 focus-within:border-black transition-colors relative">
              <span className="material-symbols-rounded text-[20px] text-slate-400">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (val !== selectedSuggestion) {
                      setSelectedSuggestion(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setAppliedSearchQuery(searchQuery);
                      setSuggestions([]);
                    }
                  }}
                  placeholder="Buscar por ciudad, país o temas de interés"
                  className="flex-1 min-w-0 bg-transparent border-none text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setAppliedSearchQuery("");
                      setSelectedSuggestion(null);
                      setSuggestions([]);
                    }}
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors border-none bg-transparent cursor-pointer text-slate-400 hover:text-slate-700 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="absolute top-[52px] left-0 w-full bg-white border border-zinc-200 rounded-2xl z-50 overflow-hidden flex flex-col shadow-none">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(suggestion.value);
                          setSelectedSuggestion(suggestion.value);
                          setAppliedSearchQuery(suggestion.value);
                          setSuggestions([]);
                        }}
                        className="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-slate-50 border-b border-slate-100 last:border-none transition-colors border-none bg-transparent cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px] text-slate-400">
                          {suggestion.type === 'Ciudad' ? 'location_on' : suggestion.type === 'País' ? 'public' : 'favorite'}
                        </span>
                        <div className="flex-1 flex flex-col overflow-hidden">
                          <span className="text-sm font-medium text-slate-900 truncate">{suggestion.value}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold truncate">{suggestion.type}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Filter Button */}
              <button
                ref={filterButtonRef as any}
                onClick={handleToggleFilters}
                className={`hidden md:flex h-12 px-5 items-center justify-center gap-2 rounded-xl transition-all cursor-pointer shadow-none text-sm font-semibold font-jakarta shrink-0 ${
                  showFilters || hasActiveFilters
                    ? "bg-black border border-black text-white hover:bg-zinc-900"
                    : "bg-white border border-zinc-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">manage_search</span>
                <span>Buscar por filtros</span>
              </button>

              {/* Mobile Filter Button */}
              <button
                onClick={handleToggleFilters}
                className={`flex md:hidden h-12 w-12 items-center justify-center p-0 shrink-0 rounded-xl transition-all cursor-pointer shadow-none ${
                  showFilters || hasActiveFilters
                    ? "bg-black border border-black text-white hover:bg-zinc-900"
                    : "bg-white border border-zinc-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">manage_search</span>
              </button>

              {/* Desktop Filter Dropdown (clean border, auto-height with max-height to ensure actions footer is always visible) */}
              {showFilters && (
                <div 
                  ref={desktopDropdownRef}
                  className="hidden md:flex absolute top-[56px] right-0 w-[410px] max-h-[calc(100vh-140px)] bg-white rounded-2xl border border-zinc-200 shadow-none z-50 flex flex-col overflow-hidden animate-in slide-in-from-top-2 duration-150"
                >
                  <div className="p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                    {renderFilterFields(false)}
                  </div>
                  <div className="px-5 py-3 bg-slate-50 border-t border-zinc-100 flex items-center justify-between gap-3 shrink-0">
                    {renderActionsFooter()}
                  </div>
                </div>
              )}

              {/* Mobile Fullscreen Filter Modal */}
              {showFilters && mounted && createPortal(
                <div
                  data-mobile-filters="true"
                  className="md:hidden fixed inset-0 bg-white z-[9999] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
                    <span className="text-base font-bold text-slate-900 font-jakarta">Buscar por filtros</span>
                    <button 
                      type="button" 
                      onClick={() => setShowFilters(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-black border-none cursor-pointer"
                    >
                      <span className="material-symbols-rounded text-[20px]">close</span>
                    </button>
                  </div>

                  <div className="p-5 flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar">
                    {renderFilterFields(true)}
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-zinc-100 flex items-center justify-between gap-3 shrink-0">
                    {renderActionsFooter()}
                  </div>
                </div>,
                document.body
              )}
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-1.5 items-center pt-1 animate-in fade-in duration-150">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filtros activos:</span>

                {appliedFilters.country && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700">
                    <span>País: {appliedFilters.country}</span>
                    <button 
                      onClick={() => setAppliedFilters({ ...appliedFilters, country: "", city: "" })}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-black border-none bg-transparent cursor-pointer ml-0.5"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {appliedFilters.city && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700">
                    <span>Ciudad: {appliedFilters.city.split(',')[0]}</span>
                    <button 
                      onClick={() => setAppliedFilters({ ...appliedFilters, city: "" })}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-black border-none bg-transparent cursor-pointer ml-0.5"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {appliedFilters.selectedInterests.map(interest => (
                  <div key={interest} className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700">
                    <span>{interest}</span>
                    <button 
                      onClick={() => setAppliedFilters({ 
                        ...appliedFilters, 
                        selectedInterests: appliedFilters.selectedInterests.filter(i => i !== interest) 
                      })}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-black border-none bg-transparent cursor-pointer ml-0.5"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors ml-1 cursor-pointer border-none bg-transparent underline"
                >
                  Limpiar todo
                </button>
              </div>
            )}
          </div>

          {/* Members Grid */}
          <div onScroll={handleScroll} className="flex-1 w-full overflow-y-auto custom-scrollbar pb-12">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 w-full">
                {[...Array(8)].map((_, idx) => (
                  <div key={idx} className="h-[300px] bg-white rounded-2xl border border-zinc-200 p-5 animate-pulse shadow-none" />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
                <span className="material-symbols-outlined text-[48px] text-slate-300 mb-2">person_search</span>
                <h3 className="text-base font-semibold text-slate-800 mb-1 font-jakarta">No se encontraron resultados</h3>
                <p className="text-slate-400 text-sm font-sans">Prueba con otros términos de búsqueda o selecciona otra categoría.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 w-full pb-8">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 w-full">
                  {filteredUsers.map((user: any, idx: number) => (
                    <UserCard key={idx} user={user} />
                  ))}
                </div>
                {hasMore && (
                  <div className="w-full flex justify-center py-4">
                    <Button
                      onClick={() => fetchUsers(nextCursor)}
                      disabled={fetchingMore}
                      variant="outline"
                      className="px-6 h-11 font-bold text-sm"
                    >
                      {fetchingMore ? "Cargando..." : "Cargar más miembros"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
