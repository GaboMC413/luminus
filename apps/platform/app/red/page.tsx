"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { NetworkSkeleton, UserCardSkeleton } from "@/components/ui/Skeleton";
import { UserCard } from "@/components/ui/UserCard";
import { Sparkles, Check } from "lucide-react";

interface ProfileDetails {
  id: string;
  name: string;
  avatar: string;
  profession: string;
  location: string;
  bio?: string;
  interests?: string[];
  categories?: any[];
  isSpecialist?: boolean;
  specialty?: string;
  prompts?: { question: string; answer: string }[];
}

interface ConnectionItem {
  id: string;
  status: "pending" | "accepted" | "declined" | "blocked";
  direction: "incoming" | "outgoing";
  user: ProfileDetails;
}

function NetworkContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [activeTab, setActiveTab] = useState<"following" | "followers">("following");
  const [filterType, setFilterType] = useState<"all" | "specialists" | "members">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);

  // Active dropdown menu for contacts list
  const [openMenuConnectionId, setOpenMenuConnectionId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadConnections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/connections", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar tus conexiones.");
      }

      const data = await response.json();
      setConnections(data.connections || []);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
      setConnections([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuConnectionId) {
        const target = event.target as HTMLElement;
        if (!target.closest(".network-menu-container")) {
          setOpenMenuConnectionId(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuConnectionId]);

  useEffect(() => {
    setVisibleCount(24);
  }, [searchQuery, activeTab, filterType]);

  // Directed relationships:
  // following = I added them to my network (outgoing)
  // followers = They added me to their network (incoming)
  const followingList = connections.filter(
    (c) => c.direction === "outgoing" && c.status === "accepted"
  );
  const followersList = connections.filter(
    (c) => c.direction === "incoming" && c.status === "accepted"
  );

  const followingIds = new Set(followingList.map((c) => c.user.id));

  const handleAddToNetwork = async (targetUser: ProfileDetails) => {
    try {
      setActionLoadingId(targetUser.id);
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: targetUser.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "No pudimos sumar al usuario.");
      }

      // Add to local connections state optimistically
      setConnections((prev) => [
        {
          id: `opt-${Date.now()}`,
          status: "accepted",
          direction: "outgoing",
          user: targetUser,
        },
        ...prev,
      ]);
    } catch (err: any) {
      console.error(err);
      loadConnections();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveFromNetwork = async (userId: string) => {
    setOpenMenuConnectionId(null);
    // Optimistic UI update: remove from following
    setConnections((prev) =>
      prev.filter((c) => !(c.direction === "outgoing" && c.user.id === userId))
    );

    try {
      const response = await fetch(`/api/connections?recipientId=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("No pudimos eliminar de tu red.");
      }
    } catch (err) {
      console.error(err);
      loadConnections();
    }
  };

  // Base list depending on active tab
  const currentList = activeTab === "following" ? followingList : followersList;

  // Filter by category type
  const typeFiltered = currentList.filter((conn) => {
    if (filterType === "specialists") return Boolean(conn.user.isSpecialist);
    if (filterType === "members") return !conn.user.isSpecialist;
    return true;
  });

  // Filter by search query
  const filteredList = typeFiltered.filter((conn) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name = conn.user.name.toLowerCase();
    const location = (conn.user.location || "").toLowerCase();
    const profession = (conn.user.profession || "").toLowerCase();
    const specialty = (conn.user.specialty || "").toLowerCase();
    return (
      name.includes(query) ||
      location.includes(query) ||
      profession.includes(query) ||
      specialty.includes(query)
    );
  });

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 min-h-0 overflow-visible font-sans">
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 pt-4 pb-12 md:py-6 flex flex-col min-h-0 overflow-visible">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 md:mb-6 shrink-0">
          <button
            onClick={() =>
              typeof window !== "undefined" && window.history.length > 1
                ? router.back()
                : router.push("/inicio")
            }
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-slate-900 cursor-pointer"
            title="Volver"
          >
            <span className="material-symbols-rounded text-[20px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl text-slate-900 font-bold font-jakarta">Mi red</h1>
            <p className="text-xs text-slate-500 font-sans">
              Personas y especialistas conectados contigo en LUMINUS
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 flex items-center justify-between shadow-none shrink-0">
            <span>{error}</span>
            <button
              onClick={() =>
                typeof window !== "undefined" && window.history.length > 1
                  ? router.back()
                  : router.push("/inicio")
              }
              className="text-xs font-semibold text-slate-900 underline hover:no-underline cursor-pointer bg-transparent border-none font-jakarta"
            >
              Volver
            </button>
          </div>
        )}

        {/* Toolbar: Tabs & Search */}
        <div className="flex flex-col sticky top-0 z-40 bg-slate-50 pb-4 gap-3 w-full">
          {/* Main Navigation Tabs */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("following")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold font-jakarta transition-colors cursor-pointer border-none ${
                  activeTab === "following"
                    ? "bg-slate-900 text-white shadow-none"
                    : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>En mi red</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] leading-none ${
                    activeTab === "following" ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {followingList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("followers")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold font-jakarta transition-colors cursor-pointer border-none ${
                  activeTab === "followers"
                    ? "bg-slate-900 text-white shadow-none"
                    : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>Me sumaron</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] leading-none ${
                    activeTab === "followers" ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {followersList.length}
                </span>
              </button>
            </div>

            {/* Sub-filter chips for 'En mi red' */}
            {activeTab === "following" && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-jakarta">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                    filterType === "all"
                      ? "bg-slate-200/80 border-slate-300 text-slate-900"
                      : "bg-transparent border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterType("specialists")}
                  className={`px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                    filterType === "specialists"
                      ? "bg-slate-200/80 border-slate-300 text-slate-900"
                      : "bg-transparent border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Especialistas
                </button>
                <button
                  onClick={() => setFilterType("members")}
                  className={`px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                    filterType === "members"
                      ? "bg-slate-200/80 border-slate-300 text-slate-900"
                      : "bg-transparent border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Miembros
                </button>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 w-full relative">
            <div className="flex-1 min-w-0 h-11 md:h-12 px-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3 focus-within:border-slate-900 transition-colors relative">
              <span className="material-symbols-rounded text-[20px] text-slate-400">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "following"
                    ? "Buscar en las personas y especialistas de tu red..."
                    : "Buscar en las personas que te sumaron a su red..."
                }
                className="flex-1 min-w-0 bg-transparent border-none text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors border-none bg-transparent cursor-pointer text-slate-400 hover:text-slate-700 flex items-center justify-center"
                >
                  <span className="material-symbols-rounded text-[18px]">close</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full overflow-y-auto custom-scrollbar pb-12">
          {isLoading && connections.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 w-full">
              {[...Array(8)].map((_, idx) => (
                <UserCardSkeleton key={idx} />
              ))}
            </div>
          ) : filteredList.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center p-12 text-center min-h-[300px] bg-white rounded-2xl border border-slate-200">
              <span className="material-symbols-rounded text-slate-300 text-[48px] mb-2 select-none">
                {activeTab === "following" ? "group_off" : "person_add_disabled"}
              </span>
              <h3 className="text-base font-bold text-slate-800 mb-1 font-jakarta">
                {searchQuery
                  ? "No se encontraron contactos"
                  : activeTab === "following"
                  ? "Todavía no tienes a nadie en tu red"
                  : "Aún no te han sumado a ninguna red"}
              </h3>
              <p className="text-slate-400 text-sm font-sans max-w-sm">
                {searchQuery
                  ? "Prueba con otros términos de búsqueda."
                  : activeTab === "following"
                  ? "Explora la comunidad o busca especialistas para sumarlos a tu red."
                  : "Participa en la comunidad publicando y comentando para que otros miembros te conozcan."}
              </p>
              {!searchQuery && activeTab === "following" && (
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="primary"
                    onClick={() => router.push("/inicio/miembros")}
                    className="px-5 text-xs font-semibold h-10"
                  >
                    Ver miembros
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => router.push("/especialistas")}
                    className="px-5 text-xs font-semibold h-10"
                  >
                    Ver especialistas
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 w-full">
                {filteredList.slice(0, visibleCount).map((conn) => {
                  const isInMyNetwork = followingIds.has(conn.user.id);
                  const isActing = actionLoadingId === conn.user.id;

                  return (
                    <UserCard
                      key={conn.id}
                      user={conn.user}
                      profileHref={`/inicio/public-profile?id=${conn.user.id}&from=red`}
                      actionMenu={
                        activeTab === "following" ? (
                          <div className="relative network-menu-container">
                            <button
                              onClick={() =>
                                setOpenMenuConnectionId(
                                  openMenuConnectionId === conn.user.id ? null : conn.user.id
                                )
                              }
                              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer bg-white border border-slate-200/80 shadow-xs"
                              title="Opciones"
                            >
                              <span className="material-symbols-rounded text-[18px]">more_vert</span>
                            </button>

                            {openMenuConnectionId === conn.user.id && (
                              <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100 shadow-none">
                                <Link
                                  href={`/inicio/public-profile?id=${conn.user.id}&from=red`}
                                  className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-jakarta text-decoration-none"
                                >
                                  <span className="material-symbols-rounded text-[16px]">visibility</span>
                                  Ver perfil
                                </Link>
                                <button
                                  onClick={() => {
                                    setOpenMenuConnectionId(null);
                                    const event = new CustomEvent("luminus_open_chat", {
                                      detail: {
                                        userId: conn.user.id,
                                        name: conn.user.name,
                                        avatar: conn.user.avatar,
                                      },
                                    });
                                    window.dispatchEvent(event);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-none bg-transparent cursor-pointer font-jakarta text-left"
                                >
                                  <span className="material-symbols-rounded text-[16px]">chat</span>
                                  Enviar mensaje
                                </button>
                                <div className="h-px bg-slate-100 my-1" />
                                <button
                                  onClick={() => handleRemoveFromNetwork(conn.user.id)}
                                  className="w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-none bg-transparent cursor-pointer font-jakarta text-left"
                                >
                                  <span className="material-symbols-rounded text-[16px]">person_remove</span>
                                  Eliminar de mi red
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center">
                            {isInMyNetwork ? (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold font-jakarta border border-slate-200 flex items-center gap-1 select-none">
                                En mi red
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                variant="primary"
                                disabled={isActing}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToNetwork(conn.user);
                                }}
                                className="h-7 px-3 text-[11px] font-semibold"
                              >
                                <span>{isActing ? "..." : "Sumar"}</span>
                              </Button>
                            )}
                          </div>
                        )
                      }
                    />
                  );
                })}
              </div>

              {filteredList.length > visibleCount && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() => setVisibleCount((prev) => prev + 24)}
                    variant="outline"
                    className="px-6 h-11 font-bold text-sm"
                  >
                    Cargar más contactos
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NetworkPage() {
  return (
    <Suspense fallback={<NetworkSkeleton />}>
      <NetworkContent />
    </Suspense>
  );
}
