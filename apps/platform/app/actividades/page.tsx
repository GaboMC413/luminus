"use client";

import { useState, useEffect } from "react";
import { CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { UnderlineTabs } from "@/components/ui/UnderlineTabs";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Toast, ToastProps } from "@/components/ui/Toast";
import { ActivityCard, ActivityEventItem } from "@/components/events/ActivityCard";
import { InscriptionCard, InscriptionCardSkeleton } from "@/components/events/InscriptionCard";
import { ActivitiesTimelineSkeleton } from "@/components/ui/Skeleton";
import { getCachedData, setCachedData, fetchWithCache } from "@/lib/clientCache";

function parseCalendarDate(dateStr?: string | Date | null): Date | null {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;
  const str = String(dateStr).trim();
  if (!str) return null;

  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    return new Date(year, month, day);
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function formatTimelineDate(dateStr?: string | null) {
  if (!dateStr) return { dayMonth: "Próximamente", weekday: "" };
  const d = parseCalendarDate(dateStr);
  if (!d) return { dayMonth: dateStr, weekday: "" };

  const day = d.getDate();
  const monthRaw = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
  const month = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1);

  const weekdayRaw = d.toLocaleDateString("es-ES", { weekday: "long" });
  const weekday = weekdayRaw.charAt(0).toUpperCase() + weekdayRaw.slice(1);

  return {
    dayMonth: `${day} ${month}`,
    weekday: weekday,
  };
}

