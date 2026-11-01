"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Sparkles,
  CheckCircle2,
  Circle,
  X,
  ChevronDown,
  ArrowRight,
  CheckCheck,
  MessageSquare,
} from "lucide-react";
import { formatMessageBody } from "@/utils/messages";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { EmptyState } from "@/components/ui/EmptyState";

interface NotificationItemProps {
  id: string;
  type: string;
  avatar?: string;
  icon?: string;
  title: string;
  user: string;
  action: string;
  date: string;
  isUnread: boolean;
  actionUrl?: string;
  actorId?: string;
  onClose: () => void;
  onDelete?: () => void;
  onMarkRead: (id: string) => void;
  onOpenChat?: (userId: string, name: string, avatar?: string) => void;
}

function NotificationItem({
  id,
  type,
  avatar,
  icon,
  title,
  user,
  action,
  date,
  isUnread,
  actionUrl,
  actorId,
  onClose,
  onDelete,
  onMarkRead,
  onOpenChat,
}: NotificationItemProps) {
  const router = useRouter();

  const getRequesterIdFromUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(/[?&]id=([^&]+)/);
    return match ? match[1] : null;
  };

  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const requesterId = actorId || getRequesterIdFromUrl(actionUrl);
    if (!requesterId) return;

    try {
      const res = await fetch("/api/connections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: requesterId }),
      });
      if (res.ok) {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        window.dispatchEvent(new Event("luminus_notifications_update"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecline = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const requesterId = actorId || getRequesterIdFromUrl(actionUrl);
    if (!requesterId) return;

    try {
      const res = await fetch(`/api/connections?recipientId=${requesterId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetch(`/api/notifications?id=${id}`, {
          method: "DELETE",
        });
        window.dispatchEvent(new Event("luminus_notifications_update"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCardClick = () => {
    if (isUnread) {
      onMarkRead(id);
    }
    if (actionUrl) {
      onClose();
      router.push(actionUrl);
    }
  };

  const isQuest = String(type).startsWith("quest_completed_");
  const isNetworkAdd = type === "network_add";
  const isConnectionAccepted = type === "connection_accepted";
  const isConnectionRequest = type === "connection_request";

  return (
    <div
      onClick={handleCardClick}
      className={`group flex items-start gap-3.5 p-3.5 transition-colors duration-150 cursor-pointer relative ${
        isUnread
          ? "bg-slate-50/70 hover:bg-slate-100/70"
          : "bg-white hover:bg-slate-50/80"
      }`}
    >
      {/* Avatar or Icon */}
      <div className="relative shrink-0">
        {icon || isQuest ? (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center luminus-gradient text-white shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        ) : (
          <UserAvatar src={avatar} alt={user} size="md" />
        )}
      </div>

      {/* Content — Exact match with MessageItem hierarchy */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1 justify-center">
        {/* Row 1: Name / Title + Date & Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold font-jakarta text-slate-900 truncate leading-tight">
            {isQuest ? "¡Destello completado!" : user}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium text-slate-400 font-sans">{date}</span>
            {isUnread && (
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
                className="w-5 h-5 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 flex items-center justify-center cursor-pointer border-none bg-transparent opacity-0 group-hover:opacity-100"
                title="Eliminar notificación"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Message / Update description */}
        <p className="text-xs leading-relaxed text-slate-500 group-hover:text-slate-800 transition-colors truncate font-sans m-0">
          {isNetworkAdd
            ? "Te sumó a su red."
            : isConnectionAccepted
            ? "Aceptó tu solicitud de conexión."
            : isConnectionRequest
            ? "Quiere conectarse contigo."
            : formatMessageBody(action || title)}
        </p>

        {/* Row 3: High-intent contextual actions */}
        {isNetworkAdd && actionUrl && (
          <div className="mt-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isUnread) onMarkRead(id);
                onClose();
                router.push(actionUrl);
              }}
              className="inline-flex items-center h-7 px-3 rounded-lg text-xs font-semibold font-jakarta text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors border-none cursor-pointer"
            >
              <span>Ver perfil</span>
            </button>
          </div>
        )}

        {isConnectionAccepted && (
          <div className="mt-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isUnread) onMarkRead(id);
                onClose();
                const targetUserId = actorId || getRequesterIdFromUrl(actionUrl);
                if (onOpenChat && targetUserId) {
                  onOpenChat(targetUserId, user, avatar);
                } else if (actionUrl) {
                  router.push(actionUrl);
                }
              }}
              className="inline-flex items-center gap-1.5 h-7.5 px-3 rounded-lg text-xs font-semibold font-jakarta text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors border-none cursor-pointer"
            >
              <MessageSquare className="w-3 h-3 text-slate-500" />
              <span>Enviar mensaje</span>
            </button>
          </div>
        )}

        {isConnectionRequest && isUnread && (
          <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAccept}
              className="!w-auto !h-7 !px-3 !text-xs !rounded-lg"
            >
              Aceptar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDecline}
              className="!w-auto !h-7 !px-3 !text-xs !rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
            >
              Rechazar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface OnboardingProgressCardProps {
  quests: any[];
  progressPercentage: number;
  onClose: () => void;
  onDismiss?: () => void;
}

export function OnboardingProgressCard({
  quests,
  progressPercentage,
  onClose,
  onDismiss
}: OnboardingProgressCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-50/70 border-b border-slate-100 p-4 flex flex-col gap-3">
      <div
        className="flex items-center justify-between cursor-pointer select-none group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center luminus-gradient text-white shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-xs font-bold font-jakarta text-slate-900 leading-tight">
              Tus Primeros Destellos
            </h4>
            <span className="text-[11px] text-slate-500 font-medium font-sans">
              {progressPercentage === 100
                ? "¡Completaste todos tus destellos!"
                : "Enciende tu luz en LUMINUS"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {onDismiss && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="w-6 h-6 hover:bg-slate-200/60 rounded-lg transition-colors text-slate-400 hover:text-slate-900 border-none bg-transparent cursor-pointer flex items-center justify-center"
              title="Descartar destellos"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform duration-150 shrink-0 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-[11px] font-semibold font-jakarta text-slate-500 uppercase tracking-wider">
          <span>{progressPercentage === 100 ? "Camino completado" : "Progreso del camino"}</span>
          <span className={progressPercentage === 100 ? "text-emerald-600 font-bold" : ""}>
            {progressPercentage}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out luminus-gradient"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 gap-1 mt-1 animate-in fade-in-0 duration-150">
          {quests.map((quest) => (
            <div
              key={quest.id}
              onClick={() => {
                onClose();
                router.push(quest.actionUrl);
              }}
              className="flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 hover:bg-white p-2 rounded-xl border border-transparent hover:border-slate-200/70 transition-colors duration-150 cursor-pointer select-none group/item"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`truncate leading-none font-jakarta ${
                    quest.completed ? "line-through text-slate-400" : "font-medium"
                  }`}
                >
                  {quest.label}
                </span>
              </div>
              {quest.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 group-hover/item:text-slate-400 shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: any[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onOpenChat?: (userId: string, name: string, avatar?: string) => void;
}

export function NotificationPopup({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onOpenChat,
}: NotificationPopupProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const hasUnread = notifications.some(
    (n) => n.isUnread && n.type !== "onboarding-progress"
  );

  return (
    <div className="fixed left-4 right-4 top-[70px] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+8px)] w-auto sm:w-[400px] md:w-[440px] bg-white border border-slate-200/90 rounded-2xl z-[100] overflow-hidden shadow-[0_10px_38px_-10px_rgba(22,23,24,0.08),0_4px_16px_-4px_rgba(22,23,24,0.03)] animate-in fade-in-0 zoom-in-98 duration-150 ease-out origin-top-right">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold font-jakarta text-slate-900">Notificaciones</h3>
          {hasUnread && (
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {hasUnread && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-xs font-medium font-jakarta text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
              title="Marcar todas como leídas"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Marcar leídas</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-900 shrink-0 flex items-center justify-center cursor-pointer bg-transparent border-none"
            title="Cerrar"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[380px] overflow-y-auto subtle-scrollbar divide-y divide-slate-100/70">
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-5 h-5 text-slate-400" />}
            title="No tienes notificaciones pendientes"
            description="Te avisaremos cuando haya novedades para ti."
          />
        ) : (
          notifications.slice(0, 5).map((notification) => {
            if (notification.type === "onboarding-progress") {
              return (
                <OnboardingProgressCard
                  key={notification.id}
                  quests={notification.quests}
                  progressPercentage={notification.progressPercentage}
                  onClose={onClose}
                  onDismiss={() => onDelete(notification.id)}
                />
              );
            }
            return (
              <NotificationItem
                key={notification.id}
                id={notification.id}
                type={notification.type}
                avatar={notification.avatar}
                icon={notification.icon}
                title={notification.title}
                user={notification.user}
                action={notification.action}
                date={notification.date}
                isUnread={notification.isUnread}
                actionUrl={notification.action_url}
                actorId={notification.actorId}
                onClose={onClose}
                onMarkRead={onMarkRead}
                onOpenChat={onOpenChat}
                onDelete={
                  notification.id !== "onboarding-progress"
                    ? () => onDelete(notification.id)
                    : undefined
                }
              />
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-slate-100 bg-slate-50/40">
        <button
          type="button"
          onClick={() => {
            onClose();
            router.push("/notificaciones");
          }}
          className="group w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium font-jakarta text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition-colors cursor-pointer bg-transparent border-none text-left"
        >
          <span>Ver todas las notificaciones</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform duration-150 shrink-0" />
        </button>
      </div>
    </div>
  );
}
