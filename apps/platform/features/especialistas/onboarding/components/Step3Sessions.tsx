"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { SelectInput } from "@/components/ui/SelectInput";

const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const hoursOptions = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

export const TIMEZONE_OPTIONS = [
  // América Latina (Capitales y principales zonas)
  "America/Argentina/Buenos_Aires (GMT-3)",
  "America/Argentina/Cordoba (GMT-3)",
  "America/Argentina/Mendoza (GMT-3)",
  "America/Asuncion (GMT-3/GMT-4)",
  "America/Bogota (GMT-5)",
  "America/Caracas (GMT-4)",
  "America/Cancun (GMT-5)",
  "America/Costa_Rica (GMT-6)",
  "America/El_Salvador (GMT-6)",
  "America/Guayaquil (GMT-5)",
  "America/Guatemala (GMT-6)",
  "America/Havana (GMT-5/GMT-4)",
  "America/La_Paz (GMT-4)",
  "America/Lima (GMT-5)",
  "America/Managua (GMT-6)",
  "America/Manaus (GMT-4)",
  "America/Mexico_City (GMT-6)",
  "America/Montevideo (GMT-3)",
  "America/Noronha (GMT-2)",
  "America/Panama (GMT-5)",
  "America/Puerto_Rico (GMT-4)",
  "America/Santiago (GMT-3/GMT-4)",
  "America/Santo_Domingo (GMT-4)",
  "America/Sao_Paulo (GMT-3)",
  "America/Tegucigalpa (GMT-6)",
  "America/Tijuana (GMT-8/GMT-7)",

  // Estados Unidos y Canadá (Ciudades más comunes)
  "America/New_York (GMT-5/GMT-4 - Este: Nueva York, Miami)",
  "America/Chicago (GMT-6/GMT-5 - Central: Chicago, Houston)",
  "America/Denver (GMT-7/GMT-6 - Montaña: Denver, Phoenix)",
  "America/Los_Angeles (GMT-8/GMT-7 - Pacífico: Los Ángeles, San Francisco)",
  "America/Anchorage (GMT-9/GMT-8 - Alaska)",
  "Pacific/Honolulu (GMT-10 - Hawái)",
  "America/Toronto (GMT-5/GMT-4 - Canadá Este)",
  "America/Vancouver (GMT-8/GMT-7 - Canadá Pacífico)",

  // Europa
  "Europe/Madrid (GMT+1/GMT+2 - España)",
  "Atlantic/Canary (GMT+0/GMT+1 - Islas Canarias)",
  "Europe/London (GMT+0/GMT+1 - Reino Unido)",
  "Europe/Paris (GMT+1/GMT+2 - Europa Central)",

  // Universal
  "UTC (GMT+0)",
];

