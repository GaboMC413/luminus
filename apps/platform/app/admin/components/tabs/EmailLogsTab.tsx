"use client";

import { useState, useMemo } from "react";
import { AdminEmailLog } from "../../types";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { Button } from "@/components/ui/Button";
import { formatShortTime, getPresetStartDate } from "../../utils";
import { AdminCard } from "../AdminDesignSystem";

import {
  renderWelcomeEmailHtml,
  renderPasswordResetEmailHtml,
  renderEmailChangeVerificationHtml,
  renderContactNotificationEmailHtml,
  renderEventRegistrationEmailHtml,
} from "@/lib/mails";

interface EmailLogsTabProps {
  emailLogs: AdminEmailLog[];
}

const templatesData = {
  welcome: {
    name: "Bienvenida a LUMINUS (Welcome Email)",
    subject: "¡Te damos la bienvenida a LUMINUS!",
    htmlBody: renderWelcomeEmailHtml("Usuario LUMINUS"),
  },
  recovery: {
    name: "Restablecer contraseña (Password Recovery)",
    subject: "Codigo de recuperacion de LUMINUS",
    htmlBody: renderPasswordResetEmailHtml("123456"),
  },
  emailChange: {
    name: "Confirmar Email (Email Change Verification)",
    subject: "Codigo para confirmar tu email de LUMINUS",
    htmlBody: renderEmailChangeVerificationHtml("654321"),
  },
  contact: {
    name: "Notificación de Contacto (Contact Request)",
    subject: "Nuevo mensaje de contacto de Gabriel Montenegro",
    htmlBody: renderContactNotificationEmailHtml({
      nombre: "Gabriel",
      apellido: "Montenegro",
      email: "gabrielmedcap@hotmail.com",
      telefono: "+54 9 11 2345-6789",
      motivo: "Consulta General / Especialistas",
      mensaje: "Hola, me gustaría recibir más información.",
    }),
  },
  eventRegistration: {
    name: "Confirmación de Inscripción a Evento (Event Registration)",
    subject: "[LUMINUS] Confirmación de inscripción: Sexualidad sin tabúes",
    htmlBody: renderEventRegistrationEmailHtml({
      firstName: "Gabriel",
      eventTitle: "Sexualidad sin tabúes: cuerpo, vínculos y comunicación",
      eventCoverUrl: "https://luminuslatam.com/images/placeholder-event.jpg",
      eventDate: "2026-09-19T18:00:00.000Z",
      timeText: "18:00 hs (GMT-3)",
      speakerName: "Dra. Sofía Martínez",
      youtubeUrl: "https://www.youtube.com/@luminus_latam",
    }),
  },
};

