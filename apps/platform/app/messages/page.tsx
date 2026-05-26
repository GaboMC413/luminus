"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";

const INITIAL_CONVERSATIONS = [
  {
    id: 1,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    name: "Elena Martínez",
    lastMessage: "Hola Gabriel, vi que compartimos intereses en Biohacking y Longevidad...",
    time: "Hace 5 min",
    isOnline: true,
    messages: [
      { id: 1, text: "Hola Gabriel, vi que compartimos intereses en Biohacking y Longevidad. Me encantaría conversar sobre los suplementos que mencionaste en el último foro de la comunidad.", sender: "other", time: "11:20 AM" },
      { id: 2, text: "¡Hola Elena! Qué gusto. Claro, los suplementos de longevidad son un tema fascinante. ¿Cuáles te interesaron más?", sender: "me", time: "11:25 AM" },
      { id: 3, text: "Especialmente el protocolo de NMN y Resveratrol. He leído mucho pero no sé por dónde empezar.", sender: "other", time: "11:27 AM" }
    ]
  },
  {
    id: 2,
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150",
    name: "Dr. Roberto Sánchez",
    lastMessage: "He revisado tu pregunta sobre los ciclos de ayuno...",
    time: "Hace 1 hora",
    isOnline: false,
    messages: [
      { id: 1, text: "He revisado tu pregunta sobre los ciclos de ayuno intermitente. Mi recomendación es que empieces con un protocolo 16:8 durante las primeras dos semanas para evaluar cómo se adapta tu metabolismo.", sender: "other", time: "10:15 AM" }
    ]
  }
];

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');
  const [selectedId, setSelectedId] = useState(queryId ? parseInt(queryId, 10) : 1);
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);

  useEffect(() => {
    if (queryId) {
      const id = parseInt(queryId, 10);
      if (!isNaN(id)) {
        setSelectedId(id);
      }
    }
  }, [queryId]);

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
          if (c.id === selectedId) {
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

  const selectedConv = conversations.find(c => c.id === selectedId) || conversations[0];

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

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">

            {/* Sidebar - Contacts (Left - 1/3) */}
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
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all duration-300 ${selectedId === conv.id
                      ? 'bg-slate-100 text-black shadow-none'
                      : 'hover:bg-slate-50 text-slate-600 hover:text-black'
                      }`}
                  >
                    <div className="relative shrink-0">
                      <img src={conv.avatar} alt={conv.name} className="w-11 h-11 rounded-xl object-cover" />
                      {conv.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h3 className="text-[13px] font-bold truncate text-slate-900">{conv.name}</h3>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{conv.time}</span>
                      </div>
                      <p className="text-[12px] text-slate-500 truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Chat Area (Right - 2/3) */}
            <div className="md:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden h-full relative min-h-0">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <img src={selectedConv.avatar} alt={selectedConv.name} className="w-10 h-10 rounded-[10px] object-cover" />
                  <div className="flex items-center gap-3">
                    <h2 className="text-[14px] font-bold text-slate-900 leading-none">{selectedConv.name}</h2>
                    <button 
                      onClick={() => alert(`Próximamente: Perfil de ${selectedConv.name}`)}
                      className="h-7 px-3 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 font-bold text-[11px] rounded-full transition-colors border-none cursor-pointer"
                    >
                      Ver perfil
                    </button>
                  </div>
                </div>

                {/* Chat Options Menu */}
                <div className="relative" ref={chatMenuRef}>
                  <button
                    onClick={() => setIsChatMenuOpen(!isChatMenuOpen)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all border-none cursor-pointer bg-transparent ${isChatMenuOpen ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                  >
                    <span className="material-symbols-outlined text-slate-400 hover:text-black transition-colors">more_vert</span>
                  </button>

                  {isChatMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl overflow-hidden z-[100] shadow-xl animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                      <button
                        onClick={() => setIsChatMenuOpen(false)}
                        className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-[13px] hover:bg-slate-50 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                      >
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-black">notifications_off</span>
                        <span className="font-semibold text-slate-400 group-hover:text-black transition-colors">Silenciar</span>
                      </button>
                      <div className="h-[1px] bg-slate-100 w-full"></div>
                      <button
                        onClick={() => setIsChatMenuOpen(false)}
                        className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-[13px] hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                      >
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-[#FF4B4B]">block</span>
                        <span className="font-semibold text-slate-400 group-hover:text-[#FF4B4B] transition-colors">Bloquear</span>
                      </button>
                      <button
                        onClick={() => setIsChatMenuOpen(false)}
                        className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-[13px] hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                      >
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-[#FF4B4B]">delete</span>
                        <span className="font-semibold text-slate-400 group-hover:text-[#FF4B4B] transition-colors">Eliminar chat</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3 bg-white">
                {selectedConv.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2.5 text-[13px] leading-relaxed ${msg.sender === 'me'
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
                      className="w-full bg-slate-50 border-none rounded-[24px] py-3 pl-5 pr-14 text-[13px] focus:ring-1 focus:ring-slate-200 outline-none transition-all resize-none max-h-32 custom-scrollbar block text-slate-800"
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
                      <span className="material-symbols-outlined text-[18px] ml-0.5">send</span>
                    </button>
                  </div>
                </div>
              </div>
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
