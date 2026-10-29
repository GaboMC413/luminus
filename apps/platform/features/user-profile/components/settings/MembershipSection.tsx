"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectionHeader } from "./SectionHeader";
import { isMecenas } from "@/lib/membership/access";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface MembershipSectionProps {
  createdAt?: string;
  memberSince?: string | null;
  tier?: string;
  selectedPlan?: string;
  email?: string;
  showSuccess: (title: string, message: string) => void;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function formatDate(dateString?: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const day = date.getDate().toString().padStart(2, "0");
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} de ${month} de ${year}`;
}

function calculateNextRenewalDate(memberSinceString?: string | null, isAnnual: boolean = false): string {
  const base = memberSinceString ? new Date(memberSinceString) : new Date();
  if (isNaN(base.getTime())) return "";

  const next = new Date(base);
  if (isAnnual) {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }

  // If next date is already in the past, calculate current cycle
  const now = new Date();
  while (next <= now) {
    if (isAnnual) {
      next.setFullYear(next.getFullYear() + 1);
    } else {
      next.setMonth(next.getMonth() + 1);
    }
  }

  const day = next.getDate().toString().padStart(2, "0");
  const month = MONTHS[next.getMonth()];
  const year = next.getFullYear();
  return `${day} de ${month} de ${year}`;
}

export function MembershipSection({
  createdAt,
  memberSince,
  tier = "FREE",
  selectedPlan = "Monthly",
  email,
  showSuccess,
}: MembershipSectionProps) {
  const patron = isMecenas({ tier });
  const isAnnual = selectedPlan?.toLowerCase() === "annual";

  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const memberSinceFormatted = formatDate(memberSince || createdAt);
  const nextRenewalDate = calculateNextRenewalDate(memberSince, isAnnual);

  const handleOpenStripePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/membership/portal", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        showSuccess(
          "Gestión de pagos",
          "La pasarela de Stripe se conectará directamente a tu cuenta. Podrás actualizar tarjetas y descargar comprobantes."
        );
      }
    } catch {
      showSuccess(
        "Gestión de pagos",
        "Podrás administrar tus métodos de pago y facturas directamente con Stripe."
      );
    } finally {
      setPortalLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    setCanceling(true);
    try {
      showSuccess(
        "Cancelación programada",
        `Tu suscripción como Mecenas continuará activa hasta el final de tu período actual (${nextRenewalDate}). No se realizarán más cobros.`
      );
    } finally {
      setCanceling(false);
      setCancelModalOpen(false);
    }
  };

  const benefits = [
    "Conecta directamente con especialistas.",
    "Encuentra actividades y experiencias.",
    "Publica y comparte tus iniciativas.",
    "Disfruta de beneficios exclusivos a medida que estén disponibles.",
  ];

  return (
    <div className="w-full flex flex-col">
      <SectionHeader
        title="Membresía y Plan"
        description="Consulta los detalles de tu suscripción actual y gestiona tus pagos."
      />

      <div className="flex flex-col gap-8">
        {/* ========================================================= */}
        {/* STATE 1: MECENAS PATRON (ACTIVE SUBSCRIPTION)            */}
        {/* ========================================================= */}
        {patron ? (
          <>
            {/* Active Plan Card */}
            <div className="w-full bg-black rounded-2xl p-6 md:p-10 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-caption tracking-wider font-semibold w-fit">
                      Mecenas Activo
                    </span>
                    {isAnnual && (
                      <span className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-caption tracking-wider w-fit">
                        Plan Anual
                      </span>
                    )}
                  </div>
                  <h3 className="text-title-display !text-white font-semibold tracking-tight font-jakarta">
                    {isAnnual ? "Mecenas Anual — USD 45/año" : "Mecenas Mensual — USD 5/mes"}
                  </h3>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <p className="text-body !text-white/90 max-w-xl">
                    Gracias por impulsar el desarrollo de la red LUMINUS y acercar el bienestar a más personas en Latinoamérica.
                    {memberSinceFormatted && (
                      <> Eres Mecenas desde el <span className="font-semibold text-white">{memberSinceFormatted}</span>.</>
                    )}
                  </p>
                </div>
              </div>

              {/* Ambient visual background glow */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Renewal Info Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5 text-slate-500">
                    <span className="material-symbols-rounded text-[20px]">event_repeat</span>
                    <span className="text-body-small font-semibold">Próxima renovación</span>
                  </div>
                  <p className="text-card-title font-jakarta">{nextRenewalDate}</p>
                </div>
                <p className="text-body-small !text-slate-400 leading-normal">
                  {isAnnual
                    ? "Renovación automática de USD 45 por un año adicional."
                    : "Renovación automática de USD 5 por el siguiente mes."}
                </p>
              </div>

              {/* Payment Method Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5 text-slate-500">
                    <span className="material-symbols-rounded text-[20px]">credit_card</span>
                    <span className="text-body-small font-semibold">Método de pago</span>
                  </div>
                  <p className="text-card-title font-jakarta">Procesado con Stripe</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400">Comprobantes y tarjeta</span>
                  <button
                    type="button"
                    onClick={handleOpenStripePortal}
                    disabled={portalLoading}
                    className="text-xs font-semibold text-slate-900 hover:text-black underline underline-offset-4 cursor-pointer"
                  >
                    {portalLoading ? "Cargando..." : "Gestionar en Stripe"}
                  </button>
                </div>
              </div>
            </div>

            {/* Cancel Subscription Section */}
            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-semibold text-slate-900">Cancelar suscripción</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Tu aporte como Mecenas se mantendrá activo hasta el final de tu período actual ({nextRenewalDate}).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="w-full sm:w-auto h-10 px-5 rounded-xl text-button font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 active:scale-95 cursor-pointer select-none whitespace-nowrap text-sm flex items-center justify-center shrink-0"
              >
                Cancelar suscripción
              </button>
            </div>
          </>
        ) : (
          /* ========================================================= */
          /* STATE 2: GRATIS USER (FREE TIER)                         */
          /* ========================================================= */
          <>
            {/* Active Plan: Gratis */}
            <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-caption tracking-wider font-semibold w-fit">
                    Plan Actual
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 font-jakarta">
                  Cuenta Gratis
                </h3>
                <p className="text-sm text-slate-500">
                  Cuentas con acceso estándar a la comunidad y actividades de bienestar en LUMINUS.
                </p>
              </div>
            </div>

            {/* Mecenas Upgrade Card */}
            <div className="w-full bg-slate-900 text-white rounded-2xl p-6 md:p-10 flex flex-col gap-6 relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full text-caption tracking-wider font-semibold w-fit">
                    Impulsa la Red
                  </span>
                  <h3 className="text-title-display !text-white font-bold tracking-tight font-jakarta">
                    Conviértete en Mecenas
                  </h3>
                </div>

                <p className="text-body !text-white/90 max-w-2xl">
                  Siendo mecenas, impulsas el desarrollo de nuevas herramientas y experiencias acercando el bienestar a cada vez más personas en Latinoamérica.
                </p>

                {/* Benefits List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/90">
                      <svg
                        className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
                  <Link
                    href="/unirme/pago?billing=monthly&from=settings"
                    className="h-11 px-6 rounded-xl font-semibold bg-white text-slate-900 hover:bg-zinc-100 transition-colors flex items-center justify-center text-sm font-jakarta"
                  >
                    Ser Mecenas por USD 5/mes
                  </Link>
                  <Link
                    href="/unirme/pago?billing=annual&from=settings"
                    className="h-11 px-6 rounded-xl font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors flex items-center justify-center text-sm font-jakarta"
                  >
                    Ser Mecenas Anual (USD 45/año — Ahorra 25%)
                  </Link>
                </div>
              </div>

              {/* Visual glow */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Payment Method empty state */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col gap-2">
              <div className="flex items-center gap-2.5 text-slate-500">
                <span className="material-symbols-rounded text-[20px]">credit_card</span>
                <span className="text-body-small font-semibold">Método de pago</span>
              </div>
              <p className="text-card-title font-jakarta">Sin tarjetas asociadas</p>
              <p className="text-body-small !text-slate-400 leading-normal">
                Podrás asociar una tarjeta al activar tu suscripción como Mecenas.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancelar suscripción Mecenas"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setCancelModalOpen(false)}
              className="flex-1"
              disabled={canceling}
            >
              Mantener suscripción
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmCancel}
              className="flex-1 !bg-red-500 hover:!bg-red-600 border-red-500"
              disabled={canceling}
            >
              {canceling ? "Cancelando..." : "Confirmar cancelación"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3 py-2 text-sm text-slate-600 leading-relaxed font-sans">
          <p>
            ¿Estás seguro de que deseas cancelar tu suscripción como Mecenas?
          </p>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
            <p className="font-semibold text-slate-900 mb-1">
              Conservarás tu acceso hasta el {nextRenewalDate}
            </p>
            <p>
              No se realizarán nuevos cargos. Luego de esa fecha, tu cuenta pasará automáticamente al plan Gratis.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
