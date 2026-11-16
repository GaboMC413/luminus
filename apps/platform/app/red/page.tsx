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
  getCachedData,
  setCachedData,
  fetchWithCache,
  invalidateClientCache,
} from "@/lib/clientCache";
import {
  MoreVertical,
  UserMinus,
  Users,
  UserPlus,
  Search,
  Check,
  X,
  Clock,
} from "lucide-react";

interface ProfileDetails {
  id: string;
  slug?: string | null;
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

interface FollowItem {
  id: string;
  user: ProfileDetails;
  created_at?: string;
}

type NetworkTab = "contacts" | "following" | "requests";

function NetworkContent() {
  const router = useRouter();
  const [contacts, setContacts] = useState<ConnectionItem[]>(
    () => getCachedData<any>("/api/connections")?.contacts ?? []
  );
  const [pendingIncoming, setPendingIncoming] = useState<ConnectionItem[]>(
    () => getCachedData<any>("/api/connections")?.pendingIncoming ?? []
  );
  const [pendingOutgoing, setPendingOutgoing] = useState<ConnectionItem[]>(
    () => getCachedData<any>("/api/connections")?.pendingOutgoing ?? []
  );
  const [followingSpecialists, setFollowingSpecialists] = useState<FollowItem[]>(
    () => getCachedData<FollowItem[]>("/api/follows") ?? []
  );
  const [activeTab, setActiveTab] = useState<NetworkTab>("contacts");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(
    () => !getCachedData<any>("/api/connections")
  );
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);

