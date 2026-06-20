"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatRelativeTime } from "@/components/ui/PlatformNavbar";

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

function fallbackAvatar(name: string) {
  const initials = encodeURIComponent(name || "Usuario");
  return `https://ui-avatars.com/api/?name=${initials}&background=e2e8f0&color=0f172a&size=128`;
}

function formatShortTime(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatMessageBody(text: string): React.ReactNode[] {
  if (!text) return [];

  // Regex to match Markdown links: [Text](URL)
  const markdownLinkRegex = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g;
  
  const parts = text.split(markdownLinkRegex);

  return parts.map((part, index) => {
    // Check if the part matches the markdown link pattern
    if (part.startsWith('[') && part.includes('](')) {
      const match = part.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
      if (match) {
        const [, linkText, url] = match;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80 transition-opacity font-semibold break-all"
          >
            {linkText}
          </a>
        );
      }
    }

    // Otherwise, parse standard URLs, bold (*) and italics (_)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const subParts = part.split(urlRegex);

    return (
      <React.Fragment key={index}>
        {subParts.map((subPart, subIndex) => {
          if (subPart.match(urlRegex)) {
            return (
              <a
                key={subIndex}
                href={subPart}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-80 transition-opacity font-semibold break-all"
              >
                {subPart}
              </a>
            );
          }

          const boldRegex = /\*([^*]+)\*/g;
          const boldParts = subPart.split(boldRegex);

          return (
            <React.Fragment key={subIndex}>
              {boldParts.map((boldPart, boldIndex) => {
                if (boldIndex % 2 === 1) {
                  return <strong key={boldIndex} className="font-semibold">{boldPart}</strong>;
                }

                const italicRegex = /_([^_]+)_/g;
                const italicParts = boldPart.split(italicRegex);

                return (
                  <React.Fragment key={boldIndex}>
                    {italicParts.map((italicPart, italicIndex) => {
                      if (italicIndex % 2 === 1) {
                        return <em key={italicIndex} className="italic">{italicPart}</em>;
                      }
                      return italicPart;
                    })}
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  });
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipientId = searchParams.get("id");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>(isUuid(recipientId) ? 'chat' : 'list');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const chatMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isUuid(recipientId)) {
      setMobileView('chat');
    }
  }, [recipientId]);

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
          setMobileView('chat');
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
    const isChat = mobileView === 'chat';
    window.dispatchEvent(new CustomEvent("luminus_toggle_mobile_navbar", { detail: !isChat }));
    return () => {
      window.dispatchEvent(new CustomEvent("luminus_toggle_mobile_navbar", { detail: true }));
    };
  }, [mobileView]);

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
        window.dispatchEvent(new Event("luminus_messages_update"));
      } catch (err: any) {
        setError(err.message || "No pudimos cargar la conversacion.");
      }
    }

    loadMessages();
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, selectedId]);

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
      window.dispatchEvent(new Event("luminus_messages_update"));

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (err: any) {
      setError(err.message || "No pudimos enviar el mensaje.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleDeleteChat = async () => {
    if (selectedId) {
      try {
        const response = await fetch(`/api/messages/conversations/${selectedId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "No pudimos eliminar la conversación.");
        }

        setConversations((prev) => prev.filter((c) => c.id !== selectedId));
        setSelectedId(null);
        setMobileView('list');
        setIsChatMenuOpen(false);
        router.push("/mensajes");
        router.refresh();
        window.dispatchEvent(new Event("luminus_messages_update"));
      } catch (err: any) {
        console.error("Error deleting conversation:", err);
        alert(err.message || "No pudimos eliminar el chat. Intenta nuevamente.");
      }
    }
  };

  const handleBlockUser = async () => {
    if (selectedConv && selectedId) {
      try {
        const participantId = selectedConv.participant.id;
        const res = await fetch(`/api/connections?recipientId=${participantId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setConversations((prev) => prev.filter((c) => c.id !== selectedId));
          setSelectedId(null);
          setMobileView('list');
          router.push("/mensajes");
        }
      } catch (err) {
        console.error("Failed to block user:", err);
      } finally {
        setIsChatMenuOpen(false);
      }
    }
  };

  const selectedConv = conversations.find((conversation) => conversation.id === selectedId) || null;
  const filteredConversations = conversations.filter((conversation) => {
    const lastMessage = conversation.last_message?.body || "";
    const searchable = `${conversation.participant.name} ${lastMessage}`.toLowerCase();
    return searchable.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 min-h-0 lg:h-[calc(100vh-80px)] overflow-hidden">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col min-h-0 overflow-hidden">
        <div className="w-full max-w-6xl mx-auto flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className={`items-center gap-3 mb-4 md:mb-6 shrink-0 ${mobileView === 'list' ? 'flex' : 'hidden md:flex'}`}>
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-slate-900 cursor-pointer"
              title="Volver"
            >
              <span className="material-symbols-rounded text-[20px]">arrow_back</span>
            </button>
            <h1 className="text-xl md:text-2xl text-slate-900 font-semibold font-jakarta">Mensajes</h1>
          </div>

          {error && (
            <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600">
              {error}
            </div>
          )}

          <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 items-stretch flex-1 min-h-0 overflow-hidden">
            <div className={`md:col-span-4 flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden flex-1 md:flex-initial md:h-full md:min-h-0 ${mobileView === 'list' ? 'flex' : 'hidden md:flex'}`}>
              <div className="p-3 border-b border-slate-100 shrink-0">
                <div className="relative">
                  <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Buscar..."
                    className="w-full bg-slate-50 border-none rounded-full py-2.5 pl-11 pr-4 text-sm focus:ring-1 focus:ring-slate-200 outline-none transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto thin-scrollbar p-2 flex flex-col gap-2">
                {isLoading && (
                  <div className="p-4 text-[13px] text-slate-400">Cargando conversaciones...</div>
                )}

                {!isLoading && filteredConversations.length === 0 && (
                  <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-4 bg-slate-50/50 rounded-2xl border border-slate-100 m-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <span className="material-symbols-rounded text-[24px]">forum</span>
                    </div>
                    <div className="flex flex-col gap-1.5 max-w-[240px]">
                      <h3 className="text-sm font-semibold text-slate-900 leading-tight">¿Con quién te gustaría conectar hoy?</h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Aún no tienes chats activos. Ve a la comunidad y contacta a tu primera persona.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push("/comunidad")}
                      className="h-10 px-6 bg-black hover:bg-zinc-800 text-white rounded-xl text-sm font-semibold transition duration-200 cursor-pointer border-none shadow-sm flex items-center justify-center"
                    >
                      Ir a la comunidad
                    </button>
                  </div>
                )}

                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      setSelectedId(conversation.id);
                      setMobileView('chat');
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all duration-300 text-left border-none ${selectedId === conversation.id
                      ? "bg-slate-100 text-black shadow-none"
                      : "hover:bg-slate-50 text-slate-600 hover:text-black bg-transparent"
                      }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conversation.participant.avatar_url || fallbackAvatar(conversation.participant.name)}
                        alt={conversation.participant.name}
                        className="w-11 h-11 rounded-[10px] object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h3 className="text-sm font-semibold truncate text-slate-900">{conversation.participant.name}</h3>
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {formatRelativeTime(conversation.last_message?.created_at || conversation.updated_at)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 truncate">{conversation.last_message?.body || "Sin mensajes aun"}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {isLoading && isUuid(recipientId) ? (
              <div className={`md:col-span-8 flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden flex-1 md:flex-initial md:h-full md:min-h-0 relative ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'}`}>
                {/* Skeleton Header */}
                <div className="p-3 border-b border-slate-100 flex items-center gap-3 bg-white shrink-0">
                  <button
                    onClick={() => {
                      const from = searchParams.get("from");
                      if (from === "profile" && recipientId) {
                        router.push(`/comunidad/public-profile?id=${recipientId}`);
                      } else {
                        setMobileView('list');
                      }
                    }}
                    className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-black border-none bg-transparent cursor-pointer mr-1"
                    title="Volver"
                  >
                    <span className="material-symbols-rounded text-[22px]">arrow_back</span>
                  </button>
                  <div className="w-11 h-11 rounded-[10px] bg-slate-100 animate-pulse shrink-0" />
                  <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
                </div>

                {/* Skeleton Body */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 bg-white">
                  <div className="flex flex-col items-start gap-1">
                    <div className="w-[50%] h-10 bg-slate-50 rounded-xl rounded-tl-none animate-pulse" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="w-[40%] h-12 bg-slate-50 rounded-xl rounded-tr-none animate-pulse" />
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <div className="w-[60%] h-10 bg-slate-50 rounded-xl rounded-tl-none animate-pulse" />
                  </div>
                </div>

                {/* Skeleton Footer */}
                <div className="p-3 border-t border-slate-100 bg-white shrink-0">
                  <div className="h-12 w-full bg-slate-50 rounded-[24px] animate-pulse" />
                </div>
              </div>
            ) : !selectedConv ? (
              <div className="hidden md:flex md:col-span-8 flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden h-full relative min-h-0 items-center justify-center p-8 text-center bg-slate-50/20">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100/50">
                  <span className="material-symbols-rounded text-[32px]">forum</span>
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 font-jakarta mb-2">Tus Mensajes</h2>
                <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
                  Conecta con personas en la comunidad para iniciar una conversacion y enviarles mensajes privados.
                </p>
                <button
                  onClick={() => router.push("/comunidad")}
                  className="h-11 px-6 bg-black text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 transition duration-200"
                >
                  Explorar la Comunidad
                </button>
              </div>
            ) : (
              <div className={`md:col-span-8 flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden flex-1 md:flex-initial md:h-full md:min-h-0 relative ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'}`}>
                <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => {
                        const from = searchParams.get("from");
                        if (from === "profile") {
                          router.push(`/comunidad/public-profile?id=${selectedConv.participant.id}`);
                        } else {
                          setMobileView('list');
                        }
                      }}
                      className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-black border-none bg-transparent cursor-pointer mr-1 shrink-0"
                      title="Volver"
                    >
                      <span className="material-symbols-rounded text-[22px]">arrow_back</span>
                    </button>

                    <img
                      src={selectedConv.participant.avatar_url || fallbackAvatar(selectedConv.participant.name)}
                      alt={selectedConv.participant.name}
                      className="w-11 h-11 rounded-[10px] object-cover shrink-0"
                    />
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <h2 className="text-base font-semibold text-slate-900 leading-none truncate" title={selectedConv.participant.name}>
                        {selectedConv.participant.name}
                      </h2>
                      {selectedConv.participant.name !== "LUMINUS" && (
                        <Link
                          href={`/comunidad/public-profile?id=${selectedConv.participant.id}`}
                          className="h-8 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer font-jakarta flex items-center justify-center shrink-0 text-decoration-none border-none outline-none"
                        >
                          Ver perfil
                        </Link>
                      )}
                    </div>
                  </div>

                  {selectedConv.participant.name !== "LUMINUS" && (
                    <div className="relative" ref={chatMenuRef}>
                      <button
                        onClick={() => setIsChatMenuOpen(!isChatMenuOpen)}
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all border-none cursor-pointer bg-transparent ${isChatMenuOpen ? "bg-slate-100" : "hover:bg-slate-50"}`}
                      >
                        <span className="material-symbols-rounded text-slate-400 hover:text-black transition-colors">more_vert</span>
                      </button>

                      {isChatMenuOpen && (
                        <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                          <button
                            onClick={() => setIsChatMenuOpen(false)}
                            className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-slate-50 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                          >
                            <span className="material-symbols-rounded text-slate-400 group-hover:text-black">notifications_off</span>
                            <span className="font-semibold text-slate-600 group-hover:text-black transition-colors">Silenciar chat</span>
                          </button>
                          <button
                            onClick={handleDeleteChat}
                            className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                          >
                            <span className="material-symbols-rounded text-slate-400 group-hover:text-[#FF4B4B]">delete</span>
                            <span className="font-semibold text-slate-600 group-hover:text-[#FF4B4B] transition-colors">Eliminar chat</span>
                          </button>
                          <button
                            onClick={handleBlockUser}
                            className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                          >
                            <span className="material-symbols-rounded text-slate-400 group-hover:text-[#FF4B4B]">block</span>
                            <span className="font-semibold text-slate-600 group-hover:text-[#FF4B4B] transition-colors">Bloquear usuario</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-3 thin-scrollbar flex flex-col gap-0.5 bg-white">
                  {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
                        <span className="material-symbols-rounded text-[24px]">chat_bubble_outline</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 mb-1">Saluda a {selectedConv.participant.name.split(" ")[0]}</p>
                      <p className="text-sm text-slate-400 max-w-[220px] leading-relaxed">
                        Envia un mensaje para comenzar la conversacion.
                      </p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isMine = message.sender_id !== selectedConv.participant.id;
                      const isConsecutive = index > 0 && (messages[index - 1].sender_id !== selectedConv.participant.id) === isMine;
                      return (
                        <div
                          key={message.id}
                          className={`flex flex-col ${isMine ? "items-end" : "items-start"} ${isConsecutive ? "mt-0.5" : "mt-2 first:mt-0"}`}
                        >
                          <div
                            className={`max-w-[85%] pl-4 pr-12 pt-2.5 pb-3 text-sm leading-relaxed relative min-w-[75px] ${isMine
                              ? `bg-black text-white font-medium ${isConsecutive ? "rounded-xl" : "rounded-xl rounded-tr-none"}`
                              : `bg-slate-100 border border-slate-100 text-slate-800 ${isConsecutive ? "rounded-xl" : "rounded-xl rounded-tl-none"}`
                              }`}
                          >
                            <span className="block break-words whitespace-pre-wrap">{formatMessageBody(message.body)}</span>
                            <span 
                              className={`absolute bottom-1 right-2.5 text-[9px] font-sans font-normal select-none pointer-events-none ${
                                isMine ? "text-white/60" : "text-slate-400"
                              }`}
                            >
                              {formatShortTime(message.created_at)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 bg-white shrink-0 border-t border-slate-100">
                  <div className="flex items-center w-full">
                    <div className="flex-1 relative flex items-end">
                      <textarea
                        ref={textareaRef}
                        value={inputText}
                        onChange={(event) => setInputText(event.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                          setTimeout(() => {
                            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                          }, 100);
                        }}
                        placeholder="Escribe un mensaje..."
                        rows={1}
                        className="w-full bg-slate-50 border-none rounded-[24px] py-3.5 pl-5 pr-14 text-sm focus:ring-1 focus:ring-slate-200 outline-none transition-all resize-none max-h-32 custom-scrollbar block text-slate-800"
                        onInput={(event) => {
                          const target = event.target as HTMLTextAreaElement;
                          target.style.height = "auto";
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                      />
                      <button
                        onClick={handleSend}
                        className={`absolute right-1.5 bottom-1.5 w-10 h-10 rounded-full flex items-center justify-center transition-all border-none ${
                          inputText.trim() && !isSending
                            ? "text-slate-800"
                            : "text-slate-400"
                        } bg-slate-100 hover:bg-black hover:text-white cursor-pointer hover:scale-105 active:scale-95`}
                        disabled={isSending}
                      >
                        <span className="material-symbols-rounded text-[18px] ml-0.5">send</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 w-full flex h-full bg-slate-50 items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[24px] invert brightness-0" />
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Cargando mensajes...</p>
        </div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
