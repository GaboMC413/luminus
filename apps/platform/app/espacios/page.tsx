"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { HouseHeart, ArrowLeft } from "lucide-react";

export default function EspaciosPage() {
  const router = useRouter();

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col items-center justify-center">
      <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-8 md:p-12 flex flex-col items-center text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-5">
          <HouseHeart className="w-8 h-8" />
        </div>
        <span className="text-[11px] font-semibold tracking-widest text-slate-400 font-jakarta uppercase mb-2">
          PRÓXIMAMENTE
        </span>
        <h1 className="text-2xl md:text-3xl font-bold font-jakarta text-slate-900 tracking-tight mb-3">
          Espacios LUMINUS
        </h1>
        <p className="text-sm md:text-base text-slate-600 max-w-lg leading-relaxed mb-8">
          Próximamente podrás explorar centros de bienestar, consultorios, clínicas y espacios holísticos cerca de ti en toda LATAM.
        </p>

        {/* Volver a la Comunidad (with arrow, no stroke) */}
        <div>
          <Button
            variant="secondary"
            onClick={() => router.push("/inicio")}
            className="flex items-center gap-2 h-11 px-6 rounded-xl border-none bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors cursor-pointer shadow-none"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Volver a la Comunidad</span>
          </Button>
        </div>

        {/* New block below for adding a space */}
        <div className="mt-8 pt-6 border-t border-slate-100 w-full flex flex-col items-center justify-center gap-2.5">
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            ¿Te gustaría agregar un espacio?
          </p>
          <Button
            variant="primary"
            onClick={() => router.push("/contacto?motivo=espacios")}
            className="h-10 sm:h-11 px-6 rounded-xl border-none bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-none"
          >
            <span>Ponte en contacto con nosotros</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
