"use client";

import Link from "next/link";
import { ProfileButton } from "@/components/ui/Button";
import { isMecenas } from "@/lib/membership/access";

interface ProfileMembershipCardProps {
  plan: string;
  createdAt: string;
  memberSince?: string | null;
  tier?: string;
  showSettingsButtons?: boolean;
  isPublic?: boolean;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export function ProfileMembershipCard({
  plan,
  createdAt,
  memberSince,
  tier,
  showSettingsButtons = false,
  isPublic = false,
}: ProfileMembershipCardProps) {
  const isMember = isMecenas({ tier }) || plan === "Monthly" || Boolean(memberSince);

  const getMemberSinceText = () => {
    const rawDate = memberSince || createdAt;
    if (!rawDate) return "";
    const date = new Date(rawDate);
    if (isNaN(date.getTime())) return "";
    return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  };

  const memberSinceText = getMemberSinceText();

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 flex flex-col gap-4 md:gap-5 shadow-none relative group">
      <div className="w-full flex items-start gap-4">
        <div className="mt-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMember ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"}`}>
            <span className="material-symbols-rounded text-[20px]">
              {isMember ? "verified" : "award_star"}
            </span>
          </div>
        </div>
        <div className="flex flex-col min-w-0 self-center gap-1">
          <span className="text-sm md:text-base text-slate-900 font-semibold truncate leading-relaxed">
            {isMember ? "Mecenas LUMINUS" : "Cuenta Gratis"}
          </span>

          {isMember ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/90 w-fit">
              <span className="material-symbols-rounded text-amber-600 text-[14px]">stars</span>
              <span className="text-amber-900 font-bold text-[11px] font-sans">
                Mecenas desde {memberSinceText}
              </span>
            </div>
          ) : (
            <p className="text-slate-500 text-[11px] font-medium leading-snug tracking-[-0.01em] font-sans">
              {isPublic ? "Usuario de la comunidad" : "Acceso estándar gratuito"}
            </p>
          )}
        </div>
      </div>

      {!isPublic && (
        <>
          <div className="w-full h-px bg-slate-50" />

          <Link href="/perfil-usuario/configuracion?tab=membership" className="w-full">
            <ProfileButton
              onClick={() => { }}
              icon="autorenew"
              label={isMember ? "Gestionar membresía" : "Convertirme en Mecenas (USD 5/mes)"}
              className="w-full"
            />
          </Link>

          {showSettingsButtons && (
            <div className="flex flex-col gap-2 w-full">
              <Link href="/perfil-usuario/configuracion" className="w-full">
                <ProfileButton
                  onClick={() => { }}
                  icon="settings"
                  label="Ajustes de la cuenta"
                  className="w-full"
                />
              </Link>

              <Link href="/perfil-usuario/configuracion?tab=password" className="w-full">
                <ProfileButton
                  onClick={() => { }}
                  icon="lock"
                  label="Cambiar contraseña"
                  className="w-full"
                />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
