"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { AdminEvent, AdminEventInscription } from "../../types";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AdminBadge, AdminCard, AdminDetailRow } from "../AdminDesignSystem";

interface EventsTabProps {
  events: AdminEvent[];
  inscriptions: AdminEventInscription[];
}

const EVENT_CATEGORIES = [
  { label: "Crecimiento Personal", value: "Crecimiento Personal" },
  { label: "Bienestar Emocional", value: "Bienestar Emocional" },
  { label: "Salud Integral", value: "Salud Integral" },
  { label: "Movimiento Físico", value: "Movimiento Físico" },
  { label: "Nutrición", value: "Nutrición" },
  { label: "Espiritualidad", value: "Espiritualidad" },
  { label: "Vínculos", value: "Vínculos" },
  { label: "Terapias Complementarias", value: "Terapias Complementarias" },
  { label: "Otro", value: "Otro" },
];

const TIME_OPTIONS = [
  { label: "18:00 hs (GMT-3)", value: "18:00 hs (GMT-3)" },
  { label: "18:30 hs (GMT-3)", value: "18:30 hs (GMT-3)" },
  { label: "19:00 hs (GMT-3)", value: "19:00 hs (GMT-3)" },
  { label: "19:30 hs (GMT-3)", value: "19:30 hs (GMT-3)" },
  { label: "20:00 hs (GMT-3)", value: "20:00 hs (GMT-3)" },
  { label: "20:30 hs (GMT-3)", value: "20:30 hs (GMT-3)" },
  { label: "21:00 hs (GMT-3)", value: "21:00 hs (GMT-3)" },
  { label: "10:00 hs (GMT-3)", value: "10:00 hs (GMT-3)" },
  { label: "11:00 hs (GMT-3)", value: "11:00 hs (GMT-3)" },
  { label: "12:00 hs (GMT-3)", value: "12:00 hs (GMT-3)" },
  { label: "14:00 hs (GMT-3)", value: "14:00 hs (GMT-3)" },
  { label: "15:00 hs (GMT-3)", value: "15:00 hs (GMT-3)" },
  { label: "16:00 hs (GMT-3)", value: "16:00 hs (GMT-3)" },
  { label: "17:00 hs (GMT-3)", value: "17:00 hs (GMT-3)" },
];

