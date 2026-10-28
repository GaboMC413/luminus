"use client";

import Link from "next/link";
import { ProfileButton } from "@/components/ui/Button";

interface ProfileMembershipCardProps {
  plan: string;
  createdAt: string;
  showSettingsButtons?: boolean;
  isPublic?: boolean;
}

export function ProfileMembershipCard({ plan, createdAt, showSettingsButtons = false, isPublic = false }: ProfileMembershipCardProps) {
  const getTrialEndDate = (dateStr: string) => {
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setMonth(date.getMonth() + 3);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  };

  const trialEndDate = getTrialEndDate(createdAt);

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 flex flex-col gap-4 md:gap-5 shadow-none relative group">
      <div className="w-full flex items-start gap-4">
        <div className="mt-1">
          <span className="material-symbols-rounded text-slate-400 text-[20px]">award_star</span>
        </div>
        <div className="flex flex-col min-w-0 self-center">
          <span className="text-sm md:text-base text-slate-900 font-semibold truncate leading-relaxed">Membresía {plan || 'Free'}</span>
          <p className="text-green-600 text-[11px] font-medium leading-snug tracking-[-0.01em] font-sans mt-0.5 select-none">
            {isPublic ? "Miembro activo de la comunidad" : `Acceso total hasta el ${trialEndDate}`}
          </p>
        </div>
      </div>

      {!isPublic && (
        <>
          <div className="w-full h-px bg-slate-50" />

          <Link href="/perfil-usuario/configuracion?tab=membership" className="w-full">
            <ProfileButton
              onClick={() => { }}
              icon="autorenew"
              label="Gestionar membresía"
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
