import React from "react";
import { SectionHeader } from "./SectionHeader";

export interface MembershipSectionProps {
  createdAt: string;
  showSuccess: (title: string, message: string) => void;
}

export function MembershipSection({ createdAt, showSuccess }: MembershipSectionProps) {
  const getExpirationDateString = () => {
    if (!createdAt) return "";
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return "";

    const exp = new Date(date);
    exp.setMonth(exp.getMonth() + 3);

    const day = exp.getDate().toString().padStart(2, '0');
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const month = months[exp.getMonth()];
    const year = exp.getFullYear();
    return `${day} de ${month} de ${year}`;
  };

  const expirationDate = getExpirationDateString() || "12 de Agosto de 2026";

  return (
    <div className="w-full flex flex-col">
      <SectionHeader
        title="Membresía y Plan"
        description="Consulta los detalles de tu suscripción actual y gestiona tus pagos."
      />

      <div className="flex flex-col gap-8">
        {/* Active Plan Card */}
        <div className="w-full bg-black rounded-2xl p-5 md:p-10 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-caption !text-white tracking-wider w-fit">Plan Actual</span>
              <h3 className="text-title-display !text-white font-bold tracking-tight font-jakarta">3 meses de acceso total sin costo</h3>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-body !text-white/90">
                Tu periodo de acceso total sin costo finaliza el <span className="font-bold text-white underline decoration-white/30">{expirationDate}</span>. <br /> Luego de esta fecha puedes continuar desde 5 USD mensuales.
              </p>
            </div>
          </div>
          {/* Abstract Background Decoration */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-zinc-800/10 rounded-full blur-3xl" />
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Card */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/40 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-rounded text-slate-400">calendar_today</span>
              <span className="text-body-small font-semibold">Acceso total hasta</span>
            </div>
            <p className="text-card-title">{expirationDate}</p>
            <p className="text-body-small !text-slate-400 leading-normal">
              Te avisaremos antes de esa fecha para que puedas decidir si quieres continuar.
            </p>
          </div>

          {/* Right Card */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/40 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-rounded text-slate-400">credit_card</span>
              <span className="text-body-small font-semibold">Método de pago</span>
            </div>
            <p className="text-card-title">Sin tarjetas asociadas</p>
            <p className="text-body-small !text-slate-400 leading-normal">
              Cuando termine tu acceso total gratuito podrás agregar una tarjeta desde aquí
            </p>
          </div>
        </div>

        {/* Cancel Subscription Section */}
        <div className="w-full bg-slate-50 border border-zinc-200/40 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-bold text-slate-800">Cancelar suscripción</h4>
            <p className="text-xs text-slate-500 leading-normal">
              Si cancelas tu suscripción, perderás el acceso a la plataforma al finalizar tu periodo activo.
            </p>
          </div>
          <button
            onClick={() => showSuccess("Solicitud recibida", "Procesaremos la cancelación de tu suscripción próximamente.")}
            className="w-full sm:w-auto h-10 px-5 rounded-xl text-button font-semibold bg-slate-100 border border-transparent text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-300 active:scale-95 cursor-pointer select-none whitespace-nowrap text-sm flex items-center justify-center"
          >
            Cancelar suscripción
          </button>
        </div>
      </div>
    </div >
  );
}