  const loadNetwork = async (force = false) => {
    try {
      if (!getCachedData<any>("/api/connections")) {
        setIsLoading(true);
      }
      setError(null);
      const [connData, followList] = await Promise.all([
        fetchWithCache(
          "/api/connections",
          async () => {
            const connRes = await fetch("/api/connections");
            if (!connRes.ok) {
              throw new Error("No se pudieron cargar tus conexiones.");
            }
            return connRes.json();
          },
          { ttlMs: 60_000, force }
        ),
        fetchWithCache(
          "/api/follows",
          async () => {
            const followRes = await fetch("/api/follows");
            if (!followRes.ok) return getCachedData<FollowItem[]>("/api/follows") ?? [];
            const followData = await followRes.json();
            return (followData.following || []) as FollowItem[];
          },
          { ttlMs: 60_000, force }
        ),
      ]);

      setContacts(connData?.contacts || []);
      setPendingIncoming(connData?.pendingIncoming || []);
      setPendingOutgoing(connData?.pendingOutgoing || []);
      setFollowingSpecialists(followList || []);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
      setContacts([]);
      setPendingIncoming([]);
      setPendingOutgoing([]);
      setFollowingSpecialists([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNetwork(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuUserId) {
        const target = event.target as HTMLElement;
        if (!target.closest(".network-menu-container")) {
          setOpenMenuUserId(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuUserId]);

  useEffect(() => {
    setVisibleCount(24);
  }, [searchQuery, activeTab]);

  const handleRemoveContact = async (userId: string) => {
    setOpenMenuUserId(null);
    setContacts((prev) => prev.filter((c) => c.user.id !== userId));
    invalidateClientCache(["/api/connections", "/api/comunidad/profile*"]);
    try {
      const response = await fetch(`/api/connections?recipientId=${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("No pudimos eliminar el contacto.");
    } catch (err) {
      console.error(err);
      loadNetwork(true);
    }
  };

  const handleUnfollowSpecialist = async (userId: string) => {
    setOpenMenuUserId(null);
    setFollowingSpecialists((prev) => {
      const next = prev.filter((f) => f.user.id !== userId);
      setCachedData("/api/follows", next);
      return next;
    });
    invalidateClientCache("/api/comunidad/profile*");
    try {
      const response = await fetch(`/api/follows?followingId=${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("No pudimos dejar de seguir al especialista.");
    } catch (err) {
      console.error(err);
      loadNetwork(true);
    }
  };

  const handleAcceptRequest = async (userId: string) => {
    try {
      setActionLoadingId(userId);
      const res = await fetch("/api/connections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: userId }),
      });
      if (!res.ok) throw new Error("No pudimos aceptar la solicitud.");
      invalidateClientCache(["/api/connections", "/api/comunidad/profile*"]);
      const accepted = pendingIncoming.find((c) => c.user.id === userId);
      setPendingIncoming((prev) => prev.filter((c) => c.user.id !== userId));
      if (accepted) {
        setContacts((prev) => [{ ...accepted, status: "accepted" }, ...prev]);
      } else {
        loadNetwork(true);
      }
    } catch (err) {
      console.error(err);
      loadNetwork(true);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineOrCancelRequest = async (userId: string) => {
    try {
      setActionLoadingId(userId);
      const res = await fetch(`/api/connections?recipientId=${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("No pudimos actualizar la solicitud.");
      invalidateClientCache(["/api/connections", "/api/comunidad/profile*"]);
      setPendingIncoming((prev) => prev.filter((c) => c.user.id !== userId));
      setPendingOutgoing((prev) => prev.filter((c) => c.user.id !== userId));
    } catch (err) {
      console.error(err);
      loadNetwork(true);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filterByQuery = <T extends { user: ProfileDetails }>(list: T[]): T[] => {
    if (!searchQuery) return list;
    const query = searchQuery.toLowerCase();
    return list.filter((item) => {
      const name = item.user.name.toLowerCase();
      const location = (item.user.location || "").toLowerCase();
      const profession = (item.user.profession || "").toLowerCase();
      const specialty = (item.user.specialty || "").toLowerCase();
      return (
        name.includes(query) ||
        location.includes(query) ||
        profession.includes(query) ||
        specialty.includes(query)
      );
    });
  };

  const filteredContacts = filterByQuery(contacts);
  const filteredFollowing = filterByQuery(followingSpecialists);
  const filteredIncoming = filterByQuery(pendingIncoming);
  const filteredOutgoing = filterByQuery(pendingOutgoing);
  const totalRequests = pendingIncoming.length + pendingOutgoing.length;

  const currentSimpleList = activeTab === "contacts" ? filteredContacts : filteredFollowing;

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 min-h-0 overflow-visible font-sans">
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 pt-4 pb-12 md:py-6 flex flex-col min-h-0 overflow-visible">
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

        <div className="flex flex-col sticky top-0 z-40 bg-slate-50 pb-4 gap-3 w-full">
          <UnderlineTabs
            tabs={[
              { id: "contacts", label: "Contactos" },
              { id: "following", label: "Siguiendo" },
              {
                id: "requests",
                label: pendingIncoming.length > 0 ? `Solicitudes (${pendingIncoming.length})` : "Solicitudes",
              },
            ]}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as NetworkTab)}
          />

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={
              activeTab === "contacts"
                ? "Buscar en tus contactos..."
                : activeTab === "following"
                ? "Buscar especialistas que sigues..."
                : "Buscar en solicitudes..."
            }
            className="w-full"
          />
        </div>

        <div className="flex-1 w-full overflow-y-auto custom-scrollbar pb-12">
          {isLoading && contacts.length === 0 && followingSpecialists.length === 0 && totalRequests === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 w-full">
              {[...Array(8)].map((_, idx) => (
                <UserCardSkeleton key={idx} />
              ))}
            </div>
          ) : activeTab === "requests" ? (
            filteredIncoming.length === 0 && filteredOutgoing.length === 0 ? (
              <div className="w-full bg-white rounded-2xl border border-slate-200/90">
                <EmptyState
                  icon={searchQuery ? <Search className="w-6 h-6 stroke-[1.75]" /> : <UserPlus className="w-6 h-6 stroke-[1.75]" />}
                  title={searchQuery ? "No se encontraron resultados" : "No tienes solicitudes pendientes"}
                  description={
                    searchQuery
                      ? "Prueba con otros términos de búsqueda."
                      : "Cuando alguien quiera conectar contigo o envíes una solicitud, aparecerá aquí."
                  }
                />
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {filteredIncoming.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h2 className="text-sm font-semibold text-slate-700 font-jakarta">
                      Solicitudes recibidas ({filteredIncoming.length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 w-full">
                      {filteredIncoming.map((conn) => {
                        const isActing = actionLoadingId === conn.user.id;
                        return (
                          <UserCard
                            key={conn.id}
                            user={conn.user}
                            specialty={null}
                            title={null}
                            profileHref={`/perfil/${conn.user.slug || conn.user.id}?from=red`}
                            actionMenu={
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={isActing}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptRequest(conn.user.id);
                                  }}
                                  className="h-7 px-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer border-none flex items-center gap-1 disabled:opacity-50"
                                  title="Aceptar"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Aceptar</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={isActing}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeclineOrCancelRequest(conn.user.id);
                                  }}
                                  className="h-7 w-7 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer border-none flex items-center justify-center disabled:opacity-50"
                                  title="Rechazar"
                                  aria-label="Rechazar solicitud"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            }
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {filteredOutgoing.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h2 className="text-sm font-semibold text-slate-700 font-jakarta">
                      Solicitudes enviadas ({filteredOutgoing.length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 w-full">
                      {filteredOutgoing.map((conn) => {
                        const isActing = actionLoadingId === conn.user.id;
                        return (
                          <UserCard
                            key={conn.id}
                            user={conn.user}
                            specialty={null}
                            title={null}
                            profileHref={`/perfil/${conn.user.slug || conn.user.id}?from=red`}
                            actionMenu={
                              <button
                                type="button"
                                disabled={isActing}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeclineOrCancelRequest(conn.user.id);
                                }}
                                className="h-7 px-2.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer border-none flex items-center gap-1 disabled:opacity-50"
                                title="Cancelar solicitud"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Pendiente</span>
                              </button>
                            }
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : currentSimpleList.length === 0 ? (
            <div className="w-full bg-white rounded-2xl border border-slate-200/90">
              <EmptyState
                icon={searchQuery ? <Search className="w-6 h-6 stroke-[1.75]" /> : <Users className="w-6 h-6 stroke-[1.75]" />}
                title={
                  searchQuery
                    ? "No se encontraron resultados"
                    : activeTab === "contacts"
                    ? "Todavía no tienes contactos"
                    : "Todavía no sigues a ningún especialista"
                }
                description={
                  searchQuery
                    ? "Prueba con otros términos de búsqueda."
                    : activeTab === "contacts"
                    ? "Explora la comunidad y envía solicitudes de conexión para construir tu red."
                    : "Descubre especialistas en LUMINUS y síguelos para mantenerte al día."
                }
                action={
                  !searchQuery ? (
                    <div className="flex items-center gap-2">
                      {activeTab === "contacts" ? (
                        <Button variant="primary" size="md" onClick={() => router.push("/inicio/miembros")}>
                          Ver miembros
                        </Button>
                      ) : (
                        <Button variant="primary" size="md" onClick={() => router.push("/especialistas")}>
                          Ver especialistas
                        </Button>
                      )}
                    </div>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 w-full">
                {currentSimpleList.slice(0, visibleCount).map((item) => (
                  <UserCard
                    key={item.id}
                    user={item.user}
                    specialty={null}
                    title={null}
                    profileHref={`/perfil/${item.user.slug || item.user.id}?from=red`}
                    actionMenu={
                      <div className="relative network-menu-container">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuUserId(openMenuUserId === item.user.id ? null : item.user.id)
                          }
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer bg-transparent border-none"
                          title="Opciones"
                          aria-label="Opciones"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuUserId === item.user.id && (
                          <div className="absolute top-full right-0 mt-1 w-max min-w-[156px] bg-white border border-slate-200/90 rounded-xl overflow-hidden py-1 z-50 animate-in fade-in duration-150 shadow-none">
                            <button
                              type="button"
                              onClick={() =>
                                activeTab === "contacts"
                                  ? handleRemoveContact(item.user.id)
                                  : handleUnfollowSpecialist(item.user.id)
                              }
                              className="w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50/70 flex items-center gap-2 border-none bg-transparent cursor-pointer font-jakarta text-left whitespace-nowrap transition-colors"
                            >
                              <UserMinus className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                {activeTab === "contacts" ? "Eliminar contacto" : "Dejar de seguir"}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    }
                  />
                ))}
              </div>

              {currentSimpleList.length > visibleCount && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() => setVisibleCount((prev) => prev + 24)}
                    variant="outline"
                    className="px-6 h-11 font-bold text-sm"
                  >
                    Cargar más
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
