"use client";

import React, { useRef } from "react";
import { SelectInput } from "@/components/ui/SelectInput";
import {
  StepHeader,
  SelectionCard,
  TagSelector,
  StepperNav,
} from "./molecules";

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
  // América Latina
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

  // Estados Unidos y Canadá
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
      <StepHeader
        title="Sesiones introductorias"
        subtitle="Ofrece encuentros de 15 minutos para que nuevos usuarios conozcan tu trabajo."
      />

      {/* Decision Section */}
      <div ref={sessionsContainerRef} className="flex flex-col gap-3 mt-1">
        <label className="text-xs font-semibold text-slate-700 font-jakarta leading-none select-none">
          ¿Deseas ofrecer sesiones introductorias? *
        </label>
        {errorField === "sessionsChoice" && (
          <p className="text-xs font-medium text-rose-600 px-0.5">
            Selecciona una opción para continuar
          </p>
        )}

        <div className="flex flex-col gap-3">
          {/* Option 1: Yes */}
          <SelectionCard
            title="Sí, ofrecer sesiones"
            description="Los usuarios podrán solicitarte encuentros de 15 minutos."
            selected={sessionsChoice === "yes"}
            onSelect={() => {
              setSessionsChoice("yes");
              setSessionsEnabled(true);
              if (errorField === "sessionsChoice") setErrorField(null);
            }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold text-slate-900 font-jakarta">
                  Disponibilidad
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Selecciona los días y horarios en los que puedes recibir solicitudes.
                </p>
              </div>

              {/* Days availability */}
              <div ref={daysContainerRef} className="mt-1">
                <TagSelector
                  label="Días disponibles *"
                  tags={daysOfWeek}
                  selectedTags={selectedDays}
                  onToggle={toggleDay}
                  error={errorField === "days" ? "Selecciona al menos un día de disponibilidad" : undefined}
                />
              </div>

              {/* Time dropdowns */}
              <div ref={timeContainerRef} className="flex flex-col gap-1.5 mt-1">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <SelectInput
                    label="Desde *"
                    value={startTime}
                    options={hoursOptions.slice(0, -1)}
                    error={Boolean(errorField === "time" && !startTime)}
                    placeholder="Selecciona hora"
                    onSelect={(val) => {
                      setStartTime(val);
                      if (errorField === "time") setErrorField(null);
                      if (endTime && endTime <= val) {
                        setEndTime("");
                      }
                    }}
                  />
                  <SelectInput
                    label="Hasta *"
                    value={endTime}
                    options={startTime ? hoursOptions.filter((h) => h > startTime) : hoursOptions}
                    error={Boolean(errorField === "time" && !endTime)}
                    placeholder="Selecciona hora"
                    onSelect={(val) => {
                      setEndTime(val);
                      if (errorField === "time") setErrorField(null);
                    }}
                  />
                </div>
                {errorField === "time" && (
                  <p className="text-xs font-medium text-rose-600 px-0.5">
                    Selecciona el horario desde y hasta
                  </p>
                )}
              </div>

              {/* Timezone dropdown */}
              <div className="mt-1">
                <SelectInput
                  label="Zona horaria *"
                  value={timeZone}
                  options={TIMEZONE_OPTIONS}
                  placeholder="Seleccionar zona horaria"
                  onSelect={(val) => setTimeZone(val)}
                />
              </div>
            </div>
          </SelectionCard>

          {/* Option 2: Later */}
          <SelectionCard
            title="Configurar más adelante"
            description="Podrás habilitar y configurar tus sesiones introductorias en cualquier momento desde tu perfil."
            selected={sessionsChoice === "no"}
            onSelect={() => {
              setSessionsChoice("no");
              setSessionsEnabled(false);
              if (errorField === "days") setErrorField(null);
              if (errorField === "sessionsChoice") setErrorField(null);
            }}
          />
        </div>
      </div>

      <StepperNav
        onBack={onBack}
        onNext={handleNextStep3}
        nextLabel="Siguiente"
      />
    </div>
  );
}

export default Step3Sessions;
