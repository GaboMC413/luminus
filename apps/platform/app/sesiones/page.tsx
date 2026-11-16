"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarCheck,
  ChevronRight,
  Clock,
  Cloud,
  ExternalLink,
  Lock,
  MessageSquare,
  Sparkles,
  Sun,
  Sunrise,
  Video,
  Check,
  X,
  HelpCircle,
} from "lucide-react";
import { IntroSessionGuideModal } from "@/features/user-profile/components/IntroSessionGuideModal";
import { IntroSessionSummaryCard } from "@/features/user-profile/components/IntroSessionSummaryCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { UnderlineTabs } from "@/components/ui/UnderlineTabs";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { InputField } from "@/components/ui/InputField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { Toast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatSessionDate } from "@/lib/sessions/sessionAvailability";
import { getSessionTimeState } from "@/lib/sessions/whereby";
import { getCachedData, fetchWithCache } from "@/lib/clientCache";

type SessionUser = {
  id: string;
  slug?: string | null;
  name: string;
  avatarUrl: string;
  specialty?: string;
  profession?: string;
};

type OwnSessionFeedback = {
  attended: boolean;
  resonance: string | null;
  publicNote: string;
  privateNote: string;
};

type IntroSessionItem = {
  id: string;
  requesterId: string;
  specialistId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  requesterNote: string;
  meetingLink: string;
  hostMeetingLink?: string;
  isEmbeddedRoom?: boolean;
  hasStarted?: boolean;
  hasEnded?: boolean;
  isRoomClosed?: boolean;
  hasSubmittedFeedback?: boolean;
  ownFeedback?: OwnSessionFeedback | null;
  specialistGuidance?: string;
  specialistNote: string;
  requester?: SessionUser;
  specialist?: SessionUser;
};

function getResonanceMeta(resonance?: string | null) {
  switch (resonance) {
    case "no_match":
      return {
        label: "No hubo sintonía",
        hint: "No sentí conexión o no era lo que buscaba",
        Icon: Cloud,
        iconClass: "bg-slate-100 text-slate-600 border-slate-200/80",
      };
    case "dim":
      return {
        label: "Algo de claridad",
        hint: "Estuvo bien, aunque quedó espacio para más",
        Icon: Sunrise,
        iconClass: "bg-amber-50 text-amber-700 border-amber-200/80",
      };
    case "warm":
      return {
        label: "Buena sintonía",
        hint: "Cálida, clara y útil para dar un paso",
        Icon: Sun,
        iconClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      };
    case "luminous":
      return {
        label: "Muy luminosa",
        hint: "Gran conexión y mucha claridad",
        Icon: Sparkles,
        iconClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      };
    default:
      return null;
  }
}

function getStatusBadge(item: IntroSessionItem) {
  switch (item.status) {
    case "accepted":
      if (item.hasEnded) {
        if (item.ownFeedback && item.ownFeedback.attended === false) {
          return {
            label: "No realizada",
            className: "bg-slate-100 text-slate-600 border-slate-200/80",
          };
        }
        return {
          label: "Finalizada",
          className: "bg-slate-100 text-slate-700 border-slate-200/80",
        };
      }
      if (item.hasStarted) {
        return {
          label: "En curso",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        };
      }
      return {
        label: "Confirmada",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      };
    case "pending":
      if (item.hasEnded) {
        return {
          label: "Expirada",
          className: "bg-slate-100 text-slate-500 border-slate-200/80",
        };
      }
      return {
        label: "Pendiente",
        className: "bg-amber-50 text-amber-700 border-amber-200/80",
      };
    case "declined":
      return {
        label: "No disponible",
        className: "bg-slate-100 text-slate-500 border-slate-200/80",
      };
    case "cancelled":
      return {
        label: "Cancelada",
        className: "bg-slate-100 text-slate-500 border-slate-200/80",
      };
  }
}

function isExternalUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

