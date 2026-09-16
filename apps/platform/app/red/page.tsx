"use client";

import React, { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/PageLoader";
import { DotSpinner } from "@/components/ui/DotSpinner";
import { UserCard } from "@/components/ui/UserCard";

interface ProfileDetails {
  id: string;
  name: string;
  avatar: string;
  profession: string;
  location: string;
  bio?: string;
  interests?: string[];
  categories?: any[];
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

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
        cache: "no-store"
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
  }, [searchQuery]);

  const handleAcceptRequest = async (userId: string) => {
    // Optimistic UI updates
    setConnections((prev) =>
      prev.map((c) =>
        c.user.id === userId
          ? { ...c, status: "accepted" as const }
          : c
      )
    );

    try {
      const response = await fetch("/api/connections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: userId }),
      });

      if (!response.ok) {
        throw new Error("No pudimos aceptar la solicitud.");
      }
    } catch (err) {
      console.error(err);
      loadConnections();
    }
  };

  const handleDeleteConnection = async (userId: string) => {
    // Optimistic UI updates
    setConnections((prev) => prev.filter((c) => c.user.id !== userId));

    try {
      const response = await fetch(`/api/connections?recipientId=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("No pudimos procesar la acción.");
      }
    } catch (err) {
      console.error(err);
      loadConnections();
    }
  };

  // Classify connections
  const pendingRequests = connections.filter(
    (c) => c.status === "pending" && c.direction === "incoming"
  );

  const activeNetwork = connections
    .filter((c) => c.status === "accepted")
    .sort((a: any, b: any) => {
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });

  // Filter network by search query
  const filteredNetwork = activeNetwork.filter((conn) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name = conn.user.name.toLowerCase();
    const location = conn.user.location.toLowerCase();
    const profession = conn.user.profession.toLowerCase();
    return name.includes(query) || location.includes(query) || profession.includes(query);
  });

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 min-h-0 overflow-visible">
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 pt-4 pb-12 md:py-6 flex flex-col min-h-0 overflow-visible">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 md:mb-6 shrink-0">
          <button
            onClick={() => typeof window !== "undefined" && window.history.length > 1 ? router.back() : router.push("/comunidad")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-slate-900 cursor-pointer"
            title="Volver"
          >
            <span className="material-symbols-rounded text-[20px]">arrow_back</span>
          </button>
          <h1 className="text-xl md:text-2xl text-slate-900 font-semibold font-jakarta">Mi red</h1>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 flex items-center justify-between shadow-none shrink-0">
            <span>{error}</span>
            <button
              onClick={() => typeof window !== "undefined" && window.history.length > 1 ? router.back() : router.push("/comunidad")}
              className="text-xs font-semibold text-slate-900 underline hover:no-underline cursor-pointer bg-transparent border-none font-jakarta"
            >
              Volver
            </button>
          </div>
        )}

        {/* Toolbar: Search input + Solicitudes Button */}
        <div className="flex flex-col sticky top-0 z-40 bg-slate-50 pb-4 gap-3 w-full">
          <div className="flex items-center gap-3 w-full relative">
            {/* Search Bar */}
            <div className="flex-1 min-w-0 h-11 md:h-12 px-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3 focus-within:border-black transition-colors relative">
              <span className="material-symbols-rounded text-[20px] text-slate-400">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, ubicación o especialidad..."
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

            {/* Desktop Solicitudes Button */}
            <button
              onClick={() => setShowRequestsModal(true)}
              className={`hidden md:flex h-11 md:h-12 px-5 items-center justify-center gap-2 rounded-xl transition-all cursor-pointer shadow-none text-sm font-semibold font-jakarta shrink-0 ${
                pendingRequests.length > 0
                  ? "bg-black border border-black text-white hover:bg-zinc-900"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span>Solicitudes</span>
              {pendingRequests.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-white text-black rounded-full leading-none">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            {/* Mobile Solicitudes Button */}
            <button
              onClick={() => setShowRequestsModal(true)}
              className={`flex md:hidden h-11 w-11 items-center justify-center p-0 shrink-0 rounded-xl transition-all cursor-pointer shadow-none relative ${
                pendingRequests.length > 0
                  ? "bg-black border border-black text-white hover:bg-zinc-900"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">person_add</span>
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-black border-2 border-white text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* Contact Count */}
          {!isLoading && (
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-jakarta">
                {activeNetwork.length} {activeNetwork.length === 1 ? 'contacto' : 'contactos'}
              </span>
            </div>
          )}
        </div>

        {/* Content Area: Grid of User Cards */}
        <div className="flex-1 w-full overflow-y-auto custom-scrollbar pb-12">
          {isLoading && connections.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 w-full">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="h-[280px] bg-white rounded-2xl border border-slate-200 p-5 animate-pulse shadow-none" />
              ))}
            </div>
          ) : filteredNetwork.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center p-12 text-center min-h-[300px] bg-white rounded-2xl border border-slate-200">
              <span className="material-symbols-rounded text-slate-300 text-[48px] mb-2 select-none">group_off</span>
              <h3 className="text-base font-semibold text-slate-800 mb-1 font-jakarta">
                {searchQuery ? "No se encontraron contactos" : "Todavía no tienes a nadie en tu red"}
              </h3>
              <p className="text-slate-400 text-sm font-sans max-w-sm">
                {searchQuery
                  ? "Prueba con otros términos de búsqueda."
                  : "Explora la comunidad de miembros para conectar con personas afines."}
              </p>
              {!searchQuery && (
                <Button
                  variant="primary"
                  onClick={() => router.push("/comunidad/miembros")}
                  className="mt-4 px-6 text-xs font-semibold bg-black text-white hover:bg-zinc-900 rounded-xl !w-auto h-10 flex items-center justify-center gap-2"
                >
                  <span>Explorar miembros</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full pb-8">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 w-full">
                {filteredNetwork.slice(0, visibleCount).map((conn) => (
                  <UserCard
                    key={conn.id}
                    user={conn.user}
                    actionMenu={
                      <div className="relative network-menu-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuConnectionId(openMenuConnectionId === conn.id ? null : conn.id);
                          }}
                          className="w-8 h-8 rounded-full bg-white/90 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-black transition-colors cursor-pointer border border-slate-200/80 shadow-none"
                          title="Opciones"
                        >
                          <span className="material-symbols-rounded text-[18px]">more_vert</span>
                        </button>

                        {openMenuConnectionId === conn.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200/90 rounded-2xl overflow-hidden z-50 shadow-xl shadow-slate-900/10 animate-in fade-in zoom-in-95 duration-150 origin-top-right"
                          >
                            <button
                              onClick={() => {
                                handleDeleteConnection(conn.user.id);
                                setOpenMenuConnectionId(null);
                              }}
                              className="group w-full flex items-center gap-2.5 px-4 py-3 text-xs hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors border-none outline-none cursor-pointer bg-transparent text-left font-jakarta font-semibold"
                            >
                              <span className="material-symbols-rounded text-[16px] text-slate-400 group-hover:text-red-500 transition-colors">delete</span>
                              <span>Eliminar de mi red</span>
                            </button>
                          </div>
                        )}
                      </div>
                    }
                  />
                ))}
              </div>

              {filteredNetwork.length > visibleCount && (
                <div className="w-full flex justify-center py-4">
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

      {/* Pending Requests Modal */}
      {showRequestsModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-none flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-slate-700">person_add</span>
                <h3 className="text-base font-bold text-slate-900 font-jakarta">
                  Solicitudes pendientes ({pendingRequests.length})
                </h3>
              </div>
              <button
                onClick={() => setShowRequestsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-black border-none cursor-pointer transition-colors"
              >
                <span className="material-symbols-rounded text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 p-2">
              {pendingRequests.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                  <span className="material-symbols-rounded text-slate-300 text-[36px]">inbox</span>
                  <span>No tienes solicitudes pendientes en este momento.</span>
                </div>
              ) : (
                pendingRequests.map((conn) => (
                  <div key={conn.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <Link
                      href={`/comunidad/public-profile?id=${conn.user.id}`}
                      onClick={() => setShowRequestsModal(false)}
                      className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer group text-decoration-none"
                    >
                      <div className="w-11 h-11 rounded-[10px] bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {conn.user.avatar ? (
                          <img src={conn.user.avatar} alt={conn.user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-rounded text-slate-400 text-[22px]">person</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 truncate font-jakarta group-hover:underline">
                          {conn.user.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                          {conn.user.location || conn.user.profession || "Miembro de la comunidad"}
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleAcceptRequest(conn.user.id)}
                        className="h-8 px-3.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer font-jakarta flex items-center justify-center"
                      >
                        Aceptar
                      </button>
                      <button
                        onClick={() => handleDeleteConnection(conn.user.id)}
                        className="w-8 h-8 rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center border-none outline-none"
                        title="Rechazar"
                      >
                        <span className="material-symbols-rounded text-[18px]">close</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default function NetworkPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <NetworkContent />
    </Suspense>
  );
}
