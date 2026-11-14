"use client";

import Link from "next/link";
import { Sparkles, Award, RefreshCw, Settings, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProfileSectionCard } from "@/components/ui/ProfileSectionCard";
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
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function ProfileMembershipCard({
  createdAt,
  memberSince,
  tier,
  showSettingsButtons = false,
  isPublic = false,
}: ProfileMembershipCardProps) {
  const isMember = isMecenas({ tier });

  const getMemberSinceText = () => {
    const rawDate = memberSince || createdAt;
    if (!rawDate) return "";
    const date = new Date(rawDate);
    if (isNaN(date.getTime())) return "";
    return `${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
  };

  const memberSinceText = getMemberSinceText();

  return (
    <ProfileSectionCard isPublic={isPublic} isEmpty={false}>
      <div className="w-full flex items-center gap-3.5">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isMember ? "bg-amber-50 text-amber-600 border border-amber-200/80" : "bg-slate-100 text-slate-500"
          }`}
        >
          {isMember ? <Sparkles className="w-4 h-4" /> : <Award className="w-4 h-4" />}
        </div>

        <div className="flex flex-col min-w-0 gap-0.5">
          <h3 className="text-title-section text-slate-900 font-bold truncate">
            {isMember ? "Mecenas LUMINUS" : "Cuenta Gratis"}
          </h3>

          {isMember ? (
            <p className="text-meta text-amber-700 font-semibold">
              Mecenas desde {memberSinceText}
            </p>
          ) : (
            <p className="text-meta text-slate-500">
              {isPublic ? "Usuario de la comunidad" : "Acceso estándar gratuito"}
            </p>
          )}
        </div>
      </div>

      {!isPublic && (
        <>
          <div className="w-full h-px bg-slate-100" />

          <div className="flex flex-col gap-2 w-full">
            <Link href="/perfil-usuario/configuracion/membresia" className="w-full no-underline">
              <Button variant="soft" size="sm" fullWidth className="justify-start gap-2">
                <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {isMember ? "Gestionar membresía" : "Convertirme en Mecenas (USD 5/mes)"}
                </span>
              </Button>
            </Link>

            {showSettingsButtons && (
              <>
                <Link href="/perfil-usuario/configuracion" className="w-full no-underline">
                  <Button variant="soft" size="sm" fullWidth className="justify-start gap-2">
                    <Settings className="w-3.5 h-3.5 shrink-0" />
                    <span>Ajustes de la cuenta</span>
                  </Button>
                </Link>

                <Link href="/perfil-usuario/configuracion/contrasena" className="w-full no-underline">
                  <Button variant="soft" size="sm" fullWidth className="justify-start gap-2">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Cambiar contraseña</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </>
      )}
    </ProfileSectionCard>
  );
}
