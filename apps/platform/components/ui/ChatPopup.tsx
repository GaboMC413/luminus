"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ArrowLeft,
  MoreVertical,
  Bell,
  BellOff,
  Trash2,
  Ban,
  Flag,
  Minus,
  ChevronUp,
  X,
  MessageSquare,
  Send,
} from "lucide-react";
import { SelectInput } from "@/components/ui/SelectInput";
import { isUuid } from "@/utils/validation";
import { formatMessageBody, formatShortTime, formatChatDateDivider } from "@/utils/messages";

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
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("luminus_messages_update"));
        }
      } catch (err) {
        console.error("Error loading DB chat inside popup:", err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadDbChat();
  }, [userId]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manual refresh messages on demand (event-driven, 0 idle polling)
  const handleRefresh = async () => {
    if (!dbConversationId || !userId || isRefreshing) return;
    try {
      setIsRefreshing(true);
      const msgRes = await fetch(`/api/messages/conversations/${dbConversationId}/messages`, {
        cache: "no-store",
      });

      if (!msgRes.ok) {
        console.error("Failed to refresh DB messages");
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
        const localOnlyMessages = prev.filter((m) => !dbMsgIds.has(String(m.id)) && m.sender === "me");
        const combined = [...dbMsgs, ...localOnlyMessages];
        return combined.sort(
          (a, b) => new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
        );
      });
    } catch (err) {
      console.error("Error refreshing DB messages inside popup:", err);
    } finally {
      setIsRefreshing(false);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("luminus_messages_update"));
    }
  };

  const isInitialLoadRef = useRef(true);
  const userSentMessageRef = useRef(false);
  const prevMsgCountRef = useRef(0);

  useEffect(() => {
    isInitialLoadRef.current = true;
    prevMsgCountRef.current = 0;
  }, [dbConversationId, userId]);

  // Smart scroll when messages change or keyboard state changes
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container || isLoadingMessages) return;

    if (messages.length === 1) {
      if (isInitialLoadRef.current || userSentMessageRef.current) {
        container.scrollTop = 0;
      }
    } else if (messages.length > 1) {
      const isInitial = isInitialLoadRef.current;
      const userSent = userSentMessageRef.current;
      const hasNewMessage = messages.length > prevMsgCountRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 80;

      if (isInitial || userSent || (hasNewMessage && isNearBottom)) {
        container.scrollTop = container.scrollHeight;
      }
    }

    isInitialLoadRef.current = false;
    userSentMessageRef.current = false;
    prevMsgCountRef.current = messages.length;
  }, [messages, isKeyboardOpen, isLoadingMessages]);

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

      userSentMessageRef.current = true;
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
    height: isMinimized ? "52px" : "480px"
  };

  return (
    <div
      className="fixed left-4 right-4 top-20 bottom-[calc(80px+env(safe-area-inset-bottom,0px))] sm:inset-auto sm:bottom-4 sm:right-6 lg:right-10 z-50 sm:z-40 sm:w-[380px] sm:h-[480px] bg-white border border-slate-200/90 rounded-2xl shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)] flex flex-col transition-all duration-300 overflow-hidden"
      style={dynamicStyle}
    >
      {/* Header */}
      <div
        onClick={handleHeaderClick}
        className={`h-13 px-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white select-none transition-colors duration-200 touch-none ${
          isMinimized ? "cursor-pointer hover:bg-slate-50" : ""
        }`}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* Mobile Back Button */}
          <button
            onClick={() => {
              if (document.activeElement === textareaRef.current) {
                textareaRef.current?.blur();
                return;
              }
              onClose();
            }}
            className="sm:hidden w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-900 border-none bg-transparent cursor-pointer mr-0.5"
            title="Atrás"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </button>

          <div className="relative shrink-0">
            <UserAvatar src={avatar} alt={name} size="sm" className="rounded-full border-none ring-1 ring-slate-100" />
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h4 className="font-jakarta text-sm font-semibold text-slate-900 leading-tight truncate max-w-[130px] sm:max-w-[150px] flex items-center gap-1.5" title={name}>
              <span>{name}</span>
              {isMuted && (
                <span title="Silenciado" className="flex items-center shrink-0"><BellOff className="w-3 h-3 text-slate-400" /></span>
              )}
            </h4>
            {userId && name?.toLowerCase() !== "luminus" && userId !== "50d13047-bab8-44f1-9541-a821113845cc" && userId !== "mock-luminus" && (
              <Link
                href={`/inicio/public-profile?id=${userId}`}
                className="h-6 px-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-md text-[11px] font-medium font-jakarta transition-colors cursor-pointer flex items-center justify-center shrink-0 no-underline"
              >
                Ver perfil
              </Link>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5">
          {/* Options Menu */}
          {name?.toLowerCase() !== "luminus" && userId !== "50d13047-bab8-44f1-9541-a821113845cc" && userId !== "mock-luminus" && (
            <div className="relative flex items-center" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors border-none cursor-pointer bg-transparent ${isMenuOpen ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-100 hover:text-slate-800"}`}
                title="Opciones"
              >
                <MoreVertical className="w-3.5 h-3.5" strokeWidth={2} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-200/90 rounded-xl p-1.5 overflow-hidden z-[100] shadow-[0_10px_38px_-10px_rgba(22,23,24,0.12)] animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                  <button
                    onClick={handleMuteChat}
                    className="group w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium font-jakarta text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                  >
                    <BellOff className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                    <span>
                      {isMuted ? "Desactivar silencio" : "Silenciar chat"}
                    </span>
                  </button>
                  <button
                    onClick={handleDeleteChat}
                    className="group w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium font-jakarta text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500 transition-colors" />
                    <span>Eliminar chat</span>
                  </button>
                  <button
                    onClick={handleBlockUser}
                    className="group w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium font-jakarta text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                  >
                    <Ban className="w-3.5 h-3.5 text-rose-500 transition-colors" />
                    <span>Bloquear usuario</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsReportModalOpen(true);
                    }}
                    className="group w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium font-jakarta text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                  >
                    <Flag className="w-3.5 h-3.5 text-rose-500 transition-colors" />
                    <span>Reportar usuario</span>
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
            className="hidden sm:flex w-7 h-7 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-800 border-none bg-transparent cursor-pointer"
            title={isMinimized ? "Maximizar chat" : "Minimizar chat"}
          >
            {isMinimized ? (
              <ChevronUp className="w-3.5 h-3.5" strokeWidth={2} />
            ) : (
              <Minus className="w-3.5 h-3.5" strokeWidth={2} />
            )}
          </button>

          <button
            onClick={onClose}
            className="hidden sm:flex w-7 h-7 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-800 border-none bg-transparent cursor-pointer"
            title="Cerrar chat"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Message Body */}
      <div ref={chatContainerRef} onClick={handleChatContainerClick} className="flex-1 overflow-y-auto p-3 custom-scrollbar flex flex-col gap-2.5 bg-white overscroll-contain">
        {isLoadingMessages ? (
          <div className="flex-1 flex flex-col gap-3 bg-white justify-end p-2">
            <div className="flex flex-col items-start gap-1">
              <div className="w-[55%] h-8 bg-slate-100 rounded-xl rounded-tl-none animate-pulse" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="w-[45%] h-10 bg-slate-100 rounded-xl rounded-tr-none animate-pulse" />
            </div>
            <div className="flex flex-col items-start gap-1">
              <div className="w-[65%] h-8 bg-slate-100 rounded-xl rounded-tl-none animate-pulse" />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="w-5 h-5 text-slate-300" strokeWidth={1.75} />}
            title={`¡Saluda a ${name.split(" ")[0]}!`}
            description="Envía un mensaje para comenzar la conversación."
            className="flex-1 justify-center animate-in fade-in duration-200"
          />
        ) : (
          <div className="flex flex-col gap-0.5">
            {messages.map((msg, index) => {
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const prevDateStr = prevMsg?.createdAt ? new Date(prevMsg.createdAt).toDateString() : null;
              const currentDateStr = msg.createdAt ? new Date(msg.createdAt).toDateString() : null;
              const showDateDivider = prevDateStr !== currentDateStr;

              const isConsecutive = !showDateDivider && index > 0 && messages[index - 1].sender === msg.sender;
              const isLastMessage = index === messages.length - 1;
              const isMine = msg.sender === "me";
              return (
                <React.Fragment key={msg.id}>
                  {showDateDivider && (
                    <div className="flex justify-center my-2.5 select-none">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100/70 text-[10px] font-medium font-sans text-slate-400 tracking-tight">
                        {formatChatDateDivider(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  <div 
                    className={`flex flex-col ${isMine ? "items-end" : "items-start"} ${isConsecutive ? "mt-0.5" : "mt-2 first:mt-0"}`}
                  >
                    <div
                      className={`max-w-[85%] pl-3 pr-10 pt-1.5 pb-2 text-xs leading-relaxed relative min-w-[65px] font-sans ${
                        isMine
                          ? `bg-slate-900 text-white font-normal ${isConsecutive ? "rounded-xl" : "rounded-xl rounded-tr-none"}`
                          : `bg-slate-100/90 text-slate-800 ${isConsecutive ? "rounded-xl" : "rounded-xl rounded-tl-none"}`
                      }`}
                    >
                      <span className="block break-words whitespace-pre-wrap">{formatMessageBody(msg.text)}</span>
                      <span 
                        className={`absolute bottom-1 right-2 text-[9.5px] font-sans font-medium select-none pointer-events-none ${
                          isMine ? "text-white/60" : "text-slate-400"
                        }`}
                      >
                        {msg.time}
                      </span>
                    </div>
                    {isLastMessage && isMine && (
                      <span className="text-[10px] text-slate-400 mt-0.5 mr-1 font-medium font-sans select-none">
                        {(() => {
                          if (!otherLastReadAt || !msg.createdAt) return "Enviado";
                          const msgDate = new Date(msg.createdAt);
                          const readDate = new Date(otherLastReadAt);
                          return readDate >= msgDate ? "Visto" : "Enviado";
                        })()}
                      </span>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Footer */}
      <div className="p-2.5 bg-white border-t border-slate-100 shrink-0 touch-none">
        {isPendingForMe ? (
          <div className="flex flex-col items-center justify-center p-3.5 bg-slate-50 rounded-xl gap-2.5 border border-slate-100">
            <p className="text-xs font-medium text-slate-700 text-center font-sans">
              {name} quiere conectar contigo. ¿Aceptas la solicitud para chatear?
            </p>
            <div className="flex gap-2 w-full max-w-xs">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptConnection}
                className="flex-1"
              >
                Aceptar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRejectConnection}
                className="flex-1"
              >
                Rechazar
              </Button>
            </div>
          </div>
        ) : isDeclinedByMe ? (
          <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl gap-2 border border-slate-100">
            <p className="text-xs font-medium text-slate-500 text-center font-sans">
              Has rechazado esta solicitud de conexión.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendRequest}
            >
              Enviar solicitud para conectar
            </Button>
          </div>
        ) : isDeclinedForMe ? (
          <div className="flex flex-col items-center justify-center p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-medium text-slate-400 text-center font-sans">
              La solicitud de conexión fue rechazada.
            </p>
          </div>
        ) : (
          <div className="flex items-center w-full">
            <div className="flex-1 relative flex items-center">
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
                className="w-full bg-slate-50/80 border border-slate-200/90 focus:bg-white focus:border-slate-300 rounded-xl py-2 pl-3 pr-9 text-xs sm:text-[13px] font-sans outline-none transition-all resize-none min-h-[36px] max-h-24 custom-scrollbar block text-slate-900 placeholder:text-slate-400 touch-auto overscroll-contain leading-snug"
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                aria-label="Enviar mensaje"
                disabled={!inputText.trim()}
                className={`absolute right-1 bottom-1 w-7 h-7 rounded-lg flex items-center justify-center transition-all border-none ${
                  inputText.trim()
                    ? "bg-slate-900 text-white hover:bg-black active:scale-95 shadow-xs cursor-pointer"
                    : "bg-transparent text-slate-300 cursor-default"
                } touch-manipulation`}
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
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
          <div className="flex items-center gap-2 w-full">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setIsReportModalOpen(false);
                setReportReason("");
                setReportDescription("");
              }}
              disabled={isSubmittingReport}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleSubmitReport}
              disabled={isSubmittingReport || !reportReason}
              className="flex-1"
            >
              {isSubmittingReport ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Flag className="w-4 h-4 mr-1.5" />
                  <span>Reportar</span>
                </>
              )}
            </Button>
          </div>
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
            <label className="text-xs font-semibold font-jakarta text-slate-700">Detalles adicionales (opcional)</label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Proporciona más detalles si lo deseas..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-sans focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none resize-none h-24 text-slate-800"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
