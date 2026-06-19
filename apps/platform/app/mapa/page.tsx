"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function MapPage() {
  const router = useRouter();

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-6 md:py-6 flex flex-col gap-6">
      {/* Upcoming Section: Compact, horizontal alert-style banner */}
      <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-start gap-4 w-full md:w-auto">
          {/* Icon container */}
          <div className="w-12 h-12 md:w-20 md:h-20 bg-white border border-slate-200 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
            <div
              style={{
                maskImage: "url('/Icons/NavBar/map active.svg')",
                WebkitMaskImage: "url('/Icons/NavBar/map active.svg')",
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
          <div className="flex flex-col text-left gap-1">
            <span className="text-[10px] md:text-[11px] font-bold tracking-widest text-slate-400 font-jakarta uppercase">
              PRÓXIMAMENTE
            </span>
            <h4 className="text-[15px] md:text-[16px] font-bold text-slate-800 font-jakarta">
              Mapa LUMINUS
            </h4>
            <p className="text-slate-500 text-[13px] md:text-[13.5px] leading-relaxed max-w-[650px]">
              Próximamente podrás explorar el mapa de LUMINUS para descubrir personas, clínicas y consultorios de nuestra red en tu ciudad y en LATAM. Una forma de estar más cerca de quienes comparten intereses, búsquedas y propósito.
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={() => router.push("/comunidad")}
          className="w-full md:!w-auto px-5 text-sm font-bold shrink-0 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 group"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-slate-400 group-hover:text-slate-700 transition-colors"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Volver a la Comunidad</span>
        </Button>
      </div>
    </div>
  );
}
