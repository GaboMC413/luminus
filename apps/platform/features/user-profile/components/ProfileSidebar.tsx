"use client";

import Link from "next/link";
import { User, Sparkles, Briefcase, Cake, MapPin, Mail, UserPlus, Camera, Settings, Lock, Edit3 } from "lucide-react";
import { Button, ProfileButton, EmptyProfileButton } from "@/components/ui/Button";
import { Profile } from "./ProfileContent";
import { isMecenas } from "@/lib/membership/access";

interface ProfileSidebarProps {
  profile: Profile;
  onEditPhoto?: () => void;
  onEditProfile?: (field?: string) => void;
  onSignOut?: () => void;
  onShowCoverModal?: () => void;
  coverUrl: string;
  isPublic?: boolean;
  onSendMessage?: () => void;
  onConnect?: () => void;
  highlightField?: string;
}

export function ProfileSidebar({
  profile,
  onEditPhoto,
  onEditProfile,
  onShowCoverModal,
  coverUrl,
  isPublic = false,
  onSendMessage,
  onConnect,
  highlightField
}: ProfileSidebarProps) {
  const MONTH_NAMES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'No definido' || dateStr === 'Sin fecha de nacimiento') return 'Sin fecha de nacimiento';

    let day: number | null = null;
    let monthIndex: number | null = null;

    if (dateStr.includes('/')) {
      const parts = dateStr.split('/').map(p => p.trim());
      if (parts.length >= 2) {
        day = parseInt(parts[0], 10);
        monthIndex = parseInt(parts[1], 10) - 1;
      }
    } else if (dateStr.includes('-')) {
      const parts = dateStr.split('-').map(p => p.trim());
      if (parts.length === 3) {
        day = parseInt(parts[2], 10);
        monthIndex = parseInt(parts[1], 10) - 1;
      }
    }

    if (day && monthIndex !== null && monthIndex >= 0 && monthIndex < 12 && !isNaN(day) && !isNaN(monthIndex)) {
      return `${day} de ${MONTH_NAMES[monthIndex]}`;
    }

    return dateStr;
  };

  const hasLocation = profile.city || profile.country;
  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 flex flex-col items-start md:items-center shadow-none overflow-hidden relative group">
      {/* Local Cover - Mobile Only */}
      <div className={`md:hidden w-full h-36 md:h-44 relative shrink-0 ${!coverUrl || coverUrl.includes("empty") ? 'luminus-light-gradient border-b border-slate-200' : 'bg-slate-100'}`}>
        {coverUrl && !coverUrl.includes("empty") && (
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
        )}
        {!isPublic && onShowCoverModal && (
          <button
            onClick={() => {
              window.history.replaceState(null, "", window.location.pathname);
              onShowCoverModal();
            }}
            className={`absolute bottom-3 right-3 z-10 w-9 h-9 rounded-xl bg-white/90 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white hover:text-slate-900 transition-all ${highlightField === "cover" ? "glow-highlight" : ""}`}
            title="Cambiar portada"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Avatar Container */}
      <div className="w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-2xl overflow-hidden -mt-20 md:mt-6 ml-4 md:ml-0 relative shrink-0 group border-4 border-white bg-white shadow-none">
        {profile.profile_picture_url ? (
          <img
            src={profile.profile_picture_url}
            alt={fullName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full border border-slate-200/90 rounded-xl bg-slate-50 flex items-center justify-center">
            <User className="w-16 h-16 md:w-20 md:h-20 text-slate-300 stroke-[1.5]" />
          </div>
        )}
        {!isPublic && onEditPhoto && (
          <button
            onClick={onEditPhoto}
            className="absolute bottom-2.5 right-2.5 z-20 w-8 h-8 rounded-xl bg-white/95 border border-slate-200/90 text-slate-700 hover:text-slate-900 hover:bg-white flex items-center justify-center transition-all cursor-pointer shadow-none"
            title="Cambiar foto de perfil"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="w-full p-4 pt-5 lg:p-6 flex flex-col items-start md:items-center gap-4 lg:gap-5">
        <div className="text-left md:text-center flex flex-col items-start md:items-center gap-1.5 w-full">
          <h2 className="text-title-page font-bold tracking-tight text-slate-900 leading-snug text-left md:text-center font-jakarta">
            {fullName || "Tu Nombre"}
          </h2>
          {hasLocation ? (
            <p className="text-meta text-slate-500 text-left md:text-center leading-relaxed flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
              <span>{profile.city?.split(',')[0] || ""}{profile.city && profile.country ? ", " : ""}{profile.country || ""}</span>
            </p>
          ) : (
            !isPublic && onEditProfile && (
              <EmptyProfileButton
                onClick={() => onEditProfile("city")}
                label="Añadir ciudad"
                icon="add"
                className="mt-1"
              />
            )
          )}

          {isMecenas({ tier: profile.tier }) && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 mt-1 select-none">
              <Sparkles className="w-3.5 h-3.5 text-slate-700" />
              <span className="text-slate-800 font-semibold text-meta font-jakarta">
                {(() => {
                  if (!profile.member_since) return "Mecenas LUMINUS";
                  try {
                    const d = new Date(profile.member_since);
                    if (isNaN(d.getTime())) return "Mecenas LUMINUS";
                    const month = MONTH_NAMES[d.getMonth()];
                    const capMonth = month ? month.charAt(0).toUpperCase() + month.slice(1) : "";
                    return `Mecenas desde ${capMonth} ${d.getFullYear()}`;
                  } catch {
                    return "Mecenas LUMINUS";
                  }
                })()}
              </span>
            </div>
          )}
        </div>

        <div className="w-full h-px bg-slate-100" />

        <div className="w-full flex flex-col gap-3.5 px-1">
          <DetailItem 
            label="Profesión" 
            value={profile.profession} 
            icon={<Briefcase className="w-4 h-4 text-slate-400 shrink-0" />} 
            onClick={onEditProfile ? () => onEditProfile("profession") : undefined} 
            isPublic={isPublic} 
            firstName={profile.first_name} 
            highlightField={highlightField} 
          />
          <DetailItem 
            label="Cumpleaños" 
            value={formatDisplayDate(profile.birthdate)} 
            icon={<Cake className="w-4 h-4 text-slate-400 shrink-0" />} 
            isPublic={isPublic} 
            firstName={profile.first_name} 
          />
        </div>

        {(!isPublic || onSendMessage || onConnect) && (
          <>
            <div className="w-full h-px bg-slate-100" />

            <div className="w-full flex flex-col gap-2">
              {isPublic ? (
                <>
                  {onSendMessage && (
                    <Button
                      onClick={onSendMessage}
                      variant="primary"
                      fullWidth
                      className="gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Enviar Mensaje
                    </Button>
                  )}
                  {onConnect && (
                    <Button
                      onClick={onConnect}
                      variant="secondary"
                      fullWidth
                      className="gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Conectar
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {onEditProfile && (
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => {
                        window.history.replaceState(null, "", window.location.pathname);
                        onEditProfile();
                      }}
                      className={`gap-2 ${highlightField === "personal" ? "glow-highlight" : ""}`}
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar perfil
                    </Button>
                  )}

                  <Link href="/perfil-usuario/configuracion/personal" className="w-full hidden md:block">
                    <Button variant="ghost" fullWidth className="justify-start gap-2.5 text-slate-600 hover:text-slate-900">
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Ajustes de la cuenta</span>
                    </Button>
                  </Link>

                  <Link href="/perfil-usuario/configuracion/contrasena" className="w-full hidden md:block">
                    <Button variant="ghost" fullWidth className="justify-start gap-2.5 text-slate-600 hover:text-slate-900">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>Cambiar contraseña</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DetailItem({ 
  label, 
  value, 
  icon, 
  onClick, 
  isPublic = false, 
  firstName, 
  highlightField 
}: { 
  label: string; 
  value: string; 
  icon: React.ReactNode; 
  onClick?: () => void; 
  isPublic?: boolean; 
  firstName?: string; 
  highlightField?: string;
}) {
  const isEmpty = !value || value === 'No definido' || value === 'Sin fecha de nacimiento' || value.trim().length === 0;

  if (isEmpty && isPublic && label !== "Profesión") return null;

  const nameToUse = firstName ? firstName.trim() : "Este usuario";
  const isHighlighted = highlightField === "personal" && label === "Profesión";

  return (
    <div className="flex items-center gap-3.5 relative w-full">
      {icon}
      <div className="flex flex-col min-w-0 flex-1">
        {isEmpty ? (
          isPublic ? (
            <span className="text-body text-slate-400 font-normal italic tracking-tight truncate">
              {nameToUse} aún no ha agregado su profesión.
            </span>
          ) : (
            onClick && (
              <EmptyProfileButton
                onClick={() => {
                  window.history.replaceState(null, "", window.location.pathname);
                  onClick();
                }}
                label={`Añadir ${label.toLowerCase()}`}
                icon="add"
                className={isHighlighted ? "glow-highlight" : ""}
              />
            )
          )
        ) : (
          <span className={`text-body text-slate-800 font-medium truncate ${isHighlighted ? "glow-highlight px-2 py-0.5 rounded-lg border border-dashed border-slate-200 w-fit" : ""}`}>
            {value}
          </span>
        )}
      </div>
    </div>
  );
}
