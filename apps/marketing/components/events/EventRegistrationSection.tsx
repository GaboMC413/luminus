"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Share2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LocationInput } from "@/components/ui/LocationInput";
import { Button } from "@/components/ui/Button";

interface EventItem {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  speaker_name?: string;
  speaker_bio?: string;
  category?: string;
  date?: string;
  time_text?: string;
  location?: string;
  cover_url?: string | null;
  youtube_id?: string;
}

interface EventRegistrationSectionProps {
  event: EventItem;
}

function formatDateTimeFull(dateString?: string, timeText?: string) {
  const timeStr = cleanTimeString(timeText);
  if (!dateString) return timeStr !== "Hora a confirmar" ? timeStr : "Fecha a confirmar";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return timeStr;

    const weekday = d.toLocaleDateString("es-ES", { weekday: "long" });
    const day = d.getDate();
    const month = d.toLocaleDateString("es-ES", { month: "long" });

    const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);

    return timeStr !== "Hora a confirmar"
      ? `${capitalizedWeekday} ${day} de ${month}, ${timeStr}`
      : `${capitalizedWeekday} ${day} de ${month}`;
  } catch {
    return timeStr;
  }
}

function cleanTimeString(timeText?: string): string {
  if (!timeText) return "Hora a confirmar";
  const cleaned = timeText
    .replace(/\s*\([^)]*GMT[^)]*\)/gi, "")
    .replace(/\s*\([^)]*UTC[^)]*\)/gi, "")
    .replace(/\s*GMT[+-]?\d*/gi, "")
    .replace(/\s*UTC[+-]?\d*/gi, "")
    .trim();
  return cleaned || "Hora a confirmar";
}

