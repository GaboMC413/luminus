"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ContactTab } from "./components/tabs/ContactTab";
import { PostsTab } from "./components/tabs/PostsTab";
import { PostItem } from "@/components/community/mockPostsData";

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
  initialContactMessages = [],
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
  initialContactMessages?: import("./types").AdminContactMessage[];
  initialLoadWarnings?: string[];
}) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [chats] = useState<AdminChat[]>(initialChats);
  const [supportChats, setSupportChats] = useState<AdminChat[]>(initialSupportChats);
  const [logs] = useState<AdminLog[]>(initialLogs);
  const [emailLogs] = useState<AdminEmailLog[]>(initialEmailLogs);
  const [contactMessages] = useState<import("./types").AdminContactMessage[]>(initialContactMessages);
  const [searches] = useState<AdminSearch[]>(initialSearches);
  const [specialists, setSpecialists] = useState<AdminSpecialist[]>(initialSpecialists);
  const [postulations, setPostulations] = useState<AdminPostulation[]>(initialPostulations);
  const [categories, setCategories] = useState<AdminCategory[]>(initialCategories);
  const [suggestions, setSuggestions] = useState<AdminSuggestion[]>(initialSuggestions);
  const [events] = useState<AdminEvent[]>(initialEvents);
  const [inscriptions] = useState<AdminEventInscription[]>(initialInscriptions);
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabFromUrl = (searchParams.get("tab") as AdminTab) || "usuarios";
  const [activeTab, setActiveTabState] = useState<AdminTab>(tabFromUrl);

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTabState(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (newTab: AdminTab) => {
    setActiveTabState(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`/admin?${params.toString()}`, { scroll: false });
  };

  // Shared Specialist subtab state
  const [specialistSubTab, setSpecialistSubTab] = useState<"lista" | "postulaciones">("lista");
  const [selectedSpecialistUserId, setSelectedSpecialistUserId] = useState<string | null>(null);

  // Shared User selection state
  const [, setSelectedId] = useState<string>(initialUsers[0]?.id ?? "");
  const [, setUserSubTab] = useState<"activos" | "cerradas" | "deshabilitados">("activos");

  const pendingSuggestionsCount = useMemo(() => {
    return suggestions.filter((s) => s.status === "pending").length;
  }, [suggestions]);

  // Community Posts state for validation
  const [communityPosts, setCommunityPosts] = useState<PostItem[]>([]);

  const fetchCommunityPosts = async () => {
    try {
      const res = await fetch(`/api/admin/posts?_t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCommunityPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Error loading admin community posts:", err);
    }
  };

  useEffect(() => {
    fetchCommunityPosts();
  }, []);

  const pendingPostsCount = useMemo(() => {
    return communityPosts.filter((p) => p.status === "pending").length;
  }, [communityPosts]);

  const handleValidatePost = async (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, status: "approved" as const } : p
      )
    );
    try {
      await fetch("/api/admin/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId, status: "approved" }),
      });
    } catch (err) {
      console.error("Error validating post:", err);
      fetchCommunityPosts();
    }
  };

  const handleRejectPost = async (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, status: "rejected" as const } : p
      )
    );
    try {
      await fetch("/api/admin/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId, status: "rejected" }),
      });
    } catch (err) {
      console.error("Error rejecting post:", err);
      fetchCommunityPosts();
    }
  };

  const handlePausePost = async (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, status: "pending" as const } : p
      )
    );
    try {
      await fetch("/api/admin/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId, status: "pending" }),
      });
    } catch (err) {
      console.error("Error pausing post:", err);
      fetchCommunityPosts();
    }
  };

  const handleDeletePost = async (postId: string) => {
    setCommunityPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await fetch(`/api/comunidad/posts/${postId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Error deleting post:", err);
      fetchCommunityPosts();
    }
  };

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
          setActiveTab={handleTabChange}
          pendingSuggestionsCount={pendingSuggestionsCount}
          pendingPostsCount={pendingPostsCount}
          onSelectCategories={fetchCategoriesData}
        />

        {/* Main Panel Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "usuarios" && (
            <UsersTab
              users={users}
              specialists={specialists}
              setUsers={setUsers}
              setActiveTab={handleTabChange}
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
              setActiveTab={handleTabChange}
            />
          )}

          {activeTab === "publicaciones" && (
            <PostsTab
              posts={communityPosts}
              setPosts={setCommunityPosts}
              onValidatePost={handleValidatePost}
              onRejectPost={handleRejectPost}
              onPausePost={handlePausePost}
              onDeletePost={handleDeletePost}
            />
          )}

          {activeTab === "eventos" && (
            <EventsTab events={events} inscriptions={inscriptions} />
          )}

          {activeTab === "contacto" && (
            <ContactTab messages={contactMessages} />
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
