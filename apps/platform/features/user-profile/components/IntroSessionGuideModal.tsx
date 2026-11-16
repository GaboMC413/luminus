"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

type GuideAudience = "miembros" | "especialistas";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: GuideAudience;
};

const MEMBER_STEPS = [
  "Eliges un día y horario disponible.",
  "Si el especialista confirma, te enviamos el enlace para conectarte.",
  "Se conectan 15 minutos para conversar.",
];

const SPECIALIST_STEPS = [
  "Recibes una solicitud con el horario elegido.",
  "Confirmas y se envía el enlace de acceso.",
  "Conversan 15 minutos y, si hay afinidad, coordinan próximos pasos por fuera.",
];

export function IntroSessionGuideModal({
  isOpen,
  onClose,
  defaultTab = "miembros",
}: Props) {
  const isSpecialistView = defaultTab === "especialistas";
  const steps = isSpecialistView ? SPECIALIST_STEPS : MEMBER_STEPS;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="¿Cómo funcionan las sesiones?"
      maxWidth="520px"
      footer={
        <Button variant="primary" fullWidth onClick={onClose}>
          Entendido
        </Button>
      }
    >
      <div className="flex flex-col gap-3.5 py-1">
        {/* Steps in a single card */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 flex flex-col gap-3">
          {steps.map((stepText, index) => (
            <div
              key={index}
              className="flex items-start gap-3 text-sm text-slate-800 leading-snug"
            >
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 font-jakarta">
                {index + 1}
              </span>
              <span className="pt-0.5">{stepText}</span>
            </div>
          ))}
        </div>

        {/* Stacked What it is / What it is NOT (icon + text only) */}
        <div className="flex flex-col gap-2.5">
          <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 px-3.5 py-3 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-emerald-950 m-0">
              {isSpecialistView
                ? "Un primer contacto breve (15 min) y gratuito para conocer a un miembro interesado y contarle cómo trabajas."
                : "Una charla introductoria de 15 minutos sin costo para conocerse, contar qué buscas y ver si el enfoque del especialista encaja contigo."}
            </p>
          </div>

          <div className="rounded-xl bg-rose-50/70 border border-rose-200/80 px-3.5 py-3 flex items-start gap-2.5">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-rose-950 m-0">
              {isSpecialistView
                ? "No es una consulta paga ni un servicio supervisado por LUMINUS. Los acuerdos u honorarios posteriores son independientes entre tú y el miembro."
                : "No es una consulta completa, diagnóstico ni tratamiento. Cualquier servicio posterior se acuerda por fuera de LUMINUS."}
            </p>
          </div>
        </div>

        {/* Friendly Beta Notice + Contact CTA (blue, matching icon+text cards) */}
        <div className="rounded-xl bg-blue-50/70 border border-blue-200/80 px-3.5 py-3 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex flex-col items-start gap-2.5">
            <p className="text-xs leading-relaxed text-blue-950 m-0">
              Estamos estrenando este sistema para ayudarte a conectar mejor. Si notas
              algún inconveniente técnico, avísanos.
            </p>
            <Link
              href="/contacto"
              onClick={onClose}
              className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-white hover:text-blue-950 transition-colors no-underline font-jakarta border-none"
            >
              Contactarnos
            </Link>
          </div>
        </div>

        {/* Clear Legal Disclaimer & Link below all */}
        <p className="text-xs text-slate-500 text-center leading-relaxed m-0 px-2">
          LUMINUS facilita únicamente el encuentro inicial y no interviene en los
          servicios profesionales ni en la asistencia o fallos externos.{" "}
          <a
            href="https://luminuslatam.com/legal/sesiones-introductorias"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 underline"
          >
            <span>Ver condiciones legales</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>
    </Modal>
  );
}
