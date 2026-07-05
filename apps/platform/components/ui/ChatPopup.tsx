"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { SelectInput } from "@/components/ui/SelectInput";
import { isUuid } from "@/utils/validation";
import { formatMessageBody, formatShortTime } from "@/utils/messages";

interface Message {
  id: string | number;
  text: string;
  sender: "me" | "other";
  time: string;
  createdAt?: string;
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
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [otherLastReadAt, setOtherLastReadAt] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dbConversationId, setDbConversationId] = useState<string | null>(null);
  const [connection, setConnection] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent background page scrolling and handle keyboard height dynamically on mobile
  useEffect(() => {
    if (!isMobile || typeof window === "undefined" || !window.visualViewport) return;

    const vv = window.visualViewport;
    
    const handleViewportChange = () => {
      const height = vv.height;
      setViewportHeight(height);
      
      // Software keyboard is open if visual viewport height is significantly smaller than layout viewport
      const keyboardOpen = window.innerHeight - height > 140;
      setIsKeyboardOpen(keyboardOpen);

      document.body.style.setProperty("--visual-viewport-height", `${height}px`);
      document.documentElement.style.setProperty("--visual-viewport-height", `${height}px`);
      document.body.classList.add("mobile-viewport-height-override");
      document.documentElement.classList.add("mobile-viewport-height-override");

      // Reset layout viewport scroll position
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    vv.addEventListener("resize", handleViewportChange);
    vv.addEventListener("scroll", handleViewportChange);
    
    handleViewportChange();

    return () => {
      vv.removeEventListener("resize", handleViewportChange);
      vv.removeEventListener("scroll", handleViewportChange);
      document.body.style.removeProperty("--visual-viewport-height");
      document.documentElement.style.removeProperty("--visual-viewport-height");
      document.body.classList.remove("mobile-viewport-height-override");
      document.documentElement.classList.remove("mobile-viewport-height-override");
    };
  }, [isMobile]);

  // Prevent background page scrolling on mobile when full-screen chat is open
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
    };
  }, []);

  // Load conversation on mount
  useEffect(() => {
    setConnection(null);
    setDbConversationId(null);
    setMessages([]);
    setIsLoadingMessages(true);
    if (!userId || !isUuid(userId)) return;

    const loadDbChat = async () => {
      try {
        const convRes = await fetch("/api/messages/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-timezone-offset": new Date().getTimezoneOffset().toString(),
          },
          body: JSON.stringify({ recipientId: userId }),
        });

        if (!convRes.ok) {
          console.error("Failed to load/create DB conversation");
          setIsLoadingMessages(false);
          return;
        }

        const convData = await convRes.json();
        const convId = convData.conversation.id;
        setDbConversationId(convId);
        setIsMuted(convData.conversation.is_muted || false);

        const msgRes = await fetch(`/api/messages/conversations/${convId}/messages`, {
          cache: "no-store",
        });

        if (!msgRes.ok) {
          console.error("Failed to fetch DB messages");
          setIsLoadingMessages(false);
          return;
        }

        const msgData = await msgRes.json();
        setOtherLastReadAt(msgData.otherLastReadAt || null);
        setConnection(msgData.connection || null);
        const dbMsgs = (msgData.messages || []).map((m: any) => ({
          id: m.id,
          text: m.body,
          sender: m.sender_id === userId ? "other" : "me",
          createdAt: m.created_at,
          time: formatShortTime(m.created_at),
        }));
        
        // Sort chronologically ascending
        const sortedMsgs = [...dbMsgs].sort(
          (a, b) => new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
        );
        setMessages(sortedMsgs);
      } catch (err) {
        console.error("Error loading DB chat inside popup:", err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadDbChat();
  }, [userId]);

  // Poll for new messages while chat is active
  useEffect(() => {
    if (!dbConversationId || !userId) return;

    const pollMessages = async () => {
      try {
        const msgRes = await fetch(`/api/messages/conversations/${dbConversationId}/messages`, {
          cache: "no-store",
        });

        if (!msgRes.ok) {
          console.error("Failed to poll DB messages");
          return;
        }

        const msgData = await msgRes.json();
        setOtherLastReadAt(msgData.otherLastReadAt || null);
        setConnection(msgData.connection || null);
        const dbMsgs = (msgData.messages || []).map((m: any) => ({
          id: m.id,
          text: m.body,
          sender: m.sender_id === userId ? "other" : "me",
          createdAt: m.created_at,
          time: formatShortTime(m.created_at),
        }));

        setMessages((prev) => {
          const dbMsgIds = new Set(dbMsgs.map((m: any) => String(m.id)));
          // Keep local sent messages that are not yet returned by the DB poll
          const localOnlyMessages = prev.filter((m) => !dbMsgIds.has(String(m.id)) && m.sender === "me");
          const combined = [...dbMsgs, ...localOnlyMessages];
          // Sort chronologically ascending
          return combined.sort(
            (a, b) => new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
          );
        });
      } catch (err) {
        console.error("Error polling DB messages inside popup:", err);
      }
    };

    const interval = setInterval(pollMessages, 5000);
    return () => clearInterval(interval);
  }, [dbConversationId, userId]);

  // Scroll to bottom when messages change or keyboard state changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isKeyboardOpen]);

  // Auto focus input on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || !dbConversationId) return;

    const bodyText = inputText.trim();

    try {
      const response = await fetch(`/api/messages/conversations/${dbConversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: bodyText }),
      });

      if (!response.ok) {
        console.error("Failed to send DB message");
        return;
      }

      const data = await response.json();
      const newMessage: Message = {
        id: data.message.id,
        text: data.message.body,
        sender: "me",
        createdAt: data.message.created_at,
        time: new Date(data.message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      
      window.dispatchEvent(new Event("luminus_messages_update"));
    } catch (err) {
      console.error("Error sending DB message inside popup:", err);
    } finally {
      // Re-focus the input to keep the keyboard open on mobile
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  };

  const handleSendClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handleChatContainerClick = () => {
    if (document.activeElement === textareaRef.current) {
      textareaRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteChat = async () => {
    if (dbConversationId) {
      try {
        await fetch(`/api/messages/conversations/${dbConversationId}`, {
          method: "DELETE",
        });
        window.dispatchEvent(new Event("luminus_messages_update"));
      } catch (err) {
        console.error("Error deleting conversation:", err);
      }
    }
    setIsMenuOpen(false);
    onClose();
  };

  const handleBlockUser = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/connections?recipientId=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onClose(); // Close the floating chat popup immediately since the user is blocked
      }
    } catch (err) {
      console.error("Failed to block user:", err);
    } finally {
      setIsMenuOpen(false);
    }
  };

  const handleMuteChat = async () => {
    if (!dbConversationId) return;
    try {
      const res = await fetch(`/api/messages/conversations/${dbConversationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: isMuted ? "unmute" : "mute" }),
      });
      if (res.ok) {
        setIsMuted(!isMuted);
        window.dispatchEvent(new Event("luminus_messages_update"));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "No se pudo actualizar el estado de silencio del chat.");
      }
    } catch (err) {
      console.error("Failed to mute user:", err);
    } finally {
      setIsMenuOpen(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!userId) return;
    if (!reportReason) {
      alert("Por favor selecciona un motivo.");
      return;
    }

    try {
      setIsSubmittingReport(true);
      const res = await fetch("/api/comunidad/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportedId: userId,
          reason: reportReason,
          description: reportDescription,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert("El reporte ha sido enviado. Revisaremos el caso para mantener segura la comunidad.");
        setIsReportModalOpen(false);
        setReportReason("");
        setReportDescription("");
      } else {
        alert(data.message || "No se pudo enviar el reporte.");
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      alert("Error de conexión al enviar el reporte.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleAcceptConnection = async () => {
    try {
      const res = await fetch("/api/connections", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientId: userId }),
      });
      if (res.ok) {
        setConnection((prev: any) => prev ? { ...prev, status: "accepted" } : null);
        window.dispatchEvent(new Event("luminus_messages_update"));
      }
    } catch (err) {
      console.error("Failed to accept connection:", err);
    }
  };

  const handleRejectConnection = async () => {
    try {
      await fetch(`/api/connections?recipientId=${userId}`, {
        method: "DELETE",
      });
      setConnection((prev: any) => prev ? { ...prev, status: "declined" } : null);
      window.dispatchEvent(new Event("luminus_messages_update"));
    } catch (err) {
      console.error("Failed to reject connection:", err);
    }
  };

  const handleSendRequest = async () => {
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-timezone-offset": new Date().getTimezoneOffset().toString(),
        },
        body: JSON.stringify({ recipientId: userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setConnection(data.connection || null);
        window.dispatchEvent(new Event("luminus_messages_update"));
      }
    } catch (err) {
      console.error("Failed to send connection request:", err);
    }
  };

  const handleHeaderClick = () => {
    if (isMinimized) {
      setIsMinimized(false);
    }
  };

  const isPendingForMe = false;
  const isDeclinedByMe = false;
  const isDeclinedForMe = false;

  const dynamicStyle = isMobile ? {
    top: isKeyboardOpen ? "12px" : "80px",
    bottom: isKeyboardOpen ? "8px" : "calc(80px + env(safe-area-inset-bottom, 0px))",
    left: "16px",
    right: "16px",
    height: "auto",
  } : {
    height: isMinimized ? "60px" : "480px"
  };

  return (
    <div
      className="fixed left-4 right-4 top-20 bottom-[calc(80px+env(safe-area-inset-bottom,0px))] sm:inset-auto sm:bottom-0 sm:right-4 lg:right-12 z-50 sm:z-40 sm:w-[400px] sm:h-[480px] bg-white border border-slate-200 rounded-2xl sm:rounded-none sm:rounded-t-2xl shadow-none flex flex-col transition-all duration-300 overflow-hidden"
      style={dynamicStyle}
    >
      {/* Header */}
      <div
        onClick={handleHeaderClick}
        className={`h-[60px] px-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white select-none transition-colors duration-200 touch-none ${
          isMinimized ? "cursor-pointer hover:bg-slate-50" : ""
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile Back Button */}
          <button
            onClick={() => {
              if (document.activeElement === textareaRef.current) {
                textareaRef.current?.blur();
                return;
              }
              onClose();
            }}
            className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors text-slate-500 hover:text-black border-none bg-transparent cursor-pointer mr-1"
            title="Atrás"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>

          <div className="relative shrink-0">
            <img src={avatar || "/logo-luminus-white.svg"} alt={name} className="w-9 h-9 rounded-[10px] object-cover" />
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-900 leading-none truncate max-w-[110px] sm:max-w-[130px] font-jakarta flex items-center gap-1.5" title={name}>
              <span>{name}</span>
              {isMuted && (
                <span className="material-symbols-rounded text-slate-400 text-[15px] shrink-0" title="Silenciado">
                  notifications_off
                </span>
              )}
            </h4>
            {userId && name !== "LUMINUS" && (
              <Link
                href={`/comunidad/public-profile?id=${userId}`}
                className="h-8 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer font-jakarta flex items-center justify-center shrink-0 text-decoration-none border-none outline-none"
              >
                Ver perfil
              </Link>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {/* Options Menu */}
          {name !== "LUMINUS" && (
            <div className="relative flex items-center" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all border-none cursor-pointer bg-transparent ${isMenuOpen ? "bg-slate-100" : "hover:bg-slate-50"}`}
                title="Opciones"
              >
                <span className="material-symbols-rounded text-slate-400 hover:text-black transition-colors text-[20px]">more_vert</span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-2xl overflow-hidden z-[100] shadow-none animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <button
                    onClick={handleMuteChat}
                    className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-slate-50 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                  >
                    <span className="material-symbols-rounded text-slate-500 group-hover:text-slate-900 text-[18px] transition-colors">
                      {isMuted ? "notifications" : "notifications_off"}
                    </span>
                    <span className="font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
                      {isMuted ? "Desactivar silencio" : "Silenciar chat"}
                    </span>
                  </button>
                  <button
                    onClick={handleDeleteChat}
                    className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                  >
                    <span className="material-symbols-rounded text-slate-500 group-hover:text-[#FF4B4B] text-[18px] transition-colors">delete</span>
                    <span className="font-semibold text-slate-500 group-hover:text-[#FF4B4B] transition-colors">Eliminar chat</span>
                  </button>
                  <button
                    onClick={handleBlockUser}
                    className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                  >
                    <span className="material-symbols-rounded text-slate-500 group-hover:text-[#FF4B4B] text-[18px] transition-colors">block</span>
                    <span className="font-semibold text-slate-500 group-hover:text-[#FF4B4B] transition-colors">Bloquear usuario</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsReportModalOpen(true);
                    }}
                    className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                  >
                    <span className="material-symbols-rounded text-slate-500 group-hover:text-[#FF4B4B] text-[18px] transition-colors">report</span>
                    <span className="font-semibold text-slate-500 group-hover:text-[#FF4B4B] transition-colors">Reportar usuario</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="hidden sm:flex w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors text-slate-500 hover:text-black border-none bg-transparent cursor-pointer"
            title={isMinimized ? "Maximizar chat" : "Minimizar chat"}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMinimized ? "keyboard_arrow_up" : "remove"}
            </span>
          </button>

          <button
            onClick={onClose}
            className="hidden sm:flex w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors text-slate-500 hover:text-black border-none bg-transparent cursor-pointer"
            title="Cerrar chat"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* Message Body */}
      <div ref={chatContainerRef} onClick={handleChatContainerClick} className="flex-1 overflow-y-auto p-3 custom-scrollbar flex flex-col gap-4 bg-white overscroll-contain">
        {isLoadingMessages ? (
          <div className="flex-1 flex flex-col gap-4 bg-white justify-end p-2">
            <div className="flex flex-col items-start gap-1">
              <div className="w-[55%] h-10 bg-slate-100 rounded-xl rounded-tl-none animate-pulse" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="w-[45%] h-12 bg-slate-100 rounded-xl rounded-tr-none animate-pulse" />
            </div>
            <div className="flex flex-col items-start gap-1">
              <div className="w-[65%] h-10 bg-slate-100 rounded-xl rounded-tl-none animate-pulse" />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
              <span className="material-symbols-outlined text-[28px]">chat_bubble_outline</span>
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1.5">¡Saluda a {name.split(" ")[0]}!</p>
            <p className="text-xs text-slate-400 max-w-[220px] leading-relaxed">
              Envía un mensaje para comenzar la conversación.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {messages.map((msg, index) => {
              const isConsecutive = index > 0 && messages[index - 1].sender === msg.sender;
              const isLastMessage = index === messages.length - 1;
              const isMine = msg.sender === "me";
              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${isMine ? "items-end" : "items-start"} ${isConsecutive ? "mt-0.5" : "mt-2 first:mt-0"}`}
                >
                  <div
                    className={`max-w-[90%] pl-4 pr-12 pt-2.5 pb-3 text-sm leading-relaxed relative min-w-[75px] ${
                      isMine
                        ? `bg-black text-white font-medium ${isConsecutive ? "rounded-xl" : "rounded-xl rounded-tr-none"}`
                        : `bg-slate-100 text-slate-800 border border-slate-100 ${isConsecutive ? "rounded-xl" : "rounded-xl rounded-tl-none"}`
                    }`}
                  >
                    <span className="block break-words whitespace-pre-wrap">{formatMessageBody(msg.text)}</span>
                    <span 
                      className={`absolute bottom-1 right-2.5 text-[9px] font-sans font-normal select-none pointer-events-none ${
                        isMine ? "text-white/60" : "text-slate-400"
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                  {isLastMessage && isMine && (
                    <span className="text-[10px] text-slate-400 mt-1 mr-1 font-semibold select-none">
                      {(() => {
                        if (!otherLastReadAt || !msg.createdAt) return "Enviado";
                        const msgDate = new Date(msg.createdAt);
                        const readDate = new Date(otherLastReadAt);
                        return readDate >= msgDate ? "Visto" : "Enviado";
                      })()}
                    </span>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Footer */}
      <div className="p-3 bg-white border-t border-slate-100 shrink-0 touch-none">
        {isPendingForMe ? (
          <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl gap-3 border border-slate-100">
            <p className="text-xs font-medium text-slate-700 text-center">
              {name} quiere conectar contigo. ¿Aceptas la solicitud para chatear?
            </p>
            <div className="flex gap-4 w-full max-w-xs">
              <button
                onClick={handleAcceptConnection}
                className="flex-1 py-2 px-3 rounded-xl bg-black text-white hover:bg-slate-800 text-xs font-semibold transition-colors border-none cursor-pointer"
              >
                Aceptar
              </button>
              <button
                onClick={handleRejectConnection}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300 text-xs font-semibold transition-colors border-none cursor-pointer"
              >
                Rechazar
              </button>
            </div>
          </div>
        ) : isDeclinedByMe ? (
          <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl gap-2 border border-slate-100">
            <p className="text-xs font-medium text-slate-500 text-center">
              Has rechazado esta solicitud de conexión.
            </p>
            <button
              onClick={handleSendRequest}
              className="py-1.5 px-4 rounded-xl bg-slate-900 text-white hover:bg-black text-[11px] font-semibold transition-colors border-none cursor-pointer"
            >
              Enviar solicitud para conectar
            </button>
          </div>
        ) : isDeclinedForMe ? (
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs font-medium text-slate-400 text-center">
              La solicitud de conexión fue rechazada.
            </p>
          </div>
        ) : (
          <div className="flex items-center w-full">
            <div className="flex-1 relative flex items-end">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  const scrollToEnd = () => {
                    if (chatContainerRef.current) {
                      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                    }
                  };
                  setTimeout(scrollToEnd, 100);
                  setTimeout(scrollToEnd, 300);
                  setTimeout(scrollToEnd, 500);
                }}
                placeholder="Escribe un mensaje..."
                rows={1}
                className="w-full bg-slate-50 border-none rounded-[24px] py-3.5 pl-5 pr-14 text-[14px] focus:ring-1 focus:ring-slate-200 outline-none transition-all resize-none max-h-28 custom-scrollbar block text-slate-800 touch-auto overscroll-contain"
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              <button
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={handleSendClick}
                onClick={handleSendClick}
                className={`absolute right-1.5 bottom-1.5 w-10 h-10 rounded-full flex items-center justify-center transition-all border-none ${
                  inputText.trim()
                    ? "text-slate-800"
                    : "text-slate-400"
                } bg-slate-100 hover:bg-black hover:text-white cursor-pointer hover:scale-105 active:scale-95 touch-manipulation`}
              >
                <span className="material-symbols-outlined text-[18px] ml-0.5">send</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportReason("");
          setReportDescription("");
        }}
        title="Reportar usuario"
        maxWidth="440px"
        footer={
          <>
            <button
              onClick={() => {
                setIsReportModalOpen(false);
                setReportReason("");
                setReportDescription("");
              }}
              disabled={isSubmittingReport}
              className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-bold transition duration-200 cursor-pointer border-none"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmitReport}
              disabled={isSubmittingReport || !reportReason}
              className={`flex-1 h-11 text-white rounded-xl text-sm font-bold transition duration-200 cursor-pointer border-none flex items-center justify-center gap-1.5 ${
                isSubmittingReport || !reportReason
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-[#FF4B4B] hover:bg-[#E03A3A] hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {isSubmittingReport ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-rounded text-[18px]">report</span>
                  <span>Reportar</span>
                </>
              )}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <SelectInput
              label="Motivo del reporte *"
              value={reportReason}
              onSelect={(val) => setReportReason(val)}
              placeholder="Selecciona una opción..."
              options={[
                "Comportamiento abusivo o acoso",
                "Spam o contenido comercial no deseado",
                "Contenido inapropiado u ofensivo",
                "Suplantación de identidad",
                "Otro",
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Detalles adicionales (opcional)</label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Proporciona más detalles si lo deseas..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-slate-300 outline-none resize-none h-24 text-slate-800 font-medium"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
