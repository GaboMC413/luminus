"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { SelectInput } from "@/components/ui/SelectInput";
import { formatRelativeTime } from "@/components/ui/PlatformNavbar";
import { isUuid } from "@/utils/validation";
import { PageLoader } from "@/components/ui/PageLoader";
import { DotSpinner } from "@/components/ui/DotSpinner";
import { formatMessageBody, formatShortTime } from "@/utils/messages";

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
  is_unread?: boolean;
  is_muted?: boolean;
  updated_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

function fallbackAvatar(name: string) {
  const initials = encodeURIComponent(name || "Usuario");
  return `https://ui-avatars.com/api/?name=${initials}&background=e2e8f0&color=0f172a&size=128`;
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipientId = searchParams.get("id");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>(isUuid(recipientId) ? 'chat' : 'list');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [newConversation, setNewConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherLastReadAt, setOtherLastReadAt] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [connection, setConnection] = useState<any>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const shouldScrollToBottomRef = useRef(false);
  const scrollPreserveRef = useRef<{ height: number; top: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

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
        let activeConv: Conversation | null = null;

        if (isUuid(recipientId)) {
          const response = await fetch("/api/messages/conversations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-timezone-offset": new Date().getTimezoneOffset().toString(),
            },
            body: JSON.stringify({ recipientId }),
          });

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || "No pudimos abrir la conversacion.");
          }

          const data = await response.json();
          activeConv = data.conversation;
          setNewConversation(data.conversation);
          setSelectedId(data.conversation.id);
          setMobileView('chat');
        } else {
          setNewConversation(null);
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
        
        let updatedConversations = [...nextConversations];
        if (activeConv) {
          const exists = nextConversations.some((c: Conversation) => c.id === activeConv!.id);
          if (!exists) {
            updatedConversations = [activeConv, ...nextConversations];
          }
        }
        setConversations(updatedConversations);

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
    // Keep mobile navbar visible on messages page by default
    window.dispatchEvent(new CustomEvent("luminus_toggle_mobile_navbar", { detail: true }));
    return () => {
      window.dispatchEvent(new CustomEvent("luminus_toggle_mobile_navbar", { detail: true }));
    };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      setNextCursor(null);
      setHasMore(false);
      setConnection(null);
      setOtherLastReadAt(null);
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
        const incomingMessages = data.messages || [];

        setMessages((prev) => {
          if (prev.length === 0 || prev[0].conversation_id !== selectedId) {
            shouldScrollToBottomRef.current = true;
            return incomingMessages;
          }

          const prevIds = new Set(prev.map((m) => m.id));
          const newMessages = incomingMessages.filter((m: any) => !prevIds.has(m.id));

          if (newMessages.length === 0) return prev;

          const container = chatContainerRef.current;
          const isNearBottom = container
            ? container.scrollHeight - container.scrollTop - container.clientHeight < 100
            : true;
          if (isNearBottom) {
            shouldScrollToBottomRef.current = true;
          }

          return [...prev, ...newMessages];
        });

        setNextCursor((prevCursor) => (prevCursor === null ? data.nextCursor : prevCursor));
        setHasMore((prevHasMore) => (prevHasMore === false ? data.hasMore : prevHasMore));
        setConnection((prevConn: any) => (prevConn === null ? data.connection : data.connection));
        setOtherLastReadAt(data.otherLastReadAt || null);
        window.dispatchEvent(new Event("luminus_messages_update"));
      } catch (err: any) {
        setError(err.message || "No pudimos cargar la conversacion.");
      }
    }

    loadMessages();

    // Poll for new messages/status every 10 seconds while chat is active
    const pollInterval = setInterval(loadMessages, 10000);
    return () => {
      clearInterval(pollInterval);
    };
  }, [selectedId]);

  async function loadMoreMessages() {
    if (isLoadingMore || !hasMore || !nextCursor || !selectedId) return;

    try {
      setIsLoadingMore(true);
      if (chatContainerRef.current) {
        scrollPreserveRef.current = {
          height: chatContainerRef.current.scrollHeight,
          top: chatContainerRef.current.scrollTop,
        };
      }

      const response = await fetch(`/api/messages/conversations/${selectedId}/messages?cursor=${nextCursor}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "No pudimos cargar más mensajes.");
      }

      const data = await response.json();
      const olderMessages = data.messages || [];

      setMessages((prev) => [...olderMessages, ...prev]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err: any) {
      console.error("Error loading older messages:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    // Trigger loading older messages when scrolled close to the top
    if (container.scrollTop < 100 && hasMore && !isLoadingMore) {
      loadMoreMessages();
    }
  };

  useEffect(() => {
    if (shouldScrollToBottomRef.current && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      shouldScrollToBottomRef.current = false;
    } else if (scrollPreserveRef.current && chatContainerRef.current) {
      const { height, top } = scrollPreserveRef.current;
      const newHeight = chatContainerRef.current.scrollHeight;
      chatContainerRef.current.scrollTop = top + (newHeight - height);
      scrollPreserveRef.current = null;
    }
  }, [messages]);

  // Keep chat scrolled to bottom when mobile keyboard opens/closes
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    };

    const handleViewportResize = () => {
      // When the visual viewport height shrinks, the keyboard likely opened
      // Scroll the chat container to bottom after a short delay for layout to settle
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    };

    window.visualViewport.addEventListener("resize", handleViewportResize);
    window.visualViewport.addEventListener("scroll", handleViewportResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleViewportResize);
      window.visualViewport?.removeEventListener("scroll", handleViewportResize);
    };
  }, [selectedId, mobileView]);

  const refreshConversations = async () => {
    const response = await fetch("/api/messages/conversations", {
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      const nextConversations = data.conversations || [];
      let updatedConversations = [...nextConversations];
      if (newConversation) {
        const exists = nextConversations.some((c: Conversation) => c.id === newConversation.id);
        if (!exists) {
          updatedConversations = [newConversation, ...nextConversations];
        }
      }
      setConversations(updatedConversations);
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
      shouldScrollToBottomRef.current = true;
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

  const handleAcceptConnection = async () => {
    if (!selectedConv || !selectedConv.participant) return;
    try {
      const res = await fetch("/api/connections", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientId: selectedConv.participant.id }),
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
    if (!selectedConv || !selectedConv.participant) return;
    try {
      await fetch(`/api/connections?recipientId=${selectedConv.participant.id}`, {
        method: "DELETE",
      });
      setConnection((prev: any) => prev ? { ...prev, status: "declined" } : null);
      window.dispatchEvent(new Event("luminus_messages_update"));
    } catch (err) {
      console.error("Failed to reject connection:", err);
    }
  };

  const handleSendRequest = async () => {
    if (!selectedConv || !selectedConv.participant) return;
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-timezone-offset": new Date().getTimezoneOffset().toString(),
        },
        body: JSON.stringify({ recipientId: selectedConv.participant.id }),
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

  const handleMuteChat = async () => {
    if (selectedConv && selectedId) {
      try {
        const isMuted = selectedConv.is_muted || false;
        const res = await fetch(`/api/messages/conversations/${selectedId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: isMuted ? "unmute" : "mute" }),
        });
        if (res.ok) {
          setConversations((prev) =>
            prev.map((c) => (c.id === selectedId ? { ...c, is_muted: !isMuted } : c))
          );
          if (newConversation && newConversation.id === selectedId) {
            setNewConversation((prev: any) => prev ? { ...prev, is_muted: !isMuted } : null);
          }
          window.dispatchEvent(new Event("luminus_messages_update"));
        } else {
          const data = await res.json().catch(() => ({}));
          alert(data.message || "No se pudo actualizar el estado de silencio del chat.");
        }
      } catch (err) {
        console.error("Failed to mute user:", err);
      } finally {
        setIsChatMenuOpen(false);
      }
    }
  };

  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleSubmitReport = async () => {
    if (!selectedConv?.participant?.id) return;
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
          reportedId: selectedConv.participant.id,
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

  const selectedConv = conversations.find((conversation) => conversation.id === selectedId) || newConversation;
  const filteredConversations = conversations.filter((conversation) => {
    const lastMessage = conversation.last_message?.body || "";
    const searchable = `${conversation.participant.name} ${lastMessage}`.toLowerCase();
    return searchable.includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const updateBodyClass = () => {
      const isMobileSize = window.innerWidth < 1024;
      if (isMobileSize && mobileView === "chat") {
        document.body.classList.add("in-mobile-chat-view");
        window.dispatchEvent(new CustomEvent("luminus_toggle_mobile_navbar", { detail: false }));
      } else {
        document.body.classList.remove("in-mobile-chat-view");
        window.dispatchEvent(new CustomEvent("luminus_toggle_mobile_navbar", { detail: true }));
      }
    };

    updateBodyClass();
    window.addEventListener("resize", updateBodyClass);

    return () => {
      window.removeEventListener("resize", updateBodyClass);
      document.body.classList.remove("in-mobile-chat-view");
      window.dispatchEvent(new CustomEvent("luminus_toggle_mobile_navbar", { detail: true }));
    };
  }, [mobileView]);

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth >= 1024) return;
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      const height = vv.height;
      setViewportHeight(height);
      document.body.style.setProperty("--visual-viewport-height", `${height}px`);
      document.documentElement.style.setProperty("--visual-viewport-height", `${height}px`);
      document.body.classList.add("mobile-viewport-height-override");
      document.documentElement.classList.add("mobile-viewport-height-override");

      // Reset scroll position to prevent browser scroll shifting when keyboard opens
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    vv.addEventListener("resize", handleResize);
    vv.addEventListener("scroll", handleResize);
    
    handleResize();

    return () => {
      vv.removeEventListener("resize", handleResize);
      vv.removeEventListener("scroll", handleResize);
      document.body.style.removeProperty("--visual-viewport-height");
      document.documentElement.style.removeProperty("--visual-viewport-height");
      document.body.classList.remove("mobile-viewport-height-override");
      document.documentElement.classList.remove("mobile-viewport-height-override");
    };
  }, []);

  const isPendingForMe = false;
  const isDeclinedByMe = false;
  const isDeclinedForMe = false;

  const isMobile = isMounted && typeof window !== "undefined" && window.innerWidth < 1024;
  const dynamicHeight = viewportHeight && isMobile
    ? (mobileView === "chat" ? `${viewportHeight}px` : `${viewportHeight - 64}px`)
    : undefined;

  return (
    <div 
      className="w-full flex-1 flex flex-col bg-slate-50 min-h-0 lg:h-[calc(100vh-80px)] overflow-hidden"
      style={{ height: dynamicHeight }}
    >
      <div className={`flex-1 w-full max-w-7xl mx-auto flex flex-col min-h-0 overflow-hidden ${
        mobileView === "chat"
          ? "px-0 py-0 md:px-6 md:py-6"
          : "px-4 md:px-6 py-4 md:py-6"
      }`}>
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
                  <div className="p-8 flex justify-center items-center"><DotSpinner size={24} color="black" /></div>
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
                      <div className="flex items-center justify-between gap-1.5 min-w-0">
                        <p className="text-sm text-slate-500 truncate flex-1">{conversation.last_message?.body || "Sin mensajes aun"}</p>
                        {conversation.is_muted && (
                          <span className="material-symbols-rounded text-slate-400 text-[16px] shrink-0" title="Silenciado">
                            notifications_off
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {isLoading && isUuid(recipientId) ? (
              <div className={`flex-col bg-white overflow-hidden flex-1 md:flex-initial md:h-full md:min-h-0 relative md:col-span-8 md:rounded-2xl md:border md:border-slate-200 ${
                mobileView === "chat"
                  ? "rounded-none border-none"
                  : "rounded-2xl border border-slate-200"
              } ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'}`}>
                {/* Skeleton Header */}
                <div className={`border-b border-slate-100 flex items-center gap-3 bg-white shrink-0 touch-none ${
                  mobileView === "chat" ? "py-2 px-3 md:p-3" : "p-3"
                }`}>
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("luminus_toggle_mobile_navbar", { detail: true }));
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
                  <div className={`bg-slate-100 animate-pulse shrink-0 ${
                    mobileView === "chat"
                      ? "w-8 h-8 rounded-lg md:w-11 md:h-11 md:rounded-[10px]"
                      : "w-11 h-11 rounded-[10px]"
                  }`} />
                  <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
                </div>

                {/* Skeleton Body */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 bg-white overscroll-contain">
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
                <div className="p-3 border-t border-slate-100 bg-white shrink-0 touch-none">
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
              <div className={`flex-col bg-white overflow-hidden flex-1 md:flex-initial md:h-full md:min-h-0 relative md:col-span-8 md:rounded-2xl md:border md:border-slate-200 ${
                mobileView === "chat"
                  ? "rounded-none border-none"
                  : "rounded-2xl border border-slate-200"
              } ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'}`}>
                <div className={`border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0 gap-4 touch-none ${
                  mobileView === "chat" ? "py-2 px-3 md:p-3" : "p-3"
                }`}>
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("luminus_toggle_mobile_navbar", { detail: true }));
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
                      className={`object-cover shrink-0 ${
                        mobileView === "chat"
                          ? "w-8 h-8 rounded-lg md:w-11 md:h-11 md:rounded-[10px]"
                          : "w-11 h-11 rounded-[10px]"
                      }`}
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
                            onClick={handleMuteChat}
                            className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-slate-50 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                          >
                            <span className="material-symbols-rounded text-slate-500 group-hover:text-slate-900 text-[18px] transition-colors">
                              {selectedConv.is_muted ? "notifications" : "notifications_off"}
                            </span>
                            <span className="font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
                              {selectedConv.is_muted ? "Desactivar silencio" : "Silenciar chat"}
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
                              setIsChatMenuOpen(false);
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
                </div>

                <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-3 thin-scrollbar flex flex-col gap-0.5 bg-white overscroll-contain">
                  {isLoadingMore && (
                    <div className="flex justify-center py-2">
                      <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                    </div>
                  )}
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
                      const isLastMessage = index === messages.length - 1;
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
                          {isLastMessage && isMine && (
                            <span className="text-[10px] text-slate-400 mt-1 mr-1 font-semibold select-none">
                              {(() => {
                                if (!otherLastReadAt) return "Enviado";
                                const msgDate = new Date(message.created_at);
                                const readDate = new Date(otherLastReadAt);
                                return readDate >= msgDate ? "Visto" : "Enviado";
                              })()}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 bg-white shrink-0 border-t border-slate-100 touch-none">
                  {isPendingForMe ? (
                    <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl gap-3 border border-slate-100">
                      <p className="text-sm font-medium text-slate-700 text-center">
                        {selectedConv.participant.name} quiere conectar contigo. ¿Aceptas la solicitud para chatear?
                      </p>
                      <div className="flex gap-4 w-full max-w-xs">
                        <button
                          onClick={handleAcceptConnection}
                          className="flex-1 py-2 px-4 rounded-xl bg-black text-white hover:bg-slate-800 text-sm font-semibold transition-colors border-none cursor-pointer"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={handleRejectConnection}
                          className="flex-1 py-2 px-4 rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300 text-sm font-semibold transition-colors border-none cursor-pointer"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ) : isDeclinedByMe ? (
                    <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl gap-2 border border-slate-100">
                      <p className="text-sm font-medium text-slate-500 text-center">
                        Has rechazado esta solicitud de conexión.
                      </p>
                      <button
                        onClick={handleSendRequest}
                        className="py-1.5 px-4 rounded-xl bg-slate-900 text-white hover:bg-black text-xs font-semibold transition-colors border-none cursor-pointer"
                      >
                        Enviar solicitud para conectar
                      </button>
                    </div>
                  ) : isDeclinedForMe ? (
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-sm font-medium text-slate-400 text-center">
                        La solicitud de conexión fue rechazada.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center w-full">
                      <div className="flex-1 relative flex items-end">
                        <textarea
                          ref={textareaRef}
                          value={inputText}
                          onChange={(event) => setInputText(event.target.value)}
                          onKeyDown={handleKeyDown}
                          onFocus={() => {
                            // Multiple attempts to scroll after keyboard animation
                            const scrollToEnd = () => {
                              if (chatContainerRef.current) {
                                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                              }
                            };
                            setTimeout(scrollToEnd, 100);
                            setTimeout(scrollToEnd, 300);
                            setTimeout(scrollToEnd, 500);
                          }}
                          onBlur={() => {}}
                          placeholder="Escribe un mensaje..."
                          rows={1}
                          className="w-full bg-slate-50 border-none rounded-[24px] py-3.5 pl-5 pr-14 text-sm focus:ring-1 focus:ring-slate-200 outline-none transition-all resize-none max-h-32 custom-scrollbar block text-slate-800 touch-auto overscroll-contain"
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
                          } bg-slate-100 hover:bg-black hover:text-white cursor-pointer hover:scale-105 active:scale-95 touch-manipulation`}
                          disabled={isSending}
                        >
                          <span className="material-symbols-rounded text-[18px] ml-0.5">send</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
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

export default function MessagesPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MessagesContent />
    </Suspense>
  );
}
