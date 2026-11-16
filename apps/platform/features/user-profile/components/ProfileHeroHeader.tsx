"use client";

import React from "react";
import {
  User,
  MapPin,
  Mail,
  Share2,
  Orbit,
  Heart,
  Check,
  X,
  ChevronDown,
  UserMinus,
  UserPlus,
  Ban,
  Camera,
  Pencil,
  MoreHorizontal
} from "lucide-react";
import { Button, BackButton } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { isMecenas } from "@/lib/membership/access";
import { formatLocationDisplay } from "@/utils/locationUtils";
import { getCategoryPillClass, getCategoryTextClass, getCategoryCustomStyles, useDynamicCategories } from "@/components/ui/InterestPill";

interface ProfileHeroHeaderProps {
  profile: any;
  isSpecialist?: boolean;
  activeTab?: "profesional" | "personal";
  onTabChange?: (tab: "profesional" | "personal") => void;
  // Actions
  onConnect?: () => void;
  onFollow?: () => void;
  followLoading?: boolean;
  onRemoveConnection?: () => void;
  onBlockConnection?: () => void;
  connectionLoading?: boolean;
  getConnectionButtonLabel?: () => string;
  isConnectionDropdownOpen?: boolean;
  setIsConnectionDropdownOpen?: (open: boolean) => void;
  connectionDropdownRefDesktop?: React.RefObject<HTMLDivElement>;
  connectionDropdownRefMobile?: React.RefObject<HTMLDivElement>;
  onSendMessage?: () => void;
  onSchedule?: () => void;
  onShareProfile?: () => void;
  // Owner mode actions
  isOwnProfile?: boolean;
  isPublic?: boolean;
  onEditProfile?: () => void;
  onEditPhoto?: () => void;
  onEditCover?: () => void;
  // Back navigation
  onBack?: () => void;
  backLabel?: string;
}

function renderSpecialtyIcon(title?: string, className = "w-3.5 h-3.5 shrink-0") {
  if (!title) return <Heart className={className} />;
  const t = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  return <Heart className={className} />;
}

