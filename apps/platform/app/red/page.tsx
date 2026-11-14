"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { NetworkSkeleton } from "@/components/ui/Skeleton";
import { UserCard, UserCardSkeleton } from "@/components/ui/UserCard";
import { UnderlineTabs } from "@/components/ui/UnderlineTabs";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  MoreVertical,
  UserMinus,
  Users,
  UserPlus,
  Search,
} from "lucide-react";

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
  }, [searchQuery, activeTab]);

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

  // Filter by search query
  const filteredList = currentList.filter((conn) => {
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
        <PageHeader
          title="Mi red"
          showBack
          backFallbackHref="/inicio"
          className="mb-4 md:mb-6"
        />

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
          <UnderlineTabs
            tabs={[
              { id: "following", label: "Siguiendo" },
              { id: "followers", label: "Seguidores" },
            ]}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as "following" | "followers")}
          />

          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={
              activeTab === "following"
                ? "Buscar en las personas que sigues..."
                : "Buscar en tus seguidores..."
            }
            className="w-full"
          />
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
            <div className="w-full bg-white rounded-2xl border border-slate-200/90">
              <EmptyState
                icon={
                  searchQuery ? (
                    <Search className="w-6 h-6 stroke-[1.75]" />
                  ) : activeTab === "following" ? (
                    <Users className="w-6 h-6 stroke-[1.75]" />
                  ) : (
                    <UserPlus className="w-6 h-6 stroke-[1.75]" />
                  )
                }
                title={
                  searchQuery
                    ? "No se encontraron resultados"
                    : activeTab === "following"
                    ? "Todavía no sigues a nadie"
                    : "Aún no tienes seguidores"
                }
                description={
                  searchQuery
                    ? "Prueba con otros términos de búsqueda."
                    : activeTab === "following"
                    ? "Explora la comunidad o busca especialistas para seguir."
                    : "Comparte reflexiones o participa en la comunidad para que otras personas te conozcan y te sigan."
                }
                action={
                  !searchQuery && activeTab === "following" ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => router.push("/inicio/miembros")}
                      >
                        Ver miembros
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => router.push("/especialistas")}
                      >
                        Ver especialistas
                      </Button>
                    </div>
                  ) : undefined
                }
              />
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
                      specialty={null}
                      title={null}
                      profileHref={`/inicio/public-profile?id=${conn.user.id}&from=red`}
                      actionMenu={
                        activeTab === "following" ? (
                          <div className="relative network-menu-container">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuConnectionId(
                                  openMenuConnectionId === conn.user.id ? null : conn.user.id
                                )
                              }
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer bg-transparent border-none"
                              title="Opciones"
                              aria-label="Opciones"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openMenuConnectionId === conn.user.id && (
                              <div className="absolute top-full right-0 mt-1 w-max min-w-[148px] bg-white border border-slate-200/90 rounded-xl overflow-hidden py-1 z-50 animate-in fade-in duration-150 shadow-none">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFromNetwork(conn.user.id)}
                                  className="w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50/70 flex items-center gap-2 border-none bg-transparent cursor-pointer font-jakarta text-left whitespace-nowrap transition-colors"
                                >
                                  <UserMinus className="w-3.5 h-3.5 shrink-0" />
                                  <span>Dejar de seguir</span>
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center">
                            {isInMyNetwork ? (
                              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-meta font-jakarta border border-slate-200/80 select-none">
                                Siguiendo
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
                                className="h-7 px-3 text-xs font-semibold"
                              >
                                <span>{isActing ? "..." : "Seguir"}</span>
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
