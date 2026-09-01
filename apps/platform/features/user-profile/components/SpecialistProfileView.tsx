"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

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
  getConnectionButtonLabel,
  isConnectionDropdownOpen,
  setIsConnectionDropdownOpen,
  connectionDropdownRefDesktop,
  connectionDropdownRefMobile,
  onSendMessage,
  onShareProfile,
}: SpecialistProfileViewProps) {
  const [activeTab, setActiveTab] = useState("sobre-mi");
  const specialist = profile.specialistProfile;

  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  const hasCourses = specialist?.courses?.length > 0;
  const hasSpaces = specialist?.spaces?.length > 0;

  const handleBookSession = () => {
    if (specialist?.websiteUrl) {
      window.open(specialist.websiteUrl, "_blank");
    }
  };

  return (
    <div className="w-full h-full bg-transparent pt-4 lg:pt-6 pb-24">
      {/* Main Specialist Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col gap-6 shadow-sm">
        {/* Top Section: Avatar & Action Buttons */}
        <div className="flex justify-between items-start">
          <img
            src={profile.profile_picture_url || "/default-avatar.png"}
            alt={fullName}
            className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-2xl bg-slate-100"
          />

          <div className="flex gap-2">
            {!profile.is_own_profile && isPublic && (
              <>
                {profile?.connection_status === "pending" && profile?.connection_direction === "incoming" ? (
                  <>
                    <Button
                      onClick={onConnect}
                      variant="outline"
                      disabled={connectionLoading}
                      className="flex items-center justify-center gap-1.5 font-bold text-[13px] h-11 rounded-xl animate-none px-3"
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                      <span className="hidden sm:inline">Aceptar</span>
                    </Button>
                    <Button
                      onClick={onDeclineConnect}
                      variant="outline"
                      disabled={connectionLoading}
                      className="flex items-center justify-center gap-1.5 font-bold text-[13px] h-11 rounded-xl animate-none px-3 hover:bg-[#FF4B4B]/10 hover:text-[#FF4B4B] hover:border-[#FF4B4B]/30"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </Button>
                  </>
                ) : profile?.connection_status === "accepted" ? (
                  <div className="relative" ref={connectionDropdownRefDesktop}>
                    <Button
                      onClick={() => setIsConnectionDropdownOpen?.(!isConnectionDropdownOpen)}
                      variant="outline"
                      disabled={connectionLoading}
                      className="flex items-center justify-center gap-1.5 font-bold text-[13px] h-11 rounded-xl animate-none px-4 text-slate-700 bg-slate-50 border-slate-200"
                    >
                      <span className="material-symbols-outlined text-[18px]">favorite</span>
                      <span>Siguiendo</span>
                    </Button>
                    
                    {isConnectionDropdownOpen && (
                      <div className="absolute top-full right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
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
                    className="flex items-center justify-center gap-1.5 font-bold text-[13px] h-11 rounded-xl animate-none px-4"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {profile?.connection_status === "blocked" ? "block" : "favorite_border"}
                    </span>
                    <span className="hidden sm:inline">Seguir</span>
                  </Button>
                )}
              </>
            )}

            <button
              onClick={onShareProfile}
              className="h-11 w-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 rounded-xl transition-all duration-300 outline-none active:scale-95 cursor-pointer shadow-none"
              title="Compartir perfil"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-jakarta">{fullName}</h1>
          {location && (
            <p className="text-sm md:text-base text-slate-500">{location}</p>
          )}
          {specialist?.specialty && (
            <p className="text-sm md:text-base font-semibold text-[#F43F5E] mt-1">
              {specialist.specialty}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-2 -mb-2">
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
        <div className="flex flex-col gap-4 mt-2">
          {activeTab === "sobre-mi" && (
            <>
              {specialist?.bio && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 text-sm md:text-base text-slate-600 leading-relaxed font-jakarta">
                  {specialist.bio}
                </div>
              )}
              {specialist?.institution && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Formación</h3>
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
                <div key={course.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
                   <h4 className="font-bold text-slate-900">{course.name}</h4>
                   <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "espacios" && hasSpaces && (
            <div className="flex flex-col gap-4">
              {specialist.spaces.map((space: any) => (
                <div key={space.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
                   <h4 className="font-bold text-slate-900">{space.name}</h4>
                   {space.description && <p className="text-sm text-slate-600 line-clamp-2">{space.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons (Sticky on mobile or bottom) */}
      {!profile.is_own_profile && isPublic && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
          <Button
            onClick={onSendMessage}
            variant="primary"
            className="w-full h-12 flex items-center justify-center gap-2 font-bold rounded-xl bg-black text-white hover:bg-zinc-800"
          >
            <span className="material-symbols-outlined text-[20px]">mail</span>
            Contactar a {profile.first_name}
          </Button>
          {specialist?.websiteUrl && (
            <Button
              onClick={handleBookSession}
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-2 font-bold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              Agendar Sesión Introductoria
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
