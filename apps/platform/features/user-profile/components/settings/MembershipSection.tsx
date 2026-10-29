"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SectionHeader } from "./SectionHeader";
import { SettingsGhostLoader } from "./SettingsGhostLoader";
import { isMecenas } from "@/lib/membership/access";
import { BrandIcon } from "./billing/BrandIcon";
import { AddPaymentMethodModal } from "./billing/AddPaymentMethodModal";
import { UpdateBillingInfoModal } from "./billing/UpdateBillingInfoModal";
import { CancelSubscriptionModal } from "./billing/CancelSubscriptionModal";
import { MoreVertical, Plus, Edit2, Download, CheckCircle2, Check } from "lucide-react";

export interface MembershipSectionProps {
  createdAt?: string;
  memberSince?: string | null;
  tier?: string;
  selectedPlan?: string;
  email?: string;
  showSuccess: (title: string, message: string) => void;
  cachedBillingDetails?: any;
  onBillingDetailsLoaded?: (data: any) => void;
}

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const SHORT_MONTHS_ES = [
  "ene.", "feb.", "mar.", "abr.", "may.", "jun.",
  "jul.", "ago.", "sep.", "oct.", "nov.", "dic."
];

function formatBillingDate(timestamp?: number | string | null): string {
  if (!timestamp) return "";
  const date = typeof timestamp === "number" ? new Date(timestamp * 1000) : new Date(timestamp);
  if (isNaN(date.getTime())) return "";
  const day = date.getDate();
  const month = MONTHS_ES[date.getMonth()];
  const year = date.getFullYear();
  return `${day} de ${month} de ${year}`;
}

