"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  buttonLabel?: string;
  onClick: () => void;
  onDelete?: () => void;
  isExpanded?: boolean;
}

function NotificationItem({ id, type, avatar, icon, title, user, action, date, isUnread, actionUrl, buttonLabel, onClick, onDelete, isExpanded = false }: NotificationItemProps) {
  const [imageError, setImageError] = useState(false);

  const getRequesterIdFromUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(/[?&]id=([^&]+)/);
    return match ? match[1] : null;
  };

  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const requesterId = getRequesterIdFromUrl(actionUrl);
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
    const requesterId = getRequesterIdFromUrl(actionUrl);
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

  return (
    <div
      onClick={onClick}
      className={`group flex items-start gap-4 py-3 px-6 transition-colors cursor-pointer relative ${isUnread ? "bg-slate-100" : "bg-white"} hover:bg-slate-50`}
    >
      <div className="relative shrink-0">
        {avatar && !imageError ? (
          <img
            src={avatar}
            alt={user}
            onError={() => setImageError(true)}
            className="w-11 h-11 md:w-11 md:h-11 rounded-[10px] object-cover"
          />
        ) : icon ? (
          <div className="w-11 h-11 md:w-11 md:h-11 rounded-[10px] flex items-center justify-center luminus-gradient">
            <span
              className="material-symbols-rounded text-white transition-colors select-none"
              style={{
                fontSize: "32px",
                fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 1, 'opsz' 48",
              }}
            >
              {icon}
            </span>
          </div>
        ) : (
          <div className="w-11 h-11 md:w-11 md:h-11 rounded-[10px] bg-slate-100 flex items-center justify-center">
            <span
              className="material-symbols-rounded text-[32px] text-slate-400 select-none"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
            >
              person
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">{title}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">{date}</span>
              {isUnread && <div className="w-2 h-2 bg-[#FF4B4B] rounded-full shrink-0" />}
              {onDelete && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete();
                  }}
                  className="p-1 -mr-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                  title="Eliminar"
                >
                  <svg className="w-3 h-3 transition-colors shrink-0 select-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <p
            className={`text-sm leading-snug text-slate-600 group-hover:text-slate-900 transition-colors ${isExpanded ? "" : "line-clamp-3 overflow-hidden"}`}
            style={
              isExpanded
                ? {}
                : {
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 3,
                  }
            }
          >
            {user && user !== "LUMINUS" && <span className="font-semibold text-slate-900 group-hover:underline">{user}: </span>}
            {action}
          </p>
        </div>

        {buttonLabel && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onClick();
            }}
            className="w-fit h-8 px-4 bg-black hover:bg-slate-800 text-white text-xs font-semibold rounded-full transition-all"
          >
            {buttonLabel}
          </button>
        )}

        {type === "connection_request" && isUnread && (
          <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleAccept}
              className="h-8 px-4 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl transition duration-200 cursor-pointer border-none outline-none"
            >
              Aceptar
            </button>
            <button
              onClick={handleDecline}
              className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 hover:bg-[#FF4B4B]/10 text-slate-550 hover:text-[#FF4B4B] hover:border-[#FF4B4B]/30 rounded-xl transition duration-200 cursor-pointer outline-none"
              title="Rechazar"
            >
              <span className="material-symbols-rounded text-[18px] select-none">close</span>
            </button>
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
}

export function OnboardingProgressCard({ quests, progressPercentage, onClose }: OnboardingProgressCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-50 border-b border-slate-100 py-3.5 px-6 flex flex-col gap-3">
      <div
        className="flex items-center justify-between cursor-pointer select-none group/header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center luminus-gradient shrink-0">
            <span
              className="material-symbols-rounded text-white text-[18px] select-none"
              style={{
                fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 1, 'opsz' 48",
              }}
            >
              auto_awesome
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 leading-tight">Tus Primeros Destellos</h4>
            <span className="text-xs text-slate-400 font-medium">Enciende tu luz en LUMINUS</span>
          </div>
        </div>
        <span className={`material-symbols-rounded text-slate-400 text-[20px] transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-180" : ""}`}>
          keyboard_arrow_down
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Progreso del camino</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 luminus-gradient"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 gap-1.5 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {quests.map((quest) => (
            <div
              key={quest.id}
              onClick={() => {
                onClose();
                router.push(quest.actionUrl);
              }}
              className="flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/40 p-2 rounded-xl transition cursor-pointer select-none group/item"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`material-symbols-rounded text-[18px] shrink-0 transition-colors ${quest.completed ? "text-slate-400" : "text-slate-400 group-hover/item:text-black"}`}
                  style={{
                    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20",
                  }}
                >
                  {quest.icon}
                </span>
                <span className={`truncate leading-none ${quest.completed ? "line-through text-slate-400" : "font-medium"}`}>
                  {quest.label}
                </span>
              </div>
              <span className={`material-symbols-rounded text-[18px] shrink-0 transition-all ${quest.completed ? "text-emerald-500" : "text-slate-350 group-hover/item:scale-110"}`}>
                {quest.completed ? "check_circle" : "radio_button_unchecked"}
              </span>
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
}

export function NotificationPopup({ isOpen, onClose, notifications, onMarkRead, onMarkAllRead, onDelete }: NotificationPopupProps) {
  const router = useRouter();
  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setExpandedNotificationId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed left-4 right-4 top-[72px] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-[400px] md:w-[480px] bg-white border border-slate-200 rounded-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right"
    >
      <div className="px-6 py-3.5 border-b border-slate-100 bg-white flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-slate-900">Notificaciones</h3>
        <button
          onClick={onClose}
          className="p-1.5 -mr-1.5 rounded-md hover:bg-slate-100 transition-colors text-slate-400 hover:text-black shrink-0 flex items-center justify-center cursor-pointer bg-transparent border-none"
          title="Cerrar"
        >
          <svg className="w-3 h-3 transition-colors shrink-0 select-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No tienes notificaciones pendientes</div>
        ) : (
          notifications.slice(0, 5).map((notification) => {
            if (notification.type === "onboarding-progress") {
              return (
                <OnboardingProgressCard
                  key={notification.id}
                  quests={notification.quests}
                  progressPercentage={notification.progressPercentage}
                  onClose={onClose}
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
                buttonLabel={notification.buttonLabel}
                isExpanded={expandedNotificationId === notification.id}
                onClick={() => {
                  onMarkRead(notification.id);
                  if (notification.action_url) {
                    onClose();
                    router.push(notification.action_url);
                  } else {
                    setExpandedNotificationId((prev) => (prev === notification.id ? null : notification.id));
                  }
                }}
                onDelete={notification.id !== "onboarding-progress" ? () => onDelete(notification.id) : undefined}
              />
            );
          })
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={() => {
            onClose();
            router.push("/notificaciones");
          }}
          className="group w-full flex items-center justify-between px-6 py-3.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer bg-transparent border-none text-left"
        >
          <span>Ver todas las notificaciones</span>
          <svg className="w-3.5 h-3.5 transition-colors shrink-0 select-none text-slate-400 group-hover:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
