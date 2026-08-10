"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function GruposPage() {
  const router = useRouter();

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col items-center justify-center h-full min-h-0 overflow-hidden">
      {/* Unified Container: Feels like a single divided div */}
      <div className="w-full max-w-5xl border border-slate-200/80 rounded-3xl overflow-hidden flex flex-col shadow-none flex-1 h-full min-h-0">
        {/* Banner Image */}
        <div 
          className="w-full bg-cover bg-center bg-no-repeat flex-1 min-h-0 md:aspect-[2.39/1] md:min-h-[350px] md:flex-initial"
          style={{ backgroundImage: "url('/Spaces.png')" }}
        />

        {/* Info Card */}
        <div className="w-full bg-white border-t border-slate-200/80 p-4 md:p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-6 shadow-none shrink-0">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 w-full md:w-auto">
            {/* Icon container */}
            <div className="w-12 h-12 md:w-20 md:h-20 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
              <div
                style={{
                  maskImage: "url('/Icons/NavBar/espacios active.svg')",
                  WebkitMaskImage: "url('/Icons/NavBar/espacios active.svg')",
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
              <h4 className="text-[15px] md:text-[18px] font-bold text-slate-800 font-jakarta leading-tight">
                Grupos LUMINUS
              </h4>
              <p className="text-slate-600 text-[12.5px] md:text-[14px] leading-relaxed max-w-[650px]">
                Próximamente podrás participar en grupos creados por especialistas, con contenido, encuentros e invitaciones para seguir aprendiendo.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => router.push("/comunidad")}
            className="w-full md:!w-auto px-5 h-10 md:h-11 text-sm font-semibold shrink-0 flex items-center justify-center gap-1.5 group cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border-none"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-slate-500 group-hover:text-slate-800 transition-colors"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="text-slate-600 group-hover:text-slate-800 transition-colors">Volver a la Comunidad</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
