"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/PageLoader";
import { PostItem } from "@/components/community/mockPostsData";
import { CreatePostCard } from "@/components/community/CreatePostCard";
import { PostCard } from "@/components/community/PostCard";
import { RecentMembersCard } from "@/components/community/RecentMembersCard";
import { SquareButton } from "@/components/ui/Button";

export default function PlatformPage() {
  return (
    <Suspense fallback={<PageLoader className="h-screen" />}>
      <PlatformContent />
    </Suspense>
  );
}

function PlatformContent() {
  const router = useRouter();

  // Feed Posts state (synced with database - only real approved posts)
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postNotice, setPostNotice] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const res = await fetch(`/api/comunidad/posts?_t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Error loading community posts:", err);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const publicPosts = useMemo(
    () => posts.filter((p) => p.status === "approved" || !p.status),
    [posts]
  );

  // Latest Community Members (for right sidebar)
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User Profile & Connections state
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [profileImgError, setProfileImgError] = useState(false);
  const [userConnections, setUserConnections] = useState<any[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);

  // Load Current User Profile
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const res = await fetch("/api/profile");
        if (res.status === 401 || res.status === 403) {
          router.replace("/auth/iniciar-sesion");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setCurrentUserProfile(data.profile);
        }
      } catch (err) {
        console.error("Error loading current user profile:", err);
      }
    }
    loadCurrentUser();
  }, [router]);

  // Load Connections
  useEffect(() => {
    async function loadConnections() {
      try {
        setConnectionsLoading(true);
        const res = await fetch("/api/connections");
        if (res.status === 401 || res.status === 403) {
          router.replace("/auth/iniciar-sesion");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setUserConnections(data.connections || []);
        }
      } catch (err) {
        console.error("Error loading user connections:", err);
      } finally {
        setConnectionsLoading(false);
      }
    }
    loadConnections();
  }, [router]);

  // Active Connections & Pending count
  const activeConnections = useMemo(() => {
    const accepted = userConnections.filter((c: any) => c.status === "accepted");
    return accepted.sort((a: any, b: any) => {
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [userConnections]);

  const pendingIncomingCount = useMemo(() => {
    return userConnections.filter((c: any) => c.status === "pending" && c.direction === "incoming").length;
  }, [userConnections]);

  // Fetch Latest 10 Members for the right sidebar
  useEffect(() => {
    async function fetchLatestMembers() {
      try {
        setLoading(true);
        const res = await fetch(`/api/comunidad?limit=10&_t=${Date.now()}`, { cache: "no-store" });
        if (res.status === 401 || res.status === 403) {
          router.replace("/auth/iniciar-sesion");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (err: any) {
        console.error("Error al cargar miembros de la comunidad:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLatestMembers();
  }, [router]);

  const handleAddPost = async (newPost: PostItem) => {
    try {
      const res = await fetch("/api/comunidad/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          imageUrl: newPost.imageUrl,
          imageAlt: newPost.imageAlt,
          youtubeUrl: newPost.youtubeUrl,
          youtubeId: newPost.youtubeId,
          category: newPost.area,
          tags: newPost.areas,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPostNotice(
          "¡Tu publicación ha sido enviada con éxito! Está en revisión antes de publicarse en la comunidad."
        );
        if (data.post && (data.post.status === "approved" || !data.post.status)) {
          setPosts((prev) => [data.post, ...prev]);
        }
      } else {
        const errData = await res.json().catch(() => null);
        alert(errData?.error || "Error al crear la publicación.");
      }
    } catch (err) {
      console.error("Error creating community post:", err);
      alert("Error al conectar con el servidor para publicar.");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/comunidad/posts/${postId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } else {
        const errData = await res.json().catch(() => null);
        alert(errData?.error || "No se pudo eliminar la publicación.");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleEditPost = (updatedPost: PostItem) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  if (!currentUserProfile && loading) {
    return <PageLoader className="h-screen" />;
  }

  return (
    <div className="flex-1 w-full flex flex-col h-full overflow-visible">
      {/* Main 3-Column Layout Container (shadow-none) */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6 lg:gap-7 h-full overflow-visible pt-4 pb-12 md:py-6">

        {/* ========================================================================= */}
        {/* COLUMN 1 (LEFT): Current User Profile & Mi Red Card (Preserved)           */}
        {/* ========================================================================= */}
        <div className="hidden md:flex w-[240px] lg:w-[270px] flex-col gap-4 shrink-0 h-fit">
          {/* Card 1: Main Profile Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden flex flex-col shadow-none relative">
            {/* 1. Cover photo */}
            <div className="h-20 w-full relative bg-slate-100 shrink-0">
              {currentUserProfile?.cover_url ? (
                <img
                  src={currentUserProfile.cover_url}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-violet-600 to-indigo-600 opacity-80" />
              )}
            </div>

            {/* 2. Photo */}
            <div className="flex justify-center -mt-[55px] relative z-10">
              <div className="w-[100px] h-[100px] rounded-[22px] overflow-hidden bg-white border-4 border-white shrink-0 flex items-center justify-center">
                {currentUserProfile?.profile_picture_url && !profileImgError ? (
                  <img
                    src={currentUserProfile.profile_picture_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={() => setProfileImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-zinc-300">
                    <span className="material-symbols-outlined text-[50px]">person</span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-4 flex flex-col items-center text-center gap-3">
              <div className="flex flex-col items-center gap-1 w-full">
                <h3
                  className="text-lg font-bold text-slate-900 leading-snug line-clamp-1 hover:underline cursor-pointer font-jakarta"
                  onClick={() => router.push("/perfil-usuario")}
                >
                  {currentUserProfile
                    ? `${currentUserProfile.first_name || ""} ${currentUserProfile.last_name || ""}`.trim() ||
                    "Usuario sin nombre"
                    : "Cargando..."}
                </h3>
                <p className="text-sm font-medium text-slate-400 font-sans tracking-wide">
                  {currentUserProfile?.city
                    ? `${currentUserProfile.city.split(",")[0]}, ${currentUserProfile.country || ""}`.replace(
                      /,\s*$/,
                      ""
                    )
                    : "Ubicación no especificada"}
                </p>
              </div>

              <button
                onClick={() => router.push("/perfil-usuario")}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold font-jakarta transition flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                Ir a mi perfil
              </button>
            </div>
          </div>

          {/* Card 2: Mi Red (Quick connections preview) */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-4 flex flex-col gap-3 shadow-none">
            <h4 className="text-base font-bold text-slate-900 font-jakarta">Mi red</h4>

            {connectionsLoading ? (
              <div className="py-6 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
              </div>
            ) : activeConnections.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 text-center font-sans">
                Aún no tienes conexiones.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {activeConnections.slice(0, 12).map((conn: any) => (
                  <div
                    key={conn.id}
                    onClick={() => router.push(`/comunidad/public-profile?id=${conn.user.id}`)}
                    className="relative group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-200/80 group-hover:border-slate-400 transition-all duration-200 flex items-center justify-center shrink-0 group-hover:-translate-y-0.5">
                      {conn.user.avatar ? (
                        <img
                          src={conn.user.avatar}
                          alt={conn.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-slate-400 text-[20px] select-none">
                          person
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => router.push("/red")}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold font-jakarta transition flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              Ver mi red
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2 (CENTER): Community Announcements & Posts Feed                   */}
        {/* ========================================================================= */}
        <main className="flex-1 min-w-0 max-w-2xl flex flex-col gap-4">
          {/* Notice banner after post creation */}
          {postNotice && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-xs font-medium font-sans">
              <div className="flex items-center gap-2">
                <span className="material-symbols-rounded text-emerald-600 text-base">check_circle</span>
                <span>{postNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setPostNotice(null)}
                className="text-emerald-700 hover:text-emerald-900 border-none bg-transparent cursor-pointer p-0 text-sm font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Section Heading: Exact admin style */}
          <div className="shrink-0 pt-0.5">
            <h1 className="text-[28px] font-bold leading-tight font-jakarta text-slate-900">
              Comunidad
            </h1>
            <p className="mt-0.5 text-[14px] text-slate-500 font-sans">
              Un espacio para descubrir, compartir e interactuar con otros miembros.
            </p>
          </div>

          {/* 1. Create Post Input (with mobile quick action square buttons) */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full">
            <div className="flex-1 min-w-0">
              <CreatePostCard
                currentUserProfile={currentUserProfile}
                onAddPost={handleAddPost}
              />
            </div>

            {/* Mobile quick actions: Mi red (hub) and Miembros (group) */}
            <div className="flex md:hidden items-center gap-2 shrink-0">
              <SquareButton
                icon="hub"
                variant="outline"
                type="button"
                onClick={() => router.push("/red")}
                title="Mi red"
                aria-label="Mi red"
              />
              <SquareButton
                icon="group"
                variant="outline"
                type="button"
                onClick={() => router.push("/comunidad/miembros")}
                title="Miembros"
                aria-label="Miembros"
              />
            </div>
          </div>

          {/* 2. Posts Stream (Only Validated/Approved posts) */}
          <div className="flex flex-col gap-4">
            {postsLoading ? (
              <div className="bg-white rounded-2xl border border-zinc-200 p-8 flex flex-col items-center justify-center gap-3 text-slate-400 font-sans">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
                <span className="text-xs font-medium">Cargando publicaciones...</span>
              </div>
            ) : publicPosts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center text-slate-400 font-sans text-xs sm:text-sm">
                No hay publicaciones visibles en la comunidad en este momento.
              </div>
            ) : (
              publicPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserProfile={currentUserProfile}
                  onDeletePost={handleDeletePost}
                  onEditPost={handleEditPost}
                />
              ))
            )}
          </div>
        </main>

        {/* ========================================================================= */}
        {/* COLUMN 3 (RIGHT): Latest 10 Community Members + 'Ver todos los miembros'  */}
        {/* ========================================================================= */}
        <aside className="hidden lg:flex w-[260px] xl:w-[290px] flex-col gap-4 shrink-0 h-fit">
          <RecentMembersCard
            members={users}
            loading={loading}
            onViewAllMembers={() => router.push("/comunidad/miembros")}
          />
        </aside>
      </div>
    </div>
  );
}
