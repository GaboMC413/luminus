"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, ArrowRight, X, CheckCheck } from "lucide-react";
import { formatMessageBody } from "@/utils/messages";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { EmptyState } from "@/components/ui/EmptyState";

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

function MessageItem({
  avatar,
  user,
  action,
  date,
  isUnread,
  buttonLabel,
  onClick
}: MessageItemProps) {
  return (
    <div
      onClick={onClick}
      className={`group flex items-start gap-3.5 p-3.5 transition-colors duration-150 cursor-pointer relative ${
        isUnread
          ? "bg-slate-50/70 hover:bg-slate-100/70"
          : "bg-white hover:bg-slate-50/80"
      }`}
    >
      <div className="relative shrink-0">
        <UserAvatar src={avatar} alt={user} size="md" />
      </div>

      <div className="flex flex-col gap-0.5 min-w-0 flex-1 justify-center">
        {/* Row 1: Name + Date & Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold font-jakarta text-slate-900 truncate leading-tight">
            {user}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium text-slate-400 font-sans">{date}</span>
            {isUnread && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
          </div>
        </div>

        {/* Row 2: Message preview description */}
        <p className="text-xs leading-relaxed text-slate-500 group-hover:text-slate-800 transition-colors truncate font-sans m-0">
          {formatMessageBody(action)}
        </p>

        {buttonLabel && (
          <div className="mt-1">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="!w-auto !h-7 !px-3 !text-xs !rounded-lg"
            >
              {buttonLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export interface MessagesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  messages: any[];
  onMarkRead: (id: string | number) => void;
  onMarkAllRead: () => void;
}

export function MessagesPopup({
  isOpen,
  onClose,
  messages,
  onMarkRead,
  onMarkAllRead
}: MessagesPopupProps) {
  const router = useRouter();
  if (!isOpen) return null;

  const hasUnread = messages.some((m) => m.isUnread && !m.isMuted);

  return (
    <div className="fixed left-4 right-4 top-[70px] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+8px)] w-auto sm:w-[400px] md:w-[440px] bg-white border border-slate-200/90 rounded-2xl z-[100] overflow-hidden shadow-[0_10px_38px_-10px_rgba(22,23,24,0.08),0_4px_16px_-4px_rgba(22,23,24,0.03)] animate-in fade-in-0 zoom-in-98 duration-150 ease-out origin-top-right">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold font-jakarta text-slate-900">Mensajes</h3>
          {hasUnread && <span className="w-2 h-2 rounded-full bg-rose-500" />}
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
              <span>Marcar leídos</span>
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
        {messages.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="w-5 h-5 text-slate-400" />}
            title="No tienes mensajes pendientes"
            description="Tus conversaciones recientes aparecerán aquí."
          />
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
      <div className="p-2 border-t border-slate-100 bg-slate-50/40">
        <button
          type="button"
          onClick={() => {
            onClose();
            router.push("/mensajes");
          }}
          className="group w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium font-jakarta text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition-colors cursor-pointer bg-transparent border-none text-left"
        >
          <span>Ver todos los mensajes</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform duration-150 shrink-0" />
        </button>
      </div>
    </div>
  );
}
