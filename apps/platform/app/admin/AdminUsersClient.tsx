"use client";

import { useMemo, useState } from "react";
import {
  AdminUser,
  AdminChat,
  AdminLog,
  AdminEmailLog,
  AdminSearch,
  AdminSpecialist,
  AdminPostulation,
  AdminCategory,
  AdminSuggestion,
  AdminEvent,
  AdminEventInscription,
  AdminTab,
} from "./types";
import { AdminHeader } from "./components/AdminHeader";
import { AdminSidebar } from "./components/AdminSidebar";
import { UsersTab } from "./components/tabs/UsersTab";
import { ChatsTab } from "./components/tabs/ChatsTab";
import { SupportChatsTab } from "./components/tabs/SupportChatsTab";
import { LogsTab } from "./components/tabs/LogsTab";
import { SearchesTab } from "./components/tabs/SearchesTab";
import { SpecialistsTab } from "./components/tabs/SpecialistsTab";
import { EmailLogsTab } from "./components/tabs/EmailLogsTab";
import { CategoriesTab } from "./components/tabs/CategoriesTab";
import { EventsTab } from "./components/tabs/EventsTab";

export function AdminUsersClient({
  initialUsers,
  initialChats = [],
  initialSupportChats = [],
  initialLogs = [],
  initialEmailLogs = [],
  initialSearches = [],
  initialSpecialists = [],
  initialPostulations = [],
  initialCategories = [],
  initialSuggestions = [],
  initialEvents = [],
  initialInscriptions = [],
  initialLoadWarnings = [],
}: {
  initialUsers: AdminUser[];
  initialChats: AdminChat[];
  initialSupportChats: AdminChat[];
  initialLogs: AdminLog[];
  initialEmailLogs: AdminEmailLog[];
  initialSearches: AdminSearch[];
  initialSpecialists: AdminSpecialist[];
  initialPostulations: AdminPostulation[];
  initialCategories?: AdminCategory[];
  initialSuggestions?: AdminSuggestion[];
  initialEvents?: AdminEvent[];
  initialInscriptions?: AdminEventInscription[];
  initialLoadWarnings?: string[];
}) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [chats] = useState<AdminChat[]>(initialChats);
  const [supportChats, setSupportChats] = useState<AdminChat[]>(initialSupportChats);
  const [logs] = useState<AdminLog[]>(initialLogs);
  const [emailLogs] = useState<AdminEmailLog[]>(initialEmailLogs);
  const [searches] = useState<AdminSearch[]>(initialSearches);
  const [specialists, setSpecialists] = useState<AdminSpecialist[]>(initialSpecialists);
  const [postulations, setPostulations] = useState<AdminPostulation[]>(initialPostulations);
  const [categories, setCategories] = useState<AdminCategory[]>(initialCategories);
  const [suggestions, setSuggestions] = useState<AdminSuggestion[]>(initialSuggestions);
  const [events] = useState<AdminEvent[]>(initialEvents);
  const [inscriptions] = useState<AdminEventInscription[]>(initialInscriptions);
  const [activeTab, setActiveTab] = useState<AdminTab>("usuarios");

  // Shared Specialist subtab state
  const [specialistSubTab, setSpecialistSubTab] = useState<"lista" | "postulaciones">("lista");
  const [selectedSpecialistUserId, setSelectedSpecialistUserId] = useState<string | null>(null);

  // Shared User selection state
  const [, setSelectedId] = useState<string>(initialUsers[0]?.id ?? "");
  const [, setUserSubTab] = useState<"activos" | "cerradas" | "deshabilitados">("activos");

  const pendingSuggestionsCount = useMemo(() => {
    return suggestions.filter((s) => s.status === "pending").length;
  }, [suggestions]);

  async function fetchCategoriesData() {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        if (data.categories) setCategories(data.categories);
        if (data.suggestions) setSuggestions(data.suggestions);
      }
    } catch (e) {
      console.error("Failed to fetch categories data:", e);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-950 flex flex-col">
      {/* Top Header Bar */}
      <AdminHeader />

      {initialLoadWarnings.length > 0 && (
        <div className="border-b border-amber-300 bg-amber-50 px-6 py-3 text-sm text-amber-900">
          El administrador abrió parcialmente. No se pudieron cargar estas secciones: {initialLoadWarnings.join(", ")}.
          El detalle técnico quedó registrado para revisión.
        </div>
      )}

      {/* Main Workspace (Vertical Nav + Active Tab Content) */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        {/* Navigation Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingSuggestionsCount={pendingSuggestionsCount}
          onSelectCategories={fetchCategoriesData}
        />

        {/* Main Panel Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "usuarios" && (
            <UsersTab
              users={users}
              specialists={specialists}
              setUsers={setUsers}
              setActiveTab={setActiveTab}
              setSelectedSpecialistUserId={setSelectedSpecialistUserId}
              setSpecialistSubTab={setSpecialistSubTab}
            />
          )}

          {activeTab === "chats" && <ChatsTab chats={chats} />}

          {activeTab === "soporte" && (
            <SupportChatsTab supportChats={supportChats} setSupportChats={setSupportChats} />
          )}

          {activeTab === "logs" && <LogsTab logs={logs} />}

          {activeTab === "busquedas" && <SearchesTab searches={searches} />}

          {activeTab === "especialistas" && (
            <SpecialistsTab
              specialists={specialists}
              postulations={postulations}
              users={users}
              setSpecialists={setSpecialists}
              setPostulations={setPostulations}
              specialistSubTab={specialistSubTab}
              setSpecialistSubTab={setSpecialistSubTab}
              selectedSpecialistUserId={selectedSpecialistUserId}
              setSelectedSpecialistUserId={setSelectedSpecialistUserId}
              setSelectedId={setSelectedId}
              setUserSubTab={setUserSubTab}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "eventos" && (
            <EventsTab events={events} inscriptions={inscriptions} />
          )}

          {activeTab === "emails" && <EmailLogsTab emailLogs={emailLogs} />}

          {activeTab === "categorias" && (
            <CategoriesTab
              categories={categories}
              suggestions={suggestions}
              setCategories={setCategories}
              setSuggestions={setSuggestions}
              fetchCategoriesData={fetchCategoriesData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