export default function ActividadesPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "inscriptions">("upcoming");
  const [upcomingEvents, setUpcomingEvents] = useState<ActivityEventItem[]>(
    () => getCachedData<ActivityEventItem[]>("/api/events") ?? []
  );
  const [inscribedEvents, setInscribedEvents] = useState<ActivityEventItem[]>(
    () => getCachedData<ActivityEventItem[]>("/api/events?type=inscriptions") ?? []
  );
  const [loading, setLoading] = useState<boolean>(
    () => !getCachedData<ActivityEventItem[]>("/api/events")
  );
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState<ActivityEventItem | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [toastConfig, setToastConfig] = useState<Omit<ToastProps, "onClose">>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  useEffect(() => {
    async function fetchEvents() {
      try {
        if (!getCachedData<ActivityEventItem[]>("/api/events")) {
          setLoading(true);
        }
        const [upcomingList, inscriptionsList] = await Promise.all([
          fetchWithCache(
            "/api/events",
            async () => {
              const upcomingRes = await fetch("/api/events");
              if (!upcomingRes.ok) {
                throw new Error("No se pudieron cargar las actividades.");
              }
              const upcomingData = await upcomingRes.json();
              return (upcomingData.events || []) as ActivityEventItem[];
            },
            { ttlMs: 60_000 }
          ),
          fetchWithCache(
            "/api/events?type=inscriptions",
            async () => {
              const inscriptionsRes = await fetch("/api/events?type=inscriptions");
              if (!inscriptionsRes.ok) {
                return getCachedData<ActivityEventItem[]>("/api/events?type=inscriptions") ?? [];
              }
              const inscriptionsData = await inscriptionsRes.json();
              return (inscriptionsData.events || []) as ActivityEventItem[];
            },
            { ttlMs: 60_000 }
          ),
        ]);

        setUpcomingEvents(upcomingList);
        setInscribedEvents(inscriptionsList);
      } catch (err: any) {
        setError(err.message || "Error al cargar actividades.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelTarget || isCancelling) return;
    setIsCancelling(true);
    try {
      const res = await fetch("/api/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: cancelTarget.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo cancelar la inscripción.");
      }

      const targetId = cancelTarget.id;
      const targetTitle = cancelTarget.title;

      setInscribedEvents((prev) => {
        const next = prev.filter((item) => item.id !== targetId);
        setCachedData("/api/events?type=inscriptions", next);
        return next;
      });
      setUpcomingEvents((prev) => {
        const next = prev.map((item) => (item.id === targetId ? { ...item, isRegistered: false } : item));
        setCachedData("/api/events", next);
        return next;
      });
      setCancelTarget(null);
      setToastConfig({
        isOpen: true,
        title: "Inscripción cancelada",
        message: `Se canceló tu inscripción a "${targetTitle}".`,
        type: "success",
      });
    } catch (err: any) {
      setToastConfig({
        isOpen: true,
        title: "Error al cancelar",
        message: err.message || "Ocurrió un problema inesperado.",
        type: "error",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const displayedEvents = activeTab === "upcoming" ? upcomingEvents : inscribedEvents;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 pb-12 pt-4 font-sans sm:px-6 md:gap-7 md:py-6">
      {/* 1. Standardized In-App Header */}
      <PageHeader
        title="Actividades"
        description="Eventos y actividades sobre bienestar."
      />

      {/* 2. Navigation Tabs */}
      <UnderlineTabs
        tabs={[
          { id: "upcoming", label: "Próximas actividades" },
          { id: "inscriptions", label: "Mis inscripciones" },
        ]}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as "upcoming" | "inscriptions")}
      />

      {/* 3. Main Content: Timeline for upcoming, compact grid for inscriptions */}
      {loading ? (
        activeTab === "inscriptions" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-1">
            {[...Array(4)].map((_, i) => (
              <InscriptionCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <ActivitiesTimelineSkeleton />
        )
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
          {error}
        </div>
      ) : displayedEvents.length === 0 ? (
        activeTab === "upcoming" ? (
          <EmptyState
            title="No hay próximas actividades disponibles"
            description="Muy pronto estaremos compartiendo nuevas charlas, talleres y experiencias LUMINUS."
          />
        ) : (
          <div className="w-full bg-white rounded-2xl border border-slate-200/90">
            <EmptyState
              icon={<CalendarCheck className="w-6 h-6 stroke-[1.75]" />}
              title="Aún no tienes inscripciones"
              description="Cuando te inscribas a una charla o taller, aparecerá aquí junto con su historial y grabaciones."
              action={
                <Button variant="primary" size="md" onClick={() => setActiveTab("upcoming")}>
                  Explorar próximas actividades
                </Button>
              }
            />
          </div>
        )
      ) : activeTab === "inscriptions" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-1">
          {inscribedEvents.map((item) => (
            <InscriptionCard key={item.id} event={item} />
          ))}
        </div>
      ) : (
        <div className="w-full flex flex-col">
          {displayedEvents.map((item, index) => {
            const isLast = index === displayedEvents.length - 1;
            const { dayMonth, weekday } = formatTimelineDate(item.date);

            return (
              <div key={item.id} className="flex gap-4 sm:gap-6 md:gap-7 items-stretch group">
                {/* Timeline Indicator Column */}
                <div className="w-6 shrink-0 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-slate-400 group-hover:bg-slate-900 transition-colors border-2 border-white ring-2 ring-slate-100 shrink-0 mt-1.5 z-10" />
                  {!isLast && <div className="flex-1 w-[2px] bg-slate-200" />}
                  {isLast && (
                    <div className="flex-1 w-[2px] bg-gradient-to-b from-slate-200 to-transparent" />
                  )}
                </div>

                {/* Content Column */}
                <div className={`flex-1 min-w-0 flex flex-col gap-3.5 ${isLast ? "pb-4" : "pb-10 sm:pb-12"}`}>
                  {/* Date Header */}
                  <div className="flex items-baseline text-base sm:text-lg font-bold font-jakarta text-slate-900 tracking-tight select-none">
                    <span>{dayMonth}</span>
                    {weekday && (
                      <span className="ml-2 font-medium font-sans text-slate-500 text-sm sm:text-base">
                        {weekday}
                      </span>
                    )}
                  </div>

                  {/* Standardized Activity Card */}
                  <ActivityCard event={item} onRequestCancel={setCancelTarget} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Subscription Confirmation Modal */}
      <Modal
        isOpen={Boolean(cancelTarget)}
        onClose={() => !isCancelling && setCancelTarget(null)}
        title="¿Cancelar inscripción?"
        maxWidth="400px"
        hideDividers
        containerClassName="!shadow-none"
        headerClassName="px-5 pt-5 pb-2"
        contentClassName="px-5 py-2"
        footerClassName="px-5 pt-3 pb-5 flex flex-row items-center gap-2.5 w-full"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCancelTarget(null)}
              disabled={isCancelling}
              className="flex-1"
            >
              Volver
            </Button>
            <Button
              variant="destructive"
              size="md"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="flex-1"
            >
              {isCancelling ? "Cancelando..." : "Sí, cancelar"}
            </Button>
          </>
        }
      >
        <p className="text-sm font-sans text-slate-600 leading-relaxed">
          Se liberará tu lugar en{" "}
          <span className="font-semibold text-slate-900">
            {cancelTarget?.title}
          </span>
          .
        </p>
      </Modal>

      <Toast
        isOpen={toastConfig.isOpen}
        title={toastConfig.title}
        message={toastConfig.message}
        type={toastConfig.type}
        onClose={() => setToastConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
