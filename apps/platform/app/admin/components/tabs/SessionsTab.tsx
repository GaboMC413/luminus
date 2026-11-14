"use client";

import { useMemo, useState } from "react";
import { AdminIntroSession, AdminTab, AdminUser } from "../../types";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatShortTime } from "../../utils";
import { AdminBadge, AdminCard, AdminDetailRow } from "../AdminDesignSystem";

interface SessionsTabProps {
  sessions: AdminIntroSession[];
  setSessions: React.Dispatch<React.SetStateAction<AdminIntroSession[]>>;
  users: AdminUser[];
  selectedSessionId: string | null;
  setSelectedSessionId: (id: string | null) => void;
  setActiveTab: (tab: AdminTab) => void;
  setSelectedUserId: (id: string) => void;
  setUserSubTab: (tab: "activos" | "mecenas" | "cerradas" | "deshabilitados") => void;
  setSelectedSpecialistUserId: (id: string | null) => void;
  setSpecialistSubTab: (tab: "lista" | "postulaciones") => void;
}

function getSessionStatusBadge(status: AdminIntroSession["status"]) {
  switch (status) {
    case "pending":
      return <AdminBadge variant="pending">Pendiente</AdminBadge>;
    case "accepted":
      return <AdminBadge variant="active">Confirmada</AdminBadge>;
    case "declined":
      return <AdminBadge variant="disabled">Rechazada</AdminBadge>;
    case "cancelled":
      return <AdminBadge variant="deleted">Cancelada</AdminBadge>;
  }
}

