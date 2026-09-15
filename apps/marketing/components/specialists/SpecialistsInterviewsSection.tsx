"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { EventItem } from "../events/EventCard";
import { normalizeCategory, checkIsUpcoming } from "@/lib/events";

interface SpecialistsInterviewsSectionProps {
  events?: EventItem[];
  title?: string;
  subtitle?: string;
}

const INTERVIEWS = [
  {
    id: "G7LahF0Mq9A",
    title: "Cuando la comida se vuelve bienestar",
    description:
      "En este encuentro en vivo con Anaí Costa descubrirás cómo transformar tu relación con la comida desde un enfoque integral, lejos de las dietas restrictivas y más cerca de un estilo de vida sostenible y consciente.",
    thumbnail: "https://i.ytimg.com/vi/G7LahF0Mq9A/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=G7LahF0Mq9A",
  },
  {
    id: "l6xc6mspgxk",
    title: "Respiración, postura y movimiento consciente",
    description:
      "Laura Ravaioli, terapeuta corporal, creadora y especialista del Método REEM, una innovadora técnica que ayuda a las personas a optimizar el rendimiento de su cuerpo con el menor esfuerzo posible.",
    thumbnail: "https://i.ytimg.com/vi/l6xc6mspgxk/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=l6xc6mspgxk",
  },
  {
    id: "s7S-ojIpoqU",
    title: "Cómo fomentar el amor propio",
    description:
      "En este encuentro con Carla Lorenzo, psicóloga especializada en enfoque gestáltico, vas a explorar herramientas reales de autoconocimiento y autocuidado para construir una relación más sana y compasiva con vos mismo/a.",
    thumbnail: "https://i.ytimg.com/vi/s7S-ojIpoqU/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=s7S-ojIpoqU",
  },
  {
    id: "d7yR4NBydiY",
    title: "Sanar para Ser",
    description:
      "En esta charla en vivo, el Dr. Julio Tarabini, médico y terapeuta integrador, comparte una visión de la sanación como un camino profundo que atraviesa cuerpo, mente, emociones y espíritu.",
    thumbnail: "https://i.ytimg.com/vi/d7yR4NBydiY/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=d7yR4NBydiY",
  },
  {
    id: "Z77iwEAMakU",
    title: "El té como vehículo terapéutico",
    description:
      "Encuentro en vivo con Mónica Devoto, sommelier de té, explorando las propiedades curativas, rituales y beneficios del té como herramienta de calma, presencia y salud integral.",
    thumbnail: "https://i.ytimg.com/vi/Z77iwEAMakU/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=Z77iwEAMakU",
  },
  {
    id: "fZW8QjPkpFg",
    title: "Bienestar integral y autoconocimiento",
    description:
      "Una conversación sobre las distintas dimensiones de la salud, cómo escuchar las señales de tu cuerpo y construir espacios de calma y equilibrio en tu vida cotidiana.",
    thumbnail: "https://i.ytimg.com/vi/fZW8QjPkpFg/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=fZW8QjPkpFg",
  },
];

