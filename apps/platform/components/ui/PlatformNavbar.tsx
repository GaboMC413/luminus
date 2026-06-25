"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { NotificationPopup } from "./NotificationPopup";
import { MessagesPopup } from "./MessagesPopup";
import { ChatPopup } from "./ChatPopup";
import { SuccessModal } from "./SuccessModal";

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
  
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [userRole, setUserRole] = useState<"USER" | "ADMIN">("USER");

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [activePopupChat, setActivePopupChat] = useState<{ userId: string; name: string; avatar: string } | null>(null);

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  // States for onboarding achievement popup modal
  const [completedQuest, setCompletedQuest] = useState<{ id: string; title: string; body: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const onboardingNotification = notifications.find(n => n.type === "onboarding-progress");
  const onboardingOutstandingCount = onboardingNotification
    ? onboardingNotification.quests.filter((q: any) => !q.completed).length
    : 0;

  const otherUnreadCount = notifications
    .filter(n => n.type !== "onboarding-progress" && !String(n.type).startsWith("quest_completed_") && n.isUnread)
    .length;

  const unreadNotificationsCount = onboardingOutstandingCount > 0
    ? onboardingOutstandingCount + otherUnreadCount
    : otherUnreadCount;

  const unreadMessagesCount = messages.filter(m => m.isUnread).length;

  const [showMobileNavbar, setShowMobileNavbar] = useState(true);

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      setShowMobileNavbar(customEvent.detail);
      if (typeof document !== "undefined") {
        if (customEvent.detail) {
          document.body.classList.remove("mobile-navbar-hidden");
        } else {
          document.body.classList.add("mobile-navbar-hidden");
        }
      }
    };
    window.addEventListener("luminus_toggle_mobile_navbar", handleToggle);
    return () => {
      window.removeEventListener("luminus_toggle_mobile_navbar", handleToggle);
      if (typeof document !== "undefined") {
        document.body.classList.remove("mobile-navbar-hidden");
      }
    };
  }, []);

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

    const storedRole = (localStorage.getItem("luminus_user_role") as "USER" | "ADMIN") || "USER";
    setUserRole(storedRole);

    async function loadSessionUser() {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      if (data.user) {
        const u = data.user;
        
        const cachedUserId = localStorage.getItem("luminus_cached_user_id");
        const cachedEmail = localStorage.getItem("luminus_user_email");
        const isUserChanged = (cachedUserId && cachedUserId !== u.id) || (!cachedUserId && cachedEmail && cachedEmail !== u.email);

        if (isUserChanged) {
          const keysToRemove = [
            "luminus_profile_firstName",
            "luminus_profile_lastName",
            "luminus_profile_city",
            "luminus_profile_country",
            "luminus_profile_gender",
            "luminus_profile_birthdate",
            "luminus_profile_phone",
            "luminus_profile_profession",
            "luminus_profile_avatar",
            "luminus_profile_interests",
            "luminus_profile_otherInterests",
            "luminus_profile_bio",
            "luminus_profile_prompts",
            "luminus_profile_cover",
            "luminus_user_email",
            "luminus_user_role",
            "luminus_profile_plan",
            "luminus_onboarding_completed",
            "luminus_chats",
            "luminus_cached_user_id"
          ];
          keysToRemove.forEach(k => localStorage.removeItem(k));
          
          setProfileName("");
          setProfileAvatar("");
          setUserRole("USER");
        }

        localStorage.setItem("luminus_cached_user_id", u.id);

        const firstName = u.firstName || "";
        const lastName = u.lastName || "";
        const syncedFullName = `${firstName} ${lastName}`.trim();

        localStorage.setItem("luminus_profile_firstName", firstName);
        localStorage.setItem("luminus_profile_lastName", lastName);

        const avatar = u.avatarUrl || "";
        localStorage.setItem("luminus_profile_avatar", avatar);

        const role = u.role || "USER";
        localStorage.setItem("luminus_user_role", role);

        if (u.email) {
          localStorage.setItem("luminus_user_email", u.email);
        }

        setUserRole(role);
        setProfileAvatar(avatar);

        if (syncedFullName) {
          setProfileName(syncedFullName);
        } else if (u.email) {
          setProfileName(u.email.split("@")[0]);
        }
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
    const loadChats = async () => {
      // 1. Fetch conversations from database
      let dbMessages: any[] = [];
      try {
        const response = await fetch("/api/messages/conversations", {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          dbMessages = (data.conversations || []).map((conv: any) => {
            const lastMsg = conv.last_message;
            const timestamp = lastMsg ? new Date(lastMsg.created_at).getTime() : new Date(conv.updated_at).getTime();
            return {
              id: conv.id,
              avatar: conv.participant.avatar_url,
              title: conv.is_unread ? "Mensaje nuevo" : "Mensaje",
              user: conv.participant.name,
              action: lastMsg?.body || "Sin mensajes aún",
              date: formatRelativeTime(timestamp),
              isUnread: conv.is_unread,
              isDb: true,
              participantId: conv.participant.id
            };
          });
        }
      } catch (err) {
        console.error("Error fetching database conversations in navbar:", err);
      }

      // 2. Fetch conversations from localStorage (for floating popup chats)
      let localMessages: any[] = [];
      const localChats = localStorage.getItem("luminus_chats");
      if (localChats) {
        try {
          const chats = JSON.parse(localChats);
          if (Array.isArray(chats)) {
            // Filter out historical mock users (IDs "1", "2", or "mock-user-") and empty chats from navbar list
            const realChats = chats.filter((c: any) => {
              const idStr = String(c.id);
              const isMock = idStr === "1" || idStr === "2" || idStr.startsWith("mock-user-");
              const hasMessages = c.messages && c.messages.length > 0;
              return !isMock && hasMessages;
            });

            localMessages = realChats.map((chat: any) => {
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
          }
        } catch (err) {
          console.error("Error loading navbar chats from localStorage:", err);
        }
      }

      // Combine both lists, avoiding duplicate users
      const combined: any[] = [...dbMessages];
      localMessages.forEach((localMsg) => {
        const exists = combined.some((m) => 
          (m.participantId && String(m.participantId) === String(localMsg.id)) ||
          (String(m.id) === String(localMsg.id)) ||
          (m.user.trim().toLowerCase() === localMsg.user.trim().toLowerCase())
        );
        if (!exists) {
          combined.push(localMsg);
        }
      });

      setMessages(combined);
    };

    loadChats();
    window.addEventListener("storage", loadChats);
    window.addEventListener("luminus_messages_update", loadChats);
    const interval = setInterval(loadChats, 10000);
    return () => {
      window.removeEventListener("storage", loadChats);
      window.removeEventListener("luminus_messages_update", loadChats);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    loadNotifications();
    const handleUpdate = () => {
      loadNotifications();
    };
    window.addEventListener("luminus_notifications_update", handleUpdate);
    return () => {
      window.removeEventListener("luminus_notifications_update", handleUpdate);
    };
  }, []);

  // 1. Listen for custom quest completed event to display the success modal
  useEffect(() => {
    const handleQuestCompleted = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        setCompletedQuest(customEvent.detail);
        setShowSuccessModal(true);
        // Reload notifications lists to update the bell count and checklist checklist state immediately
        loadNotifications();
      }
    };
    window.addEventListener("luminus_quest_completed", handleQuestCompleted);
    return () => {
      window.removeEventListener("luminus_quest_completed", handleQuestCompleted);
    };
  }, []);

  // 2. Global fetch interceptor to automatically dispatch luminus_quest_completed
  // when any API returns newlyCompletedQuests
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).__luminus_fetch_intercepted) {
      (window as any).__luminus_fetch_intercepted = true;
      const originalFetch = window.fetch;
      window.fetch = async function(...args) {
        const response = await originalFetch(...args);
        const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url || '';
        if (url.includes('/api/')) {
          try {
            const clone = response.clone();
            const data = await clone.json();
            if (data && data.newlyCompletedQuests && Array.isArray(data.newlyCompletedQuests)) {
              data.newlyCompletedQuests.forEach((quest: any) => {
                window.dispatchEvent(new CustomEvent("luminus_quest_completed", { detail: quest }));
              });
            }
          } catch (e) {
            // Ignore non-json or parsing errors
          }
        }
        return response;
      };
    }
  }, []);

  useEffect(() => {
    const handleOpenChat = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        if (window.innerWidth < 640) {
          router.push(`/mensajes?id=${customEvent.detail.userId}&from=profile`);
        } else {
          setActivePopupChat(customEvent.detail);
        }
        setIsMessagesOpen(false);
        setIsNotificationOpen(false);
        setIsProfileDropdownOpen(false);
      }
    };

    window.addEventListener("luminus_open_chat", handleOpenChat);
    return () => {
      window.removeEventListener("luminus_open_chat", handleOpenChat);
    };
  }, [router]);

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

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await fetch(`/api/notifications?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  };

  const markMessageRead = (id: string | number) => {
    const msgObj = messages.find((m) => String(m.id) === String(id));
    if (msgObj) {
      const participantId = msgObj.participantId ? String(msgObj.participantId) : String(msgObj.id);
      if (window.innerWidth < 640) {
        router.push(`/mensajes?id=${participantId}`);
      } else {
        setActivePopupChat({
          userId: participantId,
          name: msgObj.user,
          avatar: msgObj.avatar
        });
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

    // Clear local storage profile details to prevent data bleed when switching users
    const keysToRemove = [
      "luminus_profile_firstName",
      "luminus_profile_lastName",
      "luminus_profile_city",
      "luminus_profile_country",
      "luminus_profile_gender",
      "luminus_profile_birthdate",
      "luminus_profile_phone",
      "luminus_profile_profession",
      "luminus_profile_avatar",
      "luminus_profile_interests",
      "luminus_profile_otherInterests",
      "luminus_profile_bio",
      "luminus_profile_prompts",
      "luminus_profile_cover",
      "luminus_user_email",
      "luminus_user_role",
      "luminus_profile_plan",
      "luminus_onboarding_completed",
      "luminus_chats",
      "luminus_cached_user_id"
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));

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
              onDelete={deleteNotification}
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
              <span className={`hidden lg:block text-sm font-semibold ${isProfileDropdownOpen ? "text-slate-900" : "text-slate-500 group-hover:text-slate-900"}`}>
                {profileName}
              </span>
            </button>

          {isProfileDropdownOpen && (
            <div className="fixed right-6 top-[72px] sm:absolute sm:right-0 sm:top-auto sm:mt-2 w-52 bg-white border border-slate-200 rounded-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <Link
                href="/perfil-usuario"
                onClick={() => setIsProfileDropdownOpen(false)}
                className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-slate-50 transition-colors"
              >
                <span className="material-symbols-rounded text-slate-500 group-hover:text-slate-900">person</span>
                <span className="font-semibold text-slate-500 group-hover:text-slate-900">Ver mi perfil</span>
              </Link>
              <Link
                href="/perfil-usuario/configuracion"
                onClick={() => setIsProfileDropdownOpen(false)}
                className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-slate-50 transition-colors"
              >
                <span className="material-symbols-rounded text-slate-500 group-hover:text-slate-900">settings</span>
                <span className="font-semibold text-slate-500 group-hover:text-slate-900">Ajustes de cuenta</span>
              </Link>
              {userRole === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-rounded text-slate-500 group-hover:text-slate-900">admin_panel_settings</span>
                  <span className="font-semibold text-slate-500 group-hover:text-slate-900">Administrador</span>
                </Link>
              )}
              <div className="h-[1px] bg-slate-100 w-full"></div>
              <button
                onClick={handleSignOut}
                className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-[#FF4B4B]/10 transition-colors text-left"
              >
                <span className="material-symbols-rounded text-slate-500 group-hover:text-[#FF4B4B]">logout</span>
                <span className="font-semibold text-slate-500 group-hover:text-[#FF4B4B]">Cerrar sesión</span>
              </button>
            </div>
          )}
          </div>
        </div>
      </header>

      {/* Mobile Nav - Fixed Bottom */}
      {showMobileNavbar && (
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-50 animate-in slide-in-from-bottom duration-200">
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
      )}
      
      {activePopupChat && (
        <ChatPopup
          userId={activePopupChat.userId}
          name={activePopupChat.name}
          avatar={activePopupChat.avatar}
          onClose={() => setActivePopupChat(null)}
        />
      )}

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={completedQuest?.title || ""}
        message={completedQuest?.body || ""}
        buttonText="Cerrar"
        eyebrow="¡Destello completado!"
        celebrate={true}
      />

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
