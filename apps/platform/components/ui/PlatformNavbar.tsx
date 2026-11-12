"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  HeartHandshake,
  CalendarHeart,
  TvMinimalPlay,
  HouseHeart,
  MessageSquare,
  Bell,
  User,
  Settings,
  Shield,
  LogOut,
  ChevronDown
} from "lucide-react";
import { NotificationPopup } from "./NotificationPopup";
import { MessagesPopup } from "./MessagesPopup";
import { ChatPopup } from "./ChatPopup";
import { SuccessModal } from "./SuccessModal";
import { UserAvatar } from "./UserAvatar";

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

  return dateObj.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "numeric" });
}

const NAV_ITEMS = [
  { id: "inicio", label: "Inicio", path: "/inicio", icon: Home },
  { id: "especialistas", label: "Especialistas", path: "/especialistas", icon: HeartHandshake },
  { id: "actividades", label: "Actividades", path: "/actividades", icon: CalendarHeart },
  { id: "grabaciones", label: "Grabaciones", path: "/grabaciones", icon: TvMinimalPlay },
  { id: "espacios", label: "Espacios", path: "/espacios", icon: HouseHeart },
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
  const [userEmail, setUserEmail] = useState("");

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [activePopupChat, setActivePopupChat] = useState<{ userId: string; name: string; avatar: string } | null>(null);

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  // States for onboarding achievement popup modal
  const [questQueue, setQuestQueue] = useState<{ id: string; title: string; body: string }[]>([]);
  const [completedQuest, setCompletedQuest] = useState<{ id: string; title: string; body: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Real unread notifications count: count actual unread notifications
  const unreadNotificationsCount = notifications.filter(
    (n) => n.type !== "onboarding-progress" && n.isUnread
  ).length;

  const unreadMessagesCount = messages.filter((m) => m.isUnread && !m.isMuted).length;

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
    const storedEmail = localStorage.getItem("luminus_user_email") || "";
    setUserEmail(storedEmail);

    if (fullName) {
      setProfileName(fullName);
    } else if (storedEmail) {
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
        const isUserChanged =
          (cachedUserId && cachedUserId !== u.id) || (!cachedUserId && cachedEmail && cachedEmail !== u.email);

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
            "luminus_cached_user_id",
          ];
          keysToRemove.forEach((k) => localStorage.removeItem(k));

          setProfileName("");
          setProfileAvatar("");
          setUserEmail("");
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
          setUserEmail(u.email);
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
    setNotifications(
      (data.notifications || []).map((notification: any) => ({
        ...notification,
        date: formatNotificationDate(notification.date),
      }))
    );
  }

  // Fetch conversations from database on demand
  const loadChats = useCallback(async () => {
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
            isMuted: conv.is_muted,
            isDb: true,
            participantId: conv.participant.id,
          };
        });
      }
    } catch (err) {
      console.error("Error fetching database conversations in navbar:", err);
    }

    setMessages(dbMessages);
  }, []);

  // Sync real chats on mount and on explicit events (pure event-driven, 0 idle polling)
  useEffect(() => {
    loadChats();
    window.addEventListener("luminus_messages_update", loadChats);
    return () => {
      window.removeEventListener("luminus_messages_update", loadChats);
    };
  }, [loadChats]);

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
        setQuestQueue((prev) => [...prev, customEvent.detail]);
        loadNotifications();
      }
    };
    window.addEventListener("luminus_quest_completed", handleQuestCompleted);
    return () => {
      window.removeEventListener("luminus_quest_completed", handleQuestCompleted);
    };
  }, []);

  useEffect(() => {
    if (!showSuccessModal && questQueue.length > 0) {
      const [nextQuest, ...remaining] = questQueue;
      setCompletedQuest(nextQuest);
      setShowSuccessModal(true);
      setQuestQueue(remaining);
    }
  }, [showSuccessModal, questQueue]);



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

  const [profileFromContext, setProfileFromContext] = useState<string | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/inicio/public-profile")) {
      const params = new URLSearchParams(window.location.search);
      const fromParam = params.get("from");
      if (fromParam && ["especialistas", "espacios", "grupos", "faro", "inicio"].includes(fromParam)) {
        setProfileFromContext(fromParam);
      } else {
        setProfileFromContext("");
      }
    } else {
      setProfileFromContext(null);
    }
  }, [pathname]);

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname.startsWith("/inicio/public-profile")) {
      return profileFromContext ?? "";
    }
    if (pathname === "/" || pathname.startsWith("/inicio") || pathname.startsWith("/comunidad")) return "inicio";
    if (pathname.includes("/especialistas")) return "especialistas";
    if (pathname.includes("/actividades")) return "actividades";
    if (pathname.includes("/grabaciones")) return "grabaciones";
    if (pathname.includes("/espacios")) return "espacios";
    if (pathname.includes("/grupos")) return "grupos";
    if (pathname.includes("/mapa")) return "espacios";
    if (pathname.includes("/faro")) return "faro";
    if (pathname.includes("/perfil-usuario")) return "perfil-usuario";
    return "";
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    setIsProfileDropdownOpen(false);
    setIsNotificationOpen(false);
    setIsMessagesOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setIsNotificationOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(target)) {
        setIsMessagesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n)));
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
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
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
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notifications?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  };

  const markMessageRead = (id: string | number) => {
    setMessages((prev) =>
      prev.map((m) => (String(m.id) === String(id) ? { ...m, isUnread: false } : m))
    );
    const msgObj = messages.find((m) => String(m.id) === String(id));
    if (msgObj) {
      const participantId = msgObj.participantId ? String(msgObj.participantId) : String(msgObj.id);
      if (window.innerWidth < 640) {
        router.push(`/mensajes?id=${participantId}`);
      } else {
        setActivePopupChat({
          userId: participantId,
          name: msgObj.user,
          avatar: msgObj.avatar,
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
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));

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
      "luminus_cached_user_id",
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    if (data?.cognitoLogoutUrl) {
      window.location.href = data.cognitoLogoutUrl;
    } else {
      router.push("/auth/iniciar-sesion");
    }
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="fixed top-0 left-0 w-full bg-white border-b border-slate-200/90 z-[100] h-[64px] px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-stretch gap-8 h-full">
          <Link href="/inicio" className="inline-flex items-center">
            <img src="/logo-luminus-black.svg" alt="Luminus" className="hidden sm:block h-[20px] cursor-pointer" />
            <img src="/iso-logo-black.svg" alt="Luminus" className="sm:hidden h-[24px] cursor-pointer" />
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-stretch gap-1.5 h-full">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`group relative h-full px-4 flex items-center gap-2.5 transition-colors duration-150 font-jakarta text-sm select-none ${
                    isActive
                      ? "font-bold text-slate-900"
                      : "font-medium text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors duration-150 ${
                      isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900"
                    }`}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-[1px] left-2.5 right-2.5 h-[2px] bg-slate-900 rounded-full z-10" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 lg:gap-3 h-full">
          {/* Messages Button & Popup */}
          <div className="relative flex items-center h-full" ref={messagesRef}>
            <button
              onClick={() => {
                const nextOpen = !isMessagesOpen;
                setIsMessagesOpen(nextOpen);
                if (nextOpen) {
                  loadChats();
                }
              }}
              type="button"
              aria-label={`Mensajes: ${unreadMessagesCount} no leídos`}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150 cursor-pointer ${
                isMessagesOpen
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <MessageSquare className="w-5 h-5" strokeWidth={2} />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold font-jakarta leading-none ring-2 ring-white">
                  {unreadMessagesCount}
                </span>
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

          {/* Notifications Button & Popup */}
          <div className="relative flex items-center h-full" ref={notificationRef}>
            <button
              onClick={() => {
                const nextOpen = !isNotificationOpen;
                setIsNotificationOpen(nextOpen);
                if (nextOpen) {
                  loadNotifications();
                }
              }}
              type="button"
              aria-label={`Notificaciones: ${unreadNotificationsCount} no leídas`}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150 cursor-pointer ${
                isNotificationOpen
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Bell className="w-5 h-5" strokeWidth={2} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold font-jakarta leading-none ring-2 ring-white">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            <NotificationPopup
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
              notifications={notifications}
              onMarkRead={markNotificationRead}
              onMarkAllRead={markAllNotificationsRead}
              onDelete={deleteNotification}
              onOpenChat={(userId, name, avatar) => {
                if (window.innerWidth < 640) {
                  router.push(`/mensajes?id=${userId}`);
                } else {
                  setActivePopupChat({ userId, name: name || "", avatar: avatar || "" });
                }
              }}
            />
          </div>

          {/* User Profile Button & Dropdown */}
          <div className="relative flex items-center h-full" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              aria-label="Menú de perfil"
              aria-expanded={isProfileDropdownOpen}
              className={`group flex items-center gap-1.5 lg:gap-2 p-1.5 pr-2 lg:pr-2.5 rounded-xl transition-colors duration-150 cursor-pointer ${
                isProfileDropdownOpen ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <UserAvatar src={profileAvatar} alt={profileName || "Perfil"} size="sm" />
              <span className="hidden lg:block font-jakarta text-sm font-semibold text-slate-900 group-hover:text-slate-700 max-w-[140px] truncate transition-colors">
                {profileName}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform duration-150 shrink-0 ${
                  isProfileDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isProfileDropdownOpen && (
              <div className="fixed left-4 right-4 sm:left-auto top-[70px] sm:absolute sm:right-0 sm:top-[calc(100%+8px)] w-auto sm:w-72 bg-white border border-slate-200/80 rounded-2xl overflow-hidden z-[100] shadow-[0_10px_38px_-10px_rgba(22,23,24,0.08),0_4px_16px_-4px_rgba(22,23,24,0.03)] animate-in fade-in-0 zoom-in-98 duration-150 ease-out origin-top-right">
                {/* User Info Header */}
                <div className="p-3.5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60">
                  <UserAvatar src={profileAvatar} alt={profileName || "Perfil"} size="md" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-jakarta text-sm font-semibold text-slate-900 truncate">
                      {profileName || "Usuario"}
                    </span>
                    {userEmail && (
                      <span className="text-[11px] text-slate-500 font-sans truncate">
                        {userEmail}
                      </span>
                    )}
                  </div>
                </div>

                {/* Navigation links */}
                <div className="p-1.5 flex flex-col gap-0.5">
                  <Link
                    href="/perfil-usuario"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="group w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium font-jakarta text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors shrink-0" strokeWidth={2} />
                    <span>Ver mi perfil</span>
                  </Link>
                  <Link
                    href="/perfil-usuario/configuracion"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="group w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium font-jakarta text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors shrink-0" strokeWidth={2} />
                    <span>Ajustes de cuenta</span>
                  </Link>
                  {userRole === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="group w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium font-jakarta text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors shrink-0" strokeWidth={2} />
                      <span>Administrador</span>
                    </Link>
                  )}
                </div>

                <div className="h-px bg-slate-100 my-1 mx-2" />

                {/* Sign Out */}
                <div className="p-1.5 pt-0">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="group w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium font-jakarta text-rose-600 hover:bg-rose-50/70 transition-colors text-left cursor-pointer border-none bg-transparent"
                  >
                    <LogOut className="w-4 h-4 text-rose-500 group-hover:text-rose-600 transition-colors shrink-0" strokeWidth={2} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Nav - Fixed Bottom */}
      {showMobileNavbar && (
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200/90 z-[100]">
          <div className="max-w-md mx-auto h-[60px] px-4 flex justify-between items-center pb-[env(safe-area-inset-bottom)]">
            {NAV_ITEMS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.path}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors duration-150 select-none ${
                    isActive ? "text-slate-900 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors shrink-0 ${
                      isActive ? "text-slate-900" : "text-slate-400"
                    }`}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                  <span className="text-[10px] font-jakarta leading-none tracking-tight">
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
    </>
  );
}
