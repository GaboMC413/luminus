"use client";

import { CalendarCheck } from "lucide-react";

type Props = {
  counterpartyName: string;
  formattedDate: string;
  timeLabel: string;
  timezone?: string;
  note?: string;
  noteLabel?: string;
};

function capitalizeFirst(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function IntroSessionSummaryCard({
  counterpartyName,
  formattedDate,
  timeLabel,
  timezone,
  note,
  noteLabel,
}: Props) {
  const displayDate = capitalizeFirst(formattedDate);

  return (
    <div className="flex flex-col items-center text-center bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3">
        <CalendarCheck className="w-5 h-5" />
      </div>
      <p className="text-xs font-semibold text-emerald-700 m-0">
        15 minutos con {counterpartyName}
      </p>
      {displayDate && (
        <p className="mt-1.5 text-label text-slate-700 mb-0">{displayDate}</p>
      )}
      <p className="mt-1 text-title-page text-slate-900 mb-0">{timeLabel}</p>
      <p className="mt-1.5 text-meta text-slate-500 mb-0">
        {timezone || "Hora local"}
      </p>
      {note && (
        <div className="w-full mt-4 pt-3.5 border-t border-slate-200/80 text-left">
          {noteLabel && (
            <span className="text-label text-slate-500 block mb-1">
              {noteLabel}
            </span>
          )}
          <p className="text-body text-slate-700 m-0 whitespace-pre-wrap">
            {note}
          </p>
        </div>
      )}
    </div>
  );
}
