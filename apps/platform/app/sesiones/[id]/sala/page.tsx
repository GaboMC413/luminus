"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Video } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "whereby-embed": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          room?: string;
          lang?: string;
        },
        HTMLElement
      >;
    }
  }
}

type RoomData = {
  id: string;
  roomUrl: string;
  isWhereby: boolean;
  hasStarted?: boolean;
  hasEnded?: boolean;
  role: "specialist" | "requester";
  counterpartyName: string;
  friendlyDate: string;
  startTime: string;
  endTime: string;
};

export default function IntroSessionRoomPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sessionId = params?.id || "";
  const embedRef = useRef<HTMLElement | null>(null);

  const [room, setRoom] = useState<RoomData | null>(null);
  const [roomClosed, setRoomClosed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        await import("@whereby.com/browser-sdk/embed");
        const res = await fetch(`/api/sessions/${sessionId}/room`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => null);
        if (!active) return;
        if (!res.ok || !data?.room) {
          setRoomClosed(res.status === 410 || Boolean(data?.closed));
          setError(data?.message || "No pudimos cargar la sala.");
        } else {
          setRoom(data.room);
        }
      } catch {
        if (active) setError("No pudimos conectar con la sala.");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (sessionId) load();
    return () => {
      active = false;
    };
  }, [sessionId]);

  useEffect(() => {
    const el = embedRef.current;
    if (!el || !room?.isWhereby) return;

    const goToFeedback = () => {
      router.push(`/sesiones/feedback?sessionId=${encodeURIComponent(room.id)}`);
    };

    el.addEventListener("leave", goToFeedback);
    el.addEventListener("meeting_end", goToFeedback);
    return () => {
      el.removeEventListener("leave", goToFeedback);
      el.removeEventListener("meeting_end", goToFeedback);
    };
  }, [room, router]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-12 w-72 rounded-xl" />
        <Skeleton className="h-[70vh] w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-center space-y-4">
          <Video className="w-8 h-8 text-slate-400 mx-auto" />
          <h1 className="font-jakarta text-lg font-bold text-slate-900">
            {roomClosed ? "Sala cerrada" : "Sala no disponible"}
          </h1>
          <p className="font-sans text-sm text-slate-600">
            {error || "No encontramos una sala activa para esta sesión."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            {roomClosed && (
              <Button
                variant="primary"
                onClick={() =>
                  router.push(`/sesiones/feedback?sessionId=${encodeURIComponent(sessionId)}`)
                }
              >
                Ir a valoración
              </Button>
            )}
            <Button variant="secondary" onClick={() => router.push("/sesiones")}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Volver a mis sesiones
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 space-y-4">
      <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-jakarta text-sm font-semibold text-slate-900 truncate">
            Sesión introductoria con {room.counterpartyName}
          </p>
          <p className="font-sans text-xs text-slate-500">
            {room.friendlyDate} · {room.startTime} – {room.endTime} hs (15 min)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {room.hasStarted && (
            <Button
              variant="soft"
              size="sm"
              onClick={() =>
                router.push(`/sesiones/feedback?sessionId=${encodeURIComponent(room.id)}`)
              }
            >
              Ir a valoración
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => router.push("/sesiones")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Mis sesiones
          </Button>
        </div>
      </div>

      {room.isWhereby && room.roomUrl ? (
        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/90 h-[76vh] min-h-[480px]">
          <whereby-embed
            ref={embedRef as any}
            room={room.roomUrl}
            lang="es"
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-4">
          <p className="font-sans text-sm text-slate-600">
            Esta sesión utiliza un enlace externo para conectarse.
          </p>
          {/^https?:\/\//i.test(room.roomUrl) ? (
            <a
              href={room.roomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-jakarta text-sm font-semibold hover:bg-black transition-colors"
            >
              Abrir enlace de reunión
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <p className="font-sans text-sm font-medium text-slate-900">
              {room.roomUrl}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
