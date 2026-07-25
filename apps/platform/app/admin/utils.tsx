import React from "react";

export function fieldValue(value: string | null | undefined) {
  return value && value.trim() ? value.trim() : "-";
}

export function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatShortTime(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  return (
    d.toLocaleTimeString("es-UY", {
      hour: "2-digit",
      minute: "2-digit",
    }) +
    " - " +
    d.toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  );
}

export function getPresetStartDate(preset: string) {
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

export function getActionBadge(action: string) {
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

export function renderLogDetails(action: string, detailsStr: string | null) {
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
