"use client";

import { useState, useMemo } from "react";
import { AdminChat } from "../../types";
import { InputField } from "@/components/ui/InputField";
import { formatDate, formatShortTime } from "../../utils";
import { AdminCard } from "../AdminDesignSystem";

interface ChatsTabProps {
  chats: AdminChat[];
}

export function ChatsTab({ chats }: ChatsTabProps) {
  const [chatSearch, setChatSearch] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string>(chats[0]?.id ?? "");
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  const filteredChats = useMemo(() => {
    const query = chatSearch.trim().toLowerCase();
    if (!query) return chats;

    return chats.filter((chat) => {
      const u1 = chat.user1?.name || "";
      const e1 = chat.user1?.email || "";
      const u2 = chat.user2?.name || "";
      const e2 = chat.user2?.email || "";

      return (
        u1.toLowerCase().includes(query) ||
        e1.toLowerCase().includes(query) ||
        u2.toLowerCase().includes(query) ||
        e2.toLowerCase().includes(query)
      );
    });
  }, [chats, chatSearch]);

  const selectedChat = chats.find((c) => c.id === selectedChatId) ?? filteredChats[0] ?? null;

  return (
    <div className="mx-auto flex max-w-[1350px] flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold leading-tight font-jakarta">Registros de Chats</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            {filteredChats.length} {filteredChats.length === 1 ? "conversación registrada" : "conversaciones registradas"}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        {/* Left Column: list of chats */}
        <div className={`${showMobileDetail ? "hidden xl:flex" : "flex"} flex-col gap-4`}>
          <AdminCard className="p-4">
            <InputField
              value={chatSearch}
              onChange={(event) => setChatSearch(event.target.value)}
              placeholder="Buscar conversación por usuario o email..."
              className="!w-full !h-10 text-xs"
            />
          </AdminCard>

          <AdminCard>
            <div className="grid grid-cols-[1fr_1fr_120px] border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
              <span>Usuario Iniciador</span>
              <span>Usuario Contactado</span>
              <span>Fecha</span>
            </div>
            <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100">
              {filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <span className="material-symbols-rounded text-[48px] mb-3 text-slate-300">
                    chat_bubble_outline
                  </span>
                  <p className="text-sm font-medium">No se encontraron conversaciones.</p>
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const active = chat.id === selectedChat?.id;

                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => {
                        setSelectedChatId(chat.id);
                        setShowMobileDetail(true);
                      }}
                      className={`grid w-full grid-cols-[1fr_1fr_120px] items-center px-4 py-3.5 text-left text-[14px] transition hover:bg-slate-50 outline-none border-none cursor-pointer ${
                        active ? "bg-slate-100/80" : "bg-white"
                      }`}
                    >
                      {/* User 1 */}
                      <span className="flex min-w-0 items-center gap-3 pr-2">
                        {chat.user1?.avatarUrl ? (
                          <img src={chat.user1.avatarUrl} alt="" className="h-8 w-8 rounded-xl object-cover shrink-0" />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-[12px] font-bold text-slate-600 uppercase shrink-0">
                            {(chat.user1?.name || "?").slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-slate-900 text-xs">
                            {chat.user1?.name || "Desconocido"}
                          </span>
                          <span className="block truncate text-[11px] text-slate-500">
                            {chat.user1?.email || "Sin email"}
                          </span>
                        </span>
                      </span>

                      {/* User 2 */}
                      <span className="flex min-w-0 items-center gap-3 pr-2">
                        {chat.user2?.avatarUrl ? (
                          <img src={chat.user2.avatarUrl} alt="" className="h-8 w-8 rounded-xl object-cover shrink-0" />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-[12px] font-bold text-slate-600 uppercase shrink-0">
                            {(chat.user2?.name || "?").slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-slate-900 text-xs">
                            {chat.user2?.name || "Desconocido"}
                          </span>
                          <span className="block truncate text-[11px] text-slate-500">
                            {chat.user2?.email || "Sin email"}
                          </span>
                        </span>
                      </span>

                      {/* Date */}
                      <span className="text-slate-500 text-xs font-sans">
                        {formatDate(chat.updatedAt || chat.createdAt)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </AdminCard>
        </div>

        {/* Right Column: Chat Transcript Reader */}
        {selectedChat ? (
          <AdminCard className={`${showMobileDetail ? "flex" : "hidden xl:flex"} flex-col h-[700px] relative`}>
            {/* Mobile Sticky Back Button Header */}
            <div className="xl:hidden p-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setShowMobileDetail(false)}
                className="flex items-center gap-2 text-xs font-bold text-white hover:text-slate-200 cursor-pointer bg-transparent border-none"
              >
                <span className="material-symbols-rounded text-[18px]">arrow_back</span>
                <span>Volver a la lista de chats</span>
              </button>
            </div>
            {/* Header */}
            <div className="border-b border-slate-200/80 p-5 shrink-0 bg-slate-50/50 flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Transcripción del Chat
              </span>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span>{selectedChat.user1?.name || "Usuario 1"}</span>
                  <span className="material-symbols-rounded text-slate-400 text-sm">swap_horiz</span>
                  <span>{selectedChat.user2?.name || "Usuario 2"}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-sans">
                  {selectedChat.messages?.length || 0} mensajes
                </span>
              </div>
            </div>

            {/* Messages Content */}
            <div className="flex-1 bg-[#F8FAFC] p-4 overflow-y-auto flex flex-col gap-3">
              {!selectedChat.messages || selectedChat.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <span className="material-symbols-rounded text-[40px] mb-2 text-slate-300">chat</span>
                  <p className="text-xs font-medium">No hay mensajes registrados en este chat.</p>
                </div>
              ) : (
                selectedChat.messages.map((msg: any, idx: number) => {
                  const isUser1 = msg.senderId === selectedChat.user1?.id;
                  const senderName = isUser1
                    ? selectedChat.user1?.name
                    : selectedChat.user2?.name;

                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex flex-col gap-1 max-w-[80%] ${
                        isUser1 ? "self-start" : "self-end items-end"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[10px] font-bold text-slate-500">{senderName}</span>
                        <span className="text-[9.5px] text-slate-400 font-sans">
                          {formatShortTime(msg.createdAt)}
                        </span>
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-xs ${
                          isUser1
                            ? "bg-white border border-slate-200 text-slate-900 rounded-tl-xs"
                            : "bg-black text-white rounded-tr-xs"
                        }`}
                      >
                        {msg.content || msg.text || msg.body}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </AdminCard>
        ) : (
          <AdminCard className="flex items-center justify-center p-8 text-center text-slate-400 h-[700px]">
            <p className="text-sm font-medium">Selecciona un chat de la lista para ver los mensajes.</p>
          </AdminCard>
        )}
      </section>
    </div>
  );
}
