"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { NotificationPopup } from "./NotificationPopup";
import { MessagesPopup } from "./MessagesPopup";

const NAV_ITEMS = [
  { id: "community", label: "Comunidad", path: "/community", icon: "/Icons/NavBar/comunity inactive.svg", activeIcon: "/Icons/NavBar/community active.svg" },
  { id: "experts", label: "Expertos", path: "/experts", icon: "/Icons/NavBar/expert inactive.svg", activeIcon: "/Icons/NavBar/expert active.svg" },
  { id: "espacios", label: "Espacios", path: "/espacios", icon: "/Icons/NavBar/espacios inactive.svg", activeIcon: "/Icons/NavBar/espacios active.svg" },
  { id: "map", label: "Mapa", path: "/map", icon: "/Icons/NavBar/map inactive.svg", activeIcon: "/Icons/NavBar/map active.svg" },
  { id: "faro", label: "Faro", path: "/faro", icon: "/Icons/NavBar/faro inactive.svg", activeIcon: "/Icons/NavBar/faro active.svg" },
];

const INITIAL_NOTIFICATIONS: any[] = [];
const INITIAL_MESSAGES: any[] = [];

export function PlatformNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Real-time local storage user profile sync
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

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
  }, []);

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname.includes("/community")) return "community";
    if (pathname.includes("/experts")) return "experts";
    if (pathname.includes("/espacios")) return "espacios";
    if (pathname.includes("/map")) return "map";
    if (pathname.includes("/faro")) return "faro";
    if (pathname.includes("/user-profile")) return "user-profile";
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

  const markNotificationRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: false } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  const markMessageRead = (id: number) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isUnread: false } : m));
  };

  const markAllMessagesRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, isUnread: false })));
  };

  const handleSignOut = () => {
    localStorage.removeItem("luminus_logged_in");
    localStorage.removeItem("luminus_user_email");
    router.push("/auth/signin");
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="fixed top-0 left-0 w-full bg-white border-b border-slate-200 z-50 h-[64px] md:h-[80px] px-6 md:px-8 flex items-center justify-between shadow-premium">
        <div className="flex items-center gap-8">
          <Link href="/">
            <img src="/logo-luminus-black.svg" alt="Luminus" className="h-[20px] cursor-pointer invert brightness-0" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`group h-[48px] px-3 md:px-[12px] rounded-xl flex items-center gap-2.5 transition-colors duration-200 ${isActive
                    ? "text-black bg-slate-50/50"
                    : "text-slate-400 hover:text-black"
                    }`}
                >
                  <div className="relative w-[18px] h-[18px] md:w-[24px] md:h-[24px] shrink-0">
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

        <div className="flex items-center gap-2 md:gap-4">
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
              <span className={isMessagesOpen ? "material-symbols-filled text-[22px]" : "material-symbols-outlined text-[22px]"}>
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
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              type="button"
              aria-label={`Notifications: ${unreadNotificationsCount} unread`}
              className={`relative flex h-12 w-12 items-center justify-center rounded-xl transition ${isNotificationOpen
                ? "bg-slate-100 text-black"
                : "bg-auto text-slate-400 hover:bg-slate-100 hover:text-black"
                }`}
            >
              <span className={isNotificationOpen ? "material-symbols-filled text-[22px]" : "material-symbols-outlined text-[22px]"}>
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
              className={`group flex items-center gap-2.5 p-1 md:pr-2 rounded-xl transition-all ${isProfileDropdownOpen ? "bg-slate-50" : "hover:bg-slate-50"}`}
            >
              {profileAvatar ? (
                <img
                  src={profileAvatar}
                  alt="Perfil"
                  className="w-8 h-8 md:w-9 md:h-9 rounded-[8px] object-cover"
                />
              ) : (
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-[8px] bg-slate-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
                </div>
              )}
              <span className={`hidden md:block text-[14px] font-semibold ${isProfileDropdownOpen ? "text-black" : "text-slate-400 group-hover:text-black"}`}>
                {profileName}
              </span>
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl overflow-hidden z-[100] shadow-xl animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <Link
                  href="/user-profile"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-[14px] hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-black">person</span>
                  <span className="font-semibold text-slate-400 group-hover:text-black">Ver mi perfil</span>
                </Link>
                <Link
                  href="/user-profile/settings"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-[14px] hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-black">settings</span>
                  <span className="font-semibold text-slate-400 group-hover:text-black">Ajustes de cuenta</span>
                </Link>
                <div className="h-[1px] bg-slate-100 w-full"></div>
                <button
                  onClick={handleSignOut}
                  className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-[14px] hover:bg-[#FF4B4B]/10 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-[#FF4B4B]">logout</span>
                  <span className="font-semibold text-slate-400 group-hover:text-[#FF4B4B]">Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Nav - Fixed Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-50">
        <div className="h-[64px] px-6 flex justify-between items-center pb-[env(safe-area-inset-bottom)]">
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
