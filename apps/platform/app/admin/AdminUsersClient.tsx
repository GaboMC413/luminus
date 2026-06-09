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

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function fieldValue(value: string) {
  return value.trim() || "-";
}

export function AdminUsersClient({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [selectedId, setSelectedId] = useState(initialUsers[0]?.id ?? "");
  const [search, setSearch] = useState("");
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
    <main className="min-h-screen bg-[#F5F7FA] text-slate-950">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold leading-tight">Usuarios</h1>
            <p className="mt-1 text-[14px] text-slate-500">{users.length} registros</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar"
              className="h-11 w-[280px] rounded-lg border border-slate-200 bg-white px-4 text-[14px] outline-none transition focus:border-slate-400"
            />
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="grid grid-cols-[minmax(220px,1.4fr)_130px_120px_160px_120px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-bold uppercase text-slate-500">
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
                    className={`grid w-full grid-cols-[minmax(220px,1.4fr)_130px_120px_160px_120px] items-center border-b border-slate-100 px-4 py-3 text-left text-[14px] transition hover:bg-slate-50 ${active ? "bg-slate-100" : "bg-white"}`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      {user.profile.avatarUrl ? (
                        <img src={user.profile.avatarUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[13px] font-bold text-slate-500">
                          {(user.profile.firstName || user.email).slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{fieldValue(user.profile.fullName || `${user.profile.firstName} ${user.profile.lastName}`)}</span>
                        <span className="block truncate text-[12px] text-slate-500">{user.email}</span>
                      </span>
                    </span>
                    <span className="font-semibold">{user.role}</span>
                    <span className="font-semibold">{user.status}</span>
                    <span className="truncate text-slate-600">{fieldValue(user.profile.city)}</span>
                    <span className="text-slate-600">{formatDate(user.createdAt)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedUser && (
            <aside className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  {selectedUser.profile.avatarUrl ? (
                    <img src={selectedUser.profile.avatarUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-500">
                      {(selectedUser.profile.firstName || selectedUser.email).slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate text-[17px] font-bold">{selectedUser.email}</h2>
                    <p className="text-[13px] text-slate-500">Ultimo login: {formatDate(selectedUser.lastLoginAt)}</p>
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
                    <select name="role" defaultValue={selectedUser.role} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] font-medium text-slate-900">
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                    Estado
                    <select name="status" defaultValue={selectedUser.status} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] font-medium text-slate-900">
                      <option value="active">active</option>
                      <option value="disabled">disabled</option>
                      <option value="deleted">deleted</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                    Nombre
                    <input name="firstName" defaultValue={selectedUser.profile.firstName} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] text-slate-900" />
                  </label>
                  <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                    Apellido
                    <input name="lastName" defaultValue={selectedUser.profile.lastName} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] text-slate-900" />
                  </label>
                </div>

                <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                  Profesion
                  <input name="profession" defaultValue={selectedUser.profile.profession} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] text-slate-900" />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                    Ciudad
                    <input name="city" defaultValue={selectedUser.profile.city} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] text-slate-900" />
                  </label>
                  <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                    Pais
                    <input name="country" defaultValue={selectedUser.profile.country} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] text-slate-900" />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                    Celular
                    <input name="phoneNumber" defaultValue={selectedUser.profile.phoneNumber} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] text-slate-900" />
                  </label>
                  <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                    Plan
                    <input name="selectedPlan" defaultValue={selectedUser.profile.selectedPlan} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] text-slate-900" />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                    Genero
                    <input name="gender" defaultValue={selectedUser.profile.gender} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] text-slate-900" />
                  </label>
                  <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                    Nacimiento
                    <input type="date" name="birthdate" defaultValue={selectedUser.profile.birthdate} className="h-10 rounded-lg border border-slate-200 px-3 text-[14px] text-slate-900" />
                  </label>
                </div>

                <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                  Intencion
                  <textarea name="intention" defaultValue={selectedUser.profile.intention} rows={2} className="rounded-lg border border-slate-200 px-3 py-2 text-[14px] text-slate-900" />
                </label>

                <label className="flex flex-col gap-1 text-[12px] font-bold uppercase text-slate-500">
                  Bio
                  <textarea name="bio" defaultValue={selectedUser.profile.bio} rows={3} className="rounded-lg border border-slate-200 px-3 py-2 text-[14px] text-slate-900" />
                </label>

                <label className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                  <input type="checkbox" name="isOnboarded" defaultChecked={selectedUser.profile.isOnboarded} className="h-4 w-4" />
                  Onboarding completo
                </label>

                <div>
                  <h3 className="mb-2 text-[12px] font-bold uppercase text-slate-500">Intereses</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.interests.length > 0 ? (
                      selectedUser.interests.map((interest) => (
                        <span key={interest.id} className="rounded-full border border-slate-200 px-3 py-1 text-[12px] font-semibold text-slate-700">
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
                  className="h-11 rounded-lg bg-black px-4 text-[14px] font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                </button>
              </form>
            </aside>
          )}
        </section>
      </div>
    </main>
  );
}
