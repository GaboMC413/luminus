"use client";

import React, { useEffect, Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Conversation = {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar_url: string;
  };
  last_message: {
    id: string;
    body: string;
    sender_id: string;
    created_at: string;
  } | null;
  updated_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

function isUuid(value: string | null) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function formatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fallbackAvatar(name: string) {
  const initials = encodeURIComponent(name || "Usuario");
  return `https://ui-avatars.com/api/?name=${initials}&background=e2e8f0&color=0f172a&size=128`;
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipientId = searchParams.get("id");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const chatMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatMenuRef.current && !chatMenuRef.current.contains(event.target as Node)) {
        setIsChatMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadConversations() {
      try {
        setIsLoading(true);
        setError(null);

        if (isUuid(recipientId)) {
          const response = await fetch("/api/messages/conversations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ recipientId }),
          });

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || "No pudimos abrir la conversacion.");
          }

          const data = await response.json();
          setSelectedId(data.conversation.id);
        }

        const response = await fetch("/api/messages/conversations", {
          cache: "no-store",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "No pudimos cargar tus conversaciones.");
        }

        const data = await response.json();
        const nextConversations = data.conversations || [];
        setConversations(nextConversations);

        if (!isUuid(recipientId) && nextConversations.length > 0) {
          setSelectedId(nextConversations[0].id);
        }
      } catch (err: any) {
        setError(err.message || "No pudimos cargar tus mensajes.");
      } finally {
        setIsLoading(false);
      }
    }

    loadConversations();
  }, [recipientId]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      try {
        setError(null);
        const response = await fetch(`/api/messages/conversations/${selectedId}/messages`, {
          cache: "no-store",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "No pudimos cargar la conversacion.");
        }

        const data = await response.json();
        setMessages(data.messages || []);
      } catch (err: any) {
        setError(err.message || "No pudimos cargar la conversacion.");
      }
    }

    loadMessages();
  }, [selectedId]);

  const refreshConversations = async () => {
    const response = await fetch("/api/messages/conversations", {
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      setConversations(data.conversations || []);
    }
  };

  const handleSend = async () => {
    const body = inputText.trim();
    if (!body || !selectedId || isSending) return;

    try {
      setIsSending(true);
      setError(null);
      const response = await fetch(`/api/messages/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "No pudimos enviar el mensaje.");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
      setInputText("");
      await refreshConversations();

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (err: any) {
      setError(err.message || "No pudimos enviar el mensaje.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedConv = conversations.find((conversation) => conversation.id === selectedId) || null;

  return (
    <div className="flex-1 w-full flex flex-col bg-[#F8FAFC] h-[calc(100vh-80px)] overflow-hidden">
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col min-h-0">
        <div className="w-full max-w-6xl mx-auto flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-3 mb-3 shrink-0">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all text-slate-400 hover:text-black"
              title="Volver"
            >
              <span className="material-symbols-rounded text-[24px]">arrow_back</span>
            </button>
            <h1 className="text-[24px] font-bold text-slate-900 font-jakarta tracking-tight">Mensajes</h1>
          </div>

          {error && (
            <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">
            <div className="md:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden h-full min-h-0">
              <div className="p-2 border-b border-slate-100 shrink-0">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-full bg-slate-50 border-none rounded-full py-2 !pl-12 pr-4 text-[13px] focus:ring-1 focus:ring-black outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2">
                {isLoading && (
                  <div className="p-4 text-[13px] text-slate-400">Cargando conversaciones...</div>
                )}

                {!isLoading && conversations.length === 0 && (
                  <div className="p-4 text-[13px] text-slate-400">Todavia no tienes conversaciones.</div>
                )}

                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedId(conversation.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all duration-300 text-left border-none ${selectedId === conversation.id
                      ? "bg-slate-100 text-black shadow-none"
                      : "hover:bg-slate-50 text-slate-600 hover:text-black bg-transparent"
                      }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conversation.participant.avatar_url || fallbackAvatar(conversation.participant.name)}
                        alt={conversation.participant.name}
                        className="w-11 h-11 rounded-xl object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h3 className="text-[13px] font-bold truncate text-slate-900">{conversation.participant.name}</h3>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatTime(conversation.last_message?.created_at || conversation.updated_at)}</span>
                      </div>
                      <p className="text-[12px] text-slate-500 truncate">{conversation.last_message?.body || "Conversacion iniciada"}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden h-full relative min-h-0">
              {selectedConv ? (
                <>
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedConv.participant.avatar_url || fallbackAvatar(selectedConv.participant.name)}
                        alt={selectedConv.participant.name}
                        className="w-10 h-10 rounded-[10px] object-cover"
                      />
                      <div className="flex items-center gap-3">
                        <h2 className="text-[14px] font-bold text-slate-900 leading-none">{selectedConv.participant.name}</h2>
                        <button
                          onClick={() => router.push(`/comunidad/public-profile?id=${selectedConv.participant.id}`)}
                          className="h-7 px-3 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 font-bold text-[11px] rounded-full transition-colors border-none cursor-pointer"
                        >
                          Ver perfil
                        </button>
                      </div>
                    </div>

                    <div className="relative" ref={chatMenuRef}>
                      <button
                        onClick={() => setIsChatMenuOpen(!isChatMenuOpen)}
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all border-none cursor-pointer bg-transparent ${isChatMenuOpen ? "bg-slate-100" : "hover:bg-slate-50"}`}
                      >
                        <span className="material-symbols-outlined text-slate-400 hover:text-black transition-colors">more_vert</span>
                      </button>

                      {isChatMenuOpen && (
                        <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                          <button
                            onClick={() => setIsChatMenuOpen(false)}
                            className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-[13px] hover:bg-slate-50 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                          >
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-black">notifications_off</span>
                            <span className="font-semibold text-slate-400 group-hover:text-black transition-colors">Silenciar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3 bg-white">
                    {messages.length === 0 && (
                      <div className="m-auto text-center text-[13px] text-slate-400">
                        Todavia no hay mensajes. Escribe el primero.
                      </div>
                    )}

                    {messages.map((message) => {
                      const isMine = message.sender_id !== selectedConv.participant.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2.5 text-[13px] leading-relaxed ${isMine
                              ? "bg-black text-white rounded-2xl rounded-tr-none font-medium"
                              : "bg-slate-100 border border-slate-100 text-slate-800 rounded-2xl rounded-tl-none"
                              }`}
                          >
                            {message.body}
                          </div>
                          <span className="mt-1 text-[10px] text-slate-400 px-1">
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 bg-white shrink-0 border-t border-slate-100">
                    <div className="flex items-center w-full">
                      <div className="flex-1 relative flex items-end">
                        <textarea
                          ref={textareaRef}
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Escribe un mensaje..."
                          rows={1}
                          className="w-full bg-slate-50 border-none rounded-[24px] py-3 pl-5 pr-14 text-[13px] focus:ring-1 focus:ring-slate-200 outline-none transition-all resize-none max-h-32 custom-scrollbar block text-slate-800"
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = "auto";
                            target.style.height = `${target.scrollHeight}px`;
                          }}
                        />
                        <button
                          onClick={handleSend}
                          className={`absolute right-1.5 bottom-1.5 w-9 h-9 rounded-full flex items-center justify-center transition-all border-none ${inputText.trim() && !isSending ? "bg-black text-white cursor-pointer" : "bg-transparent text-slate-300 hover:bg-slate-200 cursor-not-allowed"}`}
                          disabled={!inputText.trim() || isSending}
                        >
                          <span className="material-symbols-outlined text-[18px] ml-0.5">send</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center text-[13px] text-slate-400 p-8">
                  Selecciona una conversacion o abre un perfil para iniciar una.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 w-full flex min-h-[calc(100vh-80px)] bg-[#F8FAFC] items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[24px] invert brightness-0" />
          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Cargando mensajes...</p>
        </div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
