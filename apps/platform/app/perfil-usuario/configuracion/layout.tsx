"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, User, Mail, Phone, Lock, Award, Trash2 } from "lucide-react";
import { SettingsProvider, useSettings } from "@/features/user-profile/context/SettingsContext";
import { Toast } from "@/components/ui/Toast";
import { AccountClosureModal } from "@/features/user-profile/components/settings/AccountClosureModal";
import { PageLoader } from "@/components/ui/PageLoader";

const SETTINGS_TABS = [
  { id: "personal", href: "/perfil-usuario/configuracion/personal", label: "Información personal", icon: User },
  { id: "email", href: "/perfil-usuario/configuracion/email", label: "Email", icon: Mail },
  { id: "phone", href: "/perfil-usuario/configuracion/celular", label: "Celular", icon: Phone },
  { id: "password", href: "/perfil-usuario/configuracion/contrasena", label: "Contraseña", icon: Lock },
  { id: "membership", href: "/perfil-usuario/configuracion/membresia", label: "Membresía y pagos", icon: Award },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <SettingsProvider>
        <SettingsLayoutContent>{children}</SettingsLayoutContent>
      </SettingsProvider>
    </Suspense>
  );
}

function SettingsLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    tier,
    selectedPlan,
    closureModalOpen,
    setClosureModalOpen,
    successModalOpen,
    setSuccessModalOpen,
    successModalConfig,
  } = useSettings();

  const isRootSettingsPage = pathname === "/perfil-usuario/configuracion";
  const currentTab = SETTINGS_TABS.find((t) => pathname.startsWith(t.href));
  const isMembership = pathname.endsWith("/membresia");

  return (
    <div className="flex-1 w-full flex flex-col bg-slate-50 font-sans selection:bg-slate-200">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 pt-4 pb-6 md:py-8">
        <div className="w-full max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5 md:mb-7">
            {/* Mobile Back button */}
            <div className="md:hidden">
              {isRootSettingsPage ? (
                <Link
                  href="/perfil-usuario"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-900 shadow-none"
                  title="Volver al perfil"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/perfil-usuario/configuracion"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-900 shadow-none cursor-pointer"
                  title="Volver al menú de ajustes"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              )}
            </div>

            {/* Desktop Back button */}
            <div className="hidden md:block">
              <Link
                href="/perfil-usuario"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-900 shadow-none"
                title="Volver al perfil"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>

            <h1 className="text-xl md:text-2xl text-slate-900 font-bold font-jakarta tracking-tight m-0">
              <span className="md:inline hidden">Configuración de la cuenta</span>
              <span className="md:hidden">
                {isRootSettingsPage ? "Configuración de la cuenta" : currentTab?.label || "Configuración"}
              </span>
            </h1>
          </div>

          <div className="flex flex-col md:flex-row gap-5 lg:gap-8 items-start w-full">
            {/* Sidebar Navigation */}
            <div
              className={`w-full md:w-16 lg:w-60 xl:w-64 shrink-0 flex flex-col gap-3 ${
                isRootSettingsPage ? "flex" : "hidden md:flex"
              }`}
            >
              <div className="flex flex-col gap-1 bg-white rounded-2xl border border-slate-200/90 p-2 shadow-none">
                {SETTINGS_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = pathname === tab.href;
                  return (
                    <Link
                      key={tab.id}
                      href={tab.href}
                      title={tab.label}
                      className={`flex items-center text-left md:justify-center lg:justify-start gap-3 px-4 md:px-0 lg:px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold font-jakarta group cursor-pointer ${
                        isActive
                          ? "bg-slate-900 text-white shadow-none"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        className={`w-[18px] h-[18px] transition-colors shrink-0 ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"
                        }`}
                      />
                      <span className="inline md:hidden lg:inline truncate">{tab.label}</span>
                    </Link>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setClosureModalOpen(true)}
                title="Cerrar cuenta"
                aria-label="Cerrar cuenta"
                className="w-full flex items-center text-left md:justify-center lg:justify-start gap-3 px-4 md:px-0 lg:px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold font-jakarta group bg-rose-50/50 text-rose-600 hover:bg-rose-100/70 border border-rose-200/60 cursor-pointer active:scale-[0.99] select-none"
              >
                <Trash2 className="w-[18px] h-[18px] text-rose-500 group-hover:text-rose-600 transition-colors shrink-0" />
                <span className="inline md:hidden lg:inline truncate">Cerrar cuenta</span>
              </button>
            </div>

            {/* Content Area */}
            <div
              className={`flex-1 w-full min-w-0 ${
                isRootSettingsPage ? "hidden md:flex md:flex-col" : "flex flex-col"
              }`}
            >
              <div
                className={`${
                  isMembership
                    ? "bg-transparent border-0 p-0 md:bg-white md:rounded-2xl md:border md:border-slate-200/90 md:p-7"
                    : "bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 md:p-7"
                } shadow-none min-h-0 md:min-h-[460px]`}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title={successModalConfig.title}
        message={successModalConfig.message}
        type="success"
        autoCloseMs={4000}
      />

      {/* Account Closure Modal */}
      <AccountClosureModal
        isOpen={closureModalOpen}
        onClose={() => setClosureModalOpen(false)}
        tier={tier}
        selectedPlan={selectedPlan}
      />
    </div>
  );
}
