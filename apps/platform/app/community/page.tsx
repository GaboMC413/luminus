"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { InterestPill } from "@/components/ui/InterestPill";
import { UserCard } from "@/components/ui/UserCard";
import { MOCK_USERS, SEARCH_DATA } from "@/utils/constants";

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
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todas las categorías");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();

  const isSearching = searchQuery.length > 0;
  const effectiveShowSearch = showSearch || isSearching;

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const matches: any[] = [];

    // 1. Filter Countries (Priority)
    SEARCH_DATA.countries.forEach(country => {
      if (country.toLowerCase().includes(query)) matches.push({ type: 'País', value: country });
    });

    // 2. Filter Cities
    SEARCH_DATA.cities.forEach(city => {
      if (city.toLowerCase().includes(query)) matches.push({ type: 'Ciudad', value: city });
    });

    // 3. Filter Interests
    SEARCH_DATA.interests.forEach(interest => {
      if (interest.toLowerCase().includes(query)) matches.push({ type: 'Interés', value: interest });
    });

    setSuggestions(matches.slice(0, 5));
  }, [searchQuery]);

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

  // Filter users based on searchQuery AND selectedCategory
  const filteredUsers = MOCK_USERS.filter(user => {
    const matchesSearch = !searchQuery || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.interests.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedCategory !== "Todas las categorías") {
      const CATEGORIES_MAPPING = {
        "Crecimiento Personal": ["Autocuidado", "Motivación", "Calma interior", "Propósito de vida", "Organización personal", "Toma de decisiones", "Rutinas saludables", "Hábitos conscientes", "Confianza personal", "Autoestima", "Acompañamiento personal"],
        "Bienestar Emocional": ["Gestión emocional", "Relaciones saludables", "Calma interior", "Bienestar emocional", "Equilibrio emocional", "Acompañamiento personal", "Comunicación consciente", "Autoestima"],
        "Salud y Medicina": ["Salud integral", "Suplementación", "Salud hormonal", "Salud cardiovascular", "Prevención", "Longevidad", "Salud digestiva"],
        "Movimiento Físico": ["Yoga y Pilates", "Atención plena", "Meditación", "Postura y movilidad", "Fuerza", "Entrenamiento funcional"],
        "Nutrición": ["Nutrición diaria", "Alimentación consciente", "Alimentación saludable", "Cocina práctica", "Suplementación", "Hidratación", "Salud digestiva"],
        "Estilo de Vida": ["Autocuidado", "Sustentabilidad", "Experiencias conscientes", "Naturaleza", "Calidad de vida", "Rutinas saludables", "Organización personal", "Sueño reparador", "Descanso", "Balance vida personal"],
        "Espiritualidad": ["Atención plena", "Meditación", "Conexión interior", "Espiritualidad", "Experiencias conscientes", "Naturaleza"]
      };
      const allowedInterests = (CATEGORIES_MAPPING as any)[selectedCategory] || [];
      const matchesCategory = user.interests.some(interest => 
        allowedInterests.some((ai: string) => ai.toLowerCase() === interest.toLowerCase())
      );
      return matchesSearch && matchesCategory;
    }

    return matchesSearch;
  });

  return (
    <div className="flex-1 w-full flex flex-col h-full md:overflow-hidden overflow-visible">
      
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-8 h-full md:overflow-hidden overflow-visible py-6">
        
        {/* Main Feed Content (Left side - 3/4 on desktop) */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          
          {/* Desktop Search Section */}
          <div className="hidden md:flex flex-col sticky top-0 z-40 bg-[#F8FAFC] pb-4 transition-all duration-300 ease-in-out">
            <div className="h-12 pl-4 pr-6 bg-white rounded-[40px] border border-zinc-200 flex items-center gap-3 focus-within:border-black focus-within:ring-1 focus-within:ring-black group transition-all shadow-sm">
              <span className="material-symbols-outlined text-[22px] text-slate-400 group-focus-within:text-black">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por ciudad, país o temas de interés"
                className="flex-1 bg-transparent border-none text-[15px] font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {suggestions.length > 0 && (
              <div className="absolute top-[52px] left-0 w-full bg-white border border-slate-200 rounded-2xl z-50 overflow-hidden flex flex-col shadow-lg px-[2px]">
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

          <div
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-12"
          >
            {/* Mobile Search Bar */}
            <div className="md:hidden w-full sticky top-0 z-40 bg-[#F8FAFC]/90 backdrop-blur-md pb-4">
              <div className="w-full flex flex-col gap-3 relative">
                <div className="w-full h-12 pl-3 pr-4 bg-white rounded-[40px] border border-zinc-200 flex items-center gap-2 focus-within:border-black focus-within:ring-1 focus-within:ring-black group transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[18px] text-slate-400 group-focus-within:text-black shrink-0">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsMobileCategoriesOpen(false)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por ciudad, país..."
                    className="flex-1 min-w-0 bg-transparent border-none text-[14px] font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none truncate"
                  />
                </div>

                <div className="relative w-full">
                  <button 
                    onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                    className={`h-10 w-full px-4 bg-white rounded-full flex items-center justify-between border ${isMobileCategoriesOpen ? 'border-black ring-1 ring-black' : 'border-zinc-200'} shadow-sm cursor-pointer`}
                  >
                    <span className={`text-[13px] truncate ${isMobileCategoriesOpen ? 'text-black font-semibold' : 'text-slate-500'}`}>
                      {selectedCategory === "Todas las categorías" ? "Categorías" : selectedCategory}
                    </span>
                    <span className="material-symbols-rounded text-[18px] text-slate-400">expand_more</span>
                  </button>

                  {isMobileCategoriesOpen && (
                    <div className="absolute top-[46px] left-0 w-full bg-white border border-slate-200 rounded-3xl z-50 overflow-hidden py-3 shadow-lg max-h-[300px] overflow-y-auto custom-scrollbar">
                      {[
                        { name: "Todas las categorías", icon: "all_inclusive", color: "#000000" },
                        { name: "Crecimiento Personal", icon: "psychiatry", color: "#22C55E" },
                        { name: "Bienestar Emocional", icon: "mood", color: "#E384FF" },
                        { name: "Salud y Medicina", icon: "stethoscope", color: "#2D69FC" },
                        { name: "Movimiento Físico", icon: "directions_run", color: "#FF4B26" },
                        { name: "Nutrición", icon: "nutrition", color: "#84CC16" },
                        { name: "Estilo de Vida", icon: "wb_sunny", color: "#F97316" },
                        { name: "Espiritualidad", icon: "self_improvement", color: "#8B5CF6" }
                      ].map((category) => {
                        const isSelected = selectedCategory === category.name;
                        return (
                          <button
                            key={category.name}
                            onClick={() => {
                              setSelectedCategory(category.name);
                              setIsMobileCategoriesOpen(false);
                            }}
                            className={`w-full flex items-center gap-4 px-6 py-3 hover:bg-slate-50 text-left border-none bg-transparent cursor-pointer ${isSelected ? 'bg-slate-50/50' : ''}`}
                          >
                            <span className={`material-symbols-outlined text-[20px]`} style={isSelected ? { color: category.color } : { color: '#94A3B8' }}>
                              {category.icon}
                            </span>
                            <span className={`text-[14px] ${isSelected ? 'font-bold' : 'text-slate-500'}`} style={isSelected ? { color: category.color } : {}}>
                              {category.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
                <span className="material-symbols-outlined text-[48px] text-slate-300 mb-2">person_search</span>
                <h3 className="text-[18px] font-bold text-slate-800 mb-1">No se encontraron resultados</h3>
                <p className="text-slate-400 text-[14px]">Prueba con otros términos de búsqueda o selecciona otra categoría.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredUsers.map((user: any, idx: number) => (
                  <UserCard key={idx} user={user} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Navigation - Categories */}
        <aside className="hidden md:flex w-[240px] flex-col gap-1 pt-2 pb-12 h-full shrink-0">
          <div className="mb-4 px-2">
            <h2 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Categorías</h2>
          </div>
          {[
            { name: "Todas las categorías", icon: "all_inclusive", color: "#000000" },
            { name: "Crecimiento Personal", icon: "psychiatry", color: "#22C55E" },
            { name: "Bienestar Emocional", icon: "mood", color: "#E384FF" },
            { name: "Salud y Medicina", icon: "stethoscope", color: "#2D69FC" },
            { name: "Movimiento Físico", icon: "directions_run", color: "#FF4B26" },
            { name: "Nutrición", icon: "nutrition", color: "#84CC16" },
            { name: "Estilo de Vida", icon: "wb_sunny", color: "#F97316" },
            { name: "Espiritualidad", icon: "self_improvement", color: "#8B5CF6" }
          ].map((category) => {
            const isSelected = selectedCategory === category.name;
            return (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100/80 transition group border-none bg-transparent cursor-pointer text-left w-full ${isSelected ? 'bg-slate-100 font-semibold' : ''}`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ color: isSelected ? category.color : '#94A3B8' }}
                >
                  {category.icon}
                </span>
                <span
                  className="text-[14px]"
                  style={{ color: isSelected ? category.color : '#64748B' }}
                >
                  {category.name}
                </span>
              </button>
            );
          })}
        </aside>
      </div>
    </div>
  );
}
