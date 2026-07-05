"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/PageLoader";
import { DotSpinner } from "@/components/ui/DotSpinner";


interface ProfileDetails {
  id: string;
  name: string;
  avatar: string;
  profession: string;
  location: string;
  bio?: string;
  interests?: string[];
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
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(50);

  // Active dropdown menu for contacts list
  const [openMenuConnectionId, setOpenMenuConnectionId] = useState<string | null>(null);

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
    setVisibleCount(50);
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
      // Revert state
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
      // Revert state
      loadConnections();
    }
  };

  // Classify connections
  const pendingRequests = connections.filter(
    (c) => c.status === "pending" && c.direction === "incoming"
  );

  const activeNetwork = connections.filter((c) => c.status === "accepted");

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
    <div className="w-full flex-1 flex flex-col bg-slate-50 min-h-0 lg:h-auto overflow-hidden lg:overflow-visible">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-6 md:py-6 flex flex-col min-h-0 overflow-hidden lg:overflow-visible">
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
            <h1 className="text-xl text-slate-900 font-semibold font-jakarta">Mi red</h1>
          </div>

          {error && (
            <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600 shrink-0">
              {error}
            </div>
          )}

          {/* Main Layout Grid */}
          <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 flex-1 min-h-0 items-stretch md:items-start pb-0 overflow-hidden md:overflow-visible">
            
            {/* Left Column: Mi red / active connections */}
            <div className={`order-2 md:order-1 w-full ${pendingRequests.length > 0 ? "md:col-span-8" : "md:col-span-12"} flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden flex-1 md:flex-initial md:h-full md:min-h-0 shrink-0`}>
              
              {/* Search Bar at Top of Active List */}
              <div className="p-3 border-b border-slate-100 shrink-0 bg-white">
                <div className="relative">
                  <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, ubicación o especialidad..."
                    className="w-full bg-slate-50 border-none rounded-full py-2.5 pl-11 pr-4 text-sm focus:ring-1 focus:ring-slate-200 outline-none transition-all text-slate-850"
                  />
                </div>
              </div>



              {/* Scrollable Network List */}
              <div className="w-full flex-1 overflow-y-auto thin-scrollbar divide-y divide-slate-100 bg-white">
                {isLoading && connections.length === 0 ? (
                  <div className="p-8 flex justify-center items-center"><DotSpinner size={32} color="black" /></div>
                ) : filteredNetwork.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center gap-4 py-16 max-w-md mx-auto w-full">
                    <span className="material-symbols-rounded text-slate-300 text-[40px] select-none">group_off</span>
                    <span className="leading-relaxed">
                      {searchQuery
                        ? "No se encontraron resultados para tu búsqueda"
                        : "Todavía no tienes a nadie en tu red, ve a comunidad y descubre personas para agregar."}
                    </span>
                    {!searchQuery && (
                      <Button
                        variant="primary"
                        onClick={() => router.push("/comunidad")}
                        className="mt-2 px-6 text-xs font-semibold bg-black text-white hover:bg-zinc-900 rounded-xl !w-auto h-10 flex items-center justify-center gap-2"
                      >
                        <span>Ir a la Comunidad</span>
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    {filteredNetwork.slice(0, visibleCount).map((conn) => (
                      <div key={conn.id} className="flex items-center gap-3 p-4 hover:bg-slate-50/30 transition-colors">
                        {/* Whole user line as a link */}
                        <Link
                          href={`/comunidad/public-profile?id=${conn.user.id}`}
                          className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer group/line text-decoration-none"
                        >
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            {conn.user.avatar ? (
                              <img
                                src={conn.user.avatar}
                                alt={conn.user.name}
                                className="w-11 h-11 rounded-[10px] object-cover"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-[10px] bg-slate-100 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-rounded text-[24px]">person</span>
                              </div>
                            )}
                          </div>

                          {/* Text details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-slate-900 truncate font-jakarta group-hover/line:underline leading-snug">
                              {conn.user.name}
                            </h4>
                            <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                              {conn.user.location}
                            </p>
                          </div>
                        </Link>

                        {/* Action buttons on the right */}
                        <div className="relative shrink-0 flex items-center gap-1.5 network-menu-container">
                          <Link
                            href={`/comunidad/public-profile?id=${conn.user.id}`}
                            className="h-8 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer font-jakarta flex items-center justify-center shrink-0 text-decoration-none border-none outline-none"
                          >
                            Ver perfil
                          </Link>
                          <button
                            onClick={() => setOpenMenuConnectionId(openMenuConnectionId === conn.id ? null : conn.id)}
                            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all border-none cursor-pointer bg-transparent ${openMenuConnectionId === conn.id ? "bg-slate-100" : "hover:bg-slate-50"}`}
                            title="Opciones"
                          >
                            <span className="material-symbols-rounded text-slate-400 hover:text-black transition-colors select-none">more_vert</span>
                          </button>

                          {openMenuConnectionId === conn.id && (
                            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                              <button
                                onClick={() => {
                                  handleDeleteConnection(conn.user.id);
                                  setOpenMenuConnectionId(null);
                                }}
                                className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                              >
                                <span className="material-symbols-rounded text-slate-500 group-hover:text-[#FF4B4B] text-[18px] transition-colors">delete</span>
                                <span className="font-semibold text-slate-500 group-hover:text-[#FF4B4B] transition-colors">Eliminar de mi red</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {filteredNetwork.length > visibleCount && (
                      <div className="p-4 flex justify-center bg-white border-t border-slate-100">
                        <button
                          onClick={() => setVisibleCount((prev) => prev + 50)}
                          className="h-10 px-6 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer font-jakarta flex items-center gap-2"
                        >
                          <span className="material-symbols-rounded text-[18px]">expand_more</span>
                          Ver más
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Solicitudes pendientes (col-span-4) */}
            {pendingRequests.length > 0 && (
              <div className="order-1 md:order-2 w-full md:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden h-fit md:h-full min-h-0 shrink-0">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Solicitudes pendientes ({pendingRequests.length})
                  </span>
                </div>

                {/* Scrollable Requests List */}
                <div className="flex-1 overflow-y-auto thin-scrollbar divide-y divide-slate-100 md:max-h-full max-h-[300px]">
                  {isLoading && connections.length === 0 ? (
                    <div className="p-8 flex justify-center items-center"><DotSpinner size={32} color="black" /></div>
                  ) : (
                    pendingRequests.map((conn) => (
                      <div key={conn.id} className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50/50 transition-colors">
                        {/* Whole user line as a link */}
                        <Link
                          href={`/comunidad/public-profile?id=${conn.user.id}`}
                          className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer group/line text-decoration-none"
                        >
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            {conn.user.avatar ? (
                              <img
                                src={conn.user.avatar}
                                alt={conn.user.name}
                                className="w-11 h-11 rounded-[10px] object-cover"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-[10px] bg-slate-100 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-rounded text-[24px]">person</span>
                              </div>
                            )}
                          </div>

                          {/* Text details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-slate-900 truncate font-jakarta group-hover/line:underline leading-snug">
                              {conn.user.name}
                            </h4>
                            <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                              {conn.user.location}
                            </p>
                          </div>
                        </Link>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleAcceptRequest(conn.user.id)}
                            className="h-8 px-3.5 bg-black hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer font-jakarta flex items-center justify-center shrink-0"
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleDeleteConnection(conn.user.id)}
                            className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center shrink-0 border-none outline-none"
                            title="Rechazar"
                          >
                            <svg className="w-3.5 h-3.5 transition-colors shrink-0 select-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>


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