interface Step3SessionsProps {
  sessionsChoice: "yes" | "no" | null;
  setSessionsChoice: (val: "yes" | "no" | null) => void;
  setSessionsEnabled: (val: boolean) => void;
  selectedDays: string[];
  setSelectedDays: React.Dispatch<React.SetStateAction<string[]>>;
  startTime: string;
  setStartTime: (val: string) => void;
  endTime: string;
  setEndTime: (val: string) => void;
  timeZone: string;
  setTimeZone: (val: string) => void;
  errorField: string | null;
  setErrorField: (val: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Sessions({
  sessionsChoice,
  setSessionsChoice,
  setSessionsEnabled,
  selectedDays,
  setSelectedDays,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  timeZone,
  setTimeZone,
  errorField,
  setErrorField,
  onNext,
  onBack,
}: Step3SessionsProps) {
  const sessionsContainerRef = useRef<HTMLDivElement>(null);
  const daysContainerRef = useRef<HTMLDivElement>(null);
  const timeContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!timeZone) {
      try {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (detected) {
          const match = TIMEZONE_OPTIONS.find((t) => t.toLowerCase().includes(detected.toLowerCase()));
          setTimeZone(match || `${detected} (Detectado)`);
        } else {
          setTimeZone("America/Argentina/Buenos_Aires (GMT-3)");
        }
      } catch {
        setTimeZone("America/Argentina/Buenos_Aires (GMT-3)");
      }
    }
  }, [timeZone, setTimeZone]);

  const toggleDay = (day: string) => {
    if (errorField === "days") setErrorField(null);
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleNextStep3 = () => {
    if (sessionsChoice === null) {
      setErrorField("sessionsChoice");
      sessionsContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (sessionsChoice === "yes") {
      if (selectedDays.length === 0) {
        setErrorField("days");
        daysContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (!startTime || !endTime) {
        setErrorField("time");
        timeContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      setSessionsEnabled(true);
    } else {
      setSelectedDays([]);
      setStartTime("");
      setEndTime("");
      setSessionsEnabled(false);
    }
    setErrorField(null);
    onNext();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-1">
        <h1 className="text-[24px] md:text-[28px] font-bold text-slate-900 font-jakarta leading-tight">
          Sesiones introductorias
        </h1>
        <p className="text-[13px] md:text-[14px] text-slate-500 font-sans">
          Ofrece encuentros breves para que nuevos usuarios conozcan tu enfoque profesional.
        </p>
      </div>

      <div className="flex flex-col gap-4 text-[14px] text-slate-600 leading-relaxed font-sans mt-1">
        <p>
          Las sesiones tienen una duración de 15 minutos. Podrás revisar cada solicitud y decidir si deseas aceptarla antes de incorporarla a tu agenda.
        </p>
      </div>

      {/* Question & 2 Options */}
      <div ref={sessionsContainerRef} className="flex flex-col gap-3 mt-1">
        <label className="text-label ml-1 font-jakarta font-bold text-slate-900">
          ¿Deseas ofrecer sesiones de primer contacto?
        </label>
        {errorField === "sessionsChoice" && (
          <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Selecciona una opción para continuar</p>
        )}

        <div className="grid grid-cols-1 gap-3">
          {/* Option 1 */}
          <div
            onClick={() => {
              setSessionsChoice("yes");
              setSessionsEnabled(true);
              if (errorField === "sessionsChoice") setErrorField(null);
            }}
            className={`flex flex-col p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
              sessionsChoice === "yes"
                ? "border-slate-900 bg-white"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-bold text-slate-900 font-jakarta">
                Sí, quiero ofrecer sesiones
              </span>
              <span className="text-[13px] text-slate-500 font-sans leading-normal">
                Los usuarios podrán solicitarte encuentros introductorios de 15 minutos.
              </span>
            </div>

            {/* Expanded Availability inside Option 1 */}
            {sessionsChoice === "yes" && (
              <div
                className="flex flex-col gap-4 mt-4 pt-4 border-t border-slate-200/80 animate-in fade-in duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-[14px] font-bold text-slate-900 font-jakarta">
                    Disponibilidad para sesiones
                  </h3>
                  <p className="text-slate-500 text-[13px]">
                    Selecciona los días y horarios en los que puedes recibir solicitudes.
                  </p>
                </div>

                {/* Days availability */}
                <div ref={daysContainerRef} className="flex flex-col gap-2 mt-1">
                  <label className="text-label ml-1 font-jakarta font-bold text-slate-800">
                    Días disponibles
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => {
                      const isChecked = selectedDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`h-8 md:h-9 px-3.5 md:px-4 rounded-full text-[12px] md:text-[13px] font-medium transition-all duration-200 border cursor-pointer select-none flex items-center gap-1.5 ${
                            isChecked
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "bg-white border-slate-200 text-slate-900 hover:border-slate-300"
                          }`}
                        >
                          {day}
                          {isChecked && (
                            <span className="material-symbols-rounded text-[14px] shrink-0">check</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {errorField === "days" && (
                    <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">
                      Selecciona al menos un día de disponibilidad
                    </p>
                  )}
                </div>

                {/* Time dropdowns */}
                <div ref={timeContainerRef} className="flex flex-col gap-1.5 mt-1">
                  <div className="grid grid-cols-2 gap-4">
                    <SelectInput
                      label="Desde"
                      value={startTime}
                      options={hoursOptions.slice(0, -1)}
                      error={errorField === "time" && !startTime}
                      placeholder="Seleccionar"
                      onSelect={(val) => {
                        setStartTime(val);
                        if (errorField === "time") setErrorField(null);
                        if (endTime && endTime <= val) {
                          setEndTime("");
                        }
                      }}
                    />
                    <SelectInput
                      label="Hasta"
                      value={endTime}
                      options={startTime ? hoursOptions.filter((h) => h > startTime) : hoursOptions}
                      error={errorField === "time" && !endTime}
                      placeholder="Seleccionar"
                      onSelect={(val) => {
                        setEndTime(val);
                        if (errorField === "time") setErrorField(null);
                      }}
                    />
                  </div>
                  {errorField === "time" && (
                    <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">
                      Selecciona el horario desde y hasta
                    </p>
                  )}
                </div>

                {/* Timezone dropdown */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-label ml-1 font-jakarta font-bold text-slate-800">
                    Zona horaria
                  </label>
                  <SelectInput
                    value={timeZone}
                    options={TIMEZONE_OPTIONS}
                    placeholder="Seleccionar zona horaria"
                    onSelect={(val) => setTimeZone(val)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Option 2 */}
          <div
            onClick={() => {
              setSessionsChoice("no");
              setSessionsEnabled(false);
              if (errorField === "days") setErrorField(null);
              if (errorField === "sessionsChoice") setErrorField(null);
            }}
            className={`flex flex-col p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
              sessionsChoice === "no"
                ? "border-slate-900 bg-white"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-bold text-slate-900 font-jakarta">
                No por el momento
              </span>
              <span className="text-[13px] text-slate-500 font-sans leading-normal">
                Podrás habilitar las sesiones de primer contacto en cualquier momento desde tu perfil.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center gap-3 mt-8 pt-2">
        <Button onClick={onBack} variant="back">
          Atrás
        </Button>
        <Button onClick={handleNextStep3} variant="primary" className="!w-auto px-6 gap-2">
          Continuar
          <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
        </Button>
      </div>
    </div>
  );
}
