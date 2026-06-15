"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface NotificationItemProps {
  avatar?: string;
  icon?: string;
  title: string;
  user: string;
  action: string;
  date: string;
  isUnread: boolean;
  buttonLabel?: string;
  onClick: () => void;
  onDelete?: () => void;
}

function NotificationItem({ avatar, icon, title, user, action, date, isUnread, buttonLabel, onClick, onDelete }: NotificationItemProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`group flex items-start gap-4 p-4 transition-colors cursor-pointer relative ${isUnread ? "bg-slate-100" : "bg-white"} hover:bg-slate-50`}
    >
      <div className="relative shrink-0">
        {avatar && !imageError ? (
          <img
            src={avatar}
            alt={user}
            onError={() => setImageError(true)}
            className="w-12 h-12 md:w-12 md:h-12 rounded-[8px] object-cover"
          />
        ) : icon ? (
          <div className="w-12 h-12 md:w-12 md:h-12 rounded-[8px] flex items-center justify-center luminus-gradient">
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
          <div className="w-12 h-12 md:w-12 md:h-12 rounded-[8px] bg-slate-100 flex items-center justify-center">
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
            <span className="text-[12px] font-medium text-slate-400">{title}</span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-slate-400">{date}</span>
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
            className="text-[14px] leading-snug text-slate-600 group-hover:text-black transition-colors line-clamp-3 overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
            }}
          >
            {user && user !== "LUMINUS" && <span className="font-bold text-black">{user}: </span>}
            {action}
          </p>
        </div>

        {buttonLabel && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onClick();
            }}
            className="w-fit h-8 px-4 bg-black hover:bg-slate-800 text-white text-[12px] font-bold rounded-full transition-all"
          >
            {buttonLabel}
          </button>
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
    <div className="bg-slate-50 border-b border-slate-100 p-5 flex flex-col gap-3.5">
      <div
        className="flex items-center justify-between cursor-pointer select-none group/header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center luminus-gradient shrink-0">
            <span
              className="material-symbols-rounded text-white text-[20px] select-none"
              style={{
                fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 1, 'opsz' 48",
              }}
            >
              auto_awesome
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-[13.5px] font-bold text-slate-900 leading-tight">Tus Primeros Destellos</h4>
            <span className="text-[11px] text-slate-400 font-medium">Enciende tu luz en LUMINUS</span>
          </div>
        </div>
        <span className={`material-symbols-rounded text-slate-400 text-[20px] transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-180" : ""}`}>
          keyboard_arrow_down
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">
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
              className="flex items-center justify-between text-[12.5px] text-slate-600 hover:text-black hover:bg-slate-200/40 p-2 rounded-xl transition cursor-pointer select-none group/item"
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed left-4 right-4 top-[72px] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-[400px] md:w-[480px] bg-white border border-slate-200 rounded-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right"
    >
      <div className="px-6 py-5 border-b border-slate-100 bg-white">
        <h3 className="text-[15px] font-semibold text-black">Notificaciones</h3>
      </div>

      <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-[14px]">No tienes notificaciones pendientes</div>
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
                avatar={notification.avatar}
                icon={notification.icon}
                title={notification.title}
                user={notification.user}
                action={notification.action}
                date={notification.date}
                isUnread={notification.isUnread}
                buttonLabel={notification.buttonLabel}
                onClick={() => onMarkRead(notification.id)}
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
          className="flex px-6 py-5 text-[13px] font-semibold text-slate-500 hover:text-black transition-colors cursor-pointer bg-transparent border-none"
        >
          Ver todas las notificaciones
        </button>
      </div>
    </div>
  );
}
