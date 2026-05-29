"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function MapPage() {
  const router = useRouter();

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-2 border border-slate-100">
        <div
          style={{
            maskImage: "url('/Icons/NavBar/map active.svg')",
            WebkitMaskImage: "url('/Icons/NavBar/map active.svg')",
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
      <h1 className="text-[32px] font-jakarta font-bold text-slate-900 mb-4">Mapa LUMINUS</h1>
      <p className="text-slate-500 max-w-[500px] mb-8">
        Próximamente podrás explorar el mapa de LUMINUS para descubrir personas, clínicas y consultorios de nuestra red en tu ciudad y en LATAM. Una forma de estar más cerca de quienes comparten intereses, búsquedas y propósito.
      </p>
      <Button
        variant="primary"
        onClick={() => router.push("/community")}
        className="!w-auto px-8 font-bold bg-black text-white hover:bg-zinc-800"
      >
        Volver a la Comunidad
      </Button>
    </main>
  );
}
