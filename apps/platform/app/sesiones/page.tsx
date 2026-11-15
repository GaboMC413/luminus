"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarCheck,
  Clock,
  ExternalLink,
  MessageSquare,
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

type SessionUser = {
  id: string;
  slug?: string | null;
  name: string;
  avatarUrl: string;
  specialty?: string;
  profession?: string;
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
  specialistNote: string;
  requester?: SessionUser;
  specialist?: SessionUser;
};

function getStatusBadge(status: IntroSessionItem["status"]) {
  switch (status) {
    case "accepted":
      return {
        label: "Confirmada",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      };
    case "pending":
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

function SesionesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get("tab");

  const [requestedSessions, setRequestedSessions] = useState<IntroSessionItem[]>([]);
  const [receivedSessions, setReceivedSessions] = useState<IntroSessionItem[]>([]);
  const [isSpecialist, setIsSpecialist] = useState(false);
  const [wherebyEnabled, setWherebyEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
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
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const [toast, setToast] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
    type: "success" | "error";
  }>({ isOpen: false, title: "", type: "success" });

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/sessions", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401) {
        router.push("/auth/iniciar-sesion");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "No pudimos cargar tus sesiones.");
      }

      const data = await res.json();
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
    loadSessions();
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
    if (manualLinkRequired && !meetingLink.trim()) {
      setModalError("Ingresa el enlace de reunión o cómo se conectarán.");
      return;
    }
    if (!acceptedTerms) {
      setModalError("Debes aceptar las condiciones para confirmar la sesión.");
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
      await loadSessions();
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
      await loadSessions();
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
      await loadSessions();
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
              const badge = getStatusBadge(item.status);
              const formattedDate = capitalizeFirst(
                formatSessionDate(item.scheduledDate)
              );

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-none"
                >
                  <div className="flex flex-col gap-3.5">
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

                    {/* Date & Time */}
                    <div className="rounded-xl bg-slate-50 border border-slate-200/70 px-3.5 py-3 flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-body font-semibold text-slate-900">
                          <CalendarCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-meta font-semibold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {item.startTime} – {item.endTime} hs
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-meta text-slate-500 pl-6">
                        <span>15 minutos · {item.timezone || "Hora local"}</span>
                      </div>
                    </div>

                    {/* Messages */}
                    {item.requesterNote && (
                      <div className="text-body text-slate-700 bg-slate-50/70 border border-slate-200/60 rounded-xl px-3.5 py-2.5">
                        <span className="text-label text-slate-500 block mb-0.5">
                          {isViewingReceived
                            ? `Mensaje de ${person?.name || "la persona"}`
                            : "Tu mensaje"}
                        </span>
                        <p className="m-0 whitespace-pre-wrap">{item.requesterNote}</p>
                      </div>
                    )}

                    {item.specialistNote && (
                      <div className="text-body text-slate-700 bg-slate-50/70 border border-slate-200/60 rounded-xl px-3.5 py-2.5">
                        <span className="text-label text-slate-500 block mb-0.5">
                          {isViewingReceived
                            ? "Tu mensaje"
                            : `Mensaje de ${person?.name || "el especialista"}`}
                        </span>
                        <p className="m-0 whitespace-pre-wrap">{item.specialistNote}</p>
                      </div>
                    )}

                    {/* Pending Link Placeholder */}
                    {item.status === "pending" && (
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

                    {/* Meeting Link when accepted */}
                    {item.status === "accepted" &&
                      (item.meetingLink || item.hostMeetingLink) && (() => {
                        const effectiveLink =
                          isViewingReceived && item.hostMeetingLink
                            ? item.hostMeetingLink
                            : item.meetingLink;
                        return (
                          <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 px-3.5 py-2.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <Video className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="text-meta font-medium text-emerald-900 truncate">
                                {isExternalUrl(effectiveLink)
                                  ? "Enlace de videollamada listo"
                                  : effectiveLink}
                              </span>
                            </div>
                            {isExternalUrl(effectiveLink) && (
                              <a
                                href={effectiveLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold font-jakarta shrink-0 no-underline transition-colors"
                              >
                                <span>Unirse</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        );
                      })()}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    {isViewingReceived && item.status === "pending" ? (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="primary"
                          size="sm"
                          className="gap-1.5 flex-1 sm:flex-initial"
                          onClick={() => {
                            setModalError("");
                            setMeetingLink("");
                            setUseCustomLink(false);
                            setSpecialistNote("");
                            setAcceptedTerms(false);
                            setAcceptTarget(item);
                          }}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aceptar sesión</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="gap-1.5 flex-1 sm:flex-initial"
                          onClick={() => {
                            setModalError("");
                            setDeclineNote("");
                            setDeclineTarget(item);
                          }}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Rechazar</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 w-full">
                        <Button
                          variant="soft"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleOpenChat(person)}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Enviar mensaje</span>
                        </Button>
                        {(item.status === "pending" ||
                          item.status === "accepted") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            onClick={() => {
                              setModalError("");
                              setCancelTarget(item);
                            }}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
              disabled={submitting || !acceptedTerms}
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
                id="accept-meeting-link"
                label="Enlace de videollamada"
                required
                placeholder="Pega el enlace aquí"
                value={meetingLink}
                onChange={(e) => {
                  setMeetingLink(e.target.value);
                  if (modalError) setModalError("");
                }}
                error={modalError || undefined}
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

          <label className="flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-200/80 p-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
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
          {wherebyEnabled && !useCustomLink && modalError && (
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
