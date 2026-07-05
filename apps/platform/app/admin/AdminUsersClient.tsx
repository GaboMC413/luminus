"use client";

import { useMemo, useState } from "react";

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
}: {
  initialUsers: AdminUser[];
  initialChats: AdminChat[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [chats, setChats] = useState(initialChats);
  const [activeTab, setActiveTab] = useState<"usuarios" | "chats">("usuarios");
  const [selectedChatForModal, setSelectedChatForModal] = useState<AdminChat | null>(null);

  const [selectedId, setSelectedId] = useState(initialUsers[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedUser = users.find((user) => user.id === selectedId) ?? users[0] ?? null;

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
      <aside className="w-full lg:w-[260px] border-b lg:border-b-0 lg:border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="h-16 px-6 border-b border-slate-200 flex items-center gap-3">
          <span className="material-symbols-rounded text-black text-[22px]">admin_panel_settings</span>
          <span className="font-bold text-base tracking-tight font-jakarta">Luminus Admin</span>
        </div>
        <nav className="p-4 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
          <button
            onClick={() => setActiveTab("usuarios")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-none outline-none cursor-pointer ${
              activeTab === "usuarios"
                ? "bg-black text-white"
                : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <span className="material-symbols-rounded text-[20px]">group</span>
            <span>Usuarios</span>
          </button>
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-none outline-none cursor-pointer ${
              activeTab === "chats"
                ? "bg-black text-white"
                : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <span className="material-symbols-rounded text-[20px]">chat</span>
            <span>Registros de Chats</span>
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
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar usuario"
                  className="h-11 w-[280px] rounded-lg border border-slate-200 bg-white px-4 text-[14px] outline-none transition focus:border-slate-400"
                />
              </div>
            </header>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
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
                <aside className="rounded-lg border border-slate-200 bg-white shadow-sm">
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
                      <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                        Rol
                        <select name="role" defaultValue={selectedUser.role} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] font-medium text-slate-900 outline-none bg-white">
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                        Estado
                        <select name="status" defaultValue={selectedUser.status} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] font-medium text-slate-900 outline-none bg-white">
                          <option value="active">active</option>
                          <option value="disabled">disabled</option>
                          <option value="deleted">deleted</option>
                        </select>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                        Nombre
                        <input name="firstName" defaultValue={selectedUser.profile.firstName} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] text-slate-900 outline-none" />
                      </label>
                      <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                        Apellido
                        <input name="lastName" defaultValue={selectedUser.profile.lastName} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] text-slate-900 outline-none" />
                      </label>
                    </div>

                    <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                      Profesion
                      <input name="profession" defaultValue={selectedUser.profile.profession} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] text-slate-900 outline-none" />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                        Ciudad
                        <input name="city" defaultValue={selectedUser.profile.city} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] text-slate-900 outline-none" />
                      </label>
                      <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                        Pais
                        <input name="country" defaultValue={selectedUser.profile.country} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] text-slate-900 outline-none" />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                        Celular
                        <input name="phoneNumber" defaultValue={selectedUser.profile.phoneNumber} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] text-slate-900 outline-none" />
                      </label>
                      <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                        Plan
                        <input name="selectedPlan" defaultValue={selectedUser.profile.selectedPlan} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] text-slate-900 outline-none" />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                        Genero
                        <input name="gender" defaultValue={selectedUser.profile.gender} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] text-slate-900 outline-none" />
                      </label>
                      <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                        Nacimiento
                        <input type="date" name="birthdate" defaultValue={selectedUser.profile.birthdate} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] text-slate-900 outline-none bg-white" />
                      </label>
                    </div>

                    <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                      Intencion
                      <textarea name="intention" defaultValue={selectedUser.profile.intention} rows={2} className="rounded-lg border border-slate-200 px-3 py-2 text-[14px] text-slate-900 outline-none resize-none" />
                    </label>

                    <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                      Bio
                      <textarea name="bio" defaultValue={selectedUser.profile.bio} rows={3} className="rounded-lg border border-slate-200 px-3 py-2 text-[14px] text-slate-900 outline-none resize-none" />
                    </label>

                    <label className="flex items-center gap-2.5 text-[13px] font-semibold text-slate-700 cursor-pointer">
                      <input type="checkbox" name="isOnboarded" defaultChecked={selectedUser.profile.isOnboarded} className="h-4.5 w-4.5 accent-black rounded cursor-pointer" />
                      Onboarding completo
                    </label>

                    <div>
                      <h3 className="mb-2 text-[12px] font-bold uppercase text-slate-500">Intereses</h3>
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
                      </div>
                    </div>

                    {message && <p className={`text-[13px] font-semibold ${message.includes("guardados") ? "text-emerald-600" : "text-red-500"}`}>{message}</p>}

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="h-11 rounded-lg bg-black px-4 text-[14px] font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 border-none cursor-pointer"
                    >
                      {isSaving ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </form>
                </aside>
              )}
            </section>
          </div>
        ) : (
          /* Registros de Chats Tab */
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-bold leading-tight font-jakarta">Registros de Chats</h1>
                <p className="mt-1 text-[14px] text-slate-500">{chats.length} conversaciones registradas</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  value={chatSearch}
                  onChange={(event) => setChatSearch(event.target.value)}
                  placeholder="Buscar por usuario"
                  className="h-11 w-[280px] rounded-lg border border-slate-200 bg-white px-4 text-[14px] outline-none transition focus:border-slate-400"
                />
              </div>
            </header>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-[1.2fr_1.2fr_1.2fr_150px] border-b border-slate-200 bg-slate-50 px-6 py-3.5 text-[12px] font-bold uppercase text-slate-500">
                <span>Usuario Iniciador</span>
                <span>Usuario Contactado</span>
                <span>Fecha de Contacto</span>
                <span className="text-right">Acciones</span>
              </div>
              <div className="max-h-[680px] overflow-y-auto">
                {filteredChats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <span className="material-symbols-rounded text-[48px] mb-3 text-slate-300">chat_bubble_outline</span>
                    <p className="text-sm font-medium">No se encontraron conversaciones.</p>
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      className="grid w-full grid-cols-[1.2fr_1.2fr_1.2fr_150px] items-center border-b border-slate-100 px-6 py-4 text-left text-[14px] transition hover:bg-slate-50/50 bg-white"
                    >
                      {/* User 1 */}
                      <span className="flex min-w-0 items-center gap-3">
                        {chat.user1?.avatarUrl ? (
                          <img src={chat.user1.avatarUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[13px] font-bold text-slate-500 uppercase shrink-0">
                            {(chat.user1?.name || "?").slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-slate-900">{chat.user1?.name || "Desconocido"}</span>
                          <span className="block truncate text-[12px] text-slate-500">{chat.user1?.email || "Sin email"}</span>
                        </span>
                      </span>

                      {/* User 2 */}
                      <span className="flex min-w-0 items-center gap-3">
                        {chat.user2?.avatarUrl ? (
                          <img src={chat.user2.avatarUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[13px] font-bold text-slate-500 uppercase shrink-0">
                            {(chat.user2?.name || "?").slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-slate-900">{chat.user2?.name || "Desconocido"}</span>
                          <span className="block truncate text-[12px] text-slate-500">{chat.user2?.email || "Sin email"}</span>
                        </span>
                      </span>

                      {/* Contact Date */}
                      <span className="text-slate-600 font-medium">
                        {formatDate(chat.updatedAt)}
                      </span>

                      {/* View Chat Action */}
                      <span className="text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedChatForModal(chat)}
                          className="h-9 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border-none cursor-pointer outline-none"
                        >
                          Ver chat
                        </button>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Chat History Modal */}
      {selectedChatForModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-jakarta">Conversación</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Entre <span className="font-semibold">{selectedChatForModal.user1?.name}</span> y <span className="font-semibold">{selectedChatForModal.user2?.name}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedChatForModal(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-900 border-none bg-transparent cursor-pointer flex items-center justify-center outline-none"
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            {/* Message Thread container */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4 min-h-[350px]">
              {selectedChatForModal.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                  <span className="material-symbols-rounded text-[40px] mb-2 text-slate-300">chat_bubble_outline</span>
                  <p className="text-sm font-medium">No hay mensajes en esta conversación.</p>
                </div>
              ) : (
                selectedChatForModal.messages.map((msg) => {
                  const isUser1 = msg.senderId === selectedChatForModal.user1?.id;
                  const senderName = isUser1 ? selectedChatForModal.user1?.name : selectedChatForModal.user2?.name;
                  const avatarUrl = isUser1 ? selectedChatForModal.user1?.avatarUrl : selectedChatForModal.user2?.avatarUrl;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${isUser1 ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt=""
                          className="h-8 w-8 rounded-lg object-cover shrink-0 mt-1 shadow-sm"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs shrink-0 mt-1 uppercase shadow-sm">
                          {(senderName || "?").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className={`p-3.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                          isUser1
                            ? "bg-white text-slate-900 rounded-tl-none border border-slate-100"
                            : "bg-black text-white rounded-tr-none"
                        }`}>
                          {msg.body}
                        </div>
                        <span className={`block text-[10px] text-slate-400 mt-1 font-medium ${isUser1 ? "text-left" : "text-right"}`}>
                          {formatShortTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedChatForModal(null)}
                className="h-10 px-5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition border-none cursor-pointer outline-none"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

