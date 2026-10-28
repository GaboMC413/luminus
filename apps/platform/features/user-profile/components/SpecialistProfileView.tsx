"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IntroSessionScheduler } from "./IntroSessionScheduler";
import { ProfileSidebar } from "./ProfileSidebar";

interface SpecialistProfileViewProps {
  profile: any;
  isPublic?: boolean;
  onConnect?: () => void;
  onDeclineConnect?: () => void;
  onRemoveConnection?: () => void;
  onBlockConnection?: () => void;
  connectionLoading?: boolean;
  getConnectionButtonLabel?: () => string;
  isConnectionDropdownOpen?: boolean;
  setIsConnectionDropdownOpen?: (open: boolean) => void;
  connectionDropdownRefDesktop?: React.RefObject<HTMLDivElement>;
  connectionDropdownRefMobile?: React.RefObject<HTMLDivElement>;
  onSendMessage?: () => void;
  onShareProfile?: () => void;
}

export function SpecialistProfileView({
  profile,
  isPublic = true,
  onConnect,
  onDeclineConnect,
  onRemoveConnection,
  onBlockConnection,
  connectionLoading,
  isConnectionDropdownOpen,
  setIsConnectionDropdownOpen,
  connectionDropdownRefDesktop,
  connectionDropdownRefMobile,
  onSendMessage,
  onShareProfile,
}: SpecialistProfileViewProps) {
  const [activeTab, setActiveTab] = useState("sobre-mi");
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const specialist = profile.specialistProfile;

  const hasCourses = specialist?.courses?.length > 0;
  const hasSpaces = specialist?.spaces?.length > 0;
  const availability = (specialist?.spaces || []).flatMap((space: any) => space.availability || []);
  const isGabrielLocalPreview = profile.id === "7247f3d1-d084-438b-b511-a26096ba1c28";
  const localPreviewAvailability = isGabrielLocalPreview
    ? [{ dayOfWeek: 4, startTime: "17:00", endTime: "23:00", isActive: true }]
    : [0, 1, 2, 3, 4].map((dayOfWeek) => ({
        dayOfWeek,
        startTime: "09:00",
        endTime: "18:00",
        isActive: true,
      }));
  const effectiveAvailability = availability.length > 0
    ? availability
    : process.env.NODE_ENV !== "production"
      ? localPreviewAvailability
      : [];
  const hasAvailability = effectiveAvailability.length > 0;

  const getSpecialistConnectionLabelDesktop = () => {
    if (connectionLoading) return "Enviando...";
    if (profile?.connection_status === "pending") {
      return profile?.connection_direction === "incoming" ? "Aceptar" : "Solicitud enviada";
    }
    if (profile?.connection_status === "accepted") return "Siguiendo";
    if (profile?.connection_status === "blocked") return "Desbloquear";
    return "Seguir";
  };

  const getSpecialistConnectionLabelMobile = () => {
    if (connectionLoading) return "Enviando...";
    if (profile?.connection_status === "pending") {
      return profile?.connection_direction === "incoming" ? "Aceptar" : "Solicitado";
    }
    if (profile?.connection_status === "accepted") return "Siguiendo";
    if (profile?.connection_status === "blocked") return "Desbloquear";
    return "Seguir";
  };

  return (
    <div className="w-full h-full bg-transparent pt-4 lg:pt-6">
      {isSchedulerOpen && (
        <IntroSessionScheduler
          specialistName={profile.first_name || "el especialista"}
          availability={effectiveAvailability}
          onClose={() => setIsSchedulerOpen(false)}
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-4 lg:gap-8 items-start">
        {/* LEFT COLUMN */}
        <div className="md:col-span-4 flex flex-col gap-4 lg:gap-6 mt-0 md:-mt-[136px] lg:-mt-[224px]">
          <ProfileSidebar
            profile={profile}
            coverUrl={profile.cover_url}
            isPublic={isPublic}
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="md:col-span-8 flex flex-col gap-4 lg:gap-6">
          {/* Action Buttons */}
          {/* Desktop view action buttons */}
          <div className="hidden sm:flex flex-row gap-3 w-full items-center">
            {!profile.is_own_profile ? (
              <>
                {/* Connection Actions */}
                {profile?.connection_status === "pending" && profile?.connection_direction === "incoming" ? (
                  <>
                    <Button
                      onClick={onConnect}
                      variant="outline"
                      disabled={connectionLoading}
                      className="flex-1 flex items-center justify-center gap-2 font-bold animate-none"
                    >
                      <span className="material-symbols-outlined text-[20px]">check</span>
                      Aceptar
                    </Button>
                    <Button
                      onClick={onDeclineConnect}
                      disabled={connectionLoading}
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2 font-bold animate-none hover:bg-[#FF4B4B]/10 hover:text-[#FF4B4B] hover:border-[#FF4B4B]/30"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                      Rechazar
                    </Button>
                  </>
                ) : profile?.connection_status === "accepted" ? (
                  <div className="relative flex-1" ref={connectionDropdownRefDesktop}>
                    <Button
                      onClick={() => setIsConnectionDropdownOpen?.(!isConnectionDropdownOpen)}
                      variant="outline"
                      disabled={connectionLoading}
                      className="w-full flex items-center justify-center gap-2 font-bold animate-none"
                    >
                      <span className="material-symbols-outlined text-[20px]">favorite</span>
                      Siguiendo
                      <span className="material-symbols-outlined text-[16px] ml-0.5">
                        {isConnectionDropdownOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                      </span>
                    </Button>
                    
                    {isConnectionDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 origin-top-left">
                        <button
                          onClick={onRemoveConnection}
                          className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                        >
                          <span className="material-symbols-rounded text-slate-500 group-hover:text-[#FF4B4B] text-[18px] transition-colors">person_remove</span>
                          <span className="font-semibold text-slate-500 group-hover:text-[#FF4B4B] transition-colors">Dejar de seguir</span>
                        </button>
                        <button
                          onClick={onBlockConnection}
                          className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                        >
                          <span className="material-symbols-rounded text-slate-500 group-hover:text-[#FF4B4B] text-[18px] transition-colors">block</span>
                          <span className="font-semibold text-slate-500 group-hover:text-[#FF4B4B] transition-colors">Bloquear</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={onConnect}
                    variant="outline"
                    disabled={connectionLoading}
                    className="flex-1 flex items-center justify-center gap-2 font-bold animate-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {profile?.connection_status === "blocked" ? "block" : "favorite_border"}
                    </span>
                    {getSpecialistConnectionLabelDesktop()}
                  </Button>
                )}

                {/* Message Action */}
                {profile?.connection_status !== "blocked" && (
                  <Button
                    onClick={onSendMessage}
                    variant="primary"
                    className="flex-1 flex items-center justify-center gap-2 font-bold animate-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                    Mensaje
                  </Button>
                )}

                {/* Schedule Action */}
                {hasAvailability && profile?.connection_status !== "blocked" && (
                  <Button
                    onClick={() => setIsSchedulerOpen(true)}
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2 font-bold animate-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                    Agendar
                  </Button>
                )}

                {/* Share Action */}
                <button
                  onClick={onShareProfile}
                  className="w-11 h-11 md:w-12 md:h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 rounded-xl transition-all duration-300 outline-none active:scale-95 cursor-pointer shadow-none font-jakarta"
                  title="Compartir perfil"
                >
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </button>
              </>
            ) : (
              /* Share Action (Full button when viewing own profile) */
              <Button
                onClick={onShareProfile}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2 font-bold animate-none"
              >
                <span className="material-symbols-outlined text-[20px]">share</span>
                Compartir perfil
              </Button>
            )}
          </div>

          {/* Mobile view action buttons (2 lines layout) */}
          <div className="flex sm:hidden flex-col gap-2.5 w-full">
            {/* Line 1: Connection & Schedule */}
            {!profile.is_own_profile && (
              <div className="flex flex-row gap-2 w-full">
                {profile?.connection_status === "pending" && profile?.connection_direction === "incoming" ? (
                  <>
                    <Button
                      onClick={onConnect}
                      variant="outline"
                      disabled={connectionLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 font-bold text-[13px] h-11 rounded-xl animate-none px-2"
                    >
                      <span className="material-symbols-outlined text-[20px]">check</span>
                      <span className="truncate">Aceptar</span>
                    </Button>
                    <Button
                      onClick={onDeclineConnect}
                      variant="outline"
                      disabled={connectionLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 font-bold text-[13px] h-11 rounded-xl animate-none px-2 hover:bg-[#FF4B4B]/10 hover:text-[#FF4B4B] hover:border-[#FF4B4B]/30"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                      <span className="truncate">Rechazar</span>
                    </Button>
                  </>
                ) : profile?.connection_status === "accepted" ? (
                  <div className="relative w-full" ref={connectionDropdownRefMobile}>
                    <Button
                      onClick={() => setIsConnectionDropdownOpen?.(!isConnectionDropdownOpen)}
                      variant="outline"
                      disabled={connectionLoading}
                      className="w-full flex items-center justify-center gap-1.5 font-bold text-[13px] h-11 rounded-xl animate-none"
                    >
                      <span className="material-symbols-outlined text-[20px]">favorite</span>
                      <span>Siguiendo</span>
                      <span className="material-symbols-outlined text-[16px] ml-0.5">
                        {isConnectionDropdownOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                      </span>
                    </Button>
                    
                    {isConnectionDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 origin-top-left">
                        <button
                          onClick={onRemoveConnection}
                          className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                        >
                          <span className="material-symbols-rounded text-slate-500 group-hover:text-[#FF4B4B] text-[18px] transition-colors">person_remove</span>
                          <span className="font-semibold text-slate-500 group-hover:text-[#FF4B4B] transition-colors">Dejar de seguir</span>
                        </button>
                        <button
                          onClick={onBlockConnection}
                          className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                        >
                          <span className="material-symbols-rounded text-slate-500 group-hover:text-[#FF4B4B] text-[18px] transition-colors">block</span>
                          <span className="font-semibold text-slate-500 group-hover:text-[#FF4B4B] transition-colors">Bloquear</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={onConnect}
                    variant="outline"
                    disabled={connectionLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 font-bold text-[13px] h-11 rounded-xl animate-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {profile?.connection_status === "blocked" ? "block" : "favorite_border"}
                    </span>
                    <span>{getSpecialistConnectionLabelMobile()}</span>
                  </Button>
                )}

                {hasAvailability && profile?.connection_status !== "blocked" && (
                  <Button
                    onClick={() => setIsSchedulerOpen(true)}
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-1.5 font-bold text-[13px] h-11 rounded-xl animate-none px-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                    <span className="truncate">Agendar</span>
                  </Button>
                )}
              </div>
            )}

            {/* Line 2: Message & Share Actions */}
            <div className="flex flex-row gap-2 w-full items-center">
              {!profile.is_own_profile && profile?.connection_status !== "blocked" && (
                <Button
                  onClick={onSendMessage}
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-1.5 font-bold text-[13px] h-11 rounded-xl animate-none px-3"
                >
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                  <span>Mensaje</span>
                </Button>
              )}
              <button
                onClick={onShareProfile}
                className={`h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 rounded-xl transition-all duration-300 outline-none active:scale-95 cursor-pointer shadow-none font-jakarta ${
                  (profile.is_own_profile || profile?.connection_status === "blocked") ? "w-full" : "w-11"
                }`}
                title="Compartir perfil"
              >
                <span className="material-symbols-outlined text-[20px]">share</span>
                {(profile.is_own_profile || profile?.connection_status === "blocked") && <span className="ml-2 font-bold text-[13px]">Compartir perfil</span>}
              </button>
            </div>
          </div>

          {/* Speciality Highlight Card (Optional) */}
          {specialist?.specialty && (
             <div className="bg-white border border-slate-200 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Especialidad</h3>
                <p className="text-base md:text-lg font-semibold text-[#F43F5E]">{specialist.specialty}</p>
             </div>
          )}

          {/* Tabs */}
          <div className="flex overflow-x-auto gap-2 scrollbar-hide">
            <button
              onClick={() => setActiveTab("sobre-mi")}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border-none outline-none cursor-pointer ${
                activeTab === "sobre-mi" ? "bg-black text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Sobre mí
            </button>
            {hasCourses && (
              <button
                onClick={() => setActiveTab("cursos")}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border-none outline-none cursor-pointer ${
                  activeTab === "cursos" ? "bg-black text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Cursos
              </button>
            )}
            {hasSpaces && (
              <button
                onClick={() => setActiveTab("espacios")}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border-none outline-none cursor-pointer ${
                  activeTab === "espacios" ? "bg-black text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Espacios
              </button>
            )}
          </div>

          {/* Content Area */}
          <div className="flex flex-col gap-4">
            {activeTab === "sobre-mi" && (
              <>
                {specialist?.bio && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8">
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Sobre mí</h3>
                     <div className="text-sm md:text-base text-slate-600 leading-relaxed font-jakarta whitespace-pre-wrap">
                       {specialist.bio}
                     </div>
                  </div>
                )}
                {specialist?.institution && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Formación / Institución</h3>
                    <p className="text-sm md:text-base text-slate-800 font-medium">
                      {specialist.institution}
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === "cursos" && hasCourses && (
              <div className="flex flex-col gap-4">
                {specialist.courses.map((course: any) => (
                  <div key={course.id} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col gap-3">
                     <h4 className="text-lg font-bold text-slate-900 font-jakarta">{course.name}</h4>
                     <p className="text-sm md:text-base text-slate-600 leading-relaxed whitespace-pre-wrap">{course.description}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "espacios" && hasSpaces && (
              <div className="flex flex-col gap-4">
                {specialist.spaces.map((space: any) => (
                  <div key={space.id} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col gap-3">
                     <h4 className="text-lg font-bold text-slate-900 font-jakarta">{space.name}</h4>
                     {space.description && <p className="text-sm md:text-base text-slate-600 leading-relaxed whitespace-pre-wrap">{space.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
