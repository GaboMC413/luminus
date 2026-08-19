"use client";

import { useState } from "react";
import {
  renderWelcomeEmailHtml,
  renderPasswordResetEmailHtml,
  renderEmailChangeVerificationHtml,
  renderContactNotificationEmailHtml,
} from "@/lib/email/templates";

export default function EmailPreviewPage() {
  const [activeTab, setActiveTab] = useState<"welcome" | "passwordReset" | "emailChange" | "contact">("welcome");
  const [name, setName] = useState("Gabriel");
  const [code, setCode] = useState("849204");

  let currentHtml = "";
  if (activeTab === "welcome") {
    currentHtml = renderWelcomeEmailHtml(name);
  } else if (activeTab === "passwordReset") {
    currentHtml = renderPasswordResetEmailHtml(code);
  } else if (activeTab === "emailChange") {
    currentHtml = renderEmailChangeVerificationHtml(code);
  } else if (activeTab === "contact") {
    currentHtml = renderContactNotificationEmailHtml({
      nombre: name,
      apellido: "Montenegro",
      email: "gabrielmedcap@hotmail.com",
      telefono: "+54 9 11 2345-6789",
      motivo: "Consulta General / Especialistas",
      mensaje: "Hola equipo de LUMINUS, me gustaría consultar acerca de cómo registrarme como profesional especialista en la plataforma.",
    });
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo-luminus-black.svg" alt="Luminus" className="h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            Previsualizador de Emails
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("welcome")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "welcome"
                ? "bg-black text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Bienvenida
          </button>
          <button
            onClick={() => setActiveTab("passwordReset")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "passwordReset"
                ? "bg-black text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Restablecer Contraseña
          </button>
          <button
            onClick={() => setActiveTab("emailChange")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "emailChange"
                ? "bg-black text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Confirmar Email
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "contact"
                ? "bg-black text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Formulario Contacto
          </button>
        </div>

        {/* Dynamic Inputs for Live Testing */}
        <div className="flex items-center gap-2">
          {activeTab === "welcome" || activeTab === "contact" ? (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-medium">Nombre:</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 w-28 focus:outline-none focus:border-black"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-medium">Código:</span>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 w-24 focus:outline-none focus:border-black"
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Preview Container */}
      <main className="flex-1 p-4 md:p-8 flex justify-center items-start overflow-auto">
        <div className="w-full max-w-[640px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <iframe
            title="Email Preview"
            srcDoc={currentHtml}
            className="w-full h-[760px] border-none"
          />
        </div>
      </main>
    </div>
  );
}
