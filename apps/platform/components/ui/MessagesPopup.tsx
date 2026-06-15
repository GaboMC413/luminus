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
      className={`group flex gap-4 py-3 px-6 transition-colors cursor-pointer relative ${isUnread ? 'bg-slate-100' : 'bg-white'} hover:bg-slate-50`}
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
      <div className="flex flex-col gap-1 min-w-0 flex-1 justify-center">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-bold text-slate-900 truncate leading-tight">{user}</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[12px] font-medium text-slate-400">{date}</span>
              {isUnread && (
                <div className="w-2 h-2 bg-[#FF4B4B] rounded-full"></div>
              )}
            </div>
          </div>
          <p className="text-[13px] leading-snug text-slate-500 group-hover:text-slate-800 transition-colors truncate">
            {action}
          </p>
        </div>

        {buttonLabel && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-fit h-8 px-4 bg-black hover:bg-slate-800 text-white text-[12px] font-bold rounded-full transition-all mt-1"
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

export function MessagesPopup({ isOpen, onClose, messages, onMarkRead, onMarkAllRead }: MessagesPopupProps) {
  const router = useRouter();
  if (!isOpen) return null;

  return (
    <div
      className="fixed left-4 right-4 top-[72px] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-[400px] md:w-[480px] bg-white border border-slate-200 rounded-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right"
    >
      {/* Header */}
      <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white gap-4">
        <h3 className="text-[15px] font-semibold text-black">Mensajes</h3>
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

      {/* Content */}
      <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-[14px]">No tienes mensajes pendientes</div>
        ) : (
          messages.slice(0, 5).map((msg) => (
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
              }}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={() => {
            onMarkAllRead();
            onClose();
          }}
          className="group w-full flex items-center justify-between px-6 py-3.5 text-[13px] font-semibold text-slate-500 hover:text-black transition-colors cursor-pointer bg-transparent border-none text-left"
        >
          <span>Ver todos los mensajes</span>
          <svg className="w-3.5 h-3.5 transition-colors shrink-0 select-none text-slate-400 group-hover:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
