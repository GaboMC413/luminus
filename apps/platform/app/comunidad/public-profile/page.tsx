"use client";

import { Suspense, useEffect, useState, useRef } from "react";
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
  const connectionDropdownRefDesktop = useRef<HTMLDivElement>(null);
  const connectionDropdownRefMobile = useRef<HTMLDivElement>(null);
  const [isConnectionDropdownOpen, setIsConnectionDropdownOpen] = useState(false);

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
    setIsConnectionDropdownOpen(false);
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

  const handleDeclineConnect = async () => {
    const id = searchParams.get("id");
    if (!id || connectionLoading) return;

    try {
      setConnectionLoading(true);
      const response = await fetch(`/api/connections?recipientId=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "No pudimos rechazar la solicitud.");
      }

      setProfile((current: any) => ({
        ...current,
        connection_status: null,
        connection_direction: null,
      }));
    } catch (err: any) {
      console.error("Error declining connection:", err);
      alert(err.message || "No pudimos rechazar la solicitud.");
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleRemoveConnection = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsConnectionDropdownOpen(false);
    const id = searchParams.get("id");
    if (!id || connectionLoading) return;

    try {
      setConnectionLoading(true);
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
    } catch (err: any) {
      console.error("Error removing connection:", err);
      alert(err.message || "No pudimos eliminar de tu red.");
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleBlockConnection = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsConnectionDropdownOpen(false);
    const id = searchParams.get("id");
    if (!id || connectionLoading) return;

    const confirmBlock = window.confirm("¿Estás seguro de que quieres bloquear a este usuario?");
    if (!confirmBlock) return;

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
      alert(err.message || "No pudimos bloquear al usuario.");
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
      return profile?.connection_direction === "incoming" ? "Aceptar" : "Solicitud enviada";
    }
    if (profile?.connection_status === "accepted") return "En mi red";
    if (profile?.connection_status === "blocked") return "Bloqueado";
    return "Agregar a mi red";
  };

  const getConnectionButtonLabelMobile = () => {
    if (connectionLoading) return "Enviando...";
    if (profile?.connection_status === "pending") {
      return profile?.connection_direction === "incoming" ? "Aceptar" : "Solicitado";
    }
    if (profile?.connection_status === "accepted") return "En mi red";
    if (profile?.connection_status === "blocked") return "Bloqueado";
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
                <div className="hidden sm:flex flex-row gap-3 w-full items-center">
                  {!profile.is_own_profile ? (
                    <>
                      {/* Connection Actions (Agregar OR Aceptar + Rechazar) */}
                      {profile?.connection_status === "pending" && profile?.connection_direction === "incoming" ? (
                        <>
                          <Button
                            onClick={handleConnect}
                            variant="outline"
                            disabled={connectionLoading}
                            className="flex-1 flex items-center justify-center gap-2 font-bold animate-none"
                          >
                            <span className="material-symbols-outlined text-[20px]">check</span>
                            Aceptar
                          </Button>
                          <Button
                            onClick={handleDeclineConnect}
                            disabled={connectionLoading}
                            variant="outline"
                            className="flex-1 flex items-center justify-center gap-2 font-bold animate-none hover:bg-[#FF4B4B]/10 hover:text-[#FF4B4B] hover:border-[#FF4B4B]/30"
                          >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                            Rechazar
                          </Button>
                        </>
                      ) : profile?.connection_status === "accepted" ? (
                        <div className="relative flex-1" ref={connectionDropdownRefDesktop}>
                          <Button
                            onClick={() => setIsConnectionDropdownOpen(!isConnectionDropdownOpen)}
                            variant="outline"
                            disabled={connectionLoading}
                            className="w-full flex items-center justify-center gap-2 font-bold animate-none"
                          >
                            <span className="material-symbols-outlined text-[20px]">group</span>
                            En mi red
                            <span className="material-symbols-outlined text-[16px] ml-0.5">
                              {isConnectionDropdownOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                            </span>
                          </Button>
                          
                          {isConnectionDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 origin-top-left">
                              <button
                                onClick={handleRemoveConnection}
                                className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                              >
                                <span className="material-symbols-rounded text-slate-500 group-hover:text-[#FF4B4B] text-[18px] transition-colors">person_remove</span>
                                <span className="font-semibold text-slate-500 group-hover:text-[#FF4B4B] transition-colors">Eliminar</span>
                              </button>
                              <button
                                onClick={handleBlockConnection}
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
                          onClick={handleConnect}
                          variant="outline"
                          disabled={connectionLoading}
                          className="flex-1 flex items-center justify-center gap-2 font-bold animate-none"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {profile?.connection_status === "blocked" ? "block" : "person_add"}
                          </span>
                          {getConnectionButtonLabel()}
                        </Button>
                      )}

                      {/* Message Action */}
                      <Button
                        onClick={handleSendMessage}
                        variant="primary"
                        className="flex-1 flex items-center justify-center gap-2 font-bold animate-none"
                      >
                        <span className="material-symbols-outlined text-[20px]">mail</span>
                        Enviar mensaje
                      </Button>

                      {/* Share Action (Icon only when viewing someone else's profile) */}
                      <button
                        onClick={handleShareProfile}
                        className="w-11 h-11 md:w-12 md:h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 rounded-xl transition-all duration-300 outline-none active:scale-95 cursor-pointer shadow-none font-jakarta"
                        title="Compartir perfil"
                      >
                        <span className="material-symbols-outlined text-[20px]">share</span>
                      </button>
                    </>
                  ) : (
                    /* Share Action (Full button when viewing own profile) */
                    <Button
                      onClick={handleShareProfile}
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2 font-bold animate-none"
                    >
                      <span className="material-symbols-outlined text-[20px]">share</span>
                      Compartir perfil
                    </Button>
                  )}
                </div>

                {/* Mobile view action buttons (2 lines layout) */}
                <div className="flex sm:hidden flex-col gap-2.5 w-full">
                  {/* Line 1: Connection Actions */}
                  {!profile.is_own_profile && (
                    <div className="flex flex-row gap-2 w-full">
                      {profile?.connection_status === "pending" && profile?.connection_direction === "incoming" ? (
                        <>
                          <Button
                            onClick={handleConnect}
                            variant="outline"
                            disabled={connectionLoading}
                            className="flex-1 flex items-center justify-center gap-1.5 font-bold text-[13px] h-11 rounded-xl animate-none px-2"
                          >
                            <span className="material-symbols-outlined text-[20px]">check</span>
                            <span className="truncate">Aceptar</span>
                          </Button>
                          <Button
                            onClick={handleDeclineConnect}
                            variant="outline"
                            disabled={connectionLoading}
                            className="flex-1 flex items-center justify-center gap-1.5 font-bold text-[13px] h-11 rounded-xl animate-none px-2 hover:bg-[#FF4B4B]/10 hover:text-[#FF4B4B] hover:border-[#FF4B4B]/30"
                          >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                            <span className="truncate">Rechazar</span>
                          </Button>
                        </>
                      ) : profile?.connection_status === "accepted" ? (
                        <div className="relative w-full" ref={connectionDropdownRefMobile}>
                          <Button
                            onClick={() => setIsConnectionDropdownOpen(!isConnectionDropdownOpen)}
                            variant="outline"
                            disabled={connectionLoading}
                            className="w-full flex items-center justify-center gap-1.5 font-bold text-[13px] h-11 rounded-xl animate-none"
                          >
                            <span className="material-symbols-outlined text-[20px]">group</span>
                            <span>En mi red</span>
                            <span className="material-symbols-outlined text-[16px] ml-0.5">
                              {isConnectionDropdownOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                            </span>
                          </Button>
                          
                          {isConnectionDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 origin-top-left">
                              <button
                                onClick={handleRemoveConnection}
                                className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                              >
                                <span className="material-symbols-rounded text-slate-500 group-hover:text-[#FF4B4B] text-[18px] transition-colors">person_remove</span>
                                <span className="font-semibold text-slate-500 group-hover:text-[#FF4B4B] transition-colors">Eliminar</span>
                              </button>
                              <button
                                onClick={handleBlockConnection}
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
                          onClick={handleConnect}
                          variant="outline"
                          disabled={connectionLoading}
                          className="w-full flex items-center justify-center gap-1.5 font-bold text-[13px] h-11 rounded-xl animate-none"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {profile?.connection_status === "blocked" ? "block" : "person_add"}
                          </span>
                          <span>{getConnectionButtonLabelMobile()}</span>
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Line 2: Message & Share Actions */}
                  <div className="flex flex-row gap-2 w-full items-center">
                    {!profile.is_own_profile && (
                      <Button
                        onClick={handleSendMessage}
                        variant="primary"
                        className="flex-1 flex items-center justify-center gap-1.5 font-bold text-[13px] h-11 rounded-xl animate-none px-3"
                      >
                        <span className="material-symbols-outlined text-[20px]">mail</span>
                        <span>Mensaje</span>
                      </Button>
                    )}
                    <button
                      onClick={handleShareProfile}
                      className={`h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 rounded-xl transition-all duration-300 outline-none active:scale-95 cursor-pointer shadow-none font-jakarta ${
                        profile.is_own_profile ? "w-full" : "w-11"
                      }`}
                      title="Compartir perfil"
                    >
                      <span className="material-symbols-outlined text-[20px]">share</span>
                      {profile.is_own_profile && <span className="ml-2 font-bold text-[13px]">Compartir perfil</span>}
                    </button>
                  </div>
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
        maxWidth="400px"
        backdropClassName="bg-transparent backdrop-blur-none"
        containerClassName="shadow-none border border-slate-200"
      >
        <div className="flex flex-col gap-4">
          {/* Copy link section */}
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={typeof window !== "undefined" ? window.location.href : ""}
              className="flex-1 h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs text-slate-600 outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className={`px-5 h-11 rounded-xl text-xs font-semibold border-none cursor-pointer transition-all duration-300 flex items-center justify-center shrink-0 ${copied
                  ? "bg-[#22C55E] text-white"
                  : "bg-black text-white hover:bg-zinc-800"
                }`}
            >
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
          </div>

          {/* WhatsApp share shortcut */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Mira el perfil de ${profile.first_name} en LUMINUS: ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-decoration-none text-slate-700 font-semibold font-jakarta"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366] shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="text-xs font-bold text-slate-600">Compartir por WhatsApp</span>
          </a>

          {/* Close button */}
          <button
            onClick={() => setIsShareOpen(false)}
            className="w-full h-11 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition duration-200 flex items-center justify-center cursor-pointer outline-none active:scale-95 font-jakarta"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    </div>
  );
}
