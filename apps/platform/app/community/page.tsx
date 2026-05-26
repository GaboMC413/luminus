"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, ProfileButton } from "@/components/ui/Button";
import { PlatformNavbar } from "@/components/ui/PlatformNavbar";

interface Post {
  id: number;
  author: string;
  role: string;
  avatar: string;
  time: string;
  tag: string;
  tagColor: string;
  content: string;
  likes: number;
  liked: boolean;
  commentsCount: number;
  isExpert: boolean;
}

export default function CommunityPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [newPostText, setNewPostText] = useState("");
  
  // Premium mock posts
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: "Dra. Sofía Alarcón",
      role: "Psicóloga Organizacional & Coach de Bienestar",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
      time: "Hace 10 minutos",
      tag: "Mindfulness",
      tagColor: "bg-wellness-sage-100 text-wellness-sage-800 border-wellness-sage-200",
      content: "El burnout no es falta de productividad, es falta de recuperación estructurada. Tómate 5 minutos hoy entre reuniones para hacer respiraciones conscientes. Tu sistema nervioso te lo agradecerá. 🌿 #LuminusWellbeing",
      likes: 24,
      liked: false,
      commentsCount: 5,
      isExpert: true,
    },
    {
      id: 2,
      author: "Martín Gómez",
      role: "Mentor de Liderazgo Consciente",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150",
      time: "Hace 2 horas",
      tag: "Liderazgo",
      tagColor: "bg-wellness-clay-100 text-wellness-clay-600 border-wellness-clay-200",
      content: "Dirigir con empatía no debilita tu autoridad; al contrario, crea seguridad psicológica para que tu equipo innove. ¿Cómo fomentas la seguridad psicológica en tus reuniones semanales?",
      likes: 42,
      liked: true,
      commentsCount: 12,
      isExpert: true,
    },
    {
      id: 3,
      author: "Lucía Fernández",
      role: "Especialista en Nutrición Integrativa",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150",
      time: "Hace 4 horas",
      tag: "Nutrición",
      tagColor: "bg-amber-50 text-amber-800 border-amber-200",
      content: "Tip rápido de hidratación: Agregar rodajas de pepino y menta fresca a tu agua diaria mejora la digestión y aporta antioxidantes naturales. ¡Pequeños hábitos, gran bienestar! 🥒",
      likes: 18,
      liked: false,
      commentsCount: 3,
      isExpert: true,
    }
  ]);

  useEffect(() => {
    setIsMounted(true);
    const isLoggedIn = localStorage.getItem("luminus_logged_in") === "true";
    if (!isLoggedIn) {
      router.push("/auth/signin");
    } else {
      setUserEmail(localStorage.getItem("luminus_user_email") || "Usuario Luminus");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("luminus_logged_in");
    localStorage.removeItem("luminus_user_email");
    router.push("/auth/signin");
  };

  const handleLike = (id: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === id) {
          return {
            ...post,
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      })
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: Post = {
      id: Date.now(),
      author: userEmail.split("@")[0],
      role: "Miembro de la Comunidad",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      time: "Ahora mismo",
      tag: "Bienestar",
      tagColor: "bg-wellness-sage-100 text-wellness-sage-800 border-wellness-sage-200",
      content: newPostText,
      likes: 0,
      liked: false,
      commentsCount: 0,
      isExpert: false,
    };

    setPosts([newPost, ...posts]);
    setNewPostText("");
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[24px] animate-pulse" />
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF9F6] text-wellness-slate-900 font-sans flex flex-col antialiased">
      
      {/* 1. STUNNING HEADER */}
      <PlatformNavbar />

      {/* 2. MAIN LAYOUT */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[88px] pb-[88px] md:pt-[104px] md:pb-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: USER PANEL & EXPERTS LIST */}
        <section className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
          
          {/* USER WELCOME CARD */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/50 shadow-premium flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-wellness-sage-400 to-wellness-sand-300 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                {userEmail ? userEmail.substring(0, 2).toUpperCase() : "LU"}
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-[15px] font-bold text-slate-900 truncate">¡Hola de nuevo!</h3>
                <p className="text-[12px] text-slate-500 truncate">{userEmail}</p>
              </div>
            </div>
            
            <div className="h-px bg-zinc-100 w-full" />
            
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500 font-medium">Mi plan actual</span>
              <span className="px-2.5 py-1 bg-wellness-sage-50 text-wellness-sage-600 rounded-full font-bold border border-wellness-sage-100">
                Premium Pro (Gratis)
              </span>
            </div>
          </div>

          {/* FEATURED EXPERTS SIDEBAR */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/50 shadow-premium flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-[16px] font-bold text-slate-900">Expertos en Línea 🟢</h2>
              <p className="text-[12px] text-slate-500">Conéctate y conversa hoy mismo</p>
            </div>
            
            <div className="flex flex-col gap-4">
              {[
                {
                  name: "Dra. Sofía Alarcón",
                  specialty: "Salud Mental & Estrés",
                  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150"
                },
                {
                  name: "Martín Gómez",
                  specialty: "Coach de Liderazgo",
                  avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150"
                },
                {
                  name: "Valeria Ruiz",
                  specialty: "Terapeuta Psico-Corporal",
                  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
                }
              ].map((expert, idx) => (
                <div key={idx} className="flex items-center justify-between group cursor-pointer" onClick={() => alert(`Iniciando chat privado con ${expert.name}...`)}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={expert.avatar} alt={expert.name} className="w-10 h-10 rounded-xl object-cover border border-zinc-100" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-bold text-slate-800 group-hover:text-wellness-sage-600 transition-colors truncate">{expert.name}</span>
                      <span className="text-[11px] text-slate-400 truncate">{expert.specialty}</span>
                    </div>
                  </div>
                  <span className="material-symbols-rounded text-slate-400 text-[18px] group-hover:text-black transition-all">chat</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: MAIN INTERACTIVE FEED */}
        <section className="lg:col-span-8 flex flex-col gap-6 order-1 lg:order-2">
          
          {/* CREATE POST CARD */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/50 shadow-premium flex flex-col gap-4">
            <h2 className="text-[16px] font-bold text-slate-900">¿Qué ronda por tu mente, {userEmail.split("@")[0]}?</h2>
            
            <form onSubmit={handleCreatePost} className="flex flex-col gap-3">
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Comparte reflexiones, aprendizajes de bienestar, o haz preguntas a la comunidad..."
                className="w-full min-h-[96px] p-4 bg-[#FAF9F6] border border-zinc-200/50 rounded-2xl text-[14px] leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-wellness-sage-500 focus:border-wellness-sage-500 transition-all placeholder:text-slate-400/80"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-wellness-sage-50 text-wellness-sage-600 rounded-full font-semibold border border-wellness-sage-100/50 text-[11px] flex items-center gap-1 cursor-pointer hover:bg-wellness-sage-100 transition-colors">
                    <span className="material-symbols-rounded text-[13px]">psychology</span>
                    Bienestar
                  </span>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={!newPostText.trim()}
                  className="!h-9 !px-5 !w-auto font-bold rounded-full bg-black text-white hover:bg-zinc-800 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  Publicar
                </Button>
              </div>
            </form>
          </div>

          {/* POSTS LIST */}
          <div className="flex flex-col gap-5">
            {posts.map((post) => (
              <article 
                key={post.id} 
                className="bg-white rounded-3xl p-6 border border-zinc-200/50 shadow-premium flex flex-col gap-4 hover:shadow-premium-hover transition-all duration-300 group"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.avatar} 
                      alt={post.author} 
                      className="w-11 h-11 rounded-2xl object-cover border border-zinc-100"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-bold text-slate-900 leading-tight">
                          {post.author}
                        </span>
                        {post.isExpert && (
                          <span className="bg-wellness-sage-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center uppercase tracking-wider scale-95 shadow-sm">
                            Experto
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium leading-none mt-1">
                        {post.role} • {post.time}
                      </span>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full border text-[11px] font-bold ${post.tagColor}`}>
                    {post.tag}
                  </span>
                </div>

                {/* Content */}
                <p className="text-[14px] text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                  {post.content}
                </p>

                <div className="h-px bg-zinc-100 w-full" />

                {/* Actions */}
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 group/btn cursor-pointer bg-transparent border-none text-[13px] font-semibold transition-all select-none"
                  >
                    <span 
                      className={`material-symbols-rounded text-[18px] transition-transform active:scale-125 ${
                        post.liked 
                          ? 'text-[#FF4B4B] fill-[#FF4B4B]' 
                          : 'text-slate-400 group-hover/btn:text-[#FF4B4B]'
                      }`}
                    >
                      favorite
                    </span>
                    <span className={post.liked ? 'text-slate-900' : 'text-slate-500 group-hover/btn:text-slate-900'}>
                      {post.likes}
                    </span>
                  </button>

                  <button 
                    onClick={() => alert("Funcionalidad de comentarios próximamente disponible.")}
                    className="flex items-center gap-2 group/btn cursor-pointer bg-transparent border-none text-[13px] font-semibold transition-all text-slate-500 hover:text-slate-900 select-none"
                  >
                    <span className="material-symbols-rounded text-slate-400 group-hover/btn:text-slate-900 text-[18px]">
                      chat_bubble
                    </span>
                    <span>
                      {post.commentsCount}
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>

        </section>

      </main>

      {/* 3. FOOTER */}
      <footer className="w-full py-8 border-t border-zinc-200/60 bg-white mt-12 shrink-0">
        <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-semibold">
          LUMINUS LATAM © 2026 • Espacio de Profesionales & Bienestar
        </p>
      </footer>

    </div>
  );
}
