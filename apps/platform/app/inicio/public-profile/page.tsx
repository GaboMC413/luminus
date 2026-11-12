"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Lock, 
  UserX, 
  ArrowLeft, 
  Check, 
  Copy,
  Info,
  Ban,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProfileHeroHeader } from "@/features/user-profile/components/ProfileHeroHeader";
import { ProfileAboutSection } from "@/features/user-profile/components/ProfileAboutSection";
import { ProfileInterestsSection } from "@/features/user-profile/components/ProfileInterestsSection";
import { ProfileCompletionCard } from "@/features/user-profile/components/ProfileCompletionCard";
import { SpecialistProfileView } from "@/features/user-profile/components/SpecialistProfileView";
import { Modal } from "@/components/ui/Modal";
import { ProfileSkeleton } from "@/components/ui/Skeleton";

export default function PublicProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <PublicProfileContent />
    </Suspense>
  );
}

function PublicProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const connectionDropdownRefDesktop = useRef<HTMLDivElement>(null);
  const connectionDropdownRefMobile = useRef<HTMLDivElement>(null);
  const [isConnectionDropdownOpen, setIsConnectionDropdownOpen] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConfirmBlockOpen, setIsConfirmBlockOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const clickedDesktop = connectionDropdownRefDesktop.current && connectionDropdownRefDesktop.current.contains(event.target as Node);
      const clickedMobile = connectionDropdownRefMobile.current && connectionDropdownRefMobile.current.contains(event.target as Node);
      if (!clickedDesktop && !clickedMobile) {
        setIsConnectionDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          if (res.status === 403) {
            setError("restricted");
            setLoading(false);
            return;
          }
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

  const userId = searchParams.get("id") || profile?.id || "";

  const handleSendMessage = () => {
    const event = new CustomEvent("luminus_open_chat", {
      detail: {
        userId,
        name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
        avatar: profile.profile_picture_url
      }
    });
    window.dispatchEvent(event);
  };

  const handleConnect = async () => {
    setIsConnectionDropdownOpen(false);
    const id = searchParams.get("id");
    if (!id || connectionLoading) return;

    const previousProfile = profile ? { ...profile } : null;

    try {
      setConnectionLoading(true);

      // Scenario 0: Blocked connection -> unblock
      if (profile?.connection_status === "blocked") {
        setProfile((current: any) => ({
          ...current,
          connection_status: null,
          connection_direction: null,
        }));

        const response = await fetch("/api/connections", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ recipientId: id, action: "unblock" }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (previousProfile) setProfile(previousProfile);
          throw new Error(data.message || "No pudimos desbloquear al usuario.");
        }
        return;
      }

      // Scenario 1: Already in network -> remove (Optimistic UI)
      if (profile?.connection_status === "accepted") {
        setProfile((current: any) => ({
          ...current,
          connection_status: null,
          connection_direction: null,
          is_in_network: false,
          is_mutual: false,
        }));

        const response = await fetch(`/api/connections?recipientId=${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (previousProfile) setProfile(previousProfile);
          throw new Error(data.message || "No pudimos eliminar de tu red.");
        }
        return;
      }

      // Scenario 2: Add to network (instant 1-way) - Optimistic UI
      setProfile((current: any) => ({
        ...current,
        connection_status: "accepted",
        connection_direction: "outgoing",
        is_in_network: true,
        is_mutual: Boolean(current?.has_in_network),
      }));

      const response = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipientId: id }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (previousProfile) setProfile(previousProfile);
        throw new Error(data.message || "No pudimos sumar a tu red.");
      }
    } catch (err: any) {
      console.error("Error managing connection:", err);
      setConnectionError(err.message || "No pudimos procesar la acción.");
    } finally {
      setConnectionLoading(false);
    }
  };


  const handleRemoveConnection = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsConnectionDropdownOpen(false);
    const id = searchParams.get("id");
    if (!id || connectionLoading) return;

    const previousProfile = profile ? { ...profile } : null;

    try {
      setConnectionLoading(true);

      // Optimistic update
      setProfile((current: any) => ({
        ...current,
        connection_status: null,
        connection_direction: null,
        is_in_network: false,
        is_mutual: false,
      }));

      const response = await fetch(`/api/connections?recipientId=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (previousProfile) setProfile(previousProfile);
        throw new Error(data.message || "No pudimos eliminar de tu red.");
      }
    } catch (err: any) {
      console.error("Error removing connection:", err);
      setConnectionError(err.message || "No pudimos eliminar de tu red.");
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleBlockConnection = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsConnectionDropdownOpen(false);
    setIsConfirmBlockOpen(true);
  };

  const executeBlockConnection = async () => {
    setIsConfirmBlockOpen(false);
    const id = searchParams.get("id");
    if (!id || connectionLoading) return;

    try {
      setConnectionLoading(true);
      const response = await fetch("/api/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipientId: id, action: "block" }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "No pudimos bloquear al usuario.");
      }

      setProfile((current: any) => ({
        ...current,
        connection_status: "blocked",
        connection_direction: null,
      }));
    } catch (err: any) {
      console.error("Error blocking connection:", err);
      setConnectionError(err.message || "No pudimos bloquear al usuario.");
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleShareProfile = () => {
    setIsShareOpen(true);
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const fromParam = searchParams.get("from");
  const isOwn = Boolean(profile?.is_own_profile);

  const getBackInfo = () => {
    switch (fromParam) {
      case "especialistas":
        return { label: "Volver a Especialistas", fallback: "/especialistas" };
      case "miembros":
        return { label: "Volver a Miembros", fallback: "/inicio/miembros" };
      case "red":
        return { label: "Volver a Mi red", fallback: "/red" };
      case "inicio":
        return { label: "Volver a Inicio", fallback: "/inicio" };
      default:
        return { label: "Volver", fallback: "/inicio" };
    }
  };

  const backInfo = getBackInfo();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push(backInfo.fallback);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    const isRestricted = error === "restricted";

    return (
      <div className="w-full flex flex-col relative bg-slate-50 min-h-screen font-sans">
        <div className="w-full flex-1 min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-slate-200/90 shadow-none flex flex-col items-center text-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
              {isRestricted ? <Lock className="w-6 h-6" /> : <UserX className="w-6 h-6" />}
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-title-page font-bold tracking-tight text-slate-900 font-jakarta">
                Perfil no disponible
              </h2>
              <p className="text-body text-slate-500 font-sans leading-relaxed">
                {isRestricted 
                  ? "Este perfil no está disponible." 
                  : "Este perfil ya no está disponible o la cuenta ha sido eliminada."}
              </p>
            </div>
            <Button
              onClick={handleGoBack}
              variant="primary"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{backInfo.label}</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col relative bg-slate-50 min-h-screen font-sans">
      {profile.specialistProfile ? (
        <SpecialistProfileView
          profile={profile}
          isPublic={true}
          onConnect={handleConnect}
          onRemoveConnection={handleRemoveConnection}
          onBlockConnection={handleBlockConnection}
          connectionLoading={connectionLoading}
          isConnectionDropdownOpen={isConnectionDropdownOpen}
          setIsConnectionDropdownOpen={setIsConnectionDropdownOpen}
          connectionDropdownRefDesktop={connectionDropdownRefDesktop}
          connectionDropdownRefMobile={connectionDropdownRefMobile}
          onSendMessage={handleSendMessage}
          onShareProfile={handleShareProfile}
          onEditProfile={isOwn ? () => router.push("/perfil-usuario") : undefined}
        />
      ) : (
        <div className="w-full flex flex-col font-sans">
          {/* 1. Master Profile Hero Header (100% Wide Flush Cover) */}
          <ProfileHeroHeader
            profile={profile}
            isSpecialist={false}
            isOwnProfile={isOwn}
            onEditProfile={isOwn ? () => router.push("/perfil-usuario") : undefined}
            onConnect={handleConnect}
            onRemoveConnection={handleRemoveConnection}
            onBlockConnection={handleBlockConnection}
            connectionLoading={connectionLoading}
            isConnectionDropdownOpen={isConnectionDropdownOpen}
            setIsConnectionDropdownOpen={setIsConnectionDropdownOpen}
            connectionDropdownRefDesktop={connectionDropdownRefDesktop}
            connectionDropdownRefMobile={connectionDropdownRefMobile}
            onSendMessage={handleSendMessage}
            onShareProfile={handleShareProfile}
          />

          {/* 2. Balanced 8:4 Grid Content for Member */}
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 mt-5 lg:mt-6 items-start">
              {/* MAIN COLUMN (lg:col-span-8) */}
              <div className="lg:col-span-8 flex flex-col gap-5">
                <ProfileAboutSection
                  bio={profile.bio}
                  isPublic={true}
                  firstName={profile.first_name}
                />

                <ProfileCompletionCard
                  prompts={profile.prompts}
                  isPublic={true}
                  firstName={profile.first_name}
                />
              </div>

              {/* SIDEBAR COLUMN (lg:col-span-4) */}
              <div className="lg:col-span-4 flex flex-col gap-5">
                <ProfileInterestsSection
                  interests={profile.interests}
                  otherInterests={profile.other_interests}
                  isPublic={true}
                  firstName={profile.first_name}
                />

                {/* Community Member Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col gap-3 shadow-none">
                  <h4 className="text-title-section text-slate-900 font-bold">
                    Comunidad LUMINUS
                  </h4>
                  <p className="text-body text-slate-600 text-xs sm:text-sm leading-relaxed font-sans">
                    {profile.first_name || "Este usuario"} participa activamente en los espacios de crecimiento y bienestar de la comunidad.
                  </p>
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-meta text-slate-500">
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    <span>Conectando personas con el bienestar.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <Modal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Compartir perfil"
        maxWidth="420px"
      >
        <div className="flex flex-col gap-4 font-sans pt-1">
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={typeof window !== "undefined" ? window.location.href : ""}
              className="flex-1 h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs text-slate-600 outline-none select-all font-sans"
            />
            <Button
              onClick={handleCopyLink}
              variant={copied ? "primary" : "secondary"}
              className="gap-1.5 text-xs shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copiado" : "Copiar"}</span>
            </Button>
          </div>

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Mira el perfil de ${profile?.first_name || ""} en LUMINUS: ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 font-semibold text-xs font-jakarta transition-colors no-underline"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366] shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>Compartir por WhatsApp</span>
          </a>

          <Button
            onClick={() => setIsShareOpen(false)}
            variant="secondary"
            fullWidth
          >
            Cerrar
          </Button>
        </div>
      </Modal>

      {/* Connection notification modal */}
      <Modal
        isOpen={!!connectionError}
        onClose={() => setConnectionError(null)}
        title="Acción de conexión"
        maxWidth="400px"
      >
        <div className="flex flex-col gap-4 text-center p-2 font-sans">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mx-auto">
            <Info className="w-6 h-6" />
          </div>
          <p className="text-body text-slate-600 font-sans leading-relaxed">
            {connectionError}
          </p>
          <Button
            onClick={() => setConnectionError(null)}
            variant="primary"
            fullWidth
          >
            Entendido
          </Button>
        </div>
      </Modal>

      {/* Block confirmation modal */}
      <Modal
        isOpen={isConfirmBlockOpen}
        onClose={() => setIsConfirmBlockOpen(false)}
        title="Bloquear usuario"
        maxWidth="400px"
      >
        <div className="flex flex-col gap-4 text-center p-2 font-sans">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mx-auto">
            <Ban className="w-6 h-6" />
          </div>
          <p className="text-body text-slate-600 leading-relaxed font-sans">
            ¿Estás seguro de que quieres bloquear a este usuario? No podrán interactuar ni enviarse solicitudes.
          </p>
          <div className="flex gap-2.5 mt-2">
            <Button
              onClick={() => setIsConfirmBlockOpen(false)}
              variant="secondary"
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              onClick={executeBlockConnection}
              variant="destructive"
              fullWidth
            >
              Bloquear
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
