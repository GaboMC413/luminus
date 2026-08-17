"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { EventItem } from "../events/EventCard";

interface InterviewsSectionProps {
  events?: EventItem[];
  isGrid?: boolean;
  title?: string;
  subtitle?: string;
  showTitle?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Todos": "#000000",
  "Crecimiento Personal": "#F0A500",
  "Bienestar Emocional": "#E855C8",
  "Salud Integral": "#0450FB",
  "Movimiento Físico": "#E63946",
  "Nutrición": "#A8C800",
  "Espiritualidad": "#6D28D9",
  "Vínculos y Relaciones": "#FF7700",
  "Terapias Complementarias": "#0FA87A",
};

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

function getPageNumbers(currentPage: number, totalPages: number, isMobile = false): (number | string)[] {
  if (isMobile) {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 2) {
      return [1, 2, 3, "...", totalPages];
    }
    if (currentPage >= totalPages - 1) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage, "...", totalPages];
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export function InterviewsSection({
  events,
  isGrid = false,
  title,
  subtitle,
  showTitle = true,
}: InterviewsSectionProps) {
  const defaultTitle = title || (isGrid ? "Entrevistas y grabaciones" : "Entrevistas y conversaciones con especialistas");
  const defaultSubtitle = subtitle || (isGrid ? "Entrevistas y conversaciones con especialistas de distintas disciplinas." : undefined);

  const carouselRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(48);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage, activeCategory]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 640);
        if (window.innerWidth < 768) {
          setItemsPerPage(12);
        } else {
          setItemsPerPage(48);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper to extract YouTube ID as fallback
  const getYoutubeId = (url?: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Helper to format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
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

  // Filter items: only include recorded videos (past date + valid YouTube video link, excluding upcoming events)
  const itemsToRender = baseItems.filter((item) => {
    if (item.is_upcoming === true) return false;
    if (item.date) {
      const d = new Date(item.date);
      if (!isNaN(d.getTime()) && d > new Date()) {
        return false;
      }
    }
    const hasYoutubeVideo = Boolean(
      item.youtube_id ||
      (item.link && (item.link.includes("watch?v=") || item.link.includes("youtu.be/")))
    );
    return hasYoutubeVideo;
  });

  // Sort items from newest to oldest date
  const sortedItems = [...itemsToRender].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  // Filter items based on active category
  const filteredItemsRaw = activeCategory === "Todos"
    ? sortedItems
    : sortedItems.filter(item => item.category === activeCategory);

  // In carousel mode (!isGrid), limit to the 6 most recent recordings
  const filteredItems = isGrid ? filteredItemsRaw : filteredItemsRaw.slice(0, 6);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const spacerW = spacerRef.current?.offsetWidth ?? 0;
      // At the very start, scrollLeft equals spacerW (or 0 if scroll-padding works)
      // Add a small buffer of 5px to avoid false positives from sub-pixel rounding
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
    <section id="entrevistas" className="w-full pt-8 md:pt-12 pb-8 md:pb-16 bg-white flex-1 flex flex-col">
      {showTitle && (
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-10 mb-6 md:mb-10">
          <div className="w-full flex flex-col justify-center items-center gap-3 md:gap-4 text-center">
            <h2 className="w-full text-3xl sm:text-4xl lg:text-heading-3 font-normal tracking-tight text-slate-900 text-center">
              {defaultTitle}
            </h2>
            {defaultSubtitle && (
              <p className="w-full text-xl lg:text-2xl font-normal text-slate-700 leading-8 text-center">
                {defaultSubtitle}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="w-full flex flex-col gap-4 md:gap-5 flex-1">
        {isGrid ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 max-w-[1440px] mx-auto px-4 md:px-10">
              {paginatedItems.map((item) => {
                const ytId = item.youtube_id || getYoutubeId(item.link) || '';
                const thumbUrl = item.cover_url || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : '/placeholder-video.jpg');
                const displayDate = item.date ? formatDate(item.date) : item.publishTimeText || '';

                return (
                  <div
                    key={ytId || item.title}
                    className="w-full min-h-0 sm:min-h-[320px] h-full bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors overflow-hidden flex flex-col group shadow-none"
                  >
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full aspect-video relative overflow-hidden bg-slate-200 shrink-0 block hover:opacity-95 transition-opacity"
                    >
                      <Image
                        src={thumbUrl}
                        alt={item.title}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        unoptimized
                      />
                    </a>

                    <div className="w-full flex-1 p-4 flex flex-col justify-between items-start gap-3">
                      <div className="w-full flex flex-col gap-2">
                        <div className="w-full flex justify-between items-center text-xs text-slate-500 font-medium">
                          <span className="truncate max-w-[150px] sm:max-w-[200px]">{item.speaker_name || 'Especialista LUMINUS'}</span>
                          <span>{displayDate}</span>
                        </div>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-underline hover:text-red-600 transition-colors block"
                        >
                          <h3 className="w-full text-base font-semibold text-slate-900 leading-snug line-clamp-2">
                            {item.title}
                          </h3>
                        </a>
                      </div>

                      <div className="inline-flex justify-start items-center mt-auto pt-3 border-t border-slate-100">
                        {ytId ? (
                          <a
                            href={item.link || `https://www.youtube.com/watch?v=${ytId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 no-underline leading-5 hover:text-red-600 transition-colors"
                          >
                            <span>Ver en YouTube</span>
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
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-500">
                            Este evento ya pasó
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 sm:gap-2 mt-8 md:mt-12 w-full">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex justify-center items-center transition-all ${
                    currentPage > 1
                      ? "bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                      : "bg-slate-100 text-slate-300 cursor-not-allowed pointer-events-none"
                  }`}
                  aria-label="Página anterior"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {getPageNumbers(currentPage, totalPages, isMobile).map((p, idx) => {
                  if (typeof p === "string") {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-1 text-xs sm:text-sm text-slate-400 font-medium select-none">
                        ...
                      </span>
                    );
                  }
                  const isCurrent = p === currentPage;
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-white hover:bg-slate-200 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex justify-center items-center transition-all ${
                    currentPage < totalPages
                      ? "bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                      : "bg-slate-100 text-slate-300 cursor-not-allowed pointer-events-none"
                  }`}
                  aria-label="Página siguiente"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div
              ref={carouselRef}
              className="flex items-start gap-6 sm:gap-8 overflow-x-auto scroll-smooth py-2 snap-x snap-mandatory"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                /* paddingRight keeps trailing space after the last card */
                paddingRight: "max(1rem, calc((100vw - 1440px) / 2 + 2.5rem))",
                /* scroll-padding-left tells snap where the snap port starts (= spacer width) */
                scrollPaddingLeft: "max(1rem, calc((100vw - 1440px) / 2 + 2.5rem))",
              }}
            >
              {/* Leading spacer — real DOM node so padding-left quirk is avoided */}
              <div
                ref={spacerRef}
                aria-hidden
                className="shrink-0"
                style={{ width: "max(1rem, calc((100vw - 1440px) / 2 + 2.5rem))" }}
              />
              {filteredItems.map((item) => {
                const ytId = item.youtube_id || getYoutubeId(item.link) || '';
                const thumbUrl = item.cover_url || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : '/placeholder-video.jpg');
                const displayDate = item.date ? formatDate(item.date) : item.publishTimeText || '';

                return (
                  <div
                    key={ytId || item.title}
                    data-card
                    className="w-[300px] sm:w-[384px] min-h-0 sm:min-h-[320px] bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors overflow-hidden flex flex-col shrink-0 snap-start group shadow-none"
                  >
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
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
                    </a>

                    <div className="w-full flex-1 p-4 flex flex-col justify-between items-start gap-3 w-full">
                      <div className="w-full flex flex-col gap-2">
                        <div className="w-full flex justify-between items-center text-xs text-slate-500 font-medium">
                          <span className="truncate max-w-[150px] sm:max-w-[200px]">{item.speaker_name || 'Especialista LUMINUS'}</span>
                          <span>{displayDate}</span>
                        </div>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-underline hover:text-red-600 transition-colors block"
                        >
                          <h3 className="w-full text-base font-semibold text-slate-900 leading-snug line-clamp-2">
                            {item.title}
                          </h3>
                        </a>
                      </div>

                      <div className="inline-flex justify-start items-center mt-auto">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 no-underline leading-5 hover:text-red-600 transition-colors"
                        >
                          <span>Ver en YouTube</span>
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
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

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
                href="/grabaciones"
                className="text-slate-900 text-base font-normal underline hover:text-slate-600 transition-colors"
              >
                Ver todas las grabaciones
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
          </>
        )}
      </div>
    </section>
  );
}