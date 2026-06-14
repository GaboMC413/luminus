"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Message {
  id: string | number;
  text: string;
  sender: "me" | "other";
  time: string;
}

interface Conversation {
  id: string | number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  isOnline: boolean;
  messages: Message[];
}

interface ChatPopupProps {
  userId: string;
  name: string;
  avatar: string;
  onClose: () => void;
}

export function ChatPopup({ userId, name, avatar, onClose }: ChatPopupProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close options menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load conversation from localStorage on mount
  useEffect(() => {
    if (!userId) return;

    const localChats = localStorage.getItem("luminus_chats");
    if (localChats) {
      try {
        const chats: Conversation[] = JSON.parse(localChats);
        const currentChat = chats.find((c) => String(c.id) === String(userId));
        if (currentChat) {
          setMessages(currentChat.messages || []);
        }
      } catch (err) {
        console.error("Error loading chat from localStorage:", err);
      }
    }
  }, [userId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto focus input on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputText.trim(),
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputText("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Save to localStorage
    const localChats = localStorage.getItem("luminus_chats");
    let chats: Conversation[] = [];

    if (localChats) {
      try {
        chats = JSON.parse(localChats);
      } catch (err) {
        console.error("Error parsing chats in save:", err);
      }
    }

    const chatIdx = chats.findIndex((c) => String(c.id) === String(userId));
    const nowTime = "Ahora mismo";

    if (chatIdx > -1) {
      chats[chatIdx] = {
        ...chats[chatIdx],
        lastMessage: newMessage.text,
        time: nowTime,
        messages: updatedMessages,
      };
    } else {
      chats.push({
        id: userId,
        name,
        avatar,
        lastMessage: newMessage.text,
        time: nowTime,
        isOnline: true,
        messages: updatedMessages,
      });
    }

    localStorage.setItem("luminus_chats", JSON.stringify(chats));

    // Dispatch a custom storage event so other open tabs/windows or components on the same page can sync if needed
    window.dispatchEvent(new Event("storage"));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteChat = () => {
    const localChats = localStorage.getItem("luminus_chats");
    if (localChats) {
      try {
        const chats: Conversation[] = JSON.parse(localChats);
        const remaining = chats.filter((c) => String(c.id) !== String(userId));
        localStorage.setItem("luminus_chats", JSON.stringify(remaining));
        // Dispatch storage event
        window.dispatchEvent(new Event("storage"));
      } catch (err) {
        console.error("Error deleting chat from localStorage:", err);
      }
    }
    setIsMenuOpen(false);
    onClose();
  };

  return (
    <div
      className="fixed bottom-0 right-4 lg:right-12 z-50 w-[360px] md:w-[400px] bg-white border border-slate-200 border-b-0 rounded-t-2xl shadow-none flex flex-col transition-all duration-300 overflow-hidden h-[480px]"
    >
      {/* Header */}
      <div className="h-[60px] px-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50 select-none">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            <img src={avatar || "/logo-luminus-white.svg"} alt={name} className="w-9 h-9 rounded-[10px] object-cover" />
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 leading-none truncate max-w-[110px] sm:max-w-[130px]" title={name}>
              {name}
            </h4>
            {userId && (
              <button
                onClick={() => {
                  router.push(`/comunidad/public-profile?id=${userId}`);
                }}
                className="h-7 px-3 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-bold text-[11px] rounded-full transition-colors border-none cursor-pointer shrink-0"
              >
                Ver perfil
              </button>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {/* Options Menu */}
          <div className="relative flex items-center" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all border-none cursor-pointer bg-transparent ${
                isMenuOpen ? "bg-slate-200 text-black" : "hover:bg-slate-200 text-slate-500 hover:text-black"
              }`}
              title="Opciones"
            >
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-2xl overflow-hidden z-[100] shadow-none animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-[13px] hover:bg-slate-50 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                >
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-black text-[18px]">notifications_off</span>
                  <span className="font-semibold text-slate-600 group-hover:text-black transition-colors">Silenciar chat</span>
                </button>
                <button
                  onClick={handleDeleteChat}
                  className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-[13px] hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                >
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-[#FF4B4B] text-[18px]">delete</span>
                  <span className="font-semibold text-slate-600 group-hover:text-[#FF4B4B] transition-colors">Eliminar chat</span>
                </button>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-[13px] hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                >
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-[#FF4B4B] text-[18px]">block</span>
                  <span className="font-semibold text-slate-600 group-hover:text-[#FF4B4B] transition-colors">Bloquear usuario</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors text-slate-500 hover:text-black border-none bg-transparent cursor-pointer"
            title="Cerrar chat"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* Message Body */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar flex flex-col gap-4 bg-white">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
              <span className="material-symbols-outlined text-[28px]">chat_bubble_outline</span>
            </div>
            <p className="text-sm font-bold text-slate-800 mb-1.5">¡Saluda a {name.split(" ")[0]}!</p>
            <p className="text-xs text-slate-400 max-w-[220px] leading-relaxed">
              Envía un mensaje para comenzar la conversación.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {messages.map((msg, index) => {
              const isConsecutive = index > 0 && messages[index - 1].sender === msg.sender;
              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"} ${isConsecutive ? "mt-0.5" : "mt-2 first:mt-0"}`}
                >
                  <div
                    className={`max-w-[85%] pl-4 pr-12 pt-2.5 pb-3 text-sm leading-relaxed relative min-w-[75px] ${
                      msg.sender === "me"
                        ? `bg-black text-white font-medium ${isConsecutive ? "rounded-xl" : "rounded-xl rounded-tr-none"}`
                        : `bg-slate-100 text-slate-800 border border-slate-100 ${isConsecutive ? "rounded-xl" : "rounded-xl rounded-tl-none"}`
                    }`}
                  >
                    <span className="block break-words">{msg.text}</span>
                    <span 
                      className={`absolute bottom-1 right-2.5 text-[9px] font-sans font-normal select-none pointer-events-none ${
                        msg.sender === "me" ? "text-white/60" : "text-slate-400"
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Footer */}
      <div className="p-3 bg-white border-t border-slate-100 shrink-0">
        <div className="flex items-end gap-2.5">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            rows={1}
            className="flex-1 bg-slate-50 border-none rounded-[20px] py-3 px-5 text-sm focus:ring-1 focus:ring-slate-200 outline-none transition-all resize-none max-h-28 custom-scrollbar block text-slate-800"
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all border-none shadow-sm ${
              inputText.trim()
                ? "bg-black text-white cursor-pointer hover:bg-zinc-800 hover:scale-105 active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <span className="material-symbols-outlined text-[18px] ml-0.5">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
