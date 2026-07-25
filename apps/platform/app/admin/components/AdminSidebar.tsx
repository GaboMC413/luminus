"use client";

import { AdminTab } from "../types";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  pendingSuggestionsCount: number;
  onSelectCategories?: () => void;
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  pendingSuggestionsCount,
  onSelectCategories,
}: AdminSidebarProps) {
  const items = [
    { id: "usuarios" as AdminTab, label: "Usuarios", icon: "account_circle", onClick: () => setActiveTab("usuarios") },
    { id: "especialistas" as AdminTab, label: "Especialistas", icon: "heart_smile", onClick: () => setActiveTab("especialistas") },
    {
      id: "categorias" as AdminTab,
      label: "Categorías",
      icon: "category",
      badge: pendingSuggestionsCount,
      onClick: () => {
        setActiveTab("categorias");
        if (onSelectCategories) onSelectCategories();
      },
    },
    { id: "emails" as AdminTab, label: "Mails Enviados", icon: "mail", onClick: () => setActiveTab("emails") },
    { id: "logs" as AdminTab, label: "Historial de Acciones", icon: "history", onClick: () => setActiveTab("logs") },
    { id: "busquedas" as AdminTab, label: "Búsquedas de Comunidad", icon: "manage_search", onClick: () => setActiveTab("busquedas") },
    { id: "chats" as AdminTab, label: "Registros de Chats", icon: "chat", onClick: () => setActiveTab("chats") },
    { id: "soporte" as AdminTab, label: "Chats de LUMINUS", icon: "support_agent", onClick: () => setActiveTab("soporte") },
  ];

  return (
    <aside className="w-full lg:w-[72px] lg:h-[calc(100vh-64px)] lg:sticky lg:top-[64px] border-b lg:border-b-0 lg:border-r border-slate-200 bg-white flex flex-col items-center py-4 shrink-0 z-30">
      <nav className="w-full px-3 flex flex-row lg:flex-col items-center justify-center gap-2.5 overflow-x-auto lg:overflow-x-visible">
        {items.map((item) => (
          <div key={item.id} className="relative group flex items-center justify-center">
            <button
              onClick={item.onClick}
              aria-label={item.label}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all border-none outline-none cursor-pointer relative ${activeTab === item.id
                ? "bg-black text-white shadow-sm"
                : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                }`}
            >
              <span className="material-symbols-rounded text-[22px]">{item.icon}</span>
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                  {item.badge}
                </span>
              ) : null}
            </button>

            {/* Hover Tooltip (Shown strictly on hover for desktop view) */}
            <div className="hidden lg:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap items-center gap-2 animate-in fade-in zoom-in-95">
              <span>{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white leading-none">
                  {item.badge}
                </span>
              ) : null}
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900" />
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