function getCategoryBadgeStyle(category?: string | null): string {
  if (!category) return "bg-slate-100 text-slate-700 border-slate-200";
  const norm = category.toLowerCase();
  if (norm.includes("crecimiento")) {
    return "bg-amber-50 text-amber-800 border-amber-200/80";
  }
  if (norm.includes("emocional")) {
    return "bg-pink-50 text-pink-700 border-pink-200/80";
  }
  if (norm.includes("salud") || norm.includes("integral")) {
    return "bg-sky-50 text-sky-700 border-sky-200/80";
  }
  if (norm.includes("movimiento") || norm.includes("físico") || norm.includes("fisico")) {
    return "bg-rose-50 text-rose-700 border-rose-200/80";
  }
  if (norm.includes("nutrición") || norm.includes("nutricion")) {
    return "bg-lime-50 text-lime-800 border-lime-200/80";
  }
  if (norm.includes("espiritualidad")) {
    return "bg-purple-50 text-purple-700 border-purple-200/80";
  }
  if (norm.includes("vínculos") || norm.includes("vinculos")) {
    return "bg-orange-50 text-orange-700 border-orange-200/80";
  }
  if (norm.includes("terapias") || norm.includes("complementarias")) {
    return "bg-teal-50 text-teal-700 border-teal-200/80";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function isUpcomingEvent(ev: Partial<AdminEvent>): boolean {
  if (!ev.date) return Boolean(ev.isUpcoming);
  const d = new Date(ev.date);
  if (isNaN(d.getTime())) return Boolean(ev.isUpcoming);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return d.getTime() >= now.getTime();
}

function renderSimpleMarkdown(text?: string) {
  if (!text) return "";
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
}

export function EventsTab({ events: initialEvents, inscriptions }: EventsTabProps) {
  const [eventsList, setEventsList] = useState<AdminEvent[]>(initialEvents);
  const [eventSearch, setEventSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<"proximos" | "pasados" | "todos">("proximos");

  // Selection & Detail Panel State
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEvents[0]?.id ?? "");
  const [detailSubTab, setDetailSubTab] = useState<"info" | "inscriptos">("info");

  // In-Place Inline Editing State (matching UsersTab)
  const [isEditingEvent, setIsEditingEvent] = useState<boolean>(false);
  const [editingEventData, setEditingEventData] = useState<Partial<AdminEvent>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUploadingCover, setIsUploadingCover] = useState<boolean>(false);

  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Counts
  const upcomingCount = useMemo(() => {
    return eventsList.filter((ev) => isUpcomingEvent(ev)).length;
  }, [eventsList]);

  const pastCount = useMemo(() => {
    return eventsList.filter((ev) => !isUpcomingEvent(ev)).length;
  }, [eventsList]);

  // Filtered Events List
  const filteredEvents = useMemo(() => {
    const query = eventSearch.trim().toLowerCase();

    return eventsList.filter((ev) => {
      const isUpcoming = isUpcomingEvent(ev);

      if (eventFilter === "proximos" && !isUpcoming) return false;
      if (eventFilter === "pasados" && isUpcoming) return false;

      if (!query) return true;

      const titleMatch = ev.title.toLowerCase().includes(query);
      const speakerMatch = (ev.speakerName || "").toLowerCase().includes(query);
      const categoryMatch = (ev.category || "").toLowerCase().includes(query);

      return titleMatch || speakerMatch || categoryMatch;
    });
  }, [eventsList, eventSearch, eventFilter]);

  // Selected Event object
  const selectedEvent = eventsList.find((ev) => ev.id === selectedEventId) ?? filteredEvents[0] ?? eventsList[0] ?? null;

  const [inscriptionsList, setInscriptionsList] = useState<AdminEventInscription[]>(inscriptions);
  const [deletingInscriptionId, setDeletingInscriptionId] = useState<string | null>(null);

  useEffect(() => {
    setInscriptionsList(inscriptions);
  }, [inscriptions]);

  const handleDeleteInscription = async (inscriptionId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar la inscripción de este usuario?")) {
      return;
    }

    setDeletingInscriptionId(inscriptionId);
    try {
      const res = await fetch(`/api/admin/event-inscriptions/${inscriptionId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInscriptionsList((prev) => prev.filter((ins) => ins.id !== inscriptionId));
      } else {
        alert(data.error || "No se pudo eliminar la inscripción.");
      }
    } catch (err) {
      console.error("Error deleting inscription:", err);
      alert("Error de conexión al eliminar la inscripción.");
    } finally {
      setDeletingInscriptionId(null);
    }
  };

  // Inscriptions for the currently selected event
  const selectedEventInscriptions = useMemo(() => {
    if (!selectedEvent) return [];
    return inscriptionsList.filter((ins) => ins.eventId === selectedEvent.id);
  }, [inscriptionsList, selectedEvent]);

  // Start editing existing event
  const handleStartEdit = () => {
    if (!selectedEvent) return;
    setEditingEventData({ ...selectedEvent });
    setIsEditingEvent(true);
  };

  // Start creating new event
  const handleStartCreate = () => {
    setEditingEventData({
      title: "",
      description: "",
      speakerName: "",
      category: "Bienestar Emocional",
      date: new Date().toISOString().substring(0, 10),
      timeText: "18:00 hs (GMT-3)",
      location: "En vivo por Zoom / LUMINUS",
      coverUrl: "",
      isUpcoming: true,
    });
    setIsEditingEvent(true);
  };

  // Cancel inline editing
  const handleCancelEdit = () => {
    setIsEditingEvent(false);
    setEditingEventData({});
  };

  // Upload Cover to S3
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen debe pesar menos de 5 MB.");
      return;
    }

    setIsUploadingCover(true);
    try {
      const res = await fetch("/api/admin/events/cover-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: file.type,
          contentLength: file.size,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al obtener URL presignada de S3.");
      }

      const { uploadUrl, publicUrl } = await res.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Error al subir archivo a S3.");
      }

      setEditingEventData((prev: Partial<AdminEvent>) => ({ ...prev, coverUrl: publicUrl }));
    } catch (err: any) {
      console.error("Cover upload error:", err);
      alert(err.message || "Error al subir la imagen de portada a S3.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Markdown Formatting Helper
  const applyMarkdown = (syntaxBefore: string, syntaxAfter: string = "", defaultPlaceholder: string = "texto") => {
    if (!descriptionRef.current) return;

    const textarea = descriptionRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = editingEventData.description || "";
    const selected = currentText.substring(start, end) || defaultPlaceholder;

    const newText = currentText.substring(0, start) + syntaxBefore + selected + syntaxAfter + currentText.substring(end);
    setEditingEventData((prev: Partial<AdminEvent>) => ({ ...prev, description: newText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + syntaxBefore.length, start + syntaxBefore.length + selected.length);
    }, 50);
  };

  // Delete Event
  const handleDeleteEvent = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este evento?")) return;

    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setEventsList((prev) => prev.filter((ev) => ev.id !== id));
        if (selectedEventId === id) {
          const remaining = eventsList.filter((e) => e.id !== id);
          setSelectedEventId(remaining[0]?.id ?? "");
        }
      }
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  // Save Event (Create or Edit Inline)
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEventData.title) return;

    setIsSubmitting(true);
    const calculatedUpcoming = isUpcomingEvent(editingEventData);

    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingEventData,
          isUpcoming: calculatedUpcoming,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const savedEvent = data.event;
        const formattedSaved: AdminEvent = {
          id: savedEvent.id,
          youtubeId: savedEvent.youtubeId || null,
          slug: savedEvent.slug || null,
          title: savedEvent.title,
          description: savedEvent.description,
          date: savedEvent.date ? new Date(savedEvent.date).toISOString() : null,
          timeText: savedEvent.timeText || null,
          location: savedEvent.location || null,
          speakerName: savedEvent.speakerName || null,
          speakerBio: savedEvent.speakerBio || null,
          category: savedEvent.category || null,
          coverUrl: savedEvent.coverUrl || null,
          link: savedEvent.link || null,
          isUpcoming: savedEvent.isUpcoming,
          createdAt: savedEvent.createdAt ? new Date(savedEvent.createdAt).toISOString() : new Date().toISOString(),
          inscriptionsCount: editingEventData.id ? (eventsList.find((e) => e.id === editingEventData.id)?.inscriptionsCount || 0) : 0,
        };

        if (editingEventData.id) {
          setEventsList((prev) => prev.map((item) => (item.id === savedEvent.id ? formattedSaved : item)));
        } else {
          setEventsList((prev) => [formattedSaved, ...prev]);
          setSelectedEventId(savedEvent.id);
        }

        setIsEditingEvent(false);
        setEditingEventData({});
      }
    } catch (err) {
      console.error("Failed to save event:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6 md:p-8 h-[calc(100vh-64px)] overflow-hidden flex flex-col box-border">
      {/* 2-Column Master-Detail Grid matching UsersTab */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_1fr] gap-6 items-start flex-1 min-h-0 h-full">
        
        {/* LEFT COLUMN: Master Events List */}
        <div className="flex flex-col gap-4 min-w-0 h-full overflow-hidden">
          {/* Page Heading Area */}
          <div className="shrink-0">
            <h1 className="text-[28px] font-bold leading-tight font-jakarta text-slate-900">
              Eventos
            </h1>
          </div>

          {/* Unified Master List Card */}
          <AdminCard className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Card Toolbar: Status Dropdown + Search Input + "+ Nuevo" Button */}
            <div className="p-4 border-b border-slate-200/80 bg-white flex items-center gap-3 shrink-0">
              {/* Filter Dropdown */}
              <div className="min-w-36 shrink-0">
                <SelectInput
                  value={eventFilter}
                  options={[
                    { label: `Próximos · ${upcomingCount}`, value: "proximos" },
                    { label: `Pasados · ${pastCount}`, value: "pasados" },
                    { label: `Todos · ${eventsList.length}`, value: "todos" },
                  ]}
                  onSelect={(val) => setEventFilter(val as "proximos" | "pasados" | "todos")}
                  className="h-10! text-xs font-bold"
                />
              </div>

              {/* Search Field */}
              <div className="flex-1 min-w-0">
                <InputField
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  placeholder="Buscar por título o speaker"
                  className="w-full! h-10! text-xs"
                />
              </div>

              {/* "+ Nuevo" Button directly right of the search bar */}
              <button
                type="button"
                onClick={handleStartCreate}
                className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs whitespace-nowrap"
              >
                <span className="material-symbols-rounded text-[18px]">add</span>
                <span>Nuevo</span>
              </button>
            </div>

            {/* Table Header matching UsersTab */}
            <div className="grid grid-cols-[55%_25%_20%] border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
              <span>Evento</span>
              <span>Fecha</span>
              <span className="text-right">Inscriptos</span>
            </div>

            {/* Master Table Rows matching UsersTab height & text hierarchy */}
            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
              {filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <span className="material-symbols-rounded text-[44px] mb-2 text-slate-300">
                    event_busy
                  </span>
                  <p className="text-sm font-medium">
                    No se encontraron eventos.
                  </p>
                </div>
              ) : (
                filteredEvents.map((ev) => {
                  const active = selectedEvent?.id === ev.id && !isEditingEvent;

                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => {
                        setSelectedEventId(ev.id);
                        setIsEditingEvent(false);
                      }}
                      className={`grid w-full grid-cols-[55%_25%_20%] items-center px-4 py-3.5 text-left text-[14px] transition outline-none cursor-pointer border-y-0 border-r-0 ${
                        active
                          ? "bg-slate-100/90 font-semibold border-l-4 border-slate-900"
                          : "bg-white border-l-4 border-transparent hover:bg-slate-50"
                      }`}
                    >
                      {/* Evento (16:9 Cover Thumbnail + Title ONLY) */}
                      <span className="flex min-w-0 items-center gap-3 pr-2">
                        <span className="relative shrink-0">
                          {ev.coverUrl ? (
                            <img
                              src={ev.coverUrl}
                              alt={ev.title}
                              className="w-16 h-9 rounded-xl object-cover border border-slate-200 bg-slate-100 shadow-2xs"
                            />
                          ) : (
                            <span className="flex w-16 h-9 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-400">
                              <span className="material-symbols-rounded text-[18px]">event</span>
                            </span>
                          )}
                        </span>
                        <span className="text-[14px] font-bold text-slate-900 leading-snug truncate">
                          {ev.title}
                        </span>
                      </span>

                      {/* Fecha */}
                      <span className="text-[13px] text-slate-600 font-sans truncate">
                        {ev.date ? (
                          new Date(ev.date).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        ) : (
                          "—"
                        )}
                      </span>

                      {/* Inscriptos Count */}
                      <span className="text-[13px] text-right font-bold text-slate-900 font-sans pr-2">
                        {ev.inscriptionsCount}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </AdminCard>
        </div>

        {/* RIGHT COLUMN: Exact Replica of UsersTab Detail Panel Card */}
        {selectedEvent ? (
          <AdminCard className="flex flex-col min-w-0 h-full overflow-hidden">
            
            {/* Header Profile Summary (matching UsersTab padding & structure) */}
            <div className="border-b border-slate-200/80 p-6 bg-white shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Small 16:9 Cover Thumbnail on Left */}
                  <div className="relative shrink-0">
                    {selectedEvent.coverUrl ? (
                      <img
                        src={selectedEvent.coverUrl}
                        alt={selectedEvent.title}
                        className="w-24 h-15 rounded-xl object-cover border border-slate-200 bg-slate-100 shadow-2xs"
                      />
                    ) : (
                      <div className="w-24 h-15 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-rounded text-[22px]">event</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Badges on Right of Cover */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h2 className="line-clamp-2 text-lg font-bold text-slate-900 leading-tight font-jakarta">
                      {selectedEvent.title}
                    </h2>

                    {/* Badges Bar matching UsersTab */}
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                      <AdminBadge variant={isUpcomingEvent(selectedEvent) ? "active" : "disabled"}>
                        {isUpcomingEvent(selectedEvent) ? "Próximo" : "Pasado / Grabación"}
                      </AdminBadge>

                      {selectedEvent.category && (
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${getCategoryBadgeStyle(selectedEvent.category)}`}
                        >
                          {selectedEvent.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Buttons matching UsersTab */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditingEvent) {
                        handleCancelEdit();
                      } else {
                        handleStartEdit();
                      }
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-none cursor-pointer transition-colors ${
                      isEditingEvent
                        ? "bg-black text-white hover:bg-slate-800"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                    title={isEditingEvent ? "Cancelar edición" : "Editar evento"}
                  >
                    <span className="material-symbols-rounded text-[18px] block">
                      {isEditingEvent ? "close" : "edit"}
                    </span>
                  </button>

                  {!isEditingEvent && (
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-none cursor-pointer transition-colors bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700"
                      title="Eliminar evento"
                    >
                      <span className="material-symbols-rounded text-[18px] block">
                        delete
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* View Switcher Sub-Tabs Bar */}
              {!isEditingEvent && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDetailSubTab("info")}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      detailSubTab === "info"
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    Información del Evento
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailSubTab("inscriptos")}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      detailSubTab === "inscriptos"
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    Personas Inscriptas ({selectedEventInscriptions.length})
                  </button>
                </div>
              )}
            </div>

            {/* Panel Content with Inner Scroll (matching UsersTab p-6 flex flex-col gap-6) */}
            {!isEditingEvent ? (
              /* CASE 1: READ-ONLY VIEW */
              <div className="p-6 flex flex-col gap-6 text-sm flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                {detailSubTab === "info" && (
                  <>
                    {/* Main Details Section */}
                    <div>
                      <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Información del Evento
                      </h3>
                      <div className="bg-slate-50/50 rounded-xl p-1 divide-y divide-slate-100">
                        <AdminDetailRow label="Speaker" value={selectedEvent.speakerName || "—"} />
                        <AdminDetailRow
                          label="Fecha y hora"
                          value={
                            selectedEvent.date
                              ? `${new Date(selectedEvent.date).toLocaleDateString("es-ES", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })} · ${selectedEvent.timeText || "18:00 hs"}`
                              : selectedEvent.timeText || "—"
                          }
                        />
                        <AdminDetailRow label="Ubicación" value={selectedEvent.location || "En vivo / YouTube"} />
                        {selectedEvent.link && (
                          <AdminDetailRow
                            label="Enlace"
                            value={
                              <a
                                href={selectedEvent.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline break-all font-sans text-xs"
                              >
                                {selectedEvent.link}
                              </a>
                            }
                          />
                        )}
                      </div>
                    </div>

                    {/* Description Block matching UsersTab Biography */}
                    <div>
                      <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Descripción del Evento
                      </h3>
                      <div className="bg-slate-50/50 rounded-xl p-4">
                        {selectedEvent.description ? (
                          <div
                            className="text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-wrap font-sans"
                            dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(selectedEvent.description) }}
                          />
                        ) : (
                          <p className="text-[13.5px] text-slate-400 italic">
                            Sin descripción especificada.
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Inscriptions Table */}
                {detailSubTab === "inscriptos" && (
                  <div>
                    <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Personas Inscriptas ({selectedEventInscriptions.length})
                    </h3>
                    {selectedEventInscriptions.length === 0 ? (
                      <div className="bg-slate-50/50 rounded-xl p-8 text-center text-slate-400 text-xs">
                        Aún no hay personas inscriptas a este evento.
                      </div>
                    ) : (
                      <div className="bg-slate-50/50 rounded-xl overflow-hidden border border-slate-100">
                        <table className="w-full text-left text-xs border-collapse table-fixed">
                          <thead>
                            <tr className="bg-slate-100/60 border-b border-slate-200/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                              <th className="py-2.5 px-3 w-[26%]">Persona</th>
                              <th className="py-2.5 px-3 w-[32%]">Email</th>
                              <th className="py-2.5 px-3 w-[20%]">Ciudad</th>
                              <th className="py-2.5 px-3 w-[14%] text-right">Fecha</th>
                              <th className="py-2.5 px-3 w-[8%] text-right"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {selectedEventInscriptions.map((ins) => (
                              <tr key={ins.id} className="hover:bg-slate-100/50 group transition-colors relative">
                                <td className="py-2.5 px-3 font-semibold text-slate-900 truncate">
                                  {ins.guestFirstName} {ins.guestLastName}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px] truncate">
                                  {ins.guestEmail}
                                </td>
                                <td className="py-2.5 px-3 text-slate-700 text-xs truncate">
                                  {ins.guestCity || "—"}
                                </td>
                                <td className="py-2.5 px-3 text-right text-slate-500 text-[11px] whitespace-nowrap">
                                  {new Date(ins.createdAt).toLocaleDateString("es-ES", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteInscription(ins.id)}
                                    disabled={deletingInscriptionId === ins.id}
                                    className="opacity-0 group-hover:opacity-100 transition-all duration-150 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 cursor-pointer disabled:opacity-50 inline-flex items-center justify-center"
                                    title="Eliminar inscripción"
                                  >
                                    <span className="material-symbols-rounded text-[16px] block">
                                      {deletingInscriptionId === ins.id ? "progress_activity" : "delete"}
                                    </span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* CASE 2: INLINE EDITING MODE (matching UsersTab form style) */
              <form onSubmit={handleSaveEvent} className="p-6 flex flex-col gap-5 text-sm flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Título del Evento *
                  </label>
                  <InputField
                    type="text"
                    required
                    placeholder="Ej: Taller de Bienestar Emocional"
                    value={editingEventData.title || ""}
                    onChange={(e) => setEditingEventData({ ...editingEventData, title: e.target.value })}
                    className="w-full! h-10! text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Nombre Speaker
                    </label>
                    <InputField
                      type="text"
                      placeholder="Ej: Dra. Sofía Martínez"
                      value={editingEventData.speakerName || ""}
                      onChange={(e) => setEditingEventData({ ...editingEventData, speakerName: e.target.value })}
                      className="w-full! h-10! text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Categoría
                    </label>
                    <select
                      value={editingEventData.category || "Movimiento Físico"}
                      onChange={(e) => setEditingEventData({ ...editingEventData, category: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400 cursor-pointer"
                    >
                      {EVENT_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Fecha
                    </label>
                    <InputField
                      type="date"
                      value={editingEventData.date ? new Date(editingEventData.date).toISOString().substring(0, 10) : ""}
                      onChange={(e) => setEditingEventData({ ...editingEventData, date: e.target.value })}
                      className="w-full! h-10! text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Hora
                    </label>
                    <select
                      value={editingEventData.timeText || "18:00 hs (GMT-3)"}
                      onChange={(e) => setEditingEventData({ ...editingEventData, timeText: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400 cursor-pointer"
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time.value} value={time.value}>
                          {time.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Ubicación
                    </label>
                    <InputField
                      type="text"
                      placeholder="Ej: En vivo por Zoom / LUMINUS"
                      value={editingEventData.location || ""}
                      onChange={(e) => setEditingEventData({ ...editingEventData, location: e.target.value })}
                      className="w-full! h-10! text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Enlace
                    </label>
                    <InputField
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={editingEventData.link || ""}
                      onChange={(e) => setEditingEventData({ ...editingEventData, link: e.target.value })}
                      className="w-full! h-10! text-xs"
                    />
                  </div>
                </div>

                {/* Cover Upload Section */}
                <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Imagen de Portada
                  </label>
                  <div className="flex items-center gap-3">
                    {editingEventData.coverUrl ? (
                      <img
                        src={editingEventData.coverUrl}
                        alt="Preview portada"
                        className="w-20 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100 shadow-2xs"
                      />
                    ) : (
                      <div className="w-20 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 text-[10px]">
                        Sin portada
                      </div>
                    )}

                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <input
                        type="file"
                        ref={coverFileInputRef}
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleCoverFileUpload}
                        disabled={isUploadingCover}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        disabled={isUploadingCover}
                        className="px-4 h-9 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs whitespace-nowrap"
                      >
                        <span className="material-symbols-rounded text-[16px]">upload</span>
                        <span>{isUploadingCover ? "Subiendo..." : "Subir portada"}</span>
                      </button>

                      {isUploadingCover && (
                        <span className="text-[11px] font-medium text-amber-600 animate-pulse">
                          Subiendo archivo...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description with Markdown Helpers */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Descripción
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => applyMarkdown("**", "**", "texto en negrita")}
                        title="Formato Negrita"
                        className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-200/80 shadow-2xs hover:bg-slate-50 text-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>B</span>
                        <span className="text-[10px] font-normal text-slate-500">Negrita</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => applyMarkdown("*", "*", "texto en cursiva")}
                        title="Formato Cursiva"
                        className="px-2.5 py-1 text-xs italic bg-white border border-slate-200/80 shadow-2xs hover:bg-slate-50 text-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>I</span>
                        <span className="text-[10px] not-italic font-normal text-slate-500">Cursiva</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => applyMarkdown("[", "](https://ejemplo.com)", "texto del enlace")}
                        title="Insertar Enlace"
                        className="px-2.5 py-1 text-xs bg-white border border-slate-200/80 shadow-2xs hover:bg-slate-50 text-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span className="text-[11px]">🔗</span>
                        <span className="text-[10px] font-normal text-slate-500">Enlace</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref={descriptionRef}
                    rows={4}
                    placeholder="Escribe la descripción del evento..."
                    value={editingEventData.description || ""}
                    onChange={(e) => setEditingEventData({ ...editingEventData, description: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400 text-xs font-sans leading-relaxed"
                  />
                </div>

                {/* Action Buttons matching UsersTab submit bar */}
                <div className="pt-4 border-t border-slate-200/80 flex items-center justify-end gap-3 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="h-10! text-xs px-5"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting || isUploadingCover}
                    className="h-10! text-xs px-6"
                  >
                    {isSubmitting ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </div>
              </form>
            )}

          </AdminCard>
        ) : (
          <AdminCard className="flex items-center justify-center flex-1 p-8 text-slate-400 text-sm">
            Selecciona un evento de la lista para ver su información.
          </AdminCard>
        )}

      </div>
    </div>
  );
}