export function ProfileHeroHeader({
  profile,
  isSpecialist = false,
  activeTab = "profesional",
  onTabChange,
  onConnect,
  onFollow,
  followLoading = false,
  onRemoveConnection,
  onBlockConnection,
  connectionLoading = false,
  getConnectionButtonLabel,
  isConnectionDropdownOpen = false,
  setIsConnectionDropdownOpen,
  connectionDropdownRefDesktop,
  connectionDropdownRefMobile,
  onSendMessage,
  onSchedule,
  onShareProfile,
  isOwnProfile = false,
  isPublic = false,
  onEditProfile,
  onEditPhoto,
  onEditCover,
  onBack,
  backLabel,
}: ProfileHeroHeaderProps) {
  const isOwn = isOwnProfile || Boolean(profile?.is_own_profile);

  const fullName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Usuario LUMINUS";
  const hasCover = profile?.cover_url && profile.cover_url !== "" && !profile.cover_url.includes("empty");
  const rawLocation = [profile?.city, profile?.country].filter(Boolean).join(", ");
  const formattedLocation = formatLocationDisplay(rawLocation);
  const hasLocation = Boolean(formattedLocation);
  const dbCategories = useDynamicCategories();
  const specialist = profile?.specialistProfile;
  const specialtyText = specialist?.specialty || specialist?.title || "Bienestar";
  const specialtyCustomStyles = getCategoryCustomStyles(specialtyText, dbCategories);
  const specialtyLabel = specialtyText.toLowerCase().startsWith("especialista en")
    ? specialtyText
    : `Especialista en ${specialtyText}`;
  const getConnectionLabel = () => {
    if (connectionLoading) {
      if (profile?.connection_status === "blocked") return "Desbloqueando...";
      if (profile?.connection_status === "accepted") return "Eliminando...";
      if (profile?.connection_status === "pending_sent") return "Cancelando...";
      if (profile?.connection_status === "pending_received") return "Aceptando...";
      return "Enviando...";
    }
    if (profile?.connection_status === "blocked") return "Desbloquear";
    if (profile?.connection_status === "accepted") return "Conectados";
    if (profile?.connection_status === "pending_sent") return "Solicitud enviada";
    if (profile?.connection_status === "pending_received") return "Aceptar solicitud";
    return "Conectar";
  };

  const getFollowLabel = () => {
    if (followLoading) return profile?.is_following ? "Dejando..." : "Siguiendo...";
    return profile?.is_following ? "Siguiendo" : "Seguir";
  };

  return (
    <div className="w-full flex flex-col font-sans">
      {/* 1. 100% Full-Width Cover Banner — Flush to Navbar (Zero Gap) */}
      <div className={`w-full h-36 sm:h-40 md:h-44 lg:h-48 relative shrink-0 overflow-hidden ${!hasCover ? "luminus-light-gradient border-b border-slate-200/80" : "bg-slate-100"}`}>
        {hasCover && (
          <img
            src={profile.cover_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        {onBack && (
          <BackButton
            variant="translucent"
            onClick={onBack}
            title={backLabel || "Volver"}
            className="md:hidden absolute top-3 left-4 sm:left-6 z-20"
          />
        )}
      </div>

      {/* 2. Overlapping Master Identity Card (2/3 over cover, 1/3 below) */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-none -mt-20 sm:-mt-24 md:-mt-32 lg:-mt-36 relative z-30">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 sm:gap-6">
              {/* Left: Avatar + Identity Details */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 md:gap-6 min-w-0">
                {/* Avatar */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 border-white bg-white shadow-xs shrink-0 relative z-10 group">
                  {profile?.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full border border-slate-200/80 rounded-xl bg-slate-50 flex items-center justify-center">
                      <User className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 stroke-[1.5]" />
                    </div>
                  )}
                </div>

                {/* Identity Lockup */}
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-title-page text-slate-900">
                      {fullName}
                    </h1>

                    {profile?.connection_status === "pending_received" && !isOwn && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-meta font-semibold font-jakarta border border-blue-200/60 flex items-center select-none">
                        Quiere conectar contigo
                      </span>
                    )}
                  </div>

                  {/* Headline / Specialty / Profession */}
                  {!isSpecialist && profile?.profession && profile.profession !== "Miembro de la Comunidad" ? (
                    <p className="text-body font-medium text-slate-600">
                      {profile.profession}
                    </p>
                  ) : null}

                  {/* Location */}
                  {hasLocation && (
                    <div className="flex items-center gap-1.5 text-label font-medium text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formattedLocation}</span>
                    </div>
                  )}

                  {/* Badges Row (Especialista, Mecenas & Community Tenure) */}
                  {(isSpecialist || isMecenas({ tier: profile?.tier }) || profile?.member_since) && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {isSpecialist && (
                        <span
                          style={
                            specialtyCustomStyles?.color && specialtyCustomStyles?.bgColor
                              ? {
                                  backgroundColor: specialtyCustomStyles.bgColor,
                                  color: specialtyCustomStyles.color,
                                  borderColor: specialtyCustomStyles.borderColor,
                                }
                              : undefined
                          }
                          className={`inline-flex items-center h-6 px-2.5 rounded-full text-meta font-semibold font-jakarta border select-none ${getCategoryPillClass(specialtyText, dbCategories)}`}
                        >
                          Especialista LUMINUS
                        </span>
                      )}

                      {isMecenas({ tier: profile?.tier }) && (
                        <span className="inline-flex items-center h-6 px-2.5 rounded-full text-meta font-semibold font-jakarta luminus-pill-gradient select-none">
                          Mecenas
                        </span>
                      )}

                      {profile?.member_since && (
                        <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-slate-100 text-slate-600 text-meta font-medium font-jakarta border border-slate-200/80 select-none">
                          Miembro desde {(() => {
                            try {
                              const d = new Date(profile.member_since);
                              return Number.isNaN(d.getTime()) ? "" : d.getFullYear();
                            } catch {
                              return "";
                            }
                          })()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Desktop Actions Bar */}
              <div className="hidden md:flex items-center gap-2 shrink-0 z-10">
                {isOwn ? (
                  <>
                    {!isPublic && onEditProfile && (
                      <Button
                        onClick={onEditProfile}
                        variant="secondary"
                        className="gap-1.5 px-3.5 text-xs font-semibold"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar perfil</span>
                      </Button>
                    )}
                    <Button
                      onClick={onShareProfile}
                      variant="secondary"
                      className="gap-1.5 px-3.5 text-xs font-semibold"
                      title="Compartir perfil"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Compartir</span>
                    </Button>
                  </>
                ) : isSpecialist ? (
                  <>
                    {/* Specialist Profile: Follow Primary + Connect in Overflow Menu */}
                    {profile?.connection_status === "blocked" ? (
                      <Button
                        onClick={onConnect}
                        variant="secondary"
                        disabled={connectionLoading}
                        className="px-4 text-xs font-semibold"
                      >
                        <Ban className="w-3.5 h-3.5 text-rose-500 mr-1.5" />
                        <span>{getConnectionLabel()}</span>
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={onFollow}
                          variant={profile?.is_following ? "secondary" : "primary"}
                          disabled={followLoading}
                          className="gap-1.5 px-4 text-xs font-semibold"
                        >
                          {profile?.is_following ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <UserPlus className="w-3.5 h-3.5" />
                          )}
                          <span>{getFollowLabel()}</span>
                        </Button>

                        <Button
                          onClick={onSendMessage}
                          variant="secondary"
                          className="gap-1.5 px-4 text-xs font-semibold"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Mensaje</span>
                        </Button>

                        <div className="relative" ref={connectionDropdownRefDesktop}>
                          <Button
                            onClick={() => setIsConnectionDropdownOpen?.(!isConnectionDropdownOpen)}
                            variant="secondary"
                            className="!w-11 !h-11 !p-0 shrink-0"
                            title="Más opciones"
                            aria-label="Más opciones de conexión"
                          >
                            <MoreHorizontal className="w-4 h-4 text-slate-700" />
                          </Button>

                          {isConnectionDropdownOpen && (
                            <div className="absolute top-full right-0 mt-1.5 w-52 bg-white border border-slate-200/90 rounded-2xl overflow-hidden z-50 animate-in fade-in duration-150 shadow-xl shadow-slate-900/10">
                              <button
                                onClick={() => {
                                  setIsConnectionDropdownOpen?.(false);
                                  onConnect?.();
                                }}
                                disabled={connectionLoading}
                                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-none cursor-pointer bg-transparent text-left font-jakarta"
                              >
                                {profile?.connection_status === "accepted" ? (
                                  <UserMinus className="w-3.5 h-3.5 text-rose-500" />
                                ) : (
                                  <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                                )}
                                <span>
                                  {profile?.connection_status === "accepted"
                                    ? "Eliminar contacto"
                                    : getConnectionLabel()}
                                </span>
                              </button>
                              <button
                                onClick={onBlockConnection}
                                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 transition-colors border-none cursor-pointer bg-transparent text-left font-jakarta"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Bloquear usuario</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <Button
                      onClick={onShareProfile}
                      variant="secondary"
                      className="!w-11 !h-11 !p-0 shrink-0"
                      title="Compartir perfil"
                    >
                      <Share2 className="w-4 h-4 text-slate-700" />
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Member Profile: Mutual Connect Primary */}
                    {profile?.connection_status === "accepted" ? (
                      <div className="relative" ref={connectionDropdownRefDesktop}>
                        <Button
                          onClick={() => setIsConnectionDropdownOpen?.(!isConnectionDropdownOpen)}
                          variant="secondary"
                          disabled={connectionLoading}
                          className="gap-1.5 px-3.5 text-xs font-semibold"
                        >
                          <span>Conectados</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </Button>

                        {isConnectionDropdownOpen && (
                          <div className="absolute top-full right-0 mt-1.5 w-48 bg-white border border-slate-200/90 rounded-2xl overflow-hidden z-50 animate-in fade-in duration-150 shadow-xl shadow-slate-900/10">
                            <button
                              onClick={onRemoveConnection}
                              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 transition-colors border-none cursor-pointer bg-transparent text-left font-jakarta"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              <span>Eliminar contacto</span>
                            </button>
                            <button
                              onClick={onBlockConnection}
                              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 transition-colors border-none cursor-pointer bg-transparent text-left font-jakarta"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Bloquear usuario</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button
                        onClick={onConnect}
                        variant={
                          profile?.connection_status === "blocked" || profile?.connection_status === "pending_sent"
                            ? "secondary"
                            : "primary"
                        }
                        disabled={connectionLoading}
                        className="px-4 text-xs font-semibold"
                      >
                        {profile?.connection_status === "blocked" && (
                          <Ban className="w-3.5 h-3.5 text-rose-500 mr-1.5" />
                        )}
                        <span>{getConnectionLabel()}</span>
                      </Button>
                    )}

                    {/* Slot 2: Chat Message */}
                    {profile?.connection_status !== "blocked" && (
                      <Button
                        onClick={onSendMessage}
                        variant={profile?.connection_status === "accepted" ? "primary" : "secondary"}
                        className="gap-1.5 px-4 text-xs font-semibold"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Mensaje</span>
                      </Button>
                    )}

                    {/* Slot 3: Share Profile */}
                    <Button
                      onClick={onShareProfile}
                      variant="secondary"
                      className="!w-11 !h-11 !p-0 shrink-0"
                      title="Compartir perfil"
                    >
                      <Share2 className="w-4 h-4 text-slate-700" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Action Buttons — placed between Hero Card and Content Blocks */}
        <div className="flex md:hidden flex-col gap-2 mt-3 relative z-30">
              {isOwn ? (
                <div className="flex items-center gap-2 w-full">
                  {!isPublic && onEditProfile && (
                    <Button
                      onClick={onEditProfile}
                      variant="secondary"
                      size="md"
                      fullWidth
                      className="gap-1.5 whitespace-nowrap"
                    >
                      <Pencil className="w-3.5 h-3.5 shrink-0" />
                      <span>Editar perfil</span>
                    </Button>
                  )}
                  <Button
                    onClick={onShareProfile}
                    variant="secondary"
                    size="md"
                    fullWidth
                    className="gap-1.5 whitespace-nowrap"
                  >
                    <Share2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Compartir</span>
                  </Button>
                </div>
              ) : isSpecialist ? (
                <div className="flex items-center gap-2 w-full">
                  {profile?.connection_status === "blocked" ? (
                    <Button
                      onClick={onConnect}
                      variant="secondary"
                      size="md"
                      disabled={connectionLoading}
                      className="flex-1 min-w-0 gap-1.5 !px-3 whitespace-nowrap"
                    >
                      <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{getConnectionLabel()}</span>
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={onFollow}
                        variant={profile?.is_following ? "secondary" : "primary"}
                        size="md"
                        disabled={followLoading}
                        className="flex-1 min-w-0 gap-1.5 !px-3 whitespace-nowrap"
                      >
                        {profile?.is_following ? (
                          <Check className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <UserPlus className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span className="truncate">{getFollowLabel()}</span>
                      </Button>

                      <Button
                        onClick={onSendMessage}
                        variant="secondary"
                        size="md"
                        className="flex-1 min-w-0 gap-1.5 !px-3 whitespace-nowrap"
                      >
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span>Mensaje</span>
                      </Button>

                      <div className="relative shrink-0" ref={connectionDropdownRefMobile}>
                        <Button
                          onClick={() => setIsConnectionDropdownOpen?.(!isConnectionDropdownOpen)}
                          variant="secondary"
                          size="md"
                          className="!w-11 !p-0 shrink-0"
                          title="Más opciones"
                          aria-label="Más opciones de conexión"
                        >
                          <MoreHorizontal className="w-4 h-4 text-slate-700" />
                        </Button>

                        {isConnectionDropdownOpen && (
                          <div className="absolute top-full right-0 mt-1.5 w-52 bg-white border border-slate-200/90 rounded-2xl overflow-hidden z-50 animate-in fade-in duration-150 shadow-xl shadow-slate-900/10">
                            <button
                              onClick={() => {
                                setIsConnectionDropdownOpen?.(false);
                                onConnect?.();
                              }}
                              disabled={connectionLoading}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-none cursor-pointer bg-transparent text-left font-jakarta"
                            >
                              {profile?.connection_status === "accepted" ? (
                                <UserMinus className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              ) : (
                                <UserPlus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              )}
                              <span>
                                {profile?.connection_status === "accepted"
                                  ? "Eliminar contacto"
                                  : getConnectionLabel()}
                              </span>
                            </button>
                            <button
                              onClick={onBlockConnection}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 transition-colors border-none cursor-pointer bg-transparent text-left font-jakarta"
                            >
                              <Ban className="w-3.5 h-3.5 shrink-0" />
                              <span>Bloquear usuario</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full">
                  {profile?.connection_status === "accepted" ? (
                    <div className="relative flex-1 min-w-0" ref={connectionDropdownRefMobile}>
                      <Button
                        onClick={() => setIsConnectionDropdownOpen?.(!isConnectionDropdownOpen)}
                        variant="secondary"
                        size="md"
                        disabled={connectionLoading}
                        fullWidth
                        className="gap-1.5 !px-3 whitespace-nowrap"
                      >
                        <span className="truncate">Conectados</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </Button>

                      {isConnectionDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-slate-200/90 rounded-2xl overflow-hidden z-50 animate-in fade-in duration-150 shadow-xl shadow-slate-900/10">
                          <button
                            onClick={onRemoveConnection}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 transition-colors border-none cursor-pointer bg-transparent text-left font-jakarta"
                          >
                            <UserMinus className="w-3.5 h-3.5 shrink-0" />
                            <span>Eliminar contacto</span>
                          </button>
                          <button
                            onClick={onBlockConnection}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 transition-colors border-none cursor-pointer bg-transparent text-left font-jakarta"
                          >
                            <Ban className="w-3.5 h-3.5 shrink-0" />
                            <span>Bloquear usuario</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={onConnect}
                      variant={
                        profile?.connection_status === "blocked" || profile?.connection_status === "pending_sent"
                          ? "secondary"
                          : "primary"
                      }
                      size="md"
                      disabled={connectionLoading}
                      className="flex-1 min-w-0 gap-1.5 !px-3 whitespace-nowrap"
                    >
                      {profile?.connection_status === "blocked" ? (
                        <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      ) : (
                        <Orbit className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span className="truncate">{getConnectionLabel()}</span>
                    </Button>
                  )}

                  {profile?.connection_status !== "blocked" && (
                    <Button
                      onClick={onSendMessage}
                      variant={profile?.connection_status === "accepted" ? "primary" : "secondary"}
                      size="md"
                      className="flex-1 min-w-0 gap-1.5 !px-3 whitespace-nowrap"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span>Mensaje</span>
                    </Button>
                  )}

                  <Button
                    onClick={onShareProfile}
                    variant="secondary"
                    className="!w-10 !h-10 !p-0 shrink-0"
                    title="Compartir perfil"
                    aria-label="Compartir perfil"
                  >
                    <Share2 className="w-4 h-4 text-slate-700" />
                  </Button>
                </div>
              )}
        </div>
      </div>
    </div>
  );
}

/**
 * Co-located low-detail skeleton for User & Public Profile.
 * Uses ProfileHeroHeader's exact cover height (h-36..lg:h-48), overlapping card offset,
 * and a clean 8:4 grid shell without speculative badges, pills, or specialist-only tabs.
 */
export function ProfileSkeleton() {
  return (
    <div className="w-full flex flex-col bg-slate-50 min-h-screen font-sans">
      <Skeleton className="w-full h-36 sm:h-40 md:h-44 lg:h-48 rounded-none shrink-0" />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-none -mt-20 sm:-mt-24 md:-mt-32 lg:-mt-36 p-5 sm:p-6 md:p-8 relative z-30">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 sm:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 md:gap-6 min-w-0">
              <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl shrink-0" />
              <div className="flex flex-col gap-2 min-w-0">
                <Skeleton className="h-6 w-44 rounded-md" />
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3.5 w-28 rounded-md mt-0.5" />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 mt-5 lg:mt-6 items-start">
          <div className="lg:col-span-8 flex flex-col gap-5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-3">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-4/5 rounded-md" />
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-3">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-2/3 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
