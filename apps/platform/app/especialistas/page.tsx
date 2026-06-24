"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function EspecialistasPage() {
  const router = useRouter();

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-6 md:py-6 flex flex-col gap-6">
      {/* Upcoming Section: Compact, horizontal alert-style banner */}
      <div className="w-full bg-white border border-slate-200/80 rounded-3xl p-4 md:p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-6 shadow-none">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 w-full md:w-auto">
          {/* Icon container */}
          <div className="w-12 h-12 md:w-20 md:h-20 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
            <div
              style={{
                maskImage: "url('/Icons/NavBar/expert active.svg')",
                WebkitMaskImage: "url('/Icons/NavBar/expert active.svg')",
                maskSize: "contain",
                WebkitMaskSize: "contain",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
              }}
              className="w-6 h-6 md:w-10 md:h-10 bg-black"
            />
          </div>
          <div className="flex flex-col text-left gap-0.5 md:gap-1">
            <span className="text-[9px] md:text-[11px] font-semibold tracking-widest text-slate-400 font-jakarta uppercase">
              PRÓXIMAMENTE
            </span>
            <h4 className="text-[15px] md:text-[16px] font-bold text-slate-800 font-jakarta">
              Especialistas LUMINUS
            </h4>
            <p className="text-slate-500 text-[12.5px] md:text-[13.5px] leading-relaxed max-w-[650px]">
              Explora y conecta con profesionales del bienestar, agenda sesiones and realiza un seguimiento personalizado para tu proceso.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <Button
            variant="primary"
            onClick={() => router.push("/comunidad")}
            className="w-full md:!w-auto px-5 h-10 md:h-11 text-sm font-semibold shrink-0 flex items-center justify-center gap-1.5 group cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-white/80 group-hover:text-white transition-colors"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Volver a la Comunidad</span>
          </Button>
        </div>
      </div>

      {/* Benefits Banner for Specialists (Engaging, Colors, Clean, No shadows, Text and Image) */}
      <div className="w-full bg-gradient-to-br from-wellness-sage-100/10 via-white to-wellness-clay-100/20 border border-slate-200 hover:border-wellness-sage-300/80 rounded-2xl p-6 flex flex-col md:flex-row gap-8 relative overflow-hidden items-center transition-all duration-500">
        {/* Subtle decorative background glow (no shadows) */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-wellness-sage-200/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-wellness-clay-200/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left Column: Image (Bigger layout) */}
        <div className="w-full md:w-[420px] lg:w-[480px] shrink-0 relative z-10">
          <img
            src="/specialsitsLUMINUS.png"
            alt="Especialistas LUMINUS"
            className="w-full h-auto object-cover rounded-2xl border border-slate-200"
          />
        </div>

        {/* Right Column: Content */}
        <div className="flex-1 w-full flex flex-col gap-6 relative z-10">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center rounded-full bg-wellness-sage-50 border border-wellness-sage-200/60 px-3 py-1.5 text-[11px] md:text-xs font-semibold text-wellness-sage-700 w-fit max-w-full break-words">
              <span>¿Eres un especialista en binestar?</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-jakarta text-slate-900 tracking-tight leading-tight">
              Haz visible tu forma de acompañar
            </h2>
            <p className="text-slate-600 text-[14px] leading-relaxed max-w-3xl font-normal">
              LUMINUS reúne a personas que están explorando bienestar, cambio personal, salud integral y nuevas formas de vivir con más conciencia. Tu lugar como especialista no es solo aparecer en una lista, sino ayudar a que más personas encuentren orientación clara, humana y confiable.
            </p>
          </div>

          {/* Small closing line */}
          <p className="text-[13px] text-slate-500 font-medium font-jakarta italic pl-3 border-l-2 border-wellness-sage-400">
            "Un espacio para mostrar quién eres, cómo trabajas y qué puedes aportar."
          </p>

          {/* Buttons Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            <Button
              variant="primary"
              onClick={() => router.push("/especialistas/onboarding")}
              className="w-full md:!w-auto px-6 font-semibold text-sm bg-black text-white hover:bg-zinc-900"
            >
              Postularme como Especialista
            </Button>
            <a
              href="https://luminuslatam.com/especialistas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-semibold font-jakarta text-slate-500 hover:text-black transition-colors underline decoration-1 underline-offset-4"
            >
              Ver más acerca del programa
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
