"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { InterestPill } from "@/components/ui/InterestPill";
import { UserCard } from "@/components/ui/UserCard";
import { Button, ProfileButton } from "@/components/ui/Button";
import { SelectInput } from "@/components/ui/SelectInput";

const CATEGORIES_MAPPING = {
  "Crecimiento Personal": ["Autocuidado", "Motivación", "Calma interior", "Propósito de vida", "Organización personal", "Toma de decisiones", "Rutinas saludables", "Hábitos conscientes", "Confianza personal", "Autoestima", "Acompañamiento personal", "Crecimiento Personal", "Autoconocimiento", "Aprendizaje continuo"],
  "Bienestar Emocional": ["Gestión emocional", "Relaciones saludables", "Calma interior", "Bienestar emocional", "Equilibrio emocional", "Acompañamiento personal", "Comunicación consciente", "Autoestima"],
  "Salud y Medicina": ["Salud integral", "Suplementación", "Salud hormonal", "Salud cardiovascular", "Prevención", "Longevidad", "Salud digestiva", "Bienestar físico", "Dolor crónico", "Manejo del dolor", "Recuperación", "Alergias", "Inmunidad", "Peso saludable", "Salud metabólica", "Salud sexual", "Fertilidad", "Embarazo"],
  "Movimiento Físico": ["Yoga y Pilates", "Atención plena", "Meditación", "Postura y movilidad", "Fuerza", "Entrenamiento funcional", "Cuidado del cuerpo", "Masa muscular", "Resistencia", "Movimiento consciente", "Cardio"],
  "Nutrición": ["Nutrición diaria", "Alimentación consciente", "Alimentación saludable", "Cocina práctica", "Suplementación", "Hidratación", "Salud digestiva", "Alimentación vegetal", "Vitaminas"],
  "Estilo de Vida": ["Autocuidado", "Sustentabilidad", "Experiencias conscientes", "Naturaleza", "Calidad de vida", "Rutinas saludables", "Organización personal", "Sueño reparador", "Descanso", "Balance vida personal"],
  "Espiritualidad": ["Atención plena", "Meditación", "Conexión interior", "Espiritualidad", "Experiencias conscientes", "Naturaleza"]
};

export default function PlatformPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    }>
      <PlatformContent />
    </Suspense>
  );
}

function PlatformContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    country: "",
    city: "",
    category: "Todas las categorías",
    selectedInterests: [] as string[],
  });
  const [tempFilters, setTempFilters] = useState({
    country: "",
    city: "",
    category: "Todas las categorías",
    selectedInterests: [] as string[],
  });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showNetworkDrawer, setShowNetworkDrawer] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [profileImgError, setProfileImgError] = useState(false);
  const router = useRouter();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;

      // If clicking inside a SelectInput portal dropdown, don't close the filter popup
      if (target.closest('[data-select-portal="true"]')) {
        return;
      }

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
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

  // Dynamically compile countries and cities from existing community users in database
  const { countriesWithResults, citiesWithResults } = useMemo(() => {
    const countriesSet = new Set<string>();
    const citiesSet = new Set<string>();

    users.forEach(user => {
      if (!user.location || user.location === "Ubicación no definida") return;
      const parts = user.location.split(',').map((p: string) => p.trim());
      if (parts.length >= 2) {
        citiesSet.add(parts[0]);
        countriesSet.add(parts[parts.length - 1]);
      } else if (parts.length === 1 && parts[0]) {
        citiesSet.add(parts[0]);
      }
    });

    return {
      countriesWithResults: Array.from(countriesSet).sort(),
      citiesWithResults: Array.from(citiesSet).sort(),
    };
  }, [users]);

  // Dynamically filter cities list based on selected country
  const availableCities = useMemo(() => {
    if (!tempFilters.country) {
      return citiesWithResults;
    }
    const filteredCities = new Set<string>();
    users.forEach(user => {
      if (!user.location || user.location === "Ubicación no definida") return;
      const parts = user.location.split(',').map((p: string) => p.trim());
      if (parts.length >= 2 && parts[parts.length - 1].toLowerCase() === tempFilters.country.toLowerCase()) {
        filteredCities.add(parts[0]);
      }
    });
    return Array.from(filteredCities).sort();
  }, [tempFilters.country, citiesWithResults, users]);

  // Dynamically compile categories and interests with results in the database
  const { categoriesWithResults, interestsWithResults } = useMemo(() => {
    const interestsSet = new Set<string>();
    users.forEach(user => {
      if (user.interests) {
        user.interests.forEach((interest: string) => {
          interestsSet.add(interest);
        });
      }
    });
    const activeInterests = Array.from(interestsSet);

    const categoriesSet = new Set<string>();
    Object.entries(CATEGORIES_MAPPING).forEach(([categoryName, categoryInterests]) => {
      const hasAnyMatch = categoryInterests.some(ci => 
        activeInterests.some(ai => ai.toLowerCase() === ci.toLowerCase())
      );
      if (hasAnyMatch) {
        categoriesSet.add(categoryName);
      }
    });

    return {
      categoriesWithResults: Array.from(categoriesSet).sort(),
      interestsWithResults: activeInterests.sort(),
    };
  }, [users]);

  const hasActiveFilters = 
    appliedFilters.country !== "" ||
    appliedFilters.city !== "" ||
    appliedFilters.category !== "Todas las categorías" ||
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
      category: "Todas las categorías",
      selectedInterests: [],
    };
    setTempFilters(cleared);
    setAppliedFilters(cleared);
    setShowFilters(false);
  };

  const isSearching = searchQuery.length > 0;
  const effectiveShowSearch = showSearch || isSearching;

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setCurrentUserProfile(data.profile);
        }
      } catch (err) {
        console.error("Error loading current user profile:", err);
      }
    }
    loadCurrentUser();
  }, []);

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/comunidad");
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Error del servidor: ${res.status}`);
        }
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err: any) {
        console.error("Error al cargar usuarios de la comunidad:", err);
        setError(err.message || "Error de conexión con el servidor");
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const matches: any[] = [];

    // 1. Filter Countries (Priority)
    countriesWithResults.forEach(country => {
      if (country.toLowerCase().includes(query)) matches.push({ type: 'País', value: country });
    });

    // 2. Filter Cities
    citiesWithResults.forEach(city => {
      if (city.toLowerCase().includes(query)) matches.push({ type: 'Ciudad', value: city });
    });

    // 3. Filter Interests
    interestsWithResults.forEach(interest => {
      if (interest.toLowerCase().includes(query)) matches.push({ type: 'Interés', value: interest });
    });

    setSuggestions(matches.slice(0, 5));
  }, [searchQuery, countriesWithResults, citiesWithResults, interestsWithResults]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;

    // If active in search/categories, don't hide the search bar
    if (isSearching) return;

    // Show on scroll up, hide on scroll down
    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      if (showSearch) setShowSearch(false);
    } else {
      if (!showSearch) setShowSearch(true);
    }

    setLastScrollY(currentScrollY);
  };

  // Filter users based on searchQuery AND appliedFilters
  const filteredUsers = users.filter(user => {
    const name = user.name || "";
    const location = user.location || "";
    const interests = user.interests || [];

    // 1. Top main search bar keyword match (matches name, location, or any interest)
    const matchesSearch = !searchQuery ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interests.some((interest: string) => interest.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;


    // 3. Advanced filters: Country
    if (appliedFilters.country) {
      const countryLower = appliedFilters.country.toLowerCase();
      const parts = location.split(',').map((p: string) => p.trim().toLowerCase());
      const hasCountry = parts.includes(countryLower) || location.toLowerCase().includes(countryLower);
      if (!hasCountry) return false;
    }

    // 4. Advanced filters: City
    if (appliedFilters.city) {
      const cityLower = appliedFilters.city.split(',')[0].trim().toLowerCase();
      const locationLower = location.toLowerCase();
      if (!locationLower.includes(cityLower)) return false;
    }

    // 5. Advanced filters: Category
    if (appliedFilters.category && appliedFilters.category !== "Todas las categorías") {
      const allowedInterests = (CATEGORIES_MAPPING as any)[appliedFilters.category] || [];
      const matchesCategory = interests.some((interest: string) =>
        allowedInterests.some((ai: string) => ai.toLowerCase() === interest.toLowerCase())
      );
      if (!matchesCategory) return false;
    }

    // 7. Advanced filters: Selected specific interests (OR matching)
    if (appliedFilters.selectedInterests && appliedFilters.selectedInterests.length > 0) {
      const hasInterest = interests.some((interest: string) =>
        appliedFilters.selectedInterests.some((selected: string) => selected.toLowerCase() === interest.toLowerCase())
      );
      if (!hasInterest) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="w-full h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          <p className="text-[13px] text-slate-500 font-medium">Cargando comunidad...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full bg-white rounded-2xl p-8 border border-red-100 shadow-none flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
            <span className="material-symbols-outlined text-[32px]">database_off</span>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-[20px] font-bold text-slate-900 font-jakarta">
              Error de Configuración de Base de Datos
            </h2>
            <p className="text-[14px] text-slate-500 max-w-md">
              {error}
            </p>
          </div>

          <div className="w-full bg-slate-50 rounded-2xl p-5 text-left border border-slate-100 flex flex-col gap-3 font-sans">
            <h3 className="text-[13px] font-semibold text-slate-700 uppercase tracking-wider">
              ¿Cómo solucionar esto?
            </h3>
            <div className="flex flex-col gap-2 text-[13px] text-slate-600">
              <p>
                Asegúrate de tener configurado tu archivo de entorno <code>.env.local</code> en <code>apps/platform</code> con la variable de conexión de base de datos activa:
                <code className="block bg-slate-100 px-3 py-1.5 rounded-lg mt-1 font-mono text-[12px] break-all border border-slate-200">
                  DATABASE_URL="postgresql://luminus_admin:...@..."
                </code>
              </p>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="h-11 px-6 bg-black text-white rounded-xl text-[14px] font-bold hover:bg-zinc-800 transition duration-200 cursor-pointer"
          >
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col h-full md:overflow-hidden overflow-visible">

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-6 lg:gap-8 h-full md:overflow-hidden overflow-visible py-6">

        {/* Left Column - LinkedIn User Card (1/4 size on desktop) */}
        <div className="hidden md:flex w-[260px] lg:w-[290px] flex-col gap-3 shrink-0 h-fit">
          {/* Card 1: Main Profile Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden flex flex-col shadow-none relative">
            {/* 1. Cover photo */}
            <div className="h-20 w-full relative bg-slate-100 shrink-0">
              {currentUserProfile?.cover_url ? (
                <img
                  src={currentUserProfile.cover_url}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-violet-600 to-indigo-600 opacity-80" />
              )}
            </div>

            {/* 2. Photo (square with rounded corners as the profile) */}
            <div className="flex justify-center -mt-[60px] relative z-10">
              <div className="w-[110px] h-[110px] rounded-[22px] overflow-hidden bg-white border-4 border-white shrink-0 flex items-center justify-center">
                {currentUserProfile?.profile_picture_url && !profileImgError ? (
                  <img
                    src={currentUserProfile.profile_picture_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={() => setProfileImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-zinc-300">
                    <span className="material-symbols-outlined text-[54px]">person</span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Details (3. Name, 4. City) */}
            <div className="p-5 flex flex-col items-center text-center gap-4">
              <div className="flex flex-col items-center gap-1.5 w-full">
                {/* 3. Name */}
                <h3 className="text-[16px] md:text-[18px] font-bold text-slate-900 leading-snug line-clamp-1 hover:underline cursor-pointer font-jakarta" onClick={() => router.push('/perfil-usuario')}>
                  {currentUserProfile ? `${currentUserProfile.first_name || ""} ${currentUserProfile.last_name || ""}`.trim() || "Usuario sin nombre" : "Cargando..."}
                </h3>
                {/* 4. City */}
                <p className="text-[12px] md:text-[13px] font-medium text-slate-400 font-sans tracking-wide">
                  {currentUserProfile?.city ? `${currentUserProfile.city.split(',')[0]}, ${currentUserProfile.country || ""}`.replace(/^,\s*|,\s*$/, "") : "Ubicación no configurada"}
                </p>
              </div>

              {/* 5. Button to see profile */}
              <button
                onClick={() => router.push('/perfil-usuario')}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-2 cursor-pointer border-none font-jakarta uppercase tracking-wider"
              >
                Ir a mi perfil
              </button>
            </div>
          </div>

          {/* Card 2: Mi red Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 flex flex-col gap-4 shadow-none relative">
            {/* Title */}
            <div className="flex justify-between items-center">
              <h4 className="text-[14px] font-bold text-slate-900 font-jakarta">Mi red</h4>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center text-center py-4 px-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/80">
              <span className="material-symbols-outlined text-slate-300 text-[24px] mb-1.5 select-none">
                people_outline
              </span>
              <p className="text-[12px] text-slate-400 font-medium leading-normal max-w-[190px]">
                Todavía no has añadido a nadie a tu red
              </p>
            </div>

            {/* Button to Ver mi red */}
            <button
              onClick={() => router.push('/red')}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-2 cursor-pointer border-none font-jakarta uppercase tracking-wider"
            >
              Ver mi red
            </button>
          </div>
        </div>

        {/* Main Feed Content (Right side - 3/4 on desktop) */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

          {/* Search & Filter Section */}
          <div className="flex flex-col sticky top-0 z-40 bg-[#F8FAFC] pb-4 transition-all duration-300 ease-in-out gap-3 w-full">
            
            {/* Mobile Top User Info & Network Bar */}
            <div className="flex md:hidden bg-white px-4 py-2.5 rounded-xl border border-zinc-200 items-center justify-between shadow-none w-full">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  {currentUserProfile?.profile_picture_url && !profileImgError ? (
                    <img
                      src={currentUserProfile.profile_picture_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={() => setProfileImgError(true)}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-slate-355 text-[18px] select-none">person</span>
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[12px] font-bold text-slate-900 leading-none">
                    {currentUserProfile ? `${currentUserProfile.first_name || ""} ${currentUserProfile.last_name || ""}`.trim() || "Mi Perfil" : "Cargando..."}
                  </span>
                  <button
                    onClick={() => router.push('/perfil-usuario')}
                    className="text-[10px] text-slate-400 hover:text-black font-semibold font-sans leading-none mt-1 underline border-none bg-transparent cursor-pointer p-0 text-left"
                  >
                    Ver mi perfil
                  </button>
                </div>
              </div>
              <button
                onClick={() => router.push('/red')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg text-[10px] font-bold tracking-wider uppercase font-jakarta border-none cursor-pointer animate-none"
              >
                Ver mi red
              </button>
            </div>

            <div className="flex items-center gap-3 w-full relative">
              <div className="flex-1 h-12 pl-4 pr-6 bg-white rounded-xl border border-zinc-200 flex items-center gap-3 focus-within:border-black focus-within:ring-1 focus-within:ring-black group transition-all relative">
                <span className="material-symbols-outlined text-[22px] text-slate-400 group-focus-within:text-black">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por ciudad, país o temas de interés"
                  className="flex-1 bg-transparent border-none text-[15px] font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />

                {suggestions.length > 0 && (
                  <div className="absolute top-[52px] left-0 w-full bg-white border border-slate-200 rounded-2xl z-50 overflow-hidden flex flex-col px-[2px]">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(suggestion.value);
                          setSuggestions([]);
                        }}
                        className="w-full px-6 py-3.5 text-left flex items-center gap-4 hover:bg-slate-50 border-b border-slate-50 last:border-none transition-colors border-none bg-transparent cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px] text-slate-400">
                          {suggestion.type === 'Ciudad' ? 'location_on' : suggestion.type === 'País' ? 'public' : 'favorite'}
                        </span>
                        <div className="flex-1 flex flex-col overflow-hidden">
                          <span className="text-[14px] font-medium text-black truncate">{suggestion.value}</span>
                          <span className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-widest font-bold truncate">{suggestion.type}</span>
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
                className={`hidden md:flex h-12 w-fit min-w-0 px-5 items-center justify-center gap-2 rounded-xl transition-all duration-300 outline-none active:scale-95 cursor-pointer shadow-none text-[13px] md:text-[14px] font-semibold ${
                  showFilters
                    ? "bg-black border border-black text-white hover:bg-zinc-900"
                    : "bg-white border border-zinc-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[20px] md:text-[22px]">manage_search</span>
                <span>Buscar por filtros</span>
              </button>

              {/* Mobile Filter Button (Icon-Only) */}
              <button
                onClick={handleToggleFilters}
                className={`flex md:hidden h-12 w-12 items-center justify-center shrink-0 rounded-xl transition-all duration-300 outline-none active:scale-95 cursor-pointer shadow-none ${
                  showFilters
                    ? "bg-black border border-black text-white hover:bg-zinc-900"
                    : "bg-white border border-zinc-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">manage_search</span>
              </button>

              {/* Filter Backdrop for mobile */}
              {showFilters && (
                <div 
                  className="block md:hidden fixed inset-0 bg-black/60 z-[999] animate-in fade-in duration-200"
                  onClick={() => setShowFilters(false)}
                />
              )}

              {/* Filter Dropdown Popover / Mobile Full-Screen Sheet */}
              {showFilters && (
                <div 
                  ref={dropdownRef}
                  className="
                    fixed md:absolute 
                    inset-0 md:inset-auto 
                    md:top-[56px] md:right-0 
                    w-full md:w-[384px] 
                    h-full md:h-auto 
                    bg-white 
                    rounded-none md:rounded-2xl 
                    border-none md:border border-zinc-200 
                    shadow-none 
                    z-[1000] md:z-50 
                    flex flex-col 
                    overflow-hidden 
                    animate-in 
                    slide-in-from-bottom md:slide-in-from-top-2 
                    fade-in 
                    duration-300 md:duration-150
                  "
                >
                  {/* Header for mobile */}
                  <div className="md:hidden flex items-center justify-between px-5 py-4 border-b border-zinc-200/50 shrink-0">
                    <span className="text-base font-bold text-black font-jakarta">Buscar por filtros</span>
                    <button 
                      type="button" 
                      onClick={() => setShowFilters(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-black border-none cursor-pointer"
                    >
                      <span className="material-symbols-rounded text-[20px]">close</span>
                    </button>
                  </div>

                  {/* Form fields */}
                  <div className="p-5 flex flex-col gap-5 flex-1 overflow-y-auto md:flex-none md:max-h-none md:overflow-visible custom-scrollbar">
                    
                    {/* Country & City Dropdowns - Stacked in Column */}
                    <div className="flex flex-col gap-4">
                      <SelectInput
                        label="País"
                        value={tempFilters.country}
                        options={[{ label: "Cualquier país", value: "" }, ...countriesWithResults.map(country => ({ label: country, value: country }))] }
                        onSelect={(val) => setTempFilters({ ...tempFilters, country: val, city: "" })}
                        placeholder="Cualquier país"
                        preventScrollOnOpen={true}
                      />

                      <SelectInput
                        label="Ciudad"
                        value={tempFilters.city}
                        options={[{ label: "Cualquier ciudad", value: "" }, ...availableCities.map(city => ({ label: city, value: city }))] }
                        onSelect={(val) => setTempFilters({ ...tempFilters, city: val })}
                        placeholder="Cualquier ciudad"
                        preventScrollOnOpen={true}
                      />
                    </div>

                    {/* Dynamic specific interest checkboxes */}
                    <div className="flex flex-col gap-2">
                      <label className="text-label ml-1 font-jakarta">Intereses</label>
                      <div className="flex flex-wrap gap-2 overflow-y-auto pr-1.5 md:max-h-[160px]">
                        {(() => {
                          let availableInterests: string[] = [];
                          if (tempFilters.category && tempFilters.category !== "Todas las categorías") {
                            const categoryInterests = CATEGORIES_MAPPING[tempFilters.category as keyof typeof CATEGORIES_MAPPING] || [];
                            availableInterests = categoryInterests.filter(interest => 
                              interestsWithResults.some(active => active.toLowerCase() === interest.toLowerCase())
                            );
                          } else {
                            availableInterests = interestsWithResults;
                          }

                          if (availableInterests.length === 0) {
                            return (
                              <p className="text-[11px] text-slate-400 py-2 w-full text-center">
                                No hay temas de interés con resultados para esta selección.
                              </p>
                            );
                          }

                          return availableInterests.map(interest => {
                            const isChecked = tempFilters.selectedInterests.includes(interest);
                            return (
                              <button
                                key={interest}
                                type="button"
                                onClick={() => {
                                  const nextSelected = isChecked
                                    ? tempFilters.selectedInterests.filter(i => i !== interest)
                                    : [...tempFilters.selectedInterests, interest];
                                  setTempFilters({ ...tempFilters, selectedInterests: nextSelected });
                                }}
                                className={`px-4 py-2 rounded-full text-[13px] font-medium transition-premium border cursor-pointer select-none flex items-center gap-1.5 ${
                                  isChecked
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-black"
                                }`}
                              >
                                {isChecked && <span className="material-symbols-outlined text-[13px]">check</span>}
                                {interest}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>

                  </div>

                  {/* Actions footer */}
                  <div className="px-4 py-3 bg-slate-50 border-t border-zinc-200/40 flex items-center justify-between gap-3 shrink-0 pb-6 md:pb-3">
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-premium cursor-pointer border-none bg-transparent font-jakarta uppercase tracking-wider"
                    >
                      Limpiar
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowFilters(false)}
                        className="h-9 px-4 bg-white hover:bg-slate-50 text-slate-950 font-medium text-xs rounded-xl border border-zinc-200 transition-premium active:scale-95 cursor-pointer select-none font-jakarta"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyFilters}
                        className="h-9 px-4 bg-black hover:bg-zinc-900 text-white font-medium text-xs rounded-xl transition-premium active:scale-95 cursor-pointer select-none border-none outline-none font-jakarta"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 items-center pt-1 animate-in fade-in duration-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mr-1">Filtros activos:</span>

                {appliedFilters.country && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/50 text-[12px] font-bold text-slate-700">
                    <span>País: {appliedFilters.country}</span>
                    <button 
                      onClick={() => setAppliedFilters({ ...appliedFilters, country: "", city: "" })}
                      className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-slate-200 text-[12px] font-bold border-none bg-transparent cursor-pointer text-slate-500 hover:text-black ml-0.5"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {appliedFilters.city && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/50 text-[12px] font-bold text-slate-700">
                    <span>Ciudad: {appliedFilters.city.split(',')[0]}</span>
                    <button 
                      onClick={() => setAppliedFilters({ ...appliedFilters, city: "" })}
                      className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-slate-200 text-[12px] font-bold border-none bg-transparent cursor-pointer text-slate-500 hover:text-black ml-0.5"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {appliedFilters.category && appliedFilters.category !== "Todas las categorías" && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/50 text-[12px] font-bold text-slate-700">
                    <span>Categoría: {appliedFilters.category}</span>
                    <button 
                      onClick={() => setAppliedFilters({ ...appliedFilters, category: "Todas las categorías", selectedInterests: [] })}
                      className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-slate-200 text-[12px] font-bold border-none bg-transparent cursor-pointer text-slate-500 hover:text-black ml-0.5"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {appliedFilters.selectedInterests && appliedFilters.selectedInterests.map(interest => (
                  <div key={interest} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/50 text-[12px] font-bold text-slate-700">
                    <span>{interest}</span>
                    <button 
                      onClick={() => setAppliedFilters({ 
                        ...appliedFilters, 
                        selectedInterests: appliedFilters.selectedInterests.filter(i => i !== interest) 
                      })}
                      className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-slate-200 text-[12px] font-bold border-none bg-transparent cursor-pointer text-slate-500 hover:text-black ml-0.5"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  onClick={handleClearFilters}
                  className="text-[12px] font-bold text-slate-500 hover:text-black transition-colors ml-1 cursor-pointer border-none bg-transparent underline"
                >
                  Limpiar todo
                </button>
              </div>
            )}
          </div>

          <div
            onScroll={handleScroll}
            className="flex-1 w-full overflow-y-auto custom-scrollbar pb-12"
          >
            {filteredUsers.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
                <span className="material-symbols-outlined text-[48px] text-slate-300 mb-2">person_search</span>
                <h3 className="text-[18px] font-bold text-slate-800 mb-1">No se encontraron resultados</h3>
                <p className="text-slate-400 text-[14px]">Prueba con otros términos de búsqueda o selecciona otra categoría.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 w-full">
                {filteredUsers.map((user: any, idx: number) => (
                  <UserCard key={idx} user={user} />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Network Sheet Drawer */}
      {showNetworkDrawer && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/60 z-[999] animate-in fade-in duration-200"
            onClick={() => setShowNetworkDrawer(false)}
          />
          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 w-full max-h-[85vh] bg-white rounded-t-3xl z-[1000] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 ease-out">
            {/* Handle bar */}
            <div className="flex justify-center py-3 shrink-0">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>
            
            {/* Header */}
            <div className="px-5 pb-3 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h4 className="text-[16px] font-bold text-slate-900 font-jakarta">Mi Perfil y Red</h4>
              <button 
                onClick={() => setShowNetworkDrawer(false)}
                className="p-1 hover:bg-slate-50 rounded-full transition-colors text-slate-400 bg-transparent border-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar max-h-[70vh] pb-8">
              {/* 1. Main Profile Card */}
              <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden flex flex-col shadow-none relative">
                <div className="h-20 w-full relative bg-slate-100 shrink-0">
                  {currentUserProfile?.cover_url ? (
                    <img
                      src={currentUserProfile.cover_url}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-violet-600 to-indigo-600 opacity-80" />
                  )}
                </div>

                <div className="flex justify-center -mt-[60px] relative z-10">
                  <div className="w-[110px] h-[110px] rounded-[22px] overflow-hidden bg-white border-4 border-white shrink-0 flex items-center justify-center">
                    {currentUserProfile?.profile_picture_url && !profileImgError ? (
                      <img
                        src={currentUserProfile.profile_picture_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={() => setProfileImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-zinc-300">
                        <span className="material-symbols-outlined text-[54px]">person</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 flex flex-col items-center text-center gap-4">
                  <div className="flex flex-col items-center gap-1.5 w-full">
                    <h3 className="text-[16px] font-bold text-slate-900 leading-snug line-clamp-1 hover:underline cursor-pointer font-jakarta" onClick={() => { setShowNetworkDrawer(false); router.push('/perfil-usuario'); }}>
                      {currentUserProfile ? `${currentUserProfile.first_name || ""} ${currentUserProfile.last_name || ""}`.trim() || "Usuario sin nombre" : "Cargando..."}
                    </h3>
                    <p className="text-[12px] font-medium text-slate-400 font-sans tracking-wide">
                      {currentUserProfile?.city ? `${currentUserProfile.city.split(',')[0]}, ${currentUserProfile.country || ""}`.replace(/^,\s*|,\s*$/, "") : "Ubicación no configurada"}
                    </p>
                  </div>

                  <button
                    onClick={() => { setShowNetworkDrawer(false); router.push('/perfil-usuario'); }}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-2 cursor-pointer border-none font-jakarta uppercase tracking-wider"
                  >
                     Ir a mi perfil
                  </button>
                </div>
              </div>

              {/* 2. Mi red Card */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 flex flex-col gap-4 shadow-none relative">
                <div className="flex justify-between items-center">
                  <h4 className="text-[14px] font-bold text-slate-900 font-jakarta">Mi red</h4>
                </div>

                <div className="flex flex-col items-center text-center py-4 px-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/80">
                  <span className="material-symbols-outlined text-slate-300 text-[24px] mb-1.5 select-none">
                    people_outline
                  </span>
                  <p className="text-[12px] text-slate-400 font-medium leading-normal max-w-[190px]">
                    Todavía no has añadido a nadie a tu red
                  </p>
                </div>

                <button
                  onClick={() => { setShowNetworkDrawer(false); router.push('/red'); }}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-2 cursor-pointer border-none font-jakarta uppercase tracking-wider"
                >
                  Ver mi red
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