function parseInlineMarkdown(text: string, pIdx: number) {
  const regex = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    if (match[1]) {
      // Link match
      const label = match[2];
      const url = match[3];
      elements.push(
        <a
          key={`link-${pIdx}-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-slate-900 underline hover:text-slate-700 transition-colors inline-flex items-center gap-1"
        >
          {label}
          <svg className="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      );
    } else if (match[4]) {
      // Bold match
      const boldText = match[5];
      elements.push(
        <strong key={`bold-${pIdx}-${match.index}`} className="font-semibold text-slate-900">
          {boldText}
        </strong>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements.length > 0 ? elements : text;
}

function renderMarkdownContent(text: string) {
  if (!text) return null;
  const paragraphs = text.split(/\n\s*\n/);

  return (
    <div className="flex flex-col gap-4">
      {paragraphs.map((p, pIdx) => (
        <p key={`p-${pIdx}`} className="text-base font-light text-slate-700 leading-relaxed">
          {parseInlineMarkdown(p, pIdx)}
        </p>
      ))}
    </div>
  );
}

export function EventRegistrationSection({ event }: EventRegistrationSectionProps) {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", city: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `Te comparto este evento en LUMINUS: ${event.title}`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.city) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/event-inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          city: formData.city,
          eventId: event.id,
          eventTitle: event.title,
          eventCoverUrl: coverUrl,
          eventDate: event.date,
          timeText: event.time_text,
          speakerName: event.speaker_name,
          youtubeId: event.youtube_id,
          youtubeUrl: event.youtube_id ? `https://www.youtube.com/watch?v=${event.youtube_id}` : null,
          eventSlug: event.slug,
        }),
      });
    } catch (err) {
      console.warn("Registration API failed:", err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  const coverUrl =
    event.cover_url ||
    (event.youtube_id
      ? `https://i.ytimg.com/vi/${event.youtube_id}/hqdefault.jpg`
      : "/placeholder-video.jpg");

  const formattedDateTime = formatDateTimeFull(event.date, event.time_text);

  return (
    <div className="w-full py-8 md:py-14 bg-white flex-1 flex flex-col items-center">
      <div className="w-full max-w-[1140px] px-4 sm:px-6 lg:px-8 flex flex-col gap-6 text-left">

        {/* Back Link */}
        <Link
          href="/proximasfechas"
          className="inline-flex items-center gap-2 text-sm font-normal text-slate-600 hover:text-black transition-colors w-fit"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </Link>

        {/* MOBILE LAYOUT (lg:hidden) — Order: 1.Portada, 2.Título, 3.Especialista, 4.Detalles, 5.Botón 1, 6.Descripción, 7.Botón 2 */}
        <div className="flex flex-col gap-6 lg:hidden">
          {/* 1. Portada */}
          <div className="w-full aspect-video rounded-2xl overflow-hidden relative shadow-sm border border-slate-200/80 bg-slate-200">
            <Image
              src={coverUrl}
              alt={event.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>

          {/* 2. Título */}
          <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-slate-900 leading-[44px]">
            {event.title}
          </h2>

          {/* 3. Especialista */}
          {event.speaker_name && (
            <div className="flex items-center">
              <span className="text-xl sm:text-2xl font-normal text-slate-800">Con {event.speaker_name}</span>
            </div>
          )}

          {/* 4. Bloques con los detalles (Fecha & Plataforma) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 flex flex-col gap-4 shadow-2xs">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                <span className="material-symbols-outlined text-[20px] text-slate-800 select-none">calendar_clock</span>
              </div>
              <span className="text-base font-semibold text-slate-900">{formattedDateTime}</span>
            </div>
            {event.location && <div className="w-full border-t border-slate-100" />}
            {event.location && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                  <span className="material-symbols-outlined text-[20px] text-slate-800 select-none">videocam</span>
                </div>
                <span className="text-base font-semibold text-slate-900">{event.location}</span>
              </div>
            )}
          </div>

          {/* 5. Botón de inscripción (1st CTA) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpenModal(true)}
              className="w-full sm:w-auto h-12 px-8 bg-black hover:bg-slate-800 text-white font-normal rounded-2xl text-base transition-colors text-center cursor-pointer flex items-center justify-center shadow-sm"
            >
              <span>Inscribirme a este evento</span>
            </button>
            <Button
              variant="soft"
              size="default"
              onClick={handleShare}
              className="h-12 w-12 !px-0 rounded-2xl shrink-0 border border-slate-200 text-slate-700 hover:text-black hover:bg-slate-100 flex items-center justify-center relative"
              title={copied ? "¡Enlace copiado!" : "Compartir evento"}
              aria-label="Compartir evento"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-600 animate-in fade-in zoom-in-75 duration-200" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
              {copied && (
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-normal px-2.5 py-1 rounded-md whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-bottom-1 duration-200 pointer-events-none">
                  ¡Enlace copiado!
                </span>
              )}
            </Button>
          </div>

          {/* 6. Descripción */}
          <div className="flex flex-col gap-3 pt-2">
            <h3 className="text-lg font-semibold text-slate-900">Sobre esta actividad</h3>
            {renderMarkdownContent(event.description)}
          </div>

          {/* 7. Segundo botón de inscripción (2nd CTA) */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => setIsOpenModal(true)}
              className="w-full sm:w-auto h-12 px-8 bg-black hover:bg-slate-800 text-white font-normal rounded-2xl text-base transition-colors text-center cursor-pointer flex items-center justify-center shadow-sm"
            >
              <span>Inscribirme a este evento</span>
            </button>
            <Button
              variant="soft"
              size="default"
              onClick={handleShare}
              className="h-12 w-12 !px-0 rounded-2xl shrink-0 border border-slate-200 text-slate-700 hover:text-black hover:bg-slate-100 flex items-center justify-center relative"
              title={copied ? "¡Enlace copiado!" : "Compartir evento"}
              aria-label="Compartir evento"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-600 animate-in fade-in zoom-in-75 duration-200" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
              {copied && (
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-normal px-2.5 py-1 rounded-md whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-bottom-1 duration-200 pointer-events-none">
                  ¡Enlace copiado!
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* DESKTOP LAYOUT (hidden lg:grid) */}
        <div className="hidden lg:grid grid-cols-12 gap-12 items-start">
          {/* Left Column: Title, Specialist, 1st CTA, Description, 2nd CTA */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h2 className="text-[44px] font-normal tracking-tight text-slate-900 leading-[52px]">
              {event.title}
            </h2>

            {event.speaker_name && (
              <div className="flex items-center">
                <span className="text-2xl font-normal text-slate-800">Con {event.speaker_name}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOpenModal(true)}
                className="w-auto h-12 px-8 bg-black hover:bg-slate-800 text-white font-normal rounded-2xl text-base transition-colors text-center cursor-pointer flex items-center justify-center shadow-sm"
              >
                <span>Inscribirme a este evento</span>
              </button>
              <Button
                variant="soft"
                size="default"
                onClick={handleShare}
                className="h-12 w-12 !px-0 rounded-2xl shrink-0 border border-slate-200 text-slate-700 hover:text-black hover:bg-slate-100 flex items-center justify-center relative"
                title={copied ? "¡Enlace copiado!" : "Compartir evento"}
                aria-label="Compartir evento"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-emerald-600 animate-in fade-in zoom-in-75 duration-200" />
                ) : (
                  <Share2 className="w-5 h-5" />
                )}
                {copied && (
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-normal px-2.5 py-1 rounded-md whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-bottom-1 duration-200 pointer-events-none">
                    ¡Enlace copiado!
                  </span>
                )}
              </Button>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <h3 className="text-lg font-semibold text-slate-900">Sobre esta actividad</h3>
              {renderMarkdownContent(event.description)}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setIsOpenModal(true)}
                className="w-auto h-12 px-8 bg-black hover:bg-slate-800 text-white font-normal rounded-2xl text-base transition-colors text-center cursor-pointer flex items-center justify-center shadow-sm"
              >
                <span>Inscribirme a este evento</span>
              </button>
              <Button
                variant="soft"
                size="default"
                onClick={handleShare}
                className="h-12 w-12 !px-0 rounded-2xl shrink-0 border border-slate-200 text-slate-700 hover:text-black hover:bg-slate-100 flex items-center justify-center relative"
                title={copied ? "¡Enlace copiado!" : "Compartir evento"}
                aria-label="Compartir evento"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-emerald-600 animate-in fade-in zoom-in-75 duration-200" />
                ) : (
                  <Share2 className="w-5 h-5" />
                )}
                {copied && (
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-normal px-2.5 py-1 rounded-md whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-bottom-1 duration-200 pointer-events-none">
                    ¡Enlace copiado!
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column: Portada + Info Card */}
          <div className="lg:col-span-5 flex flex-col gap-5 sticky top-24">
            <div className="w-full aspect-video rounded-2xl overflow-hidden relative shadow-sm border border-slate-200/80 bg-slate-200">
              <Image
                src={coverUrl}
                alt={event.title}
                fill
                priority
                sizes="500px"
                className="object-cover object-center"
              />
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 flex flex-col gap-4 shadow-2xs">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                  <span className="material-symbols-outlined text-[20px] text-slate-800 select-none">calendar_clock</span>
                </div>
                <span className="text-base font-semibold text-slate-900">{formattedDateTime}</span>
              </div>
              {event.location && <div className="w-full border-t border-slate-100" />}
              {event.location && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-slate-800 select-none">videocam</span>
                  </div>
                  <span className="text-base font-semibold text-slate-900">{event.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Registration Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[500px] bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 text-left">

            {/* Close Button */}
            <button
              onClick={() => {
                setIsOpenModal(false);
                setSubmitted(false);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center gap-4 pt-2">
                <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-normal text-slate-900">¡Inscripción confirmada!</h3>
                <p className="text-slate-600 text-sm font-light leading-relaxed">
                  Te has inscripto a <strong className="font-medium text-slate-800">{event.title}</strong>. Te enviamos los detalles de acceso a <strong className="font-medium text-slate-800">{formData.email}</strong>.
                </p>
                <button
                  onClick={() => setIsOpenModal(false)}
                  className="mt-1 w-full h-12 px-8 bg-black hover:bg-slate-800 text-white rounded-2xl text-base font-normal transition-colors text-center cursor-pointer flex items-center justify-center shadow-sm"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="pr-10">
                  <h3 className="text-xl sm:text-2xl font-normal text-slate-900 tracking-tight leading-snug">
                    Completa tus datos para recibir el enlace de acceso.
                  </h3>
                </div>

                <div className="flex flex-col gap-3.5 mt-0.5">
                  {/* Nombre & Apellido */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="modal-firstname" className="text-xs font-medium text-slate-700">
                        Nombre *
                      </label>
                      <input
                        id="modal-firstname"
                        type="text"
                        required
                        placeholder="Nombre"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full h-12 px-5 text-base font-normal text-slate-900 bg-white border border-slate-300 rounded-2xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors placeholder:text-slate-400"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="modal-lastname" className="text-xs font-medium text-slate-700">
                        Apellido *
                      </label>
                      <input
                        id="modal-lastname"
                        type="text"
                        required
                        placeholder="Apellido"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full h-12 px-5 text-base font-normal text-slate-900 bg-white border border-slate-300 rounded-2xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Correo electrónico */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="modal-email" className="text-xs font-medium text-slate-700">
                      Correo electrónico *
                    </label>
                    <input
                      id="modal-email"
                      type="email"
                      required
                      placeholder="Correo electrónico"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-12 px-5 text-base font-normal text-slate-900 bg-white border border-slate-300 rounded-2xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors placeholder:text-slate-400"
                    />
                  </div>

                  {/* Ciudad */}
                  <LocationInput
                    label="Ciudad *"
                    placeholder="Ciudad"
                    required
                    defaultValue={formData.city}
                    onSelect={({ city }) => setFormData((prev) => ({ ...prev, city }))}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-1 h-12 px-8 bg-black hover:bg-slate-800 disabled:opacity-50 text-white font-normal rounded-2xl text-base transition-colors text-center cursor-pointer flex items-center justify-center shadow-sm"
                >
                  {isSubmitting ? "Procesando..." : "Confirmar inscripción"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
