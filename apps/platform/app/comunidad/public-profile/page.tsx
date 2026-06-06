"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ProfileHeaderCover } from "@/features/user-profile/components/ProfileHeaderCover";
import { ProfileSidebar } from "@/features/user-profile/components/ProfileSidebar";
import { ProfileAboutSection } from "@/features/user-profile/components/ProfileAboutSection";
import { ProfileInterestsSection } from "@/features/user-profile/components/ProfileInterestsSection";
import { ProfileCompletionCard } from "@/features/user-profile/components/ProfileCompletionCard";

export default function PublicProfilePage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-float">
          <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[24px] opacity-80 invert brightness-0" />
          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold animate-pulse-slow">Cargando perfil público...</p>
        </div>
      </div>
    }>
      <PublicProfileContent />
    </Suspense>
  );
}

function PublicProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) {
      setError("Falta el ID del usuario.");
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/comunidad/profile?id=${id}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Error del servidor: ${res.status}`);
        }
        const data = await res.json();
        setProfile(data.profile);
      } catch (err: any) {
        console.error("Error al cargar el perfil público:", err);
        setError(err.message || "Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [searchParams]);

  const handleSendMessage = () => {
    const id = searchParams.get("id");
    router.push(`/mensajes?id=${id || "1"}`);
  };

  const handleConnect = () => {
    const fullName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
    alert(`¡Solicitud de conexión enviada a ${fullName || "este usuario"}!`);
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-float">
          <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[24px] opacity-80 invert brightness-0" />
          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold animate-pulse-slow">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-red-100 shadow-sm flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
            <span className="material-symbols-outlined text-[32px]">error</span>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-[20px] font-bold text-slate-900 font-jakarta">Error al cargar perfil</h2>
            <p className="text-[14px] text-slate-500">{error || "No se pudo encontrar el usuario especificado."}</p>
          </div>
          <button
            onClick={() => router.push("/comunidad")}
            className="h-11 px-6 bg-black text-white rounded-xl text-[14px] font-bold hover:bg-zinc-800 transition duration-200"
          >
            Volver a la Comunidad
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col relative bg-slate-50 min-h-screen">

      <ProfileHeaderCover
        coverUrl={profile.cover_url}
        isPublic={true}
      />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 pb-12">
        <div className="w-full max-w-6xl mx-auto">
          <div className="w-full h-full bg-transparent pt-2 lg:pt-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 lg:gap-8 items-start">

              {/* LEFT COLUMN */}
              <div className="md:col-span-4 flex flex-col gap-2 lg:gap-6 mt-2 md:-mt-[136px] lg:-mt-[224px]">
                <ProfileSidebar
                  profile={profile}
                  coverUrl={profile.cover_url}
                  isPublic={true}
                />
              </div>

              {/* RIGHT COLUMN */}
              <div className="md:col-span-8 flex flex-col gap-2 lg:gap-6">
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    onClick={handleSendMessage}
                    variant="primary"
                    className="flex-1 flex items-center justify-center gap-2 font-bold"
                  >
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                    Enviar Mensaje
                  </Button>
                  <Button
                    onClick={handleConnect}
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2 font-bold"
                  >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Agregar a mi red
                  </Button>
                  <Button
                    onClick={handleConnect}
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2 font-bold"
                  >
                    <span className="material-symbols-outlined text-[20px]">share</span>
                    Compartir perfil
                  </Button>
                </div>

                <ProfileAboutSection
                  bio={profile.bio}
                  isPublic={true}
                />

                <ProfileInterestsSection
                  interests={profile.interests}
                  otherInterests={profile.other_interests}
                  isPublic={true}
                />

                <ProfileCompletionCard
                  prompts={profile.prompts}
                  isPublic={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
