"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function FaroPage() {
  const router = useRouter();

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-2 border border-slate-100">
        <div
          style={{
            maskImage: "url('/Icons/NavBar/faro active.svg')",
            WebkitMaskImage: "url('/Icons/NavBar/faro active.svg')",
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center'
          }}
          className="w-10 h-10 bg-black"
        />
      </div>
      <h1 className="text-[32px] font-jakarta font-bold text-slate-900 mb-4">Faro LUMINUS</h1>
      <p className="text-slate-500 max-w-[500px] mb-8">
        Próximamente llegará Faro, tu asistente impulsado por IA, creado para acompañarte en tu proceso, ayudarte a atravesar desafíos con mayor claridad y acercarte a una vida con más equilibrio, bienestar y dirección.
      </p>
      <Button variant="primary" 
        onClick={() => router.push("/community")}
        className="!w-auto px-8 font-bold bg-black text-white hover:bg-zinc-800"
      >
        Volver a la Comunidad
      </Button>
    </main>
  );
}
