"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatRelativeTime } from "@/components/ui/PlatformNavbar";
import { OnboardingProgressCard } from "@/components/ui/NotificationPopup";

type Notification = {
  id: string;
  type: string;
  title: string;
  user: string;
  avatar: string;
  icon?: string;
  action: string;
  action_url: string;
  date: string;
  isUnread: boolean;
  quests?: any[];
  progressPercentage?: number;
};

const FILTERS = [
  { id: "todas", label: "Todas" },
  { id: "no_leidas", label: "No leídas" },
  { id: "leidas", label: "Leídas" },
  { id: "especialistas", label: "Especialistas" },
  { id: "comunidad", label: "Comunidad" },
  { id: "generales", label: "Generales" },
];

function NotificationsContent() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("todas");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScrollLimits = () => {
    const el = scrollContainerRef.current;
    if (el) {
      setShowLeftArrow(el.scrollLeft > 5);
      setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    }
  };

  const handleScrollLeft = () => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScrollLimits();

    const ro = new ResizeObserver(() => {
      checkScrollLimits();
    });
    ro.observe(el);

    const t1 = setTimeout(checkScrollLimits, 100);
    const t2 = setTimeout(checkScrollLimits, 500);

    window.addEventListener("resize", checkScrollLimits);

    return () => {
      ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", checkScrollLimits);
    };
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/notifications", {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar las notificaciones.");
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markNotificationRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
    );

    // Call Navbar update to sync badge count immediately
    window.dispatchEvent(new Event("luminus_notifications_update"));

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
  };

  const deleteNotification = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    // Call Navbar update to sync badge count immediately
    window.dispatchEvent(new Event("luminus_notifications_update"));

    await fetch(`/api/notifications?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  };

  const filteredNotifications = notifications.filter((n) => {
    // 1. Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const searchable = `${n.title} ${n.action} ${n.user}`.toLowerCase();
      if (!searchable.includes(searchLower)) return false;
    }

    // 2. Tab filter
    if (activeFilter === "todas") return true;
    if (activeFilter === "leidas") return n.type === "onboarding-progress" ? false : !n.isUnread;
    if (activeFilter === "no_leidas") return n.isUnread;
    if (activeFilter === "especialistas") {
      return String(n.type).includes("follow");
    }
    if (activeFilter === "comunidad") {
      return (
        String(n.type).includes("connect") ||
        n.type === "quest_completed_connect" ||
        String(n.type).includes("connection")
      );
    }
    if (activeFilter === "generales") {
      const isSpecOrComm =
        String(n.type).includes("follow") ||
        String(n.type).includes("connect") ||
        String(n.type).includes("connection") ||
        n.type === "onboarding-progress";
      return !isSpecOrComm;
    }
    return true;
  });

  return (
    <div className="w-full flex flex-col bg-slate-50 h-[calc(100dvh-128px-env(safe-area-inset-bottom,0px))] lg:h-auto overflow-hidden lg:overflow-visible">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col min-h-0 overflow-hidden lg:overflow-visible">
        <div className="w-full max-w-6xl mx-auto flex flex-col flex-1 min-h-0 overflow-hidden lg:overflow-visible">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-4 md:mb-6 shrink-0">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-slate-900 cursor-pointer"
              title="Volver"
            >
              <span className="material-symbols-rounded text-[20px]">arrow_back</span>
            </button>
            <h1 className="text-xl md:text-2xl text-slate-900 font-semibold font-jakarta">Notificaciones</h1>
          </div>

          {error && (
            <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600 shrink-0">
              {error}
            </div>
          )}

          {/* Main Layout Grid */}
          <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 items-stretch flex-1 min-h-0 overflow-hidden lg:overflow-visible">
            
            {/* Sidebar Column (Filters) */}
            <div className="md:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden h-fit md:h-full shrink-0">
              
              {/* Search Bar */}
              <div className="p-3 border-b border-slate-100 shrink-0">
                <div className="relative">
                  <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar notificaciones..."
                    className="w-full bg-slate-50 border-none rounded-full py-2.5 pl-11 pr-4 text-[14px] focus:ring-1 focus:ring-slate-200 outline-none transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* Desktop Filters List */}
              <div className="hidden md:flex flex-col gap-1 p-2 overflow-y-auto thin-scrollbar flex-1">
                {FILTERS.map((f) => {
                  const isActive = activeFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilter(f.id)}
                      className={`px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 text-left border-none ${
                        isActive
                          ? "bg-slate-100 text-slate-900 shadow-none font-semibold"
                          : "hover:bg-slate-50 text-slate-500 hover:text-slate-900 bg-transparent font-medium"
                      }`}
                    >
                      <span className="text-[14px]">{f.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Filters (Horizontal scrollable pills with interactive scroll buttons) */}
              <div className="relative md:hidden w-full overflow-hidden">
                <div 
                  ref={scrollContainerRef}
                  onScroll={checkScrollLimits}
                  className="flex overflow-x-auto gap-2 py-3 px-4 custom-scrollbar shrink-0 select-none no-scrollbar"
                >
                  {FILTERS.map((f) => {
                    const isActive = activeFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setActiveFilter(f.id)}
                        className={`px-4 py-1.5 rounded-full cursor-pointer transition-all duration-300 border text-sm whitespace-nowrap outline-none ${
                          isActive
                            ? "bg-black text-white border-black font-semibold"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 font-semibold"
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
                {/* Left Scroll Button */}
                {showLeftArrow && (
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/90 to-transparent flex items-center pl-1.5 z-20 pointer-events-none">
                    <button
                      onClick={handleScrollLeft}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-md text-slate-500 hover:text-black transition-all cursor-pointer outline-none pointer-events-auto"
                    >
                      <span className="material-symbols-rounded text-[20px] select-none">
                        chevron_left
                      </span>
                    </button>
                  </div>
                )}
                {/* Right Scroll Button */}
                {showRightArrow && (
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/90 to-transparent flex items-center justify-end pr-1.5 z-20 pointer-events-none">
                    <button
                      onClick={handleScrollRight}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-md text-slate-500 hover:text-black transition-all cursor-pointer outline-none pointer-events-auto"
                    >
                      <span className="material-symbols-rounded text-[20px] select-none">
                        chevron_right
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* List Column */}
            <div className="md:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden flex-1 md:flex-initial md:h-full md:min-h-0">
              
              {/* List Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">
                  {filteredNotifications.length} {filteredNotifications.length === 1 ? "Notificación" : "Notificaciones"}
                </span>
              </div>

              {/* Scrollable Notifications List */}
              <div className="flex-1 overflow-y-auto thin-scrollbar bg-white divide-y divide-slate-100">
                {isLoading ? (
                  <div className="p-6 text-sm text-slate-400 text-center">Cargando notificaciones...</div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center gap-4">
                    <span className="material-symbols-rounded text-slate-300 text-[48px]">notifications_off</span>
                    <span>No se encontraron notificaciones en esta sección</span>
                  </div>
                ) : (
                  filteredNotifications.map((n) => {
                    if (n.type === "onboarding-progress") {
                      return (
                        <div key={n.id} className="bg-slate-50/50">
                          <OnboardingProgressCard
                            quests={n.quests || []}
                            progressPercentage={n.progressPercentage || 0}
                            onClose={() => {}}
                          />
                        </div>
                      );
                    }

                    const hasImage = n.avatar && !n.avatar.includes("empty");
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.action_url) {
                            router.push(n.action_url);
                          }
                        }}
                        className={`group flex items-start gap-4 p-5 transition-colors cursor-pointer relative ${
                          n.isUnread ? "bg-slate-50/70" : "bg-white"
                        } hover:bg-slate-50/30`}
                      >
                        {/* Avatar / Icon container */}
                        <div className="relative shrink-0">
                          {hasImage ? (
                            <img
                              src={n.avatar}
                              alt={n.user}
                              className="w-11 h-11 rounded-[10px] object-cover"
                            />
                          ) : n.icon ? (
                            <div className="w-11 h-11 rounded-[10px] flex items-center justify-center luminus-gradient">
                              <span
                                className="material-symbols-rounded text-white transition-colors select-none"
                                style={{
                                  fontSize: "28px",
                                  fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 1, 'opsz' 48",
                                }}
                              >
                                {n.icon}
                              </span>
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-[10px] bg-slate-100 flex items-center justify-center">
                              <span
                                className="material-symbols-rounded text-[28px] text-slate-400 select-none"
                                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
                              >
                                person
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-medium text-slate-400">{n.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">{formatRelativeTime(n.date)}</span>
                              {n.isUnread && <div className="w-2 h-2 bg-[#FF4B4B] rounded-full shrink-0" />}
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  deleteNotification(n.id);
                                }}
                                className="p-1 -mr-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                                title="Eliminar"
                              >
                                <svg className="w-3 h-3 transition-colors shrink-0 select-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed text-slate-600 group-hover:text-slate-900 transition-colors">
                            {n.user && n.user !== "LUMINUS" && (
                              <span className="font-semibold text-slate-900">{n.user}: </span>
                            )}
                            {n.action}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 w-full flex h-full bg-slate-50 items-center justify-center">
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[24px] invert brightness-0" />
            <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Cargando notificaciones...</p>
          </div>
        </div>
      }
    >
      <NotificationsContent />
    </Suspense>
  );
}
