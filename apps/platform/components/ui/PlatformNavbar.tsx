"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { NotificationPopup } from "./NotificationPopup";
import { MessagesPopup } from "./MessagesPopup";
import { ChatPopup } from "./ChatPopup";

export function formatRelativeTime(timestamp: any): string {
  if (!timestamp) return "Ahora";

  const dateObj = new Date(timestamp);
  if (isNaN(dateObj.getTime())) {
    return "Ahora";
  }

  const diffMs = Date.now() - dateObj.getTime();
  if (diffMs < 0) return "Ahora";

  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `${diffMins} min`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} mes${diffMonths > 1 ? "es" : ""}`;

  return dateObj.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const NAV_ITEMS = [
  { id: "comunidad", label: "Comunidad", path: "/comunidad", icon: "/Icons/NavBar/comunity inactive.svg", activeIcon: "/Icons/NavBar/community active.svg" },
  { id: "especialistas", label: "Especialistas", path: "/especialistas", icon: "/Icons/NavBar/expert inactive.svg", activeIcon: "/Icons/NavBar/expert active.svg" },
  { id: "espacios", label: "Espacios", path: "/espacios", icon: "/Icons/NavBar/espacios inactive.svg", activeIcon: "/Icons/NavBar/espacios active.svg" },
  { id: "mapa", label: "Mapa", path: "/mapa", icon: "/Icons/NavBar/map inactive.svg", activeIcon: "/Icons/NavBar/map active.svg" },
  { id: "faro", label: "Faro", path: "/faro", icon: "/Icons/NavBar/faro inactive.svg", activeIcon: "/Icons/NavBar/faro active.svg" },
];

const INITIAL_NOTIFICATIONS: any[] = [];
const INITIAL_MESSAGES: any[] = [];

function formatNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Ahora";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;

  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} d`;
}

