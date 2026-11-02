"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Clock, MapPin, Share2, Check, Loader2, TvMinimalPlay } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Toast, ToastProps } from "@/components/ui/Toast";

export interface DetailEventItem {
  id: string;
  slug?: string | null;
  title: string;
  description: string;
  speakerName?: string | null;
  speakerBio?: string | null;
  category?: string | null;
  coverUrl?: string | null;
  date?: string | null;
  timeText?: string | null;
  location?: string | null;
  link?: string | null;
  youtubeId?: string | null;
  isUpcoming?: boolean;
  isRegistered?: boolean;
}

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

function cleanTimeString(timeText?: string | null): string {
  if (!timeText) return "18:00 hs";
  return (
    timeText
      .replace(/\s*\([^)]*GMT[^)]*\)/gi, "")
      .replace(/\s*\([^)]*UTC[^)]*\)/gi, "")
      .replace(/\s*GMT[+-]?\d*/gi, "")
      .replace(/\s*UTC[+-]?\d*/gi, "")
      .trim() || "18:00 hs"
  );
}

function formatFullDateTime(dateString?: string | null, timeText?: string | null): string {
  const timeStr = cleanTimeString(timeText);
  if (!dateString) return timeStr;
  try {
    const d = parseCalendarDate(dateString);
    if (!d) return timeStr;

    const weekdayRaw = d.toLocaleDateString("es-ES", { weekday: "long" });
    const weekday = weekdayRaw.charAt(0).toUpperCase() + weekdayRaw.slice(1);
    const day = d.getDate();
    const monthRaw = d.toLocaleDateString("es-ES", { month: "long" });
    const month = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1);

    return `${weekday} ${day} de ${month}, ${timeStr}`;
  } catch {
    return timeStr;
  }
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
      const label = match[2];
      const url = match[3];
      elements.push(
        <a
          key={`link-${pIdx}-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-slate-900 underline hover:text-slate-700 transition-colors"
        >
          {label}
        </a>
      );
    } else if (match[4]) {
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

function renderDescriptionParagraphs(text?: string) {
  if (!text) return null;
  const paragraphs = text.split(/\n\s*\n/);

  return (
    <div className="flex flex-col gap-4">
      {paragraphs.map((p, idx) => (
        <p key={idx} className="text-base font-normal font-sans text-slate-700 leading-relaxed">
          {parseInlineMarkdown(p, idx)}
        </p>
      ))}
    </div>
  );
}

export function ActividadDetailView({ event }: { event: DetailEventItem }) {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(Boolean(event.isRegistered));
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [copied, setCopied] = useState(false);

  const [toastConfig, setToastConfig] = useState<Omit<ToastProps, "onClose">>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const coverUrl = event.coverUrl || "/luminus_events.jpg";
  const formattedDateTime = formatFullDateTime(event.date, event.timeText);

  const isPast = (() => {
    if (event.isUpcoming === false) return true;
    if (!event.date) return false;
    const d = parseCalendarDate(event.date);
    if (!d) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  })();

  const youtubeUrl = event.link || (event.youtubeId ? `https://www.youtube.com/watch?v=${event.youtubeId}` : null);

  const handleInscribe = async () => {
    if (isRegistered || isEnrolling || isPast) return;
    setIsEnrolling(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo procesar la inscripción.");
      }

      setIsRegistered(true);
      setToastConfig({
        isOpen: true,
        title: data.alreadyRegistered ? "Ya estás inscripto" : "¡Inscripción confirmada!",
        message: data.alreadyRegistered
          ? `Ya tienes tu lugar asegurado para "${event.title}".`
          : `Te has inscripto a "${event.title}". Revisa tu correo con los detalles de acceso.`,
        type: "success",
      });
    } catch (err: any) {
      setToastConfig({
        isOpen: true,
        title: "Error al inscribirte",
        message: err.message || "Ocurrió un problema inesperado.",
        type: "error",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: event.title,
      text: `Te comparto esta actividad en LUMINUS: ${event.title}`,
      url,
    };

    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  const renderCtaBlock = () => {
    if (isPast) {
      return (
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="lg"
              disabled
              className="opacity-70 cursor-not-allowed bg-slate-100 text-slate-500 border-slate-200"
            >
              Esta actividad ya finalizó
            </Button>
            <Button
              variant="secondary"
              onClick={handleShare}
              className="h-11 w-11 !px-0 rounded-xl shrink-0 flex items-center justify-center relative"
              title={copied ? "¡Enlace copiado!" : "Compartir actividad"}
              aria-label="Compartir actividad"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600 animate-in fade-in zoom-in-75 duration-200" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              {copied && (
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-jakarta font-medium px-2.5 py-1 rounded-md whitespace-nowrap shadow-md pointer-events-none">
                  ¡Enlace copiado!
                </span>
              )}
            </Button>
          </div>

          {youtubeUrl && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <TvMinimalPlay className="w-4 h-4" />
                <span>Ver grabación en YouTube</span>
              </Button>
            </a>
          )}
        </div>
      );
    }

    if (isRegistered) {
      return (
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold font-jakarta">
            <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            <span>Inscripto</span>
          </div>
          <Button
            variant="secondary"
            onClick={handleShare}
            className="h-11 w-11 !px-0 rounded-xl shrink-0 flex items-center justify-center relative"
            title={copied ? "¡Enlace copiado!" : "Compartir actividad"}
            aria-label="Compartir actividad"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600 animate-in fade-in zoom-in-75 duration-200" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            {copied && (
              <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-jakarta font-medium px-2.5 py-1 rounded-md whitespace-nowrap shadow-md pointer-events-none">
                ¡Enlace copiado!
              </span>
            )}
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={handleInscribe}
          disabled={isEnrolling}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2"
        >
          {isEnrolling ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Inscribiendo...</span>
            </>
          ) : (
            <span>Inscribirme a este evento</span>
          )}
        </Button>
        <Button
          variant="secondary"
          onClick={handleShare}
          className="h-11 w-11 !px-0 rounded-xl shrink-0 flex items-center justify-center relative"
          title={copied ? "¡Enlace copiado!" : "Compartir actividad"}
          aria-label="Compartir actividad"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600 animate-in fade-in zoom-in-75 duration-200" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          {copied && (
            <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-jakarta font-medium px-2.5 py-1 rounded-md whitespace-nowrap shadow-md pointer-events-none">
              ¡Enlace copiado!
            </span>
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pb-16 pt-4 font-sans sm:px-6 md:gap-8 md:py-8">
      {/* Toast Feedback */}
      <Toast
        isOpen={toastConfig.isOpen}
        onClose={() => setToastConfig((prev) => ({ ...prev, isOpen: false }))}
        title={toastConfig.title}
        message={toastConfig.message}
        type={toastConfig.type}
      />

      {/* Back button */}
      <div>
        <Button variant="back" onClick={() => router.push("/actividades")}>
          Volver
        </Button>
      </div>

      {/* MOBILE LAYOUT (lg:hidden) */}
      <div className="flex flex-col gap-6 lg:hidden">
        {/* 1. Portada */}
        <div className="w-full aspect-video rounded-2xl overflow-hidden relative shadow-none border border-slate-200/90 bg-slate-100">
          <Image
            src={coverUrl}
            alt={event.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            unoptimized
          />
        </div>

        {/* 2. Título */}
        <h1 className="text-2xl sm:text-3xl font-bold font-jakarta text-slate-900 tracking-tight leading-tight">
          {event.title}
        </h1>

        {/* 3. Especialista */}
        {event.speakerName && (
          <p className="text-lg sm:text-xl font-semibold font-jakarta text-slate-700">
            Con {event.speakerName}
          </p>
        )}

        {/* 4. Bloque de Detalles (Fecha & Locación) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 flex flex-col gap-4 shadow-none">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
              <Clock className="w-5 h-5 text-slate-700" />
            </div>
            <span className="text-sm sm:text-base font-semibold font-jakarta text-slate-900 leading-snug">
              {formattedDateTime}
            </span>
          </div>

          {event.location && (
            <>
              <div className="w-full border-t border-slate-100" />
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                  <MapPin className="w-5 h-5 text-slate-700" />
                </div>
                <span className="text-sm sm:text-base font-semibold font-jakarta text-slate-900 leading-snug">
                  {event.location}
                </span>
              </div>
            </>
          )}
        </div>

        {/* 5. 1er Bloque de Inscripción / Ver Grabación + Compartir */}
        {renderCtaBlock()}

        {/* 6. Descripción */}
        <div className="flex flex-col gap-3 pt-2">
          <h2 className="text-lg font-bold font-jakarta text-slate-900">
            Sobre esta actividad
          </h2>
          {renderDescriptionParagraphs(event.description)}
        </div>

        {/* 7. 2do Bloque de Inscripción / Ver Grabación + Compartir */}
        <div className="pt-2">
          {renderCtaBlock()}
        </div>
      </div>

      {/* DESKTOP LAYOUT (hidden lg:grid) */}
      <div className="hidden lg:grid grid-cols-12 gap-10 xl:gap-12 items-start">
        {/* Left Column (7 cols): Title, Specialist, 1st CTA, Description, 2nd CTA */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <h1 className="text-3xl xl:text-4xl font-bold font-jakarta text-slate-900 tracking-tight leading-tight">
            {event.title}
          </h1>

          {event.speakerName && (
            <p className="text-xl font-semibold font-jakarta text-slate-700">
              Con {event.speakerName}
            </p>
          )}

          {/* 1st CTA Row */}
          {renderCtaBlock()}

          {/* Description */}
          <div className="flex flex-col gap-3 pt-2">
            <h2 className="text-xl font-bold font-jakarta text-slate-900">
              Sobre esta actividad
            </h2>
            {renderDescriptionParagraphs(event.description)}
          </div>

          {/* 2nd CTA Row */}
          <div className="pt-4 border-t border-slate-100">
            {renderCtaBlock()}
          </div>
        </div>

        {/* Right Column (5 cols): Cover & Details Card (Sticky) */}
        <div className="lg:col-span-5 flex flex-col gap-5 sticky top-24">
          <div className="w-full aspect-video rounded-2xl overflow-hidden relative shadow-none border border-slate-200/90 bg-slate-100">
            <Image
              src={coverUrl}
              alt={event.title}
              fill
              priority
              sizes="(max-width: 1200px) 40vw, 35vw"
              className="object-cover object-center"
              unoptimized
            />
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 flex flex-col gap-4 shadow-none">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                <Clock className="w-5 h-5 text-slate-700" />
              </div>
              <span className="text-sm font-semibold font-jakarta text-slate-900 leading-snug">
                {formattedDateTime}
              </span>
            </div>

            {event.location && (
              <>
                <div className="w-full border-t border-slate-100" />
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                    <MapPin className="w-5 h-5 text-slate-700" />
                  </div>
                  <span className="text-sm font-semibold font-jakarta text-slate-900 leading-snug">
                    {event.location}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
