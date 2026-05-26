"use client";

import React from 'react';
import { EmptyProfileButton } from "@/components/ui/Button";

export interface Prompt {
  question: string;
  answer: string;
}

export const ALL_PROMPTS = [
  {
    id: 1,
    question: "Mi objetivo de vida es…",
    options: [
      "Vivir con más calma, claridad y propósito.",
      "Construir una vida alineada con mis valores.",
      "Cuidar mi bienestar mientras crezco personal y profesionalmente.",
      "Encontrar equilibrio entre lo que hago, lo que siento y lo que necesito.",
      "Convertirme en una mejor versión de mí, paso a paso."
    ]
  },
  {
    id: 2,
    question: "Hoy estoy buscando…",
    options: [
      "Más claridad sobre mi camino personal.",
      "Herramientas para cuidar mi bienestar emocional.",
      "Conectar con personas que estén en un proceso similar.",
      "Inspiración para mejorar mis hábitos y mi energía.",
      "Un espacio que me ayude a crecer con más intención."
    ]
  },
  {
    id: 3,
    question: "Quiero mejorar mi relación con…",
    options: [
      "Mi cuerpo y mi salud.",
      "Mis emociones.",
      "Mi tiempo y mis prioridades.",
      "Mis vínculos y relaciones.",
      "Mi propósito personal."
    ]
  },
  {
    id: 4,
    question: "En esta etapa de mi vida necesito…",
    options: [
      "Pausar y escucharme más.",
      "Ordenar mis ideas y tomar mejores decisiones.",
      "Recuperar energía y motivación.",
      "Sentirme acompañado/a en mi proceso.",
      "Crear hábitos más sostenibles para mi bienestar."
    ]
  },
  {
    id: 5,
    question: "Me siento más conectado/a conmigo cuando…",
    options: [
      "Tengo tiempo para pensar y respirar.",
      "Estoy en contacto con la naturaleza.",
      "Cuido mi cuerpo y mi energía.",
      "Comparto conversaciones profundas.",
      "Hago algo que me acerca a la vida que quiero construir."
    ]
  },
  {
    id: 6,
    question: "Estoy trabajando en…",
    options: [
      "Conocerme mejor y entender lo que necesito.",
      "Soltar exigencias que ya no me hacen bien.",
      "Crear una rutina más saludable y realista.",
      "Mejorar mi forma de comunicarme y vincularme.",
      "Tomar decisiones desde un lugar más consciente."
    ]
  },
  {
    id: 7,
    question: "Me gustaría aprender más sobre…",
    options: [
      "Bienestar emocional.",
      "Propósito y desarrollo personal.",
      "Nutrición, movimiento y hábitos saludables.",
      "Meditación, respiración y calma mental.",
      "Relaciones, vínculos y comunicación consciente."
    ]
  },
  {
    id: 8,
    question: "Una práctica que quiero incorporar a mi vida es…",
    options: [
      "Meditar o respirar con más conciencia.",
      "Mover mi cuerpo de forma constante.",
      "Escribir para ordenar mis pensamientos.",
      "Dedicarme más momentos de pausa.",
      "Crear rituales diarios para cuidar mi energía."
    ]
  },
  {
    id: 9,
    question: "Me inspira conectar con personas que…",
    options: [
      "Están buscando crecer con honestidad.",
      "Valoran las conversaciones profundas.",
      "Cuidan su bienestar de forma integral.",
      "Quieren vivir con más propósito.",
      "Están abiertas a compartir, aprender y acompañar."
    ]
  },
  {
    id: 10,
    question: "Para mí, bienestar significa…",
    options: [
      "Sentirme en equilibrio conmigo y con mi entorno.",
      "Tener energía para vivir de forma plena.",
      "Cuidar mi cuerpo, mi mente y mis emociones.",
      "Poder habitar mi vida con más calma y presencia.",
      "Construir una vida que se sientan auténtica para mí."
    ]
  }
];

export function PromptsDisplay({ prompts, onEdit }: { prompts: Prompt[]; onEdit?: (step?: 'list' | 'select') => void }) {
  const hasPrompts = prompts && prompts.length > 0;

  return (
    <div className={`bg-white rounded-[16px] p-5 md:p-6 flex flex-col gap-5 border border-slate-200 shadow-none transition-all ${!hasPrompts ? 'bg-slate-50/50 border-slate-100' : ''}`}>
      <div className="flex items-center gap-2.5">
        <h3 className="text-label text-[0.8125rem] uppercase font-semibold ml-1">Reflexiones</h3>
      </div>

      {hasPrompts ? (
        <div className="flex flex-col gap-2">
          {prompts.map((prompt, index) => (
            <div key={index} className="flex flex-col">
              <p className="text-body text-secondary italic leading-relaxed">
                "<span className="text-secondary">
                  {prompt.question.replace(/[…\. ]+$/, '')}
                </span>{" "}
                {prompt.answer.replace(/[…\. ]+$/, '').charAt(0).toLowerCase() + prompt.answer.replace(/[…\. ]+$/, '').slice(1)}"
              </p>
              {index < prompts.length - 1 && <div className="h-px w-full bg-slate-50 mt-2.5" />}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-4">
          <p className="text-body text-slate-400 font-medium italic tracking-tight">
            Agregá reflexiones para que otros te conozcan mejor
          </p>
          <EmptyProfileButton
            onClick={() => onEdit?.('select')}
            label="Comparte tus reflexiones"
            icon="add"
          />
        </div>
      )}
    </div>
  );
}