function formatShortBillingDate(timestamp?: number | string | null): string {
  if (!timestamp) return "";
  const date = typeof timestamp === "number" ? new Date(timestamp * 1000) : new Date(timestamp);
  if (isNaN(date.getTime())) return "";
  const day = date.getDate();
  const month = SHORT_MONTHS_ES[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function MembershipSection({
  createdAt,
  memberSince,
  tier: initialTier = "FREE",
  selectedPlan = "Monthly",
  email: userEmail,
  showSuccess,
  cachedBillingDetails,
  onBillingDetailsLoaded,
}: MembershipSectionProps) {
  const [currentTier, setCurrentTier] = useState(initialTier);

  useEffect(() => {
    setCurrentTier(initialTier);
  }, [initialTier]);

  const patron = isMecenas({ tier: currentTier });
  const [freeBillingCycle, setFreeBillingCycle] = useState<"annual" | "monthly">("monthly");
  const isFreeAnnual = freeBillingCycle === "annual";

  // Modals state
  const [addCardModalOpen, setAddCardModalOpen] = useState(false);
  const [updateInfoModalOpen, setUpdateInfoModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Card action menu state (pmId of opened dropdown)
  const [activeMenuPmId, setActiveMenuPmId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Billing details from Stripe
  const [billingDetails, setBillingDetails] = useState<any>(cachedBillingDetails || null);
  const [loadingBilling, setLoadingBilling] = useState(!cachedBillingDetails);

  const fetchBillingDetails = useCallback(async () => {
    try {
      const res = await fetch("/api/membership/billing-details");
      if (res.ok) {
        const data = await res.json();
        setBillingDetails(data);
        onBillingDetailsLoaded?.(data);
        if (data.hasActiveSubscription === false && !data.subscription) {
          setCurrentTier("FREE");
        }
      }
    } catch (e) {
      console.warn("Failed to fetch billing details:", e);
    } finally {
      setLoadingBilling(false);
    }
  }, [onBillingDetailsLoaded]);

  useEffect(() => {
    if (patron) {
      fetchBillingDetails();
    } else {
      setLoadingBilling(false);
    }
  }, [patron, fetchBillingDetails]);

  // Handle setting a card as default
  const handleSetDefaultCard = async (paymentMethodId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/membership/payment-methods", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId }),
      });
      if (res.ok) {
        showSuccess("Método de pago", "Tu tarjeta predeterminada ha sido actualizada.");
        await fetchBillingDetails();
      }
    } catch {
      // Handled silently
    } finally {
      setActionLoading(false);
      setActiveMenuPmId(null);
    }
  };

  // Handle detaching / deleting a card
  const handleDeleteCard = async (paymentMethodId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/membership/payment-methods?id=${encodeURIComponent(paymentMethodId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showSuccess("Método de pago", "La tarjeta ha sido eliminada.");
        await fetchBillingDetails();
      }
    } catch {
      // Handled silently
    } finally {
      setActionLoading(false);
      setActiveMenuPmId(null);
    }
  };

  const benefits = [
    "Conecta directamente con especialistas.",
    "Encuentra actividades y experiencias.",
    "Publica y comparte tus iniciativas.",
    "Disfruta de beneficios exclusivos a medida que estén disponibles.",
  ];

  // Derived values for the UI: Stripe subscription is the definitive source of truth
  const sub = billingDetails?.subscription;
  const isAnnual = sub ? sub.interval === "year" : selectedPlan?.toLowerCase() === "annual";
  const planAmount = sub?.amount ? Math.round(sub.amount) : (isAnnual ? 45 : 5);
  const planAmountStr = sub?.amount
    ? `USD ${sub.amount.toFixed(2)} ${sub.interval === "year" ? "al año" : "al mes"}`
    : isAnnual
    ? "USD 45.00 al año"
    : "USD 5.00 al mes";

  const nextBillingDateFormatted = formatBillingDate(sub?.currentPeriodEnd);

  const defaultPm = billingDetails?.defaultPaymentMethod || billingDetails?.paymentMethods?.[0];
  const paymentMethods = billingDetails?.paymentMethods || (defaultPm ? [defaultPm] : []);
  const customerInfo = billingDetails?.customer || {
    name: "Usuario LUMINUS",
    email: userEmail || "",
    phone: "",
  };
  const invoices = billingDetails?.invoices || [];

  if (patron && loadingBilling && !billingDetails) {
    return (
      <div className="w-full flex flex-col font-sans">
        <SettingsGhostLoader activeTab="membership" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-sans">
      <SectionHeader
        title="Membresía y Pagos"
        description={patron ? "Consulta los detalles de tu membresía y gestiona tus pagos." : undefined}
      />

      <div className="flex flex-col gap-7">
        {/* ========================================================= */}
        {/* STATE 1: MECENAS PATRON (NATIVE STRIPE PORTAL UI)        */}
        {/* ========================================================= */}
        {patron ? (
          <div className="w-full flex flex-col gap-6 max-w-3xl">
            {/* 1. CURRENT SUBSCRIPTION */}
            <section className="flex flex-col gap-2.5">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase font-sans">
                Membresía actual
              </span>

              <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
                {/* Header: Title, Price, Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <h3 className="text-xl font-bold font-jakarta text-slate-900 tracking-tight m-0">
                      {isAnnual ? "Mecenas anual" : "Mecenas mensual"}
                    </h3>

                    <div className="flex items-baseline gap-1.5 pt-0.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-jakarta">
                        USD {planAmount}
                      </span>
                      <span className="text-sm sm:text-base font-semibold text-slate-500 font-jakarta">
                        / {isAnnual ? "año" : "mes"}
                      </span>
                    </div>

                    {nextBillingDateFormatted && (
                      <div className="text-xs sm:text-sm text-slate-500 pt-1 m-0 leading-relaxed flex flex-col gap-0.5">
                        {sub?.cancelAtPeriodEnd ? (
                          <>
                            <span>Serás Mecenas hasta el {nextBillingDateFormatted}.</span>
                            <span className="text-slate-400">Luego pasarás al modo de Miembro Gratuito.</span>
                          </>
                        ) : (
                          <span>Próxima renovación: {nextBillingDateFormatted}.</span>
                        )}
                      </div>
                    )}
                  </div>

                  {sub?.cancelAtPeriodEnd && (
                    <div className="shrink-0 sm:self-start">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                        No se renovará
                      </span>
                    </div>
                  )}
                </div>

                {/* Benefits list & mission statement */}
                <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
                  {benefits.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                  <p className="text-xs text-slate-400 font-sans pt-2 leading-relaxed m-0">
                    Siendo mecenas, impulsas el desarrollo de nuevas herramientas y experiencias acercando el bienestar a cada vez más personas en Latinoamérica.
                  </p>
                </div>

                {/* Bottom action row: Cancel link on bottom-right corner */}
                {!sub?.cancelAtPeriodEnd && (
                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCancelModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      Cancelar membresía
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* 2. PAYMENT METHOD */}
            <section className="flex flex-col gap-2.5">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase font-sans">
                Métodos de pago
              </span>

              <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
                {paymentMethods.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {paymentMethods.map((pm: any) => (
                      <div
                        key={pm.id}
                        className="p-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 relative"
                      >
                        {/* Left: Brand icon + Number & Expiration on a single line */}
                        <div className="flex items-center gap-3 min-w-0">
                          <BrandIcon brand={pm.brand} />
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap min-w-0">
                            <span className="text-sm font-semibold text-slate-900 capitalize shrink-0">
                              {pm.brand} •••• {pm.last4}
                            </span>
                            <span className="text-xs text-slate-400 shrink-0">
                              Vence {String(pm.expMonth).padStart(2, "0")}/{pm.expYear}
                            </span>
                          </div>
                        </div>

                        {/* Right: Predeterminada badge + Three dots at the end */}
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                          {pm.isDefault && (
                            <>
                              {/* Mobile: icon of a check (no text) */}
                              <span
                                className="sm:hidden w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center shrink-0"
                                title="Tarjeta predeterminada"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </span>

                              {/* Desktop (sm+): full badge with text */}
                              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 shrink-0">
                                Predeterminada
                              </span>
                            </>
                          )}

                          {/* Only render action dropdown if multiple cards exist and this card is not default */}
                          {paymentMethods.length > 1 && !pm.isDefault && (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveMenuPmId(activeMenuPmId === pm.id ? null : pm.id)
                                }
                                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Opciones de tarjeta"
                                aria-label="Opciones de tarjeta"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {activeMenuPmId === pm.id && (
                                <div className="absolute right-0 top-8 z-30 w-48 bg-white border border-slate-200/90 rounded-xl shadow-sm py-1 animate-in fade-in zoom-in-95 duration-150">
                                  <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => handleSetDefaultCard(pm.id)}
                                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Hacer predeterminada</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => handleDeleteCard(pm.id)}
                                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  >
                                    Eliminar tarjeta
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 m-0">No tienes métodos de pago guardados.</p>
                )}

                {/* + Add payment method */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setAddCardModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 hover:underline underline-offset-4 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar método de pago</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 3. BILLING INFORMATION */}
            <section className="flex flex-col gap-2.5">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase font-sans">
                Información de facturación
              </span>

              <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-baseline">
                    <span className="w-36 text-slate-400 font-medium shrink-0">Nombre</span>
                    <span className="text-slate-900 font-semibold">{customerInfo.name || "—"}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline">
                    <span className="w-36 text-slate-400 font-medium shrink-0">Correo electrónico</span>
                    <span className="text-slate-900 font-semibold">{customerInfo.email || "—"}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline">
                    <span className="w-36 text-slate-400 font-medium shrink-0">Celular</span>
                    <span className="text-slate-900 font-semibold">
                      {customerInfo.phone || "—"}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setUpdateInfoModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 hover:underline underline-offset-4 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Actualizar datos de facturación</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 4. INVOICE HISTORY */}
            <section className="flex flex-col gap-2.5">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase font-sans">
                Historial de facturas
              </span>

              <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3.5 flex flex-col">
                {invoices.length > 0 ? (
                  <div className="flex flex-col gap-0.5">
                    {invoices.map((inv: any) => (
                      <div
                        key={inv.id}
                        className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 min-w-0">
                          {/* Mobile Line 1: Date + Badge */}
                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className="text-xs sm:text-sm text-slate-500 font-medium">
                              {formatShortBillingDate(inv.date)}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 capitalize sm:hidden">
                              {inv.status === "paid" ? "Pagada" : inv.status}
                            </span>
                          </div>

                          {/* Mobile Line 2: Subscription Type + Amount */}
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-semibold text-slate-900 text-sm">
                              {inv.amount >= 20 ? "Mecenas Anual" : "Mecenas Mensual"}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">
                              USD {inv.amount.toFixed(2)}
                            </span>
                          </div>

                          {/* Desktop Badge: inline after amount */}
                          <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 capitalize shrink-0">
                            {inv.status === "paid" ? "Pagada" : inv.status}
                          </span>
                        </div>

                        {/* 5. Button (Icon only) */}
                        {inv.pdfUrl ? (
                          <a
                            href={inv.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
                            title="Descargar factura"
                            aria-label="Descargar factura"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        ) : (
                          <div className="w-8 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 m-0 py-3 px-3">
                    {loadingBilling ? "Cargando historial..." : "No tienes facturas registradas todavía."}
                  </p>
                )}
              </div>
            </section>
          </div>
        ) : (
          /* ========================================================= */
          /* STATE 2: GRATIS USER (STANDARDIZED WITH /unirme)         */
          /* ========================================================= */
          <div className="w-full flex flex-col gap-6 max-w-3xl">
            {/* 1. CURRENT MEMBERSHIP */}
            <section className="flex flex-col gap-2.5">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase font-sans">
                Membresía actual
              </span>

              <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col gap-1">
                <h3 className="text-xl font-bold font-jakarta text-slate-900 tracking-tight m-0">
                  Miembro Gratis
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 m-0 leading-relaxed">
                  Acceso básico a la comunidad y a las actividades.
                </p>
              </div>
            </section>

            {/* 2. HAZTE MECENAS */}
            <section className="flex flex-col gap-2.5 pb-12 sm:pb-6">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase font-sans">
                Hazte Mecenas
              </span>

              <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
                {/* Switch: Plan anual con 25% de descuento */}
                <div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isFreeAnnual}
                    onClick={() => setFreeBillingCycle(isFreeAnnual ? "monthly" : "annual")}
                    className="inline-flex items-center gap-2.5 cursor-pointer bg-transparent border-none p-0 select-none group"
                  >
                    <span
                      className={`w-[42px] h-[24px] rounded-full border p-[3px] flex items-center transition-colors duration-200 box-border ${
                        isFreeAnnual
                          ? "bg-black border-black"
                          : "bg-white border-zinc-300 group-hover:border-zinc-400"
                      }`}
                    >
                      <span
                        className={`w-[16px] h-[16px] rounded-full transition-transform duration-200 ${
                          isFreeAnnual
                            ? "translate-x-[18px] bg-white"
                            : "translate-x-0 bg-zinc-400 group-hover:bg-zinc-500"
                        }`}
                      />
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-600 font-jakarta">
                      Plan anual con 25% de descuento
                    </span>
                  </button>
                </div>

                {/* Block 1: Tier & Price */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between h-[26px]">
                    <span className="text-sm font-bold text-slate-900 font-jakarta tracking-tight">
                      {isFreeAnnual ? "Mecenas anual" : "Mecenas mensual"}
                    </span>
                    {isFreeAnnual && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full animate-in fade-in duration-150">
                        Ahorra USD 15
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5 h-[38px]">
                    <span className="text-[34px] font-extrabold text-slate-900 font-jakarta tracking-tight leading-none">
                      {isFreeAnnual ? "USD 45" : "USD 5"}
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      {isFreeAnnual ? "/ año" : "/ mes"}
                    </span>
                    {isFreeAnnual && (
                      <span className="text-xs text-slate-400 font-normal ml-1">
                        (USD 3.75/mes)
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-normal m-0">
                    Renovación automática. Cancela cuando quieras.
                  </p>
                </div>

                {/* Block 2: Benefits & Mission */}
                <div className="flex flex-col gap-3">
                  <ul className="flex flex-col gap-2 p-0 m-0 list-none">
                    {benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-[13.5px] text-slate-700 leading-snug">
                        <svg
                          className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2.5"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="text-xs sm:text-[13px] text-slate-500 leading-normal m-0">
                    Siendo mecenas, impulsas el desarrollo de nuevas herramientas y experiencias acercando el bienestar a cada vez más personas en Latinoamérica.
                  </p>
                </div>

                {/* Block 3: Action Button */}
                <div className="pt-2">
                  <Link
                    href={`/unirme/pago?billing=${freeBillingCycle}&from=settings`}
                    className="w-full h-11 px-6 rounded-xl font-semibold bg-slate-900 text-white hover:bg-black transition-colors flex items-center justify-center text-sm font-jakarta cursor-pointer shadow-none active:scale-[0.99]"
                  >
                    {isFreeAnnual ? "Ser Mecenas por USD 45/año" : "Ser Mecenas por USD 5/mes"}
                  </Link>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Modals - All built on shared @/components/ui/Modal */}
      <AddPaymentMethodModal
        isOpen={addCardModalOpen}
        onClose={() => setAddCardModalOpen(false)}
        onSuccess={() => {
          showSuccess("Método de pago agregado", "Tu nueva tarjeta ha sido guardada exitosamente.");
          fetchBillingDetails();
        }}
      />

      <UpdateBillingInfoModal
        isOpen={updateInfoModalOpen}
        onClose={() => setUpdateInfoModalOpen(false)}
        currentInfo={{
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
        }}
        onSuccess={() => {
          showSuccess("Información actualizada", "Tus datos de facturación se han actualizado.");
          fetchBillingDetails();
        }}
      />

      <CancelSubscriptionModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        nextRenewalDate={nextBillingDateFormatted || "el final de tu período actual"}
        onSuccess={() => {
          showSuccess(
            "Membresía cancelada",
            `Tu membresía Mecenas no se renovará. Mantendrás todos tus beneficios hasta el ${nextBillingDateFormatted || "final de tu período actual"} y luego pasarás al modo de Miembro Gratuito.`
          );
          fetchBillingDetails();
        }}
      />
    </div>
  );
}
