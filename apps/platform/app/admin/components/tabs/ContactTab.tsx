"use client";

import { useState, useEffect } from "react";
import { AdminContactMessage } from "../../types";
import {
  Mail,
  Search,
  Calendar,
  User,
  Phone,
  Globe,
  MessageSquare,
  ChevronRight,
  X,
  Bell,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
} from "lucide-react";

type ContactTabProps = {
  messages: AdminContactMessage[];
};

export function ContactTab({ messages }: ContactTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<AdminContactMessage | null>(null);

  // Recipient management states
  const [recipients, setRecipients] = useState<string[]>([
    "gabrielmedcap@hotmail.com",
    "info@luminuslatam.com",
  ]);
  const [newEmail, setNewEmail] = useState("");
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [isAddingRecipient, setIsAddingRecipient] = useState(false);
  const [recipientError, setRecipientError] = useState("");
  const [recipientSuccess, setRecipientSuccess] = useState("");

  useEffect(() => {
    async function loadRecipients() {
      setIsLoadingRecipients(true);
      try {
        const res = await fetch("/api/admin/contact/recipients");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.recipients)) {
            setRecipients(data.recipients);
          }
        }
      } catch (err) {
        console.error("Error loading recipients:", err);
      } finally {
        setIsLoadingRecipients(false);
      }
    }
    loadRecipients();
  }, []);

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecipientError("");
    setRecipientSuccess("");

    const clean = newEmail.trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      setRecipientError("Por favor ingresa un correo válido.");
      return;
    }

    if (recipients.includes(clean)) {
      setRecipientError("Este correo ya está en la lista de destinatarios.");
      return;
    }

    setIsAddingRecipient(true);
    try {
      const res = await fetch("/api/admin/contact/recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al agregar destinatario.");
      }

      setRecipients(data.recipients);
      setNewEmail("");
      setRecipientSuccess(`Se agregó ${clean} a las notificaciones.`);
      setTimeout(() => setRecipientSuccess(""), 4000);
    } catch (err: any) {
      setRecipientError(err.message || "No se pudo agregar el correo.");
    } finally {
      setIsAddingRecipient(false);
    }
  };

  const handleRemoveRecipient = async (emailToRemove: string) => {
    if (recipients.length <= 1) {
      setRecipientError("Debe haber al menos un correo receptor configurado.");
      setTimeout(() => setRecipientError(""), 4000);
      return;
    }

    setRecipientError("");
    setRecipientSuccess("");

    try {
      const res = await fetch(`/api/admin/contact/recipients?email=${encodeURIComponent(emailToRemove)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al eliminar destinatario.");
      }

      setRecipients(data.recipients);
      setRecipientSuccess(`Se eliminó ${emailToRemove} de las notificaciones.`);
      setTimeout(() => setRecipientSuccess(""), 4000);
    } catch (err: any) {
      setRecipientError(err.message || "No se pudo eliminar el correo.");
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const term = searchTerm.toLowerCase();
    return (
      msg.nombre.toLowerCase().includes(term) ||
      msg.apellido.toLowerCase().includes(term) ||
      msg.email.toLowerCase().includes(term) ||
      msg.motivo.toLowerCase().includes(term) ||
      msg.mensaje.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Notification Recipients Management Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-jakarta">
                Destinatarios de Notificación por Email
              </h3>
              <p className="text-xs text-slate-500">
                Correos que reciben automáticamente una copia con el diseño oficial de LUMINUS al enviarse un mensaje.
              </p>
            </div>
          </div>
          {isLoadingRecipients && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Cargando...</span>
            </div>
          )}
        </div>

        {/* Feedback alerts */}
        {recipientError && (
          <div className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
            {recipientError}
          </div>
        )}
        {recipientSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{recipientSuccess}</span>
          </div>
        )}

        {/* Recipients List Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {recipients.map((email) => (
            <div
              key={email}
              className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100/80 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              <span className="font-mono text-[11px] sm:text-xs">{email}</span>
              <button
                type="button"
                onClick={() => handleRemoveRecipient(email)}
                title={`Eliminar ${email}`}
                aria-label={`Eliminar ${email}`}
                className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Add new recipient input */}
        <form onSubmit={handleAddRecipient} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              placeholder="nuevo-destinatario@correo.com"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                if (recipientError) setRecipientError("");
              }}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={isAddingRecipient || !newEmail.trim()}
            className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {isAddingRecipient ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            <span>Agregar destinatario</span>
          </button>
        </form>
      </div>

      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" /> Mensajes de Contacto
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {messages.length} mensajes recibidos a través del formulario de contacto.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Messages Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No se encontraron mensajes</h3>
            <p className="text-sm text-slate-500 mt-1">
              {searchTerm ? "Prueba ajustando el término de búsqueda." : "Aún no se han recibido mensajes de contacto."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Remitente</th>
                  <th className="px-6 py-4">Motivo</th>
                  <th className="px-6 py-4">Mensaje</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredMessages.map((msg) => (
                  <tr
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {msg.nombre} {msg.apellido}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{msg.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {msg.motivo}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-600">
                      {msg.mensaje}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700">
                        Ver detalles <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                {selectedMessage.motivo}
              </span>
              <button
                onClick={() => setSelectedMessage(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedMessage.nombre} {selectedMessage.apellido}
                </h3>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-blue-600 hover:underline font-mono"
                    >
                      {selectedMessage.email}
                    </a>
                  </span>
                  {selectedMessage.telefono && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedMessage.telefono}</span>
                    </span>
                  )}
                  {selectedMessage.pais && (
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedMessage.pais}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.mensaje}
              </div>

              <div className="text-[11px] text-slate-400 pt-2 flex items-center justify-between">
                <span>
                  Recibido el{" "}
                  {new Date(selectedMessage.createdAt).toLocaleString("es-ES", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: Consulta LUMINUS - ${selectedMessage.motivo}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  <Mail className="w-3.5 h-3.5" /> Responder por correo
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