export function SessionsTab({
  sessions,
  setSessions,
  users,
  selectedSessionId,
  setSelectedSessionId,
  setActiveTab,
  setSelectedUserId,
  setUserSubTab,
  setSelectedSpecialistUserId,
  setSpecialistSubTab,
}: SessionsTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const counts = useMemo(() => {
    return {
      all: sessions.length,
      pending: sessions.filter((s) => s.status === "pending").length,
      accepted: sessions.filter((s) => s.status === "accepted").length,
      declined: sessions.filter((s) => s.status === "declined").length,
      cancelled: sessions.filter((s) => s.status === "cancelled").length,
    };
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        s.requester.name.toLowerCase().includes(q) ||
        s.requester.email.toLowerCase().includes(q) ||
        s.specialist.name.toLowerCase().includes(q) ||
        s.specialist.email.toLowerCase().includes(q) ||
        s.scheduledDate.includes(q)
      );
    });
  }, [sessions, statusFilter, search]);

  const selectedSession =
    filteredSessions.find((s) => s.id === selectedSessionId) ?? filteredSessions[0] ?? null;

  function jumpToUser(userId: string) {
    const target = users.find((u) => u.id === userId);
    setSelectedUserId(userId);
    setUserSubTab(
      target?.status === "deleted"
        ? "cerradas"
        : target?.status === "disabled"
          ? "deshabilitados"
          : "activos"
    );
    setActiveTab("usuarios");
  }

  function jumpToSpecialist(userId: string) {
    setSelectedSpecialistUserId(userId);
    setSpecialistSubTab("lista");
    setActiveTab("especialistas");
  }

  async function handleAdminCancelSession() {
    if (!selectedSession || isCancelling) return;
    setIsCancelling(true);
    setActionMessage("");
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedSession.id, action: "cancel" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMessage(data.message || "No se pudo cancelar la sesión.");
        return;
      }
      if (data.session) {
        setSessions((prev) =>
          prev.map((item) => (item.id === selectedSession.id ? data.session : item))
        );
      }
      setActionMessage("Sesión cancelada y sala liberada correctamente.");
      setShowCancelModal(false);
    } catch {
      setActionMessage("Error de conexión al cancelar la sesión.");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="w-full p-6 md:p-8 h-[calc(100vh-64px)] overflow-hidden flex flex-col box-border gap-4">
      {/* Header + Summary Counters */}
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-[28px] font-bold leading-tight font-jakarta text-slate-900">
            Sesiones Introductorias
          </h1>
          <p className="mt-0.5 text-[14px] text-slate-500 font-sans">
            Supervisión de solicitudes, salas Whereby y aceptación de condiciones (15 min).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 flex-wrap">
          <span className="text-slate-500">Total:</span>
          <span className="font-bold text-slate-900">{counts.all}</span>
          <span className="text-slate-300">|</span>
          <span className="text-amber-700">Pendientes: {counts.pending}</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-700">Confirmadas: {counts.accepted}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Rechazadas: {counts.declined}</span>
          <span className="text-slate-300">|</span>
          <span className="text-rose-700">Canceladas: {counts.cancelled}</span>
        </div>
      </div>

      {/* Master-Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-6 items-start flex-1 min-h-0">
        {/* Left: Sessions List */}
        <AdminCard
          className={`${showMobileDetail ? "hidden lg:flex" : "flex"} flex-col min-w-0 h-full overflow-hidden`}
        >
          <div className="p-4 border-b border-slate-200/80 bg-white flex items-center gap-3 shrink-0">
            <div className="min-w-[140px] shrink-0">
              <SelectInput
                value={statusFilter}
                options={[
                  { label: `Todas · ${counts.all}`, value: "all" },
                  { label: `Pendientes · ${counts.pending}`, value: "pending" },
                  { label: `Confirmadas · ${counts.accepted}`, value: "accepted" },
                  { label: `Rechazadas · ${counts.declined}`, value: "declined" },
                  { label: `Canceladas · ${counts.cancelled}`, value: "cancelled" },
                ]}
                onSelect={(val) => setStatusFilter(val)}
                className="!h-10 text-xs font-bold"
              />
            </div>

            <div className="flex-1 min-w-0">
              <InputField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar miembro, especialista o fecha"
                className="!w-full !h-10 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-[44%_30%_26%] border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
            <span>Participantes</span>
            <span>Fecha / Hora</span>
            <span>Estado</span>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto min-h-0">
            {filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <span className="material-symbols-rounded text-[44px] mb-2 text-slate-300">
                  event_busy
                </span>
                <p className="text-sm font-medium">No se encontraron sesiones.</p>
              </div>
            ) : (
              filteredSessions.map((s) => {
                const active = s.id === selectedSession?.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedSessionId(s.id);
                      setActionMessage("");
                      setShowMobileDetail(true);
                    }}
                    className={`grid w-full grid-cols-[44%_30%_26%] items-center px-4 py-3.5 text-left text-[13px] transition outline-none cursor-pointer border-y-0 border-r-0 ${
                      active
                        ? "bg-slate-100/90 font-semibold border-l-4 border-slate-900"
                        : "bg-white border-l-4 border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <span className="min-w-0 pr-2">
                      <span className="block truncate font-semibold text-slate-900">
                        {s.requester.name}
                      </span>
                      <span className="block truncate text-[11.5px] text-slate-500">
                        → {s.specialist.name}
                      </span>
                    </span>

                    <span className="min-w-0 pr-2">
                      <span className="block text-xs font-semibold text-slate-800">
                        {s.scheduledDate}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        {s.startTime} - {s.endTime}
                      </span>
                    </span>

                    <span>{getSessionStatusBadge(s.status)}</span>
                  </button>
                );
              })
            )}
          </div>
        </AdminCard>

        {/* Right: Session Detail */}
        {selectedSession ? (
          <AdminCard
            className={`${showMobileDetail ? "flex" : "hidden lg:flex"} flex-col min-w-0 h-full overflow-hidden`}
          >
            <div className="lg:hidden p-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setShowMobileDetail(false)}
                className="flex items-center gap-2 text-xs font-bold text-white hover:text-slate-200 cursor-pointer bg-transparent border-none"
              >
                <span className="material-symbols-rounded text-[18px]">arrow_back</span>
                <span>Volver a sesiones</span>
              </button>
            </div>

            <div className="border-b border-slate-200/80 p-6 bg-white shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900 font-jakarta">
                      {selectedSession.scheduledDate} · {selectedSession.startTime} -{" "}
                      {selectedSession.endTime}
                    </h2>
                    {getSessionStatusBadge(selectedSession.status)}
                    {selectedSession.wherebyMeetingId && (
                      <AdminBadge variant="specialist">Whereby Auto</AdminBadge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Zona horaria: {selectedSession.timezone} · Solicitada el{" "}
                    {formatShortTime(selectedSession.createdAt)}
                  </p>
                </div>

                {(selectedSession.status === "pending" ||
                  selectedSession.status === "accepted") && (
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 cursor-pointer transition-colors shrink-0"
                  >
                    Cancelar sesión
                  </button>
                )}
              </div>

              {actionMessage && (
                <p className="mt-3 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 text-slate-800">
                  {actionMessage}
                </p>
              )}
            </div>

            <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto min-h-0 text-sm">
              {/* Participants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-100 flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Miembro Solicitante
                  </span>
                  <p className="font-bold text-slate-900 truncate">
                    {selectedSession.requester.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {selectedSession.requester.email}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => jumpToUser(selectedSession.requesterId)}
                    className="!h-8 mt-1 text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-none"
                  >
                    Ver perfil de usuario
                  </Button>
                </div>

                <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-100 flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Especialista
                  </span>
                  <p className="font-bold text-slate-900 truncate">
                    {selectedSession.specialist.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {selectedSession.specialist.specialty} · {selectedSession.specialist.email}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => jumpToSpecialist(selectedSession.specialistId)}
                    className="!h-8 mt-1 text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-none"
                  >
                    Ver perfil de especialista
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Notas de la Sesión
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                    <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                      Nota del Miembro
                    </span>
                    <p className="text-[13px] text-slate-700 whitespace-pre-wrap">
                      {selectedSession.requesterNote || "Sin nota."}
                    </p>
                  </div>
                  {selectedSession.specialistNote && (
                    <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                      <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                        Nota del Especialista
                      </span>
                      <p className="text-[13px] text-slate-700 whitespace-pre-wrap">
                        {selectedSession.specialistNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Room & Links */}
              <div>
                <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Sala de Video y Enlaces
                </h3>
                <div className="bg-slate-50/50 rounded-xl p-1 divide-y divide-slate-100">
                  <AdminDetailRow
                    label="Enlace Miembro"
                    value={
                      selectedSession.meetingLink ? (
                        <a
                          href={selectedSession.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline text-xs"
                        >
                          {selectedSession.meetingLink}
                        </a>
                      ) : (
                        "Sin enlace generado"
                      )
                    }
                  />
                  <AdminDetailRow
                    label="Enlace Anfitrión (Host)"
                    value={
                      selectedSession.hostMeetingLink ? (
                        <a
                          href={selectedSession.hostMeetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline text-xs"
                        >
                          {selectedSession.hostMeetingLink}
                        </a>
                      ) : (
                        "-"
                      )
                    }
                  />
                  <AdminDetailRow
                    label="Whereby Meeting ID"
                    value={
                      <span className="font-mono text-xs">
                        {selectedSession.wherebyMeetingId || "-"}
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Legal Audit */}
              <div>
                <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Auditoría Legal (Condiciones)
                </h3>
                <div className="bg-slate-50/50 rounded-xl p-1 divide-y divide-slate-100">
                  <AdminDetailRow
                    label="Aceptación del Miembro"
                    value={
                      selectedSession.requesterTermsAcceptedAt
                        ? formatShortTime(selectedSession.requesterTermsAcceptedAt)
                        : "No registrada"
                    }
                  />
                  <AdminDetailRow
                    label="Aceptación del Especialista"
                    value={
                      selectedSession.specialistTermsAcceptedAt
                        ? formatShortTime(selectedSession.specialistTermsAcceptedAt)
                        : "Pendiente"
                    }
                  />
                </div>
              </div>
            </div>
          </AdminCard>
        ) : (
          <AdminCard className="flex items-center justify-center p-8 text-center text-slate-400 min-h-[300px]">
            <p className="text-sm font-medium">
              Selecciona una sesión de la lista para ver sus detalles.
            </p>
          </AdminCard>
        )}
      </div>

      {showCancelModal && selectedSession && (
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancelar sesión introductoria"
          maxWidth="440px"
          footer={
            <div className="flex gap-3 w-full">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border-none shadow-none text-xs h-10"
              >
                Volver
              </Button>
              <Button
                type="button"
                disabled={isCancelling}
                onClick={handleAdminCancelSession}
                className="flex-1 font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 h-10 disabled:opacity-50"
              >
                {isCancelling ? "Cancelando..." : "Confirmar cancelación"}
              </Button>
            </div>
          }
        >
          <p className="text-sm text-slate-600 leading-relaxed">
            ¿Deseas cancelar la sesión del{" "}
            <strong className="text-slate-900">
              {selectedSession.scheduledDate} ({selectedSession.startTime})
            </strong>{" "}
            entre {selectedSession.requester.name} y {selectedSession.specialist.name}? Se
            liberará el horario y se notificará a ambos participantes.
          </p>
        </Modal>
      )}
    </div>
  );
}
