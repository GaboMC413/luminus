"use client";

import { useState, useMemo } from "react";
import { AdminChat } from "../../types";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { formatDate, formatShortTime } from "../../utils";
import { AdminCard } from "../AdminDesignSystem";

interface SupportChatsTabProps {
  supportChats: AdminChat[];
  setSupportChats: React.Dispatch<React.SetStateAction<AdminChat[]>>;
}

export function SupportChatsTab({ supportChats, setSupportChats }: SupportChatsTabProps) {
  const [supportSearch, setSupportSearch] = useState("");
  const [selectedSupportChatId, setSelectedSupportChatId] = useState<string>(supportChats[0]?.id ?? "");
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  const filteredSupportChats = useMemo(() => {
    const query = supportSearch.trim().toLowerCase();
    if (!query) return supportChats;

    return supportChats.filter((chat) => {
      const u1Name = chat.user1?.name || "";
      const u1Email = chat.user1?.email || "";
      const u2Name = chat.user2?.name || "";
      const e2Email = chat.user2?.email || "";

      return (
        u1Name.toLowerCase().includes(query) ||
        u1Email.toLowerCase().includes(query) ||
        u2Name.toLowerCase().includes(query) ||
        e2Email.toLowerCase().includes(query)
      );
    });
  }, [supportChats, supportSearch]);

  const selectedSupportChat = supportChats.find((c) => c.id === selectedSupportChatId) ?? filteredSupportChats[0] ?? null;

  async function sendSupportReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSupportChat || !replyText.trim() || isSendingReply) return;

    setIsSendingReply(true);

    try {
      const clientUserId =
        selectedSupportChat.user1?.email === "info@luminuslatam.com"
          ? selectedSupportChat.user2?.id
          : selectedSupportChat.user1?.id;

      if (!clientUserId) return;

      const res = await fetch(`/api/admin/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: clientUserId,
          body: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error al enviar el mensaje de soporte.");
        return;
      }

      setSupportChats((prev) =>
        prev.map((c) =>
          c.id === selectedSupportChat.id
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: data.data.id,
                    body: data.data.body,
                    senderId: data.data.senderId,
                    createdAt: data.data.createdAt,
                  },
                ],
              }
            : c
        )
      );

      setReplyText("");
    } catch {
      alert("Error de conexión.");
    } finally {
      setIsSendingReply(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-[1350px] flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold leading-tight font-jakarta">Chats de LUMINUS (Soporte)</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            {filteredSupportChats.length}{" "}
            {filteredSupportChats.length === 1 ? "chat de soporte activo" : "chats de soporte activos"}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        {/* Left Column: list of support chats */}
        <div className="flex flex-col gap-4">
          <AdminCard className="p-4">
            <InputField
              value={supportSearch}
              onChange={(event) => setSupportSearch(event.target.value)}
              placeholder="Buscar chat de soporte por usuario..."
              className="!w-full !h-10 text-xs"
            />
          </AdminCard>

          <AdminCard>
            <div className="grid grid-cols-[1.5fr_120px] border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
              <span>Usuario Soporte</span>
              <span>Última Actividad</span>
            </div>
            <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100">
              {filteredSupportChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <span className="material-symbols-rounded text-[48px] mb-3 text-slate-300">
                    support_agent
                  </span>
                  <p className="text-sm font-medium">No hay mensajes de soporte.</p>
                </div>
              ) : (
                filteredSupportChats.map((chat) => {
                  const active = chat.id === selectedSupportChat?.id;
                  const clientUser =
                    chat.user1?.email === "info@luminuslatam.com" ? chat.user2 : chat.user1;

                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => setSelectedSupportChatId(chat.id)}
                      className={`grid w-full grid-cols-[1.5fr_120px] items-center px-4 py-3.5 text-left text-[14px] transition hover:bg-slate-50 outline-none border-none cursor-pointer ${
                        active ? "bg-slate-100/80" : "bg-white"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3 pr-2">
                        {clientUser?.avatarUrl ? (
                          <img
                            src={clientUser.avatarUrl}
                            alt=""
                            className="h-9 w-9 rounded-xl object-cover shrink-0"
                          />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[13px] font-bold text-slate-600 uppercase shrink-0">
                            {(clientUser?.name || "?").slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-slate-900 text-xs">
                            {clientUser?.name || "Usuario de Soporte"}
                          </span>
                          <span className="block truncate text-[11px] text-slate-500">
                            {clientUser?.email || "Sin email"}
                          </span>
                        </span>
                      </span>

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

        {/* Right Column: Chat view & Reply form */}
        {selectedSupportChat ? (
          <AdminCard className="flex flex-col h-[700px]">
            {/* Header */}
            <div className="border-b border-slate-200/80 p-5 shrink-0 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-jakarta">
                  {selectedSupportChat.user1?.email === "info@luminuslatam.com"
                    ? selectedSupportChat.user2?.name
                    : selectedSupportChat.user1?.name}
                </h3>
                <p className="text-[11.5px] text-slate-500">
                  {selectedSupportChat.user1?.email === "info@luminuslatam.com"
                    ? selectedSupportChat.user2?.email
                    : selectedSupportChat.user1?.email}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Soporte Directo
              </span>
            </div>

            {/* Messages Content */}
            <div className="flex-1 bg-[#F8FAFC] p-4 overflow-y-auto flex flex-col gap-3">
              {!selectedSupportChat.messages || selectedSupportChat.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <span className="material-symbols-rounded text-[40px] mb-2 text-slate-300">chat</span>
                  <p className="text-xs font-medium">No hay mensajes en este chat.</p>
                </div>
              ) : (
                selectedSupportChat.messages.map((msg: any, idx: number) => {
                  const isLuminusAdmin =
                    msg.senderId !==
                    (selectedSupportChat.user1?.email === "info@luminuslatam.com"
                      ? selectedSupportChat.user2?.id
                      : selectedSupportChat.user1?.id);

                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex flex-col gap-1 max-w-[80%] ${
                        isLuminusAdmin ? "self-end items-end" : "self-start"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[10px] font-bold text-slate-500">
                          {isLuminusAdmin ? "Soporte LUMINUS" : "Usuario"}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-sans">
                          {formatShortTime(msg.createdAt)}
                        </span>
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-xs ${
                          isLuminusAdmin
                            ? "bg-black text-white rounded-tr-xs"
                            : "bg-white border border-slate-200 text-slate-900 rounded-tl-xs"
                        }`}
                      >
                        {msg.content || msg.text || msg.body}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Form */}
            <form onSubmit={sendSupportReply} className="p-3 border-t border-slate-200/80 bg-white flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escribe una respuesta de soporte..."
                className="flex-1 h-10 px-3.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-black bg-slate-50"
              />
              <Button
                type="submit"
                disabled={isSendingReply || !replyText.trim()}
                className="!h-10 px-4 bg-black hover:bg-slate-800 text-white text-xs font-bold shrink-0 rounded-xl border-none"
              >
                {isSendingReply ? "Enviando..." : "Responder"}
              </Button>
            </form>
          </AdminCard>
        ) : (
          <AdminCard className="flex items-center justify-center p-8 text-center text-slate-400 h-[700px]">
            <p className="text-sm font-medium">Selecciona un chat de soporte para responder.</p>
          </AdminCard>
        )}
      </section>
    </div>
  );
}