export function EmailLogsTab({ emailLogs }: EmailLogsTabProps) {
  const [emailSubTab, setEmailSubTab] = useState<"historial" | "plantillas">("historial");
  const [emailSearch, setEmailSearch] = useState("");
  const [emailDatePreset, setEmailDatePreset] = useState("all");
  const [emailStartDate, setEmailStartDate] = useState("");
  const [emailEndDate, setEmailEndDate] = useState("");
  const [selectedEmailLogId, setSelectedEmailLogId] = useState<string>(emailLogs[0]?.id ?? "");
  const [selectedTemplate, setSelectedTemplate] = useState<"welcome" | "recovery" | "emailChange" | "contact" | "eventRegistration">("welcome");

  const filteredEmailLogs = useMemo(() => {
    return emailLogs.filter((log) => {
      // 1. Text filter
      if (emailSearch.trim()) {
        const query = emailSearch.trim().toLowerCase();
        const matchRecipient = log.recipient.toLowerCase().includes(query);
        const matchSubject = log.subject.toLowerCase().includes(query);
        if (!matchRecipient && !matchSubject) return false;
      }

      // 2. Date filter
      const createdAt = new Date(log.createdAt);
      if (emailDatePreset !== "all") {
        if (emailDatePreset === "custom") {
          if (emailStartDate) {
            const start = new Date(emailStartDate);
            start.setHours(0, 0, 0, 0);
            if (createdAt < start) return false;
          }
          if (emailEndDate) {
            const end = new Date(emailEndDate);
            end.setHours(23, 59, 59, 999);
            if (createdAt > end) return false;
          }
        } else {
          const startDate = getPresetStartDate(emailDatePreset);
          if (startDate && createdAt < startDate) return false;
        }
      }

      return true;
    });
  }, [emailLogs, emailSearch, emailDatePreset, emailStartDate, emailEndDate]);

  const selectedEmailLog = emailLogs.find((log) => log.id === selectedEmailLogId) ?? filteredEmailLogs[0] ?? null;

  const hasActiveFilters =
    emailSearch !== "" ||
    emailDatePreset !== "all" ||
    emailStartDate !== "" ||
    emailEndDate !== "";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold leading-tight font-jakarta">Mails Enviados</h1>
          <p className="mt-1 text-[14px] text-slate-500">Gestión y control de correos del sistema</p>
        </div>

        {/* Sub-tab selection */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setEmailSubTab("historial")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none outline-none ${
              emailSubTab === "historial"
                ? "bg-white text-slate-950 shadow-none font-bold"
                : "bg-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Historial de Envíos
          </button>
          <button
            onClick={() => setEmailSubTab("plantillas")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none outline-none ${
              emailSubTab === "plantillas"
                ? "bg-white text-slate-950 shadow-none font-bold"
                : "bg-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Plantillas de Diseño
          </button>
        </div>
      </header>

      {emailSubTab === "historial" ? (
        <div className="flex flex-col gap-5">
          {/* Filter Toolbar */}
          <AdminCard className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-60">
                <InputField
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  placeholder="Buscar por email de destinatario o asunto..."
                  className="w-full! h-10! text-xs"
                />
              </div>

              <div className="min-w-40">
                <SelectInput
                  value={emailDatePreset}
                  options={[
                    { label: "Todo el tiempo", value: "all" },
                    { label: "Esta semana", value: "week" },
                    { label: "Este mes", value: "month" },
                    { label: "Últimos 6 meses", value: "6months" },
                    { label: "Este año", value: "year" },
                    { label: "Trimestre actual", value: "quarter" },
                    { label: "Fechas fijas", value: "custom" },
                  ]}
                  onSelect={(val) => setEmailDatePreset(val)}
                  className="h-10! text-xs"
                />
              </div>

              {emailDatePreset === "custom" && (
                <>
                  <div className="w-30">
                    <InputField
                      type="date"
                      value={emailStartDate}
                      onChange={(e) => setEmailStartDate(e.target.value)}
                      className="h-10! text-xs"
                    />
                  </div>
                  <div className="w-30">
                    <InputField
                      type="date"
                      value={emailEndDate}
                      onChange={(e) => setEmailEndDate(e.target.value)}
                      className="h-10! text-xs"
                    />
                  </div>
                </>
              )}

              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="small"
                  onClick={() => {
                    setEmailSearch("");
                    setEmailDatePreset("all");
                    setEmailStartDate("");
                    setEmailEndDate("");
                  }}
                  className="h-10! shrink-0 text-xs font-semibold"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </AdminCard>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
            {/* List of Sent Emails */}
            <AdminCard>
              <div className="grid grid-cols-[1.5fr_1.8fr_130px] border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                <span>Destinatario</span>
                <span>Asunto</span>
                <span>Fecha</span>
              </div>
              <div className="max-h-170 overflow-y-auto divide-y divide-slate-100">
                {filteredEmailLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <span className="material-symbols-rounded text-[48px] mb-3 text-slate-300">mail</span>
                    <p className="text-sm font-medium">No se encontraron mails enviados.</p>
                  </div>
                ) : (
                  filteredEmailLogs.map((log) => {
                    const active = log.id === selectedEmailLog?.id;
                    return (
                      <button
                        key={log.id}
                        type="button"
                        onClick={() => setSelectedEmailLogId(log.id)}
                        className={`grid w-full grid-cols-[1.5fr_1.8fr_130px] items-center px-4 py-3.5 text-left text-[14px] transition hover:bg-slate-50 outline-none border-none cursor-pointer ${
                          active ? "bg-slate-100/80" : "bg-white"
                        }`}
                      >
                        <span className="truncate font-bold text-slate-900 pr-2 text-xs">{log.recipient}</span>
                        <span className="truncate text-slate-600 pr-2 text-xs font-medium">{log.subject}</span>
                        <span className="text-slate-500 text-xs font-sans">
                          {formatShortTime(log.createdAt)}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </AdminCard>

            {/* HTML Email Reader side-panel */}
            {selectedEmailLog ? (
              <AdminCard className="flex flex-col h-185">
                {/* Header */}
                <div className="border-b border-slate-200/80 p-5 shrink-0 bg-slate-50/50">
                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-[15px] font-bold text-slate-900 leading-tight truncate font-jakarta">
                      {selectedEmailLog.subject}
                    </h2>
                    <div className="text-[12px] text-slate-500 space-y-0.5 mt-1 font-sans">
                      <p>
                        <span className="font-semibold text-slate-700">Para:</span> {selectedEmailLog.recipient}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">Fecha:</span>{" "}
                        {formatShortTime(selectedEmailLog.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Iframe content */}
                <div className="flex-1 bg-[#F8FAFC] p-4 overflow-hidden flex flex-col">
                  <iframe
                    title="Visualización de Mail"
                    srcDoc={selectedEmailLog.htmlBody}
                    className="w-full h-full border border-slate-200 rounded-xl bg-white shadow-sm flex-1"
                    sandbox="allow-same-origin"
                  />
                </div>
              </AdminCard>
            ) : (
              <AdminCard className="flex items-center justify-center text-slate-400 p-8 text-center h-185">
                <p className="text-sm font-medium">
                  Selecciona un correo del historial para visualizar su contenido.
                </p>
              </AdminCard>
            )}
          </div>
        </div>
      ) : (
        /* Templates Preview Sub-tab */
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          {/* Left Column: list of templates */}
          <AdminCard className="h-fit">
            <div className="border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
              Plantillas Disponibles
            </div>
            <div className="flex flex-col p-2 gap-1 bg-white">
              <button
                type="button"
                onClick={() => setSelectedTemplate("welcome")}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border-none outline-none ${
                  selectedTemplate === "welcome"
                    ? "bg-black text-white font-bold"
                    : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Bienvenida a LUMINUS
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate("recovery")}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border-none outline-none ${
                  selectedTemplate === "recovery"
                    ? "bg-black text-white font-bold"
                    : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Restablecer contraseña
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate("emailChange")}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border-none outline-none ${
                  selectedTemplate === "emailChange"
                    ? "bg-black text-white font-bold"
                    : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Confirmar Email
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate("contact")}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border-none outline-none ${
                  selectedTemplate === "contact"
                    ? "bg-black text-white font-bold"
                    : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Notificación de Contacto
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate("eventRegistration")}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border-none outline-none ${
                  selectedTemplate === "eventRegistration"
                    ? "bg-black text-white font-bold"
                    : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Inscripción a Eventos
              </button>
            </div>
          </AdminCard>

          {/* Right Column: template details & iframe preview */}
          <AdminCard className="flex flex-col h-185">
            <div className="border-b border-slate-200/80 p-5 shrink-0 bg-slate-50/50">
              <h2 className="text-[16px] font-bold text-slate-900 font-jakarta leading-tight">
                {templatesData[selectedTemplate].name}
              </h2>
              <p className="text-[12px] text-slate-500 mt-1.5 font-sans">
                <span className="font-semibold text-slate-700">Asunto predeterminado:</span>{" "}
                {templatesData[selectedTemplate].subject}
              </p>
            </div>
            <div className="flex-1 bg-[#F8FAFC] p-4 overflow-hidden flex flex-col">
              <iframe
                title="Vista Previa de Plantilla"
                srcDoc={templatesData[selectedTemplate].htmlBody}
                className="w-full h-full border border-slate-200 rounded-xl bg-white shadow-sm flex-1"
                sandbox="allow-same-origin"
              />
            </div>
          </AdminCard>
        </div>
      )}
    </div>
  );
}
