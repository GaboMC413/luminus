"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ProfileButton } from "@/components/ui/Button";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { SpecialistPostulationModal } from "@/components/ui/SpecialistPostulationModal";

export default function EspecialistasPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isPostulationOpen, setIsPostulationOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handlePostulationSuccess = () => {
    setIsPostulationOpen(false);
    setShowSuccess(true);
  };

  return (
    <div className="flex-1 w-full flex flex-col h-full md:overflow-hidden overflow-visible">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-6 lg:gap-8 h-full md:overflow-hidden overflow-visible py-6">
        
        {/* Left Column (Sidebar) */}
        <div className="flex w-full md:w-[260px] lg:w-[290px] flex-col gap-4 shrink-0 h-fit">
          
          {/* Card 1: Followed Specialists */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 flex flex-col gap-4 shadow-none relative">
            <div className="flex justify-between items-center">
              <h4 className="text-[14px] font-bold text-slate-900 font-jakarta">Especialistas seguidos</h4>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center text-center py-4 px-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/80">
              <span className="material-symbols-outlined text-slate-300 text-[24px] mb-1.5 select-none">
                favorite_outline
              </span>
              <p className="text-[11px] text-slate-400 font-medium leading-normal max-w-[190px]">
                Aún no sigues a ningún especialista
              </p>
            </div>
          </div>

          {/* Card 2: Upcoming Sessions */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 flex flex-col gap-4 shadow-none relative">
            <div className="flex justify-between items-center">
              <h4 className="text-[14px] font-bold text-slate-900 font-jakarta">Próximas Sesiones</h4>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center text-center py-4 px-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/80">
              <span className="material-symbols-outlined text-slate-300 text-[24px] mb-1.5 select-none">
                calendar_today
              </span>
              <p className="text-[11px] text-slate-400 font-medium leading-normal max-w-[190px]">
                No tienes sesiones agendadas en tu agenda
              </p>
            </div>
          </div>

          {/* Action Button: Sumarte como Especialista */}
          <Button
            onClick={() => router.push("/especialistas/onboarding")}
            variant="primary"
            className="w-full !h-12 bg-black text-white hover:bg-zinc-900 font-bold font-jakarta text-[13px] uppercase tracking-wider !rounded-xl"
          >
            Sumarte como Especialista
          </Button>
        </div>

        {/* Right / Main Feed Column */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          
          {/* Search & Filter Header Section */}
          <div className="flex flex-col sticky top-0 z-40 bg-[#F8FAFC] pb-4 transition-all duration-300 ease-in-out gap-3 w-full">
            <div className="flex items-center gap-3 w-full relative">
              
              {/* Search Bar */}
              <div className="flex-1 h-12 pl-4 pr-6 bg-white rounded-xl border border-zinc-200 flex items-center gap-3 focus-within:border-black focus-within:ring-1 focus-within:ring-black group transition-all relative">
                <span className="material-symbols-outlined text-[22px] text-slate-400 group-focus-within:text-black">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar especialistas por nombre o especialidad..."
                  className="flex-1 bg-transparent border-none text-[15px] font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* Filter Button */}
              <ProfileButton
                onClick={handleToggleFilters}
                icon="manage_search"
                label="Buscar por filtros"
                className={`!h-12 !w-fit !min-w-0 px-5 !rounded-xl ${
                  showFilters
                    ? "!bg-black !border-black !text-white hover:!bg-zinc-900"
                    : ""
                }`}
              />

              {/* Filter Dropdown Popover (Placeholder) */}
              {showFilters && (
                <div className="absolute top-[56px] right-0 w-[calc(100vw-32px)] sm:w-[384px] max-w-sm bg-white border border-zinc-200 rounded-2xl shadow-none z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-5 flex flex-col gap-4 text-center">
                    <span className="material-symbols-outlined text-slate-300 text-[32px]">filter_list_off</span>
                    <h5 className="font-jakarta font-bold text-[14px] text-slate-800">Filtros de búsqueda</h5>
                    <p className="text-[12px] text-slate-400 leading-normal">
                      Próximamente podrás filtrar los especialistas por modalidad de consulta, calificación y disponibilidad.
                    </p>
                  </div>
                  <div className="px-4 py-3 bg-slate-50 border-t border-zinc-200/40 flex justify-end shrink-0">
                    <button
                      onClick={() => setShowFilters(false)}
                      className="h-9 px-4 bg-black hover:bg-zinc-900 text-white font-medium text-xs rounded-xl transition-premium cursor-pointer select-none border-none outline-none font-jakarta"
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Specialists Grid Content Area (Empty / Under Development State) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-12">
            <div className="w-full flex flex-col items-center justify-center p-12 text-center min-h-[350px] bg-white rounded-2xl border border-slate-200 shadow-none">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                <span className="material-symbols-outlined text-[32px] text-slate-400 select-none">
                  groups
                </span>
              </div>
              <h3 className="text-[20px] font-bold text-slate-800 font-jakarta mb-2">Especialistas LUMINUS</h3>
              <p className="text-slate-400 text-[14px] max-w-[420px] leading-relaxed mb-6 font-sans">
                Esta sección está siendo diseñada para conectar con profesionales de distintas áreas del bienestar, permitiéndote agendar sesiones y realizar seguimientos personalizados.
              </p>
              <Button
                onClick={() => router.push("/comunidad")}
                variant="outline"
                className="!w-auto px-6 font-bold text-slate-700 border-slate-200 hover:bg-slate-50 !h-11 rounded-xl"
              >
                Volver a la Comunidad
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* Postulation Form Modal */}
      <SpecialistPostulationModal
        isOpen={isPostulationOpen}
        onClose={() => setIsPostulationOpen(false)}
        onSuccess={handlePostulationSuccess}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="¡Postulación Enviada!"
        message="Tu postulación para sumarte como especialista ha sido recibida correctamente. Nuestro equipo evaluará tu perfil a la brevedad."
        buttonText="Entendido"
      />
    </div>
  );
}
