"use client";

import Link from "next/link";
import { ProfileButton, EmptyProfileButton } from "@/components/ui/Button";
import { Profile } from "./ProfileContent";

interface ProfileSidebarProps {
  profile: Profile;
  onEditPhoto: () => void;
  onEditProfile: (field?: string) => void;
  onSignOut: () => void;
  onShowCoverModal: () => void;
  coverUrl: string;
}

export function ProfileSidebar({
  profile,
  onEditPhoto,
  onEditProfile,
  onShowCoverModal,
  coverUrl
}: ProfileSidebarProps) {

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'No definido' || dateStr === 'Sin fecha de nacimiento') return 'Sin fecha de nacimiento';
    if (dateStr.includes('/')) return dateStr;
    const parts = dateStr.split('-');
    const formatted = parts.length === 3 ? `${parts[2]} / ${parts[1]} / ${parts[0]}` : dateStr;

    const birthDate = new Date(dateStr);
    if (isNaN(birthDate.getTime())) return formatted;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return `${formatted} (${age} años)`;
  };

  const getGenderIcon = (gender: string) => {
    if (gender === 'Masculino' || gender === 'Hombre') return 'male';
    if (gender === 'Femenino' || gender === 'Mujer') return 'female';
    return 'wc';
  };

  const hasLocation = profile.city || profile.country;
  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();

  return (
    <div className="bg-white rounded-[24px] border border-slate-200 flex flex-col items-start md:items-center shadow-none overflow-hidden relative group">
      {/* Local Cover - Mobile Only */}
      <div className={`md:hidden w-full h-[130px] md:h-[160px] relative shrink-0 ${!coverUrl || coverUrl.includes("empty") ? 'luminus-gradient' : ''}`}>
        {coverUrl && !coverUrl.includes("empty") && (
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
        )}
        <ProfileButton
          onClick={onShowCoverModal}
          icon="photo_camera"
          className="absolute bottom-3 right-3 z-10"
        />
      </div>

      <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-[16px] overflow-hidden -mt-[96px] md:mt-6 ml-4 md:ml-0 relative shrink-0 group border-4 border-white bg-white">
        {profile.profile_picture_url ? (
          <img
            src={profile.profile_picture_url}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full border border-zinc-200 rounded-[12px] bg-slate-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-zinc-200 select-none flex items-center justify-center text-[72px] md:text-[88px] lg:text-[104px]" style={{ width: '100%', height: '100%' }}>
              person
            </span>
          </div>
        )}
        <ProfileButton
          onClick={onEditPhoto}
          icon="photo_camera"
          className="absolute bottom-3 right-3 z-20"
        />
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
            <EmptyProfileButton
              onClick={() => onEditProfile("city")}
              label="Añadir ciudad"
              icon="add"
              className="mt-1"
            />
          )}
        </div>

        <div className="w-full h-px bg-slate-100" />

        <div className="w-full flex flex-col gap-4 lg:gap-6 px-1">
          <DetailItem label="Profesión" value={profile.profession} icon="work" onClick={() => onEditProfile("profession")} />
          <DetailItem label="Nacimiento" value={formatDisplayDate(profile.birthdate)} icon="cake" onClick={() => onEditProfile("birthdate")} />
          <DetailItem label="Género" value={profile.gender} icon={getGenderIcon(profile.gender)} onClick={() => onEditProfile("gender")} />
        </div>

        <div className="w-full h-px bg-slate-50" />

        <div className="w-full flex flex-col gap-2">
          <ProfileButton
            onClick={() => onEditProfile()}
            icon="edit"
            label="Editar perfil"
            className="w-full"
          />

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
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon, onClick }: { label: string; value: string; icon: string; onClick?: () => void }) {
  const isEmpty = !value || value === 'No definido' || value === 'Sin fecha de nacimiento';

  return (
    <div className="flex items-center gap-4 relative">
      <span className="material-symbols-rounded text-slate-400 text-[20px] shrink-0">
        {icon}
      </span>
      <div className="flex flex-col min-w-0 flex-1">
        {isEmpty ? (
          <EmptyProfileButton
            onClick={onClick}
            label={`Añadir ${label.toLowerCase()}`}
            icon="add"
          />
        ) : (
          <span className="text-sm lg:text-base text-primary truncate leading-relaxed">{value}</span>
        )}
      </div>
    </div>
  );
}