export function SpecialistsInterviewsSection({
  events,
  title = "Una red que ya reúne distintas miradas",
  subtitle = "Especialistas de diferentes áreas ya participan en LUMINUS, compartiendo su experiencia y acercando nuevos enfoques sobre el bienestar.",
}: SpecialistsInterviewsSectionProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Helper to extract YouTube ID as fallback
  const getYoutubeId = (url?: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

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

  // Helper to format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = parseCalendarDate(dateStr);
      if (!d) return dateStr;
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Helper to validate speaker name
  const isSpeakerNameValid = (speakerName?: string, itemTitle?: string) => {
    if (!speakerName) return false;
    const cleanName = speakerName.trim();
    if (
      cleanName === "Especialista LUMINUS" ||
      cleanName === "Especialistas LUMINUS" ||
      cleanName === "Especialista" ||
      cleanName === "LUMINUS"
    ) {
      return false;
    }
    if (itemTitle) {
      const cleanTitle = itemTitle.trim().toLowerCase();
      const cleanSpeaker = cleanName.toLowerCase();
      if (cleanTitle === cleanSpeaker) return false;
      if (cleanSpeaker.length >= 4 && cleanTitle.includes(cleanSpeaker)) return false;
    }
    return true;
  };

  // Helper to format upcoming date header
  const formatUpcomingDateHeader = (dateStr?: string, timeText?: string) => {
    if (!dateStr) return { tag: "PRÓXIMAMENTE", dateText: "" };
    try {
      const d = parseCalendarDate(dateStr);
      if (!d) return { tag: "PRÓXIMAMENTE", dateText: dateStr };

      const weekdayRaw = d.toLocaleDateString("es-ES", { weekday: "long" });
      const weekday = weekdayRaw.charAt(0).toUpperCase() + weekdayRaw.slice(1);

      const day = d.getDate();

      const monthRaw = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
      const month = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1);

      const cleanTime = timeText
        ? timeText.replace(/\s*\([^)]*GMT[^)]*\)/gi, "").replace(/\s*\([^)]*UTC[^)]*\)/gi, "").trim()
        : "18:00 hs";

      return {
        tag: "PRÓXIMAMENTE",
        dateText: `${weekday} ${day} de ${month}. ${cleanTime}`,
      };
    } catch {
      return { tag: "PRÓXIMAMENTE", dateText: dateStr };
    }
  };

  // Use dynamic events if present, otherwise fall back to static list
  const baseItems: EventItem[] = events && events.length > 0
    ? events
    : INTERVIEWS.map(item => ({
      youtube_id: item.id,
      title: item.title,
      description: item.description,
      link: item.youtubeUrl,
      date: '',
      speaker_name: 'Especialista LUMINUS',
      category: item.title.toLowerCase().includes('comida') ? 'Nutrición' : item.title.toLowerCase().includes('amor propio') ? 'Bienestar Emocional' : 'Crecimiento Personal',
      cover_url: item.thumbnail
    }));

  // 1. Upcoming events
  const upcomingMap = new Map<string, EventItem>();
  baseItems.forEach((item) => {
    const isUpcoming = checkIsUpcoming(item);
    if (isUpcoming) {
      const key = item.slug || item.id || item.youtube_id;
      if (key && !upcomingMap.has(key)) {
        upcomingMap.set(key, item);
      }
    }
  });

  const upcomingItems = Array.from(upcomingMap.values()).sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateA - dateB;
  });

  // 2. Past recordings
  const pastMap = new Map<string, EventItem>();
  baseItems.forEach((item) => {
    const isUpcoming = checkIsUpcoming(item);
    if (!isUpcoming) {
      const hasYoutubeVideo = Boolean(
        item.youtube_id ||
        (item.link && (item.link.includes("watch?v=") || item.link.includes("youtu.be/")))
      );
      if (hasYoutubeVideo) {
        const key = item.youtube_id || item.id || item.slug;
        if (key && !pastMap.has(key)) {
          pastMap.set(key, item);
        }
      }
    }
  });

  const pastItems = Array.from(pastMap.values()).sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  // Limit to 6 items for carousel
  const filteredItems = [...upcomingItems, ...pastItems].slice(0, 6);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const spacerW = spacerRef.current?.offsetWidth ?? 0;
      setCanScrollLeft(scrollLeft > spacerW + 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = carouselRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const firstCard = carouselRef.current.querySelector<HTMLElement>("[data-card]");
      const cardWidth = firstCard?.clientWidth ?? 384;
      const gap = 32;
      const scrollAmount = cardWidth + gap;
      const targetScroll =
        direction === "left"
          ? carouselRef.current.scrollLeft - scrollAmount
          : carouselRef.current.scrollLeft + scrollAmount;
      carouselRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full pt-8 md:pt-12 pb-16 md:pb-24 bg-white flex flex-col">
      {/* Header: Centered */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-10 mb-8 md:mb-10">
        <div className="w-full flex flex-col justify-center items-center text-center gap-3 md:gap-4 max-w-[960px] mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-heading-3 font-normal tracking-tight text-slate-900 text-center">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl lg:text-2xl font-normal text-slate-700 leading-8 text-center">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Carousel */}
      <div className="w-full flex flex-col gap-6 md:gap-8">
        <div
          ref={carouselRef}
          className="flex items-start gap-6 sm:gap-8 overflow-x-auto scroll-smooth py-2 snap-x snap-mandatory"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingRight: "max(1rem, calc((100vw - 1440px) / 2 + 2.5rem))",
            scrollPaddingLeft: "max(1rem, calc((100vw - 1440px) / 2 + 2.5rem))",
          }}
        >
          <div
            ref={spacerRef}
            aria-hidden
            className="shrink-0"
            style={{ width: "max(1rem, calc((100vw - 1440px) / 2 + 2.5rem))" }}
          />
          {filteredItems.map((item) => {
            const ytId = item.youtube_id || getYoutubeId(item.link) || '';
            const isUpcomingEvent = checkIsUpcoming(item);

            const upcomingHeader = isUpcomingEvent
              ? formatUpcomingDateHeader(item.date, item.time_text)
              : { tag: "", dateText: "" };

            const displayDate = isUpcomingEvent
              ? upcomingHeader.dateText
              : (item.date ? formatDate(item.date) : item.publishTimeText || '');

            const cardHref = isUpcomingEvent
              ? `/proximasfechas/${item.slug || item.id}`
              : (item.link || (ytId ? `https://www.youtube.com/watch?v=${ytId}` : '#'));

            const thumbUrl = item.coverUrl || item.cover_url || '/placeholder-video.jpg';

            return (
              <div
                key={item.id || ytId || item.title}
                data-card
                className="w-[300px] sm:w-[384px] h-[390px] bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors overflow-hidden flex flex-col shrink-0 snap-start group shadow-none"
              >
                <Link
                  href={cardHref}
                  target={isUpcomingEvent ? undefined : "_blank"}
                  rel={isUpcomingEvent ? undefined : "noopener noreferrer"}
                  className="w-full aspect-video relative overflow-hidden bg-slate-200 shrink-0 block hover:opacity-95 transition-opacity"
                >
                  <Image
                    src={thumbUrl}
                    alt={item.title}
                    fill
                    className="object-cover object-center"
                    sizes="384px"
                    unoptimized
                  />
                </Link>

                <div className="w-full flex-1 p-4 flex flex-col justify-between items-start gap-3">
                  <div className="w-full flex flex-col gap-2">
                    {/* Date / Tag */}
                    {isUpcomingEvent ? (
                      <div className="w-full flex justify-start items-center gap-1.5 text-xs font-medium truncate h-4">
                        <span className="font-medium text-slate-900 tracking-tight shrink-0">
                          {upcomingHeader.tag}
                        </span>
                        <span className="text-slate-500 truncate">
                          {upcomingHeader.dateText}
                        </span>
                      </div>
                    ) : (
                      <div className="w-full flex justify-start items-center text-xs font-medium text-slate-500 h-4">
                        <span>{displayDate}</span>
                      </div>
                    )}

                    {/* Title */}
                    <Link
                      href={cardHref}
                      target={isUpcomingEvent ? undefined : "_blank"}
                      rel={isUpcomingEvent ? undefined : "noopener noreferrer"}
                      className="no-underline hover:text-slate-600 transition-colors block"
                    >
                      <h3 className="w-full text-base font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[44px]">
                        {item.title}
                      </h3>
                    </Link>

                    {/* Speaker */}
                    <div className="h-5 flex items-center">
                      {isSpeakerNameValid(item.speaker_name, item.title) && (
                        <span className="text-xs font-medium text-slate-500 truncate max-w-full">
                          Con {item.speaker_name!.startsWith('Con ') ? item.speaker_name!.slice(4) : item.speaker_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="inline-flex justify-start items-center mt-auto pt-3 border-t border-slate-100 w-full">
                    {isUpcomingEvent ? (
                      <Link
                        href={cardHref}
                        className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 no-underline leading-5 hover:text-slate-600 transition-colors"
                      >
                        <span>Inscribirme</span>
                        <svg className="w-4 h-4 text-slate-900 group-hover/link:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    ) : (
                      <a
                        href={cardHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 no-underline leading-5 hover:text-red-600 transition-colors"
                      >
                        <span>Ver grabación</span>
                        <div
                          style={{
                            maskImage: "url('/Icons/play_circle_24dp_000000_FILL0_wght300_GRAD0_opsz24.svg')",
                            WebkitMaskImage: "url('/Icons/play_circle_24dp_000000_FILL0_wght300_GRAD0_opsz24.svg')",
                            maskRepeat: "no-repeat",
                            WebkitMaskRepeat: "no-repeat",
                            maskPosition: "center",
                            WebkitMaskPosition: "center",
                            maskSize: "contain",
                            WebkitMaskSize: "contain",
                          }}
                          className="w-5 h-5 bg-slate-900 group-hover/link:bg-red-600 shrink-0 transition-colors"
                        />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Controls: Arrows and Button */}
        <div
          className="flex justify-between items-center"
          style={{
            paddingLeft: "max(1rem, calc((100vw - 1440px) / 2 + 2.5rem))",
            paddingRight: "max(1rem, calc((100vw - 1440px) / 2 + 2.5rem))",
          }}
        >
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-3 rounded-xl flex justify-center items-center transition-all ${canScrollLeft
              ? "bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
              : "bg-slate-200 text-slate-400 opacity-40 cursor-not-allowed pointer-events-none"
              }`}
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <Link
            href="/proximasfechas"
            className="text-slate-900 text-base font-normal underline hover:text-slate-600 transition-colors"
          >
            Ver entrevistas y encuentros
          </Link>

          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`p-3 rounded-xl flex justify-center items-center transition-all ${canScrollRight
              ? "bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
              : "bg-slate-200 text-slate-400 opacity-40 cursor-not-allowed pointer-events-none"
              }`}
            aria-label="Next slide"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