export function PlatformNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Real-time local storage user profile sync
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [activePopupChat, setActivePopupChat] = useState<{ userId: string; name: string; avatar: string } | null>(null);

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const unreadNotificationsCount = notifications.filter(n => n.isUnread).length;
  const unreadMessagesCount = messages.filter(m => m.isUnread).length;

  useEffect(() => {
    // Load local storage details dynamically
    const storedFirst = localStorage.getItem("luminus_profile_firstName") || "";
    const storedLast = localStorage.getItem("luminus_profile_lastName") || "";
    const fullName = `${storedFirst} ${storedLast}`.trim();
    if (fullName) {
      setProfileName(fullName);
    } else {
      const storedEmail = localStorage.getItem("luminus_user_email") || "Usuario";
      setProfileName(storedEmail.split("@")[0]);
    }

    const storedAvatar = localStorage.getItem("luminus_profile_avatar") || "";
    setProfileAvatar(storedAvatar);

    async function loadSessionUser() {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const email = data.user?.email;

      if (!fullName && email) {
        setProfileName(email.split("@")[0]);
      }
    }

    loadSessionUser();
  }, []);

  async function loadNotifications() {
    const response = await fetch("/api/notifications", {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setNotifications((data.notifications || []).map((notification: any) => ({
      ...notification,
      date: formatNotificationDate(notification.date),
    })));
  }

  // Sync real chats with localStorage for dynamic notification count & list
  useEffect(() => {
    const loadChats = () => {
      const localChats = localStorage.getItem("luminus_chats");
      if (localChats) {
        try {
          const chats = JSON.parse(localChats);
          if (Array.isArray(chats)) {
            // Filter out historical mock users (IDs "1", "2", or "mock-user-") from navbar list
            const realChats = chats.filter((c: any) => {
              const idStr = String(c.id);
              return idStr !== "1" && idStr !== "2" && !idStr.startsWith("mock-user-");
            });

            const popupMsgs = realChats.map((chat: any) => {
              const lastMsgObj = chat.messages?.[chat.messages.length - 1];
              const timestamp = lastMsgObj ? lastMsgObj.id : Date.now();
              return {
                id: chat.id,
                avatar: chat.avatar,
                title: "Mensaje nuevo",
                user: chat.name,
                action: chat.lastMessage || "Sin mensajes aún",
                date: formatRelativeTime(timestamp),
                isUnread: lastMsgObj ? lastMsgObj.sender !== "me" : false,
              };
            });
            setMessages(popupMsgs);
          }
        } catch (err) {
          console.error("Error loading navbar chats:", err);
        }
      } else {
        setMessages([]);
      }
    };

    loadChats();
    window.addEventListener("storage", loadChats);
    return () => window.removeEventListener("storage", loadChats);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, []);

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname.includes("/comunidad")) return "comunidad";
    if (pathname.includes("/especialistas")) return "especialistas";
    if (pathname.includes("/espacios")) return "espacios";
    if (pathname.includes("/mapa")) return "mapa";
    if (pathname.includes("/faro")) return "faro";
    if (pathname.includes("/perfil-usuario")) return "perfil-usuario";
    return "";
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setIsMessagesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: false } : n));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
  };

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ markAll: true }),
    });
  };

  const markMessageRead = (id: string | number) => {
    // Open in bottom popup chat dynamically from the navbar
    const localChats = localStorage.getItem("luminus_chats");
    if (localChats) {
      try {
        const chats = JSON.parse(localChats);
        const found = chats.find((c: any) => String(c.id) === String(id));
        if (found) {
          setActivePopupChat({
            userId: String(found.id),
            name: found.name,
            avatar: found.avatar
          });
        }
      } catch (err) {
        console.error("Error parsing chats in markMessageRead:", err);
      }
    }
    setIsMessagesOpen(false);
  };

  const markAllMessagesRead = () => {
    router.push(`/mensajes`);
    setIsMessagesOpen(false);
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/auth/iniciar-sesion");
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="fixed top-0 left-0 w-full bg-white border-b border-slate-200 z-50 h-[64px] lg:h-[80px] px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/">
            <img src="/logo-luminus-black.svg" alt="Luminus" className="hidden sm:block h-[20px] cursor-pointer" />
            <img src="/iso-logo-black.svg" alt="Luminus" className="sm:hidden h-[24px] cursor-pointer" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`group h-[48px] px-3 lg:px-[12px] rounded-xl flex items-center gap-2.5 transition-colors duration-200 ${isActive
                    ? "text-black bg-slate-50/50"
                    : "text-slate-400 hover:text-black"
                    }`}
                >
                  <div className="relative w-[18px] h-[18px] lg:w-[24px] lg:h-[24px] shrink-0">
                    {/* Inactive Icon Layer */}
                    <div
                      style={{
                        maskImage: `url('${item.icon}')`,
                        WebkitMaskImage: `url('${item.icon}')`
                      }}
                      className={`absolute inset-0 transition-opacity duration-200 [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center] [webkit-mask-size:contain] [webkit-mask-repeat:no-repeat] [webkit-mask-position:center] ${isActive ? "opacity-0" : "opacity-100 bg-slate-400 group-hover:bg-black"}`}
                    />
                    {/* Active Icon Layer */}
                    <div
                      style={{
                        maskImage: `url('${item.activeIcon}')`,
                        WebkitMaskImage: `url('${item.activeIcon}')`
                      }}
                      className={`absolute inset-0 transition-opacity duration-200 [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center] [webkit-mask-size:contain] [webkit-mask-repeat:no-repeat] [webkit-mask-position:center] ${isActive ? "opacity-100 bg-black" : "opacity-0"}`}
                    />
                  </div>
                  <span className={`text-[14px] font-semibold ${isActive ? "text-black" : "text-slate-400 group-hover:text-black"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <div className="relative" ref={messagesRef}>
            <button
              onClick={() => setIsMessagesOpen(!isMessagesOpen)}
              type="button"
              aria-label={`Messages: ${unreadMessagesCount} unread`}
              className={`relative flex h-12 w-12 items-center justify-center rounded-xl transition ${isMessagesOpen
                ? "bg-slate-100 text-black"
                : "bg-auto text-slate-400 hover:bg-slate-100 hover:text-black"
                }`}
            >
              <span className={`material-symbols-rounded text-[22px] ${isMessagesOpen ? "material-icon-filled text-black" : ""}`}>
                chat_bubble
              </span>
              {unreadMessagesCount > 0 && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF4B4B] text-white flex items-center justify-center text-[10px] font-bold leading-none z-50">
                  {unreadMessagesCount}
                </div>
              )}
            </button>

            <MessagesPopup
              isOpen={isMessagesOpen}
              onClose={() => setIsMessagesOpen(false)}
              messages={messages}
              onMarkRead={markMessageRead}
              onMarkAllRead={markAllMessagesRead}
            />
          </div>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                const nextOpen = !isNotificationOpen;
                setIsNotificationOpen(nextOpen);
                if (nextOpen) {
                  loadNotifications();
                }
              }}
              type="button"
              aria-label={`Notifications: ${unreadNotificationsCount} unread`}
              className={`relative flex h-12 w-12 items-center justify-center rounded-xl transition ${isNotificationOpen
                ? "bg-slate-100 text-black"
                : "bg-auto text-slate-400 hover:bg-slate-100 hover:text-black"
                }`}
            >
              <span className={`material-symbols-rounded text-[22px] ${isNotificationOpen ? "material-icon-filled text-black" : ""}`}>
                notifications
              </span>
              {unreadNotificationsCount > 0 && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF4B4B] text-white flex items-center justify-center text-[10px] font-bold leading-none z-50">
                  {unreadNotificationsCount}
                </div>
              )}
            </button>

            <NotificationPopup
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
              notifications={notifications}
              onMarkRead={markNotificationRead}
              onMarkAllRead={markAllNotificationsRead}
            />
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className={`group flex items-center gap-2.5 p-1 lg:pr-2 rounded-xl transition-all ${isProfileDropdownOpen ? "bg-slate-50" : "hover:bg-slate-50"}`}
            >
              {profileAvatar ? (
                <img
                  src={profileAvatar}
                  alt="Perfil"
                  className="w-8 h-8 lg:w-9 lg:h-9 rounded-[8px] object-cover"
                />
              ) : (
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-[8px] bg-slate-100 flex items-center justify-center">
                  <span className="material-symbols-rounded text-slate-400 text-[20px]">person</span>
                </div>
              )}
              <span className={`hidden lg:block text-[14px] font-semibold ${isProfileDropdownOpen ? "text-black" : "text-slate-400 group-hover:text-black"}`}>
                {profileName}
              </span>
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <Link
                  href="/perfil-usuario"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-[14px] hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-rounded text-slate-400 group-hover:text-black">person</span>
                  <span className="font-semibold text-slate-400 group-hover:text-black">Ver mi perfil</span>
                </Link>
                <Link
                  href="/perfil-usuario/configuracion"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-[14px] hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-rounded text-slate-400 group-hover:text-black">settings</span>
                  <span className="font-semibold text-slate-400 group-hover:text-black">Ajustes de cuenta</span>
                </Link>
                <div className="h-[1px] bg-slate-100 w-full"></div>
                <button
                  onClick={handleSignOut}
                  className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-[14px] hover:bg-[#FF4B4B]/10 transition-colors text-left"
                >
                  <span className="material-symbols-rounded text-slate-400 group-hover:text-[#FF4B4B]">logout</span>
                  <span className="font-semibold text-slate-400 group-hover:text-[#FF4B4B]">Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Nav - Fixed Bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-50">
        <div className="max-w-md mx-auto h-[64px] px-6 flex justify-between items-center pb-[env(safe-area-inset-bottom)]">
          {NAV_ITEMS.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <Link
                key={tab.id}
                href={tab.path}
                className={`flex flex-col items-center justify-center gap-0 flex-1 transition-colors duration-200 ${isActive ? "text-black" : "text-slate-400"}`}
              >
                <div className="flex items-center justify-center">
                  <div className="relative w-[26px] h-[26px] shrink-0">
                    {/* Inactive Icon Layer */}
                    <div
                      style={{
                        maskImage: `url('${tab.icon}')`,
                        WebkitMaskImage: `url('${tab.icon}')`
                      }}
                      className={`absolute inset-0 transition-opacity duration-200 [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center] [webkit-mask-size:contain] [webkit-mask-repeat:no-repeat] [webkit-mask-position:center] ${isActive ? "opacity-0" : "opacity-100 bg-slate-400"}`}
                    />
                    {/* Active Icon Layer */}
                    <div
                      style={{
                        maskImage: `url('${tab.activeIcon}')`,
                        WebkitMaskImage: `url('${tab.activeIcon}')`
                      }}
                      className={`absolute inset-0 transition-opacity duration-200 [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center] [webkit-mask-size:contain] [webkit-mask-repeat:no-repeat] [webkit-mask-position:center] ${isActive ? "opacity-100 bg-black" : "opacity-0"}`}
                    />
                  </div>
                </div>
                <span className={`text-[10px] font-medium tracking-tight ${isActive ? "opacity-100" : "opacity-70"}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {activePopupChat && (
        <ChatPopup
          userId={activePopupChat.userId}
          name={activePopupChat.name}
          avatar={activePopupChat.avatar}
          onClose={() => setActivePopupChat(null)}
        />
      )}

      {/* Preload icons to avoid lag */}
      <div className="hidden" aria-hidden="true">
        {NAV_ITEMS.map((item) => (
          <div key={item.id}>
            <img src={item.icon} alt="" />
            <img src={item.activeIcon} alt="" />
          </div>
        ))}
      </div>
    </>
  );
}
