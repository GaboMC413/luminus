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
  const [showTraceModal, setShowTraceModal] = useState<boolean>(false);
  const [copiedLog, setCopiedLog] = useState<boolean>(false);

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

  // Parse metadata if present
  const parsedMetadata = useMemo(() => {
    if (!selectedEmailLog?.metadata) return null;
    try {
      return JSON.parse(selectedEmailLog.metadata);
    } catch {
      return null;
    }
  }, [selectedEmailLog]);

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
          {/* Filter Bar */}
          <AdminCard className="p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12 items-end">
              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-slate-700 mb-1">Buscar correo o asunto</label>
                <InputField
                  placeholder="ej. usuario@mail.com..."
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                />
              </div>

              <div className="md:col-span-3">
                <SelectInput
                  label="Periodo de fecha"
                  value={emailDatePreset}
                  onSelect={(value) => setEmailDatePreset(value)}
                  options={[
                    { value: "all", label: "Histórico Completo" },
                    { value: "today", label: "Hoy" },
                    { value: "7days", label: "Últimos 7 días" },
                    { value: "30days", label: "Últimos 30 días" },
                    { value: "custom", label: "Rango Personalizado" },
                  ]}
                />
              </div>

              {emailDatePreset === "custom" ? (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Desde</label>
                    <InputField
                      type="date"
                      value={emailStartDate}
                      onChange={(e) => setEmailStartDate(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Hasta</label>
                    <InputField
                      type="date"
                      value={emailEndDate}
                      onChange={(e) => setEmailEndDate(e.target.value)}
                    />
                  </div>
                </>
              ) : null}

              <div className="md:col-span-3 flex items-center justify-end">
                {hasActiveFilters && (
                  <Button
                    variant="small"
                    onClick={() => {
                      setEmailSearch("");
                      setEmailDatePreset("all");
                      setEmailStartDate("");
                      setEmailEndDate("");
                    }}
                  >
                    Limpiar Filtros
                  </Button>
                )}
              </div>
            </div>
          </AdminCard>

          {/* Main 2-Column Section: History List vs. Reader */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.3fr]">
            {/* Left side list */}
            <AdminCard className="flex flex-col h-185">
              <div className="border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-slate-500 grid grid-cols-[1.5fr_1.8fr_130px] items-center">
                <span>Destinatario</span>
                <span>Asunto</span>
                <span className="text-right">Fecha</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredEmailLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <span className="material-symbols-rounded text-[48px] mb-3 text-slate-300">mail</span>
                    <p className="text-sm font-medium">No se encontraron mails enviados.</p>
                  </div>
                ) : (
                  filteredEmailLogs.map((log) => {
                    const active = log.id === selectedEmailLog?.id;
                    const isFailed = log.status === "FAILED";
                    return (
                      <button
                        key={log.id}
                        type="button"
                        onClick={() => setSelectedEmailLogId(log.id)}
                        className={`grid w-full grid-cols-[1.5fr_1.8fr_130px] items-center px-4 py-3.5 text-left text-[14px] transition hover:bg-slate-50 outline-none border-none cursor-pointer ${
                          active ? "bg-slate-100/80" : "bg-white"
                        }`}
                      >
                        <span className="truncate font-bold text-slate-900 pr-2 text-xs flex items-center gap-1.5">
                          {isFailed && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Fallo de envío" />}
                          {log.recipient}
                        </span>
                        <span className="truncate text-slate-600 pr-2 text-xs font-medium">{log.subject}</span>
                        <span className="text-slate-500 text-xs font-sans text-right">
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
              <AdminCard className="flex flex-col h-185 relative">
                {/* Header */}
                <div className="border-b border-slate-200/80 p-5 shrink-0 bg-slate-50/50 flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-[15px] font-bold text-slate-900 leading-tight truncate font-jakarta">
                        {selectedEmailLog.subject}
                      </h2>
                      {selectedEmailLog.status === "FAILED" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Fallo de Envío
                        </span>
                      ) : selectedEmailLog.status === "LOCAL_PREVIEW" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Preview Local
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          AWS SES Enviado
                        </span>
                      )}
                    </div>
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

                  <button
                    type="button"
                    onClick={() => setShowTraceModal(true)}
                    className="h-9 px-3.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0 shadow-xs"
                  >
                    <span className="material-symbols-rounded text-[16px]">timeline</span>
                    <span>Ver trazabilidad</span>
                  </button>
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

                {/* TRACEABILITY MODAL POPUP */}
                {showTraceModal && (() => {
                  const rawLogText = parsedMetadata?.rawLog || [
                    `=== LOG TÉCNICO DE ENVÍO LUMINUS ===`,
                    `[LOG ID]:           ${selectedEmailLog.id}`,
                    `[TIMESTAMP]:        ${selectedEmailLog.createdAt}`,
                    `[DESTINATARIO(S)]:  ${selectedEmailLog.recipient}`,
                    `[ASUNTO]:           ${selectedEmailLog.subject}`,
                    `[REGION AWS]:       ${parsedMetadata?.region || "us-east-1"}`,
                    `[CONFIG SET]:       ${parsedMetadata?.configurationSet || "Ninguno"}`,
                    `[ESTADO REGISTRADO]: ${selectedEmailLog.status || "SIN_ESTADO"}`,
                    `[MESSAGE ID AWS]:   ${selectedEmailLog.messageId || "N/A (No generado / fallo en llamada)"}`,
                    `[DETALLE DE ERROR]: ${selectedEmailLog.errorDetails || "Ninguno"}`,
                    `====================================`,
                  ].join("\n");

                  const isRealSuccess = Boolean(selectedEmailLog.messageId);
                  const isLocalPreview = selectedEmailLog.status === "LOCAL_PREVIEW";
                  const isFailed = selectedEmailLog.status === "FAILED" || (!isRealSuccess && !isLocalPreview);

                  return (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                      <div className="w-full max-w-[680px] max-h-[90vh] bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 flex flex-col relative animate-in fade-in zoom-in-95 duration-200 text-left overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 shrink-0">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold text-slate-900 font-jakarta">Trazabilidad y Log del Correo</h3>
                              {isLocalPreview ? (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                  Preview Local
                                </span>
                              ) : isFailed ? (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                                  Sin Confirmación AWS / Falló
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  AWS SES Enviado
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-mono">ID Log: {selectedEmailLog.id}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowTraceModal(false)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shrink-0"
                            aria-label="Cerrar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Modal Content Scrollable */}
                        <div className="flex-1 overflow-y-auto pt-4 space-y-5 pr-1">
                          
                          {/* 1. Log Técnico Crudo Copiable */}
                          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2.5 shadow-inner">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Log Técnico Crudo (Copiable)
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(rawLogText);
                                  setCopiedLog(true);
                                  setTimeout(() => setCopiedLog(false), 2000);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                              >
                                {copiedLog ? "✓ ¡Log Copiado!" : "📋 Copiar Log Técnico"}
                              </button>
                            </div>
                            <pre className="text-xs font-mono text-emerald-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80 whitespace-pre-wrap break-all overflow-x-auto select-all leading-relaxed">
                              {rawLogText}
                            </pre>
                          </div>

                          {/* 2. Datos Técnicos AWS SES */}
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
                            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Datos de Infraestructura AWS SES</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-slate-400 block">Message ID AWS:</span>
                                <span className="font-mono font-medium text-slate-800 break-all">
                                  {selectedEmailLog.messageId || "N/A (No generado o fallo en llamada)"}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Remitente Configurado:</span>
                                <span className="font-medium text-slate-800 break-all">
                                  {parsedMetadata?.sender || "LUMINUS LATAM"}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Región AWS:</span>
                                <span className="font-medium text-slate-800">{parsedMetadata?.region || "us-east-1"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">ConfigurationSet:</span>
                                <span className="font-medium text-slate-800">{parsedMetadata?.configurationSet || "Sin conjunto asignado"}</span>
                              </div>
                            </div>
                          </div>

                          {/* 3. Error details callout if failed */}
                          {(selectedEmailLog.status === "FAILED" || selectedEmailLog.errorDetails) && (
                            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-1.5">
                              <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs uppercase tracking-wider">
                                <span className="material-symbols-rounded text-[18px]">error</span>
                                <span>Detalle del Error Devuelto por AWS / Sistema:</span>
                              </div>
                              <pre className="text-xs font-mono bg-white p-3 rounded-lg border border-rose-200 text-rose-900 whitespace-pre-wrap break-all overflow-x-auto">
                                {selectedEmailLog.errorDetails || "Error indeterminado durante la llamada a AWS SES."}
                              </pre>
                            </div>
                          )}

                          {/* 4. Línea de Tiempo del Recorrido (Timeline) */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Línea de Tiempo del Recorrido</h4>
                            
                            <div className="space-y-2.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                              {(parsedMetadata?.timeline || [
                                { step: "Solicitud recibida", timestamp: selectedEmailLog.createdAt, success: true },
                                { step: "Plantilla compilada", timestamp: selectedEmailLog.createdAt, success: true },
                                { step: isFailed ? "Sin respuesta de MessageID AWS" : "Procesado", timestamp: selectedEmailLog.createdAt, success: !isFailed },
                              ]).map((item: any, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 relative z-10 pl-1">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold ${item.success ? "bg-emerald-500" : "bg-rose-500"}`}>
                                    {item.success ? "✓" : "✕"}
                                  </div>
                                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex-1 shadow-2xs">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-xs font-bold text-slate-900">{item.step}</span>
                                      <span className="text-[11px] font-mono text-slate-400">
                                        {item.timestamp ? formatShortTime(item.timestamp) : "—"}
                                      </span>
                                    </div>
                                    {item.details && (
                                      <p className="text-xs text-slate-600 mt-1 font-mono bg-slate-50 p-1.5 rounded border border-slate-100">
                                        {item.details}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(rawLogText);
                              setCopiedLog(true);
                              setTimeout(() => setCopiedLog(false), 2000);
                            }}
                            className="px-4 h-10 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            {copiedLog ? "✓ ¡Log Copiado al Portapapeles!" : "📋 Copiar Log Técnico"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowTraceModal(false)}
                            className="px-5 h-10 bg-black hover:bg-slate-800 text-white font-medium rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                          >
                            Cerrar
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })()}
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
