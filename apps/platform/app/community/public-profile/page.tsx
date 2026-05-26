"use client";
 
import React from 'react';
import { useRouter } from 'next/navigation';
import { InterestPill } from '@/components/ui/InterestPill';
 
export default function NancyNunezProfile() {
  const router = useRouter();
 
  const profile = {
    first_name: "Nancy",
    last_name: "Nuñez",
    location: "Puntarenas, Costa Rica",
    interests: ["Estilo de Vida", "Naturaleza", "Fotografía Consciente"],
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    bio: "Apasionada por capturar la esencia de la vida a través de la fotografía y vivir en conexión con la naturaleza.",
    joined: "Enero 2024"
  };
 
  return (
    <main className="flex-1 w-full flex flex-col items-center pt-8 pb-12 bg-[#F8FAFC]">
      <div className="w-full max-w-[440px] bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-premium transition-all">
        <div className="w-full h-12 px-6 flex items-center justify-between border-b border-slate-50">
           <button onClick={() => router.back()} className="text-slate-400 hover:text-black transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
           </button>
           <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest font-jakarta">Perfil Público</span>
           <button onClick={() => alert("Enlace copiado al portapapeles")} className="text-slate-400 hover:text-black transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">share</span>
           </button>
        </div>
 
        <div className="w-full flex-1 overflow-y-auto px-5 pb-10 pt-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col items-center gap-5">
              <div className="w-32 h-32 rounded-[32px] overflow-hidden bg-slate-50 border-4 border-white relative ring-1 ring-black/5">
                <img 
                  src={profile.avatar} 
                  alt={profile.first_name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <h2 className="text-slate-900 text-2xl font-bold tracking-tight text-center font-jakarta">
                  {profile.first_name} {profile.last_name}
                </h2>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                  <span className="text-slate-500 text-[12px] font-semibold">{profile.location}</span>
                </div>
              </div>
            </div>
 
            <div className="px-4 text-center">
              <p className="text-slate-500 text-[14px] leading-relaxed italic">
                "{profile.bio}"
              </p>
              <p className="text-slate-400 text-[11px] font-bold mt-4 uppercase tracking-widest font-jakarta">
                Miembro desde {profile.joined}
              </p>
            </div>
 
            <div className="bg-white rounded-[24px] p-6 flex flex-col gap-4 border border-slate-100 mx-2 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-black text-[20px]">sparkles</span>
                <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-widest font-jakarta">Mis Intereses</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, idx) => (
                  <InterestPill key={idx} interest={interest} />
                ))}
              </div>
            </div>
 
            <div className="bg-white rounded-[24px] p-6 flex flex-col gap-6 border border-slate-100 mx-2 shadow-sm">
              <DetailItem 
                label="Comunidad" 
                value="Explorador Activo" 
                icon="group"
                iconColor="text-black"
              />
              <DetailItem 
                label="Conexiones" 
                value="124 conexiones" 
                icon="hub"
                iconColor="text-black"
              />
              <DetailItem 
                label="Nivel de Bienestar" 
                value="Consolidado" 
                icon="auto_awesome"
                iconColor="text-black"
              />
            </div>
 
            <div className="flex flex-col gap-3 px-2">
              <button 
                onClick={() => router.push(`/messages?id=1`)}
                className="w-full py-4 bg-black text-white rounded-full text-[15px] font-bold hover:bg-zinc-800 transition flex items-center justify-center gap-2 border-none cursor-pointer font-jakarta"
              >
                <span className="material-symbols-outlined text-[20px]">mail</span>
                Enviar Mensaje
              </button>
              <button 
                onClick={() => alert("Solicitud de conexión enviada")}
                className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-full text-[15px] font-bold hover:bg-slate-50 hover:text-black hover:border-slate-300 transition flex items-center justify-center gap-2 cursor-pointer font-jakarta"
              >
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                Conectar
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
 
function DetailItem({ label, value, icon, iconColor }: { label: string; value: string; icon: string; iconColor: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0`}>
        <span className={`material-symbols-outlined ${iconColor} text-[22px]`}>
          {icon}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none font-jakarta">{label}</span>
        <span className="text-slate-900 text-[15px] font-bold leading-tight font-jakarta">{value}</span>
      </div>
    </div>
  );
}
