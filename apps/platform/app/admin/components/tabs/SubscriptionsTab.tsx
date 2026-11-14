"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminGlobalInvoice,
  AdminTab,
  AdminUser,
  AdminUserBilling,
} from "../../types";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { Button } from "@/components/ui/Button";
import { fieldValue, formatDate } from "../../utils";
import { AdminBadge, AdminCard, AdminDetailRow } from "../AdminDesignSystem";

interface SubscriptionsTabProps {
  users: AdminUser[];
  setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  initialGlobalInvoices: AdminGlobalInvoice[];
  stripeConfigured: boolean;
  setActiveTab: (tab: AdminTab) => void;
  setSelectedUserId: (id: string) => void;
  setUserSubTab: (tab: "activos" | "mecenas" | "cerradas" | "deshabilitados") => void;
}

function formatUnixDate(unixSeconds?: number | null) {
  if (!unixSeconds) return "-";
  return new Date(unixSeconds * 1000).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(amount: number, currency = "usd") {
  return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
}

function getInvoiceStatusBadge(status: string) {
  switch (status) {
    case "paid":
      return <AdminBadge variant="active">Pagado</AdminBadge>;
    case "open":
    case "draft":
      return <AdminBadge variant="pending">Pendiente</AdminBadge>;
    case "void":
    case "uncollectible":
      return <AdminBadge variant="deleted">Fallido / Anulado</AdminBadge>;
    default:
      return <AdminBadge variant="default">{status}</AdminBadge>;
  }
}

function getSubscriptionStatusBadge(status?: string, cancelAtPeriodEnd?: boolean) {
  if (cancelAtPeriodEnd) {
    return <AdminBadge variant="pending">Cancela al fin del ciclo</AdminBadge>;
  }
  switch (status) {
    case "active":
      return <AdminBadge variant="active">Activa</AdminBadge>;
    case "trialing":
      return <AdminBadge variant="plan">En prueba</AdminBadge>;
    case "past_due":
      return <AdminBadge variant="pending">Pago pendiente</AdminBadge>;
    case "canceled":
      return <AdminBadge variant="deleted">Cancelada</AdminBadge>;
    default:
      return <AdminBadge variant="default">{status || "Sin suscripción"}</AdminBadge>;
  }
}

export function SubscriptionsTab({
  users,
  setUsers,
  initialGlobalInvoices,
  stripeConfigured,
  setActiveTab,
  setSelectedUserId,
  setUserSubTab,
}: SubscriptionsTabProps) {
  const [subTab, setSubTab] = useState<"suscriptores" | "pagos">("suscriptores");
  const [planFilter, setPlanFilter] = useState<"all" | "monthly" | "annual" | "stripe_free">("all");
  const [search, setSearch] = useState("");
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Global invoices state
  const [globalInvoices, setGlobalInvoices] = useState<AdminGlobalInvoice[]>(initialGlobalInvoices);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all");
  const [isRefreshingInvoices, setIsRefreshingInvoices] = useState(false);

  // Selected user billing state
  const [billingMap, setBillingMap] = useState<Record<string, AdminUserBilling>>({});
  const [loadingBillingId, setLoadingBillingId] = useState<string | null>(null);
  const [billingActionLoading, setBillingActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const subscribedUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.tier === "MECENAS" ||
          Boolean(u.stripeSubscriptionId) ||
          Boolean(u.stripeCustomerId)
      ),
    [users]
  );

  const mecenasUsers = useMemo(
    () => users.filter((u) => u.tier === "MECENAS" || Boolean(u.stripeSubscriptionId)),
    [users]
  );

  const monthlyCount = useMemo(
    () =>
      mecenasUsers.filter((u) => u.profile.selectedPlan?.toLowerCase() !== "annual").length,
    [mecenasUsers]
  );

  const annualCount = useMemo(
    () =>
      mecenasUsers.filter((u) => u.profile.selectedPlan?.toLowerCase() === "annual").length,
    [mecenasUsers]
  );

  const estimatedMrr = useMemo(
    () => monthlyCount * 5 + annualCount * (45 / 12),
    [monthlyCount, annualCount]
  );

  const filteredSubscribers = useMemo(() => {
    return subscribedUsers.filter((user) => {
      const isMecenas = user.tier === "MECENAS" || Boolean(user.stripeSubscriptionId);
      const isAnnual = user.profile.selectedPlan?.toLowerCase() === "annual";

      if (planFilter === "monthly" && (!isMecenas || isAnnual)) return false;
      if (planFilter === "annual" && (!isMecenas || !isAnnual)) return false;
      if (planFilter === "stripe_free" && isMecenas) return false;

      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      const full = user.profile.fullName || `${user.profile.firstName} ${user.profile.lastName}`;
      return (
        full.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        (user.stripeCustomerId || "").toLowerCase().includes(q) ||
        (user.stripeSubscriptionId || "").toLowerCase().includes(q)
      );
    });
  }, [subscribedUsers, planFilter, search]);

  const [selectedId, setSelectedId] = useState<string>(filteredSubscribers[0]?.id ?? "");
  const selectedUser =
    filteredSubscribers.find((u) => u.id === selectedId) ?? filteredSubscribers[0] ?? null;

  useEffect(() => {
    if (!selectedUser) return;
    if (selectedId !== selectedUser.id) {
      setSelectedId(selectedUser.id);
    }
    if (billingMap[selectedUser.id]) return;

    let cancelled = false;
    setLoadingBillingId(selectedUser.id);
    fetch(`/api/admin/users/${selectedUser.id}/billing`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AdminUserBilling | null) => {
        if (!cancelled && data) {
          setBillingMap((prev) => ({ ...prev, [selectedUser.id]: data }));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingBillingId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedUser?.id]);

  const selectedBilling = selectedUser ? billingMap[selectedUser.id] : undefined;

  async function handleBillingAction(
    userId: string,
    action: "sync" | "cancel_at_period_end" | "reactivate"
  ) {
    setBillingActionLoading(true);
    setActionMessage("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMessage(data.message || "Error al ejecutar la acción en Stripe.");
        return;
      }
      if (data.billing) {
        setBillingMap((prev) => ({ ...prev, [userId]: data.billing }));
        const nextTier = data.billing.hasActiveSubscription ? "MECENAS" : "FREE";
        const nextPlan = data.billing.subscription
          ? data.billing.subscription.interval === "year"
            ? "Annual"
            : "Monthly"
          : undefined;
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  tier: nextTier,
                  stripeSubscriptionId:
                    data.billing.subscription?.id &&
                    !data.billing.subscription.id.startsWith("manual_")
                      ? data.billing.subscription.id
                      : u.stripeSubscriptionId,
                  profile: nextPlan ? { ...u.profile, selectedPlan: nextPlan } : u.profile,
                }
              : u
          )
        );
      }
      setActionMessage(
        action === "sync"
          ? "Estado sincronizado con Stripe."
          : action === "cancel_at_period_end"
            ? "Renovación cancelada al finalizar el ciclo."
            : "Renovación reactivada correctamente."
      );
    } catch {
      setActionMessage("Error de conexión al consultar Stripe.");
    } finally {
      setBillingActionLoading(false);
    }
  }

  async function refreshGlobalInvoices() {
    setIsRefreshingInvoices(true);
    try {
      const res = await fetch("/api/admin/subscriptions", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setGlobalInvoices(data.invoices || []);
      }
    } finally {
      setIsRefreshingInvoices(false);
    }
  }

  const filteredGlobalInvoices = useMemo(() => {
    return globalInvoices.filter((inv) => {
      if (invoiceStatusFilter !== "all" && inv.status !== invoiceStatusFilter) {
        return false;
      }
      if (!invoiceSearch.trim()) return true;
      const q = invoiceSearch.trim().toLowerCase();
      return (
        (inv.customerEmail || "").toLowerCase().includes(q) ||
        (inv.customerName || "").toLowerCase().includes(q) ||
        (inv.number || "").toLowerCase().includes(q) ||
        (inv.description || "").toLowerCase().includes(q)
      );
    });
  }, [globalInvoices, invoiceSearch, invoiceStatusFilter]);

  function openUserProfile(userId: string) {
    const target = users.find((u) => u.id === userId);
    setSelectedUserId(userId);
    setUserSubTab(
      target?.status === "deleted"
        ? "cerradas"
        : target?.status === "disabled"
          ? "deshabilitados"
          : "activos"
    );
    setActiveTab("usuarios");
  }

  return (
    <div className="w-full p-6 md:p-8 h-[calc(100vh-64px)] overflow-hidden flex flex-col box-border gap-4">
      {/* Header + Sub-tab Switch + KPIs */}
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-[28px] font-bold leading-tight font-jakarta text-slate-900">
            Suscripciones y Pagos
          </h1>
          <p className="mt-0.5 text-[14px] text-slate-500 font-sans">
            Control de membresías Mecenas, estado de Stripe e historial de cobros.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-semibold bg-white border border-slate-200/80 rounded-xl px-3 py-2">
            <span className="text-slate-500">Mecenas:</span>
            <span className="font-bold text-slate-900">{mecenasUsers.length}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Mensual:</span>
            <span className="font-bold text-slate-900">{monthlyCount}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Anual:</span>
            <span className="font-bold text-slate-900">{annualCount}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">MRR Est.:</span>
            <span className="font-bold text-emerald-700">USD {estimatedMrr.toFixed(2)}</span>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSubTab("suscriptores")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-none outline-none ${
                subTab === "suscriptores"
                  ? "bg-white text-slate-950 font-bold"
                  : "bg-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Suscriptores ({subscribedUsers.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab("pagos")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-none outline-none ${
                subTab === "pagos"
                  ? "bg-white text-slate-950 font-bold"
                  : "bg-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Historial Global de Pagos ({globalInvoices.length})
            </button>
          </div>
        </div>
      </div>

      {!stripeConfigured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 shrink-0">
          <strong>Modo local sin STRIPE_SECRET_KEY:</strong> Se muestran los datos guardados en base de datos. Conecta Stripe en las variables de entorno para consultar facturas reales y operar renovaciones en vivo.
        </div>
      )}

      {subTab === "suscriptores" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-6 items-start flex-1 min-h-0">
          {/* Left: Subscribers list */}
          <AdminCard
            className={`${showMobileDetail ? "hidden lg:flex" : "flex"} flex-col min-w-0 h-full overflow-hidden`}
          >
            <div className="p-4 border-b border-slate-200/80 bg-white flex items-center gap-3 shrink-0">
              <div className="min-w-[140px] shrink-0">
                <SelectInput
                  value={planFilter}
                  options={[
                    { label: `Todos · ${subscribedUsers.length}`, value: "all" },
                    { label: `Mensual · ${monthlyCount}`, value: "monthly" },
                    { label: `Anual · ${annualCount}`, value: "annual" },
                    { label: "Gratis c/ Stripe", value: "stripe_free" },
                  ]}
                  onSelect={(val) => setPlanFilter(val as any)}
                  className="!h-10 text-xs font-bold"
                />
              </div>

              <div className="flex-1 min-w-0">
                <InputField
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar nombre, email o cus_..."
                  className="!w-full !h-10 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-[48%_28%_24%] border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
              <span>Usuario</span>
              <span>Plan</span>
              <span>Desde</span>
            </div>

            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto min-h-0">
              {filteredSubscribers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <span className="material-symbols-rounded text-[44px] mb-2 text-slate-300">
                    credit_card_off
                  </span>
                  <p className="text-sm font-medium">No hay suscriptores en este filtro.</p>
                </div>
              ) : (
                filteredSubscribers.map((user) => {
                  const active = user.id === selectedUser?.id;
                  const isMecenas =
                    user.tier === "MECENAS" || Boolean(user.stripeSubscriptionId);
                  const isAnnual = user.profile.selectedPlan?.toLowerCase() === "annual";
                  const displayName = fieldValue(
                    user.profile.fullName ||
                      `${user.profile.firstName} ${user.profile.lastName}`
                  );

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(user.id);
                        setActionMessage("");
                        setShowMobileDetail(true);
                      }}
                      className={`grid w-full grid-cols-[48%_28%_24%] items-center px-4 py-3.5 text-left text-[14px] transition outline-none cursor-pointer border-y-0 border-r-0 ${
                        active
                          ? "bg-slate-100/90 font-semibold border-l-4 border-slate-900"
                          : "bg-white border-l-4 border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3 pr-2">
                        {user.profile.avatarUrl ? (
                          <img
                            src={user.profile.avatarUrl}
                            alt=""
                            className="h-9 w-9 rounded-xl object-cover shrink-0"
                          />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[13px] font-bold text-slate-600 uppercase shrink-0">
                            {(user.profile.firstName || user.email).slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-slate-900">
                            {displayName}
                          </span>
                          <span className="block truncate text-[12px] text-slate-500">
                            {user.email}
                          </span>
                        </span>
                      </span>

                      <span className="pr-2">
                        {isMecenas ? (
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {isAnnual ? "Anual (USD 45)" : "Mensual (USD 5)"}
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600">
                            Gratis
                          </span>
                        )}
                      </span>

                      <span className="text-slate-500 font-sans text-xs">
                        {formatDate(user.memberSince || user.createdAt)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </AdminCard>

          {/* Right: Detail Panel */}
          {selectedUser ? (
            <AdminCard
              className={`${showMobileDetail ? "flex" : "hidden lg:flex"} flex-col min-w-0 h-full overflow-hidden`}
            >
              <div className="lg:hidden p-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setShowMobileDetail(false)}
                  className="flex items-center gap-2 text-xs font-bold text-white hover:text-slate-200 cursor-pointer bg-transparent border-none"
                >
                  <span className="material-symbols-rounded text-[18px]">arrow_back</span>
                  <span>Volver a suscriptores</span>
                </button>
              </div>

              <div className="border-b border-slate-200/80 p-6 bg-white shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-bold text-slate-900 font-jakarta">
                      {fieldValue(
                        selectedUser.profile.fullName ||
                          `${selectedUser.profile.firstName} ${selectedUser.profile.lastName}`
                      )}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedUser.email}</p>
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                      <AdminBadge
                        variant={
                          selectedUser.tier === "MECENAS" ||
                          Boolean(selectedUser.stripeSubscriptionId)
                            ? "plan"
                            : "default"
                        }
                      >
                        {selectedUser.tier === "MECENAS" ||
                        Boolean(selectedUser.stripeSubscriptionId)
                          ? selectedUser.profile.selectedPlan === "Annual"
                            ? "Mecenas Anual"
                            : "Mecenas Mensual"
                          : "Cuenta Gratis"}
                      </AdminBadge>
                      {selectedBilling?.subscription &&
                        getSubscriptionStatusBadge(
                          selectedBilling.subscription.status,
                          selectedBilling.subscription.cancelAtPeriodEnd
                        )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => openUserProfile(selectedUser.id)}
                    className="!h-9 px-3.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border-none shadow-none shrink-0"
                  >
                    Ver perfil de usuario
                  </Button>
                </div>

                {actionMessage && (
                  <p className="mt-3 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 text-slate-800">
                    {actionMessage}
                  </p>
                )}
              </div>

              <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto min-h-0 text-sm">
                {/* Live Subscription Info */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400">
                      Estado de Suscripción
                    </h3>
                    {selectedUser.stripeCustomerId &&
                      !selectedUser.stripeCustomerId.startsWith("cus_mock_") && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={billingActionLoading}
                            onClick={() => handleBillingAction(selectedUser.id, "sync")}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border-none cursor-pointer disabled:opacity-50"
                          >
                            Sincronizar Stripe
                          </button>
                          {selectedBilling?.hasActiveSubscription &&
                            (selectedBilling.subscription?.cancelAtPeriodEnd ? (
                              <button
                                type="button"
                                disabled={billingActionLoading}
                                onClick={() =>
                                  handleBillingAction(selectedUser.id, "reactivate")
                                }
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer disabled:opacity-50"
                              >
                                Reactivar renovación
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={billingActionLoading}
                                onClick={() =>
                                  handleBillingAction(
                                    selectedUser.id,
                                    "cancel_at_period_end"
                                  )
                                }
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer disabled:opacity-50"
                              >
                                Cancelar renovación
                              </button>
                            ))}
                        </div>
                      )}
                  </div>

                  {loadingBillingId === selectedUser.id ? (
                    <div className="bg-slate-50/70 rounded-xl p-6 text-center text-xs text-slate-500">
                      Consultando Stripe...
                    </div>
                  ) : (
                    <div className="bg-slate-50/50 rounded-xl p-1 divide-y divide-slate-100">
                      <AdminDetailRow
                        label="Mecenas Desde"
                        value={formatDate(selectedUser.memberSince || null)}
                      />
                      <AdminDetailRow
                        label="Plan / Importe"
                        value={
                          selectedBilling?.subscription
                            ? `${selectedBilling.subscription.planName} (${formatCurrency(
                                selectedBilling.subscription.amount,
                                selectedBilling.subscription.currency
                              )}/${selectedBilling.subscription.interval === "year" ? "año" : "mes"})`
                            : selectedUser.profile.selectedPlan === "Annual"
                              ? "Anual (USD 45/año)"
                              : selectedUser.tier === "MECENAS"
                                ? "Mensual (USD 5/mes)"
                                : "Cuenta Gratis"
                        }
                      />
                      <AdminDetailRow
                        label={
                          selectedBilling?.subscription?.cancelAtPeriodEnd
                            ? "Acceso vigente hasta"
                            : "Próxima renovación"
                        }
                        value={
                          selectedBilling?.subscription?.currentPeriodEnd
                            ? formatUnixDate(selectedBilling.subscription.currentPeriodEnd)
                            : formatDate(selectedUser.paidUntil || null)
                        }
                      />
                      {selectedBilling?.subscription?.scheduledPlanChange && (
                        <AdminDetailRow
                          label="Cambio programado"
                          value={`${selectedBilling.subscription.scheduledPlanChange.targetPlanName} el ${formatUnixDate(
                            selectedBilling.subscription.scheduledPlanChange.effectiveDate
                          )}`}
                        />
                      )}
                      <AdminDetailRow
                        label="Método de pago"
                        value={
                          selectedBilling?.defaultPaymentMethod
                            ? `${selectedBilling.defaultPaymentMethod.brand.toUpperCase()} •••• ${
                                selectedBilling.defaultPaymentMethod.last4
                              } (vence ${selectedBilling.defaultPaymentMethod.expMonth}/${
                                selectedBilling.defaultPaymentMethod.expYear
                              })`
                            : "Sin tarjeta registrada"
                        }
                      />
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
                      {selectedUser.stripeSubscriptionId && (
                        <AdminDetailRow
                          label="Subscription ID"
                          value={
                            <span className="font-mono text-xs text-slate-700">
                              {selectedUser.stripeSubscriptionId}
                            </span>
                          }
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* User Payment / Invoices History */}
                <div>
                  <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Historial de Pagos y Facturas ({selectedBilling?.invoices?.length || 0})
                  </h3>

                  {!selectedBilling || selectedBilling.invoices.length === 0 ? (
                    <div className="bg-slate-50/50 rounded-xl p-6 text-center text-xs text-slate-400">
                      {selectedBilling?.isMock
                        ? "Entorno sin conexión real a Stripe o usuario mock: no hay facturas registradas."
                        : "Este usuario aún no registra pagos en Stripe."}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200/80 overflow-hidden divide-y divide-slate-100">
                      {selectedBilling.invoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-slate-50/70"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {inv.description}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {formatUnixDate(inv.date)} · N° {inv.number}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-bold text-slate-900">
                              {formatCurrency(inv.amount, inv.currency)}
                            </span>
                            {getInvoiceStatusBadge(inv.status)}
                            {(inv.pdfUrl || inv.hostedUrl) && (
                              <a
                                href={inv.pdfUrl || inv.hostedUrl || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold no-underline"
                              >
                                PDF
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </AdminCard>
          ) : (
            <AdminCard className="flex items-center justify-center p-8 text-center text-slate-400 min-h-[300px]">
              <p className="text-sm font-medium">
                Selecciona un suscriptor para ver su detalle y pagos.
              </p>
            </AdminCard>
          )}
        </div>
      ) : (
        /* Global Payments Ledger */
        <AdminCard className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-4 border-b border-slate-200/80 bg-white flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex-1 min-w-[220px]">
              <InputField
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                placeholder="Buscar por usuario, correo, N° de factura..."
                className="!w-full !h-10 text-xs"
              />
            </div>

            <div className="min-w-[160px]">
              <SelectInput
                value={invoiceStatusFilter}
                options={[
                  { label: "Todos los estados", value: "all" },
                  { label: "Pagado", value: "paid" },
                  { label: "Pendiente", value: "open" },
                  { label: "Anulado", value: "void" },
                ]}
                onSelect={(val) => setInvoiceStatusFilter(val)}
                className="!h-10 text-xs"
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              disabled={isRefreshingInvoices}
              onClick={refreshGlobalInvoices}
              className="!h-10 px-4 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border-none shadow-none"
            >
              {isRefreshingInvoices ? "Actualizando..." : "Actualizar Stripe"}
            </Button>
          </div>

          <div className="grid grid-cols-[1.5fr_1.4fr_120px_120px_130px_140px] border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
            <span>Usuario</span>
            <span>Concepto / N°</span>
            <span>Fecha</span>
            <span>Importe</span>
            <span>Estado</span>
            <span className="text-right">Acciones</span>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto min-h-0">
            {filteredGlobalInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <span className="material-symbols-rounded text-[44px] mb-2 text-slate-300">
                  receipt_long
                </span>
                <p className="text-sm font-medium">
                  {stripeConfigured
                    ? "No hay facturas para mostrar."
                    : "Stripe no está configurado en este entorno."}
                </p>
              </div>
            ) : (
              filteredGlobalInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="grid grid-cols-[1.5fr_1.4fr_120px_120px_130px_140px] items-center px-4 py-3 text-xs bg-white hover:bg-slate-50/60"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-900 truncate">
                      {inv.customerName || inv.customerEmail || inv.customerId || "-"}
                    </p>
                    {inv.customerEmail && (
                      <p className="text-[11px] text-slate-500 truncate">{inv.customerEmail}</p>
                    )}
                  </div>

                  <div className="min-w-0 pr-2">
                    <p className="text-slate-800 font-medium truncate">{inv.description}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{inv.number}</p>
                  </div>

                  <span className="text-slate-600">{formatUnixDate(inv.date)}</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(inv.amount, inv.currency)}
                  </span>
                  <span>{getInvoiceStatusBadge(inv.status)}</span>

                  <div className="flex items-center justify-end gap-2">
                    {(inv.pdfUrl || inv.hostedUrl) && (
                      <a
                        href={inv.pdfUrl || inv.hostedUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold no-underline"
                      >
                        PDF
                      </a>
                    )}
                    {inv.userId && (
                      <button
                        type="button"
                        onClick={() => openUserProfile(inv.userId!)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold border-none cursor-pointer"
                      >
                        Perfil
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminCard>
      )}
    </div>
  );
}
