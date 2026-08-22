"use client";

import Link from "next/link";
import { ProfileButton, EmptyProfileButton } from "@/components/ui/Button";
import { Profile } from "./ProfileContent";

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

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
  };

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

  const getGenderIcon = (gender: string) => {
    if (gender === 'Masculino' || gender === 'Hombre') return 'male';
    if (gender === 'Femenino' || gender === 'Mujer') return 'female';
    return 'wc';
  };

  const hasLocation = profile.city || profile.country;
  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-start md:items-center shadow-none overflow-hidden relative group">
      {/* Local Cover - Mobile Only */}
      <div className={`md:hidden w-full h-[130px] md:h-[160px] relative shrink-0 ${!coverUrl || coverUrl.includes("empty") ? 'luminus-light-gradient border-b border-slate-200' : ''}`}>
        {coverUrl && !coverUrl.includes("empty") && (
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
        )}
        {!isPublic && onShowCoverModal && (
          <ProfileButton
            onClick={() => {
              window.history.replaceState(null, "", window.location.pathname);
              onShowCoverModal();
            }}
            icon="photo_camera"
            className={`absolute bottom-3 right-3 z-10 ${highlightField === "cover" ? "glow-highlight" : ""} ${coverUrl && !coverUrl.includes("empty") ? "opacity-50 hover:opacity-100 transition-opacity" : ""}`}
          />
        )}
      </div>

      <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-[26px] md:rounded-[32px] lg:rounded-[38px] overflow-hidden -mt-[96px] md:mt-6 ml-4 md:ml-0 relative shrink-0 group border-4 border-white bg-white">
        {profile.profile_picture_url ? (
          <img
            src={profile.profile_picture_url}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full border border-slate-200 rounded-[26px] md:rounded-[32px] lg:rounded-[38px] bg-slate-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-zinc-200 select-none flex items-center justify-center text-[72px] md:text-[88px] lg:text-[104px]" style={{ width: '100%', height: '100%' }}>
              person
            </span>
          </div>
        )}
        {!isPublic && onEditPhoto && (
          <ProfileButton
            onClick={onEditPhoto}
            icon="photo_camera"
            className={`absolute bottom-3 right-3 z-20 ${profile.profile_picture_url ? "opacity-50 hover:opacity-100 transition-opacity" : ""}`}
          />
        )}
      </div>

      <div className="w-full p-4 pt-5 lg:p-5 lg:pt-6 flex flex-col items-start md:items-center gap-4 lg:gap-6">
        <div className="text-left md:text-center flex flex-col items-start md:items-center gap-1 lg:gap-1.5 w-full">
          <h2 className="text-xl lg:text-3xl font-bold tracking-tight text-slate-900 leading-snug text-left md:text-center font-jakarta">
            {fullName || "Tu Nombre"}
          </h2>
          {hasLocation ? (
            <p className="text-sm lg:text-base font-medium text-slate-400 text-left md:text-center leading-relaxed">
              {profile.city?.split(',')[0] || ""}{profile.city && profile.country ? ", " : ""}{profile.country || ""}
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
        </div>

        <div className="w-full h-px bg-slate-100" />

        <div className="w-full flex flex-col gap-4 lg:gap-6 px-1">
          <DetailItem label="Profesión" value={profile.profession} icon="work" onClick={onEditProfile ? () => onEditProfile("profession") : undefined} isPublic={isPublic} firstName={profile.first_name} highlightField={highlightField} />
          <DetailItem label="Cumpleaños" value={formatDisplayDate(profile.birthdate)} icon="cake" isPublic={isPublic} firstName={profile.first_name} />
        </div>

        {(!isPublic || onSendMessage || onConnect) && (
          <>
            <div className="w-full h-px bg-slate-50" />

            <div className="w-full flex flex-col gap-2">
              {isPublic ? (
                <>
                  {onSendMessage && (
                    <button
                      onClick={onSendMessage}
                      className="w-full py-3.5 bg-black text-white rounded-xl text-[14px] font-bold hover:bg-zinc-800 transition flex items-center justify-center gap-2 border-none cursor-pointer font-jakarta"
                    >
                      <span className="material-symbols-outlined text-[20px]">mail</span>
                      Enviar Mensaje
                    </button>
                  )}
                  {onConnect && (
                    <button
                      onClick={onConnect}
                      className="w-full py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[14px] font-bold hover:bg-slate-50 hover:text-black hover:border-slate-300 transition flex items-center justify-center gap-2 cursor-pointer font-jakarta"
                    >
                      <span className="material-symbols-outlined text-[20px]">person_add</span>
                      Conectar
                    </button>
                  )}
                </>
              ) : (
                <>
                  {onEditProfile && (
                    <ProfileButton
                      onClick={() => {
                        window.history.replaceState(null, "", window.location.pathname);
                        onEditProfile();
                      }}
                      icon="edit"
                      label="Editar perfil"
                      className={`w-full ${highlightField === "personal" ? "glow-highlight" : ""}`}
                    />
                  )}

                  <Link href="/perfil-usuario/configuracion" className="w-full hidden md:block">
                    <ProfileButton
                      onClick={() => { }}
                      icon="settings"
                      label="Ajustes de la cuenta"
                      className="w-full"
                    />
                  </Link>

                  <Link href="/perfil-usuario/configuracion?tab=password" className="w-full hidden md:block">
                    <ProfileButton
                      onClick={() => { }}
                      icon="lock"
                      label="Cambiar contraseña"
                      className="w-full"
                    />
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

function DetailItem({ label, value, icon, onClick, isPublic = false, firstName, highlightField }: { label: string; value: string; icon: string; onClick?: () => void; isPublic?: boolean; firstName?: string; highlightField?: string }) {
  const isEmpty = !value || value === 'No definido' || value === 'Sin fecha de nacimiento' || value.trim().length === 0;

  if (isEmpty && isPublic && label !== "Profesión") return null;

  const nameToUse = firstName ? firstName.trim() : "Este usuario";

  const isHighlighted = highlightField === "personal" && label === "Profesión";

  return (
    <div className="flex items-center gap-4 relative w-full">
      <span className="material-symbols-rounded text-slate-400 text-[20px] shrink-0">
        {icon}
      </span>
      <div className="flex flex-col min-w-0 flex-1">
        {isEmpty ? (
          isPublic ? (
            <span className="text-sm lg:text-base text-slate-400 font-medium italic tracking-tight truncate leading-relaxed">
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
          <span className={`text-sm lg:text-base truncate leading-relaxed ${isHighlighted ? "glow-highlight px-2 py-0.5 rounded-lg border border-dashed border-slate-200 w-fit" : "text-primary"}`}>{value}</span>
        )}
      </div>
    </div>
  );
}
