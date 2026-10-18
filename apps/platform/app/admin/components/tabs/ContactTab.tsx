"use client";

import { useState } from "react";
import { AdminContactMessage } from "../../types";
import { Mail, Search, Calendar, User, Phone, Globe, MessageSquare, ChevronRight, X } from "lucide-react";

type ContactTabProps = {
  messages: AdminContactMessage[];
};

export function ContactTab({ messages }: ContactTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<AdminContactMessage | null>(null);

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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMessage(msg);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Ver detalle <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {selectedMessage.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {selectedMessage.nombre} {selectedMessage.apellido}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedMessage.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Motivo
                  </span>
                  <span className="font-medium text-slate-800">{selectedMessage.motivo}</span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Fecha de recepción
                  </span>
                  <span className="text-slate-600 text-xs">
                    {new Date(selectedMessage.createdAt).toLocaleString("es-ES")}
                  </span>
                </div>

                {selectedMessage.telefono && (
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Teléfono
                    </span>
                    <span className="text-slate-800 font-mono text-xs">{selectedMessage.telefono}</span>
                  </div>
                )}

                {selectedMessage.pais && (
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      País
                    </span>
                    <span className="text-slate-800 text-xs">{selectedMessage.pais}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Mensaje completo
                </span>
                <div className="p-4 bg-slate-900 text-slate-100 rounded-xl text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedMessage.mensaje}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <a
                href={`mailto:${selectedMessage.email}?subject=RE: ${encodeURIComponent(selectedMessage.motivo)}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" /> Responder por Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
