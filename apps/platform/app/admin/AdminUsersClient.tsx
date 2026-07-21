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

type AdminEmailLog = {
  id: string;
  recipient: string;
  subject: string;
  htmlBody: string;
  createdAt: string;
};

type AdminSearch = {
  id: string;
  userId: string;
  query: string;
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

type AdminSpecialist = {
  userId: string;
  specialty: string;
  title: string;
  clinicName: string;
  bio: string;
  linkedinUrl: string;
  instagramUrl: string;
  websiteUrl: string;
  courses: any;
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

type AdminPostulation = {
  id: string;
  userId: string;
  specialty: string;
  title: string;
  clinicName: string;
  bio: string;
  linkedinUrl: string;
  instagramUrl: string;
  websiteUrl: string;
  courses: any;
  status: string;
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

type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  iconFilled: boolean;
  color: string;
  bgColor: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  interests: Array<{
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
  }>;
  specialistAreas: Array<{
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
  }>;
};

type AdminSuggestion = {
  id: string;
  type: "USER_INTEREST" | "SPECIALIST_AREA";
  name: string;
  status: "pending" | "approved" | "rejected";
  userId: string | null;
  categoryId: string | null;
  createdAt: string;
  user: {
    email: string;
    fullName: string;
  } | null;
  categoryName: string | null;
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
  initialEmailLogs = [],
  initialSearches = [],
  initialSpecialists = [],
  initialPostulations = [],
  initialCategories = [],
  initialSuggestions = [],
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
}) {
  const [users, setUsers] = useState(initialUsers);
  const [chats, setChats] = useState(initialChats);
  const [supportChats, setSupportChats] = useState(initialSupportChats);
  const [logs, setLogs] = useState(initialLogs);
  const [emailLogs, setEmailLogs] = useState<AdminEmailLog[]>(initialEmailLogs);
  const [searches, setSearches] = useState(initialSearches);
  const [specialists, setSpecialists] = useState<AdminSpecialist[]>(initialSpecialists);
  const [postulations, setPostulations] = useState<AdminPostulation[]>(initialPostulations);
  const [categories, setCategories] = useState<AdminCategory[]>(initialCategories);
  const [suggestions, setSuggestions] = useState<AdminSuggestion[]>(initialSuggestions);
  const [activeTab, setActiveTab] = useState<"usuarios" | "chats" | "logs" | "soporte" | "busquedas" | "especialistas" | "emails" | "categorias">("usuarios");
  const [userSubTab, setUserSubTab] = useState<"activos" | "eliminados">("activos");
  const [specialistSubTab, setSpecialistSubTab] = useState<"lista" | "postulaciones">("lista");
  const [emailSubTab, setEmailSubTab] = useState<"historial" | "plantillas">("historial");
  const [categorySubTab, setCategorySubTab] = useState<"lista" | "sugerencias">("lista");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [isEditingAreas, setIsEditingAreas] = useState(false);
  const [editingInterestId, setEditingInterestId] = useState<string | null>(null);
  const [editingInterestValue, setEditingInterestValue] = useState("");
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [editingAreaValue, setEditingAreaValue] = useState("");
  const [categoryModal, setCategoryModal] = useState<{ isOpen: boolean; category: Partial<AdminCategory> | null }>({ isOpen: false, category: null });
  const [suggestionModal, setSuggestionModal] = useState<{ isOpen: boolean; suggestion: AdminSuggestion | null; selectedCatId: string; targetType: "USER_INTEREST" | "SPECIALIST_AREA" }>({ isOpen: false, suggestion: null, selectedCatId: "", targetType: "USER_INTEREST" });
  const [newInterestText, setNewInterestText] = useState<{ [key: string]: string }>({});
  const [newAreaText, setNewAreaText] = useState<{ [key: string]: string }>({});

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );

  // Filters for Email Logs
  const [emailSearch, setEmailSearch] = useState("");
  const [emailDatePreset, setEmailDatePreset] = useState<string>("all");
  const [emailStartDate, setEmailStartDate] = useState("");
  const [emailEndDate, setEmailEndDate] = useState("");

  // Selected Log & Template
  const [selectedEmailLogId, setSelectedEmailLogId] = useState<string>(initialEmailLogs[0]?.id ?? "");
  const selectedEmailLog = emailLogs.find(log => log.id === selectedEmailLogId) ?? emailLogs[0] ?? null;

  const [selectedTemplate, setSelectedTemplate] = useState<"recovery" | "emailChange">("recovery");

  const templatesData = {
    recovery: {
      name: "Restablecer contraseña (Password Recovery)",
      subject: "Codigo de recuperacion de LUMINUS",
      htmlBody: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5; padding: 20px;">
          <h2 style="margin: 0 0 16px; color: #0f172a;">Codigo de recuperacion</h2>
          <p>Recibimos una solicitud para restablecer tu contrasena de LUMINUS.</p>
          <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 24px 0; color: #000000; font-family: monospace;">123456</p>
          <p>Este codigo vence en 15 minutos.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p style="margin-top: 32px; font-weight: 600;">LUMINUS</p>
        </div>
      `
    },
    emailChange: {
      name: "Confirmar Email (Email Change Verification)",
      subject: "Codigo para confirmar tu email de LUMINUS",
      htmlBody: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5; padding: 20px;">
          <h2 style="margin: 0 0 16px; color: #0f172a;">Confirma tu nuevo email</h2>
          <p>Recibimos una solicitud para cambiar el email de tu cuenta LUMINUS.</p>
          <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 24px 0; color: #000000; font-family: monospace;">654321</p>
          <p>Este codigo vence en 15 minutos.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p style="margin-top: 32px; font-weight: 600;">LUMINUS</p>
        </div>
      `
    }
  };

  const [selectedChatId, setSelectedChatId] = useState(initialChats[0]?.id ?? "");
  const selectedChat = chats.find((c) => c.id === selectedChatId) ?? chats[0] ?? null;

  const [selectedSupportChatId, setSelectedSupportChatId] = useState(initialSupportChats[0]?.id ?? "");
  const selectedSupportChat = supportChats.find((c) => c.id === selectedSupportChatId) ?? supportChats[0] ?? null;

  const [selectedId, setSelectedId] = useState(initialUsers[0]?.id ?? "");
  const [selectedRole, setSelectedRole] = useState<string>("USER");
  const [selectedStatus, setSelectedStatus] = useState<string>("active");
  const [isEditingUser, setIsEditingUser] = useState<boolean>(false);

  const selectedUser = users.find((user) => user.id === selectedId) ?? users[0] ?? null;

  useEffect(() => {
    if (selectedUser) {
      setSelectedRole(selectedUser.role);
      setSelectedStatus(selectedUser.status);
      setIsEditingUser(false);
    }
  }, [selectedUser]);

  const [specialistSearch, setSpecialistSearch] = useState("");
  const [selectedSpecialistUserId, setSelectedSpecialistUserId] = useState<string>(initialSpecialists[0]?.userId ?? "");
  const selectedSpecialist = specialists.find((spec) => spec.userId === selectedSpecialistUserId) ?? specialists[0] ?? null;
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [isEditingSpecialist, setIsEditingSpecialist] = useState<boolean>(false);

  useEffect(() => {
    if (selectedSpecialist) {
      setIsEditingSpecialist(false);
    }
  }, [selectedSpecialistUserId]);

  const filteredSpecialists = useMemo(() => {
    const query = specialistSearch.trim().toLowerCase();
    if (!query) return specialists;

    return specialists.filter((spec) => {
      const userName = (spec.user.profile.fullName || `${spec.user.profile.firstName} ${spec.user.profile.lastName}`).toLowerCase();
      const userEmail = spec.user.email.toLowerCase();
      const specialty = spec.specialty.toLowerCase();
      const title = spec.title.toLowerCase();

      return userName.includes(query) || userEmail.includes(query) || specialty.includes(query) || title.includes(query);
    });
  }, [specialistSearch, specialists]);

  async function handlePostulationAction(id: string, action: "accept" | "decline") {
    if (isProcessingAction) return;
    setIsProcessingAction(true);
    try {
      const response = await fetch("/api/admin/especialistas/postulations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, action }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.message || "Error al procesar la acción.");
        return;
      }

      const acceptedPost = postulations.find(p => p.id === id);
      if (acceptedPost) {
        if (action === "accept") {
          setSpecialists(prev => [
            {
              userId: acceptedPost.userId,
              specialty: acceptedPost.specialty,
              title: acceptedPost.title,
              clinicName: acceptedPost.clinicName,
              bio: acceptedPost.bio,
              linkedinUrl: acceptedPost.linkedinUrl,
              instagramUrl: acceptedPost.instagramUrl,
              websiteUrl: acceptedPost.websiteUrl,
              courses: acceptedPost.courses,
              createdAt: new Date().toISOString(),
              user: acceptedPost.user,
            },
            ...prev
          ]);
        }
        setPostulations(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to process postulation action:", err);
      alert("Error de conexión.");
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function handleRemoveSpecialist(userId: string) {
    if (isProcessingAction || !confirm("¿Estás seguro de que deseas remover a este especialista?")) return;
    setIsProcessingAction(true);
    try {
      const response = await fetch("/api/admin/especialistas/postulations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, action: "remove" }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.message || "Error al remover al especialista.");
        return;
      }

      setSpecialists(prev => prev.filter(s => s.userId !== userId));
      if (selectedSpecialistUserId === userId) {
        setSelectedSpecialistUserId(specialists.find(s => s.userId !== userId)?.userId ?? "");
      }
    } catch (err) {
      console.error("Failed to remove specialist:", err);
      alert("Error de conexión.");
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function updateSelectedSpecialist(formData: FormData) {
    if (!selectedSpecialist || isProcessingAction) return;
    setIsProcessingAction(true);
    try {
      const response = await fetch("/api/admin/especialistas/postulations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          userId: selectedSpecialist.userId,
          specialty: formData.get("specialty"),
          title: formData.get("title"),
          clinicName: formData.get("clinicName"),
          bio: formData.get("bio"),
          linkedinUrl: formData.get("linkedinUrl"),
          instagramUrl: formData.get("instagramUrl"),
          websiteUrl: formData.get("websiteUrl"),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        alert(data?.message || "Error al actualizar especialista.");
        return;
      }

      setSpecialists((current) => current.map((s) => (s.userId === data.specialist.userId ? data.specialist : s)));
      setIsEditingSpecialist(false);
    } catch (err) {
      console.error("Failed to update specialist:", err);
      alert("Error de conexión.");
    } finally {
      setIsProcessingAction(false);
    }
  }

  const [searchQueryFilter, setSearchQueryFilter] = useState("");

  const filteredSearches = useMemo(() => {
    const query = searchQueryFilter.trim().toLowerCase();
    if (!query) return searches;

    return searches.filter((searchLog) => {
      const userName = (searchLog.user.profile.fullName || `${searchLog.user.profile.firstName} ${searchLog.user.profile.lastName}`).toLowerCase();
      const userEmail = searchLog.user.email.toLowerCase();
      const searchTerm = searchLog.query.toLowerCase();

      return userName.includes(query) || userEmail.includes(query) || searchTerm.includes(query);
    });
  }, [searchQueryFilter, searches]);

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

  const filteredEmailLogs = useMemo(() => {
    return emailLogs.filter((log) => {
      // 1. Search by Recipient Email
      if (emailSearch.trim()) {
        const query = emailSearch.toLowerCase().trim();
        if (!log.recipient.toLowerCase().includes(query) && !log.subject.toLowerCase().includes(query)) {
          return false;
        }
      }

      // 2. Filter by Date Range
      const logDate = new Date(log.createdAt);
      if (emailDatePreset !== "all") {
        if (emailDatePreset === "custom") {
          if (emailStartDate) {
            const start = new Date(emailStartDate + "T00:00:00");
            if (logDate < start) return false;
          }
          if (emailEndDate) {
            const end = new Date(emailEndDate + "T23:59:59");
            if (logDate > end) return false;
          }
        } else {
          const start = getPresetStartDate(emailDatePreset);
          if (start && logDate < start) return false;
        }
      }

      return true;
    });
  }, [emailLogs, emailSearch, emailDatePreset, emailStartDate, emailEndDate]);

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

  const activeUsers = useMemo(() => {
    return users.filter((user) => user.status !== "deleted");
  }, [users]);

  const deletedUsers = useMemo(() => {
    return users.filter((user) => user.status === "deleted");
  }, [users]);

  const filteredUsers = useMemo(() => {
    const baseList = userSubTab === "eliminados" ? deletedUsers : activeUsers;
    const query = search.trim().toLowerCase();

    if (!query) return baseList;

    return baseList.filter((user) => {
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
  }, [search, activeUsers, deletedUsers, userSubTab]);

  useEffect(() => {
    if (activeTab === "usuarios") {
      const currentInList = filteredUsers.some((u) => u.id === selectedId);
      if (!currentInList && filteredUsers.length > 0) {
        setSelectedId(filteredUsers[0].id);
      }
    }
  }, [userSubTab, filteredUsers, selectedId, activeTab]);

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
      setIsEditingUser(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function fetchCategoriesData() {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        setSuggestions(data.suggestions || []);
      }
    } catch (e) {
      console.error("Failed to fetch categories:", e);
    }
  }

  async function handleResetCategories() {
    if (!confirm("¿Seguro que deseas reestablecer todas las categorías, intereses y áreas de especialistas a los valores por defecto?")) return;
    try {
      const res = await fetch("/api/admin/categories/reset", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error al reestablecer.");
        return;
      }
      alert(data.message || "Categorías reestablecidas.");
      await fetchCategoriesData();
    } catch (e) {
      console.error(e);
      alert("Error de conexión.");
    }
  }

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryModal.category?.name?.trim()) return;

    const isEdit = !!categoryModal.category.id;
    const url = "/api/admin/categories";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryModal.category),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error al guardar la categoría.");
        return;
      }
      setCategoryModal({ isOpen: false, category: null });
      await fetchCategoriesData();
    } catch (e) {
      console.error(e);
      alert("Error de conexión.");
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("¿Deseas eliminar esta categoría? Se eliminarán también sus intereses y áreas asociadas.")) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchCategoriesData();
      } else {
        const data = await res.json();
        alert(data.message || "Error al eliminar categoría.");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddInterest(categoryId: string) {
    const text = newInterestText[categoryId]?.trim();
    if (!text) return;
    try {
      const res = await fetch("/api/admin/categories/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, name: text }),
      });
      if (res.ok) {
        setNewInterestText((prev) => ({ ...prev, [categoryId]: "" }));
        await fetchCategoriesData();
      } else {
        const data = await res.json();
        alert(data.message || "Error al crear interés.");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleToggleInterest(id: string, currentActive: boolean) {
    try {
      await fetch("/api/admin/categories/interests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentActive }),
      });
      await fetchCategoriesData();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeleteInterest(id: string) {
    if (!confirm("¿Eliminar este interés de usuario?")) return;
    try {
      await fetch(`/api/admin/categories/interests?id=${id}`, { method: "DELETE" });
      await fetchCategoriesData();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddSpecialistArea(categoryId: string) {
    const text = newAreaText[categoryId]?.trim();
    if (!text) return;
    try {
      const res = await fetch("/api/admin/categories/specialist-areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, name: text }),
      });
      if (res.ok) {
        setNewAreaText((prev) => ({ ...prev, [categoryId]: "" }));
        await fetchCategoriesData();
      } else {
        const data = await res.json();
        alert(data.message || "Error al crear área.");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleToggleSpecialistArea(id: string, currentActive: boolean) {
    try {
      await fetch("/api/admin/categories/specialist-areas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentActive }),
      });
      await fetchCategoriesData();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeleteSpecialistArea(id: string) {
    if (!confirm("¿Eliminar esta área de especialista?")) return;
    try {
      await fetch(`/api/admin/categories/specialist-areas?id=${id}`, { method: "DELETE" });
      await fetchCategoriesData();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSaveInterestName(id: string, name: string) {
    setEditingInterestId(null);
    if (!name || !name.trim()) return;
    try {
      const res = await fetch("/api/admin/categories/interests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: name.trim() }),
      });
      if (res.ok) {
        await fetchCategoriesData();
      } else {
        const data = await res.json();
        alert(data.message || "Error al renombrar el interés.");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSaveSpecialistAreaName(id: string, name: string) {
    setEditingAreaId(null);
    if (!name || !name.trim()) return;
    try {
      const res = await fetch("/api/admin/categories/specialist-areas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: name.trim() }),
      });
      if (res.ok) {
        await fetchCategoriesData();
      } else {
        const data = await res.json();
        alert(data.message || "Error al renombrar el área.");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleProcessSuggestion(id: string, action: "approve" | "reject") {
    if (action === "approve") {
      const sugg = suggestions.find((s) => s.id === id);
      if (!sugg) return;
      setSuggestionModal({
        isOpen: true,
        suggestion: sugg,
        selectedCatId: categories[0]?.id || "",
        targetType: sugg.type === "SPECIALIST_AREA" ? "SPECIALIST_AREA" : "USER_INTEREST",
      });
      return;
    }

    if (!confirm("¿Rechazar esta sugerencia?")) return;
    try {
      const res = await fetch("/api/admin/categories/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "reject" }),
      });
      if (res.ok) {
        await fetchCategoriesData();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleConfirmApproveSuggestion() {
    if (!suggestionModal.suggestion || !suggestionModal.selectedCatId) return;
    try {
      const res = await fetch("/api/admin/categories/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: suggestionModal.suggestion.id,
          action: "approve",
          categoryId: suggestionModal.selectedCatId,
          targetType: suggestionModal.targetType,
          customName: suggestionModal.suggestion.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error al aprobar.");
        return;
      }
      setSuggestionModal({ isOpen: false, suggestion: null, selectedCatId: "", targetType: "USER_INTEREST" });
      await fetchCategoriesData();
    } catch (e) {
      console.error(e);
      alert("Error de conexión.");
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
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-none outline-none cursor-pointer text-left ${activeTab === "usuarios"
              ? "bg-black text-white"
              : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950"
              }`}
          >
            <span className="material-symbols-rounded text-[20px] shrink-0">group</span>
            <span className="truncate text-left flex-1 min-w-0">Usuarios</span>
          </button>
          <button
            onClick={() => setActiveTab("chats")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-none outline-none cursor-pointer text-left ${activeTab === "chats"
              ? "bg-black text-white"
              : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950"
              }`}
          >
            <span className="material-symbols-rounded text-[20px] shrink-0">chat</span>
            <span className="truncate text-left flex-1 min-w-0">Registros de Chats</span>
          </button>
          <button
            onClick={() => setActiveTab("soporte")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-none outline-none cursor-pointer text-left ${activeTab === "soporte"
              ? "bg-black text-white"
              : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950"
              }`}
          >
            <span className="material-symbols-rounded text-[20px] shrink-0">support_agent</span>
            <span className="truncate text-left flex-1 min-w-0">Chats de LUMINUS</span>
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-none outline-none cursor-pointer text-left ${activeTab === "logs"
              ? "bg-black text-white"
              : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950"
              }`}
          >
            <span className="material-symbols-rounded text-[20px] shrink-0">receipt_long</span>
            <span className="truncate text-left flex-1 min-w-0">Historial de Acciones</span>
          </button>
          <button
            onClick={() => setActiveTab("busquedas")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-none outline-none cursor-pointer text-left ${activeTab === "busquedas"
              ? "bg-black text-white"
              : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950"
              }`}
          >
            <span className="material-symbols-rounded text-[20px] shrink-0">search</span>
            <span className="truncate text-left flex-1 min-w-0">Búsquedas de Comunidad</span>
          </button>
          <button
            onClick={() => setActiveTab("especialistas")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-none outline-none cursor-pointer text-left ${activeTab === "especialistas"
              ? "bg-black text-white"
              : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950"
              }`}
          >
            <span className="material-symbols-rounded text-[20px] shrink-0">psychology</span>
            <span className="truncate text-left flex-1 min-w-0">Especialistas</span>
          </button>
          <button
            onClick={() => setActiveTab("emails")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-none outline-none cursor-pointer text-left ${activeTab === "emails"
              ? "bg-black text-white"
              : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950"
              }`}
          >
            <span className="material-symbols-rounded text-[20px] shrink-0">mail</span>
            <span className="truncate text-left flex-1 min-w-0">Mails Enviados</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("categorias");
              fetchCategoriesData();
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-none outline-none cursor-pointer text-left ${activeTab === "categorias"
              ? "bg-black text-white"
              : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950"
              }`}
          >
            <span className="material-symbols-rounded text-[20px] shrink-0">category</span>
            <span className="truncate text-left flex-1 min-w-0 flex items-center justify-between">
              <span>Categorías</span>
              {suggestions.filter(s => s.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white leading-none">
                  {suggestions.filter(s => s.status === 'pending').length}
                </span>
              )}
            </span>
          </button>
        </nav>
      </aside>

      {/* Main Panel Content */}
      <div className="flex-1 min-w-0">
        {activeTab === "usuarios" ? (
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-bold leading-tight font-jakarta">
                  {userSubTab === "eliminados" ? "Usuarios Eliminados" : "Usuarios Activos"}
                </h1>
                <p className="mt-1 text-[14px] text-slate-500">
                  {filteredUsers.length} {filteredUsers.length === 1 ? "registro" : "registros"}
                </p>
              </div>

              {/* Sub-tab selection (Matching Mails subtab style with shadow-none) */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUserSubTab("activos")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none outline-none ${userSubTab === "activos"
                      ? "bg-white text-slate-950 shadow-none font-bold"
                      : "bg-transparent text-slate-500 hover:text-slate-900"
                    }`}
                >
                  Usuarios Activos ({activeUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserSubTab("eliminados")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none outline-none ${userSubTab === "eliminados"
                      ? "bg-white text-slate-950 shadow-none font-bold"
                      : "bg-transparent text-slate-500 hover:text-slate-900"
                    }`}
                >
                  Usuarios Eliminados ({deletedUsers.length})
                </button>
              </div>
            </header>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="flex flex-col gap-4">
                <InputField
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={userSubTab === "eliminados" ? "Buscar usuario eliminado..." : "Buscar usuario activo..."}
                  className="!w-full !h-10"
                />

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none">
                  <div className="grid grid-cols-[1.5fr_110px_130px_100px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-bold uppercase text-slate-500">
                    <span>Usuario</span>
                    <span>País</span>
                    <span>Ciudad</span>
                    <span>Alta</span>
                  </div>
                  <div className="max-h-[680px] overflow-y-auto">
                    {filteredUsers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <span className="material-symbols-rounded text-[40px] mb-2 text-slate-300">
                          {userSubTab === "eliminados" ? "person_off" : "group_off"}
                        </span>
                        <p className="text-sm font-medium">
                          {userSubTab === "eliminados"
                            ? "No hay usuarios eliminados."
                            : "No se encontraron usuarios activos."}
                        </p>
                      </div>
                    ) : (
                      filteredUsers.map((user) => {
                        const active = user.id === selectedUser?.id;

                        return (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              setSelectedId(user.id);
                              setMessage("");
                            }}
                            className={`grid w-full grid-cols-[1.5fr_110px_130px_100px] items-center border-b border-slate-100 px-4 py-3.5 text-left text-[14px] transition hover:bg-slate-50 outline-none border-none cursor-pointer ${active ? "bg-slate-100" : "bg-white"}`}
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="relative shrink-0">
                                {user.profile.avatarUrl ? (
                                  <img src={user.profile.avatarUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
                                ) : (
                                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[13px] font-bold text-slate-500 uppercase">
                                    {(user.profile.firstName || user.email).slice(0, 1).toUpperCase()}
                                  </span>
                                )}
                                {specialists.some((s) => s.userId === user.id) && (
                                  <span
                                    className="absolute -bottom-1 -right-1 text-black leading-none drop-shadow-sm select-none"
                                    title="Especialista"
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
                              <span className="min-w-0">
                                <span className="block font-semibold text-slate-900 truncate">
                                  {fieldValue(user.profile.fullName || `${user.profile.firstName} ${user.profile.lastName}`)}
                                </span>
                                <span className="block truncate text-[12px] text-slate-500">{user.email}</span>
                              </span>
                            </span>
                            <span className="truncate text-slate-600 pr-2">{fieldValue(user.profile.country)}</span>
                            <span className="truncate text-slate-600 pr-2">{fieldValue(user.profile.city)}</span>
                            <span className="text-slate-600">{formatDate(user.createdAt)}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {selectedUser && (
                <aside className="rounded-lg border border-slate-200 bg-white shadow-none flex flex-col overflow-hidden max-h-[740px] overflow-y-auto">
                  {/* Card Header */}
                  <div className="border-b border-slate-200 p-5 bg-white shrink-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className="relative shrink-0">
                          {selectedUser.profile.avatarUrl ? (
                            <img src={selectedUser.profile.avatarUrl} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-600 uppercase text-xl">
                              {(selectedUser.profile.firstName || selectedUser.email).slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          {specialists.some((s) => s.userId === selectedUser.id) && (
                            <span
                              className="absolute -bottom-1 -right-1 text-black leading-none drop-shadow-sm select-none"
                              title="Especialista"
                            >
                              <span
                                className="material-symbols-outlined text-[16px] leading-none block"
                                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
                              >
                                heart_smile
                              </span>
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="truncate text-base font-bold text-slate-900 leading-tight">
                            {fieldValue(selectedUser.profile.fullName || `${selectedUser.profile.firstName} ${selectedUser.profile.lastName}`)}
                          </h2>
                          <p className="truncate text-xs text-slate-500 mt-0.5">{selectedUser.email}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide ${selectedUser.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'}`}>
                              {selectedUser.role}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide ${selectedUser.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {selectedUser.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsEditingUser((prev) => !prev)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-none cursor-pointer transition-colors ${isEditingUser
                            ? "bg-black text-white hover:bg-slate-800"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                          }`}
                        title={isEditingUser ? "Cancelar edición" : "Editar perfil"}
                      >
                        <span className="material-symbols-rounded text-[18px] block">
                          {isEditingUser ? "close" : "edit"}
                        </span>
                      </button>
                    </div>

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
                  </div>

                  {/* Card Content */}
                  {!isEditingUser ? (
                    /* Read-Only User Card View */
                    <div className="p-5 flex flex-col gap-4.5 text-sm">
                      {/* Personal Info Card */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-3.5">
                        <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Información Personal</span>
                        <div className="grid grid-cols-2 gap-3.5 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wide">Profesión</span>
                            <span className="font-semibold text-slate-900 text-[13.5px] truncate block mt-0.5">{fieldValue(selectedUser.profile.profession)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wide">Celular</span>
                            <span className="font-semibold text-slate-900 text-[13.5px] truncate block mt-0.5">{fieldValue(selectedUser.profile.phoneNumber)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wide">Ciudad</span>
                            <span className="font-semibold text-slate-900 text-[13.5px] truncate block mt-0.5">{fieldValue(selectedUser.profile.city)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wide">País</span>
                            <span className="font-semibold text-slate-900 text-[13.5px] truncate block mt-0.5">{fieldValue(selectedUser.profile.country)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wide">Género</span>
                            <span className="font-semibold text-slate-900 text-[13.5px] truncate block mt-0.5">{fieldValue(selectedUser.profile.gender)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wide">Nacimiento</span>
                            <span className="font-semibold text-slate-900 text-[13.5px] truncate block mt-0.5">{fieldValue(selectedUser.profile.birthdate)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Subscription & Status Card */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-3.5">
                        <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Cuenta y Estado</span>
                        <div className="grid grid-cols-2 gap-3.5 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wide">Plan</span>
                            <span className="inline-block mt-1 px-3 py-1 rounded-md bg-white border border-slate-200 font-bold text-slate-800 text-[12px]">
                              {fieldValue(selectedUser.profile.selectedPlan)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wide">Onboarding</span>
                            <span className={`inline-block mt-1 px-3 py-1 rounded-md font-bold text-[12px] ${selectedUser.profile.isOnboarded ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {selectedUser.profile.isOnboarded ? 'Completado' : 'Pendiente'}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wide">Último Login</span>
                            <span className="font-semibold text-slate-900 text-[13.5px] block mt-0.5">{formatDate(selectedUser.lastLoginAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bio Card */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-1.5">
                        <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Biografía</span>
                        <p className="text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-wrap mt-0.5">
                          {selectedUser.profile.bio || "Sin biografía especificada."}
                        </p>
                      </div>

                      {/* Intereses Card */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-2.5">
                        <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Intereses</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.interests.length > 0 ? (
                            selectedUser.interests.map((interest) => (
                              <span key={interest.id} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-slate-700">
                                {interest.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[13px] text-slate-400 italic">Sin intereses declarados</span>
                          )}
                        </div>
                      </div>

                      {message && <p className={`text-[13px] font-semibold ${message.includes("guardados") ? "text-emerald-600" : "text-red-500"}`}>{message}</p>}

                      <Button
                        type="button"
                        onClick={() => setIsEditingUser(true)}
                        className="w-full mt-1 !h-10 bg-black hover:bg-slate-800 text-white font-bold transition-all shadow-none text-xs"
                      >
                        Editar perfil
                      </Button>
                    </div>
                  ) : (
                    /* Edit Mode Form */
                    <form
                      key={selectedUser.id}
                      onSubmit={(event) => {
                        event.preventDefault();
                        updateSelectedUser(new FormData(event.currentTarget));
                      }}
                      className="p-5 flex flex-col gap-4 text-sm"
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
                            className="!h-9 text-[13px]"
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
                            className="!h-9 text-[13px]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold uppercase text-slate-400">Nombre</span>
                          <InputField name="firstName" defaultValue={selectedUser.profile.firstName} className="!h-9 text-[13px]" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold uppercase text-slate-400">Apellido</span>
                          <InputField name="lastName" defaultValue={selectedUser.profile.lastName} className="!h-9 text-[13px]" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Profesion</span>
                        <InputField name="profession" defaultValue={selectedUser.profile.profession} className="!h-9 text-[13px]" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold uppercase text-slate-400">Ciudad</span>
                          <InputField name="city" defaultValue={selectedUser.profile.city} className="!h-9 text-[13px]" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold uppercase text-slate-400">Pais</span>
                          <InputField name="country" defaultValue={selectedUser.profile.country} className="!h-9 text-[13px]" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold uppercase text-slate-400">Celular</span>
                          <InputField name="phoneNumber" defaultValue={selectedUser.profile.phoneNumber} className="!h-9 text-[13px]" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold uppercase text-slate-400">Plan</span>
                          <InputField name="selectedPlan" defaultValue={selectedUser.profile.selectedPlan} className="!h-9 text-[13px]" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold uppercase text-slate-400">Genero</span>
                          <InputField name="gender" defaultValue={selectedUser.profile.gender} className="!h-9 text-[13px]" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold uppercase text-slate-400">Nacimiento</span>
                          <InputField type="date" name="birthdate" defaultValue={selectedUser.profile.birthdate} className="!h-9 text-[13px]" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Bio</span>
                        <textarea name="bio" defaultValue={selectedUser.profile.bio} rows={2.5} className="rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-900 font-medium outline-none resize-none min-h-[64px]" />
                      </div>

                      <label className="flex items-center gap-2.5 text-[13px] font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" name="isOnboarded" defaultChecked={selectedUser.profile.isOnboarded} className="h-4.5 w-4.5 accent-black rounded cursor-pointer" />
                        Onboarding completo
                      </label>

                      {message && <p className={`text-[13px] font-semibold ${message.includes("guardados") ? "text-emerald-600" : "text-red-500"}`}>{message}</p>}

                      <div className="flex gap-2 mt-2">
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
                          className="!h-10 flex-1 font-bold bg-black hover:bg-slate-800 text-white shadow-none text-xs"
                        >
                          {isSaving ? "Guardando..." : "Guardar cambios"}
                        </Button>
                      </div>
                    </form>
                  )}
                </aside>
              )}
            </section>
          </div>
        ) : activeTab === "chats" ? (
          /* Registros de Chats Tab */
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8 animate-in fade-in duration-200">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-bold leading-tight font-jakarta">Registros de Chats</h1>
                <p className="mt-1 text-[14px] text-slate-500">{filteredChats.length} {filteredChats.length === 1 ? "conversación registrada" : "conversaciones registradas"}</p>
              </div>
            </header>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              {/* Left Column: list of chats */}
              <div className="flex flex-col gap-4">
                <InputField
                  value={chatSearch}
                  onChange={(event) => setChatSearch(event.target.value)}
                  placeholder="Buscar conversación por usuario..."
                  className="!w-full !h-10"
                />

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none">
                  <div className="grid grid-cols-[1fr_1fr_120px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-bold uppercase text-slate-500">
                    <span>Usuario Iniciador</span>
                    <span>Usuario Contactado</span>
                    <span>Fecha</span>
                  </div>
                  <div className="max-h-[460px] overflow-y-auto">
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
              </div>

              {/* Right Column: selected chat messages thread */}
              {selectedChat ? (
                <aside className="rounded-lg border border-slate-200 bg-white flex flex-col h-[520px] overflow-hidden shadow-none">
                  {/* Header */}
                  <div className="border-b border-slate-200 px-5 py-4 shrink-0">
                    <h2 className="text-base font-bold text-slate-900 font-jakarta">Conversación</h2>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      Entre <span className="font-semibold">{selectedChat.user1?.name}</span> y <span className="font-semibold">{selectedChat.user2?.name}</span>
                    </p>
                  </div>

                  {/* Message Thread */}
                  <div className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-2 custom-scrollbar">
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
                              <div className={`py-2 px-3 rounded-xl text-[13px] leading-relaxed ${isUser1
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
                <div className="rounded-lg border border-slate-200 border-dashed bg-slate-50 flex items-center justify-center text-slate-400 p-8 text-center h-[520px] shadow-none">
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
                <p className="mt-1 text-[14px] text-slate-500">{filteredSupportChats.length} {filteredSupportChats.length === 1 ? "conversación de soporte" : "conversaciones de soporte"}</p>
              </div>
            </header>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              {/* Left Column: list of support chats */}
              <div className="flex flex-col gap-4">
                <InputField
                  value={supportSearch}
                  onChange={(event) => setSupportSearch(event.target.value)}
                  placeholder="Buscar chat de soporte por usuario..."
                  className="!w-full !h-10"
                />

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none">
                  <div className="grid grid-cols-[1fr_120px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-bold uppercase text-slate-500">
                    <span>Usuario</span>
                    <span>Última Actividad</span>
                  </div>
                  <div className="max-h-[460px] overflow-y-auto">
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
              </div>

              {/* Right Column: messages and reply form */}
              {selectedSupportChat ? (
                <aside className="rounded-lg border border-slate-200 bg-white flex flex-col h-[520px] overflow-hidden shadow-none">
                  {/* Header */}
                  <div className="border-b border-slate-200 px-5 py-4 shrink-0">
                    <h2 className="text-base font-bold text-slate-900 font-jakarta">Conversación con Soporte</h2>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      Usuario: <span className="font-semibold">{selectedSupportChat.user1?.email === "info@luminuslatam.com" ? selectedSupportChat.user2?.name : selectedSupportChat.user1?.name}</span>
                    </p>
                  </div>

                  {/* Message Thread */}
                  <div className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-2 custom-scrollbar">
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
                              <div className={`py-2 px-3 rounded-xl text-[13px] leading-relaxed ${isSystem
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
                <div className="rounded-lg border border-slate-200 border-dashed bg-slate-50 flex items-center justify-center text-slate-400 p-8 text-center h-[520px] shadow-none">
                  <p className="text-sm font-medium">Selecciona una conversación de soporte para responder.</p>
                </div>
              )}
            </section>
          </div>
        ) : activeTab === "emails" ? (
          /* Mails Enviados Tab */
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8 animate-in fade-in duration-200">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-bold leading-tight font-jakarta">Mails Enviados</h1>
                <p className="mt-1 text-[14px] text-slate-500">Gestión y control de correos del sistema</p>
              </div>

              {/* Sub-tab selection */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setEmailSubTab("historial")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none outline-none ${emailSubTab === "historial" ? "bg-white text-slate-950 shadow-none font-bold" : "bg-transparent text-slate-500 hover:text-slate-900"}`}
                >
                  Historial de Envíos
                </button>
                <button
                  onClick={() => setEmailSubTab("plantillas")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none outline-none ${emailSubTab === "plantillas" ? "bg-white text-slate-950 shadow-none font-bold" : "bg-transparent text-slate-500 hover:text-slate-900"}`}
                >
                  Plantillas de Diseño
                </button>
              </div>
            </header>

            {emailSubTab === "historial" ? (
              /* Email Logs Sub-tab */
              <div className="flex flex-col gap-4">
                {/* Search and filters bar over list without container box */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <InputField
                      value={emailSearch}
                      onChange={(e) => setEmailSearch(e.target.value)}
                      placeholder="Buscar por email o asunto..."
                      className="!w-full !h-10"
                    />
                  </div>

                  <div className="min-w-[160px]">
                    <SelectInput
                      value={emailDatePreset}
                      options={[
                        { label: "Todo el tiempo", value: "all" },
                        { label: "Esta semana", value: "week" },
                        { label: "Este mes", value: "month" },
                        { label: "Últimos 6 meses", value: "6months" },
                        { label: "Este año", value: "year" },
                        { label: "Trimestre actual", value: "quarter" },
                        { label: "Fechas fijas", value: "custom" },
                      ]}
                      onSelect={(val) => setEmailDatePreset(val)}
                      className="!h-10"
                    />
                  </div>

                  {emailDatePreset === "custom" && (
                    <>
                      <div className="w-[120px]">
                        <InputField
                          type="date"
                          value={emailStartDate}
                          onChange={(e) => setEmailStartDate(e.target.value)}
                          className="!h-10"
                        />
                      </div>
                      <div className="w-[120px]">
                        <InputField
                          type="date"
                          value={emailEndDate}
                          onChange={(e) => setEmailEndDate(e.target.value)}
                          className="!h-10"
                        />
                      </div>
                    </>
                  )}

                  <Button
                    type="button"
                    variant="small"
                    onClick={() => {
                      setEmailSearch("");
                      setEmailDatePreset("all");
                      setEmailStartDate("");
                      setEmailEndDate("");
                    }}
                    className="!h-10 shrink-0"
                  >
                    Limpiar filtros
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_450px]">
                  {/* List of Sent Emails */}
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none">
                    <div className="grid grid-cols-[1.5fr_1.8fr_130px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-bold uppercase text-slate-500">
                      <span>Destinatario</span>
                      <span>Asunto</span>
                      <span>Fecha</span>
                    </div>
                    <div className="max-h-[680px] overflow-y-auto">
                      {filteredEmailLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                          <span className="material-symbols-rounded text-[48px] mb-3 text-slate-300">mail</span>
                          <p className="text-sm font-medium">No se encontraron mails enviados.</p>
                        </div>
                      ) : (
                        filteredEmailLogs.map((log) => {
                          const active = log.id === selectedEmailLog?.id;
                          return (
                            <button
                              key={log.id}
                              type="button"
                              onClick={() => setSelectedEmailLogId(log.id)}
                              className={`grid w-full grid-cols-[1.5fr_1.8fr_130px] items-center border-b border-slate-100 px-4 py-3.5 text-left text-[14px] transition hover:bg-slate-50 outline-none border-none cursor-pointer ${active ? "bg-slate-100" : "bg-white"}`}
                            >
                              <span className="truncate font-semibold text-slate-900 pr-2">{log.recipient}</span>
                              <span className="truncate text-slate-600 pr-2">{log.subject}</span>
                              <span className="text-slate-500 text-xs font-sans">{formatShortTime(log.createdAt)}</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* HTML Email Reader side-panel */}
                  {selectedEmailLog ? (
                    <aside className="rounded-lg border border-slate-200 bg-white flex flex-col h-[740px] overflow-hidden shadow-none">
                      {/* Header */}
                      <div className="border-b border-slate-200 p-5 shrink-0 bg-slate-50/50">
                        <div className="flex flex-col gap-1.5">
                          <h2 className="text-[15px] font-bold text-slate-900 leading-tight truncate">{selectedEmailLog.subject}</h2>
                          <div className="text-[12px] text-slate-500 space-y-0.5 mt-1 font-sans">
                            <p><span className="font-semibold text-slate-700">Para:</span> {selectedEmailLog.recipient}</p>
                            <p><span className="font-semibold text-slate-700">Fecha:</span> {formatShortTime(selectedEmailLog.createdAt)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Iframe content */}
                      <div className="flex-1 bg-[#F8FAFC] p-4 overflow-hidden flex flex-col">
                        <iframe
                          title="Visualización de Mail"
                          srcDoc={selectedEmailLog.htmlBody}
                          className="w-full h-full border border-slate-200 rounded-xl bg-white shadow-sm flex-1"
                          sandbox="allow-same-origin"
                        />
                      </div>
                    </aside>
                  ) : (
                    <div className="rounded-lg border border-slate-200 border-dashed bg-slate-50 flex items-center justify-center text-slate-400 p-8 text-center h-[740px] shadow-none">
                      <p className="text-sm font-medium">Selecciona un correo del historial para visualizar su contenido.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Templates Preview Sub-tab */
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
                {/* Left Column: list of templates */}
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none h-fit">
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-bold uppercase text-slate-500">
                    Plantillas Disponibles
                  </div>
                  <div className="flex flex-col p-2 gap-1 bg-white">
                    <button
                      type="button"
                      onClick={() => setSelectedTemplate("recovery")}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none outline-none ${selectedTemplate === "recovery" ? "bg-black text-white" : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                    >
                      Restablecer contraseña
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTemplate("emailChange")}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none outline-none ${selectedTemplate === "emailChange" ? "bg-black text-white" : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                    >
                      Confirmar Email
                    </button>
                  </div>
                </div>

                {/* Right Column: template details & iframe preview */}
                <aside className="rounded-lg border border-slate-200 bg-white flex flex-col h-[740px] overflow-hidden shadow-none">
                  <div className="border-b border-slate-200 p-5 shrink-0 bg-slate-50/50">
                    <h2 className="text-[16px] font-bold text-slate-900 font-jakarta leading-tight">
                      {templatesData[selectedTemplate].name}
                    </h2>
                    <p className="text-[12px] text-slate-500 mt-1.5 font-sans">
                      <span className="font-semibold text-slate-700">Asunto predeterminado:</span> {templatesData[selectedTemplate].subject}
                    </p>
                  </div>
                  <div className="flex-1 bg-[#F8FAFC] p-4 overflow-hidden flex flex-col">
                    <iframe
                      title="Vista Previa de Plantilla"
                      srcDoc={templatesData[selectedTemplate].htmlBody}
                      className="w-full h-full border border-slate-200 rounded-xl bg-white shadow-sm flex-1"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </aside>
              </div>
            )}
          </div>
        ) : activeTab === "logs" ? (
          /* Registros de Actividad Log Tab */
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8 animate-in fade-in duration-200">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-bold leading-tight font-jakarta">Historial de Acciones</h1>
                <p className="mt-1 text-[14px] text-slate-500">{filteredLogs.length} acciones filtradas</p>
              </div>
            </header>

            {/* Filter controls row over table without container box */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[220px]">
                <InputField
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Buscar por usuario o término..."
                  className="!w-full !h-10"
                />
              </div>

              <div className="min-w-[170px]">
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
                  className="!h-10"
                />
              </div>

              <div className="min-w-[170px]">
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
                  className="!h-10"
                />
              </div>

              {logDatePreset === "custom" && (
                <>
                  <div className="w-[130px]">
                    <InputField
                      type="date"
                      value={logStartDate}
                      onChange={(e) => setLogStartDate(e.target.value)}
                      className="!h-10"
                    />
                  </div>
                  <div className="w-[130px]">
                    <InputField
                      type="date"
                      value={logEndDate}
                      onChange={(e) => setLogEndDate(e.target.value)}
                      className="!h-10"
                    />
                  </div>
                </>
              )}

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
              <div className="grid grid-cols-[1.5fr_1.2fr_2fr_180px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-bold uppercase text-slate-500">
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
                      className="grid w-full grid-cols-[1.5fr_1.2fr_2fr_180px] items-center border-b border-slate-100 px-4 py-3.5 text-left text-[14px] transition hover:bg-slate-50/50 bg-white"
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
        ) : activeTab === "busquedas" ? (
          /* Búsquedas de Comunidad Tab */
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8 animate-in fade-in duration-200">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-bold leading-tight font-jakarta">Búsquedas de Comunidad</h1>
                <p className="mt-1 text-[14px] text-slate-500">{filteredSearches.length} {filteredSearches.length === 1 ? "búsqueda registrada" : "búsquedas registradas"}</p>
              </div>
            </header>

            <InputField
              value={searchQueryFilter}
              onChange={(event) => setSearchQueryFilter(event.target.value)}
              placeholder="Buscar por usuario o término..."
              className="!w-full !h-10"
            />

            {/* Table */}
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none">
              <div className="grid grid-cols-[1.5fr_2fr_180px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-bold uppercase text-slate-500">
                <span>Usuario</span>
                <span>Término Buscado</span>
                <span>Fecha y Hora</span>
              </div>
              <div className="max-h-[680px] overflow-y-auto">
                {filteredSearches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <span className="material-symbols-rounded text-[48px] mb-3 text-slate-300">search</span>
                    <p className="text-sm font-medium">No se encontraron registros de búsquedas.</p>
                  </div>
                ) : (
                  filteredSearches.map((searchLog) => (
                    <div
                      key={searchLog.id}
                      className="grid w-full grid-cols-[1.5fr_2fr_180px] items-center border-b border-slate-100 px-4 py-3.5 text-left text-[14px] transition hover:bg-slate-50/50 bg-white"
                    >
                      {/* User */}
                      <span className="flex min-w-0 items-center gap-3">
                        {searchLog.user.profile.avatarUrl ? (
                          <img src={searchLog.user.profile.avatarUrl} alt="" className="h-9 w-9 rounded-lg object-cover shrink-0" />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[13px] font-bold text-slate-500 uppercase shrink-0">
                            {(searchLog.user.profile.fullName || searchLog.user.email).slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-slate-900">
                            {fieldValue(searchLog.user.profile.fullName || `${searchLog.user.profile.firstName} ${searchLog.user.profile.lastName}`)}
                          </span>
                          <span className="block truncate text-[12px] text-slate-500">{searchLog.user.email}</span>
                        </span>
                      </span>

                      {/* Query */}
                      <span className="text-slate-900 font-semibold bg-slate-50 rounded-xl px-4 py-2 w-fit border border-slate-200 inline-flex items-center gap-1.5 shadow-sm">
                        <span className="material-symbols-rounded text-slate-400 text-sm select-none">search</span>
                        {searchLog.query}
                      </span>

                      {/* Date */}
                      <span className="text-slate-500 font-sans text-xs">
                        {formatShortTime(searchLog.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : activeTab === "especialistas" ? (
          /* Especialistas & Postulaciones Tab */
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8 animate-in fade-in duration-200">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-bold leading-tight font-jakarta">
                  {specialistSubTab === "lista" ? "Especialistas Activos" : "Postulaciones Pendientes"}
                </h1>
                <p className="mt-1 text-[14px] text-slate-500">
                  {specialistSubTab === "lista"
                    ? `${filteredSpecialists.length} ${filteredSpecialists.length === 1 ? "especialista registrado" : "especialistas registrados"}`
                    : `${postulations.length} ${postulations.length === 1 ? "postulación pendiente" : "postulaciones pendientes"}`}
                </p>
              </div>

              {/* Sub-tab selection (Matching Usuarios benchmark) */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSpecialistSubTab("lista")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none outline-none ${specialistSubTab === "lista"
                      ? "bg-white text-slate-950 shadow-none font-bold"
                      : "bg-transparent text-slate-500 hover:text-slate-900"
                    }`}
                >
                  Especialistas Activos ({specialists.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSpecialistSubTab("postulaciones")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none outline-none ${specialistSubTab === "postulaciones"
                      ? "bg-white text-slate-950 shadow-none font-bold"
                      : "bg-transparent text-slate-500 hover:text-slate-900"
                    }`}
                >
                  Postulaciones ({postulations.length})
                </button>
              </div>
            </header>

            {specialistSubTab === "lista" ? (
              /* Specialists List Subtab */
              <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                {/* Left Column: List of Specialists */}
                <div className="flex flex-col gap-4">
                  <InputField
                    value={specialistSearch}
                    onChange={(event) => setSpecialistSearch(event.target.value)}
                    placeholder="Buscar especialista..."
                    className="!w-full !h-10"
                  />

                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none">
                    <div className="grid grid-cols-[1.4fr_1.6fr_1.1fr_100px_90px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-bold uppercase text-slate-500">
                      <span>Usuario</span>
                      <span>Especialidad / Título</span>
                      <span>Consultorio</span>
                      <span>Redes</span>
                      <span className="text-right">Acción</span>
                    </div>
                    <div className="max-h-[680px] overflow-y-auto">
                      {filteredSpecialists.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                          <span className="material-symbols-rounded text-[48px] mb-3 text-slate-300">psychology</span>
                          <p className="text-sm font-medium">No se encontraron especialistas.</p>
                        </div>
                      ) : (
                        filteredSpecialists.map((spec) => {
                          const active = spec.userId === selectedSpecialist?.userId;

                          return (
                            <button
                              key={spec.userId}
                              type="button"
                              onClick={() => setSelectedSpecialistUserId(spec.userId)}
                              className={`grid w-full grid-cols-[1.4fr_1.6fr_1.1fr_100px_90px] items-center border-b border-slate-100 px-4 py-3.5 text-left text-[14px] transition hover:bg-slate-50 outline-none border-none cursor-pointer ${active ? "bg-slate-100" : "bg-white"}`}
                            >
                              {/* User info */}
                              <span className="flex min-w-0 items-center gap-3 pr-2">
                                <span className="relative shrink-0">
                                  {spec.user.profile.avatarUrl ? (
                                    <img src={spec.user.profile.avatarUrl} alt="" className="h-9 w-9 rounded-lg object-cover shrink-0" />
                                  ) : (
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[13px] font-bold text-slate-500 uppercase shrink-0">
                                      {(spec.user.profile.fullName || spec.user.email).slice(0, 1).toUpperCase()}
                                    </span>
                                  )}
                                  <span
                                    className="absolute -bottom-1 -right-1 text-black leading-none drop-shadow-sm select-none"
                                    title="Especialista"
                                  >
                                    <span
                                      className="material-symbols-outlined text-[13px] leading-none block"
                                      style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
                                    >
                                      heart_smile
                                    </span>
                                  </span>
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate font-semibold text-slate-900">
                                    {fieldValue(spec.user.profile.fullName || `${spec.user.profile.firstName} ${spec.user.profile.lastName}`)}
                                  </span>
                                  <span className="block truncate text-[12px] text-slate-500">{spec.user.email}</span>
                                </span>
                              </span>

                              {/* Specialty / Title */}
                              <span className="flex flex-col gap-0.5 pr-2 min-w-0">
                                <span className="font-semibold text-slate-900 truncate">{spec.specialty}</span>
                                <span className="text-[12px] text-slate-500 truncate">{spec.title}</span>
                              </span>

                              {/* Clinic */}
                              <span className="text-slate-600 font-medium truncate pr-2">
                                {fieldValue(spec.clinicName)}
                              </span>

                              {/* Social Links */}
                              <span className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                {spec.linkedinUrl ? (
                                  <a
                                    href={spec.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#0077B5] hover:border-[#0077B5]/30 transition-colors"
                                    title="LinkedIn"
                                  >
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                                    </svg>
                                  </a>
                                ) : null}
                                {spec.instagramUrl ? (
                                  <a
                                    href={spec.instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#E1306C] hover:border-[#E1306C]/30 transition-colors"
                                    title="Instagram"
                                  >
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m4.4 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9m0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5m4.7-.8a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                                    </svg>
                                  </a>
                                ) : null}
                                {spec.websiteUrl ? (
                                  <a
                                    href={spec.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-black hover:border-black/30 transition-colors"
                                    title="Sitio Web"
                                  >
                                    <span className="material-symbols-rounded text-[16px]">language</span>
                                  </a>
                                ) : null}
                                {!spec.linkedinUrl && !spec.instagramUrl && !spec.websiteUrl && (
                                  <span className="text-slate-400 text-xs italic">-</span>
                                )}
                              </span>

                              {/* Action */}
                              <div className="text-right" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSpecialist(spec.userId)}
                                  disabled={isProcessingAction}
                                  className="text-[12px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100/80 px-2.5 py-1 rounded-lg border-none cursor-pointer transition disabled:opacity-50"
                                >
                                  Remover
                                </button>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Selected Specialist Side Detail Panel */}
                {selectedSpecialist ? (
                  <aside className="rounded-lg border border-slate-200 bg-white shadow-none flex flex-col overflow-hidden max-h-[740px] overflow-y-auto">
                    {/* Header */}
                    <div className="border-b border-slate-200 p-5 bg-white shrink-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <div className="relative shrink-0">
                            {selectedSpecialist.user.profile.avatarUrl ? (
                              <img src={selectedSpecialist.user.profile.avatarUrl} alt="" className="h-14 w-14 rounded-2xl object-cover shrink-0" />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-600 uppercase text-xl shrink-0">
                                {(selectedSpecialist.user.profile.fullName || selectedSpecialist.user.email).slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <span
                              className="absolute -bottom-1 -right-1 text-black leading-none drop-shadow-sm select-none"
                              title="Especialista"
                            >
                              <span
                                className="material-symbols-outlined text-[16px] leading-none block"
                                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
                              >
                                heart_smile
                              </span>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h2 className="truncate text-base font-bold text-slate-900 leading-tight">
                              {fieldValue(selectedSpecialist.user.profile.fullName || `${selectedSpecialist.user.profile.firstName} ${selectedSpecialist.user.profile.lastName}`)}
                            </h2>
                            <p className="truncate text-xs text-slate-500 mt-0.5">{selectedSpecialist.user.email}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800">
                                {selectedSpecialist.specialty}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsEditingSpecialist((prev) => !prev)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-none cursor-pointer transition-colors ${isEditingSpecialist
                              ? "bg-black text-white hover:bg-slate-800"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                            }`}
                          title={isEditingSpecialist ? "Cancelar edición" : "Editar especialista"}
                        >
                          <span className="material-symbols-rounded text-[18px] block">
                            {isEditingSpecialist ? "close" : "edit"}
                          </span>
                        </button>
                      </div>

                      {/* Button: Ver perfil de usuario */}
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          const linkedUser = users.find((u) => u.id === selectedSpecialist.userId);
                          if (linkedUser) {
                            setSelectedId(linkedUser.id);
                            setUserSubTab(linkedUser.status === "deleted" ? "eliminados" : "activos");
                            setActiveTab("usuarios");
                          } else {
                            alert("Usuario no encontrado en la lista actual.");
                          }
                        }}
                        className="w-full mt-4 flex items-center justify-center !h-9 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border-none shadow-none transition-colors"
                      >
                        Ver perfil de usuario
                      </Button>
                    </div>

                    {!isEditingSpecialist ? (
                      /* Specialist Detailed Content - Read Only */
                      <div className="p-5 flex flex-col gap-4.5 text-sm">
                        {/* Professional Info Card */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-3.5">
                          <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Información Profesional</span>
                          <div className="flex flex-col gap-3 text-xs">
                            <div>
                              <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wide">Título Profesional</span>
                              <span className="font-semibold text-slate-900 text-[13.5px] block mt-0.5">{fieldValue(selectedSpecialist.title)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wide">Consultorio / Espacio</span>
                              <span className="font-semibold text-slate-900 text-[13.5px] block mt-0.5">{fieldValue(selectedSpecialist.clinicName)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bio Card */}
                        {selectedSpecialist.bio && (
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-1.5">
                            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Biografía y Enfoque</span>
                            <p className="text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-wrap mt-0.5">{selectedSpecialist.bio}</p>
                          </div>
                        )}

                        {/* Social Links Card */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-3">
                          <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Redes y Enlaces</span>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {selectedSpecialist.linkedinUrl && (
                              <a href={selectedSpecialist.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#0077B5] transition-colors font-medium text-[13px]">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
                                LinkedIn
                              </a>
                            )}
                            {selectedSpecialist.instagramUrl && (
                              <a href={selectedSpecialist.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#E1306C] transition-colors font-medium text-[13px]">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m4.4 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9m0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5m4.7-.8a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" /></svg>
                                Instagram
                              </a>
                            )}
                            {selectedSpecialist.websiteUrl && (
                              <a href={selectedSpecialist.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-black transition-colors font-medium text-[13px]">
                                <span className="material-symbols-rounded text-[16px]">language</span>
                                Sitio Web
                              </a>
                            )}
                            {!selectedSpecialist.linkedinUrl && !selectedSpecialist.instagramUrl && !selectedSpecialist.websiteUrl && (
                              <span className="text-[13px] text-slate-400 italic">Sin redes agregadas</span>
                            )}
                          </div>
                        </div>

                        {/* Courses Card */}
                        {selectedSpecialist.courses && Array.isArray(selectedSpecialist.courses) && selectedSpecialist.courses.length > 0 && (
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-2.5">
                            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Cursos ({selectedSpecialist.courses.length})</span>
                            <div className="flex flex-wrap gap-2">
                              {selectedSpecialist.courses.map((course: any, idx: number) => (
                                <a
                                  key={idx}
                                  href={course.url || course.coverUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 text-[12.5px] font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-lg transition-colors border border-slate-200"
                                  title={course.description || course.name || course.title}
                                >
                                  {course.name || course.title || `Curso ${idx + 1}`}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Remove button */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecialist(selectedSpecialist.userId)}
                            disabled={isProcessingAction}
                            className="w-full text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 py-2.5 rounded-xl border border-red-200/50 cursor-pointer transition disabled:opacity-50"
                          >
                            Remover Especialista
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Specialist Edit Mode Form */
                      <form
                        key={selectedSpecialist.userId}
                        onSubmit={(event) => {
                          event.preventDefault();
                          updateSelectedSpecialist(new FormData(event.currentTarget));
                        }}
                        className="p-5 flex flex-col gap-4 text-sm"
                      >
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold uppercase text-slate-400">Especialidad</span>
                          <InputField name="specialty" defaultValue={selectedSpecialist.specialty} className="!h-9 text-[13px]" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold uppercase text-slate-400">Título Profesional</span>
                          <InputField name="title" defaultValue={selectedSpecialist.title} className="!h-9 text-[13px]" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold uppercase text-slate-400">Consultorio / Espacio</span>
                          <InputField name="clinicName" defaultValue={selectedSpecialist.clinicName || ""} className="!h-9 text-[13px]" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold uppercase text-slate-400">Biografía y Enfoque</span>
                          <textarea name="bio" defaultValue={selectedSpecialist.bio || ""} rows={3} className="rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-900 font-medium outline-none resize-none min-h-[72px]" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold uppercase text-slate-400">LinkedIn URL</span>
                          <InputField name="linkedinUrl" defaultValue={selectedSpecialist.linkedinUrl || ""} className="!h-9 text-[13px]" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold uppercase text-slate-400">Instagram URL</span>
                          <InputField name="instagramUrl" defaultValue={selectedSpecialist.instagramUrl || ""} className="!h-9 text-[13px]" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold uppercase text-slate-400">Sitio Web URL</span>
                          <InputField name="websiteUrl" defaultValue={selectedSpecialist.websiteUrl || ""} className="!h-9 text-[13px]" />
                        </div>

                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsEditingSpecialist(false)}
                            disabled={isProcessingAction}
                            className="!h-10 flex-1 font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border-none shadow-none text-xs"
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            disabled={isProcessingAction}
                            className="!h-10 flex-1 font-bold bg-black hover:bg-slate-800 text-white shadow-none text-xs"
                          >
                            {isProcessingAction ? "Guardando..." : "Guardar cambios"}
                          </Button>
                        </div>
                      </form>
                    )}
                  </aside>
                ) : (
                  <div className="rounded-lg border border-slate-200 border-dashed bg-slate-50 flex items-center justify-center text-slate-400 p-8 text-center h-[520px] shadow-none">
                    <p className="text-sm font-medium">Selecciona un especialista para ver los detalles.</p>
                  </div>
                )}
              </section>
            ) : (
              /* Postulations Subtab */
              <div className="flex flex-col gap-6">
                {postulations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white border border-slate-200 rounded-xl">
                    <span className="material-symbols-rounded text-[48px] mb-3 text-slate-300">assignment</span>
                    <p className="text-sm font-medium">No hay postulaciones pendientes de revisión.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {postulations.map((post) => (
                      <div key={post.id} className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-5 shadow-none animate-in fade-in duration-200">
                        {/* Postulation Header */}
                        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-3">
                            {post.user.profile.avatarUrl ? (
                              <img src={post.user.profile.avatarUrl} alt="" className="h-12 w-12 rounded-xl object-cover shrink-0" />
                            ) : (
                              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-[16px] font-bold text-slate-500 uppercase shrink-0">
                                {(post.user.profile.fullName || post.user.email).slice(0, 1).toUpperCase()}
                              </span>
                            )}
                            <div>
                              <h3 className="text-[16px] font-bold text-slate-900 leading-tight">
                                {fieldValue(post.user.profile.fullName || `${post.user.profile.firstName} ${post.user.profile.lastName}`)}
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">{post.user.email} • Postulado el {formatShortTime(post.createdAt)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handlePostulationAction(post.id, "decline")}
                              disabled={isProcessingAction}
                              className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 bg-white text-xs font-bold transition active:scale-95 cursor-pointer disabled:opacity-50 h-9 flex items-center justify-center"
                            >
                              Rechazar
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePostulationAction(post.id, "accept")}
                              disabled={isProcessingAction}
                              className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-900 text-white text-xs font-bold transition active:scale-95 border-none cursor-pointer disabled:opacity-50 h-9 flex items-center justify-center"
                            >
                              Aceptar Especialista
                            </button>
                          </div>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[14px]">
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Especialidad</span>
                            <span className="font-semibold text-slate-900">{post.specialty}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Título Profesional</span>
                            <span className="font-medium text-slate-800">{post.title}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Consultorio / Espacio</span>
                            <span className="font-medium text-slate-800">{fieldValue(post.clinicName)}</span>
                          </div>
                        </div>

                        {/* Bio */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-1 text-[13.5px]">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Biografía y Enfoque</span>
                          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed mt-1">{post.bio}</p>
                        </div>

                        {/* Footer (Socials & Courses) */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                          {/* Links */}
                          <div className="flex items-center gap-3">
                            {post.linkedinUrl && (
                              <a href={post.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slate-500 hover:text-[#0077B5] transition-colors text-xs font-medium">
                                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
                                LinkedIn
                              </a>
                            )}
                            {post.instagramUrl && (
                              <a href={post.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slate-500 hover:text-[#E1306C] transition-colors text-xs font-medium">
                                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m4.4 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9m0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5m4.7-.8a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" /></svg>
                                Instagram
                              </a>
                            )}
                            {post.websiteUrl && (
                              <a href={post.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slate-500 hover:text-black transition-colors text-xs font-medium">
                                <span className="material-symbols-rounded text-[16px] shrink-0">language</span>
                                Sitio Web
                              </a>
                            )}
                          </div>

                          {/* Courses */}
                          {post.courses && Array.isArray(post.courses) && post.courses.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Cursos ({post.courses.length}):</span>
                              <div className="flex gap-2">
                                {post.courses.map((course: any, idx: number) => (
                                  <a
                                    key={idx}
                                    href={course.url || course.coverUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200/50"
                                    title={course.description || course.name || course.title}
                                  >
                                    {course.name || course.title || `Curso ${idx + 1}`}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : activeTab === "categorias" ? (
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 py-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-bold leading-tight font-jakarta">Categorías</h1>
                <p className="mt-1 text-[14px] text-slate-500">
                  {categorySubTab === "lista"
                    ? `${categories.length} ${categories.length === 1 ? "categoría registrada" : "categorías registradas"}`
                    : `${suggestions.length} ${suggestions.length === 1 ? "sugerencia registrada" : "sugerencias registradas"}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCategorySubTab("lista")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none outline-none ${categorySubTab === "lista" ? "bg-white text-slate-950 font-bold" : "bg-transparent text-slate-500 hover:text-slate-900"
                      }`}
                  >
                    Categorías Generales ({categories.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategorySubTab("sugerencias")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none outline-none flex items-center gap-1.5 ${categorySubTab === "sugerencias" ? "bg-white text-slate-950 font-bold" : "bg-transparent text-slate-500 hover:text-slate-900"
                      }`}
                  >
                    Sugerencias ("Otros")
                    {suggestions.filter((s) => s.status === "pending").length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white leading-none">
                        {suggestions.filter((s) => s.status === "pending").length}
                      </span>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setCategoryModal({ isOpen: true, category: { name: "", icon: "label", iconFilled: true, color: "#3B82F6", bgColor: "#DBEAFE" } })}
                  className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-sm font-bold transition flex items-center gap-1.5 cursor-pointer border-none h-10"
                >
                  <span className="material-symbols-rounded text-[18px]">add</span>
                  Nueva Categoría
                </button>
              </div>
            </header>

            {categorySubTab === "lista" ? (
              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="grid grid-cols-[1.4fr_2fr_2fr_130px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-bold uppercase text-slate-500">
                  <span>Categoría</span>
                  <span>Intereses de Usuario</span>
                  <span>Áreas de Especialista</span>
                  <span className="text-right">Acciones</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-[680px] overflow-y-auto">
                  {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                      <span className="material-symbols-rounded text-[48px] mb-3 text-slate-300">category</span>
                      <p className="text-sm font-medium">No hay categorías registradas.</p>
                    </div>
                  ) : (
                    categories.map((category) => (
                      <div
                        key={category.id}
                        onClick={() => setSelectedCategoryId(category.id)}
                        className="grid w-full grid-cols-[1.4fr_2fr_2fr_130px] items-center px-4 py-3.5 text-left text-[14px] transition hover:bg-slate-50 bg-white cursor-pointer"
                      >
                        {/* Category info */}
                        <div className="flex items-center gap-3 pr-2 min-w-0">
                          <div
                            className="h-9 w-9 rounded-lg flex items-center justify-center border shrink-0"
                            style={{
                              backgroundColor: category.bgColor || "#F1F5F9",
                              color: category.color || "#0F172A",
                              borderColor: `${category.color}40`,
                            }}
                          >
                            <span
                              className="material-symbols-outlined text-[20px]"
                              style={category.iconFilled ? { fontVariationSettings: "'FILL' 1" } : undefined}
                            >
                              {category.icon || "label"}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className="block font-bold text-slate-900 truncate leading-snug">{category.name}</span>
                            <span className="text-[11px] font-mono text-slate-500 block truncate">{category.slug}</span>
                          </div>
                        </div>

                        {/* User Interests summary */}
                        <div className="flex flex-wrap items-center gap-1.5 pr-2 min-w-0">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px] shrink-0">
                            {category.interests?.length || 0}
                          </span>
                          {(category.interests || []).slice(0, 3).map((item) => (
                            <span
                              key={item.id}
                              className={`px-2 py-0.5 rounded-full text-[11px] font-medium border truncate max-w-[120px] ${item.isActive ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-slate-50 border-slate-200 text-slate-400 line-through"
                                }`}
                            >
                              {item.name}
                            </span>
                          ))}
                          {(category.interests?.length || 0) > 3 && (
                            <span className="text-[11px] font-semibold text-slate-400">
                              +{category.interests.length - 3} más
                            </span>
                          )}
                        </div>

                        {/* Specialist Areas summary */}
                        <div className="flex flex-wrap items-center gap-1.5 pr-2 min-w-0">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px] shrink-0">
                            {category.specialistAreas?.length || 0}
                          </span>
                          {(category.specialistAreas || []).slice(0, 3).map((area) => (
                            <span
                              key={area.id}
                              className={`px-2 py-0.5 rounded-full text-[11px] font-medium border border-slate-200 bg-slate-50 text-slate-700 truncate max-w-[120px]`}
                            >
                              {area.name}
                            </span>
                          ))}
                          {(category.specialistAreas?.length || 0) > 3 && (
                            <span className="text-[11px] font-semibold text-slate-400">
                              +{category.specialistAreas.length - 3} más
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedCategoryId(category.id)}
                            className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer transition-colors"
                          >
                            Gestionar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="h-8 px-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer transition-colors"
                            title="Eliminar categoría"
                          >
                            <span className="material-symbols-rounded text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            ) : (
              /* Subtab: Sugerencias "Otros" Moderation Queue */
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">Bandeja de Sugerencias de Usuarios y Especialistas</h3>
                  <span className="text-xs text-slate-500">
                    Entradas en "Otro" / "Otros" que requieren aprobación del administrador.
                  </span>
                </div>

                {suggestions.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm">
                    No hay sugerencias registradas por los usuarios.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {suggestions.map((sugg) => (
                      <div key={sugg.id} className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-base">"{sugg.name}"</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${sugg.type === "SPECIALIST_AREA" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"
                                }`}
                            >
                              {sugg.type === "SPECIALIST_AREA" ? "Área Especialista" : "Interés Usuario"}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${sugg.status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : sugg.status === "approved"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                            >
                              {sugg.status === "pending" ? "Pendiente" : sugg.status === "approved" ? `Aprobado (${sugg.categoryName || ""})` : "Rechazado"}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            Sugerido por: <span className="font-medium text-slate-700">{sugg.user?.fullName || sugg.user?.email || "Usuario"}</span> •{" "}
                            {formatDate(sugg.createdAt)}
                          </div>
                        </div>

                        {sugg.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleProcessSuggestion(sugg.id, "reject")}
                              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer border-none"
                            >
                              Rechazar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleProcessSuggestion(sugg.id, "approve")}
                              className="px-4 py-1.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold cursor-pointer border-none"
                            >
                              Aprobar e Incorporar...
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Manage Category Modal (Items & Areas editing) */}
            {selectedCategory && (
              <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center border"
                        style={{
                          backgroundColor: selectedCategory.bgColor || "#F1F5F9",
                          color: selectedCategory.color || "#0F172A",
                          borderColor: `${selectedCategory.color}40`,
                        }}
                      >
                        <span
                          className="material-symbols-outlined text-[22px]"
                          style={selectedCategory.iconFilled ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        >
                          {selectedCategory.icon || "label"}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900 leading-snug">{selectedCategory.name}</h3>
                          <button
                            type="button"
                            onClick={() => setCategoryModal({ isOpen: true, category: selectedCategory })}
                            className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                            title="Editar ajustes de categoría"
                          >
                            <span className="material-symbols-rounded text-[15px]">edit</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {selectedCategory.slug}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: selectedCategory.color }} title={`Color: ${selectedCategory.color}`} />
                            <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: selectedCategory.bgColor }} title={`Fondo: ${selectedCategory.bgColor}`} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(null);
                        setIsEditingInterests(false);
                        setIsEditingAreas(false);
                        setEditingInterestId(null);
                        setEditingAreaId(null);
                      }}
                      className="text-slate-400 hover:text-slate-600 text-lg border-none bg-transparent cursor-pointer p-1"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Section 1: User Interests */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Intereses de Usuario ({selectedCategory.interests?.length || 0})
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsEditingInterests(!isEditingInterests)}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${isEditingInterests ? "bg-black text-white border-black" : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        title="Editar sección de intereses"
                      >
                        <span className="material-symbols-rounded text-[18px]">edit</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(selectedCategory.interests || []).map((item) => (
                        <div
                          key={item.id}
                          className="h-8 px-3 rounded-full border border-slate-200 bg-slate-100 text-slate-800 text-xs font-medium flex items-center gap-1.5 transition-all"
                        >
                          {editingInterestId === item.id ? (
                            <input
                              type="text"
                              autoFocus
                              value={editingInterestValue}
                              onChange={(e) => setEditingInterestValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveInterestName(item.id, editingInterestValue);
                                if (e.key === "Escape") setEditingInterestId(null);
                              }}
                              onBlur={() => handleSaveInterestName(item.id, editingInterestValue)}
                              className="h-6 w-28 px-1.5 border border-slate-900 rounded bg-white text-slate-900 font-sans text-xs focus:outline-none"
                            />
                          ) : (
                            <>
                              <span>{item.name}</span>
                              {isEditingInterests && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingInterestId(item.id);
                                      setEditingInterestValue(item.name);
                                    }}
                                    className="p-0.5 opacity-40 hover:opacity-100 cursor-pointer border-none bg-transparent text-slate-700 flex items-center justify-center"
                                    title="Editar nombre"
                                  >
                                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteInterest(item.id)}
                                    className="p-0.5 opacity-40 hover:opacity-100 hover:text-rose-600 cursor-pointer border-none bg-transparent text-slate-700 flex items-center justify-center text-[11px]"
                                    title="Eliminar"
                                  >
                                    ✕
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    {isEditingInterests && (
                      <div className="flex gap-2 items-center mt-1">
                        <input
                          type="text"
                          value={newInterestText[selectedCategory.id] || ""}
                          onChange={(e) => setNewInterestText({ ...newInterestText, [selectedCategory.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddInterest(selectedCategory.id);
                            }
                          }}
                          placeholder="Agregar nuevo interés de usuario..."
                          className="flex-1 h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-black bg-slate-50 font-sans"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddInterest(selectedCategory.id)}
                          className="h-9 px-3.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer border-none transition-colors shrink-0"
                        >
                          + Agregar
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Specialist Areas */}
                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Áreas de Especialista ({selectedCategory.specialistAreas?.length || 0})
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsEditingAreas(!isEditingAreas)}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${isEditingAreas ? "bg-black text-white border-black" : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        title="Editar sección de áreas"
                      >
                        <span className="material-symbols-rounded text-[18px]">edit</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(selectedCategory.specialistAreas || []).map((area) => (
                        <div
                          key={area.id}
                          className="h-8 px-3 rounded-full border border-slate-200 bg-slate-100 text-slate-800 text-xs font-medium flex items-center gap-1.5 transition-all"
                        >
                          {editingAreaId === area.id ? (
                            <input
                              type="text"
                              autoFocus
                              value={editingAreaValue}
                              onChange={(e) => setEditingAreaValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveSpecialistAreaName(area.id, editingAreaValue);
                                if (e.key === "Escape") setEditingAreaId(null);
                              }}
                              onBlur={() => handleSaveSpecialistAreaName(area.id, editingAreaValue)}
                              className="h-6 w-28 px-1.5 border border-slate-900 rounded bg-white text-slate-900 font-sans text-xs focus:outline-none"
                            />
                          ) : (
                            <>
                              <span>{area.name}</span>
                              {isEditingAreas && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingAreaId(area.id);
                                      setEditingAreaValue(area.name);
                                    }}
                                    className="p-0.5 opacity-40 hover:opacity-100 cursor-pointer border-none bg-transparent text-slate-700 flex items-center justify-center"
                                    title="Editar nombre"
                                  >
                                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSpecialistArea(area.id)}
                                    className="p-0.5 opacity-40 hover:opacity-100 hover:text-rose-600 cursor-pointer border-none bg-transparent text-slate-700 flex items-center justify-center text-[11px]"
                                    title="Eliminar"
                                  >
                                    ✕
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    {isEditingAreas && (
                      <div className="flex gap-2 items-center mt-1">
                        <input
                          type="text"
                          value={newAreaText[selectedCategory.id] || ""}
                          onChange={(e) => setNewAreaText({ ...newAreaText, [selectedCategory.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSpecialistArea(selectedCategory.id);
                            }
                          }}
                          placeholder="Agregar nueva área de especialista..."
                          className="flex-1 h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-black bg-slate-50 font-sans"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSpecialistArea(selectedCategory.id)}
                          className="h-9 px-3.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer border-none transition-colors shrink-0"
                        >
                          + Agregar
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryId(null)}
                      className="px-5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 cursor-pointer border-none"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Category Modal (Create / Edit) */}
            {categoryModal.isOpen && (
              <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-lg">
                      {categoryModal.category?.id ? "Editar Categoría" : "Nueva Categoría General"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCategoryModal({ isOpen: false, category: null })}
                      className="text-slate-400 hover:text-slate-600 text-lg border-none bg-transparent cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nombre de la Categoría</label>
                      <input
                        type="text"
                        required
                        value={categoryModal.category?.name || ""}
                        onChange={(e) => setCategoryModal({ ...categoryModal, category: { ...categoryModal.category, name: e.target.value } })}
                        placeholder="Ej: Crecimiento Personal"
                        className="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Ícono Material Symbol</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={categoryModal.category?.icon || "label"}
                          onChange={(e) => setCategoryModal({ ...categoryModal, category: { ...categoryModal.category, icon: e.target.value } })}
                          placeholder="Ej: sunny, mood, spa"
                          className="flex-1 min-w-0 h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black font-mono"
                        />
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none shrink-0">
                          <input
                            type="checkbox"
                            checked={categoryModal.category?.iconFilled ?? true}
                            onChange={(e) => setCategoryModal({ ...categoryModal, category: { ...categoryModal.category, iconFilled: e.target.checked } })}
                            className="rounded text-black focus:ring-black"
                          />
                          Relleno (Filled)
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">Color Principal</label>
                        <div className="flex items-center gap-2 min-w-0">
                          <label
                            className="relative h-10 w-10 rounded-xl border border-slate-200/80 cursor-pointer overflow-hidden shrink-0 transition-transform active:scale-95 shadow-none"
                            style={{ backgroundColor: categoryModal.category?.color || "#3B82F6" }}
                            title="Seleccionar color principal"
                          >
                            <input
                              type="color"
                              value={categoryModal.category?.color || "#3B82F6"}
                              onChange={(e) => setCategoryModal({ ...categoryModal, category: { ...categoryModal.category, color: e.target.value } })}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            />
                          </label>
                          <input
                            type="text"
                            value={categoryModal.category?.color || "#3B82F6"}
                            onChange={(e) => setCategoryModal({ ...categoryModal, category: { ...categoryModal.category, color: e.target.value } })}
                            className="flex-1 min-w-0 h-10 px-2 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 min-w-0">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">Color Fondo</label>
                        <div className="flex items-center gap-2 min-w-0">
                          <label
                            className="relative h-10 w-10 rounded-xl border border-slate-200/80 cursor-pointer overflow-hidden shrink-0 transition-transform active:scale-95 shadow-none"
                            style={{ backgroundColor: categoryModal.category?.bgColor || "#DBEAFE" }}
                            title="Seleccionar color de fondo"
                          >
                            <input
                              type="color"
                              value={categoryModal.category?.bgColor || "#DBEAFE"}
                              onChange={(e) => setCategoryModal({ ...categoryModal, category: { ...categoryModal.category, bgColor: e.target.value } })}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            />
                          </label>
                          <input
                            type="text"
                            value={categoryModal.category?.bgColor || "#DBEAFE"}
                            onChange={(e) => setCategoryModal({ ...categoryModal, category: { ...categoryModal.category, bgColor: e.target.value } })}
                            className="flex-1 min-w-0 h-10 px-2 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setCategoryModal({ isOpen: false, category: null })}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 cursor-pointer border-none"
                      >
                        Guardar Categoría
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Suggestion Approval Modal */}
            {suggestionModal.isOpen && suggestionModal.suggestion && (
              <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-lg">Aprobar e Incorporar Sugerencia</h3>
                    <button
                      type="button"
                      onClick={() => setSuggestionModal({ isOpen: false, suggestion: null, selectedCatId: "", targetType: "USER_INTEREST" })}
                      className="text-slate-400 hover:text-slate-600 text-lg border-none bg-transparent cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-sm">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">Texto Sugerido:</span>
                      <span className="font-bold text-slate-900 text-base">"{suggestionModal.suggestion.name}"</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tipo de Destino *</label>
                      <select
                        value={suggestionModal.targetType}
                        onChange={(e) => setSuggestionModal({ ...suggestionModal, targetType: e.target.value as any })}
                        className="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black bg-white"
                      >
                        <option value="USER_INTEREST">Interés de Usuario</option>
                        <option value="SPECIALIST_AREA">Área de Especialista</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Categoría Destino *</label>
                      <select
                        value={suggestionModal.selectedCatId}
                        onChange={(e) => setSuggestionModal({ ...suggestionModal, selectedCatId: e.target.value })}
                        className="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black bg-white"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setSuggestionModal({ isOpen: false, suggestion: null, selectedCatId: "", targetType: "USER_INTEREST" })}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmApproveSuggestion}
                        className="px-5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 cursor-pointer border-none"
                      >
                        Aprobar e Incorporar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}

