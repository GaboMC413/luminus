"use client";

import { useState, useMemo } from "react";
import { AdminLog } from "../../types";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { Button } from "@/components/ui/Button";
import { getActionBadge, renderLogDetails, formatShortTime, getPresetStartDate, fieldValue } from "../../utils";
import { AdminCard } from "../AdminDesignSystem";

interface LogsTabProps {
  logs: AdminLog[];
}

export function LogsTab({ logs }: LogsTabProps) {
  const [logSearch, setLogSearch] = useState("");
  const [logAction, setLogAction] = useState("all");
  const [logDatePreset, setLogDatePreset] = useState("all");
  const [logStartDate, setLogStartDate] = useState("");
  const [logEndDate, setLogEndDate] = useState("");

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Text filter
      if (logSearch.trim()) {
        const query = logSearch.trim().toLowerCase();
        const full = log.user.profile.fullName || `${log.user.profile.firstName} ${log.user.profile.lastName}`;
        const email = log.user.email || "";
        const details = log.details || "";
        const matchUser = full.toLowerCase().includes(query) || email.toLowerCase().includes(query);
        const matchDetails = details.toLowerCase().includes(query);

        if (!matchUser && !matchDetails) return false;
      }

      // 2. Action filter
      if (logAction !== "all" && log.action !== logAction) {
        return false;
      }

      // 3. Date filter
      const createdAt = new Date(log.createdAt);
      if (logDatePreset !== "all") {
        if (logDatePreset === "custom") {
          if (logStartDate) {
            const start = new Date(logStartDate);
            start.setHours(0, 0, 0, 0);
            if (createdAt < start) return false;
          }
          if (logEndDate) {
            const end = new Date(logEndDate);
            end.setHours(23, 59, 59, 999);
            if (createdAt > end) return false;
          }
        } else {
          const startDate = getPresetStartDate(logDatePreset);
          if (startDate && createdAt < startDate) return false;
        }
      }

      return true;
    });
  }, [logs, logSearch, logAction, logDatePreset, logStartDate, logEndDate]);

  const hasActiveFilters =
    logSearch !== "" ||
    logAction !== "all" ||
    logDatePreset !== "all" ||
    logStartDate !== "" ||
    logEndDate !== "";

  return (
    <div className="mx-auto flex max-w-[1350px] flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold leading-tight font-jakarta">Historial de Acciones</h1>
          <p className="mt-1 text-[14px] text-slate-500">{filteredLogs.length} acciones registradas</p>
        </div>
      </header>

      {/* Filter Toolbar */}
      <AdminCard className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px]">
            <InputField
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              placeholder="Buscar por usuario, email o detalles de acción..."
              className="!w-full !h-10 text-xs"
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
              className="!h-10 text-xs"
            />
          </div>

          <div className="min-w-[160px]">
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
              className="!h-10 text-xs"
            />
          </div>

          {logDatePreset === "custom" && (
            <>
              <div className="w-[130px]">
                <InputField
                  type="date"
                  value={logStartDate}
                  onChange={(e) => setLogStartDate(e.target.value)}
                  className="!h-10 text-xs"
                />
              </div>
              <div className="w-[130px]">
                <InputField
                  type="date"
                  value={logEndDate}
                  onChange={(e) => setLogEndDate(e.target.value)}
                  className="!h-10 text-xs"
                />
              </div>
            </>
          )}

          {hasActiveFilters && (
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
              className="!h-10 shrink-0 text-xs font-semibold"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      </AdminCard>

      {/* Table Card */}
      <AdminCard>
        <div className="grid grid-cols-[1.5fr_1.2fr_2fr_180px] border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
          <span>Usuario</span>
          <span>Acción</span>
          <span>Detalles</span>
          <span>Fecha y Hora</span>
        </div>
        <div className="max-h-[680px] overflow-y-auto divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <span className="material-symbols-rounded text-[48px] mb-3 text-slate-300">
                receipt_long
              </span>
              <p className="text-sm font-medium">No se encontraron registros de acciones.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="grid w-full grid-cols-[1.5fr_1.2fr_2fr_180px] items-center px-4 py-3.5 text-left text-[14px] transition hover:bg-slate-50 bg-white"
              >
                {/* User */}
                <span className="flex min-w-0 items-center gap-3">
                  {log.user.profile.avatarUrl ? (
                    <img
                      src={log.user.profile.avatarUrl}
                      alt=""
                      className="h-9 w-9 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[13px] font-bold text-slate-600 uppercase shrink-0">
                      {(log.user.profile.fullName || log.user.email).slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-slate-900">
                      {fieldValue(
                        log.user.profile.fullName ||
                          `${log.user.profile.firstName} ${log.user.profile.lastName}`
                      )}
                    </span>
                    <span className="block truncate text-[12px] text-slate-500">{log.user.email}</span>
                  </span>
                </span>

                {/* Action */}
                <span>{getActionBadge(log.action)}</span>

                {/* Details */}
                <span
                  className="text-slate-600 font-medium truncate pr-4 text-xs"
                  title={renderLogDetails(log.action, log.details)}
                >
                  {renderLogDetails(log.action, log.details)}
                </span>

                {/* Date */}
                <span className="text-slate-500 font-sans text-xs">{formatShortTime(log.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </AdminCard>
    </div>
  );
}
