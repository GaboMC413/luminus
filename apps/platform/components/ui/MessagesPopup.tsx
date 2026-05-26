"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MessageItemProps {
  avatar?: string;
  icon?: string;
  iconBgColor?: string;
  title: string;
  user: string;
  action: string;
  date: string;
  isUnread: boolean;
  buttonLabel?: string;
  onClick: () => void;
}

function MessageItem({ avatar, icon, iconBgColor, title, user, action, date, isUnread, buttonLabel, onClick }: MessageItemProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`group flex gap-4 p-4 transition-colors cursor-pointer relative ${isUnread ? 'bg-slate-100' : 'bg-white'} hover:bg-slate-50`}
    >
      <div className="relative shrink-0">
        {(avatar && !imageError) ? (
          <img
            src={avatar}
            alt={user}
            onError={() => setImageError(true)}
            className="w-12 h-12 md:w-12 md:h-12 rounded-[8px] object-cover"
          />
        ) : icon ? (
          <div className="w-12 h-12 md:w-12 md:h-12 rounded-[8px] flex items-center justify-center luminus-gradient">
            <span
              className="material-symbols-rounded text-black transition-colors select-none"
              style={{
                fontSize: '32px',
                fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 1, 'opsz' 48"
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
              {isUnread && (
                <div className="w-2 h-2 bg-[#FF4B4B] rounded-full"></div>
              )}
            </div>
          </div>
          <p
            className="text-[14px] leading-snug text-slate-600 group-hover:text-black transition-colors line-clamp-3 overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3
            }}
          >
            <span className="font-bold text-black">{user}: </span>
            {action}
          </p>
        </div>

        {buttonLabel && (
          <button
            onClick={(e) => {
              e.stopPropagation();
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

export interface MessagesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  messages: any[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
}

export function MessagesPopup({ isOpen, onClose, messages, onMarkRead }: MessagesPopupProps) {
  const router = useRouter();
  if (!isOpen) return null;

  return (
    <div
      style={{ width: '480px' }}
      className="absolute right-0 mt-2 bg-white border border-slate-200 rounded-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right shadow-xl"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white gap-4">
        <h3 className="text-[15px] font-semibold text-black">Mensajes</h3>
      </div>

      {/* Content */}
      <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-[14px]">No tienes mensajes pendientes</div>
        ) : (
          messages.map((msg) => (
            <MessageItem
              key={msg.id}
              avatar={msg.avatar}
              title={msg.title}
              user={msg.user}
              action={msg.action}
              date={msg.date}
              isUnread={msg.isUnread}
              buttonLabel={msg.buttonLabel}
              onClick={() => {
                onMarkRead(msg.id);
                onClose();
                alert(`Próximamente: Chat privado con ${msg.user}`);
              }}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 bg-slate-50/50">
        <span
          onClick={() => {
            alert("Próximamente: Panel completo de mensajes");
            onClose();
          }}
          className="flex px-6 py-5 text-[13px] font-semibold text-slate-500 hover:text-black transition-colors cursor-pointer"
        >
          Ver todos los mensajes
        </span>
      </div>
    </div>
  );
}
