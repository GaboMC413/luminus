"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TvMinimalPlay, ArrowRight } from "lucide-react";

export default function GrabacionesPage() {
  const router = useRouter();

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col items-center justify-center">
      <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-8 md:p-12 flex flex-col items-center text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-5">
          <TvMinimalPlay className="w-8 h-8" />
        </div>
        <span className="text-[11px] font-semibold tracking-widest text-slate-400 font-jakarta uppercase mb-2">
          PRÓXIMAMENTE
        </span>
        <h1 className="text-2xl md:text-3xl font-bold font-jakarta text-slate-900 tracking-tight mb-3">
          Videoteca de Grabaciones
        </h1>
        <p className="text-sm md:text-base text-slate-600 max-w-lg leading-relaxed mb-6">
          Aquí podrás revivir todas las charlas, entrevistas y masterclasses pasadas con nuestros especialistas en bienestar.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            variant="primary"
            onClick={() => router.push("/actividades")}
            className="flex items-center gap-2 h-11 px-6 rounded-xl"
          >
            <span>Ver próximas actividades</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <a
            href="https://www.youtube.com/@luminus_latam"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-11 px-5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Canal de YouTube
          </a>
        </div>
      </div>
    </div>
  );
}