function capitalizeFirst(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function renderJoinAction(
  item: IntroSessionItem,
  effectiveLink: string,
  hasStarted: boolean,
  iconClassName: string
) {
  const Icon = item.isEmbeddedRoom ? Video : ExternalLink;

  if (!hasStarted) {
    return (
      <button
        type="button"
        disabled
        title={`Disponible desde las ${item.startTime} hs`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold font-jakarta shrink-0 cursor-not-allowed"
      >
        <span>Unirse</span>
        <Icon className={iconClassName} />
      </button>
    );
  }

  if (item.isEmbeddedRoom) {
    return (
      <Link
        href={`/sesiones/${item.id}/sala`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold font-jakarta shrink-0 no-underline transition-colors"
      >
        <span>Unirse</span>
        <Video className={iconClassName} />
      </Link>
    );
  }

  if (!isExternalUrl(effectiveLink)) return null;

  return (
    <a
      href={effectiveLink}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold font-jakarta shrink-0 no-underline transition-colors"
    >
      <span>Unirse</span>
      <ExternalLink className={iconClassName} />
    </a>
  );
}

function SesionesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get("tab");

  const [requestedSessions, setRequestedSessions] = useState<IntroSessionItem[]>(
    () => getCachedData<any>("/api/sessions")?.requestedSessions ?? []
  );
  const [receivedSessions, setReceivedSessions] = useState<IntroSessionItem[]>(
    () => getCachedData<any>("/api/sessions")?.receivedSessions ?? []
  );
  const [isSpecialist, setIsSpecialist] = useState<boolean>(
    () => Boolean(getCachedData<any>("/api/sessions")?.isSpecialist)
  );
  const [wherebyEnabled, setWherebyEnabled] = useState<boolean>(
    () => Boolean(getCachedData<any>("/api/sessions")?.wherebyEnabled)
  );
  const [loading, setLoading] = useState<boolean>(
    () => !getCachedData<any>("/api/sessions")
  );
  const [error, setError] = useState<string | null>(null);

  const [specialistTab, setSpecialistTab] = useState<"recibidas" | "solicitadas">(
    initialTabParam === "recibidas" ? "recibidas" : "solicitadas"
  );
  const [memberTab, setMemberTab] = useState<"proximas" | "historial">(
    initialTabParam === "historial" ? "historial" : "proximas"
  );

  // Modal states
  const [acceptTarget, setAcceptTarget] = useState<IntroSessionItem | null>(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [useCustomLink, setUseCustomLink] = useState(false);
  const [specialistNote, setSpecialistNote] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [guideDefaultTab, setGuideDefaultTab] = useState<"miembros" | "especialistas">("miembros");
  const [declineTarget, setDeclineTarget] = useState<IntroSessionItem | null>(null);
  const [declineNote, setDeclineNote] = useState("");
  const [cancelTarget, setCancelTarget] = useState<IntroSessionItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<IntroSessionItem | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const [modalError, setModalError] = useState("");
  const [linkError, setLinkError] = useState("");
  const [termsError, setTermsError] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);
  const termsInputRef = useRef<HTMLInputElement>(null);

  const [toast, setToast] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
    type: "success" | "error";
  }>({ isOpen: false, title: "", type: "success" });

  const loadSessions = useCallback(async (force = false) => {
    try {
      if (!getCachedData<any>("/api/sessions")) {
        setLoading(true);
      }
      setError(null);
      const data = await fetchWithCache(
        "/api/sessions",
        async () => {
          const res = await fetch("/api/sessions", {
            credentials: "include",
          });

          if (res.status === 401) {
            router.push("/auth/iniciar-sesion");
            return null;
          }

          if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            throw new Error(errBody.message || "No pudimos cargar tus sesiones.");
          }

          return res.json();
        },
        { ttlMs: 45_000, force }
      );

      if (!data) return;

      const reqs: IntroSessionItem[] = data.requestedSessions || [];
      const recs: IntroSessionItem[] = data.receivedSessions || [];
      const specFlag = Boolean(data.isSpecialist);

      setRequestedSessions(reqs);
      setReceivedSessions(recs);
      setIsSpecialist(specFlag);
      setWherebyEnabled(Boolean(data.wherebyEnabled));

      if (specFlag) {
        if (!initialTabParam) {
          const hasPendingReceived = recs.some((s) => s.status === "pending");
          const defaultTab =
            hasPendingReceived || reqs.length === 0 ? "recibidas" : "solicitadas";
          setSpecialistTab(defaultTab);
          router.replace(`/sesiones?tab=${defaultTab}`, { scroll: false });
        }
      } else if (!initialTabParam) {
        router.replace("/sesiones?tab=proximas", { scroll: false });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar sesiones.");
    } finally {
      setLoading(false);
    }
  }, [router, initialTabParam]);

  useEffect(() => {
    loadSessions(false);
  }, [loadSessions]);

  const memberUpcoming = useMemo(
    () =>
      requestedSessions.filter(
        (s) => s.status === "pending" || s.status === "accepted"
      ),
    [requestedSessions]
  );

  const memberHistory = useMemo(
    () =>
      requestedSessions.filter(
        (s) => s.status === "declined" || s.status === "cancelled"
      ),
    [requestedSessions]
  );

  const handleOpenChat = (person?: SessionUser) => {
    if (!person?.id) return;
    window.dispatchEvent(
      new CustomEvent("luminus_open_chat", {
        detail: {
          userId: person.id,
          name: person.name,
          avatar: person.avatarUrl,
        },
      })
    );
  };

  const handleAcceptSubmit = async () => {
    if (!acceptTarget) return;
    const manualLinkRequired = !wherebyEnabled || useCustomLink;
    const nextLinkError =
      manualLinkRequired && !meetingLink.trim()
        ? "Ingresa el enlace de reunión o cómo se conectarán."
        : "";
    const nextTermsError = acceptedTerms
      ? ""
      : "Debes aceptar las condiciones para confirmar la sesión.";

    setLinkError(nextLinkError);
    setTermsError(nextTermsError);
    setModalError("");

    if (nextLinkError || nextTermsError) {
      const targetEl = nextLinkError ? linkInputRef.current : termsInputRef.current;
      targetEl?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      targetEl?.focus();
      return;
    }

    setSubmitting(true);
    setModalError("");
    try {
      const res = await fetch(`/api/sessions/${acceptTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "accept",
          meetingLink: manualLinkRequired ? meetingLink.trim() : "",
          specialistNote: specialistNote.trim() || undefined,
          acceptedTerms: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "No pudimos confirmar la sesión.");
      }

      setAcceptTarget(null);
      setMeetingLink("");
      setSpecialistNote("");
      window.dispatchEvent(new Event("luminus_messages_update"));
      window.dispatchEvent(new Event("luminus_notifications_update"));
      setToast({
        isOpen: true,
        title: "Sesión confirmada",
        message: "Enviamos el enlace al usuario por notificación y por chat.",
        type: "success",
      });
      await loadSessions(true);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Error al confirmar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeclineSubmit = async () => {
    if (!declineTarget) return;
    setSubmitting(true);
    setModalError("");
    try {
      const res = await fetch(`/api/sessions/${declineTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "decline",
          specialistNote: declineNote.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "No pudimos rechazar la solicitud.");
      }

      setDeclineTarget(null);
      setDeclineNote("");
      window.dispatchEvent(new Event("luminus_messages_update"));
      window.dispatchEvent(new Event("luminus_notifications_update"));
      setToast({
        isOpen: true,
        title: "Solicitud rechazada",
        message: "El horario quedó libre nuevamente.",
        type: "success",
      });
      await loadSessions(true);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Error al rechazar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubmit = async () => {
    if (!cancelTarget) return;
    setSubmitting(true);
    setModalError("");
    try {
      const res = await fetch(`/api/sessions/${cancelTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "No pudimos cancelar la sesión.");
      }

      setCancelTarget(null);
      window.dispatchEvent(new Event("luminus_messages_update"));
      window.dispatchEvent(new Event("luminus_notifications_update"));
      setToast({
        isOpen: true,
        title: "Sesión cancelada",
        message: "Avisamos a la otra persona por notificación y chat.",
        type: "success",
      });
      await loadSessions(true);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Error al cancelar.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayedSessions = isSpecialist
    ? specialistTab === "recibidas"
      ? receivedSessions
      : requestedSessions
    : memberTab === "proximas"
      ? memberUpcoming
      : memberHistory;

  const isViewingReceived = isSpecialist && specialistTab === "recibidas";

  const handleSpecialistTabChange = (tab: string) => {
    const next = tab === "recibidas" ? "recibidas" : "solicitadas";
    setSpecialistTab(next);
    router.replace(`/sesiones?tab=${next}`, { scroll: false });
  };

  const handleMemberTabChange = (tab: string) => {
    const next = tab === "historial" ? "historial" : "proximas";
    setMemberTab(next);
    router.replace(`/sesiones?tab=${next}`, { scroll: false });
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 font-sans">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 flex flex-col gap-5">
        <PageHeader
          title="Sesiones introductorias"
          showBack
          backFallbackHref="/inicio"
          rightSlot={
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setGuideDefaultTab(isViewingReceived ? "especialistas" : "miembros");
                setShowGuide(true);
              }}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>¿Cómo funciona?</span>
            </Button>
          }
        />

        {loading ? (
          <div className="flex gap-6 border-b border-slate-200/80 pb-3">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-5 w-28 rounded-md" />
          </div>
        ) : isSpecialist ? (
          <UnderlineTabs
            tabs={[
              { id: "recibidas", label: "Solicitudes recibidas" },
              { id: "solicitadas", label: "Mis solicitudes" },
            ]}
            activeTab={specialistTab}
            onChange={handleSpecialistTabChange}
          />
        ) : (
          <UnderlineTabs
            tabs={[
              { id: "proximas", label: "Próximas y pendientes" },
              { id: "historial", label: "Historial" },
            ]}
            activeTab={memberTab}
            onChange={handleMemberTabChange}
          />
        )}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-body text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-4 w-36 rounded-md" />
                      <Skeleton className="h-3 w-24 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-28 rounded-xl" />
                  <Skeleton className="h-9 w-24 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedSessions.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl">
            <EmptyState
              icon={<CalendarCheck className="w-6 h-6 stroke-[1.75]" />}
              title={
                isViewingReceived
                  ? "Aún no tienes solicitudes recibidas"
                  : "No tienes sesiones aquí"
              }
              description={
                isViewingReceived
                  ? "Cuando un miembro solicite una sesión de 15 minutos contigo, aparecerá aquí para que la confirmes."
                  : "Explora el directorio de especialistas para agendar una videollamada introductoria de 15 minutos."
              }
              action={
                !isViewingReceived ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => router.push("/especialistas")}
                  >
                    Explorar especialistas
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedSessions.map((item) => {
              const person = isViewingReceived ? item.requester : item.specialist;
              const subtitle = isViewingReceived
                ? person?.profession || "Miembro de LUMINUS"
                : person?.specialty || "Especialista";
              const badge = getStatusBadge(item);
              const formattedDate = capitalizeFirst(
                formatSessionDate(item.scheduledDate)
              );

              const effectiveLink =
                isViewingReceived && item.hostMeetingLink
                  ? item.hostMeetingLink
                  : item.meetingLink;
              const timeState = getSessionTimeState(item, nowMs);
              const hasStarted = timeState.hasStarted;
              const isRoomClosed = Boolean(item.isRoomClosed) || timeState.isRoomClosed;
              const canJoinRoom =
                item.status === "accepted" &&
                !isRoomClosed &&
                Boolean(effectiveLink);
              const needsFeedback =
                item.status === "accepted" &&
                Boolean(item.hasEnded) &&
                !item.hasSubmittedFeedback;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3.5 shadow-none"
                >
                  <div className="flex flex-col gap-3">
                    {/* Person + Status */}
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/perfil/${person?.slug || person?.id || ""}`}
                        className="flex items-center gap-3 min-w-0 group no-underline"
                      >
                        <UserAvatar
                          src={person?.avatarUrl}
                          alt={person?.name || "Usuario"}
                          size="md"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-title-section text-slate-900 group-hover:underline truncate">
                            {person?.name || "Usuario"}
                          </span>
                          <span className="text-meta text-slate-500 truncate">
                            {subtitle}
                          </span>
                        </div>
                      </Link>
                      <span
                        className={`px-2.5 py-1 rounded-full border text-meta font-semibold font-jakarta shrink-0 ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Compact Date & Time */}
                    <div className="rounded-xl bg-slate-50 border border-slate-200/70 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-body font-semibold text-slate-900 min-w-0">
                        <CalendarCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-meta font-semibold text-slate-700 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {item.startTime} – {item.endTime} hs
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compact Footer: 1-click primary action + Ver detalles */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      {isViewingReceived && item.status === "pending" && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => {
                              setModalError("");
                              setLinkError("");
                              setTermsError("");
                              setMeetingLink("");
                              setUseCustomLink(false);
                              setSpecialistNote("");
                              setAcceptedTerms(false);
                              setAcceptTarget(item);
                            }}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Aceptar</span>
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => {
                              setModalError("");
                              setDeclineNote("");
                              setDeclineTarget(item);
                            }}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Rechazar</span>
                          </Button>
                        </>
                      )}

                      {canJoinRoom &&
                        renderJoinAction(item, effectiveLink, hasStarted, "w-3.5 h-3.5")}

                      {needsFeedback && (
                        <Link
                          href={`/sesiones/feedback?sessionId=${item.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold font-jakarta shrink-0 no-underline transition-colors"
                        >
                          Dejar valoración
                        </Link>
                      )}

                      {item.status === "accepted" &&
                        item.hasEnded &&
                        item.hasSubmittedFeedback && (
                          <span className="inline-flex items-center gap-1 text-meta font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/70 rounded-full px-2.5 py-0.5">
                            <Check className="w-3 h-3" />
                            Valoración enviada
                          </span>
                        )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setDetailTarget(item)}
                      className="inline-flex items-center gap-1 text-xs font-semibold font-jakarta text-slate-600 hover:text-slate-900 ml-auto cursor-pointer bg-transparent border-none p-1 transition-colors"
                    >
                      <span>Ver detalles</span>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Session Detail Modal */}
      {(() => {
        if (!detailTarget) return null;
        const person = isViewingReceived ? detailTarget.requester : detailTarget.specialist;
        const subtitle = isViewingReceived
          ? person?.profession || "Miembro de LUMINUS"
          : person?.specialty || "Especialista";
        const badge = getStatusBadge(detailTarget);
        const formattedDate = capitalizeFirst(formatSessionDate(detailTarget.scheduledDate));
        const effectiveLink =
          isViewingReceived && detailTarget.hostMeetingLink
            ? detailTarget.hostMeetingLink
            : detailTarget.meetingLink;
        const detailTimeState = getSessionTimeState(detailTarget, nowMs);
        const detailHasStarted = detailTimeState.hasStarted;
        const detailRoomClosed =
          Boolean(detailTarget.isRoomClosed) || detailTimeState.isRoomClosed;
        const canJoinRoom =
          detailTarget.status === "accepted" &&
          !detailRoomClosed &&
          Boolean(effectiveLink);
        const isUpcoming =
          detailTarget.status === "pending" ||
          (detailTarget.status === "accepted" && !detailTarget.hasStarted);
        const resonanceMeta = getResonanceMeta(detailTarget.ownFeedback?.resonance);

        const hasFooterActions =
          (isViewingReceived && detailTarget.status === "pending") || isUpcoming;

        return (
          <Modal
            isOpen={Boolean(detailTarget)}
            onClose={() => setDetailTarget(null)}
            title="Detalle de la sesión"
            maxWidth="540px"
            footer={
              hasFooterActions ? (
                <div className="flex flex-wrap items-center justify-end gap-2 w-full">
                  {isViewingReceived && detailTarget.status === "pending" && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const target = detailTarget;
                          setDetailTarget(null);
                          setModalError("");
                          setDeclineNote("");
                          setDeclineTarget(target);
                        }}
                      >
                        Rechazar
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          const target = detailTarget;
                          setDetailTarget(null);
                          setModalError("");
                          setLinkError("");
                          setTermsError("");
                          setMeetingLink("");
                          setUseCustomLink(false);
                          setSpecialistNote("");
                          setAcceptedTerms(false);
                          setAcceptTarget(target);
                        }}
                      >
                        Aceptar sesión
                      </Button>
                    </>
                  )}

                  {isUpcoming && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => {
                        const target = detailTarget;
                        setDetailTarget(null);
                        setModalError("");
                        setCancelTarget(target);
                      }}
                    >
                      Cancelar sesión
                    </Button>
                  )}
                </div>
              ) : undefined
            }
          >
            <div className="flex flex-col gap-3.5 py-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/perfil/${person?.slug || person?.id || ""}`}
                  className="flex items-center gap-3 min-w-0 group no-underline"
                >
                  <UserAvatar
                    src={person?.avatarUrl}
                    alt={person?.name || "Usuario"}
                    size="md"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-title-section text-slate-900 group-hover:underline truncate">
                      {person?.name || "Usuario"}
                    </span>
                    <span className="text-meta text-slate-500 truncate">{subtitle}</span>
                  </div>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="soft"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      setDetailTarget(null);
                      handleOpenChat(person);
                    }}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Enviar mensaje</span>
                  </Button>
                  <span
                    className={`px-2.5 py-1 rounded-full border text-meta font-semibold font-jakarta shrink-0 ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200/70 px-3.5 py-3 flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-body font-semibold text-slate-900">
                    <CalendarCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-meta font-semibold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {detailTarget.startTime} – {detailTarget.endTime} hs
                    </span>
                  </div>
                </div>
                <div className="text-meta text-slate-500 pl-6">
                  15 minutos · {detailTarget.timezone || "Hora local"}
                </div>
              </div>

              {detailTarget.requesterNote && (
                <div className="text-body text-slate-700 bg-slate-50/70 border border-slate-200/60 rounded-xl px-3.5 py-2.5">
                  <span className="text-label text-slate-500 block mb-0.5">
                    {isViewingReceived
                      ? `Mensaje de ${person?.name || "la persona"}`
                      : "Tu mensaje"}
                  </span>
                  <p className="m-0 whitespace-pre-wrap">{detailTarget.requesterNote}</p>
                </div>
              )}

              {detailTarget.specialistNote && (
                <div className="text-body text-slate-700 bg-slate-50/70 border border-slate-200/60 rounded-xl px-3.5 py-2.5">
                  <span className="text-label text-slate-500 block mb-0.5">
                    {isViewingReceived
                      ? "Tu mensaje"
                      : `Mensaje de ${person?.name || "el especialista"}`}
                  </span>
                  <p className="m-0 whitespace-pre-wrap">{detailTarget.specialistNote}</p>
                </div>
              )}

              {!isViewingReceived && detailTarget.specialistGuidance && (
                <div className="text-body text-slate-700 bg-emerald-50/60 border border-emerald-200/70 rounded-xl px-3.5 py-2.5">
                  <span className="text-label text-emerald-700 block mb-0.5">
                    Orientación de {person?.name || "el especialista"}
                  </span>
                  <p className="m-0 whitespace-pre-wrap">{detailTarget.specialistGuidance}</p>
                </div>
              )}

              {detailTarget.status === "pending" && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-3.5 py-2.5 flex items-center gap-2.5">
                  <Video className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-meta text-slate-500">
                    {isViewingReceived
                      ? "El enlace de videollamada se generará al confirmar la sesión."
                      : `Verás el enlace de acceso cuando ${
                          person?.name || "el especialista"
                        } acepte la sesión.`}
                  </span>
                </div>
              )}

              {canJoinRoom && (
                <div
                  className={`rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 border ${
                    detailHasStarted
                      ? "bg-emerald-50/70 border-emerald-200/80"
                      : "bg-slate-50 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Video
                      className={`w-4 h-4 shrink-0 ${
                        detailHasStarted ? "text-emerald-600" : "text-slate-400"
                      }`}
                    />
                    <span
                      className={`text-meta font-medium truncate ${
                        detailHasStarted ? "text-emerald-900" : "text-slate-600"
                      }`}
                    >
                      {!detailHasStarted
                        ? `Disponible desde las ${detailTarget.startTime} hs`
                        : isExternalUrl(effectiveLink)
                          ? "Enlace de videollamada listo"
                          : effectiveLink}
                    </span>
                  </div>
                  {renderJoinAction(detailTarget, effectiveLink, detailHasStarted, "w-3 h-3")}
                </div>
              )}

              {detailTarget.status === "accepted" &&
                detailTarget.hasEnded &&
                !detailTarget.hasSubmittedFeedback && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between gap-3">
                    <span className="text-meta text-slate-600">
                      {isViewingReceived
                        ? "¿Cómo estuvo el encuentro? Deja tu valoración."
                        : "¿Cómo sentiste la sesión? Cuéntanos en 1 minuto."}
                    </span>
                    <Link
                      href={`/sesiones/feedback?sessionId=${detailTarget.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold font-jakarta shrink-0 no-underline transition-colors"
                    >
                      Dejar valoración
                    </Link>
                  </div>
                )}

              {detailTarget.ownFeedback && (
                <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl px-3.5 py-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-label text-slate-500">Tu valoración</span>
                    <span className="text-meta font-medium text-slate-600">
                      {detailTarget.ownFeedback.attended ? "Se realizó" : "No se realizó"}
                    </span>
                  </div>

                  {resonanceMeta && (() => {
                    const ResonanceIcon = resonanceMeta.Icon;
                    return (
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${resonanceMeta.iconClass}`}
                        >
                          <ResonanceIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-jakarta text-xs font-semibold text-slate-900 m-0">
                            {resonanceMeta.label}
                          </p>
                          <p className="text-meta text-slate-500 m-0">
                            {resonanceMeta.hint}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {detailTarget.ownFeedback.publicNote && (
                    <div className="border-t border-slate-200/60 pt-2.5 text-body text-slate-700">
                      <span className="text-label text-slate-500 block mb-0.5">
                        {isViewingReceived ? "Orientación enviada" : "Mensaje enviado"}
                      </span>
                      <p className="m-0 whitespace-pre-wrap">
                        {detailTarget.ownFeedback.publicNote}
                      </p>
                    </div>
                  )}

                  {detailTarget.ownFeedback.privateNote && (
                    <div className="border-t border-slate-200/60 pt-2.5 text-body text-slate-700">
                      <span className="text-label text-slate-500 inline-flex items-center gap-1 mb-0.5">
                        <Lock className="w-3 h-3" />
                        Nota privada para LUMINUS
                      </span>
                      <p className="m-0 whitespace-pre-wrap">
                        {detailTarget.ownFeedback.privateNote}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Modal>
        );
      })()}

      {/* Accept Session Modal */}
      <Modal
        isOpen={Boolean(acceptTarget)}
        onClose={() => !submitting && setAcceptTarget(null)}
        title="Confirmar sesión introductoria"
        maxWidth="520px"
        footer={
          <>
            <Button
              variant="secondary"
              fullWidth
              disabled={submitting}
              onClick={() => setAcceptTarget(null)}
            >
              Volver
            </Button>
            <Button
              variant="primary"
              fullWidth
              disabled={submitting}
              onClick={handleAcceptSubmit}
            >
              {submitting ? "Confirmando..." : "Confirmar y enviar enlace"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 py-1">
          {acceptTarget && (
            <IntroSessionSummaryCard
              counterpartyName={acceptTarget.requester?.name || "Usuario"}
              formattedDate={formatSessionDate(acceptTarget.scheduledDate)}
              timeLabel={`${acceptTarget.startTime} – ${acceptTarget.endTime} hs`}
              timezone={acceptTarget.timezone}
              note={acceptTarget.requesterNote || undefined}
              noteLabel={`Mensaje de ${acceptTarget.requester?.name || "la persona"}`}
            />
          )}

          <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2 rounded-xl bg-slate-50 border border-slate-200/80 px-3.5 py-2.5">
            <span className="text-xs text-slate-600">
              ¿Primera vez aceptando una solicitud?
            </span>
            <button
              type="button"
              onClick={() => {
                setGuideDefaultTab("especialistas");
                setShowGuide(true);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-slate-700 bg-transparent border-none p-0 cursor-pointer font-jakarta shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>¿Cómo funciona?</span>
            </button>
          </div>

          {wherebyEnabled && !useCustomLink ? (
            <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 px-3.5 py-3 flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <Video className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-emerald-950">
                    Videollamada automática
                  </span>
                  <p className="text-xs leading-relaxed text-emerald-900/90 m-0">
                    Crearemos la sala y enviaremos el enlace a ambos al confirmar.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setUseCustomLink(true);
                    if (modalError) setModalError("");
                    if (linkError) setLinkError("");
                  }}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline bg-transparent border-none p-0 cursor-pointer font-jakarta"
                >
                  Usar otro enlace
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <InputField
                ref={linkInputRef}
                id="accept-meeting-link"
                label="Enlace de videollamada"
                required
                placeholder="Pega el enlace aquí"
                value={meetingLink}
                onChange={(e) => {
                  setMeetingLink(e.target.value);
                  if (linkError) setLinkError("");
                  if (modalError) setModalError("");
                }}
                error={linkError || undefined}
              />
              <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <p className="text-xs text-slate-500 m-0">
                  Pega tu enlace de reunión.
                </p>
                {wherebyEnabled && (
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomLink(false);
                      setMeetingLink("");
                      if (linkError) setLinkError("");
                      if (modalError) setModalError("");
                    }}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline bg-transparent border-none p-0 cursor-pointer font-jakarta shrink-0"
                  >
                    Usar videollamada automática
                  </button>
                )}
              </div>
            </div>
          )}

          <TextAreaField
            id="accept-specialist-note"
            label="Mensaje adicional"
            placeholder="Agrega indicaciones o comentarios para la sesión..."
            value={specialistNote}
            onChange={(e) => setSpecialistNote(e.target.value)}
            maxLength={500}
            rows={3}
          />

          <div className="flex flex-col gap-1.5">
            <label
              className={`flex items-start gap-2.5 rounded-xl bg-slate-50 border p-3 cursor-pointer select-none transition-colors ${
                termsError ? "border-rose-500" : "border-slate-200/80"
              }`}
            >
              <input
                ref={termsInputRef}
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  if (termsError) setTermsError("");
                  if (modalError) setModalError("");
                }}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 shrink-0 cursor-pointer"
              />
              <span className="text-xs leading-relaxed text-slate-600">
                Brindo esta sesión de forma independiente, sin relación con LUMINUS, entiendo que la plataforma no responde por asistencia ni fallos técnicos, y acepto las{" "}
                <a
                  href="https://luminuslatam.com/legal/condiciones-especialistas"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-slate-900 underline hover:text-slate-700"
                >
                  Condiciones para Especialistas
                </a>{" "}
                y de{" "}
                <a
                  href="https://luminuslatam.com/legal/sesiones-introductorias"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-slate-900 underline hover:text-slate-700"
                >
                  Sesiones Introductorias
                </a>
                .
              </span>
            </label>
            {termsError && (
              <p className="text-xs font-medium text-rose-600 px-0.5 m-0">
                {termsError}
              </p>
            )}
          </div>
          {modalError && (
            <p className="text-xs font-medium text-rose-600 m-0">{modalError}</p>
          )}
        </div>
      </Modal>

      {/* Decline Session Modal */}
      <Modal
        isOpen={Boolean(declineTarget)}
        onClose={() => !submitting && setDeclineTarget(null)}
        title="Rechazar solicitud"
        subtitle="El horario volverá a quedar disponible."
        maxWidth="520px"
        footer={
          <>
            <Button
              variant="secondary"
              fullWidth
              disabled={submitting}
              onClick={() => setDeclineTarget(null)}
            >
              Volver
            </Button>
            <Button
              variant="destructive"
              fullWidth
              disabled={submitting}
              onClick={handleDeclineSubmit}
            >
              {submitting ? "Rechazando..." : "Confirmar rechazo"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 py-1">
          {declineTarget && (
            <IntroSessionSummaryCard
              counterpartyName={declineTarget.requester?.name || "Usuario"}
              formattedDate={formatSessionDate(declineTarget.scheduledDate)}
              timeLabel={`${declineTarget.startTime} – ${declineTarget.endTime} hs`}
              timezone={declineTarget.timezone}
            />
          )}
          <TextAreaField
            id="decline-specialist-note"
            label="Motivo o sugerencia (Opcional)"
            placeholder="Explica el motivo o sugiere otro horario disponible..."
            value={declineNote}
            onChange={(e) => setDeclineNote(e.target.value)}
            maxLength={500}
            rows={3}
          />
          {modalError && (
            <p className="text-xs font-medium text-rose-600 m-0">{modalError}</p>
          )}
        </div>
      </Modal>

      {/* Cancel Session Modal */}
      <Modal
        isOpen={Boolean(cancelTarget)}
        onClose={() => !submitting && setCancelTarget(null)}
        title="Cancelar sesión"
        maxWidth="520px"
        footer={
          <>
            <Button
              variant="secondary"
              fullWidth
              disabled={submitting}
              onClick={() => setCancelTarget(null)}
            >
              Volver
            </Button>
            <Button
              variant="destructive"
              fullWidth
              disabled={submitting}
              onClick={handleCancelSubmit}
            >
              {submitting ? "Cancelando..." : "Sí, cancelar sesión"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 py-1">
          {cancelTarget && (
            <IntroSessionSummaryCard
              counterpartyName={
                (isViewingReceived
                  ? cancelTarget.requester?.name
                  : cancelTarget.specialist?.name) || "la otra persona"
              }
              formattedDate={formatSessionDate(cancelTarget.scheduledDate)}
              timeLabel={`${cancelTarget.startTime} – ${cancelTarget.endTime} hs`}
              timezone={cancelTarget.timezone}
            />
          )}
          <p className="text-body text-slate-600 m-0 text-center">
            ¿Estás seguro de que quieres cancelar esta sesión introductoria?
            Avisaremos a la otra persona por notificación y chat.
          </p>
          {modalError && (
            <p className="text-xs font-medium text-rose-600 m-0">{modalError}</p>
          )}
        </div>
      </Modal>

      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />

      <IntroSessionGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        defaultTab={guideDefaultTab}
      />
    </div>
  );
}

export default function SesionesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <SesionesContent />
    </Suspense>
  );
}
