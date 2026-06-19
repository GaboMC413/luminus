"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ProfileHeaderCover } from "@/features/user-profile/components/ProfileHeaderCover";
import { ProfileSidebar } from "@/features/user-profile/components/ProfileSidebar";
import { ProfileAboutSection } from "@/features/user-profile/components/ProfileAboutSection";
import { ProfileInterestsSection } from "@/features/user-profile/components/ProfileInterestsSection";
import { ProfileCompletionCard } from "@/features/user-profile/components/ProfileCompletionCard";
import { Modal } from "@/components/ui/Modal";
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
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
    const id = searchParams.get("id");
    if (!id || connectionLoading) return;

    try {
      setConnectionLoading(true);

      // Scenario 1: Pending Incoming Request (Shows "Recibida")
      if (profile?.connection_status === "pending" && profile?.connection_direction === "incoming") {
        // Directly accept the connection (PUT)
        const response = await fetch("/api/connections", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ recipientId: id }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "No pudimos aceptar la solicitud.");
        }

        setProfile((current: any) => ({
          ...current,
          connection_status: "accepted",
        }));
        return;
      }

      // Scenario 2: Pending Outgoing Request (Shows "Enviada" / "Solicitud enviada")
      if (profile?.connection_status === "pending" && profile?.connection_direction === "outgoing") {
        // Directly cancel/delete the connection request (DELETE)
        const response = await fetch(`/api/connections?recipientId=${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "No pudimos cancelar la solicitud.");
        }

        setProfile((current: any) => ({
          ...current,
          connection_status: null,
          connection_direction: null,
        }));
        return;
      }

      // Scenario 3: Connected (Shows "Conectado" / "Ya conectado")
      if (profile?.connection_status === "accepted") {
        // Directly disconnect/remove from network (DELETE)
        const response = await fetch(`/api/connections?recipientId=${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "No pudimos eliminar de tu red.");
        }

        setProfile((current: any) => ({
          ...current,
          connection_status: null,
          connection_direction: null,
        }));
        return;
      }

      // Scenario 4: No Connection (Shows "Agregar a mi red" / "Conectar")
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipientId: id }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "No pudimos enviar la solicitud.");
      }

      setProfile((current: any) => ({
        ...current,
        connection_status: data.connection?.status || "pending",
        connection_direction: data.connection?.direction || "outgoing",
      }));
    } catch (err: any) {
      console.error("Error managing connection:", err);
      alert(err.message || "No pudimos procesar la acción de la conexión.");
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

  const handleNativeShare = async () => {
    const fullName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
    const url = window.location.href;
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: `Perfil de ${fullName} en LUMINUS`,
          text: `Conéctate con ${fullName} en LUMINUS, una plataforma de bienestar y crecimiento personal.`,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing profile natively:", err);
      }
    }
  };

  const getConnectionButtonLabel = () => {
    if (connectionLoading) return "Enviando...";
    if (profile?.connection_status === "pending") {
      return profile?.connection_direction === "incoming" ? "Solicitud recibida" : "Solicitud enviada";
    }
    if (profile?.connection_status === "accepted") return "Ya conectado";
    return "Agregar a mi red";
  };

  const getConnectionButtonLabelMobile = () => {
    if (connectionLoading) return "Enviando...";
    if (profile?.connection_status === "pending") {
      return profile?.connection_direction === "incoming" ? "Recibida" : "Solicitado";
    }
    if (profile?.connection_status === "accepted") return "Conectado";
    return "Agregar";
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
        <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-red-100 shadow-sm flex flex-col items-center text-center gap-6">
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

  const userId = searchParams.get("id") || "";

  return (
    <div className="w-full flex flex-col relative bg-slate-50">

      <ProfileHeaderCover
        coverUrl={profile.cover_url}
        isPublic={true}
      />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 pb-6 md:pb-12">
        <div className="w-full max-w-6xl mx-auto">
          <div className="w-full h-full bg-transparent pt-4 lg:pt-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-4 lg:gap-8 items-start">

              {/* LEFT COLUMN */}
              <div className="md:col-span-4 flex flex-col gap-4 lg:gap-6 mt-0 md:-mt-[136px] lg:-mt-[224px]">
                <ProfileSidebar
                  profile={profile}
                  coverUrl={profile.cover_url}
                  isPublic={true}
                />
              </div>

              {/* RIGHT COLUMN */}
              <div className="md:col-span-8 flex flex-col gap-4 lg:gap-6">
                {/* Action Buttons */}
                {/* Desktop view action buttons */}
                <div className="hidden sm:flex flex-row gap-3 w-full">
                  <Button
                    onClick={handleSendMessage}
                    variant="primary"
                    className="flex-1 flex items-center justify-center gap-2 font-bold animate-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                    Enviar mensaje
                  </Button>
                  <Button
                    onClick={handleConnect}
                    variant="outline"
                    disabled={connectionLoading}
                    className="flex-1 flex items-center justify-center gap-2 font-bold animate-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    {getConnectionButtonLabel()}
                  </Button>
                  <Button
                    onClick={handleShareProfile}
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2 font-bold animate-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">share</span>
                    Compartir perfil
                  </Button>
                </div>

                {/* Mobile view action buttons (3 in a row, matching the size and colors of desktop buttons) */}
                <div className="flex sm:hidden flex-row gap-2 w-full items-center">
                  <Button
                    onClick={handleSendMessage}
                    variant="primary"
                    className="flex-1 flex items-center justify-center gap-1.5 font-bold text-[13px] h-11 rounded-xl animate-none px-3"
                  >
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                    <span className="truncate">Mensaje</span>
                  </Button>
                  <Button
                    onClick={handleConnect}
                    variant="outline"
                    disabled={connectionLoading}
                    className="flex-[1.2] flex items-center justify-center gap-1.5 font-bold text-[13px] h-11 rounded-xl animate-none px-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {profile?.connection_status === "accepted" ? "group" : "person_add"}
                    </span>
                    <span className="truncate">{getConnectionButtonLabelMobile()}</span>
                  </Button>
                  <button
                    onClick={handleShareProfile}
                    className="w-11 h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 rounded-xl transition-all duration-300 outline-none active:scale-95 cursor-pointer shadow-none font-jakarta"
                  >
                    <span className="material-symbols-outlined text-[20px]">share</span>
                  </button>
                </div>

                <ProfileAboutSection
                  bio={profile.bio}
                  isPublic={true}
                  firstName={profile.first_name}
                />

                <ProfileInterestsSection
                  interests={profile.interests}
                  otherInterests={profile.other_interests}
                  isPublic={true}
                  firstName={profile.first_name}
                />

                <ProfileCompletionCard
                  prompts={profile.prompts}
                  isPublic={true}
                  firstName={profile.first_name}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Compartir perfil"
        maxWidth="440px"
      >
        <div className="flex flex-col gap-6">
          {/* User profile preview */}
          <div className="flex items-center gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <img
              src={profile.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.first_name || "Usuario")}&background=e2e8f0&color=0f172a`}
              alt={profile.first_name}
              className="w-12 h-12 rounded-[10px] object-cover shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-900 truncate">
                {`${profile.first_name || ""} ${profile.last_name || ""}`.trim()}
              </span>
              <span className="text-xs text-slate-400 font-medium truncate mt-0.5">
                {profile.profession || "Miembro de LUMINUS"}
              </span>
            </div>
          </div>

          {/* Copy link section */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Enlace del perfil
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold border-none cursor-pointer transition-all duration-300 ${
                  copied
                    ? "bg-[#22C55E] text-white"
                    : "bg-black text-white hover:bg-zinc-800"
                }`}
              >
                {copied ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
          </div>

          {/* Social share shortcuts */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Compartir en redes
            </label>
            <div className="grid grid-cols-4 gap-2">
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Mira el perfil de ${profile.first_name} en LUMINUS: ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors text-decoration-none text-slate-600 hover:text-black font-semibold font-jakarta"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366]">
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.993L2 22l5.13-1.343a9.96 9.96 0 004.881 1.277h.005c5.505 0 9.989-4.478 9.99-9.985A9.98 9.98 0 0012.012 2zm5.72 14.175c-.253.71-1.464 1.385-2.018 1.442-.5.051-1.154.081-1.85-.14a11.19 11.19 0 01-4.787-2.99 12.35 12.35 0 01-2.484-3.834c-.407-.7-.037-1.08.312-1.432.148-.149.329-.364.493-.547.164-.183.218-.305.328-.508.11-.203.055-.386-.027-.569-.083-.183-.739-1.782-1.013-2.44-.267-.638-.539-.551-.739-.561l-.63-.012c-.554 0-1.455.207-1.996.8-.54.593-2.062 2.013-2.062 4.91 0 2.897 2.106 5.698 2.4 6.096.295.398 4.143 6.326 10.04 8.874 1.403.606 2.499.968 3.354 1.24 1.41.448 2.693.385 3.707.234 1.13-.17 2.484-.712 2.83-1.4.346-.688.346-1.28.243-1.4-.103-.12-.38-.203-.797-.406z"/>
                </svg>
                <span className="text-[10px] font-semibold text-slate-500 mt-1">WhatsApp</span>
              </a>

              {/* X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(`Mira el perfil de ${profile.first_name} en LUMINUS:`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors text-decoration-none text-slate-600 hover:text-black font-semibold font-jakarta"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-[10px] font-semibold text-slate-500 mt-1.5">Twitter / X</span>
              </a>

              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors text-decoration-none text-slate-600 hover:text-black font-semibold font-jakarta"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#0077B5]">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span className="text-[10px] font-semibold text-slate-500 mt-1.5">LinkedIn</span>
              </a>

              {/* Email */}
              <a
                href={`mailto:?subject=${encodeURIComponent(`Perfil de ${profile.first_name} en LUMINUS`)}&body=${encodeURIComponent(`Hola, te comparto el perfil de ${profile.first_name} en LUMINUS: ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors text-decoration-none text-slate-600 hover:text-black font-semibold font-jakarta"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span className="text-[10px] font-semibold text-slate-500 mt-1">Email</span>
              </a>
            </div>
          </div>

          {/* Native sharing fallbacks */}
          {typeof navigator !== "undefined" && !!(navigator as any).share && (
            <button
              onClick={handleNativeShare}
              className="w-full h-11 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer outline-none active:scale-95"
            >
              <span className="material-symbols-rounded text-[18px]">share</span>
              Más opciones de compartir
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}
