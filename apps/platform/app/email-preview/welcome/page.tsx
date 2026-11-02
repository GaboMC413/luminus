"use client";

import { useState } from "react";
import {
  renderWelcomeEmailHtml,
  renderMecenasWelcomeEmailHtml,
  renderMecenasUpgradeEmailHtml,
  renderMembershipCanceledEmailHtml,
  renderMembershipSwitchAnnualEmailHtml,
  renderMembershipSwitchMonthlyEmailHtml,
} from "@/lib/mails";

type PreviewType =
  | "free-welcome"
  | "mecenas-welcome-monthly"
  | "mecenas-welcome-annual"
  | "mecenas-upgrade-monthly"
  | "mecenas-upgrade-annual"
  | "canceled"
  | "switch-annual"
  | "switch-monthly";

const PREVIEW_ITEMS: { id: PreviewType; label: string; badge?: string }[] = [
  { id: "free-welcome", label: "Bienvenida Gratis" },
  { id: "mecenas-welcome-monthly", label: "Bienvenida Mecenas ($5/m)", badge: "Sign Up" },
  { id: "mecenas-welcome-annual", label: "Bienvenida Mecenas ($45/a)", badge: "Sign Up" },
  { id: "mecenas-upgrade-monthly", label: "Upgrade Mecenas ($5/m)", badge: "Existente" },
  { id: "mecenas-upgrade-annual", label: "Upgrade Mecenas ($45/a)", badge: "Existente" },
  { id: "canceled", label: "Cancelación" },
  { id: "switch-annual", label: "Switch a Anual" },
  { id: "switch-monthly", label: "Switch a Mensual" },
];

export default function WelcomeEmailPreviewPage() {
  const [selected, setSelected] = useState<PreviewType>("free-welcome");
  const [previewName, setPreviewName] = useState("Gabriel");

  let html = "";
  switch (selected) {
    case "free-welcome":
      html = renderWelcomeEmailHtml(previewName);
      break;
    case "mecenas-welcome-monthly":
      html = renderMecenasWelcomeEmailHtml({ name: previewName, interval: "month" });
      break;
    case "mecenas-welcome-annual":
      html = renderMecenasWelcomeEmailHtml({ name: previewName, interval: "year" });
      break;
    case "mecenas-upgrade-monthly":
      html = renderMecenasUpgradeEmailHtml({ name: previewName, interval: "month" });
      break;
    case "mecenas-upgrade-annual":
      html = renderMecenasUpgradeEmailHtml({ name: previewName, interval: "year" });
      break;
    case "canceled":
      html = renderMembershipCanceledEmailHtml({
        name: previewName,
        accessUntilDate: "15 de Diciembre de 2026",
      });
      break;
    case "switch-annual":
      html = renderMembershipSwitchAnnualEmailHtml({ name: previewName });
      break;
    case "switch-monthly":
      html = renderMembershipSwitchMonthlyEmailHtml({
        name: previewName,
        periodEndDate: "15 de Diciembre de 2026",
      });
      break;
  }

  return (
    <div className="w-full min-h-screen bg-slate-100 p-4 sm:p-8 flex flex-col items-center font-sans gap-6">
      {/* Top Controls Bar */}
      <div className="w-full max-w-5xl bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 m-0 font-jakarta">
            Previsualizador de Emails — LUMINUS
          </h2>
          <p className="text-xs text-slate-500 m-0">
            Revisa el diseño, el copy y la carta de cada notificación transaccional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Nombre de prueba:</label>
          <input
            type="text"
            value={previewName}
            onChange={(e) => setPreviewName(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg outline-none focus:border-slate-900"
          />
        </div>
      </div>

      {/* Tabs list */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-center gap-2">
        {PREVIEW_ITEMS.map((item) => {
          const isActive = selected === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full uppercase font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Email Container Frame */}
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-slate-900 text-white px-5 py-3 text-xs flex items-center justify-between">
          <span className="font-semibold tracking-wide">
            Vista previa activa: {PREVIEW_ITEMS.find((it) => it.id === selected)?.label}
          </span>
          <span className="text-slate-400">Plantilla oficial LUMINUS</span>
        </div>
        <iframe
          title="Vista Previa Email"
          srcDoc={html}
          className="w-full h-[850px] border-none bg-white"
        />
      </div>
    </div>
  );
}
