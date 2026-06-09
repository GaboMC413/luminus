"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { formatRelativeTime } from '@/components/ui/PlatformNavbar';

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');
  const [selectedId, setSelectedId] = useState<string | number>(queryId || "");
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Load from localStorage once on mount
  useEffect(() => {
    const localChats = localStorage.getItem("luminus_chats");
    if (localChats) {
      try {
        const parsed = JSON.parse(localChats);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out historical mock users (IDs "1", "2", or "mock-user-") from localStorage
          const realChats = parsed.filter((c: any) => {
            const idStr = String(c.id);
            return idStr !== "1" && idStr !== "2" && !idStr.startsWith("mock-user-");
          });
          setConversations(realChats);
          if (!queryId && realChats.length > 0) {
            setSelectedId(realChats[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading chats from localStorage:", err);
      }
    }
    setIsLoaded(true);
  }, [queryId]);

  // 2. Save to localStorage whenever conversations changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("luminus_chats", JSON.stringify(conversations));
      // Dispatch storage event to notify other components (e.g. PlatformNavbar)
      window.dispatchEvent(new Event("storage"));
    }
  }, [conversations, isLoaded]);

  // 3. Handle queryId from searchParams and dynamically fetch profile if missing
  useEffect(() => {
    if (!isLoaded || !queryId) return;

    const queryIdStr = String(queryId);
    const found = conversations.find(c => String(c.id) === queryIdStr);

    if (found) {
      if (String(selectedId) !== queryIdStr) {
        setSelectedId(found.id);
      }
    } else {
      // Fetch profile details for a new conversation item
      const fetchNewChatProfile = async () => {
        try {
          const res = await fetch(`/api/comunidad/profile?id=${queryId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.profile) {
              const newConv = {
                id: queryId as string,
                avatar: data.profile.profile_picture_url || "",
                name: `${data.profile.first_name || ""} ${data.profile.last_name || ""}`.trim() || "Usuario",
                lastMessage: "Sin mensajes aún",
                time: "Ahora mismo",
                messages: []
              };
              setConversations(prev => {
                if (prev.some(c => String(c.id) === queryIdStr)) return prev;
                return [newConv, ...prev];
              });
              setSelectedId(queryId as string);
            }
          }
        } catch (err) {
          console.error("Error fetching new chat profile details:", err);
        }
      };
      fetchNewChatProfile();
    }
  }, [queryId, isLoaded, conversations, selectedId]);

  const [inputText, setInputText] = useState("");
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

  const handleSend = () => {
    if (inputText.trim()) {
      const newMsg = {
        id: Date.now(),
        text: inputText.trim(),
        sender: "me",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversations(prev =>
        prev.map(c => {
          if (String(c.id) === String(selectedId)) {
            return {
              ...c,
              lastMessage: newMsg.text,
              time: "Ahora mismo",
              messages: [...c.messages, newMsg]
            };
          }
          return c;
        })
      );

      setInputText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteChat = (idToDelete: string | number) => {
    const remaining = conversations.filter(c => String(c.id) !== String(idToDelete));
    setConversations(remaining);
    setIsChatMenuOpen(false);
    if (remaining.length > 0) {
      setSelectedId(remaining[0].id);
    } else {
      setSelectedId("");
    }
  };

  const selectedConv = conversations.find(c => String(c.id) === String(selectedId)) || conversations[0] || {
    id: "",
    avatar: "",
    name: "Conversación",
    lastMessage: "",
    time: "",
    messages: []
  };

  // 4. Auto-scroll to bottom of messages list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedId, selectedConv.messages?.length]);

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.lastMessage || "").toLowerCase().includes(searchQuery.toLowerCase())
  );  return (
    <div className="flex-1 w-full flex flex-col bg-[#F8FAFC] h-[calc(100vh-128px)] lg:h-[calc(100vh-80px)] overflow-hidden">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col min-h-0">
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

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">

            {/* Sidebar - Contacts (Left - 1/3) */}
            <div className="md:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden h-full min-h-0">
              <div className="p-3 border-b border-slate-100 shrink-0">
                <div className="relative">
                  <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full bg-slate-50 border-none rounded-full py-2.5 pl-11 pr-4 text-[14px] focus:ring-1 focus:ring-slate-200 outline-none transition-all text-slate-800"
                  />
                </div>
              </div>

              {filteredConversations.length === 0 ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col items-center justify-center text-center gap-2">
                  <span className="material-symbols-rounded text-slate-300 text-[32px]">chat_bubble_outline</span>
                  <p className="text-[13px] text-slate-400 font-medium leading-normal max-w-[180px]">
                    No tienes conversaciones activas
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2">
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedId(conv.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all duration-300 ${String(selectedId) === String(conv.id)
                        ? 'bg-slate-100 text-black shadow-none'
                        : 'hover:bg-slate-50 text-slate-600 hover:text-black'
                        }`}
                    >
                      <div className="relative shrink-0">
                        <img src={conv.avatar || "/logo-luminus-white.svg"} alt={conv.name} className="w-11 h-11 rounded-[10px] object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <h3 className="text-[14px] font-bold truncate text-slate-900">{conv.name}</h3>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {formatRelativeTime(conv.messages?.[conv.messages.length - 1]?.id || Date.now())}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-500 truncate">{conv.lastMessage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Main Chat Area (Right - 2/3) */}
            {conversations.length === 0 || !selectedId ? (
              <div className="md:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden h-full relative min-h-0 items-center justify-center p-8 text-center bg-slate-50/20">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100/50">
                  <span className="material-symbols-rounded text-[32px]">forum</span>
                </div>
                <h2 className="text-[20px] font-bold text-slate-900 font-jakarta mb-2">Tus Mensajes</h2>
                <p className="text-[14px] text-slate-500 max-w-sm mb-6 leading-relaxed">
                  Conecta con personas en la comunidad para iniciar una conversación y enviarles mensajes privados.
                </p>
                <button
                  onClick={() => router.push('/comunidad')}
                  className="h-11 px-6 bg-black text-white rounded-xl text-[14px] font-bold hover:bg-zinc-800 transition duration-200"
                >
                  Explorar la Comunidad
                </button>
              </div>
            ) : (
              <div className="md:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden h-full relative min-h-0">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
                  <div className="flex items-center gap-3">
                    <img src={selectedConv.avatar || "/logo-luminus-white.svg"} alt={selectedConv.name} className="w-10 h-10 rounded-[10px] object-cover" />
                    <div className="flex items-center gap-3">
                      <h2 className="text-[15px] font-bold text-slate-900 leading-none">{selectedConv.name}</h2>
                      {selectedConv.id && (
                        <button
                          onClick={() => {
                            router.push(`/comunidad/public-profile?id=${selectedConv.id}`);
                          }}
                          className="h-7 px-3 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 font-bold text-[11px] rounded-full transition-colors border-none cursor-pointer"
                        >
                          Ver perfil
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chat Options Menu */}
                  <div className="relative" ref={chatMenuRef}>
                    <button
                      onClick={() => setIsChatMenuOpen(!isChatMenuOpen)}
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all border-none cursor-pointer bg-transparent ${isChatMenuOpen ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                    >
                      <span className="material-symbols-rounded text-slate-400 hover:text-black transition-colors">more_vert</span>
                    </button>

                    {isChatMenuOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <button
                          onClick={() => setIsChatMenuOpen(false)}
                          className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-[13px] hover:bg-slate-50 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                        >
                          <span className="material-symbols-rounded text-slate-400 group-hover:text-black">notifications_off</span>
                          <span className="font-semibold text-slate-600 group-hover:text-black transition-colors">Silenciar chat</span>
                        </button>
                        <button
                          onClick={() => handleDeleteChat(selectedConv.id)}
                          className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-[13px] hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                        >
                          <span className="material-symbols-rounded text-slate-400 group-hover:text-[#FF4B4B]">delete</span>
                          <span className="font-semibold text-slate-600 group-hover:text-[#FF4B4B] transition-colors">Eliminar chat</span>
                        </button>
                        <button
                          onClick={() => setIsChatMenuOpen(false)}
                          className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-[13px] hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                        >
                          <span className="material-symbols-rounded text-slate-400 group-hover:text-[#FF4B4B]">block</span>
                          <span className="font-semibold text-slate-600 group-hover:text-[#FF4B4B] transition-colors">Bloquear usuario</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3 bg-white">
                  {selectedConv.messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
                        <span className="material-symbols-rounded text-[24px]">chat_bubble_outline</span>
                      </div>
                      <p className="text-[15px] font-bold text-slate-800 mb-1">¡Saluda a {selectedConv.name.split(" ")[0]}!</p>
                      <p className="text-[13px] text-slate-400 max-w-[220px] leading-relaxed">
                        Envía un mensaje para comenzar la conversación.
                      </p>
                    </div>
                  ) : (
                    <>
                      {selectedConv.messages.map((msg: any) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2.5 text-[14px] leading-relaxed ${msg.sender === 'me'
                              ? 'bg-black text-white rounded-2xl rounded-tr-none font-medium'
                              : 'bg-slate-100 border border-slate-100 text-slate-800 rounded-2xl rounded-tl-none'
                              }`}
                          >
                            {msg.text}
                          </div>
                          <span className="mt-1 text-[10px] text-slate-400 px-1">
                            {msg.time}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
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
                        className="w-full bg-slate-50 border-none rounded-[24px] py-3 pl-5 pr-14 text-[14px] focus:ring-1 focus:ring-slate-200 outline-none transition-all resize-none max-h-32 custom-scrollbar block text-slate-800"
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                      />
                      <button
                        onClick={handleSend}
                        className={`absolute right-1.5 bottom-1.5 w-9 h-9 rounded-full flex items-center justify-center transition-all border-none ${inputText.trim() ? 'bg-black text-white cursor-pointer' : 'bg-transparent text-slate-300 hover:bg-slate-200 cursor-not-allowed'}`}
                        disabled={!inputText.trim()}
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
