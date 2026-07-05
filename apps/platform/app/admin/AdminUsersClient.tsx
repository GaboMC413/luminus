"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";

type AdminUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "active" | "disabled" | "deleted";
  emailVerified: boolean;
  authProvider: string;
  createdAt: string | null;
  lastLoginAt: string | null;
  profile: {
    firstName: string;
    lastName: string;
    fullName: string;
    avatarUrl: string;
    profession: string;
    city: string;
    country: string;
    phoneNumber: string;
    gender: string;
    birthdate: string;
    bio: string;
    intention: string;
    selectedPlan: string;
    isOnboarded: boolean;
  };
  interests: Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
  }>;
};

type AdminChat = {
  id: string;
  createdAt: string | null;
  updatedAt: string | null;
  user1: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string;
  } | null;
  user2: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string;
  } | null;
  lastMessage: {
    body: string;
    createdAt: string | null;
  } | null;
  messagesCount: number;
  messages: Array<{
    id: string;
    body: string;
    senderId: string;
    createdAt: string | null;
  }>;
};

type AdminLog = {
  id: string;
  userId: string;
  action: string;
  details: string | null;
  createdAt: string;
  user: {
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      fullName: string;
      avatarUrl: string;
    };
  };
};

function getPresetStartDate(preset: string) {
  const now = new Date();
  switch (preset) {
    case "week": {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(now.setDate(diff));
      startOfWeek.setHours(0, 0, 0, 0);
      return startOfWeek;
    }
    case "month": {
      return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }
    case "6months": {
      const start = new Date();
      start.setMonth(now.getMonth() - 6);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "year": {
      return new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    }
    case "quarter": {
      const currentMonth = now.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      return new Date(now.getFullYear(), quarterStartMonth, 1, 0, 0, 0, 0);
    }
    default:
      return null;
  }
}

function getActionBadge(action: string) {
  switch (action) {
    case "USER_CREATED":
      return <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">Registro</span>;
    case "LOGIN":
      return <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">Login</span>;
    case "REQUEST_CONNECTION":
      return <span className="rounded-full bg-purple-50 text-purple-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">Solicitó Conexión</span>;
    case "ACCEPT_CONNECTION":
      return <span className="rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">Aceptó Conexión</span>;
    case "FIRST_CONTACT":
      return <span className="rounded-full bg-orange-50 text-orange-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">Primer Contacto</span>;
    case "DELETE_CHAT":
      return <span className="rounded-full bg-rose-50 text-rose-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">Eliminó Chat</span>;
    case "MUTE_USER":
      return <span className="rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">Silenció</span>;
    case "UNMUTE_USER":
      return <span className="rounded-full bg-slate-50 text-slate-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">Reactivó Chat</span>;
    case "BLOCK_USER":
      return <span className="rounded-full bg-red-50 text-red-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">Bloqueó</span>;
    case "UNBLOCK_USER":
      return <span className="rounded-full bg-teal-50 text-teal-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">Desbloqueó</span>;
    case "NETWORK_REJECT":
      return <span className="rounded-full bg-orange-50 text-orange-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">Rechazó Red</span>;
    case "CANCEL_CONNECTION_REQUEST":
      return <span className="rounded-full bg-slate-50 text-slate-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">Canceló Solicitud</span>;
    case "NETWORK_DELETION":
      return <span className="rounded-full bg-red-50 text-red-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">Eliminó Red</span>;
    case "UPDATE_PROFILE":
      return <span className="rounded-full bg-violet-50 text-violet-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">Actualizó Perfil</span>;
    default:
      return <span className="rounded-full bg-slate-50 text-slate-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">{action}</span>;
  }
}

function renderLogDetails(action: string, detailsStr: string | null) {
  if (!detailsStr) return "-";
  try {
    const details = JSON.parse(detailsStr);
    switch (action) {
      case "USER_CREATED":
        return `Registrado con email: ${details.email}${details.provider ? ` (${details.provider})` : ""}`;
      case "LOGIN":
        return `Logueado via credentials/oauth`;
      case "REQUEST_CONNECTION":
        return `Solicitó conexión a ${details.recipientName || details.recipientEmail}`;
      case "ACCEPT_CONNECTION":
        return `Aceptó conexión de ${details.requesterName || details.requesterEmail}`;
      case "FIRST_CONTACT":
        return `Inició chat por primera vez con ${details.recipientName || details.recipientEmail}`;
      case "DELETE_CHAT":
        return `Eliminó el chat con ${details.targetName || details.targetEmail || "un usuario"}`;
      case "MUTE_USER":
        return `Silenció la conversación con ${details.targetName || details.targetEmail || "un usuario"}`;
      case "UNMUTE_USER":
        return `Reactivó la conversación con ${details.targetName || details.targetEmail || "un usuario"}`;
      case "BLOCK_USER":
        return `Bloqueó al usuario ${details.targetName || details.targetEmail || "un usuario"}`;
      case "UNBLOCK_USER":
        return `Desbloqueó al usuario ${details.targetName || details.targetEmail || "un usuario"}`;
      case "NETWORK_REJECT":
        return `Rechazó la solicitud de conexión de ${details.targetName || details.targetEmail || "un usuario"}`;
      case "CANCEL_CONNECTION_REQUEST":
        return `Canceló la solicitud de conexión enviada a ${details.targetName || details.targetEmail || "un usuario"}`;
      case "NETWORK_DELETION":
        return `Eliminó de su red a ${details.targetName || details.targetEmail || "un usuario"}`;
      case "UPDATE_PROFILE":
        return `Actualizó campos de perfil: ${details.updatedFields ? details.updatedFields.join(", ") : "todos"}`;
      default:
        return detailsStr;
    }
  } catch {
    return detailsStr;
  }
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatShortTime(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleTimeString("es-UY", {
    hour: "2-digit",
    minute: "2-digit",
  }) + " - " + d.toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function fieldValue(value: string) {
  return value.trim() || "-";
}

export function AdminUsersClient({
  initialUsers,
  initialChats = [],
  initialSupportChats = [],
  initialLogs = [],
}: {
  initialUsers: AdminUser[];
  initialChats: AdminChat[];
  initialSupportChats: AdminChat[];
  initialLogs: AdminLog[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [chats, setChats] = useState(initialChats);
  const [supportChats, setSupportChats] = useState(initialSupportChats);
  const [logs, setLogs] = useState(initialLogs);
  const [activeTab, setActiveTab] = useState<"usuarios" | "chats" | "logs" | "soporte">("usuarios");
  const [selectedChatId, setSelectedChatId] = useState(initialChats[0]?.id ?? "");
  const selectedChat = chats.find((c) => c.id === selectedChatId) ?? chats[0] ?? null;

  const [selectedSupportChatId, setSelectedSupportChatId] = useState(initialSupportChats[0]?.id ?? "");
  const selectedSupportChat = supportChats.find((c) => c.id === selectedSupportChatId) ?? supportChats[0] ?? null;

  const [selectedId, setSelectedId] = useState(initialUsers[0]?.id ?? "");
  const [selectedRole, setSelectedRole] = useState<string>("USER");
  const [selectedStatus, setSelectedStatus] = useState<string>("active");

  const selectedUser = users.find((user) => user.id === selectedId) ?? users[0] ?? null;

  useEffect(() => {
    if (selectedUser) {
      setSelectedRole(selectedUser.role);
      setSelectedStatus(selectedUser.status);
    }
  }, [selectedUser]);

  const [search, setSearch] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [supportSearch, setSupportSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function sendSupportReply(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedSupportChat || !replyText.trim() || isSendingReply) return;

    setIsSendingReply(true);
    try {
      const response = await fetch(`/api/admin/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: selectedSupportChat.id,
          body: replyText.trim(),
        }),
      });

      if (!response.ok) {
        alert("No se pudo enviar el mensaje.");
        return;
      }

      const data = await response.json();

      setSupportChats((prevSupportChats) => {
        return prevSupportChats.map((chat) => {
          if (chat.id === selectedSupportChat.id) {
            return {
              ...chat,
              updatedAt: new Date().toISOString(),
              messages: [...chat.messages, {
                id: data.message.id,
                body: data.message.body,
                senderId: data.message.sender_id,
                createdAt: data.message.created_at,
              }],
            };
          }
          return chat;
        });
      });
      setReplyText("");
    } catch (err) {
      console.error("Failed to reply to support chat:", err);
    } finally {
      setIsSendingReply(false);
    }
  }

  const filteredSupportChats = useMemo(() => {
    const query = supportSearch.trim().toLowerCase();
    if (!query) return supportChats;

    return supportChats.filter((chat) => {
      const clientUser = chat.user1?.email === "info@luminuslatam.com" ? chat.user2 : chat.user1;
      if (!clientUser) return false;

      const haystack = [
        clientUser.name || "",
        clientUser.email || "",
      ].join(" ").toLowerCase();

      return haystack.includes(query);
    });
  }, [supportSearch, supportChats]);

  // Logs filtering states
  const [logSearch, setLogSearch] = useState("");
  const [logAction, setLogAction] = useState<string>("all");
  const [logDatePreset, setLogDatePreset] = useState<string>("all");
  const [logStartDate, setLogStartDate] = useState("");
  const [logEndDate, setLogEndDate] = useState("");

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Filter by User Search
      if (logSearch.trim()) {
        const query = logSearch.toLowerCase().trim();
        const userName = (log.user.profile.fullName || `${log.user.profile.firstName} ${log.user.profile.lastName}`).toLowerCase();
        const userEmail = log.user.email.toLowerCase();
        if (!userName.includes(query) && !userEmail.includes(query)) {
          return false;
        }
      }

      // 2. Filter by Action
      if (logAction !== "all") {
        if (log.action !== logAction) return false;
      }

      // 3. Filter by Date Range
      const logDate = new Date(log.createdAt);
      if (logDatePreset !== "all") {
        if (logDatePreset === "custom") {
          if (logStartDate) {
            const start = new Date(logStartDate + "T00:00:00");
            if (logDate < start) return false;
          }
          if (logEndDate) {
            const end = new Date(logEndDate + "T23:59:59");
            if (logDate > end) return false;
          }
        } else {
          const start = getPresetStartDate(logDatePreset);
          if (start && logDate < start) return false;
        }
      }

      return true;
    });
  }, [logs, logSearch, logAction, logDatePreset, logStartDate, logEndDate]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) => {
      const haystack = [
        user.email,
        user.profile.firstName,
        user.profile.lastName,
        user.profile.profession,
        user.profile.city,
        user.profile.country,
        user.status,
        user.role,
      ].join(" ").toLowerCase();

      return haystack.includes(query);
    });
  }, [search, users]);

  const filteredChats = useMemo(() => {
    const query = chatSearch.trim().toLowerCase();

    if (!query) return chats;

    return chats.filter((chat) => {
      const haystack = [
        chat.user1?.name || "",
        chat.user1?.email || "",
        chat.user2?.name || "",
        chat.user2?.email || "",
      ].join(" ").toLowerCase();

      return haystack.includes(query);
    });
  }, [chatSearch, chats]);

  async function updateSelectedUser(formData: FormData) {
    if (!selectedUser) return;

    setIsSaving(true);
    setMessage("");

    const payload = {
      id: selectedUser.id,
      role: String(formData.get("role")),
      status: String(formData.get("status")),
      firstName: String(formData.get("firstName") || ""),
      lastName: String(formData.get("lastName") || ""),
      profession: String(formData.get("profession") || ""),
      city: String(formData.get("city") || ""),
      country: String(formData.get("country") || ""),
      phoneNumber: String(formData.get("phoneNumber") || ""),
      gender: String(formData.get("gender") || ""),
      birthdate: String(formData.get("birthdate") || ""),
      selectedPlan: String(formData.get("selectedPlan") || ""),
      intention: String(formData.get("intention") || ""),
      bio: String(formData.get("bio") || ""),
      isOnboarded: formData.get("isOnboarded") === "on",
    };

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(data?.message || "No se pudo guardar el usuario.");
        return;
      }

      setUsers((currentUsers) => currentUsers.map((user) => (user.id === data.user.id ? data.user : user)));
      setMessage("Cambios guardados.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-slate-950 flex flex-col lg:flex-row">
      {/* Navigation Sidebar */}
      <aside className="w-full lg:w-[260px] lg:h-screen lg:sticky lg:top-0 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="h-16 px-6 border-b border-slate-200 flex items-center gap-3">
          <span className="material-symbols-rounded text-black text-[22px]">admin_panel_settings</span>
          <span className="font-bold text-base tracking-tight font-jakarta">Luminus Admin</span>
        </div>
        <nav className="p-4 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
          <button
            onClick={() => setActiveTab("usuarios")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-none outline-none cursor-pointer ${activeTab === "usuarios"
              ? "bg-black text-white"
              : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950"
              }`}
          >
            <span className="material-symbols-rounded text-[20px]">group</span>
            <span>Usuarios</span>
          </button>
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-none outline-none cursor-pointer ${activeTab === "chats"
              ? "bg-black text-white"
              : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950"
              }`}
          >
            <span className="material-symbols-rounded text-[20px]">chat</span>
            <span>Registros de Chats</span>
          </button>
          <button
            onClick={() => setActiveTab("soporte")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-none outline-none cursor-pointer ${activeTab === "soporte"
              ? "bg-black text-white"
              : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950"
              }`}
          >
            <span className="material-symbols-rounded text-[20px]">support_agent</span>
            <span>Chats de LUMINUS</span>
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-none outline-none cursor-pointer ${activeTab === "logs"
              ? "bg-black text-white"
              : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950"
              }`}
          >
            <span className="material-symbols-rounded text-[20px]">receipt_long</span>
            <span>Historial de Acciones</span>
          </button>
        </nav>
      </aside>

      {/* Main Panel Content */}
      <div className="flex-1 min-w-0">
        {activeTab === "usuarios" ? (
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-bold leading-tight font-jakarta">Usuarios</h1>
                <p className="mt-1 text-[14px] text-slate-500">{users.length} registros</p>
              </div>
              <div className="flex items-center gap-3">
                <InputField
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar usuario"
                  className="!w-[280px] !h-11"
                />
              </div>
            </header>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none">
                <div className="grid grid-cols-[minmax(200px,1.4fr)_100px_100px_140px_110px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-bold uppercase text-slate-500">
                  <span>Usuario</span>
                  <span>Rol</span>
                  <span>Estado</span>
                  <span>Ciudad</span>
                  <span>Alta</span>
                </div>
                <div className="max-h-[680px] overflow-y-auto">
                  {filteredUsers.map((user) => {
                    const active = user.id === selectedUser?.id;

                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedId(user.id);
                          setMessage("");
                        }}
                        className={`grid w-full grid-cols-[minmax(200px,1.4fr)_100px_100px_140px_110px] items-center border-b border-slate-100 px-4 py-3.5 text-left text-[14px] transition hover:bg-slate-50 outline-none border-none cursor-pointer ${active ? "bg-slate-100" : "bg-white"}`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          {user.profile.avatarUrl ? (
                            <img src={user.profile.avatarUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
                          ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[13px] font-bold text-slate-500 uppercase">
                              {(user.profile.firstName || user.email).slice(0, 1).toUpperCase()}
                            </span>
                          )}
                          <span className="min-w-0">
                            <span className="block truncate font-semibold">{fieldValue(user.profile.fullName || `${user.profile.firstName} ${user.profile.lastName}`)}</span>
                            <span className="block truncate text-[12px] text-slate-500">{user.email}</span>
                          </span>
                        </span>
                        <span className="font-semibold text-slate-700">{user.role}</span>
                        <span className="font-semibold text-slate-700">{user.status}</span>
                        <span className="truncate text-slate-600">{fieldValue(user.profile.city)}</span>
                        <span className="text-slate-600">{formatDate(user.createdAt)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedUser && (
                <aside className="rounded-lg border border-slate-200 bg-white shadow-none">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <div className="flex items-center gap-3">
                      {selectedUser.profile.avatarUrl ? (
                        <img src={selectedUser.profile.avatarUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-500 uppercase">
                          {(selectedUser.profile.firstName || selectedUser.email).slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h2 className="truncate text-[17px] font-bold leading-tight">{selectedUser.email}</h2>
                        <p className="text-[13px] text-slate-500 mt-1">Ultimo login: {formatDate(selectedUser.lastLoginAt)}</p>
                      </div>
                    </div>
                  </div>

                  <form
                    key={selectedUser.id}
                    onSubmit={(event) => {
                      event.preventDefault();
                      updateSelectedUser(new FormData(event.currentTarget));
                    }}
                    className="flex flex-col gap-4 p-5"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Rol</span>
                        <input type="hidden" name="role" value={selectedRole} />
                        <SelectInput
                          value={selectedRole}
                          options={[
                            { label: "USER", value: "USER" },
                            { label: "ADMIN", value: "ADMIN" }
                          ]}
                          onSelect={(val) => setSelectedRole(val)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Estado</span>
                        <input type="hidden" name="status" value={selectedStatus} />
                        <SelectInput
                          value={selectedStatus}
                          options={[
                            { label: "active", value: "active" },
                            { label: "disabled", value: "disabled" },
                            { label: "deleted", value: "deleted" }
                          ]}
                          onSelect={(val) => setSelectedStatus(val)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Nombre</span>
                        <InputField name="firstName" defaultValue={selectedUser.profile.firstName} className="h-10" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Apellido</span>
                        <InputField name="lastName" defaultValue={selectedUser.profile.lastName} className="h-10" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Profesion</span>
                      <InputField name="profession" defaultValue={selectedUser.profile.profession} className="h-10" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Ciudad</span>
                        <InputField name="city" defaultValue={selectedUser.profile.city} className="h-10" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Pais</span>
                        <InputField name="country" defaultValue={selectedUser.profile.country} className="h-10" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Celular</span>
                        <InputField name="phoneNumber" defaultValue={selectedUser.profile.phoneNumber} className="h-10" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Plan</span>
                        <InputField name="selectedPlan" defaultValue={selectedUser.profile.selectedPlan} className="h-10" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Genero</span>
                        <InputField name="gender" defaultValue={selectedUser.profile.gender} className="h-10" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Nacimiento</span>
                        <InputField type="date" name="birthdate" defaultValue={selectedUser.profile.birthdate} className="h-10" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Intencion</span>
                      <InputField name="intention" defaultValue={selectedUser.profile.intention} className="h-10" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Bio</span>
                      <textarea name="bio" defaultValue={selectedUser.profile.bio} rows={3} className="rounded-lg border border-slate-200 px-3 py-2 text-[14px] text-slate-900 font-medium outline-none resize-none" />
                    </div>

                    <label className="flex items-center gap-2.5 text-[13px] font-semibold text-slate-700 cursor-pointer">
                      <input type="checkbox" name="isOnboarded" defaultChecked={selectedUser.profile.isOnboarded} className="h-4.5 w-4.5 accent-black rounded cursor-pointer" />
                      Onboarding completo
                    </label>

                    <div>
                      <h3 className="mb-2 text-[11px] font-bold uppercase text-slate-500">Intereses</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.interests.length > 0 ? (
                          selectedUser.interests.map((interest) => (
                            <span key={interest.id} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[12px] font-semibold text-slate-700">
                              {interest.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[13px] text-slate-400">Sin intereses</span>
                        )}
                        {selectedUser.profile.intention && (
                          <span className="rounded-full border border-zinc-950 bg-zinc-950 px-3 py-1 text-[12px] font-semibold text-white">
                            {selectedUser.profile.intention}
                          </span>
                        )}
                      </div>
                    </div>

                    {message && <p className={`text-[13px] font-semibold ${message.includes("guardados") ? "text-emerald-600" : "text-red-500"}`}>{message}</p>}

                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="!h-11 !w-full"
                    >
                      {isSaving ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </form>
                </aside>
              )}
            </section>
          </div>
        ) : activeTab === "chats" ? (
          /* Registros de Chats Tab */
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-bold leading-tight font-jakarta">Registros de Chats</h1>
                <p className="mt-1 text-[14px] text-slate-500">{chats.length} conversaciones registradas</p>
              </div>
              <div className="flex items-center gap-3">
                <InputField
                  value={chatSearch}
                  onChange={(event) => setChatSearch(event.target.value)}
                  placeholder="Buscar por usuario"
                  className="!w-[280px] !h-11"
                />
              </div>
            </header>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              {/* Left Column: list of chats */}
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none">
                <div className="grid grid-cols-[1fr_1fr_120px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-bold uppercase text-slate-500">
                  <span>Usuario Iniciador</span>
                  <span>Usuario Contactado</span>
                  <span>Fecha</span>
                </div>
                <div className="max-h-[680px] overflow-y-auto">
                  {filteredChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                      <span className="material-symbols-rounded text-[48px] mb-3 text-slate-300">chat_bubble_outline</span>
                      <p className="text-sm font-medium">No se encontraron conversaciones.</p>
                    </div>
                  ) : (
                    filteredChats.map((chat) => {
                      const active = chat.id === selectedChat?.id;

                      return (
                        <button
                          key={chat.id}
                          type="button"
                          onClick={() => setSelectedChatId(chat.id)}
                          className={`grid w-full grid-cols-[1fr_1fr_120px] items-center border-b border-slate-100 px-4 py-3.5 text-left text-[14px] transition hover:bg-slate-50 outline-none border-none cursor-pointer ${active ? "bg-slate-100" : "bg-white"}`}
                        >
                          {/* User 1 */}
                          <span className="flex min-w-0 items-center gap-3 pr-2">
                            {chat.user1?.avatarUrl ? (
                              <img src={chat.user1.avatarUrl} alt="" className="h-8 w-8 rounded-lg object-cover shrink-0" />
                            ) : (
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[12px] font-bold text-slate-500 uppercase shrink-0">
                                {(chat.user1?.name || "?").slice(0, 1).toUpperCase()}
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block truncate font-semibold text-slate-900">{chat.user1?.name || "Desconocido"}</span>
                              <span className="block truncate text-[11px] text-slate-500">{chat.user1?.email || "Sin email"}</span>
                            </span>
                          </span>

                          {/* User 2 */}
                          <span className="flex min-w-0 items-center gap-3 pr-2">
                            {chat.user2?.avatarUrl ? (
                              <img src={chat.user2.avatarUrl} alt="" className="h-8 w-8 rounded-lg object-cover shrink-0" />
                            ) : (
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[12px] font-bold text-slate-500 uppercase shrink-0">
                                {(chat.user2?.name || "?").slice(0, 1).toUpperCase()}
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block truncate font-semibold text-slate-900">{chat.user2?.name || "Desconocido"}</span>
                              <span className="block truncate text-[11px] text-slate-500">{chat.user2?.email || "Sin email"}</span>
                            </span>
                          </span>

                          {/* Contact Date */}
                          <span className="text-slate-600 text-xs truncate">
                            {formatDate(chat.updatedAt)}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: selected chat messages thread */}
              {selectedChat ? (
                <aside className="rounded-lg border border-slate-200 bg-white flex flex-col h-[740px] overflow-hidden shadow-none">
                  {/* Header */}
                  <div className="border-b border-slate-200 px-5 py-4 shrink-0">
                    <h2 className="text-base font-bold text-slate-900 font-jakarta">Conversación</h2>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      Entre <span className="font-semibold">{selectedChat.user1?.name}</span> y <span className="font-semibold">{selectedChat.user2?.name}</span>
                    </p>
                  </div>

                  {/* Message Thread */}
                  <div className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-4 custom-scrollbar">
                    {selectedChat.messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                        <span className="material-symbols-rounded text-[40px] mb-2 text-slate-300">chat_bubble_outline</span>
                        <p className="text-sm font-medium">No hay mensajes en esta conversación.</p>
                      </div>
                    ) : (
                      selectedChat.messages.map((msg, index) => {
                        const isUser1 = msg.senderId === selectedChat.user1?.id;
                        const senderName = isUser1 ? selectedChat.user1?.name : selectedChat.user2?.name;
                        const avatarUrl = isUser1 ? selectedChat.user1?.avatarUrl : selectedChat.user2?.avatarUrl;

                        const isFirst = index === 0 || selectedChat.messages[index - 1].senderId !== msg.senderId;
                        const isLast = index === selectedChat.messages.length - 1 || selectedChat.messages[index + 1].senderId !== msg.senderId;

                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-3 max-w-[85%] ${isUser1 ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                          >
                            {isFirst ? (
                              avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt=""
                                  className="h-8 w-8 rounded-lg object-cover shrink-0 mt-1"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-lg bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs shrink-0 mt-1 uppercase">
                                  {(senderName || "?").slice(0, 1).toUpperCase()}
                                </div>
                              )
                            ) : (
                              <div className="h-8 w-8 shrink-0" />
                            )}
                            <div>
                              <div className={`p-3 rounded-xl text-[13px] leading-relaxed ${isUser1
                                ? "bg-white text-slate-900 rounded-tl-none border border-slate-100"
                                : "bg-black text-white rounded-tr-none"
                                }`}>
                                {msg.body}
                              </div>
                              {isLast && (
                                <span className={`block text-[9px] text-slate-400 mt-1 font-medium ${isUser1 ? "text-left" : "text-right"}`}>
                                  {formatShortTime(msg.createdAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </aside>
              ) : (
                <div className="rounded-lg border border-slate-200 border-dashed bg-slate-50 flex items-center justify-center text-slate-400 p-8 text-center h-[740px] shadow-none">
                  <p className="text-sm font-medium">Selecciona una conversación para ver los detalles.</p>
                </div>
              )}
            </section>
          </div>
        ) : activeTab === "soporte" ? (
          /* Support Chats Tab */
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8 animate-in fade-in duration-200">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-bold leading-tight font-jakarta">Soporte (Luminus)</h1>
                <p className="mt-1 text-[14px] text-slate-500">{supportChats.length} conversaciones de soporte</p>
              </div>
              <div className="flex items-center gap-3">
                <InputField
                  value={supportSearch}
                  onChange={(event) => setSupportSearch(event.target.value)}
                  placeholder="Buscar usuario"
                  className="!w-[280px] !h-11"
                />
              </div>
            </header>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              {/* Left Column: list of support chats */}
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none">
                <div className="grid grid-cols-[1fr_120px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-bold uppercase text-slate-500">
                  <span>Usuario</span>
                  <span>Última Actividad</span>
                </div>
                <div className="max-h-[680px] overflow-y-auto">
                  {filteredSupportChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                      <span className="material-symbols-rounded text-[48px] mb-3 text-slate-300">support_agent</span>
                      <p className="text-sm font-medium">No se encontraron conversaciones de soporte.</p>
                    </div>
                  ) : (
                    filteredSupportChats.map((chat) => {
                      const active = chat.id === selectedSupportChat?.id;
                      const clientUser = chat.user1?.email === "info@luminuslatam.com" ? chat.user2 : chat.user1;

                      return (
                        <button
                          key={chat.id}
                          type="button"
                          onClick={() => setSelectedSupportChatId(chat.id)}
                          className={`grid w-full grid-cols-[1fr_120px] items-center border-b border-slate-100 px-4 py-3.5 text-left text-[14px] transition hover:bg-slate-50 outline-none border-none cursor-pointer ${active ? "bg-slate-100" : "bg-white"}`}
                        >
                          {/* Client User Info */}
                          <span className="flex min-w-0 items-center gap-3 pr-2">
                            {clientUser?.avatarUrl ? (
                              <img src={clientUser.avatarUrl} alt="" className="h-8 w-8 rounded-lg object-cover shrink-0" />
                            ) : (
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[12px] font-bold text-slate-500 uppercase shrink-0">
                                {(clientUser?.name || "?").slice(0, 1).toUpperCase()}
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block truncate font-semibold text-slate-900">{clientUser?.name || "Desconocido"}</span>
                              <span className="block truncate text-[11px] text-slate-500">{clientUser?.email || "Sin email"}</span>
                            </span>
                          </span>

                          {/* Contact Date */}
                          <span className="text-slate-600 text-xs truncate">
                            {formatDate(chat.updatedAt)}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: messages and reply form */}
              {selectedSupportChat ? (
                <aside className="rounded-lg border border-slate-200 bg-white flex flex-col h-[740px] overflow-hidden shadow-none">
                  {/* Header */}
                  <div className="border-b border-slate-200 px-5 py-4 shrink-0">
                    <h2 className="text-base font-bold text-slate-900 font-jakarta">Conversación con Soporte</h2>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      Usuario: <span className="font-semibold">{selectedSupportChat.user1?.email === "info@luminuslatam.com" ? selectedSupportChat.user2?.name : selectedSupportChat.user1?.name}</span>
                    </p>
                  </div>

                  {/* Message Thread */}
                  <div className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-4 custom-scrollbar">
                    {selectedSupportChat.messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                        <span className="material-symbols-rounded text-[40px] mb-2 text-slate-300">chat_bubble_outline</span>
                        <p className="text-sm font-medium">No hay mensajes en esta conversación.</p>
                      </div>
                    ) : (
                      selectedSupportChat.messages.map((msg, index) => {
                        const isSystem = msg.senderId === (selectedSupportChat.user1?.email === "info@luminuslatam.com" ? selectedSupportChat.user1?.id : selectedSupportChat.user2?.id);
                        const senderName = isSystem ? "LUMINUS" : (selectedSupportChat.user1?.email === "info@luminuslatam.com" ? selectedSupportChat.user2?.name : selectedSupportChat.user1?.name);
                        const avatarUrl = isSystem ? "/Profile Image LUMINUS.png" : (selectedSupportChat.user1?.email === "info@luminuslatam.com" ? selectedSupportChat.user2?.avatarUrl : selectedSupportChat.user1?.avatarUrl);

                        const isFirst = index === 0 || selectedSupportChat.messages[index - 1].senderId !== msg.senderId;
                        const isLast = index === selectedSupportChat.messages.length - 1 || selectedSupportChat.messages[index + 1].senderId !== msg.senderId;

                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-3 max-w-[85%] ${isSystem ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                          >
                            {isFirst ? (
                              avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt=""
                                  className="h-8 w-8 rounded-lg object-cover shrink-0 mt-1"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-lg bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs shrink-0 mt-1 uppercase">
                                  {(senderName || "?").slice(0, 1).toUpperCase()}
                                </div>
                              )
                            ) : (
                              <div className="h-8 w-8 shrink-0" />
                            )}
                            <div>
                              <div className={`p-3 rounded-xl text-[13px] leading-relaxed ${isSystem
                                ? "bg-black text-white rounded-tr-none"
                                : "bg-white text-slate-900 rounded-tl-none border border-slate-100"
                                }`}>
                                {msg.body}
                              </div>
                              {isLast && (
                                <span className={`block text-[9px] text-slate-400 mt-1 font-medium ${isSystem ? "text-right" : "text-left"}`}>
                                  {formatShortTime(msg.createdAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message Input Box */}
                  <form onSubmit={sendSupportReply} className="border-t border-slate-200 p-4 bg-white flex gap-3 items-center shrink-0">
                    <InputField
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escribe tu respuesta como LUMINUS..."
                      disabled={isSendingReply}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={isSendingReply || !replyText.trim()}
                      className="!w-fit !h-10 px-5 shrink-0"
                    >
                      {isSendingReply ? "Enviando..." : "Responder"}
                    </Button>
                  </form>
                </aside>
              ) : (
                <div className="rounded-lg border border-slate-200 border-dashed bg-slate-50 flex items-center justify-center text-slate-400 p-8 text-center h-[740px] shadow-none">
                  <p className="text-sm font-medium">Selecciona una conversación de soporte para responder.</p>
                </div>
              )}
            </section>
          </div>
        ) : (
          /* Registros de Actividad Log Tab */
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8 animate-in fade-in duration-200">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-bold leading-tight font-jakarta">Historial de Acciones</h1>
                <p className="mt-1 text-[14px] text-slate-500">{filteredLogs.length} acciones filtradas</p>
              </div>
            </header>

            {/* Filter controls row */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-wrap gap-4 items-end shadow-none">
              {/* User search */}
              <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
                <span className="text-[11px] font-bold uppercase text-slate-400">Usuario</span>
                <InputField
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Buscar por nombre o email"
                  className="!h-10"
                />
              </div>

              {/* Action type */}
              <div className="flex flex-col gap-1.5 min-w-[180px]">
                <span className="text-[11px] font-bold uppercase text-slate-400">Acción</span>
                <SelectInput
                  value={logAction}
                  options={[
                    { label: "Todas las acciones", value: "all" },
                    { label: "Registro", value: "USER_CREATED" },
                    { label: "Login", value: "LOGIN" },
                    { label: "Solicitó Conexión", value: "REQUEST_CONNECTION" },
                    { label: "Aceptó Conexión", value: "ACCEPT_CONNECTION" },
                    { label: "Primer Contacto", value: "FIRST_CONTACT" },
                    { label: "Eliminó Chat", value: "DELETE_CHAT" },
                    { label: "Silenció", value: "MUTE_USER" },
                    { label: "Reactivó Chat", value: "UNMUTE_USER" },
                    { label: "Bloqueó", value: "BLOCK_USER" },
                    { label: "Desbloqueó", value: "UNBLOCK_USER" },
                    { label: "Rechazó Red", value: "NETWORK_REJECT" },
                    { label: "Canceló Solicitud", value: "CANCEL_CONNECTION_REQUEST" },
                    { label: "Eliminó Red", value: "NETWORK_DELETION" },
                    { label: "Actualizó Perfil", value: "UPDATE_PROFILE" },
                  ]}
                  onSelect={(val) => setLogAction(val)}
                />
              </div>

              {/* Date Presets */}
              <div className="flex flex-col gap-1.5 min-w-[180px]">
                <span className="text-[11px] font-bold uppercase text-slate-400">Tiempo</span>
                <SelectInput
                  value={logDatePreset}
                  options={[
                    { label: "Todo el tiempo", value: "all" },
                    { label: "Esta semana", value: "week" },
                    { label: "Este mes", value: "month" },
                    { label: "Últimos 6 meses", value: "6months" },
                    { label: "Este año", value: "year" },
                    { label: "Trimestre actual", value: "quarter" },
                    { label: "Fechas fijas", value: "custom" },
                  ]}
                  onSelect={(val) => setLogDatePreset(val)}
                />
              </div>

              {/* Custom Range start */}
              {logDatePreset === "custom" && (
                <>
                  <div className="flex flex-col gap-1.5 w-[140px]">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Desde</span>
                    <InputField
                      type="date"
                      value={logStartDate}
                      onChange={(e) => setLogStartDate(e.target.value)}
                      className="!h-10"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 w-[140px]">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Hasta</span>
                    <InputField
                      type="date"
                      value={logEndDate}
                      onChange={(e) => setLogEndDate(e.target.value)}
                      className="!h-10"
                    />
                  </div>
                </>
              )}

              {/* Reset button */}
              <Button
                type="button"
                variant="small"
                onClick={() => {
                  setLogSearch("");
                  setLogAction("all");
                  setLogDatePreset("all");
                  setLogStartDate("");
                  setLogEndDate("");
                }}
                className="!h-10 shrink-0"
              >
                Limpiar filtros
              </Button>
            </div>

            {/* Table */}
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none">
              <div className="grid grid-cols-[1.5fr_1.2fr_2fr_180px] border-b border-slate-200 bg-slate-50 px-6 py-3.5 text-[12px] font-bold uppercase text-slate-500">
                <span>Usuario</span>
                <span>Acción</span>
                <span>Detalles</span>
                <span>Fecha y Hora</span>
              </div>
              <div className="max-h-[680px] overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <span className="material-symbols-rounded text-[48px] mb-3 text-slate-300">receipt_long</span>
                    <p className="text-sm font-medium">No se encontraron registros de acciones.</p>
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="grid w-full grid-cols-[1.5fr_1.2fr_2fr_180px] items-center border-b border-slate-100 px-6 py-4 text-left text-[14px] transition hover:bg-slate-50/50 bg-white"
                    >
                      {/* User */}
                      <span className="flex min-w-0 items-center gap-3">
                        {log.user.profile.avatarUrl ? (
                          <img src={log.user.profile.avatarUrl} alt="" className="h-9 w-9 rounded-lg object-cover shrink-0" />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[13px] font-bold text-slate-500 uppercase shrink-0">
                            {(log.user.profile.fullName || log.user.email).slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-slate-900">
                            {fieldValue(log.user.profile.fullName || `${log.user.profile.firstName} ${log.user.profile.lastName}`)}
                          </span>
                          <span className="block truncate text-[12px] text-slate-500">{log.user.email}</span>
                        </span>
                      </span>

                      {/* Action */}
                      <span>{getActionBadge(log.action)}</span>

                      {/* Details */}
                      <span className="text-slate-600 font-medium truncate pr-4" title={renderLogDetails(log.action, log.details)}>
                        {renderLogDetails(log.action, log.details)}
                      </span>

                      {/* Date */}
                      <span className="text-slate-500 font-sans text-xs">
                        {formatShortTime(log.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

