"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { AdminIntroSession, AdminUser, AdminUserBilling, AdminSpecialist, AdminTab } from "../../types";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { Button } from "@/components/ui/Button";
import { InterestPill } from "@/components/ui/InterestPill";
import { Modal } from "@/components/ui/Modal";
import { uploadAvatar } from "@/lib/uploadAvatar";
import { PhotoEditor } from "@/components/ui/PhotoEditor";
import { fieldValue, formatDate } from "../../utils";
import { AdminBadge, AdminCard, AdminDetailRow } from "../AdminDesignSystem";

interface UsersTabProps {
  users: AdminUser[];
  specialists: AdminSpecialist[];
  introSessions?: AdminIntroSession[];
  setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  setActiveTab: (tab: AdminTab) => void;
  setSelectedSpecialistUserId: (id: string | null) => void;
  setSpecialistSubTab: (tab: "lista" | "postulaciones") => void;
  onOpenSession?: (sessionId: string) => void;
  selectedId?: string;
  setSelectedId?: (id: string) => void;
  userSubTab?: "activos" | "mecenas" | "cerradas" | "deshabilitados";
  setUserSubTab?: (tab: "activos" | "mecenas" | "cerradas" | "deshabilitados") => void;
}

export function UsersTab({
  users,
  specialists,
  introSessions = [],
  setUsers,
  setActiveTab,
  setSelectedSpecialistUserId,
  setSpecialistSubTab,
  onOpenSession,
  selectedId: propSelectedId,
  setSelectedId: propSetSelectedId,
  userSubTab: propUserSubTab,
  setUserSubTab: propSetUserSubTab,
}: UsersTabProps) {
  const [internalUserSubTab, setInternalUserSubTab] = useState<"activos" | "mecenas" | "cerradas" | "deshabilitados">("activos");
  const userSubTab = propUserSubTab ?? internalUserSubTab;
  const setUserSubTab = propSetUserSubTab ?? setInternalUserSubTab;

  const [search, setSearch] = useState("");

  const [internalSelectedId, setInternalSelectedId] = useState<string>(users[0]?.id ?? "");
  const selectedId = propSelectedId ?? internalSelectedId;
  const setSelectedId = propSetSelectedId ?? setInternalSelectedId;

  const [selectedRole, setSelectedRole] = useState<string>(users[0]?.role ?? "USER");
  const [selectedStatus, setSelectedStatus] = useState<string>(users[0]?.status ?? "active");
  const [selectedPlan, setSelectedPlan] = useState<string>(
    users[0]?.tier === "MECENAS" || Boolean(users[0]?.stripeSubscriptionId)
      ? users[0]?.profile?.selectedPlan === "Annual"
        ? "Annual"
        : "Monthly"
      : "Free"
  );
  const [selectedIsGhost, setSelectedIsGhost] = useState<boolean>(users[0]?.isGhost ?? false);
  const [showMobileDetail, setShowMobileDetail] = useState<boolean>(false);
  const [isEditingUser, setIsEditingUser] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [billingMap, setBillingMap] = useState<Record<string, AdminUserBilling>>({});
  const [loadingBilling, setLoadingBilling] = useState<boolean>(false);

  // Avatar upload / cropper state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempAvatarImage, setTempAvatarImage] = useState<string | null>(null);
  const [isCroppingAvatar, setIsCroppingAvatar] = useState<boolean>(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);

  const activeUsers = useMemo(() => users.filter((u) => u.status === "active"), [users]);
  const mecenasUsers = useMemo(() => users.filter((u) => u.tier === "MECENAS" || Boolean(u.stripeSubscriptionId)), [users]);
  const closedUsers = useMemo(() => users.filter((u) => u.status === "deleted"), [users]);
  const disabledUsers = useMemo(() => users.filter((u) => u.status === "disabled"), [users]);

  const baseUsersList = userSubTab === "mecenas"
    ? mecenasUsers
    : userSubTab === "cerradas"
    ? closedUsers
    : userSubTab === "deshabilitados"
      ? disabledUsers
      : activeUsers;

  // Specialist user ID set for quick lookup
  const specialistUserIds = useMemo(() => {
    return new Set(specialists.map((s) => s.userId));
  }, [specialists]);

  // Filtered users list based on search text
  const filteredUsers = useMemo(() => {
    return baseUsersList.filter((user) => {
      if (!search.trim()) return true;

      const query = search.trim().toLowerCase();
      const full = user.profile.fullName || `${user.profile.firstName} ${user.profile.lastName}`;
      const matchName = full.toLowerCase().includes(query);
      const matchEmail = user.email.toLowerCase().includes(query);
      const matchCity = (user.profile.city || "").toLowerCase().includes(query);
      const matchCountry = (user.profile.country || "").toLowerCase().includes(query);
      const matchProfession = (user.profile.profession || "").toLowerCase().includes(query);

      return matchName || matchEmail || matchCity || matchCountry || matchProfession;
    });
  }, [baseUsersList, search]);

  const selectedUser = filteredUsers.find((user) => user.id === selectedId) ?? filteredUsers[0] ?? null;

  function resolveEditablePlan(user: AdminUser): string {
    if (user.tier === "MECENAS" || Boolean(user.stripeSubscriptionId)) {
      return user.profile?.selectedPlan?.toLowerCase() === "annual" ? "Annual" : "Monthly";
    }
    return "Free";
  }

  // Keep selection and form states synchronized with the currently active user
  useEffect(() => {
    if (selectedUser) {
      if (selectedId !== selectedUser.id) {
        setSelectedId(selectedUser.id);
      }
      setSelectedRole(selectedUser.role);
      setSelectedStatus(selectedUser.status);
      setSelectedPlan(resolveEditablePlan(selectedUser));
      setSelectedIsGhost(selectedUser.isGhost ?? false);
    } else if (selectedId) {
      setSelectedId("");
    }
  }, [selectedUser?.id]);

  // Fetch live Stripe billing & payment history when selecting a Mecenas / Stripe user
  useEffect(() => {
    if (!selectedUser) return;
    const hasStripeOrMecenas =
      selectedUser.tier === "MECENAS" ||
      Boolean(selectedUser.stripeCustomerId) ||
      Boolean(selectedUser.stripeSubscriptionId);
    if (!hasStripeOrMecenas || billingMap[selectedUser.id]) return;

    let cancelled = false;
    setLoadingBilling(true);
    fetch(`/api/admin/users/${selectedUser.id}/billing`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AdminUserBilling | null) => {
        if (!cancelled && data) {
          setBillingMap((prev) => ({ ...prev, [selectedUser.id]: data }));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingBilling(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedUser?.id]);

  const userSessions = useMemo(() => {
    if (!selectedUser) return [];
    return introSessions.filter(
      (s) => s.requesterId === selectedUser.id || s.specialistId === selectedUser.id
    );
  }, [introSessions, selectedUser?.id]);

  // Available membership plan options for edit dropdown
  const membershipOptions = useMemo(
    () => [
      { label: "Cuenta Gratis (FREE)", value: "Free" },
      { label: "Mecenas Mensual (USD 5/mes)", value: "Monthly" },
      { label: "Mecenas Anual (USD 45/año)", value: "Annual" },
    ],
    []
  );

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setTempAvatarImage(reader.result as string);
        setIsCroppingAvatar(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarCropSave = async (croppedBlob: Blob) => {
    if (!selectedUser) return;
    try {
      setIsUploadingAvatar(true);
      const { publicUrl } = await uploadAvatar(croppedBlob);

      const payload = {
        id: selectedUser.id,
        profileData: {
          avatarUrl: publicUrl,
        },
      };

      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        alert("Error al guardar la nueva foto de perfil.");
        return;
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === selectedUser.id
            ? {
              ...item,
              profile: {
                ...item.profile,
                avatarUrl: publicUrl,
              },
            }
            : item
        )
      );

      setIsCroppingAvatar(false);
      setTempAvatarImage(null);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      alert("No pudimos subir la foto. Intenta nuevamente.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  async function updateSelectedUser(formData: FormData) {
    if (!selectedUser) return;
    setIsSaving(true);
    setMessage("");

    const role = (formData.get("role") as "USER" | "ADMIN") || selectedUser.role;
    const status = (formData.get("status") as "active" | "disabled" | "deleted") || selectedUser.status;
    const isGhost = formData.get("isGhost") === "true";
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const nextPlan = String(formData.get("selectedPlan") || selectedPlan);
    const nextTier = nextPlan === "Monthly" || nextPlan === "Annual" ? "MECENAS" : "FREE";

    const payload = {
      id: selectedUser.id,
      userData: { role, status, tier: nextTier, isGhost, ...(email ? { email } : {}) },
      profileData: {
        firstName: String(formData.get("firstName") || ""),
        lastName: String(formData.get("lastName") || ""),
        fullName: `${formData.get("firstName") || ""} ${formData.get("lastName") || ""}`.trim(),
        profession: String(formData.get("profession") || ""),
        city: String(formData.get("city") || ""),
        country: String(formData.get("country") || ""),
        phoneNumber: String(formData.get("phoneNumber") || ""),
        selectedPlan: nextPlan,
        birthdate: String(formData.get("birthdate") || ""),
        bio: String(formData.get("bio") || ""),
        isOnboarded: formData.get("isOnboarded") === "on",
      },
    };

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Error al guardar cambios.");
        return;
      }

      // Check if user status changes such that it leaves the current subtab
      const willLeaveSubTab =
        (userSubTab === "activos" && status !== "active") ||
        (userSubTab === "cerradas" && status !== "deleted") ||
        (userSubTab === "deshabilitados" && status !== "disabled");

      if (willLeaveSubTab) {
        const remaining = filteredUsers.filter((u) => u.id !== selectedUser.id);
        const nextUser = remaining[0] ?? null;
        setSelectedId(nextUser ? nextUser.id : "");
        if (nextUser) {
          setSelectedRole(nextUser.role);
          setSelectedStatus(nextUser.status);
          setSelectedPlan(resolveEditablePlan(nextUser));
          setSelectedIsGhost(nextUser.isGhost ?? false);
        }
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === selectedUser.id
            ? {
              ...item,
              email: email || item.email,
              role,
              status,
              tier: nextTier,
              isGhost,
              profile: {
                ...item.profile,
                ...payload.profileData,
              },
            }
            : item
        )
      );

      setMessage("Cambios guardados correctamente.");
      setIsEditingUser(false);
    } catch {
      setMessage("Error de conexión al actualizar usuario.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="w-full p-6 md:p-8 h-[calc(100vh-64px)] overflow-hidden flex flex-col box-border">
      {/* Photo Editor Cropper Modal */}
      {isCroppingAvatar && tempAvatarImage && (
        <PhotoEditor
          image={tempAvatarImage}
          onSave={handleAvatarCropSave}
          onCancel={() => {
            setIsCroppingAvatar(false);
            setTempAvatarImage(null);
          }}
        />
      )}

      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
      />

      {/* 2-Column Master-Detail Grid: 38% Lista / 62% Panel de Detalle Amplio */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-6 items-start flex-1 min-h-0 h-full">
        {/* Left Side: Heading + Unified User-List Card */}
        <div className={`${showMobileDetail ? "hidden lg:flex" : "flex"} flex-col gap-4 min-w-0 h-full overflow-hidden`}>
          {/* Page Heading Area */}
          <div className="shrink-0">
            <h1 className="text-[28px] font-bold leading-tight font-jakarta text-slate-900">
              Usuarios
            </h1>
            <p className="mt-0.5 text-[14px] text-slate-500 font-sans">
              Administra las cuentas, estados y membresías de la plataforma.
            </p>
          </div>

          {/* Unified User-List Card with inner scroll */}
          <AdminCard className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Toolbar inside card: Compact Status Selector + Search Bar + Filter & Download Buttons */}
            <div className="p-4 border-b border-slate-200/80 bg-white flex items-center gap-3 shrink-0">
              {/* Compact Status Dropdown */}
              <div className="min-w-[140px] shrink-0">
                <SelectInput
                  value={userSubTab}
                  options={[
                    { label: `Activos · ${activeUsers.length}`, value: "activos" },
                    { label: `Mecenas (Suscritos) · ${mecenasUsers.length}`, value: "mecenas" },
                    { label: `Cuentas cerradas · ${closedUsers.length}`, value: "cerradas" },
                    { label: `Deshabilitados · ${disabledUsers.length}`, value: "deshabilitados" },
                  ]}
                  onSelect={(val) => {
                    setUserSubTab(val as "activos" | "mecenas" | "cerradas" | "deshabilitados");
                    setIsEditingUser(false);
                    setMessage("");
                  }}
                  className="!h-10 text-xs font-bold"
                />
              </div>

              {/* Search Field */}
              <div className="flex-1 min-w-0">
                <InputField
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nombre o correo"
                  className="!w-full !h-10 text-xs"
                />
              </div>

              {/* Filter Button */}
              <button
                type="button"
                title="Filtros"
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white border border-zinc-200/80 hover:bg-slate-50 text-slate-600 hover:text-slate-900 cursor-pointer transition-all duration-300"
              >
                <span className="material-symbols-rounded text-[19px] block">
                  instant_mix
                </span>
              </button>

              {/* Download Button */}
              <button
                type="button"
                title="Descargar"
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white border border-zinc-200/80 hover:bg-slate-50 text-slate-600 hover:text-slate-900 cursor-pointer transition-all duration-300"
              >
                <span className="material-symbols-rounded text-[19px] block">
                  download
                </span>
              </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[43%_16%_25%_16%] border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
              <span>Usuario</span>
              <span>País</span>
              <span>Ciudad</span>
              <span>Registrado</span>
            </div>

            {/* Table Rows with Inner Scroll */}
            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto min-h-0">
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <span className="material-symbols-rounded text-[44px] mb-2 text-slate-300">
                    {userSubTab === "cerradas" || userSubTab === "deshabilitados" ? "person_off" : "group_off"}
                  </span>
                  <p className="text-sm font-medium">
                    {userSubTab === "cerradas"
                      ? "No hay cuentas cerradas."
                      : userSubTab === "deshabilitados"
                        ? "No hay usuarios deshabilitados."
                        : "No se encontraron usuarios activos."}
                  </p>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const active = user.id === selectedUser?.id;
                  const isSpecialist = specialistUserIds.has(user.id);

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(user.id);
                        setSelectedRole(user.role);
                        setSelectedStatus(user.status);
                        setSelectedPlan(resolveEditablePlan(user));
                        setSelectedIsGhost(user.isGhost ?? false);
                        setIsEditingUser(false);
                        setMessage("");
                        setShowMobileDetail(true);
                      }}
                      className={`grid w-full grid-cols-[43%_16%_25%_16%] items-center px-4 py-3.5 text-left text-[14px] transition outline-none cursor-pointer border-y-0 border-r-0 ${active
                        ? "bg-slate-100/90 font-semibold border-l-4 border-slate-900"
                        : "bg-white border-l-4 border-transparent hover:bg-slate-50"
                        }`}
                    >
                      {/* Usuario */}
                      <span className="flex min-w-0 items-center gap-3 pr-2">
                        <span className="relative shrink-0">
                          {user.profile.avatarUrl ? (
                            <img src={user.profile.avatarUrl} alt="" className="h-9 w-9 rounded-xl object-cover" />
                          ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[13px] font-bold text-slate-600 uppercase">
                              {(user.profile.firstName || user.email).slice(0, 1).toUpperCase()}
                            </span>
                          )}
                          {isSpecialist && (
                            <span
                              className="absolute -bottom-1 -right-1 text-black leading-none drop-shadow-sm select-none"
                              title="Especialista registrado"
                            >
                              <span
                                className="material-symbols-outlined text-[13px] leading-none block"
                                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
                              >
                                heart_smile
                              </span>
                            </span>
                          )}
                        </span>
                        <span className="min-w-0 pr-1">
                          <span className="flex items-center gap-1.5 truncate">
                            <span className={`truncate ${active ? "font-bold text-slate-950" : "font-semibold text-slate-900"}`}>
                              {fieldValue(
                                user.profile.fullName || `${user.profile.firstName} ${user.profile.lastName}`
                              )}
                            </span>
                            {(user.tier === "MECENAS" || Boolean(user.stripeSubscriptionId)) && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                Mecenas
                              </span>
                            )}
                            {user.isGhost && (
                              <span
                                className="material-symbols-rounded text-slate-400 text-[14px] shrink-0"
                                title="Usuario fantasma (oculto en comunidad)"
                              >
                                visibility_off
                              </span>
                            )}
                          </span>
                          <span className="block truncate text-[12px] text-slate-500">{user.email}</span>
                        </span>
                      </span>

                      {/* País */}
                      <span className="truncate text-slate-600 text-xs font-medium pr-2">
                        {fieldValue(user.profile.country)}
                      </span>

                      {/* Ciudad */}
                      <span
                        className="truncate text-slate-600 text-xs font-medium pr-2"
                        title={user.profile.city || undefined}
                      >
                        {fieldValue(user.profile.city)}
                      </span>

                      {/* Registrado */}
                      <span className="text-slate-500 font-sans text-xs">{formatDate(user.createdAt)}</span>
                    </button>
                  );
                })
              )}
            </div>
          </AdminCard>
        </div>

        {/* Right Side: Expanded User Detail Panel with Inner Scroll */}
        {selectedUser ? (
          <AdminCard className={`${showMobileDetail ? "flex" : "hidden lg:flex"} flex-col min-w-0 h-full overflow-hidden relative`}>
            {/* Mobile Sticky Back Button Header */}
            <div className="lg:hidden p-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setShowMobileDetail(false)}
                className="flex items-center gap-2 text-xs font-bold text-white hover:text-slate-200 cursor-pointer bg-transparent border-none"
              >
                <span className="material-symbols-rounded text-[18px]">arrow_back</span>
                <span>Volver a la lista de usuarios</span>
              </button>
            </div>
            {/* Header Profile Summary */}
            <div className="border-b border-slate-200/80 p-6 bg-white shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    {selectedUser.profile.avatarUrl ? (
                      <img
                        src={selectedUser.profile.avatarUrl}
                        alt=""
                        className="h-16 w-16 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-600 uppercase text-2xl">
                        {(selectedUser.profile.firstName || selectedUser.email).slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    {/* Edit Photo Camera Button (Grey, No Border, No Shadows, Small SVG Icon) */}
                    {isEditingUser && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 border-none shadow-none flex items-center justify-center cursor-pointer transition-colors z-20 outline-none"
                        title="Cambiar foto de perfil"
                      >
                        {isUploadingAvatar ? (
                          <span className="material-symbols-rounded text-[13px] text-slate-500 animate-spin block">
                            sync
                          </span>
                        ) : (
                          <svg
                            width="15"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-slate-500 shrink-0"
                          >
                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                            <circle cx="12" cy="13" r="3" />
                          </svg>
                        )}
                      </button>
                    )}

                    {!isEditingUser && specialistUserIds.has(selectedUser.id) && (
                      <span
                        className="absolute -bottom-1 -right-1 text-black leading-none drop-shadow-sm select-none z-10"
                        title="Especialista"
                      >
                        <span
                          className="material-symbols-outlined text-[18px] leading-none block"
                          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
                        >
                          heart_smile
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h2 className="truncate text-lg font-bold text-slate-900 leading-tight font-jakarta">
                      {fieldValue(
                        selectedUser.profile.fullName ||
                        `${selectedUser.profile.firstName} ${selectedUser.profile.lastName}`
                      )}
                    </h2>

                    {/* Badges Bar (Role if Admin, Status, Plan) */}
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                      {selectedUser.role === "ADMIN" && (
                        <AdminBadge variant="admin">
                          Admin
                        </AdminBadge>
                      )}

                      <AdminBadge
                        variant={
                          selectedUser.status === "active"
                            ? "active"
                            : selectedUser.status === "deleted"
                              ? "deleted"
                              : "disabled"
                        }
                      >
                        {selectedUser.status === "active"
                          ? "Activo"
                          : selectedUser.status === "deleted"
                            ? "Cuenta cerrada"
                            : "Deshabilitado"}
                      </AdminBadge>

                      <AdminBadge variant="plan">
                        {selectedUser.tier === "MECENAS" || Boolean(selectedUser.stripeSubscriptionId)
                          ? `Mecenas (${selectedUser.profile.selectedPlan === "Annual" ? "Anual" : "Mensual"})`
                          : "Cuenta Gratis"}
                      </AdminBadge>

                      {selectedUser.isGhost && (
                        <AdminBadge variant="ghost">
                          <span className="material-symbols-rounded text-[12px] mr-1 inline-block align-middle">
                            visibility_off
                          </span>
                          Fantasma
                        </AdminBadge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isEditingUser && selectedUser) {
                        setSelectedRole(selectedUser.role);
                        setSelectedStatus(selectedUser.status);
                        setSelectedPlan(resolveEditablePlan(selectedUser));
                        setSelectedIsGhost(selectedUser.isGhost ?? false);
                      }
                      setIsEditingUser((prev) => !prev);
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-none cursor-pointer transition-colors ${isEditingUser
                      ? "bg-black text-white hover:bg-slate-800"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    title={isEditingUser ? "Cancelar edición" : "Editar usuario"}
                  >
                    <span className="material-symbols-rounded text-[18px] block">
                      {isEditingUser ? "close" : "edit"}
                    </span>
                  </button>

                  {!isEditingUser && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-none cursor-pointer transition-colors bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700"
                      title="Eliminar usuario"
                    >
                      <span className="material-symbols-rounded text-[18px] block">
                        delete
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Link to Specialist profile if linked */}
              {(() => {
                const linkedSpecialist = specialists.find((s) => s.userId === selectedUser.id);
                if (!linkedSpecialist) return null;

                return (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setSelectedSpecialistUserId(linkedSpecialist.userId);
                      setSpecialistSubTab("lista");
                      setActiveTab("especialistas");
                    }}
                    className="w-full mt-4 flex items-center justify-center !h-9 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border-none shadow-none transition-colors"
                  >
                    Ver perfil de especialista
                  </Button>
                );
              })()}

              {message && (
                <p
                  className={`mt-3 text-xs font-bold p-2.5 rounded-xl text-center ${message.includes("correctamente")
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                >
                  {message}
                </p>
              )}
            </div>

            {/* Panel Content with Inner Scroll */}
            {!isEditingUser ? (
              /* Read-Only View */
              <div className="p-6 flex flex-col gap-6 text-sm flex-1 overflow-y-auto min-h-0">
                {/* Personal Info Section */}
                <div>
                  <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Información Personal
                  </h3>
                  <div className="bg-slate-50/50 rounded-xl p-1 divide-y divide-slate-100">
                    <AdminDetailRow label="Email" value={selectedUser.email} />
                    <AdminDetailRow label="Celular" value={fieldValue(selectedUser.profile.phoneNumber)} />
                    <AdminDetailRow label="País" value={fieldValue(selectedUser.profile.country)} />
                    <AdminDetailRow label="Ciudad" value={fieldValue(selectedUser.profile.city)} />
                    <AdminDetailRow label="Nacimiento" value={fieldValue(selectedUser.profile.birthdate)} />
                    <AdminDetailRow label="Profesión" value={fieldValue(selectedUser.profile.profession)} />
                  </div>
                </div>

                {/* Account & Plan Details */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400">
                      Cuenta y Suscripción
                    </h3>
                    {(selectedUser.tier === "MECENAS" ||
                      Boolean(selectedUser.stripeCustomerId) ||
                      Boolean(selectedUser.stripeSubscriptionId)) && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("suscripciones")}
                        className="text-[11px] font-bold text-indigo-600 hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Gestionar en Suscripciones →
                      </button>
                    )}
                  </div>
                  <div className="bg-slate-50/50 rounded-xl p-1 divide-y divide-slate-100">
                    <AdminDetailRow
                      label="Membresía"
                      value={
                        selectedUser.tier === "MECENAS" || Boolean(selectedUser.stripeSubscriptionId)
                          ? "Mecenas Activo"
                          : "Cuenta Gratis"
                      }
                    />
                    {(selectedUser.tier === "MECENAS" || Boolean(selectedUser.stripeSubscriptionId)) && (
                      <AdminDetailRow
                        label="Ciclo de Pago"
                        value={
                          selectedUser.profile.selectedPlan === "Annual"
                            ? "Anual (USD 45/año)"
                            : "Mensual (USD 5/mes)"
                        }
                      />
                    )}
                    {selectedUser.memberSince && (
                      <AdminDetailRow label="Mecenas Desde" value={formatDate(selectedUser.memberSince)} />
                    )}
                    {billingMap[selectedUser.id]?.subscription && (
                      <>
                        <AdminDetailRow
                          label="Estado Stripe"
                          value={
                            billingMap[selectedUser.id].subscription!.cancelAtPeriodEnd
                              ? "Cancela al fin del ciclo"
                              : billingMap[selectedUser.id].subscription!.status === "active"
                                ? "Activa (Renovación automática)"
                                : billingMap[selectedUser.id].subscription!.status
                          }
                        />
                        {billingMap[selectedUser.id].subscription!.currentPeriodEnd && (
                          <AdminDetailRow
                            label={
                              billingMap[selectedUser.id].subscription!.cancelAtPeriodEnd
                                ? "Acceso hasta"
                                : "Próximo cobro"
                            }
                            value={new Date(
                              billingMap[selectedUser.id].subscription!.currentPeriodEnd! * 1000
                            ).toLocaleDateString("es-UY", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          />
                        )}
                      </>
                    )}
                    {billingMap[selectedUser.id]?.defaultPaymentMethod && (
                      <AdminDetailRow
                        label="Tarjeta"
                        value={`${billingMap[selectedUser.id].defaultPaymentMethod!.brand.toUpperCase()} •••• ${
                          billingMap[selectedUser.id].defaultPaymentMethod!.last4
                        }`}
                      />
                    )}
                    {selectedUser.stripeCustomerId && (
                      <AdminDetailRow
                        label="Stripe Customer"
                        value={
                          <a
                            href={`https://dashboard.stripe.com/customers/${selectedUser.stripeCustomerId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline font-mono text-xs"
                          >
                            {selectedUser.stripeCustomerId}
                          </a>
                        }
                      />
                    )}
                    <AdminDetailRow label="Último Login" value={formatDate(selectedUser.lastLoginAt)} />
                    <AdminDetailRow label="Fecha de Alta" value={formatDate(selectedUser.createdAt)} />
                  </div>

                  {/* User Payment History */}
                  {(selectedUser.tier === "MECENAS" ||
                    Boolean(selectedUser.stripeCustomerId) ||
                    Boolean(selectedUser.stripeSubscriptionId)) && (
                    <div className="mt-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Lista de Pagos ({billingMap[selectedUser.id]?.invoices?.length || 0})
                      </span>
                      {loadingBilling && !billingMap[selectedUser.id] ? (
                        <div className="bg-slate-50/50 rounded-xl p-3 text-xs text-slate-500">
                          Cargando historial de pagos...
                        </div>
                      ) : billingMap[selectedUser.id]?.invoices?.length ? (
                        <div className="bg-slate-50/50 rounded-xl border border-slate-100 divide-y divide-slate-100">
                          {billingMap[selectedUser.id].invoices.map((inv) => (
                            <div
                              key={inv.id}
                              className="flex items-center justify-between gap-2 px-3 py-2.5 text-xs"
                            >
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-800 block truncate">
                                  {inv.description}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  {new Date(inv.date * 1000).toLocaleDateString("es-UY", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}{" "}
                                  · {inv.number}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-bold text-slate-900">
                                  {inv.currency.toUpperCase()} {inv.amount.toFixed(2)}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    inv.status === "paid"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-amber-50 text-amber-700"
                                  }`}
                                >
                                  {inv.status === "paid" ? "Pagado" : inv.status}
                                </span>
                                {(inv.pdfUrl || inv.hostedUrl) && (
                                  <a
                                    href={inv.pdfUrl || inv.hostedUrl || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-bold text-[10px] no-underline hover:bg-slate-100"
                                  >
                                    PDF
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-50/50 rounded-xl p-3 text-xs text-slate-400">
                          Sin pagos registrados en Stripe.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Closed Account Info */}
                {selectedUser.status === "deleted" && (
                  <div>
                    <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-rose-500 mb-2">
                      Cierre de Cuenta
                    </h3>
                    <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-1 divide-y divide-rose-100/70">
                      <AdminDetailRow label="Fecha de Cierre" value={formatDate(selectedUser.closedAt || null)} />
                      <AdminDetailRow label="Purga Programada" value={formatDate(selectedUser.purgeAt || null)} />
                      <AdminDetailRow label="Motivo" value={fieldValue(selectedUser.closureReason)} />
                      {selectedUser.closureFeedback && (
                        <AdminDetailRow label="Feedback" value={selectedUser.closureFeedback} />
                      )}
                    </div>
                  </div>
                )}

                {/* User Introductory Sessions */}
                <div>
                  <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Sesiones Introductorias ({userSessions.length})
                  </h3>
                  {userSessions.length === 0 ? (
                    <div className="bg-slate-50/50 rounded-xl p-4 text-xs text-slate-400 italic">
                      No tiene sesiones introductorias registradas.
                    </div>
                  ) : (
                    <div className="bg-slate-50/50 rounded-xl border border-slate-100 divide-y divide-slate-100">
                      {userSessions.slice(0, 6).map((s) => {
                        const isRequester = s.requesterId === selectedUser.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => onOpenSession?.(s.id)}
                            className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-slate-100/60 transition-colors bg-transparent border-none cursor-pointer"
                          >
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-slate-900 block truncate">
                                {isRequester
                                  ? `Con ${s.specialist.name} (Solicitada)`
                                  : `Con ${s.requester.name} (Recibida)`}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {s.scheduledDate} · {s.startTime} - {s.endTime}
                              </span>
                            </div>
                            <AdminBadge
                              variant={
                                s.status === "accepted"
                                  ? "active"
                                  : s.status === "pending"
                                    ? "pending"
                                    : s.status === "cancelled"
                                      ? "deleted"
                                      : "disabled"
                              }
                            >
                              {s.status === "accepted"
                                ? "Confirmada"
                                : s.status === "pending"
                                  ? "Pendiente"
                                  : s.status === "cancelled"
                                    ? "Cancelada"
                                    : "Rechazada"}
                            </AdminBadge>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Biography */}
                <div>
                  <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Biografía
                  </h3>
                  <div className="bg-slate-50/50 rounded-xl p-4">
                    <p className="text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {selectedUser.profile.bio || "Sin biografía especificada."}
                    </p>
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Intereses
                  </h3>
                  <div className="bg-slate-50/50 rounded-xl p-4">
                    {selectedUser.interests && selectedUser.interests.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.interests.map((interest) => (
                          <InterestPill
                            key={interest.id}
                            interest={interest.name}
                            size="sm"
                            className="shadow-none"
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13.5px] text-slate-400 italic">
                        Sin intereses seleccionados.
                      </p>
                    )}
                  </div>
                </div>

                {/* Quotes / Prompts / Intention */}
                {((selectedUser.prompts && selectedUser.prompts.length > 0) || selectedUser.profile?.intention) ? (
                  <div>
                    <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Cotizaciones / Frases
                    </h3>
                    <div className="bg-slate-50/50 rounded-xl p-4 flex flex-col gap-3">
                      {selectedUser.profile?.intention && (
                        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-none">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                            Intención
                          </span>
                          <p className="text-[13px] font-medium text-slate-800 italic">
                            "{selectedUser.profile.intention}"
                          </p>
                        </div>
                      )}
                      {selectedUser.prompts?.map((prompt) => (
                        <div key={prompt.id} className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-none">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                            {prompt.question}
                          </span>
                          <p className="text-[13px] font-medium text-slate-800 italic">
                            "{prompt.answer}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              /* Visual & Structured Editable Form Mode */
              <form
                key={selectedUser.id}
                onSubmit={(event) => {
                  event.preventDefault();
                  if (selectedStatus === "deleted") {
                    const confirmDelete = window.confirm(
                      "¿Estás seguro de que deseas marcar esta cuenta como ELIMINADA? El usuario perderá el acceso a la plataforma."
                    );
                    if (!confirmDelete) return;
                  }
                  updateSelectedUser(new FormData(event.currentTarget));
                }}
                className="p-6 flex flex-col gap-6 text-sm flex-1 overflow-y-auto min-h-0"
              >
                {/* Deletion Warning Banner */}
                {selectedStatus === "deleted" && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900 animate-in fade-in duration-200">
                    <span className="material-symbols-rounded text-rose-600 text-[22px] shrink-0 mt-0.5">
                      warning
                    </span>
                    <div className="text-xs font-sans leading-relaxed">
                      <strong className="block font-bold text-rose-950 mb-0.5 text-[13px]">
                        ¡Atención! La cuenta será marcada como CERRADA
                      </strong>
                      Esta acción deshabilitará el acceso de {selectedUser.email} a la plataforma LUMINUS. Puedes revertir este estado más tarde seleccionando "Activo".
                    </div>
                  </div>
                )}

                {/* Section 1: Cuenta y Membresía */}
                <div>
                  <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Cuenta y Membresía
                  </h3>
                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col gap-3.5">
                    {/* Row 1: Tipo de usuario (Left) | Estado de cuenta (Right) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Tipo de usuario</span>
                        <input type="hidden" name="role" value={selectedRole} />
                        <SelectInput
                          value={selectedRole}
                          onSelect={(val) => setSelectedRole(val)}
                          options={[
                            { label: "Usuario", value: "USER" },
                            { label: "Administrador", value: "ADMIN" },
                          ]}
                          className="!h-9 text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Estado de cuenta</span>
                        <input type="hidden" name="status" value={selectedStatus} />
                        <SelectInput
                          value={selectedStatus}
                          onSelect={(val) => setSelectedStatus(val)}
                          options={[
                            { label: "Activo", value: "active" },
                            { label: "Deshabilitado", value: "disabled" },
                            { label: "Cuenta cerrada", value: "deleted" },
                          ]}
                          className="!h-9 text-xs"
                        />
                      </div>
                    </div>

                    {/* Membresía Dropdown */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Membresía</span>
                      <input type="hidden" name="selectedPlan" value={selectedPlan} />
                      <SelectInput
                        value={selectedPlan}
                        onSelect={(val) => setSelectedPlan(val)}
                        options={membershipOptions}
                        className="!h-9 text-xs"
                      />
                    </div>

                    {/* Usuario Fantasma Toggle */}
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/80 mt-1">
                      <div className="flex flex-col gap-0.5 pr-2">
                        <span className="text-xs font-bold text-slate-800 font-jakarta flex items-center gap-1.5">
                          <span className="material-symbols-rounded text-slate-500 text-[16px]">visibility_off</span>
                          Usuario fantasma
                        </span>
                        <span className="text-[11px] text-slate-400 font-sans">
                          Oculto en comunidad y listados de miembros. Solo puede publicar y enviar mensajes.
                        </span>
                      </div>
                      <input type="hidden" name="isGhost" value={selectedIsGhost ? "true" : "false"} />
                      <button
                        type="button"
                        onClick={() => setSelectedIsGhost((prev) => !prev)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors border-none shrink-0 ${
                          selectedIsGhost ? "bg-slate-900" : "bg-slate-200"
                        }`}
                        title={selectedIsGhost ? "Desactivar modo fantasma" : "Activar modo fantasma"}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            selectedIsGhost ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section 2: Información Personal */}
                <div>
                  <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Información Personal
                  </h3>
                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Nombre</span>
                        <InputField name="firstName" defaultValue={selectedUser.profile.firstName || ""} className="!h-9 text-xs" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Apellido</span>
                        <InputField name="lastName" defaultValue={selectedUser.profile.lastName || ""} className="!h-9 text-xs" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Mail</span>
                      <InputField
                        name="email"
                        defaultValue={selectedUser.email}
                        type="email"
                        className="!h-9 text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Teléfono</span>
                      <InputField name="phoneNumber" defaultValue={selectedUser.profile.phoneNumber || ""} className="!h-9 text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase text-slate-400">País</span>
                        <InputField name="country" defaultValue={selectedUser.profile.country || ""} className="!h-9 text-xs" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Ciudad</span>
                        <InputField name="city" defaultValue={selectedUser.profile.city || ""} className="!h-9 text-xs" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Nacimiento</span>
                      <InputField name="birthdate" defaultValue={selectedUser.profile.birthdate || ""} className="!h-9 text-xs" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Profesión</span>
                      <InputField name="profession" defaultValue={selectedUser.profile.profession || ""} className="!h-9 text-xs" />
                    </div>
                  </div>
                </div>

                {/* Section 3: Biografía */}
                <div>
                  <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Biografía
                  </h3>
                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col gap-3">
                    <textarea
                      name="bio"
                      defaultValue={selectedUser.profile.bio || ""}
                      rows={3}
                      placeholder="Escribe la biografía del usuario..."
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 font-medium outline-none resize-none min-h-[72px] bg-white focus:border-slate-800 transition-colors"
                    />

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="isOnboarded"
                        name="isOnboarded"
                        defaultChecked={selectedUser.profile.isOnboarded}
                        className="rounded text-black focus:ring-black h-4 w-4 cursor-pointer"
                      />
                      <label htmlFor="isOnboarded" className="text-xs font-semibold text-slate-700 cursor-pointer">
                        Onboarding completado
                      </label>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsEditingUser(false)}
                    disabled={isSaving}
                    className="!h-10 flex-1 font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border-none shadow-none text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className={`!h-10 flex-1 font-bold shadow-none text-xs text-white ${selectedStatus === "deleted"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-black hover:bg-slate-800"
                      }`}
                  >
                    {isSaving
                      ? "Guardando..."
                      : selectedStatus === "deleted"
                        ? "Guardar como Cuenta Cerrada"
                        : "Guardar cambios"}
                  </Button>
                </div>
              </form>
            )}
          </AdminCard>
        ) : (
          <AdminCard className="flex items-center justify-center p-8 text-center text-slate-400 min-h-[300px]">
            <p className="text-sm font-medium">Selecciona un usuario de la lista para ver los detalles.</p>
          </AdminCard>
        )}
      </div>

      {showDeleteConfirm && selectedUser && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirmar eliminación"
          maxWidth="440px"
          footer={
            <div className="flex gap-3 w-full">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border-none shadow-none text-xs h-10"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  if (isSaving) return;
                  setIsSaving(true);
                  try {
                    const response = await fetch(`/api/admin/users?id=${selectedUser.id}`, {
                      method: "DELETE",
                    });
                    
                    if (!response.ok) {
                      const data = await response.json();
                      alert(data.message || "Error al eliminar el usuario permanentemente.");
                      setIsSaving(false);
                      return;
                    }

                    const deletedId = selectedUser.id;
                    const deletedName = fieldValue(
                      selectedUser.profile.fullName ||
                      `${selectedUser.profile.firstName} ${selectedUser.profile.lastName}`
                    );

                    // Compute next user from current filteredUsers
                    const remainingInView = filteredUsers.filter((u) => u.id !== deletedId);
                    const nextUser = remainingInView[0] ?? null;

                    // Remove them from state
                    setUsers((prevUsers) =>
                      prevUsers.filter((u) => u.id !== deletedId)
                    );

                    // Explicitly advance selection and reset edit mode
                    setSelectedId(nextUser ? nextUser.id : "");
                    if (nextUser) {
                      setSelectedRole(nextUser.role);
                      setSelectedStatus(nextUser.status);
                      setSelectedPlan(nextUser.profile?.selectedPlan || "Trial");
                      setSelectedIsGhost(nextUser.isGhost ?? false);
                    }
                    setIsEditingUser(false);
                    setShowDeleteConfirm(false);
                    setMessage(`Usuario ${deletedName} eliminado permanentemente.`);
                    
                    // Clear success message after 3 seconds
                    setTimeout(() => {
                      setMessage("");
                    }, 3000);
                  } catch (error) {
                    alert("Error de conexión al eliminar usuario.");
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                className="flex-1 font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 h-10 disabled:opacity-50"
              >
                {isSaving ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-2">
            <p className="text-sm text-slate-600 leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente al usuario{" "}
              <strong className="text-slate-900 font-semibold">
                {fieldValue(
                  selectedUser.profile.fullName ||
                    `${selectedUser.profile.firstName} ${selectedUser.profile.lastName}`
                )}
              </strong>
              ?
            </p>
            <p className="text-xs text-rose-500 font-medium">
              Esta acción eliminará al usuario por completo de la plataforma. Esta acción no se puede deshacer.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
